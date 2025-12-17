"use client";

import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';

// --- Kumpulan Ikon ---
const IconKajian = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconHayati = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343m11.314 11.314a8 8 0 00-11.314-11.314m11.314 11.314L6.343 7.343" /></svg>;
const IconKualitasAir = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V6m0 0L3 10m4-4l4 4m-4-4L3 10m4-4l4 4m0 0L7 6m4 4v10m0 0L7 16m4 4l4-4m-4 4v-4m0 0l4-4m-4 4l-4-4" /></svg>;
const IconLaut = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8l4 4 4-4 4 4 4-4" /></svg>;
const IconKualitasUdara = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" /></svg>;
const IconLahan = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18" /></svg>;
const IconSampah = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconIklim = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3M9 9l4 4m0 0l4-4m-4 4V3" /></svg>;
const IconBencana = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconLab = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const IconD3TLH = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconKLHS = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconIsu = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const UploadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// --- Interfaces ---
interface MatraCategory {
    id: string;
    nama: string;
    icon: ReactNode;
    jumlah_tabel: number;
    jumlah_upload: number;
    jumlah_finalized: number;
}

interface CategoryCardProps {
    category: MatraCategory;
    href: string;
}

// Mapping nama matra ke ID yang URL-friendly
const MATRA_ID_MAP: Record<string, string> = {
    'Keanekaragaman Hayati': 'keanekaragaman-hayati',
    'Kualitas Air': 'kualitas-air',
    'Laut, Pesisir, dan Pantai': 'laut-pesisir-pantai',
    'Kualitas Udara': 'kualitas-udara',
    'Lahan dan Hutan': 'lahan-hutan',
    'Pengelolaan Sampah dan Limbah': 'sampah-limbah',
    'Perubahan Iklim': 'perubahan-iklim',
    'Risiko Bencana': 'risiko-bencana',
    'Dokumen Non Matra': 'non-matra',
};

// Mapping nama matra ke icon
const MATRA_ICON_MAP: Record<string, ReactNode> = {
    'Keanekaragaman Hayati': <IconHayati />,
    'Kualitas Air': <IconKualitasAir />,
    'Laut, Pesisir, dan Pantai': <IconLaut />,
    'Kualitas Udara': <IconKualitasUdara />,
    'Lahan dan Hutan': <IconLahan />,
    'Pengelolaan Sampah dan Limbah': <IconSampah />,
    'Perubahan Iklim': <IconIklim />,
    'Risiko Bencana': <IconBencana />,
    'Dokumen Non Matra': <IconIsu />,
};

