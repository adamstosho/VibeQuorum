import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

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

const fixIndex = async () => {
    await connectDB();

    try {
        console.log('Attempting to drop unique index on txHash...');
        const collection = mongoose.connection.collection('rewardlogs');

        // List indexes to verify
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);

        const uniqueIndex = indexes.find(idx => idx.key.txHash === 1 && idx.unique === true);

        if (uniqueIndex) {
            console.log(`Found unique index: ${uniqueIndex.name}. Dropping it...`);
            await collection.dropIndex(uniqueIndex.name!);
            console.log('✅ Unique index dropped successfully.');
        } else {
            console.log('No unique index on txHash found. It might have been already dropped.');
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('❌ Error during index migration:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database disconnected.');
    }
};

fixIndex();
