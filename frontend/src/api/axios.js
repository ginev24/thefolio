// frontend/src/api/axios.js
// A pre-configured Axios instance that:
//   1. Points all requests at http://localhost:5000/api (the Express server)
//   2. Automatically attaches the JWT token from localStorage to every request
//      via a request interceptor — so you never have to add the header manually
//
// Usage in any page/component:
//   import API from '../api/axios';
//   const { data } = await API.get('/posts');
//   const { data } = await API.post('/auth/login', { email, password });

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
