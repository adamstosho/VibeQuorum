/**
 * VibeQuorum Smart Contract Deployment Script
 * 
 * This script deploys both VibeToken and RewardManager contracts
 * with proper configuration and role setup.
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.js --network <network-name>
 * 
 * Networks:
 *   - localhost (for local testing)
 *   - sepolia (Ethereum testnet)
 *   - bscTestnet (BNB Chain testnet)
 *   - polygonMumbai (Polygon testnet)
 */

const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("VibeQuorum Contract Deployment");
  console.log("========================================\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("Deploying contracts with account:", deployerAddress);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployerAddress)), "ETH\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("");

  // ========================================
  // Deploy VibeToken
  // ========================================
  console.log("1. Deploying VibeToken...");
  
  const VibeToken = await hre.ethers.getContractFactory("VibeToken");
  const vibeToken = await VibeToken.deploy(deployerAddress);
  await vibeToken.waitForDeployment();
  
  const vibeTokenAddress = await vibeToken.getAddress();
  console.log("   VibeToken deployed to:", vibeTokenAddress);
  console.log("");

  // ========================================
  // Deploy RewardManager
  // ========================================
  console.log("2. Deploying RewardManager...");
  
  // Emergency address - in production, use a multisig
  const emergencyAddress = deployerAddress;
  
  const RewardManager = await hre.ethers.getContractFactory("RewardManager");
  const rewardManager = await RewardManager.deploy(
    vibeTokenAddress,
    deployerAddress,
    emergencyAddress
  );
  await rewardManager.waitForDeployment();
  
  const rewardManagerAddress = await rewardManager.getAddress();
  console.log("   RewardManager deployed to:", rewardManagerAddress);
  console.log("");

  // ========================================
  // Configure Roles
  // ========================================
  console.log("3. Configuring roles...");
  
  // Grant MINTER_ROLE to RewardManager so it can mint tokens
  const MINTER_ROLE = await vibeToken.MINTER_ROLE();
  const grantTx = await vibeToken.grantRole(MINTER_ROLE, rewardManagerAddress);
  await grantTx.wait();
  
  console.log("   Granted MINTER_ROLE to RewardManager");
  console.log("");

  // ========================================
  // Verify Configuration
  // ========================================
  console.log("4. Verifying configuration...");
  
  const hasMinterRole = await vibeToken.hasRole(MINTER_ROLE, rewardManagerAddress);
  console.log("   RewardManager has MINTER_ROLE:", hasMinterRole);
  
  const tokenName = await vibeToken.name();
  const tokenSymbol = await vibeToken.symbol();
  const maxSupply = await vibeToken.MAX_SUPPLY();
  
  console.log("   Token Name:", tokenName);
  console.log("   Token Symbol:", tokenSymbol);
  console.log("   Max Supply:", hre.ethers.formatEther(maxSupply), "VIBE");
  
  const rewardConfig = await rewardManager.getRewardConfig();
  console.log("   Accepted Answer Reward:", hre.ethers.formatEther(rewardConfig[0]), "VIBE");
  console.log("   Upvote Reward:", hre.ethers.formatEther(rewardConfig[1]), "VIBE");
  console.log("   Upvote Threshold:", rewardConfig[2].toString());
  console.log("   Questioner Bonus:", hre.ethers.formatEther(rewardConfig[3]), "VIBE");
  console.log("");

  // ========================================
  // Deployment Summary
  // ========================================
  console.log("========================================");
  console.log("Deployment Complete!");
  console.log("========================================");
  console.log("");
  console.log("Contract Addresses:");
  console.log("-------------------");
  console.log("VibeToken:", vibeTokenAddress);
  console.log("RewardManager:", rewardManagerAddress);
  console.log("");
  console.log("Admin Address:", deployerAddress);
  console.log("Emergency Address:", emergencyAddress);
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployerAddress,
    contracts: {
      VibeToken: vibeTokenAddress,
      RewardManager: rewardManagerAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  console.log("Deployment Info (save this):");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("");

  // ========================================
  // Verification Instructions
  // ========================================
  console.log("========================================");
  console.log("Contract Verification");
  console.log("========================================");
  console.log("");
  console.log("To verify contracts on block explorer, run:");
  console.log("");
  console.log(`npx hardhat verify --network ${network.name} ${vibeTokenAddress} "${deployerAddress}"`);
  console.log("");
  console.log(`npx hardhat verify --network ${network.name} ${rewardManagerAddress} "${vibeTokenAddress}" "${deployerAddress}" "${emergencyAddress}"`);
  console.log("");

  return deploymentInfo;
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

