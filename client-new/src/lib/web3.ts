import { ethers } from 'ethers';
import { documentVerificationAbi } from '@/abis/DocumentVerification.ts';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

/**
 * Get Web3 Provider from MetaMask
 */
export function getProvider(): ethers.BrowserProvider {
  if (typeof window.ethereum !== 'undefined') {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('MetaMask not installed. Please install MetaMask to use this application.');
}

/**
 * Get Signer from MetaMask
 */
export async function getSigner(): Promise<ethers.JsonRpcSigner> {
  const provider = getProvider();
  return await provider.getSigner();
}

/**
 * Get Contract instance
 * @param needSigner - Whether to attach a signer (for write operations)
 */
export async function getContract(needSigner = false): Promise<ethers.Contract> {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured. Please check VITE_CONTRACT_ADDRESS in .env');
  }

  const provider = getProvider();

  if (needSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, documentVerificationAbi, signer);
  }

  return new ethers.Contract(CONTRACT_ADDRESS, documentVerificationAbi, provider);
}

/**
 * Request account access from MetaMask
 */
export async function connectWallet(): Promise<string> {
  try {
    const provider = getProvider();
    const accounts = await provider.send('eth_requestAccounts', []);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw new Error('Failed to connect wallet. Please try again.');
  }
}

/**
 * Get current connected account
 */
export async function getAccount(): Promise<string | null> {
  try {
    const provider = getProvider();
    const accounts = await provider.send('eth_accounts', []);
    return accounts[0] || null;
  } catch (error) {
    return null;
  }
}

/**
 * Format address to short form (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}
