// components/Header.js
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import SintaFullLogo from './SintaFullLogo';

// --- Komponen Ikon ---
const UserIcon = () => ( <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg> );
const ChevronDownIcon = () => ( <svg className="w-4 h-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> );
const DocumentIcon = () => ( <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> );
// --- Akhir Komponen Ikon ---


export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // ⚠️ SEMUA HOOKS HARUS DI ATAS, SEBELUM CONDITIONAL RETURNS!
  // Compute navLinks - akan return empty jika user belum ada
  const { navLinks, baseHref } = useMemo(() => {
    if (!user || !user.role) {
      return { navLinks: [], baseHref: '/' };
    }
    
    const userRoleName = user.role.name.toLowerCase();
    let baseHref = '';
    let navLinks = [];

    // 1. Tentukan Base Href
    if (userRoleName === 'admin') {
      baseHref = '/admin-dashboard';
    } else if (userRoleName === 'pusdatin') {
      baseHref = '/pusdatin-dashboard';
    } else {
      baseHref = '/dlh-dashboard';
    }

    // 2. Tentukan Link Navigasi
    if (userRoleName === 'admin') {
        navLinks = [
            { name: 'Beranda', href: baseHref },
            { 
              name: 'Manajemen User', 
              href: `${baseHref}/users`,
              dropdown: [
                { name: 'Daftar User Aktif', href: `${baseHref}/users/aktif` },
                { name: 'Persetujuan Registrasi', href: `${baseHref}/users/pending` },
                { name: 'Log Aktivitas Sistem', href: `${baseHref}/users/logs` },
              ] 
            },
            { name: 'Kelola Akun Pusdatin', href: `${baseHref}/settings` },
        ];
    } else if (userRoleName === 'pusdatin') {
        navLinks = [
            { name: 'Beranda', href: baseHref },
            { name: 'Pengaturan Deadline', href: `${baseHref}/pengaturan-deadline/penerimaan-data` },
            { 
              name: 'Panel Penerimaan Data', 
              href: `${baseHref}/panel-penerimaan-data`, 
              dropdown: [
                { name: 'Penerimaan Data Kab/kota', href: `${baseHref}/panel-penerimaan-data/kab-kota` },
                { name: 'Penerimaan Data Provinsi', href: `${baseHref}/panel-penerimaan-data/provinsi` } 
              ]
            },
            { 
              name: 'Panel Penilaian', 
              href: `${baseHref}/penilaian`, 
              dropdown: [
                { name: 'Penilaian Kab/kota', href: `${baseHref}/penilaian/kab-kota` },
                { name: 'Penilaian Provinsi', href: `${baseHref}/penilaian/provinsi` }
              ]
            },
        ];
    } else { // DLH Navigation
      navLinks = [
          { name: 'Beranda', href: baseHref },
          { 
            name: 'Panel Pengiriman Data', 
            href: `${baseHref}/pengiriman-data`, 
            dropdown: [
              { name: 'Unggah Dokumen', href: `${baseHref}/pengiriman-data`, icon: DocumentIcon },
              { name: 'Unduh Template Dokumen', href: `${baseHref}/pengiriman-data/template`, icon: DocumentIcon }, 
            ]
          },
          { 
            name: 'Panel Penilaian', 
            href: `${baseHref}/penilaian`, 
            dropdown: [
              { name: 'Hasil Penilaian', href: `${baseHref}/penilaian/hasil-penilaian` },
              { name: 'Tabel rekap kab/kota', href: `${baseHref}/penilaian/tabel-rekap` },
            ]
          },
          { name: 'Perangkat Analisis', href: `${baseHref}/perangkat-analisis` },
      ];
    }

    return { navLinks, baseHref };
  }, [user?.role?.name]); // Hanya re-compute saat role berubah

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);

  // CONDITIONAL RENDERS - Setelah semua hooks dipanggil
  // Halaman publik tanpa navbar
  const publicPages = ['/login', '/register', '/lupa-password', '/pilih-jenis-dlh', '/hubungi-admin', '/hubungi-developer', '/'];
  if (publicPages.some(page => pathname === page || pathname?.startsWith(page + '?'))) {
    return null;
  }

  // Kalau belum ada user, jangan render navbar
  if (!user || !user.role) {
    return null;
  }

  // RENDER NAVBAR LENGKAP - User sudah login
  return (
    <div className="w-full sticky top-0 ">
      
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 w-full">
        <div className="flex justify-between items-center mx-auto max-w-screen-xl">
          <Link href={baseHref}>
            <SintaFullLogo size="small" />
          </Link>
          
          <nav className="flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = (link.href === baseHref)
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <div key={link.name} className="relative group">
                  {link.dropdown ? (
                    <button className={`flex items-center text-sm font-semibold focus:outline-none pt-2 pb-1 ${isActive ? 'text-[#00A86B] border-b-2 border-[#00A86B]' : 'text-gray-700 hover:text-[#00A86B]'}`}>
                      {link.name}
                      <ChevronDownIcon />
                    </button>
                  ) : (
                    <Link href={link.href} className={`pb-1 text-sm font-semibold ${isActive ? 'text-[#00A86B] border-b-2 border-[#00A86B]' : 'text-gray-700 hover:text-[#00A86B]'}`}>
                      {link.name}
                    </Link>
                  )}
                  {link.dropdown && (
                    <div className="absolute left-0 pt-2 w-64 bg-transparent opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50">
                      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                        <div className="py-2">
                          {link.dropdown.map((item) => (
                            <Link key={item.name} href={item.href} className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#00A86B] hover:text-white transition-colors duration-150">
                              <DocumentIcon />
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="flex items-center p-2 rounded-full hover:bg-green-100 focus:outline-none"
            >
              <UserIcon className="w-5 h-5 text-[#005952]" />
              <ChevronDownIcon className="w-4 h-4 ml-1 text-[#005952]" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-[#00A86B]/10 hover:text-[#00A86B] transition-colors"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-800 hover:bg-[#00A86B]/10 hover:text-[#00A86B] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      <div className="h-0.5 bg-[#00A86B]" />
    </div>
  );
}