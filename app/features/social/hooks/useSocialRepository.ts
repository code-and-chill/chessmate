import { useMemo } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { SocialRepository } from '../repositories/SocialRepository';
import type { ISocialRepository } from '../repositories/ISocialRepository';

/**
 * Hook for dependency injection of SocialRepository
 */
export function useSocialRepository(): ISocialRepository {
  const { socialApi } = useApiClients();

  return useMemo(() => new SocialRepository(socialApi), [socialApi]);
}
