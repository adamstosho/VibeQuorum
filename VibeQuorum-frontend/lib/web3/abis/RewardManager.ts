// RewardManager ABI - Reward distribution for VibeQuorum
export const REWARD_MANAGER_ABI = [
  // Constructor
  {
    inputs: [
      { internalType: 'address', name: '_vibeToken', type: 'address' },
      { internalType: 'address', name: '_admin', type: 'address' },
      { internalType: 'address', name: '_emergencyAddress', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  
  // Read Functions - Reward Configuration
  {
    inputs: [],
    name: 'vibeToken',
    outputs: [{ internalType: 'contract VibeToken', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptedAnswerReward',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'upvoteReward',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'upvoteThreshold',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'questionerBonus',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxDailyRewardPerUser',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardCooldown',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalRewardsDistributed',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAnswersRewarded',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  
  // Read Functions - User/Answer Status
  {
    inputs: [{ internalType: 'bytes32', name: 'answerId', type: 'bytes32' }],
    name: 'isAnswerRewarded',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserDailyRewards',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getRemainingDailyAllowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'canReceiveReward',
    outputs: [
      { internalType: 'bool', name: 'canReceive', type: 'bool' },
      { internalType: 'uint256', name: 'cooldownEnds', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getLastRewardTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRewardConfig',
    outputs: [
      { internalType: 'uint256', name: '_acceptedAnswerReward', type: 'uint256' },
      { internalType: 'uint256', name: '_upvoteReward', type: 'uint256' },
      { internalType: 'uint256', name: '_upvoteThreshold', type: 'uint256' },
      { internalType: 'uint256', name: '_questionerBonus', type: 'uint256' },
      { internalType: 'uint256', name: '_maxDailyReward', type: 'uint256' },
      { internalType: 'uint256', name: '_cooldown', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStats',
    outputs: [
      { internalType: 'uint256', name: '_totalDistributed', type: 'uint256' },
      { internalType: 'uint256', name: '_totalAnswersRewarded', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  
  // Utility Functions
  {
    inputs: [
      { internalType: 'uint256', name: 'questionId', type: 'uint256' },
      { internalType: 'uint256', name: 'answerIndex', type: 'uint256' },
    ],
    name: 'generateAnswerId',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'answerIdString', type: 'string' }],
    name: 'generateAnswerIdFromString',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  
  // Write Functions - Reward Distribution (Admin only)
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'bytes32', name: 'answerId', type: 'bytes32' },
      { internalType: 'uint256', name: 'questionId', type: 'uint256' },
    ],
    name: 'rewardAcceptedAnswer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'bytes32', name: 'answerId', type: 'bytes32' },
      { internalType: 'uint256', name: 'questionId', type: 'uint256' },
    ],
    name: 'rewardUpvoteThreshold',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'questionId', type: 'uint256' },
    ],
    name: 'rewardQuestioner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes32', name: 'answerId', type: 'bytes32' },
      { internalType: 'uint256', name: 'questionId', type: 'uint256' },
    ],
    name: 'rewardSpecialContribution',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  
  // AccessControl Functions
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REWARDER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'recipient', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: true, internalType: 'bytes32', name: 'answerId', type: 'bytes32' },
      { indexed: false, internalType: 'uint8', name: 'rewardType', type: 'uint8' },
      { indexed: true, internalType: 'uint256', name: 'questionId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'AnswerRewarded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'acceptedAnswerReward', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'upvoteReward', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'upvoteThreshold', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'questionerBonus', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'updatedBy', type: 'address' },
    ],
    name: 'RewardParametersUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'totalRecipients', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'totalAmount', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'processedBy', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'BatchRewardProcessed',
    type: 'event',
  },
] as const


