'use client';

import { useState } from 'react';
import DocumentPreviewModal from './DocumentPreviewModal';
import TabelUtamaModal from './TabelUtamaModal';
import axios from '@/lib/axios';

export interface SlhdData {
  id: number;
  provinsi: string;
  kabkota: string;
  pembagian_daerah: string;
  tipologi: string;
  buku_1: string | null;
  buku_2: string | null;
  tabel_utama: string | null;
  // Status untuk tracking review
  buku_1_status?: 'draft' | 'finalized' | 'approved' | 'rejected';
  buku_2_status?: 'draft' | 'finalized' | 'approved' | 'rejected';
}

export interface IklhData {
  id: number;
  provinsi: string;
  kabkota: string;
  jenis_dlh: string;
  tipologi: string;
  ika: number;
  iku: number;
  ikl: number;
  ik_pesisir: number | null; // null for daratan (non-coastal)
  ik_kehati: number;
  total_iklh: number;
  verifikasi: boolean | number;
}

export type TableItem = SlhdData | IklhData;

interface PenerimaanTableProps {
  activeTab: 'SLHD' | 'IKLH';
  data: TableItem[];
  onVerify: (item: IklhData, action: 'approved' | 'rejected') => void;
  onDocumentReview?: (submissionId: number, documentType: string, action: 'approved' | 'rejected', catatan?: string) => Promise<void>;
  isProcessing: boolean;
  currentPath: 'kab-kota' | 'provinsi';
  loading?: boolean;
  onRefresh?: () => void;
}

