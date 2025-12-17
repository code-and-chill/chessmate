import type { IAccountRepository } from '../repositories/IAccountRepository';
import type { UserPreferences } from '../types';

export class FetchUserPreferencesError extends Error {
  constructor(message: string = 'Failed to fetch user preferences') {
    super(message);
    this.name = 'FetchUserPreferencesError';
  }
}

/**
 * FetchUserPreferences Use Case
 * 
 * Fetches user preferences.
 * 
 * Business rules:
 * - User must exist
 */
export class FetchUserPreferencesUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(userId: string): Promise<UserPreferences> {
    try {
      return await this.accountRepository.getPreferences(userId);
    } catch (error) {
      throw new FetchUserPreferencesError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch user preferences'
      );
    }
  }
}
