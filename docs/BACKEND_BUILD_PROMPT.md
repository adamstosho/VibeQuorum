# Backend Build Prompt for Cursor

Copy and paste this entire prompt to Cursor to build the backend:

---

## PROMPT START

```
You are building the backend for VibeQuorum, an AI-powered Q&A platform for Web3 developers with on-chain token rewards.

## PROJECT CONTEXT

Read and understand these files thoroughly before starting:
- @docs/BACKEND_IMPLEMENTATION.md - Complete implementation guide
- @docs/AI_IMPLEMENTATION.md - AI integration guide  
- @ArchitecturalFlow.md - System architecture
- @PRD.md - Product requirements
- @ProjectID.md - Project overview

## EXISTING COMPONENTS (Already Built)

1. **Frontend** (Next.js) - COMPLETE at `VibeQuorum-frontend/`
2. **Smart Contracts** (Solidity) - COMPLETE at `contracts/`
   - VibeToken.sol - ERC20 token
   - RewardManager.sol - Reward distribution
   - ABIs in `contracts/artifacts/`

## YOUR TASK

Build a complete, production-grade Node.js/Express backend in the `backend/` directory.

## TECHNOLOGY STACK (Required)

- Runtime: Node.js 18+
- Framework: Express.js
- Language: TypeScript (strict mode)
- Database: MongoDB with Mongoose
- Cache: Redis (ioredis)
- AI: OpenAI API (openai package)
- Blockchain: ethers.js v6
- Auth: SIWE (Sign-In with Ethereum)
- Validation: Zod
- Logging: Winston

## DIRECTORY STRUCTURE (Create exactly this)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # MongoDB connection
│   │   ├── redis.ts           # Redis connection
│   │   ├── blockchain.ts      # ethers.js setup with contract ABIs
│   │   └── openai.ts          # OpenAI client + prompts
│   │
│   ├── models/
│   │   ├── User.ts            # walletAddress, displayName, reputation
│   │   ├── Question.ts        # title, description, tags, status
│   │   ├── Answer.ts          # content, upvotes, aiGenerated, txHashes
│   │   ├── Vote.ts            # voter, targetType, targetId, value
│   │   ├── AIPromptLog.ts     # prompt, response, tokens, cost
│   │   └── RewardLog.ts       # answerId, recipient, amount, txHash
│   │
│   ├── routes/
│   │   ├── index.ts           # Route aggregator
│   │   ├── auth.routes.ts     # POST /nonce, /verify, GET /me
│   │   ├── questions.routes.ts # CRUD + accept answer
│   │   ├── answers.routes.ts  # CRUD for answers
│   │   ├── votes.routes.ts    # Upvote/downvote
│   │   ├── ai.routes.ts       # AI draft generation
│   │   └── rewards.routes.ts  # Trigger rewards (admin)
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
│   │   ├── auth.service.ts     # SIWE verification
│   │   ├── question.service.ts
│   │   ├── answer.service.ts
│   │   ├── vote.service.ts     # Vote logic + threshold checks
│   │   ├── ai.service.ts       # OpenAI integration + logging
│   │   └── reward.service.ts   # Smart contract calls
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts  # Wallet signature verification
│   │   ├── rateLimit.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/
│   │   ├── logger.ts           # Winston logger
│   │   ├── errors.ts           # Custom error classes
│   │   └── helpers.ts          
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   │
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Entry point
│
├── ai_logs/
│   └── prompts.md              # Auto-append AI logs here (EXISTS)
│
├── tests/
│   ├── unit/
│   │   └── services/
│   └── integration/
│       └── routes/
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## API ENDPOINTS (Implement all)

### Authentication
- `POST /api/auth/nonce` - Get signing nonce
- `POST /api/auth/verify` - Verify signature, return/create user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Questions
- `GET /api/questions` - List with pagination, filters (tag, status, sort)
- `GET /api/questions/:id` - Get single with answers
- `POST /api/questions` - Create (auth required)
- `PUT /api/questions/:id` - Update (owner only)
- `DELETE /api/questions/:id` - Delete (owner only)
- `POST /api/questions/:id/accept/:answerId` - Accept answer (owner only)

### Answers
- `GET /api/questions/:questionId/answers` - Get answers for question
- `POST /api/questions/:questionId/answers` - Create (auth required)
- `PUT /api/answers/:id` - Update (owner only)
- `DELETE /api/answers/:id` - Delete (owner only)

### Voting
- `POST /api/questions/:id/vote` - Vote on question
- `POST /api/answers/:id/vote` - Vote on answer
- `DELETE /api/votes/:id` - Remove vote

### AI
- `POST /api/questions/:id/ai-draft` - Generate AI draft (auth + rate limit)

### Rewards (Admin only)
- `POST /api/rewards/trigger` - Trigger reward for answer
- `GET /api/rewards/pending` - Get pending rewards
- `GET /api/rewards/history` - Get reward history

## AUTHENTICATION FLOW

Use Sign-In with Ethereum (SIWE):
1. Frontend requests nonce for wallet address
2. User signs message with MetaMask
3. Backend verifies signature
4. Return/create user, issue session

Headers for authenticated requests:
- `x-wallet-address`: User's wallet address
- `x-signature`: Signed message
- `x-timestamp`: Request timestamp (for replay protection)

## AI INTEGRATION REQUIREMENTS

1. Use OpenAI GPT-4-turbo-preview
2. System prompt for Web3/Solidity expertise
3. Log ALL prompts to:
   - MongoDB (AIPromptLog model)
   - `ai_logs/prompts.md` file (append)
4. Rate limit: 10/hour/user, 30/day/user
5. Track tokens and estimated cost

## BLOCKCHAIN INTEGRATION

1. Load contract ABIs from `../contracts/artifacts/`
2. Use admin wallet for reward calls
3. Implement RewardService with methods:
   - `rewardAcceptedAnswer(answerId)`
   - `rewardUpvoteThreshold(answerId)`
   - `getTokenBalance(walletAddress)`
4. Store txHash in Answer.txHashes array

## SECURITY REQUIREMENTS

1. Input validation with Zod on ALL endpoints
2. Rate limiting with Redis
3. CORS configured for frontend URL only
4. Helmet for security headers
5. Never expose admin private key
6. Sanitize all user input
7. Verify wallet ownership on protected routes

## CODE QUALITY REQUIREMENTS

1. TypeScript strict mode
2. Async/await (no callbacks)
3. Proper error handling with custom error classes
4. Comprehensive logging with Winston
5. Environment variables for all secrets
6. No hardcoded values
7. Follow existing patterns from docs

## DATABASE REQUIREMENTS

1. Mongoose schemas with proper indexes
2. Compound unique index on Vote (voter + targetType + targetId)
3. Text index on Question (title + description)
4. Index on common query fields (createdAt, tags, status)

## TESTING REQUIREMENTS

Create at least these tests (use Jest):
1. Auth service - nonce generation, signature verification
2. Question service - CRUD operations
3. Vote service - upvote logic, threshold detection
4. API routes - integration tests with supertest

## ENVIRONMENT VARIABLES (.env.example)

```env
# Server
NODE_ENV=development
PORT=4000

