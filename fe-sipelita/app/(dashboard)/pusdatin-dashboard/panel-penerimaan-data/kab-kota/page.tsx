'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiFileText, FiAward, FiSearch } from 'react-icons/fi';
import axios from '@/lib/axios';
import UniversalModal from '@/components/UniversalModal';
import PenerimaanTable, { SlhdData, IklhData, TableItem } from '@/components/penerimaan/PenerimaanTable';

// --- INTERFACES ---
interface Province {
  id: string;
  name: string;
}

const PEMBAGIAN_DAERAH_OPTIONS = [
  "Kabupaten/Kota Kecil", "Kabupaten/Kota Sedang", "Kabupaten/Kota Besar"
];

const INITIAL_MODAL_CONFIG = {
  title: '',
  message: '',
  variant: 'warning' as 'success' | 'warning' | 'danger',
  showCancelButton: true,
  onConfirm: () => {},
  confirmLabel: 'Ya',
  cancelLabel: 'Batal',
};

// Mock data fallback
const MOCK_PROVINCES: Province[] = [
  { id: '1', name: 'Jawa Barat' },
  { id: '2', name: 'Jawa Tengah' },
  { id: '3', name: 'Jawa Timur' },
  { id: '4', name: 'Bali' },
  { id: '5', name: 'Sumatera Utara' },
];

const MOCK_SLHD_DATA: SlhdData[] = [
  { 
    id: 1, 
    kabkota: 'Kota Bandung', 
    provinsi: 'Jawa Barat', 
    pembagian_daerah: 'Kabupaten/Kota Besar', 
    tipologi: 'Daratan',
    buku_1: 'SLHD_Bandung_Buku1.pdf',
    buku_2: 'SLHD_Bandung_Buku2.pdf',
    tabel_utama: 'SLHD_Bandung_Tabel.xlsx'
  },
  { 
    id: 2, 
    kabkota: 'Kota Semarang', 
    provinsi: 'Jawa Tengah', 
    pembagian_daerah: 'Kabupaten/Kota Sedang', 
    tipologi: 'Pesisir',
    buku_1: 'SLHD_Semarang_Buku1.pdf',
    buku_2: null,
    tabel_utama: 'SLHD_Semarang_Tabel.xlsx'
  },
];

const MOCK_IKLH_DATA: IklhData[] = [
  { 
    id: 1, 
    kabkota: 'Kota Bandung', 
    provinsi: 'Jawa Barat', 
    jenis_dlh: 'Kabupaten/Kota Besar', 
    tipologi: 'Daratan',
    ika: 85.5,
    iku: 78.2,
    ikl: 82.1,
    ik_pesisir: 0,
    ik_kehati: 88.3,
    total_iklh: 83.25,
    verifikasi: false
  },
  { 
    id: 2, 
    kabkota: 'Kota Semarang', 
    provinsi: 'Jawa Tengah', 
    jenis_dlh: 'Kabupaten/Kota Sedang', 
    tipologi: 'Pesisir',
    ika: 78.5,
    iku: 72.3,
    ikl: 75.8,
    ik_pesisir: 80.2,
    ik_kehati: 77.6,
    total_iklh: 76.88,
    verifikasi: false
  },
];

