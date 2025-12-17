import { useMemo } from 'react';
import { FetchUserPreferencesUseCase } from '../use-cases/FetchUserPreferences';
import { useAccountRepository } from './useAccountRepository';

/**
 * Hook for dependency injection of FetchUserPreferencesUseCase
 */
export function useFetchUserPreferencesUseCase() {
  const accountRepository = useAccountRepository();

  return useMemo(
    () => new FetchUserPreferencesUseCase(accountRepository),
    [accountRepository]
  );
}
