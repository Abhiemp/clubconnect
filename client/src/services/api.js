import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Users
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  updateInterests: (data) => API.put('/users/interests', data),
  toggleSaveEvent: (eventId) => API.put(`/users/saved-events/${eventId}`),
  getSavedEvents: () => API.get('/users/saved-events'),
};

// Clubs
export const clubAPI = {
  getAll: (params) => API.get('/clubs', { params }),
  getById: (id) => API.get(`/clubs/${id}`),
  create: (data) => API.post('/clubs', data),
  update: (id, data) => API.put(`/clubs/${id}`, data),
  delete: (id) => API.delete(`/clubs/${id}`),
  join: (id) => API.post(`/clubs/${id}/join`),
  leave: (id) => API.delete(`/clubs/${id}/join`),
  getMembers: (id) => API.get(`/clubs/${id}/members`),
  removeMember: (clubId, userId) => API.delete(`/clubs/${clubId}/members/${userId}`),
};

// Events
export const eventAPI = {
  getAll: (params) => API.get('/events', { params }),
  getById: (id) => API.get(`/events/${id}`),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
  getClubEvents: (clubId) => API.get(`/events/club/${clubId}`),
  register: (id) => API.post(`/events/${id}/register`),
  cancelRegistration: (id) => API.delete(`/events/${id}/register`),
  getRegistrations: (id) => API.get(`/events/${id}/registrations`),
  getRegistrationStatus: (id) => API.get(`/events/${id}/registration-status`),
};

// Registrations
export const registrationAPI = {
  getMyEvents: () => API.get('/registrations/my-events'),
  markAttendance: (id, status) => API.put(`/registrations/${id}/attendance`, { status }),
};

// Recommendations
export const recommendationAPI = {
  getEvents: () => API.get('/recommendations/events'),
};

// Announcements
export const announcementAPI = {
  getAll: (params) => API.get('/announcements', { params }),
  create: (data) => API.post('/announcements', data),
  update: (id, data) => API.put(`/announcements/${id}`, data),
  delete: (id) => API.delete(`/announcements/${id}`),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => API.get('/notifications', { params }),
  getUnreadCount: () => API.get('/notifications/unread-count'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
};

// Stats
export const statsAPI = {
  getPublic: () => API.get('/stats'),
};

// Admin
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  updateClub: (id, data) => API.put(`/admin/clubs/${id}`, data),
  getRegistrations: (params) => API.get('/admin/registrations', { params }),
  getAnnouncements: (params) => API.get('/admin/announcements', { params }),
};

export default API;
