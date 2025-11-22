'use client';

import { useState, useMemo } from 'react';
import Pagination from '@/components/Pagination';

const validasi1Data = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: `Kabupaten/Kota ${i + 1}`,
  iklh: 70 + Math.floor(Math.random() * 25),
  penghargaan: 70 + Math.floor(Math.random() * 25),
  total: (75 + Math.floor(Math.random() * 20)).toFixed(1),
  status: Math.random() > 0.3 ? 'Lolos' : 'Tidak Lolos'
}));

export default function TabValidasi1() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return validasi1Data.slice(startIndex, endIndex);
  }, [currentPage]);

  const totalPages = Math.ceil(validasi1Data.length / itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="py-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">Validasi 1</h3>
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

      <div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Nilai IKLH</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Nilai PENGHARGAAN</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">NILAI TOTAL</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium bg-green-50 text-gray-800">{item.name}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600 text-sm">{item.iklh}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600 text-sm">{item.penghargaan}</td>
                    <td className="py-4 px-6 text-center font-bold bg-green-50 text-green-600 text-sm">{item.total}</td>
                    <td className="py-4 px-6 bg-green-50 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Lolos' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, validasi1Data.length)} dari {validasi1Data.length} data
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