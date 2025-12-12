# VibeQuorum Admin Panel & Reward System - Comprehensive Explanation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Admin Panel Features](#admin-panel-features)
3. [Reward System Architecture](#reward-system-architecture)
4. [How It Works - Complete Flow](#how-it-works---complete-flow)
5. [Security & Access Control](#security--access-control)
6. [Smart Contract Integration](#smart-contract-integration)
7. [Technical Implementation](#technical-implementation)
8. [Reward Types & Amounts](#reward-types--amounts)
9. [Rate Limiting & Anti-Abuse](#rate-limiting--anti-abuse)
10. [Admin Workflow](#admin-workflow)

---

## 🎯 Overview

The **VibeQuorum Admin Panel** is a comprehensive dashboard that allows authorized administrators to:
- Monitor platform metrics (questions, answers, rewards distributed)
- Review and trigger rewards for accepted answers
- View transaction history and reward logs
- Manage the on-chain reward distribution system
- Track daily reward limits and statistics

The **Reward System** is a blockchain-based token distribution mechanism that incentivizes quality contributions by rewarding users with **VIBE tokens** (an ERC20 token) when their answers are accepted or reach certain upvote thresholds.

---

## 🎛️ Admin Panel Features

### 1. **Dashboard Overview**
The admin panel displays key metrics:
- **Total Questions**: Count of all questions on the platform
- **Total Answers**: Count of all answers provided
- **VIBE Distributed**: Total tokens distributed as rewards
- **Average Reward**: Average reward per accepted answer

### 2. **Reward Queue**
A table showing all **pending rewards** - answers that have been accepted but haven't received their on-chain reward yet. Each entry shows:
- Question title
- Answerer's wallet address
- Reward amount (50 VIBE for accepted answers)
- Status (pending/confirmed)

### 3. **Batch Reward Processing**
Admins can:
- Select multiple pending rewards using checkboxes
- Trigger rewards in batch (more gas efficient)
- Process individual rewards one at a time
- View confirmation dialog before executing

### 4. **Transaction History**
Displays recent on-chain transactions showing:
- Transaction hash (with link to block explorer)
- Recipient wallet address
- Reward amount
- Transaction status (success/failed)
- Timestamp

### 5. **Daily Statistics**
Shows:
- Daily distributed rewards vs. daily limit
- Current network (Base Sepolia, Sepolia, BSC Testnet)
- Connected wallet address

---

## 🏗️ Reward System Architecture

### **Two-Layer System**

#### **Layer 1: Backend (MongoDB)**
- Stores questions, answers, and user data
- Tracks which answers are accepted
- Maintains reward logs
- Handles API requests

#### **Layer 2: Blockchain (Smart Contracts)**
- **VibeToken.sol**: ERC20 token contract that mints VIBE tokens
- **RewardManager.sol**: Manages reward distribution logic, rate limiting, and security

### **Key Components**

1. **VibeToken Contract** (`VibeToken.sol`)
   - ERC20 token with 18 decimals
   - Maximum supply: 100 million VIBE tokens
   - Role-based access control (Admin, Minter, Pauser roles)
   - Only addresses with `MINTER_ROLE` can mint tokens
   - The RewardManager contract is granted MINTER_ROLE to mint tokens

2. **RewardManager Contract** (`RewardManager.sol`)
   - Manages all reward distribution logic
   - Prevents double-rewarding (idempotency)
   - Enforces rate limiting (daily limits, cooldowns)
   - Tracks reward history on-chain
   - Role-based access (Admin, Rewarder, Oracle roles)

---

## 🔄 How It Works - Complete Flow

### **Step-by-Step Reward Process**

#### **1. User Creates Answer**
```
User → Frontend → Backend API → MongoDB
Answer saved with: author, content, questionId, isAccepted: false
```

#### **2. Question Owner Accepts Answer**
```
Question Owner → Frontend → Backend API → MongoDB
Answer updated: isAccepted: true
```

#### **3. Answer Appears in Admin Panel**
```
Admin Panel → Frontend → Reads from MongoDB
Shows answer in "Reward Queue" as pending
```

#### **4. Admin Triggers Reward**
```
Admin → Admin Panel → Frontend → Smart Contract
```

**Frontend Flow:**
```typescript
// Admin clicks "Trigger Rewards" button
handleTriggerRewards() {
  // For each selected reward:
  rewardAcceptedAnswer(recipient, answerId, questionId)
}
```

**Smart Contract Call:**
```solidity
// RewardManager.rewardAcceptedAnswer()
function rewardAcceptedAnswer(
    address recipient,      // Answer author's wallet
    bytes32 answerId,       // Unique answer identifier (hash)
    uint256 questionId      // Question ID
)
```

#### **5. Smart Contract Processing**

**Inside RewardManager:**
```solidity
_processReward() {
  // 1. Check if already rewarded (prevent double-rewarding)
  if (_rewardedAnswers[answerId]) revert AnswerAlreadyRewarded();
  
  // 2. Check cooldown (5 minutes between rewards per user)
  if (block.timestamp < cooldownEnds) revert CooldownNotElapsed();
  
  // 3. Check daily limit (max 500 VIBE per day per user)
  if (dailyTotal + amount > maxDailyRewardPerUser) revert DailyLimitExceeded();
  
  // 4. Mark as rewarded
  _rewardedAnswers[answerId] = true;
  
  // 5. Update tracking
  _dailyRewards[recipient][today] += amount;
  _lastRewardTimestamp[recipient] = block.timestamp;
  
  // 6. Mint tokens to recipient
  vibeToken.mint(recipient, amount);  // 50 VIBE tokens
}
```

**Inside VibeToken:**
```solidity
mint() {
  // 1. Check supply cap (100M max)
  if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply();
  
  // 2. Check per-transaction limit (10K max per tx)
  if (amount > MAX_MINT_PER_TX) revert ExceedsMintLimit();
  
  // 3. Mint tokens
  _mint(recipient, amount);
  
  // 4. Emit event
  emit TokensMinted(recipient, amount, msg.sender, timestamp);
}
```

#### **6. Transaction Confirmation**
```
Blockchain → Frontend → Admin Panel
Transaction hash displayed
Answer removed from pending queue
Added to transaction history
```

#### **7. User Receives Tokens**
```
User's wallet automatically shows new VIBE token balance
Can view transaction on block explorer
```

---

## 🔐 Security & Access Control

### **Multi-Layer Security**

#### **1. Frontend Security**
- **Wallet Connection Required**: Admin must connect wallet
- **Role Verification**: Checks if wallet has admin role on-chain
- **UI Protection**: Only shows admin features if `isAdmin === true`

```typescript
// Check admin status
const isAdmin = isTokenAdmin || isRewardAdmin

// Only admins can see reward queue
{isAdmin && <RewardQueue />}
```

#### **2. Backend Security**
- **Admin Middleware**: Verifies wallet address matches `ADMIN_WALLET_ADDRESS`
- **Signature Verification**: Requires signed message for sensitive operations
- **Rate Limiting**: Prevents API abuse

```typescript
// backend/src/middleware/auth.middleware.ts
export const adminMiddleware = (req, res, next) => {
  const adminAddress = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase();
  if (req.walletAddress !== adminAddress) {
    throw new UnauthorizedError('Admin access required');
  }
  next();
};
```

#### **3. Smart Contract Security**

**Role-Based Access Control:**
- **ADMIN_ROLE**: Can configure settings, grant roles, pause contract
- **REWARDER_ROLE**: Can trigger reward distributions
- **MINTER_ROLE** (VibeToken): Can mint tokens (granted to RewardManager)

**Security Features:**
- ✅ **Reentrancy Protection**: `nonReentrant` modifier on all state-changing functions
- ✅ **Double-Reward Prevention**: Tracks rewarded answers by ID
- ✅ **Rate Limiting**: Daily limits and cooldowns
- ✅ **Pausable**: Can pause rewards in emergency
- ✅ **Supply Cap**: Maximum 100M tokens prevents inflation
- ✅ **Input Validation**: Checks for zero addresses, zero amounts, bounds

---

## 📊 Smart Contract Integration

### **Contract Addresses**
- **VibeToken**: Stored in `process.env.VIBE_TOKEN_ADDRESS`
- **RewardManager**: Stored in `process.env.REWARD_MANAGER_ADDRESS`

### **Contract Interaction**

**Frontend → Smart Contract:**
```typescript
// hooks/use-reward-manager.ts
const { rewardAcceptedAnswer } = useRewardManager()

// Call smart contract
await rewardAcceptedAnswer(
  recipient,    // "0x1234..."
  answerId,     // MongoDB answer ID
  questionId    // MongoDB question ID
)
```

**Backend → Smart Contract:**
```typescript
// backend/src/services/reward.service.ts
const wallet = getAdminWallet()  // Admin's private key
const tokenContract = new ethers.Contract(
  VIBE_TOKEN_ADDRESS,
  VIBE_TOKEN_ABI,
  wallet
)

// Mint tokens directly (legacy method, not recommended)
await tokenContract.mint(answer.author, amount)
```

**Note**: The recommended approach is to use RewardManager contract, not direct VibeToken minting.

---

## 💻 Technical Implementation

### **Frontend (Next.js/React)**

**Admin Panel Component:**
- **File**: `VibeQuorum-frontend/app/admin/page.tsx`
- **State Management**: React hooks (`useState`, `useMemo`)
- **Data Source**: Local stores (`questionStore`, `answerStore`)
- **Blockchain Integration**: Wagmi hooks (`useRewardManager`, `useVibeToken`)

**Key Hooks:**
```typescript
// Check admin status
const { isAdmin: isTokenAdmin } = useVibeToken()
const { isAdmin: isRewardAdmin } = useRewardManager()

// Trigger rewards
const { rewardAcceptedAnswer } = useRewardManager()
```

### **Backend (Node.js/Express)**

**Reward Service:**
- **File**: `backend/src/services/reward.service.ts`
- **Purpose**: Handles reward logic, blockchain interaction
- **Methods**:
  - `rewardAcceptedAnswer()`: Triggers reward for accepted answer
  - `getTokenBalance()`: Gets user's VIBE token balance
  - `getRewardHistory()`: Gets reward transaction history

**Reward Routes:**
- **File**: `backend/src/routes/reward.routes.ts`
- **Endpoints**:
  - `POST /api/rewards/trigger` - Trigger reward (Admin only)
  - `GET /api/rewards/balance` - Get token balance
  - `GET /api/rewards/history` - Get reward history

### **Smart Contracts (Solidity)**

**VibeToken.sol:**
- ERC20 token implementation
- Minting with rate limiting
- Role-based access control
- Supply cap enforcement

**RewardManager.sol:**
- Reward distribution logic
- Rate limiting (daily limits, cooldowns)
- Double-reward prevention
- Batch processing support

---

## 💰 Reward Types & Amounts

### **Default Reward Configuration**

| Reward Type | Amount | Trigger Condition |
|------------|--------|-------------------|
| **Accepted Answer** | 50 VIBE | When question owner accepts an answer |
| **Upvote Threshold** | 5 VIBE | When answer reaches 10 upvotes |
| **Questioner Bonus** | 10 VIBE | When question receives accepted answer |
| **Special Contribution** | Custom | Admin discretion |

### **Reward Parameters (Configurable)**

```solidity
acceptedAnswerReward = 50 * 10**18;  // 50 VIBE (18 decimals)
upvoteReward = 5 * 10**18;           // 5 VIBE per threshold
upvoteThreshold = 10;                 // 10 upvotes needed
questionerBonus = 10 * 10**18;       // 10 VIBE bonus
maxDailyRewardPerUser = 500 * 10**18; // Max 500 VIBE/day
rewardCooldown = 5 minutes;           // 5 min between rewards
```

**Admin can update these via:**
```solidity
RewardManager.setRewardParameters(
  _acceptedAnswerReward,
  _upvoteReward,
  _upvoteThreshold,
  _questionerBonus
)
```

---

## 🛡️ Rate Limiting & Anti-Abuse

### **Multi-Level Protection**

#### **1. Per-Answer Protection**
- **Double-Reward Prevention**: Each answer can only be rewarded once
- **Answer ID Tracking**: Uses `keccak256(answerId)` as unique identifier
- **Mapping**: `mapping(bytes32 => bool) private _rewardedAnswers`

#### **2. Per-User Protection**
- **Daily Limit**: Maximum 500 VIBE per user per day
- **Cooldown**: 5 minutes between rewards for same user
- **Tracking**: 
  ```solidity
  mapping(address => mapping(uint256 => uint256)) private _dailyRewards;
  mapping(address => uint256) private _lastRewardTimestamp;
  ```

#### **3. Per-Transaction Protection**
- **Max Single Reward**: 1,000 VIBE per transaction
- **Min Single Reward**: 1 VIBE per transaction
- **Batch Limit**: Maximum 50 rewards per batch

#### **4. Supply Protection**
- **Total Supply Cap**: 100 million VIBE tokens
- **Per-Tx Mint Limit**: 10,000 VIBE per transaction
- **Mint Cooldown**: 1 hour between mints to same address (for direct mints)

---

## 👨‍💼 Admin Workflow

### **Daily Operations**

#### **1. Access Admin Panel**
```
1. Navigate to /admin
2. Connect MetaMask wallet (must be admin wallet)
3. System verifies admin role on-chain
4. Admin panel unlocks
```

#### **2. Review Pending Rewards**
```
1. View "Reward Queue" table
2. See all accepted answers without rewards
3. Review question titles, answerers, amounts
4. Check daily distributed vs. limit
```

#### **3. Select Rewards to Process**
```
1. Check boxes next to rewards to process
2. Can select all or individual rewards
3. See total amount: "Trigger (5) Rewards" = 250 VIBE
```

#### **4. Trigger Rewards**
```
1. Click "Trigger Rewards" button
2. Confirmation modal appears
3. Review total amount
4. Click "Confirm"
5. Transaction sent to blockchain
6. Wait for confirmation (usually 1-2 seconds)
```

#### **5. Monitor Transactions**
```
1. View "Recent Transactions" section
2. See transaction hashes
3. Click to view on block explorer
4. Verify rewards were distributed
```

### **Batch Processing**

**Advantages:**
- More gas efficient (single transaction)
- Faster processing
- Lower transaction fees

**How It Works:**
```solidity
// RewardManager.batchReward()
function batchReward(RewardRequest[] calldata requests) {
  // Process up to 50 rewards in one transaction
  for (uint256 i = 0; i < length; ) {
    _processRewardUnchecked(requests[i]);
    unchecked { ++i; }
  }
}
```

---

## 🔍 Answer ID Generation

### **How Answer IDs Work**

**Purpose**: Prevent double-rewarding by creating unique identifiers for each answer.

**Generation:**
```typescript
// Frontend: hooks/use-reward-manager.ts
const generateAnswerId = (answerId: string): `0x${string}` => {
  return keccak256(toBytes(answerId))  // Hash MongoDB ObjectId
}
```

**Example:**
```typescript
// MongoDB answer ID: "507f1f77bcf86cd799439011"
// Generated bytes32: 0x8a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b
```

**Smart Contract:**
```solidity
// RewardManager checks if already rewarded
if (_rewardedAnswers[answerId]) {
  revert AnswerAlreadyRewarded(answerId);
}
```

---

## 📈 Metrics & Analytics

### **On-Chain Metrics**

**RewardManager Contract:**
- `totalRewardsDistributed`: Total VIBE tokens distributed
- `totalAnswersRewarded`: Total unique answers rewarded
- `getUserDailyRewards(user)`: User's rewards today
- `getRemainingDailyAllowance(user)`: How much user can still earn today

**VibeToken Contract:**
- `totalSupply()`: Current total supply
- `remainingMintableSupply()`: How many tokens can still be minted
- `totalMinted`: Total tokens minted (for analytics)

### **Off-Chain Metrics (Admin Panel)**

**Dashboard Metrics:**
- Total questions
- Total answers
- Total VIBE distributed (from local store)
- Average reward per accepted answer

**Transaction History:**
- Recent reward transactions
- Transaction hashes
- Recipients
- Amounts
- Timestamps

---

## 🚨 Emergency Features

### **Pause Functionality**

**VibeToken:**
```solidity
function pause() external onlyRole(PAUSER_ROLE) {
  _pause();  // Stops all transfers and minting
}
```

**RewardManager:**
```solidity
function pause() external onlyRole(ADMIN_ROLE) {
  _pause();  // Stops all reward distributions
}
```

**Use Cases:**
- Security incident
- Bug discovered
- Migration period
- Maintenance

### **Emergency Withdrawal**

**RewardManager:**
- Has `emergencyWithdrawAddress` for emergency token recovery
- Can be updated by admin
- Used if tokens get stuck in contract

---

## 🔄 Integration Flow Diagram

```
┌─────────────┐
│   User      │
│  Answers    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Backend    │
│  MongoDB    │
│ isAccepted  │
│  = true     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Admin Panel │
│  Frontend   │
│ Shows in    │
│ Reward Queue│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Admin     │
│  Selects &  │
│  Triggers   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Frontend   │
│ Wagmi Hook  │
│ Calls Smart │
│  Contract   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│RewardManager│
│  Contract   │
│ Validates & │
│  Processes  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  VibeToken  │
│  Contract   │
│  Mints 50   │
│  VIBE       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   User's    │
│   Wallet    │
│ Receives    │
│   Tokens    │
└─────────────┘
```

---

## 📝 Summary

The **VibeQuorum Admin Panel** is a powerful tool that bridges the gap between the off-chain Q&A platform and the on-chain reward system. It allows administrators to:

1. **Monitor** platform activity and reward distribution
2. **Review** pending rewards for accepted answers
3. **Trigger** on-chain token rewards efficiently
4. **Track** transaction history and statistics

The **Reward System** ensures:
- ✅ Fair distribution of rewards
- ✅ Prevention of abuse and double-rewarding
- ✅ Rate limiting to prevent spam
- ✅ Transparent on-chain tracking
- ✅ Secure role-based access control

Together, they create a robust incentive system that rewards quality contributions while maintaining security and preventing abuse.

---

## 🔗 Related Files

- **Admin Panel**: `VibeQuorum-frontend/app/admin/page.tsx`
- **Reward Hook**: `VibeQuorum-frontend/hooks/use-reward-manager.ts`
- **Reward Service**: `backend/src/services/reward.service.ts`
- **Reward Routes**: `backend/src/routes/reward.routes.ts`
- **RewardManager Contract**: `contracts/contracts/RewardManager.sol`
- **VibeToken Contract**: `contracts/contracts/VibeToken.sol`

---

*Last Updated: Based on current codebase implementation*
