# VibeQuorum Backend Implementation Guide

## Overview

This document provides a comprehensive guide for implementing the VibeQuorum backend API. The backend is responsible for user management, Q&A operations, AI integration, and blockchain reward orchestration.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Models](#4-database-models)
5. [API Endpoints](#5-api-endpoints)
6. [Authentication](#6-authentication)
7. [AI Integration](#7-ai-integration)
8. [Blockchain Integration](#8-blockchain-integration)
9. [Rate Limiting & Security](#9-rate-limiting--security)
10. [Environment Variables](#10-environment-variables)
11. [Deployment](#11-deployment)
12. [Testing](#12-testing)

---

## 1. Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │◄───►│   Backend API   │◄───►│    MongoDB      │
│   (Next.js)     │     │   (Node.js)     │     │    Atlas        │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │  OpenAI   │ │   Redis   │ │  Smart    │
            │   API     │ │  Cache    │ │ Contracts │
            └───────────┘ └───────────┘ └───────────┘
```

### Data Flow

1. **User Authentication**: Frontend connects wallet → Backend verifies signature → Creates/fetches user profile
2. **Q&A Operations**: Frontend CRUD requests → Backend validates → MongoDB storage
3. **AI Draft**: Frontend requests draft → Backend calls OpenAI → Logs prompt → Returns draft
4. **Rewards**: Answer accepted/upvoted → Backend triggers smart contract → Records txHash

---

## 2. Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js v18+ | JavaScript runtime |
| Framework | Express.js / Fastify | HTTP server |
| Language | TypeScript | Type safety |
| Database | MongoDB Atlas | Document storage |
| Cache | Redis (Upstash) | Rate limiting, sessions |
| AI | OpenAI API | Answer drafts |
| Blockchain | ethers.js v6 | Smart contract interaction |
| Validation | Zod / Joi | Request validation |
| Auth | Wallet signature | SIWE (Sign-In with Ethereum) |

### Required Packages

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "ethers": "^6.9.0",
    "openai": "^4.20.0",
    "ioredis": "^5.3.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "siwe": "^2.1.4",
    "zod": "^3.22.4",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "typescript": "^5.3.2",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "supertest": "^6.3.3"
  }
}
```

---

## 3. Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # MongoDB connection
│   │   ├── redis.ts           # Redis connection
│   │   ├── blockchain.ts      # Ethers.js setup
│   │   └── openai.ts          # OpenAI client
│   │
│   ├── models/
│   │   ├── User.ts            # User schema
│   │   ├── Question.ts        # Question schema
│   │   ├── Answer.ts          # Answer schema
│   │   ├── Vote.ts            # Vote schema
│   │   └── AIPromptLog.ts     # AI log schema
│   │
│   ├── routes/
│   │   ├── auth.routes.ts     # Authentication routes
│   │   ├── questions.routes.ts # Question CRUD
│   │   ├── answers.routes.ts  # Answer CRUD
│   │   ├── votes.routes.ts    # Voting routes
│   │   ├── ai.routes.ts       # AI draft routes
│   │   └── rewards.routes.ts  # Reward trigger routes
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── questions.controller.ts
│   │   ├── answers.controller.ts
│   │   ├── votes.controller.ts
│   │   ├── ai.controller.ts
│   │   └── rewards.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts     # Auth logic
│   │   ├── question.service.ts # Question logic
│   │   ├── answer.service.ts   # Answer logic
│   │   ├── vote.service.ts     # Voting logic
│   │   ├── ai.service.ts       # OpenAI integration
│   │   └── reward.service.ts   # Blockchain rewards
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts  # Wallet verification
│   │   ├── rateLimit.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/
│   │   ├── logger.ts           # Winston logger
│   │   ├── errors.ts           # Custom errors
│   │   └── helpers.ts          # Utility functions
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   │
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
│
├── ai_logs/
│   └── prompts.md              # AI prompt logs (required for hackathon)
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. Database Models

### 4.1 User Model

```typescript
// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  displayName?: string;
  avatarUrl?: string;
  profileBio?: string;
  reputation: number;
  tokenBalanceCached: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    displayName: {
      type: String,
      maxlength: 50,
    },
    avatarUrl: String,
    profileBio: {
      type: String,
      maxlength: 500,
    },
    reputation: {
      type: Number,
      default: 0,
    },
    tokenBalanceCached: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
```

### 4.2 Question Model

```typescript
// src/models/Question.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  author: string; // wallet address
  title: string;
  description: string;
  tags: string[];
  status: 'open' | 'answered' | 'closed';
  acceptedAnswerId?: Types.ObjectId;
  aiDraftId?: Types.ObjectId;
  votesCount: number;
  answersCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    author: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= 5,
        message: 'Must have 1-5 tags',
      },
    },
    status: {
      type: String,
      enum: ['open', 'answered', 'closed'],
      default: 'open',
    },
    acceptedAnswerId: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
    },
    aiDraftId: {
      type: Schema.Types.ObjectId,
      ref: 'AIPromptLog',
    },
    votesCount: {
      type: Number,
      default: 0,
    },
    answersCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search
QuestionSchema.index({ title: 'text', description: 'text' });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ createdAt: -1 });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
```

### 4.3 Answer Model

```typescript
// src/models/Answer.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnswer extends Document {
  questionId: Types.ObjectId;
  author: string; // wallet address
  content: string;
  upvotes: number;
  downvotes: number;
  aiGenerated: boolean;
  isAccepted: boolean;
  txHashes: string[]; // reward transaction hashes
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 30000,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    txHashes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Answer = mongoose.model<IAnswer>('Answer', AnswerSchema);
```

### 4.4 Vote Model

```typescript
// src/models/Vote.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVote extends Document {
  voter: string; // wallet address
  targetType: 'question' | 'answer';
  targetId: Types.ObjectId;
  value: 1 | -1;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    voter: {
      type: String,
      required: true,
      lowercase: true,
    },
    targetType: {
      type: String,
      enum: ['question', 'answer'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    value: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one vote per user per target
VoteSchema.index({ voter: 1, targetType: 1, targetId: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);
```

### 4.5 AI Prompt Log Model

```typescript
// src/models/AIPromptLog.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAIPromptLog extends Document {
  questionId: Types.ObjectId;
  requestedBy: string; // wallet address
  promptText: string;
  model: string;
  responseText: string;
  tokensUsed?: number;
  costEstimate?: number;
  createdAt: Date;
}

const AIPromptLogSchema = new Schema<IAIPromptLog>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    requestedBy: {
      type: String,
      required: true,
      lowercase: true,
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
    tokensUsed: Number,
    costEstimate: Number,
  },
  {
    timestamps: true,
  }
);

export const AIPromptLog = mongoose.model<IAIPromptLog>('AIPromptLog', AIPromptLogSchema);
```

### 4.6 Reward Log Model

```typescript
// src/models/RewardLog.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRewardLog extends Document {
  answerId: Types.ObjectId;
  recipient: string;
  rewardType: 'accepted_answer' | 'upvote_threshold' | 'questioner_bonus' | 'special';
  amount: string; // in wei
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}

const RewardLogSchema = new Schema<IRewardLog>(
  {
    answerId: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      required: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
    },
    rewardType: {
      type: String,
      enum: ['accepted_answer', 'upvote_threshold', 'questioner_bonus', 'special'],
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const RewardLog = mongoose.model<IRewardLog>('RewardLog', RewardLogSchema);
```

---

## 5. API Endpoints

### 5.1 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/nonce` | Get nonce for signing | No |
| POST | `/api/auth/verify` | Verify signature & login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |

```typescript
// POST /api/auth/nonce
// Request
{ "walletAddress": "0x..." }
// Response
{ "nonce": "Sign this message to login: abc123..." }

// POST /api/auth/verify
// Request
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign this message to login: abc123..."
}
// Response
{
  "success": true,
  "user": {
    "walletAddress": "0x...",
    "displayName": "...",
    "reputation": 0
  },
  "token": "jwt_token_here" // optional session token
}
```

### 5.2 Questions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/questions` | List questions (paginated) | No |
| GET | `/api/questions/:id` | Get single question | No |
| POST | `/api/questions` | Create question | Yes |
| PUT | `/api/questions/:id` | Update question | Yes (owner) |
| DELETE | `/api/questions/:id` | Delete question | Yes (owner) |
| POST | `/api/questions/:id/accept/:answerId` | Accept answer | Yes (owner) |

```typescript
// GET /api/questions?page=1&limit=10&tag=solidity&sort=newest
// Response
{
  "questions": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 123,
    "pages": 13
  }
}

// POST /api/questions
// Request
{
  "title": "How to implement ERC721?",
  "description": "I want to create an NFT contract...",
  "tags": ["solidity", "nft", "erc721"]
}
// Response
{
  "success": true,
  "question": { "_id": "...", "title": "...", ... }
}
```

### 5.3 Answers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/questions/:questionId/answers` | Get answers for question | No |
| POST | `/api/questions/:questionId/answers` | Create answer | Yes |
| PUT | `/api/answers/:id` | Update answer | Yes (owner) |
| DELETE | `/api/answers/:id` | Delete answer | Yes (owner) |

```typescript
// POST /api/questions/:questionId/answers
// Request
{
  "content": "Here's how you implement ERC721...",
  "aiGenerated": false
}
// Response
{
  "success": true,
  "answer": { "_id": "...", "content": "...", ... }
}
```

### 5.4 Voting

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/questions/:id/vote` | Vote on question | Yes |
| POST | `/api/answers/:id/vote` | Vote on answer | Yes |
| DELETE | `/api/votes/:id` | Remove vote | Yes (owner) |

```typescript
// POST /api/answers/:id/vote
// Request
{ "value": 1 } // 1 for upvote, -1 for downvote
// Response
{
  "success": true,
  "newUpvotes": 10,
  "newDownvotes": 2,
  "rewardTriggered": true // if upvote threshold reached
}
```

### 5.5 AI Draft

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/questions/:id/ai-draft` | Generate AI draft | Yes |
| GET | `/api/ai/logs` | Get AI usage logs | Admin |

```typescript
// POST /api/questions/:id/ai-draft
// Request
{
  "options": {
    "maxTokens": 1000,
    "temperature": 0.7
  }
}
// Response
{
  "success": true,
  "draft": "Based on your question about ERC721...",
  "logId": "...",
  "tokensUsed": 450
}
```

### 5.6 Rewards (Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/rewards/trigger` | Trigger reward | Admin |
| GET | `/api/rewards/pending` | Get pending rewards | Admin |
| GET | `/api/rewards/history` | Get reward history | Admin |

```typescript
// POST /api/rewards/trigger
// Request
{
  "answerId": "...",
  "rewardType": "accepted_answer"
}
// Response
{
  "success": true,
  "txHash": "0x...",
  "amount": "50000000000000000000", // 50 VIBE in wei
  "recipient": "0x..."
}
```

---

## 6. Authentication

### 6.1 Sign-In with Ethereum (SIWE)

```typescript
// src/services/auth.service.ts
import { SiweMessage, generateNonce } from 'siwe';
import { User } from '../models/User';

export class AuthService {
  // Store nonces temporarily (use Redis in production)
  private nonces = new Map<string, string>();

  async getNonce(walletAddress: string): Promise<string> {
    const nonce = generateNonce();
    this.nonces.set(walletAddress.toLowerCase(), nonce);
    return nonce;
  }

  async verifySignature(
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<{ user: IUser; isNew: boolean }> {
    // Parse and verify SIWE message
    const siweMessage = new SiweMessage(message);
    const { success, error } = await siweMessage.verify({ signature });

    if (!success) {
      throw new Error(`Signature verification failed: ${error}`);
    }

    // Verify nonce
    const storedNonce = this.nonces.get(walletAddress.toLowerCase());
    if (siweMessage.nonce !== storedNonce) {
      throw new Error('Invalid nonce');
    }

    // Clear nonce after use
    this.nonces.delete(walletAddress.toLowerCase());

    // Find or create user
    let user = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });
    
    const isNew = !user;
    
    if (!user) {
      user = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        displayName: `User_${walletAddress.slice(0, 8)}`,
      });
    }

    return { user, isNew };
  }
}
```

### 6.2 Auth Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyMessage } from 'ethers';

export interface AuthRequest extends Request {
  walletAddress?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

    if (!walletAddress || !signature || !timestamp) {
      return res.status(401).json({ error: 'Missing authentication headers' });
    }

    // Check timestamp is recent (within 5 minutes)
    const requestTime = parseInt(timestamp);
    const now = Date.now();
    if (now - requestTime > 5 * 60 * 1000) {
      return res.status(401).json({ error: 'Request expired' });
    }

    // Verify signature
    const message = `Authenticate request at ${timestamp}`;
    const recoveredAddress = verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    req.walletAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
```

---

## 7. AI Integration

### 7.1 OpenAI Service

```typescript
// src/services/ai.service.ts
import OpenAI from 'openai';
import { AIPromptLog } from '../models/AIPromptLog';
import { Question } from '../models/Question';
import fs from 'fs';
import path from 'path';

export class AIService {
  private openai: OpenAI;
  private promptLogPath: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.promptLogPath = path.join(__dirname, '../../ai_logs/prompts.md');
  }

  async generateDraft(
    questionId: string,
    requestedBy: string,
    options?: { maxTokens?: number; temperature?: number }
  ) {
    // Get question
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Build prompt
    const systemPrompt = `You are an expert Web3 and Solidity developer. 
Given a technical question, provide a clear, concise, and correct answer.
Include code examples if applicable. Mark any assumptions or caveats.
Keep the response focused and practical.`;

    const userPrompt = `Question: ${question.title}

Description:
${question.description}

Tags: ${question.tags.join(', ')}

Please provide a helpful, technically accurate answer.`;

    // Call OpenAI
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Log to database
    const log = await AIPromptLog.create({
      questionId,
      requestedBy,
      promptText: userPrompt,
      model: 'gpt-4-turbo-preview',
      responseText,
      tokensUsed,
      costEstimate: this.estimateCost(tokensUsed),
    });

    // Append to prompts.md file (hackathon requirement)
    this.appendToPromptsLog(questionId, userPrompt, responseText);

    return {
      draft: responseText,
      logId: log._id,
      tokensUsed,
    };
  }

  private estimateCost(tokens: number): number {
    // GPT-4 Turbo pricing (approximate)
    return (tokens / 1000) * 0.01;
  }

  private appendToPromptsLog(
    questionId: string,
    prompt: string,
    response: string
  ) {
    const entry = `
---
## ${new Date().toISOString()}

**Question ID:** ${questionId}
**Model:** gpt-4-turbo-preview

### Prompt
\`\`\`
${prompt}
\`\`\`

### Response
${response}

---
`;

    fs.appendFileSync(this.promptLogPath, entry);
  }
}
```

---

## 8. Blockchain Integration

### 8.1 Reward Service

```typescript
// src/services/reward.service.ts
import { ethers } from 'ethers';
import { Answer } from '../models/Answer';
import { RewardLog } from '../models/RewardLog';
import { User } from '../models/User';

// Import ABIs
import VibeTokenABI from '../config/abis/VibeToken.json';
import RewardManagerABI from '../config/abis/RewardManager.json';

export class RewardService {
  private provider: ethers.JsonRpcProvider;
  private adminWallet: ethers.Wallet;
  private rewardManager: ethers.Contract;
  private vibeToken: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.adminWallet = new ethers.Wallet(
      process.env.ADMIN_PRIVATE_KEY!,
      this.provider
    );
    
    this.rewardManager = new ethers.Contract(
      process.env.REWARD_MANAGER_ADDRESS!,
      RewardManagerABI,
      this.adminWallet
    );
    
    this.vibeToken = new ethers.Contract(
      process.env.VIBE_TOKEN_ADDRESS!,
      VibeTokenABI,
      this.adminWallet
    );
  }

  async rewardAcceptedAnswer(answerId: string): Promise<{
    txHash: string;
    amount: string;
  }> {
    const answer = await Answer.findById(answerId).populate('questionId');
    if (!answer) throw new Error('Answer not found');

    // Generate answer ID for smart contract
    const answerIdBytes = ethers.keccak256(
      ethers.toUtf8Bytes(answerId)
    );

    // Check if already rewarded
    const isRewarded = await this.rewardManager.isAnswerRewarded(answerIdBytes);
    if (isRewarded) {
      throw new Error('Answer already rewarded');
    }

    // Get question ID
    const questionId = (answer.questionId as any)._id.toString();
    const questionIdNum = parseInt(questionId.slice(-8), 16); // Convert to number

    // Call smart contract
    const tx = await this.rewardManager.rewardAcceptedAnswer(
      answer.author,
      answerIdBytes,
      questionIdNum
    );

    // Wait for confirmation
    const receipt = await tx.wait();
    const txHash = receipt.hash;

    // Get reward amount from contract
    const rewardAmount = await this.rewardManager.acceptedAnswerReward();

    // Save to database
    await RewardLog.create({
      answerId,
      recipient: answer.author,
      rewardType: 'accepted_answer',
      amount: rewardAmount.toString(),
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
      amount: rewardAmount.toString(),
    };
  }

  async rewardUpvoteThreshold(answerId: string): Promise<{
    txHash: string;
    amount: string;
  }> {
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error('Answer not found');

    // Generate unique ID for upvote reward
    const rewardIdBytes = ethers.keccak256(
      ethers.toUtf8Bytes(`upvote_${answerId}`)
    );

    // Check if already rewarded for upvotes
    const isRewarded = await this.rewardManager.isAnswerRewarded(rewardIdBytes);
    if (isRewarded) {
      throw new Error('Already rewarded for upvote threshold');
    }

    const questionIdNum = 0; // Can be extracted from answer.questionId

    const tx = await this.rewardManager.rewardUpvoteThreshold(
      answer.author,
      rewardIdBytes,
      questionIdNum
    );

    const receipt = await tx.wait();
    const rewardAmount = await this.rewardManager.upvoteReward();

    await RewardLog.create({
      answerId,
      recipient: answer.author,
      rewardType: 'upvote_threshold',
      amount: rewardAmount.toString(),
      txHash: receipt.hash,
      status: 'confirmed',
    });

    await Answer.findByIdAndUpdate(answerId, {
      $push: { txHashes: receipt.hash },
    });

    await User.findOneAndUpdate(
      { walletAddress: answer.author },
      { $inc: { reputation: 5 } }
    );

    return {
      txHash: receipt.hash,
      amount: rewardAmount.toString(),
    };
  }

  async getTokenBalance(walletAddress: string): Promise<string> {
    const balance = await this.vibeToken.balanceOf(walletAddress);
    return ethers.formatEther(balance);
  }
}
```

---

## 9. Rate Limiting & Security

### 9.1 Rate Limiting

```typescript
// src/middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// General API rate limit
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Too many requests, please try again later' },
});

// AI endpoint rate limit (more restrictive)
export const aiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI requests per hour
  keyGenerator: (req) => req.walletAddress || req.ip,
  message: { error: 'AI quota exceeded. Please try again later.' },
});

// Write operations rate limit
export const writeLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 writes per minute
  keyGenerator: (req) => req.walletAddress || req.ip,
});
```

### 9.2 Security Middleware

```typescript
// src/middleware/security.middleware.ts
import helmet from 'helmet';
import cors from 'cors';
import { Express } from 'express';

export const setupSecurity = (app: Express) => {
  // Helmet for security headers
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'x-wallet-address',
      'x-signature',
      'x-timestamp',
    ],
  }));

  // Disable x-powered-by header
  app.disable('x-powered-by');
};
```

---

## 10. Environment Variables

```env
# Server
NODE_ENV=development
PORT=4000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vibequorum

