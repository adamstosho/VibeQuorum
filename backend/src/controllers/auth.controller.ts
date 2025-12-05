import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { authService } from '../services/auth.service';

export const authController = {
  /**
   * Get or create user
   */
  connect: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;

    const { user, isNew } = await authService.getOrCreateUser(walletAddress);

    res.json({
      success: true,
      data: {
        user,
        isNew,
      },
    });
  },

  /**
   * Get current user
   */
  getMe: async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
    const walletAddress = req.walletAddress!;

    const user = await authService.getUserByAddress(walletAddress);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  },

  /**
   * Update profile
   */
  updateProfile: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const { displayName, avatarUrl, profileBio } = req.body;

    const user = await authService.updateProfile(walletAddress, {
      displayName,
      avatarUrl,
      profileBio,
    });

    res.json({
      success: true,
      data: { user },
    });
  },
};

