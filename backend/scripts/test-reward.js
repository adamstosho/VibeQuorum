// Test if reward can be triggered
require('dotenv').config();
const { ethers } = require('ethers');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const RPC_URL = process.env.RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;

async function testReward() {
  console.log('🧪 Testing Reward System...\n');
  
  // Connect to MongoDB
  await mongoose.connect(MONGODB_URI);
  const Answer = mongoose.model('Answer', new mongoose.Schema({}, { strict: false }));
  
  // Get a pending answer
  const pendingAnswer = await Answer.findOne({ 
    isAccepted: true,
    $or: [
      { txHashes: { $size: 0 } },
      { txHashes: { $exists: false } }
    ]
  }).lean();
  
  if (!pendingAnswer) {
    console.log('❌ No pending answers found');
    await mongoose.disconnect();
    return;
  }
  
  console.log(`Found pending answer: ${pendingAnswer._id}`);
  console.log(`Author: ${pendingAnswer.author}\n`);
  
  // Test contract interaction
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  
  const REWARD_MANAGER_ABI = [
    'function generateAnswerIdFromString(string calldata answerIdString) external pure returns (bytes32)',
    'function isAnswerRewarded(bytes32 answerId) external view returns (bool)',
    'function acceptedAnswerReward() external view returns (uint256)',
  ];
  
  try {
    const rewardManager = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, wallet);
    
    // Test 1: Generate answer ID
    console.log('Test 1: Generating answer ID...');
    const answerIdBytes = await rewardManager.generateAnswerIdFromString(pendingAnswer._id.toString());
    console.log(`   ✅ Answer ID: ${answerIdBytes}\n`);
    
    // Test 2: Check if already rewarded
    console.log('Test 2: Checking if already rewarded...');
    const isRewarded = await rewardManager.isAnswerRewarded(answerIdBytes);
    console.log(`   ${isRewarded ? '⚠️  Already rewarded' : '✅ Not rewarded yet'}\n`);
    
    // Test 3: Get reward amount
    console.log('Test 3: Getting reward amount...');
    const rewardAmount = await rewardManager.acceptedAnswerReward();
    console.log(`   ✅ Reward amount: ${ethers.formatEther(rewardAmount)} VIBE\n`);
    
    console.log('✅ All contract calls successful!');
    console.log('💡 The reward system should work. Try triggering a reward from admin panel.');
    
  } catch (error) {
    console.log(`❌ Error testing contract: ${error.message}`);
    if (error.message.includes('ADMIN_ROLE') || error.message.includes('REWARDER_ROLE')) {
      console.log('   ⚠️  Admin wallet may not have the required role');
    }
  }
  
  await mongoose.disconnect();
}

testReward().catch(console.error);
