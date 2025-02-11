// apiClient.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.VITE_API_URL || 'https://sanjose-back-production.up.railway.app', // ✅ Usa la URL del backend en producción
  withCredentials: true
});

// Interceptor para agregar el token a las solicitudes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
