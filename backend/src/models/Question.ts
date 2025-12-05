import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  author: string; // wallet address
  title: string;
  description: string;
  tags: string[];
  status: 'open' | 'answered' | 'closed';
  acceptedAnswerId?: Types.ObjectId;
  aiDraftId?: Types.ObjectId;
  votesCount: number;
  answersCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    author: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 10000,
      trim: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= 5,
        message: 'Must have 1-5 tags',
      },
    },
    status: {
      type: String,
      enum: ['open', 'answered', 'closed'],
      default: 'open',
    },
    acceptedAnswerId: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      default: null,
    },
    aiDraftId: {
      type: Schema.Types.ObjectId,
      ref: 'AIPromptLog',
      default: null,
    },
    votesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    answersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
QuestionSchema.index({ title: 'text', description: 'text' });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ votesCount: -1 });
QuestionSchema.index({ author: 1, createdAt: -1 });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);



