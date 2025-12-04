
VibeQuorum — Architecture, System Design and User Flows
Below is a complete, standard, and production-aware architectural design and user flow for VibeQuorum. It covers the full stack, data model, API contracts, smart contract interfaces, sequence flows for user journeys, security and operational concerns, testing and CI, deployment suggestions, scaling, monitoring and developer workflow. Use this as a blueprint to implement the MVP and to scale the product afterwards.

1. High level system components
Client (Web App)
 • React single page application.
 • Wallet integration library (ethers.js or web3.js).
 • UI components: questions, answers, profile, AI assistant modal, token balance.


Backend API
 • Node.js + Express or Fastify.
 • Exposes REST or GraphQL endpoints.
 • Handles authentication by wallet address, AI calls, business logic, database access.


Database
 • MongoDB Atlas (document store) for Q and A, users, votes, AI logs, metadata.
 • Redis for ephemeral caches, rate limiting, sessions and queues.


Smart Contracts
 • VibeToken (ERC20 mintable).
 • RewardManager (optional) to manage reward rules and safe minting operations.
 • Contracts deployed on an EVM testnet for hackathon, mainnet later.


AI Provider
 • OpenAI or equivalent.
 • All calls originate from backend. Prompt history logged to ai_logs.


Off-chain services and infrastructure
 • Object store for demo video and attachments (S3 or equivalent).
 • CI/CD platforms (GitHub Actions).
 • Monitoring and logging (Sentry, Prometheus + Grafana, LogDNA).
 • Block explorer links and transaction monitoring for rewards.


Administration / Platform Wallet
 • Admin wallet for minting or a server-side service authorised to call reward functions.
 • Multisig recommended for production.



2. Logical architecture (textual diagram)
Client (React, ethers)
 ↕ (HTTPS / WebSocket)
 Backend API (Node/Express)
 ↕ (DB queries)
 MongoDB Atlas (Questions, Answers, Users, AI Logs)
 ↕
 Redis (caching, rate limits, queues)
 ↕
 AI Provider (OpenAI) Backend logs prompts to ai_logs/prompts.md and to DB
 ↕
 Smart Contracts (VibeToken, RewardManager) on EVM testnet
 ↕
 Block explorer, MetaMask for user wallets

3. Deployment architecture and components
• Frontend: Vercel or Netlify.
 • Backend: Render, Railway or Heroku, or a container on AWS ECS / DigitalOcean App Platform.
 • Database: MongoDB Atlas (multi-region optional).
 • Redis: Managed Redis (Upstash, Redis Enterprise, or AWS Elasticache).
 • Smart contract deployments: Hardhat scripts. Store ABIs in backend and frontend config.
 • Secrets: store OpenAI API key, admin wallet private key, DB credentials in secrets manager or platform env vars. Never commit keys.
 • CDN: serve static assets and demo video via CDN.
 • Monitoring: Sentry for errors, Prometheus/Grafana for metrics, and Etherscan for on-chain transactions.

4. Data model (detailed)
User
walletAddress: string (primary key)


displayName: string


avatarUrl: string


createdAt: ISODate


reputation: number


tokenBalanceCached: number


profileBio: string


Question
_id: ObjectId


author: walletAddress


title: string


description: string (markdown)


tags: [string]


createdAt: ISODate


updatedAt: ISODate


acceptedAnswerId: ObjectId | null


votesCount: number


aiDraftId: ObjectId | null


status: enum (open, answered, closed)


Answer
_id: ObjectId


questionId: ObjectId


author: walletAddress


content: string (markdown)


createdAt: ISODate


updatedAt: ISODate


upvotes: number


downvotes: number


aiGenerated: boolean


txHashes: [string] (on-chain reward txs)


Vote
_id: ObjectId


targetType: enum (question, answer)


targetId: ObjectId


voter: walletAddress


value: int (1 or -1)


createdAt: ISODate


AI Prompt Log
_id: ObjectId


questionId: ObjectId


promptText: string


model: string


responseText: string


costEstimate: number (optional)


createdAt: ISODate


commitHash: string (optional, link to commit showing AI-assisted code)


Audit / Reward Log
_id: ObjectId


answerId: ObjectId


rewardAmount: number


rewardedBy: string (admin wallet)


