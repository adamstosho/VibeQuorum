# End-to-End Testing Guide

This document outlines comprehensive end-to-end testing procedures for VibeQuorum's complete reward flow and platform functionality.

## Test Environment Setup

### Prerequisites

1. **Backend Server** running on `http://localhost:4000`
2. **Frontend** running on `http://localhost:3000`
3. **MongoDB** database connected and accessible
4. **Smart Contracts** deployed on testnet (Base Sepolia recommended)
5. **Test Wallets**:
   - Admin wallet (with ADMIN_ROLE and REWARDER_ROLE)
   - Question owner wallet
   - Answer author wallet
   - Voter wallet

### Environment Configuration

Ensure all environment variables are set:

```bash
# Backend .env
MONGODB_URI=mongodb://...
VIBE_TOKEN_ADDRESS=0x...
REWARD_MANAGER_ADDRESS=0x...
ADMIN_PRIVATE_KEY=0x...
BASE_SEPOLIA_RPC_URL=https://...

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_VIBE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_REWARD_MANAGER_ADDRESS=0x...
```

## Test Scenarios

### Scenario 1: Complete Answer Acceptance Flow

**Objective**: Verify that accepting an answer triggers all expected rewards.

**Steps**:
1. **Setup**:
   - Question owner posts a question
   - Answer author posts an answer
   - Verify question and answer exist in database

2. **Accept Answer**:
   - Question owner navigates to question detail page
   - Clicks "Accept Answer" on the answer
   - Signs transaction in MetaMask
   - Wait for transaction confirmation

3. **Verify Rewards**:
   - Check answer author's wallet balance (should increase by 50 VIBE)
   - Check question owner's wallet balance (should increase by 10 VIBE)
   - Verify transaction hash appears on answer
   - Check RewardLog in database:
     - Entry for `accepted_answer` reward
     - Entry for `questioner_bonus` reward
     - Both marked as `confirmed`

4. **Verify On-Chain**:
   - Copy transaction hash from answer
   - View on block explorer
   - Verify two transactions:
     - `rewardAcceptedAnswer` call
     - `rewardQuestioner` call
   - Check token transfers in transaction logs

**Expected Results**:
- ✅ Answer marked as accepted in database
- ✅ Answer author receives 50 VIBE tokens
- ✅ Question owner receives 10 VIBE tokens
- ✅ Transaction hashes recorded in database
- ✅ RewardLog entries created
- ✅ On-chain transactions confirmed

**Failure Cases to Test**:
- Accept answer without being question owner (should fail)
- Accept already accepted answer (should be idempotent)
- Accept answer when backend reward fails (answer still accepted, error logged)

---

### Scenario 2: Upvote Threshold Reward Flow

**Objective**: Verify automatic reward when answer reaches 10 upvotes.

**Steps**:
1. **Setup**:
   - Create a question
   - Post an answer
   - Verify answer has 0 upvotes

2. **Reach Threshold**:
   - Have 10 different wallets upvote the answer
   - After each upvote, verify vote count increases
   - After 10th upvote, wait for backend processing

3. **Verify Reward**:
   - Check answer author's wallet balance (should increase)
   - Verify transaction hash appears on answer
   - Check RewardLog for `upvote_threshold` entry
   - Verify answer's `vibeReward` field updated

4. **Verify On-Chain**:
   - View transaction on block explorer
   - Verify `rewardUpvoteThreshold` function called
   - Check token transfer to answer author

**Expected Results**:
- ✅ Answer reaches exactly 10 upvotes
- ✅ Reward automatically triggered
- ✅ Answer author receives upvote reward tokens
- ✅ Transaction hash recorded
- ✅ No duplicate rewards if threshold exceeded

**Failure Cases to Test**:
- Upvote same answer twice (should toggle vote)
- Change vote from upvote to downvote (should decrease count)
- Remove upvote before threshold (should not trigger reward)
- Already rewarded answer reaching threshold again (should not double-reward)

---

### Scenario 3: Admin Panel Reward Triggering

**Objective**: Verify admin can manually trigger rewards for pending accepted answers.

**Steps**:
1. **Setup**:
   - Create accepted answer without reward (simulate failed auto-reward)
   - Verify answer exists with `isAccepted: true` but no `txHash`

2. **Admin Access**:
   - Connect admin wallet
   - Navigate to `/admin`
   - Verify admin panel loads (non-admin should see access denied)

3. **Trigger Reward**:
   - Select pending reward from list
   - Click "Trigger Rewards"
   - Confirm transaction
   - Wait for confirmation

4. **Verify**:
   - Check answer has transaction hash
   - Verify reward recipient's balance increased
   - Check RewardLog entry created
   - Verify on-chain transaction

**Expected Results**:
- ✅ Admin panel accessible only to admins
- ✅ Pending rewards listed correctly
- ✅ Manual trigger works
- ✅ Rewards distributed successfully
- ✅ UI updates with transaction hash

