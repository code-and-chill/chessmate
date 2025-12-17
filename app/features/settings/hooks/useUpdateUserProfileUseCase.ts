import { useMemo } from 'react';
import { UpdateUserProfileUseCase } from '../use-cases/UpdateUserProfile';
import { useAccountRepository } from './useAccountRepository';

/**
 * Hook for dependency injection of UpdateUserProfileUseCase
 */
export function useUpdateUserProfileUseCase() {
  const accountRepository = useAccountRepository();

  return useMemo(
    () => new UpdateUserProfileUseCase(accountRepository),
    [accountRepository]
  );
}
