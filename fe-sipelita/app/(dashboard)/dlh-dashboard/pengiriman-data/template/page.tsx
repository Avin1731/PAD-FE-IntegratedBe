"use client";

import React, { useState } from 'react';
import axios from '@/lib/axios';

// --- Ikon-ikon ---
const IconFolder = () => (
    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    </div>
);

const IconFile = () => (
    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    </div>
);

const DownloadIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Interface ---
interface TemplateItemProps {
    title: string;
    description: string;
    matraName?: string; // Nama matra untuk API (null = download all)
    isFolder?: boolean;
    isZip?: boolean;
    onDownload: (matraName?: string) => void;
    downloading: boolean;
}

// --- Komponen Item Template ---
const TemplateItem = ({ title, description, matraName, isFolder = false, isZip = false, onDownload, downloading }: TemplateItemProps) => {
    return (
        <div className="flex items-center justify-between py-6 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-4">
                {isFolder ? <IconFolder /> : <IconFile />}
                <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>
            
            <button 
                onClick={() => onDownload(matraName)}
                disabled={downloading}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    ${isZip 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
            >
                {downloading ? <LoadingSpinner /> : <DownloadIcon />}
                {isZip ? 'Unduh ZIP' : 'Unduh'}
            </button>
        </div>
    );
};

export default function UnduhTemplatePage() {
    const [downloadingItem, setDownloadingItem] = useState<string | null>(null);

    const handleDownload = async (matraName?: string) => {
        const itemKey = matraName || 'all';
        setDownloadingItem(itemKey);

        try {
            let url = '/api/dinas/template/download-all-zip';
            let fileName = 'Template_Tabel_Utama_SLHD.zip';

            if (matraName) {
                url = `/api/dinas/template/download-matra-zip/${encodeURIComponent(matraName)}`;
                fileName = `${matraName.replace(/[, ]/g, '_')}_Templates.zip`;
            }

            const response = await axios.get(url, { responseType: 'blob' });
            
            const blob = new Blob([response.data], { type: 'application/zip' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err: any) {
            console.error('Error downloading:', err);
            alert(err.response?.data?.message || 'Gagal mengunduh file');
        } finally {
            setDownloadingItem(null);
        }
    };

    // Data template sesuai file ZIP yang tersedia
    const templates = [
        { title: "Unduh Semua Template", description: "Satu folder ZIP berisi semua template dokumen SLHD Tabel Utama (80 tabel).", isFolder: true, isZip: true, matraName: undefined },
        { title: "Keanekaragaman Hayati", description: "8 tabel (.zip excel)", matraName: "Keanekaragaman Hayati" },
        { title: "Kualitas Air", description: "9 tabel (.zip excel)", matraName: "Kualitas Air" },
        { title: "Laut, Pesisir, dan Pantai", description: "8 tabel (.zip excel)", matraName: "Laut, Pesisir, dan Pantai" },
        { title: "Kualitas Udara", description: "6 tabel (.zip excel)", matraName: "Kualitas Udara" },
        { title: "Lahan dan Hutan", description: "14 tabel (.zip excel)", matraName: "Lahan dan Hutan" },
        { title: "Pengelolaan Sampah dan Limbah", description: "5 tabel (.zip excel)", matraName: "Pengelolaan Sampah dan Limbah" },
        { title: "Perubahan Iklim", description: "4 tabel (.zip excel)", matraName: "Perubahan Iklim" },
        { title: "Risiko Bencana", description: "5 tabel (.zip excel)", matraName: "Risiko Bencana" },
        { title: "Dokumen Non Matra", description: "21 tabel - Lab, D3TLH, KLHS, Isu Prioritas (.zip excel)", matraName: "Dokumen Non Matra" },
    ];

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <div className="text-sm text-green-600 mb-2 font-medium">
                Panel Pengiriman Data <span className="text-gray-400 mx-2">&gt;</span> <span className="text-gray-600">Unduh Template Dokumen</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Unduh Template Dokumen</h1>
            <p className="text-gray-500 mb-8 text-sm">
                Silahkan unduh format template dokumen SLHD Tabel Utama sesuai dengan kategori matra
            </p>

            {/* Card Utama */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header Card */}
                <div className="px-6 py-4 border-b border-gray-200 bg-white">
                    <h2 className="text-sm font-bold text-green-600 flex items-center gap-2">
                        <span className="w-1 h-4 bg-green-600 rounded-full inline-block"></span>
                        SLHD Tabel Utama (80 Tabel)
                    </h2>
                </div>

                {/* List Template */}
                <div className="px-6">
                    {templates.map((item, index) => (
                        <TemplateItem 
                            key={index}
                            title={item.title}
                            description={item.description}
                            matraName={item.matraName}
                            isFolder={item.isFolder}
                            isZip={item.isZip}
                            onDownload={handleDownload}
                            downloading={downloadingItem === (item.matraName || 'all')}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}