import { ethers } from 'ethers';

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Normalize Ethereum address (lowercase)
 */
export const normalizeAddress = (address: string): string => {
  if (!isValidAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }
  return address.toLowerCase();
};

/**
 * Generate nonce for authentication
 */
export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

/**
 * Calculate pagination
 */
export const calculatePagination = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
};

/**
 * Sanitize markdown (basic - for production use a proper library)
 */
export const sanitizeMarkdown = (text: string): string => {
  // Basic sanitization - in production, use DOMPurify or similar
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};

