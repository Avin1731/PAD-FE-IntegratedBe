"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';

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
  token?: string;
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

// --- MOCK DATA FALLBACK ---
const MOCK_PROVINCES: Province[] = [
  { id: '1', name: 'Jawa Barat' },
  { id: '2', name: 'Jawa Tengah' },
  { id: '3', name: 'Jawa Timur' },
  { id: '4', name: 'DI Yogyakarta' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies] = useState<Regency[]>([]); // setRegencies dihapus karena belum digunakan (Fix Error 1)
  const [jenisDlhs] = useState<JenisDlh[]>([]); // setJenisDlhs dihapus karena belum digunakan (Fix Error 2)

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('auth_token');
    const cached = localStorage.getItem('user_data');
    
    if (token && cached) {
      try {
        const userData = JSON.parse(cached);
        setUser(userData);
      } catch { // Variabel 'e' dihapus karena tidak digunakan (Fix Error 3)
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialized || !isMounted) return;
    
    const initAuth = async () => {
      try {
        const provincesRes = await axios.get('/api/wilayah/provinces');
        setProvinces((provincesRes.data.data || provincesRes.data) as Province[]);
      } catch { // Variabel 'error' dihapus karena tidak digunakan (Fix Error 4)
        if (process.env.NODE_ENV === 'development') setProvinces(MOCK_PROVINCES);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [isInitialized, isMounted]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    const response = await axios.post('/api/login', credentials);
    const userData = response.data.user;
    const token = userData.token;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);

    const roleName = userData?.role?.name?.toLowerCase();
    if (roleName === 'admin') router.push('/admin-dashboard');
    else if (roleName === 'pusdatin') router.push('/pusdatin-dashboard');
    else if (roleName === 'provinsi' || roleName === 'kabupaten/kota') router.push('/dlh-dashboard');
    else router.push('/');
  };

  const register = async (data: RegisterData): Promise<void> => {
    const response = await axios.post('/api/auth/register', data);
    const token = response.data.token;
    localStorage.setItem('auth_token', token);
    const userData = response.data.user;
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    router.push('/');
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post('/api/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, provinces, regencies, jenisDlhs, login, register, logout }}> 
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthContext');
  return context;
};