# VibeQuorum AI Implementation Guide

## Overview

This document details the AI integration for VibeQuorum, including the OpenAI API setup, prompt engineering, logging requirements, and hackathon compliance.

---

## Table of Contents

1. [Hackathon Requirements](#1-hackathon-requirements)
2. [AI Architecture](#2-ai-architecture)
3. [OpenAI Setup](#3-openai-setup)
4. [Prompt Engineering](#4-prompt-engineering)
5. [AI Service Implementation](#5-ai-service-implementation)
6. [Prompt Logging](#6-prompt-logging)
7. [Rate Limiting](#7-rate-limiting)
8. [Error Handling](#8-error-handling)
9. [Testing](#9-testing)
10. [Cost Management](#10-cost-management)

---

## 1. Hackathon Requirements

### ⚠️ MANDATORY Requirements

| Requirement | Description | Location |
|-------------|-------------|----------|
| **ai_logs/prompts.md** | Log ALL AI prompts and responses | `backend/ai_logs/prompts.md` |
| **Commit Messages** | Tag commits with AI usage | e.g., "AI-assisted: generated component" |
| **Prompt Documentation** | Document prompt templates used | This file + prompts.md |
| **Model Attribution** | Log which model was used | In prompts.md entries |

### Example Commit Messages

```bash
# Good examples
git commit -m "AI-assisted: generated initial AnswerEditor component"
git commit -m "AI-assisted: created test cases for reward flow"
git commit -m "GPT-4 crafted: initial API route structure"

# Bad examples
git commit -m "Added component"  # No AI attribution
git commit -m "Fixed bug"        # Missing AI mention if AI was used
```

---

## 2. AI Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │    Backend      │     │    OpenAI       │
│   (Next.js)     │────►│    (Node.js)    │────►│    API          │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
             ┌───────────┐ ┌───────────┐ ┌───────────┐
             │  MongoDB  │ │  prompts  │ │   Redis   │
             │  AI Logs  │ │    .md    │ │Rate Limit │
             └───────────┘ └───────────┘ └───────────┘
```

### Data Flow

1. **User Request**: User clicks "AI Draft" on question page
2. **Frontend**: Sends POST to `/api/questions/:id/ai-draft`
3. **Backend**: 
   - Validates request & rate limits
   - Builds prompt from question data
   - Calls OpenAI API
   - Logs prompt and response to DB
   - Appends to `ai_logs/prompts.md`
4. **Response**: Returns draft answer to frontend

---

## 3. OpenAI Setup

### 3.1 Installation

```bash
npm install openai
```

### 3.2 Configuration

```typescript
// src/config/openai.ts
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Optional: Set organization
  // organization: process.env.OPENAI_ORG_ID,
});

// Model configuration
export const AI_CONFIG = {
  model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for lower cost
  maxTokens: 1000,
  temperature: 0.7,
  // Cost per 1K tokens (approximate)
  costPer1kInput: 0.01,   // GPT-4 Turbo
  costPer1kOutput: 0.03,  // GPT-4 Turbo
};
```

### 3.3 Environment Variables

```env
# .env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
OPENAI_ORG_ID=org-xxxxxxxxxxxx
AI_MODEL=gpt-4-turbo-preview
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7
```

---

## 4. Prompt Engineering

### 4.1 System Prompt

```typescript
export const SYSTEM_PROMPT = `You are an expert Web3 and blockchain developer assistant for VibeQuorum, a Q&A platform for Web3 developers.

Your role is to provide:
- Clear, technically accurate answers
- Practical code examples when relevant
- Security considerations for smart contracts
- Best practices for blockchain development

Guidelines:
1. Be concise but thorough
2. Include code examples in Solidity, JavaScript, or TypeScript as appropriate
3. Highlight security concerns or potential pitfalls
4. Reference official documentation when applicable
5. Acknowledge limitations or areas of uncertainty

Do NOT:
- Provide financial advice
- Generate malicious code
- Make claims about specific token prices or investment returns`;
```

### 4.2 User Prompt Template

```typescript
export const buildUserPrompt = (question: {
  title: string;
  description: string;
  tags: string[];
}) => {
  return `## Question
**Title:** ${question.title}

**Description:**
${question.description}

**Tags:** ${question.tags.join(', ')}

---

Please provide a helpful, technically accurate answer to this Web3 development question. Include code examples if relevant.`;
};
```

### 4.3 Context Enhancement (Optional)

```typescript
export const buildContextPrompt = (
  question: Question,
  existingAnswers?: Answer[]
) => {
  let context = buildUserPrompt(question);

  // Add existing answers for context (if any)
  if (existingAnswers && existingAnswers.length > 0) {
    context += `\n\n## Existing Community Answers\n`;
    existingAnswers.slice(0, 3).forEach((answer, i) => {
      context += `\n### Answer ${i + 1} (${answer.upvotes} upvotes)\n`;
      context += answer.content.slice(0, 500);
      if (answer.content.length > 500) context += '...';
    });
    context += `\n\n---\n\nPlease provide an answer that adds value beyond the existing responses.`;
  }

  return context;
};
```

---

## 5. AI Service Implementation

### 5.1 Complete AI Service

```typescript
// src/services/ai.service.ts
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { AIPromptLog } from '../models/AIPromptLog';
import { Question } from '../models/Question';
import { AI_CONFIG, SYSTEM_PROMPT, buildUserPrompt } from '../config/openai';

interface AIGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  includeExistingAnswers?: boolean;
}

interface AIGenerateResult {
  draft: string;
  logId: string;
  tokensUsed: number;
  model: string;
  cost: number;
}

export class AIService {
  private openai: OpenAI;
  private promptLogPath: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Path to ai_logs/prompts.md
    this.promptLogPath = path.join(
      __dirname, 
      '../../ai_logs/prompts.md'
    );
    
    // Ensure directory exists
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
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
   * Generate an AI draft answer for a question
   */
  async generateDraft(
    questionId: string,
    requestedBy: string,
    options: AIGenerateOptions = {}
  ): Promise<AIGenerateResult> {
    // Fetch question
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Build prompts
    const systemPrompt = SYSTEM_PROMPT;
    const userPrompt = buildUserPrompt({
      title: question.title,
      description: question.description,
      tags: question.tags,
    });

    // Call OpenAI
    const startTime = Date.now();
    
    const completion = await this.openai.chat.completions.create({
      model: options.maxTokens ? AI_CONFIG.model : AI_CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: options.maxTokens || AI_CONFIG.maxTokens,
      temperature: options.temperature || AI_CONFIG.temperature,
    });

    const responseTime = Date.now() - startTime;
    const responseText = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    // Calculate cost
    const cost = this.calculateCost(inputTokens, outputTokens);

    // Save to database
    const log = await AIPromptLog.create({
      questionId,
      requestedBy,
      promptText: userPrompt,
      systemPrompt,
      model: AI_CONFIG.model,
      responseText,
      tokensUsed,
      inputTokens,
      outputTokens,
      responseTimeMs: responseTime,
      costEstimate: cost,
    });

    // Append to prompts.md (hackathon requirement)
    this.appendToPromptsLog({
      questionId,
      model: AI_CONFIG.model,
      prompt: userPrompt,
      response: responseText,
      tokensUsed,
      cost,
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
      cost,
    };
  }

  /**
   * Calculate estimated cost
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * AI_CONFIG.costPer1kInput;
    const outputCost = (outputTokens / 1000) * AI_CONFIG.costPer1kOutput;
    return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimals
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
    cost: number;
  }) {
    const timestamp = new Date().toISOString();
    
    const logEntry = `
## Entry: ${timestamp}

**Question ID:** \`${entry.questionId}\`
**Model:** ${entry.model}
**Tokens Used:** ${entry.tokensUsed}
**Estimated Cost:** $${entry.cost.toFixed(4)}

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
    } catch (error) {
      console.error('Failed to append to prompts.md:', error);
      // Don't throw - logging failure shouldn't break the request
    }
  }

  /**
   * Get AI usage statistics
   */
  async getUsageStats(walletAddress?: string): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    requestsByModel: Record<string, number>;
  }> {
    const match = walletAddress 
      ? { requestedBy: walletAddress.toLowerCase() }
      : {};

    const stats = await AIPromptLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$model',
          count: { $sum: 1 },
          tokens: { $sum: '$tokensUsed' },
          cost: { $sum: '$costEstimate' },
        },
      },
    ]);

    const result = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      requestsByModel: {} as Record<string, number>,
    };

    stats.forEach((s) => {
      result.totalRequests += s.count;
      result.totalTokens += s.tokens;
      result.totalCost += s.cost;
      result.requestsByModel[s._id] = s.count;
    });

    return result;
  }
}

export const aiService = new AIService();
```

---

## 6. Prompt Logging

### 6.1 Database Model (Enhanced)

```typescript
// src/models/AIPromptLog.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAIPromptLog extends Document {
  questionId: Types.ObjectId;
  requestedBy: string;
  systemPrompt: string;
  promptText: string;
  model: string;
  responseText: string;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  responseTimeMs: number;
  costEstimate: number;
  createdAt: Date;
}

const AIPromptLogSchema = new Schema<IAIPromptLog>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    systemPrompt: {
      type: String,
      required: true,
    },
    promptText: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    responseText: {
      type: String,
      required: true,
    },
    tokensUsed: {
      type: Number,
      required: true,
    },
    inputTokens: {
      type: Number,
      default: 0,
    },
    outputTokens: {
      type: Number,
      default: 0,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    costEstimate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for analytics queries
AIPromptLogSchema.index({ createdAt: -1 });
AIPromptLogSchema.index({ model: 1, createdAt: -1 });

export const AIPromptLog = mongoose.model<IAIPromptLog>(
  'AIPromptLog',
  AIPromptLogSchema
);
```

### 6.2 prompts.md File Format

```markdown
# VibeQuorum AI Prompt Logs

This file documents all AI prompts and responses used in the VibeQuorum platform.

**Format:** Each entry includes timestamp, model, question ID, prompt, and response.

---

## Entry: 2025-12-05T12:00:00.000Z

**Question ID:** `507f1f77bcf86cd799439011`
**Model:** gpt-4-turbo-preview
**Tokens Used:** 856
**Estimated Cost:** $0.0142

### Prompt

```
## Question
**Title:** How to implement ERC721 with custom royalties?

**Description:**
I want to create an NFT contract that includes royalty payments...

**Tags:** solidity, nft, erc721, royalties
```

### AI Response

To implement ERC721 with custom royalties, you'll want to use the EIP-2981 standard...

[Full AI response here]

---

## Entry: 2025-12-05T12:30:00.000Z

...
```

---

## 7. Rate Limiting

### 7.1 AI-Specific Rate Limits

```typescript
// src/middleware/aiRateLimit.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Per-user AI rate limit
export const aiUserLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI requests per hour per user
  keyGenerator: (req) => `ai:${req.walletAddress || req.ip}`,
  message: {
    error: 'AI quota exceeded',
    message: 'You can make 10 AI draft requests per hour. Please try again later.',
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global AI rate limit (all users combined)
export const aiGlobalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 total AI requests per hour
  keyGenerator: () => 'ai:global',
  message: {
    error: 'Service temporarily unavailable',
    message: 'AI service is currently at capacity. Please try again later.',
  },
});

// Daily AI limit per user
export const aiDailyLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30, // 30 AI requests per day per user
  keyGenerator: (req) => `ai:daily:${req.walletAddress || req.ip}`,
  message: {
    error: 'Daily AI quota exceeded',
    message: 'You have reached your daily AI quota. Resets at midnight UTC.',
  },
});
```

### 7.2 Apply Rate Limits

```typescript
// src/routes/ai.routes.ts
import { Router } from 'express';
import { aiUserLimiter, aiGlobalLimiter, aiDailyLimiter } from '../middleware/aiRateLimit.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiController } from '../controllers/ai.controller';

