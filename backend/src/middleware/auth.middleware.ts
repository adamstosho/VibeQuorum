import { Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { AuthRequest } from '../types';
import { UnauthorizedError } from '../utils/errors';
import { normalizeAddress } from '../utils/helpers';

/**
 * Middleware to verify wallet signature
 * For MVP, we'll use a simple timestamp-based signature verification
 * In production, use SIWE (Sign-In with Ethereum) for better security
 */
export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

    // For MVP, we can allow requests without signature for read operations
    // But require it for write operations
    if (!walletAddress) {
      throw new UnauthorizedError('Missing wallet address');
    }

    // Validate address format
    if (!ethers.isAddress(walletAddress)) {
      throw new UnauthorizedError('Invalid wallet address format');
    }

    // Normalize address
    req.walletAddress = normalizeAddress(walletAddress);

    // If signature is provided, verify it
    if (signature && timestamp) {
      const requestTime = parseInt(timestamp, 10);
      const now = Date.now();
      const timeWindow = 5 * 60 * 1000; // 5 minutes

      if (isNaN(requestTime) || Math.abs(now - requestTime) > timeWindow) {
        throw new UnauthorizedError('Request expired');
      }

      // Verify signature
      const message = `Authenticate request at ${timestamp}`;
      try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== req.walletAddress) {
          throw new UnauthorizedError('Invalid signature');
        }
      } catch (error) {
        throw new UnauthorizedError('Signature verification failed');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional middleware - require signature for write operations
 * For MVP/hackathon: signature is optional, just log a warning
 */
export const requireSignature = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const signature = req.headers['x-signature'] as string;
  const timestamp = req.headers['x-timestamp'] as string;

  // For MVP: signature is optional, just proceed
  // In production, enforce signature verification
  if (process.env.NODE_ENV === 'production' && (!signature || !timestamp)) {
    throw new UnauthorizedError('Signature required for this operation');
  }

  // If signature provided, verify it
  if (signature && timestamp) {
    const requestTime = parseInt(timestamp, 10);
    const now = Date.now();
    const timeWindow = 5 * 60 * 1000; // 5 minutes

    if (!isNaN(requestTime) && Math.abs(now - requestTime) <= timeWindow) {
      const message = `Authenticate request at ${timestamp}`;
      try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== req.walletAddress?.toLowerCase()) {
          throw new UnauthorizedError('Invalid signature');
        }
      } catch (error) {
        // For MVP: log but don't fail
        if (process.env.NODE_ENV === 'production') {
          throw new UnauthorizedError('Signature verification failed');
        }
      }
    }
  }

  next();
};

/**
 * Admin middleware - check if wallet is admin
 */
export const adminMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const adminAddress = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase();

  if (!adminAddress) {
    throw new Error('ADMIN_WALLET_ADDRESS not configured');
  }

  if (!req.walletAddress || req.walletAddress !== adminAddress) {
    throw new UnauthorizedError('Admin access required');
  }

  next();
};

