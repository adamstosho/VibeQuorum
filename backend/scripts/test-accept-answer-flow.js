// Test script to simulate accepting an answer and verify reward flow
require('dotenv').config();
const mongoose = require('mongoose');
const { ethers } = require('ethers');

const MONGODB_URI = process.env.MONGODB_URI;

// Import the actual service
const path = require('path');
const { connectDB } = require('../src/config/database');

// We need to import the services properly
async function testAcceptAnswerFlow() {
  console.log('🧪 Testing Accept Answer Reward Flow\n');
  console.log('='.repeat(60));

  // Connect to database
  await connectDB();

  // Import models and services after DB connection
  const { Answer } = require('../src/models/Answer');
  const { Question } = require('../src/models/Question');
  const { RewardLog } = require('../src/models/RewardLog');
  const { questionService } = require('../src/services/question.service');
  const { rewardService } = require('../src/services/reward.service');

  try {
    // 1. Find a question with an unaccepted answer
    console.log('\n1️⃣ Finding test question and answer...');
    const questions = await Question.find({ status: 'open' }).limit(5).lean();
    
    if (questions.length === 0) {
      console.log('   ⚠️  No open questions found. Creating test data...');
      // You would create test data here if needed
      console.log('   💡 Please create a question and answer first via the frontend');
      return;
    }

    // Find a question with answers
    let testQuestion = null;
    let testAnswer = null;

    for (const q of questions) {
      const answers = await Answer.find({ 
        questionId: q._id,
        isAccepted: false 
      }).limit(1).lean();
      
      if (answers.length > 0) {
        testQuestion = q;
        testAnswer = answers[0];
        break;
      }
    }

    if (!testQuestion || !testAnswer) {
      console.log('   ⚠️  No question with unaccepted answers found');
      console.log('   💡 Please create a question and answer first via the frontend');
      return;
    }

    console.log(`   ✅ Found test question: ${testQuestion._id}`);
    console.log(`   ✅ Found test answer: ${testAnswer._id}`);
    console.log(`   Question author: ${testQuestion.author}`);
    console.log(`   Answer author: ${testAnswer.author}`);

    // 2. Verify answer author is valid
    console.log('\n2️⃣ Validating addresses...');
    if (!ethers.isAddress(testAnswer.author)) {
      console.log(`   ❌ Invalid answer author address: ${testAnswer.author}`);
      return;
    }
    const normalizedAnswerer = ethers.getAddress(testAnswer.author.toLowerCase());
    console.log(`   ✅ Answer author: ${normalizedAnswerer}`);

    if (!ethers.isAddress(testQuestion.author)) {
      console.log(`   ❌ Invalid question author address: ${testQuestion.author}`);
      return;
    }
    const normalizedQuestioner = ethers.getAddress(testQuestion.author.toLowerCase());
    console.log(`   ✅ Question author: ${normalizedQuestioner}`);

    // 3. Check current state
    console.log('\n3️⃣ Checking current state...');
    const answerBefore = await Answer.findById(testAnswer._id).lean();
    console.log(`   Answer isAccepted: ${answerBefore.isAccepted}`);
    console.log(`   Answer txHashes: ${JSON.stringify(answerBefore.txHashes || [])}`);
    console.log(`   Answer vibeReward: ${answerBefore.vibeReward || 0}`);

    const existingRewardLogs = await RewardLog.find({
      $or: [
        { answerId: testAnswer._id },
        { questionId: testQuestion._id }
      ]
    }).lean();
    console.log(`   Existing RewardLog entries: ${existingRewardLogs.length}`);

    // 4. Simulate accepting the answer (if not already accepted)
    if (!answerBefore.isAccepted) {
      console.log('\n4️⃣ Simulating accept answer...');
      console.log('   ⚠️  Note: This will actually accept the answer!');
      console.log('   💡 In production, this is done via the frontend when question owner clicks "Accept"');
      
      // We'll use the questionService to accept the answer
      // This will trigger both answerer and questioner rewards
      try {
        const result = await questionService.acceptAnswer(
          testQuestion._id.toString(),
          testAnswer._id.toString(),
          testQuestion.author
        );

        console.log('\n   ✅ Answer accepted successfully!');
        console.log(`   Answerer reward: ${result.reward ? '✅ Success' : '❌ Failed'}`);
        if (result.reward) {
          console.log(`     TxHash: ${result.reward.txHash}`);
          console.log(`     Amount: ${result.reward.amount}`);
        }
        if (result.rewardError) {
          console.log(`     Error: ${result.rewardError}`);
        }

        console.log(`   Questioner reward: ${result.questionerReward ? '✅ Success' : '❌ Failed'}`);
        if (result.questionerReward) {
          console.log(`     TxHash: ${result.questionerReward.txHash}`);
          console.log(`     Amount: ${result.questionerReward.amount}`);
        }
        if (result.questionerRewardError) {
          console.log(`     Error: ${result.questionerRewardError}`);
        }

      } catch (error) {
        console.log(`   ❌ Error accepting answer: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
        return;
      }
    } else {
      console.log('\n4️⃣ Answer already accepted, checking rewards...');
      
      // Try to trigger reward if not already rewarded
      const hasSuccessfulReward = answerBefore.txHashes && 
        answerBefore.txHashes.some(h => h && h !== 'failed' && h.length > 10);
      
      if (!hasSuccessfulReward) {
        console.log('   ⚠️  Answer accepted but not rewarded. Triggering reward...');
        try {
          const rewardResult = await rewardService.rewardAcceptedAnswer(testAnswer._id.toString());
          console.log(`   ✅ Reward triggered: ${rewardResult.txHash}`);
        } catch (error) {
          console.log(`   ❌ Reward failed: ${error.message}`);
        }
      } else {
        console.log('   ✅ Answer already has successful reward');
      }
    }

    // 5. Verify final state
    console.log('\n5️⃣ Verifying final state...');
    const answerAfter = await Answer.findById(testAnswer._id).lean();
    console.log(`   Answer isAccepted: ${answerAfter.isAccepted}`);
    console.log(`   Answer txHashes: ${JSON.stringify(answerAfter.txHashes || [])}`);
    console.log(`   Answer vibeReward: ${answerAfter.vibeReward || 0}`);

    const finalRewardLogs = await RewardLog.find({
      $or: [
        { answerId: testAnswer._id },
        { questionId: testQuestion._id }
      ]
    }).sort({ createdAt: -1 }).lean();

    console.log(`\n   RewardLog entries (${finalRewardLogs.length}):`);
    finalRewardLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. Type: ${log.rewardType}`);
      console.log(`      Status: ${log.status}`);
      console.log(`      Recipient: ${log.recipient}`);
      console.log(`      Amount: ${log.amount}`);
      console.log(`      TxHash: ${log.txHash}`);
      if (log.error) {
        console.log(`      Error: ${log.error}`);
      }
    });

    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Test Summary:');
    
    const answererReward = finalRewardLogs.find(
      log => log.rewardType === 'accepted_answer' && log.status === 'confirmed'
    );
    const questionerReward = finalRewardLogs.find(
      log => log.rewardType === 'questioner_bonus' && log.status === 'confirmed'
    );

    console.log(`   Answerer reward: ${answererReward ? '✅ Confirmed' : '❌ Not confirmed'}`);
    if (answererReward) {
      console.log(`     Recipient: ${answererReward.recipient}`);
      console.log(`     Amount: ${ethers.formatEther(answererReward.amount)} VIBE`);
      console.log(`     TxHash: ${answererReward.txHash}`);
    }

    console.log(`   Questioner reward: ${questionerReward ? '✅ Confirmed' : '❌ Not confirmed'}`);
    if (questionerReward) {
      console.log(`     Recipient: ${questionerReward.recipient}`);
      console.log(`     Amount: ${ethers.formatEther(questionerReward.amount)} VIBE`);
      console.log(`     TxHash: ${questionerReward.txHash}`);
    }

    if (answererReward && questionerReward) {
      console.log('\n   ✅ SUCCESS: Both rewards processed correctly!');
    } else {
      console.log('\n   ⚠️  Some rewards failed. Check errors above.');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Test complete!');
  }
}

testAcceptAnswerFlow().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});



