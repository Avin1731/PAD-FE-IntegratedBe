'use client';

import { FiX, FiDownload, FiEye } from 'react-icons/fi';

interface MainTableItem {
  indikator: string;
  tanggalUpload: string;
  hasDetail: boolean;
}

interface MainTableDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionName: string;
  tipologi: 'pesisir' | 'daratan';
  data: MainTableItem[];
}

export default function MainTableDetailModal({
  isOpen,
  onClose,
  regionName,
  tipologi,
  data
}: MainTableDetailModalProps) {
  if (!isOpen) return null;

  // Filter indicators based on tipologi
  const filteredData = data.filter(item => {
    if (tipologi === 'daratan' && item.indikator === 'Laut, Pesisir, dan Pantai') {
      return false;
    }
    return true;
  });

  const handleViewDetail = (indikator: string) => {
    console.log(`View detail for: ${indikator} - ${regionName}`);
  };

  const handleDownload = (indikator: string) => {
    console.log(`Download: ${indikator} - ${regionName}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Detail Penerimaan Tabel Utama {regionName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tipologi: {tipologi === 'pesisir' ? 'Pesisir' : 'Daratan'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tabel Utama</h3>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b border-gray-200">
                      Indikator
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b border-gray-200 w-40">
                      Tanggal Upload
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b border-gray-200 w-32">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700 font-medium">
                        {item.indikator}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.tanggalUpload}
                      </td>
                      <td className="py-3 px-4">
                        {item.hasDetail ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleViewDetail(item.indikator)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                            >
                              <FiEye className="w-3 h-3" />
                              Lihat
                            </button>
                            <button 
                              onClick={() => handleDownload(item.indikator)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                            >
                              <FiDownload className="w-3 h-3" />
                              Unduh
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Tidak tersedia</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}