const router = Router();

// AI Draft endpoint with rate limiting
router.post(
  '/questions/:id/ai-draft',
  authMiddleware,           // Must be authenticated
  aiGlobalLimiter,          // Check global limit first
  aiDailyLimiter,           // Check daily limit
  aiUserLimiter,            // Check hourly limit
  aiController.generateDraft
);

export default router;
```

---

## 8. Error Handling

### 8.1 AI-Specific Errors

```typescript
// src/utils/aiErrors.ts
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export const AI_ERRORS = {
  RATE_LIMIT: new AIError(
    'AI rate limit exceeded',
    'AI_RATE_LIMIT',
    429,
    true
  ),
  API_ERROR: new AIError(
    'AI service temporarily unavailable',
    'AI_API_ERROR',
    503,
    true
  ),
  INVALID_RESPONSE: new AIError(
    'AI returned invalid response',
    'AI_INVALID_RESPONSE',
    500,
    true
  ),
  CONTENT_FILTER: new AIError(
    'Content was filtered by AI safety systems',
    'AI_CONTENT_FILTER',
    400,
    false
  ),
  QUOTA_EXCEEDED: new AIError(
    'OpenAI API quota exceeded',
    'AI_QUOTA_EXCEEDED',
    503,
    false
  ),
};
```

### 8.2 Error Handling in Service

```typescript
async generateDraft(questionId: string, requestedBy: string) {
  try {
    // ... existing code ...
    
    const completion = await this.openai.chat.completions.create({
      // ... config ...
    });

    // Check for empty response
    if (!completion.choices[0]?.message?.content) {
      throw AI_ERRORS.INVALID_RESPONSE;
    }

    // Check for content filter
    if (completion.choices[0].finish_reason === 'content_filter') {
      throw AI_ERRORS.CONTENT_FILTER;
    }

    // ... rest of code ...
    
  } catch (error) {
    // Handle OpenAI-specific errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw AI_ERRORS.RATE_LIMIT;
      }
      if (error.status === 503) {
        throw AI_ERRORS.API_ERROR;
      }
      if (error.code === 'insufficient_quota') {
        throw AI_ERRORS.QUOTA_EXCEEDED;
      }
    }
    
    // Re-throw if it's already our error type
    if (error instanceof AIError) {
      throw error;
    }
    
    // Generic error
    throw new AIError(
      'Failed to generate AI draft',
      'AI_UNKNOWN_ERROR',
      500,
      true
    );
  }
}
```

---

## 9. Testing

### 9.1 Mock OpenAI for Tests

```typescript
// tests/mocks/openai.mock.ts
export const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: 'This is a mock AI response for testing purposes.',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      }),
    },
  },
};

