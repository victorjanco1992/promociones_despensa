// Configuración de la URL del API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper para construir URLs completas
export const getApiUrl = (endpoint) => {
  // Si estamos en desarrollo y el endpoint empieza con /api, usar proxy
  if (import.meta.env.DEV && endpoint.startsWith('/api')) {
    return endpoint;
  }
  // En producción, usar la URL completa
  return `${API_URL}${endpoint}`;
};