txHash: string


createdAt: ISODate



5. API contract examples (selected)
All endpoints require the client to include walletAddress and a signed message when appropriate. For MVP we can accept walletAddress with client signature verification optional, but for security sign messages.
POST /api/auth/connect
 Request


{ "walletAddress": "0x...", "signature": "0x..." }

Response
{ "status": "ok", "user": { "walletAddress": "...", "displayName": "..." } }

GET /api/questions?page=1&tag=solidity
 Response


{ "items": [ { question fields } ], "page": 1, "total": 123 }

POST /api/questions
 Request


{ "title": "Why does my ERC20 revert on transfer?", "description": "Code snippet...", "tags": ["solidity","erc20"] }

Response
{ "id": "642f...", "createdAt": "2025-..." }

POST /api/questions/:id/ai-draft
 Request


{ "walletAddress": "0x...", "options": { "maxTokens": 512 } }

Response
{ "draft": "Suggested answer text", "logId": "..." }

POST /api/questions/:id/answers
 Request


{ "walletAddress":"0x...", "content":"Final or edited content", "aiGenerated": true }

Response
{ "answerId": "..." }

POST /api/answers/:id/upvote
 Request


{ "walletAddress":"0x..." }

Response
{ "status":"ok", "newUpvotes": 6 }

POST /api/rewards/trigger
 Request (admin)


{ "answerId":"...", "amount": 50, "adminSignature": "..." }

Response
{ "txHash":"0x...", "status":"submitted" }

Design note: Admin-signed reward calls can be executed server-side. Alternative is to require on-chain governance or multi-sig; for MVP admin wallet triggers are acceptable with clear security notes.

6. Smart contract design (interfaces)
VibeToken.sol (simplified)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VibeToken is ERC20, Ownable {
    constructor() ERC20("VibeToken", "VIBE") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

RewardManager.sol (optional)
pragma solidity ^0.8.0;

import "./VibeToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardManager is Ownable {
    VibeToken public token;
    uint256 public acceptReward;
    uint256 public upvoteReward;

    event AnswerRewarded(address indexed to, uint256 amount, uint256 indexed answerId);

    constructor(address tokenAddress) {
        token = VibeToken(tokenAddress);
        acceptReward = 50 * 10**18;
        upvoteReward = 5 * 10**18;
    }

    function setRewards(uint256 _accept, uint256 _upvote) external onlyOwner {
        acceptReward = _accept;
        upvoteReward = _upvote;
    }

    function reward(address to, uint256 amount, uint256 answerId) external onlyOwner {
        token.mint(to, amount);
        emit AnswerRewarded(to, amount, answerId);
    }
}

Security note: onlyOwner is used for simplicity. For production use multisig or DAO governance.

7. Core user flows (sequence diagrams described)
Flow A. Onboard and connect wallet
User opens site, clicks Connect Wallet.


Frontend invokes wallet provider and requests connection.


On success frontend shows wallet address and fetches profile from backend GET /api/auth/connect.


Backend returns profile or creates one.


Flow B. Post question, request AI draft, submit final answer
User posts question via POST /api/questions. Backend stores question.


User clicks "AI Draft". Frontend posts to /api/questions/:id/ai-draft.


Backend builds prompt (includes question text, top answers if any). It calls AI provider.


AI returns suggested draft. Backend logs prompt and response in ai_logs and DB.


Frontend shows draft in editor. User edits then posts as answer via POST /api/questions/:id/answers.


Answer stored. If aiGenerated flag true, indicate on UI.


Flow C. Voting, acceptance and reward
Community members upvote answers via POST /api/answers/:id/upvote. Backend records vote and increments counters.


When thresholds are met or the asker marks an answer accepted, frontend calls admin reward workflow: POST /api/rewards/trigger (admin only).


Backend verifies criteria, signs transaction or uses admin wallet to call RewardManager.reward(answerer, amount, answerId).


Transaction mined on testnet. Backend stores txHash in answer.txHashes and emits websocket event to clients.


Frontend listens to websocket or polls and updates user token balance and shows transaction link.


Flow D. Reputation and profile
Each on-chain reward increments reputation server-side and optionally caches token balance.


Profile pages show reputation, token balance, and past contributions.



