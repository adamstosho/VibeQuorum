/**
 * Verify and Fix Contract Roles
 * 
 * This script verifies that RewardManager has MINTER_ROLE on VibeToken
 * and grants it if missing.
 * 
 * Usage:
 *   npx hardhat run scripts/verify-roles.js --network <network-name>
 */

const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Verifying Contract Roles");
  console.log("========================================\n");

  // Get contract addresses from environment or deployment file
  const VIBE_TOKEN_ADDRESS = process.env.VIBE_TOKEN_ADDRESS;
  const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;

  if (!VIBE_TOKEN_ADDRESS || !REWARD_MANAGER_ADDRESS) {
    console.error("❌ Error: Contract addresses not set in environment");
    console.error("   Set VIBE_TOKEN_ADDRESS and REWARD_MANAGER_ADDRESS");
    process.exit(1);
  }

  console.log("VibeToken Address:", VIBE_TOKEN_ADDRESS);
  console.log("RewardManager Address:", REWARD_MANAGER_ADDRESS);
  console.log("");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Using account:", deployerAddress);
  console.log("");

  // Get contract instances
  const VibeToken = await hre.ethers.getContractFactory("VibeToken");
  const vibeToken = VibeToken.attach(VIBE_TOKEN_ADDRESS);

  // Check MINTER_ROLE
  const MINTER_ROLE = await vibeToken.MINTER_ROLE();
  const hasMinterRole = await vibeToken.hasRole(MINTER_ROLE, REWARD_MANAGER_ADDRESS);

  console.log("========================================");
  console.log("Role Verification Results");
  console.log("========================================");
  console.log("RewardManager has MINTER_ROLE:", hasMinterRole);
  console.log("");

  if (!hasMinterRole) {
    console.log("⚠️  MINTER_ROLE is missing!");
    console.log("Granting MINTER_ROLE to RewardManager...");
    console.log("");

    try {
      const grantTx = await vibeToken.grantRole(MINTER_ROLE, REWARD_MANAGER_ADDRESS);
      console.log("   Transaction sent:", grantTx.hash);
      
      await grantTx.wait();
      console.log("   ✅ MINTER_ROLE granted successfully!");
      console.log("");

      // Verify again
      const verified = await vibeToken.hasRole(MINTER_ROLE, REWARD_MANAGER_ADDRESS);
      console.log("   Verification:", verified ? "✅ PASSED" : "❌ FAILED");
    } catch (error) {
      console.error("   ❌ Failed to grant MINTER_ROLE:", error.message);
      console.error("   Make sure deployer account has ADMIN_ROLE");
      process.exit(1);
    }
  } else {
    console.log("✅ RewardManager already has MINTER_ROLE");
  }

  console.log("");
  console.log("========================================");
  console.log("Verification Complete!");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
