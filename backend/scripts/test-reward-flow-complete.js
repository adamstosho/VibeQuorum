// Comprehensive test script for reward flow
require('dotenv').config();
const mongoose = require('mongoose');
const { ethers } = require('ethers');

const MONGODB_URI = process.env.MONGODB_URI;
const RPC_URL = process.env.RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;
const VIBE_TOKEN_ADDRESS = process.env.VIBE_TOKEN_ADDRESS;

// Import models (simplified for script)
const AnswerSchema = new mongoose.Schema({}, { strict: false });
const QuestionSchema = new mongoose.Schema({}, { strict: false });
const RewardLogSchema = new mongoose.Schema({}, { strict: false });

const Answer = mongoose.model('Answer', AnswerSchema);
const Question = mongoose.model('Question', QuestionSchema);
const RewardLog = mongoose.model('RewardLog', RewardLogSchema);

async function testRewardFlow() {
  console.log('🧪 Testing Reward Flow\n');
  console.log('='.repeat(60));

  // 1. Check environment
  console.log('\n1️⃣ Checking Environment...');
  const required = ['MONGODB_URI', 'RPC_URL', 'ADMIN_PRIVATE_KEY', 'REWARD_MANAGER_ADDRESS', 'VIBE_TOKEN_ADDRESS'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.log(`   ❌ Missing: ${missing.join(', ')}`);
    return;
  }
  console.log('   ✅ All required env vars set');

  // 2. Connect to MongoDB
  console.log('\n2️⃣ Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ MongoDB connected');
  } catch (error) {
    console.log(`   ❌ MongoDB connection failed: ${error.message}`);
    return;
  }

  // 3. Check for accepted answers without rewards
  console.log('\n3️⃣ Checking Accepted Answers...');
  const acceptedAnswers = await Answer.find({ isAccepted: true }).lean();
  
  console.log(`   Found ${acceptedAnswers.length} accepted answers`);

  // Find answers that need rewards (no successful tx hash)
  const pendingAnswers = acceptedAnswers.filter(a => {
    const txHashes = a.txHashes && Array.isArray(a.txHashes) ? a.txHashes : [];
    const successfulHashes = txHashes.filter(h => h && h !== 'failed' && h.length > 10);
    return successfulHashes.length === 0;
  });

  console.log(`   ⚠️  ${pendingAnswers.length} answers need rewards`);

  if (pendingAnswers.length === 0) {
    console.log('\n   ✅ No pending rewards! All accepted answers have been rewarded.');
    await mongoose.disconnect();
    return;
  }

  // 4. Check RewardLog entries
  console.log('\n4️⃣ Checking RewardLog Entries...');
  for (const answer of pendingAnswers.slice(0, 3)) {
    console.log(`\n   Answer ID: ${answer._id}`);
    console.log(`   Author: ${answer.author}`);
    console.log(`   Question ID: ${answer.questionId?._id || answer.questionId}`);
    
    const rewardLogs = await RewardLog.find({ answerId: answer._id }).lean();
    console.log(`   RewardLog entries: ${rewardLogs.length}`);
    
    rewardLogs.forEach(log => {
      console.log(`     - Type: ${log.rewardType}`);
      console.log(`       Status: ${log.status}`);
      console.log(`       Recipient: ${log.recipient}`);
      console.log(`       TxHash: ${log.txHash}`);
      if (log.error) {
        console.log(`       Error: ${log.error}`);
      }
    });

    // Check if answer author is valid
    if (!answer.author || !ethers.isAddress(answer.author)) {
      console.log(`     ⚠️  Invalid author address: ${answer.author}`);
    } else {
      const normalized = ethers.getAddress(answer.author.toLowerCase());
      console.log(`     ✅ Valid address: ${normalized}`);
    }
  }

  // 5. Check blockchain connection and contracts
  console.log('\n5️⃣ Checking Blockchain & Contracts...');
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log(`   ✅ Connected to blockchain (block: ${blockNumber})`);

    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    console.log(`   ✅ Admin wallet: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`   💰 Admin balance: ${ethers.formatEther(balance)} ETH`);

    if (balance === 0n) {
      console.log('   ⚠️  WARNING: Admin wallet has no ETH!');
    }

    // Check contracts
    const rewardCode = await provider.getCode(REWARD_MANAGER_ADDRESS);
    if (rewardCode === '0x') {
      console.log(`   ❌ RewardManager contract not found at ${REWARD_MANAGER_ADDRESS}`);
    } else {
      console.log(`   ✅ RewardManager contract exists`);

      // Check reward amounts
      const REWARD_MANAGER_ABI = [
        'function acceptedAnswerReward() external view returns (uint256)',
        'function questionerBonus() external view returns (uint256)',
        'function hasRole(bytes32 role, address account) external view returns (bool)',
        'function REWARDER_ROLE() external view returns (bytes32)',
      ];

      const rewardManager = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, provider);
      const acceptedReward = await rewardManager.acceptedAnswerReward();
      const questionerBonus = await rewardManager.questionerBonus();
      
      console.log(`   💰 Accepted answer reward: ${ethers.formatEther(acceptedReward)} VIBE`);
      console.log(`   💰 Questioner bonus: ${ethers.formatEther(questionerBonus)} VIBE`);

      // Check if admin wallet has REWARDER_ROLE (get from contract)
      const REWARDER_ROLE = await rewardManager.REWARDER_ROLE();
      const hasRewarderRole = await rewardManager.hasRole(REWARDER_ROLE, wallet.address);
      console.log(`   REWARDER_ROLE: ${REWARDER_ROLE}`);
      console.log(`   ${hasRewarderRole ? '✅' : '❌'} Admin has REWARDER_ROLE: ${hasRewarderRole}`);
    }

    const tokenCode = await provider.getCode(VIBE_TOKEN_ADDRESS);
    if (tokenCode === '0x') {
      console.log(`   ❌ VibeToken contract not found at ${VIBE_TOKEN_ADDRESS}`);
    } else {
      console.log(`   ✅ VibeToken contract exists`);
    }
  } catch (error) {
    console.log(`   ❌ Error checking blockchain: ${error.message}`);
  }

  // 6. Test reward flow for first pending answer
  if (pendingAnswers.length > 0) {
    console.log('\n6️⃣ Testing Reward Flow...');
    const testAnswer = pendingAnswers[0];
    console.log(`\n   Testing with Answer ID: ${testAnswer._id}`);
    console.log(`   Author: ${testAnswer.author}`);
    console.log(`   Question ID: ${testAnswer.questionId?._id || testAnswer.questionId}`);

    // Check if we can trigger reward via API simulation
    console.log('\n   📝 To test the actual reward flow:');
    console.log('   1. Make sure the backend server is running');
    console.log('   2. Use the admin panel to trigger reward for this answer');
    console.log('   3. Or use: node scripts/manual-trigger-reward.js');
    console.log('\n   Or test via API:');
    console.log(`   POST /api/rewards/trigger`);
    console.log(`   Body: { "answerId": "${testAnswer._id}" }`);
  }

  // 7. Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   Total accepted answers: ${acceptedAnswers.length}`);
  console.log(`   Pending rewards: ${pendingAnswers.length}`);
  
  const failedRewards = await RewardLog.countDocuments({ status: 'failed' });
  const confirmedRewards = await RewardLog.countDocuments({ status: 'confirmed' });
  console.log(`   Failed rewards: ${failedRewards}`);
  console.log(`   Confirmed rewards: ${confirmedRewards}`);

  if (pendingAnswers.length > 0) {
    console.log('\n⚠️  Action Required:');
    console.log('   - Review pending answers above');
    console.log('   - Check backend logs for errors');
    console.log('   - Use admin panel to trigger rewards manually');
    console.log('   - Or run: node scripts/manual-trigger-reward.js');
  } else {
    console.log('\n✅ All rewards are processed!');
  }

  await mongoose.disconnect();
  console.log('\n✅ Test complete!');
}

testRewardFlow().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

