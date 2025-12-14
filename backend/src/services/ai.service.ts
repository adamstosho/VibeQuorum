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

    // Check if we're in a serverless environment
    const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      // In serverless, use /tmp directory (only writable location)
      this.promptLogPath = path.join('/tmp', 'vibequorum-ai-prompts.md');
    } else {
      // In regular environment, use project directory
      this.promptLogPath = path.join(
        __dirname,
        '../../ai_logs/prompts.md'
      );
    }

    // Ensure directory exists (only if not serverless)
    if (!isServerless) {
      this.ensureLogDirectory();
    }
  }

  private ensureLogDirectory(): void {
    try {
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
    } catch (error: any) {
      // If file system operations fail, log warning but don't throw
      // This allows the service to continue functioning without file logging
      logger.warn(`⚠️  Could not initialize AI log directory: ${error.message}`);
      logger.warn('   AI logging to file will be disabled, but AI features will still work');
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
      // Add timeout wrapper for long-running requests
      const completionPromise = this.openaiClient.chat.completions.create({
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

      // Add timeout (90 seconds for AI generation)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI generation timeout - request took too long')), 90000);
      });

      const completion = await Promise.race([completionPromise, timeoutPromise]) as any;

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

      // Handle timeout errors
      if (error.message?.includes('timeout') || error.message?.includes('took too long')) {
        throw new AIError(
          'AI generation timed out. The request took too long. Please try again with a shorter question or reduce max tokens.',
          'AI_TIMEOUT',
          504,
          true
        );
      }

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
   * In serverless environments, this writes to /tmp (only writable location)
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
      // Check if file exists, create header if it doesn't
      if (!fs.existsSync(this.promptLogPath)) {
        const header = `# VibeQuorum AI Prompt Logs

This file documents all AI prompts and responses used in the VibeQuorum platform.

**Format:** Each entry includes timestamp, model, question ID, prompt, and response.

---

`;
        fs.writeFileSync(this.promptLogPath, header);
      }
      
      fs.appendFileSync(this.promptLogPath, logEntry);
    } catch (error: any) {
      // Log error but don't throw - file logging is optional
      // In serverless, this might fail if /tmp is full or permissions issue
      logger.warn(`⚠️  Failed to append to prompts log: ${error.message}`);
      logger.warn('   AI request succeeded, but file logging failed (non-critical)');
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

    // Ensure code blocks are properly closed
    const codeBlockCount = (cleaned.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      // Unclosed code block - try to close it
      cleaned = cleaned.trimEnd();
      if (!cleaned.endsWith('```')) {
        // Check if we're in the middle of a code block
        const lastCodeBlockIndex = cleaned.lastIndexOf('```');
        const afterLastCodeBlock = cleaned.substring(lastCodeBlockIndex + 3);
        // If there's content after the last ```, we need to close it
        if (afterLastCodeBlock.trim().length > 0) {
          cleaned += '\n```';
        }
      }
    }

    // Don't remove incomplete content - keep it as-is
    // The AI might have been cut off, but we should preserve what we got
    // Users can see the full response and decide if they need to regenerate

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

