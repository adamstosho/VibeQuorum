
VibeQuorum — Product Requirements Document (PRD)
1. Project overview
Name: VibeQuorum
 Tagline: A community driven Q and A for Web3 developers, with an AI assistant and on chain token rewards.
Elevator pitch: VibeQuorum combines community expertise and a lightweight AI assistant to deliver fast, high quality answers to Web3 development questions. Contributors earn on chain VibeTokens when their answers are voted or accepted, creating a self sustaining knowledge economy that helps developers get unstuck and incentivises expert participation.
2. Goals and success metrics
Primary goals
Build a working, deployable MVP that demonstrates question posting, community answers and voting, an AI draft answer feature, wallet login, and on chain token rewards.


Meet Seedify VibeCoins hackathon submission rules: public repo, prompts documentation, tests, demo video, 150 word project and team descriptions.


Success metrics for the hackathon
Functional prototype end to end: frontend, backend, AI call, smart contract reward flow.


Public GitHub repo with ai_logs/prompts.md and clear commit history showing AI-assisted development.


Demo video under 5 minutes that demonstrates reward minting on a testnet.


At least 5 test cases: 3 backend unit tests, 2 smart contract tests.


Judges feedback and community votes.


3. Target users and use cases
Primary users
Web3 developers seeking quick, reliable technical answers.


Newcomers to Web3 needing guided answers and references.


Expert contributors who want to earn tokens for high quality answers.


Core use cases
Developer posts a question about Solidity, dApp integration, or tooling.


Community members post answers, vote, and accept answers.


User requests an AI drafted answer, edits it and posts it as a community answer.


Top answerer receives on chain VibeToken rewards that appear in their wallet.


4. Scope: MVP vs future
MVP (hackathon deliverable)
Wallet authentication via MetaMask.


Post question, post answer, upvote, accept answer.


AI draft answer button using OpenAI or equivalent. Save prompt and AI output in ai_logs.


ERC20 VibeToken contract with a reward function.


Frontend integration to trigger reward after acceptance or when upvote threshold reached.


MongoDB backend storing users, questions, answers, votes, AI prompt logs.


Tests: minimal unit tests and smart contract tests.


Demo video, public repo with prompts.md, README and deploy instructions.


Post MVP (post hackathon roadmap)
Reputation to governance migration, DAO features.


Advanced AI: summarisation, auto moderation, tag suggestions.


Token staking for bounty style questions.


Mobile responsive app and on chain badge NFTs.


5. Key features and user stories
Feature 1: Wallet login and profile
User story: As a developer, I want to sign in with my wallet so my contributions can be tied to my address.
 Acceptance criteria:
Connect MetaMask, show address and balance.


Create or fetch user profile localised to wallet address.


Feature 2: Post question
User story: As a developer, I want to create a question with title, description and tags so others can answer.
 Acceptance criteria:
Title required, description markdown supported, at least one tag.


POST /questions creates a DB entry and returns question id.


Feature 3: Post answer and edit
User story: As an expert, I want to submit or edit answers to help the asker.
 Acceptance criteria:
POST /questions/:id/answers stores answer with author wallet, content, createdAt.


Author can edit within a time window (e.g. 10 minutes) or until accepted.


Feature 4: Voting and acceptance
User story: As a community member, I want to upvote helpful answers so rewards are allocated.
 Acceptance criteria:
Users can upvote once per answer.


The asker can mark one answer as accepted.


On acceptance or when upvote threshold is reached, reward flow is triggered.


Feature 5: AI draft answer
User story: As a developer, I want an AI draft so I can get a starting answer to edit and post.
 Acceptance criteria:
Button requests AI based on the question text and returns suggested answer.


All prompts and AI outputs are appended to ai_logs/prompts.md and stored in DB.


Feature 6: Token reward contract
User story: As answerer, I want to receive VibeTokens when my answer is accepted or upvoted sufficiently.
 Acceptance criteria:
Smart contract mint or transfer executed, visible on testnet and reflected in MetaMask.


Transaction hash stored in answer metadata.


6. Technical architecture
High level
Frontend React app (Vercel deployment)


Backend Node.js + Express API (Render or Heroku)


Database MongoDB Atlas


Smart contracts in Solidity deployed to an EVM testnet (Goerli or BNB Testnet)


