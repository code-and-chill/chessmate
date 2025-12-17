import type { IAccountRepository } from '../repositories/IAccountRepository';
import type { UserPreferences } from '../types';
import type { UpdatePreferencesParams } from '../repositories/IAccountRepository';

export class UpdateUserPreferencesError extends Error {
  constructor(message: string = 'Failed to update user preferences') {
    super(message);
    this.name = 'UpdateUserPreferencesError';
  }
}

/**
 * UpdateUserPreferences Use Case
 * 
 * Updates user preferences.
 * 
 * Business rules:
 * - User must exist
 * - Preferences must be valid
 */
export class UpdateUserPreferencesUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(params: UpdatePreferencesParams): Promise<UserPreferences> {
    try {
      return await this.accountRepository.updatePreferences(params);
    } catch (error) {
      throw new UpdateUserPreferencesError(
        error instanceof Error
          ? error.message
          : 'Failed to update user preferences'
      );
    }
  }
}
