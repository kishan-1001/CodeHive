const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export const api = {
  async post(endpoint: string, data: any) {
    const token = sessionStorage.getItem('token');
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
      throw new Error(error.message || error.error || 'Something went wrong');
    }

    return response.json();
  },

  async get(endpoint: string) {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Something went wrong');
    }

    return response.json();
  },

  async put(endpoint: string, data: any) {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Something went wrong');
    }

    return response.json();
  },

  async delete(endpoint: string) {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Something went wrong');
    }

    return response.json();
  },

  async uploadFile(endpoint: string, formData: FormData) {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        // No Content-Type header needed for FormData; fetch sets it automatically with boundary
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Something went wrong');
    }

    return response.json();
  },
};

export const authAPI = {
  async register(userData: { name: string; email: string; password: string; username?: string }) {
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

  async commentOnPost(postId: number, data: { content: string; parent_id?: number }) {
    return api.post(`/posts/${postId}/comment`, data);
  },

  async likeComment(commentId: number) {
    return api.post(`/posts/comments/${commentId}/like`, {});
  },

  async getComments(postId: number) {
    return api.get(`/posts/${postId}/comments`);
  },



  async getTopContributors() {
    return api.get('/posts/top-contributors');
  },

  async getSavedPosts() {
    return api.get('/posts/saved');
  },

  async toggleSavePost(postId: number) {
    return api.post(`/posts/${postId}/save`, {});
  },
};

export const problemsAPI = {
  async getTopics() {
    return api.get('/problems/topics');
  },

  async getProblems(topic?: string, difficulty?: string, search?: string) {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (difficulty) params.append('difficulty', difficulty);
    if (search) params.append('search', search);
    return api.get(`/problems?${params.toString()}`);
  },

  async getProblemById(id: string) {
    return api.get(`/problems/${id}`);
  },

  async getProblemBySlug(slug: string) {
    return api.get(`/problems/slug/${slug}`);
  },

  async getProblemTemplate(problemId: string, language: string) {
    return api.get(`/problems/${problemId}/templates/${language}`);
  },
  async getProblemSolutions(id: string, language: string) {
    return api.get(`/problems/${id}/solutions/${language}`);
  },

  async getContestResults(contestId: string) {
    return api.get(`/contests/${contestId}/my-results`);
  },
};

export const submitAPI = {
  async submitCode(code: string, language: string, problemId: number) {
    return api.post('/submit', { code, language, problem_id: problemId });
  },
};

export const submissionsAPI = {
  async getProblemSubmissions(problemId: string) {
    return api.get(`/submissions/${problemId}`);
  },
};

export const arenaAPI = {
  async createSession(companies: string[], topics: string[]) {
    return api.post('/arena/create', { companies, topics });
  },

  async getSession(sessionId: string) {
    return api.get(`/arena/${sessionId}`);
  },

  async submitSolution(data: { code: string; language: string; problem_id: number; session_id: number }) {
    return api.post('/arena/submit', data);
  },

  async finishSession(sessionId: string) {
    return api.post('/arena/finish', { sessionId });
  },

  async getSubmissions(problemId: number) {
    return api.get(`/submissions/${problemId}`);
  },
};

export const userProfileAPI = {
  async getProfileStats() {
    return api.get('/profile/stats');
  },

  async updateProfile(data: { name: string; bio?: string; social_links?: any; avatar_url?: string; is_public?: boolean }) {
    return api.put('/profile/update', data);
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.uploadFile('/profile/upload-avatar', formData);
  },

  async getUserActivity(page: number = 1, limit: number = 10) {
    return api.get(`/profile/activity?page=${page}&limit=${limit}`);
  },

  async getPublicProfile(username: string) {
    return api.get(`/profile/public/${username}`);
  }
};

export const leaderboardAPI = {
  async getGlobalLeaderboard(page: number = 1, limit: number = 15, search: string = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search
    });
    return api.get(`/leaderboard/global?${params.toString()}`);
  },

  async getMyRank() {
    return api.get('/leaderboard/my-rank');
  }
};

export const roomAPI = {
  async createRoom(topics: string[], problemCount: number, timeLimitMinutes: number) {
    return api.post('/rooms/create', { topics, problemCount, timeLimitMinutes });
  },

  async joinRoom(roomCode: string) {
    return api.post('/rooms/join', { roomCode });
  },

  async getRoom(roomId: string) {
    return api.get(`/rooms/${roomId}`);
  },

  async startRoom(roomId: string) {
    return api.post(`/rooms/${roomId}/start`, {});
  },



  async submitSolution(data: { roomId: number; problemId: number; code: string; language: string }) {
    return api.post('/rooms/submit', data);
  },

  async runCode(data: { code: string; language: string; problemId: number }) {
    return api.post('/rooms/run', data);
  },

  async getRoomHistory() {
    return api.get('/rooms/history');
  }
};
