# ⚡ VibeQuorum

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status: Beta](https://img.shields.io/badge/Status-Beta-blueviolet)
![Stack: MERN+Web3](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node%20%7C%20Solidity-blue)
![Network: Base Sepolia](https://img.shields.io/badge/Network-Base%20Sepolia-0052FF)
![Node Version](https://img.shields.io/badge/Node-%3E%3D18.0.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

> **Decentralized Knowledge Sharing. Incentivized by Code.**

---

## 📖 Table of Contents

- [Introduction](#-introduction)
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Tech Stack & Tools](#-tech-stack--tools)
- [Getting Started](#-getting-started)
- [How to Use the Application](#-how-to-use-the-application)
- [API Documentation](#-api-documentation)
- [Smart Contracts](#-smart-contracts)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security Features](#-security-features)
- [Contributing](#-contributing)
- [License](#-license)
- [Support & Contact](#-support--contact)

---

## 📖 Introduction

**VibeQuorum** is a next-generation Question & Answer platform built specifically for the Web3 era. It reimagines traditional Q&A platforms like Stack Overflow by introducing **crypto-economic incentives** and **blockchain-based provenance**.

In traditional web platforms, your valuable contributions build the platform's value, but you don't directly benefit. In VibeQuorum, your contributions build **your value**. By leveraging the **Base Blockchain**, we ensure that every helpful answer is not only recognized but instantly rewarded with **VIBE Tokens** - a cryptocurrency that represents your expertise and contribution to the community.

### 🎯 Key Differentiators

| Traditional Q&A Platforms | VibeQuorum |
|---------------------------|------------|
| Points and badges (no real value) | Real cryptocurrency rewards (VIBE Tokens) |
| Centralized ownership | Decentralized on blockchain |
| No proof of contribution | Immutable on-chain proof |
| Email/password authentication | Wallet-based identity (Web3 native) |
| Manual answer drafting | AI-powered answer assistance |
| No instant rewards | Instant token rewards upon acceptance |

---

## 🚨 Problem Statement

### The Problems We Solve

| Problem ❌ | Impact |
|:---|:---|
| **Unpaid Labor** | Expert developers spend hours answering questions for free, earning only reputation points with no real-world value. |
| **Plagiarism & Lack of Credit** | Answers are copied without attribution, and original contributors receive no recognition or compensation. |
| **Gatekeeping** | New developers struggle to get noticed and build reputation, creating barriers to entry. |
| **No Provenance** | There's no way to prove when you contributed an answer or verify its originality. |
| **Centralized Control** | Platforms own all data and can change rules without community input. |
| **Slow Recognition** | Rewards (if any) take time to process, reducing motivation for quick, helpful responses. |

### Why This Matters

The current model disincentivizes quality contributions and creates barriers for new participants. Developers deserve to be rewarded for their expertise and time, and the community deserves transparent, verifiable contributions.

---

## ✅ Solution Overview

VibeQuorum solves these problems through a combination of blockchain technology, smart contracts, and AI assistance:

### Our Solutions

| Solution ✅ | How It Works |
|:---|:---|
| **Instant Rewards** | Earn 10 VIBE tokens immediately when your answer is accepted. Question askers also get 2 VIBE tokens as a bonus. |
| **On-Chain Proof** | Every accepted answer is timestamped and recorded on the Base blockchain, providing immutable proof of your contribution. |
| **AI Assistance** | Integrated AI helps you draft high-quality answers faster, making it easier for everyone to contribute. |
| **Wallet-Based Identity** | No emails or passwords needed. Your Ethereum wallet is your identity, portable across the Web3 ecosystem. |
| **Decentralized Ownership** | Smart contracts ensure transparent, automated reward distribution without centralized control. |
| **Fair Access** | Anyone with a wallet can participate, removing barriers to entry. |

---

## ✨ Core Features

### 1. 🔐 Wallet-Based Authentication

**What it is:** Instead of traditional email/password login, VibeQuorum uses your Ethereum wallet as your identity.

**How it works:**
- Connect your wallet (MetaMask, Rainbow, Coinbase Wallet, or any WalletConnect-compatible wallet)
- Sign a message to authenticate
- Your wallet address becomes your unique identifier
- Your reputation and rewards are tied to your address

**Benefits:**
- No passwords to remember or reset
- Your identity is portable across Web3 platforms
- Enhanced security through cryptographic signatures
- True ownership of your digital identity

### 2. 🤖 AI Co-Pilot for Answer Drafting

**What it is:** An intelligent assistant that helps you write better answers faster.

**How it works:**
1. When answering a question, click the "Generate AI Draft" button
2. The AI analyzes the question context and generates a formatted draft
3. Review and edit the draft to add your personal expertise
4. Submit your refined answer

**Features:**
- Code-heavy, well-formatted drafts
- Context-aware suggestions
- Saves time while maintaining quality
- Human expertise + AI speed = Better answers

**Note:** The AI assists but doesn't replace human judgment. All answers are reviewed and refined by real developers.

### 3. 💰 The VIBE Token Reward System

**What it is:** An automated, blockchain-based reward system that instantly compensates helpful contributors.

**How the reward flow works:**

```mermaid
sequenceDiagram
    participant User as Question Asker
    participant Answerer as Answer Provider
    participant Frontend as Frontend App
    participant Backend as Backend API
    participant Contract as Smart Contract
    participant Blockchain as Base Blockchain

    User->>Frontend: Posts Question
    Answerer->>Frontend: Posts Answer
    Answerer->>Frontend: Uses AI Draft (Optional)
    User->>Frontend: Reviews Answers
    User->>Frontend: Clicks "Accept Answer"
    Frontend->>Backend: Accept Answer Request
    Backend->>Contract: Calls rewardAcceptedAnswer()
    Contract->>Blockchain: Mints 10 VIBE to Answerer
    Contract->>Blockchain: Mints 2 VIBE to Questioner (Bonus)
    Contract->>Backend: Emits RewardDistributed Event
    Backend->>Frontend: Confirmation
    Frontend->>User: Shows Success Message
```

**Reward Structure:**

| Action | Reward Amount |
|:---|:---|
| Answer Accepted | 10 VIBE tokens |
| Question Bonus (when accepting answer) | 2 VIBE tokens |
| Answer Upvoted (10+ upvotes) | 5 VIBE tokens |

**Key Features:**
- Instant rewards (no waiting periods)
- Transparent on-chain transactions
- Automated through smart contracts
- No manual processing required

### 4. 📊 Question & Answer Management

**Features:**
- **Ask Questions:** Post technical questions with tags and formatting
- **Browse Questions:** View all questions with search and filter capabilities
- **Answer Questions:** Provide detailed answers with code examples
- **Vote System:** Upvote or downvote questions and answers
- **Accept Answers:** Mark the best answer as accepted
- **Edit & Delete:** Manage your own questions and answers

### 5. 👤 User Profiles

**What you can see:**
- Your wallet address and VIBE token balance
- Questions you've asked
- Answers you've provided
- Total VIBE tokens earned
- Reputation metrics
- Activity history

### 6. 🔍 Search & Discovery

**Features:**
- Search questions by keywords
- Filter by tags
- Sort by date, votes, or activity
- View trending questions
- Pagination for large result sets

---

## 🏗️ System Architecture

VibeQuorum uses a hybrid architecture that combines the speed of Web2 with the trust and transparency of Web3.

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        User[👤 User]
        Browser[🌐 Web Browser]
    end
    
    subgraph "Frontend Layer"
        NextJS[💻 Next.js 14 Frontend<br/>React + TypeScript]
        RainbowKit[🔌 RainbowKit<br/>Wallet Connection]
    end
    
    subgraph "Backend Layer"
        Express[⚙️ Express.js API<br/>Node.js + TypeScript]
        Auth[🔐 Auth Middleware<br/>Wallet Signature Verification]
        AI[🤖 AI Service<br/>Hugging Face API]
    end
    
    subgraph "Data Layer"
        MongoDB[(🍃 MongoDB<br/>Questions, Answers, Users)]
        Redis[(📦 Redis<br/>Caching & Rate Limiting)]
    end
    
    subgraph "Blockchain Layer"
        Base[⛓️ Base Sepolia<br/>Testnet]
        VibeToken[🪙 VibeToken Contract<br/>ERC20 Token]
        RewardManager[💰 RewardManager Contract<br/>Reward Distribution]
    end
    
    User --> Browser
    Browser --> NextJS
    NextJS --> RainbowKit
    NextJS --> Express
    RainbowKit --> Base
    Express --> Auth
    Express --> AI
    Express --> MongoDB
    Express --> Redis
    Express --> VibeToken
    Express --> RewardManager
    VibeToken --> Base
    RewardManager --> Base
```

### Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant RateLimiter
    participant AuthMiddleware
    participant Validation
    participant Controller
    participant Service
    participant Database
    participant Blockchain

    Client->>RateLimiter: HTTP Request
    RateLimiter->>AuthMiddleware: Check Rate Limit
    AuthMiddleware->>Validation: Verify Wallet Signature
    Validation->>Controller: Validate Input Data
    Controller->>Service: Process Business Logic
    Service->>Database: Read/Write Data
    Service->>Blockchain: Interact with Smart Contracts
    Blockchain-->>Service: Transaction Result
    Database-->>Service: Data Result
    Service-->>Controller: Processed Data
    Controller-->>Client: JSON Response
```

### Data Flow for Answer Acceptance

```mermaid
flowchart TD
    Start([User Accepts Answer]) --> Sign[Sign Message with Wallet]
    Sign --> Send[Send Request to Backend]
    Send --> Verify[Verify Signature]
    Verify --> Check{Answer Valid?}
    Check -->|No| Error[Return Error]
    Check -->|Yes| UpdateDB[Update Database]
    UpdateDB --> CallContract[Call Smart Contract]
    CallContract --> MintAnswerer[Mint 10 VIBE to Answerer]
    MintAnswerer --> MintAsker[Mint 2 VIBE to Questioner]
    MintAsker --> EmitEvent[Emit Reward Event]
    EmitEvent --> Log[Log Transaction]
    Log --> Success[Return Success]
    Error --> End([End])
    Success --> End
```

---

## 🛠️ Tech Stack & Tools

VibeQuorum is built using modern, production-grade technologies. Here's a comprehensive breakdown:

### Frontend Technologies

| Technology | Version | Purpose | Why We Chose It |
|:---|:---|:---|:---|
| **Next.js** | 14+ | React framework with App Router | High performance, server-side rendering, excellent developer experience |
| **React** | 19.2 | UI library | Component-based architecture, large ecosystem |
| **TypeScript** | 5+ | Type-safe JavaScript | Catches errors early, improves code quality |
| **TailwindCSS** | 4.1 | Utility-first CSS framework | Rapid UI development, consistent design system |
| **RainbowKit** | 2.2 | Wallet connection UI | Best-in-class wallet connection experience |
| **Wagmi** | 2.19 | React hooks for Ethereum | Type-safe blockchain interactions |
| **Viem** | 2.41 | Ethereum library | Modern, type-safe alternative to ethers.js |
| **Radix UI** | Latest | Headless UI components | Accessible, customizable components |
| **Lucide React** | Latest | Icon library | Beautiful, consistent icon set |
| **React Hook Form** | 7.60 | Form management | Performant forms with validation |
| **Zod** | 3.25 | Schema validation | Type-safe runtime validation |
| **TanStack Query** | 5.90 | Data fetching | Powerful caching and synchronization |

### Backend Technologies

| Technology | Version | Purpose | Why We Chose It |
|:---|:---|:---|:---|
| **Node.js** | 18+ | JavaScript runtime | Fast, scalable, large ecosystem |
| **Express.js** | 4.18 | Web framework | Minimal, flexible, widely used |
| **TypeScript** | 5.3 | Type-safe JavaScript | Type safety across the stack |
| **Mongoose** | 8.0 | MongoDB ODM | Schema-based modeling, validation |
| **MongoDB** | Latest | NoSQL database | Flexible schema, horizontal scaling |
| **Ethers.js** | 6.9 | Blockchain library | Interact with Ethereum/Base blockchain |
| **Winston** | 3.11 | Logging library | Structured logging, multiple transports |
| **Swagger** | Latest | API documentation | Interactive API docs |
| **Helmet** | 7.1 | Security middleware | HTTP header security |
| **Express Rate Limit** | 7.1 | Rate limiting | Protect against abuse |
| **Zod** | 3.22 | Validation | Runtime type validation |
| **Hugging Face** | Latest | AI API | Access to powerful language models |
| **OpenAI** | 6.10 | AI API (Alternative) | High-quality AI responses |
| **ioredis** | 5.3 | Redis client | Caching and rate limiting storage |

### Blockchain & Smart Contracts

| Technology | Version | Purpose | Why We Chose It |
|:---|:---|:---|:---|
| **Solidity** | 0.8.20 | Smart contract language | Industry standard, well-audited |
| **Hardhat** | 2.27 | Development environment | Best tooling, testing, deployment |
| **OpenZeppelin** | 5.4 | Security libraries | Battle-tested, secure contracts |
| **Base Sepolia** | - | Layer 2 testnet | Low fees, fast transactions, Ethereum compatibility |
| **Ethers.js** | 6.9 | Contract interaction | Comprehensive blockchain library |

### Development Tools

| Tool | Purpose |
|:---|:---|
| **Git** | Version control |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Jest** | Testing framework |
| **TypeScript** | Type checking |
| **pnpm** | Fast package manager |

---

## 💻 Getting Started

Follow these step-by-step instructions to set up VibeQuorum on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Minimum Version | How to Check |
|:---|:---|:---|
| **Node.js** | v18.0.0 | `node --version` |
| **npm** | v9.0.0 | `npm --version` |
| **pnpm** | Latest | `pnpm --version` (install: `npm install -g pnpm`) |
| **Git** | Latest | `git --version` |
| **MongoDB** | Latest | Local installation or MongoDB Atlas account |

**Optional but Recommended:**
- **MetaMask** or another Ethereum wallet browser extension
- **VS Code** or your preferred code editor
- **Postman** or **Insomnia** for API testing

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/vibequorum.git

# Navigate to the project directory
cd vibequorum
```

### Step 2: Install Dependencies

```bash
# Install root dependencies (if any)
npm install

# Install all workspace dependencies
npm run install:all
```

This will install dependencies for:
- Root workspace
- Backend (`backend/`)
- Frontend (`VibeQuorum-frontend/`)
- Smart Contracts (`contracts/`)

### Step 3: Set Up Smart Contracts

#### 3.1 Navigate to Contracts Directory

```bash
cd contracts
```

#### 3.2 Install Contract Dependencies

```bash
npm install
```

#### 3.3 Configure Environment Variables

Create a `.env` file in the `contracts/` directory:

```bash
# Copy example file (if available) or create new
touch .env
```

Add the following to `.env`:

```env
# Private key of the account that will deploy contracts
# NEVER commit this to version control!
PRIVATE_KEY=your_private_key_here

# RPC URL for Base Sepolia testnet
RPC_URL=https://sepolia.base.org

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**⚠️ Security Warning:** Never share your private key or commit it to version control. Use a test account with minimal funds.

#### 3.4 Get Testnet ETH

You'll need Base Sepolia ETH to deploy contracts:
1. Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Request testnet ETH to your wallet address
3. Wait for the transaction to confirm

#### 3.5 Compile Contracts

```bash
npm run compile
```

#### 3.6 Deploy Contracts

```bash
# Deploy to Base Sepolia testnet
npm run deploy:base-sepolia
```

**Important:** After deployment, copy the deployed contract addresses. You'll need them for the backend and frontend configuration.

Example output:
```
VibeToken deployed to: 0x1234567890123456789012345678901234567890
RewardManager deployed to: 0x0987654321098765432109876543210987654321
```

### Step 4: Set Up Backend

#### 4.1 Navigate to Backend Directory

```bash
cd ../backend
```

#### 4.2 Install Dependencies

```bash
npm install
```

#### 4.3 Configure Environment Variables

Create a `.env` file:

```bash
# Copy example file if available
cp .env.example .env

# Or create new file
touch .env
```

Add the following configuration:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Connection
# For local MongoDB: mongodb://localhost:27017/vibequorum
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/vibequorum
MONGODB_URI=your_mongodb_connection_string

# Blockchain Configuration
# Private key of the wallet that will pay for gas fees (Relayer)
# This should be a different account than your deployment account
ADMIN_PRIVATE_KEY=your_admin_private_key_here

# Contract Addresses (from Step 3.6)
VIBE_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
REWARD_MANAGER_ADDRESS=0x0987654321098765432109876543210987654321

# RPC URL
RPC_URL=https://sepolia.base.org

# AI Configuration (Optional but recommended)
# Hugging Face API Key
HUGGING_FACE_API_KEY=your_huggingface_api_key

# Or OpenAI API Key (alternative)
OPENAI_API_KEY=your_openai_api_key

# Redis Configuration (Optional, for caching)
REDIS_URL=redis://localhost:6379

# JWT Secret (for session management)
JWT_SECRET=your_random_secret_string_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### 4.4 Grant Minter Role to RewardManager

Before the backend can distribute rewards, you need to grant the `MINTER_ROLE` to the RewardManager contract:

```bash
# You can do this through Hardhat console or a script
npx hardhat console --network baseSepolia
```

Then in the console:

```javascript
const VibeToken = await ethers.getContractFactory("VibeToken");
const vibeToken = VibeToken.attach("VIBE_TOKEN_ADDRESS");
const MINTER_ROLE = await vibeToken.MINTER_ROLE();
const rewardManagerAddress = "REWARD_MANAGER_ADDRESS";
await vibeToken.grantRole(MINTER_ROLE, rewardManagerAddress);
```

#### 4.5 Start the Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The backend should now be running on `http://localhost:4000`

**Verify it's working:**
- Health check: `http://localhost:4000/health`
- API docs: `http://localhost:4000/api-docs`

### Step 5: Set Up Frontend

#### 5.1 Navigate to Frontend Directory

```bash
cd ../VibeQuorum-frontend
```

#### 5.2 Install Dependencies

```bash
pnpm install
```

#### 5.3 Configure Environment Variables

Create a `.env.local` file:

```bash
# Copy example if available
cp .env.example .env.local

# Or create new file
touch .env.local
```

Add the following:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# Contract Addresses (same as backend)
NEXT_PUBLIC_VIBE_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_REWARD_MANAGER_ADDRESS=0x0987654321098765432109876543210987654321

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# Optional: Analytics or other services
NEXT_PUBLIC_APP_NAME=VibeQuorum
```

#### 5.4 Start the Frontend Development Server

```bash
# Development mode
pnpm dev

# Or with Turbopack (faster)
pnpm dev:turbo
```

The frontend should now be running on `http://localhost:3000`

### Step 6: Connect Your Wallet

1. Open `http://localhost:3000` in your browser
2. Install MetaMask or another Web3 wallet if you haven't already
3. Switch to Base Sepolia testnet in your wallet
4. Click "Connect Wallet" in the VibeQuorum interface
5. Approve the connection request

**Note:** Make sure you have Base Sepolia testnet ETH in your wallet for transactions.

### Step 7: Verify Everything Works

1. **Backend Health:** Visit `http://localhost:4000/health` - should return `{"status":"ok"}`
2. **Frontend:** Visit `http://localhost:3000` - should show the VibeQuorum homepage
3. **Wallet Connection:** Click "Connect Wallet" - should connect successfully
4. **API Docs:** Visit `http://localhost:4000/api-docs` - should show Swagger UI

---

## 📱 How to Use the Application

This section explains how to use VibeQuorum as an end user.

### Getting Started as a User

#### 1. Connect Your Wallet

**Step-by-step:**
1. Open the VibeQuorum application in your browser
2. Click the "Connect Wallet" button in the top right corner
3. Select your wallet provider (MetaMask, Rainbow, Coinbase Wallet, etc.)
4. Approve the connection request in your wallet
5. Sign the authentication message when prompted

**What happens:**
- Your wallet address becomes your identity
- Your profile is automatically created (if first time)
- You can now ask questions, answer questions, and earn rewards

#### 2. Ask a Question

**How to ask a question:**
1. Click the "Ask" button in the navigation menu
2. Enter a clear, descriptive title for your question
3. Write a detailed description of your problem
   - Include code examples if relevant
   - Explain what you've already tried
   - Specify what you're trying to achieve
4. Add relevant tags (e.g., `solidity`, `web3`, `react`, `nextjs`)
5. Click "Post Question"

**Tips for good questions:**
- Be specific and clear
- Include code snippets when relevant
- Explain your use case
- Use proper formatting (markdown supported)

#### 3. Answer a Question

**How to answer:**
1. Browse questions from the home page or questions page
2. Click on a question to view details
3. Scroll to the "Answers" section
4. Click "Write Answer" or "Answer This Question"
5. Write your answer with:
   - Clear explanation
   - Code examples if applicable
   - Step-by-step instructions if needed
   - Links to relevant resources

**Using AI Draft (Optional):**
1. While writing your answer, click the "Generate AI Draft" button
2. Wait a few seconds for the AI to analyze the question
3. Review the generated draft
4. Edit and refine the draft with your expertise
5. Submit your answer

**Tips for good answers:**
- Be thorough and helpful
- Include code examples
- Explain the "why" not just the "how"
- Format your answer properly
- Be respectful and professional

#### 4. Accept an Answer

**How to accept an answer:**
1. Go to your question page
2. Review all the answers provided
3. Click the "Accept Answer" button on the best answer
4. Sign the message in your wallet to confirm
5. Wait for the transaction to confirm

**What happens:**
- The answerer receives **10 VIBE tokens** instantly
- You receive **2 VIBE tokens** as a bonus
- The answer is marked as "Accepted"
- The transaction is recorded on the blockchain

#### 5. Vote on Questions and Answers

**How to vote:**
1. Find a question or answer you find helpful
2. Click the upvote (↑) button to show appreciation
3. Click the downvote (↓) button if content is poor quality

**Benefits of voting:**
- Helps surface the best content
- Answers with 10+ upvotes may receive additional rewards
- Builds community reputation

#### 6. View Your Profile

**Access your profile:**
1. Click "Profile" in the navigation menu
2. View your statistics:
   - Total VIBE tokens earned
   - Questions asked
   - Answers provided
   - Votes received
   - Activity history

**Profile features:**
- See all your questions and answers
- Track your earnings
- View your reputation metrics
- Edit your profile information (if available)

### Navigation Guide

#### Main Navigation

| Menu Item | Purpose | Location |
|:---|:---|:---|
| **Home** | View trending questions and platform overview | Top navigation |
| **Questions** | Browse all questions | Top navigation |
| **Ask** | Post a new question | Top navigation |
| **Profile** | View your profile and activity | Top navigation |
| **Admin** | Admin dashboard (admin only) | Top navigation (if admin) |

#### Key Pages

**Home Page (`/`):**
- Hero section with platform introduction
- Trending questions
- Features overview
- How it works section
- Statistics

**Questions Page (`/questions`):**
- List of all questions
- Search functionality
- Filter by tags
- Sort options
- Pagination

**Question Detail Page (`/questions/[id]`):**
- Full question details
- All answers
- Answer submission form
- Voting buttons
- Accept answer button (for question owner)

**Ask Page (`/ask`):**
- Question form
- Title input
- Description editor
- Tag selector
- Preview option

**Profile Page (`/profile`):**
- User statistics
- Questions list
- Answers list
- VIBE token balance
- Activity timeline

### Common Tasks

#### Searching for Questions

1. Go to the Questions page
2. Use the search bar at the top
3. Enter keywords related to your query
4. Results update in real-time
5. Use filters to narrow down results

#### Filtering Questions

1. On the Questions page, use the filter options:
   - **Tags:** Filter by specific tags
   - **Sort:** Sort by date, votes, or activity
   - **Status:** Filter by answered/unanswered

#### Editing Your Content

1. Go to your question or answer
2. Click the "Edit" button (only visible on your own content)
3. Make your changes
4. Click "Save Changes"

#### Deleting Your Content

1. Go to your question or answer
2. Click the "Delete" button (only visible on your own content)
3. Confirm the deletion
4. Content is permanently removed

---

## 📚 API Documentation

The backend exposes a RESTful API for client interaction. All endpoints return JSON responses.

### Base URL

```
Development: http://localhost:4000
Production: https://api.vibequorum.com
```

### Authentication

Most endpoints require wallet-based authentication:

1. User signs a message with their wallet
2. Frontend sends the signature with the request
3. Backend verifies the signature
4. Request is processed if valid

**Headers:**
```
Authorization: Bearer <signature>
X-Wallet-Address: <wallet_address>
```

### API Endpoints

#### Authentication Endpoints

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/auth/connect` | Public | Connect wallet and authenticate |
| `GET` | `/api/auth/me` | Auth Required | Get current user profile |
| `PUT` | `/api/auth/profile` | Auth Required | Update user profile |

**Example: Connect Wallet**
```bash
POST /api/auth/connect
Content-Type: application/json

{
  "address": "0x1234...",
  "signature": "0xabcd...",
  "message": "Sign in to VibeQuorum..."
}
```

#### Question Endpoints

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/questions` | Public | List all questions (supports pagination & search) |
| `GET` | `/api/questions/:id` | Public | Get a specific question |
| `POST` | `/api/questions` | Auth Required | Create a new question |
| `PUT` | `/api/questions/:id` | Owner Only | Update a question |
| `DELETE` | `/api/questions/:id` | Owner Only | Delete a question |
| `POST` | `/api/questions/:id/accept/:answerId` | Owner Only | Accept an answer and trigger reward |

**Example: Create Question**
```bash
POST /api/questions
Authorization: Bearer <signature>
Content-Type: application/json

{
  "title": "How to deploy a smart contract?",
  "content": "I'm new to Solidity and want to deploy my first contract...",
  "tags": ["solidity", "web3", "deployment"]
}
```

**Example: List Questions**
```bash
GET /api/questions?page=1&limit=10&search=solidity&tags=web3
```

#### Answer Endpoints

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/questions/:questionId/answers` | Public | Get all answers for a question |
| `GET` | `/api/answers/:id` | Public | Get a specific answer |
| `POST` | `/api/questions/:questionId/answers` | Auth Required | Post an answer to a question |
| `PUT` | `/api/answers/:id` | Owner Only | Update an answer |
| `DELETE` | `/api/answers/:id` | Owner Only | Delete an answer |

**Example: Post Answer**
```bash
POST /api/questions/123/answers
Authorization: Bearer <signature>
Content-Type: application/json

{
  "content": "Here's how to deploy your contract:\n1. Compile it...\n2. Deploy using Hardhat..."
}
```

#### Voting Endpoints

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/questions/:id/vote` | Auth Required | Vote on a question (upvote/downvote) |
| `POST` | `/api/answers/:id/vote` | Auth Required | Vote on an answer (upvote/downvote) |
| `DELETE` | `/api/votes/:type/:id` | Auth Required | Remove your vote |

**Example: Vote on Answer**
```bash
POST /api/answers/456/vote
Authorization: Bearer <signature>
Content-Type: application/json

{
  "type": "upvote"  // or "downvote"
}
```

#### AI Endpoints

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/questions/:id/ai-draft` | Auth Required | Generate an AI draft for an answer |
| `GET` | `/api/ai/stats` | Admin Only | Get AI usage statistics |

**Example: Generate AI Draft**
```bash
POST /api/questions/123/ai-draft
Authorization: Bearer <signature>
Content-Type: application/json

{
  "questionId": "123"
}
```

**Response:**
```json
{
  "draft": "Based on the question, here's a suggested answer:\n\n```solidity\n// Your code here\n```\n\nThis solution works because...",
  "model": "huggingface/meta-llama",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Reward Endpoints

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/rewards/balance` | Auth Required | Get user's VIBE token balance |
| `GET` | `/api/rewards/history` | Auth Required | Get reward transaction history |
| `POST` | `/api/rewards/trigger` | Admin Only | Manually trigger a reward (for testing) |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Status Codes

| Code | Meaning |
|:---|:---|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `429` | Too Many Requests (Rate Limited) |
| `500` | Internal Server Error |

### Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Public endpoints:** 100 requests per 15 minutes per IP
- **Authenticated endpoints:** 200 requests per 15 minutes per user
- **AI endpoints:** 10 requests per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 150
X-RateLimit-Reset: 1642234567
```

### Interactive API Documentation

Once the backend is running, visit:
- **Swagger UI:** `http://localhost:4000/api-docs`
- **Health Check:** `http://localhost:4000/health`

---

## 🔗 Smart Contracts

VibeQuorum uses two main smart contracts deployed on Base Sepolia testnet.

### Contract Overview

| Contract | Purpose | Key Features |
|:---|:---|:---|
| **VibeToken** | ERC20 token for rewards | Mintable, burnable, pausable, role-based access |
| **RewardManager** | Reward distribution system | Automated rewards, double-spend prevention, rate limiting |

### VibeToken Contract

**Contract Type:** ERC20 Token

**Key Features:**
- ✅ **Role-based Access Control:** Admin, Minter, and Pauser roles
- ✅ **Pausable:** Can pause transfers in emergency situations
- ✅ **Burnable:** Tokens can be burned for deflationary mechanics
- ✅ **ERC20Permit:** Gasless approvals using EIP-2612
- ✅ **Supply Cap:** Maximum 100 million tokens
- ✅ **Rate Limiting:** Cooldown periods between mints
- ✅ **Reentrancy Protection:** Protection against reentrancy attacks

**Token Details:**

| Parameter | Value |
|:---|:---|
| Name | VibeToken |
| Symbol | VIBE |
| Decimals | 18 |
| Max Supply | 100,000,000 VIBE |
| Initial Supply | 0 (all tokens minted on-demand) |

**Security Features:**

| Feature | Description |
|:---|:---|
| `MAX_SUPPLY` | Hard cap of 100 million tokens |
| `MAX_MINT_PER_TX` | Maximum 10,000 tokens per transaction |
| `MINT_COOLDOWN` | 1 hour cooldown between mints to same address |
| Role Separation | Distinct Admin, Minter, and Pauser roles |
| Pausable | Emergency pause functionality |
| Reentrancy Guard | Protection against reentrancy attacks |

### RewardManager Contract

**Contract Type:** Reward Distribution System

**Key Features:**
- ✅ **Multi-role Access:** Admin, Rewarder, and Oracle roles
- ✅ **Double-reward Prevention:** Each answer can only be rewarded once
- ✅ **Daily Reward Caps:** Configurable maximum daily rewards per user
- ✅ **Cooldown Periods:** Minimum time between rewards (default: 5 minutes)
- ✅ **Configurable Amounts:** Min 1 VIBE, Max 1000 VIBE per reward
- ✅ **Batch Processing:** Process multiple rewards in one transaction
- ✅ **Event Logging:** Comprehensive event logging for transparency

**Reward Configuration:**

| Parameter | Default Value | Description |
|:---|:---|:---|
| Accepted Answer Reward | 10 VIBE | Reward for accepted answer |
| Questioner Bonus | 2 VIBE | Bonus for question asker |
| Upvote Threshold Reward | 5 VIBE | Reward for answers with 10+ upvotes |
| Max Daily Per User | 500 VIBE | Maximum daily rewards per user |
| Cooldown Period | 5 minutes | Minimum time between rewards |

**Security Features:**

| Feature | Description |
|:---|:---|
| Double-reward Prevention | Each answer ID can only be rewarded once |
| Daily Limits | Configurable max daily rewards per user |
| Cooldown Periods | Minimum time between rewards (default: 5 min) |
| Amount Bounds | Min 1 VIBE, Max 1000 VIBE per reward |
| Batch Size Limits | Maximum 50 rewards per batch |
| Role Separation | Distinct Admin and Rewarder roles |

### Contract Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant Backend
    participant RewardManager
    participant VibeToken
    participant Blockchain

    User->>Backend: Accept Answer
    Backend->>RewardManager: rewardAcceptedAnswer(answerer, answerId, questionId)
    RewardManager->>RewardManager: Validate (check cooldown, limits, etc.)
    RewardManager->>VibeToken: mint(answerer, 10 VIBE)
    VibeToken->>Blockchain: Mint tokens
    RewardManager->>VibeToken: mint(questioner, 2 VIBE)
    VibeToken->>Blockchain: Mint tokens
    RewardManager->>Blockchain: Emit RewardDistributed event
    Blockchain-->>Backend: Transaction confirmed
    Backend-->>User: Success response
```

### Contract Deployment

**Deployment Steps:**

1. **Compile Contracts:**
   ```bash
   cd contracts
   npm run compile
   ```

2. **Deploy VibeToken:**
   ```bash
   npm run deploy:base-sepolia
   ```

3. **Deploy RewardManager:**
   ```bash
   # RewardManager is deployed after VibeToken
   # Update deployment script with VibeToken address
   npm run deploy:base-sepolia
   ```

4. **Grant Roles:**
   ```bash
   # Grant MINTER_ROLE to RewardManager
   # This allows RewardManager to mint VIBE tokens
   ```

5. **Verify Contracts:**
   ```bash
   npm run verify:base-sepolia
   ```

### Contract Addresses

After deployment, update these addresses in:
- Backend `.env` file
- Frontend `.env.local` file

**Example:**
```env
VIBE_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
REWARD_MANAGER_ADDRESS=0x0987654321098765432109876543210987654321
```

### Contract Testing

Run the test suite:

```bash
cd contracts
npm test
```

Run with gas reporting:

```bash
REPORT_GAS=true npm test
```

---

## 📁 Project Structure

VibeQuorum is organized as a monorepo with three main workspaces.

### Monorepo Structure

```
vibequorum/
├── backend/                 # Backend API server
├── VibeQuorum-frontend/    # Next.js frontend application
├── contracts/              # Smart contracts
├── package.json           # Root workspace configuration
├── LICENSE                 # MIT License
└── README.md              # This file
```

### Backend Structure

```
backend/
├── src/
│   ├── config/            # Configuration files
│   │   ├── database.ts    # MongoDB connection
│   │   ├── blockchain.ts  # Ethers.js setup
│   │   ├── ai.ts          # AI service config
│   │   └── swagger.ts     # API documentation
│   ├── models/            # MongoDB models
│   │   ├── User.ts
│   │   ├── Question.ts
│   │   ├── Answer.ts
│   │   ├── Vote.ts
│   │   ├── AIPromptLog.ts
│   │   └── RewardLog.ts
│   ├── routes/            # Express routes
│   │   ├── auth.routes.ts
│   │   ├── question.routes.ts
│   │   ├── answer.routes.ts
│   │   ├── vote.routes.ts
│   │   ├── ai.routes.ts
│   │   └── reward.routes.ts
│   ├── controllers/       # Route controllers
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── ai_logs/               # AI prompt logs
├── logs/                  # Application logs
├── tests/                 # Test files
├── package.json
├── tsconfig.json
└── .env                   # Environment variables
```

### Frontend Structure

```
VibeQuorum-frontend/
├── app/                   # Next.js App Router
│   ├── page.tsx          # Home page
│   ├── questions/        # Questions pages
│   ├── ask/              # Ask question page
│   ├── profile/          # User profile page
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── question-card.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── use-wallet.ts
│   └── use-contracts.ts
├── lib/                   # Utility libraries
├── public/                # Static assets
├── styles/                # Global styles
├── package.json
├── next.config.mjs
└── .env.local             # Environment variables
```

### Contracts Structure

```
contracts/
├── contracts/             # Solidity contracts
│   ├── VibeToken.sol
│   └── RewardManager.sol
├── scripts/               # Deployment scripts
│   ├── deploy.js
│   └── verify.js
├── test/                  # Contract tests
│   ├── VibeToken.test.js
│   └── RewardManager.test.js
├── hardhat.config.js      # Hardhat configuration
├── package.json
└── .env                   # Environment variables
```

---

## 🔐 Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vibequorum
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibequorum

# Blockchain Configuration
ADMIN_PRIVATE_KEY=your_admin_private_key_here
VIBE_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
REWARD_MANAGER_ADDRESS=0x0987654321098765432109876543210987654321
RPC_URL=https://sepolia.base.org

# AI Configuration (Optional)
HUGGING_FACE_API_KEY=your_huggingface_api_key
OPENAI_API_KEY=your_openai_api_key

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_random_secret_string_here
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env.local` file in the `VibeQuorum-frontend/` directory:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000

# Contract Addresses
NEXT_PUBLIC_VIBE_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_REWARD_MANAGER_ADDRESS=0x0987654321098765432109876543210987654321

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# App Configuration
NEXT_PUBLIC_APP_NAME=VibeQuorum
```

### Contracts Environment Variables

Create a `.env` file in the `contracts/` directory:

```env
# Deployment Account
PRIVATE_KEY=your_private_key_here

# RPC URL
RPC_URL=https://sepolia.base.org

# Optional: Contract Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**⚠️ Security Notes:**
- Never commit `.env` files to version control
- Use different accounts for deployment and admin operations
- Keep private keys secure and never share them
- Use environment-specific values for production

---

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Frontend Testing

```bash
cd VibeQuorum-frontend

# Run tests (if configured)
npm test

# Run linting
npm run lint
```

### Contract Testing

```bash
cd contracts

# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test file
npx hardhat test test/VibeToken.test.js
```

### Manual Testing Checklist

**Backend:**
- [ ] Health endpoint returns 200
- [ ] API documentation loads correctly
- [ ] Authentication works
- [ ] Questions CRUD operations work
- [ ] Answers CRUD operations work
- [ ] Voting works
- [ ] AI draft generation works
- [ ] Reward distribution works

**Frontend:**
- [ ] Home page loads
- [ ] Wallet connection works
- [ ] Questions page loads and filters work
- [ ] Ask question form works
- [ ] Answer submission works
- [ ] Voting works
- [ ] Profile page displays correctly

**Smart Contracts:**
- [ ] Contracts compile without errors
- [ ] All tests pass
- [ ] Deployment succeeds
- [ ] Role granting works
- [ ] Reward distribution works
- [ ] Security features function correctly

---

## 🚀 Deployment

### Backend Deployment

**Using PM2 (Recommended):**

```bash
cd backend
npm run build
pm2 start dist/server.js --name vibequorum-backend
pm2 save
```

**Using Docker:**

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

### Frontend Deployment

**Vercel (Recommended for Next.js):**

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

**Manual Build:**

```bash
cd VibeQuorum-frontend
pnpm build
pnpm start
```

### Smart Contracts Deployment

**Production Deployment:**

1. Update `.env` with production RPC URL
2. Ensure sufficient ETH for gas fees
3. Deploy contracts:
   ```bash
   npm run deploy:base-sepolia
   ```
4. Verify contracts on block explorer
5. Update backend and frontend with new addresses

---

## 🔒 Security Features

### Backend Security

| Feature | Description |
|:---|:---|
| **Wallet Signature Verification** | All authenticated requests verify wallet signatures |
| **Rate Limiting** | Prevents abuse with configurable limits |
| **Input Validation** | All inputs validated using Zod schemas |
| **CORS Configuration** | Restricts API access to authorized origins |
| **Helmet Security Headers** | Adds security headers to responses |
| **Environment Variables** | Sensitive data stored in environment variables |
| **Error Handling** | Errors don't expose sensitive information |

### Frontend Security

| Feature | Description |
|:---|:---|
| **Wallet Connection** | Secure wallet connection via RainbowKit |
| **Input Sanitization** | User inputs sanitized before submission |
| **HTTPS Only** | Production uses HTTPS only |
| **Environment Variables** | Sensitive config in environment variables |

### Smart Contract Security

| Feature | Description |
|:---|:---|
| **Role-Based Access Control** | Separate roles for different functions |
| **Reentrancy Protection** | Guards against reentrancy attacks |
| **Input Validation** | All inputs validated in contracts |
| **Rate Limiting** | Cooldown periods prevent abuse |
| **Supply Caps** | Maximum token supply enforced |
| **Pausable** | Emergency pause functionality |
| **OpenZeppelin Libraries** | Battle-tested security libraries |

### Best Practices

1. **Never commit private keys or secrets**
2. **Use different accounts for different purposes**
3. **Regularly update dependencies**
4. **Monitor for suspicious activity**
5. **Keep contracts audited before mainnet deployment**
6. **Use multi-signature wallets for admin operations**

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/vibequorum.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Write clean, well-documented code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit Your Changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```

5. **Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Wait for review and feedback

### Contribution Guidelines

- **Code Style:** Follow existing code style and use Prettier
- **Testing:** Add tests for new features
- **Documentation:** Update README and code comments
- **Commits:** Write clear, descriptive commit messages
- **Issues:** Check existing issues before creating new ones

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX improvements
- 🔒 Security enhancements
- ⚡ Performance optimizations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**MIT License Summary:**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No liability
- ❌ No warranty

---

## 📞 Support & Contact

### Getting Help

- **Documentation:** Check this README and other docs in the repository
- **Issues:** Open an issue on GitHub for bugs or feature requests
- **Discussions:** Use GitHub Discussions for questions

### Useful Links

- **GitHub Repository:** [https://github.com/yourusername/vibequorum](https://github.com/yourusername/vibequorum)
- **API Documentation:** `http://localhost:4000/api-docs` (when running locally)
- **Base Sepolia Explorer:** [https://sepolia.basescan.org](https://sepolia.basescan.org)

### Reporting Issues

When reporting issues, please include:
- Description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots (if applicable)

---

## 🎉 Acknowledgments

- Built for the **Base Hackathon 2025**
- Inspired by Stack Overflow and other Q&A platforms
- Powered by the Base blockchain
- Community-driven development

---

> **Let's Vibe.** 🟣

**Built with ❤️ by the VibeQuorum Team**

---

*Last Updated: January 2025*