AI calls from backend to OpenAI or chosen provider


Wallet interactions via web3.js or ethers.js in frontend


Data flow
User connects wallet on client.


Client calls backend APIs for CRUD operations.


Backend writes to MongoDB and logs prompts when AI called.


When reward criteria satisfied, frontend constructs a transaction to call RewardManager or calls a backend signed service (see security note) to mint tokens.


Token transactions are submitted to testnet and receipt recorded.


7. Data models (simplified)
User
walletAddress string, primary key


displayName string


createdAt date


reputation number


tokenBalance cached number


Question
id string


author walletAddress


title string


description string (markdown)


tags [string]


createdAt date


acceptedAnswerId string | null


aiDraftId string | null


Answer
id string


questionId string


author walletAddress


content string (markdown)


upvotes number


createdAt date


txHash string | null // token reward tx hash(s)


aiGenerated boolean


AI Prompt Log
id


questionId


promptText


modelUsed string


responseText


createdAt


8. API surface (selected endpoints)
POST /api/auth/connect
 Accepts walletAddress, returns or creates profile.


GET /api/questions
 Query list with pagination and tag filters.


POST /api/questions
 Create question with title, description, tags.


GET /api/questions/:id
 Fetch question and answers.


POST /api/questions/:id/answers
 Create answer.


POST /api/answers/:id/upvote
 Record upvote by wallet.


POST /api/questions/:id/ai-draft
 Send question content to AI. Returns draft answer. Logs prompt.


POST /api/rewards/trigger
 (Admin or authorized) Record reward trigger and associate txHash. See security.


9. Smart contract design
Contract 1: VibeToken (ERC20, mintable)
Functions


constructor(string name, string symbol)


mint(address to, uint256 amount) onlyOwner


transfer(...) standard


Events


Transfer(address indexed from, address indexed to, uint256 value)


Mint(address indexed to, uint256 amount)


Contract 2: RewardManager (optional)
 Purpose: Encapsulate reward rules and safe reward calls
Functions


setRewardCriteria(uint256 upvoteThreshold, uint256 acceptReward, uint256 upvoteReward) onlyOwner


rewardForAnswer(address to, uint256 amount) onlyOwner or onlyPlatform


batchReward(address[] recipients, uint256[] amounts) onlyOwner


Events


AnswerRewarded(address indexed to, uint256 amount, uint256 answerId)


Security note
Owner controls minting initially. For hackathon simplicity, use a multisig or a single admin private key for reward calls. In production migrate to a DAO or timelock.


10. Tokenomics (MVP settings)
Token name: VibeToken (VIBE)


Initial supply: 0, mint on demand


Reward values (configurable)


Accept answer reward: 50 VIBE


Upvote reward: 5 VIBE per X upvotes aggregated and paid periodically


Future: token distribution for governance, staking and bounties.


11. Testing plan
Smart contract tests
Use Hardhat or Truffle with Mocha/Chai.


Tests:


mint increases balance


onlyOwner check on mint


rewardForAnswer mints expected amount and emits events


Backend tests
Use Jest or Mocha for API tests


Tests:


POST /questions creates DB entry


POST /questions/:id/ai-draft logs prompt and returns response (mock AI)


Upvote flow increments upvote count and triggers reward logic flag


Frontend E2E
Optional Cypress script demonstrating connect wallet, post question, request AI draft, post answer.


12. Security and privacy
Never store private keys in repo. Use environment variables for admin keys if needed.


Do not expose OpenAI keys in the frontend. AI calls originate from the backend.


Rate limit AI usage to prevent abuse.


Validate and sanitize markdown input to prevent XSS.


For reward execution: prefer the frontend to send a transaction signed by the platform admin via a serverless function, or require that reward calls are initiated by a wallet with admin privileges. For hackathon, document the trade off and show testnet receipts.


13. Repository structure (recommended)
vibequorum/
├─ frontend/                # React app
│  ├─ src/
│  └─ package.json
├─ backend/                 # Node + Express
│  ├─ src/
│  ├─ ai_logs/              # prompts.md and logs
│  └─ package.json
├─ contracts/
│  ├─ VibeToken.sol
│  ├─ RewardManager.sol
│  └─ deploy/
├─ tests/
│  ├─ contracts/
│  └─ backend/
├─ README.md
├─ .env.example
└─ docs/
   ├─ DEPLOY.md
   ├─ TIP.md                # Testing in Production
   └─ DEMO_SCRIPT.md

