import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Debug: Log all outgoing requests and headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('[API DEBUG] Request:', config.method?.toUpperCase(), config.url, 'Headers:', config.headers);
  return config;
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
