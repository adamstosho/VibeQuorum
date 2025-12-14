// Script to find the correct contract addresses from RewardManager
require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.RPC_URL;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;

async function findAddresses() {
  console.log('🔍 Finding Contract Addresses from RewardManager...\n');
  
  if (!RPC_URL || !REWARD_MANAGER_ADDRESS) {
    console.log('❌ RPC_URL or REWARD_MANAGER_ADDRESS not set');
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Check if RewardManager exists
  const managerCode = await provider.getCode(REWARD_MANAGER_ADDRESS);
  if (managerCode === '0x' || managerCode === '0x0') {
    console.log(`❌ RewardManager contract does not exist at ${REWARD_MANAGER_ADDRESS}`);
    console.log('\n💡 Please deploy contracts first:');
    console.log('   cd contracts');
    console.log('   npx hardhat run scripts/deploy.js --network <network>');
    return;
  }
  
  console.log(`✅ RewardManager exists at: ${REWARD_MANAGER_ADDRESS}\n`);
  
  // Try different ABI variations to find VibeToken address
  const possibleABIs = [
    // Standard RewardManager ABI
    ['function vibeToken() external view returns (address)'],
    ['function VIBE_TOKEN() external view returns (address)'],
    ['function token() external view returns (address)'],
    // Full ABI attempt
    [
      'function vibeToken() external view returns (address)',
      'function acceptedAnswerReward() external view returns (uint256)',
      'function upvoteReward() external view returns (uint256)',
    ],
  ];
  
  let vibeTokenAddress = null;
  
  for (const abi of possibleABIs) {
    try {
      const contract = new ethers.Contract(REWARD_MANAGER_ADDRESS, abi, provider);
      const address = await contract.vibeToken();
      if (address && address !== ethers.ZeroAddress) {
        vibeTokenAddress = address;
        console.log(`✅ Found VibeToken address: ${address}`);
        break;
      }
    } catch (error) {
      // Try next ABI
      continue;
    }
  }
  
  if (!vibeTokenAddress) {
    console.log('⚠️  Could not find VibeToken address from RewardManager');
    console.log('\n💡 Please check your deployment logs for the VibeToken address');
    console.log('   Or check the block explorer for the RewardManager deployment transaction');
    return;
  }
  
  // Verify VibeToken exists
  console.log(`\n🔍 Verifying VibeToken at ${vibeTokenAddress}...`);
  const tokenCode = await provider.getCode(vibeTokenAddress);
  if (tokenCode === '0x' || tokenCode === '0x0') {
    console.log(`❌ VibeToken does not exist at ${vibeTokenAddress}`);
    console.log('\n⚠️  The RewardManager points to a VibeToken that does not exist!');
    console.log('   You may need to redeploy both contracts.');
    return;
  }
  
  console.log(`✅ VibeToken exists at: ${vibeTokenAddress}`);
  
  // Try to read token name
  try {
    const TOKEN_ABI = ['function name() external view returns (string)'];
    const token = new ethers.Contract(vibeTokenAddress, TOKEN_ABI, provider);
    const name = await token.name();
    console.log(`✅ Token name: ${name}`);
  } catch (error) {
    console.log(`⚠️  Could not read token name: ${error.message}`);
  }
  
  // Check roles
  console.log('\n🔍 Checking Roles...');
  try {
    const TOKEN_ABI = [
      'function MINTER_ROLE() external view returns (bytes32)',
      'function hasRole(bytes32 role, address account) external view returns (bool)',
    ];
    const token = new ethers.Contract(vibeTokenAddress, TOKEN_ABI, provider);
    const MINTER_ROLE = await token.MINTER_ROLE();
    const hasMinterRole = await token.hasRole(MINTER_ROLE, REWARD_MANAGER_ADDRESS);
    console.log(`   ${hasMinterRole ? '✅' : '❌'} RewardManager has MINTER_ROLE: ${hasMinterRole}`);
    
    if (!hasMinterRole) {
      console.log('\n⚠️  WARNING: RewardManager does not have MINTER_ROLE!');
      console.log('   You need to grant MINTER_ROLE to RewardManager.');
      console.log('\n   Run:');
      console.log('   cd contracts');
      console.log('   npx hardhat run scripts/verify-roles.js --network <network>');
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check roles: ${error.message}`);
  }
  
  // Output configuration
  console.log('\n' + '='.repeat(60));
  console.log('📋 Update Your .env Files:');
  console.log('='.repeat(60));
  console.log('\nbackend/.env:');
  console.log(`VIBE_TOKEN_ADDRESS=${vibeTokenAddress}`);
  console.log(`REWARD_MANAGER_ADDRESS=${REWARD_MANAGER_ADDRESS}`);
  console.log('\nVibeQuorum-frontend/.env.local:');
  console.log(`NEXT_PUBLIC_VIBE_TOKEN_ADDRESS=${vibeTokenAddress}`);
  console.log(`NEXT_PUBLIC_REWARD_MANAGER_ADDRESS=${REWARD_MANAGER_ADDRESS}`);
  console.log('\n' + '='.repeat(60));
}

findAddresses().catch(console.error);
