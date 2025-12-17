"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, X } from 'lucide-react';

// --- INTERFACES ---
interface TableItem {
    no?: number;
    komponen?: string;
    kategori?: string;
    kriteria?: string;
    bobot?: number;
    nilai?: number;
    skor?: number;
    status?: string;
    keterangan?: string;
}

interface PageData {
    title: string;
    subtitle: string;
    table: TableItem[];
}

interface TimelineItem {
    tahap: string;
    nama: string;
    status: 'active' | 'pending' | 'completed';
    keterangan: string;
}

interface TimelineResponse {
    year: string;
    tahap_aktif: string;
    pengumuman_terbuka: boolean;
    keterangan: string;
    timeline: TimelineItem[];
}

// Interface untuk hasil dari API rekap penilaian
interface HasilPenilaian {
    tahap_diumumkan: string;
    nilai_slhd?: string | number;
    nilai_penghargaan?: string | number;
    nilai_iklh?: string | number;
    nilai_wawancara?: string | number;
    total_skor?: string | number;
    total_skor_final?: string | number;
    kriteria_wtp?: string;
    kriteria_kasus_hukum?: string;
    peringkat?: number;
    peringkat_final?: number;
    status: string;
    keterangan: string;
}

// --- HASIL MODAL (Floating Modal untuk hasil LULUS/TIDAK LULUS) ---
const HasilModal = ({ 
    show, 
    onClose,
    hasil,
    loading,
    tahapAktif,
    activeTab
}: { 
    show: boolean; 
    onClose: () => void;
    hasil: HasilPenilaian | null;
    loading: boolean;
    tahapAktif?: string;
    activeTab?: string;
}) => {
    if (!show) return null;

    // Cek apakah masih dalam proses (tahap aktif sama dengan tab yang dilihat)
    const isDalamProses = tahapAktif === activeTab;
    const isLolos = hasil?.status === 'LOLOS' || hasil?.status === 'LOLOS FINAL' || hasil?.status === 'MASUK KATEGORI' || hasil?.status === 'SELESAI' || hasil?.status === 'SELESAI WAWANCARA';
    const isWaiting = hasil?.status === 'MENUNGGU';
    const isPending = !hasil || loading;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {isPending ? (
                            // Loading state
                            <div className="flex flex-col items-center py-8">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 animate-pulse">
                                    <Clock className="w-12 h-12 text-gray-400" />
                                </div>
                                <p className="text-gray-500">Memuat hasil...</p>
                            </div>
                        ) : (
                            <>
                                {/* Icon */}
                                <motion.div 
                                    className="flex justify-center mb-6"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                >
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                        isDalamProses ? 'bg-blue-100' :
                                        isWaiting ? 'bg-yellow-100' : isLolos ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                        {isDalamProses ? (
                                            <Clock className="w-12 h-12 text-blue-600" strokeWidth={2.5} />
                                        ) : isWaiting ? (
                                            <Clock className="w-12 h-12 text-yellow-600" strokeWidth={2.5} />
                                        ) : isLolos ? (
                                            <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={2.5} />
                                        ) : (
                                            <XCircle className="w-12 h-12 text-red-600" strokeWidth={2.5} />
                                        )}
                                    </div>
                                </motion.div>

                                {/* Content */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                                        {hasil?.tahap_diumumkan}
                                    </h2>
                                    <p className={`text-2xl font-bold text-center mb-3 ${
                                        isDalamProses ? 'text-blue-600' :
                                        isWaiting ? 'text-yellow-600' : isLolos ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {isDalamProses ? '⏳ SEDANG PROSES' : hasil?.status}
                                    </p>
                                    <p className="text-center text-gray-600 mb-6 leading-relaxed text-sm">
                                        {isDalamProses 
                                            ? 'Tahap penilaian ini sedang berlangsung. Hasil akhir akan tersedia setelah tahap selesai.'
                                            : hasil?.keterangan
                                        }
                                    </p>

                                    {/* Detail nilai jika ada */}
                                    {(hasil?.nilai_slhd || hasil?.nilai_penghargaan || hasil?.nilai_wawancara || hasil?.total_skor || hasil?.total_skor_final) && (
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                                            {hasil?.nilai_slhd && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Nilai SLHD:</span>
                                                    <span className="font-semibold text-gray-900">{hasil.nilai_slhd}</span>
                                                </div>
                                            )}
                                            {hasil?.nilai_penghargaan && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Nilai Penghargaan:</span>
                                                    <span className="font-semibold text-gray-900">{hasil.nilai_penghargaan}</span>
                                                </div>
                                            )}
                                            {hasil?.nilai_iklh && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Nilai IKLH:</span>
                                                    <span className="font-semibold text-gray-900">{hasil.nilai_iklh}</span>
                                                </div>
                                            )}
                                            {hasil?.nilai_wawancara && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Nilai Wawancara:</span>
                                                    <span className="font-semibold text-gray-900">{hasil.nilai_wawancara}</span>
                                                </div>
                                            )}
                                            {hasil?.total_skor && (
                                                <div className="flex justify-between text-sm border-t pt-2">
                                                    <span className="text-gray-600">Total Skor:</span>
                                                    <span className="font-bold text-gray-900">{hasil.total_skor}</span>
                                                </div>
                                            )}
                                            {hasil?.total_skor_final && (
                                                <div className="flex justify-between text-sm border-t pt-2">
                                                    <span className="text-gray-600">Total Skor Final:</span>
                                                    <span className="font-bold text-gray-900">{hasil.total_skor_final}</span>
                                                </div>
                                            )}
                                            {hasil?.peringkat && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Peringkat:</span>
                                                    <span className="font-semibold text-gray-900">#{hasil.peringkat}</span>
                                                </div>
                                            )}
                                            {hasil?.peringkat_final && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Peringkat Final:</span>
                                                    <span className="font-bold text-green-600">#{hasil.peringkat_final}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex justify-center"
                                >
                                    <button
                                        onClick={onClose}
                                        className={`px-8 py-3 text-white rounded-lg transition-colors font-semibold min-w-[120px] shadow-lg hover:shadow-xl ${
                                            isDalamProses ? 'bg-blue-500 hover:bg-blue-600' :
                                            isWaiting ? 'bg-yellow-500 hover:bg-yellow-600' : 
                                            isLolos ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    >
                                        Lihat Detail
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- FLOATING NOTIFICATION (Overlay hanya table) ---
const FloatingNotification = ({ 
    show, 
    onClose,
    title,
    message,
    type = 'info'
}: { 
    show: boolean; 
    onClose: () => void;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'success' | 'error';
}) => {
    if (!show) return null;

    const bgColor = {
        info: 'bg-blue-50 border-blue-300',
        warning: 'bg-yellow-50 border-yellow-300',
        success: 'bg-green-50 border-green-300',
        error: 'bg-red-50 border-red-300'
    }[type];

    const textColor = {
        info: 'text-blue-800',
        warning: 'text-yellow-800',
        success: 'text-green-800',
        error: 'text-red-800'
    }[type];

    const iconColor = {
        info: 'text-blue-500',
        warning: 'text-yellow-500',
        success: 'text-green-500',
        error: 'text-red-500'
    }[type];

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 rounded-lg">
            <div className={`relative w-full max-w-lg mx-4 p-6 rounded-xl shadow-2xl border-2 ${bgColor}`}>
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className={`flex justify-center mb-4 ${iconColor}`}>
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                
                <h3 className={`text-xl font-bold text-center mb-2 ${textColor}`}>
                    {title}
                </h3>
                
                <p className={`text-center ${textColor} opacity-90`}>
                    {message}
                </p>
                
                {/* Action Button */}
                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- KOMPONEN BADGE ---
const StatusBadge = ({ status }: { status?: string }) => {
    let colorClasses = "bg-gray-100 text-gray-700";
    
    if (status === 'Lulus' || status === 'Selesai' || status === 'Valid') {
        colorClasses = "bg-green-100 text-green-700";
    } else if (status === 'Pending') {
        colorClasses = "bg-yellow-100 text-yellow-700";
    }
    
    return (
        <span className={`px-3 py-1 rounded-full text-xs ${colorClasses}`}>
            {status || '-'}
        </span>
    );
};

// --- DATA DUMMY ---
const dataSLHD: PageData = {
    title: "Hasil Penilaian SLHD",
    subtitle: "Penilaian dokumen SLHD per BAB",
    table: [
        { no: 1, komponen: 'BAB I - Pendahuluan', bobot: 10, nilai: 0, skor: 0 },
        { no: 2, komponen: 'BAB II - Analisis Isu LH Daerah', bobot: 50, nilai: 0, skor: 0 },
        { no: 3, komponen: 'BAB III - Isu Prioritas Daerah', bobot: 20, nilai: 0, skor: 0 },
        { no: 4, komponen: 'BAB IV - Inovasi Daerah', bobot: 15, nilai: 0, skor: 0 },
        { no: 5, komponen: 'BAB V - Penutup', bobot: 5, nilai: 0, skor: 0 },
    ],
};

const dataPenghargaan: PageData = {
    title: "Hasil Penilaian Penghargaan",
    subtitle: "Penentuan Bobot Antar Penghargaan",
    table: [
        { no: 1, kategori: 'Adipura', bobot: 35, nilai: 0, skor: 0, keterangan: 'Lulus' },
        { no: 2, kategori: 'Proper', bobot: 21, nilai: 0, skor: 0, keterangan: 'Lulus' },
        { no: 3, kategori: 'Proklim', bobot: 19, nilai: 0, skor: 0, keterangan: 'Lulus' },
        { no: 4, kategori: 'Adiwiyata', bobot: 15, nilai: 0, skor: 0, keterangan: 'Lulus' },
        { no: 5, kategori: 'Kalpataru', bobot: 10, nilai: 0, skor: 0, keterangan: 'Lulus' },
    ],
};

const dataValidasi1: PageData = {
    title: "Hasil Validasi 1",
    subtitle: "Validasi 1 - Rerata IKLH & Penghargaan",
    table: [
        { no: 1, kategori: 'Nilai Penghargaan', bobot: 60, nilai: 0, skor: 0, status: '-' },
        { no: 2, kategori: 'Nilai IKLH', bobot: 40, nilai: 0, skor: 0, status: '-' },
    ],
};

const dataValidasi2: PageData = {
    title: "Hasil Validasi 2",
    subtitle: "Validasi 2 - Administratif & Kepatuhan",
    table: [
        { no: 1, kriteria: 'Kriteria WTP (Wajar Tanpa Pengecualian)', status: '-', keterangan: '-' },
        { no: 2, kriteria: 'Kriteria Kasus Hukum Lingkungan', status: '-', keterangan: '-' },
    ],
};

const dataWawancara: PageData = {
    title: "Hasil Penilaian Wawancara",
    subtitle: "Wawancara & Perhitungan Nilai Tahap Akhir (NT Final)",
    table: [],
};

// --- MAIN COMPONENT ---
export default function HasilPenilaianPage() {
    const [activeTab, setActiveTab] = useState('penilaian_slhd'); 
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [loadingTimeline, setLoadingTimeline] = useState(true);
    const [tahapAktif, setTahapAktif] = useState<string>('');
    
    // State untuk hasil dari API rekap penilaian
    const [hasilPenilaian, setHasilPenilaian] = useState<Record<string, HasilPenilaian | null>>({});
    const [loadingHasil, setLoadingHasil] = useState(false);
    const [showHasilModal, setShowHasilModal] = useState(false);
    const [pengumumanTersedia, setPengumumanTersedia] = useState<Record<string, boolean>>({});
    
    // State notification independen per tab
    const [showNotifications, setShowNotifications] = useState<Record<string, boolean>>({
        penilaian_slhd: true,
        penilaian_penghargaan: true,
        validasi_1: true,
        validasi_2: true,
        wawancara: true
    });

    // State data dari API
    const [dataSLHDApi, setDataSLHDApi] = useState<PageData>(dataSLHD);
    const [dataPenghargaanApi, setDataPenghargaanApi] = useState<PageData>(dataPenghargaan);
    const [dataValidasi1Api, setDataValidasi1Api] = useState<PageData>(dataValidasi1);
    const [dataValidasi2Api, setDataValidasi2Api] = useState<PageData>(dataValidasi2);
    const [dataWawancaraApi, setDataWawancaraApi] = useState<PageData>(dataWawancara);

    const tabs = [
        { id: 'penilaian_slhd', name: 'Penilaian SLHD' },
        { id: 'penilaian_penghargaan', name: 'Penilaian Penghargaan' },
        { id: 'validasi_1', name: 'Validasi 1' },
        { id: 'validasi_2', name: 'Validasi 2' },
        { id: 'wawancara', name: 'Wawancara & Nilai Akhir' },
    ];

    // Fetch timeline dari API
    const fetchTimeline = useCallback(async () => {
        try {
            setLoadingTimeline(true);
            const response = await axios.get('/api/dinas/pengumuman/timeline');
            const data: TimelineResponse = response.data;
            setTimeline(data.timeline);
            setTahapAktif(data.tahap_aktif); // Simpan tahap aktif
        } catch (err: any) {
            console.error('Error fetching timeline:', err);
        } finally {
            setLoadingTimeline(false);
        }
    }, []);

    // Fetch hasil penilaian dari API rekap per tahap
    const fetchHasilPenilaian = useCallback(async (tahap: string) => {
        try {
            setLoadingHasil(true);
            const year = new Date().getFullYear();
            const response = await axios.get(`/api/dinas/pengumuman/${year}/${tahap}`);
            const data = response.data;
            
            if (data.pengumuman_tersedia && data.hasil) {
                setHasilPenilaian(prev => ({ ...prev, [tahap]: data.hasil }));
                setPengumumanTersedia(prev => ({ ...prev, [tahap]: true }));
                setShowHasilModal(true);
                
                // Update table data based on tahap
                updateTableFromHasil(tahap, data.hasil);
            } else {
                setPengumumanTersedia(prev => ({ ...prev, [tahap]: false }));
                setHasilPenilaian(prev => ({ ...prev, [tahap]: null }));
            }
        } catch (err: any) {
            console.error('Error fetching hasil penilaian:', err);
            setPengumumanTersedia(prev => ({ ...prev, [tahap]: false }));
        } finally {
            setLoadingHasil(false);
        }
    }, []);

    // Update table data berdasarkan hasil API
    const updateTableFromHasil = (tahap: string, hasil: HasilPenilaian) => {
        switch (tahap) {
            case 'validasi_1':
                if (hasil.nilai_penghargaan !== undefined && hasil.nilai_iklh !== undefined) {
                    const nilaiPenghargaan = parseFloat(String(hasil.nilai_penghargaan)) || 0;
                    const nilaiIklh = parseFloat(String(hasil.nilai_iklh)) || 0;
                    setDataValidasi1Api({
                        title: "Hasil Validasi 1",
                        subtitle: "Validasi 1 - Rerata IKLH & Penghargaan",
                        table: [
                            { 
                                no: 1, 
                                kategori: 'Nilai Penghargaan', 
                                bobot: 60, 
                                nilai: nilaiPenghargaan, 
                                skor: (nilaiPenghargaan * 60) / 100,
                                status: hasil.status 
                            },
                            { 
                                no: 2, 
                                kategori: 'Nilai IKLH', 
                                bobot: 40, 
                                nilai: nilaiIklh, 
                                skor: (nilaiIklh * 40) / 100,
                                status: hasil.status 
                            },
                        ]
                    });
                }
                break;
            case 'validasi_2':
                if (hasil.kriteria_wtp !== undefined && hasil.kriteria_kasus_hukum !== undefined) {
                    setDataValidasi2Api({
                        title: "Hasil Validasi 2",
                        subtitle: "Validasi 2 - Administratif & Kepatuhan",
                        table: [
                            { 
                                no: 1, 
                                kriteria: 'Kriteria WTP (Wajar Tanpa Pengecualian)', 
                                status: hasil.kriteria_wtp,
                                keterangan: hasil.kriteria_wtp === 'Memenuhi' 
                                    ? 'Laporan keuangan daerah mendapat opini WTP dari BPK'
                                    : 'Laporan keuangan daerah tidak mendapat opini WTP dari BPK'
                            },
                            { 
                                no: 2, 
                                kriteria: 'Kriteria Kasus Hukum Lingkungan', 
                                status: hasil.kriteria_kasus_hukum,
                                keterangan: hasil.kriteria_kasus_hukum === 'Memenuhi'
                                    ? 'Tidak ada kasus hukum lingkungan yang sedang berjalan'
                                    : 'Terdapat kasus hukum lingkungan yang sedang berjalan'
                            },
                        ]
                    });
                }
                break;
            case 'wawancara':
                if (hasil.nilai_wawancara !== undefined) {
                    const nilaiWawancara = parseFloat(String(hasil.nilai_wawancara)) || 0;
                    setDataWawancaraApi({
                        title: "Hasil Penilaian Wawancara",
                        subtitle: "Wawancara & Perhitungan Nilai Tahap Akhir (NT Final)",
                        table: [
                            { 
                                no: 1, 
                                komponen: 'Nilai Wawancara', 
                                bobot: 100, 
                                nilai: nilaiWawancara, 
                                skor: nilaiWawancara
                            },
                        ]
                    });
                }
                break;
        }
    };

    // Fetch detail SLHD dari API
    const fetchDetailSLHD = useCallback(async () => {
        try {
            const response = await axios.get('/api/dinas/pengumuman/detail-slhd');
            const data = response.data;
            
            if (data.available && data.detail_bab) {
                setDataSLHDApi({
                    title: "Hasil Penilaian SLHD",
                    subtitle: "Penilaian dokumen SLHD per BAB",
                    table: data.detail_bab.map((bab: any) => ({
                        no: bab.no,
                        komponen: bab.komponen,
                        bobot: bab.bobot,
                        nilai: bab.nilai,
                        skor: bab.skor
                    }))
                });
            }
        } catch (err: any) {
            console.error('Error fetching detail SLHD:', err);
        }
    }, []);

    // Fetch detail Penghargaan dari API
    const fetchDetailPenghargaan = useCallback(async () => {
        try {
            const response = await axios.get('/api/dinas/pengumuman/detail-penghargaan');
            const data = response.data;
            
            if (data.available && data.detail_kategori) {
                setDataPenghargaanApi({
                    title: "Hasil Penilaian Penghargaan",
                    subtitle: "Penentuan Bobot Antar Penghargaan",
                    table: data.detail_kategori.map((kat: any) => ({
                        no: kat.no,
                        kategori: kat.kategori,
                        bobot: kat.bobot,
                        nilai: kat.persentase,
                        skor: kat.nilai_tertimbang
                    }))
                });
            }
        } catch (err: any) {
            console.error('Error fetching detail Penghargaan:', err);
        }
    }, []);

    useEffect(() => {
        fetchTimeline();
        fetchDetailSLHD();
        fetchDetailPenghargaan();
        // Fetch hasil untuk tab awal
        fetchHasilPenilaian('penilaian_slhd');
    }, [fetchTimeline, fetchDetailSLHD, fetchDetailPenghargaan, fetchHasilPenilaian]);

    // Fetch hasil penilaian ketika tab berubah
    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId);
        // Fetch hasil penilaian untuk tab yang dipilih jika belum ada
        if (!hasilPenilaian[tabId]) {
            fetchHasilPenilaian(tabId);
        } else if (pengumumanTersedia[tabId]) {
            // Jika sudah ada hasil, tampilkan modal
            setShowHasilModal(true);
        }
    }, [fetchHasilPenilaian, hasilPenilaian, pengumumanTersedia]);

    // Get status untuk active tab
    const currentStatus = useMemo(() => {
        const tahapData = timeline.find(t => t.tahap === activeTab);
        if (!tahapData) return null;
        
        const statusMap = {
            'pending': 'BELUM DIMULAI',
            'active': 'SEDANG BERLANGSUNG', 
            'completed': 'SELESAI'
        };
        
        return {
            status: statusMap[tahapData.status] || tahapData.keterangan,
            rawStatus: tahapData.status
        };
    }, [timeline, activeTab]);

    const currentData: PageData = useMemo(() => {
        switch (activeTab) {
            case 'penilaian_slhd': return dataSLHDApi;
            case 'penilaian_penghargaan': return dataPenghargaanApi;
            case 'validasi_1': return dataValidasi1Api;
            case 'validasi_2': return dataValidasi2Api;
            case 'wawancara': return dataWawancaraApi;
            default: return dataSLHDApi;
        }
    }, [activeTab, dataSLHDApi, dataPenghargaanApi, dataValidasi1Api, dataValidasi2Api, dataWawancaraApi]);

    // Dapatkan hasil untuk tab aktif
    const currentHasil = useMemo(() => {
        return hasilPenilaian[activeTab] || null;
    }, [hasilPenilaian, activeTab]);

    const getTableHeadings = () => {
        switch (activeTab) {
            case 'penilaian_slhd':
            case 'wawancara':
            case 'penilaian_penghargaan':
                return { header: ['NO', 'KOMPONEN', 'BOBOT (%)', 'NILAI (0-100)', 'SKOR AKHIR'], totalLabel: 'Total Nilai:', colSpan: 4 };
            case 'validasi_1':
                return { header: ['NO', 'KATEGORI', 'BOBOT (%)', 'NILAI (0-100)', 'SKOR AKHIR', 'KETERANGAN'], totalLabel: 'Total Nilai:', colSpan: 4 };
            case 'validasi_2':
                return { header: ['NO', 'KRITERIA VALIDASI', 'STATUS', 'KETERANGAN'], totalLabel: null, colSpan: 0 };
            default:
                return { header: ['NO', 'KOMPONEN', 'BOBOT (%)', 'NILAI (0-100)', 'SKOR AKHIR'], totalLabel: 'Total Nilai:', colSpan: 4 };
        }
    };

    const { header: tableHeadings, totalLabel, colSpan } = getTableHeadings();
    
    const totalNilai = currentData.table.reduce((sum, item) => sum + (item.skor || 0), 0);

    return (
        <div className="max-w-7xl mx-auto p-2">
            <div className="text-sm text-green-600 mb-2 font-medium">
                Penilaian <span className="text-gray-400 mx-2">&gt;</span> 
                <span className="text-gray-600">{currentData.title.replace('Hasil ','')}</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{currentData.title}</h1>
                    <p className="text-lg text-gray-500 mt-1">{currentData.subtitle}</p>
                </div>
                
                {/* Card Hasil Penilaian */}
                {currentHasil ? (
                    <div 
                        className={`p-4 rounded-lg shadow-sm border text-right min-w-[200px] cursor-pointer hover:shadow-md transition-shadow ${
                            (() => {
                                // Jika masih di tahap aktif yang sama, tampilkan biru (proses)
                                if (tahapAktif === activeTab) return 'bg-blue-50 border-blue-200';
                                
                                // Jika sudah lewat tahap, tampilkan status asli
                                const isLolos = currentHasil.status === 'LOLOS' || currentHasil.status === 'LOLOS FINAL' || 
                                               currentHasil.status === 'MASUK KATEGORI' || currentHasil.status === 'SELESAI' || 
                                               currentHasil.status === 'SELESAI WAWANCARA';
                                const isWaiting = currentHasil.status === 'MENUNGGU';
                                
                                return isLolos ? 'bg-green-50 border-green-200' : 
                                       isWaiting ? 'bg-yellow-50 border-yellow-200' : 
                                       'bg-red-50 border-red-200';
                            })()
                        }`}
                        onClick={() => setShowHasilModal(true)}
                    >
                        <p className="text-sm font-medium text-gray-500">Hasil Penilaian:</p>
                        <p className={`text-2xl font-bold mt-1 ${
                            (() => {
                                // Jika masih di tahap aktif yang sama, tampilkan biru (proses)
                                if (tahapAktif === activeTab) return 'text-blue-600';
                                
                                const isLolos = currentHasil.status === 'LOLOS' || currentHasil.status === 'LOLOS FINAL' || 
                                               currentHasil.status === 'MASUK KATEGORI' || currentHasil.status === 'SELESAI' || 
                                               currentHasil.status === 'SELESAI WAWANCARA';
                                const isWaiting = currentHasil.status === 'MENUNGGU';
                                
                                return isLolos ? 'text-green-600' : 
                                       isWaiting ? 'text-yellow-600' : 
                                       'text-red-600';
                            })()
                        }`}>
                            {tahapAktif === activeTab ? '⏳ SEDANG PROSES' : currentHasil.status}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Klik untuk detail</p>
                    </div>
                ) : currentStatus && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-right min-w-[200px]">
                        <p className="text-sm font-medium text-gray-500">Hasil Penilaian:</p>
                        <p className={`text-2xl font-bold mt-1 ${
                            currentStatus.rawStatus === 'completed' 
                                ? 'text-green-600' 
                                : currentStatus.rawStatus === 'active' 
                                    ? 'text-yellow-600' 
                                    : 'text-gray-500'
                        }`}>
                            {currentStatus.rawStatus === 'completed' ? 'SELESAI' : 'MENUNGGU'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{currentStatus.status}</p>
                    </div>
                )}
            </div>

            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-base ${
                                    activeTab === tab.id
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-black hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* KARTU UTAMA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 pb-0 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {currentData.title.replace('Hasil Penilaian ', '').replace('Hasil ', '')}
                        </h2>
                    </div>
                </div>

                <div className="overflow-x-auto p-6 relative">
                    {/* Floating Notification - tampil jika pengumuman belum tersedia */}
                    {!pengumumanTersedia[activeTab] && showNotifications[activeTab] && (
                        <FloatingNotification
                            show={true}
                            onClose={() => setShowNotifications(prev => ({ ...prev, [activeTab]: false }))}
                            title={currentStatus?.status || 'Pemberitahuan'}
                            message="Hasil penilaian untuk tahap ini belum tersedia. Silakan tunggu hingga tahap selesai."
                            type={currentStatus?.rawStatus === 'active' ? 'info' : 'warning'}
                        />
                    )}
                    
                    {/* TABEL DENGAN HEADER HIJAU DAN ROUNDED CORNERS */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-100 border-b border-green-200">
                                <tr>
                                    {tableHeadings.map((head, index) => (
                                        <th key={index} className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentData.table.length === 0 ? (
                                    <tr>
                                        <td colSpan={tableHeadings.length} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p>Belum ada data penilaian untuk tahap ini</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.table.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.no}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.komponen || item.kategori || item.kriteria}
                                        </td>
                                        {activeTab !== 'validasi_2' && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.bobot}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {typeof item.nilai === 'number' ? item.nilai.toFixed(2) : item.nilai}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {typeof item.skor === 'number' ? item.skor.toFixed(2) : item.skor}
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'validasi_1' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={item.status || item.keterangan} />
                                            </td>
                                        )}
                                        {activeTab === 'validasi_2' && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 italic">{item.keterangan}</td>
                                            </>
                                        )}
                                    </tr>
                                )))}
                            </tbody>
                            
                            {totalLabel && (
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={colSpan} className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase">
                                            {totalLabel}
                                        </td>
                                        <td className="px-6 py-4 text-left text-lg font-bold text-gray-900" colSpan={2}>
                                            {totalNilai.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* Hasil Modal */}
            <HasilModal
                show={showHasilModal}
                onClose={() => setShowHasilModal(false)}
                hasil={currentHasil}
                loading={loadingHasil}
                tahapAktif={tahapAktif}
                activeTab={activeTab}
            />
        </div>
    );
}
