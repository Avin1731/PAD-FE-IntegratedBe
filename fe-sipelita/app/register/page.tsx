"use client";

import Link from 'next/link';
import SintaFullLogo from '@/components/SintaFullLogo';

// --- ICONS ---
const ProvinceIcon = () => (
  <svg className="w-12 h-12 text-[#00A86B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CityIcon = () => (
  <svg className="w-12 h-12 text-[#00A86B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

export default function RegisterChoicePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4 space-y-8">
      
      <div className="flex justify-center">
        <SintaFullLogo />
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl w-full max-w-lg border border-gray-300">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Registrasi</h1>
        <p className="text-gray-500 text-center mb-8">Pilih jenis DLH Anda untuk melanjutkan pendaftaran</p>

        <div className="space-y-4">
          {/* DLH Provinsi */}
          <Link href="/register/provinsi" className="block">
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#00A86B] hover:bg-green-50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                  <ProvinceIcon />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#00A86B]">DLH Provinsi</h3>
                  <p className="text-sm text-gray-500">Dinas Lingkungan Hidup tingkat Provinsi</p>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#00A86B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* DLH Kab/Kota */}
          <Link href="/register/kab-kota" className="block">
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#00A86B] hover:bg-green-50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                  <CityIcon />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#00A86B]">DLH Kabupaten/Kota</h3>
                  <p className="text-sm text-gray-500">Dinas Lingkungan Hidup tingkat Kabupaten/Kota</p>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#00A86B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Link kembali ke Login */}
        <div className="mt-8 text-sm text-center">
          <p className="text-gray-600">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-semibold text-[#00A86B] hover:underline">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}