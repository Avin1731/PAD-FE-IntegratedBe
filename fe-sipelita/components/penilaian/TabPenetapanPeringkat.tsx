'use client';

import { useState, useMemo } from 'react';
import { FaTrophy } from 'react-icons/fa';
import Pagination from '@/components/Pagination';

const peringkatData = Array.from({ length: 45 }, (_, i) => ({
  rank: i + 1,
  name: `Kabupaten/Kota ${i + 1}`,
  jenis: 'Kabupaten Besar',
  nilai: (95 - i * 0.5).toFixed(1),
  kenaikan: `+${(5 - i * 0.1).toFixed(1)}`,
  status: i < 5 ? 'Top 5' : 'Lolos'
}));

export default function TabPenetapanPeringkat() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return peringkatData.slice(startIndex, endIndex);
  }, [currentPage]);

  const totalPages = Math.ceil(peringkatData.length / itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-4 mb-6 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">Tabel Peringkat</h3>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-1/3">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Pembagian Daerah</label>
          <select className="w-full border bg-white border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>Pilih Jenis DLH</option>
            <option>Kabupaten Besar</option>
            <option>Kabupaten Sedang</option>
          </select>
        </div>
        <div className="w-1/3">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Jenis Peringkat</label>
          <select className="w-full border bg-white border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>Pilih Jenis Peringkat</option>
            <option>Top 5</option>
            <option>Top 10</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 h-[38px]">Filter</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="py-3 px-6 bg-green-200 text-left text-xs font-bold text-gray-500 uppercase">Rank</th>
                <th className="py-3 px-6 bg-green-200 text-left text-xs font-bold text-gray-500 uppercase">Nama Daerah</th>
                <th className="py-3 px-6 bg-green-200 text-left text-xs font-bold text-gray-500 uppercase">Jenis DLH</th>
                <th className="py-3 px-6 bg-green-200 text-center text-xs font-bold text-gray-500 uppercase">Nilai NT</th>
                <th className="py-3 px-6 bg-green-200 text-center text-xs font-bold text-gray-500 uppercase">Kenaikan NT</th>
                <th className="py-3 px-6 bg-green-200 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.rank} className="hover:bg-gray-50">
                  <td className="py-4 px-6 bg-green-50 text-sm font-bold text-gray-800 flex items-center gap-2">
                    {item.rank <= 3 && <FaTrophy className="text-yellow-500" />}
                    {item.rank}
                  </td>
                  <td className="py-4 px-6 bg-green-50 text-sm font-medium text-gray-800">
                    {item.rank === 1 ? <span className="text-green-600">{item.name}</span> : item.name}
                  </td>
                  <td className="py-4 px-6 bg-green-50 text-sm text-gray-600">{item.jenis}</td>
                  <td className="py-4 px-6 bg-green-50 text-center text-sm text-gray-600">{item.nilai}</td>
                  <td className="py-4 px-6 bg-green-50 text-center text-sm text-gray-600">{item.kenaikan}</td>
                  <td className="py-4 px-6 bg-green-50 text-center">
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, peringkatData.length)} dari {peringkatData.length} data
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}