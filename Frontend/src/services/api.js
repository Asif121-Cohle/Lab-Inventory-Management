import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
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

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('401 error - clearing auth and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      // provides a small delay so UI can update
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  signup: (userData) => API.post('/auth/signup', userData),
  logout: () => API.post('/auth/logout'),
  getCurrentUser: () => API.get('/auth/me'),
};

// Lab APIs
export const labAPI = {
  getAllLabs: () => API.get('/labs'),
  getLabById: (labId) => API.get(`/labs/${labId}`),
  getLabMaterials: (labId) => API.get(`/labs/${labId}/materials`),
};

// Material APIs
export const materialAPI = {
  getMaterialById: (materialId) => API.get(`/materials/${materialId}`),
  getAllMaterials: () => API.get('/materials'),
  addMaterial: (materialData) => API.post('/materials', materialData),
  updateMaterial: (materialId, materialData) => API.put(`/materials/${materialId}`, materialData),
  deleteMaterial: (materialId) => API.delete(`/materials/${materialId}`),
};

// Student Request APIs
export const requestAPI = {
  createRequest: (requestData) => API.post('/requests', requestData),
  getMyRequests: () => API.get('/requests/my-requests'),
  getPendingRequests: () => API.get('/requests/pending'),
  approveRequest: (requestId) => API.put(`/requests/${requestId}/approve`),
  rejectRequest: (requestId, reason) => API.put(`/requests/${requestId}/reject`, { reason }),
};

// Lab Schedule APIs
export const scheduleAPI = {
  createSchedule: (scheduleData) => API.post('/schedules', scheduleData),
  getAllSchedules: () => API.get('/schedules'),
  getMySchedules: () => API.get('/schedules/my-schedules'),
  updateSchedule: (scheduleId, scheduleData) => API.put(`/schedules/${scheduleId}`, scheduleData),
  cancelSchedule: (scheduleId) => API.delete(`/schedules/${scheduleId}`),
  checkAvailability: (labId, date, time) => API.get(`/schedules/check-availability`, {
    params: { labId, date, time }
  }),
};

export default API;
