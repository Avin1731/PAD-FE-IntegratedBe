import Axios from 'axios';

const axios = Axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Pasang Token Bearer
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Bersihkan prefix "c"
axios.interceptors.response.use((response) => {
  if (typeof response.data === 'string') {
    const trimmed = response.data.trim();
    if (trimmed.startsWith('c{') || trimmed.startsWith('c[')) {
      try {
        response.data = JSON.parse(trimmed.substring(1));
      } catch {
        console.warn('❌ Gagal parse JSON setelah strip "c"');
      }
    }
  }
  return response;
}, (error) => {
  if (error.response?.data && typeof error.response.data === 'string') {
    const trimmed = error.response.data.trim();
    if (trimmed.startsWith('c{') || trimmed.startsWith('c[')) {
      try {
        error.response.data = JSON.parse(trimmed.substring(1));
      } catch { }
    }
  }
  
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
  return Promise.reject(error);
});

export default axios;