/**
 * Grant REWARDER_ROLE to Admin Wallet
 * 
 * This script grants REWARDER_ROLE to the admin wallet address
 * so it can trigger rewards.
 * 
 * Usage:
 *   npx hardhat run scripts/grant-rewarder-role.js --network baseSepolia
 */

const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Granting REWARDER_ROLE to Admin Wallet");
  console.log("========================================\n");

  // Get contract addresses from environment
  const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;
  const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS;

  if (!REWARD_MANAGER_ADDRESS || !ADMIN_WALLET_ADDRESS) {
    console.error("❌ Error: Contract addresses not set in environment");
    console.error("   Set REWARD_MANAGER_ADDRESS and ADMIN_WALLET_ADDRESS");
    process.exit(1);
  }

  console.log("RewardManager Address:", REWARD_MANAGER_ADDRESS);
  console.log("Admin Wallet Address:", ADMIN_WALLET_ADDRESS);
  console.log("");

  // Get deployer account (must have ADMIN_ROLE to grant REWARDER_ROLE)
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Using account (must have ADMIN_ROLE):", deployerAddress);
  console.log("");

  // Get RewardManager contract instance
  const RewardManager = await hre.ethers.getContractFactory("RewardManager");
  const rewardManager = RewardManager.attach(REWARD_MANAGER_ADDRESS);

  // Get REWARDER_ROLE constant
  const REWARDER_ROLE = await rewardManager.REWARDER_ROLE();
  console.log("REWARDER_ROLE:", REWARDER_ROLE);
  console.log("");

  // Check if admin wallet already has REWARDER_ROLE
  const hasRewarderRole = await rewardManager.hasRole(REWARDER_ROLE, ADMIN_WALLET_ADDRESS);
  console.log("Admin wallet has REWARDER_ROLE:", hasRewarderRole);
  console.log("");

  if (hasRewarderRole) {
    console.log("✅ Admin wallet already has REWARDER_ROLE");
    console.log("   No action needed.");
    return;
  }

  // Grant REWARDER_ROLE to admin wallet
  console.log("⚠️  Admin wallet does NOT have REWARDER_ROLE");
  console.log("Granting REWARDER_ROLE to admin wallet...");
  console.log("");

  try {
    const grantTx = await rewardManager.grantRole(REWARDER_ROLE, ADMIN_WALLET_ADDRESS);
    console.log("   Transaction sent:", grantTx.hash);
    console.log("   Waiting for confirmation...");
    
    await grantTx.wait();
    console.log("   ✅ REWARDER_ROLE granted successfully!");
    console.log("");

    // Verify the role was granted
    const verified = await rewardManager.hasRole(REWARDER_ROLE, ADMIN_WALLET_ADDRESS);
    console.log("   Verification:", verified ? "✅ PASSED" : "❌ FAILED");
    
    if (verified) {
      console.log("");
      console.log("========================================");
      console.log("✅ Success! Admin wallet can now trigger rewards");
      console.log("========================================");
    }
  } catch (error) {
    console.error("   ❌ Failed to grant REWARDER_ROLE:", error.message);
    console.error("");
    console.error("   Possible reasons:");
    console.error("   1. Deployer account does not have ADMIN_ROLE");
    console.error("   2. Transaction failed (check gas, network, etc.)");
    console.error("   3. Contract address is incorrect");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });



