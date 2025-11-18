/**
 * Security Layer
 * Handles authentication, authorization, and security utilities
 */

/**
 * Validate JWT token format (basic check)
 */
export function isValidJWT(token: string): boolean {
  if (!token) return false;
  
  // JWT has 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Decode JWT payload (no verification)
 * For display purposes only - never trust without server verification
 */
export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    if (!isValidJWT(token)) return null;
    
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if JWT is expired
 */
export function isJWTExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  const exp = payload.exp as number;
  return Date.now() >= exp * 1000;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  // 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength
 */
export interface PasswordStrength {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
}

export function validatePassword(password: string): PasswordStrength {
  const issues: string[] = [];
  let score = 0;

  if (password.length < 8) {
    issues.push('Password must be at least 8 characters');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain lowercase letters');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain uppercase letters');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    issues.push('Password must contain numbers');
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    issues.push('Password must contain special characters');
  } else {
    score += 1;
  }

  const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  const isValid = score >= 3;

  return {
    isValid,
    strength,
    issues,
  };
}

/**
 * Secure storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@chessmate/auth_token',
  REFRESH_TOKEN: '@chessmate/refresh_token',
  USER_DATA: '@chessmate/user_data',
  SETTINGS: '@chessmate/settings',
} as const;

/**
 * Rate limiting tracker
 */
class RateLimiter {
  private attempts = new Map<string, number[]>();

  /**
   * Check if action is allowed within rate limit
   * @param key Unique identifier for the action
   * @param maxAttempts Maximum allowed attempts
   * @param windowMs Time window in milliseconds
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.attempts.get(key) || [];

    // Remove old timestamps outside the window
    const recentAttempts = timestamps.filter((t) => now - t < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.attempts.clear();
  }
}

export const rateLimiter = new RateLimiter();
