// Authentication context types.

export interface AuthContext {
  isAuthenticated: boolean;
  token: string | null;
  currentAccountId: string | null;
}
