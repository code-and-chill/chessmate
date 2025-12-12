import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USER, delay } from './mock-data';
import type { AuthResponse } from '@/types/auth';
import type { IAuthApiClient } from './auth.api';

const AUTH_TOKEN_KEY = '@chess_auth_token';
const AUTH_USER_KEY = '@chess_auth_user';

export class MockAuthApiClient implements IAuthApiClient {
  constructor() {
    void this.initializeMockSession();
  }

  private async initializeMockSession() {
      const existingToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!existingToken) {
          const session = this.getSession();
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.token);
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
      }
  }

  async login(_email: string, _password: string): Promise<AuthResponse> {
    await delay();
    return {
      token: `mock_token_${Date.now()}`,
      user: MOCK_USER,
    };
  }

  async register(_username: string, _email: string, _password: string): Promise<AuthResponse> {
    await delay();
    return {
      token: `mock_token_${Date.now()}`,
      user: { ...MOCK_USER, id: String(Date.now()) },
    };
  }

  async refreshToken(_refreshToken: string): Promise<{ token: string }> {
    await delay();
    return { token: `mock_token_refreshed_${Date.now()}` };
  }

  async logout(_token: string): Promise<void> {
    await delay();
  }

  async verifyToken(_token: string): Promise<boolean> {
    await delay();
    return true;
  }

  getSession(): AuthResponse {
    return { token: `mock_token_dev_${Date.now()}`, user: MOCK_USER };
  }
}
