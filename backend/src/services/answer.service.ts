import { Answer } from '../models/Answer';
import { Question } from '../models/Question';
import { NotFoundError } from '../utils/errors';

export class AnswerService {
  /**
   * Get answers for a question
   */
  async getAnswersByQuestion(questionId: string) {
    const answers = await Answer.find({ questionId })
      .sort({ upvotes: -1, createdAt: -1 })
      .lean();

    return answers;
  }

  /**
   * Get answer by ID
   */
  async getAnswerById(id: string) {
    const answer = await Answer.findById(id).lean();
    if (!answer) {
      throw new NotFoundError('Answer');
    }
    return answer;
  }

  /**
   * Create answer
   */
  async createAnswer(
    questionId: string,
    author: string,
    data: {
      content: string;
      aiGenerated?: boolean;
    }
  ) {
    // Verify question exists
    const question = await Question.findById(questionId);
    if (!question) {
      throw new NotFoundError('Question');
    }

    // Create answer
    const answer = await Answer.create({
      questionId,
      author,
      content: data.content,
      aiGenerated: data.aiGenerated || false,
    });

    // Update question answer count
    await Question.findByIdAndUpdate(questionId, {
      $inc: { answersCount: 1 },
    });

    return answer;
  }

  /**
   * Update answer
   */
  async updateAnswer(
    id: string,
    author: string,
    updates: {
      content?: string;
    }
  ) {
    const answer = await Answer.findOne({ _id: id, author });
    if (!answer) {
      throw new NotFoundError('Answer');
    }

    // Don't allow editing accepted answers
    if (answer.isAccepted) {
      throw new Error('Cannot edit accepted answer');
    }

    Object.assign(answer, updates);
    await answer.save();

    return answer;
  }

  /**
   * Delete answer
   */
  async deleteAnswer(id: string, author: string) {
    const answer = await Answer.findOne({ _id: id, author });
    if (!answer) {
      throw new NotFoundError('Answer');
    }

    // Update question answer count
    await Question.findByIdAndUpdate(answer.questionId, {
      $inc: { answersCount: -1 },
    });

    await Answer.findByIdAndDelete(id);

    return { success: true };
  }
}

export const answerService = new AnswerService();



