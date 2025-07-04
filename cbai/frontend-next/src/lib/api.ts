const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://careerbuildai-production.up.railway.app/api/v1/';

console.log('API Base URL:', API_BASE_URL); // Debug log

const getUserEmail = () => {
  // Try to get from localStorage or your auth state
  return (typeof window !== 'undefined') ? localStorage.getItem('email') : undefined;
};

const api = {
  get: async (path: string, options: RequestInit = {}) => {
    const email = getUserEmail();
    const headers = {
      ...(options.headers || {}),
      ...(email ? { 'X-User-Email': email } : {}),
    };
    const res = await fetch(
      path.startsWith('http') ? path : `${API_BASE_URL}${path.replace(/^\//, '')}`,
      { ...options, credentials: 'include', headers }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (path: string, data: any, options: RequestInit = {}) => {
    const email = getUserEmail();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(email ? { 'X-User-Email': email } : {}),
    };
    const res = await fetch(
      path.startsWith('http') ? path : `${API_BASE_URL}${path.replace(/^\//, '')}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
        ...options,
      }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  delete: async (path: string, options: RequestInit = {}) => {
    const email = getUserEmail();
    const headers = {
      ...(options.headers || {}),
      ...(email ? { 'X-User-Email': email } : {}),
    };
    const res = await fetch(
      path.startsWith('http') ? path : `${API_BASE_URL}${path.replace(/^\//, '')}`,
      { ...options, method: 'DELETE', credentials: 'include', headers }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  put: async (path: string, data: any, options: RequestInit = {}) => {
    const email = getUserEmail();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(email ? { 'X-User-Email': email } : {}),
    };
    const res = await fetch(
      path.startsWith('http') ? path : `${API_BASE_URL}${path.replace(/^\//, '')}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
        ...options,
      }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  // Add put, etc. as needed
};

export default api;

export const profilesAPI = {
  getAll: async () => {
    return api.get('profiles/');
  },
  getById: async (id: string) => {
    return api.get(`profiles/${id}`);
  },
  create: async (data: any) => {
    return api.post('profiles/', data);
  },
  update: async (id: string | number, data: any) => {
    return api.put(`profiles/${id}`, data);
  },
  delete: async (id: string | number) => {
    return api.delete(`profiles/${id}`);
  },
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const email = getUserEmail();
    const headers = {
      ...(email ? { 'X-User-Email': email } : {}),
    };
    
    const res = await fetch(`${API_BASE_URL}profiles/upload-resume`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
    
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export const interviewsAPI = {
  getAll: async () => {
    return api.get('interviews/');
  },
  getById: async (id: string) => {
    return api.get(`interviews/${id}`);
  },
  create: async (data: any) => {
    return api.post('interviews/', data);
  },
  delete: async (id: string) => {
    return api.post(`interviews/${id}/delete`, {});
  },
  complete: async (id: string) => {
    return api.post(`interviews/${id}/complete`, {});
  },
  generateQuestion: async (id: string, data: any) => {
    return api.post(`interviews/${id}/generate-question`, data);
  },
  respondToQuestion: async (interviewId: string, questionId: string, answer: string) => {
    return api.post(`interviews/${interviewId}/questions/${questionId}/respond`, answer);
  },
  getFeedback: async (interviewId: string) => {
    return api.post(`interviews/${interviewId}/feedback`, {});
  },
}; 