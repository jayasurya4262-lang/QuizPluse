const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('quizpulse_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('quizpulse_token');
        localStorage.removeItem('quizpulse_user');
      }
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        errors: data.errors,
      };
    }

    return data;
  } catch (error: any) {
    console.error(`API request error on ${endpoint}:`, error);
    return {
      success: false,
      message: error.message || 'Network communication error. Please check your connection.',
    };
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  registerStudent: (data: { name: string; email: string; password: string }) =>
    request('/auth/register-student', { method: 'POST', body: JSON.stringify(data) }),
  registerTeacher: (data: { name: string; email: string; password: string }) =>
    request('/auth/register-teacher', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload: { token: string; password: string }) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  // Quizzes
  getQuizzes: (params?: { myQuizzes?: boolean; status?: string; topic?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.myQuizzes) query.append('myQuizzes', 'true');
    if (params?.status) query.append('status', params.status);
    if (params?.topic) query.append('topic', params.topic);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString();
    return request(`/quizzes${queryString ? `?${queryString}` : ''}`);
  },
  getQuiz: (id: string) => request(`/quizzes/${id}`),
  createQuiz: (quizData: any) =>
    request('/quizzes', { method: 'POST', body: JSON.stringify(quizData) }),
  updateQuiz: (id: string, quizData: any) =>
    request(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(quizData) }),
  deleteQuiz: (id: string) => request(`/quizzes/${id}`, { method: 'DELETE' }),
  publishQuiz: (id: string) => request(`/quizzes/${id}/publish`, { method: 'POST' }),
  unpublishQuiz: (id: string) => request(`/quizzes/${id}/unpublish`, { method: 'POST' }),

  // Questions
  addQuestion: (quizId: string, questionData: any) =>
    request(`/quizzes/${quizId}/questions`, { method: 'POST', body: JSON.stringify(questionData) }),
  updateQuestion: (quizId: string, questionId: string, questionData: any) =>
    request(`/quizzes/${quizId}/questions/${questionId}`, { method: 'PUT', body: JSON.stringify(questionData) }),
  deleteQuestion: (quizId: string, questionId: string) =>
    request(`/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' }),
  reorderQuestions: (quizId: string, orderedIds: string[]) =>
    request(`/quizzes/${quizId}/questions/reorder`, { method: 'POST', body: JSON.stringify({ orderedIds }) }),

  // Attempts
  startAttempt: (quizId: string) =>
    request('/attempts/start', { method: 'POST', body: JSON.stringify({ quizId }) }),
  getAttempt: (attemptId: string) => request(`/attempts/${attemptId}`),
  saveAnswer: (attemptId: string, payload: { questionId: string; selectedOptionId?: string | null; textAnswer?: string | null }) =>
    request(`/attempts/${attemptId}/save-answer`, { method: 'POST', body: JSON.stringify(payload) }),
  submitAttempt: (attemptId: string) =>
    request(`/attempts/${attemptId}/submit`, { method: 'POST' }),

  // Results
  getResult: (attemptId: string) => request(`/results/${attemptId}`),

  // Analytics
  getStudentAttempts: () => request('/analytics/student/attempts'),
  getStudentOverview: () => request('/analytics/student/overview'),
  getLeaderboard: () => request('/analytics/leaderboard'),
  getTeacherOverview: () => request('/analytics/teacher/overview'),
  getTeacherQuizAnalytics: (quizId: string) => request(`/analytics/teacher/quiz/${quizId}`),
  getExportCsvUrl: (quizId: string) => `${BASE_URL}/analytics/teacher/quiz/${quizId}/export-csv`,
};