const CategoryCard = ({ category, href }: CategoryCardProps) => {
    const percentage = category.jumlah_tabel > 0 
        ? (category.jumlah_upload / category.jumlah_tabel) * 100 
        : 0;
    
    // Tentukan status berdasarkan jumlah upload
    let status = 'Belum Ada';
    let statusColor = 'text-gray-500';
    
    if (category.jumlah_upload === category.jumlah_tabel && category.jumlah_tabel > 0) {
        if (category.jumlah_finalized === category.jumlah_tabel) {
            status = 'Selesai';
            statusColor = 'text-green-600';
        } else {
            status = 'Draft Lengkap';
            statusColor = 'text-blue-600';
        }
    } else if (category.jumlah_upload > 0) {
        status = 'Pending';
        statusColor = 'text-yellow-600';
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                    <span className="bg-green-100 p-2 rounded-lg">{category.icon}</span>
                    <div className="text-right">
                        <span className={`text-xs font-semibold ${statusColor}`}>{status}</span>
                        <p className={`text-xs ${statusColor}`}>
                            {category.jumlah_upload}/{category.jumlah_tabel} Tabel
                        </p>
                    </div>
                </div>
                <h3 className="font-semibold text-gray-800 mt-4 h-12 flex items-center">{category.nama}</h3>
                <p className="text-xs text-gray-400 mt-2">
                    {category.jumlah_finalized > 0 
                        ? `${category.jumlah_finalized} tabel sudah finalisasi`
                        : 'Silahkan upload dokumen untuk kategori ini'}
                </p>
            </div>
            
            <div className="p-4 pt-0">
                <Link 
                    href={href} 
                    className="w-full flex items-center justify-center bg-green-500 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                    <UploadIcon />
                    Kelola Data
                </Link>
            </div>

            {/* Progress Bar di bagian paling bawah */}
            <div className="w-full bg-gray-200 h-1.5">
                <div 
                    className={`h-1.5 transition-all duration-500 ease-out ${
                        percentage === 100 ? 'bg-green-500' : percentage > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                    style={{ width: `${percentage}%` }} 
                ></div>
            </div>
        </div>
    );
};

export default function SLHDTabelUtamaPage() {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<MatraCategory[]>([]);
    const [totalStats, setTotalStats] = useState({ total: 80, uploaded: 0, finalized: 0 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch matra list
            const matraResponse = await axios.get('/api/dinas/template/matra');
            const matraList = matraResponse.data?.data || [];

            // Fetch status tabel utama untuk mendapatkan jumlah yang sudah diupload
            let uploadStatusMap: Record<string, { uploaded: number; finalized: number }> = {};
            let summaryStats = { total: 80, uploaded: 0, finalized: 0 };
            
            try {
                const statusResponse = await axios.get('/api/dinas/upload/tabel-utama/status');
                const statusData = statusResponse.data?.data || [];
                summaryStats = statusResponse.data?.summary || summaryStats;
                
                // Convert array to map keyed by matra name
                statusData.forEach((item: any) => {
                    uploadStatusMap[item.matra] = {
                        uploaded: item.uploaded || 0,
                        finalized: item.finalized || 0,
                    };
                });
            } catch {
                // Endpoint belum ada, gunakan default
                console.log('Tabel utama status endpoint not available');
            }

            // Map data ke format yang dibutuhkan
            const mappedCategories: MatraCategory[] = matraList.map((matra: any) => {
                const id = MATRA_ID_MAP[matra.nama_matra] || matra.nama_matra.toLowerCase().replace(/\s+/g, '-');
                const statusData = uploadStatusMap[matra.nama_matra] || { uploaded: 0, finalized: 0 };
                
                return {
                    id,
                    nama: matra.nama_matra,
                    icon: MATRA_ICON_MAP[matra.nama_matra] || <IconKajian />,
                    jumlah_tabel: matra.jumlah_tabel,
                    jumlah_upload: statusData.uploaded,
                    jumlah_finalized: statusData.finalized,
                };
            });

            setCategories(mappedCategories);
            setTotalStats(summaryStats);

        } catch (error) {
            console.error('Error fetching matra data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Panel Penerimaan Data</h1>
                <p className="text-gray-500 mb-8">Unggah Dokumen SLHD Tabel Utama</p>
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-500">Memuat data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Panel Penerimaan Data</h1>
                    <p className="text-gray-500">Unggah Dokumen SLHD Tabel Utama</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Total Progress</p>
                    <p className="text-2xl font-bold text-green-600">
                        {totalStats.uploaded}/{totalStats.total} Tabel
                    </p>
                    <p className="text-xs text-gray-400">
                        {totalStats.finalized} sudah finalisasi
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"> */}
                {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Tabel</p>
                    <p className="text-3xl font-bold text-blue-800">{totalStats.total}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-600 font-medium">Sudah Upload</p>
                    <p className="text-3xl font-bold text-yellow-800">{totalStats.uploaded}</p>
                </div> */}
                {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Sudah Finalisasi</p>
                    <p className="text-3xl font-bold text-green-800">{totalStats.finalized}</p>
                </div> */}
            {/* </div> */}

            {/* Layout 3x4 menggunakan lg:grid-cols-3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <CategoryCard 
                        key={cat.id} 
                        category={cat}
                        href={`/dlh-dashboard/pengiriman-data/slhd-tabel-utama/${cat.id}`}
                    />
                ))}
            </div>
        </div>
    );
}