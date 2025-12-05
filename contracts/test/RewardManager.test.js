/**
 * RewardManager Contract Tests
 * 
 * Comprehensive test suite covering all reward functionality and security aspects
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("RewardManager", function () {
  // Fixture to deploy contracts
  async function deployRewardManagerFixture() {
    const [admin, rewarder, oracle, user1, user2, user3, emergency] = await ethers.getSigners();

    // Deploy VibeToken first
    const VibeToken = await ethers.getContractFactory("VibeToken");
    const vibeToken = await VibeToken.deploy(admin.address);
    await vibeToken.waitForDeployment();

    // Deploy RewardManager
    const RewardManager = await ethers.getContractFactory("RewardManager");
    const rewardManager = await RewardManager.deploy(
      await vibeToken.getAddress(),
      admin.address,
      emergency.address
    );
    await rewardManager.waitForDeployment();

    // Grant MINTER_ROLE to RewardManager
    const MINTER_ROLE = await vibeToken.MINTER_ROLE();
    await vibeToken.connect(admin).grantRole(MINTER_ROLE, await rewardManager.getAddress());

    // Role constants
    const ADMIN_ROLE = await rewardManager.ADMIN_ROLE();
    const REWARDER_ROLE = await rewardManager.REWARDER_ROLE();
    const ORACLE_ROLE = await rewardManager.ORACLE_ROLE();

    return {
      vibeToken,
      rewardManager,
      admin,
      rewarder,
      oracle,
      user1,
      user2,
      user3,
      emergency,
      ADMIN_ROLE,
      REWARDER_ROLE,
      ORACLE_ROLE,
    };
  }

  // ============================================
  // DEPLOYMENT TESTS
  // ============================================

  describe("Deployment", function () {
    it("Should set correct token address", async function () {
      const { vibeToken, rewardManager } = await loadFixture(deployRewardManagerFixture);
      
      expect(await rewardManager.vibeToken()).to.equal(await vibeToken.getAddress());
    });

    it("Should set correct initial reward values", async function () {
      const { rewardManager } = await loadFixture(deployRewardManagerFixture);
      
      expect(await rewardManager.acceptedAnswerReward()).to.equal(ethers.parseEther("50"));
      expect(await rewardManager.upvoteReward()).to.equal(ethers.parseEther("5"));
      expect(await rewardManager.upvoteThreshold()).to.equal(10);
      expect(await rewardManager.questionerBonus()).to.equal(ethers.parseEther("10"));
    });

    it("Should set correct rate limiting defaults", async function () {
      const { rewardManager } = await loadFixture(deployRewardManagerFixture);
      
      expect(await rewardManager.maxDailyRewardPerUser()).to.equal(ethers.parseEther("500"));
      expect(await rewardManager.rewardCooldown()).to.equal(5 * 60); // 5 minutes
    });

    it("Should grant all roles to admin", async function () {
      const { rewardManager, admin, ADMIN_ROLE, REWARDER_ROLE, ORACLE_ROLE } = 
        await loadFixture(deployRewardManagerFixture);
      
      expect(await rewardManager.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
      expect(await rewardManager.hasRole(REWARDER_ROLE, admin.address)).to.be.true;
      expect(await rewardManager.hasRole(ORACLE_ROLE, admin.address)).to.be.true;
    });

    it("Should set correct emergency address", async function () {
      const { rewardManager, emergency } = await loadFixture(deployRewardManagerFixture);
      
      expect(await rewardManager.emergencyWithdrawAddress()).to.equal(emergency.address);
    });

    it("Should revert with zero address for token", async function () {
      const [admin, emergency] = await ethers.getSigners();
      const RewardManager = await ethers.getContractFactory("RewardManager");
      
      await expect(
        RewardManager.deploy(ethers.ZeroAddress, admin.address, emergency.address)
      ).to.be.revertedWithCustomError(RewardManager, "ZeroAddress");
    });
  });

  // ============================================
  // ACCEPTED ANSWER REWARD TESTS
  // ============================================

  describe("Accepted Answer Rewards", function () {
    it("Should reward accepted answer correctly", async function () {
      const { vibeToken, rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("answer-1"));
      const questionId = 1;
      
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, questionId);
      
      const expectedReward = ethers.parseEther("50");
      expect(await vibeToken.balanceOf(user1.address)).to.equal(expectedReward);
    });

    it("Should emit AnswerRewarded event", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("answer-1"));
      const questionId = 1;
      const expectedReward = ethers.parseEther("50");
      
      await expect(rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, questionId))
        .to.emit(rewardManager, "AnswerRewarded")
        .withArgs(user1.address, expectedReward, answerId, 0, questionId, await time.latest() + 1);
    });

    it("Should prevent double reward for same answer", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("answer-1"));
      const questionId = 1;
      
      // First reward succeeds
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, questionId);
      
      // Wait for cooldown
      await time.increase(301);
      
      // Second reward should fail
      await expect(
        rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, questionId)
      ).to.be.revertedWithCustomError(rewardManager, "AnswerAlreadyRewarded")
        .withArgs(answerId);
    });

    it("Should mark answer as rewarded", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("answer-1"));
      const questionId = 1;
      
      expect(await rewardManager.isAnswerRewarded(answerId)).to.be.false;
      
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, questionId);
      
      expect(await rewardManager.isAnswerRewarded(answerId)).to.be.true;
    });

    it("Should update total rewards distributed", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("answer-1"));
      const questionId = 1;
      
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, questionId);
      
      const expectedReward = ethers.parseEther("50");
      expect(await rewardManager.totalRewardsDistributed()).to.equal(expectedReward);
    });
  });

  // ============================================
  // UPVOTE THRESHOLD REWARD TESTS
  // ============================================

  describe("Upvote Threshold Rewards", function () {
    it("Should reward upvote threshold correctly", async function () {
      const { vibeToken, rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("answer-upvote-1"));
      const questionId = 1;
      
      await rewardManager.connect(admin).rewardUpvoteThreshold(user1.address, answerId, questionId);
      
      const expectedReward = ethers.parseEther("5");
      expect(await vibeToken.balanceOf(user1.address)).to.equal(expectedReward);
    });
  });

  // ============================================
  // QUESTIONER BONUS TESTS
  // ============================================

  describe("Questioner Bonus", function () {
    it("Should reward questioner correctly", async function () {
      const { vibeToken, rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const questionId = 1;
      
      await rewardManager.connect(admin).rewardQuestioner(user1.address, questionId);
      
      const expectedReward = ethers.parseEther("10");
      expect(await vibeToken.balanceOf(user1.address)).to.equal(expectedReward);
    });

    it("Should prevent double questioner reward", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const questionId = 1;
      
      await rewardManager.connect(admin).rewardQuestioner(user1.address, questionId);
      
      // Wait for cooldown
      await time.increase(301);
      
      // Second reward should fail (same question ID generates same reward ID)
      await expect(
        rewardManager.connect(admin).rewardQuestioner(user1.address, questionId)
      ).to.be.revertedWithCustomError(rewardManager, "AnswerAlreadyRewarded");
    });
  });

  // ============================================
  // SPECIAL CONTRIBUTION TESTS
  // ============================================

  describe("Special Contributions", function () {
    it("Should allow custom reward amounts", async function () {
      const { vibeToken, rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("special-1"));
      const questionId = 1;
      const customAmount = ethers.parseEther("100");
      
      await rewardManager.connect(admin).rewardSpecialContribution(
        user1.address,
        customAmount,
        answerId,
        questionId
      );
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(customAmount);
    });

    it("Should reject amounts below minimum", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("special-1"));
      const questionId = 1;
      const tooSmall = ethers.parseEther("0.5"); // Below 1 VIBE minimum
      
      await expect(
        rewardManager.connect(admin).rewardSpecialContribution(
          user1.address,
          tooSmall,
          answerId,
          questionId
        )
      ).to.be.revertedWithCustomError(rewardManager, "RewardOutOfBounds");
    });

    it("Should reject amounts above maximum", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("special-1"));
      const questionId = 1;
      const tooLarge = ethers.parseEther("1001"); // Above 1000 VIBE maximum
      
      await expect(
        rewardManager.connect(admin).rewardSpecialContribution(
          user1.address,
          tooLarge,
          answerId,
          questionId
        )
      ).to.be.revertedWithCustomError(rewardManager, "RewardOutOfBounds");
    });

    it("Should require ADMIN_ROLE for special contributions", async function () {
      const { rewardManager, rewarder, user1, ADMIN_ROLE } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("special-1"));
      const questionId = 1;
      const amount = ethers.parseEther("100");
      
      await expect(
        rewardManager.connect(rewarder).rewardSpecialContribution(
          user1.address,
          amount,
          answerId,
          questionId
        )
      ).to.be.revertedWithCustomError(rewardManager, "AccessControlUnauthorizedAccount");
    });
  });

  // ============================================
  // BATCH REWARD TESTS
  // ============================================

  describe("Batch Rewards", function () {
    it("Should process batch rewards correctly", async function () {
      const { vibeToken, rewardManager, admin, user1, user2, user3 } = 
        await loadFixture(deployRewardManagerFixture);
      
      const requests = [
        {
          recipient: user1.address,
          amount: ethers.parseEther("50"),
          answerId: ethers.keccak256(ethers.toUtf8Bytes("batch-1")),
          rewardType: 0, // ACCEPTED_ANSWER
          questionId: 1,
        },
        {
          recipient: user2.address,
          amount: ethers.parseEther("50"),
          answerId: ethers.keccak256(ethers.toUtf8Bytes("batch-2")),
          rewardType: 0,
          questionId: 2,
        },
        {
          recipient: user3.address,
          amount: ethers.parseEther("50"),
          answerId: ethers.keccak256(ethers.toUtf8Bytes("batch-3")),
          rewardType: 0,
          questionId: 3,
        },
      ];
      
      await rewardManager.connect(admin).batchReward(requests);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
      expect(await vibeToken.balanceOf(user2.address)).to.equal(ethers.parseEther("50"));
      expect(await vibeToken.balanceOf(user3.address)).to.equal(ethers.parseEther("50"));
    });

    it("Should emit BatchRewardProcessed event", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const requests = [
        {
          recipient: user1.address,
          amount: ethers.parseEther("50"),
          answerId: ethers.keccak256(ethers.toUtf8Bytes("batch-1")),
          rewardType: 0,
          questionId: 1,
        },
      ];
      
      await expect(rewardManager.connect(admin).batchReward(requests))
        .to.emit(rewardManager, "BatchRewardProcessed");
    });

    it("Should skip already rewarded answers in batch", async function () {
      const { vibeToken, rewardManager, admin, user1, user2 } = 
        await loadFixture(deployRewardManagerFixture);
      
      const answerId1 = ethers.keccak256(ethers.toUtf8Bytes("batch-skip-1"));
      
      // Reward first answer individually
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId1, 1);
      
      // Wait for cooldown
      await time.increase(301);
      
      // Try to batch reward including the already rewarded answer
      const requests = [
        {
          recipient: user1.address,
          amount: ethers.parseEther("50"),
          answerId: answerId1, // Already rewarded
          rewardType: 0,
          questionId: 1,
        },
        {
          recipient: user2.address,
          amount: ethers.parseEther("50"),
          answerId: ethers.keccak256(ethers.toUtf8Bytes("batch-skip-2")),
          rewardType: 0,
          questionId: 2,
        },
      ];
      
      // Should succeed (skips first, processes second)
      await rewardManager.connect(admin).batchReward(requests);
      
      // user1 should still have only 50 (original reward)
      expect(await vibeToken.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
      // user2 should have 50
      expect(await vibeToken.balanceOf(user2.address)).to.equal(ethers.parseEther("50"));
    });

    it("Should reject too large batch", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      // Create 51 requests (max is 50)
      const requests = Array(51).fill(null).map((_, i) => ({
        recipient: user1.address,
        amount: ethers.parseEther("5"),
        answerId: ethers.keccak256(ethers.toUtf8Bytes(`batch-large-${i}`)),
        rewardType: 0,
        questionId: i,
      }));
      
      await expect(
        rewardManager.connect(admin).batchReward(requests)
      ).to.be.revertedWithCustomError(rewardManager, "BatchTooLarge");
    });
  });

  // ============================================
  // RATE LIMITING TESTS
  // ============================================

  describe("Rate Limiting", function () {
    it("Should enforce cooldown between rewards", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId1 = ethers.keccak256(ethers.toUtf8Bytes("rate-1"));
      const answerId2 = ethers.keccak256(ethers.toUtf8Bytes("rate-2"));
      
      // First reward
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId1, 1);
      
      // Second reward immediately should fail
      await expect(
        rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId2, 2)
      ).to.be.revertedWithCustomError(rewardManager, "CooldownNotElapsed");
    });

    it("Should allow reward after cooldown", async function () {
      const { vibeToken, rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId1 = ethers.keccak256(ethers.toUtf8Bytes("rate-1"));
      const answerId2 = ethers.keccak256(ethers.toUtf8Bytes("rate-2"));
      
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId1, 1);
      
      // Wait for cooldown (5 minutes + 1 second)
      await time.increase(301);
      
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId2, 2);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should enforce daily limit", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      // Set a lower daily limit for testing
      await rewardManager.connect(admin).setMaxDailyReward(ethers.parseEther("100"));
      
      // First reward (50 VIBE)
      const answerId1 = ethers.keccak256(ethers.toUtf8Bytes("daily-1"));
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId1, 1);
      
      await time.increase(301);
      
      // Second reward (50 VIBE) - should reach limit
      const answerId2 = ethers.keccak256(ethers.toUtf8Bytes("daily-2"));
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId2, 2);
      
      await time.increase(301);
      
      // Third reward should exceed limit
      const answerId3 = ethers.keccak256(ethers.toUtf8Bytes("daily-3"));
      await expect(
        rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId3, 3)
      ).to.be.revertedWithCustomError(rewardManager, "DailyLimitExceeded");
    });

    it("Should reset daily limit on new day", async function () {
      const { vibeToken, rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      // Set a lower daily limit for testing
      await rewardManager.connect(admin).setMaxDailyReward(ethers.parseEther("60"));
      
      // First reward
      const answerId1 = ethers.keccak256(ethers.toUtf8Bytes("daily-reset-1"));
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId1, 1);
      
      // Advance to next day (86400 seconds)
      await time.increase(86401);
      
      // Should be able to receive reward again
      const answerId2 = ethers.keccak256(ethers.toUtf8Bytes("daily-reset-2"));
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId2, 2);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
    });
  });

  // ============================================
  // ADMIN FUNCTIONS TESTS
  // ============================================

  describe("Admin Functions", function () {
    it("Should allow admin to update reward parameters", async function () {
      const { rewardManager, admin } = await loadFixture(deployRewardManagerFixture);
      
      await rewardManager.connect(admin).setRewardParameters(
        ethers.parseEther("100"),
        ethers.parseEther("10"),
        20,
        ethers.parseEther("20")
      );
      
      expect(await rewardManager.acceptedAnswerReward()).to.equal(ethers.parseEther("100"));
      expect(await rewardManager.upvoteReward()).to.equal(ethers.parseEther("10"));
      expect(await rewardManager.upvoteThreshold()).to.equal(20);
      expect(await rewardManager.questionerBonus()).to.equal(ethers.parseEther("20"));
    });

    it("Should emit RewardParametersUpdated event", async function () {
      const { rewardManager, admin } = await loadFixture(deployRewardManagerFixture);
      
      await expect(
        rewardManager.connect(admin).setRewardParameters(
          ethers.parseEther("100"),
          ethers.parseEther("10"),
          20,
          ethers.parseEther("20")
        )
      ).to.emit(rewardManager, "RewardParametersUpdated");
    });

    it("Should reject invalid reward parameters", async function () {
      const { rewardManager, admin } = await loadFixture(deployRewardManagerFixture);
      
      // Too small accepted answer reward
      await expect(
        rewardManager.connect(admin).setRewardParameters(
          ethers.parseEther("0.5"),
          ethers.parseEther("10"),
          20,
          ethers.parseEther("20")
        )
      ).to.be.revertedWithCustomError(rewardManager, "RewardOutOfBounds");
      
      // Zero upvote threshold
      await expect(
        rewardManager.connect(admin).setRewardParameters(
          ethers.parseEther("50"),
          ethers.parseEther("10"),
          0,
          ethers.parseEther("20")
        )
      ).to.be.revertedWithCustomError(rewardManager, "ZeroAmount");
    });

    it("Should allow admin to update daily limit", async function () {
      const { rewardManager, admin } = await loadFixture(deployRewardManagerFixture);
      
      const newLimit = ethers.parseEther("1000");
      await rewardManager.connect(admin).setMaxDailyReward(newLimit);
      
      expect(await rewardManager.maxDailyRewardPerUser()).to.equal(newLimit);
    });

    it("Should allow admin to update cooldown", async function () {
      const { rewardManager, admin } = await loadFixture(deployRewardManagerFixture);
      
      const newCooldown = 600; // 10 minutes
      await rewardManager.connect(admin).setRewardCooldown(newCooldown);
      
      expect(await rewardManager.rewardCooldown()).to.equal(newCooldown);
    });

    it("Should allow admin to update emergency address", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      await rewardManager.connect(admin).setEmergencyAddress(user1.address);
      
      expect(await rewardManager.emergencyWithdrawAddress()).to.equal(user1.address);
    });
  });

  // ============================================
  // PAUSE TESTS
  // ============================================

  describe("Pausing", function () {
    it("Should allow admin to pause", async function () {
      const { rewardManager, admin } = await loadFixture(deployRewardManagerFixture);
      
      await rewardManager.connect(admin).pause();
      
      expect(await rewardManager.paused()).to.be.true;
    });

    it("Should prevent rewards when paused", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      await rewardManager.connect(admin).pause();
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("pause-test"));
      
      await expect(
        rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, 1)
      ).to.be.revertedWithCustomError(rewardManager, "EnforcedPause");
    });

    it("Should allow admin to unpause", async function () {
      const { vibeToken, rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      await rewardManager.connect(admin).pause();
      await rewardManager.connect(admin).unpause();
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("unpause-test"));
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, 1);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
    });
  });

  // ============================================
  // VIEW FUNCTIONS TESTS
  // ============================================

  describe("View Functions", function () {
    it("Should return correct user daily rewards", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      expect(await rewardManager.getUserDailyRewards(user1.address)).to.equal(0);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("view-test"));
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, 1);
      
      expect(await rewardManager.getUserDailyRewards(user1.address)).to.equal(ethers.parseEther("50"));
    });

    it("Should return correct remaining daily allowance", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const maxDaily = await rewardManager.maxDailyRewardPerUser();
      expect(await rewardManager.getRemainingDailyAllowance(user1.address)).to.equal(maxDaily);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("allowance-test"));
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, 1);
      
      expect(await rewardManager.getRemainingDailyAllowance(user1.address))
        .to.equal(maxDaily - ethers.parseEther("50"));
    });

    it("Should return correct canReceiveReward status", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      let [canReceive] = await rewardManager.canReceiveReward(user1.address);
      expect(canReceive).to.be.true;
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("can-receive-test"));
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, 1);
      
      [canReceive] = await rewardManager.canReceiveReward(user1.address);
      expect(canReceive).to.be.false;
    });

    it("Should return correct reward config", async function () {
      const { rewardManager } = await loadFixture(deployRewardManagerFixture);
      
      const config = await rewardManager.getRewardConfig();
      
      expect(config[0]).to.equal(ethers.parseEther("50")); // acceptedAnswerReward
      expect(config[1]).to.equal(ethers.parseEther("5"));  // upvoteReward
      expect(config[2]).to.equal(10);                       // upvoteThreshold
      expect(config[3]).to.equal(ethers.parseEther("10")); // questionerBonus
      expect(config[4]).to.equal(ethers.parseEther("500")); // maxDailyReward
      expect(config[5]).to.equal(300);                      // cooldown (5 minutes)
    });

    it("Should return correct stats", async function () {
      const { rewardManager, admin, user1 } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("stats-test"));
      await rewardManager.connect(admin).rewardAcceptedAnswer(user1.address, answerId, 1);
      
      const stats = await rewardManager.getStats();
      
      expect(stats[0]).to.equal(ethers.parseEther("50")); // totalDistributed
      expect(stats[1]).to.equal(1);                        // totalAnswersRewarded
    });
  });

  // ============================================
  // UTILITY FUNCTIONS TESTS
  // ============================================

  describe("Utility Functions", function () {
    it("Should generate consistent answer IDs", async function () {
      const { rewardManager } = await loadFixture(deployRewardManagerFixture);
      
      const questionId = 123;
      const answerIndex = 5;
      
      const id1 = await rewardManager.generateAnswerId(questionId, answerIndex);
      const id2 = await rewardManager.generateAnswerId(questionId, answerIndex);
      
      expect(id1).to.equal(id2);
    });

    it("Should generate different IDs for different inputs", async function () {
      const { rewardManager } = await loadFixture(deployRewardManagerFixture);
      
      const id1 = await rewardManager.generateAnswerId(1, 1);
      const id2 = await rewardManager.generateAnswerId(1, 2);
      const id3 = await rewardManager.generateAnswerId(2, 1);
      
      expect(id1).to.not.equal(id2);
      expect(id1).to.not.equal(id3);
      expect(id2).to.not.equal(id3);
    });

    it("Should generate answer ID from string", async function () {
      const { rewardManager } = await loadFixture(deployRewardManagerFixture);
      
      const stringId = "507f1f77bcf86cd799439011";
      const id = await rewardManager.generateAnswerIdFromString(stringId);
      
      expect(id).to.equal(ethers.keccak256(ethers.toUtf8Bytes(stringId)));
    });
  });

  // ============================================
  // ACCESS CONTROL TESTS
  // ============================================

  describe("Access Control", function () {
    it("Should prevent non-rewarder from rewarding", async function () {
      const { rewardManager, user1, user2, REWARDER_ROLE } = await loadFixture(deployRewardManagerFixture);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("access-test"));
      
      await expect(
        rewardManager.connect(user1).rewardAcceptedAnswer(user2.address, answerId, 1)
      ).to.be.revertedWithCustomError(rewardManager, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, REWARDER_ROLE);
    });

    it("Should prevent non-admin from updating parameters", async function () {
      const { rewardManager, user1, ADMIN_ROLE } = await loadFixture(deployRewardManagerFixture);
      
      await expect(
        rewardManager.connect(user1).setRewardParameters(
          ethers.parseEther("100"),
          ethers.parseEther("10"),
          20,
          ethers.parseEther("20")
        )
      ).to.be.revertedWithCustomError(rewardManager, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, ADMIN_ROLE);
    });

    it("Should allow granting rewarder role", async function () {
      const { vibeToken, rewardManager, admin, rewarder, user1, REWARDER_ROLE } = 
        await loadFixture(deployRewardManagerFixture);
      
      await rewardManager.connect(admin).grantRole(REWARDER_ROLE, rewarder.address);
      
      const answerId = ethers.keccak256(ethers.toUtf8Bytes("new-rewarder"));
      await rewardManager.connect(rewarder).rewardAcceptedAnswer(user1.address, answerId, 1);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
    });
  });
});

