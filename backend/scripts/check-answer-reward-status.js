// Check if an answer is already rewarded on-chain
require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.RPC_URL;
const REWARD_MANAGER_ADDRESS = process.env.REWARD_MANAGER_ADDRESS;

const REWARD_MANAGER_ABI = [
  'function generateAnswerIdFromString(string calldata answerIdString) external pure returns (bytes32)',
  'function isAnswerRewarded(bytes32 answerId) external view returns (bool)',
];

async function checkAnswer(answerId) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const rewardManager = new ethers.Contract(REWARD_MANAGER_ADDRESS, REWARD_MANAGER_ABI, provider);
  
  const answerIdBytes = await rewardManager.generateAnswerIdFromString(answerId);
  const isRewarded = await rewardManager.isAnswerRewarded(answerIdBytes);
  
  console.log(`Answer ID: ${answerId}`);
  console.log(`Answer ID (bytes32): ${answerIdBytes}`);
  console.log(`Is rewarded on-chain: ${isRewarded}`);
  
  return isRewarded;
}

const answerId = process.argv[2] || '693c4682d691ab972ae314bb';
checkAnswer(answerId).catch(console.error);



