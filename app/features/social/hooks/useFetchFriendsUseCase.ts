import { useMemo } from 'react';
import { FetchFriendsUseCase } from '../use-cases/FetchFriends';
import { useSocialRepository } from './useSocialRepository';

/**
 * Hook for dependency injection of FetchFriendsUseCase
 */
export function useFetchFriendsUseCase() {
  const socialRepository = useSocialRepository();

  return useMemo(
    () => new FetchFriendsUseCase(socialRepository),
    [socialRepository]
  );
}
