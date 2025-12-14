import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { rewardService } from '../src/services/reward.service';
import { Answer } from '../src/models/Answer';
import { Question } from '../src/models/Question';
import { RewardLog } from '../src/models/RewardLog';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI!);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const runTest = async () => {
    await connectDB();

    try {
        console.log('🧪 Starting Reward Fix Verification...');

        // 1. Create Mock Data
        const mockAuthor = '0x1A0A85fd9E79562e85A0861c509E0c2239a6d0D5'; // Admin wallet for simplicity

        // Check if Question exists or create
        let question = await Question.findOne({ title: 'Test Question for Reward Fix' });
        if (!question) {
            question = await Question.create({
                author: mockAuthor,
                title: 'Test Question for Reward Fix',
                description: 'Test description',
                tags: ['test'],
                status: 'open'
            });
            console.log('✅ Created mock question');
        }

        // Check if Answer exists or create
        let answer = await Answer.findOne({ content: 'Test Answer for Reward Fix' });
        if (!answer) {
            answer = await Answer.create({
                questionId: question._id,
                author: mockAuthor,
                content: 'Test Answer for Reward Fix',
                isAccepted: true
            });
            console.log('✅ Created mock answer');
        } else {
            // Ensure it's accepted
            answer.isAccepted = true;
            await answer.save();
        }

        // 2. Test duplicate key error fix (Simulate failures)
        console.log('\n🧪 Testing Duplicate Failure Logs...');
        // Create first failed log
        await RewardLog.create({
            answerId: answer._id,
            recipient: mockAuthor,
            rewardType: 'accepted_answer',
            amount: '0',
            txHash: 'failed',
            status: 'failed',
            error: 'Simulated failure 1'
        });
        console.log('✅ Created failure log 1');

        // Create second failed log (this would fail before fix)
        try {
            await RewardLog.create({
                answerId: answer._id,
                recipient: mockAuthor, // Same recipient
                rewardType: 'accepted_answer',
                amount: '0',
                txHash: 'failed',
                status: 'failed',
                error: 'Simulated failure 2'
            });
            console.log('✅ Created failure log 2 (Duplicate key fix VERIFIED)');
        } catch (error: any) {
            console.error('❌ Failed to create second failure log:', error.message);
            if (error.code === 11000) {
                console.error('❌ Duplicate key error STILL EXISTS!');
            }
        }

        // Clean up test logs
        await RewardLog.deleteMany({ error: /Simulated failure/ });

        // 3. Test BigInt conversion fix
        // We can't easily mock the full blockchain call without mocking ethers, 
        // but we can verify the critical logic in isolation if we had a unit test.
        // Since this is an integration script, we will try to call the service but expect a blockchain error 
        // (since we might not have a running node or correct contract address hooked up to this script context fully),
        // BUT we want to ensure it fails at the network layer, NOT at the BigInt conversion layer.

        console.log('\n🧪 Testing BigInt Conversion (Expect Network/Contract Error, NOT BigInt Error)...');
        try {
            // Note: This calls the real service. If contract config is invalid it will fail.
            // We rely on the error message to confirm where it failed.
            await rewardService.rewardAcceptedAnswer(answer._id.toString());
            console.log('✅ Service executed successfully');
        } catch (error: any) {
            const msg = error.message;
            console.log(`Received error: ${msg}`);

            if (msg.includes('Cannot convert') && msg.includes('to a BigInt')) {
                console.error('❌ BigInt Error STILL EXISTS');
            } else if (msg.includes('REWARD_MANAGER_ADDRESS') || msg.includes('network') || msg.includes('contract') || msg.includes('transaction')) {
                console.log('✅ passed BigInt check (failed at network/contract level as expected in this test env)');
            } else {
                console.log('⚠️ Unknown error, investigation needed:', msg);
            }
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nTest complete.');
    }
};

runTest();