8. Frontend architecture and key components
• Tech stack: React, Next.js optional, TypeScript recommended, Tailwind CSS for rapid styling.
 • Components:
Layout, Header with Connect Wallet button and token balance.


QuestionList and QuestionCard.


QuestionView with answers list, AI draft modal, editor (Markdown).


AnswerEditor (accepts AI draft).


Profile page.


Admin panel for reward triggers and metrics.


• State management: React Query or SWR for server state, local state for editors.
 • Web3 hooks: custom hooks for wallet connection, contract read, and transaction sending.
 • Websocket: socket.io or Pusher for real-time updates on votes and minted tokens.

9. Backend architecture and responsibilities
• Tech stack: Node.js, Express, TypeScript recommended.
 • Responsibilities:
Authentication and user management by wallet address.


CRUD for questions and answers.


AI integration endpoint: compose prompt, call AI, log prompt and response.


Reward orchestration: validate criteria, call contract via admin wallet, record txHash.


Rate limiting and abuse detection.


Expose health, metrics endpoints for monitoring.


• Background tasks: queue worker (BullMQ) to handle batched reward distribution and to retry failed transactions. Use Redis for queues.

10. AI integration details and prompt logging
• All AI calls are made from backend to protect keys.
 • Prompt construction: include question text, top existing answers and a short instruction like "Generate a concise technical answer focusing on correctness, include code example if applicable, and mark caveats."
 • Log all prompts and responses in the ai_logs folder and in DB. Store model name and token usage estimate.
 • Commit practice: when AI is used to generate code or text that is added to repo, include commit messages such as "AI-assisted: initial answer UI (commit <hash>)".
 • Rate limit AI endpoints per IP and per wallet to control costs.
Example prompt template (backend)
You are an expert Solidity developer. Given the question below, produce a clear, concise, correct technical answer. If code is needed, provide a small example. Mark any assumptions.

Question:
<question text>

Context:
<top answers or tags>


11. Security considerations
• Never store private keys in source code. Use environment variables and secret managers.
 • Do not expose OpenAI keys in frontend. All AI calls server-side.
 • Validate and sanitize all markdown and user inputs to prevent XSS. Use a safe markdown renderer like Marked + DOMPurify or react-markdown with sanitisation.
 • Verify wallet identity where necessary using signed messages to prove ownership. For hackathon MVP this can be relaxed, but document limitations.
 • Admin actions must be gated. Protect /api/rewards/trigger with admin auth, rate limits and IP allowlists. Use a private admin key or multisig for critical operations.
 • Implement replay and idempotency checks for reward transactions to avoid double minting. Record a unique reward request id and mark processed.

12. Testing strategy
Unit tests
 • Backend: Jest or Mocha with coverage for core endpoints. Mock AI provider responses.
 • Contracts: Hardhat with Mocha/Chai. Test minting, onlyOwner restrictions and RewardManager logic.
 • Frontend: Unit tests for key components and utility functions, using React Testing Library.
Integration tests
 • API integration tests with a test database.
 • E2E tests: Cypress script to cover connect wallet, post question, request AI draft, add answer, upvote and acceptance flow.
Load and security testing
 • Run basic load tests on the backend endpoints that will be hit frequently (questions list, fetch question).
 • Run dependency vulnerability scans and Snyk.
Test data and mocks
 • Mock AI responses for unit tests to allow offline runs and CI pipeline.

13. CI / CD pipeline
• GitHub Actions workflow:
On push to main: run lint, unit tests, contract tests, build frontend, run basic e2e smoke tests.


On successful main build: deploy backend to staging, frontend to preview.
 • Release workflow: manual approval to deploy contracts and backend to demo environment.
 • Tagging: Tag releases with semantic versions. Keep deployment scripts for Hardhat.



14. Observability and monitoring
• Logging: structured logs, include request ids and wallet addresses. Use a central log aggregator.
 • Errors: Sentry for exception tracking both frontend and backend.
 • Metrics: record API latencies, AI call counts, token mint events. Use Prometheus + Grafana dashboards.
 • Alerts: set alerts for failed reward txs, high AI cost, or backend errors.

15. Rate limits and cost control
• AI usage: set quota per wallet and global daily cap. Charge AI usage against a dev budget.
 • API: rate limit write actions like AI draft and answers creation to prevent abuse. Use Redis or platform rate limiting.
 • Monitoring: track token usage from AI provider and alert when thresholds are reached.

