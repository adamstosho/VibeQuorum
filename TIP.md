# Testing in Production (TIP) Guide

This guide provides step-by-step instructions for testing VibeQuorum in a production/testnet environment.

## Prerequisites

1. **MetaMask Wallet** installed in your browser
2. **Testnet Tokens** - You'll need testnet ETH/BNB for gas fees
3. **Network Configuration** - Connect to Base Sepolia testnet (or other supported networks)

## Network Setup

### Base Sepolia (Recommended)

1. Open MetaMask
2. Click the network dropdown → "Add Network"
3. Enter the following details:
   - **Network Name**: Base Sepolia
   - **RPC URL**: `https://sepolia.base.org`
   - **Chain ID**: 84532
   - **Currency Symbol**: ETH
   - **Block Explorer**: `https://sepolia.basescan.org`

### Get Testnet Tokens

- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Ethereum Sepolia Faucet**: https://sepoliafaucet.com/
- **BSC Testnet Faucet**: https://testnet.bnbchain.org/faucet-smart

## Step-by-Step Testing Guide

### 1. Connect Wallet

1. Navigate to the VibeQuorum frontend
2. Click "Connect Wallet" button
3. Select MetaMask from the wallet options
4. Approve the connection request
5. Verify your wallet address is displayed in the header

**Expected Result**: Wallet address should be visible, and you should see your token balance (if you have VIBE tokens).

### 2. Post a Question

1. Click "Ask Question" or navigate to `/questions/new`
2. Fill in the question form:
   - **Title**: Enter a clear, descriptive title
   - **Description**: Provide detailed context (minimum 20 characters)
   - **Tags**: Select relevant tags (e.g., "Solidity", "DeFi", "NFT")
3. Click "Post Question"
4. Sign the transaction when MetaMask prompts you

**Expected Result**: Question appears in the questions list with your wallet address as the author.

### 3. Answer a Question

1. Navigate to a question detail page
2. Scroll to the "Your Answer" section
3. Enter your answer (minimum 20 characters)
4. Optionally click "Generate AI Draft" to get an AI-suggested answer
5. Edit the AI draft if needed
6. Click "Post Answer"
7. Sign the transaction

**Expected Result**: Your answer appears below the question with your wallet address.

### 4. Vote on Content

1. On a question or answer, click the upvote (↑) or downvote (↓) button
2. Sign the transaction when prompted
3. Verify the vote count updates

**Expected Result**: Vote count increases/decreases, and your vote is recorded.

### 5. Accept an Answer (Question Owner Only)

1. As the question owner, navigate to your question
2. Find an answer you want to accept
3. Click "Accept Answer" button
4. Sign the transaction

**Expected Result**: 
- Answer is marked as "Accepted"
- Answer author receives 50 VIBE tokens (check their wallet balance)
- Questioner receives 10 VIBE tokens (bonus)
- Transaction hash is displayed on the answer

### 6. Test Upvote Threshold Reward

1. Find an answer with 9 upvotes
2. As a different user, upvote the answer (making it 10 upvotes)
3. Wait for the backend to process the reward

**Expected Result**:
- Answer author automatically receives upvote threshold reward
- Transaction hash appears in the answer's reward history
- Check the author's wallet balance for the new tokens

### 7. Admin Panel Testing

1. Connect with an admin wallet (must have ADMIN_ROLE on contracts)
2. Navigate to `/admin`
3. Verify you can see:
   - Total questions and answers
   - Pending rewards
   - Recent transactions
   - Daily reward limits
4. Select pending rewards and click "Trigger Rewards"
5. Confirm the transaction

**Expected Result**: 
- Admin panel displays metrics
- Rewards are triggered successfully
- Transaction hashes are recorded

### 8. View Reward History

1. Navigate to your profile or user page
2. Check "Rewards Earned" section
3. View transaction hashes
4. Click transaction hash to view on block explorer

**Expected Result**: 
- All earned rewards are displayed
- Transaction links work and show on-chain transactions
- Token balances are accurate

## Verifying On-Chain Transactions

### Check Transaction on Block Explorer

1. Copy a transaction hash from the platform
2. Navigate to the block explorer:
   - **Base Sepolia**: https://sepolia.basescan.org
   - **Ethereum Sepolia**: https://sepolia.etherscan.io
   - **BSC Testnet**: https://testnet.bscscan.com
3. Paste the transaction hash in the search box
4. Verify:
   - Transaction status: Success
   - From: Admin wallet address
   - To: RewardManager contract address
   - Token transfer to recipient address

### Check Token Balance

1. In MetaMask, click "Import tokens"
2. Enter VibeToken contract address (from deployment)
3. View your VIBE token balance
4. Verify balance matches platform display

## Common Issues & Troubleshooting

### Issue: "Transaction Failed"

**Solutions**:
- Ensure you have enough testnet ETH/BNB for gas
- Check network connection (must be on correct testnet)
- Verify contract addresses are correct in environment variables
- Check backend logs for error messages

### Issue: "Wallet Not Connected"

**Solutions**:
- Refresh the page
- Disconnect and reconnect wallet
- Clear browser cache
- Check MetaMask is unlocked

### Issue: "Reward Not Triggered"

**Solutions**:
- Verify admin wallet has correct roles on contracts
- Check backend logs for errors
- Ensure RewardManager has MINTER_ROLE on VibeToken
- Verify backend has sufficient gas for transactions

### Issue: "Cannot Accept Answer"

**Solutions**:
- Verify you are the question owner (check wallet address)
- Ensure answer exists and is not already accepted
- Check backend API is running and accessible
- Verify signature authentication is working

## Testing Checklist

- [ ] Wallet connection works
- [ ] Can post questions
- [ ] Can post answers
- [ ] Can vote on content
- [ ] Can accept answers (as question owner)
- [ ] Rewards are distributed on-chain
- [ ] Transaction hashes are displayed
- [ ] Admin panel is accessible (admin only)
- [ ] Upvote threshold rewards work automatically
- [ ] Questioner bonus is distributed
- [ ] Token balances update correctly
- [ ] Block explorer links work
- [ ] Error handling works gracefully

## Performance Testing

1. **Load Testing**: Post multiple questions/answers rapidly
2. **Concurrent Users**: Test with multiple wallets simultaneously
3. **Gas Optimization**: Monitor gas costs for reward transactions
4. **Response Times**: Check API response times under load

## Security Testing

1. **Access Control**: Verify non-admins cannot access admin panel
2. **Signature Validation**: Test with invalid signatures (should fail)
3. **Rate Limiting**: Test rate limits on API endpoints
4. **Double Reward Prevention**: Try to trigger same reward twice

## Support

If you encounter issues during testing:

1. Check backend logs: `backend/logs/` directory
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Ensure all services are running (backend, frontend, MongoDB)
5. Check contract deployment addresses match environment config

## Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Smart Contract Documentation](./contracts/README.md)
- [Admin Panel Guide](./ADMIN_PANEL_EXPLANATION.md)
- [Architecture Flow](./ArchitecturalFlow.md)

---

**Happy Testing! 🚀**
