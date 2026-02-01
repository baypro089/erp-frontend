// src/services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Flag để tránh multiple refresh calls đồng thời
let isRefreshing = false;
// Queue các requests đang chờ token mới
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Xử lý queue sau khi refresh xong
const processQueue = (error: any = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  
  failedQueue = [];
};

// Danh sách các endpoint không cần auto refresh token
const publicEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

// Response interceptor để xử lý 401 và auto refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip auto refresh cho public endpoints
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );
      
      if (isPublicEndpoint) {
        return Promise.reject(error);
      }

      // Nếu request fail là chính endpoint refresh → logout
      if (originalRequest.url === '/auth/refresh') {
        isRefreshing = false;
        processQueue(error);
        // Chỉ redirect nếu không phải đang ở trang login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }

      // Nếu đang refresh, đợi trong queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh token API
        await api.post('/auth/refresh');
        
        // Refresh thành công → process queue
        processQueue();
        isRefreshing = false;
        
        // Retry request ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh fail → process queue với error và logout
        processQueue(refreshError);
        isRefreshing = false;
        
        // Chỉ redirect nếu không phải đang ở trang login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
