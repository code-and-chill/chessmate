import type { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenResponse } from '@/types/auth';

/**
 * Auth API Client - handles authentication and user sessions
 */

export interface IAuthApiClient {
  login(email: string, password: string): Promise<AuthResponse>;
  register(username: string, email: string, password: string): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
  logout(token: string): Promise<void>;
  verifyToken(token: string): Promise<boolean>;
  getSession?(): AuthResponse;
}

/**
 * Auth API Client for account-api authentication endpoints
 */
export class AuthApiClient implements IAuthApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8002') {
    this.baseUrl = baseUrl;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token refresh failed');
    }

    return response.json();
  }

  /**
   * Logout (invalidate token)
   */
  async logout(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }
  }

  /**
   * Verify token validity
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
