// Script to find the correct VibeToken address
require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.RPC_URL;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;

async function findVibeToken() {
  console.log('🔍 Finding VibeToken Address...\n');
  
  if (!RPC_URL || !REWARD_MANAGER_ADDRESS) {
    console.log('❌ Missing RPC_URL or REWARD_MANAGER_ADDRESS');
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log(`RewardManager Address: ${REWARD_MANAGER_ADDRESS}\n`);
  
  // Method 1: Try to read from RewardManager contract
  console.log('Method 1: Reading from RewardManager contract...');
  const possibleABIs = [
    // Try different function names
    ['function vibeToken() external view returns (address)'],
    ['function VIBE_TOKEN() external view returns (address)'],
    ['function token() external view returns (address)'],
    ['function getVibeToken() external view returns (address)'],
  ];
  
  for (const abi of possibleABIs) {
    try {
      const contract = new ethers.Contract(REWARD_MANAGER_ADDRESS, abi, provider);
      const address = await contract.vibeToken();
      if (address && address !== ethers.ZeroAddress) {
        console.log(`   ✅ Found VibeToken: ${address}`);
        verifyAddress(address, provider);
        return address;
      }
    } catch (error) {
      // Try next method
    }
  }
  console.log('   ❌ Could not read from contract\n');
  
  // Method 2: Check deployment transaction
  console.log('Method 2: Checking deployment transaction...');
  try {
    // Get the contract creation transaction
    const network = await provider.getNetwork();
    const blockExplorer = getBlockExplorer(network.chainId);
    
    console.log(`   📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`   🔗 Block Explorer: ${blockExplorer}`);
    console.log(`   📋 Search for: ${REWARD_MANAGER_ADDRESS}`);
    console.log(`   💡 Look at the deployment transaction (Contract Creation)`);
    console.log(`   💡 Check the constructor parameters - first parameter is VibeToken address\n`);
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}\n`);
  }
  
  // Method 3: Check for deployment artifacts
  console.log('Method 3: Checking for deployment artifacts...');
  const fs = require('fs');
  const path = require('path');
  
  const possiblePaths = [
    path.join(__dirname, '../../contracts/deployments.json'),
    path.join(__dirname, '../../contracts/.deployments'),
    path.join(__dirname, '../../contracts/artifacts'),
    path.join(__dirname, '../../deployments.json'),
  ];
  
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        
        // Try to find VibeToken address
        if (json.VibeToken || json.vibeToken || json.contracts?.VibeToken) {
          const address = json.VibeToken || json.vibeToken || json.contracts?.VibeToken;
          console.log(`   ✅ Found in ${filePath}: ${address}`);
          verifyAddress(address, provider);
          return address;
        }
      }
    } catch (error) {
      // File doesn't exist or not JSON
    }
  }
  console.log('   ❌ No deployment artifacts found\n');
  
  // Method 4: Check hardhat deployments
  console.log('Method 4: Checking Hardhat deployments...');
  try {
    const deploymentsPath = path.join(__dirname, '../../contracts/deployments');
    if (fs.existsSync(deploymentsPath)) {
      const networks = fs.readdirSync(deploymentsPath);
      for (const networkDir of networks) {
        const networkPath = path.join(deploymentsPath, networkDir);
        if (fs.statSync(networkPath).isDirectory()) {
          const files = fs.readdirSync(networkPath);
          for (const file of files) {
            if (file.includes('VibeToken') || file.includes('vibeToken')) {
              const filePath = path.join(networkPath, file);
              const content = fs.readFileSync(filePath, 'utf8');
              const json = JSON.parse(content);
              if (json.address) {
                console.log(`   ✅ Found in Hardhat deployments: ${json.address}`);
                verifyAddress(json.address, provider);
                return json.address;
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // No hardhat deployments
  }
  console.log('   ❌ No Hardhat deployments found\n');
  
  console.log('❌ Could not find VibeToken address automatically\n');
  console.log('💡 Next Steps:');
  console.log('   1. Check your deployment output/console logs');
  console.log('   2. Check block explorer for RewardManager deployment');
  console.log('   3. Redeploy contracts and save the addresses');
  console.log('\n   To redeploy:');
  console.log('   cd contracts');
  console.log('   npx hardhat run scripts/deploy.js --network <your-network>');
}

function verifyAddress(address, provider) {
  console.log(`\n🔍 Verifying address ${address}...`);
  provider.getCode(address).then(code => {
    if (code === '0x' || code === '0x0') {
      console.log(`   ❌ No contract at this address`);
    } else {
      console.log(`   ✅ Contract exists!`);
      // Try to read token name
      const TOKEN_ABI = ['function name() external view returns (string)'];
      const token = new ethers.Contract(address, TOKEN_ABI, provider);
      token.name().then(name => {
        console.log(`   ✅ Token name: ${name}`);
        console.log(`\n📋 Update your .env files:`);
        console.log(`   VIBE_TOKEN_ADDRESS=${address}`);
      }).catch(() => {
        console.log(`   ⚠️  Could not read token name, but contract exists`);
        console.log(`\n📋 Update your .env files:`);
        console.log(`   VIBE_TOKEN_ADDRESS=${address}`);
      });
    }
  }).catch(error => {
    console.log(`   ❌ Error verifying: ${error.message}`);
  });
}

function getBlockExplorer(chainId) {
  const explorers = {
    84532: 'https://sepolia.basescan.org', // Base Sepolia
    11155111: 'https://sepolia.etherscan.io', // Sepolia
    97: 'https://testnet.bscscan.com', // BSC Testnet
    8453: 'https://basescan.org', // Base Mainnet
    1: 'https://etherscan.io', // Ethereum Mainnet
    56: 'https://bscscan.com', // BSC Mainnet
  };
  return explorers[Number(chainId)] || 'https://explorer.unknown';
}

findVibeToken().catch(console.error);
