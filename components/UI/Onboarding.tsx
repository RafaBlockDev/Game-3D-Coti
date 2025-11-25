import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { OnboardingService } from '../../services/future-blockchain-hooks/onboardingService';
import { useConnectorClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { ShieldCheck, Loader2, CheckCircle, XCircle } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const setOnboarded = useGameStore((state) => state.setOnboarded);
  const addLog = useGameStore((state) => state.addLog);
  const { data: client } = useConnectorClient();

  const handleOnboard = async () => {
    if (!client) {
      setStatus('error');
      setErrorMessage('Wallet not connected');
      return;
    }

    setStatus('processing');
    addLog("System: Starting COTI onboarding process...");

    try {
      // Convert viem client to ethers provider using window.ethereum
      const provider = new BrowserProvider(window.ethereum as any);

      const result = await OnboardingService.onboardAccount(provider);

      if (result.success && result.userKey) {
        setStatus('success');

        // Check if this was a new onboarding or already onboarded
        const isAlreadyOnboarded = result.userKey.startsWith('0x') && result.userKey.length === 66;

        if (isAlreadyOnboarded) {
          addLog("System: Already onboarded! Using existing credentials.");
          addLog(`TX: ${result.transactionHash?.slice(0, 10)}...`);
        } else {
          addLog(`Onboarding: Success! TX: ${result.transactionHash?.slice(0, 10)}...`);
          addLog("System: User key generated securely.");
        }

        // Wait a moment to show success state
        setTimeout(() => {
          setOnboarded(result.userKey);
        }, 1500);
      } else {
        setStatus('error');
        setErrorMessage('Onboarding failed. Please try again.');
        addLog("Error: Onboarding transaction failed.");
      }
    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(message);
      addLog(`Error: ${message}`);
    }
  };

  // Auto-start onboarding
  useEffect(() => {
    if (client && status === 'idle') {
      handleOnboard();
    }
  }, [client]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full border ${
            status === 'processing' ? 'bg-blue-600/20 border-blue-500/50' :
            status === 'success' ? 'bg-green-600/20 border-green-500/50' :
            status === 'error' ? 'bg-red-600/20 border-red-500/50' :
            'bg-blue-600/20 border-blue-500/50'
          }`}>
            {status === 'processing' && <Loader2 size={48} className="text-blue-400 animate-spin" />}
            {status === 'success' && <CheckCircle size={48} className="text-green-400" />}
            {status === 'error' && <XCircle size={48} className="text-red-400" />}
            {status === 'idle' && <ShieldCheck size={48} className="text-blue-400" />}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 tracking-tight">
          {status === 'processing' && 'Onboarding Account'}
          {status === 'success' && 'Onboarding Complete!'}
          {status === 'error' && 'Onboarding Failed'}
          {status === 'idle' && 'Preparing Onboarding'}
        </h1>

        <p className="text-slate-400 mb-6">
          {status === 'processing' && 'Generating cryptographic keys and submitting to COTI network...'}
          {status === 'success' && 'Your account is now ready for confidential transactions.'}
          {status === 'error' && errorMessage}
          {status === 'idle' && 'Initializing secure account setup...'}
        </p>

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={handleOnboard}
              className="w-full py-3 px-6 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Retry Onboarding
            </button>
            <button
              onClick={() => {
                setOnboarded("mock-user-key-for-development");
                addLog("System: Skipped onboarding (dev mode)");
              }}
              className="w-full py-3 px-6 rounded-lg font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors text-sm"
            >
              Skip Onboarding (Dev Mode)
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="text-xs text-slate-500 mt-4">
            This may take a few moments. Please don't close this window.
          </div>
        )}
      </div>
    </div>
  );
};
