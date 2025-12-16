import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApiClients } from './ApiContext';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = '@chess_auth_token';
const AUTH_USER_KEY = '@chess_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authApi } = useApiClients();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved auth state on mount
  useEffect(() => {
    loadAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAuthState = async () => {
    // Only load from storage on client-side (not during SSR)
    if (typeof window === 'undefined' && !(typeof global !== 'undefined' && global.navigator?.product === 'ReactNative')) {
      setIsLoading(false);
      return;
    }
    
    try {
      const [savedToken, savedUser] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLoading(false);
        return;
      }

      // No saved token/user — ask the authApi for a session if it exposes one.
      if (authApi && typeof (authApi as any).getSession === 'function') {
          const sessionOrPromise = (authApi as any).getSession();
          const session = sessionOrPromise instanceof Promise ? await sessionOrPromise : sessionOrPromise;
          if (session && session.token && session.user) {
              if (typeof window !== 'undefined' || (typeof global !== 'undefined' && global.navigator?.product === 'ReactNative')) {
                await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.token);
                await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
              }
              setToken(session.token);
              setUser(session.user);
              setIsLoading(false);
              return;
          }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (typeof window !== 'undefined' || (typeof global !== 'undefined' && global.navigator?.product === 'ReactNative')) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      }

      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authApi.register(username, email, password);

      if (typeof window !== 'undefined' || (typeof global !== 'undefined' && global.navigator?.product === 'ReactNative')) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      }

      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout(token);
      }
      if (typeof window !== 'undefined' || (typeof global !== 'undefined' && global.navigator?.product === 'ReactNative')) {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      }
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      if (!token) return;
      
      const response = await authApi.refreshToken(token);
      if (typeof window !== 'undefined' || (typeof global !== 'undefined' && global.navigator?.product === 'ReactNative')) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      }
      setToken(response.token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // On refresh failure, logout
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
