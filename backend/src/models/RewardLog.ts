import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRewardLog extends Document {
  answerId: Types.ObjectId;
  recipient: string; // wallet address
  rewardType: 'accepted_answer' | 'upvote_threshold' | 'questioner_bonus' | 'special';
  amount: string; // in wei
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const RewardLogSchema = new Schema<IRewardLog>(
  {
    answerId: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    rewardType: {
      type: String,
      enum: ['accepted_answer', 'upvote_threshold', 'questioner_bonus', 'special'],
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RewardLogSchema.index({ recipient: 1, createdAt: -1 });
RewardLogSchema.index({ status: 1 });
RewardLogSchema.index({ rewardType: 1 });

export const RewardLog = mongoose.model<IRewardLog>(
  'RewardLog',
  RewardLogSchema
);



