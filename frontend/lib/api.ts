import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { username: string; email: string; password: string; password_confirm: string }) =>
    api.post('/auth/register/', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
};

export const quizAPI = {
  create: (data: { title: string; description?: string; difficulty: string; time_per_question?: number }) =>
    api.post('/quiz/host/', data),
  list: () => api.get('/quiz/host/'),
  get: (id: string) => api.get(`/quiz/host/${id}/`),
  uploadDocuments: (id: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    return api.post(`/quiz/host/${id}/upload_documents/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  generateQuestions: (id: string, data: { num_questions: number; difficulty?: string }) =>
    api.post(`/quiz/host/${id}/generate_questions/`, data),
  getQuestions: (id: string) => api.get(`/quiz/host/${id}/questions/`),
  addQuestion: (id: string, data: any) => api.post(`/quiz/host/${id}/add_question/`, data),
  updateQuestion: (id: string, data: any) => api.put(`/quiz/host/${id}/update_question/`, data),
  deleteQuestion: (id: string, questionId: string) =>
    api.delete(`/quiz/host/${id}/delete_question/?question_id=${questionId}`),
  confirmQuiz: (id: string, data?: { time_per_question?: number }) =>
    api.post(`/quiz/host/${id}/confirm_quiz/`, data || {}),
  getLeaderboard: (id: string) => api.get(`/quiz/host/${id}/leaderboard/`),
  // Public endpoints
  join: (id: string, nickname: string) =>
    api.post(`/quiz/public/${id}/join/`, { nickname }),
  submitAnswer: (id: string, data: {
    nickname: string;
    question_id: string;
    selected_option: string;
    response_time: number;
  }) => api.post(`/quiz/public/${id}/submit_answer/`, data),
  getPublicQuiz: (id: string) => api.get(`/quiz/public/${id}/`),
  downloadResults: (id: string) => api.get(`/quiz/host/${id}/results/download`, { responseType: 'blob' }),
};

export default api;
