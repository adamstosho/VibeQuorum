import { ethers } from 'ethers';
import { Answer } from '../models/Answer';
import { RewardLog } from '../models/RewardLog';
import { User } from '../models/User';
import { getAdminWallet, getProvider } from '../config/blockchain';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

// ABI for VibeToken (balance check)
const VIBE_TOKEN_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
];

// ABI for RewardManager (reward distribution)
const REWARD_MANAGER_ABI = [
  'function rewardAcceptedAnswer(address recipient, bytes32 answerId, uint256 questionId) external',
  'function rewardUpvoteThreshold(address recipient, bytes32 answerId, uint256 questionId) external',
  'function rewardQuestioner(address recipient, uint256 questionId) external',
  'function generateAnswerIdFromString(string calldata answerIdString) external pure returns (bytes32)',
  'function acceptedAnswerReward() external view returns (uint256)',
  'function upvoteReward() external view returns (uint256)',
  'function questionerBonus() external view returns (uint256)',
  'function upvoteThreshold() external view returns (uint256)',
  'function isAnswerRewarded(bytes32 answerId) external view returns (bool)',
];

export class RewardService {
  /**
   * Reward accepted answer
   */
  async rewardAcceptedAnswer(answerId: string): Promise<{
    txHash: string;
    amount: string;
  }> {
    const answer = await Answer.findById(answerId).populate('questionId');
    if (!answer) {
      throw new NotFoundError('Answer');
    }

    if (!answer.isAccepted) {
      throw new Error('Answer is not accepted');
    }

    // Validate answer author
    if (!answer.author || !ethers.isAddress(answer.author)) {
      throw new Error(`Invalid answer author address: ${answer.author}`);
    }

    // Normalize address to checksum format
    const recipientAddress = ethers.getAddress(answer.author.toLowerCase());
    logger.info(`🎁 Processing reward for answer ${answerId}`);
    logger.info(`   Recipient address: ${recipientAddress}`);
    logger.info(`   Answer author (original): ${answer.author}`);

    // Check if already rewarded (but allow retry if previous attempt failed)
    const existingReward = await RewardLog.findOne({
      answerId,
      rewardType: 'accepted_answer',
      status: 'confirmed',
    });

    if (existingReward && existingReward.txHash !== 'failed') {
      throw new Error('Answer already rewarded');
    }

    // If there's a failed reward, delete it to allow retry
    if (existingReward && existingReward.status === 'failed') {
      logger.info(`🔄 Deleting failed reward log for answer ${answerId} to allow retry`);
      await RewardLog.deleteOne({ _id: existingReward._id });
    }

    const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;
    if (!REWARD_MANAGER_ADDRESS) {
      throw new Error('REWARD_MANAGER_ADDRESS not configured');
    }

    try {
      const wallet = getAdminWallet();
      const provider = getProvider();

      // Verify contract exists before proceeding
      const contractCode = await provider.getCode(REWARD_MANAGER_ADDRESS);
      if (contractCode === '0x' || contractCode === '0x0') {
        throw new Error(`RewardManager contract does not exist at address ${REWARD_MANAGER_ADDRESS}. Please deploy the contract or update REWARD_MANAGER_ADDRESS in .env`);
      }

      const rewardManagerContract = new ethers.Contract(
        REWARD_MANAGER_ADDRESS,
        REWARD_MANAGER_ABI,
        wallet
      );

      // Generate answer ID hash (bytes32) from MongoDB answer ID string
      const answerIdBytes = await rewardManagerContract.generateAnswerIdFromString(answerId);

      // Convert question ID (MongoDB ObjectId) to uint256
      // Use the last 8 bytes of the ObjectId hex string as uint256
      // Note: answer.questionId is populated, so we need to access _id or handle strictly
      const questionIdObj = answer.questionId as any;
      const questionIdHex = (questionIdObj._id || questionIdObj).toString();
      const questionIdNum = BigInt('0x' + questionIdHex.slice(-16) || '0');

      // Check if already rewarded on-chain
      const isRewarded = await rewardManagerContract.isAnswerRewarded(answerIdBytes);
      if (isRewarded) {
        throw new Error('Answer already rewarded on-chain');
      }

      // Get reward amount from contract (not strictly needed for tx but good for info if we wanted to log it before)
      // const rewardAmount = await rewardManagerContract.acceptedAnswerReward();

      // Call RewardManager.rewardAcceptedAnswer()
      logger.info(`📤 Calling RewardManager.rewardAcceptedAnswer()`);
      logger.info(`   Recipient: ${recipientAddress}`);
      logger.info(`   Answer ID: ${answerId}`);
      logger.info(`   Answer ID (bytes32): ${answerIdBytes}`);
      logger.info(`   Question ID: ${questionIdNum.toString()}`);

      const tx = await rewardManagerContract.rewardAcceptedAnswer(
        recipientAddress,
        answerIdBytes,
        questionIdNum
      );

      logger.info(`✅ Reward transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      const txHash = receipt.hash;

      // Get actual reward amount from contract (in case it changed)
      const actualAmount = await rewardManagerContract.acceptedAnswerReward();

      // Save reward log
      await RewardLog.create({
        answerId,
        recipient: recipientAddress.toLowerCase(),
        rewardType: 'accepted_answer',
        amount: actualAmount.toString(),
        txHash,
        status: 'confirmed',
      });

      // Update answer with tx hash and reward amount
      const rewardAmountInVibe = Number(ethers.formatEther(actualAmount));
      await Answer.findByIdAndUpdate(answerId, {
        $push: { txHashes: txHash },
        $inc: { vibeReward: rewardAmountInVibe },
      });

      // Update user reputation
      await User.findOneAndUpdate(
        { walletAddress: recipientAddress.toLowerCase() },
        { $inc: { reputation: 50 } }
      );

      return {
        txHash,
        amount: actualAmount.toString(),
      };
    } catch (error: any) {
      logger.error(`❌ Reward transaction failed: ${error.message}`);
      logger.error(`   Error details:`, error);
      logger.error(`   Recipient address: ${recipientAddress}`);

      // Save failed reward log
      await RewardLog.create({
        answerId,
        recipient: recipientAddress.toLowerCase(),
        rewardType: 'accepted_answer',
        amount: '0', // Unknown amount on failure
        txHash: 'failed',
        status: 'failed',
        error: error.message,
      });

      // Also update answer to mark that reward was attempted but failed
      // This helps admin panel identify failed rewards
      await Answer.findByIdAndUpdate(answerId, {
        $push: { txHashes: 'failed' },
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
   * Reward answer that reached upvote threshold
   */
  async rewardUpvoteThreshold(answerId: string): Promise<{
    txHash: string;
    amount: string;
  }> {
    const answer = await Answer.findById(answerId).populate('questionId');
    if (!answer) {
      throw new NotFoundError('Answer');
    }

    // Check if already rewarded for upvote threshold
    const existingReward = await RewardLog.findOne({
      answerId,
      rewardType: 'upvote_threshold',
      status: 'confirmed',
    });

    if (existingReward) {
      throw new Error('Answer already rewarded for upvote threshold');
    }

    const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;
    if (!REWARD_MANAGER_ADDRESS) {
      throw new Error('REWARD_MANAGER_ADDRESS not configured');
    }

    try {
      const wallet = getAdminWallet();
      const rewardManagerContract = new ethers.Contract(
        REWARD_MANAGER_ADDRESS,
        REWARD_MANAGER_ABI,
        wallet
      );

      const answerIdBytes = await rewardManagerContract.generateAnswerIdFromString(answerId);

      const questionIdObj = answer.questionId as any;
      const questionIdHex = (questionIdObj._id || questionIdObj).toString();
      const questionIdNum = BigInt('0x' + questionIdHex.slice(-16) || '0');

      // Check if already rewarded on-chain (for upvote threshold)
      // Note: We use a different check - the contract tracks by answerId, so we check if this specific reward type was given
      const isRewarded = await rewardManagerContract.isAnswerRewarded(answerIdBytes);
      if (isRewarded) {
        // Check if this is specifically for upvote threshold
        const existingAcceptedReward = await RewardLog.findOne({
          answerId,
          rewardType: 'accepted_answer',
          status: 'confirmed',
        });
        // If there's an accepted_answer reward but not upvote_threshold, we can still reward
        if (!existingAcceptedReward) {
          throw new Error('Answer already rewarded on-chain');
        }
      }

      // const rewardAmount = await rewardManagerContract.upvoteReward();

      logger.info(`📤 Calling RewardManager.rewardUpvoteThreshold()`);
      logger.info(`   Recipient: ${answer.author}`);
      logger.info(`   Answer ID: ${answerId}`);
      logger.info(`   Question ID: ${questionIdNum.toString()}`);

      const tx = await rewardManagerContract.rewardUpvoteThreshold(
        answer.author,
        answerIdBytes,
        questionIdNum
      );

      logger.info(`✅ Upvote threshold reward transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();
      const txHash = receipt.hash;
      const actualAmount = await rewardManagerContract.upvoteReward();

      await RewardLog.create({
        answerId,
        recipient: answer.author,
        rewardType: 'upvote_threshold',
        amount: actualAmount.toString(),
        txHash,
        status: 'confirmed',
      });

      // Update answer with tx hash and reward amount
      const rewardAmountInVibe = Number(ethers.formatEther(actualAmount));
      await Answer.findByIdAndUpdate(answerId, {
        $push: { txHashes: txHash },
        $inc: { vibeReward: rewardAmountInVibe },
      });

      await User.findOneAndUpdate(
        { walletAddress: answer.author },
        { $inc: { reputation: 25 } }
      );

      return {
        txHash,
        amount: actualAmount.toString(),
      };
    } catch (error: any) {
      logger.error(`❌ Upvote threshold reward failed: ${error.message}`);
      await RewardLog.create({
        answerId,
        recipient: answer.author,
        rewardType: 'upvote_threshold',
        amount: '0',
        txHash: 'failed',
        status: 'failed',
        error: error.message,
      });
      throw new Error(`Upvote threshold reward failed: ${error.message}`);
    }
  }

  /**
   * Reward questioner when their answer is accepted
   */
  async rewardQuestioner(questionId: string): Promise<{
    txHash: string;
    amount: string;
  }> {
    const question = await (await import('../models/Question')).Question.findById(questionId);
    if (!question) {
      throw new NotFoundError('Question');
    }

    // Check if questioner already rewarded
    const existingReward = await RewardLog.findOne({
      questionId,
      rewardType: 'questioner_bonus',
      status: 'confirmed',
    });

    if (existingReward) {
      throw new Error('Questioner already rewarded');
    }

    const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;
    if (!REWARD_MANAGER_ADDRESS) {
      throw new Error('REWARD_MANAGER_ADDRESS not configured');
    }

    try {
      const wallet = getAdminWallet();
      const rewardManagerContract = new ethers.Contract(
        REWARD_MANAGER_ADDRESS,
        REWARD_MANAGER_ABI,
        wallet
      );

      const questionIdHex = question._id.toString();
      const questionIdNum = BigInt('0x' + questionIdHex.slice(-16) || '0');

      // const rewardAmount = await rewardManagerContract.questionerBonus();

      logger.info(`📤 Calling RewardManager.rewardQuestioner()`);
      logger.info(`   Recipient: ${question.author}`);
      logger.info(`   Question ID: ${questionIdNum.toString()}`);

      const tx = await rewardManagerContract.rewardQuestioner(
        question.author,
        questionIdNum
      );

      logger.info(`✅ Questioner bonus transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();
      const txHash = receipt.hash;
      const actualAmount = await rewardManagerContract.questionerBonus();

      await RewardLog.create({
        questionId,
        recipient: question.author,
        rewardType: 'questioner_bonus',
        amount: actualAmount.toString(),
        txHash,
        status: 'confirmed',
      });

      await User.findOneAndUpdate(
        { walletAddress: question.author },
        { $inc: { reputation: 10 } }
      );

      return {
        txHash,
        amount: actualAmount.toString(),
      };
    } catch (error: any) {
      logger.error(`❌ Questioner bonus failed: ${error.message}`);
      await RewardLog.create({
        questionId,
        recipient: question.author,
        rewardType: 'questioner_bonus',
        amount: '0',
        txHash: 'failed',
        status: 'failed',
        error: error.message,
      });
      throw new Error(`Questioner bonus failed: ${error.message}`);
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