**Failure Cases to Test**:
- Non-admin accessing admin panel (should be blocked)
- Triggering reward for already rewarded answer (should fail gracefully)
- Triggering with insufficient gas (should show error)

---

### Scenario 4: Complete User Journey

**Objective**: Test full user flow from registration to earning rewards.

**Steps**:
1. **New User Registration**:
   - Connect wallet (new address)
   - Verify user profile created in database
   - Check initial reputation is 0

2. **Post Question**:
   - Create a question
   - Verify question saved
   - Check question appears in list

3. **Get AI Draft**:
   - Click "Generate AI Draft" on question
   - Wait for AI response
   - Verify draft answer displayed
   - Edit and post draft as answer

4. **Community Interaction**:
   - Other users upvote the answer
   - Answer reaches 10 upvotes
   - Verify upvote threshold reward

5. **Answer Accepted**:
   - Question owner accepts answer
   - Verify all rewards distributed
   - Check user's total rewards

6. **View Profile**:
   - Navigate to user profile
   - Verify reputation increased
   - Check rewards history
   - Verify token balance

**Expected Results**:
- ✅ Complete flow works end-to-end
- ✅ All rewards distributed correctly
- ✅ User reputation updates
- ✅ Profile displays accurate data

---

### Scenario 5: Error Handling and Edge Cases

**Objective**: Verify system handles errors gracefully.

**Test Cases**:

1. **Network Errors**:
   - Disconnect backend during reward trigger
   - Verify frontend shows error message
   - Reconnect and verify recovery

2. **Transaction Failures**:
   - Trigger reward with insufficient gas
   - Verify error logged
   - Verify answer still accepted (if applicable)

3. **Double Reward Prevention**:
   - Try to accept same answer twice
   - Verify second attempt fails
   - Check on-chain `isAnswerRewarded` returns true

4. **Rate Limiting**:
   - Make rapid API calls
   - Verify rate limit enforced
   - Check error messages

5. **Invalid Data**:
   - Submit empty question/answer
   - Submit with invalid wallet address
   - Verify validation errors

**Expected Results**:
- ✅ Errors handled gracefully
- ✅ User-friendly error messages
- ✅ System remains stable
- ✅ No data corruption

---

## Automated Test Scripts

### Backend API Tests

```bash
cd backend
npm test
```

Tests should cover:
- Question creation
- Answer creation
- Vote operations
- Reward triggering
- Error handling

### Smart Contract Tests

```bash
cd contracts
npm test
```

Tests should cover:
- Token minting
- Reward distribution
- Role management
- Double-reward prevention
- Rate limiting

### Integration Tests

Create test scripts that:
1. Start backend server
2. Deploy contracts
3. Run full flow tests
4. Verify results
5. Clean up

## Performance Benchmarks

### Response Times

- Question creation: < 2 seconds
- Answer creation: < 2 seconds
- Vote operation: < 1 second
- Reward trigger: < 30 seconds (includes on-chain confirmation)
- Admin panel load: < 3 seconds

### Throughput

- Concurrent users: 50+
- Questions per minute: 10+
- Answers per minute: 20+
- Votes per minute: 100+

## Test Data Requirements

### Sample Questions

Create diverse questions covering:
- Solidity smart contracts
- DeFi protocols
- NFT development
- Web3 tooling
- Blockchain concepts

### Sample Answers

- Short answers (< 100 words)
- Long answers (> 500 words)
- Code examples
- Links and references
- AI-generated drafts

## Reporting Issues

When reporting test failures, include:

1. **Test Scenario**: Which scenario failed
2. **Steps to Reproduce**: Exact steps taken
3. **Expected vs Actual**: What should happen vs what happened
4. **Error Messages**: Full error logs
5. **Environment**: Network, wallet addresses, contract addresses
6. **Screenshots**: If applicable

## Continuous Testing

Set up automated testing:

1. **CI/CD Pipeline**: Run tests on every commit
2. **Daily Tests**: Full E2E test suite daily
3. **Pre-Deployment**: Full test suite before production deployment
4. **Monitoring**: Track test results over time

## Test Coverage Goals

- **Backend API**: 80%+ coverage
- **Smart Contracts**: 90%+ coverage
- **Frontend Components**: 70%+ coverage
- **E2E Scenarios**: All critical paths covered

---

## Quick Test Checklist

Use this checklist for quick verification:

- [ ] Wallet connection works
- [ ] Can post questions
- [ ] Can post answers
- [ ] Can vote on content
- [ ] AI draft generation works
- [ ] Can accept answers
- [ ] Rewards distributed on-chain
- [ ] Upvote threshold rewards work
- [ ] Questioner bonus works
- [ ] Admin panel accessible (admin only)
- [ ] Transaction hashes displayed
- [ ] Block explorer links work
- [ ] Error handling works
- [ ] Rate limiting works
- [ ] Double-reward prevention works

---

**Last Updated**: [Current Date]
**Tested By**: [Tester Name]
**Status**: ✅ Ready for Testing
