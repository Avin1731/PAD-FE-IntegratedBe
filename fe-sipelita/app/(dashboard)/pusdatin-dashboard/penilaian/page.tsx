'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from '@/lib/axios';
import InnerNav from '@/components/InnerNav';
import ProgressCard from '@/components/ProgressCard';
import { FaFileExcel, FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaFilter } from 'react-icons/fa';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

// --- INTERFACES ---
interface Province {
    id: number;
    nama_region: string;
}

interface DinasSubmission {
    id_dinas: number;
    nama_dinas: string;
    provinsi: string;
    tipe: 'provinsi' | 'kabupaten/kota';
    buku1_finalized: boolean;
    buku2_finalized: boolean;
    tabel_finalized: boolean;
    all_finalized: boolean;
    buku1_status?: 'draft' | 'finalized' | 'approved';
    buku2_status?: 'draft' | 'finalized' | 'approved';
    tabel_status?: 'draft' | 'finalized' | 'approved';
}

interface ParsedSLHD {
    id: number;
    id_dinas: number;
    nama_dinas: string;
    provinsi?: string;
    Bab_1: number | null;
    // 12 Matra BAB 2
    Jumlah_Pemanfaatan_Pelayanan_Laboratorium: number | null;
    Daya_Dukung_dan_Daya_Tampung_Lingkungan_Hidup: number | null;
    Kajian_Lingkungan_Hidup_Strategis: number | null;
    Keanekaragaman_Hayati: number | null;
    Kualitas_Air: number | null;
    Laut_Pesisir_dan_Pantai: number | null;
    Kualitas_Udara: number | null;
    Pengelolaan_Sampah_dan_Limbah: number | null;
    Lahan_dan_Hutan: number | null;
    Perubahan_Iklim: number | null;
    Risiko_Bencana: number | null;
    Penetapan_Isu_Prioritas: number | null;
    Bab_3: number | null;
    Bab_4: number | null;
    Bab_5: number | null;
    Total_Skor: number | null;
    status: 'parsed_ok' | 'parsed_error' | 'finalized';
}

// Helper untuk menghitung rata-rata BAB 2
const getBab2Avg = (item: ParsedSLHD): number | null => {
    const matraValues = [
        item.Jumlah_Pemanfaatan_Pelayanan_Laboratorium,
        item.Daya_Dukung_dan_Daya_Tampung_Lingkungan_Hidup,
        item.Kajian_Lingkungan_Hidup_Strategis,
        item.Keanekaragaman_Hayati,
        item.Kualitas_Air,
        item.Laut_Pesisir_dan_Pantai,
        item.Kualitas_Udara,
        item.Pengelolaan_Sampah_dan_Limbah,
        item.Lahan_dan_Hutan,
        item.Perubahan_Iklim,
        item.Risiko_Bencana,
        item.Penetapan_Isu_Prioritas
    ].filter(v => v !== null) as number[];
    
    if (matraValues.length === 0) return null;
    return matraValues.reduce((sum, v) => sum + v, 0) / matraValues.length;
};

interface PenilaianSLHD {
    id: number;
    year: number;
    status: 'uploaded' | 'parsing' | 'parsed_ok' | 'parsed_failed' | 'finalized';
    file_path: string;
    uploaded_at: string;
    finalized_at: string | null;
    is_finalized: boolean;
    catatan: string | null;
    uploaded_by?: {
        id: number;
        email: string;
    };
}

interface PenilaianPenghargaan {
    id: number;
    year: number;
    status: 'uploaded' | 'parsing' | 'parsed_ok' | 'parsed_failed' | 'finalized';
    file_path: string;
    uploaded_at: string;
    finalized_at: string | null;
    is_finalized: boolean;
    catatan: string | null;
    uploaded_by?: {
        id: number;
        email: string;
    };
}

interface ParsedPenghargaan {
    id: number;
    id_dinas: number;
    nama_dinas: string;
    Adipura_Skor: number | null;
    Adipura_Skor_Max: number | null;
    Adiwiyata_Skor: number | null;
    Adiwiyata_Skor_Max: number | null;
    Proklim_Skor: number | null;
    Proklim_Skor_Max: number | null;
    Proper_Skor: number | null;
    Proper_Skor_Max: number | null;
    Kalpataru_Skor: number | null;
    Kalpataru_Skor_Max: number | null;
    Total_Skor: number | null;
    status: 'parsed_ok' | 'parsed_error' | 'finalized';
}

interface ParsedValidasi1 {
    id: number;
    id_dinas: number;
    nama_dinas: string;
    Total_Skor: number | null;
    Nilai_IKLH: number | null;
    Nilai_Penghargaan: number | null;
    status: string;
    status_result: 'lulus' | 'tidak_lulus' | null;
}

interface ParsedValidasi2 {
    id: number;
    id_dinas: number;
    nama_dinas: string;
    Nilai_Penghargaan: number | null;
    Nilai_IKLH: number | null;
    Total_Skor: number | null;
    Kriteria_WTP: boolean;
    Kriteria_Kasus_Hukum: boolean;
    status_validasi: 'pending' | 'lolos' | 'tidak_lolos';
    catatan: string | null;
}

interface RankedData {
    peringkat: number;
    id_dinas: number;
    nama_dinas: string;
    kategori: string;
    provinsi: string;
    Nilai_Penghargaan: number;
    Nilai_IKLH: number;
    Total_Skor: number;
    Kriteria_WTP: boolean;
    Kriteria_Kasus_Hukum: boolean;
}

interface WawancaraData {
    id: number;
    year: number;
    id_dinas: number;
    nama_dinas: string;
    kategori: string;
    provinsi: string;
    nilai_wawancara: number | null;
    catatan: string | null;
    status: string;
    is_finalized: boolean;
}

