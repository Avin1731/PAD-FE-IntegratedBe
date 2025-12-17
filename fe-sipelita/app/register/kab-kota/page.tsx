"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SintaFullLogo from '@/components/SintaFullLogo';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';

// --- ICONS ---
const EyeIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.625-5.06A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.268 5.768M4 12s2.943-7 8-7 8 7 8 7-2.943 7-8 7-8-7-8-7z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface Province {
  id: number;
  nama: string;
}

interface Dinas {
  id: number;
  nama_dinas: string;
  region: string;
}

export default function RegisterKabKotaPage() {
  const router = useRouter();
  
  // State Form
  const [selectedProvinsi, setSelectedProvinsi] = useState('');
  const [selectedDinas, setSelectedDinas] = useState('');
  const [kodeDinas, setKodeDinas] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  // State UI
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State Data Dropdown
  const [provincesList, setProvincesList] = useState<Province[]>([]);
  const [dinasList, setDinasList] = useState<Dinas[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingDinas, setIsLoadingDinas] = useState(false);

  // Fetch provinces
  useEffect(() => {
    setIsLoadingProvinces(true);
    axios.get('/api/register/provinces')
      .then(res => {
        setProvincesList(res.data.data || []);
      })
      .catch(err => {
        console.error("Gagal mengambil provinsi:", err);
        setFormError("Gagal memuat daftar provinsi.");
      })
      .finally(() => {
        setIsLoadingProvinces(false);
      });
  }, []);

  // Fetch dinas when province changes
  useEffect(() => {
    if (selectedProvinsi) {
      setIsLoadingDinas(true);
      setSelectedDinas('');
      setDinasList([]);
      
      axios.get(`/api/register/dinas/kabkota/${selectedProvinsi}`)
        .then(res => {
          setDinasList(res.data.data || []);
        })
        .catch(err => {
          console.error("Gagal mengambil dinas kab/kota:", err);
          setFormError("Gagal memuat daftar DLH Kab/Kota.");
        })
        .finally(() => {
          setIsLoadingDinas(false);
        });
    } else {
      setSelectedDinas('');
      setDinasList([]);
    }
  }, [selectedProvinsi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Validasi
    if (password !== passwordConfirmation) {
      setFormError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password minimal 8 karakter.");
      return;
    }

    if (!selectedProvinsi) {
      setFormError("Silakan pilih Provinsi.");
      return;
    }

    if (!selectedDinas) {
      setFormError("Silakan pilih DLH Kab/Kota.");
      return;
    }

    if (!kodeDinas.trim()) {
      setFormError("Masukkan kode dinas.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/register', {
        id_dinas: selectedDinas,
        kode_dinas: kodeDinas,
        email: email,
        password: password,
      });

      setSuccessMessage(response.data.message || 'Registrasi berhasil! Mohon tunggu aktivasi dari admin.');
      
      // Reset form
      setSelectedProvinsi('');
      setSelectedDinas('');
      setKodeDinas('');
      setEmail('');
      setPassword('');
      setPasswordConfirmation('');
      
      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4 space-y-8">
      
      <div className="flex justify-center">
        <SintaFullLogo />
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl w-full max-w-lg border border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Registrasi DLH Kab/Kota</h1>

        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Pilih Provinsi */}
          <div>
            <label htmlFor="provinsi" className="block text-left text-sm font-medium text-gray-700">Provinsi</label>
            <select
              id="provinsi"
              value={selectedProvinsi}
              onChange={(e) => setSelectedProvinsi(e.target.value)}
              required
              disabled={isLoadingProvinces}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A86B] focus:border-[#00A86B] sm:text-sm disabled:bg-gray-50"
            >
              <option value="" disabled>
                {isLoadingProvinces ? "Memuat..." : "-- Pilih Provinsi --"}
              </option>
              {provincesList.map(prov => (
                <option key={prov.id} value={prov.id}>
                  {prov.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih DLH Kab/Kota */}
          <div>
            <label htmlFor="dinas" className="block text-left text-sm font-medium text-gray-700">Pilih DLH Kab/Kota</label>
            <select
              id="dinas"
              value={selectedDinas}
              onChange={(e) => setSelectedDinas(e.target.value)}
              required
              disabled={!selectedProvinsi || isLoadingDinas}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A86B] focus:border-[#00A86B] sm:text-sm disabled:bg-gray-50"
            >
              <option value="" disabled>
                {isLoadingDinas ? "Memuat..." : (selectedProvinsi ? "-- Pilih DLH Kab/Kota --" : "-- Pilih Provinsi Dulu --")}
              </option>
              {dinasList.map(dinas => (
                <option key={dinas.id} value={dinas.id}>
                  {dinas.nama_dinas} ({dinas.region})
                </option>
              ))}
            </select>
          </div>

          {/* Kode Dinas */}
          <div>
            <label htmlFor="kodeDinas" className="block text-left text-sm font-medium text-gray-700">Kode Dinas</label>
            <input
              type="text"
              id="kodeDinas"
              value={kodeDinas}
              onChange={(e) => setKodeDinas(e.target.value)}
              placeholder="Masukkan Kode Dinas"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A86B] focus:border-[#00A86B] sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Kode dinas dapat diperoleh dari admin pusat.</p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-left text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan Email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A86B] focus:border-[#00A86B] sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-left text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00A86B] focus:border-[#00A86B] sm:text-sm"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </div>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label htmlFor="password_confirmation" className="block text-left text-sm font-medium text-gray-700">Konfirmasi Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="password_confirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi password"
                required
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00A86B] focus:border-[#00A86B] sm:text-sm"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </div>
            </div>
          </div>

          {/* Tombol Register */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || isLoadingDinas || !selectedDinas}
              className="w-full bg-[#00A86B] text-white font-bold py-3 px-4 rounded-lg hover:brightness-90 transition duration-300 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </div>

          {/* Link kembali ke Login */}
          <div className="mt-6 text-sm text-center">
            <p className="text-gray-600">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="font-semibold text-[#00A86B] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
