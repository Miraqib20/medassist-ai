import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Attach JWT Token to outgoing requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediassist_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Doctor Services
export const doctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getAvailability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }),
};

// Clinic Services & Departments
export const clinicService = {
  getServices: (departmentId) => api.get('/services', { params: { department_id: departmentId } }),
  getDepartments: () => api.get('/services/departments'),
};

// Appointment Services
export const appointmentService = {
  create: (data) => api.post('/appointments', data),
  getAppointments: () => api.get('/appointments'),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
};

// Chatbot API
export const chatService = {
  sendMessage: (payload) => api.post('/chat', payload),
  getConversations: () => api.get('/chat/conversations'),
  getConversationDetails: (id) => api.get(`/chat/conversations/${id}`),
};

// Admin Services
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  createDoctor: (data) => api.post('/admin/doctors', data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
  getFaqs: () => api.get('/admin/faqs'),
  createFaq: (data) => api.post('/admin/faqs', data),
  deleteFaq: (id) => api.delete(`/admin/faqs/${id}`),
  getKnowledge: () => api.get('/admin/knowledge'),
  createKnowledge: (data) => api.post('/admin/knowledge', data),
  getConversations: () => api.get('/admin/conversations'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
};

export default api;
