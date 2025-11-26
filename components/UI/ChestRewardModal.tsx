import React, { useState, useEffect } from 'react';
import { useGameToken } from '../../hooks/useGameToken';
import { useGameStore } from '../../store/gameStore';
import { Coins, Loader2, CheckCircle, XCircle, ExternalLink, X } from 'lucide-react';

export interface ChestRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardAmount: number;
  chestId: string;
}

/**
 * Modal displayed when a player opens a chest
 * Allows them to claim their token rewards on-chain
 */
export const ChestRewardModal: React.FC<ChestRewardModalProps> = ({
  isOpen,
  onClose,
  rewardAmount,
  chestId,
}) => {
  const [claimState, setClaimState] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle');

  const walletAddress = useGameStore((state) => state.walletAddress);
  const isOnboarded = useGameStore((state) => state.isOnboarded);
  const incrementBalance = useGameStore((state) => state.incrementBalance);
  const setModalOpen = useGameStore((state) => state.setModalOpen);

  const {
    claimGameCoins,
    loading,
    error: claimError,
    success: claimSuccess,
    transactionHash,
    resetState,
  } = useGameToken();

  // Update claim state based on hook state
  useEffect(() => {
    if (loading) {
      setClaimState('claiming');
    } else if (claimSuccess && transactionHash) {
      setClaimState('success');
      // Update in-game balance
      incrementBalance(rewardAmount);
    } else if (claimError) {
      setClaimState('error');
    }
  }, [loading, claimSuccess, claimError, transactionHash, rewardAmount, incrementBalance]);

  // Reset state when modal opens and lock player movement
  useEffect(() => {
    if (isOpen) {
      setClaimState('idle');
      resetState();
      setModalOpen(true);
    } else {
      setModalOpen(false);
    }
  }, [isOpen, resetState, setModalOpen]);

  const handleClaim = async () => {
    if (!walletAddress) {
      alert('Wallet not connected');
      return;
    }

    if (!isOnboarded) {
      alert('Please complete onboarding first');
      return;
    }

    setClaimState('claiming');
    await claimGameCoins(walletAddress, rewardAmount);
  };

  const handleClose = () => {
    resetState();
    setClaimState('idle');
    onClose();
  };

  const handleRetry = () => {
    resetState();
    setClaimState('idle');
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 px-6 py-4 border-b border-yellow-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 justify-center">
              <div className="bg-yellow-600 p-2 rounded-full">
                <Coins size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-400">Chest Reward!</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Idle State - Show reward info */}
          {claimState === 'idle' && (
            <>
              <div className="text-center space-y-4">
                <p className="text-lg text-slate-200">
                  Congratulations! You found a chest.
                </p>
                <div className="bg-slate-800 border border-yellow-600/50 rounded-lg p-6">
                  <p className="text-sm text-slate-400 mb-2">You can claim:</p>
                  <p className="text-4xl font-bold text-yellow-400">
                    {rewardAmount} <span className="text-2xl text-slate-400">Tokens</span>
                  </p>
                </div>
                <p className="text-sm text-slate-400">
                  Claim these tokens to add them to your on-chain balance.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-6 rounded-lg font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaim}
                  className="flex-1 py-3 px-6 rounded-lg font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Coins size={20} />
                  Claim Tokens
                </button>
              </div>
            </>
          )}

          {/* Claiming State - Loading */}
          {claimState === 'claiming' && (
            <div className="text-center space-y-4 py-8">
              <Loader2 size={48} className="text-yellow-400 animate-spin mx-auto" />
              <p className="text-lg text-slate-200">Claiming your tokens...</p>
              <p className="text-sm text-slate-400">
                Please confirm the transaction in your wallet.
              </p>
              <p className="text-xs text-slate-500">
                This may take a few moments. Don't close this window.
              </p>
            </div>
          )}

          {/* Success State */}
          {claimState === 'success' && transactionHash && (
            <>
              <div className="text-center space-y-4">
                <CheckCircle size={64} className="text-green-400 mx-auto" />
                <div>
                  <p className="text-xl font-bold text-green-400 mb-2">Success!</p>
                  <p className="text-slate-200">Tokens claimed successfully.</p>
                </div>

                <div className="bg-slate-800 border border-green-600/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Amount Claimed:</p>
                  <p className="text-3xl font-bold text-green-400">
                    {rewardAmount} Tokens
                  </p>
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Transaction Hash:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs text-green-400 font-mono break-all">
                      {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                    </code>
                    <a
                      href={`https://mainnet.cotiscan.io/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 px-6 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Continue Playing
              </button>
            </>
          )}

          {/* Error State */}
          {claimState === 'error' && (
            <>
              <div className="text-center space-y-4">
                <XCircle size={64} className="text-red-400 mx-auto" />
                <div>
                  <p className="text-xl font-bold text-red-400 mb-2">Claim Failed</p>
                  <p className="text-slate-200 text-sm mb-4">
                    {claimError || 'An error occurred while claiming tokens.'}
                  </p>
                </div>

                <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                  <p className="text-sm text-red-400 mb-2">
                    Your tokens were not claimed.
                  </p>
                  {claimError?.includes('permission') && (
                    <p className="text-xs text-red-300 mt-2">
                      💡 <strong>Tip:</strong> Only the contract owner can mint tokens. Make sure you're connected with the wallet that deployed the contract, or update your contract to allow public minting.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-6 rounded-lg font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 px-6 rounded-lg font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800 px-6 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            Chest ID: {chestId} • COTI Network
          </p>
        </div>
      </div>
    </div>
  );
};
