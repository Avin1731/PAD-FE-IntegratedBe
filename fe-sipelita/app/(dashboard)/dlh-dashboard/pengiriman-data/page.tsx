"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';

// --- Ikon-ikon ---
const DocumentIcon = () => ( <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"> <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> </div> );
const UploadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DownloadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CheckCircleIcon = () => <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XCircleIcon = () => <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

interface UploadItemProps {
    title: string;
    description: string;
    hideDownload?: boolean;
    href?: string | null;
    statusBadge?: React.ReactNode;
}

interface StatusBadgeProps {
    status: string;
}

interface DocumentStatus {
    jenis: string;
    uploaded: boolean;
    tanggal: string | null;
    status: string;
    href: string;
}

// Tipe data untuk respons API
interface IKLHData {
    id: number;
    status: string;
    updated_at: string;
}

interface SLHDDocument {
    id: number;
    status: string;
    updated_at: string;
    original_filename?: string;
}

const UploadItem = ({ title, description, hideDownload = false, href = null, statusBadge }: UploadItemProps) => {
    const isLink = !!href;
    const buttonClasses = "flex items-center bg-green-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-600";

    return (
        <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between border border-gray-200">
            <div className="flex items-center">
                <DocumentIcon />
                <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                    {statusBadge && <div className="mt-1">{statusBadge}</div>}
                </div>
            </div>
            <div className="flex space-x-3">
                {!hideDownload && (
                    <button className="flex items-center bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 border border-gray-300">
                        <DownloadIcon />
                        Unduh Template
                    </button>
                )}
                {isLink ? (
                    <Link href={href} className={buttonClasses}>
                        <UploadIcon />
                        Unggah / Lihat
                    </Link>
                ) : (
                    <button onClick={() => alert('Fungsi unggah belum dibuat')} className={buttonClasses}>
                        <UploadIcon />
                        Unggah
                    </button>
                )}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
    // Status bisa berupa: draft, uploaded, finalized, approved, rejected, atau empty string
    if (status === 'uploaded' || status === 'draft') {
        return ( <span className="flex items-center text-sm font-medium text-yellow-600"> <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg> Draft </span> );
    }
    if (status === 'finalized') {
        return ( <span className="flex items-center text-sm font-medium text-blue-600"> <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Terkirim </span> );
    }
    if (status === 'approved') {
        return ( <span className="flex items-center text-sm font-medium text-green-600"> <CheckCircleIcon /> Disetujui </span> );
    }
    if (status === 'rejected') {
        return ( <span className="flex items-center text-sm font-medium text-red-600"> <XCircleIcon /> Ditolak </span> );
    }
    // Default: belum diunggah (status kosong atau tidak dikenali)
    return <span className="flex items-center text-sm font-medium text-gray-500"> <XCircleIcon /> Belum Diunggah </span>;
};

// Helper function untuk format tanggal
const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Helper function untuk format status display
const formatStatusDisplay = (status: string): string => {
    switch (status) {
        case 'draft':
        case 'uploaded':
            return 'Draft';
        case 'finalized':
            return 'Terkirim';
        case 'approved':
            return 'Disetujui';
        case 'rejected':
            return 'Ditolak';
        default:
            return '-';
    }
};

export default function PenerimaanDataPage() {
    const [loading, setLoading] = useState(true);
    const [documentStatuses, setDocumentStatuses] = useState<DocumentStatus[]>([]);
    
    const basePath = "/dlh-dashboard/pengiriman-data"; 

    // Fetch status dokumen dari API
    const fetchDocumentStatuses = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch status-dokumen yang lengkap untuk semua dokumen
            const response = await axios.get('/api/dinas/upload/status-dokumen');
            const documentsData = response.data?.data || [];

            // Map data dari API ke format yang dibutuhkan frontend
            const statuses: DocumentStatus[] = documentsData.map((doc: any) => {
                let jenis = doc.jenis_dokumen;
                let href = `${basePath}/slhd-tabel-utama`;

                if (doc.jenis_dokumen === 'Ringkasan Eksekutif') {
                    jenis = 'SLHD Buku I (Ringkasan Eksekutif)';
                    href = `${basePath}/slhd`;
                } else if (doc.jenis_dokumen === 'Laporan Utama') {
                    jenis = 'SLHD Buku II (Laporan Utama)';
                    href = `${basePath}/slhd`;
                } else if (doc.jenis_dokumen === 'IKLH') {
                    href = `${basePath}/iklh`;
                }

                // Parse tanggal dari format dd-mm-yyyy ke ISO string untuk sorting
                let tanggal = null;
                if (doc.tanggal_upload) {
                    const [day, month, year] = doc.tanggal_upload.split('-');
                    tanggal = `${year}-${month}-${day}T00:00:00`;
                }

                return {
                    jenis,
                    uploaded: doc.status_upload === 'Dokumen Diunggah',
                    tanggal,
                    status: doc.status === '-' ? '' : doc.status,
                    href
                };
            });

            setDocumentStatuses(statuses);
        } catch (error) {
            console.error('Error fetching document statuses:', error);
            // Set default empty statuses on error
            setDocumentStatuses([
                { jenis: 'IKLH', uploaded: false, tanggal: null, status: '', href: `${basePath}/iklh` },
                { jenis: 'SLHD Buku I (Ringkasan Eksekutif)', uploaded: false, tanggal: null, status: '', href: `${basePath}/slhd` },
                { jenis: 'SLHD Buku II (Laporan Utama)', uploaded: false, tanggal: null, status: '', href: `${basePath}/slhd` },
                { jenis: 'SLHD Tabel Utama', uploaded: false, tanggal: null, status: '', href: `${basePath}/slhd-tabel-utama` }
            ]);
        } finally {
            setLoading(false);
        }
    }, [basePath]);

    useEffect(() => {
        fetchDocumentStatuses();
    }, [fetchDocumentStatuses]);

    const uploadItems: UploadItemProps[] = [
        { 
            title: 'IKLH', 
            description: 'Unggah data Indeks Kualitas Lingkungan Hidup', 
            hideDownload: true, 
            href: `${basePath}/iklh`,
            statusBadge: documentStatuses.find(d => d.jenis === 'IKLH')?.uploaded 
                ? <StatusBadge status={documentStatuses.find(d => d.jenis === 'IKLH')?.status || ''} />
                : null
        },
        { 
            title: 'SLHD Buku I (Ringkasan Eksekutif)', 
            description: 'Unggah dokumen Ringkasan Eksekutif SLHD', 
            hideDownload: true, 
            href: `${basePath}/slhd`,
            statusBadge: documentStatuses.find(d => d.jenis === 'SLHD Buku I (Ringkasan Eksekutif)')?.uploaded 
                ? <StatusBadge status={documentStatuses.find(d => d.jenis === 'SLHD Buku I (Ringkasan Eksekutif)')?.status || ''} />
                : null
        },
        { 
            title: 'SLHD Buku II (Laporan Utama)', 
            description: 'Unggah dokumen Laporan Utama SLHD', 
            hideDownload: true, 
            href: `${basePath}/slhd`,
            statusBadge: documentStatuses.find(d => d.jenis === 'SLHD Buku II (Laporan Utama)')?.uploaded 
                ? <StatusBadge status={documentStatuses.find(d => d.jenis === 'SLHD Buku II (Laporan Utama)')?.status || ''} />
                : null
        },
        { 
            title: 'SLHD Tabel Utama', 
            description: 'Unggah SLHD Tabel Utama (Excel)', 
            hideDownload: true, 
            href: `${basePath}/slhd-tabel-utama`,
            statusBadge: documentStatuses.find(d => d.jenis === 'SLHD Tabel Utama')?.uploaded 
                ? <StatusBadge status={documentStatuses.find(d => d.jenis === 'SLHD Tabel Utama')?.status || ''} />
                : null
        },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Panel Pengiriman Data</h1>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Unggah Dokumen</h2>
                <div className="space-y-4">
                    {uploadItems.map((item) => (
                        <UploadItem 
                            key={item.title} 
                            title={item.title} 
                            description={item.description} 
                            hideDownload={item.hideDownload}
                            href={item.href}
                            statusBadge={item.statusBadge}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Status Dokumen</h2>
                    <button 
                        onClick={fetchDocumentStatuses}
                        className="n-600 hover:n-800 text-sm font-medium flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner />
                        <span className="ml-2 text-gray-500">Memuat status dokumen...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Dokumen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Upload</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Upload</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documentStatuses.map((item) => (
                                    <tr key={item.jenis}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center">
                                                <DocumentIcon />
                                                <span className="ml-3">{item.jenis}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(item.tanggal)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatStatusDisplay(item.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link href={item.href} className="text-green-600 hover:text-green-800 font-medium">
                                                Lihat
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}