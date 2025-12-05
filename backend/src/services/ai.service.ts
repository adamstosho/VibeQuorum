import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { AIPromptLog } from '../models/AIPromptLog';
import { Question } from '../models/Question';
import { getOpenAIClient, AI_CONFIG, SYSTEM_PROMPT, buildUserPrompt } from '../config/ai';
import { AIGenerateOptions, AIGenerateResult } from '../types';
import { NotFoundError, AIError, AI_ERRORS } from '../utils/errors';
import { logger } from '../utils/logger';

export class AIService {
  private openaiClient: OpenAI | null = null;
  private promptLogPath: string;

  constructor() {
    try {
      this.openaiClient = getOpenAIClient();
    } catch (error) {
      logger.warn('⚠️  OpenAI client not available, AI features disabled');
      this.openaiClient = null;
    }

    // Path to ai_logs/prompts.md
    this.promptLogPath = path.join(
      __dirname,
      '../../ai_logs/prompts.md'
    );

    // Ensure directory exists
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const dir = path.dirname(this.promptLogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create prompts.md if it doesn't exist
    if (!fs.existsSync(this.promptLogPath)) {
      const header = `# VibeQuorum AI Prompt Logs

This file documents all AI prompts and responses used in the VibeQuorum platform.

**Format:** Each entry includes timestamp, model, question ID, prompt, and response.

---

`;
      fs.writeFileSync(this.promptLogPath, header);
    }
  }

  /**
   * Generate an AI draft answer for a question using Hugging Face
   */
  async generateDraft(
    questionId: string,
    requestedBy: string,
    options: AIGenerateOptions = {}
  ): Promise<AIGenerateResult> {
    if (!this.openaiClient) {
      throw new AIError(
        'AI service not available',
        'AI_SERVICE_UNAVAILABLE',
        503,
        false
      );
    }

    // Fetch question
    const question = await Question.findById(questionId);
    if (!question) {
      throw new NotFoundError('Question');
    }

    // Build prompts
    const systemPrompt = SYSTEM_PROMPT;
    const userPrompt = buildUserPrompt({
      title: question.title,
      description: question.description,
      tags: question.tags,
    });

    const startTime = Date.now();

    try {
      // Call OpenAI-compatible API (Hugging Face router)
      const completion = await this.openaiClient.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: options.maxTokens || AI_CONFIG.maxTokens,
        temperature: options.temperature || AI_CONFIG.temperature,
        top_p: AI_CONFIG.topP,
      });

      const responseTime = Date.now() - startTime;
      let responseText = completion.choices[0]?.message?.content || '';

      if (!responseText) {
        throw AI_ERRORS.INVALID_RESPONSE;
      }

      // Clean and format the response
      responseText = this.cleanResponse(responseText);

      // Get token usage from response
      const tokensUsed = completion.usage?.total_tokens || Math.ceil(
        (systemPrompt.length + userPrompt.length + responseText.length) / 4
      );

      // Save to database
      const inputTokens = completion.usage?.prompt_tokens || Math.ceil(
        (systemPrompt.length + userPrompt.length) / 4
      );
      const outputTokens = completion.usage?.completion_tokens || Math.ceil(
        responseText.length / 4
      );

      const log = await AIPromptLog.create({
        questionId,
        requestedBy,
        systemPrompt,
        promptText: userPrompt,
        aiModel: AI_CONFIG.model,
        responseText,
        tokensUsed,
        inputTokens,
        outputTokens,
        responseTimeMs: responseTime,
        costEstimate: 0, // Hugging Face free tier, set to 0
      });

      // Append to prompts.md (hackathon requirement)
      this.appendToPromptsLog({
        questionId,
        model: AI_CONFIG.model,
        prompt: userPrompt,
        response: responseText,
        tokensUsed,
      });

      // Update question with AI draft reference
      await Question.findByIdAndUpdate(questionId, {
        aiDraftId: log._id,
      });

      return {
        draft: responseText,
        logId: log._id.toString(),
        tokensUsed,
        model: AI_CONFIG.model,
      };
    } catch (error: any) {
      logger.error(`❌ Hugging Face API error: ${error.message}`);

      // Handle specific Hugging Face errors
      if (error.status === 429) {
        throw AI_ERRORS.RATE_LIMIT;
      }
      if (error.status === 503) {
        throw AI_ERRORS.API_ERROR;
      }
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw AI_ERRORS.QUOTA_EXCEEDED;
      }

      throw new AIError(
        'Failed to generate AI draft',
        'AI_UNKNOWN_ERROR',
        500,
        true
      );
    }
  }

  /**
   * Append entry to ai_logs/prompts.md (HACKATHON REQUIREMENT)
   */
  private appendToPromptsLog(entry: {
    questionId: string;
    model: string;
    prompt: string;
    response: string;
    tokensUsed: number;
  }): void {
    const timestamp = new Date().toISOString();

    const logEntry = `
## Entry: ${timestamp}

**Question ID:** \`${entry.questionId}\`
**Model:** ${entry.model}
**Tokens Used:** ${entry.tokensUsed}

### Prompt

\`\`\`
${entry.prompt}
\`\`\`

### AI Response

${entry.response}

---

`;

    try {
      fs.appendFileSync(this.promptLogPath, logEntry);
    } catch (error: any) {
      logger.error(`❌ Failed to append to prompts.md: ${error.message}`);
      // Don't throw - logging failure shouldn't break the request
    }
  }

  /**
   * Clean and format AI response
   */
  private cleanResponse(text: string): string {
    if (!text) return text;

    // Remove leading/trailing whitespace
    let cleaned = text.trim();

    // Normalize line endings (ensure consistent \n)
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove excessive blank lines (more than 2 consecutive)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Ensure code blocks are properly closed (basic check)
    const codeBlockCount = (cleaned.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      // Unclosed code block - try to close it
      cleaned = cleaned.trimEnd();
      if (!cleaned.endsWith('```')) {
        cleaned += '\n```';
      }
    }

    // Remove trailing incomplete sentences (if response was cut off)
    // This is a simple heuristic - if the last sentence doesn't end with punctuation
    const lastChar = cleaned.trim().slice(-1);
    if (!['.', '!', '?', '`', '}', ')', ']'].includes(lastChar)) {
      // Check if it looks like an incomplete sentence
      const lastLine = cleaned.trim().split('\n').pop() || '';
      if (lastLine.length > 20 && !lastLine.endsWith('```')) {
        // Likely incomplete - remove the last incomplete sentence
        const sentences = cleaned.split(/(?<=[.!?])\s+/);
        if (sentences.length > 1) {
          cleaned = sentences.slice(0, -1).join(' ').trim();
        }
      }
    }

    return cleaned.trim();
  }

  /**
   * Get AI usage statistics
   */
  async getUsageStats(walletAddress?: string): Promise<{
    totalRequests: number;
    totalTokens: number;
    requestsByModel: Record<string, number>;
  }> {
    const match = walletAddress
      ? { requestedBy: walletAddress.toLowerCase() }
      : {};

    const stats = await AIPromptLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$aiModel',
          count: { $sum: 1 },
          tokens: { $sum: '$tokensUsed' },
        },
      },
    ]);

    const result = {
      totalRequests: 0,
      totalTokens: 0,
      requestsByModel: {} as Record<string, number>,
    };

    stats.forEach((s: { _id: string; count: number; tokens: number }) => {
      result.totalRequests += s.count;
      result.totalTokens += s.tokens;
      result.requestsByModel[s._id] = s.count;
    });

    return result;
  }
}

export const aiService = new AIService();

