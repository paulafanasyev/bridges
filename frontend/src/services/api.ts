import { User, AuthTokens, LoginRequest, RegisterRequest, Language, Match, Call, Message } from '../types';

const API_BASE = '/api';

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  private getHeaders(includeAuth = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (includeAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    includeAuth = true
  ): Promise<T> {
    const url = `${API_BASE}${path}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(includeAuth),
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // Handle 401 - try token refresh
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        options.headers = this.getHeaders(true);
        const retryResponse = await fetch(url, options);
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new ApiError(retryResponse.status, errorData.error || 'Request failed', errorData.details);
        }
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.error || 'Request failed', errorData.details);
    }

    return response.json();
  }

  private async refreshTokens(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.tokens || data);
        return true;
      }
      this.clearTokens();
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  setTokens(tokens: AuthTokens) {
    // Backend returns accessToken/refreshToken (camelCase)
    this.accessToken = tokens.accessToken || tokens.access_token;
    this.refreshToken = tokens.refreshToken || tokens.refresh_token;
    if (typeof window !== 'undefined') {
      if (this.accessToken) localStorage.setItem('access_token', this.accessToken);
      if (this.refreshToken) localStorage.setItem('refresh_token', this.refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const result = await this.request<{ user: User; tokens: AuthTokens }>('POST', '/auth/login', data, false);
    this.setTokens(result.tokens);
    return result;
  }

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const result = await this.request<{ message: string; user: User; tokens: AuthTokens }>('POST', '/auth/register', data, false);
    this.setTokens(result.tokens);
    return { user: result.user, tokens: result.tokens };
  }

  async logout(): Promise<void> {
    try {
      await this.request('POST', '/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  // Profile endpoints
  async getProfile(userId?: string): Promise<User> {
    const id = userId || 'me';
    return this.request<User>('GET', `/profile/${id}`);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('PUT', '/profile/me', data);
  }

  async uploadPhoto(formData: FormData): Promise<{ url: string }> {
    const url = `${API_BASE}/profile/photo`;
    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    const response = await fetch(url, { method: 'POST', headers, body: formData });
    if (!response.ok) throw new ApiError(response.status, 'Upload failed');
    return response.json();
  }

  // Discover endpoints
  async getDiscoverProfiles(filters?: { gender?: string; minAge?: number; maxAge?: number }): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.gender && filters.gender !== 'all') params.set('gender', filters.gender);
    if (filters?.minAge) params.set('minAge', String(filters.minAge));
    if (filters?.maxAge) params.set('maxAge', String(filters.maxAge));
    const query = params.toString();
    return this.request<User[]>('GET', `/discover${query ? `?${query}` : ''}`);
  }

  // Match endpoints
  async getMatches(): Promise<Match[]> {
    return this.request<Match[]>('GET', '/matches');
  }

  async sendLike(userId: string): Promise<void> {
    return this.request('POST', `/likes/${userId}`);
  }

  // Message endpoints
  async getMessages(matchId: string): Promise<Message[]> {
    return this.request<Message[]>('GET', `/messages/${matchId}`);
  }

  async sendMessage(matchId: string, content: string): Promise<Message> {
    return this.request<Message>('POST', `/messages/${matchId}`, { content });
  }

  // Call endpoints
  async initiateCall(calleeId: string): Promise<Call> {
    return this.request<Call>('POST', '/calls', { calleeId });
  }

  async updateCallStatus(callId: string, status: string): Promise<Call> {
    return this.request<Call>('PATCH', `/calls/${callId}`, { status });
  }

  async getCalls(): Promise<Call[]> {
    return this.request<Call[]>('GET', '/calls');
  }

  // Translation endpoint
  async translateText(text: string, from: Language, to: Language): Promise<{ translated: string }> {
    return this.request<{ translated: string }>('POST', '/translate', { text, from, to });
  }

  // Admin endpoints
  async getAdminStats(): Promise<{
    totalUsers: number;
    registrationsToday: number;
    activeUsers: number;
    matchesToday: number;
    registrationsWeekly: number[];
    registrationsMonthly: number[];
  }> {
    return this.request('GET', '/admin/stats');
  }

  async getAdminUsers(): Promise<User[]> {
    return this.request<User[]>('GET', '/admin/users');
  }

  // Payment endpoints
  async createPayment(planId: string): Promise<{ url: string; transactionId: string }> {
    return this.request('POST', '/payments/create', { planId });
  }

  // Health check
  async health(): Promise<{ status: string }> {
    return this.request<{ status: string }>('GET', '/health', undefined, false);
  }
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiService();
export { ApiError };
export default api;