"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';
import { isAxiosError } from 'axios';

// --- TIPE DATA UTAMA ---
interface Province { id: string; name: string; }
interface Regency { id: string; name: string; }
interface Role { id: number; name: string; }
interface JenisDlh { id: number; name: string; }

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  jenis_dlh_id?: number;
  role: Role;
  jenis_dlh?: JenisDlh;
  nomor_telepon?: string;
  province_id?: string;
  regency_id?: string;
  province_name?: string;
  regency_name?: string;
  pesisir?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  nomor_telepon: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  jenis_dlh_id: number;
  province_id: string;
  regency_id?: string;
  pesisir: string;
}

interface AuthContextType {
  user: User | null;
  provinces: Province[];
  regencies: Regency[];
  jenisDlhs: JenisDlh[];
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- MOCK DATA FALLBACK (Hanya untuk Dropdown Wilayah) ---
const MOCK_PROVINCES: Province[] = [
  { id: '1', name: 'Jawa Barat' },
  { id: '2', name: 'Jawa Tengah' },
  { id: '3', name: 'Jawa Timur' },
  { id: '4', name: 'DI Yogyakarta' },
];

const MOCK_REGENCIES: Regency[] = [
  { id: '1', name: 'Kota Bandung' },
  { id: '2', name: 'Kota Semarang' },
  { id: '3', name: 'Kota Surabaya' },
  { id: '4', name: 'Kota Yogyakarta' },
];

const MOCK_JENIS_DLHS: JenisDlh[] = [
  { id: 1, name: 'Kabupaten/Kota Kecil' },
  { id: 2, name: 'Kabupaten/Kota Sedang' },
  { id: 3, name: 'Kabupaten/Kota Besar' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Start with null for both server and client (prevents hydration mismatch)
  const [user, setUser] = useState<User | null>(null);
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [jenisDlhs, setJenisDlhs] = useState<JenisDlh[]>([]);

  // Update user state and cache
  const updateUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user_data');
    }
  };

  // Load cached user immediately after mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('auth_token');
    const cached = localStorage.getItem('user_data');
    
    console.log('🔍 AUTH CONTEXT MOUNT CHECK:');
    console.log('Token:', token ? 'EXISTS' : 'MISSING');
    console.log('Cached user:', cached ? 'EXISTS' : 'MISSING');
    
    // Kalau ada token & cached user, langsung load aja
    // Gak perlu fetch /api/user - token udah otomatis attach di setiap request
    if (token && cached) {
      try {
        const userData = JSON.parse(cached);
        console.log('✅ Loaded user from cache:', userData.email, userData.role?.name);
        setUser(userData);
      } catch (e) {
        // Kalau gagal parse, clear cache rusak
        console.error('❌ Failed to parse cached user:', e);
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
      }
    } else {
      console.log('⚠️ No token or cached user found');
    }
  }, []);

  useEffect(() => {
    if (isInitialized || !isMounted) return;
    
    const initAuth = async () => {
      try {
        // Fetch dropdown data in parallel (non-blocking)
        // Note: provinces diload oleh page yang membutuhkan (pusdatin dashboard)
        Promise.allSettled([
          axios.get('/api/wilayah/provinces').then(res => setProvinces((res.data.data || res.data) as Province[])),
        ]).then(([provincesResult]) => {
          // Use mock data only for dropdowns if API fails
          if (process.env.NODE_ENV === 'development') {
            if (provincesResult.status === 'rejected') setProvinces(MOCK_PROVINCES);
          }
        });

      } catch (error: unknown) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [isInitialized, isMounted]);

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await axios.post('/api/auth/register', data);
      
      // Login otomatis setelah register berhasil
      const token = response.data.token;
      localStorage.setItem('auth_token', token);
      updateUser(response.data.user);
      
      if (response.data.user?.role?.name) {
        const roleName = response.data.user.role.name.toLowerCase();
        if (roleName === 'admin') router.push('/admin-dashboard');
        else if (roleName === 'pusdatin') router.push('/pusdatin-dashboard');
        else if (roleName === 'dlh') router.push('/dlh-dashboard');
        else router.push('/');
      }
    } catch (error: unknown) {
      console.error("Register failed:", error);
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      // PENTING: Clear localStorage dulu untuk mencegah cache user lama
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      const response = await axios.post('/api/login', {
        email: credentials.email,
        password: credentials.password,
      });
      
      // SIMPAN TOKEN & USER DATA
      const token = response.data.user.token;
      const userData = response.data.user;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);

      // Redirect berdasarkan role
      const roleName = userData?.role?.name?.toLowerCase();
      console.log('🔐 Login successful, role:', roleName);
      console.log('📦 User data saved:', userData);
      
      if (roleName === 'admin') {
        router.push('/admin-dashboard');
      } else if (roleName === 'pusdatin') {
        router.push('/pusdatin-dashboard');
      } else if (roleName === 'provinsi' || roleName === 'kabupaten/kota') {
        router.push('/dlh-dashboard');
      } else {
        console.warn('⚠️ Unknown role:', roleName);
        router.push('/');
      }
    } catch (error: unknown) {
      console.error("Login failed:", error);
      // Clear jika login gagal
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post('/api/logout');
    } catch (error: unknown) {
      console.error("Logout error (ignoring):", error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      router.push('/login');
    }
  };

  // Tidak perlu blocking loading screen di sini - biarkan children render
  // Loading state akan dihandle oleh masing-masing komponen yang membutuhkan
  return (
    <AuthContext.Provider value={{ user, provinces, regencies, jenisDlhs, login, register, logout }}> 
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContext');
  }
  return context;
};
