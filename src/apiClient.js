import axios from 'axios';

// Verificar si la variable de entorno está cargando correctamente
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL); // Verifica si la URL es correcta

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sanjose-back-production.up.railway.app', // Usa la URL de producción por defecto si no se encuentra la variable de entorno
  withCredentials: true
});

// Interceptor para agregar el token a las solicitudes
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
