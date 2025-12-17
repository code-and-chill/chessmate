import { useMemo } from 'react';
import { UpdateUserPreferencesUseCase } from '../use-cases/UpdateUserPreferences';
import { useAccountRepository } from './useAccountRepository';

/**
 * Hook for dependency injection of UpdateUserPreferencesUseCase
 */
export function useUpdateUserPreferencesUseCase() {
  const accountRepository = useAccountRepository();

  return useMemo(
    () => new UpdateUserPreferencesUseCase(accountRepository),
    [accountRepository]
  );
}
