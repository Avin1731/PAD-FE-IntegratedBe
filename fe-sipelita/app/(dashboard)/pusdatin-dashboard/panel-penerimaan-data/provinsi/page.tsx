'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiFileText, FiAward, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from '@/lib/axios';
import PenerimaanTable, { SlhdData, IklhData } from '@/components/penerimaan/PenerimaanTable';

const CURRENT_YEAR = new Date().getFullYear();

// Tab Button Component
function TabButton({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-green-600 text-green-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function PenerimaanProvinsiPage() {
  // State
  const [activeTab, setActiveTab] = useState<'SLHD' | 'IKLH'>('SLHD');
  const [loading, setLoading] = useState(true);
  const [slhdData, setSlhdData] = useState<SlhdData[]>([]);
  const [iklhData, setIklhData] = useState<IklhData[]>([]);
  
  // Filters
  const [filterTopologi, setFilterTopologi] = useState('');
  const [filterYear, setFilterYear] = useState(CURRENT_YEAR);
  const [search, setSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        per_page: 15,
        page,
        type: 'provinsi'
      };
      
      if (filterTopologi) params.topologi = filterTopologi;
      if (search) params.search = search;

      if (activeTab === 'SLHD') {
        const res = await axios.get(`/api/pusdatin/review/${filterYear}`, { params });
        const data = res.data?.data || [];
        
        console.log('Raw API data:', data[0]); // Debug
        
        setSlhdData(data.map((s: any) => ({
          id: s.submission_id || s.id,
          kabkota: s.dinas?.provinsi || s.dinas?.kabupaten_kota || '-',
          provinsi: s.dinas?.provinsi || '-',
          pembagian_daerah: 'Provinsi',
          tipologi: s.dinas?.tipologi || '-',
          buku_1: (s.buku_i && s.buku_i !== 'Belum Upload') ? 'Buku I' : null,
          buku_2: (s.buku_ii && s.buku_ii !== 'Belum Upload') ? 'Buku II' : null,
          tabel_utama: (s.tabel_utama && s.tabel_utama !== 'Belum Upload') ? 'Tabel Utama' : null,
          buku_1_status: s.buku_i,
          buku_2_status: s.buku_ii,
        })));
        
        setTotalPages(res.data?.last_page || 1);
        setTotal(res.data?.total || 0);
      } else {
        const res = await axios.get(`/api/pusdatin/review/iklh/${filterYear}`, { params });
        const data = res.data?.data || [];
        
        setIklhData(data.map((s: any) => ({
          id: s.id,
          kabkota: s.provinsi || '-',
          provinsi: s.provinsi || '-',
          jenis_dlh: s.jenis_dlh || '-',
          tipologi: s.tipologi || '-',
          ika: s.indeks_kualitas_air || 0,
          iku: s.indeks_kualitas_udara || 0,
          ikl: s.indeks_kualitas_lahan || 0,
          ik_pesisir: (s.has_pesisir === true || s.has_pesisir === 1 || s.has_pesisir === '1') 
            ? (s.indeks_kualitas_pesisir_laut || 0) 
            : null,
          ik_kehati: s.indeks_kualitas_kehati || 0,
          total_iklh: s.total_iklh || 0,
          verifikasi: s.status === 'approved',
        })));
        
        setTotalPages(res.data?.last_page || 1);
        setTotal(res.data?.total || 0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, filterTopologi, filterYear, search]);

  // Fetch on mount and when deps change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, filterTopologi, filterYear, search]);

  // IKLH verify handler
  const handleVerify = async (item: IklhData, action: 'approved' | 'rejected') => {
    try {
      await axios.post(`/api/pusdatin/review/submission/${item.id}/iklh`, { status: action });
      fetchData();
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  // Handle filter button click
  const handleFilter = () => {
    setPage(1);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Penerimaan SLHD Provinsi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Atur Penerimaan Data Nilai Nirwasita Tantra dari Dokumen-Dokumen Provinsi.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Topologi Wilayah */}
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1">Topologi Wilayah</label>
          <select
            value={filterTopologi}
            onChange={(e) => setFilterTopologi(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Pilih Topologi Wilayah</option>
            <option value="daratan">Daratan</option>
            <option value="pesisir">Pesisir</option>
          </select>
        </div>

        {/* Filter Button */}
        <button
          onClick={handleFilter}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <TabButton 
            label="SLHD" 
            icon={FiFileText} 
            active={activeTab === 'SLHD'} 
            onClick={() => setActiveTab('SLHD')} 
          />
          <TabButton 
            label="IKLH" 
            icon={FiAward} 
            active={activeTab === 'IKLH'} 
            onClick={() => setActiveTab('IKLH')} 
          />
        </div>
      </div>

      {/* Table */}
      <PenerimaanTable
        activeTab={activeTab}
        data={activeTab === 'SLHD' ? slhdData : iklhData}
        onVerify={handleVerify}
        isProcessing={false}
        currentPath="provinsi"
        loading={loading}
        onRefresh={fetchData}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{((page - 1) * 15) + 1}</span> - <span className="font-semibold">{Math.min(page * 15, total)}</span> dari <span className="font-semibold">{total}</span> data
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft />
            </button>
            
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              {page} / {totalPages}
            </span>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
