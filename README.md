# VibeQuorum

**A community-driven Q&A platform for Web3 developers, powered by AI assistance and on-chain token rewards.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)

## 🌟 Overview

VibeQuorum combines community expertise with AI assistance to deliver fast, high-quality answers to Web3 development questions. Contributors earn on-chain VibeTokens when their answers are voted or accepted, creating a self-sustaining knowledge economy that helps developers get unstuck and incentivizes expert participation.

## ✨ Key Features

- **🔐 Wallet Authentication** - Connect with MetaMask or other Web3 wallets
- **❓ Q&A Platform** - Post questions, provide answers, and vote on content
- **🤖 AI Assistant** - Get AI-drafted answers using OpenAI/Hugging Face
- **💰 On-Chain Rewards** - Earn VibeTokens for accepted answers and upvoted content
- **👑 Admin Panel** - Manage rewards and monitor platform activity
- **📊 Reputation System** - Build your reputation through quality contributions

## 🏗️ Architecture

VibeQuorum is built as a monorepo with three main components:

- **Frontend** (`VibeQuorum-frontend/`) - Next.js 16 with React, TypeScript, and RainbowKit
- **Backend** (`backend/`) - Node.js/Express API with MongoDB
- **Smart Contracts** (`contracts/`) - Solidity contracts for VibeToken and RewardManager

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- MetaMask or compatible Web3 wallet
- Access to Base Sepolia testnet (or other supported networks)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vibequorum.git
cd vibequorum

# Install dependencies (from root)
npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp VibeQuorum-frontend/.env.example VibeQuorum-frontend/.env.local
cp contracts/.env.example contracts/.env

# Edit environment files with your configuration
```

### Development

```bash
# Start backend (from root or backend/)
npm run dev:backend

# Start frontend (from root or VibeQuorum-frontend/)
npm run dev:frontend

# Run smart contract tests
cd contracts
npm test
```

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Documentation

- [PRD.md](./PRD.md) - Product Requirements Document
- [ArchitecturalFlow.md](./ArchitecturalFlow.md) - System architecture and flow
- [ADMIN_PANEL_EXPLANATION.md](./ADMIN_PANEL_EXPLANATION.md) - Admin panel guide
- [TIP.md](./TIP.md) - Testing in Production guide
- [backend/README.md](./backend/README.md) - Backend API documentation
- [contracts/README.md](./contracts/README.md) - Smart contract documentation

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Smart contract tests
cd contracts
npm test

# E2E testing guide
See E2E_TESTING.md
```

## 🔐 Security

- Role-based access control (RBAC) for admin functions
- Signature-based authentication for API calls
- Rate limiting on all endpoints
- Input validation with Zod
- On-chain double-reward prevention
- Daily reward limits per user

## 🎯 Reward System

VibeQuorum implements a comprehensive reward system:

1. **Accepted Answer Reward** - 50 VIBE tokens when your answer is accepted
2. **Upvote Threshold Reward** - Automatic reward when answer reaches 10 upvotes
3. **Questioner Bonus** - 10 VIBE tokens for questioners when their answer is accepted

All rewards are distributed on-chain via the RewardManager smart contract, ensuring transparency and security.

## 🌐 Supported Networks

- Base Sepolia (Primary)
- Ethereum Sepolia
- BSC Testnet

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- Built for the Seedify VibeCoins Hackathon
- Uses RainbowKit for wallet connections
- Powered by OpenAI/Hugging Face for AI features
- Deployed on Base Sepolia testnet

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ by the VibeQuorum Team**
