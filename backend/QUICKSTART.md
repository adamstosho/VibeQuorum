# VibeQuorum Backend - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` and update:
- `MONGODB_URI` - Your MongoDB connection string (already provided)
- `HUGGINGFACE_API_KEY` - Your Hugging Face API key
- `RPC_URL` - Your blockchain RPC endpoint
- `VIBE_TOKEN_ADDRESS` - Deployed VibeToken contract address
- `ADMIN_PRIVATE_KEY` - Admin wallet private key (for rewards)

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:4000`

### 4. Access API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:4000/api-docs
- **Health Check**: http://localhost:4000/health

## 📝 API Testing with Swagger

1. Open http://localhost:4000/api-docs in your browser
2. Use the "Authorize" button to add authentication headers:
   - `x-wallet-address`: Your wallet address (e.g., `0x1234...`)
   - `x-signature`: Signature (for write operations)
   - `x-timestamp`: Current timestamp in milliseconds

3. Test endpoints directly from Swagger UI

## 🔑 Authentication

For write operations, you need to provide:
- `x-wallet-address`: Your Ethereum wallet address
- `x-signature`: Signature of the message (optional for MVP)
- `x-timestamp`: Request timestamp

For read operations, only `x-wallet-address` is required.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📦 Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify your `MONGODB_URI` is correct
- Check network connectivity
- Ensure MongoDB Atlas allows your IP

### Hugging Face API Issues
- Verify your API key is valid
- Check rate limits
- Some models may require specific access

### Blockchain Connection Issues
- Verify RPC URL is correct
- Check network (Sepolia, etc.)
- Ensure contract addresses are correct

## 📚 Key Endpoints

- `GET /api/questions` - List questions
- `POST /api/questions` - Create question
- `POST /api/questions/:id/ai-draft` - Generate AI draft
- `POST /api/questions/:id/answers` - Create answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/rewards/trigger` - Trigger reward (Admin)

## 🔒 Security Notes

- Never commit `.env` file
- Keep `ADMIN_PRIVATE_KEY` secure
- Use environment variables for all secrets
- Enable CORS only for trusted origins in production

