'use client';

import StatCard from '@/components/StatCard';

const rincianSkorStats = [
  { title: 'Penilaian SLHD', value: '85' },
  { title: 'Penilaian Penghargaan', value: '87' },
  { title: 'Validasi 1', value: 'Valid' },
  { title: 'Validasi 2', value: 'Valid' },
  { title: 'Wawancara', value: '92' },
];

export default function TabWawancara() {
  return (
    <div className="space-y-6 animate-fade-in">
    <h3 className="font-bold text-gray-800 mb-4">Penilaian Wawancara & Perhitungan Nirwasita Tantra Final</h3>

      {/* Filter Wawancara */}
      <div className="flex gap-4 mb-6">
        <div className="w-1/3">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
          <select className="w-full border bg-white border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>Pilih Provinsi</option>
          </select>
        </div>
        <div className="w-1/3">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Kab/Kota</label>
          <select className="w-full border bg-white border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>Pilih Kab/Kota</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 h-[38px]">Filter</button>
        </div>
      </div>
      
      {/* Score Input Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-12 gap-6 bg-green-200 p-3 rounded-t-md border-b border-green-100">
          <div className="col-span-4 text-xs font-bold text-gray-600 uppercase">Komponen</div>
          <div className="col-span-2 text-xs font-bold text-gray-600 uppercase">Bobot</div>
          <div className="col-span-4 text-xs font-bold text-gray-600 uppercase">Skor (0-100)</div>
          <div className="col-span-2 text-xs font-bold text-center text-gray-600 uppercase">Skor Akhir</div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="grid grid-cols-12 gap-6 bg-green-50 p-4 border-b border-gray-100 items-center">
            <div className="col-span-4 text-sm font-medium text-gray-800">Komponen Wawancara {i}</div>
            <div className="col-span-2 text-sm text-green-500 font-medium">25%</div>
            <div className="col-span-4">
              <div className="relative">
                <input type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500" placeholder="0" />
                <span className="absolute right-3 top-2 text-gray-400 text-xs">/100</span>
              </div>
            </div>
            <div className="col-span-2 text-center text-sm text-green-500 font-medium">0.0</div>
          </div>
        ))}
        <div className="flex justify-end items-center p-4">
          <span className="font-bold text-sm text-gray-700 mr-4">Total Skor Akhir Wawancara:</span>
          <span className="text-xl font-bold text-green-600">0.0</span>
        </div>
      </div>

      {/* Ringkasan Nilai Akhir Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-6">Ringkasan Nilai Akhir</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-3 text-sm">
              <span className="text-gray-500">Nama Daerah</span>
              <span className="col-span-2 font-medium text-gray-800">Kabupaten Sleman</span>
            </div>
            <div className="grid grid-cols-3 text-sm">
              <span className="text-gray-500">Jenis DLH</span>
              <span className="col-span-2 font-medium text-gray-800">Kabupaten Besar</span>
            </div>
            <div className="grid grid-cols-3 text-sm">
              <span className="text-gray-500">Tahun Penilaian</span>
              <span className="col-span-2 font-medium text-gray-800">2025</span>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="bg-green-50 rounded-xl p-6 text-center w-full max-w-xs border border-green-300">
              <div className="text-xs text-gray-500 mb-1">Nilai NT Final</div>
              <div className="text-4xl font-extrabold text-green-600 mb-2">87.5</div>
              <div className="bg-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded-full inline-block">LULUS</div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-sm font-bold text-gray-800 mb-3">Rincian Skor per Tahap</h4>
          
          {/* FIX GRID BAWAH: Gunakan lg:grid-cols-5 untuk layar besar */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {rincianSkorStats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                // Warna Hijau untuk semua 5 kartu
                bgColor="bg-green-50"
                borderColor="border-green-300"
                titleColor="text-green-600"
                valueColor="text-green-800"
              />
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700">Finalisasi Nilai Akhir</button>
        </div>
      </div>
    </div>
  );
}