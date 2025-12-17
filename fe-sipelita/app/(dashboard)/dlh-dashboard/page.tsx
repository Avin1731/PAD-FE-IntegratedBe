"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

// --- TYPES ---
interface DashboardData {
    year: number;
    dinas: {
        id: number;
        nama: string;
        region: string;
        type: 'provinsi' | 'kabupaten/kota';
        has_pesisir: boolean;
    };
    stats: {
        total_dokumen: number;
        total_required: number;
        percentage: number;
        submission_finalized: boolean;
        dokumen: {
            nama: string;
            status: string;
            uploaded: boolean;
            count?: number;
            total_required?: number;
            finalized_count?: number;
            updated_at?: string;
        }[];
    };
    deadline: {
        deadline_at: string;
        deadline_formatted: string;
        is_passed: boolean;
        days_remaining: number;
        catatan: string | null;
    } | null;
    tahapan: {
        tahap_aktif: string;
        pengumuman_terbuka: boolean;
        keterangan: string;
    };
    timeline: {
        tahap: string;
        nama: string;
        status: 'completed' | 'active' | 'pending';
        keterangan: string;
    }[];
    rekap: {
        nilai_slhd: number | null;
        lolos_slhd: boolean | null;
        nilai_penghargaan: number | null;
        masuk_penghargaan: boolean | null;
        nilai_iklh: number | null;
        total_skor_validasi1: number | null;
        lolos_validasi1: boolean | null;
        lolos_validasi2: boolean | null;
        kriteria_wtp: boolean | null;
        kriteria_kasus_hukum: boolean | null;
        nilai_wawancara: number | null;
        lolos_wawancara: boolean | null;
        total_skor_final: number | null;
        peringkat_final: number | null;
        peringkat: number | null;
        status_akhir: string | null;
    } | null;
}

// --- ICONS ---
const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const RefreshIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

