/**
 * useAuth Hook
 * 
 * Provides authentication state and methods.
 * Single Responsibility: Authentication context access.
 * 
 * Must be used within an AuthProvider wrapper.
 */

// Mock authentication context until AuthProvider is implemented
export interface AuthContext {
  isAuthenticated: boolean;
  token: string | null;
  currentAccountId: string | null;
}

const mockAuthContext: AuthContext = {
  isAuthenticated: false,
  token: null,
  currentAccountId: null,
};

/**
 * Hook to access authentication state.
 * 
 * @returns Authentication context with isAuthenticated, token, currentAccountId
 * 
 * Usage:
 * ```
 * const { token, currentAccountId, isAuthenticated } = useAuth();
 * ```
 */
export const useAuth = (): AuthContext => {
  // TODO: Replace with actual context when AuthProvider is implemented
  // import { useContext } from 'react';
  // const context = useContext(AuthContextValue);
  // if (!context) {
  //   throw new Error('useAuth must be used within an AuthProvider');
  // }
  // return context;

  return mockAuthContext;
};