// Mock the module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => mockOpenAI);
});
```

### 9.2 AI Service Tests

```typescript
// tests/unit/ai.service.test.ts
import { AIService } from '../../src/services/ai.service';
import { mockOpenAI } from '../mocks/openai.mock';
import { Question } from '../../src/models/Question';

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
    jest.clearAllMocks();
  });

  describe('generateDraft', () => {
    it('should generate draft for valid question', async () => {
      // Mock question
      jest.spyOn(Question, 'findById').mockResolvedValue({
        _id: 'test-id',
        title: 'Test Question',
        description: 'Test description',
        tags: ['solidity'],
      } as any);

      const result = await aiService.generateDraft(
        'test-id',
        '0x1234567890123456789012345678901234567890'
      );

      expect(result.draft).toBeDefined();
      expect(result.tokensUsed).toBe(150);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
    });

    it('should throw error for non-existent question', async () => {
      jest.spyOn(Question, 'findById').mockResolvedValue(null);

      await expect(
        aiService.generateDraft('invalid-id', '0x...')
      ).rejects.toThrow('Question not found');
    });
  });
});
```

---

## 10. Cost Management

### 10.1 Cost Tracking Dashboard Data

```typescript
// src/services/ai.service.ts - Add to AIService class

/**
 * Get cost report for admin dashboard
 */
