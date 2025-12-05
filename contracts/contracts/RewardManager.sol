// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./VibeToken.sol";

/**
 * @title RewardManager
 * @author VibeQuorum Team
 * @notice Manages reward distribution for the VibeQuorum Q&A Platform
 * @dev Implements comprehensive security measures for token reward distribution:
 *      - Role-based access control (Admin, Rewarder, Oracle roles)
 *      - Reentrancy protection on all state-changing functions
 *      - Pausable for emergency situations
 *      - Rate limiting per answer and per user
 *      - Double-reward prevention with idempotency
 *      - Configurable reward amounts with bounds
 *      - Comprehensive event logging for off-chain tracking
 * 
 * Security Features:
 * - Replay protection via answer ID tracking
 * - User daily reward caps to prevent abuse
 * - Minimum/maximum reward bounds
 * - Cooldown periods for rewards
 * - Multi-role separation of concerns
 */
contract RewardManager is AccessControl, ReentrancyGuard, Pausable {
    // ============================================
    // ROLES
    // ============================================

    /// @notice Admin role - can configure settings and grant roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    /// @notice Rewarder role - can trigger reward distributions
    bytes32 public constant REWARDER_ROLE = keccak256("REWARDER_ROLE");
    
    /// @notice Oracle role - can update reward parameters based on external data
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice Reference to the VibeToken contract
    VibeToken public immutable vibeToken;

    /// @notice Reward amount for accepted answers (in wei, 18 decimals)
    uint256 public acceptedAnswerReward;
    
    /// @notice Reward amount per upvote threshold (in wei, 18 decimals)
    uint256 public upvoteReward;
    
    /// @notice Number of upvotes required to trigger a reward
    uint256 public upvoteThreshold;
    
    /// @notice Bonus reward for question askers when their question is answered
    uint256 public questionerBonus;

    /// @notice Maximum reward per single distribution
    uint256 public constant MAX_SINGLE_REWARD = 1000 * 10**18;
    
    /// @notice Minimum reward per single distribution
    uint256 public constant MIN_SINGLE_REWARD = 1 * 10**18;
    
    /// @notice Maximum daily rewards per user
    uint256 public maxDailyRewardPerUser;
    
    /// @notice Cooldown between rewards for the same user (in seconds)
    uint256 public rewardCooldown;

    /// @notice Tracks if an answer has already been rewarded
    mapping(bytes32 => bool) private _rewardedAnswers;
    
    /// @notice Tracks daily rewards received by each user
    mapping(address => mapping(uint256 => uint256)) private _dailyRewards;
    
    /// @notice Tracks last reward timestamp per user
    mapping(address => uint256) private _lastRewardTimestamp;
    
    /// @notice Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    /// @notice Total unique answers rewarded
    uint256 public totalAnswersRewarded;
    
    /// @notice Emergency withdrawal address
    address public emergencyWithdrawAddress;

    // ============================================
    // STRUCTS
    // ============================================

    /// @notice Reward request structure
    struct RewardRequest {
        address recipient;
        uint256 amount;
        bytes32 answerId;
        RewardType rewardType;
        uint256 questionId;
    }
    
    /// @notice Types of rewards
    enum RewardType {
        ACCEPTED_ANSWER,
        UPVOTE_THRESHOLD,
        QUESTIONER_BONUS,
        SPECIAL_CONTRIBUTION
    }

    // ============================================
    // EVENTS
    // ============================================

    /// @notice Emitted when an answer is rewarded
    event AnswerRewarded(
        address indexed recipient,
        uint256 amount,
        bytes32 indexed answerId,
        RewardType rewardType,
        uint256 indexed questionId,
        uint256 timestamp
    );
    
    /// @notice Emitted when reward parameters are updated
    event RewardParametersUpdated(
        uint256 acceptedAnswerReward,
        uint256 upvoteReward,
        uint256 upvoteThreshold,
        uint256 questionerBonus,
        address indexed updatedBy
    );
    
    /// @notice Emitted when daily limit is updated
    event DailyLimitUpdated(
        uint256 oldLimit,
        uint256 newLimit,
        address indexed updatedBy
    );
    
    /// @notice Emitted when cooldown is updated
    event CooldownUpdated(
        uint256 oldCooldown,
        uint256 newCooldown,
        address indexed updatedBy
    );
    
    /// @notice Emitted when emergency withdrawal occurs
    event EmergencyWithdrawal(
        address indexed token,
        address indexed to,
        uint256 amount,
        address indexed triggeredBy
    );
    
    /// @notice Emitted when batch reward is processed
    event BatchRewardProcessed(
        uint256 totalRecipients,
        uint256 totalAmount,
        address indexed processedBy,
        uint256 timestamp
    );

    // ============================================
    // ERRORS
    // ============================================

    /// @notice Thrown when zero address is provided
    error ZeroAddress();
    
    /// @notice Thrown when zero amount is provided
    error ZeroAmount();
    
    /// @notice Thrown when answer has already been rewarded
    error AnswerAlreadyRewarded(bytes32 answerId);
    
    /// @notice Thrown when reward amount is out of bounds
    error RewardOutOfBounds(uint256 amount, uint256 min, uint256 max);
    
    /// @notice Thrown when user exceeds daily reward limit
    error DailyLimitExceeded(address user, uint256 currentDaily, uint256 limit);
    
    /// @notice Thrown when reward is requested too soon
    error CooldownNotElapsed(address user, uint256 cooldownEnds);
    
    /// @notice Thrown when array lengths mismatch
    error ArrayLengthMismatch();
    
    /// @notice Thrown when batch is too large
    error BatchTooLarge(uint256 size, uint256 maxSize);
    
    /// @notice Thrown when token transfer fails
    error TokenMintFailed();
    
    /// @notice Thrown when invalid reward type
    error InvalidRewardType();

    // ============================================
    // MODIFIERS
    // ============================================

    /// @notice Ensures address is not zero
    modifier nonZeroAddress(address account) {
        if (account == address(0)) revert ZeroAddress();
        _;
    }
    
    /// @notice Ensures amount is not zero
    modifier nonZeroAmount(uint256 amount) {
        if (amount == 0) revert ZeroAmount();
        _;
    }
    
    /// @notice Validates reward amount bounds
    modifier validRewardAmount(uint256 amount) {
        if (amount < MIN_SINGLE_REWARD || amount > MAX_SINGLE_REWARD) {
            revert RewardOutOfBounds(amount, MIN_SINGLE_REWARD, MAX_SINGLE_REWARD);
        }
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @notice Initializes the RewardManager contract
     * @param _vibeToken Address of the VibeToken contract
     * @param _admin Address that will have admin privileges
     * @param _emergencyAddress Address for emergency withdrawals
     */
    constructor(
        address _vibeToken,
        address _admin,
        address _emergencyAddress
    ) 
        nonZeroAddress(_vibeToken)
        nonZeroAddress(_admin)
        nonZeroAddress(_emergencyAddress)
    {
        vibeToken = VibeToken(_vibeToken);
        emergencyWithdrawAddress = _emergencyAddress;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(REWARDER_ROLE, _admin);
        _grantRole(ORACLE_ROLE, _admin);
        
        // Set role admins
        _setRoleAdmin(REWARDER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(ORACLE_ROLE, ADMIN_ROLE);
        
        // Initialize default reward values (in wei, 18 decimals)
        acceptedAnswerReward = 50 * 10**18;  // 50 VIBE for accepted answer
        upvoteReward = 5 * 10**18;           // 5 VIBE per upvote threshold
        upvoteThreshold = 10;                 // 10 upvotes to trigger reward
        questionerBonus = 10 * 10**18;       // 10 VIBE for questioner when answered
        
        // Rate limiting defaults
        maxDailyRewardPerUser = 500 * 10**18; // Max 500 VIBE per day per user
        rewardCooldown = 5 minutes;            // 5 minutes between rewards
    }

    // ============================================
    // REWARD FUNCTIONS
    // ============================================

    /**
     * @notice Rewards a user for an accepted answer
     * @param recipient Address to receive the reward
     * @param answerId Unique identifier for the answer (prevents double rewards)
     * @param questionId Question identifier for tracking
     */
    function rewardAcceptedAnswer(
        address recipient,
        bytes32 answerId,
        uint256 questionId
    )
        external
        onlyRole(REWARDER_ROLE)
        nonReentrant
        whenNotPaused
        nonZeroAddress(recipient)
    {
        _processReward(
            recipient,
            acceptedAnswerReward,
            answerId,
            RewardType.ACCEPTED_ANSWER,
            questionId
        );
    }

    /**
     * @notice Rewards a user for reaching upvote threshold
     * @param recipient Address to receive the reward
     * @param answerId Unique identifier for the answer
     * @param questionId Question identifier for tracking
     */
    function rewardUpvoteThreshold(
        address recipient,
        bytes32 answerId,
        uint256 questionId
    )
        external
        onlyRole(REWARDER_ROLE)
        nonReentrant
        whenNotPaused
        nonZeroAddress(recipient)
    {
        _processReward(
            recipient,
            upvoteReward,
            answerId,
            RewardType.UPVOTE_THRESHOLD,
            questionId
        );
    }

    /**
     * @notice Rewards the questioner when their question receives an accepted answer
     * @param recipient Address of the questioner
     * @param questionId Unique identifier for the question
     */
    function rewardQuestioner(
        address recipient,
        uint256 questionId
    )
        external
        onlyRole(REWARDER_ROLE)
        nonReentrant
        whenNotPaused
        nonZeroAddress(recipient)
    {
        bytes32 questionRewardId = keccak256(
            abi.encodePacked("QUESTIONER", questionId)
        );
        
        _processReward(
            recipient,
            questionerBonus,
            questionRewardId,
            RewardType.QUESTIONER_BONUS,
            questionId
        );
    }

    /**
     * @notice Rewards with custom amount for special contributions
     * @param recipient Address to receive the reward
     * @param amount Custom reward amount
     * @param answerId Unique identifier for the contribution
     * @param questionId Related question ID
     */
    function rewardSpecialContribution(
        address recipient,
        uint256 amount,
        bytes32 answerId,
        uint256 questionId
    )
        external
        onlyRole(ADMIN_ROLE)
        nonReentrant
        whenNotPaused
        nonZeroAddress(recipient)
        validRewardAmount(amount)
    {
        _processReward(
            recipient,
            amount,
            answerId,
            RewardType.SPECIAL_CONTRIBUTION,
            questionId
        );
    }

    /**
     * @notice Process batch rewards efficiently
     * @param requests Array of reward requests
     * @dev More gas efficient for multiple rewards
     */
    function batchReward(RewardRequest[] calldata requests)
        external
        onlyRole(REWARDER_ROLE)
        nonReentrant
        whenNotPaused
    {
        uint256 length = requests.length;
        if (length == 0) revert ZeroAmount();
        if (length > 50) revert BatchTooLarge(length, 50);
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < length; ) {
            RewardRequest calldata req = requests[i];
            
            // Skip if already rewarded (don't revert to allow partial processing)
            if (!_rewardedAnswers[req.answerId]) {
                _processRewardUnchecked(
                    req.recipient,
                    req.amount,
                    req.answerId,
                    req.rewardType,
                    req.questionId
                );
                totalAmount += req.amount;
            }
            
            unchecked { ++i; }
        }
        
        emit BatchRewardProcessed(length, totalAmount, msg.sender, block.timestamp);
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    /**
     * @dev Internal function to process a reward with all checks
     */
    function _processReward(
        address recipient,
        uint256 amount,
        bytes32 answerId,
        RewardType rewardType,
        uint256 questionId
    ) internal {
        // Check if already rewarded
        if (_rewardedAnswers[answerId]) {
            revert AnswerAlreadyRewarded(answerId);
        }
        
        // Check cooldown
        uint256 cooldownEnds = _lastRewardTimestamp[recipient] + rewardCooldown;
        if (block.timestamp < cooldownEnds) {
            revert CooldownNotElapsed(recipient, cooldownEnds);
        }
        
        // Check daily limit
        uint256 today = block.timestamp / 1 days;
        uint256 currentDailyTotal = _dailyRewards[recipient][today];
        if (currentDailyTotal + amount > maxDailyRewardPerUser) {
            revert DailyLimitExceeded(recipient, currentDailyTotal, maxDailyRewardPerUser);
        }
        
        _processRewardUnchecked(recipient, amount, answerId, rewardType, questionId);
    }

    /**
     * @dev Internal function to process reward without rate limit checks
     *      Used for batch processing where checks are done at batch level
     */
    function _processRewardUnchecked(
        address recipient,
        uint256 amount,
        bytes32 answerId,
        RewardType rewardType,
        uint256 questionId
    ) internal {
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (amount < MIN_SINGLE_REWARD || amount > MAX_SINGLE_REWARD) {
            revert RewardOutOfBounds(amount, MIN_SINGLE_REWARD, MAX_SINGLE_REWARD);
        }
        
        // Mark as rewarded
        _rewardedAnswers[answerId] = true;
        
        // Update tracking
        uint256 today = block.timestamp / 1 days;
        _dailyRewards[recipient][today] += amount;
        _lastRewardTimestamp[recipient] = block.timestamp;
        totalRewardsDistributed += amount;
        totalAnswersRewarded++;
        
        // Mint tokens to recipient
        vibeToken.mint(recipient, amount);
        
        emit AnswerRewarded(
            recipient,
            amount,
            answerId,
            rewardType,
            questionId,
            block.timestamp
        );
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Updates reward parameters
     * @param _acceptedAnswerReward New reward for accepted answers
     * @param _upvoteReward New reward per upvote threshold
     * @param _upvoteThreshold New upvote threshold
     * @param _questionerBonus New bonus for questioners
     */
    function setRewardParameters(
        uint256 _acceptedAnswerReward,
        uint256 _upvoteReward,
        uint256 _upvoteThreshold,
        uint256 _questionerBonus
    )
        external
        onlyRole(ADMIN_ROLE)
    {
        // Validate bounds
        if (_acceptedAnswerReward < MIN_SINGLE_REWARD || 
            _acceptedAnswerReward > MAX_SINGLE_REWARD) {
            revert RewardOutOfBounds(_acceptedAnswerReward, MIN_SINGLE_REWARD, MAX_SINGLE_REWARD);
        }
        if (_upvoteReward < MIN_SINGLE_REWARD || _upvoteReward > MAX_SINGLE_REWARD) {
            revert RewardOutOfBounds(_upvoteReward, MIN_SINGLE_REWARD, MAX_SINGLE_REWARD);
        }
        if (_questionerBonus < MIN_SINGLE_REWARD || _questionerBonus > MAX_SINGLE_REWARD) {
            revert RewardOutOfBounds(_questionerBonus, MIN_SINGLE_REWARD, MAX_SINGLE_REWARD);
        }
        if (_upvoteThreshold == 0) revert ZeroAmount();
        
        acceptedAnswerReward = _acceptedAnswerReward;
        upvoteReward = _upvoteReward;
        upvoteThreshold = _upvoteThreshold;
        questionerBonus = _questionerBonus;
        
        emit RewardParametersUpdated(
            _acceptedAnswerReward,
            _upvoteReward,
            _upvoteThreshold,
            _questionerBonus,
            msg.sender
        );
    }

    /**
     * @notice Updates maximum daily reward per user
     * @param _maxDailyReward New daily limit
     */
    function setMaxDailyReward(uint256 _maxDailyReward)
        external
        onlyRole(ADMIN_ROLE)
        nonZeroAmount(_maxDailyReward)
    {
        uint256 oldLimit = maxDailyRewardPerUser;
        maxDailyRewardPerUser = _maxDailyReward;
        
        emit DailyLimitUpdated(oldLimit, _maxDailyReward, msg.sender);
    }

    /**
     * @notice Updates reward cooldown period
     * @param _cooldown New cooldown in seconds
     */
    function setRewardCooldown(uint256 _cooldown)
        external
        onlyRole(ADMIN_ROLE)
    {
        uint256 oldCooldown = rewardCooldown;
        rewardCooldown = _cooldown;
        
        emit CooldownUpdated(oldCooldown, _cooldown, msg.sender);
    }

    /**
     * @notice Updates emergency withdrawal address
     * @param _newAddress New emergency address
     */
    function setEmergencyAddress(address _newAddress)
        external
        onlyRole(ADMIN_ROLE)
        nonZeroAddress(_newAddress)
    {
        emergencyWithdrawAddress = _newAddress;
    }

    // ============================================
    // PAUSE FUNCTIONS
    // ============================================

    /**
     * @notice Pauses all reward operations
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses reward operations
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Checks if an answer has been rewarded
     * @param answerId The answer ID to check
     * @return True if the answer has been rewarded
     */
    function isAnswerRewarded(bytes32 answerId) external view returns (bool) {
        return _rewardedAnswers[answerId];
    }

    /**
     * @notice Gets user's daily reward total for today
     * @param user Address to check
     * @return Current daily total
     */
    function getUserDailyRewards(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        return _dailyRewards[user][today];
    }

    /**
     * @notice Gets user's remaining daily allowance
     * @param user Address to check
     * @return Remaining allowance
     */
    function getRemainingDailyAllowance(address user) 
        external 
        view 
        returns (uint256) 
    {
        uint256 today = block.timestamp / 1 days;
        uint256 used = _dailyRewards[user][today];
        if (used >= maxDailyRewardPerUser) return 0;
        return maxDailyRewardPerUser - used;
    }

    /**
     * @notice Checks if user can receive rewards (cooldown check)
     * @param user Address to check
     * @return canReceive Whether user can receive rewards
     * @return cooldownEnds When cooldown ends
     */
    function canReceiveReward(address user)
        external
        view
        returns (bool canReceive, uint256 cooldownEnds)
    {
        cooldownEnds = _lastRewardTimestamp[user] + rewardCooldown;
        canReceive = block.timestamp >= cooldownEnds;
    }

    /**
     * @notice Gets last reward timestamp for a user
     * @param user Address to check
     * @return Timestamp of last reward
     */
    function getLastRewardTime(address user) external view returns (uint256) {
        return _lastRewardTimestamp[user];
    }

    /**
     * @notice Gets current reward configuration
     * @return _acceptedAnswerReward Current accepted answer reward
     * @return _upvoteReward Current upvote reward
     * @return _upvoteThreshold Current upvote threshold
     * @return _questionerBonus Current questioner bonus
     * @return _maxDailyReward Current max daily reward per user
     * @return _cooldown Current cooldown period
     */
    function getRewardConfig()
        external
        view
        returns (
            uint256 _acceptedAnswerReward,
            uint256 _upvoteReward,
            uint256 _upvoteThreshold,
            uint256 _questionerBonus,
            uint256 _maxDailyReward,
            uint256 _cooldown
        )
    {
        return (
            acceptedAnswerReward,
            upvoteReward,
            upvoteThreshold,
            questionerBonus,
            maxDailyRewardPerUser,
            rewardCooldown
        );
    }

    /**
     * @notice Gets total statistics
     * @return _totalDistributed Total rewards distributed
     * @return _totalAnswersRewarded Total answers rewarded
     */
    function getStats()
        external
        view
        returns (uint256 _totalDistributed, uint256 _totalAnswersRewarded)
    {
        return (totalRewardsDistributed, totalAnswersRewarded);
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * @notice Generates answer ID from question ID and answer index
     * @param questionId The question ID
     * @param answerIndex The answer index
     * @return The generated answer ID
     */
    function generateAnswerId(uint256 questionId, uint256 answerIndex)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(questionId, answerIndex));
    }

    /**
     * @notice Generates answer ID from string (for backend integration)
     * @param answerIdString The answer ID as string
     * @return The generated bytes32 answer ID
     */
    function generateAnswerIdFromString(string calldata answerIdString)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(answerIdString));
    }
}