16. Scalability and future-proofing
Short term
 • Cache questions list and hot questions in Redis.
 • Use pagination and indexes in MongoDB for tags and search.
 • Batch reward operations using a queue system to avoid many small on-chain transactions.
Medium term
 • Move heavy compute tasks to serverless functions or background workers.
 • Introduce read replicas for DB if read scale grows.
 • Consider migrating to a managed GraphQL layer for rich queries.
Long term
 • Consider on-chain reputation or identity solutions (e.g. POAPs, Soulbound tokens) to link reputation with wallets.
 • DAO governance for reward rules and token distribution.
 • Integrate L2 or gasless tx solutions for improved UX with gas abstractions.

17. Operational runbook (critical flows)
Reward failure
Detect failed tx via receipt or webhook.


Retry logic via queue with exponential backoff.


If final retry fails, notify admin and set answer record to manual review state.


Abuse detection
Monitor abnormal upvote patterns and flag accounts for review.


Temporarily suspend suspicious wallets pending manual review.


AI cost overrun
Rate limit AI calls and disable AI feature in emergency.


Send alerts to team and pause new requests.



18. UX / UI flow step by step (for product and demo script)
Landing page: pitch, Connect Wallet CTA, featured questions.


Connect Wallet flow: MetaMask popup, display wallet and token balance.


Ask a question: modal or page with title, description, tags and submit. Confirmation shows question page.


AI Draft: button on question page that opens an AI modal. Click to request draft, display result, allow edit and convert to answer.


Post answer: submit answer, it appears under question. Mark aiGenerated badge if relevant.


Voting: upvote icons update vote counts. Real-time updates via websocket.


Accept answer: asker clicks Accept. Admin reward flow triggers the mint. Show txHash link and update balance.


Profile page: list contributions, token history and reputation.


Admin panel: view pending rewards, transaction history and health metrics.



19. Logging, provenance and hackathon submission requirements
• Store ai_logs/prompts.md in repository and append each prompt and AI response. Include a small header with the date and commit hash.
 • Ensure commits show AI-assisted steps. Example commit messages: "AI-assisted: generated answer editor component", "AI-assisted tests for reward flow".
 • Provide DEPLOY.md and TIP.md with step-by-step instructions for judges to reproduce the demo, including testnet settings and demo wallet addresses if needed.
Example prompts.md entry
2025-11-24T10:00Z
Model: gpt-4
QuestionId: 642f...
Prompt:
You are an expert Solidity developer... (full prompt)
Response:
(Truncated response)
Commit: abc123 (frontend/src/components/AnswerEditor.tsx)


20. Security checklist for repo and deployment
• .gitignore includes .env and private keys.
 • Add .env.example with placeholders.
 • Use GitHub branch protection.
 • Scan dependencies and run npm audit in CI.
 • Rotate admin keys post demo if using private key in dev.
 • Use HTTPS everywhere.

21. Team roles and responsibilities (recommended)
• Team lead / Product owner: coordinates tasks, ensures submission completeness.
 • Frontend developer: React UI and wallet integration.
 • Backend developer: API, AI integration, reward orchestration.
 • Smart contract engineer: Solidity contracts, Hardhat tests, deployment scripts.
 • Designer / Demo lead: UI polish and demo video.
 • QA / Devops: tests, CI/CD and monitoring.

22. Acceptance criteria for hackathon submission
• Public GitHub repo with code and ai_logs/prompts.md.
 • Working demo deployed with instructions for how to reproduce token mint.
 • Smart contract code and deployed testnet addresses.
 • Demo video under 5 minutes that follows the Demo script and clearly shows AI usage and token mint.
 • Tests for backend and contracts included in /tests.

23. Example checklist to follow during implementation
Create repo and initial commit with README and prompts.md.


Implement wallet connect and simple question POST flow.


Build backend endpoint for AI draft with logging
Implement VibeToken contract, write tests and deploy to testnet.


Add reward trigger workflow and connect frontend to show token balance.


Add unit and contract tests.


Polish UI and prepare demo video.


Final checks for prompts.md, commit messages and TIP.md then submit.
