// src/utils/axiosConfig.js
import axios from 'axios';

// Request interceptor - menambahkan token ke semua request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle error 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau tidak valid, hapus token dan redirect ke login
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      // Uncomment line berikut jika ingin auto redirect ke login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
