import { ethers } from 'ethers';
import { Answer } from '../models/Answer';
import { RewardLog } from '../models/RewardLog';
import { User } from '../models/User';
import { getAdminWallet, getProvider } from '../config/blockchain';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

// Simple ABI for VibeToken (mint function)
const VIBE_TOKEN_ABI = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
];

export class RewardService {
  /**
   * Reward accepted answer
   */
  async rewardAcceptedAnswer(answerId: string): Promise<{
    txHash: string;
    amount: string;
  }> {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      throw new NotFoundError('Answer');
    }

    if (!answer.isAccepted) {
      throw new Error('Answer is not accepted');
    }

    // Check if already rewarded
    const existingReward = await RewardLog.findOne({
      answerId,
      rewardType: 'accepted_answer',
      status: 'confirmed',
    });

    if (existingReward) {
      throw new Error('Answer already rewarded');
    }

    const VIBE_TOKEN_ADDRESS = process.env.VIBE_TOKEN_ADDRESS;
    if (!VIBE_TOKEN_ADDRESS) {
      throw new Error('VIBE_TOKEN_ADDRESS not configured');
    }

    try {
      const wallet = getAdminWallet();
      const tokenContract = new ethers.Contract(
        VIBE_TOKEN_ADDRESS,
        VIBE_TOKEN_ABI,
        wallet
      );

      // Reward amount: 50 VIBE (50 * 10^18 wei)
      const amount = ethers.parseEther('50');

      // Call mint function
      const tx = await tokenContract.mint(answer.author, amount);
      logger.info(`✅ Reward transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      const txHash = receipt.hash;

      // Save reward log
      await RewardLog.create({
        answerId,
        recipient: answer.author,
        rewardType: 'accepted_answer',
        amount: amount.toString(),
        txHash,
        status: 'confirmed',
      });

      // Update answer with tx hash
      await Answer.findByIdAndUpdate(answerId, {
        $push: { txHashes: txHash },
      });

      // Update user reputation
      await User.findOneAndUpdate(
        { walletAddress: answer.author },
        { $inc: { reputation: 50 } }
      );

      return {
        txHash,
        amount: amount.toString(),
      };
    } catch (error: any) {
      logger.error(`❌ Reward transaction failed: ${error.message}`);

      // Save failed reward log
      await RewardLog.create({
        answerId,
        recipient: answer.author,
        rewardType: 'accepted_answer',
        amount: ethers.parseEther('50').toString(),
        txHash: 'failed',
        status: 'failed',
      });

      throw new Error(`Reward transaction failed: ${error.message}`);
    }
  }

  /**
   * Get token balance for wallet
   */
  async getTokenBalance(walletAddress: string): Promise<string> {
    const VIBE_TOKEN_ADDRESS = process.env.VIBE_TOKEN_ADDRESS;
    if (!VIBE_TOKEN_ADDRESS) {
      throw new Error('VIBE_TOKEN_ADDRESS not configured');
    }

    try {
      const provider = getProvider();
      const tokenContract = new ethers.Contract(
        VIBE_TOKEN_ADDRESS,
        VIBE_TOKEN_ABI,
        provider
      );

      const balance = await tokenContract.balanceOf(walletAddress);
      return ethers.formatEther(balance);
    } catch (error: any) {
      logger.error(`❌ Failed to get token balance: ${error.message}`);
      return '0';
    }
  }

  /**
   * Get reward history
   */
  async getRewardHistory(recipient?: string) {
    const filter = recipient ? { recipient: recipient.toLowerCase() } : {};
    return RewardLog.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  }
}

export const rewardService = new RewardService();

