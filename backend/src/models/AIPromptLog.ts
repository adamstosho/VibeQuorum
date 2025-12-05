import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAIPromptLog extends Document {
  questionId: Types.ObjectId;
  requestedBy: string; // wallet address
  systemPrompt: string;
  promptText: string;
  aiModel: string; // Renamed from 'model' to avoid conflict with mongoose Document.model
  responseText: string;
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  responseTimeMs?: number;
  costEstimate?: number;
  createdAt: Date;
}

const AIPromptLogSchema = new Schema<IAIPromptLog>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    systemPrompt: {
      type: String,
      required: true,
    },
    promptText: {
      type: String,
      required: true,
    },
    aiModel: {
      type: String,
      required: true,
      field: 'model', // Store as 'model' in database
    },
    responseText: {
      type: String,
      required: true,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    inputTokens: {
      type: Number,
      default: 0,
    },
    outputTokens: {
      type: Number,
      default: 0,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    costEstimate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics
AIPromptLogSchema.index({ createdAt: -1 });
AIPromptLogSchema.index({ model: 1, createdAt: -1 });
AIPromptLogSchema.index({ requestedBy: 1, createdAt: -1 });

export const AIPromptLog = mongoose.model<IAIPromptLog>(
  'AIPromptLog',
  AIPromptLogSchema
);

