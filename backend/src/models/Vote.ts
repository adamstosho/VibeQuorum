import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVote extends Document {
  voter: string; // wallet address
  targetType: 'question' | 'answer';
  targetId: Types.ObjectId;
  value: 1 | -1;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    voter: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['question', 'answer'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    value: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one vote per user per target
VoteSchema.index({ voter: 1, targetType: 1, targetId: 1 }, { unique: true });
VoteSchema.index({ targetType: 1, targetId: 1 });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);



