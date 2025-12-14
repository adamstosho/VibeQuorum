import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnswer extends Document {
  questionId: Types.ObjectId;
  author: string; // wallet address
  content: string;
  upvotes: number;
  downvotes: number;
  aiGenerated: boolean;
  isAccepted: boolean;
  txHashes: string[]; // reward transaction hashes
  vibeReward: number; // total VIBE tokens rewarded (in wei, converted to readable format)
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 30000,
      trim: true,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    txHashes: {
      type: [String],
      default: [],
    },
    vibeReward: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AnswerSchema.index({ questionId: 1, createdAt: -1 });
AnswerSchema.index({ author: 1, createdAt: -1 });
AnswerSchema.index({ upvotes: -1 });
AnswerSchema.index({ isAccepted: 1 });

export const Answer = mongoose.model<IAnswer>('Answer', AnswerSchema);





