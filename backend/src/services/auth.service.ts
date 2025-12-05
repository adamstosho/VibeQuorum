import { User } from '../models/User';
import { normalizeAddress } from '../utils/helpers';
import { logger } from '../utils/logger';

export class AuthService {
  /**
   * Get or create user by wallet address
   */
  async getOrCreateUser(walletAddress: string): Promise<{
    user: any;
    isNew: boolean;
  }> {
    const normalizedAddress = normalizeAddress(walletAddress);

    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (user) {
      return { user, isNew: false };
    }

    // Create new user
    user = await User.create({
      walletAddress: normalizedAddress,
      displayName: `User_${normalizedAddress.slice(2, 10)}`,
      reputation: 0,
      tokenBalanceCached: 0,
    });

    logger.info(`✅ New user created: ${normalizedAddress}`);

    return { user, isNew: true };
  }

  /**
   * Get user by wallet address
   */
  async getUserByAddress(walletAddress: string): Promise<any> {
    const normalizedAddress = normalizeAddress(walletAddress);
    return User.findOne({ walletAddress: normalizedAddress });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    walletAddress: string,
    updates: {
      displayName?: string;
      avatarUrl?: string;
      profileBio?: string;
    }
  ) {
    const normalizedAddress = normalizeAddress(walletAddress);
    return User.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { $set: updates },
      { new: true, runValidators: true }
    );
  }
}

export const authService = new AuthService();

