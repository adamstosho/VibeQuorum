import OpenAI from 'openai';
import { logger } from '../utils/logger';

let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI-compatible client for Hugging Face router
 */
export const getOpenAIClient = (): OpenAI => {
  if (openaiClient) {
    return openaiClient;
  }

  const API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!API_KEY) {
    logger.warn('⚠️  Hugging Face API key not provided, AI features disabled');
    throw new Error('HUGGINGFACE_API_KEY is required for AI features');
  }

  // Initialize OpenAI client with Hugging Face router endpoint
  openaiClient = new OpenAI({
    baseURL: 'https://router.huggingface.co/v1',
    apiKey: API_KEY,
  });
  
  logger.info('✅ OpenAI-compatible client initialized (Hugging Face router)');
  return openaiClient;
};

/**
 * AI Configuration
 */
export const AI_CONFIG = {
  model: process.env.HUGGINGFACE_MODEL || 'deepseek-ai/DeepSeek-V3.2:novita',
  maxTokens: 3000, // Increased for comprehensive answers
  temperature: 0.7,
  topP: 0.9,
};

/**
 * System prompt for AI
 */
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

/**
 * Build user prompt from question
 */
export const buildUserPrompt = (question: {
  title: string;
  description: string;
  tags: string[];
}): string => {
  return `## Question
**Title:** ${question.title}

**Description:**
${question.description}

**Tags:** ${question.tags.join(', ')}

---

Please provide a helpful, technically accurate answer to this Web3 development question. Include code examples if relevant.`;
};

