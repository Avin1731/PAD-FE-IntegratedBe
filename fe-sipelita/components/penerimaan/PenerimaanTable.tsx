'use client';

import { useState } from 'react';

// Import dari folder yang sama (bukan dari document)
import DocumentDetailModal from '../document/DocumentDetailModal';
import MainTableDetailModal from '../document/MainTableDetailModal';

export interface SlhdData {
  id: number;
  provinsi: string;
  kabkota: string;
  pembagian_daerah: string;
  tipologi: string;
  buku_1: string | null;
  buku_2: string | null;
  tabel_utama: string | null;
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
  ik_pesisir: number;
  ik_kehati: number;
  total_iklh: number;
  verifikasi: boolean | number;
}

export type TableItem = SlhdData | IklhData;

interface PenerimaanTableProps {
  activeTab: 'SLHD' | 'IKLH';
  data: TableItem[];
  onVerify: (item: IklhData) => void;
  isProcessing: boolean;
  currentPath: 'kab-kota' | 'provinsi';
}

// Data untuk tabel utama
const MAIN_TABLE_INDICATORS = [
  { indikator: 'Keanekaragaman Hayati', tanggalUpload: '23 Oktober 2025', hasDetail: true },
  { indikator: 'Kualitas Air', tanggalUpload: '23 Oktober 2025', hasDetail: true },
  { indikator: 'Laut, Pesisir, dan Pantai', tanggalUpload: '23 Oktober 2025', hasDetail: true },
  { indikator: 'Kualitas Udara', tanggalUpload: '23 Oktober 2025', hasDetail: true },
  { indikator: 'Lahan dan Hutan', tanggalUpload: '23 Oktober 2025', hasDetail: true },
  { indikator: 'Pengelolaan Sampah dan Limbah', tanggalUpload: '23 Oktober 2025', hasDetail: true },
  { indikator: 'Perubahan Iklim', tanggalUpload: '23 Oktober 2025', hasDetail: true },
  { indikator: 'Risiko Bencana', tanggalUpload: '23 Oktober 2025', hasDetail: true },
  { indikator: 'Dokumen Non Matra', tanggalUpload: '23 Oktober 2025', hasDetail: true },
];

