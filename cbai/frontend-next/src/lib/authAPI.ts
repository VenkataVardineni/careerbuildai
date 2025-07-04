import api from './api';

export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  createGuest: () => api.post('/auth/guest', {}),
  // Add other methods as needed
}; 