// --- KOMPONEN TAB PENILAIAN SLHD ---
function TabPenilaianSLHD() {
    const [tipeFilter, setTipeFilter] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilter, setProvinsiFilter] = useState<string>('');
    const [provinsiList, setProvinsiList] = useState<Province[]>([]);
    const [submissions, setSubmissions] = useState<DinasSubmission[]>([]);
    const [parsedData, setParsedData] = useState<ParsedSLHD[]>([]);
    const [penilaianSLHD, setPenilaianSLHD] = useState<PenilaianSLHD | null>(null);
    const [penilaianList, setPenilaianList] = useState<PenilaianSLHD[]>([]);
    const [selectedPenilaianId, setSelectedPenilaianId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadCatatan, setUploadCatatan] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageParsed, setCurrentPageParsed] = useState(1);
    
    // Filter independen untuk hasil penilaian
    const [tipeFilterParsed, setTipeFilterParsed] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilterParsed, setProvinsiFilterParsed] = useState<string>('');
    const [itemsPerPageParsed, setItemsPerPageParsed] = useState<number | 'all'>('all' as const);

    const year = new Date().getFullYear();

    // Fetch provinsi list on mount
    useEffect(() => {
        axios.get('/api/wilayah/provinces')
            .then(res => setProvinsiList(res.data?.data || []))
            .catch(console.error);
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [submissionRes, penilaianRes] = await Promise.all([
                axios.get(`/api/pusdatin/penilaian/submissions?year=${year}`),
                axios.get(`/api/pusdatin/penilaian/slhd/${year}`)
            ]);

            setSubmissions(submissionRes.data.data || []);
            
            // Backend mengembalikan array semua penilaian SLHD
            const penilaianData = penilaianRes.data.data;
            if (penilaianData && penilaianData.length > 0) {
                setPenilaianList(penilaianData);
                const latestPenilaian = penilaianData[0];
                setPenilaianSLHD(latestPenilaian);
                setSelectedPenilaianId(latestPenilaian.id);
                // Fetch parsed data jika ada penilaian
                const parsedRes = await axios.get(`/api/pusdatin/penilaian/slhd/parsed/${latestPenilaian.id}`);
                setParsedData(parsedRes.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter submissions
    const filteredSubmissions = useMemo(() => {
        return submissions.filter(item => {
            const matchTipe = tipeFilter === 'all' || item.tipe === tipeFilter;
            const matchProvinsi = !provinsiFilter || item.provinsi === provinsiFilter;
            return matchTipe && matchProvinsi;
        });
    }, [submissions, tipeFilter, provinsiFilter]);

    // Filter parsed data (filter independen)
    const filteredParsed = useMemo(() => {
        return parsedData.filter(item => {
            // Cari submission untuk dinas ini
            const submission = submissions.find(s => s.id_dinas === item.id_dinas);
            
            // Jika submission tidak ketemu, skip filter ini (tampilkan data)
            if (!submission) return provinsiFilterParsed === '' && tipeFilterParsed === 'all';
            
            // Match tipe
            const matchTipe = tipeFilterParsed === 'all' || submission.tipe === tipeFilterParsed;
            
            // Match provinsi (ambil dari submission, bukan dari item)
            const matchProvinsi = !provinsiFilterParsed || submission.provinsi === provinsiFilterParsed;
            
            return matchTipe && matchProvinsi;
        });
    }, [parsedData, submissions, tipeFilterParsed, provinsiFilterParsed]);

    // Pagination untuk submissions
    const paginatedSubmissions = useMemo(() => {
        if (itemsPerPage === 'all') return filteredSubmissions;
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSubmissions.slice(start, start + itemsPerPage);
    }, [filteredSubmissions, currentPage, itemsPerPage]);

    // Pagination untuk parsed (independen)
    const paginatedParsed = useMemo(() => {
        if (itemsPerPageParsed === 'all') return filteredParsed;
        const perPage = typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10;
        const start = (currentPageParsed - 1) * perPage;
        return filteredParsed.slice(start, start + perPage);
    }, [filteredParsed, currentPageParsed, itemsPerPageParsed]);

    const totalPagesSubmissions = itemsPerPage === 'all' ? 1 : Math.ceil(filteredSubmissions.length / itemsPerPage);
    const totalPagesParsed = itemsPerPageParsed === 'all' ? 1 : Math.ceil(filteredParsed.length / (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10));

    // Handle penilaian selection change
    const handlePenilaianChange = async (penilaianId: number) => {
        const selected = penilaianList.find(p => p.id === penilaianId);
        if (!selected) return;
        
        setSelectedPenilaianId(penilaianId);
        setPenilaianSLHD(selected);
        
        try {
            const parsedRes = await axios.get(`/api/pusdatin/penilaian/slhd/parsed/${penilaianId}`);
            setParsedData(parsedRes.data.data || []);
        } catch (err) {
            console.error('Error fetching parsed data:', err);
        }
    };

    // Download template
    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`/api/pusdatin/penilaian/slhd/template?year=${year}&tipe=${tipeFilter === 'all' ? 'kabupaten/kota' : tipeFilter}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Template_Penilaian_SLHD_${year}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error downloading template:', err);
            alert('Gagal mengunduh template');
        }
    };

    // Upload file
    const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        if (uploadCatatan) {
            formData.append('catatan', uploadCatatan);
        }

        try {
            setUploading(true);
            const response = await axios.post(`/api/pusdatin/penilaian/slhd/upload/${year}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert('File berhasil diupload dan sedang diproses');
            setUploadCatatan(''); // Reset catatan
            fetchData(); // Refresh data
        } catch (err: any) {
            console.error('Error uploading file:', err);
            alert(err.response?.data?.message || 'Gagal mengupload file');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    // Finalisasi
    const handleFinalize = async () => {
        if (!penilaianSLHD) return;
        if (!confirm('Apakah Anda yakin ingin memfinalisasi penilaian SLHD? Setelah difinalisasi, data tidak dapat diubah.')) return;

        try {
            await axios.patch(`/api/pusdatin/penilaian/slhd/finalize/${penilaianSLHD.id}`);
            alert('Penilaian SLHD berhasil difinalisasi');
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            alert(err.response?.data?.message || 'Gagal memfinalisasi');
        }
    };

    // Helper: Keterangan Lulus/Tidak Lulus
    const getKeterangan = (totalSkor: number | null) => {
        if (totalSkor === null) return '-';
        return totalSkor >= 60 ? 'Lulus' : 'Tidak Lulus';
    };

    const getKeteranganColor = (totalSkor: number | null) => {
        if (totalSkor === null) return 'text-gray-400';
        return totalSkor >= 60 ? 'text-green-600' : 'text-red-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* BAGIAN 1: FILTER & TABEL KELAYAKAN ADMINISTRASI */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Kelayakan Administrasi Dokumen</h2>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-4 mb-6 items-end">
                    <div className="w-48">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tipe Daerah</label>
                        <select 
                            value={tipeFilter}
                            onChange={(e) => {
                                setTipeFilter(e.target.value as any);
                                setCurrentPage(1);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Semua</option>
                            <option value="provinsi">Provinsi</option>
                            <option value="kabupaten/kota">Kabupaten/Kota</option>
                        </select>
                    </div>
                    <div className="w-64">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                        <select 
                            value={provinsiFilter}
                            onChange={(e) => {
                                setProvinsiFilter(e.target.value);
                                setCurrentPage(1);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Provinsi</option>
                            {provinsiList.map(prov => (
                                <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tampilkan</label>
                        <select 
                            value={itemsPerPage === 'all' ? 'all' : itemsPerPage.toString()}
                            onChange={(e) => {
                                const val = e.target.value;
                                setItemsPerPage(val === 'all' ? 'all' : parseInt(val));
                                setCurrentPage(1);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Semua</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>

                {/* Tabel Administrasi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">No</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                                    {/* <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Tipe</th> */}
                                    {/* <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Aksi</th> */}
                                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Buku I</th>
                                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Buku II</th>
                                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Tabel Utama</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-500">
                                            Tidak ada data submission
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSubmissions.map((item, index) => (
                                        <tr key={item.id_dinas} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {itemsPerPage === 'all' ? index + 1 : (currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-800">{item.nama_dinas}</td>
                                            {/* <td className="py-3 px-4 text-sm text-gray-600 capitalize">{item.tipe}</td> */}
                                            {/* <td className="py-3 px-4 text-sm">
                                                <a 
                                                    href={`/pusdatin-dashboard/submission/${item.id_dinas}`}
                                                    className="text-green-600 hover:underline text-xs font-medium"
                                                >
                                                    Lihat Dokumen
                                                </a>
                                            </td> */}
                                            <td className="py-3 px-4 text-center text-xl">
                                                {item.buku1_status === 'approved' ? (
                                                    <MdCheckBox className="inline text-green-600" />
                                                ) : (
                                                    <MdCheckBoxOutlineBlank className="inline text-gray-300" />
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center text-xl">
                                                {item.buku2_status === 'approved' ? (
                                                    <MdCheckBox className="inline text-green-600" />
                                                ) : (
                                                    <MdCheckBoxOutlineBlank className="inline text-gray-300" />
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center text-xl">
                                                {item.tabel_status === 'approved' ? (
                                                    <MdCheckBox className="inline text-green-600" />
                                                ) : (
                                                    <MdCheckBoxOutlineBlank className="inline text-gray-300" />
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info & Pagination Administrasi */}
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        Menampilkan {paginatedSubmissions.length} dari {filteredSubmissions.length} data
                    </div>
                    {itemsPerPage !== 'all' && totalPagesSubmissions > 1 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 text-sm">
                                {currentPage} / {totalPagesSubmissions}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPagesSubmissions, p + 1))}
                                disabled={currentPage === totalPagesSubmissions}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* BAGIAN 2: TOMBOL DOWNLOAD & UPLOAD */}
            <div>
                 <div>
                        <h2 className="text-lg font-bold text-gray-800">Penilaian SLHD</h2>
                        {penilaianSLHD && (
                            <p className="text-sm text-gray-500 mt-1">
                                Status: <span className={penilaianSLHD.is_finalized ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                                    {penilaianSLHD.is_finalized ? '🔒 Sudah Finalisasi' : '📝 Draft'}
                                </span>
                            </p>
                        )}
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <FaFileExcel className="text-xl" />
                            <h3 className="font-semibold text-gray-800">Unduh Template Excel</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Silahkan unduh template excel, isi nilai, dan unggah kembali ke sistem.
                        </p>
                        <button 
                            onClick={handleDownloadTemplate}
                            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <FaFileExcel /> Unduh Template Excel Penilaian SLHD
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <FaCloudUploadAlt className="text-xl" />
                            <h3 className="font-semibold text-gray-800">Upload File Excel</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Pastikan file yang diunggah sudah sesuai dengan template yang disediakan.
                        </p>
                        
                        {/* Input Catatan */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Catatan Upload (Opsional)
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Revisi 2, Update nilai BAB 3, dll..."
                                value={uploadCatatan}
                                onChange={(e) => setUploadCatatan(e.target.value)}
                                disabled={uploading || penilaianSLHD?.status === 'finalized'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                            />
                        </div>

                        <label className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                            uploading || penilaianSLHD?.status === 'finalized'
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}>
                            {uploading ? (
                                <>
                                    <FaSpinner className="animate-spin" /> Mengupload...
                                </>
                            ) : (
                                <>
                                    <FaCloudUploadAlt /> Upload File Excel Hasil Penilaian SLHD
                                </>
                            )}
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleUploadFile}
                                disabled={uploading || penilaianSLHD?.status === 'finalized'}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                
            </div>

            {/* BAGIAN 3: TABEL HASIL PENILAIAN */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Hasil Penilaian</h3>
                </div>

                {/* Filter Independen untuk Hasil Penilaian */}
                <div className="flex flex-wrap gap-4 mb-6 items-end">
                    <div className="w-48">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tipe Daerah</label>
                        <select 
                            value={tipeFilterParsed}
                            onChange={(e) => {
                                const val = e.target.value as 'all' | 'provinsi' | 'kabupaten/kota';
                                setTipeFilterParsed(val);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Semua</option>
                            <option value="provinsi">Provinsi</option>
                            <option value="kabupaten/kota">Kabupaten/Kota</option>
                        </select>
                    </div>
                    <div className="w-64">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                        <select 
                            value={provinsiFilterParsed}
                            onChange={(e) => {
                                setProvinsiFilterParsed(e.target.value);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Provinsi</option>
                            {provinsiList.map(prov => (
                                <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tampilkan</label>
                        <select 
                            value={itemsPerPageParsed === 'all' ? 'all' : itemsPerPageParsed.toString()}
                            onChange={(e) => {
                                const val = e.target.value;
                                setItemsPerPageParsed(val === 'all' ? 'all' : parseInt(val));
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Semua</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
                <div className="pb-4 mb-6 border-b border-gray-200 flex justify-between items-end">
                   
                   
                    
                    <div className="flex gap-4 items-end">
                        {/* Dropdown Pilih Versi Penilaian */}
                        {penilaianList.length > 0 && (
                            <div className="w-96">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Pilih Versi Penilaian</label>
                                <select
                                    value={selectedPenilaianId || ''}
                                    onChange={(e) => handlePenilaianChange(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                {penilaianList.map((p, idx) => {
                                    const uploadDate = new Date(p.uploaded_at).toLocaleString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                    const uploaderEmail = p.uploaded_by?.email || 'Unknown';
                                    const catatan = p.catatan || 'Tanpa Catatan';
                                    const statusLabel = p.is_finalized ? ' 🔒' : '';
                                    
                                    return (
                                        <option key={p.id} value={p.id}>
                                            {uploadDate} • {uploaderEmail} • {catatan}{statusLabel}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}
                    
                    {/* Tombol Finalisasi */}
                    {penilaianSLHD && !penilaianSLHD.is_finalized && parsedData.length > 0 && (
                        <button
                            onClick={handleFinalize}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            🔒 Finalisasi Versi Ini
                        </button>
                    )}
                </div>
            </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-gray-700 uppercase">No</th>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB I</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB II</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB III</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB IV</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB V</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">Total Skor</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedParsed.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-gray-500">
                                            {parsedData.length === 0 
                                                ? 'Belum ada hasil penilaian. Silakan upload file excel penilaian.' 
                                                : 'Tidak ada data yang sesuai dengan filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedParsed.map((item, index) => {
                                        const bab2Avg = getBab2Avg(item);
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-3 text-sm text-gray-600">
                                                    {itemsPerPageParsed === 'all' ? index + 1 : (currentPageParsed - 1) * (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10) + index + 1}
                                                </td>
                                                <td className="py-3 px-3 text-sm font-medium text-gray-800">{item.nama_dinas}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{item.Bab_1 ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{bab2Avg?.toFixed(1) ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{item.Bab_3 ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{item.Bab_4 ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{item.Bab_5 ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm font-bold text-gray-800">
                                                    {item.Total_Skor?.toFixed(2) ?? '-'}
                                                </td>
                                                <td className={`py-3 px-3 text-center text-sm font-semibold ${getKeteranganColor(item.Total_Skor)}`}>
                                                    {getKeterangan(item.Total_Skor)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info & Pagination Hasil Penilaian */}
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        Menampilkan {paginatedParsed.length} dari {filteredParsed.length} data
                    </div>
                    {itemsPerPageParsed !== 'all' && totalPagesParsed > 1 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPageParsed(p => Math.max(1, p - 1))}
                                disabled={currentPageParsed === 1}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 text-sm">
                                {currentPageParsed} / {totalPagesParsed}
                            </span>
                            <button
                                onClick={() => setCurrentPageParsed(p => Math.min(totalPagesParsed, p + 1))}
                                disabled={currentPageParsed === totalPagesParsed}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

// --- KOMPONEN TAB PENILAIAN PENGHARGAAN ---
function TabPenilaianPenghargaan() {
    const [provinsiList, setProvinsiList] = useState<Province[]>([]);
    const [submissions, setSubmissions] = useState<DinasSubmission[]>([]);
    const [parsedData, setParsedData] = useState<ParsedPenghargaan[]>([]);
    const [penilaianPenghargaan, setPenilaianPenghargaan] = useState<PenilaianPenghargaan | null>(null);
    const [penilaianList, setPenilaianList] = useState<PenilaianPenghargaan[]>([]);
    const [selectedPenilaianId, setSelectedPenilaianId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadCatatan, setUploadCatatan] = useState('');
    const [currentPageParsed, setCurrentPageParsed] = useState(1);
    
    // Filter independen untuk hasil penilaian
    const [tipeFilterParsed, setTipeFilterParsed] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilterParsed, setProvinsiFilterParsed] = useState<string>('');
    const [itemsPerPageParsed, setItemsPerPageParsed] = useState<number | 'all'>('all' as const);

    const year = new Date().getFullYear();

    // Fetch provinsi list on mount
    useEffect(() => {
        axios.get('/api/wilayah/provinces')
            .then(res => setProvinsiList(res.data?.data || []))
            .catch(console.error);
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [submissionRes, penilaianRes] = await Promise.all([
                axios.get(`/api/pusdatin/penilaian/submissions?year=${year}`),
                axios.get(`/api/pusdatin/penilaian/penghargaan/${year}`)
            ]);

            setSubmissions(submissionRes.data.data || []);
            
            const penilaianData = penilaianRes.data.data;
            if (penilaianData && penilaianData.length > 0) {
                setPenilaianList(penilaianData);
                const latestPenilaian = penilaianData[0];
                setPenilaianPenghargaan(latestPenilaian);
                setSelectedPenilaianId(latestPenilaian.id);
                // Fetch parsed data jika ada penilaian
                const parsedRes = await axios.get(`/api/pusdatin/penilaian/penghargaan/parsed/${latestPenilaian.id}`);
                setParsedData(parsedRes.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter parsed data (filter independen)
    const filteredParsed = useMemo(() => {
        return parsedData.filter(item => {
            const submission = submissions.find(s => s.id_dinas === item.id_dinas);
            if (!submission) return provinsiFilterParsed === '' && tipeFilterParsed === 'all';
            const matchTipe = tipeFilterParsed === 'all' || submission.tipe === tipeFilterParsed;
            const matchProvinsi = !provinsiFilterParsed || submission.provinsi === provinsiFilterParsed;
            return matchTipe && matchProvinsi;
        });
    }, [parsedData, submissions, tipeFilterParsed, provinsiFilterParsed]);

    // Pagination untuk parsed (independen)
    const paginatedParsed = useMemo(() => {
        if (itemsPerPageParsed === 'all') return filteredParsed;
        const perPage = typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10;
        const start = (currentPageParsed - 1) * perPage;
        return filteredParsed.slice(start, start + perPage);
    }, [filteredParsed, currentPageParsed, itemsPerPageParsed]);

    const totalPagesParsed = itemsPerPageParsed === 'all' ? 1 : Math.ceil(filteredParsed.length / (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10));

    // Handle penilaian selection change
    const handlePenilaianChange = async (penilaianId: number) => {
        const selected = penilaianList.find(p => p.id === penilaianId);
        if (!selected) return;
        
        setSelectedPenilaianId(penilaianId);
        setPenilaianPenghargaan(selected);
        
        try {
            const parsedRes = await axios.get(`/api/pusdatin/penilaian/penghargaan/parsed/${penilaianId}`);
            setParsedData(parsedRes.data.data || []);
        } catch (err) {
            console.error('Error fetching parsed data:', err);
        }
    };

    // Download template
    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`/api/pusdatin/penilaian/penghargaan/template/${year}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Template_Penilaian_Penghargaan_${year}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            console.error('Error downloading template:', err);
            const errorMsg = err.response?.data?.message || 'Gagal mengunduh template. Pastikan penilaian SLHD sudah difinalisasi.';
            alert(errorMsg);
        }
    };

    // Upload file
    const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        if (uploadCatatan) {
            formData.append('catatan', uploadCatatan);
        }

        try {
            setUploading(true);
            await axios.post(`/api/pusdatin/penilaian/penghargaan/upload/${year}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert('File berhasil diupload dan sedang diproses');
            setUploadCatatan('');
            fetchData();
        } catch (err: any) {
            console.error('Error uploading file:', err);
            alert(err.response?.data?.message || 'Gagal mengupload file');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // Finalisasi
    const handleFinalize = async () => {
        if (!penilaianPenghargaan) return;
        if (!confirm('Apakah Anda yakin ingin memfinalisasi penilaian Penghargaan? Setelah difinalisasi, data tidak dapat diubah.')) return;

        try {
            await axios.patch(`/api/pusdatin/penilaian/penghargaan/finalize/${penilaianPenghargaan.id}`);
            alert('Penilaian Penghargaan berhasil difinalisasi');
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            alert(err.response?.data?.message || 'Gagal memfinalisasi');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* BAGIAN 1: DOWNLOAD & UPLOAD */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Penilaian Penghargaan</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <FaFileExcel className="text-xl" />
                            <h3 className="font-semibold text-gray-800">Unduh Template Excel</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Silahkan unduh template excel, isi nilai, dan unggah kembali ke sistem.
                        </p>
                        <button 
                            onClick={handleDownloadTemplate}
                            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <FaFileExcel /> Unduh Template Excel Penilaian Penghargaan
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <FaCloudUploadAlt className="text-xl" />
                            <h3 className="font-semibold text-gray-800">Upload File Excel</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Pastikan file yang diunggah sudah sesuai dengan template yang disediakan.
                        </p>
                        
                        {/* Input Catatan */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Catatan Upload (Opsional)
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Revisi 2, Update nilai Adipura, dll..."
                                value={uploadCatatan}
                                onChange={(e) => setUploadCatatan(e.target.value)}
                                disabled={uploading || penilaianPenghargaan?.status === 'finalized'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                            />
                        </div>

                        <label className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                            uploading || penilaianPenghargaan?.status === 'finalized'
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}>
                            {uploading ? (
                                <>
                                    <FaSpinner className="animate-spin" /> Mengupload...
                                </>
                            ) : (
                                <>
                                    <FaCloudUploadAlt /> Upload File Excel Hasil Penilaian Penghargaan
                                </>
                            )}
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleUploadFile}
                                disabled={uploading || penilaianPenghargaan?.status === 'finalized'}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Status & Dropdown Versi */}
                <div className="pb-4 mb-6 border-b border-gray-200 flex justify-between items-end">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Hasil Penilaian Penghargaan</h2>
                        {penilaianPenghargaan && (
                            <p className="text-sm text-gray-500 mt-1">
                                Status: <span className={penilaianPenghargaan.is_finalized ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                                    {penilaianPenghargaan.is_finalized ? '🔒 Sudah Finalisasi' : '📝 Draft'}
                                </span>
                            </p>
                        )}
                    </div>
                    
                    <div className="flex gap-4 items-end">
                        {/* Dropdown Pilih Versi Penilaian */}
                        {penilaianList.length > 0 && (
                            <div className="w-96">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Pilih Versi Penilaian</label>
                                <select
                                    value={selectedPenilaianId || ''}
                                    onChange={(e) => handlePenilaianChange(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {penilaianList.map((p) => {
                                        const uploadDate = new Date(p.uploaded_at).toLocaleString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        const uploaderEmail = p.uploaded_by?.email || 'Unknown';
                                        const catatan = p.catatan || 'Tanpa Catatan';
                                        const statusLabel = p.is_finalized ? ' 🔒' : '';
                                        
                                        return (
                                            <option key={p.id} value={p.id}>
                                                {uploadDate} • {uploaderEmail} • {catatan}{statusLabel}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}
                        
                        {/* Tombol Finalisasi */}
                        {penilaianPenghargaan && !penilaianPenghargaan.is_finalized && parsedData.length > 0 && (
                            <button
                                onClick={handleFinalize}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                🔒 Finalisasi Versi Ini
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* BAGIAN 2: TABEL HASIL PENILAIAN */}
            <div className="space-y-4">
                {/* Filter Independen untuk Hasil Penilaian */}
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="w-56">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                        <select 
                            value={provinsiFilterParsed}
                            onChange={(e) => {
                                setProvinsiFilterParsed(e.target.value);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Provinsi</option>
                            {provinsiList.map(prov => (
                                <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setCurrentPageParsed(1)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        Filter
                    </button>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-800">Tabel Penilaian Penghargaan</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Nama DLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Adipura</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Adiwiyata</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Proklim</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Proper</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Kalpataru</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedParsed.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-500">
                                            {parsedData.length === 0 
                                                ? 'Belum ada hasil penilaian. Silakan upload file excel penilaian.' 
                                                : 'Tidak ada data yang sesuai dengan filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedParsed.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-green-600 hover:underline cursor-pointer">
                                                {item.nama_dinas.replace('DLH ', '').replace('Dinas Lingkungan Hidup ', '')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Adipura_Skor !== null ? item.Adipura_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Adiwiyata_Skor !== null ? item.Adiwiyata_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Proklim_Skor !== null ? item.Proklim_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Proper_Skor !== null ? item.Proper_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Kalpataru_Skor !== null ? item.Kalpataru_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm font-bold text-gray-800">
                                                {item.Total_Skor?.toFixed(1) ?? '-'}
                                                
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tombol Finalisasi */}
                {penilaianPenghargaan && !penilaianPenghargaan.is_finalized && parsedData.length > 0 && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleFinalize}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Finalisasi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- KOMPONEN TAB VALIDASI 1 ---
function TabValidasi1() {
    const [provinsiList, setProvinsiList] = useState<Province[]>([]);
    const [submissions, setSubmissions] = useState<DinasSubmission[]>([]);
    const [parsedData, setParsedData] = useState<ParsedValidasi1[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFinalized, setIsFinalized] = useState(false);
    const [currentPageParsed, setCurrentPageParsed] = useState(1);
    
    // Filter independen untuk hasil validasi
    const [tipeFilterParsed, setTipeFilterParsed] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilterParsed, setProvinsiFilterParsed] = useState<string>('');
    const [statusFilterParsed, setStatusFilterParsed] = useState<'all' | 'lulus' | 'tidak_lulus'>('all');
    const [itemsPerPageParsed, setItemsPerPageParsed] = useState<number | 'all'>('all' as const);

    const year = new Date().getFullYear();

    // Fetch provinsi list on mount
    useEffect(() => {
        axios.get('/api/wilayah/provinces')
            .then(res => setProvinsiList(res.data?.data || []))
            .catch(console.error);
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [submissionRes, validasi1Res] = await Promise.all([
                axios.get(`/api/pusdatin/penilaian/submissions?year=${year}`),
                axios.get(`/api/pusdatin/penilaian/validasi-1/${year}`)
            ]);

            setSubmissions(submissionRes.data.data || []);
            
            const validasi1Data = validasi1Res.data;
            if (validasi1Data && validasi1Data.length > 0) {
                setParsedData(validasi1Data);
                // Check if finalized (all items have status finalized or check from parent)
                const anyFinalized = validasi1Data.some((item: ParsedValidasi1) => item.status === 'finalized');
                setIsFinalized(anyFinalized);
            }
        } catch (err: any) {
            console.error('Error fetching data:', err);
            if (err.response?.status === 404) {
                setParsedData([]);
            }
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter parsed data (filter independen)
    const filteredParsed = useMemo(() => {
        return parsedData.filter(item => {
            const submission = submissions.find(s => s.id_dinas === item.id_dinas);
            if (!submission) return provinsiFilterParsed === '' && tipeFilterParsed === 'all' && statusFilterParsed === 'all';
            const matchTipe = tipeFilterParsed === 'all' || submission.tipe === tipeFilterParsed;
            const matchProvinsi = !provinsiFilterParsed || submission.provinsi === provinsiFilterParsed;
            const matchStatus = statusFilterParsed === 'all' || item.status_result === statusFilterParsed;
            return matchTipe && matchProvinsi && matchStatus;
        });
    }, [parsedData, submissions, tipeFilterParsed, provinsiFilterParsed, statusFilterParsed]);

    // Pagination untuk parsed (independen)
    const paginatedParsed = useMemo(() => {
        if (itemsPerPageParsed === 'all') return filteredParsed;
        const perPage = typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10;
        const start = (currentPageParsed - 1) * perPage;
        return filteredParsed.slice(start, start + perPage);
    }, [filteredParsed, currentPageParsed, itemsPerPageParsed]);

    const totalPagesParsed = itemsPerPageParsed === 'all' ? 1 : Math.ceil(filteredParsed.length / (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10));

    // Stats
    const totalLulus = parsedData.filter(item => item.status_result === 'lulus').length;
    const totalTidakLulus = parsedData.filter(item => item.status_result === 'tidak_lulus').length;

    // Finalisasi
    const handleFinalize = async () => {
        if (!confirm('Apakah Anda yakin ingin memfinalisasi Validasi 1? Setelah difinalisasi, data tidak dapat diubah.')) return;

        try {
            await axios.patch(`/api/pusdatin/penilaian/validasi-1/${year}/finalize`);
            alert('Validasi 1 berhasil difinalisasi');
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            alert(err.response?.data?.message || 'Gagal memfinalisasi');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="w-56">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                    <select 
                        value={provinsiFilterParsed}
                        onChange={(e) => {
                            setProvinsiFilterParsed(e.target.value);
                            setCurrentPageParsed(1);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Semua Provinsi</option>
                        {provinsiList.map(prov => (
                            <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setCurrentPageParsed(1)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    Filter
                </button>
            </div>

            {/* Tabel Validasi 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Tabel Validasi 1</h3>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-green-600 text-2xl" />
                        <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Nama DLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai IKLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai Penghargaan</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai Total</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedParsed.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            {parsedData.length === 0 
                                                ? 'Belum ada data validasi. Pastikan Penilaian Penghargaan sudah difinalisasi.' 
                                                : 'Tidak ada data yang sesuai dengan filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedParsed.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-green-600 hover:underline cursor-pointer">
                                                {item.nama_dinas.replace('DLH ', '').replace('Dinas Lingkungan Hidup ', '')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Nilai_IKLH?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Nilai_Penghargaan?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Total_Skor?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    item.status_result === 'lulus' 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {item.status_result === 'lulus' ? 'Lolos' : 'Tidak Lolos'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tombol Finalisasi */}
            {!isFinalized && parsedData.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={handleFinalize}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        Finalisasi
                    </button>
                </div>
            )}
        </div>
    );
}

// --- KOMPONEN TAB VALIDASI 2 ---
function TabValidasi2() {
    const [provinsiList, setProvinsiList] = useState<Province[]>([]);
    const [submissions, setSubmissions] = useState<DinasSubmission[]>([]);
    const [parsedData, setParsedData] = useState<ParsedValidasi2[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFinalized, setIsFinalized] = useState(false);
    const [currentPageParsed, setCurrentPageParsed] = useState(1);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    
    // Filter independen untuk hasil validasi
    const [tipeFilterParsed, setTipeFilterParsed] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilterParsed, setProvinsiFilterParsed] = useState<string>('');
    const [statusFilterParsed, setStatusFilterParsed] = useState<'all' | 'lolos' | 'tidak_lolos' | 'pending'>('all');
    const [itemsPerPageParsed, setItemsPerPageParsed] = useState<number | 'all'>('all' as const);

    const year = new Date().getFullYear();

    // Fetch provinsi list on mount
    useEffect(() => {
        axios.get('/api/wilayah/provinces')
            .then(res => setProvinsiList(res.data?.data || []))
            .catch(console.error);
    }, []);

    // Fetch submissions
    useEffect(() => {
        axios.get(`/api/pusdatin/penilaian/submissions?year=${year}`)
            .then(res => setSubmissions(res.data.data || []))
            .catch(console.error);
    }, [year]);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/pusdatin/penilaian/validasi-2/${year}`);
            setParsedData(response.data || []);
            setIsFinalized(response.data.length > 0 && response.data[0]?.status === 'finalized');
        } catch (err: any) {
            if (err.response?.status !== 404) {
                console.error('Error fetching data:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter parsed data (filter independen)
    const filteredParsed = useMemo(() => {
        return parsedData.filter(item => {
            const submission = submissions.find(s => s.id_dinas === item.id_dinas);
            if (!submission) return provinsiFilterParsed === '' && tipeFilterParsed === 'all' && statusFilterParsed === 'all';
            const matchTipe = tipeFilterParsed === 'all' || submission.tipe === tipeFilterParsed;
            const matchProvinsi = !provinsiFilterParsed || submission.provinsi === provinsiFilterParsed;
            const matchStatus = statusFilterParsed === 'all' || item.status_validasi === statusFilterParsed;
            return matchTipe && matchProvinsi && matchStatus;
        });
    }, [parsedData, submissions, tipeFilterParsed, provinsiFilterParsed, statusFilterParsed]);

    // Pagination untuk parsed (independen)
    const paginatedParsed = useMemo(() => {
        if (itemsPerPageParsed === 'all') return filteredParsed;
        const perPage = typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10;
        const start = (currentPageParsed - 1) * perPage;
        return filteredParsed.slice(start, start + perPage);
    }, [filteredParsed, currentPageParsed, itemsPerPageParsed]);

    const totalPagesParsed = itemsPerPageParsed === 'all' ? 1 : Math.ceil(filteredParsed.length / (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10));

    // Stats
    const totalLolos = parsedData.filter(item => item.status_validasi === 'lolos').length;
    const totalTidakLolos = parsedData.filter(item => item.status_validasi === 'tidak_lolos').length;
    const totalPending = parsedData.filter(item => item.status_validasi === 'pending').length;

    // Handle checkbox change
    const handleCheckboxChange = async (id: number, field: 'Kriteria_WTP' | 'Kriteria_Kasus_Hukum', currentValue: boolean) => {
        if (isFinalized) {
            alert('Data sudah difinalisasi, tidak dapat diubah');
            return;
        }

        try {
            setUpdatingId(id);
            const item = parsedData.find(p => p.id === id);
            if (!item) return;

            const updatedData = {
                Kriteria_WTP: field === 'Kriteria_WTP' ? !currentValue : item.Kriteria_WTP,
                Kriteria_Kasus_Hukum: field === 'Kriteria_Kasus_Hukum' ? !currentValue : item.Kriteria_Kasus_Hukum
            };

            await axios.patch(`/api/pusdatin/penilaian/validasi-2/${id}/checklist`, updatedData);
            fetchData();
        } catch (err: any) {
            console.error('Error updating checklist:', err);
            alert(err.response?.data?.message || 'Gagal mengupdate checklist');
        } finally {
            setUpdatingId(null);
        }
    };

    // Finalisasi
    const handleFinalize = async () => {
        if (!confirm('Apakah Anda yakin ingin memfinalisasi Validasi 2? Setelah difinalisasi, data tidak dapat diubah.')) return;

        try {
            await axios.post(`/api/pusdatin/penilaian/validasi-2/${year}/finalize`);
            alert('Validasi 2 berhasil difinalisasi');
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            alert(err.response?.data?.message || 'Gagal memfinalisasi');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="w-56">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                    <select 
                        value={provinsiFilterParsed}
                        onChange={(e) => {
                            setProvinsiFilterParsed(e.target.value);
                            setCurrentPageParsed(1);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Semua Provinsi</option>
                        {provinsiList.map(prov => (
                            <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setCurrentPageParsed(1)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    Filter
                </button>
            </div>

            {/* Tabel Validasi 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Tabel Validasi 2</h3>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-green-600 text-2xl" />
                        <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Nama DLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Total Skor</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Dokumen WTP</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Tidak tersangkut kasus hukum</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedParsed.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            {parsedData.length === 0 
                                                ? 'Belum ada data validasi 2. Pastikan Validasi 1 sudah difinalisasi.' 
                                                : 'Tidak ada data yang sesuai dengan filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedParsed.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-green-600 hover:underline cursor-pointer">
                                                {item.nama_dinas.replace('DLH ', '').replace('Dinas Lingkungan Hidup ', '')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {Number(item.Total_Skor)?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.Kriteria_WTP}
                                                    onChange={() => handleCheckboxChange(item.id, 'Kriteria_WTP', item.Kriteria_WTP)}
                                                    disabled={isFinalized || updatingId === item.id}
                                                    className="w-5 h-5 text-green-600 cursor-pointer disabled:cursor-not-allowed rounded"
                                                />
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.Kriteria_Kasus_Hukum}
                                                    onChange={() => handleCheckboxChange(item.id, 'Kriteria_Kasus_Hukum', item.Kriteria_Kasus_Hukum)}
                                                    disabled={isFinalized || updatingId === item.id}
                                                    className="w-5 h-5 text-green-600 cursor-pointer disabled:cursor-not-allowed rounded"
                                                />
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    item.status_validasi === 'lolos' 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : item.status_validasi === 'tidak_lolos'
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {item.status_validasi === 'lolos' ? 'Lolos' : item.status_validasi === 'tidak_lolos' ? 'Tidak Lolos' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tombol Finalisasi */}
            {!isFinalized && parsedData.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={handleFinalize}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        Finalisasi
                    </button>
                </div>
            )}
        </div>
    );
}

// --- KOMPONEN TAB PENETAPAN PERINGKAT ---
function TabPenetapanPeringkat() {
    const [loading, setLoading] = useState(true);
    const [rankedData, setRankedData] = useState<RankedData[]>([]);
    const [selectedKategori, setSelectedKategori] = useState<string>('');
    const [selectedJenisPeringkat, setSelectedJenisPeringkat] = useState<string>('top5');
    const [topN, setTopN] = useState<number>(5);
    const [isCreatingWawancara, setIsCreatingWawancara] = useState(false);

    const year = new Date().getFullYear();

    const kategoriOptions = [
        { value: '', label: 'Pilih Jenis DLH' },
        { value: 'provinsi', label: 'Provinsi' },
        { value: 'kabupaten_besar', label: 'Kabupaten Besar' },
        { value: 'kabupaten_sedang', label: 'Kabupaten Sedang' },
        { value: 'kabupaten_kecil', label: 'Kabupaten Kecil' },
        { value: 'kota_besar', label: 'Kota Besar' },
        { value: 'kota_sedang', label: 'Kota Sedang' },
        { value: 'kota_kecil', label: 'Kota Kecil' },
    ];

    const jenisPeringkatOptions = [
        { value: 'top5', label: 'Top 5' },
        { value: 'top10', label: 'Top 10' },
        { value: 'all', label: 'Semua' },
    ];

    // Fetch ranked data
    const fetchRankedData = useCallback(async () => {
        if (!selectedKategori) {
            setRankedData([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`/api/pusdatin/penilaian/validasi-2/${year}/ranked`, {
                params: { kategori: selectedKategori, top: selectedJenisPeringkat === 'all' ? 999 : topN }
            });
            setRankedData(response.data.data || []);
        } catch (err: any) {
            if (err.response?.status !== 404) {
                console.error('Error fetching ranked data:', err);
            }
            setRankedData([]);
        } finally {
            setLoading(false);
        }
    }, [year, selectedKategori, selectedJenisPeringkat, topN]);

    useEffect(() => {
        fetchRankedData();
    }, [fetchRankedData]);

    // Update topN based on jenis peringkat
    useEffect(() => {
        if (selectedJenisPeringkat === 'top5') setTopN(5);
        else if (selectedJenisPeringkat === 'top10') setTopN(10);
    }, [selectedJenisPeringkat]);

    // Create wawancara (finalisasi ranking)
    const handleCreateWawancara = async () => {
        if (!confirm(`Apakah Anda yakin ingin memfinalisasi peringkat? Top ${topN} dari setiap kategori akan masuk ke tahap wawancara.`)) return;

        try {
            setIsCreatingWawancara(true);
            await axios.post(`/api/pusdatin/penilaian/validasi-2/${year}/create-wawancara`, {
                top: topN
            });
            alert('Penetapan peringkat berhasil difinalisasi. Data peserta wawancara telah dibuat.');
        } catch (err: any) {
            console.error('Error creating wawancara:', err);
            alert(err.response?.data?.message || 'Gagal membuat data wawancara');
        } finally {
            setIsCreatingWawancara(false);
        }
    };

    // Get medal emoji
    const getMedal = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    };

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="w-56">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Pembagian Daerah</label>
                    <select 
                        value={selectedKategori}
                        onChange={(e) => setSelectedKategori(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {kategoriOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="w-48">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Jenis Peringkat</label>
                    <select 
                        value={selectedJenisPeringkat}
                        onChange={(e) => setSelectedJenisPeringkat(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {jenisPeringkatOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={fetchRankedData}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    Filter
                </button>
            </div>

            {/* Tabel Peringkat */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Tabel Peringkat</h3>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-green-600 text-2xl" />
                        <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Rank</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Nama Daerah</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Jenis DLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai NT</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Kenaikan NT</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {!selectedKategori ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            Silakan pilih Jenis DLH terlebih dahulu
                                        </td>
                                    </tr>
                                ) : rankedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            Belum ada data peringkat untuk kategori ini
                                        </td>
                                    </tr>
                                ) : (
                                    rankedData.map((item) => (
                                        <tr key={item.id_dinas} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-800">
                                                <span className="inline-flex items-center gap-1">
                                                    {getMedal(item.peringkat)} {item.peringkat}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-green-600 hover:underline cursor-pointer">
                                                {item.nama_dinas.replace('DLH ', '').replace('Dinas Lingkungan Hidup ', '')}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                                                {item.kategori.replace(/_/g, ' ')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {Number(item.Total_Skor)?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-green-600">
                                                +{((Number(item.Total_Skor) || 0) * 0.05).toFixed(1)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {item.peringkat <= topN && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                                        Top {topN}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tombol Finalisasi */}
            {rankedData.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={handleCreateWawancara}
                        disabled={isCreatingWawancara}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isCreatingWawancara ? (
                            <>
                                <FaSpinner className="animate-spin" /> Memproses...
                            </>
                        ) : (
                            'Finalisasi'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

// --- KOMPONEN TAB WAWANCARA ---
function TabWawancara() {
    const [loading, setLoading] = useState(true);
    const [wawancaraData, setWawancaraData] = useState<WawancaraData[]>([]);
    const [selectedKategori, setSelectedKategori] = useState<string>('');
    const [selectedDinas, setSelectedDinas] = useState<number | null>(null);
    const [currentDinasData, setCurrentDinasData] = useState<WawancaraData | null>(null);
    const [isFinalized, setIsFinalized] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [rekapData, setRekapData] = useState<any>(null);
    const [loadingRekap, setLoadingRekap] = useState(false);
    const [inputValue, setInputValue] = useState<string>('');

    const year = new Date().getFullYear();

    const kategoriOptions = [
        { value: '', label: '-- Pilih Jenis DLH --' },
        { value: 'provinsi', label: 'Provinsi' },
        { value: 'kabupaten_besar', label: 'Kabupaten Besar' },
        { value: 'kabupaten_sedang', label: 'Kabupaten Sedang' },
        { value: 'kabupaten_kecil', label: 'Kabupaten Kecil' },
        { value: 'kota_besar', label: 'Kota Besar' },
        { value: 'kota_sedang', label: 'Kota Sedang' },
        { value: 'kota_kecil', label: 'Kota Kecil' },
    ];

    // Fetch wawancara data (all for dropdown)
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/pusdatin/penilaian/wawancara/${year}`);
            setWawancaraData(response.data.data || []);
            setIsFinalized(response.data.data?.[0]?.is_finalized || false);
        } catch (err: any) {
            if (err.response?.status !== 404) {
                console.error('Error fetching data:', err);
            }
            setWawancaraData([]);
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter dinas berdasarkan kategori
    const filteredDinasOptions = useMemo(() => {
        if (!selectedKategori) return [];
        return wawancaraData.filter(d => d.kategori === selectedKategori);
    }, [wawancaraData, selectedKategori]);

    // Update current dinas when selection changes
    useEffect(() => {
        if (selectedDinas) {
            const dinas = wawancaraData.find(d => d.id === selectedDinas);
            setCurrentDinasData(dinas || null);
            setInputValue(dinas?.nilai_wawancara?.toString() ?? '');
        } else {
            setCurrentDinasData(null);
            setInputValue('');
        }
    }, [selectedDinas, wawancaraData]);

    // Fetch rekap when dinas is selected
    const fetchRekap = useCallback(async (idDinas: number) => {
        try {
            setLoadingRekap(true);
            const response = await axios.get(`/api/pusdatin/penilaian/rekap/${year}/dinas/${idDinas}`);
            setRekapData(response.data.data);
        } catch (err: any) {
            console.error('Error fetching rekap:', err);
            setRekapData(null);
        } finally {
            setLoadingRekap(false);
        }
    }, [year]);

    // Fetch rekap when dinas changes
    useEffect(() => {
        if (currentDinasData) {
            fetchRekap(currentDinasData.id_dinas);
        } else {
            setRekapData(null);
        }
    }, [currentDinasData, fetchRekap]);

    // Calculate nilai NT Final (90% SLHD + 10% wawancara)
    const nilaiNTFinal = useMemo(() => {
        if (!rekapData || !currentDinasData) return null;
        // Use nilai_slhd as base (90%)
        const nilaiSLHD = rekapData.nilai_slhd || 0;
        const nilaiWawancara = currentDinasData.nilai_wawancara || 0;
        // Formula: 90% nilaiSLHD + 10% nilaiWawancara
        return (nilaiSLHD * 0.9) + (nilaiWawancara * 0.1);
    }, [rekapData, currentDinasData]);

    // Update nilai wawancara
    const handleUpdateNilai = async () => {
        if (!currentDinasData) return;
        if (isFinalized) {
            alert('Data sudah difinalisasi, tidak dapat diubah');
            return;
        }

        const nilaiNum = parseFloat(inputValue);
        if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
            alert('Nilai harus antara 0-100');
            setInputValue(currentDinasData.nilai_wawancara?.toString() ?? '');
            return;
        }

        try {
            setUpdatingId(currentDinasData.id);
            await axios.patch(`/api/pusdatin/penilaian/wawancara/${currentDinasData.id}/nilai`, {
                nilai_wawancara: nilaiNum
            });
            await fetchData();
        } catch (err: any) {
            console.error('Error updating nilai:', err);
            alert(err.response?.data?.message || 'Gagal mengupdate nilai');
            setInputValue(currentDinasData.nilai_wawancara?.toString() ?? '');
        } finally {
            setUpdatingId(null);
        }
    };

    // Finalisasi
    const handleFinalize = async () => {
        if (!confirm('Apakah Anda yakin ingin memfinalisasi hasil wawancara? Setelah difinalisasi, nilai akhir akan dihitung dan data tidak dapat diubah.')) return;

        try {
            await axios.patch(`/api/pusdatin/penilaian/wawancara/${year}/finalize`);
            alert('Hasil wawancara berhasil difinalisasi. Nilai akhir telah dihitung.');
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            alert(err.response?.data?.message || 'Gagal memfinalisasi');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* BAGIAN 1: HEADER */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Penilaian Wawancara & Perhitungan Nirwasita Tantra Final</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Atur Penilaian Nilai Nirwasita Tantra dari Dokumen-Dokumen Kab/Kota.
                    </p>
                </div>
            </div>

            {/* BAGIAN 2: CASCADING DROPDOWNS */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* Dropdown 1: Jenis DLH */}
                <div className="w-72">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Jenis DLH</label>
                    <select 
                        value={selectedKategori}
                        onChange={(e) => {
                            setSelectedKategori(e.target.value);
                            setSelectedDinas(null);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {kategoriOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Dropdown 2: Pilih Dinas (conditional) */}
                {selectedKategori && (
                    <div className="w-96">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Pilih Kab/Kota</label>
                        <select 
                            value={selectedDinas || ''}
                            onChange={(e) => setSelectedDinas(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">-- Pilih Kab/Kota --</option>
                            {filteredDinasOptions.map(dinas => (
                                <option key={dinas.id} value={dinas.id}>
                                    {dinas.nama_dinas}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* BAGIAN 3: FORM INPUT WAWANCARA - ALWAYS SHOW */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Penilaian Wawancara & Perhitungan Nirwasita Tantra Final</h3>
                </div>
                
                {/* Table Komponen Wawancara */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <table className="w-full">
                        <thead className="bg-green-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">KOMPONEN</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">BOBOT</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">SKOR(0-100)</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">SKOR AKHIR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-800">Komponen Wawancara</td>
                                <td className="py-3 px-4 text-center text-sm text-teal-600 font-medium">10%</td>
                                <td className="py-3 px-4 text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onBlur={handleUpdateNilai}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleUpdateNilai();
                                            }
                                        }}
                                        disabled={!currentDinasData || isFinalized || updatingId === currentDinasData?.id}
                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="/100"
                                    />
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-teal-600 font-medium">
                                    {currentDinasData?.nilai_wawancara 
                                        ? Number(currentDinasData.nilai_wawancara).toFixed(1) 
                                        : '0.0'}
                                </td>
                            </tr>
                            <tr className="bg-gray-50 font-bold">
                                <td colSpan={3} className="py-3 px-4 text-sm text-gray-800 text-right">Total Skor Akhir Wawancara:</td>
                                <td className="py-3 px-4 text-center text-sm text-teal-600 font-bold">
                                    {currentDinasData?.nilai_wawancara 
                                        ? Number(currentDinasData.nilai_wawancara).toFixed(1) 
                                        : '0.0'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BAGIAN 4: RINGKASAN NILAI AKHIR - ALWAYS SHOW */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Ringkasan Nilai Akhir</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Info Dinas */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600 w-32">Nama Daerah</div>
                            <div className="text-sm font-semibold text-gray-800">
                                {currentDinasData?.nama_dinas || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600 w-32">Jenis DLH</div>
                            <div className="text-sm font-semibold text-gray-800 capitalize">
                                {currentDinasData?.kategori?.replace(/_/g, ' ') || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600 w-32">Tahun Penilaian</div>
                            <div className="text-sm font-semibold text-gray-800">{year}</div>
                        </div>
                    </div>

                    {/* Right: Nilai NT Final */}
                    <div className="flex items-center justify-center">
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center w-64">
                            <div className="text-sm text-gray-600 mb-2">Nilai NT Final</div>
                            <div className="text-5xl font-bold text-green-600">
                                {nilaiNTFinal !== null ? nilaiNTFinal.toFixed(1) : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BAGIAN 5: RINCIAN SKOR PER TAHAP */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Rincian Skor per Tahap</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Penilaian SLHD */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Penilaian SLHD</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {loadingRekap ? '...' : (rekapData?.nilai_slhd ? Number(rekapData.nilai_slhd).toFixed(0) : '-')}
                        </div>
                    </div>

                    {/* Penilaian Penghargaan */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Penilaian Penghargaan</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {loadingRekap ? '...' : (rekapData?.nilai_penghargaan ? Number(rekapData.nilai_penghargaan).toFixed(0) : '-')}
                        </div>
                    </div>

                    {/* Validasi 1 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Validasi 1</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {loadingRekap ? '...' : (rekapData?.lolos_validasi1 ? 'Lolos' : 'Tidak Lolos')}
                        </div>
                    </div>

                    {/* Validasi 2 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Validasi 2</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {loadingRekap ? '...' : (rekapData?.lolos_validasi2 ? 'Lolos' : 'Tidak Lolos')}
                        </div>
                    </div>

                    {/* Wawancara */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Wawancara</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {currentDinasData?.nilai_wawancara ? Number(currentDinasData.nilai_wawancara).toFixed(0) : '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* BAGIAN 6: TOMBOL FINALISASI */}
            {!isFinalized && wawancaraData.length > 0 && currentDinasData && (
                <div className="flex justify-end">
                    <button
                        onClick={handleFinalize}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        Finalisasi Nilai Akhir
                    </button>
                </div>
            )}

            {isFinalized && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <span className="text-green-700 font-medium">🔒 Data sudah difinalisasi</span>
                </div>
            )}
        </div>
    );
}

// --- HALAMAN UTAMA ---
export default function PenilaianPage() {
    const [activeTab, setActiveTab] = useState('slhd');
    const [progressStats, setProgressStats] = useState<any>(null);
    const year = new Date().getFullYear();

    // Fetch progress statistics
    useEffect(() => {
        const fetchProgressStats = async () => {
            try {
                const res = await axios.get(`/api/pusdatin/penilaian/progress-stats?year=${year}`);
                setProgressStats(res.data.data);
            } catch (err) {
                console.error('Error fetching progress stats:', err);
            }
        };
        fetchProgressStats();
    }, [year]);

    // Generate dynamic progress data
    const progressData = useMemo(() => {
        if (!progressStats) {
            // Default loading state
            return [
                { stage: 'Tahap 1 (SLHD)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'slhd' },
                { stage: 'Tahap 2 (Penghargaan)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'penghargaan' },
                { stage: 'Tahap 3 (Validasi 1)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'validasi1' },
                { stage: 'Tahap 4 (Validasi 2)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'validasi2' },
                { stage: 'Tahap 5 (Wawancara)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'wawancara' },
            ];
        }

        const { slhd, penghargaan, validasi1, validasi2, wawancara, total_dlh } = progressStats;

        return [
            {
                stage: 'Tahap 1 (SLHD)',
                progress: total_dlh > 0 ? Math.round((slhd.finalized / total_dlh) * 100) : 0,
                detail: slhd.is_finalized 
                    ? `Difinalisasi - ${slhd.finalized}/${total_dlh} DLH`
                    : `Terbuka - ${slhd.finalized}/${total_dlh} DLH`,
                isCompleted: slhd.is_finalized,
                tabValue: 'slhd'
            },
            {
                stage: 'Tahap 2 (Penghargaan)',
                progress: penghargaan.is_finalized ? 100: 0,
                detail: slhd.is_finalized
                    ? (penghargaan.is_finalized 
                        ? `Difinalisasi - ${penghargaan.finalized} DLH Lulus`
                        : `Terbuka - ${penghargaan.finalized}/${total_dlh} DLH`)
                    : 'Menunggu SLHD',
                isCompleted: penghargaan.is_finalized,
                tabValue: 'penghargaan'
            },
            {
                stage: 'Tahap 3 (Validasi 1)',
                progress: validasi1.is_finalized ? 100 : 0,
                detail: penghargaan.is_finalized
                    ? (validasi1.is_finalized
                        ? `Difinalisasi - Lulus: ${validasi1.lolos}/${validasi1.processed} DLH`
                        : `memproses ${validasi1.processed} DLH`)
                    : 'Menunggu Penghargaan',
                isCompleted: validasi1.is_finalized,
                tabValue: 'validasi1'
            },
            {
                stage: 'Tahap 4 (Validasi 2)',
                progress: validasi2.is_finalized ? 100 : (validasi2.processed > 0 ? Math.round((validasi2.checked / validasi2.processed  ) * 100) : 0),
                detail: validasi1.is_finalized
                    ? (validasi2.is_finalized
                        ? `Difinalisasi - Lulus: ${validasi2.lolos}/${validasi2.processed} DLH`
                        : `memproses: ${validasi2.checked}/${validasi2.processed} DLH`)
                    : 'Menunggu Validasi 1',
                isCompleted: validasi2.is_finalized,
                tabValue: 'validasi2'
            },
            {
                stage: 'Tahap 5 (Wawancara)',
                progress: wawancara.is_finalized ? 100 : (wawancara.with_nilai > 0 ? Math.round((wawancara.with_nilai / validasi2.lolos) * 100) : 0),
                detail: validasi2.is_finalized
                    ? (wawancara.is_finalized
                        ? `Selesai - ${wawancara.processed} DLH Diproses`
                        : `memproses: ${wawancara.with_nilai}/${validasi2.lolos} DLH`)
                    : 'Menunggu Validasi 2',
                isCompleted: wawancara.is_finalized,
                tabValue: 'wawancara'
            },
        ];
    }, [progressStats]);

    // KONFIGURASI TAB NAVIGASI
    const tabs = [
        { label: 'Penilaian SLHD', value: 'slhd' },
        { label: 'Penilaian Penghargaan', value: 'penghargaan' },
        { label: 'Validasi 1', value: 'validasi1' },
        { label: 'Validasi 2', value: 'validasi2' },
        { label: 'Penetapan Peringkat', value: 'peringkat' },
        { label: 'Wawancara', value: 'wawancara' },
    ];

    // RENDER KONTEN DINAMIS BERDASARKAN TAB AKTIF
    const renderContent = () => {
        switch (activeTab) {
            case 'slhd':
                return <TabPenilaianSLHD />;
            case 'penghargaan':
                return <TabPenilaianPenghargaan />;
            case 'validasi1':
                return <TabValidasi1 />;
            case 'validasi2':
                return <TabValidasi2 />;
            case 'peringkat':
                return <TabPenetapanPeringkat />;
            case 'wawancara':
                return <TabWawancara />;
            default:
                return <TabPenilaianSLHD />;
        }
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'slhd': return 'SLHD';
            case 'penghargaan': return 'Penghargaan';
            case 'validasi1': return 'Validasi 1';
            case 'validasi2': return 'Validasi 2';
            case 'peringkat': return 'Penetapan Peringkat';
            case 'wawancara': return 'Wawancara';
            default: return 'SLHD';
        }
    };

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            
            {/* BREADCRUMB */}
            <div className="flex items-center text-sm text-gray-500">
                <span className="text-green-600 cursor-pointer hover:underline">Penilaian</span>
                <span className="mx-2">&gt;</span>
                <span className="font-medium text-gray-700">Penilaian Kab/Kota</span>
            </div>

            {/* HEADER UTAMA */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Penilaian Nirwasita Tantra Kab/Kota
                </h1>
                <p className="text-sm text-gray-500">
                    Atur Penilaian Nilai Nirwasita Tantra dari Dokumen-Dokumen Kab/Kota.
                </p>
            </div>

            {/* PROGRESS CARDS - Ringkasan Progres */}
            <div>
                <h2 className="text-base font-bold text-gray-800 mb-4">Ringkasan Progres</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {progressData.map((item, index) => (
                        <div 
                            key={index}
                            onClick={() => setActiveTab(item.tabValue)}
                            className="cursor-pointer"
                        >
                            <ProgressCard
                                stage={item.stage}
                                progress={item.progress}
                                detail={item.detail}
                                isCompleted={item.isCompleted}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* DETAIL PENILAIAN & NAVIGASI */}
            <div>
                <h2 className="text-base font-bold text-gray-800 mb-4">Detail Penilaian</h2>
                
                <InnerNav 
                    tabs={tabs} 
                    activeTab={activeTab} 
                    onChange={setActiveTab} 
                    activeColor="green"
                    className="mb-6"
                />

                {renderContent()}
            </div>
        </div>
    );
}
