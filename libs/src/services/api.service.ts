// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,            // gửi cookie trong mỗi request
  headers: { 'Content-Type': 'application/json' },
});

export default api;
