'use client';

import { FiDownload, FiX, FiCheck, FiXCircle } from 'react-icons/fi';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'buku1' | 'buku2';
  regionName: string;
  data: {
    namaDaerah: string;
    jenisDLH: string;
    jenisDokumen: string;
    tanggalUpload: string;
    namaFile: string;
    ukuranFile: string;
    formatFile: string;
    status: 'Belum diverifikasi' | 'Diterima' | 'Ditolak';
  };
  onAccept: () => void;
  onReject: () => void;
}

export default function DocumentDetailModal({
  isOpen,
  onClose,
  data,
  onAccept,
  onReject
}: DocumentDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Informasi Dokumen</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Document Info Table */}
          <div className="mb-6">
            <table className="w-full text-sm text-gray-700">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-semibold bg-gray-50 w-2/5">Nama Daerah</td>
                  <td className="py-3 px-4">{data.namaDaerah}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-semibold bg-gray-50">Jenis DLH</td>
                  <td className="py-3 px-4">{data.jenisDLH}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-semibold bg-gray-50">Jenis Dokumen</td>
                  <td className="py-3 px-4">{data.jenisDokumen}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-semibold bg-gray-50">Tanggal Upload</td>
                  <td className="py-3 px-4">{data.tanggalUpload}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-semibold bg-gray-50">Nama File</td>
                  <td className="py-3 px-4 font-medium">{data.namaFile}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-semibold bg-gray-50">Ukuran File</td>
                  <td className="py-3 px-4">{data.ukuranFile}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-semibold bg-gray-50">Format File</td>
                  <td className="py-3 px-4">{data.formatFile}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold bg-gray-50">Status</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.status === 'Belum diverifikasi' 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : data.status === 'Diterima'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {data.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unduh Dokumen</h3>
            
            <div className="space-y-3">
              {/* Download Button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-base">
                <FiDownload className="w-5 h-5" />
                Unduh Dokumen
              </button>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onAccept}
                  disabled={data.status === 'Diterima'}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-base"
                >
                  <FiCheck className="w-5 h-5" />
                  Dokumen Diterima
                </button>
                
                <button
                  onClick={onReject}
                  disabled={data.status === 'Ditolak'}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-base"
                >
                  <FiXCircle className="w-5 h-5" />
                  Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}