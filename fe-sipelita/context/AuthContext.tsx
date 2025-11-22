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
}

interface LoginCredentials {
  email: string;
  password: string;
  role_id: string | null;
  jenis_dlh_id: string | null;
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
  loading: boolean;
  provinces: Province[];
  regencies: Regency[];
  jenisDlhs: JenisDlh[];
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data fallback
const MOCK_PROVINCES: Province[] = [
  { id: '1', name: 'Jawa Barat' },
  { id: '2', name: 'Jawa Tengah' },
];

const MOCK_REGENCIES: Regency[] = [
  { id: '1', name: 'Kota Bandung' },
  { id: '2', name: 'Kota Semarang' },
];

const MOCK_JENIS_DLHS: JenisDlh[] = [
  { id: 1, name: 'Kabupaten/Kota Kecil' },
  { id: 2, name: 'Kabupaten/Kota Sedang' },
  { id: 3, name: 'Kabupaten/Kota Besar' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [jenisDlhs, setJenisDlhs] = useState<JenisDlh[]>([]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/user');
      setUser(res.data);
      return res.data;
    } catch (error: unknown) {
      console.error("Error fetching user:", error);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await fetchUser();

      // Gunakan Promise.allSettled untuk handle error individual
      const [provincesResult, regenciesResult, jenisDlhsResult] = await Promise.allSettled([
        axios.get('/api/provinces').then(res => setProvinces(res.data)),
        axios.get('/api/regencies/all').then(res => setRegencies(res.data)),
        axios.get('/api/jenis-dlh').then(res => setJenisDlhs(res.data)),
      ]);

      // Handle fallback untuk setiap request yang gagal
      if (provincesResult.status === 'rejected') {
        console.warn('Failed to fetch provinces, using mock data');
        setProvinces(MOCK_PROVINCES);
      }
      if (regenciesResult.status === 'rejected') {
        console.warn('Failed to fetch regencies, using mock data');
        setRegencies(MOCK_REGENCIES);
      }
      if (jenisDlhsResult.status === 'rejected') {
        console.warn('Failed to fetch jenis DLH, using mock data');
        setJenisDlhs(MOCK_JENIS_DLHS);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const register = async (data: RegisterData) => {
    try {
      await axios.get('/sanctum/csrf-cookie');
      await axios.post('/api/register', data);
      await login({ 
        email: data.email, 
        password: data.password,
        role_id: String(data.role_id), 
        jenis_dlh_id: String(data.jenis_dlh_id) 
      });
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      await axios.get('/sanctum/csrf-cookie');
      const payload = {
        email: credentials.email,
        password: credentials.password,
        role_id: credentials.role_id ? Number(credentials.role_id) : null,
        jenis_dlh_id: credentials.jenis_dlh_id ? Number(credentials.jenis_dlh_id) : null,
      };
      await axios.post('/api/login', payload);

      const loggedInUser = await fetchUser();
      
      if (loggedInUser && loggedInUser.role && loggedInUser.role.name) {
        const roleName = loggedInUser.role.name.toLowerCase();
        if (roleName === 'admin') router.push('/admin-dashboard');
        else if (roleName === 'pusdatin') router.push('/pusdatin-dashboard');
        else if (roleName === 'dlh') router.push('/dlh-dashboard');
        else router.push('/');
      } else {
        console.error("Login sukses tapi data user atau role tidak lengkap:", loggedInUser);
        await logout();
        throw new Error("Data pengguna tidak lengkap setelah login.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.get('/sanctum/csrf-cookie');
      await axios.post('/api/logout');
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Memuat...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, provinces, regencies, jenisDlhs, login, register, logout }}> 
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