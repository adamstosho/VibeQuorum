# VibeQuorum Smart Contracts

Production-grade smart contracts for the VibeQuorum Q&A platform with on-chain token rewards.

## Contracts

### VibeToken.sol
ERC20 token with advanced security features:
- **Role-based access control** (Admin, Minter, Pauser roles)
- **Pausable** functionality for emergency situations
- **Burnable** tokens for deflationary mechanics
- **ERC20Permit** for gasless approvals
- **Supply cap** of 100 million tokens
- **Rate limiting** with cooldown periods
- **Reentrancy protection** on all state-changing functions

### RewardManager.sol
Secure reward distribution system:
- **Multi-role access** (Admin, Rewarder, Oracle)
- **Double-reward prevention** via answer ID tracking
- **Daily reward caps** per user
- **Cooldown periods** between rewards
- **Configurable reward amounts** with min/max bounds
- **Batch reward processing** for gas efficiency
- **Comprehensive event logging**

## Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation
```bash
npm install
```

### Configuration
```bash
cp .env.example .env
# Edit .env with your private key and RPC URLs
```

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Deploy to Testnet
```bash
# Sepolia (Ethereum testnet)
npm run deploy:sepolia

# BSC Testnet
npm run deploy:bsc-testnet

# Local Hardhat network
npm run deploy:local
```

## Security Features

### VibeToken Security
| Feature | Description |
|---------|-------------|
| MAX_SUPPLY | Capped at 100 million tokens |
| MAX_MINT_PER_TX | Maximum 10,000 tokens per transaction |
| MINT_COOLDOWN | 1 hour cooldown between mints to same address |
| Role-based access | Separate Admin, Minter, Pauser roles |
| Pausable | Emergency pause functionality |
| Reentrancy Guard | Protection against reentrancy attacks |

### RewardManager Security
| Feature | Description |
|---------|-------------|
| Double-reward prevention | Each answer can only be rewarded once |
| Daily limits | Configurable max daily rewards per user |
| Cooldown periods | Minimum time between rewards (default: 5 min) |
| Amount bounds | Min 1 VIBE, Max 1000 VIBE per reward |
| Batch size limits | Maximum 50 rewards per batch |
| Role separation | Distinct Admin and Rewarder roles |

## Tokenomics (Default Values)

| Parameter | Value |
|-----------|-------|
| Token Name | VibeToken |
| Symbol | VIBE |
| Decimals | 18 |
| Max Supply | 100,000,000 VIBE |
| Accepted Answer Reward | 50 VIBE |
| Upvote Threshold Reward | 5 VIBE |
| Upvote Threshold | 10 upvotes |
| Questioner Bonus | 10 VIBE |
| Max Daily Per User | 500 VIBE |

## Contract Verification

After deployment, verify contracts on block explorer:

```bash
# Set contract addresses in .env first
npm run verify:sepolia
```

Or manually:
```bash
npx hardhat verify --network sepolia <VIBE_TOKEN_ADDRESS> "<ADMIN_ADDRESS>"
npx hardhat verify --network sepolia <REWARD_MANAGER_ADDRESS> "<VIBE_TOKEN_ADDRESS>" "<ADMIN_ADDRESS>" "<EMERGENCY_ADDRESS>"
```

## Testing

Run the full test suite:
```bash
npm test
```

Run with gas reporting:
```bash
REPORT_GAS=true npm test
```

Run specific test file:
```bash
npx hardhat test test/VibeToken.test.js
npx hardhat test test/RewardManager.test.js
```

## Integration with Backend

### Granting Minter Role
The RewardManager needs MINTER_ROLE on VibeToken:
```javascript
const MINTER_ROLE = await vibeToken.MINTER_ROLE();
await vibeToken.grantRole(MINTER_ROLE, rewardManagerAddress);
```

### Triggering Rewards from Backend
```javascript
// Generate answer ID
const answerId = ethers.keccak256(ethers.toUtf8Bytes(mongoDbAnswerId));

// Reward accepted answer
await rewardManager.rewardAcceptedAnswer(userAddress, answerId, questionId);

// Check if answer was already rewarded
const isRewarded = await rewardManager.isAnswerRewarded(answerId);
```

## License

MIT License - see LICENSE file for details.
