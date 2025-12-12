import { Vote } from '../models/Vote';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { NotFoundError } from '../utils/errors';
import { rewardService } from './reward.service';
import { logger } from '../utils/logger';

export class VoteService {
  /**
   * Vote on question or answer
   */
  async vote(
    voter: string,
    targetType: 'question' | 'answer',
    targetId: string,
    value: 1 | -1
  ) {
    // Check if target exists
    if (targetType === 'question') {
      const question = await Question.findById(targetId);
      if (!question) {
        throw new NotFoundError('Question');
      }
    } else {
      const answer = await Answer.findById(targetId);
      if (!answer) {
        throw new NotFoundError('Answer');
      }
    }

    // Check if vote already exists
    const existingVote = await Vote.findOne({
      voter,
      targetType,
      targetId,
    });

    if (existingVote) {
      // Update existing vote
      if (existingVote.value === value) {
        // Same vote, remove it
        await this.removeVote(voter, targetType, targetId);
        return { success: true, action: 'removed' };
      } else {
        // Change vote
        existingVote.value = value;
        await existingVote.save();
        await this.updateVoteCounts(targetType, targetId);
        return { success: true, action: 'changed' };
      }
    } else {
      // Create new vote
      await Vote.create({
        voter,
        targetType,
        targetId,
        value,
      });
      await this.updateVoteCounts(targetType, targetId);
      return { success: true, action: 'added' };
    }
  }

  /**
   * Remove vote
   */
  async removeVote(
    voter: string,
    targetType: 'question' | 'answer',
    targetId: string
  ) {
    const vote = await Vote.findOneAndDelete({
      voter,
      targetType,
      targetId,
    });

    if (vote) {
      await this.updateVoteCounts(targetType, targetId);
    }

    return { success: true };
  }

  /**
   * Update vote counts on target
   */
  private async updateVoteCounts(
    targetType: 'question' | 'answer',
    targetId: string
  ) {
    const votes = await Vote.find({ targetType, targetId });

    const upvotes = votes.filter((v) => v.value === 1).length;
    const downvotes = votes.filter((v) => v.value === -1).length;

    if (targetType === 'question') {
      await Question.findByIdAndUpdate(targetId, {
        votesCount: upvotes - downvotes,
      });
    } else {
      await Answer.findByIdAndUpdate(targetId, {
        upvotes,
        downvotes,
      });

      // Check if answer reached upvote threshold (10 upvotes)
      if (upvotes >= 10) {
        try {
          // Check if already rewarded for upvote threshold
          const { RewardLog } = await import('../models/RewardLog');
          const existingReward = await RewardLog.findOne({
            answerId: targetId,
            rewardType: 'upvote_threshold',
            status: 'confirmed',
          });

          if (!existingReward) {
            logger.info(`🎁 Answer ${targetId} reached upvote threshold (${upvotes} upvotes), triggering reward...`);
            await rewardService.rewardUpvoteThreshold(targetId);
            logger.info(`✅ Upvote threshold reward triggered successfully for answer ${targetId}`);
          }
        } catch (error: any) {
          logger.error(`⚠️ Failed to trigger upvote threshold reward for answer ${targetId}: ${error.message}`);
          // Don't throw - voting should still succeed even if reward fails
        }
      }
    }
  }

  /**
   * Get user's vote on target
   */
  async getUserVote(
    voter: string,
    targetType: 'question' | 'answer',
    targetId: string
  ) {
    const vote = await Vote.findOne({
      voter,
      targetType,
      targetId,
    });

    return vote ? vote.value : null;
  }
}

export const voteService = new VoteService();