# Redis
REDIS_URL=redis://localhost:6379

# Blockchain
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
CHAIN_ID=11155111
VIBE_TOKEN_ADDRESS=0x...
REWARD_MANAGER_ADDRESS=0x...
ADMIN_PRIVATE_KEY=your_private_key_never_commit

# OpenAI
OPENAI_API_KEY=sk-...

# Frontend
FRONTEND_URL=https://vibequorum.vercel.app

# Security
JWT_SECRET=your_jwt_secret_here
```

---

## 11. Deployment

### 11.1 Render/Railway Deployment

```yaml
# render.yaml
services:
  - type: web
    name: vibequorum-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: vibequorum-db
          property: connectionString
```

### 11.2 Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]
```

---

## 12. Testing

### 12.1 Test Structure

```typescript
// tests/integration/questions.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/database';

describe('Questions API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('GET /api/questions', () => {
    it('should return paginated questions', async () => {
      const res = await request(app)
        .get('/api/questions')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('questions');
      expect(res.body).toHaveProperty('pagination');
    });
  });

  describe('POST /api/questions', () => {
    it('should create a question with valid auth', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('x-wallet-address', '0x...')
        .set('x-signature', '0x...')
        .set('x-timestamp', Date.now().toString())
        .send({
          title: 'Test Question',
          description: 'Test description',
          tags: ['solidity'],
        });

      expect(res.status).toBe(201);
      expect(res.body.question).toHaveProperty('_id');
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({
          title: 'Test Question',
          description: 'Test description',
          tags: ['solidity'],
        });

      expect(res.status).toBe(401);
    });
  });
});
```

