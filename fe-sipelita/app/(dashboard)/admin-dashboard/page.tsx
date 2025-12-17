'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';
import Link from 'next/link';
import axios from '@/lib/axios';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    total_users_aktif: 0,
    total_users_pending: 0,
  });
  const [loading, setLoading] = useState(true);

  // Role guard
  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    
    const role = user.role?.name?.toLowerCase();
    if (role !== 'admin') {
      // Redirect ke dashboard yang sesuai
      if (role === 'pusdatin') router.replace('/pusdatin-dashboard');
      else if (role === 'provinsi' || role === 'kabupaten/kota') router.replace('/dlh-dashboard');
      else router.replace('/login');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const res = await axios.get('/api/admin/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Gagal mengambil statistik dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user || loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Admin</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>
          <div className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali, Admin. Berikut ringkasan sistem saat ini.</p>
      </header>

      {/* Statistik Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kartu User Aktif */}
        <Link 
          href="/admin-dashboard/users/aktif"
          className="block transition-transform hover:scale-105"
        >
          <StatCard
            bgColor="bg-green-50"
            borderColor="border-green-300"
            titleColor="text-green-600"
            valueColor="text-green-800"
            title="Total User Aktif"
            value={stats.total_users_aktif.toString()}
          />
        </Link>

        {/* Kartu User Pending */}
        <Link 
          href="/admin-dashboard/users/pending"
          className="block transition-transform hover:scale-105"
        >
          <StatCard
            bgColor="bg-yellow-50"
            borderColor="border-yellow-300"
            titleColor="text-yellow-600"
            valueColor="text-yellow-800"
            title="Menunggu Persetujuan (Pending)"
            value={stats.total_users_pending.toString()}
          />
        </Link>

      </div>

      {/* Area Tambahan (Bisa diisi chart atau shortcut lain) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Link 
           href="/admin-dashboard/settings"
           className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
           <div>
             <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">Kelola Pusdatin</h3>
             <p className="text-sm text-gray-500">Tambah atau hapus akun khusus Pusdatin.</p>
           </div>
           <span className="text-2xl text-gray-400 group-hover:text-green-500">&rarr;</span>
        </Link>

        <Link 
           href="/admin-dashboard/users/logs"
           className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
           <div>
             <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Lihat Log Aktivitas</h3>
             <p className="text-sm text-gray-500">Pantau riwayat aktivitas pengguna di sistem.</p>
           </div>
           <span className="text-2xl text-gray-400 group-hover:text-blue-500">&rarr;</span>
        </Link>
      </div>

    </div>
  );
}