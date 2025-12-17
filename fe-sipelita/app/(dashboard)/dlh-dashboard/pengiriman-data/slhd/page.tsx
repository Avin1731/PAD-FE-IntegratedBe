"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

// --- Ikon-ikon ---
const DocumentIcon = () => (
    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    </div>
);
const ClockIcon = () => <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircleIcon = () => <svg className="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const EyeIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg>;
const ReplaceIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const InfoIcon = () => <svg className="w-5 h-5 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
const XIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const FileIcon = () => <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const CheckIcon = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const DownloadIconSmall = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ExternalLinkIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;

// --- Interfaces ---
interface DocumentData {
    key: string;
    title: string;
    apiEndpoint: string;
    uploaded: boolean;
    status: 'draft' | 'finalized' | 'approved' | 'rejected' | null;
    tanggal_upload: string | null;
    nama_file: string | null;
    ukuran_file: string | null;
    catatan_admin: string | null;
}

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: DocumentData | null;
    onUploadSuccess: () => void;
}

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: DocumentData | null;
    submissionId: number | null;
    onFinalize: () => void;
}

// --- Upload Modal Component ---
const UploadModal = ({ isOpen, onClose, document, onUploadSuccess }: UploadModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Hanya file PDF yang diperbolehkan');
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Hanya file PDF yang diperbolehkan');
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !document) return;
        
        setIsUploading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            await axios.post(`/api/dinas/upload/${document.apiEndpoint}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            onUploadSuccess();
            onClose();
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengupload file. Silakan coba lagi.');
        } finally {
            setIsUploading(false);
        }
    };

    const resetAndClose = () => {
        setFile(null);
        setError(null);
        onClose();
    };

    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                        {document.uploaded ? 'Ganti File' : 'Unggah File'}
                    </h3>
                    <button onClick={resetAndClose} className="text-white/80 hover:text-white transition-colors">
                        <XIcon />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        <span className="font-semibold text-gray-800">{document.title}</span>
                    </p>
                    
                    {/* Drop Zone */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                            ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}
                            ${file ? 'border-green-500 bg-green-50' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        
                        {file ? (
                            <div className="space-y-2">
                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckIcon />
                                </div>
                                <p className="font-medium text-gray-800">{file.name}</p>
                                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    Hapus file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <FileIcon />
                                <p className="font-medium text-gray-700">
                                    Drag & drop file PDF di sini
                                </p>
                                <p className="text-sm text-gray-500">atau klik untuk memilih file</p>
                                <p className="text-xs text-gray-400">Maksimal 5 MB</p>
                            </div>
                        )}
                    </div>
                    
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={resetAndClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Mengunggah...</span>
                            </>
                        ) : (
                            <>
                                <UploadIcon />
                                <span>Unggah</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Preview Modal Component ---
const PreviewModal = ({ isOpen, onClose, document, submissionId, onFinalize }: PreviewModalProps) => {
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const blobUrlRef = useRef<string | null>(null);

    // Fetch PDF blob when modal opens
    useEffect(() => {
        if (isOpen && document?.uploaded) {
            setLoadingPdf(true);
            setError(null);
            
            // Cleanup previous URL
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
            setPdfBlobUrl(null);
            
            axios.get(`/api/dinas/upload/preview/${document.apiEndpoint}`, {
                responseType: 'blob'
            })
            .then(response => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                blobUrlRef.current = url;
                setPdfBlobUrl(url);
            })
            .catch(err => {
                console.error('Error loading PDF:', err);
                setError('Gagal memuat preview PDF');
            })
            .finally(() => {
                setLoadingPdf(false);
            });
        }
        
        // Cleanup on unmount or when deps change
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [isOpen, document?.apiEndpoint, document?.uploaded]);

    // Reset states when modal closes
    useEffect(() => {
        if (!isOpen) {
            setError(null);
            setSuccessMessage(null);
            setPdfBlobUrl(null);
        }
    }, [isOpen]);

    const handleFinalize = async () => {
        if (!document) return;
        
        setIsFinalizing(true);
        setError(null);
        
        try {
            // Map apiEndpoint ke finalize type
            const typeMap: Record<string, string> = {
                'ringkasan-eksekutif': 'ringkasanEksekutif',
                'laporan-utama': 'laporanUtama'
            };
            const finalizeType = typeMap[document.apiEndpoint];
            
            await axios.patch(`/api/dinas/upload/finalize/${finalizeType}`);
            setSuccessMessage('Dokumen berhasil difinalisasi!');
            onFinalize();
            setTimeout(() => {
                setSuccessMessage(null);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal finalisasi. Silakan coba lagi.');
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleDownload = async () => {
        if (!document) return;
        try {
            const response = await axios.get(`/api/dinas/upload/download/${document.apiEndpoint}`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = window.document.createElement('a');
            link.href = url;
            link.download = document.nama_file || `${document.title}.pdf`;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading:', err);
            setError('Gagal mengunduh dokumen');
        }
    };

    const handleOpenInNewTab = () => {
        if (pdfBlobUrl) {
            window.open(pdfBlobUrl, '_blank');
        }
    };

    const getStatusBadge = () => {
        if (!document?.status) return null;
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            draft: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Draft' },
            finalized: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Terfinalisasi' },
            approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Disetujui' },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak' },
        };
        const config = statusConfig[document.status];
        return config ? (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        ) : null;
    };

    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{document.title}</h3>
                        {getStatusBadge()}
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <XIcon />
                    </button>
                </div>
                
                {/* Document Info */}
                <div className="bg-gray-50 px-6 py-3 border-b flex flex-wrap gap-4 items-center text-sm flex-shrink-0">
                    {document.nama_file && (
                        <div>
                            <span className="text-gray-500">File:</span>
                            <span className="ml-1 font-medium text-gray-800">{document.nama_file}</span>
                        </div>
                    )}
                    {document.ukuran_file && (
                        <div>
                            <span className="text-gray-500">Ukuran:</span>
                            <span className="ml-1 font-medium text-gray-800">{document.ukuran_file}</span>
                        </div>
                    )}
                    {document.tanggal_upload && (
                        <div>
                            <span className="text-gray-500">Tanggal Upload:</span>
                            <span className="ml-1 font-medium text-gray-800">{document.tanggal_upload}</span>
                        </div>
                    )}
                    
                    <div className="ml-auto flex gap-2">
                        <button 
                            onClick={handleOpenInNewTab}
                            className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Buka di Tab Baru"
                        >
                            <ExternalLinkIcon />
                            <span className="hidden sm:inline">Tab Baru</span>
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Download"
                        >
                            <DownloadIconSmall />
                            <span className="hidden sm:inline">Download</span>
                        </button>
                    </div>
                </div>
                
                {/* Catatan Admin (jika ada dan rejected) */}
                {document.status === 'rejected' && document.catatan_admin && (
                    <div className="bg-red-50 px-6 py-3 border-b flex-shrink-0">
                        <p className="text-sm text-red-700">
                            <span className="font-semibold">Catatan Admin:</span> {document.catatan_admin}
                        </p>
                    </div>
                )}
                
                {/* Alert Messages */}
                {error && (
                    <div className="bg-red-50 px-6 py-3 border-b flex-shrink-0">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-50 px-6 py-3 border-b flex-shrink-0">
                        <p className="text-sm text-green-600">{successMessage}</p>
                    </div>
                )}
                
                {/* PDF Iframe */}
                <div className="flex-1 bg-white overflow-hidden">
                    {loadingPdf ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <svg className="animate-spin h-10 w-10 text-green-600 mx-auto mb-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <p className="text-gray-600">Memuat dokumen...</p>
                            </div>
                        </div>
                    ) : pdfBlobUrl ? (
                        <iframe
                            src={pdfBlobUrl}
                            className="w-full h-full border-0"
                            title={document?.title || 'Document Preview'}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center p-8">
                                <FileIcon />
                                <p className="text-gray-600 mt-4">
                                    {document?.uploaded ? 'Gagal memuat preview' : 'Dokumen belum diunggah'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0 border-t">
                    <div className="text-sm text-gray-500">
                        {document.status === 'draft' && 'Finalisasi dokumen untuk mengunci perubahan'}
                        {document.status === 'finalized' && 'Menunggu review dari Pusdatin'}
                        {document.status === 'approved' && '✓ Dokumen telah disetujui'}
                        {document.status === 'rejected' && 'Dokumen ditolak, silakan upload ulang'}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Tutup
                        </button>
                        {document.status === 'draft' && (
                            <button
                                onClick={handleFinalize}
                                disabled={isFinalizing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isFinalizing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Memfinalisasi...</span>
                                    </>
                                ) : (
                                    <span>Finalisasi Dokumen</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Card Component ---
interface SlhdUploadCardProps {
    document: DocumentData;
    onUpload: () => void;
    onPreview: () => void;
}

const SlhdUploadCard = ({ document, onUpload, onPreview }: SlhdUploadCardProps) => {
    const isUploaded = document.uploaded;
    const isFinalized = document.status === 'finalized';
    const isApproved = document.status === 'approved';
    const isRejected = document.status === 'rejected';
    const canEdit = !isFinalized && !isApproved;
    
    const getStatusText = () => {
        if (isApproved) return 'Disetujui';
        if (isFinalized) return 'Terfinalisasi';
        if (isRejected) return 'Ditolak - Upload Ulang';
        if (isUploaded) return 'Draft - Belum Finalisasi';
        return 'Menunggu Unggahan';
    };
    
    const getStatusColor = () => {
        if (isApproved) return 'text-green-600';
        if (isFinalized) return 'text-blue-600';
        if (isRejected) return 'text-red-600';
        if (isUploaded) return 'text-yellow-600';
        return 'text-gray-600';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <DocumentIcon />
                    <div>
                        <h3 className="font-semibold text-gray-800">{document.title}</h3>
                        <div className="flex items-center text-sm mt-1">
                            {isUploaded || isApproved ? <CheckCircleIcon /> : <ClockIcon />}
                            <span className={getStatusColor()}>{getStatusText()}</span>
                        </div>
                        {document.tanggal_upload && (
                            <p className="text-xs text-gray-400 mt-1">
                                Diupload: {document.tanggal_upload}
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Status Badge */}
                {document.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        document.status === 'approved' ? 'bg-green-100 text-green-700' :
                        document.status === 'finalized' ? 'bg-blue-100 text-blue-700' :
                        document.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                        {document.status === 'approved' ? 'Disetujui' :
                         document.status === 'finalized' ? 'Final' :
                         document.status === 'rejected' ? 'Ditolak' : 'Draft'}
                    </span>
                )}
            </div>
            
            {/* Tombol Aksi */}
            <div className="flex space-x-3 mt-4">
                {isUploaded ? (
                    <>
                        {canEdit && (
                            <button 
                                onClick={onUpload}
                                className="flex-1 flex items-center justify-center bg-gray-100 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <ReplaceIcon /> Ganti File
                            </button>
                        )}
                        <button 
                            onClick={onPreview}
                            className="flex-1 flex items-center justify-center bg-green-100 text-green-700 text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-green-200 transition-colors"
                        >
                            <EyeIcon /> Lihat Detail
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={onUpload}
                        className="flex-1 flex items-center justify-center bg-green-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <UploadIcon /> Unggah File
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function SLHDPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submissionId, setSubmissionId] = useState<number | null>(null);
    const [documents, setDocuments] = useState<DocumentData[]>([
        { 
            key: 'ringkasan_eksekutif',
            title: 'Buku I (Ringkasan Eksekutif)', 
            apiEndpoint: 'ringkasan-eksekutif',
            uploaded: false,
            status: null,
            tanggal_upload: null,
            nama_file: null,
            ukuran_file: null,
            catatan_admin: null
        },
        { 
            key: 'laporan_utama',
            title: 'Buku II (Laporan Utama)', 
            apiEndpoint: 'laporan-utama',
            uploaded: false,
            status: null,
            tanggal_upload: null,
            nama_file: null,
            ukuran_file: null,
            catatan_admin: null
        },
    ]);
    
    // Modal states
    const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; document: DocumentData | null }>({
        isOpen: false,
        document: null
    });
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; document: DocumentData | null }>({
        isOpen: false,
        document: null
    });

    // Fetch document status
    const fetchDocumentStatus = useCallback(async () => {
        try {
            const response = await axios.get('/api/dinas/upload/status-dokumen');
            const data = response.data.data || [];
            
            // Update documents with API data
            setDocuments(prev => prev.map(doc => {
                // Map key to jenis_dokumen
                const jenisMap: Record<string, string> = {
                    'ringkasan_eksekutif': 'Ringkasan Eksekutif',
                    'laporan_utama': 'Laporan Utama',
                };
                
                const apiDoc = data.find((d: any) => d.jenis_dokumen === jenisMap[doc.key]);
                
                if (apiDoc) {
                    return {
                        ...doc,
                        uploaded: apiDoc.status_upload === 'Dokumen Diunggah',
                        status: apiDoc.status,
                        tanggal_upload: apiDoc.tanggal_upload,
                        nama_file: apiDoc.nama_file || null,
                        ukuran_file: apiDoc.ukuran_file || null,
                        catatan_admin: apiDoc.catatan_admin || null
                    };
                }
                return doc;
            }));
            
            // Get submission ID from dashboard endpoint
            const dashboardRes = await axios.get('/api/dinas/dashboard');
            setSubmissionId(dashboardRes.data.submission_id || null);
            
        } catch (error) {
            console.error('Failed to fetch document status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchDocumentStatus();
        }
    }, [user, fetchDocumentStatus]);
    
    const hasError = documents.some(doc => !doc.uploaded);
    const allApproved = documents.every(doc => doc.status === 'approved');

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-48 bg-gray-200 rounded-xl"></div>
                        <div className="h-48 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-6 px-4">
            {/* Breadcrumb */}
            <div className="text-sm text-green-600 mb-2 font-medium">
                Panel Pengiriman Data <span className="text-gray-400 mx-2">&gt;</span> <span className="text-gray-800">Unggah Dokumen SLHD</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">Panel Penerimaan Data</h1>
            <p className="text-lg text-gray-600 mt-1 mb-8">Unggah Dokumen SLHD</p>

            {/* Status Summary */}
            {allApproved && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                    <CheckCircleIcon />
                    <span className="ml-2">Semua dokumen SLHD telah disetujui oleh Pusdatin!</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc) => (
                    <SlhdUploadCard 
                        key={doc.key}
                        document={doc}
                        onUpload={() => setUploadModal({ isOpen: true, document: doc })}
                        onPreview={() => setPreviewModal({ isOpen: true, document: doc })}
                    />
                ))}
            </div>

            {hasError && !allApproved && (
                <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center">
                    <InfoIcon />
                    <span>
                        {documents.filter(d => !d.uploaded).length === documents.length
                            ? 'Semua dokumen belum diunggah'
                            : `${documents.filter(d => !d.uploaded).map(d => d.title).join(', ')} belum diunggah`}
                    </span>
                </div>
            )}
            
            {/* Upload Modal */}
            <UploadModal
                isOpen={uploadModal.isOpen}
                onClose={() => setUploadModal({ isOpen: false, document: null })}
                document={uploadModal.document}
                onUploadSuccess={fetchDocumentStatus}
            />
            
            {/* Preview Modal */}
            <PreviewModal
                isOpen={previewModal.isOpen}
                onClose={() => setPreviewModal({ isOpen: false, document: null })}
                document={previewModal.document}
                submissionId={submissionId}
                onFinalize={fetchDocumentStatus}
            />
        </div>
    );
}