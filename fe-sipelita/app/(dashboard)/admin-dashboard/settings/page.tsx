'use client';

import { useState, useEffect, useCallback } from 'react'; // Tambah useCallback
import { User } from '@/context/AuthContext'; 
import StatCard from '@/components/StatCard'; 
import UserTable from '@/components/UserTable'; 
import Pagination from '@/components/Pagination'; 
import Link from 'next/link';
import axios from '@/lib/axios';
import { HiPlus } from 'react-icons/hi'; 
import { FiSearch } from 'react-icons/fi'; 
import UniversalModal from '@/components/UniversalModal'; // 1. Import Modal

const USERS_PER_PAGE = 25; // (Sesuaikan kembali ke 25 atau 10)

const pusdatinColor = { 
  bg: 'bg-green-50', 
  border: 'border-green-300', 
  titleColor: 'text-green-600', 
  valueColor: 'text-green-800' 
};

const INITIAL_MODAL_CONFIG = {
  title: '',
  message: '',
  variant: 'warning' as 'success' | 'warning' | 'danger',
  showCancelButton: true,
  onConfirm: () => {},
  confirmLabel: 'Ya',
  cancelLabel: 'Batal',
};

// Helper Log
const logActivity = async (action: string, description: string) => {
  try {
    // await axios.post('/api/logs', { action, description, role: 'admin' });
  } catch (error) { console.error('Log failed', error); }
};

export default function SettingsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [allPusdatinUsers, setAllPusdatinUsers] = useState<User[]>([]); 
  const [filteredPusdatinUsers, setFilteredPusdatinUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 

  const [stats, setStats] = useState({ pusdatin: 0 });

  // State untuk Aksi Delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(INITIAL_MODAL_CONFIG);

  // --- Fetch Data (Dipisahkan agar bisa dipanggil ulang) ---
  const fetchUsers = useCallback(async () => {
    try {
      // setLoading(true); // Opsional: jangan set loading full page saat refresh data delete
      const res = await axios.get('/api/admin/pusdatin/1?per_page=100');
      
      // Response dari API adalah pagination object dengan struktur: { data: [...], total, current_page, last_page }
      const pusdatinUsers = res.data.data || [];

      setAllPusdatinUsers(pusdatinUsers);
      // Kita tidak setFilteredPusdatinUsers langsung disini agar search term tetap berlaku
      // Logic search di useEffect bawah akan menghandle pembaruan list
      setStats({ pusdatin: res.data.total || pusdatinUsers.length });
    } catch (e) {
      console.error('Gagal mengambil data user Pusdatin:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Logic Search ---
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = allPusdatinUsers.filter(user =>
      user.email?.toLowerCase().includes(lowerTerm) ||
      user.nomor_telepon?.toLowerCase().includes(lowerTerm)
    );
    setFilteredPusdatinUsers(filtered);
    // Jangan reset page jika hanya data yang berubah (bukan search term)
    // Tapi reset jika search term berubah.
  }, [searchTerm, allPusdatinUsers]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredPusdatinUsers.length / USERS_PER_PAGE);

  const paginatedUsers = () => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredPusdatinUsers.slice(start, start + USERS_PER_PAGE);
  };

  // --- Modal Helpers ---
  const closeModal = () => setIsModalOpen(false);
  const resetModalConfig = () => setModalConfig(INITIAL_MODAL_CONFIG);

  // --- Delete Handlers ---
  const handleDeleteClick = (id: number) => {
    if (isDeleting) return;

    const userToDelete = allPusdatinUsers.find(u => u.id === id);

    setModalConfig({
      title: 'Nonaktifkan Akun?',
      message: `Apakah Anda yakin ingin menghapus akun "${userToDelete?.name}"? Tindakan ini permanen.`,
      variant: 'danger',
      showCancelButton: true,
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      onConfirm: () => performDelete(id, userToDelete?.name || ''),
    });
    setIsModalOpen(true);
  };

  const performDelete = async (id: number, userName: string) => {
    setIsDeleting(true);
    setIsModalOpen(false); // Tutup modal konfirmasi

    try {
      // Sesuaikan endpoint dengan route API: DELETE /api/admin/pusdatin/{id}
      await axios.delete(`/api/admin/users/${id}`);
      
      // Log Activity
      logActivity('Menghapus Akun', `Menghapus akun Pusdatin: ${userName}`);

      // Modal Sukses
      setModalConfig({
        title: 'Berhasil Dihapus',
        message: 'Akun Pusdatin telah berhasil dihapus.',
        variant: 'success',
        showCancelButton: false,
        onConfirm: closeModal,
        confirmLabel: 'OK',
        cancelLabel: '',
      });
      setIsModalOpen(true);

      // Refresh Data
      fetchUsers();

    } catch (error) {
      console.error('Gagal menghapus user:', error);
      setModalConfig({
        title: 'Gagal',
        message: 'Terjadi kesalahan saat menghapus akun.',
        variant: 'danger',
        showCancelButton: false,
        onConfirm: closeModal,
        confirmLabel: 'Tutup',
        cancelLabel: '',
      });
      setIsModalOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-green-800">Memuat Data...</h1>
        <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-green-800">Pengaturan Pusdatin</h1>
        <p className="text-gray-600">Kelola akun pengguna khusus tim Pusdatin.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="h-full transition-transform hover:scale-105">
          <StatCard
            bgColor={pusdatinColor.bg}
            borderColor={pusdatinColor.border}
            titleColor={pusdatinColor.titleColor}
            valueColor={pusdatinColor.valueColor}
            title="Total Akun Pusdatin"
            value={stats.pusdatin.toString()}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari email atau nomor telepon Pusdatin..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Link
          href="/admin-dashboard/settings/add"
          className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow"
        >
          <HiPlus className="text-xl" />
          Buat Akun Pusdatin
        </Link>
      </div>



      <UserTable
        users={paginatedUsers().map((u) => ({
          id: u.id,
          name: u.email, // Gunakan email sebagai name karena kolom name sudah dihilangkan
          email: u.email,
          role: 'Pusdatin', 
          jenis_dlh: '-',   
          status: 'aktif',
          province: '-',
          regency: '-',
        }))}
        showLocation={false} 
        showDlhSpecificColumns={false} 
        
        // Props Baru untuk Delete
        onDelete={handleDeleteClick}
        isSubmitting={isDeleting} // Kunci tombol saat proses delete berlangsung
      />

      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">
          Menampilkan {paginatedUsers().length} dari {filteredPusdatinUsers.length} pengguna
        </span>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          siblings={1}
        />
      </div>

      {/* Modal */}
      <UniversalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onExitComplete={resetModalConfig}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        showCancelButton={modalConfig.showCancelButton}
        onConfirm={modalConfig.onConfirm}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
      />
    </div>
  );
}