export default function PenerimaanKabKotaPage() {
  const [activeTab, setActiveTab] = useState<'SLHD' | 'IKLH'>('SLHD');
  const [loading, setLoading] = useState(true);
  const [slhdData, setSlhdData] = useState<SlhdData[]>([]);
  const [iklhData, setIklhData] = useState<IklhData[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);

  const [filterProvinsiId, setFilterProvinsiId] = useState('');
  const [filterProvinsiName, setFilterProvinsiName] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterJenis, setFilterJenis] = useState('');
  const [filterTipologi, setFilterTipologi] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(INITIAL_MODAL_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Gunakan Promise.allSettled untuk handle error individual
        const [provRes, slhdRes, iklhRes] = await Promise.allSettled([
          axios.get('/api/provinces'),
          axios.get('/api/penerimaan/kab-kota/slhd'),
          axios.get('/api/penerimaan/kab-kota/iklh'),
        ]);

        // Handle provinces
        if (provRes.status === 'fulfilled') {
          setProvinces(provRes.value.data || []);
        } else {
          console.warn('Failed to fetch provinces, using mock data');
          setProvinces(MOCK_PROVINCES);
        }

        // Handle SLHD data
        if (slhdRes.status === 'fulfilled') {
          const data = slhdRes.value.data;
          setSlhdData(Array.isArray(data) ? data : data?.data || []);
        } else {
          console.warn('Failed to fetch SLHD data, using mock data');
          setSlhdData(MOCK_SLHD_DATA);
        }

        // Handle IKLH data
        if (iklhRes.status === 'fulfilled') {
          const data = iklhRes.value.data;
          setIklhData(Array.isArray(data) ? data : data?.data || []);
        } else {
          console.warn('Failed to fetch IKLH data, using mock data');
          setIklhData(MOCK_IKLH_DATA);
        }

      } catch (error) {
        console.error("Gagal memuat data:", error);
        // Fallback to mock data
        setProvinces(MOCK_PROVINCES);
        setSlhdData(MOCK_SLHD_DATA);
        setIklhData(MOCK_IKLH_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const closeModal = () => setIsModalOpen(false);
  const resetModalConfig = () => setModalConfig(INITIAL_MODAL_CONFIG);

  const checkIsVerified = (val: boolean | number) => {
    return val === true || val === 1;
  };

  const handleVerificationClick = (item: IklhData) => {
    if (checkIsVerified(item.verifikasi)) return;
    if (isProcessing) return;

    setModalConfig({
      title: 'Verifikasi Data IKLH',
      message: `Apakah Anda yakin ingin memverifikasi data IKLH untuk ${item.kabkota}?`,
      variant: 'warning',
      showCancelButton: true,
      confirmLabel: 'Verifikasi',
      cancelLabel: 'Batal',
      onConfirm: () => performVerification(item.id),
    });
    setIsModalOpen(true);
  };

  const performVerification = async (id: number) => {
    setIsProcessing(true);
    setIsModalOpen(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulasi API
      // await axios.post(`/api/penerimaan/kab-kota/iklh/${id}/verify`); 

      setIklhData(prevData => 
        prevData.map(item => 
          item.id === id ? { ...item, verifikasi: true } : item
        )
      );

      setModalConfig({
        title: 'Berhasil',
        message: 'Data IKLH berhasil diverifikasi.',
        variant: 'success',
        showCancelButton: false,
        confirmLabel: 'OK',
        onConfirm: closeModal,
        cancelLabel: '',
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Gagal verifikasi:", error);
      setModalConfig({
        title: 'Gagal',
        message: 'Terjadi kesalahan saat memverifikasi.',
        variant: 'danger',
        showCancelButton: false,
        confirmLabel: 'Tutup',
        onConfirm: closeModal,
        cancelLabel: '',
      });
      setIsModalOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTableData = useMemo(() => {
    const data: TableItem[] = activeTab === 'SLHD' ? slhdData : iklhData;

    return data.filter((item) => {
      if (filterProvinsiName && item.provinsi.toLowerCase() !== filterProvinsiName.toLowerCase()) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!item.kabkota.toLowerCase().includes(term) && !item.provinsi.toLowerCase().includes(term)) return false;
      }
      
      let jenis = '';
      if ('pembagian_daerah' in item) {
        jenis = item.pembagian_daerah;
      } else {
        jenis = item.jenis_dlh;
      }

      if (filterJenis && jenis !== filterJenis) return false;
      if (filterTipologi && item.tipologi !== filterTipologi) return false;
      return true;
    });
  }, [activeTab, slhdData, iklhData, filterProvinsiName, searchTerm, filterJenis, filterTipologi]);

  const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setFilterProvinsiId(id);
    const prov = provinces.find(p => p.id === id);
    setFilterProvinsiName(prov ? prov.name : '');
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* HEADER DENGAN BREADCRUMB YANG DIPERBAIKI */}
      <div>
        {/* Breadcrumb yang diperbaiki */}
        <div className="flex items-center text-sm text-green-600 mb-2">
          <span className="cursor-pointer hover:underline">Dashboard</span>
          <span className="mx-2">&gt;</span>
          <span className="cursor-pointer hover:underline">Penerimaan Data</span>
          <span className="mx-2">&gt;</span>
          <span className="font-semibold">Kabupaten/Kota</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Penerimaan {activeTab === 'SLHD' ? 'SLHD' : 'IKLH'} Kab/Kota
        </h1>
        <p className="text-gray-600">
          Atur Penerimaan Data Nilai Nirwasita Tantra dari Dokumen-Dokumen Kab/Kota.
        </p>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        
        {/* Search Wilayah */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Cari Wilayah</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiSearch className="text-lg" />
            </div>
            <input
              type="text"
              placeholder="Ketik nama Kab/Kota..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-[#00A86B] transition-all placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Provinsi */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Provinsi</label>
          <div className="relative">
            <select 
              className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-[#00A86B] transition-all bg-white cursor-pointer"
              value={filterProvinsiId}
              onChange={handleProvinsiChange}
            >
              <option value="">Semua Provinsi</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Filter Pembagian Daerah */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Pembagian Daerah</label>
          <div className="relative">
            <select 
              className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-[#00A86B] transition-all bg-white cursor-pointer"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {PEMBAGIAN_DAERAH_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Filter Tipologi */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Topologi Wilayah</label>
          <div className="relative">
            <select 
              className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-[#00A86B] transition-all bg-white cursor-pointer"
              value={filterTipologi}
              onChange={(e) => setFilterTipologi(e.target.value)}
            >
              <option value="">Semua Topologi</option>
              <option value="Daratan">Daratan</option>
              <option value="Pesisir">Pesisir</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button onClick={() => setActiveTab('SLHD')} className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-colors border-b-2 ${activeTab === 'SLHD' ? 'border-[#00A86B] text-[#00A86B]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <FiFileText className="text-lg" /> SLHD
          </button>
          <button onClick={() => setActiveTab('IKLH')} className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-colors border-b-2 ${activeTab === 'IKLH' ? 'border-[#00A86B] text-[#00A86B]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <FiAward className="text-lg" /> IKLH
          </button>
        </div>
      </div>

      {/* Use the new Component */}
      <PenerimaanTable 
        activeTab={activeTab}
        data={filteredTableData}
        onVerify={handleVerificationClick}
        isProcessing={isProcessing}
        currentPath='kab-kota'
      />

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