export default function PenerimaanTable({ 
  activeTab, 
  data, 
  onVerify, 
  isProcessing 
}: PenerimaanTableProps) {
  const [selectedDocument, setSelectedDocument] = useState<{
    type: 'buku1' | 'buku2';
    item: SlhdData;
  } | null>(null);

  const [selectedMainTable, setSelectedMainTable] = useState<{
    item: SlhdData;
  } | null>(null);
  
  const checkIsVerified = (val: boolean | number): boolean => {
    return val === true || val === 1;
  };

  // Helper function untuk handle title yang mungkin null
  const getTitle = (title: string | null): string | undefined => {
    return title || undefined;
  };

  // Handler untuk membuka modal dokumen
  const handleViewDocument = (item: SlhdData, documentType: 'buku1' | 'buku2') => {
    setSelectedDocument({
      type: documentType,
      item: item
    });
  };

  // Handler untuk membuka modal tabel utama
  const handleViewMainTable = (item: SlhdData) => {
    setSelectedMainTable({
      item: item
    });
  };

  // Handler untuk menerima dokumen
  const handleAcceptDocument = () => {
    console.log('Document accepted:', selectedDocument);
    setSelectedDocument(null);
  };

  // Handler untuk menolak dokumen
  const handleRejectDocument = () => {
    console.log('Document rejected:', selectedDocument);
    setSelectedDocument(null);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-full">
        <div className="overflow-x-auto"> 
          <table className="w-full">
            <thead className="bg-green-200">
              <tr>
                <th className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Provinsi</th>
                <th className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Kabupaten/Kota</th>
                
                {activeTab === 'SLHD' ? (
                  <>
                    <th className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Kategori</th>
                    <th className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Topologi</th>
                    <th className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Buku I</th>
                    <th className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Buku II</th>
                    <th className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Tabel Utama</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Kategori</th>
                    <th className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Topologi</th>
                    <th className="py-4 px-2 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">IKA</th>
                    <th className="py-4 px-2 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">IKU</th>
                    <th className="py-4 px-2 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">IKL</th>
                    <th className="py-4 px-2 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">IK Pesisir</th>
                    <th className="py-4 px-2 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">IK Kehati</th>
                    <th className="py-4 px-2 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Total</th>
                    <th className="py-4 px-2 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Verif</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item) => {
                  let displayCategory = '';
                  if ('pembagian_daerah' in item) {
                    displayCategory = item.pembagian_daerah;
                  } else {
                    displayCategory = item.jenis_dlh;
                  }
                  displayCategory = displayCategory.replace('Kabupaten', 'Kab.').replace('Kota', 'Kota');

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm bg-green-50 text-gray-900 font-medium align-middle text-center">
                        {item.provinsi}
                      </td>
                      <td className="py-4 px-4 text-sm bg-green-50 text-gray-900 align-middle text-center">
                        {item.kabkota}
                      </td>

                      {activeTab === 'SLHD' ? (
                        <>
                          <td className="py-4 px-4 text-sm bg-green-50 text-gray-700 align-middle text-center">
                            {displayCategory}
                          </td>
                          <td className="py-4 px-4 text-sm bg-green-50 text-gray-700 align-middle text-center">
                            {(item as SlhdData).tipologi}
                          </td>
                          
                          {/* BUKU 1 */}
                          <td className="py-4 px-4 text-sm bg-green-50 align-middle text-center">
                            {(item as SlhdData).buku_1 ? (
                              <div className="flex justify-center">
                                <button 
                                  onClick={() => handleViewDocument(item as SlhdData, 'buku1')}
                                  className="text-green-600 hover:underline font-medium truncate max-w-[100px] block cursor-pointer hover:text-green-700 transition-colors"
                                  title={getTitle((item as SlhdData).buku_1)}
                                >
                                  {(item as SlhdData).buku_1}
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">Belum</span>
                            )}
                          </td>
                          
                          {/* BUKU 2 */}
                          <td className="py-4 px-4 text-sm bg-green-50 align-middle text-center">
                            {(item as SlhdData).buku_2 ? (
                              <div className="flex justify-center">
                                <button 
                                  onClick={() => handleViewDocument(item as SlhdData, 'buku2')}
                                  className="text-green-600 hover:underline font-medium truncate max-w-[100px] block cursor-pointer hover:text-green-700 transition-colors"
                                  title={getTitle((item as SlhdData).buku_2)}
                                >
                                  {(item as SlhdData).buku_2}
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">Belum</span>
                            )}
                          </td>
                          
                          {/* TABEL UTAMA */}
                          <td className="py-4 px-4 text-sm bg-green-50 align-middle text-center">
                            {(item as SlhdData).tabel_utama ? (
                              <div className="flex justify-center">
                                <button 
                                  onClick={() => handleViewMainTable(item as SlhdData)}
                                  className="text-green-600 hover:underline font-medium truncate max-w-[100px] block cursor-pointer hover:text-green-700 transition-colors"
                                  title={getTitle((item as SlhdData).tabel_utama)}
                                >
                                  {(item as SlhdData).tabel_utama}
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">Belum</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-4 px-4 text-sm bg-green-50 text-gray-700 align-middle text-center">
                            {displayCategory}
                          </td>
                          <td className="py-4 px-4 text-sm bg-green-50 text-gray-700 align-middle text-center">
                            {(item as IklhData).tipologi}
                          </td>
                          
                          <td className="py-4 px-2 text-sm bg-green-50 text-center font-medium text-green-600 align-middle">
                            {(item as IklhData).ika}
                          </td>
                          <td className={`py-4 px-2 text-sm bg-green-50 text-center font-medium align-middle ${
                            (item as IklhData).iku < 60 ? 'text-red-500' : 'text-green-600'
                          }`}>
                            {(item as IklhData).iku}
                          </td>
                          <td className="py-4 px-2 text-sm bg-green-50 text-center font-medium text-green-600 align-middle">
                            {(item as IklhData).ikl}
                          </td>
                          <td className="py-4 px-2 text-sm bg-green-50 text-center font-medium text-green-600 align-middle">
                            {(item as IklhData).ik_pesisir}
                          </td>
                          <td className={`py-4 px-2 text-sm bg-green-50 text-center font-medium ${
                            (item as IklhData).ik_kehati < 70 ? 'text-red-500' : 'text-green-600'
                          }`}>
                            {(item as IklhData).ik_kehati}
                          </td>
                          
                          <td className="py-4 px-2 text-sm bg-green-50 text-center font-bold text-green-600 align-middle text-base">
                            {(item as IklhData).total_iklh}
                          </td>
                          
                          {/* VERIFIKASI */}
                          <td className="py-4 px-2 bg-green-50 text-center align-middle">
                            <div className="flex justify-center">
                              <button
                                onClick={() => onVerify(item as IklhData)}
                                disabled={checkIsVerified((item as IklhData).verifikasi) || isProcessing}
                                className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all duration-200 
                                  ${
                                    checkIsVerified((item as IklhData).verifikasi)
                                      ? 'border-green-600 bg-white cursor-default' 
                                      : 'border-gray-300 bg-gray-50 hover:border-green-600 cursor-pointer hover:scale-105'
                                  }`}
                                title={
                                  checkIsVerified((item as IklhData).verifikasi) 
                                    ? "Sudah diverifikasi" 
                                    : "Klik untuk memverifikasi"
                                }
                              >
                                {checkIsVerified((item as IklhData).verifikasi) && (
                                  <div className="w-3.5 h-3.5 bg-green-600 rounded-sm"></div>
                                )}
                              </button>
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
                    colSpan={activeTab === 'SLHD' ? 8 : 12} 
                    className="py-12 text-center text-gray-500 bg-gray-50"
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

      {/* Modal untuk dokumen Buku 1 & 2 */}
      {selectedDocument && (
        <DocumentDetailModal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          documentType={selectedDocument.type}
          regionName={selectedDocument.item.kabkota}
          data={{
            namaDaerah: selectedDocument.item.kabkota,
            jenisDLH: selectedDocument.item.pembagian_daerah,
            jenisDokumen: selectedDocument.type === 'buku1' ? 'SLHD Buku I (RE)' : 'SLHD Buku II',
            tanggalUpload: '16 Oktober 2025',
            namaFile: selectedDocument.type === 'buku1' ? `Buku_L_${selectedDocument.item.kabkota.replace(/\s+/g, '')}_2025` : `Buku_IL_${selectedDocument.item.kabkota.replace(/\s+/g, '')}_2025`,
            ukuranFile: selectedDocument.type === 'buku1' ? '5.5 MB' : '6.5 MB',
            formatFile: 'PDF',
            status: 'Belum diverifikasi'
          }}
          onAccept={handleAcceptDocument}
          onReject={handleRejectDocument}
        />
      )}

      {/* Modal untuk tabel utama */}
      {selectedMainTable && (
        <MainTableDetailModal
          isOpen={!!selectedMainTable}
          onClose={() => setSelectedMainTable(null)}
          regionName={selectedMainTable.item.kabkota}
          tipologi={selectedMainTable.item.tipologi.toLowerCase() as 'pesisir' | 'daratan'}
          data={MAIN_TABLE_INDICATORS}
        />
      )}
    </>
  );
}