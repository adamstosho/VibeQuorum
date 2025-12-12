import { Response } from 'express';
import { AuthRequest, ApiResponse, AIGenerateOptions } from '../types';
import { aiService } from '../services/ai.service';

export const aiController = {
  /**
   * Generate AI draft answer
   */
  generateDraft: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const { id } = req.params;
    const options: AIGenerateOptions = req.body.options || {};

    const result = await aiService.generateDraft(id, walletAddress, options);

    res.json({
      success: true,
      data: result,
    });
  },

  /**
   * Get AI usage stats
   */
  getUsageStats: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress;
    const stats = await aiService.getUsageStats(walletAddress);

    res.json({
      success: true,
      data: stats,
    });
  },
};





