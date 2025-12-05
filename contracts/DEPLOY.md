# VibeQuorum Smart Contract Deployment Guide

## Prerequisites

1. **Node.js v18+** installed
2. **MetaMask** or another wallet with testnet tokens
3. **Testnet tokens** for deployment gas fees:
   - Sepolia ETH: https://sepoliafaucet.com/
   - BSC Testnet BNB: https://testnet.binance.org/faucet-smart
   - Polygon Mumbai MATIC: https://faucet.polygon.technology/

## Step 1: Environment Setup

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## Step 2: Configure Environment

Edit `.env` file with your values:

```env
# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URL for your target network
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# Block explorer API key (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Step 3: Compile Contracts

```bash
npm run compile
```

## Step 4: Run Tests (Optional but Recommended)

```bash
npm test
```

## Step 5: Deploy to Testnet

### Sepolia (Ethereum Testnet)
```bash
npm run deploy:sepolia
```

### BSC Testnet
```bash
npm run deploy:bsc-testnet
```

### Polygon Mumbai
```bash
npm run deploy:polygon-mumbai
```

### Local Development
```bash
# Start local node in terminal 1
npm run node

# Deploy in terminal 2
npm run deploy:local
```

## Step 6: Verify Contracts (Optional)

After deployment, update `.env` with deployed addresses:

```env
VIBE_TOKEN_ADDRESS=0x...
REWARD_MANAGER_ADDRESS=0x...
ADMIN_ADDRESS=0x...
EMERGENCY_ADDRESS=0x...
```

Then verify:
```bash
npm run verify:sepolia
```

## Deployment Output

After successful deployment, you'll see:

```
========================================
Deployment Complete!
========================================

Contract Addresses:
-------------------
VibeToken: 0x...
RewardManager: 0x...

Admin Address: 0x...
Emergency Address: 0x...
```

**Save these addresses!** You'll need them for:
- Frontend integration
- Backend API configuration
- Contract verification

## Backend Integration

Add to your backend `.env`:

```env
VIBE_TOKEN_ADDRESS=0x...
REWARD_MANAGER_ADDRESS=0x...
```

## Frontend Integration

Add to your frontend config:

```javascript
export const CONTRACT_ADDRESSES = {
  vibeToken: "0x...",
  rewardManager: "0x...",
};
```

## Testing in Production (TIP)

### For Hackathon Judges

1. Connect MetaMask to Sepolia testnet
2. Get Sepolia ETH from faucet
3. Visit the deployed frontend
4. Connect wallet
5. Ask a question
6. Post an answer
7. Accept the answer
8. Observe VIBE tokens in MetaMask

### Adding VIBE Token to MetaMask

1. Open MetaMask
2. Click "Import tokens"
3. Enter the VibeToken contract address
4. Token symbol: VIBE
5. Decimals: 18
6. Click "Add"

## Troubleshooting

### "Insufficient funds"
Get testnet tokens from the faucet for your network.

### "Transaction underpriced"
Increase gas price in hardhat.config.js or wait for network congestion to clear.

### "Contract verification failed"
- Ensure constructor arguments match exactly
- Wait 1-2 minutes after deployment before verifying
- Check that the correct network is specified

## Gas Estimates

| Operation | Estimated Gas |
|-----------|---------------|
| Deploy VibeToken | ~2,500,000 |
| Deploy RewardManager | ~2,000,000 |
| Reward Accepted Answer | ~150,000 |
| Batch Reward (10 users) | ~400,000 |

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Use multisig for production admin
- [ ] Test on testnet before mainnet
- [ ] Verify contracts on block explorer
- [ ] Keep private keys secure
