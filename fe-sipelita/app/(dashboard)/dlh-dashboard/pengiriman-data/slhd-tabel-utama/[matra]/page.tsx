"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';

// --- Icons ---
const BackIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const UploadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const DocumentIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// Mapping ID ke nama matra
const ID_TO_MATRA_MAP: Record<string, string> = {
    'keanekaragaman-hayati': 'Keanekaragaman Hayati',
    'kualitas-air': 'Kualitas Air',
    'laut-pesisir-pantai': 'Laut, Pesisir, dan Pantai',
    'kualitas-udara': 'Kualitas Udara',
    'lahan-hutan': 'Lahan dan Hutan',
    'sampah-limbah': 'Pengelolaan Sampah dan Limbah',
    'perubahan-iklim': 'Perubahan Iklim',
    'risiko-bencana': 'Risiko Bencana',
    'non-matra': 'Dokumen Non Matra',
};

interface TabelItem {
    kode_tabel: string;
    nomor_tabel: number;
    matra: string;
    has_template: boolean;
    uploaded: boolean;
    status: string | null;
    updated_at: string | null;
    path: string | null;
}

interface MatraData {
    matra: string;
    summary: {
        total: number;
        uploaded: number;
        finalized: number;
    };
    data: TabelItem[];
}

// --- Upload Modal ---
function UploadModal({ 
    isOpen, 
    onClose, 
    tabel,
    onSuccess 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    tabel: TabelItem | null;
    onSuccess: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('File harus berformat Excel (.xlsx atau .xls)');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('File harus berformat Excel (.xlsx atau .xls)');
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !tabel) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('kode_tabel', tabel.kode_tabel);
            formData.append('matra', tabel.matra);

            await axios.post('/api/dinas/upload/tabel-utama', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onSuccess();
            onClose();
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengunggah file');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        if (!tabel) return;
        
        try {
            const response = await axios.get(`/api/dinas/template/download/${encodeURIComponent(tabel.kode_tabel)}`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Template_${tabel.kode_tabel.replace(/\s+/g, '_')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengunduh template');
        }
    };

    if (!isOpen || !tabel) return null;

    // Extract nama tabel dari kode_tabel (format: "Tabel X || Nama")
    const namaTabel = tabel.kode_tabel.split('||')[1]?.trim() || tabel.kode_tabel;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                
                <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Upload Tabel</h3>
                                <p className="text-sm text-gray-500 mt-1">{namaTabel}</p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <XIcon />
                            </button>
                        </div>

                        {/* Template Download */}
                        {tabel.has_template && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">Template Tersedia</p>
                                        <p className="text-xs text-blue-600">Download template sebelum mengisi data</p>
                                    </div>
                                    <button
                                        onClick={handleDownloadTemplate}
                                        className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                    >
                                        <DownloadIcon />
                                        <span className="ml-1">Unduh</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Drop Zone */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <UploadIcon />
                            <p className="mt-2 text-sm text-gray-600">
                                Drag & drop file Excel di sini, atau
                            </p>
                            <label className="mt-2 inline-block cursor-pointer">
                                <span className="text-green-600 hover:text-green-700 font-medium">pilih file</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <p className="mt-1 text-xs text-gray-400">Format: .xlsx atau .xls</p>
                        </div>

                        {/* Selected File */}
                        {file && (
                            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <DocumentIcon />
                                    <span className="ml-2 text-sm text-gray-700">{file.name}</span>
                                </div>
                                <button 
                                    onClick={() => setFile(null)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <XIcon />
                                </button>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className={`w-full sm:w-auto sm:ml-3 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                !file || uploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {uploading ? (
                                <>
                                    <LoadingSpinner />
                                    <span className="ml-2">Mengunggah...</span>
                                </>
                            ) : (
                                'Upload'
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Tabel Row Component ---
function TabelRow({ 
    tabel, 
    onUpload,
    onDownload,
    onDownloadTemplate
}: { 
    tabel: TabelItem; 
    onUpload: (tabel: TabelItem) => void;
    onDownload: (tabel: TabelItem) => void;
    onDownloadTemplate: (tabel: TabelItem) => void;
}) {
    // Extract nomor dan nama dari kode_tabel
    const parts = tabel.kode_tabel.split('||');
    const nomorTabel = parts[0]?.trim() || '';
    const namaTabel = parts[1]?.trim() || '';

    const getStatusBadge = () => {
        if (!tabel.uploaded) {
            return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">Belum Upload</span>;
        }
        if (tabel.status === 'finalized') {
            return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Terfinalisasi</span>;
        }
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Draft</span>;
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {nomorTabel}
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">
                <div className="max-w-md">
                    <p className="truncate" title={namaTabel}>{namaTabel}</p>
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                {getStatusBadge()}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {tabel.updated_at || '-'}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                    {tabel.has_template && (
                        <button
                            onClick={() => onDownloadTemplate(tabel)}
                            title="Download Template"
                            className="inline-flex items-center px-3 py-1.5 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 text-xs font-medium"
                        >
                            <DownloadIcon />
                            <span className="ml-1">Template</span>
                        </button>
                    )}
                    <button
                        onClick={() => onUpload(tabel)}
                        className="inline-flex items-center px-3 py-1.5 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 text-xs font-medium"
                    >
                        <UploadIcon />
                        <span className="ml-1">{tabel.uploaded ? 'Ganti' : 'Upload'}</span>
                    </button>
                    {tabel.uploaded && (
                        <button
                            onClick={() => onDownload(tabel)}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-medium"
                        >
                            <DownloadIcon />
                            <span className="ml-1">Lihat</span>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

// --- Main Page ---
export default function MatraDetailPage() {
    const params = useParams();
    const router = useRouter();
    const matraId = params.matra as string;
    
    const [loading, setLoading] = useState(true);
    const [matraData, setMatraData] = useState<MatraData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; tabel: TabelItem | null }>({ 
        isOpen: false, 
        tabel: null 
    });

    const matraName = ID_TO_MATRA_MAP[matraId] || matraId;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`/api/dinas/upload/tabel-utama/matra/${encodeURIComponent(matraName)}`);
            setMatraData(response.data);
        } catch (err: any) {
            console.error('Error fetching matra data:', err);
            setError(err.response?.data?.message || 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, [matraName]);

    useEffect(() => {
        if (matraName) {
            fetchData();
        }
    }, [fetchData, matraName]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link href="/dlh-dashboard/pengiriman-data/slhd-tabel-utama" className="flex items-center text-gray-600 hover:text-gray-900">
                        <BackIcon />
                        Kembali
                    </Link>
                </div>
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-500">Memuat data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link href="/dlh-dashboard/pengiriman-data/slhd-tabel-utama" className="flex items-center text-gray-600 hover:text-gray-900">
                        <BackIcon />
                        Kembali
                    </Link>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={fetchData}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    if (!matraData) return null;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Link href="/dlh-dashboard/pengiriman-data/slhd-tabel-utama" className="flex items-center text-gray-600 hover:text-gray-900">
                    <BackIcon />
                    Kembali
                </Link>
            </div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{matraData.matra}</h1>
                    <p className="text-gray-500 mt-1">Kelola data tabel utama untuk kategori ini</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="text-xl font-bold text-green-600">
                        {matraData.summary.uploaded}/{matraData.summary.total} Tabel
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Tabel</p>
                    <p className="text-2xl font-bold text-blue-800">{matraData.summary.total}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-600 font-medium">Sudah Upload</p>
                    <p className="text-2xl font-bold text-yellow-800">{matraData.summary.uploaded}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    Nomor
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama Tabel
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                                    Terakhir Update
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {matraData.data.map((tabel) => (
                                <TabelRow
                                    key={tabel.kode_tabel}
                                    tabel={tabel}
                                    onUpload={(t) => setUploadModal({ isOpen: true, tabel: t })}
                                    onDownload={async (t) => {
                                        try {
                                            const response = await axios.get(
                                                `/api/dinas/upload/tabel-utama/download/${encodeURIComponent(t.kode_tabel)}`,
                                                { responseType: 'blob' }
                                            );
                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.setAttribute('download', `${t.kode_tabel.replace(/\|\|/g, '_')}.xlsx`);
                                            document.body.appendChild(link);
                                            link.click();
                                            link.remove();
                                            window.URL.revokeObjectURL(url);
                                        } catch (err: any) {
                                            console.error('Error downloading file:', err);
                                            alert(err.response?.data?.message || 'Gagal mengunduh file');
                                        }
                                    }}
                                    onDownloadTemplate={async (t) => {
                                        try {
                                            const response = await axios.get(
                                                `/api/dinas/template/download/${encodeURIComponent(t.kode_tabel)}`,
                                                { responseType: 'blob' }
                                            );
                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.setAttribute('download', `Template_${t.kode_tabel.replace(/\|\|/g, '_').replace(/\s+/g, '_')}.xlsx`);
                                            document.body.appendChild(link);
                                            link.click();
                                            link.remove();
                                            window.URL.revokeObjectURL(url);
                                        } catch (err: any) {
                                            console.error('Error downloading template:', err);
                                            alert(err.response?.data?.message || 'Gagal mengunduh template');
                                        }
                                    }}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Modal */}
            <UploadModal
                isOpen={uploadModal.isOpen}
                onClose={() => setUploadModal({ isOpen: false, tabel: null })}
                tabel={uploadModal.tabel}
                onSuccess={fetchData}
            />
        </div>
    );
}
