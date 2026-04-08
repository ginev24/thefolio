import axios from 'axios';

const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://thefolio-wa88.onrender.com/api'
      : 'http://localhost:5000/api',
});

// ── Request interceptor ────────────────────────────────────────────────
// Automatically adds JWT token from localStorage to every request.
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
