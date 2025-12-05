import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { rewardService } from '../services/reward.service';

export const rewardController = {
  /**
   * Trigger reward for accepted answer
   */
  triggerReward: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const { answerId } = req.body;

    const result = await rewardService.rewardAcceptedAnswer(answerId);

    res.json({
      success: true,
      data: result,
    });
  },

  /**
   * Get token balance
   */
  getBalance: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const balance = await rewardService.getTokenBalance(walletAddress);

    res.json({
      success: true,
      data: { balance },
    });
  },

  /**
   * Get reward history
   */
  getHistory: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress;
    const history = await rewardService.getRewardHistory(walletAddress);

    res.json({
      success: true,
      data: { history },
    });
  },
};

