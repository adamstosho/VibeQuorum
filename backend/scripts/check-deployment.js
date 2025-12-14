// Script to check deployment and find correct addresses
require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.RPC_URL;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;

async function checkDeployment() {
  console.log('🔍 Checking Deployment Details...\n');
  
  if (!RPC_URL || !REWARD_MANAGER_ADDRESS) {
    console.log('❌ Missing configuration');
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Get the deployment transaction
  console.log('1️⃣ Checking RewardManager deployment transaction...');
  try {
    // Try to get contract creation transaction
    const code = await provider.getCode(REWARD_MANAGER_ADDRESS);
    if (code === '0x' || code === '0x0') {
      console.log('   ❌ Contract does not exist');
      return;
    }
    
    console.log(`   ✅ Contract exists at ${REWARD_MANAGER_ADDRESS}`);
    
    // Try to read using the actual RewardManager ABI
    const REWARD_MANAGER_ABI = [
      'function acceptedAnswerReward() external view returns (uint256)',
      'function upvoteReward() external view returns (uint256)',
      'function questionerBonus() external view returns (uint256)',
      'function upvoteThreshold() external view returns (uint256)',
    ];
    
    try {
      const contract = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, provider);
      const acceptedReward = await contract.acceptedAnswerReward();
      console.log(`   ✅ Contract is functional`);
      console.log(`   ✅ Accepted answer reward: ${ethers.formatEther(acceptedReward)} VIBE`);
    } catch (error) {
      console.log(`   ⚠️  Contract exists but may not be RewardManager: ${error.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n2️⃣ To find the correct VibeToken address:');
  console.log('   Option 1: Check your deployment logs');
  console.log('   Option 2: Check block explorer for deployment transaction');
  console.log('   Option 3: Redeploy both contracts together');
  
  console.log('\n3️⃣ Recommended: Redeploy Contracts');
  console.log('   cd contracts');
  console.log('   npx hardhat run scripts/deploy.js --network <your-network>');
  console.log('   Copy the addresses from the output');
  
  console.log('\n4️⃣ After getting addresses, update:');
  console.log('   backend/.env');
  console.log('   VibeQuorum-frontend/.env.local');
}

checkDeployment().catch(console.error);
