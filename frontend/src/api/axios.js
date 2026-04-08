
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// ── Request interceptor ───────────────────────────────────────────────────
// Runs automatically before EVERY request sent through this instance.
// Reads the token saved in localStorage and adds it as a Bearer token header.
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
