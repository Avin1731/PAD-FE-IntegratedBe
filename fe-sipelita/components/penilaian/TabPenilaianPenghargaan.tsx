'use client';

import { useState, useMemo } from 'react';
import { FaFileExcel, FaCloudUploadAlt } from 'react-icons/fa';
import Pagination from '@/components/Pagination';

const penghargaanData = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: `Kabupaten/Kota ${i + 1}`,
  adipura: 75 + Math.floor(Math.random() * 15),
  adiwiyata: 70 + Math.floor(Math.random() * 20),
  proklim: 65 + Math.floor(Math.random() * 25),
  proper: 80 + Math.floor(Math.random() * 15),
  kalpataru: 75 + Math.floor(Math.random() * 20),
  total: 75 + Math.floor(Math.random() * 20)
}));

export default function TabPenilaianPenghargaan() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return penghargaanData.slice(startIndex, endIndex);
  }, [currentPage]);

  const totalPages = Math.ceil(penghargaanData.length / itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="pb-4 mb-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Penilaian Penghargaan</h2>
      </div>

      <div>
        <div className="flex gap-4 mb-6 items-end">
          <div className="w-64">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
            <select className="w-full border bg-white border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Pilih Provinsi</option>
              <option>Jawa Tengah</option>
              <option>DI Yogyakarta</option>
            </select>
          </div>
          <button className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors h-[38px]">
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2 text-green-600">
              <FaFileExcel className="text-xl" />
              <h3 className="font-semibold text-gray-800">Unduh Template Excel</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Silahkan unduh template excel, isi nilai, dan unggah kembali ke sistem.</p>
          </div>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700">
            <FaFileExcel /> Unduh Template Excel Penilaian Penghargaan
          </button>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2 text-green-600">
              <FaCloudUploadAlt className="text-xl" />
              <h3 className="font-semibold text-gray-800">Upload File Excel</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Pastikan file yang diunggah sudah sesuai dengan template yang disediakan.</p>
          </div>
          <button className="w-full bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-200">
            <FaCloudUploadAlt /> Upload File Excel Hasil Penilaian Penghargaan
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-4">Hasil Penilaian</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Adipura</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Adiwiyata</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Proklim</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Proper</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Kalpataru</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-green-700 uppercase">Nilai Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 text-xs">
                    <td className="py-4 px-6 font-medium bg-green-50 text-gray-800">{item.name}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600">{item.adipura}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600">{item.adiwiyata}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600">{item.proklim}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600">{item.proper}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600">{item.kalpataru}</td>
                    <td className="py-4 px-6 text-center font-bold bg-green-50 text-green-600">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, penghargaanData.length)} dari {penghargaanData.length} data
          </div>
          <div className="flex gap-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
              Finalisasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}