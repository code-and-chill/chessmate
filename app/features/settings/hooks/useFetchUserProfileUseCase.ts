import { useMemo } from 'react';
import { FetchUserProfileUseCase } from '../use-cases/FetchUserProfile';
import { useAccountRepository } from './useAccountRepository';

/**
 * Hook for dependency injection of FetchUserProfileUseCase
 */
export function useFetchUserProfileUseCase() {
  const accountRepository = useAccountRepository();

  return useMemo(
    () => new FetchUserProfileUseCase(accountRepository),
    [accountRepository]
  );
}
