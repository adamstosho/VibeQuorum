import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  displayName?: string;
  avatarUrl?: string;
  profileBio?: string;
  reputation: number;
  tokenBalanceCached: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      validate: {
        validator: (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v),
        message: 'Invalid Ethereum address',
      },
    },
    displayName: {
      type: String,
      maxlength: 50,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    profileBio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    reputation: {
      type: Number,
      default: 0,
      min: 0,
    },
    tokenBalanceCached: {
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
UserSchema.index({ reputation: -1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);





