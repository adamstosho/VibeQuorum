# VibeQuorum Reward System - Complete Explanation

## 🎯 Quick Answer

**Who grants rewards?**  
The **backend server** automatically grants rewards using an **admin wallet** (configured via `ADMIN_PRIVATE_KEY`). The admin wallet has the necessary permissions on the smart contracts to distribute tokens.

**Is reward implemented?**  
✅ **YES!** All reward functionality is fully implemented and working.

**Who gets rewarded?**  
1. **Answer Authors** - When their answer is accepted (50 VIBE tokens)
2. **Answer Authors** - When their answer reaches 10 upvotes (upvote threshold reward)
3. **Question Authors** - When their question gets an accepted answer (10 VIBE tokens bonus)

---

## 🏗️ How The Reward System Works

### **Automatic Reward Distribution**

The reward system is **fully automated**. No manual intervention is required for normal operations. Here's how it works:

#### **1. When an Answer is Accepted**

**Flow:**
```
Question Owner clicks "Accept Answer"
    ↓
Frontend calls: POST /api/questions/:questionId/accept/:answerId
    ↓
Backend: questionService.acceptAnswer()
    ↓
1. Marks answer as accepted in database
2. Automatically triggers rewardService.rewardAcceptedAnswer()
   → Uses admin wallet to call RewardManager.rewardAcceptedAnswer()
   → Mints 50 VIBE tokens to answer author
3. Automatically triggers rewardService.rewardQuestioner()
   → Uses admin wallet to call RewardManager.rewardQuestioner()
   → Mints 10 VIBE tokens to question author
    ↓
Both transactions recorded on blockchain
Both rewards logged in database
```

**Who gets rewarded:**
- ✅ **Answer Author**: 50 VIBE tokens (automatic)
- ✅ **Question Author**: 10 VIBE tokens bonus (automatic)

**Who triggers it:**
- The **question owner** (any user who posted the question)
- The backend **automatically** handles the on-chain reward distribution

#### **2. When an Answer Reaches 10 Upvotes**

**Flow:**
```
User upvotes an answer
    ↓
Frontend calls: POST /api/answers/:id/vote
    ↓
Backend: voteService.vote()
    ↓
Updates vote counts in database
    ↓
Checks if upvotes >= 10
    ↓
If yes: Automatically triggers rewardService.rewardUpvoteThreshold()
   → Uses admin wallet to call RewardManager.rewardUpvoteThreshold()
   → Mints upvote reward tokens to answer author
    ↓
Transaction recorded on blockchain
Reward logged in database
```

**Who gets rewarded:**
- ✅ **Answer Author**: Upvote threshold reward (automatic when answer reaches 10 upvotes)

**Who triggers it:**
- **Any user** who upvotes (the 10th upvote triggers the reward)
- The backend **automatically** detects the threshold and distributes rewards

#### **3. Admin Panel Manual Triggering (Fallback)**

**Flow:**
```
Admin navigates to /admin panel
    ↓
Sees list of pending rewards (if any failed)
    ↓
Selects rewards and clicks "Trigger Rewards"
    ↓
Backend: rewardController.triggerReward()
    ↓
Uses admin wallet to call RewardManager contract
    ↓
Rewards distributed on-chain
```

**When is this used:**
- If automatic reward fails (network issues, gas problems, etc.)
- Admin can manually trigger rewards for pending accepted answers
- This is a **fallback mechanism**, not the primary method

---

## 🔐 Who Has Permission to Grant Rewards?

### **The Admin Wallet**

The backend uses an **admin wallet** (configured in `ADMIN_PRIVATE_KEY` environment variable) to:
- Sign all reward transactions
- Call smart contract functions
- Mint tokens via RewardManager

**Important:** This admin wallet must have:
- `ADMIN_ROLE` or `REWARDER_ROLE` on the RewardManager contract
- The RewardManager contract must have `MINTER_ROLE` on the VibeToken contract

### **Smart Contract Roles**

```
Admin Wallet
    ↓
Has ADMIN_ROLE on RewardManager
    ↓
RewardManager Contract
    ↓
Has MINTER_ROLE on VibeToken
    ↓
Can mint VIBE tokens to users
```

---

## 📊 What Is Implemented?

### ✅ **Fully Implemented Features**

1. **Automatic Reward on Answer Acceptance**
   - ✅ When question owner accepts answer
   - ✅ Answer author receives 50 VIBE tokens automatically
   - ✅ Question author receives 10 VIBE tokens bonus automatically
   - ✅ All handled by backend automatically

2. **Automatic Reward on Upvote Threshold**
   - ✅ When answer reaches 10 upvotes
   - ✅ Answer author receives upvote threshold reward automatically
   - ✅ Triggered automatically by backend

