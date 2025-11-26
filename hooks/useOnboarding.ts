import { useState, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { OnboardingService, OnboardingResult } from '../services/future-blockchain-hooks/onboardingService';
import { useGameStore } from '../store/gameStore';

export interface UseOnboardingReturn {
  onboard: () => Promise<OnboardingResult>;
  loading: boolean;
  error: string | null;
  success: boolean;
  transactionHash: string | null;
  resetState: () => void;
}

/**
 * Hook to manage COTI account onboarding
 * Handles the process of generating RSA keys and submitting to onboarding contract
 */
export function useOnboarding(): UseOnboardingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const addLog = useGameStore((state) => state.addLog);
  const setOnboarded = useGameStore((state) => state.setOnboarded);

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
   * Executes the onboarding process
   * @returns Promise with onboarding result
   */
  const onboard = useCallback(async (): Promise<OnboardingResult> => {
    resetState();
    setLoading(true);

    try {
      // Validate wallet connection
      if (!window.ethereum) {
        throw new Error('No Web3 wallet detected. Please install MetaMask.');
      }

      const provider = new BrowserProvider(window.ethereum);

      addLog('Onboarding: Starting COTI account onboarding...');

      // Execute onboarding via service
      const result = await OnboardingService.onboardAccount(provider);

      if (result.success && result.userKey) {
        setSuccess(true);
        setTransactionHash(result.transactionHash || null);

        // Update game store with onboarded status
        setOnboarded(result.userKey);

        addLog('Onboarding: Successfully onboarded!');

        return result;
      } else {
        throw new Error('Onboarding failed');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error occurred during onboarding';
      console.error('[useOnboarding] Error:', err);

      setError(errorMessage);
      setSuccess(false);
      addLog(`Onboarding Error: ${errorMessage}`);

      return {
        success: false,
        userKey: '',
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [addLog, setOnboarded, resetState]);

  return {
    onboard,
    loading,
    error,
    success,
    transactionHash,
    resetState,
  };
}
