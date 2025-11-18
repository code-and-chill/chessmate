import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Authentication State
 * Manages user authentication, tokens, and session state
 */

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  rating?: number;
  createdAt?: string;
}

export interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      login: async (username, _password) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Replace with actual API call
          // const response = await authApi.login({ username, password });

          // Mock response for now
          const mockUser: User = {
            id: '1',
            username,
            email: `${username}@example.com`,
            displayName: username,
            rating: 1500,
          };

          const mockAccessToken = 'mock-access-token';
          const mockRefreshToken = 'mock-refresh-token';

          set({
            user: mockUser,
            accessToken: mockAccessToken,
            refreshToken: mockRefreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        }),

      refreshAuthToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          // TODO: Replace with actual API call
          // const response = await authApi.refresh({ refreshToken });
          
          // Mock for now
          const mockAccessToken = 'new-mock-access-token';

          set({ accessToken: mockAccessToken });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Use localStorage for web, AsyncStorage for native (via expo-secure-store later)
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        // For native, you'd use AsyncStorage here
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