# Database
MONGODB_URI=mongodb+srv://...

# Redis
REDIS_URL=redis://localhost:6379

# Blockchain
RPC_URL=https://sepolia.infura.io/v3/...
CHAIN_ID=11155111
VIBE_TOKEN_ADDRESS=0x...
REWARD_MANAGER_ADDRESS=0x...
ADMIN_PRIVATE_KEY=...

# OpenAI
OPENAI_API_KEY=sk-...

# Frontend
FRONTEND_URL=http://localhost:3000
```

## OUTPUT EXPECTATIONS

1. Create ALL files in the structure above
2. Fully implement each service with business logic
3. Include proper TypeScript types
4. Add comprehensive error handling
5. Include JSDoc comments on public methods
6. Create working package.json with all dependencies
7. Create tsconfig.json with strict settings
8. Ensure code compiles without errors
9. Include at least 5 test files

## START NOW

Begin by creating:
1. package.json with all dependencies
2. tsconfig.json
3. src/app.ts and src/server.ts
4. All models in src/models/
5. All config files in src/config/
6. Then routes, controllers, services, middleware

Make sure every file is complete and production-ready. Do not use placeholder code or "TODO" comments. Implement everything fully.
```

## PROMPT END

---

## How to Use This Prompt

1. **Open Cursor** in the `/root/Web3Answer` directory
2. **Start a new chat** or use Composer
3. **Copy the entire prompt** above (from "You are building..." to the end)
4. **Paste into Cursor**
5. **Reference the docs** by typing `@docs/BACKEND_IMPLEMENTATION.md` etc.

