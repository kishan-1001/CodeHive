const API_BASE_URL = '/api';

export const api = {
  async post(endpoint: string, data: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  async get(endpoint: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },
};

export const authAPI = {
  async register(userData: { name: string; email: string; password: string }) {
    return api.post('/auth/register', userData);
  },

  async verifyOTP(otpData: { email: string; otp: string }) {
    return api.post('/auth/verify-otp', otpData);
  },

  async login(credentials: { email: string; password: string }) {
    return api.post('/auth/login', credentials);
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async forgotPassword(emailData: { email: string }) {
    return api.post('/auth/forgot-password', emailData);
  },

  async verifyForgotPasswordOTP(otpData: { email: string; otp: string }) {
    return api.post('/auth/verify-forgot-password-otp', otpData);
  },

  async resetPassword(passwordData: { email: string; otp: string; newPassword: string }) {
    return api.post('/auth/reset-password', passwordData);
  },
};

export const postsAPI = {
  async getPosts() {
    return api.get('/posts');
  },

  async createPost(postData: { title: string; content: string }) {
    return api.post('/posts', postData);
  },

  async likePost(postId: number) {
    return api.post(`/posts/${postId}/like`, {});
  },

  async commentOnPost(postId: number, commentData: { content: string }) {
    return api.post(`/posts/${postId}/comment`, commentData);
  },

  async getComments(postId: number) {
    return api.get(`/posts/${postId}/comments`);
  },
};

export const problemsAPI = {
  async getTopics() {
    return api.get('/problems/topics');
  },

  async getProblems(topic?: string) {
    const query = topic ? `?topic=${topic}` : '';
    return api.get(`/problems/problems${query}`);
  },

  async getProblemById(id: string) {
    return api.get(`/problems/problems/${id}`);
  },

  async getProblemBySlug(slug: string) {
    return api.get(`/problems/problems/slug/${slug}`);
  },

  async getProblemTemplate(problemId: string, language: string) {
    return api.get(`/problems/${problemId}/templates/${language}`);
  },
};

export const submitAPI = {
  async submitCode(code: string, language: string, problemId: number) {
    return api.post('/submit', { code, language, problem_id: problemId });
  },
};
