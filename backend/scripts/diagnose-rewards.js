// Diagnostic script to check reward system
require('dotenv').config();
const mongoose = require('mongoose');
const { ethers } = require('ethers');

const MONGODB_URI = process.env.MONGODB_URI;
const RPC_URL = process.env.RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;
const VIBE_TOKEN_ADDRESS = process.env.VIBE_TOKEN_ADDRESS;

async function diagnose() {
  console.log('🔍 Diagnosing Reward System...\n');

  // 1. Check environment variables
  console.log('1️⃣ Checking Environment Variables:');
  const required = ['MONGODB_URI', 'RPC_URL', 'ADMIN_PRIVATE_KEY', 'ADMIN_WALLET_ADDRESS', 'REWARD_MANAGER_ADDRESS', 'VIBE_TOKEN_ADDRESS'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.log('   ❌ Missing:', missing.join(', '));
    return;
  }
  console.log('   ✅ All required env vars set');
  console.log(`   Admin wallet: ${process.env.ADMIN_WALLET_ADDRESS}`);

  // 2. Check MongoDB connection
  console.log('\n2️⃣ Checking MongoDB Connection:');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ MongoDB connected');
  } catch (error) {
    console.log('   ❌ MongoDB connection failed:', error.message);
    return;
  }

  // 3. Check for pending rewards
  console.log('\n3️⃣ Checking Pending Rewards:');
  const Answer = mongoose.model('Answer', new mongoose.Schema({}, { strict: false }));
  const RewardLog = mongoose.model('RewardLog', new mongoose.Schema({}, { strict: false }));
  
  const acceptedAnswers = await Answer.find({ isAccepted: true }).lean();
  console.log(`   Found ${acceptedAnswers.length} accepted answers`);
  
  const pendingAnswers = acceptedAnswers.filter(a => {
    const hasTxHash = (a.txHashes && Array.isArray(a.txHashes) && a.txHashes.length > 0) ||
                     (a.txHash && typeof a.txHash === 'string' && a.txHash.length > 0);
    return !hasTxHash;
  });
  console.log(`   ⚠️  ${pendingAnswers.length} answers without transaction hash (pending rewards)`);
  
  if (pendingAnswers.length > 0) {
    console.log('\n   Pending rewards details:');
    for (const answer of pendingAnswers.slice(0, 5)) {
      console.log(`   - Answer ID: ${answer._id}`);
      console.log(`     Author: ${answer.author}`);
      console.log(`     Question ID: ${answer.questionId}`);
      console.log(`     txHashes: ${JSON.stringify(answer.txHashes)}`);
      
      // Check RewardLog
      const rewardLogs = await RewardLog.find({ answerId: answer._id }).lean();
      console.log(`     RewardLog entries: ${rewardLogs.length}`);
      rewardLogs.forEach(log => {
        console.log(`       - Type: ${log.rewardType}, Status: ${log.status}, Error: ${log.error || 'none'}`);
      });
    }
  }

  // 4. Check blockchain connection
  console.log('\n4️⃣ Checking Blockchain Connection:');
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log(`   ✅ Connected to blockchain (block: ${blockNumber})`);
    
    // Check admin wallet
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    console.log(`   ✅ Admin wallet: ${wallet.address}`);
    
    const balance = await provider.getBalance(wallet.address);
    console.log(`   💰 Admin wallet balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance === 0n) {
      console.log('   ⚠️  WARNING: Admin wallet has no ETH! Cannot send transactions.');
    }
  } catch (error) {
    console.log('   ❌ Blockchain connection failed:', error.message);
    return;
  }

  // 5. Check contract addresses
  console.log('\n5️⃣ Checking Contract Addresses:');
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const code = await provider.getCode(REWARD_MANAGER_ADDRESS);
    if (code === '0x') {
      console.log(`   ❌ REWARD_MANAGER_ADDRESS (${REWARD_MANAGER_ADDRESS}) has no code!`);
    } else {
      console.log(`   ✅ RewardManager contract exists`);
    }
    
    const tokenCode = await provider.getCode(VIBE_TOKEN_ADDRESS);
    if (tokenCode === '0x') {
      console.log(`   ❌ VIBE_TOKEN_ADDRESS (${VIBE_TOKEN_ADDRESS}) has no code!`);
    } else {
      console.log(`   ✅ VibeToken contract exists`);
    }
  } catch (error) {
    console.log('   ❌ Error checking contracts:', error.message);
  }

  // 6. Check admin wallet roles
  console.log('\n6️⃣ Checking Admin Wallet Roles:');
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    
    // Check VibeToken MINTER_ROLE
    const VIBE_TOKEN_ABI = [
      'function MINTER_ROLE() external view returns (bytes32)',
      'function hasRole(bytes32 role, address account) external view returns (bool)',
    ];
    
    try {
      const vibeToken = new ethers.Contract(VIBE_TOKEN_ADDRESS, VIBE_TOKEN_ABI, provider);
      const MINTER_ROLE = await vibeToken.MINTER_ROLE();
      const hasMinterRole = await vibeToken.hasRole(MINTER_ROLE, REWARD_MANAGER_ADDRESS);
      console.log(`   ${hasMinterRole ? '✅' : '❌'} RewardManager has MINTER_ROLE on VibeToken: ${hasMinterRole}`);
      
      if (!hasMinterRole) {
        console.log('   ⚠️  WARNING: RewardManager does not have MINTER_ROLE!');
        console.log('   💡 Run: cd contracts && npx hardhat run scripts/verify-roles.js --network baseSepolia');
      }
    } catch (error) {
      console.log(`   ⚠️  Could not check MINTER_ROLE: ${error.message}`);
    }
    
    // Check RewardManager ADMIN_ROLE
    const REWARD_MANAGER_ABI = [
      'function ADMIN_ROLE() external view returns (bytes32)',
      'function hasRole(bytes32 role, address account) external view returns (bool)',
    ];
    
    try {
      const rewardManager = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, provider);
      const ADMIN_ROLE = await rewardManager.ADMIN_ROLE();
      const hasAdminRole = await rewardManager.hasRole(ADMIN_ROLE, wallet.address);
      console.log(`   ${hasAdminRole ? '✅' : '❌'} Admin wallet has ADMIN_ROLE on RewardManager: ${hasAdminRole}`);
      
      if (!hasAdminRole) {
        console.log('   ⚠️  WARNING: Admin wallet does not have ADMIN_ROLE! Cannot trigger rewards.');
        console.log('   💡 The deployer should have ADMIN_ROLE. Check if admin wallet matches deployer.');
      }
    } catch (error) {
      console.log(`   ⚠️  Could not check ADMIN_ROLE: ${error.message}`);
    }
  } catch (error) {
    console.log('   ❌ Error checking roles:', error.message);
  }

  await mongoose.disconnect();
  console.log('\n✅ Diagnosis complete!');
}

diagnose().catch(console.error);
