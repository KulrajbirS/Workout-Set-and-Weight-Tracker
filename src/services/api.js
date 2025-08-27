import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

export const workoutAPI = {
  create: (workoutData) => api.post('/workouts', workoutData),
  getAll: (params = {}) => api.get('/workouts', { params }),
  getById: (id) => api.get(`/workouts/${id}`),
  update: (id, workoutData) => api.put(`/workouts/${id}`, workoutData),
  delete: (id) => api.delete(`/workouts/${id}`),
  getStats: () => api.get('/workouts/stats'),
};

export const weightAPI = {
  create: (weightData) => api.post('/weight', weightData),
  getAll: (params = {}) => api.get('/weight', { params }),
  getById: (id) => api.get(`/weight/${id}`),
  update: (id, weightData) => api.put(`/weight/${id}`, weightData),
  delete: (id) => api.delete(`/weight/${id}`),
  getStats: () => api.get('/weight/stats'),
};

export default api;