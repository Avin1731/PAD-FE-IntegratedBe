'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiFileText, FiCalendar, FiHardDrive, FiFile, FiFilter } from 'react-icons/fi';
import axios from '@/lib/axios';

// API Base URL
const API_BASE_URL = 'http://localhost:8000';

// Matra list sesuai backend MatraConstants
const MATRA_LIST = [
  'Semua Matra',
  'Jumlah Pemanfaatan Pelayanan Laboratorium',
  'Daya Dukung dan Daya Tampung Lingkungan Hidup (D3TLH)',
  'Kajian Lingkungan Hidup Strategis (KLHS)',
  'Keanekaragaman Hayati',
  'Kualitas Air',
  'Laut, Pesisir, dan Pantai',
  'Kualitas Udara',
  'Lahan dan Hutan',
  'Pengelolaan Sampah dan Limbah',
  'Perubahan Iklim',
  'Risiko Bencana',
  'Penetapan Isu Prioritas',
];

interface TabelItem {
  id: number;
  kode_tabel: string;
  matra: string;
  status: 'draft' | 'finalized' | 'approved' | 'rejected';
  catatan_admin: string | null;
  nama_file: string;
  ukuran_file: string | null;
  format_file: string;
  tanggal_upload: string;
  download_url: string | null;
}

interface TabelUtamaData {
  submission_id: number;
  dinas: {
    nama: string;
    jenis: string;
  };
  tahun: number;
  total_tabel: number;
  documents: TabelItem[];
}

interface TabelUtamaModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number;
  dinasName: string;
}

export default function TabelUtamaModal({
  isOpen,
  onClose,
  submissionId,
  dinasName
}: TabelUtamaModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TabelUtamaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatra, setSelectedMatra] = useState('Semua Matra');
  const [selectedTabel, setSelectedTabel] = useState<TabelItem | null>(null);

  // Fetch tabel utama data
  useEffect(() => {
    if (!isOpen || !submissionId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`/api/pusdatin/review/submission/${submissionId}/tabel-utama`);
        setData(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Belum ada tabel utama yang diupload');
        } else {
          setError(err.response?.data?.message || 'Gagal memuat data tabel utama');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isOpen, submissionId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMatra('Semua Matra');
      setSelectedTabel(null);
      setData(null);
      setError(null);
    }
  }, [isOpen]);

  // Filter documents by matra
  const filteredDocuments = data?.documents?.filter(doc => 
    selectedMatra === 'Semua Matra' || doc.matra === selectedMatra
  ) || [];

  // Group documents by matra for display
  const groupedByMatra = filteredDocuments.reduce((acc, doc) => {
    const matra = doc.matra || 'Lainnya';
    if (!acc[matra]) acc[matra] = [];
    acc[matra].push(doc);
    return acc;
  }, {} as Record<string, TabelItem[]>);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDownload = async (doc: TabelItem) => {
    if (!doc.download_url) return;
    
    try {
      const response = await axios.get(
        `/api/pusdatin/review/submission/${submissionId}/tabel-utama/${doc.id}/download`,
        { responseType: 'blob' }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.nama_file);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Detail view for a single tabel
  const renderDetailView = () => {
    if (!selectedTabel) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="h-full flex flex-col"
      >
        {/* Back button */}
        <button
          onClick={() => setSelectedTabel(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm"
        >
          ← Kembali ke daftar
        </button>

        {/* Detail content */}
        <div className="bg-gray-700/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedTabel.kode_tabel}</h3>
              <p className="text-sm text-gray-400">{selectedTabel.matra}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Nama File</p>
              <p className="text-sm text-white flex items-center gap-2">
                <FiFile className="text-gray-400" />
                {selectedTabel.nama_file}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Ukuran File</p>
              <p className="text-sm text-white flex items-center gap-2">
                <FiHardDrive className="text-gray-400" />
                {selectedTabel.ukuran_file || '-'}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Format</p>
              <p className="text-sm text-white">{selectedTabel.format_file}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Tanggal Upload</p>
              <p className="text-sm text-white flex items-center gap-2">
                <FiCalendar className="text-gray-400" />
                {formatDate(selectedTabel.tanggal_upload)}
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
              selectedTabel.status === 'approved' 
                ? 'bg-green-500/20 text-green-400'
                : selectedTabel.status === 'finalized'
                ? 'bg-blue-500/20 text-blue-400'
                : selectedTabel.status === 'rejected'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {selectedTabel.status === 'approved' ? 'Disetujui' 
                : selectedTabel.status === 'finalized' ? 'Finalized'
                : selectedTabel.status === 'rejected' ? 'Ditolak'
                : 'Draft'}
            </span>
          </div>

          {selectedTabel.catatan_admin && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Catatan Admin</p>
              <p className="text-sm text-white">{selectedTabel.catatan_admin}</p>
            </div>
          )}

          {/* Download button */}
          <button
            onClick={() => handleDownload(selectedTabel)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            Download File
          </button>
        </div>
      </motion.div>
    );
  };

  // List view
  const renderListView = () => (
    <div className="space-y-4">
      {/* Filter dropdown */}
      <div className="flex items-center gap-3">
        <FiFilter className="text-gray-400" />
        <select
          value={selectedMatra}
          onChange={(e) => setSelectedMatra(e.target.value)}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          {MATRA_LIST.map(matra => (
            <option key={matra} value={matra}>{matra}</option>
          ))}
        </select>
      </div>

      {/* Table list */}
      <div className="bg-gray-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/50">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-300">Indikator</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">Tanggal Upload</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedByMatra).map(([matra, docs]) => (
              docs.map((doc, idx) => (
                <tr 
                  key={doc.id} 
                  className={`border-t border-gray-700/50 ${
                    doc.status === 'draft' ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-white">{doc.kode_tabel}</p>
                      <p className="text-xs text-gray-400">{doc.matra}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-300">
                    {formatDate(doc.tanggal_upload)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {doc.status === 'finalized' || doc.status === 'approved' ? (
                      <button
                        onClick={() => setSelectedTabel(doc)}
                        className="text-green-400 hover:text-green-300 text-sm font-medium"
                      >
                        Lihat Detail
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))
            ))}
            {filteredDocuments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  {selectedMatra === 'Semua Matra' 
                    ? 'Belum ada tabel yang diupload'
                    : `Belum ada tabel untuk matra "${selectedMatra}"`
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

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
            className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Detail Penerimaan Tabel Utama
                </h2>
                <p className="text-sm text-gray-400">{dinasName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">{error}</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {selectedTabel ? renderDetailView() : renderListView()}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {data && !selectedTabel && (
              <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/50">
                <p className="text-sm text-gray-400">
                  Total: <span className="text-white font-medium">{data.total_tabel}</span> tabel diupload
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
