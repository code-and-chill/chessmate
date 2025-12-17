import type { ISocialRepository } from '../repositories/ISocialRepository';
import type { Friend } from '@/types/social';

export class FetchFriendsError extends Error {
  constructor(message: string = 'Failed to fetch friends') {
    super(message);
    this.name = 'FetchFriendsError';
  }
}

/**
 * FetchFriends Use Case
 * 
 * Fetches user's friends list.
 * 
 * Business rules:
 * - User must exist
 */
export class FetchFriendsUseCase {
  constructor(private socialRepository: ISocialRepository) {}

  async execute(userId: string): Promise<Friend[]> {
    try {
      return await this.socialRepository.getFriends(userId);
    } catch (error) {
      throw new FetchFriendsError(
        error instanceof Error ? error.message : 'Failed to fetch friends'
      );
    }
  }
}
