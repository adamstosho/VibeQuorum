# Reward Display Fix

## Issue
Rewards were not visible on answers after they were accepted or reached upvote threshold.

## Root Cause
1. **Missing `vibeReward` field** in Answer model - Frontend expected this field but backend didn't store it
2. **Data not refreshing** - Frontend wasn't properly refreshing answer data after rewards were distributed
3. **Field mapping** - Frontend wasn't properly mapping backend data structure

## Fixes Applied

### 1. Added `vibeReward` Field to Answer Model
- Added `vibeReward: number` field to `IAnswer` interface
- Added field to Answer schema with default value of 0
- This field tracks total VIBE tokens rewarded to the answer

### 2. Updated Reward Service
- Modified `rewardAcceptedAnswer()` to increment `vibeReward` field when reward is distributed
- Modified `rewardUpvoteThreshold()` to increment `vibeReward` field
- Both now update both `txHashes` array and `vibeReward` amount

### 3. Updated Frontend Data Mapping
- Updated `useAnswers` hook to ensure `vibeReward` is always present (defaults to 0)
- Properly maps `txHashes` array from backend
- Handles both array format and single hash format

### 4. Improved Refresh Logic
- Updated `acceptAnswer` callback to use `refetch()` instead of `refresh()`
- Added delayed refresh after reward distribution to ensure blockchain data is indexed
- Better error handling and user feedback

## How Rewards Are Displayed

### When Rewards Show Up

1. **Answer Accepted**:
   - Question owner clicks "Accept Answer"
   - Backend automatically distributes 50 VIBE to answer author
   - Backend updates answer with `txHash` and `vibeReward: 50`
   - Frontend refreshes and displays reward badge

2. **Upvote Threshold**:
   - Answer reaches 10 upvotes
   - Backend automatically distributes upvote reward
   - Backend updates answer with `txHash` and increments `vibeReward`
   - Frontend refreshes and displays updated reward

### Display Logic

The frontend shows rewards when:
```typescript
answer.vibeReward > 0 && answer.txHashes.length > 0
```

This displays:
- Reward badge with amount: `+50 VIBE`
- Transaction link to block explorer
- Only shows if both reward amount and transaction hash exist

## Testing

To verify rewards are showing:

1. **Accept an answer**:
   - Post a question
   - Get someone to answer
   - Accept the answer as question owner
   - Check that reward badge appears with transaction hash

2. **Upvote threshold**:
   - Post an answer
   - Get 10 upvotes
   - Check that reward badge appears

3. **Check backend**:
   - Verify `vibeReward` field is updated in database
   - Verify `txHashes` array contains transaction hash
   - Check RewardLog collection for reward records

## Important Notes

- **Rewards only show AFTER acceptance** - Just posting an answer doesn't give rewards
- **Rewards are automatic** - No manual intervention needed
- **Transaction takes time** - May take a few seconds for blockchain confirmation
- **Refresh happens automatically** - Frontend refreshes after reward distribution
