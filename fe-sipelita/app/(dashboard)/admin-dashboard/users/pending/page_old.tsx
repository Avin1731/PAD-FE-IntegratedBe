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

const USERS_PER_PAGE = 25;
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

// Helper function untuk logging (Fire and Forget)
const logActivity = async (action: string, description: string) => {
  try {
    // Endpoint ini mungkin 404 sekarang, tapi kita siapkan kodenya
    await axios.post('/api/logs', {
      action,
      description,
      role: 'admin', // Hardcode sementara, nanti backend handle dari token
    });
  } catch (error) {
    // Silent error: Jangan ganggu user jika log gagal
    console.error('Gagal mencatat log:', error);
  }
};

export default function UsersPendingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'provinsi' | 'kabkota'>('provinsi');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stats, setStats] = useState({
    dlhProvinsi: 0,
    dlhKabKota: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(INITIAL_MODAL_CONFIG);

  // ---------------- FETCH USERS ---------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/admin/users/pending');
        const data: User[] = res.data;

        setUsers(data);
        setStats({
          dlhProvinsi: data.filter(u => u.jenis_dlh?.name === 'DLH Provinsi').length,
          dlhKabKota: data.filter(u => u.jenis_dlh?.name === 'DLH Kab-Kota').length,
        });
      } catch (error) {
        console.error('Gagal mengambil data user pending:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ---------------- FILTER + PAGINATION -------------
  const filteredUsers = users.filter((u) => {
    const jenis = activeTab === 'provinsi' ? 'DLH Provinsi' : 'DLH Kab-Kota';
    return u.jenis_dlh?.name === jenis;
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  
  const closeModal = () => {
    setIsModalOpen(false);
    if (isSubmitting) {
      setIsSubmitting(false);
    }
  };
  
  const resetModalConfig = () => {
    setModalConfig(INITIAL_MODAL_CONFIG);
  }

  // ---------------- PERFORM ACTION -------------------
  const performAction = async (action: 'approve' | 'reject', id: number) => {
    if (!id) {
      closeModal();
      return;
    }
    
    setIsSubmitting(true);

    const originalUsers = [...users];
    // Ambil data user untuk keperluan logging nama
    const targetUser = users.find(u => u.id === id);
    const optimisticUsers = users.filter(u => u.id !== id);
    setUsers(optimisticUsers);

    const key = activeTab === 'provinsi' ? 'dlhProvinsi' : 'dlhKabKota';
    setStats(prev => ({ ...prev, [key]: prev[key] - 1 }));

    setIsModalOpen(false);

    try {
      if (action === 'approve') {
        await axios.post(`/api/admin/users/${id}/approve`);
        
        // --- LOGGING ---
        logActivity('Menyetujui Akun', `Menyetujui akun DLH: ${targetUser?.name || 'Unknown'}`);

        setModalConfig({
          title: 'Berhasil Approve',
          message: 'Pengguna telah berhasil disetujui.',
          variant: 'success',
          confirmLabel: 'OK',
          showCancelButton: false,
          onConfirm: closeModal, 
        });
        setIsModalOpen(true);

      } else {
        await axios.delete(`/api/admin/users/${id}/reject`);
        
        // --- LOGGING ---
        logActivity('Menolak Akun', `Menolak akun DLH: ${targetUser?.name || 'Unknown'}`);

        setModalConfig({
          title: 'Berhasil Reject',
          message: 'Pengguna berhasil ditolak dan dihapus.',
          variant: 'success',
          confirmLabel: 'OK',
          showCancelButton: false,
          onConfirm: closeModal,
        });
        setIsModalOpen(true);
      }

    } catch (error) {
      console.error(`Gagal ${action} pengguna:`, error);
      setUsers(originalUsers);
      
      setModalConfig({
        title: `Gagal ${action}`,
        message: 'Terjadi kesalahan. Data dikembalikan ke kondisi semula.',
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

  const handleApproveClick = (id: number) => {
    if (isSubmitting) return;
    
    setModalConfig({
      title: 'Konfirmasi Approve',
      message: 'Apakah Anda yakin ingin menyetujui pengguna ini?',
      variant: 'warning',
      confirmLabel: 'Approve',
      showCancelButton: true,
      onConfirm: () => {
        if (isSubmitting) {
            closeModal();
            return;
        }
        performAction('approve', id);
      },
    });
    setIsModalOpen(true);
  };

  const handleRejectClick = (id: number) => {
    if (isSubmitting) return;

    setModalConfig({
      title: 'Konfirmasi Reject',
      message: 'Apakah Anda yakin ingin menolak dan menghapus pengguna ini?',
      variant: 'danger',
      confirmLabel: 'Reject',
      showCancelButton: true,
      onConfirm: () => {
         if (isSubmitting) {
            closeModal();
            return;
         }
        performAction('reject', id);
      },
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-yellow-600">Memuat Data...</h1>
        <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-yellow-800">Manajemen Pengguna Pending</h1>
        <p className="text-gray-600">Daftar pengguna DLH yang menunggu persetujuan admin.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="#dlh"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            setActiveTab("provinsi");
          }}
          className="block transition-transform duration-300 hover:scale-105"
        >
          <StatCard
            {...statCardColors[0]}
            title="Total DLH Provinsi Pending"
            value={stats.dlhProvinsi}
          />
        </Link>

        <Link
          href="#dlh"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            setActiveTab("kabkota");
          }}
          className="block transition-transform duration-300 hover:scale-105"
        >
          <StatCard
            {...statCardColors[1]}
            title="Total DLH Kab/Kota Pending"
            value={stats.dlhKabKota}
          />
        </Link>
      </div>

      <InnerNav
        tabs={[
          { label: 'DLH Provinsi', value: 'provinsi' },
          { label: 'DLH Kab/Kota', value: 'kabkota' },
        ]}
        activeTab={activeTab}
        onChange={(value) => setActiveTab(value as 'provinsi' | 'kabkota')}
      />

      <UserTable
        users={paginatedUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role?.name ?? 'DLH',
          jenis_dlh: u.jenis_dlh?.name,
          status: 'pending',
          province: u.province_name ?? '-',
          regency: u.regency_name ?? '-',
        }))}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
        showLocation={true}
        showDlhSpecificColumns={true}
        isSubmitting={isSubmitting} 
      />

      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">
          Menampilkan {paginatedUsers.length} dari {filteredUsers.length} pengguna
        </span>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          siblings={1}
        />
      </div>

      <UniversalModal
        isOpen={isModalOpen}
        onClose={closeModal} 
        onExitComplete={resetModalConfig} 
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel="Batal"
        showCancelButton={modalConfig.showCancelButton}
      />
    </div>
  );
}