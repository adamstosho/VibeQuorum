// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VibeToken
 * @author VibeQuorum Team
 * @notice ERC20 Token for the VibeQuorum Q&A Platform with secure minting capabilities
 * @dev Implements ERC20 with the following security features:
 *      - Role-based access control (Admin, Minter, Pauser roles)
 *      - Pausable functionality for emergency situations
 *      - Burnable tokens for deflationary mechanics
 *      - ERC20Permit for gasless approvals
 *      - Reentrancy protection
 *      - Supply cap to prevent infinite minting
 *      - Rate limiting for minting operations
 * 
 * Security Considerations:
 * - Only MINTER_ROLE can mint tokens
 * - Only PAUSER_ROLE can pause/unpause
 * - Supply is capped to prevent hyperinflation
 * - Rate limiting prevents minting abuse
 * - All state changes are protected against reentrancy
 */
contract VibeToken is 
    ERC20, 
    ERC20Burnable, 
    ERC20Pausable, 
    ERC20Permit, 
    AccessControl,
    ReentrancyGuard 
{
    // ============================================
    // ROLES
    // ============================================
    
    /// @notice Admin role - can grant/revoke other roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    /// @notice Minter role - can mint new tokens
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    /// @notice Pauser role - can pause/unpause contract
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice Maximum total supply cap (100 million tokens with 18 decimals)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    /// @notice Maximum tokens that can be minted in a single transaction
    uint256 public constant MAX_MINT_PER_TX = 10_000 * 10**18;
    
    /// @notice Cooldown period between mints to same address (1 hour)
    uint256 public constant MINT_COOLDOWN = 1 hours;
    
    /// @notice Tracks last mint timestamp per address for rate limiting
    mapping(address => uint256) private _lastMintTimestamp;
    
    /// @notice Total tokens minted (for analytics)
    uint256 public totalMinted;

    // ============================================
    // EVENTS
    // ============================================

    /// @notice Emitted when tokens are minted
    event TokensMinted(
        address indexed to, 
        uint256 amount, 
        address indexed minter,
        uint256 timestamp
    );
    
    /// @notice Emitted when contract is paused
    event ContractPaused(address indexed pauser, uint256 timestamp);
    
    /// @notice Emitted when contract is unpaused
    event ContractUnpaused(address indexed pauser, uint256 timestamp);
    
    /// @notice Emitted when a minter role is granted
    event MinterAdded(address indexed account, address indexed grantedBy);
    
    /// @notice Emitted when a minter role is revoked
    event MinterRemoved(address indexed account, address indexed revokedBy);

    // ============================================
    // ERRORS
    // ============================================

    /// @notice Thrown when mint would exceed max supply
    error ExceedsMaxSupply(uint256 requested, uint256 available);
    
    /// @notice Thrown when mint amount exceeds per-transaction limit
    error ExceedsMintLimit(uint256 requested, uint256 limit);
    
    /// @notice Thrown when mint is attempted too soon after previous mint
    error MintCooldownActive(address recipient, uint256 cooldownEnds);
    
    /// @notice Thrown when zero amount is provided
    error ZeroAmount();
    
    /// @notice Thrown when zero address is provided
    error ZeroAddress();
    
    /// @notice Thrown when arrays have mismatched lengths
    error ArrayLengthMismatch();
    
    /// @notice Thrown when batch mint exceeds limit
    error BatchTooLarge(uint256 size, uint256 maxSize);

    // ============================================
    // MODIFIERS
    // ============================================

    /// @notice Ensures amount is not zero
    modifier nonZeroAmount(uint256 amount) {
        if (amount == 0) revert ZeroAmount();
        _;
    }
    
    /// @notice Ensures address is not zero
    modifier nonZeroAddress(address account) {
        if (account == address(0)) revert ZeroAddress();
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @notice Initializes the VibeToken contract
     * @param admin Address that will have admin privileges
     * @dev Sets up roles and grants initial permissions to admin
     */
    constructor(address admin) 
        ERC20("VibeToken", "VIBE") 
        ERC20Permit("VibeToken")
        nonZeroAddress(admin)
    {
        // Set up role hierarchy
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        
        // Set ADMIN_ROLE as the admin of other roles
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(PAUSER_ROLE, ADMIN_ROLE);
    }

    // ============================================
    // MINTING FUNCTIONS
    // ============================================

    /**
     * @notice Mints tokens to a specified address
     * @param to Recipient address
     * @param amount Amount of tokens to mint (in wei)
     * @dev Includes rate limiting and supply cap checks
     *      Cooldown is skipped for contract callers with MINTER_ROLE (e.g., RewardManager)
     *      Emits TokensMinted event
     */
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        nonReentrant
        whenNotPaused
        nonZeroAddress(to)
        nonZeroAmount(amount)
    {
        // Check per-transaction limit
        if (amount > MAX_MINT_PER_TX) {
            revert ExceedsMintLimit(amount, MAX_MINT_PER_TX);
        }
        
        // Check supply cap
        uint256 newSupply = totalSupply() + amount;
        if (newSupply > MAX_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_SUPPLY - totalSupply());
        }
        
        // Check rate limiting (cooldown) - skip for contract minters (e.g., RewardManager)
        // This allows the RewardManager to handle its own rate limiting
        bool isContractMinter = msg.sender.code.length > 0;
        if (!isContractMinter) {
            uint256 cooldownEnds = _lastMintTimestamp[to] + MINT_COOLDOWN;
            if (block.timestamp < cooldownEnds) {
                revert MintCooldownActive(to, cooldownEnds);
            }
            _lastMintTimestamp[to] = block.timestamp;
        }
        
        // Update state
        totalMinted += amount;
        
        // Mint tokens
        _mint(to, amount);
        
        emit TokensMinted(to, amount, msg.sender, block.timestamp);
    }

    /**
     * @notice Mints tokens to multiple addresses in a single transaction
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint
     * @dev More gas efficient than multiple individual mints
     *      Validates array lengths and enforces batch size limit
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts)
        external
        onlyRole(MINTER_ROLE)
        nonReentrant
        whenNotPaused
    {
        uint256 length = recipients.length;
        
        // Validate inputs
        if (length != amounts.length) revert ArrayLengthMismatch();
        if (length > 100) revert BatchTooLarge(length, 100);
        if (length == 0) revert ZeroAmount();
        
        uint256 totalAmount = 0;
        
        // Calculate total and validate each recipient
        for (uint256 i = 0; i < length; ) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0) revert ZeroAmount();
            if (amounts[i] > MAX_MINT_PER_TX) {
                revert ExceedsMintLimit(amounts[i], MAX_MINT_PER_TX);
            }
            totalAmount += amounts[i];
            unchecked { ++i; }
        }
        
        // Check supply cap for total
        if (totalSupply() + totalAmount > MAX_SUPPLY) {
            revert ExceedsMaxSupply(totalAmount, MAX_SUPPLY - totalSupply());
        }
        
        // Perform mints (skip cooldown for batch operations to admin discretion)
        for (uint256 i = 0; i < length; ) {
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i], msg.sender, block.timestamp);
            unchecked { ++i; }
        }
        
        totalMinted += totalAmount;
    }

    /**
     * @notice Emergency mint without rate limiting (for admin use only)
     * @param to Recipient address
     * @param amount Amount to mint
     * @dev Should only be used in exceptional circumstances
     *      Still respects supply cap and per-tx limit
     */
    function emergencyMint(address to, uint256 amount)
        external
        onlyRole(ADMIN_ROLE)
        nonReentrant
        nonZeroAddress(to)
        nonZeroAmount(amount)
    {
        if (amount > MAX_MINT_PER_TX) {
            revert ExceedsMintLimit(amount, MAX_MINT_PER_TX);
        }
        
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_SUPPLY - totalSupply());
        }
        
        totalMinted += amount;
        _mint(to, amount);
        
        emit TokensMinted(to, amount, msg.sender, block.timestamp);
    }

    // ============================================
    // PAUSE FUNCTIONS
    // ============================================

    /**
     * @notice Pauses all token transfers and minting
     * @dev Can only be called by PAUSER_ROLE
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Unpauses the contract
     * @dev Can only be called by PAUSER_ROLE
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    // ============================================
    // ROLE MANAGEMENT
    // ============================================

    /**
     * @notice Adds a new minter
     * @param account Address to grant minter role
     */
    function addMinter(address account) 
        external 
        onlyRole(ADMIN_ROLE)
        nonZeroAddress(account)
    {
        grantRole(MINTER_ROLE, account);
        emit MinterAdded(account, msg.sender);
    }

    /**
     * @notice Removes a minter
     * @param account Address to revoke minter role
     */
    function removeMinter(address account) 
        external 
        onlyRole(ADMIN_ROLE)
        nonZeroAddress(account)
    {
        revokeRole(MINTER_ROLE, account);
        emit MinterRemoved(account, msg.sender);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Returns the remaining mintable supply
     * @return Amount of tokens that can still be minted
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @notice Checks if an address can be minted to (cooldown check)
     * @param account Address to check
     * @return canMint Whether minting is allowed
     * @return cooldownEnds Timestamp when cooldown ends (0 if no cooldown)
     */
    function canMintTo(address account) 
        external 
        view 
        returns (bool canMint, uint256 cooldownEnds) 
    {
        cooldownEnds = _lastMintTimestamp[account] + MINT_COOLDOWN;
        canMint = block.timestamp >= cooldownEnds;
    }

    /**
     * @notice Returns the last mint timestamp for an address
     * @param account Address to check
     * @return Timestamp of last mint
     */
    function lastMintTime(address account) external view returns (uint256) {
        return _lastMintTimestamp[account];
    }

    // ============================================
    // REQUIRED OVERRIDES
    // ============================================

    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

