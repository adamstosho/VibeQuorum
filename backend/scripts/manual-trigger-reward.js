// Manually trigger a reward to test the flow
require('dotenv').config();
const mongoose = require('mongoose');
const { ethers } = require('ethers');

const MONGODB_URI = process.env.MONGODB_URI;
const RPC_URL = process.env.RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;

const REWARD_MANAGER_ABI = [
  'function rewardAcceptedAnswer(address recipient, bytes32 answerId, uint256 questionId) external',
  'function generateAnswerIdFromString(string calldata answerIdString) external pure returns (bytes32)',
  'function acceptedAnswerReward() external view returns (uint256)',
  'function isAnswerRewarded(bytes32 answerId) external view returns (bool)',
];

async function triggerReward() {
  console.log('🧪 Manually Triggering Reward...\n');
  
  await mongoose.connect(MONGODB_URI);
  const Answer = mongoose.model('Answer', new mongoose.Schema({}, { strict: false }));
  const RewardLog = mongoose.model('RewardLog', new mongoose.Schema({}, { strict: false }));
  
  // Get first pending answer (no successful tx hash)
  const acceptedAnswers = await Answer.find({ isAccepted: true }).lean();
  const pendingAnswer = acceptedAnswers.find(a => {
    const txHashes = a.txHashes && Array.isArray(a.txHashes) ? a.txHashes : [];
    const successfulHashes = txHashes.filter(h => h && h !== 'failed' && h.length > 10);
    return successfulHashes.length === 0;
  });
  
  if (!pendingAnswer) {
    console.log('❌ No pending answers found');
    await mongoose.disconnect();
    return;
  }
  
  console.log(`Found pending answer: ${pendingAnswer._id}`);
  console.log(`Author: ${pendingAnswer.author}`);
  console.log(`Question ID: ${pendingAnswer.questionId}`);
  console.log(`Current txHashes: ${JSON.stringify(pendingAnswer.txHashes || [])}`);
  console.log(`Current vibeReward: ${pendingAnswer.vibeReward || 0}\n`);
  
  // Validate address
  if (!ethers.isAddress(pendingAnswer.author)) {
    console.log(`❌ Invalid author address: ${pendingAnswer.author}`);
    await mongoose.disconnect();
    return;
  }
  
  const recipientAddress = ethers.getAddress(pendingAnswer.author.toLowerCase());
  console.log(`Recipient: ${recipientAddress}\n`);
  
  try {
    // Setup blockchain connection
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const rewardManager = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, wallet);
    
    // Generate answer ID hash
    const answerIdBytes = await rewardManager.generateAnswerIdFromString(pendingAnswer._id.toString());
    
    // Convert question ID to uint256
    const questionIdHex = pendingAnswer.questionId.toString();
    const questionIdNum = BigInt('0x' + questionIdHex.slice(-16) || '0');
    
    // Check if already rewarded
    const isRewarded = await rewardManager.isAnswerRewarded(answerIdBytes);
    if (isRewarded) {
      console.log('⚠️  Answer already rewarded on-chain');
      await mongoose.disconnect();
      return;
    }
    
    // Get reward amount
    const rewardAmount = await rewardManager.acceptedAnswerReward();
    console.log(`Reward amount: ${ethers.formatEther(rewardAmount)} VIBE\n`);
    
    console.log('📤 Sending reward transaction...');
    console.log(`   Recipient: ${recipientAddress}`);
    console.log(`   Answer ID: ${pendingAnswer._id}`);
    console.log(`   Answer ID (bytes32): ${answerIdBytes}`);
    console.log(`   Question ID: ${questionIdNum.toString()}\n`);
    
    // Send transaction
    const tx = await rewardManager.rewardAcceptedAnswer(
      recipientAddress,
      answerIdBytes,
      questionIdNum
    );
    
    console.log(`✅ Transaction sent: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...\n');
    
    const receipt = await tx.wait();
    const txHash = receipt.hash;
    
    console.log(`✅ Transaction confirmed!`);
    console.log(`   TxHash: ${txHash}`);
    console.log(`   Block: ${receipt.blockNumber}\n`);
    
    // Save reward log
    await RewardLog.create({
      answerId: pendingAnswer._id,
      recipient: recipientAddress.toLowerCase(),
      rewardType: 'accepted_answer',
      amount: rewardAmount.toString(),
      txHash,
      status: 'confirmed',
    });
    
    // Update answer
    const rewardAmountInVibe = Number(ethers.formatEther(rewardAmount));
    await Answer.findByIdAndUpdate(pendingAnswer._id, {
      $push: { txHashes: txHash },
      $inc: { vibeReward: rewardAmountInVibe },
    });
    
    // Check final state
    const updatedAnswer = await Answer.findById(pendingAnswer._id).lean();
    console.log('📊 Final state:');
    console.log(`   txHashes: ${JSON.stringify(updatedAnswer.txHashes || [])}`);
    console.log(`   vibeReward: ${updatedAnswer.vibeReward || 0}`);
    
    console.log('\n✅ Reward processed successfully!');
    
  } catch (error) {
    console.log(`\n❌ Error triggering reward: ${error.message}`);
    if (error.reason) {
      console.log(`   Reason: ${error.reason}`);
    }
    if (error.stack) {
      console.log(`   Stack: ${error.stack}`);
    }
    
    // Save failed reward log
    try {
      await RewardLog.create({
        answerId: pendingAnswer._id,
        recipient: recipientAddress.toLowerCase(),
        rewardType: 'accepted_answer',
        amount: '0',
        txHash: 'failed',
        status: 'failed',
        error: error.message,
      });
      
      await Answer.findByIdAndUpdate(pendingAnswer._id, {
        $push: { txHashes: 'failed' },
      });
    } catch (logError) {
      console.log(`   Failed to save error log: ${logError.message}`);
    }
  }
  
  await mongoose.disconnect();
}

triggerReward().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
