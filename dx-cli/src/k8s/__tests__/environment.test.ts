import { deriveNamespace } from '../environment';
import { NamespaceStrategy } from '../types';

describe('deriveNamespace', () => {
  let originalUser: string | undefined;

  beforeEach(() => {
    originalUser = process.env.USER;
  });

  afterEach(() => {
    if (originalUser) {
      process.env.USER = originalUser;
    } else {
      delete process.env.USER;
    }
  });

  test('derives namespace for per-user and sanitizes (git or OS user)', () => {
    // Note: deriveNamespace prefers git config user.name, falls back to $USER
    // This test just validates that it returns a valid namespace
    process.env.USER = 'Alice.Smith';
    const ns = deriveNamespace(NamespaceStrategy.PER_USER, 'dev');
    
    // Validate format: should start with default, contain sanitized username
    expect(ns).toMatch(/^dev-[a-z0-9-]+$/);
    expect(ns.length).toBeLessThanOrEqual(253); // k8s limit
  });

  test('uses defaultNamespace for fixed strategy', () => {
    const ns = deriveNamespace(NamespaceStrategy.FIXED, 'monocto-prod');
    expect(ns).toBe('monocto-prod');
  });

  test('per-team falls back to defaultNamespace', () => {
    const ns = deriveNamespace(NamespaceStrategy.PER_TEAM, 'monocto-dev');
    expect(ns).toBe('monocto-dev');
  });
});
