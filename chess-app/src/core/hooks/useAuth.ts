// useAuth hook - provides authentication context.
// In a real implementation, this would be provided by a context provider.
// For now, it's a placeholder that shows the expected interface.

import { useContext, createContext } from 'react';
import { AuthContext } from '../models/auth';

// Create auth context (should be provided by AuthProvider component)
export const AuthContextValue = createContext<AuthContext | null>(null);

// Hook to access authentication state.
// Requires an AuthProvider wrapper in the component tree.
export const useAuth = (): AuthContext => {
  const context = useContext(AuthContextValue);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
