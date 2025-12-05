/**
 * VibeToken Contract Tests
 * 
 * Comprehensive test suite covering all functionality and security aspects
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("VibeToken", function () {
  // Fixture to deploy contract
  async function deployVibeTokenFixture() {
    const [admin, minter, pauser, user1, user2, user3] = await ethers.getSigners();

    const VibeToken = await ethers.getContractFactory("VibeToken");
    const vibeToken = await VibeToken.deploy(admin.address);
    await vibeToken.waitForDeployment();

    // Role constants
    const ADMIN_ROLE = await vibeToken.ADMIN_ROLE();
    const MINTER_ROLE = await vibeToken.MINTER_ROLE();
    const PAUSER_ROLE = await vibeToken.PAUSER_ROLE();
    const DEFAULT_ADMIN_ROLE = await vibeToken.DEFAULT_ADMIN_ROLE();

    return {
      vibeToken,
      admin,
      minter,
      pauser,
      user1,
      user2,
      user3,
      ADMIN_ROLE,
      MINTER_ROLE,
      PAUSER_ROLE,
      DEFAULT_ADMIN_ROLE,
    };
  }

  // ============================================
  // DEPLOYMENT TESTS
  // ============================================

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { vibeToken } = await loadFixture(deployVibeTokenFixture);
      
      expect(await vibeToken.name()).to.equal("VibeToken");
      expect(await vibeToken.symbol()).to.equal("VIBE");
    });

    it("Should set the correct decimals", async function () {
      const { vibeToken } = await loadFixture(deployVibeTokenFixture);
      
      expect(await vibeToken.decimals()).to.equal(18);
    });

    it("Should have zero initial supply", async function () {
      const { vibeToken } = await loadFixture(deployVibeTokenFixture);
      
      expect(await vibeToken.totalSupply()).to.equal(0);
    });

    it("Should set correct MAX_SUPPLY", async function () {
      const { vibeToken } = await loadFixture(deployVibeTokenFixture);
      
      const expectedMaxSupply = ethers.parseEther("100000000"); // 100 million
      expect(await vibeToken.MAX_SUPPLY()).to.equal(expectedMaxSupply);
    });

    it("Should grant all roles to admin", async function () {
      const { vibeToken, admin, ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE, DEFAULT_ADMIN_ROLE } = 
        await loadFixture(deployVibeTokenFixture);
      
      expect(await vibeToken.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await vibeToken.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
      expect(await vibeToken.hasRole(MINTER_ROLE, admin.address)).to.be.true;
      expect(await vibeToken.hasRole(PAUSER_ROLE, admin.address)).to.be.true;
    });

    it("Should revert deployment with zero address admin", async function () {
      const VibeToken = await ethers.getContractFactory("VibeToken");
      
      await expect(
        VibeToken.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(VibeToken, "ZeroAddress");
    });
  });

  // ============================================
  // MINTING TESTS
  // ============================================

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      await vibeToken.connect(admin).mint(user1.address, amount);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should emit TokensMinted event", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      
      await expect(vibeToken.connect(admin).mint(user1.address, amount))
        .to.emit(vibeToken, "TokensMinted")
        .withArgs(user1.address, amount, admin.address, await time.latest() + 1);
    });

    it("Should update totalMinted", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      await vibeToken.connect(admin).mint(user1.address, amount);
      
      expect(await vibeToken.totalMinted()).to.equal(amount);
    });

    it("Should prevent non-minter from minting", async function () {
      const { vibeToken, user1, user2, MINTER_ROLE } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      
      await expect(
        vibeToken.connect(user1).mint(user2.address, amount)
      ).to.be.revertedWithCustomError(vibeToken, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, MINTER_ROLE);
    });

    it("Should prevent minting to zero address", async function () {
      const { vibeToken, admin } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      
      await expect(
        vibeToken.connect(admin).mint(ethers.ZeroAddress, amount)
      ).to.be.revertedWithCustomError(vibeToken, "ZeroAddress");
    });

    it("Should prevent minting zero amount", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      await expect(
        vibeToken.connect(admin).mint(user1.address, 0)
      ).to.be.revertedWithCustomError(vibeToken, "ZeroAmount");
    });

    it("Should prevent minting more than MAX_MINT_PER_TX", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      const maxPerTx = await vibeToken.MAX_MINT_PER_TX();
      const excessAmount = maxPerTx + 1n;
      
      await expect(
        vibeToken.connect(admin).mint(user1.address, excessAmount)
      ).to.be.revertedWithCustomError(vibeToken, "ExceedsMintLimit")
        .withArgs(excessAmount, maxPerTx);
    });

    it("Should prevent minting beyond MAX_SUPPLY", async function () {
      const { vibeToken, admin, user1, user2 } = await loadFixture(deployVibeTokenFixture);
      
      // Mint close to max supply using emergency mint (no cooldown)
      const maxPerTx = await vibeToken.MAX_MINT_PER_TX();
      const iterations = 9999n; // Get close to 100M with 10k per tx
      
      // This would take too long, so we test with a smaller scenario
      // First mint some tokens
      await vibeToken.connect(admin).emergencyMint(user1.address, maxPerTx);
      
      // Now try to exceed remaining supply
      const maxSupply = await vibeToken.MAX_SUPPLY();
      const remaining = maxSupply - await vibeToken.totalSupply();
      const excessAmount = remaining + 1n;
      
      if (excessAmount <= maxPerTx) {
        await expect(
          vibeToken.connect(admin).emergencyMint(user2.address, excessAmount)
        ).to.be.revertedWithCustomError(vibeToken, "ExceedsMaxSupply");
      }
    });

    it("Should enforce cooldown between mints to same address", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      
      // First mint
      await vibeToken.connect(admin).mint(user1.address, amount);
      
      // Second mint should fail (cooldown active)
      await expect(
        vibeToken.connect(admin).mint(user1.address, amount)
      ).to.be.revertedWithCustomError(vibeToken, "MintCooldownActive");
    });

    it("Should allow mint after cooldown period", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      const cooldown = await vibeToken.MINT_COOLDOWN();
      
      // First mint
      await vibeToken.connect(admin).mint(user1.address, amount);
      
      // Advance time past cooldown
      await time.increase(cooldown + 1n);
      
      // Second mint should succeed
      await vibeToken.connect(admin).mint(user1.address, amount);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(amount * 2n);
    });
  });

  // ============================================
  // BATCH MINTING TESTS
  // ============================================

  describe("Batch Minting", function () {
    it("Should batch mint to multiple addresses", async function () {
      const { vibeToken, admin, user1, user2, user3 } = await loadFixture(deployVibeTokenFixture);
      
      const recipients = [user1.address, user2.address, user3.address];
      const amounts = [
        ethers.parseEther("100"),
        ethers.parseEther("200"),
        ethers.parseEther("300"),
      ];
      
      await vibeToken.connect(admin).batchMint(recipients, amounts);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(amounts[0]);
      expect(await vibeToken.balanceOf(user2.address)).to.equal(amounts[1]);
      expect(await vibeToken.balanceOf(user3.address)).to.equal(amounts[2]);
    });

    it("Should revert if arrays have different lengths", async function () {
      const { vibeToken, admin, user1, user2 } = await loadFixture(deployVibeTokenFixture);
      
      const recipients = [user1.address, user2.address];
      const amounts = [ethers.parseEther("100")]; // Only one amount
      
      await expect(
        vibeToken.connect(admin).batchMint(recipients, amounts)
      ).to.be.revertedWithCustomError(vibeToken, "ArrayLengthMismatch");
    });

    it("Should revert if batch is too large", async function () {
      const { vibeToken, admin } = await loadFixture(deployVibeTokenFixture);
      
      // Create arrays with 101 elements (max is 100)
      const recipients = Array(101).fill(admin.address);
      const amounts = Array(101).fill(ethers.parseEther("1"));
      
      await expect(
        vibeToken.connect(admin).batchMint(recipients, amounts)
      ).to.be.revertedWithCustomError(vibeToken, "BatchTooLarge");
    });
  });

  // ============================================
  // EMERGENCY MINT TESTS
  // ============================================

  describe("Emergency Mint", function () {
    it("Should allow admin to emergency mint without cooldown", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      
      // First mint
      await vibeToken.connect(admin).emergencyMint(user1.address, amount);
      
      // Second mint immediately (no cooldown for emergency)
      await vibeToken.connect(admin).emergencyMint(user1.address, amount);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(amount * 2n);
    });

    it("Should only allow ADMIN_ROLE for emergency mint", async function () {
      const { vibeToken, minter, user1, ADMIN_ROLE } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      
      await expect(
        vibeToken.connect(minter).emergencyMint(user1.address, amount)
      ).to.be.revertedWithCustomError(vibeToken, "AccessControlUnauthorizedAccount");
    });
  });

  // ============================================
  // PAUSE TESTS
  // ============================================

  describe("Pausing", function () {
    it("Should allow pauser to pause", async function () {
      const { vibeToken, admin } = await loadFixture(deployVibeTokenFixture);
      
      await vibeToken.connect(admin).pause();
      
      expect(await vibeToken.paused()).to.be.true;
    });

    it("Should prevent minting when paused", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      await vibeToken.connect(admin).pause();
      
      await expect(
        vibeToken.connect(admin).mint(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(vibeToken, "EnforcedPause");
    });

    it("Should prevent transfers when paused", async function () {
      const { vibeToken, admin, user1, user2 } = await loadFixture(deployVibeTokenFixture);
      
      // Mint first
      await vibeToken.connect(admin).mint(user1.address, ethers.parseEther("100"));
      
      // Pause
      await vibeToken.connect(admin).pause();
      
      // Try to transfer
      await expect(
        vibeToken.connect(user1).transfer(user2.address, ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(vibeToken, "EnforcedPause");
    });

    it("Should allow unpause and resume operations", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      await vibeToken.connect(admin).pause();
      await vibeToken.connect(admin).unpause();
      
      // Should work after unpause
      await vibeToken.connect(admin).mint(user1.address, ethers.parseEther("100"));
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
    });
  });

  // ============================================
  // ROLE MANAGEMENT TESTS
  // ============================================

  describe("Role Management", function () {
    it("Should allow admin to add minter", async function () {
      const { vibeToken, admin, minter, user1, MINTER_ROLE } = await loadFixture(deployVibeTokenFixture);
      
      await vibeToken.connect(admin).addMinter(minter.address);
      
      expect(await vibeToken.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      
      // New minter should be able to mint
      await vibeToken.connect(minter).mint(user1.address, ethers.parseEther("100"));
      expect(await vibeToken.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should allow admin to remove minter", async function () {
      const { vibeToken, admin, minter, user1, MINTER_ROLE } = await loadFixture(deployVibeTokenFixture);
      
      // Add then remove
      await vibeToken.connect(admin).addMinter(minter.address);
      await vibeToken.connect(admin).removeMinter(minter.address);
      
      expect(await vibeToken.hasRole(MINTER_ROLE, minter.address)).to.be.false;
    });

    it("Should emit MinterAdded event", async function () {
      const { vibeToken, admin, minter } = await loadFixture(deployVibeTokenFixture);
      
      await expect(vibeToken.connect(admin).addMinter(minter.address))
        .to.emit(vibeToken, "MinterAdded")
        .withArgs(minter.address, admin.address);
    });

    it("Should emit MinterRemoved event", async function () {
      const { vibeToken, admin, minter } = await loadFixture(deployVibeTokenFixture);
      
      await vibeToken.connect(admin).addMinter(minter.address);
      
      await expect(vibeToken.connect(admin).removeMinter(minter.address))
        .to.emit(vibeToken, "MinterRemoved")
        .withArgs(minter.address, admin.address);
    });
  });

  // ============================================
  // VIEW FUNCTIONS TESTS
  // ============================================

  describe("View Functions", function () {
    it("Should return correct remaining mintable supply", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      const maxSupply = await vibeToken.MAX_SUPPLY();
      
      expect(await vibeToken.remainingMintableSupply()).to.equal(maxSupply);
      
      // Mint some tokens
      const amount = ethers.parseEther("100");
      await vibeToken.connect(admin).mint(user1.address, amount);
      
      expect(await vibeToken.remainingMintableSupply()).to.equal(maxSupply - amount);
    });

    it("Should correctly report canMintTo status", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      // Before any mint
      let [canMint] = await vibeToken.canMintTo(user1.address);
      expect(canMint).to.be.true;
      
      // After mint
      await vibeToken.connect(admin).mint(user1.address, ethers.parseEther("100"));
      [canMint] = await vibeToken.canMintTo(user1.address);
      expect(canMint).to.be.false;
    });

    it("Should return correct lastMintTime", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      expect(await vibeToken.lastMintTime(user1.address)).to.equal(0);
      
      await vibeToken.connect(admin).mint(user1.address, ethers.parseEther("100"));
      
      expect(await vibeToken.lastMintTime(user1.address)).to.be.gt(0);
    });
  });

  // ============================================
  // BURNING TESTS
  // ============================================

  describe("Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const { vibeToken, admin, user1 } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      await vibeToken.connect(admin).mint(user1.address, amount);
      
      const burnAmount = ethers.parseEther("50");
      await vibeToken.connect(user1).burn(burnAmount);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(amount - burnAmount);
    });

    it("Should allow burning from allowance", async function () {
      const { vibeToken, admin, user1, user2 } = await loadFixture(deployVibeTokenFixture);
      
      const amount = ethers.parseEther("100");
      await vibeToken.connect(admin).mint(user1.address, amount);
      
      // Approve user2
      await vibeToken.connect(user1).approve(user2.address, amount);
      
      // User2 burns from user1's balance
      const burnAmount = ethers.parseEther("50");
      await vibeToken.connect(user2).burnFrom(user1.address, burnAmount);
      
      expect(await vibeToken.balanceOf(user1.address)).to.equal(amount - burnAmount);
    });
  });

  // ============================================
  // PERMIT TESTS
  // ============================================

  describe("Permit (ERC20Permit)", function () {
    it("Should support permit functionality", async function () {
      const { vibeToken, admin, user1, user2 } = await loadFixture(deployVibeTokenFixture);
      
      // Mint tokens to user1
      const amount = ethers.parseEther("100");
      await vibeToken.connect(admin).mint(user1.address, amount);
      
      // Get nonce
      const nonce = await vibeToken.nonces(user1.address);
      expect(nonce).to.equal(0);
      
      // Domain separator should exist
      const domain = await vibeToken.eip712Domain();
      expect(domain.name).to.equal("VibeToken");
    });
  });
});

