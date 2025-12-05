/**
 * Contract Verification Script
 * 
 * Verifies deployed contracts on block explorers
 * 
 * Usage:
 *   npx hardhat run scripts/verify.js --network <network-name>
 * 
 * Make sure to set the contract addresses below before running
 */

const hre = require("hardhat");

// ============================================
// SET THESE ADDRESSES BEFORE RUNNING
// ============================================
const VIBE_TOKEN_ADDRESS = process.env.VIBE_TOKEN_ADDRESS || "";
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS || "";
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || "";
const EMERGENCY_ADDRESS = process.env.EMERGENCY_ADDRESS || "";
// ============================================

async function main() {
  if (!VIBE_TOKEN_ADDRESS || !REWARD_MANAGER_ADDRESS || !ADMIN_ADDRESS) {
    console.error("Please set contract addresses in the script or environment variables");
    console.error("Required: VIBE_TOKEN_ADDRESS, REWARD_MANAGER_ADDRESS, ADMIN_ADDRESS");
    process.exit(1);
  }

  const emergencyAddr = EMERGENCY_ADDRESS || ADMIN_ADDRESS;

  console.log("========================================");
  console.log("Contract Verification");
  console.log("========================================\n");

  // Verify VibeToken
  console.log("1. Verifying VibeToken...");
  try {
    await hre.run("verify:verify", {
      address: VIBE_TOKEN_ADDRESS,
      constructorArguments: [ADMIN_ADDRESS],
    });
    console.log("   VibeToken verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   VibeToken already verified");
    } else {
      console.error("   VibeToken verification failed:", error.message);
    }
  }
  console.log("");

  // Verify RewardManager
  console.log("2. Verifying RewardManager...");
  try {
    await hre.run("verify:verify", {
      address: REWARD_MANAGER_ADDRESS,
      constructorArguments: [
        VIBE_TOKEN_ADDRESS,
        ADMIN_ADDRESS,
        emergencyAddr,
      ],
    });
    console.log("   RewardManager verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   RewardManager already verified");
    } else {
      console.error("   RewardManager verification failed:", error.message);
    }
  }

  console.log("\n========================================");
  console.log("Verification Complete!");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