## Tips for Best Results

1. **Break it down** - If Cursor struggles, ask it to build one section at a time:
   - "First, create all the models"
   - "Now create the auth service and routes"
   - "Now create the AI service"

2. **Verify each step** - After each major section, run:
   ```bash
   cd backend && npm run build
   ```

3. **Fix errors immediately** - Don't let errors accumulate

4. **Test early** - Run tests as soon as basic routes are created

## Alternative: Step-by-Step Prompts

If the full prompt is too much, use these in sequence:

### Step 1: Setup
```
Create the backend project setup for VibeQuorum:
- package.json with all dependencies
- tsconfig.json with strict TypeScript
- src/app.ts with Express setup (CORS, helmet, JSON parsing)
- src/server.ts entry point
Reference @docs/BACKEND_IMPLEMENTATION.md for details.
```

### Step 2: Models
```
Create all Mongoose models in backend/src/models/:
- User.ts
- Question.ts  
- Answer.ts
- Vote.ts
- AIPromptLog.ts
- RewardLog.ts
Include proper TypeScript interfaces and indexes.
Reference @docs/BACKEND_IMPLEMENTATION.md section 4.
```

### Step 3: Config
```
Create all config files in backend/src/config/:
- database.ts (MongoDB connection)
- redis.ts (Redis connection)
- blockchain.ts (ethers.js with contract ABIs)
- openai.ts (OpenAI client and prompts)
Reference @docs/BACKEND_IMPLEMENTATION.md and @docs/AI_IMPLEMENTATION.md
```

### Step 4: Auth
```
Create complete authentication system:
- src/services/auth.service.ts (SIWE verification)
- src/controllers/auth.controller.ts
- src/routes/auth.routes.ts
- src/middleware/auth.middleware.ts
Reference @docs/BACKEND_IMPLEMENTATION.md section 6.
```

### Step 5: Questions & Answers
```
Create question and answer CRUD:
- src/services/question.service.ts
- src/services/answer.service.ts
- src/controllers/questions.controller.ts
- src/controllers/answers.controller.ts
- src/routes/questions.routes.ts
- src/routes/answers.routes.ts
Include pagination, filtering, and owner validation.
```

### Step 6: Voting
```
Create voting system:
- src/services/vote.service.ts (with upvote threshold detection)
- src/controllers/votes.controller.ts
- src/routes/votes.routes.ts
One vote per user per target, trigger reward on threshold.
```

### Step 7: AI Integration
```
Create AI draft generation:
- src/services/ai.service.ts (OpenAI integration)
- src/controllers/ai.controller.ts
- src/routes/ai.routes.ts
Log to database AND append to ai_logs/prompts.md.
Reference @docs/AI_IMPLEMENTATION.md
```

### Step 8: Rewards
```
Create reward system:
- src/services/reward.service.ts (smart contract calls)
- src/controllers/rewards.controller.ts
- src/routes/rewards.routes.ts
Use ethers.js to call RewardManager contract.
Reference @docs/BACKEND_IMPLEMENTATION.md section 8.
```

### Step 9: Tests
```
Create test suite:
- tests/unit/services/auth.service.test.ts
- tests/unit/services/vote.service.test.ts
- tests/integration/routes/questions.routes.test.ts
Use Jest and supertest.
```

