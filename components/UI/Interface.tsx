import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Coins, Scroll, Terminal } from 'lucide-react';

export const Interface: React.FC = () => {
  const balance = useGameStore((state) => state.balance);
  const logs = useGameStore((state) => state.logs);
  const addLog = useGameStore((state) => state.addLog);

  useEffect(() => {
    addLog("System: Connected to COTI Placeholder Network.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-slate-900/80 border border-slate-700 text-slate-100 p-4 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-3">
          <div className="bg-yellow-600 p-2 rounded-full">
            <Coins size={24} className="text-white" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Balance</div>
            <div className="text-xl font-mono text-yellow-400">{balance} <span className="text-xs">COTI (Mock)</span></div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700 text-slate-100 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
           <h1 className="font-bold text-lg text-blue-400">COTI Realms <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">PROTOTYPE</span></h1>
        </div>
      </div>

      {/* Bottom Log Panel */}
      <div className="w-full max-w-lg self-end pointer-events-auto">
        <div className="bg-slate-900/90 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
           <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
              <Terminal size={16} className="text-blue-400" />
              <span className="text-xs font-bold text-slate-300 uppercase">Game Logs & Blockchain Hooks</span>
           </div>
           <div className="p-4 h-48 overflow-y-auto flex flex-col gap-2 font-mono text-sm">
              {logs.map((log, i) => (
                <div key={i} className={`flex gap-2 ${log.startsWith('//') ? 'text-green-400 italic' : 'text-slate-300'}`}>
                   <span className="opacity-50 select-none">{'>'}</span>
                   <span>{log}</span>
                </div>
              ))}
              {logs.length === 0 && <div className="text-slate-600 italic">No activity recorded...</div>}
           </div>
        </div>
        <div className="mt-2 text-right">
             <div className="inline-flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
                <Scroll size={12} />
                <span>Interact with chests to trigger mocks</span>
             </div>
        </div>
      </div>
    </div>
  );
};