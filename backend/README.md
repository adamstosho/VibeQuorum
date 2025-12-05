# VibeQuorum Backend API

Backend server for VibeQuorum - A Web3 Q&A platform with AI assistance and on-chain token rewards.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Hugging Face API key (optional for AI features)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your actual values
nano .env

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── routes/          # Express routes
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── middleware/     # Express middleware
│   ├── utils/           # Utility functions
│   ├── types/          # TypeScript types
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── ai_logs/            # AI prompt logs (hackathon requirement)
├── tests/              # Test files
└── dist/               # Compiled JavaScript (generated)
```

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:4000/api-docs`
- Health Check: `http://localhost:4000/health`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🔒 Security

- All API keys stored in environment variables
- Rate limiting enabled on all endpoints
- CORS configured for frontend
- Input validation with Zod
- Helmet for security headers

## 📝 AI Integration

This backend uses Hugging Face Inference API for AI-powered answer generation. All AI prompts and responses are logged to:
- Database: `AIPromptLog` collection
- File: `ai_logs/prompts.md` (hackathon requirement)

## 🏗️ Architecture

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB Atlas
- **Cache**: Redis (optional, falls back to in-memory)
- **AI**: Hugging Face Inference API
- **Blockchain**: ethers.js v6
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

## 📄 License

MIT

