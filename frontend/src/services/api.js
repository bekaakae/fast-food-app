import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const menuAPI = {
  getAll: () => api.get('/api/menu'),        // ✅ Added /api
  getById: (id) => api.get(`/api/menu/${id}`), // ✅ Added /api
};

export const ordersAPI = {
  create: (orderData) => api.post('/api/orders', orderData), // ✅ Added /api
  getAll: () => api.get('/api/orders'),      // ✅ Added /api
  getById: (id) => api.get(`/api/orders/${id}`), // ✅ Added /api
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }), // ✅ Added /api
};

export const paymentAPI = {
  process: (paymentData) => api.post('/api/payment/process', paymentData), // ✅ Added /api
};

export default api;