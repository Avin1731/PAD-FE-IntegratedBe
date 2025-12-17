'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '@/context/AuthContext';
import InnerNav from '@/components/InnerNav';
import UserTable from '@/components/UserTable';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import axios from '@/lib/axios';
import { FiSearch } from 'react-icons/fi'; 

const USERS_PER_PAGE = 25;
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

// Cache structure
interface CacheEntry {
  data: any;
  timestamp: number;
}

const dataCache: Record<string, CacheEntry> = {};

// 🎨 Warna per-card untuk StatCard biasa
const statCardColors = [
  { bg: 'bg-blue-50', border: 'border-blue-300', titleColor: 'text-blue-600', valueColor: 'text-blue-800' },
  { bg: 'bg-blue-50', border: 'border-blue-300', titleColor: 'text-blue-600', valueColor: 'text-blue-800' },
  { bg: 'bg-green-50', border: 'border-green-300', titleColor: 'text-green-600', valueColor: 'text-green-800' },
  { bg: 'bg-red-50', border: 'border-red-300', titleColor: 'text-red-600', valueColor: 'text-red-800' },
];

// Komponen StatCard dengan Progress Bar
const ProgressStatCard = ({ title, current, max, color = 'blue' }: { title: string; current: number; max: number; color?: 'blue' | 'green' | 'red' }) => {
  const percentage = Math.min(100, (current / max) * 100);
  const colorClasses = {
    blue: { bar: 'bg-blue-500', border: 'border-blue-300', text: 'text-blue-600' },
    green: { bar: 'bg-green-500', border: 'border-green-300', text: 'text-green-600' },
    red: { bar: 'bg-red-500', border: 'border-red-300', text: 'text-red-600' },
  };

  const selectedColors = colorClasses[color];

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${selectedColors.border} p-6 h-full flex flex-col`}>
      <div>
        <h3 className={`text-sm font-medium ${selectedColors.text} mb-1`}>{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{current} / {max}</p>
      </div>
      <div className="mt-auto">
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${selectedColors.bar}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function UsersAktifPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  
  // Tab state
  const [activeTab, setActiveTab] = useState('dlh');
  const [activeDlhTab, setActiveDlhTab] = useState('provinsi');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Data per role
  const [dlhProvData, setDlhProvData] = useState<any>(null);
  const [dlhKabData, setDlhKabData] = useState<any>(null);
  const [pusdatinData, setPusdatinData] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState({
    dlhProvinsi: 0,
    dlhKabKota: 0,
    pusdatin: 0,
  });

  // Helper: Check cache validity
  const isCacheValid = (key: string): boolean => {
    if (!dataCache[key]) return false;
    const age = Date.now() - dataCache[key].timestamp;
    return age < CACHE_DURATION;
  };

  // Helper: Fetch dengan cache
  const fetchWithCache = useCallback(async (endpoint: string, cacheKey: string) => {
    // Check cache first
    if (isCacheValid(cacheKey)) {
      console.log(`Using cached data for ${cacheKey}`);
      return dataCache[cacheKey].data;
    }

    // Fetch dari API
    setLoading(prev => ({ ...prev, [cacheKey]: true }));
    try {
      const res = await axios.get(endpoint);
      const data = res.data;
      
      // Store in cache
      dataCache[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      
      return data;
    } catch (e) {
      console.error(`Gagal fetch ${endpoint}:`, e);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, []);

  // Fetch stats untuk semua role di awal (untuk preview angka)
  useEffect(() => {
    const fetchAllStats = async () => {
      // Fetch semua stats secara parallel untuk preview
      const [provData, kabData, pusdatinDataRes] = await Promise.all([
        fetchWithCache('/api/admin/provinsi/1?per_page=1', 'dlh-prov-stats'),
        fetchWithCache('/api/admin/kabupaten/1?per_page=1', 'dlh-kab-stats'),
        fetchWithCache('/api/admin/pusdatin/1?per_page=1', 'pusdatin-stats'),
      ]);

      setStats({
        dlhProvinsi: provData?.total || 0,
        dlhKabKota: kabData?.total || 0,
        pusdatin: pusdatinDataRes?.total || 0,
      });
    };

    fetchAllStats();
  }, [fetchWithCache]);

  // Fetch data berdasarkan tab yang aktif
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'dlh') {
        // Fetch DLH Provinsi
        if (activeDlhTab === 'provinsi' && !dlhProvData) {
          const data = await fetchWithCache('/api/admin/provinsi/1', 'dlh-prov');
          if (data) {
            setDlhProvData(data);
          }
        }
        // Fetch DLH Kab/Kota
        if (activeDlhTab === 'kabkota' && !dlhKabData) {
          const data = await fetchWithCache('/api/admin/kabupaten/1', 'dlh-kab');
          if (data) {
            setDlhKabData(data);
          }
        }
      } else if (activeTab === 'pusdatin' && !pusdatinData) {
        const data = await fetchWithCache('/api/admin/pusdatin/1', 'pusdatin');
        if (data) {
          setPusdatinData(data);
        }
      }
    };

    fetchData();
  }, [activeTab, activeDlhTab, dlhProvData, dlhKabData, pusdatinData, fetchWithCache]);

  // Get current data based on active tab
  const getCurrentData = useMemo(() => {
    if (activeTab === 'dlh') {
      return activeDlhTab === 'provinsi' ? dlhProvData : dlhKabData;
    } else if (activeTab === 'pusdatin') {
      return pusdatinData;
    }
    return null;
  }, [activeTab, activeDlhTab, dlhProvData, dlhKabData, pusdatinData]);

  // Get current users from pagination data
  const currentUsers = useMemo(() => {
    if (!getCurrentData?.data) return [];
    return getCurrentData.data;
  }, [getCurrentData]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return currentUsers;
    
    const lowerTerm = searchTerm.toLowerCase();
    return currentUsers.filter((user: any) => 
      user.name?.toLowerCase().includes(lowerTerm) || 
      user.email?.toLowerCase().includes(lowerTerm) ||
      user.dinas?.nama_dinas?.toLowerCase().includes(lowerTerm)
    );
  }, [currentUsers, searchTerm]);

  // Total pages dari API atau dari filtered
  const totalPages = getCurrentData?.last_page || 1;

  // Reset page ketika tab berubah
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm(''); 
  }, [activeTab, activeDlhTab]);

  // Handle page change - fetch new data if needed
  const handlePageChange = useCallback(async (page: number) => {
    // Update current page immediately
    setCurrentPage(page);
    
    // Fetch data untuk page baru
    let endpoint = '';
    let cacheKey = '';
    
    if (activeTab === 'dlh') {
      if (activeDlhTab === 'provinsi') {
        endpoint = `/api/admin/provinsi/1?page=${page}`;
        cacheKey = `dlh-prov-${page}`;
      } else {
        endpoint = `/api/admin/kabupaten/1?page=${page}`;
        cacheKey = `dlh-kab-${page}`;
      }
    } else if (activeTab === 'pusdatin') {
      endpoint = `/api/admin/pusdatin/1?page=${page}`;
      cacheKey = `pusdatin-${page}`;
    }

    if (endpoint) {
      const data = await fetchWithCache(endpoint, cacheKey);
      
      if (data) {
        // Update state berdasarkan tab aktif
        if (activeTab === 'dlh') {
          if (activeDlhTab === 'provinsi') {
            setDlhProvData(data);
          } else {
            setDlhKabData(data);
          }
        } else if (activeTab === 'pusdatin') {
          setPusdatinData(data);
        }
      }
    }
  }, [activeTab, activeDlhTab, fetchWithCache]);

  // Tabs
  const dlhTabs = [
    { label: 'Provinsi', value: 'provinsi' },
    { label: 'Kab/Kota', value: 'kabkota' },
  ];

  const mainTabs = [
    { label: 'DLH', value: 'dlh' },
    { label: 'Pusdatin', value: 'pusdatin' },
    { label: 'Admin', value: 'admin' },
  ];

  const isDlhTabActive = activeTab === 'dlh';

  // Stats Data
  const statsData = [
    { title: 'Total DLH Provinsi Aktif', value: stats.dlhProvinsi, max: 38, type: 'progress', color: 'blue' as const, link: '#dlh' },
    { title: 'Total DLH Kab/Kota Aktif', value: stats.dlhKabKota, max: 538, type: 'progress', color: 'blue' as const, link: '#dlh' },
    { title: 'Total Pusdatin Aktif', value: stats.pusdatin, type: 'simple', color: 'green' as const, link: '#pusdatin' },
  ];

  const isLoading = loading['dlh-prov'] || loading['dlh-kab'] || loading['pusdatin'];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-green-800">Manajemen Pengguna Aktif</h1>
        <p className="text-gray-600">Daftar pengguna yang telah diverifikasi dan aktif di sistem.</p>
      </header>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {statsData.map((stat, index) => (
          <Link
            key={index}
            href={stat.link}
            onClick={(e) => {
              e.preventDefault();
              if (stat.link === '#dlh') {
                setActiveTab('dlh');
                setActiveDlhTab(stat.title.includes('Provinsi') ? 'provinsi' : 'kabkota');
              } else if (stat.link === '#pusdatin') {
                setActiveTab('pusdatin');
              } else if (stat.link === '#admin') {
                setActiveTab('admin');
              }
            }}
            className="h-full block transition-transform hover:scale-105"
          >
            {stat.type === 'progress' ? (
              <ProgressStatCard
                title={stat.title}
                current={stat.value ?? 0}
                max={stat.max ?? 0}
                color={stat.color}
              />
            ) : (
              <div className={`bg-white rounded-xl shadow-sm border ${statCardColors[index].border} p-6 h-full flex flex-col justify-center`}>
                <h3 className={`text-sm font-medium ${statCardColors[index].titleColor} mb-1`}>{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Main Tabs */}
      <InnerNav tabs={mainTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* DLH Sub Tabs */}
      {activeTab === 'dlh' && (
        <InnerNav
          tabs={dlhTabs}
          activeTab={activeDlhTab}
          onChange={setActiveDlhTab}
          className="mt-0"
        />
      )}

      {/* --- SEARCH BAR --- */}
      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Cari nama atau email ${activeTab === 'dlh' ? (activeDlhTab === 'provinsi' ? 'DLH Provinsi' : 'DLH Kab/Kota') : activeTab}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Tabel User */}
      {!isLoading && (
        <>
          <UserTable
            users={filteredUsers.map((u: any) => ({
              id: u.id,
              name: u.name || u.email,
              email: u.email,
              role: u.role ?? (activeTab === 'dlh' ? 'DLH' : 'Pusdatin'),
              jenis_dlh: activeDlhTab === 'provinsi' ? 'DLH Provinsi' : 'DLH Kab-Kota',
              status: 'aktif',
              province: u.province_name ?? '-',
              regency: u.regency_name ?? '-',
            }))}
            showLocation={isDlhTabActive}
            showDlhSpecificColumns={isDlhTabActive}
          />

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-600">
              Menampilkan {filteredUsers.length} dari {getCurrentData?.total || 0} pengguna
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              siblings={1}
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data pengguna</p>
        </div>
      )}
    </div>
  );
}