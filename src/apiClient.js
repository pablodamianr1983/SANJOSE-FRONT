// apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'sanjose-back-production.up.railway.app', // Asegúrate de que esta URL sea correcta
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
