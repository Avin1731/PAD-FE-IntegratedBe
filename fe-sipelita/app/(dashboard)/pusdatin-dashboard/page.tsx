'use client';

import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';
import ProgressCard from '@/components/ProgressCard';
import NotificationCard from '@/components/NotificationCard';
import ActivityTable, { Activity } from '@/components/ActivityTable';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface Stats {
  total_dlh: number;
  buku1_upload: number;
  buku1_approved: number;
  buku2_upload: number;
  buku2_approved: number;
  iklh_upload: number;
  iklh_approved: number;
  avg_nilai_slhd: string;
}

interface ProgressStage {
  stage: string;
  status: string;
  detail: string;
  is_completed: boolean;
  is_active: boolean;
  progress: number;
}

interface Notifications {
  announcement?: string | null;
  notification?: string | null;
}

export default function PusdatinDashboardPage() {
  const { user } = useAuth();
  const userName = user?.name || 'Pusdatin';
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [progressStages, setProgressStages] = useState<ProgressStage[]>([]);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notifications>({});
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    // Fetch data dari multiple endpoints secara modular
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch semua data secara paralel
        const [statsRes, progressRes, notifRes] = await Promise.allSettled([
          axios.get('/api/pusdatin/dashboard/stats?year=' + year),
          axios.get('/api/pusdatin/penilaian/progress-stats?year=' + year),
          axios.get('/api/pusdatin/dashboard/notifications?year=' + year),
        ]);

        // Set stats
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }

        // Set progress stats
        if (progressRes.status === 'fulfilled') {
          setProgressStats(progressRes.value.data.data);
        }

        // Set notifications
        if (notifRes.status === 'fulfilled') {
          setNotifications(notifRes.value.data);
        }

      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [year]);

  // Tampilkan UI Loading
  if (loading) {
    return (
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-400 animate-pulse">
            Selamat Datang, {userName.toUpperCase()}
          </h1>
        </header>
        <div className="h-96 w-full bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
          Memuat data dashboard...
        </div>
      </div>
    );
  }

  // Mapping stats ke UI
  const statCards = [
    { title: 'Total Dinas Terdaftar', value: stats?.total_dlh || 0, type: 'number' },
    { 
      title: 'SLHD Buku 1', 
      value: `${stats?.buku1_upload || 0} Upload\n${stats?.buku1_approved || 0} Approved`,
      type: 'text'
    },
    { 
      title: 'SLHD Buku 2', 
      value: `${stats?.buku2_upload || 0} Upload\n${stats?.buku2_approved || 0} Approved`,
      type: 'text'
    },
    { 
      title: 'IKLH', 
      value: `${stats?.iklh_upload || 0} Upload\n${stats?.iklh_approved || 0} Approved`,
      type: 'text'
    },
    { 
      title: 'Rata-rata Nilai SLHD', 
      value: stats?.avg_nilai_slhd || 'Penilaian belum dimulai',
      type: 'text'
    },
  ];

  // Generate progress data - SAMA PERSIS dengan halaman penilaian
  const progressData = progressStats ? [
    {
      stage: 'Tahap 1 (SLHD)',
      progress: progressStats.total_dlh > 0 ? Math.round((progressStats.slhd.finalized / progressStats.total_dlh) * 100) : 0,
      detail: progressStats.slhd.is_finalized 
        ? `Difinalisasi - ${progressStats.slhd.finalized}/${progressStats.total_dlh} DLH`
        : `Terbuka - ${progressStats.slhd.finalized}/${progressStats.total_dlh} DLH`,
      isCompleted: progressStats.slhd.is_finalized,
    },
    {
      stage: 'Tahap 2 (Penghargaan)',
      progress: progressStats.penghargaan.is_finalized ? 100 : 0,
      detail: progressStats.slhd.is_finalized
        ? (progressStats.penghargaan.is_finalized 
            ? `Difinalisasi - ${progressStats.penghargaan.finalized} DLH Lulus`
            : `Terbuka - ${progressStats.penghargaan.finalized}/${progressStats.total_dlh} DLH`)
        : 'Menunggu SLHD',
      isCompleted: progressStats.penghargaan.is_finalized,
    },
    {
      stage: 'Tahap 3 (Validasi 1)',
      progress: progressStats.validasi1.is_finalized ? 100 : 0,
      detail: progressStats.penghargaan.is_finalized
        ? (progressStats.validasi1.is_finalized
            ? `Difinalisasi - Lulus: ${progressStats.validasi1.lolos}/${progressStats.validasi1.processed} DLH`
            : `memproses ${progressStats.validasi1.processed} DLH`)
        : 'Menunggu Penghargaan',
      isCompleted: progressStats.validasi1.is_finalized,
    },
    {
      stage: 'Tahap 4 (Validasi 2)',
      progress: progressStats.validasi2.is_finalized ? 100 : (progressStats.validasi2.processed > 0 ? Math.round((progressStats.validasi2.checked / progressStats.validasi2.processed) * 100) : 0),
      detail: progressStats.validasi1.is_finalized
        ? (progressStats.validasi2.is_finalized
            ? `Difinalisasi - Lulus: ${progressStats.validasi2.lolos}/${progressStats.validasi2.processed} DLH`
            : `memproses: ${progressStats.validasi2.checked}/${progressStats.validasi2.processed} DLH`)
        : 'Menunggu Validasi 1',
      isCompleted: progressStats.validasi2.is_finalized,
    },
    {
      stage: 'Tahap 5 (Wawancara)',
      progress: progressStats.wawancara.is_finalized ? 100 : (progressStats.wawancara.with_nilai > 0 ? Math.round((progressStats.wawancara.with_nilai / progressStats.validasi2.lolos) * 100) : 0),
      detail: progressStats.validasi2.is_finalized
        ? (progressStats.wawancara.is_finalized
            ? `Selesai - ${progressStats.wawancara.processed} DLH Diproses`
            : `memproses: ${progressStats.wawancara.with_nilai}/${progressStats.validasi2.lolos} DLH`)
        : 'Menunggu Validasi 2',
      isCompleted: progressStats.wawancara.is_finalized,
    },
  ] : [];

  // Tampilkan UI setelah data terisi
  return (
    <div className="space-y-6 px-12 pb-10 animate-fade-in ">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {userName.toUpperCase()}
        </h1>
      </header>

      {/* Statistik Utama (5 Kartu) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800 whitespace-pre-line">
              {stat.type === 'number' ? stat.value : stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Progress Cards & Notifikasi */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Progress Cards (2 kolom dari 3) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-gray-800">Tahapan Penilaian</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {progressData.map((item, index) => (
              <ProgressCard
                key={index}
                stage={item.stage}
                progress={item.progress}
                detail={item.detail}
                isCompleted={item.isCompleted}
              />
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Notifikasi (1 kolom dari 3) - Panjang penuh */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-base font-bold text-gray-800">Notifikasi & Pengumuman</h2>
          <NotificationCard
            announcement={notifications.announcement || undefined}
            notification={notifications.notification || undefined}
          />
          
        </div>
      </section>

    </div>
  );
}