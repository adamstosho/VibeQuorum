// Comprehensive test of reward flow
require('dotenv').config();
const { ethers } = require('ethers');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const RPC_URL = process.env.RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;
const VIBE_TOKEN_ADDRESS = process.env.VIBE_TOKEN_ADDRESS;

async function testRewardFlow() {
  console.log('🧪 Testing Complete Reward Flow...\n');
  
  // 1. Check network
  console.log('1️⃣ Checking Network...');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const network = await provider.getNetwork();
  console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
  if (Number(network.chainId) !== 84532) {
    console.log('   ❌ Wrong network! Should be Base Sepolia (84532)');
    return;
  }
  console.log('   ✅ Correct network\n');
  
  // 2. Check contracts exist
  console.log('2️⃣ Checking Contracts...');
  const tokenCode = await provider.getCode(VIBE_TOKEN_ADDRESS);
  const managerCode = await provider.getCode(REWARD_MANAGER_ADDRESS);
  
  if (tokenCode === '0x' || tokenCode === '0x0') {
    console.log(`   ❌ VibeToken does not exist at ${VIBE_TOKEN_ADDRESS}`);
    return;
  }
  console.log('   ✅ VibeToken exists');
  
  if (managerCode === '0x' || managerCode === '0x0') {
    console.log(`   ❌ RewardManager does not exist at ${REWARD_MANAGER_ADDRESS}`);
    return;
  }
  console.log('   ✅ RewardManager exists\n');
  
  // 3. Check admin wallet
  console.log('3️⃣ Checking Admin Wallet...');
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`   Address: ${wallet.address}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
  if (balance === 0n) {
    console.log('   ❌ No ETH! Cannot send transactions');
    return;
  }
  console.log('   ✅ Has ETH\n');
  
  // 4. Check roles
  console.log('4️⃣ Checking Roles...');
  const VIBE_TOKEN_ABI = [
    'function MINTER_ROLE() external view returns (bytes32)',
    'function hasRole(bytes32 role, address account) external view returns (bool)',
  ];
  const REWARD_MANAGER_ABI = [
    'function ADMIN_ROLE() external view returns (bytes32)',
    'function hasRole(bytes32 role, address account) external view returns (bool)',
    'function generateAnswerIdFromString(string calldata) external pure returns (bytes32)',
    'function acceptedAnswerReward() external view returns (uint256)',
  ];
  
  try {
    const token = new ethers.Contract(VIBE_TOKEN_ADDRESS, VIBE_TOKEN_ABI, provider);
    const MINTER_ROLE = await token.MINTER_ROLE();
    const hasMinterRole = await token.hasRole(MINTER_ROLE, REWARD_MANAGER_ADDRESS);
    console.log(`   ${hasMinterRole ? '✅' : '❌'} RewardManager has MINTER_ROLE: ${hasMinterRole}`);
    
    const manager = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, provider);
    const ADMIN_ROLE = await manager.ADMIN_ROLE();
    const hasAdminRole = await manager.hasRole(ADMIN_ROLE, wallet.address);
    console.log(`   ${hasAdminRole ? '✅' : '❌'} Admin wallet has ADMIN_ROLE: ${hasAdminRole}`);
    
    if (!hasMinterRole || !hasAdminRole) {
      console.log('\n   ⚠️  Roles not set correctly!');
      return;
    }
  } catch (error) {
    console.log(`   ❌ Error checking roles: ${error.message}`);
    return;
  }
  console.log('   ✅ All roles set correctly\n');
  
  // 5. Test contract functions
  console.log('5️⃣ Testing Contract Functions...');
  try {
    const manager = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, wallet);
    
    // Test generateAnswerIdFromString
    const testAnswerId = '693be0435c1fbe1372818049';
    const answerIdBytes = await manager.generateAnswerIdFromString(testAnswerId);
    console.log(`   ✅ generateAnswerIdFromString works: ${answerIdBytes}`);
    
    // Test acceptedAnswerReward
    const rewardAmount = await manager.acceptedAnswerReward();
    console.log(`   ✅ acceptedAnswerReward: ${ethers.formatEther(rewardAmount)} VIBE`);
    
  } catch (error) {
    console.log(`   ❌ Error testing functions: ${error.message}`);
    return;
  }
  console.log('   ✅ Contract functions work\n');
  
  // 6. Check pending rewards
  console.log('6️⃣ Checking Pending Rewards...');
  await mongoose.connect(MONGODB_URI);
  const Answer = mongoose.model('Answer', new mongoose.Schema({}, { strict: false }));
  const pendingAnswers = await Answer.find({ 
    isAccepted: true,
    $or: [
      { txHashes: { $size: 0 } },
      { txHashes: { $exists: false } }
    ]
  }).lean();
  
  console.log(`   Found ${pendingAnswers.length} pending rewards`);
  if (pendingAnswers.length > 0) {
    console.log('   ✅ Ready to trigger rewards from admin panel\n');
  } else {
    console.log('   ✅ No pending rewards\n');
  }
  
  await mongoose.disconnect();
  
  console.log('='.repeat(60));
  console.log('✅ ALL CHECKS PASSED!');
  console.log('='.repeat(60));
  console.log('\n💡 Next Steps:');
  console.log('   1. Restart backend server');
  console.log('   2. Restart frontend server');
  console.log('   3. Go to admin panel');
  console.log('   4. Trigger pending rewards');
  console.log('   5. Should work perfectly! 🚀\n');
}

testRewardFlow().catch(console.error);
