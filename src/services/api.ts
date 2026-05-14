import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Add a request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> xóa token, redirect login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
