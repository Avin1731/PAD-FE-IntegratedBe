'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiCheck, FiXCircle, FiFileText, FiCalendar, FiHardDrive, FiFile } from 'react-icons/fi';
import axios from '@/lib/axios';

// API Base URL - same as axios config
const API_BASE_URL = 'http://localhost:8000';

export interface DocumentInfo {
  id: number;
  jenis_dokumen: string;
  status: string;
  catatan_admin: string | null;
  nama_file: string;
  ukuran_file: string;
  format_file: string;
  tanggal_upload: string;
  download_url: string | null;
}

export interface DocumentPreviewData {
  submission_id: number;
  dinas: {
    nama: string;
    jenis: string;
  };
  tahun: number;
  document: DocumentInfo;
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number;
  documentType: 'buku1' | 'buku2';
  onApprove: (submissionId: number, documentType: string, catatan?: string) => Promise<void>;
  onReject: (submissionId: number, documentType: string, catatan: string) => Promise<void>;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  submissionId,
  documentType,
  onApprove,
  onReject
}: DocumentPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [docData, setDocData] = useState<DocumentPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch document data
  useEffect(() => {
    if (!isOpen || !submissionId) return;
    
    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const endpoint = documentType === 'buku1' 
          ? `/api/pusdatin/review/submission/${submissionId}/ringkasan-eksekutif`
          : `/api/pusdatin/review/submission/${submissionId}/laporan-utama`;
        
        const res = await axios.get(endpoint);
        setDocData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat dokumen');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [isOpen, submissionId, documentType]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRejectMode(false);
      setCatatan('');
      setDocData(null);
      setError(null);
    }
  }, [isOpen]);

  const handleApprove = async () => {
    if (!docData) return;
    setProcessing(true);
    try {
      await onApprove(submissionId, documentType === 'buku1' ? 'ringkasanEksekutif' : 'laporanUtama');
      onClose();
    } catch (err) {
      console.error('Error approving:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!docData || !catatan.trim()) return;
    setProcessing(true);
    try {
      await onReject(submissionId, documentType === 'buku1' ? 'ringkasanEksekutif' : 'laporanUtama', catatan);
      onClose();
    } catch (err) {
      console.error('Error rejecting:', err);
    } finally {
      setProcessing(false);
    }
  };

  // URL untuk preview di iframe (inline PDF) - public route
  const getPreviewUrl = () => {
    if (!submissionId) return null;
    const docTypeParam = documentType === 'buku1' ? 'ringkasan-eksekutif' : 'laporan-utama';
    return `${API_BASE_URL}/api/document/preview/${submissionId}/${docTypeParam}`;
  };

  // URL untuk download file - public route
  const getDownloadUrl = () => {
    if (!submissionId) return null;
    const docTypeParam = documentType === 'buku1' ? 'ringkasan-eksekutif' : 'laporan-utama';
    return `${API_BASE_URL}/api/document/download/${submissionId}/${docTypeParam}`;
  };

  const handleDownload = () => {
    const url = getDownloadUrl();
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isAlreadyReviewed = docData?.document?.status === 'approved' || docData?.document?.status === 'rejected';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gray-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content */}
            <div className="flex h-[85vh]">
              {/* Left Panel - Document Info (White Card) */}
              <div className="w-72 bg-white rounded-2xl m-4 p-6 flex flex-col">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-sm">{error}</div>
                ) : docData ? (
                  <div className="flex flex-col h-full">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Informasi Dokumen</h3>
                    
                    {/* Info List */}
                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between">
                        <span className="text-green-600 text-sm">Nama Daerah</span>
                        <span className="text-gray-900 text-sm font-medium text-right">{docData.dinas?.nama || '-'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-green-600 text-sm">Jenis DLH</span>
                        <span className="text-gray-900 text-sm text-right">{docData.dinas?.jenis || '-'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-green-600 text-sm">Jenis Dokumen</span>
                        <span className="text-gray-900 text-sm text-right">{docData.document.jenis_dokumen}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-green-600 text-sm">Tanggal Upload</span>
                        <span className="text-gray-900 text-sm text-right">{formatDate(docData.document.tanggal_upload)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-green-600 text-sm">Nama File</span>
                        <span className="text-gray-900 text-sm text-right truncate max-w-[120px]" title={docData.document.nama_file}>
                          {docData.document.nama_file}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-green-600 text-sm">Ukuran File</span>
                        <span className="text-gray-900 text-sm text-right">{docData.document.ukuran_file}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-green-600 text-sm">Format File</span>
                        <span className="text-gray-900 text-sm text-right">{docData.document.format_file}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-green-600 text-sm">Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          docData.document.status === 'approved' 
                            ? 'bg-green-100 text-green-600' 
                            : docData.document.status === 'rejected'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {docData.document.status === 'approved' ? 'Disetujui' 
                            : docData.document.status === 'rejected' ? 'Ditolak' 
                            : 'Belum diverifikasi'}
                        </span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors mt-6"
                    >
                      <FiDownload className="w-4 h-4" />
                      Unduh Dokumen
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Right Panel - Document Preview */}
              <div className="flex-1 flex flex-col pr-4 py-4">
                {/* Preview Area */}
                <div className="flex-1 bg-gray-200 rounded-xl overflow-hidden">
                  {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                  ) : error ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {error}
                    </div>
                  ) : docData?.document?.format_file === 'PDF' ? (
                    <iframe
                      src={getPreviewUrl() || ''}
                      className="w-full h-full border-0"
                      title="Document Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      <FiFile className="w-16 h-16 mb-4" />
                      <p className="text-lg font-medium">Preview tidak tersedia</p>
                      <p className="text-sm">Format {docData?.document?.format_file} tidak dapat ditampilkan</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!isAlreadyReviewed && docData && (
                  <div className="flex justify-center gap-4 mt-4">
                    {!rejectMode ? (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={processing}
                          className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          <FiCheck className="w-5 h-5" />
                          Dokumen Diterima
                        </button>
                        <button
                          onClick={() => setRejectMode(true)}
                          disabled={processing}
                          className="flex items-center gap-2 px-8 py-3 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          <FiXCircle className="w-5 h-5" />
                          Tolak
                        </button>
                      </>
                    ) : (
                      <div className="w-full bg-white rounded-lg p-4">
                        <label className="block text-sm text-gray-700 font-medium mb-2">
                          Alasan Penolakan:
                        </label>
                        <textarea
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          placeholder="Masukkan alasan penolakan dokumen..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => setRejectMode(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Kembali
                          </button>
                          <button
                            onClick={handleReject}
                            disabled={processing || !catatan.trim()}
                            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            Ya
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Show catatan if rejected */}
                {docData?.document?.catatan_admin && (
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Catatan Admin:</p>
                    <p className="text-sm text-gray-800">{docData.document.catatan_admin}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
