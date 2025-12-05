# VibeQuorum Backend Structure

## 📁 Complete Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   ├── redis.ts             # Redis connection (optional)
│   │   ├── blockchain.ts        # Ethers.js setup
│   │   ├── ai.ts                # Hugging Face AI config
│   │   └── swagger.ts           # Swagger/OpenAPI config
│   │
│   ├── models/
│   │   ├── User.ts              # User model
│   │   ├── Question.ts          # Question model
│   │   ├── Answer.ts            # Answer model
│   │   ├── Vote.ts              # Vote model
│   │   ├── AIPromptLog.ts       # AI prompt log model
│   │   └── RewardLog.ts         # Reward log model
│   │
│   ├── routes/
│   │   ├── auth.routes.ts       # Authentication routes
│   │   ├── question.routes.ts   # Question CRUD routes
│   │   ├── answer.routes.ts     # Answer CRUD routes
│   │   ├── vote.routes.ts       # Voting routes
│   │   ├── ai.routes.ts         # AI draft routes
│   │   └── reward.routes.ts     # Reward routes
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── question.controller.ts
│   │   ├── answer.controller.ts
│   │   ├── vote.controller.ts
│   │   ├── ai.controller.ts
│   │   └── reward.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts      # Auth business logic
│   │   ├── question.service.ts  # Question business logic
│   │   ├── answer.service.ts   # Answer business logic
│   │   ├── vote.service.ts     # Voting business logic
│   │   ├── ai.service.ts       # Hugging Face AI integration
│   │   └── reward.service.ts  # Blockchain reward logic
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Wallet authentication
│   │   ├── rateLimit.middleware.ts  # Rate limiting
│   │   ├── validate.middleware.ts  # Request validation
│   │   └── error.middleware.ts     # Error handling
│   │
│   ├── utils/
│   │   ├── logger.ts           # Winston logger
│   │   ├── errors.ts           # Custom error classes
│   │   └── helpers.ts          # Utility functions
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   │
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
│
├── ai_logs/
│   └── prompts.md              # AI prompt logs (hackathon requirement)
│
├── logs/                       # Application logs
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── jest.config.js             # Jest test config
├── .eslintrc.json             # ESLint config
├── README.md                  # Main README
├── QUICKSTART.md              # Quick start guide
└── STRUCTURE.md               # This file
```

## 🏗️ Architecture Overview

### Layer Separation

1. **Routes** - Define API endpoints and apply middleware
2. **Controllers** - Handle HTTP requests/responses
3. **Services** - Business logic and data operations
4. **Models** - MongoDB schemas and validation
5. **Middleware** - Cross-cutting concerns (auth, validation, errors)
6. **Utils** - Shared utilities and helpers

### Key Features

✅ **TypeScript** - Full type safety
✅ **Modular Structure** - Clean separation of concerns
✅ **Swagger Documentation** - Interactive API docs
✅ **Rate Limiting** - Protects against abuse
✅ **Input Validation** - Zod schemas for all inputs
✅ **Error Handling** - Centralized error management
✅ **Logging** - Winston for structured logging
✅ **Hugging Face AI** - Simple AI integration
✅ **Blockchain Integration** - Ethers.js for rewards

## 🔄 Request Flow

```
Client Request
    ↓
Rate Limiter
    ↓
Auth Middleware (if required)
    ↓
Validation Middleware
    ↓
Route Handler
    ↓
Controller
    ↓
Service
    ↓
Model (MongoDB)
    ↓
Response
```

## 📊 Database Models

- **User** - Wallet-based user profiles
- **Question** - Q&A questions with tags
- **Answer** - Answers to questions
- **Vote** - Upvotes/downvotes
- **AIPromptLog** - AI interaction logs
- **RewardLog** - On-chain reward transactions

## 🔐 Security Features

- Wallet signature verification
- Rate limiting (per user and global)
- Input validation with Zod
- CORS configuration
- Helmet security headers
- Admin-only routes protection

## 🤖 AI Integration

- Uses Hugging Face Inference API
- Simple prompt engineering
- Automatic logging to `prompts.md`
- Rate limiting for cost control
- Error handling for API failures

## 📝 API Endpoints

### Authentication
- `POST /api/auth/connect` - Connect wallet
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Questions
- `GET /api/questions` - List questions
- `GET /api/questions/:id` - Get question
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/accept/:answerId` - Accept answer

### Answers
- `GET /api/questions/:questionId/answers` - Get answers
- `GET /api/answers/:id` - Get answer
- `POST /api/questions/:questionId/answers` - Create answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer

### Voting
- `POST /api/questions/:id/vote` - Vote on question
- `POST /api/answers/:id/vote` - Vote on answer
- `DELETE /api/votes/:type/:id` - Remove vote

### AI
- `POST /api/questions/:id/ai-draft` - Generate AI draft
- `GET /api/ai/stats` - Get AI usage stats

### Rewards
- `POST /api/rewards/trigger` - Trigger reward (Admin)
- `GET /api/rewards/balance` - Get token balance
- `GET /api/rewards/history` - Get reward history

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Configure `.env` file
3. Run development server: `npm run dev`
4. Test API with Swagger: http://localhost:4000/api-docs
5. Connect frontend to backend API

