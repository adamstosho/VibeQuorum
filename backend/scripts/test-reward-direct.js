// Test reward directly using the service
require('dotenv').config();
const mongoose = require('mongoose');
const { ethers } = require('ethers');

const MONGODB_URI = process.env.MONGODB_URI;
const RPC_URL = process.env.RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;
const VIBE_TOKEN_ADDRESS = process.env.VIBE_TOKEN_ADDRESS;

async function testReward() {
  console.log('🧪 Testing Reward Directly...\n');
  
  await mongoose.connect(MONGODB_URI);
  const Answer = mongoose.model('Answer', new mongoose.Schema({}, { strict: false }));
  const RewardLog = mongoose.model('RewardLog', new mongoose.Schema({}, { strict: false }));
  
  // Get first pending answer
  const answer = await Answer.findById('693be0435c1fbe1372818049').lean();
  if (!answer) {
    console.log('Answer not found');
    await mongoose.disconnect();
    return;
  }
  
  console.log(`Answer ID: ${answer._id}`);
  console.log(`Author: ${answer.author}`);
  console.log(`isAccepted: ${answer.isAccepted}`);
  console.log(`Current txHashes: ${JSON.stringify(answer.txHashes || [])}\n`);
  
  // Check if already rewarded
  const existingReward = await RewardLog.findOne({
    answerId: answer._id,
    rewardType: 'accepted_answer',
    status: 'confirmed',
  });
  
  if (existingReward && existingReward.txHash !== 'failed') {
    console.log('✅ Already rewarded!');
    await mongoose.disconnect();
    return;
  }
  
  // Delete failed reward log
  if (existingReward && existingReward.status === 'failed') {
    console.log('Deleting failed reward log...');
    await RewardLog.deleteOne({ _id: existingReward._id });
  }
  
  // Test contract interaction
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  
  const REWARD_MANAGER_ABI = [
    'function rewardAcceptedAnswer(address recipient, bytes32 answerId, uint256 questionId) external',
    'function generateAnswerIdFromString(string calldata answerIdString) external pure returns (bytes32)',
    'function isAnswerRewarded(bytes32 answerId) external view returns (bool)',
    'function acceptedAnswerReward() external view returns (uint256)',
  ];
  
  try {
    const rewardManager = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, wallet);
    
    // Generate answer ID
    console.log('1. Generating answer ID...');
    const answerIdBytes = await rewardManager.generateAnswerIdFromString(answer._id.toString());
    console.log(`   ✅ Answer ID bytes: ${answerIdBytes}\n`);
    
    // Check if already rewarded
    console.log('2. Checking if already rewarded...');
    const isRewarded = await rewardManager.isAnswerRewarded(answerIdBytes);
    console.log(`   ${isRewarded ? '⚠️  Already rewarded on-chain' : '✅ Not rewarded yet'}\n`);
    
    if (isRewarded) {
      console.log('⚠️  Answer already rewarded on-chain. Cannot reward again.');
      await mongoose.disconnect();
      return;
    }
    
    // Get reward amount
    console.log('3. Getting reward amount...');
    const rewardAmount = await rewardManager.acceptedAnswerReward();
    console.log(`   ✅ Reward amount: ${ethers.formatEther(rewardAmount)} VIBE\n`);
    
    // Convert question ID
    const questionIdHex = answer.questionId.toString();
    const questionIdNum = BigInt('0x' + questionIdHex.slice(-16) || '0');
    console.log(`4. Question ID: ${questionIdNum.toString()}\n`);
    
    // Send transaction
    console.log('5. Sending reward transaction...');
    console.log(`   Recipient: ${answer.author}`);
    console.log(`   Answer ID: ${answerIdBytes}`);
    console.log(`   Question ID: ${questionIdNum.toString()}\n`);
    
    const tx = await rewardManager.rewardAcceptedAnswer(
      answer.author,
      answerIdBytes,
      questionIdNum
    );
    
    console.log(`   ✅ Transaction sent: ${tx.hash}`);
    console.log('   Waiting for confirmation...\n');
    
    const receipt = await tx.wait();
    const txHash = receipt.hash;
    console.log(`   ✅ Transaction confirmed: ${txHash}\n`);
    
    // Update answer
    console.log('6. Updating answer in database...');
    const rewardAmountInVibe = Number(ethers.formatEther(rewardAmount));
    await Answer.findByIdAndUpdate(answer._id, {
      $push: { txHashes: txHash },
      $inc: { vibeReward: rewardAmountInVibe },
    });
    
    // Create reward log
    await RewardLog.create({
      answerId: answer._id,
      recipient: answer.author,
      rewardType: 'accepted_answer',
      amount: rewardAmount.toString(),
      txHash,
      status: 'confirmed',
    });
    
    console.log('   ✅ Answer updated!');
    console.log(`   txHashes: [${txHash}]`);
    console.log(`   vibeReward: ${rewardAmountInVibe}\n`);
    
    // Verify
    const updated = await Answer.findById(answer._id).lean();
    console.log('7. Verification:');
    console.log(`   txHashes: ${JSON.stringify(updated.txHashes)}`);
    console.log(`   vibeReward: ${updated.vibeReward}\n`);
    
    if (updated.txHashes && updated.txHashes.length > 0) {
      console.log('✅ SUCCESS! Answer updated with transaction hash!');
    } else {
      console.log('❌ FAILED! Answer not updated!');
    }
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
    
    // Save failed log
    await RewardLog.create({
      answerId: answer._id,
      recipient: answer.author,
      rewardType: 'accepted_answer',
      amount: '0',
      txHash: 'failed',
      status: 'failed',
      error: error.message,
    });
  }
  
  await mongoose.disconnect();
}

testReward().catch(console.error);
