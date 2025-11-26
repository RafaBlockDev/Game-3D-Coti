import { useState, useCallback } from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { ethers } from 'ethers';
import { getGameTokenContract, COTI_CONFIG } from '../lib/cotiClient';
import { useGameStore } from '../store/gameStore';

export interface ClaimResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface UseGameTokenReturn {
  claimGameCoins: (address: string, amount: number) => Promise<ClaimResult>;
  loading: boolean;
  error: string | null;
  success: boolean;
  transactionHash: string | null;
  resetState: () => void;
}

const MAX_UINT64 = ethers.toBigInt("18446744073709551615");

/**
 * Hook to interact with the COTI Game Token contract
 * Provides methods to claim/mint tokens and track transaction state
 */
export function useGameToken(): UseGameTokenReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const addLog = useGameStore((state) => state.addLog);
  const userKey = useGameStore((state) => state.userKey);

  /**
   * Reset all state to initial values
   */
  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setTransactionHash(null);
  }, []);

  /**
   * Claims game tokens by minting them to the specified address
   * @param address - The wallet address to receive tokens
   * @param amount - The amount of tokens to mint (in whole units)
   * @returns Promise with claim result
   */
  const claimGameCoins = useCallback(async (
    address: string,
    amount: number
  ): Promise<ClaimResult> => {
    // Reset previous state
    resetState();
    setLoading(true);

    try {
      // Validate inputs
      if (!address || !address.startsWith('0x')) {
        throw new Error('Invalid wallet address');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (!userKey) {
        throw new Error('User not onboarded. Please complete onboarding first.');
      }

      // Get provider from window.ethereum
      if (!window.ethereum) {
        throw new Error('No Web3 wallet detected. Please install MetaMask.');
      }

      const provider = new BrowserProvider(window.ethereum);

      // Get the contract instance with signer and AES key
      addLog('Token: Connecting to game token contract...');
      const tokenContract = await getGameTokenContract(provider, userKey);

      // Convert amount to uint64 BigInt
      const amountUint64 = ethers.toBigInt(amount);

      // Validate uint64 limit
      if (amountUint64 > MAX_UINT64) {
        throw new Error('Amount exceeds uint64 limit');
      }

      addLog(`Token: Minting ${amount} tokens to ${address.slice(0, 10)}...`);

      // Call mint function on the contract (takes address and uint64)
      const tx = await tokenContract.mint(address, amountUint64, {
        gasLimit: COTI_CONFIG.GAS_LIMIT
      });

      addLog(`Token: Transaction submitted: ${tx.hash.slice(0, 10)}...`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        addLog(`Token: Successfully minted ${amount} tokens!`);
        setSuccess(true);
        setTransactionHash(receipt.hash);

        return {
          success: true,
          transactionHash: receipt.hash,
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      let errorMessage = err?.message || 'Unknown error occurred';

      // Detect specific error cases
      if (errorMessage.includes('CALL_EXCEPTION') || errorMessage.includes('missing revert data')) {
        errorMessage = 'Transaction rejected by contract. You may not have permission to mint tokens. Please check that your wallet is authorized to call the mint function.';
        addLog('Token Error: Only contract owner can mint tokens');
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user';
        addLog('Token: User cancelled transaction');
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees';
        addLog('Token Error: Not enough COTI for gas');
      } else if (errorMessage.includes('not onboarded')) {
        addLog('Token Error: User not onboarded');
      }

      console.error('[useGameToken] Error claiming tokens:', err);

      setError(errorMessage);
      setSuccess(false);
      addLog(`Token Error: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [addLog, resetState, userKey]);

  return {
    claimGameCoins,
    loading,
    error,
    success,
    transactionHash,
    resetState,
  };
}
