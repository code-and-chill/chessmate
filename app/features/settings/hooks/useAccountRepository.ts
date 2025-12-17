import { useMemo } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { AccountRepository } from '../repositories/AccountRepository';
import type { IAccountRepository } from '../repositories/IAccountRepository';

/**
 * Hook for dependency injection of AccountRepository
 */
export function useAccountRepository(): IAccountRepository {
  const { accountApi } = useApiClients();

  return useMemo(() => new AccountRepository(accountApi), [accountApi]);
}
