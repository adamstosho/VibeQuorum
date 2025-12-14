// Script to verify and fix contract addresses
require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.RPC_URL;
const VIBE_TOKEN_ADDRESS = process.env.VIBE_TOKEN_ADDRESS;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;

async function verify() {
  console.log('🔍 Verifying Contract Addresses...\n');
  
  if (!RPC_URL) {
    console.log('❌ RPC_URL not set');
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log('Current Configuration:');
  console.log(`  VIBE_TOKEN_ADDRESS: ${VIBE_TOKEN_ADDRESS}`);
  console.log(`  REWARD_MANAGER_ADDRESS: ${REWARD_MANAGER_ADDRESS}\n`);
  
  // Check VibeToken
  console.log('1️⃣ Checking VibeToken:');
  if (VIBE_TOKEN_ADDRESS) {
    const tokenCode = await provider.getCode(VIBE_TOKEN_ADDRESS);
    if (tokenCode === '0x' || tokenCode === '0x0') {
      console.log(`   ❌ No contract at ${VIBE_TOKEN_ADDRESS}`);
    } else {
      console.log(`   ✅ Contract exists at ${VIBE_TOKEN_ADDRESS}`);
      
      // Try to read token name
      try {
        const VIBE_TOKEN_ABI = ['function name() external view returns (string)'];
        const token = new ethers.Contract(VIBE_TOKEN_ADDRESS, VIBE_TOKEN_ABI, provider);
        const name = await token.name();
        console.log(`   ✅ Token name: ${name}`);
      } catch (error) {
        console.log(`   ⚠️  Could not read token name: ${error.message}`);
      }
    }
  } else {
    console.log('   ❌ VIBE_TOKEN_ADDRESS not set');
  }
  
  // Check RewardManager
  console.log('\n2️⃣ Checking RewardManager:');
  if (REWARD_MANAGER_ADDRESS) {
    const managerCode = await provider.getCode(REWARD_MANAGER_ADDRESS);
    if (managerCode === '0x' || managerCode === '0x0') {
      console.log(`   ❌ No contract at ${REWARD_MANAGER_ADDRESS}`);
    } else {
      console.log(`   ✅ Contract exists at ${REWARD_MANAGER_ADDRESS}`);
      
      // Try to read the VibeToken address from RewardManager
      try {
        const REWARD_MANAGER_ABI = ['function vibeToken() external view returns (address)'];
        const manager = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, provider);
        const tokenAddress = await manager.vibeToken();
        console.log(`   ✅ RewardManager's vibeToken(): ${tokenAddress}`);
        
        if (tokenAddress.toLowerCase() !== VIBE_TOKEN_ADDRESS?.toLowerCase()) {
          console.log(`   ⚠️  WARNING: RewardManager points to different VibeToken!`);
          console.log(`      Expected: ${VIBE_TOKEN_ADDRESS}`);
          console.log(`      Actual:   ${tokenAddress}`);
          console.log(`\n   💡 Update VIBE_TOKEN_ADDRESS to: ${tokenAddress}`);
        } else {
          console.log(`   ✅ Addresses match!`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not read vibeToken address: ${error.message}`);
      }
    }
  } else {
    console.log('   ❌ REWARD_MANAGER_ADDRESS not set');
  }
  
  // Check roles
  console.log('\n3️⃣ Checking Roles:');
  if (VIBE_TOKEN_ADDRESS && REWARD_MANAGER_ADDRESS) {
    try {
      const VIBE_TOKEN_ABI = [
        'function MINTER_ROLE() external view returns (bytes32)',
        'function hasRole(bytes32 role, address account) external view returns (bool)',
      ];
      const token = new ethers.Contract(VIBE_TOKEN_ADDRESS, VIBE_TOKEN_ABI, provider);
      const MINTER_ROLE = await token.MINTER_ROLE();
      const hasMinterRole = await token.hasRole(MINTER_ROLE, REWARD_MANAGER_ADDRESS);
      console.log(`   ${hasMinterRole ? '✅' : '❌'} RewardManager has MINTER_ROLE: ${hasMinterRole}`);
      
      if (!hasMinterRole) {
        console.log(`   ⚠️  WARNING: RewardManager cannot mint tokens!`);
        console.log(`   💡 Run: npx hardhat run scripts/verify-roles.js --network <network>`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking roles: ${error.message}`);
    }
  }
  
  console.log('\n✅ Verification complete!');
}

verify().catch(console.error);