export default function PenerimaanTable({ 
  activeTab, 
  data, 
  onVerify, 
  onDocumentReview,
  isProcessing,
  currentPath,
  loading = false,
  onRefresh
}: PenerimaanTableProps) {
  // State untuk modal dokumen
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    submissionId: number;
    documentType: 'buku1' | 'buku2';
  }>({
    isOpen: false,
    submissionId: 0,
    documentType: 'buku1'
  });

  // State untuk modal tabel utama
  const [tabelUtamaModal, setTabelUtamaModal] = useState<{
    isOpen: boolean;
    submissionId: number;
    dinasName: string;
  }>({
    isOpen: false,
    submissionId: 0,
    dinasName: ''
  });

  // State untuk row actions
  const [processingRows, setProcessingRows] = useState<Set<number>>(new Set());
  const checkIsVerified = (val: boolean | number): boolean => {
    return val === true || val === 1;
  };

  // Helper function untuk handle title yang mungkin null
  const getTitle = (title: string | null): string | undefined => {
    return title || undefined;
  };

  // Handler untuk membuka modal dokumen
  const handleViewDocument = (item: SlhdData, documentType: 'buku1' | 'buku2') => {
    console.log('View document:', documentType, item.kabkota, 'submission_id:', item.id);
    setPreviewModal({
      isOpen: true,
      submissionId: item.id,
      documentType: documentType
    });
  };

  // Handler untuk close modal
  const handleCloseModal = () => {
    setPreviewModal({
      isOpen: false,
      submissionId: 0,
      documentType: 'buku1'
    });
  };

  // Handler untuk approve dokumen dari modal
  const handleApproveDocument = async (submissionId: number, documentType: string, catatan?: string) => {
    console.log('Approve document:', submissionId, documentType, catatan);
    try {
      await axios.post(`/api/pusdatin/review/submission/${submissionId}/${documentType}`, {
        status: 'approved',
        catatan_admin: catatan || null
      });
      handleCloseModal();
      onRefresh?.(); // Refresh data setelah action
    } catch (err) {
      console.error('Error approving document:', err);
      throw err;
    }
  };

  const handleRejectDocument = async (submissionId: number, documentType: string, catatan: string) => {
    console.log('Reject document:', submissionId, documentType, catatan);
    try {
      await axios.post(`/api/pusdatin/review/submission/${submissionId}/${documentType}`, {
        status: 'rejected',
        catatan_admin: catatan
      });
      handleCloseModal();
      onRefresh?.(); // Refresh data setelah action
    } catch (err) {
      console.error('Error rejecting document:', err);
      throw err;
    }
  };

  // Handler untuk membuka modal tabel utama
  const handleViewMainTable = (item: SlhdData) => {
    console.log('View main table:', item.kabkota, 'submission_id:', item.id);
    setTabelUtamaModal({
      isOpen: true,
      submissionId: item.id,
      dinasName: item.kabkota
    });
  };

  // Handler untuk close modal tabel utama
  const handleCloseTabelUtamaModal = () => {
    setTabelUtamaModal({
      isOpen: false,
      submissionId: 0,
      dinasName: ''
    });
  };

  // Handler untuk approve semua dokumen (Buku 1 & 2) dalam satu row
  const handleApproveAllRow = async (item: SlhdData) => {
    if (processingRows.has(item.id)) return;
    
    setProcessingRows(prev => new Set(prev).add(item.id));
    try {
      const promises = [];
      // Hanya approve dokumen yang status-nya finalized
      if (item.buku_1 && item.buku_1_status === 'finalized') {
        promises.push(axios.post(`/api/pusdatin/review/submission/${item.id}/ringkasanEksekutif`, {
          status: 'approved',
          catatan_admin: null
        }));
      }
      if (item.buku_2 && item.buku_2_status === 'finalized') {
        promises.push(axios.post(`/api/pusdatin/review/submission/${item.id}/laporanUtama`, {
          status: 'approved',
          catatan_admin: null
        }));
      }
      await Promise.all(promises);
      onRefresh?.(); // Refresh data setelah action
    } catch (err) {
      console.error('Error approving all:', err);
    } finally {
      setProcessingRows(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  // State untuk reject all modal
  const [rejectAllModal, setRejectAllModal] = useState<{
    isOpen: boolean;
    item: SlhdData | null;
  }>({ isOpen: false, item: null });
  const [rejectAllCatatan, setRejectAllCatatan] = useState('');

  // Handler untuk reject semua dokumen (Buku 1 & 2) dalam satu row
  const handleRejectAllRow = async (item: SlhdData) => {
    setRejectAllModal({ isOpen: true, item });
  };

  const confirmRejectAll = async () => {
    const item = rejectAllModal.item;
    if (!item || !rejectAllCatatan.trim()) return;
    
    setProcessingRows(prev => new Set(prev).add(item.id));
    setRejectAllModal({ isOpen: false, item: null });
    
    try {
      const promises = [];
      // Hanya reject dokumen yang status-nya finalized
      if (item.buku_1 && item.buku_1_status === 'finalized') {
        promises.push(axios.post(`/api/pusdatin/review/submission/${item.id}/ringkasanEksekutif`, {
          status: 'rejected',
          catatan_admin: rejectAllCatatan
        }));
      }
      if (item.buku_2 && item.buku_2_status === 'finalized') {
        promises.push(axios.post(`/api/pusdatin/review/submission/${item.id}/laporanUtama`, {
          status: 'rejected',
          catatan_admin: rejectAllCatatan
        }));
      }
      await Promise.all(promises);
      onRefresh?.(); // Refresh data setelah action
    } catch (err) {
      console.error('Error rejecting all:', err);
    } finally {
      setProcessingRows(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      setRejectAllCatatan('');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-full">
        <div className="overflow-x-auto"> 
          <table className="w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700">Provinsi</th>
                {currentPath === 'kab-kota' && (
                  <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700">Kabupaten/Kota</th>
                )}
                
                {activeTab === 'SLHD' ? (
                  <>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700">Pembagian Daerah</th>
                    {currentPath === 'kab-kota' && (
                      <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700">Tipologi</th>
                    )}
                    <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700">Buku I</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700">Buku II</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700">Tabel Utama</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700">Kategori</th>
                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-700">IKA</th>
                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-700">IKU</th>
                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-700">IKL</th>
                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-700">IK Pesisir</th>
                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-700">IK Kehati</th>
                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-700">Total</th>
                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-700">Verif</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Skeleton rows saat loading
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    {currentPath === 'kab-kota' && (
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    )}
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    {activeTab === 'SLHD' ? (
                      <>
                        {currentPath === 'kab-kota' && (
                          <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        )}
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></td>
                      </>
                    )}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((item, idx) => {
                  let displayCategory = '';
                  if ('pembagian_daerah' in item) {
                    displayCategory = item.pembagian_daerah;
                  } else {
                    displayCategory = item.jenis_dlh;
                  }
                  displayCategory = displayCategory.replace('Kabupaten', 'Kab.').replace('Kota', 'Kota');

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                      <td className="py-4 px-4 text-sm text-gray-900 font-medium align-middle text-center">
                        {item.provinsi}
                      </td>
                      {currentPath === 'kab-kota' && (
                        <td className="py-4 px-4 text-sm text-gray-900 align-middle text-center">
                          {item.kabkota}
                        </td>
                      )}

                      {activeTab === 'SLHD' ? (
                        <>
                          {/* PEMBAGIAN DAERAH */}
                          <td className="py-4 px-4 text-sm text-gray-700 align-middle text-center">
                            {(item as SlhdData).pembagian_daerah?.replace('Kabupaten', 'Kab.').replace('Kota', 'Kota') || '-'}
                          </td>
                          
                          {/* TIPOLOGI - only for kab-kota */}
                          {currentPath === 'kab-kota' && (
                            <td className="py-4 px-4 text-sm text-gray-700 align-middle text-center">
                              {(item as SlhdData).tipologi || '-'}
                            </td>
                          )}
                          
                          {/* BUKU 1 */}
                          <td className="py-4 px-4 text-sm align-middle text-center">
                            {(() => {
                              const slhdItem = item as SlhdData;
                              const status = slhdItem.buku_1_status;
                              
                              // Tidak ada file
                              if (!slhdItem.buku_1) {
                                return <span className="text-gray-400 text-sm">Belum Upload</span>;
                              }
                              
                              // Determine color based on status
                              let colorClass = 'text-gray-600 hover:text-gray-700'; // default
                              
                              if (status === 'approved') {
                                colorClass = 'text-green-600 hover:text-green-700';
                              } else if (status === 'rejected') {
                                colorClass = 'text-red-500 hover:text-red-600';
                              } else if (status === 'finalized') {
                                colorClass = 'text-amber-500 hover:text-amber-600';
                              }
                              
                              return (
                                <button 
                                  onClick={() => handleViewDocument(slhdItem, 'buku1')}
                                  className={`${colorClass} hover:underline text-sm font-medium cursor-pointer`}
                                  title={`Status: ${status || 'unknown'} - Lihat ${getTitle(slhdItem.buku_1)}`}
                                >
                                  {slhdItem.buku_1}
                                </button>
                              );
                            })()}
                          </td>
                          
                          {/* BUKU 2 */}
                          <td className="py-4 px-4 text-sm align-middle text-center">
                            {(() => {
                              const slhdItem = item as SlhdData;
                              const status = slhdItem.buku_2_status;
                              
                              // Tidak ada file
                              if (!slhdItem.buku_2) {
                                return <span className="text-gray-400 text-sm">Belum Upload</span>;
                              }
                              
                              // Determine color based on status
                              let colorClass = 'text-gray-600 hover:text-gray-700'; // default
                              
                              if (status === 'approved') {
                                colorClass = 'text-green-600 hover:text-green-700';
                              } else if (status === 'rejected') {
                                colorClass = 'text-red-500 hover:text-red-600';
                              } else if (status === 'finalized') {
                                colorClass = 'text-amber-500 hover:text-amber-600';
                              }
                              
                              return (
                                <button 
                                  onClick={() => handleViewDocument(slhdItem, 'buku2')}
                                  className={`${colorClass} hover:underline text-sm font-medium cursor-pointer`}
                                  title={`Status: ${status || 'unknown'} - Lihat ${getTitle(slhdItem.buku_2)}`}
                                >
                                  {slhdItem.buku_2}
                                </button>
                              );
                            })()}
                          </td>
                          
                          {/* TABEL UTAMA */}
                          <td className="py-4 px-4 text-sm align-middle text-center">
                            {(item as SlhdData).tabel_utama ? (
                              <button 
                                onClick={() => handleViewMainTable(item as SlhdData)}
                                className="text-green-600 hover:text-green-700 hover:underline font-medium cursor-pointer text-sm"
                                title={getTitle((item as SlhdData).tabel_utama)}
                              >
                                Lihat Tabel Utama
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">Belum Upload</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-4 px-4 text-sm text-gray-700 align-middle text-center">
                            {displayCategory}
                          </td>
                          
                          <td className="py-4 px-2 text-sm text-center font-medium text-green-600 align-middle">
                            {(item as IklhData).ika}
                          </td>
                          <td className={`py-4 px-2 text-sm text-center font-medium align-middle ${
                            (item as IklhData).iku < 60 ? 'text-red-500' : 'text-green-600'
                          }`}>
                            {(item as IklhData).iku}
                          </td>
                          <td className="py-4 px-2 text-sm text-center font-medium text-green-600 align-middle">
                            {(item as IklhData).ikl}
                          </td>
                          <td className="py-4 px-2 text-sm text-center font-medium text-gray-400 align-middle">
                            {(item as IklhData).ik_pesisir !== null ? (item as IklhData).ik_pesisir : '-'}
                          </td>
                          <td className={`py-4 px-2 text-sm text-center font-medium ${
                            (item as IklhData).ik_kehati < 70 ? 'text-red-500' : 'text-green-600'
                          }`}>
                            {(item as IklhData).ik_kehati}
                          </td>
                          
                          <td className="py-4 px-2 text-center font-bold text-green-600 align-middle text-base">
                            {(item as IklhData).total_iklh.toFixed(2)}
                          </td>
                          
                          {/* VERIFIKASI */}
                          <td className="py-4 px-2 text-center align-middle">
                            <div className="flex justify-center gap-2">
                              {checkIsVerified((item as IklhData).verifikasi) ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                                  Disetujui
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => onVerify(item as IklhData, 'approved')}
                                    disabled={isProcessing}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Terima data IKLH"
                                  >
                                    Terima
                                  </button>
                                  <button
                                    onClick={() => onVerify(item as IklhData, 'rejected')}
                                    disabled={isProcessing}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Tolak data IKLH"
                                  >
                                    Tolak
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td 
                    colSpan={activeTab === 'SLHD' ? (currentPath === 'provinsi' ? 5 : 7) : (currentPath === 'provinsi' ? 9 : 10)} 
                    className="py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-medium">Tidak ada data ditemukan</p>
                      <p className="text-sm mt-1">Coba ubah filter pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Dokumen */}
      <DocumentPreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleCloseModal}
        submissionId={previewModal.submissionId}
        documentType={previewModal.documentType}
        onApprove={handleApproveDocument}
        onReject={handleRejectDocument}
      />

      {/* Modal Reject All */}
      {rejectAllModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Tolak Dokumen
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Anda akan menolak dokumen untuk <strong>{rejectAllModal.item?.kabkota}</strong>
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectAllCatatan}
                onChange={(e) => setRejectAllCatatan(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectAllModal({ isOpen: false, item: null });
                  setRejectAllCatatan('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={confirmRejectAll}
                disabled={!rejectAllCatatan.trim()}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabel Utama Modal */}
      <TabelUtamaModal
        isOpen={tabelUtamaModal.isOpen}
        onClose={handleCloseTabelUtamaModal}
        submissionId={tabelUtamaModal.submissionId}
        dinasName={tabelUtamaModal.dinasName}
      />
    </>
  );
}