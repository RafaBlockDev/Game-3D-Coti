import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CotiService } from '../../services/future-blockchain-hooks/cotiService';
import { ShieldCheck, User } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const WalletConnect: React.FC = () => {
  const setConnected = useGameStore((state) => state.setConnected);
  const addLog = useGameStore((state) => state.addLog);
  const [loading, setLoading] = useState(false);

  const handleGuestConnect = async () => {
    setLoading(true);
    try {
        const result = await CotiService.connectGuest();
        setConnected(result.address);
        addLog(`Guest Mode: Connected as ${result.address.slice(0, 10)}...`);
        addLog("Warning: Blockchain features are simulated.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950 text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600/20 p-4 rounded-full border border-blue-500/50">
            <ShieldCheck size={48} className="text-blue-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tight">COTI Realms</h1>
        <p className="text-slate-400 mb-8">Enter the decentralized world.</p>

        <div className="flex flex-col items-center space-y-4">
          
          {/* RainbowKit Connect Button */}
          <div className="w-full flex justify-center">
             <ConnectButton 
                label="Connect Wallet"
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
             />
          </div>
          
          <div className="relative w-full flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs">OR</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <button
            onClick={handleGuestConnect}
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <User size={16} />
            {loading ? "Loading..." : "Play as Guest (Dev Mode)"}
          </button>
          
          <div className="text-xs text-slate-500 mt-4 px-4 leading-relaxed">
            Mainnet ID: <span className="font-mono">2632500</span>. RainbowKit will automatically prompt to add the COTI network.
          </div>
        </div>
      </div>
    </div>
  );
};