// --- STAT CARD ---
function StatCard({ 
    title, 
    value, 
    subtitle,
    icon,
    variant = 'default' 
}: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const variants = {
        default: 'bg-gray-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        danger: 'bg-red-50 border-red-200 text-red-800',
    };

    return (
        <div className={`border rounded-xl p-5 ${variants[variant]} transition-all hover:shadow-md`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                    {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
                </div>
                {icon && <div className="opacity-50">{icon}</div>}
            </div>
        </div>
    );
}

// --- TIMELINE HORIZONTAL ---
function TimelineHorizontal({ items }: { items: DashboardData['timeline'] }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg text-gray-800 mb-6">Timeline Proses Penilaian</h3>
            <div className="relative">
                {/* Line connector */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" />
                
                <div className="flex justify-between items-start relative">
                    {items.map((item, index) => {
                        let iconBg = "bg-gray-100 border-2 border-gray-300 text-gray-400";
                        let iconContent: React.ReactNode = <ClockIcon />;

                        if (item.status === 'completed') {
                            iconBg = "bg-green-100 border-2 border-green-500 text-green-600";
                            iconContent = <CheckIcon />;
                        } else if (item.status === 'active') {
                            iconBg = "bg-yellow-100 border-2 border-yellow-500 text-yellow-600";
                            iconContent = <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />;
                        }

                        return (
                            <div key={index} className="flex flex-col items-center z-10" style={{ width: `${100 / items.length}%` }}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
                                    {iconContent}
                                </div>
                                <div className="mt-3 text-center px-1">
                                    <p className={`text-xs font-semibold ${
                                        item.status === 'active' ? 'text-yellow-700' : 
                                        item.status === 'completed' ? 'text-green-700' : 'text-gray-600'
                                    }`}>
                                        {item.nama}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{item.keterangan}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// --- DOKUMEN STATUS CARDS ---
function DokumenStatusCards({ dokumen, submissionFinalized }: { 
    dokumen: DashboardData['stats']['dokumen'];
    submissionFinalized: boolean;
}) {
    const getStatusBadge = (status: string, uploaded: boolean) => {
        if (!uploaded) {
            return (
                <span className="flex items-center text-sm font-medium text-gray-500">
                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Belum Diunggah
                </span>
            );
        }
        
        const badges: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
            draft: {
                bg: 'text-yellow-600',
                icon: <svg className="w-4 h-4 mr-1.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
                label: 'Draft'
            },
            finalized: {
                bg: 'text-blue-600',
                icon: <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
                label: 'Terkirim'
            },
            approved: {
                bg: 'text-green-600',
                icon: <svg className="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
                label: 'Disetujui'
            },
            rejected: {
                bg: 'text-red-600',
                icon: <svg className="w-4 h-4 mr-1.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
                label: 'Ditolak'
            },
        };
        
        const badge = badges[status] || badges.draft;
        return (
            <span className={`flex items-center text-sm font-medium ${badge.bg}`}>
                {badge.icon}
                {badge.label}
            </span>
        );
    };

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Status Dokumen</h3>
                {submissionFinalized && (
                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                        Submission Terfinalisasi
                    </span>
                )}
            </div>
            <div className="p-4 space-y-3">
                {dokumen.map((doc, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                doc.uploaded ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                            }`}>
                                <DocumentIcon />
                            </div>
                            <div className="ml-3">
                                <h4 className="font-semibold text-gray-800">{doc.nama}</h4>
                                <p className="text-xs text-gray-500">
                                    {doc.total_required !== undefined 
                                        ? `${doc.count}/${doc.total_required} tabel sudah diupload`
                                        : doc.updated_at ? `Diperbarui: ${formatDate(doc.updated_at)}` : 'Belum ada dokumen'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {getStatusBadge(doc.status, doc.uploaded)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- DEADLINE CARD ---
function DeadlineCard({ deadline }: { deadline: DashboardData['deadline'] }) {
    if (!deadline) {
        return (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon />
                    <h3 className="font-bold text-gray-800">Deadline Submission</h3>
                </div>
                <p className="text-gray-500 text-sm">Belum ada deadline yang ditetapkan</p>
            </div>
        );
    }

    const variant = deadline.is_passed ? 'danger' : deadline.days_remaining <= 7 ? 'warning' : 'success';
    const bgColors = {
        success: 'bg-green-50 border-green-200',
        warning: 'bg-yellow-50 border-yellow-200',
        danger: 'bg-red-50 border-red-200',
    };

    return (
        <div className={`rounded-xl p-5 border ${bgColors[variant]}`}>
            <div className="flex items-center gap-3 mb-3">
                <CalendarIcon />
                <h3 className="font-bold text-gray-800">Deadline Submission</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{deadline.deadline_formatted}</p>
            {!deadline.is_passed ? (
                <p className={`text-sm mt-1 ${variant === 'warning' ? 'text-yellow-700' : 'text-green-700'}`}>
                    {deadline.days_remaining} hari lagi
                </p>
            ) : (
                <p className="text-sm mt-1 text-red-700 font-medium">Deadline telah terlewat</p>
            )}
            {deadline.catatan && (
                <p className="text-xs text-gray-600 mt-2 italic">{deadline.catatan}</p>
            )}
        </div>
    );
}

// --- TAHAPAN INFO ---
function TahapanInfo({ tahapan }: { tahapan: DashboardData['tahapan'] }) {
    const tahapNames: Record<string, string> = {
        submission: 'Upload Dokumen',
        penilaian_slhd: 'Penilaian SLHD',
        penilaian_penghargaan: 'Penilaian Penghargaan',
        validasi_1: 'Validasi 1',
        validasi_2: 'Validasi 2',
        wawancara: 'Wawancara',
        selesai: 'Selesai',
    };

    return (
        <div className=" rounded-xl p-5 border border-green-700">
            <h3 className="font-bold text-gray-800 mb-2">Tahap Aktif Saat Ini</h3>
            <p className="text-xl font-bold text-blue-800">{tahapNames[tahapan.tahap_aktif] || tahapan.tahap_aktif}</p>
            <p className="text-sm text-gray-600 mt-1">{tahapan.keterangan}</p>
            {tahapan.pengumuman_terbuka && (
                <div className="mt-3 flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Pengumuman Tersedia</span>
                </div>
            )}
        </div>
    );
}

// --- MAIN PAGE ---
export default function DLHDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Check role and redirect if not DLH
    useEffect(() => {
        if (user) {
            const role = user.role?.name?.toLowerCase();
            console.log('🔍 DLH Dashboard role check:', role);
            
            // Redirect to correct dashboard based on role
            if (role === 'admin') {
                router.push('/admin-dashboard');
                return;
            } else if (role === 'pusdatin') {
                router.push('/pusdatin-dashboard');
                return;
            }
            // provinsi and kabupaten/kota are valid for DLH dashboard
        }
    }, [user, router]);

    useEffect(() => {
        const fetchDashboard = async () => {
            // Only fetch if user has correct role
            const role = user?.role?.name?.toLowerCase();
            if (role !== 'provinsi' && role !== 'kabupaten/kota') {
                return; // Don't fetch, will redirect
            }
            
            try {
                setLoading(true);
                const response = await axios.get('/api/dinas/dashboard');
                setData(response.data);
                setLastUpdated(new Date());
                setError(null);
            } catch (err: unknown) {
                console.error('Failed to fetch dashboard:', err);
                const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data dashboard';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboard();
        }
    }, [user]);

    // Auto-refresh setiap 30 detik
    useEffect(() => {
        const role = user?.role?.name?.toLowerCase();
        if (role !== 'provinsi' && role !== 'kabupaten/kota') {
            return;
        }

        const intervalId = setInterval(async () => {
            try {
                console.log('🔄 Auto-refreshing dashboard data...');
                const response = await axios.get('/api/dinas/dashboard');
                setData(response.data);
                setLastUpdated(new Date());
            } catch (err) {
                console.error('Auto-refresh failed:', err);
            }
        }, 30000); // 30 detik

        return () => clearInterval(intervalId);
    }, [user]);

    // Manual refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            console.log('🔄 Manual refresh triggered...');
            const response = await axios.get('/api/dinas/dashboard');
            setData(response.data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err: unknown) {
            console.error('Manual refresh failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data dashboard';
            setError(errorMessage);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Memuat data dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // Format last updated time
    const formatLastUpdated = (date: Date) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
        
        if (diff < 60) return `${diff} detik yang lalu`;
        if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6 p-2">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Selamat Datang, {data.dinas.nama}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {data.dinas.region} • {data.dinas.type === 'provinsi' ? 'Provinsi' : 'Kabupaten/Kota'}
                        {data.dinas.has_pesisir && ' • Memiliki Pesisir'}
                    </p>
                    {lastUpdated && (
                        <p className="text-xs text-gray-400 mt-1">
                            Terakhir diperbarui: {formatLastUpdated(lastUpdated)}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        isRefreshing 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                    }`}
                >
                    <RefreshIcon />
                    <span className="font-medium">{isRefreshing ? 'Memperbarui...' : 'Refresh'}</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Dokumen Terunggah"
                    value={`${data.stats.total_dokumen}/${data.stats.total_required}`}
                    subtitle={`${data.stats.percentage}% lengkap`}
                    icon={<DocumentIcon />}
                    variant={data.stats.percentage === 100 ? 'success' : 'default'}
                />
                <StatCard
                    title="Nilai SLHD"
                    value={data.rekap?.nilai_slhd != null ? Number(data.rekap.nilai_slhd).toFixed(2) : '-'}
                    subtitle={data.rekap?.lolos_slhd ? 'Lolos' : data.rekap?.lolos_slhd === false ? 'Tidak Lolos' : 'Menunggu penilaian'}
                    variant={data.rekap?.lolos_slhd ? 'success' : data.rekap?.lolos_slhd === false ? 'danger' : 'default'}
                />
                <StatCard
                    title="Jenis Daerah"
                    value={data.dinas.has_pesisir ? 'Pesisir' : 'Daratan'}
                    subtitle={data.dinas.type === 'provinsi' ? 'Provinsi' : 'Kabupaten/Kota'}
                />
                {/* <StatCard
                    title="Tahun Penilaian"
                    value={data.year}
                    subtitle="Periode aktif"
                /> */}
                 <TahapanInfo tahapan={data.tahapan} />
                  {/* <DeadlineCard deadline={data.deadline} /> */}
            </div>
            <TimelineHorizontal items={data.timeline} />

            {/* Hasil Penilaian Section */}
            {data.rekap && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Hasil Penilaian</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {/* Nilai SLHD */}
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Nilai SLHD</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {data.rekap.nilai_slhd != null ? Number(data.rekap.nilai_slhd).toFixed(0) : '-'}
                            </div>
                            <div className={`text-xs mt-1 ${
                                data.tahapan.tahap_aktif === 'penilaian_slhd' ? 'text-blue-600' :
                                data.rekap.lolos_slhd ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {data.tahapan.tahap_aktif === 'penilaian_slhd' ? '⏳ Proses' :
                                 data.rekap.lolos_slhd ? '✓ Lolos' : '✗ Tidak Lolos'}
                            </div>
                        </div>

                        {/* Nilai Penghargaan */}
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Penghargaan</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {data.rekap.nilai_penghargaan != null ? Number(data.rekap.nilai_penghargaan).toFixed(0) : '0'}
                            </div>
                            <div className={`text-xs mt-1 ${
                                data.tahapan.tahap_aktif === 'penilaian_penghargaan' ? 'text-blue-600' :
                                data.rekap.masuk_penghargaan ? 'text-green-600' : 
                                data.rekap.masuk_penghargaan === false ? 'text-red-600' : 'text-gray-400'
                            }`}>
                                {data.tahapan.tahap_aktif === 'penilaian_penghargaan' ? '⏳ Proses' :
                                 data.rekap.masuk_penghargaan ? '✓ Masuk' : 
                                 data.rekap.masuk_penghargaan === false ? '✗ Tidak Masuk' : '-'}
                            </div>
                        </div>

                        {/* Validasi 1 */}
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Validasi 1</div>
                            <div className={`text-xl font-bold ${
                                data.tahapan.tahap_aktif === 'validasi1' ? 'text-blue-600' :
                                data.rekap.lolos_validasi1 ? 'text-green-600' : 
                                data.rekap.lolos_validasi1 === false ? 'text-red-600' : 'text-gray-800'
                            }`}>
                                {data.tahapan.tahap_aktif === 'validasi1' ? '⏳ Proses' :
                                 data.rekap.lolos_validasi1 ? '✓ Lolos' : 
                                 data.rekap.lolos_validasi1 === false && data.tahapan.tahap_aktif == 'validasi2'? '✗ Tidak Lolos' : '-'}
                            </div>
                            <div className="text-xs mt-1 text-gray-400">
                                {data.rekap.total_skor_validasi1 != null ? `Skor: ${Number(data.rekap.total_skor_validasi1).toFixed(1)}` : 'belum dimulai'}
                            </div>
                        </div>

                        {/* Validasi 2 */}
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Validasi 2</div>
                            <div className={`text-xl font-bold ${
                                data.tahapan.tahap_aktif === 'validasi2' ? 'text-blue-600' :
                                data.rekap.lolos_validasi2 ? 'text-green-600' : 
                                data.rekap.lolos_validasi2 === false ? 'text-red-600' : 'text-gray-800'
                            }`}>
                                {data.tahapan.tahap_aktif === 'validasi2' ? '⏳ Proses' :
                                 data.rekap.lolos_validasi2 ? '✓ Lolos' : 
                                 data.rekap.lolos_validasi2 === false && data.tahapan.tahap_aktif =='wawancara'? '✗ Tidak Lolos' : '-'}
                            </div>
                            <div className="text-xs mt-1 text-gray-400">
                                {data.rekap.peringkat != null ? `Peringkat: ${data.rekap.peringkat}` : 'belum dimulai'}
                            </div>
                        </div>

                        {/* Wawancara */}
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Wawancara</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {data.rekap.nilai_wawancara != null ? Number(data.rekap.nilai_wawancara).toFixed(0) : '0'}
                            </div>
                            <div className={`text-xs mt-1 ${
                                data.tahapan.tahap_aktif === 'wawancara' ? 'text-blue-600' :
                                data.rekap.lolos_wawancara ? 'text-green-600' : 'text-gray-400'
                            }`}>
                                {data.tahapan.tahap_aktif === 'wawancara' ? '⏳ Proses' :
                                 data.rekap.lolos_wawancara ? '✓ Selesai' : 'Belum'}
                            </div>
                        </div>

                        {/* Skor Final */}
                        <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                            <div className="text-xs text-green-600 mb-1">Skor Final</div>
                            <div className="text-2xl font-bold text-green-600">
                                {data.rekap.total_skor_final != null ? Number(data.rekap.total_skor_final).toFixed(1) : '0'}
                            </div>
                            <div className="text-xs mt-1 text-green-600">
                                {data.rekap.peringkat_final != null ? `Peringkat: #${data.rekap.peringkat_final}` : '-'}
                            </div>
                        </div>

                        {/* Status Akhir */}
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Status</div>
                            <div className={`text-sm font-bold ${
                                (() => {
                                    // Mapping tahap_aktif dengan status_akhir
                                    const tahap = data.tahapan.tahap_aktif;
                                    const status = data.rekap.status_akhir;
                                    
                                    // Jika masih dalam proses tahap tertentu, tampilkan biru
                                    if (['penilaian_slhd', 'penilaian_penghargaan', 'validasi1', 'validasi2', 'wawancara'].includes(tahap)) {
                                        return 'text-blue-600';
                                    }
                                    
                                    // Jika sudah selesai
                                    if (status === 'lolos_final') return 'text-green-600';
                                    if (status?.startsWith('tidak')) return 'text-red-600';
                                    
                                    return 'text-gray-800';
                                })()
                            }`}>
                                {(() => {
                                    const tahap = data.tahapan.tahap_aktif;
                                    const status = data.rekap.status_akhir;
                                    
                                    // Mapping status berdasarkan tahap aktif
                                    if (tahap === 'penilaian_slhd') return '⏳ Penilaian SLHD';
                                    if (tahap === 'penilaian_penghargaan') return '⏳ Penilaian Penghargaan';
                                    if (tahap === 'validasi1') return '⏳ Validasi Tahap 1';
                                    if (tahap === 'validasi2') return '⏳ Validasi Tahap 2';
                                    if (tahap === 'wawancara') return '⏳ Wawancara';
                                    
                                    // Jika sudah selesai semua tahap, tampilkan status final
                                    if (status === 'lolos_final') return '🏆 Lolos Final';
                                    if (status === 'tidak_lolos_slhd') return '✗ Tidak Lolos SLHD';
                                    if (status === 'tidak_masuk_penghargaan') return '✗ Tidak Masuk Penghargaan';
                                    if (status === 'tidak_lolos_validasi1') return '✗ Tidak Lolos Validasi 1';
                                    if (status === 'tidak_lolos_validasi2') return '✗ Tidak Lolos Validasi 2';
                                    
                                    return 'Menunggu';
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline */}
            

            {/* Grid: Dokumen Status + Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <DokumenStatusCards 
                        dokumen={data.stats.dokumen} 
                        submissionFinalized={data.stats.submission_finalized}
                    />
                </div>
                <div className="space-y-4">
                    <DeadlineCard deadline={data.deadline} />
                    {/* <TahapanInfo tahapan={data.tahapan} /> */}
                </div>
            </div>
        </div>
    );
}
