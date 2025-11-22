'use client';

import { useState } from 'react';
import InnerNav from '@/components/InnerNav';
import ProgressCard from '@/components/ProgressCard';

// Import Komponen Tab
import TabPenilaianSLHD from '@/components/penilaian/TabPenilaianSLHD';
import TabPenilaianPenghargaan from '@/components/penilaian/TabPenilaianPenghargaan';
import TabValidasi1 from '@/components/penilaian/TabValidasi1';
import TabValidasi2 from '@/components/penilaian/TabValidasi2';
import TabWawancara from '@/components/penilaian/TabWawancara';
import TabPenetapanPeringkat from '@/components/penilaian/TabPenetapanPeringkat';

// DATA PROGRESS TAHAPAN
const progressData = [
  { 
    stage: 'Tahap 1 (SLHD)', 
    progress: 100, 
    detail: '514/514 Kab/Kota', 
    isCompleted: true,
    tabValue: 'slhd'
  },
  { 
    stage: 'Tahap 2 (Penghargaan)', 
    progress: 100, 
    detail: '514/514 Kab/Kota', 
    isCompleted: true,
    tabValue: 'penghargaan'
  },
  { 
    stage: 'Tahap 3 (Validasi 1)', 
    progress: 50, 
    detail: '200/514 Kab/Kota', 
    isCompleted: false,
    tabValue: 'validasi1'
  },
  { 
    stage: 'Tahap 4 (Validasi 2)', 
    progress: 50, 
    detail: '257/514 Kab/Kota', 
    isCompleted: false,
    tabValue: 'validasi2'
  },
  { 
    stage: 'Tahap 5 (Wawancara)', 
    progress: 1,
    detail: '5/514 Kab/Kota', 
    isCompleted: true,
    tabValue: 'wawancara'
  },
];

export default function PenilaianKabKotaPage() {
  const [activeTab, setActiveTab] = useState('slhd');

  // KONFIGURASI TAB NAVIGASI
  const tabs = [
    { label: 'Penilaian SLHD', value: 'slhd' },
    { label: 'Penilaian Penghargaan', value: 'penghargaan' },
    { label: 'Validasi 1', value: 'validasi1' },
    { label: 'Validasi 2', value: 'validasi2' },
    { label: 'Penetapan Peringkat', value: 'peringkat' },
    { label: 'Wawancara', value: 'wawancara' },
  ];

  // RENDER KONTEN DINAMIS BERDASARKAN TAB AKTIF
  const renderContent = () => {
    switch (activeTab) {
      case 'slhd':
        return <TabPenilaianSLHD />;
      case 'penghargaan':
        return <TabPenilaianPenghargaan />;
      case 'validasi1':
        return <TabValidasi1 />;
      case 'validasi2':
        return <TabValidasi2 />;
      case 'peringkat':
        return <TabPenetapanPeringkat />;
      case 'wawancara':
        return <TabWawancara />;
      default:
        return <TabPenilaianSLHD />;
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* HEADER UTAMA */}
      <div>
        <div className="flex items-center text-sm text-green-600 mb-2">
          <span className="cursor-pointer hover:underline">Penilaian</span>
          <span className="mx-2">&gt;</span>
          <span className="font-semibold">Penilaian Kab/Kota</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Penilaian {activeTab === 'slhd' ? 'SLHD' : activeTab === 'penghargaan' ? 'Penghargaan' : activeTab === 'validasi1' ? 'Validasi 1' : activeTab === 'validasi2' ? 'Validasi 2' : activeTab === 'peringkat' ? 'Penetapan Peringkat' : 'Wawancara'} Kabupaten/Kota
        </h1>
        <p className="text-gray-600">
          Atur Penilaian Data Nilai Nirwasita Tantra dari Dokumen-Dokumen Kabupaten/Kota.
        </p>
      </div>

      {/* PROGRESS CARDS */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-6">Ringkasan Progres</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {progressData.map((item, index) => (
            <div 
              key={index}
              onClick={() => setActiveTab(item.tabValue)}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <ProgressCard
                stage={item.stage}
                progress={item.progress}
                detail={item.detail}
                isCompleted={item.isCompleted}
              />
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL PENILAIAN & NAVIGASI */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-6">Detail Penilaian</h2>
        
        <InnerNav 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          activeColor="green"
          className="mb-6"
        />

        {renderContent()}
      </div>
    </div>
  );
}