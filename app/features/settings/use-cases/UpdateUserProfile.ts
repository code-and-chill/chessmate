import type { IAccountRepository } from '../repositories/IAccountRepository';
import type { UserProfile } from '@/types/account';
import type { UpdateProfileParams } from '../repositories/IAccountRepository';

export class UpdateUserProfileError extends Error {
  constructor(message: string = 'Failed to update user profile') {
    super(message);
    this.name = 'UpdateUserProfileError';
  }
}

/**
 * UpdateUserProfile Use Case
 * 
 * Updates user profile.
 * 
 * Business rules:
 * - User must exist
 * - Updates must be valid
 */
export class UpdateUserProfileUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(params: UpdateProfileParams): Promise<UserProfile> {
    try {
      return await this.accountRepository.updateProfile(params);
    } catch (error) {
      throw new UpdateUserProfileError(
        error instanceof Error
          ? error.message
          : 'Failed to update user profile'
      );
    }
  }
}