3. **Admin Panel**
   - ✅ View all pending rewards
   - ✅ Manually trigger rewards (fallback)
   - ✅ View transaction history
   - ✅ Monitor daily limits

4. **Security Features**
   - ✅ Double-reward prevention (on-chain check)
   - ✅ Rate limiting (daily limits per user)
   - ✅ Cooldown periods
   - ✅ Role-based access control

5. **Database Tracking**
   - ✅ RewardLog collection tracks all rewards
   - ✅ Answer records include transaction hashes
   - ✅ User reputation updates automatically

---

## 🔄 Complete Reward Flow Example

### **Scenario: User Asks Question, Gets Answer, Accepts It**

1. **Alice posts a question** → Stored in MongoDB
2. **Bob posts an answer** → Stored in MongoDB
3. **Alice accepts Bob's answer**:
   - Frontend calls backend API
   - Backend marks answer as accepted
   - **Backend automatically:**
     - Calls `RewardManager.rewardAcceptedAnswer()` → Bob receives 50 VIBE
     - Calls `RewardManager.rewardQuestioner()` → Alice receives 10 VIBE
   - Both transactions recorded on blockchain
   - Both rewards logged in database
4. **Users can see rewards**:
   - Transaction hashes displayed on answer
   - Token balance updates in wallet
   - Reward history available in profile

### **Scenario: Answer Gets Popular**

1. **Bob's answer gets upvoted** multiple times
2. **When 10th upvote happens**:
   - Backend detects threshold reached
   - **Backend automatically:**
     - Calls `RewardManager.rewardUpvoteThreshold()` → Bob receives additional reward
   - Transaction recorded on blockchain
   - Reward logged in database

---

## 🎛️ Admin Panel Usage

### **When Do Admins Need to Intervene?**

**Rarely!** The system is designed to be fully automatic. Admins only need to:

1. **Monitor the system** - Check daily limits, transaction history
2. **Handle failures** - If automatic reward fails, manually trigger it
3. **Review metrics** - See total rewards distributed, average rewards

### **Admin Panel Features**

- **Dashboard**: Shows total questions, answers, rewards distributed
- **Pending Rewards**: Lists answers accepted but not yet rewarded (if any failed)
- **Transaction History**: Shows all on-chain reward transactions
- **Manual Trigger**: Button to manually trigger rewards for pending items

---

## 🔒 Security & Permissions

### **Who Can Do What?**

| Action | Who Can Do It | How |
|--------|--------------|-----|
| Accept Answer | Question Owner | Frontend button → Backend API |
| Trigger Reward | Backend (Automatic) | Admin wallet → Smart contract |
| Trigger Reward Manually | Admin Only | Admin panel → Backend API → Admin wallet |
| View Admin Panel | Admin Only | Must have ADMIN_ROLE on contracts |
| Vote on Answer | Any User | Frontend button → Backend API |
| Trigger Upvote Reward | Backend (Automatic) | Admin wallet → Smart contract |

### **Access Control**

- ✅ **Admin Panel**: Only visible to users with ADMIN_ROLE
- ✅ **Reward Triggering**: Only backend admin wallet can call smart contracts
- ✅ **API Endpoints**: Protected with signature authentication
- ✅ **Smart Contracts**: Role-based access control on-chain

---

## 💰 Reward Amounts

### **Current Reward Structure**

| Reward Type | Amount | Who Gets It | When |
|------------|--------|-------------|------|
| Accepted Answer | 50 VIBE | Answer Author | When answer is accepted |
| Upvote Threshold | Variable | Answer Author | When answer reaches 10 upvotes |
| Questioner Bonus | 10 VIBE | Question Author | When their answer is accepted |

**Note:** Reward amounts are configurable in the RewardManager smart contract.

---

## 🚀 Summary

### **Key Points:**

1. ✅ **Rewards are AUTOMATIC** - No manual work required
2. ✅ **Backend handles everything** - Uses admin wallet to distribute tokens
3. ✅ **Three types of rewards** - Accepted answer, upvote threshold, questioner bonus
4. ✅ **Fully implemented** - All features working and tested
5. ✅ **Secure** - Role-based access, double-reward prevention, rate limiting
6. ✅ **Admin panel** - Available for monitoring and manual fallback

### **The Reward Process:**

```
User Action (Accept/Vote)
    ↓
Backend API Call
    ↓
Backend Service (Automatic)
    ↓
Admin Wallet Signs Transaction
    ↓
Smart Contract Executes
    ↓
Tokens Minted to User
    ↓
Transaction Recorded
    ↓
Database Updated
    ↓
User Sees Reward in Wallet
```

**Everything is automated!** Users just need to:
- Post quality answers → Get rewarded when accepted
- Get upvotes → Get rewarded at threshold
- Ask questions → Get bonus when answered

The backend handles all the technical details automatically. 🎉
