import { ethers } from 'ethers';
import { logger } from '../utils/logger';

let provider: ethers.JsonRpcProvider | null = null;
let adminWallet: ethers.Wallet | null = null;

/**
 * Get blockchain provider
 */
export const getProvider = (): ethers.JsonRpcProvider => {
  if (provider) {
    return provider;
  }

  const RPC_URL = process.env.RPC_URL;
  if (!RPC_URL) {
    throw new Error('RPC_URL environment variable is required');
  }

  provider = new ethers.JsonRpcProvider(RPC_URL);
  return provider;
};

/**
 * Get admin wallet for signing transactions
 */
export const getAdminWallet = (): ethers.Wallet => {
  if (adminWallet) {
    return adminWallet;
  }

  const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
  if (!ADMIN_PRIVATE_KEY) {
    throw new Error('ADMIN_PRIVATE_KEY environment variable is required');
  }

  const provider = getProvider();
  adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  logger.info(`✅ Admin wallet: ${adminWallet.address}`);
  return adminWallet;
};

/**
 * Get contract instance
 */
export const getContract = (
  address: string,
  abi: ethers.InterfaceAbi
): ethers.Contract => {
  const provider = getProvider();
  return new ethers.Contract(address, abi, provider);
};

/**
 * Get contract instance with signer (for write operations)
 */
export const getContractWithSigner = (
  address: string,
  abi: ethers.InterfaceAbi
): ethers.Contract => {
  const wallet = getAdminWallet();
  return new ethers.Contract(address, abi, wallet);
};

