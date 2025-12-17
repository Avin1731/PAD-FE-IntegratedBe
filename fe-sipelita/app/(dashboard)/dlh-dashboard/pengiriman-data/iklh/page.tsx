"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';

// --- KOMPONEN INPUT SKOR ---
interface ScoreInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const ScoreInput = ({ label, value, onChange }: ScoreInputProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-2">{label}</label>
      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          className="w-full bg-gray-100 border-none rounded-lg py-3 px-4 pr-16 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
          placeholder="0-100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
          skor
        </span>
      </div>
    </div>
  );
};

// --- HALAMAN UTAMA ---
export default function UnggahNilaiIKLHPage() {
  const { user } = useAuth();
  const [tahun, setTahun] = useState('2025');
  const [hasPesisir, setHasPesisir] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [statusIklh, setStatusIklh] = useState<'draft' | 'finalized' | 'approved' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // State untuk nilai input
  const [scores, setScores] = useState({
    air: '',
    udara: '',
    lahan: '',
    laut: '',
    kehati: '',
  });

  // Fetch dinas info dan data IKLH yang sudah ada
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/dinas/dashboard');
        setHasPesisir(response.data.dinas?.has_pesisir || false);

        // Ambil status dokumen IKLH
        const statusResponse = await axios.get('/api/dinas/upload/status-dokumen');
        const dokumenList = statusResponse.data.data || [];
        const iklhDoc = dokumenList.find((doc: any) => doc.nama === 'iklh');
        
        if (iklhDoc?.uploaded && iklhDoc?.data) {
          // Populate existing data
          setScores({
            air: iklhDoc.data.indeks_kualitas_air?.toString() || '',
            udara: iklhDoc.data.indeks_kualitas_udara?.toString() || '',
            lahan: iklhDoc.data.indeks_kualitas_lahan?.toString() || '',
            laut: iklhDoc.data.indeks_kualitas_pesisir_laut?.toString() || '',
            kehati: iklhDoc.data.indeks_kualitas_kehati?.toString() || '',
          });
          setStatusIklh(iklhDoc.status);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Gagal memuat data. Silakan refresh halaman.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleInputChange = (field: keyof typeof scores, value: string) => {
    setScores((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  // Hitung rata-rata IKLH (relatif terhadap has_pesisir)
  const calculateAverage = () => {
    const values = [
      parseFloat(scores.air) || 0,
      parseFloat(scores.udara) || 0,
      parseFloat(scores.lahan) || 0,
      parseFloat(scores.kehati) || 0,
    ];
    
    // Tambahkan pesisir jika has_pesisir
    if (hasPesisir && scores.laut) {
      values.push(parseFloat(scores.laut) || 0);
    }
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return values.length > 0 ? (sum / values.length).toFixed(2) : '0.00';
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);
    
    // Validasi
    if (!scores.air || !scores.udara || !scores.lahan || !scores.kehati) {
      setError('Semua field wajib diisi.');
      return;
    }
    
    if (hasPesisir && !scores.laut) {
      setError('Indeks Kualitas Pesisir Laut wajib diisi untuk daerah pesisir.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const payload: any = {
        indeks_kualitas_air: parseFloat(scores.air),
        indeks_kualitas_udara: parseFloat(scores.udara),
        indeks_kualitas_lahan: parseFloat(scores.lahan),
        indeks_kualitas_kehati: parseFloat(scores.kehati),
      };
      
      if (hasPesisir) {
        payload.indeks_kualitas_pesisir_laut = parseFloat(scores.laut);
      }
      
      const response = await axios.post('/api/dinas/upload/iklh', payload);
      setSuccessMessage(response.data.message || 'Data berhasil disimpan!');
      setStatusIklh('draft');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!statusIklh || statusIklh === 'finalized' || statusIklh === 'approved') {
      setError('Data sudah difinalisasi atau belum disimpan.');
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    setIsFinalizing(true);
    
    try {
      const response = await axios.patch('/api/dinas/upload/finalize/iklh');
      setSuccessMessage(response.data.message || 'Data berhasil difinalisasi!');
      setStatusIklh('finalized');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal finalisasi data. Silakan coba lagi.');
    } finally {
      setIsFinalizing(false);
    }
  }; 

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      
      {/* Breadcrumb */}
      <div className="text-sm text-green-600 mb-2 font-medium">
        Panel Pengiriman Data <span className="text-gray-400 mx-2">&gt;</span> <span className="text-gray-800">Unggah Nilai IKLH</span>
      </div>

      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Penerimaan Data</h1>
          <p className="text-lg text-gray-600 mt-1">Unggah Nilai IKLH</p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
         
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Kartu Form Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <ScoreInput 
              label="Indeks Kualitas Air" 
              value={scores.air} 
              onChange={(val) => handleInputChange('air', val)} 
            />
            <ScoreInput 
              label="Indeks Kualitas Udara" 
              value={scores.udara} 
              onChange={(val) => handleInputChange('udara', val)} 
            />
            <ScoreInput 
              label="Indeks Kualitas Lahan" 
              value={scores.lahan} 
              onChange={(val) => handleInputChange('lahan', val)} 
            />
            <div className="md:col-span-1" >
                <ScoreInput 
                label="Indeks Kehati (Data tahun 2026)" 
                value={scores.kehati} 
                onChange={(val) => handleInputChange('kehati', val)} 
                />
            </div>
            {hasPesisir && (
              <ScoreInput 
                label="Indeks Kualitas Pesisir Laut" 
                value={scores.laut} 
                onChange={(val) => handleInputChange('laut', val)} 
              />
            )}
          </div>
        </div>

        {/* Footer Card */}
        <div className="bg-white px-8 py-6 border-t border-gray-100 flex justify-between items-center">
          <button 
            onClick={handleSave}
            disabled={isSaving || statusIklh === 'finalized' || statusIklh === 'approved'}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          {statusIklh && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusIklh === 'finalized' ? 'bg-blue-100 text-blue-700' :
              statusIklh === 'approved' ? 'bg-green-100 text-green-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {statusIklh === 'finalized' ? 'Terfinalisasi' :
               statusIklh === 'approved' ? 'Disetujui' : 'Draft'}
            </span>
          )}
        </div>
      </div>

      {/* Kartu Summary / Finalisasi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-lg text-gray-800 font-medium mb-2">
          Rata-rata Nilai IKLH
        </p>
        <p className="text-green-600 font-bold text-4xl mb-2">
          {calculateAverage()}
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Dihitung dari {hasPesisir ? '5 indeks (termasuk pesisir)' : '4 indeks (tanpa pesisir)'}
        </p>
        <button 
          onClick={handleFinalize}
          disabled={isFinalizing || !statusIklh || statusIklh === 'finalized' || statusIklh === 'approved'}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isFinalizing ? 'Memfinalisasi...' : 'Finalisasi Nilai'}
        </button>
        {statusIklh === 'finalized' && (
          <p className="text-sm text-blue-600 mt-3">✓ Data sudah difinalisasi</p>
        )}
        {statusIklh === 'approved' && (
          <p className="text-sm text-green-600 mt-3">✓ Data sudah disetujui Pusdatin</p>
        )}
      </div>

    </div>
  );
}