Important: ai_logs/prompts.md must include prompt text, model used, and date. Commit messages must include entries like: "AI-assisted: generated initial answer component".
14. Deployment and devops
Smart contract
Compile and deploy using Hardhat. Deploy to Goerli or BNB Testnet for demo.


Save contract address in backend env.


Backend
Host on Render or Heroku. Environment variables:


MONGO_URI


OPENAI_API_KEY


CONTRACT_ADDRESS


PLATFORM_ADMIN_ADDRESS


Frontend
Host on Vercel.


Connect to backend API and provide instructions for users to set MetaMask to the demonstration testnet.


TIP instructions for judges
Connect MetaMask to Goerli or BNB testnet.


Import the demo account or use MetaMask test faucet.


Visit frontend, post a question, request AI draft, accept an answer and observe token minted in MetaMask.


15. Demo video plan (max 5 minutes)
0:00–0:20 Project one line pitch and problem.


0:20–1:20 Live demo: connect wallet, show token balance.


1:20–2:20 Post a new question and request AI draft. Show ai_logs/prompts.md in repo.


2:20–3:20 Post community answer and upvote. Mark accepted answer.


3:20–4:20 Show token minting transaction in explorer and MetaMask balance update.


4:20–5:00 Conclude with monetisation and roadmap.


16. 150 word project description (example)
VibeQuorum is a community focused Q and A platform for Web3 developers that combines lightweight AI assistance with on chain incentives. Developers post technical questions about smart contracts and dApp integrations, request an AI drafted answer to accelerate progress, and receive community feedback. High quality answers are rewarded with VibeTokens, an ERC20 token minted transparently on chain. VibeQuorum accelerates developer onboarding, encourages expert participation, and establishes a tokenised knowledge economy that can later evolve into a governance DAO. The public repository includes full source code, AI prompt logs, tests and deployment scripts to enable easy verification and reproduction. VibeQuorum demonstrates a simple yet impactful blend of AI and blockchain that is ready to scale from hackathon prototype to a sustainable platform.
17. 150 word team bio (example)
We are a collaborative team of full stack and blockchain engineers focused on practical Web3 tooling. Our lead is a MERN developer with extensive Solidity experience, responsible for frontend and smart contract development. The backend engineer manages APIs, AI integration and database architecture. A product designer ensures clear UX for developer workflows and a project lead handles deployment and demo coordination. Together we combine rapid prototyping, rigorous testing and pragmatic security practices. For this hackathon we will document our AI assisted development in the repository and provide transparent commit history so reviewers can trace our "vibe coding" process.
18. Milestones and timeline (14 day hackathon schedule)
Day 1
Repo setup, environment scaffolding, basic schemas


Commit initial README and prompts.md template


Day 2–4
Backend API endpoints: questions, answers, users


Frontend question and answer pages


AI endpoint stub and initial integration


Day 5–7
Smart contract development and deploy to testnet


Integrate wallet connection and display token balance


Day 8–10
Reward flow implementation, tests for contracts and backend


Polish UI and markdown support


Day 11–12
Prepare ai_logs, ensure commit messages show AI usage


Record demo video, finalise README and DEPLOY docs


Day 13–14
Final QA, fix critical bugs, submit to DoraHacks


19. Submission checklist for Seedify VibeCoins (must haves)
Public GitHub repo


ai_logs/prompts.md documenting each AI prompt and model


Commit messages denoting AI assistance


Working deployment or clear deploy script


Demo video under 5 minutes on YouTube or published link


Smart contract code and deployment details


Tests present in /tests for backend and contracts


150 word project description and team bio


20. Risks and mitigations
Risk: API keys leaked in repo. Mitigation: .env.example only, document never to commit real keys.


Risk: Reward function abused. Mitigation: admin gatekeeping for reward calls and set minimal thresholds.


Risk: AI hallucination leading to incorrect answers. Mitigation: label AI answers as drafts and require user edit before posting.


Risk: Time constraints. Mitigation: Prioritise core flows and stub noncritical features.
