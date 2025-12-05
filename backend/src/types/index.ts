import { Request } from 'express';

/**
 * Extended Express Request with wallet address
 */
export interface AuthRequest extends Request {
  walletAddress?: string;
  headers: Request['headers'] & {
    'x-wallet-address'?: string;
    'x-signature'?: string;
    'x-timestamp'?: string;
  };
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: 'newest' | 'oldest' | 'votes' | 'answers';
  tag?: string;
  search?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * AI Generation Options
 */
export interface AIGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  includeExistingAnswers?: boolean;
}

/**
 * AI Generation Result
 */
export interface AIGenerateResult {
  draft: string;
  logId: string;
  tokensUsed?: number;
  model: string;
}

