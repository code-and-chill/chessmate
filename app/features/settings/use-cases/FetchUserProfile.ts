import type { IAccountRepository } from '../repositories/IAccountRepository';
import type { UserProfile } from '@/types/account';

export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

/**
 * FetchUserProfile Use Case
 * 
 * Fetches user profile by ID.
 * 
 * Business rules:
 * - User must exist
 */
export class FetchUserProfileUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    try {
      return await this.accountRepository.getProfile(userId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new UserNotFoundError(userId);
      }
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch user profile'
      );
    }
  }
}
