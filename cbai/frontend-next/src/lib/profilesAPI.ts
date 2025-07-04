import api from './api';

export const profilesAPI = {
  getAll: () => api.get('profiles/'),
  getById: (id: number) => api.get(`profiles/${id}/`),
  create: (data: any) => api.post('profiles/', data),
  update: (id: number, data: any) => api.post(`profiles/${id}/`, data),
  delete: (id: number) => api.post(`profiles/${id}/delete/`, {}),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('profiles/upload-resume/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createGuest: (data: any) => api.post('profiles/', data),
  // Add other methods as needed, e.g. update, delete, uploadResume, etc.
}; 