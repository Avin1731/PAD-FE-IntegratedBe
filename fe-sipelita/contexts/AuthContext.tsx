"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

// ============================================
// TYPES - Simple, hanya yang dibutuhkan
// ============================================
export interface User {
  id: number;
  email: string;
  dinas_id?: number;
  role: {
    name: string; // 'admin' | 'pusdatin' | 'provinsi' | 'kabupaten/kota'
  };
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// HELPER - Get dashboard path by role
// ============================================
function getDashboardByRole(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
      return '/admin-dashboard';
    case 'pusdatin':
      return '/pusdatin-dashboard';
    case 'provinsi':
    case 'kabupaten/kota':
      return '/dlh-dashboard';
    default:
      return '/';
  }
}

// ============================================
// PROVIDER
// ============================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        // Invalid data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function - simple and direct
  const login = async (email: string, password: string): Promise<void> => {
    const response = await axios.post('/api/login', { email, password });
    
    const userData: User = response.data.user;
    const token = userData.token;
    
    if (!token) {
      throw new Error('No token received');
    }
    
    // Save to localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Update state
    setUser(userData);
    
    // Redirect based on role
    const role = userData.role?.name || '';
    const dashboard = getDashboardByRole(role);
    router.push(dashboard);
  };

  // Logout - clear everything
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    router.push('/');
  };

  // Get role helper
  const getRole = (): string | null => {
    return user?.role?.name?.toLowerCase() || null;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, getRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// ============================================
// ROLE GUARD - Higher order component
// ============================================
export function withRoleGuard(allowedRoles: string[]) {
  return function RoleGuard({ children }: { children: ReactNode }) {
    const { user, isLoading, getRole } = useAuth();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
      if (isLoading) return;

      const token = localStorage.getItem('auth_token');
      
      // No token = go to login
      if (!token) {
        router.push('/');
        return;
      }

      const role = getRole();
      
      // Wrong role = redirect to correct dashboard
      if (role && !allowedRoles.includes(role)) {
        router.push(getDashboardByRole(role));
        return;
      }

      setChecked(true);
    }, [isLoading, user, router, getRole]);

    if (isLoading || !checked) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    return <>{children}</>;
  };
}
