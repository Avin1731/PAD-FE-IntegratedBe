// src/app/(dashboard)/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const cachedUser = localStorage.getItem('user_data');
      
      console.log('🔍 Dashboard Layout Auth Check:');
      console.log('Token:', token ? 'EXISTS' : 'MISSING');
      console.log('Cached user:', cachedUser ? 'EXISTS' : 'MISSING');
      console.log('Context user:', user ? user.email : 'NULL');
      console.log('Current path:', pathname);
      
      // Tidak ada token = redirect ke login
      if (!token) {
        console.log('❌ No token, redirecting to login...');
        router.push('/login');
        return;
      }
      
      // Cek role dan pastikan di dashboard yang benar
      if (user?.role?.name) {
        const roleName = user.role.name.toLowerCase();
        const correctDashboard = 
          roleName === 'admin' ? '/admin-dashboard' :
          roleName === 'pusdatin' ? '/pusdatin-dashboard' :
          (roleName === 'provinsi' || roleName === 'kabupaten/kota') ? '/dlh-dashboard' : null;
        
        console.log('🔐 User role:', roleName);
        console.log('📍 Correct dashboard:', correctDashboard);
        
        // Jika user di dashboard yang salah, redirect ke yang benar
        if (correctDashboard && !pathname.startsWith(correctDashboard)) {
          console.log('⚠️ Wrong dashboard! Redirecting to:', correctDashboard);
          router.push(correctDashboard);
          return;
        }
      }
      
      setIsChecking(false);
    };
    
    // Delay sedikit untuk biarkan AuthContext hydrate
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [user, router, pathname]);

  // Loading state
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-8">
        {children}
      </main>
    </div>
  );
}