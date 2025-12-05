import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { voteService } from '../services/vote.service';

export const voteController = {
  /**
   * Vote on question
   */
  voteQuestion: async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
    const voter = req.walletAddress!;
    const { id } = req.params;
    const { value } = req.body; // 1 for upvote, -1 for downvote

    if (![1, -1].includes(value)) {
      res.status(400).json({
        success: false,
        error: 'Invalid vote value. Must be 1 or -1',
      });
      return;
    }

    const result = await voteService.vote(voter, 'question', id, value);

    res.json({
      success: true,
      data: result,
    });
  },

  /**
   * Vote on answer
   */
  voteAnswer: async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
    const voter = req.walletAddress!;
    const { id } = req.params;
    const { value } = req.body; // 1 for upvote, -1 for downvote

    if (![1, -1].includes(value)) {
      res.status(400).json({
        success: false,
        error: 'Invalid vote value. Must be 1 or -1',
      });
      return;
    }

    const result = await voteService.vote(voter, 'answer', id, value);

    res.json({
      success: true,
      data: result,
    });
  },

  /**
   * Remove vote
   */
  removeVote: async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
    const voter = req.walletAddress!;
    const { id, type } = req.params; // type: 'question' or 'answer'

    if (!['question', 'answer'].includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "question" or "answer"',
      });
      return;
    }

    await voteService.removeVote(voter, type as 'question' | 'answer', id);

    res.json({
      success: true,
      message: 'Vote removed',
    });
  },
};