### 12.2 Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/integration/questions.test.ts
```

---

## Checklist

### Core Features
- [ ] User authentication (SIWE)
- [ ] Question CRUD
- [ ] Answer CRUD
- [ ] Voting system
- [ ] AI draft generation
- [ ] Reward triggering

### Security
- [ ] Input validation
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Signature verification
- [ ] Admin route protection

### Database
- [ ] MongoDB connection
- [ ] All models created
- [ ] Indexes for performance
- [ ] Data validation

### Blockchain
- [ ] ethers.js setup
- [ ] Contract ABIs loaded
- [ ] Reward functions
- [ ] Transaction handling

### Documentation
- [ ] API documentation
- [ ] Environment variables documented
- [ ] Deployment guide
- [ ] ai_logs/prompts.md setup

---

## Next Steps

1. **Initialize project**: `mkdir backend && cd backend && npm init -y`
2. **Install dependencies**: See package.json above
3. **Set up TypeScript**: Create tsconfig.json
4. **Create directory structure**: Follow structure above
5. **Implement models**: Start with User, Question, Answer
6. **Implement routes**: Auth → Questions → Answers → Voting → AI → Rewards
7. **Add middleware**: Auth, rate limiting, validation
8. **Test endpoints**: Use Postman or Jest
9. **Deploy**: Render, Railway, or Heroku

