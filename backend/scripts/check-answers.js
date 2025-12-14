// Check answer status in database
require('dotenv').config();
const mongoose = require('mongoose');

async function checkAnswers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Answer = mongoose.model('Answer', new mongoose.Schema({}, { strict: false }));
  const RewardLog = mongoose.model('RewardLog', new mongoose.Schema({}, { strict: false }));
  
  const answers = await Answer.find({ isAccepted: true }).lean();
  
  console.log('=== Accepted Answers Status ===\n');
  
  for (const answer of answers) {
    console.log(`Answer ID: ${answer._id}`);
    console.log(`  Author: ${answer.author}`);
    console.log(`  isAccepted: ${answer.isAccepted}`);
    console.log(`  txHashes: ${JSON.stringify(answer.txHashes || [])}`);
    console.log(`  vibeReward: ${answer.vibeReward || 0}`);
    
    // Check RewardLog
    const logs = await RewardLog.find({ answerId: answer._id }).lean();
    console.log(`  RewardLog entries: ${logs.length}`);
    logs.forEach(log => {
      console.log(`    - Type: ${log.rewardType}, Status: ${log.status}, TxHash: ${log.txHash}, Error: ${log.error || 'none'}`);
    });
    console.log('');
  }
  
  await mongoose.disconnect();
}

checkAnswers().catch(console.error);
