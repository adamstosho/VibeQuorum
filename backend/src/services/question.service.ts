import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { calculatePagination } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import { PaginationQuery } from '../types';
import { rewardService } from './reward.service';
import { logger } from '../utils/logger';

export class QuestionService {
  /**
   * Get questions with pagination and filters
   */
  async getQuestions(query: PaginationQuery) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (query.tag) {
      filter.tags = query.tag;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Build sort
    let sort: any = { createdAt: -1 };
    switch (query.sort) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'votes':
        sort = { votesCount: -1 };
        break;
      case 'answers':
        sort = { answersCount: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter),
    ]);

    return {
      questions,
      pagination: calculatePagination(page, limit, total),
    };
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: string) {
    const question = await Question.findById(id).lean();
    if (!question) {
      throw new NotFoundError('Question');
    }

    // Increment views
    await Question.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });

    return question;
  }

  /**
   * Create question
   */
  async createQuestion(
    author: string,
    data: {
      title: string;
      description: string;
      tags: string[];
    }
  ) {
    const question = await Question.create({
      author,
      ...data,
      status: 'open',
    });

    return question;
  }

  /**
   * Update question
   */
  async updateQuestion(
    id: string,
    author: string,
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
    }
  ) {
    const question = await Question.findOne({ _id: id, author });
    if (!question) {
      throw new NotFoundError('Question');
    }

    Object.assign(question, updates);
    await question.save();

    return question;
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string, author: string) {
    const question = await Question.findOne({ _id: id, author });
    if (!question) {
      throw new NotFoundError('Question');
    }

    // Delete associated answers
    await Answer.deleteMany({ questionId: id });

    await Question.findByIdAndDelete(id);

    return { success: true };
  }

  /**
   * Accept answer and automatically trigger reward
   */
  async acceptAnswer(questionId: string, answerId: string, author: string) {
    const question = await Question.findOne({ _id: questionId, author });
    if (!question) {
      throw new NotFoundError('Question');
    }

    const answer = await Answer.findById(answerId);
    if (!answer || answer.questionId.toString() !== questionId) {
      throw new NotFoundError('Answer');
    }

    // Check if already accepted
    if (answer.isAccepted) {
      return { success: true, question, answer, alreadyAccepted: true };
    }

    // Update question
    question.acceptedAnswerId = answer._id;
    question.status = 'answered';
    await question.save();

    // Update answer
    answer.isAccepted = true;
    await answer.save();

    // Automatically trigger on-chain reward for answer author (using admin wallet)
    let rewardResult = null;
    let rewardError = null;
    
    try {
      logger.info(`🎁 Auto-triggering reward for accepted answer: ${answerId}`);
      rewardResult = await rewardService.rewardAcceptedAnswer(answerId);
      logger.info(`✅ Reward triggered successfully: ${rewardResult.txHash}`);
    } catch (error: any) {
      // Log error but don't fail the accept operation
      // Reward can be triggered manually later via admin panel
      rewardError = error.message;
      logger.error(`⚠️ Failed to auto-trigger reward: ${error.message}`);
      logger.error(`   Answer ${answerId} accepted but reward not triggered. Admin can trigger manually.`);
    }

    // Automatically trigger questioner bonus reward
    let questionerRewardResult = null;
    let questionerRewardError = null;
    
    try {
      logger.info(`🎁 Auto-triggering questioner bonus for question: ${questionId}`);
      questionerRewardResult = await rewardService.rewardQuestioner(questionId);
      logger.info(`✅ Questioner bonus triggered successfully: ${questionerRewardResult.txHash}`);
    } catch (error: any) {
      // Log error but don't fail the accept operation
      questionerRewardError = error.message;
      logger.error(`⚠️ Failed to auto-trigger questioner bonus: ${error.message}`);
      logger.error(`   Question ${questionId} answered but questioner bonus not triggered. Admin can trigger manually.`);
    }

    return {
      success: true,
      question,
      answer,
      reward: rewardResult,
      rewardError: rewardError || undefined,
      questionerReward: questionerRewardResult,
      questionerRewardError: questionerRewardError || undefined,
    };
  }
}

export const questionService = new QuestionService();