async getCostReport(startDate: Date, endDate: Date) {
  const logs = await AIPromptLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          model: '$model',
        },
        requests: { $sum: 1 },
        tokens: { $sum: '$tokensUsed' },
        cost: { $sum: '$costEstimate' },
      },
    },
    { $sort: { '_id.date': -1 } },
  ]);

  return logs;
}

/**
 * Check if user is within budget
 */
async checkUserBudget(walletAddress: string): Promise<{
  allowed: boolean;
  spent: number;
  limit: number;
}> {
  const dailyLimit = 1.00; // $1 per user per day
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await AIPromptLog.aggregate([
    {
      $match: {
        requestedBy: walletAddress.toLowerCase(),
        createdAt: { $gte: today },
      },
    },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$costEstimate' },
      },
    },
  ]);

  const spent = result[0]?.totalCost || 0;

  return {
    allowed: spent < dailyLimit,
    spent,
    limit: dailyLimit,
  };
}
```

### 10.2 Model Selection by Cost

```typescript
// Cost-aware model selection
export const selectModel = (priority: 'quality' | 'speed' | 'cost') => {
  const models = {
    quality: {
      model: 'gpt-4-turbo-preview',
      maxTokens: 1500,
      costPer1k: 0.01,
    },
    speed: {
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      costPer1k: 0.0005,
    },
    cost: {
      model: 'gpt-3.5-turbo',
      maxTokens: 500,
      costPer1k: 0.0005,
    },
  };

  return models[priority];
};
```

---

## Checklist

### Implementation
- [ ] OpenAI client configured
- [ ] System prompt defined
- [ ] User prompt template created
- [ ] AIPromptLog model created
- [ ] AIService implemented
- [ ] prompts.md auto-logging
- [ ] Rate limiting configured
- [ ] Error handling complete
- [ ] Cost tracking implemented

### Hackathon Compliance
- [ ] `ai_logs/prompts.md` file exists
- [ ] All prompts logged to prompts.md
- [ ] Model name included in logs
- [ ] Timestamps included in logs
- [ ] Commit messages show AI usage

### Testing
- [ ] OpenAI mock created
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Rate limiting tested

---

## Quick Reference

### API Endpoint
```
POST /api/questions/:id/ai-draft
Headers: x-wallet-address, x-signature, x-timestamp
Body: { "options": { "maxTokens": 1000, "temperature": 0.7 } }
Response: { "draft": "...", "logId": "...", "tokensUsed": 150 }
```

### Environment Variables
```env
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4-turbo-preview
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7
```

### Rate Limits
- 10 requests/hour/user
- 30 requests/day/user
- 100 requests/hour global

