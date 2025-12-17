'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import StatCard from '@/components/StatCard';
import InnerNav from '@/components/InnerNav';
import UserTable from '@/components/UserTable';
import Pagination from '@/components/Pagination';
import UniversalModal from '@/components/UniversalModal';
import axios from '@/lib/axios';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';

const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

interface CacheEntry {
  data: any;
  timestamp: number;
}

const dataCache: Record<string, CacheEntry> = {};

const statCardColors = [
  { bg: 'bg-gray-50', border: 'border-yellow-300', titleColor: 'text-yellow-600', valueColor: 'text-yellow-800' },
  { bg: 'bg-gray-50', border: 'border-yellow-300', titleColor: 'text-yellow-600', valueColor: 'text-yellow-800' },
];

const INITIAL_MODAL_CONFIG = {
  title: '',
  message: '',
  variant: 'warning' as 'success' | 'warning' | 'danger',
  confirmLabel: 'Ya',
  showCancelButton: true,
  onConfirm: () => {},
};

// Helper function untuk logging
const logActivity = async (action: string, description: string) => {
  try {
    await axios.post('/api/logs', {
      action,
      description,
      role: 'admin',
    });
  } catch (error) {
    console.error('Gagal mencatat log:', error);
  }
};

export default function UsersPendingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'provinsi' | 'kabkota'>('provinsi');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data per role
  const [dlhProvData, setDlhProvData] = useState<any>(null);
  const [dlhKabData, setDlhKabData] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState({
    dlhProvinsi: 0,
    dlhKabKota: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(INITIAL_MODAL_CONFIG);

  // Helper: Check cache validity
  const isCacheValid = (key: string): boolean => {
    if (!dataCache[key]) return false;
    const age = Date.now() - dataCache[key].timestamp;
    return age < CACHE_DURATION;
  };

  // Helper: Fetch dengan cache
  const fetchWithCache = useCallback(async (endpoint: string, cacheKey: string) => {
    if (isCacheValid(cacheKey)) {
      console.log(`Using cached data for ${cacheKey}`);
      return dataCache[cacheKey].data;
    }

    setLoading(prev => ({ ...prev, [cacheKey]: true }));
    try {
      const res = await axios.get(endpoint);
      const data = res.data;
      
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

  // Fetch stats untuk preview
  useEffect(() => {
    const fetchAllStats = async () => {
      const [provData, kabData] = await Promise.all([
        fetchWithCache('/api/admin/provinsi/0?per_page=1', 'dlh-prov-pending-stats'),
        fetchWithCache('/api/admin/kabupaten/0?per_page=1', 'dlh-kab-pending-stats'),
      ]);

      setStats({
        dlhProvinsi: provData?.total || 0,
        dlhKabKota: kabData?.total || 0,
      });
    };

    fetchAllStats();
  }, [fetchWithCache]);

  // Fetch data berdasarkan tab yang aktif
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'provinsi' && !dlhProvData) {
        const data = await fetchWithCache('/api/admin/provinsi/0', 'dlh-prov-pending');
        if (data) {
          setDlhProvData(data);
        }
      } else if (activeTab === 'kabkota' && !dlhKabData) {
        const data = await fetchWithCache('/api/admin/kabupaten/0', 'dlh-kab-pending');
        if (data) {
          setDlhKabData(data);
        }
      }
    };

    fetchData();
  }, [activeTab, dlhProvData, dlhKabData, fetchWithCache]);

  // Get current data based on active tab
  const getCurrentData = useMemo(() => {
    return activeTab === 'provinsi' ? dlhProvData : dlhKabData;
  }, [activeTab, dlhProvData, dlhKabData]);

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
      user.email?.toLowerCase().includes(lowerTerm) ||
      user.dinas?.nama_dinas?.toLowerCase().includes(lowerTerm)
    );
  }, [currentUsers, searchTerm]);

  const totalPages = getCurrentData?.last_page || 1;

  // Reset page ketika tab berubah
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
  }, [activeTab]);

  // Handle page change
  const handlePageChange = useCallback(async (page: number) => {
    setCurrentPage(page);
    
    let endpoint = '';
    let cacheKey = '';
    
    if (activeTab === 'provinsi') {
      endpoint = `/api/admin/provinsi/0?page=${page}`;
      cacheKey = `dlh-prov-pending-${page}`;
    } else {
      endpoint = `/api/admin/kabupaten/0?page=${page}`;
      cacheKey = `dlh-kab-pending-${page}`;
    }

    if (endpoint) {
      const data = await fetchWithCache(endpoint, cacheKey);
      
      if (data) {
        if (activeTab === 'provinsi') {
          setDlhProvData(data);
        } else {
          setDlhKabData(data);
        }
      }
    }
  }, [activeTab, fetchWithCache]);

  const closeModal = () => {
    setIsModalOpen(false);
    if (isSubmitting) {
      setIsSubmitting(false);
    }
  };

  // Clear cache setelah action berhasil
  const clearPendingCache = () => {
    Object.keys(dataCache).forEach(key => {
      if (key.includes('pending')) {
        delete dataCache[key];
      }
    });
  };

  // Handle approve
  const handleApproveClick = (id: number) => {
    const targetUser = currentUsers.find((u: any) => u.id === id);
    setModalConfig({
      title: 'Konfirmasi Approve',
      message: `Apakah Anda yakin ingin menyetujui akun ${targetUser?.email || 'ini'}?`,
      variant: 'warning',
      confirmLabel: 'Ya, Setujui',
      showCancelButton: true,
      onConfirm: () => performAction('approve', id),
    });
    setIsModalOpen(true);
  };

  // Handle reject
  const handleRejectClick = (id: number) => {
    const targetUser = currentUsers.find((u: any) => u.id === id);
    setModalConfig({
      title: 'Konfirmasi Reject',
      message: `Apakah Anda yakin ingin menolak akun ${targetUser?.email || 'ini'}? Akun akan dihapus.`,
      variant: 'danger',
      confirmLabel: 'Ya, Tolak',
      showCancelButton: true,
      onConfirm: () => performAction('reject', id),
    });
    setIsModalOpen(true);
  };

  // Perform action
  const performAction = async (action: 'approve' | 'reject', id: number) => {
    if (!id) {
      closeModal();
      return;
    }
    
    setIsSubmitting(true);
    setIsModalOpen(false);

    const targetUser = currentUsers.find((u: any) => u.id === id);

    try {
      if (action === 'approve') {
        await axios.patch(`/api/admin/users/approve/${id}`);
        logActivity('Menyetujui Akun', `Menyetujui akun DLH: ${targetUser?.email || 'Unknown'}`);

        setModalConfig({
          title: 'Berhasil Approve',
          message: 'Pengguna telah berhasil disetujui.',
          variant: 'success',
          confirmLabel: 'OK',
          showCancelButton: false,
          onConfirm: closeModal, 
        });
      } else {
        await axios.delete(`/api/admin/users/reject/${id}`);
        logActivity('Menolak Akun', `Menolak akun DLH: ${targetUser?.email || 'Unknown'}`);

        setModalConfig({
          title: 'Berhasil Reject',
          message: 'Pengguna berhasil ditolak dan dihapus.',
          variant: 'success',
          confirmLabel: 'OK',
          showCancelButton: false,
          onConfirm: closeModal,
        });
      }

      // Clear cache dan refetch
      clearPendingCache();
      
      // Refetch data current page
      const endpoint = activeTab === 'provinsi' 
        ? `/api/admin/provinsi/0?page=${currentPage}`
        : `/api/admin/kabupaten/0?page=${currentPage}`;
      const cacheKey = activeTab === 'provinsi' 
        ? `dlh-prov-pending-${currentPage}`
        : `dlh-kab-pending-${currentPage}`;
      
      const newData = await fetchWithCache(endpoint, cacheKey);
      if (newData) {
        if (activeTab === 'provinsi') {
          setDlhProvData(newData);
        } else {
          setDlhKabData(newData);
        }
        
        // Update stats
        setStats(prev => ({
          ...prev,
          [activeTab === 'provinsi' ? 'dlhProvinsi' : 'dlhKabKota']: newData.total || 0
        }));
      }

      setIsModalOpen(true);

    } catch (error) {
      console.error(`Gagal ${action} pengguna:`, error);
      
      setModalConfig({
        title: `Gagal ${action}`,
        message: 'Terjadi kesalahan saat memproses permintaan.',
        variant: 'danger',
        confirmLabel: 'Tutup',
        showCancelButton: false,
        onConfirm: closeModal,
      });
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tabs
  const dlhTabs = [
    { label: 'Provinsi', value: 'provinsi' },
    { label: 'Kab/Kota', value: 'kabkota' },
  ];

  // Stats Data
  const statsData = [
    { title: 'Total DLH Provinsi Pending', value: stats.dlhProvinsi, link: '#provinsi' },
    { title: 'Total DLH Kab/Kota Pending', value: stats.dlhKabKota, link: '#kabkota' },
  ];

  const isLoading = loading['dlh-prov-pending'] || loading['dlh-kab-pending'];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-yellow-800">Manajemen Pengguna Pending</h1>
        <p className="text-gray-600">Daftar pengguna DLH yang menunggu persetujuan admin.</p>
      </header>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statsData.map((stat, index) => (
          <Link
            key={index}
            href={stat.link}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              setActiveTab(stat.link === '#provinsi' ? 'provinsi' : 'kabkota');
            }}
            className="block transition-transform hover:scale-105"
          >
            <StatCard
              title={stat.title}
              value={stat.value ?? 0}
              {...statCardColors[index]}
            />
          </Link>
        ))}
      </div>

      {/* DLH Tabs */}
      <InnerNav
        tabs={dlhTabs}
        activeTab={activeTab}
        onChange={(value) => setActiveTab(value as 'provinsi' | 'kabkota')}
      />

      {/* Search Bar */}
      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Cari email atau nama dinas...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      )}

      {/* Tabel User */}
      {!isLoading && (
        <>
          <UserTable
            users={filteredUsers.map((u: any) => ({
              id: u.id,
              name: u.email,
              email: u.email,
              role: 'DLH',
              jenis_dlh: activeTab === 'provinsi' ? 'DLH Provinsi' : 'DLH Kab-Kota',
              status: 'pending' as const,
              province: u.province_name ?? '-',
              regency: u.regency_name ?? '-',
            }))}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            showLocation={true}
            showDlhSpecificColumns={true}
            isSubmitting={isSubmitting}
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
          <p className="text-gray-500">Tidak ada pengguna pending</p>
        </div>
      )}

      {/* Modal */}
      <UniversalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
        showCancelButton={modalConfig.showCancelButton}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
