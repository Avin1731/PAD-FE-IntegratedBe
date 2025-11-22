'use client';

import { useState, useMemo } from 'react';
import { FaFileExcel, FaCloudUploadAlt } from 'react-icons/fa';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import Pagination from '@/components/Pagination';

// Pre-generate data with scores to avoid impure function calls during render
const generateSLHDData = () => {
  return Array.from({ length: 45 }, (_, i) => {
    const nilaiBukuI = 70 + Math.floor(Math.random() * 25);
    const nilaiTabel = 70 + Math.floor(Math.random() * 25);
    const nilaiTotal = ((nilaiBukuI + nilaiTabel) / 2).toFixed(1);
    
    return {
      id: i + 1,
      name: `Kabupaten/Kota ${i + 1}`,
      buku1: Math.random() > 0.2,
      buku2: Math.random() > 0.3,
      tabel: Math.random() > 0.1,
      nilaiBukuI,
      nilaiTabel,
      nilaiTotal
    };
  });
};

const slhdData = generateSLHDData();

export default function TabPenilaianSLHD() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return slhdData.slice(startIndex, endIndex);
  }, [currentPage]);

  const totalPages = Math.ceil(slhdData.length / itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="pb-4 mb-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Kelayakan Administrasi Dokumen</h2>
        </div>

        <div className="flex gap-4 mb-6 items-end">
          <div className="w-64">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Pilih Provinsi</option>
              <option>Jawa Tengah</option>
              <option>DI Yogyakarta</option>
            </select>
          </div>
          <button className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors h-[38px]">
            Filter
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase">Aksi</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Buku I</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Buku II</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Tabel Utama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium bg-green-50 text-gray-800">{item.name}</td>
                    <td className="py-4 px-6 text-sm bg-green-50">
                      <button className="text-green-600 hover:underline text-xs font-medium">Lihat Dokumen</button>
                    </td>
                    <td className="py-4 px-6 text-center bg-green-50 text-green-600 text-xl">
                      <div className="flex justify-center">
                        {item.buku1 ? <MdCheckBox /> : <MdCheckBoxOutlineBlank className="text-gray-300" />}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center bg-green-50 text-green-600 text-xl">
                      <div className="flex justify-center">
                        {item.buku2 ? <MdCheckBox /> : <MdCheckBoxOutlineBlank className="text-gray-300" />}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center bg-green-50 text-green-600 text-xl">
                      <div className="flex justify-center">
                        {item.tabel ? <MdCheckBox /> : <MdCheckBoxOutlineBlank className="text-gray-300" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, slhdData.length)} dari {slhdData.length} data
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <div>
        <div className="pb-4 mb-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Penilaian SLHD</h2>
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
              <FaFileExcel /> Unduh Template Excel Penilaian SLHD
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
              <FaCloudUploadAlt /> Upload File Excel Hasil Penilaian SLHD
            </button>
          </div>
        </div>

        <div className="pb-4 mb-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Hasil Penilaian</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Nilai Buku I</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Nilai Tabel Utama</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Nilai Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium bg-green-50 text-gray-800">{item.name}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600 text-sm">{item.nilaiBukuI}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600 text-sm">{item.nilaiTabel}</td>
                    <td className="py-4 px-6 text-center font-bold bg-green-50 text-green-600 text-sm">{item.nilaiTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}