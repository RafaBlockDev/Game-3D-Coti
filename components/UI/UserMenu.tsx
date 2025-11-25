import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useDisconnect } from 'wagmi';
import { Menu, LogOut, Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const disconnect = useGameStore((state) => state.disconnect);
  const addLog = useGameStore((state) => state.addLog);
  const { disconnect: wagmiDisconnect } = useDisconnect();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    addLog("System: Disconnecting...");
    wagmiDisconnect();
    disconnect();
    setIsOpen(false);
  };

  const handleSettings = () => {
    setIsSettingsOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-900/80 border border-slate-700 text-slate-100 p-3 rounded-lg shadow-lg backdrop-blur-sm hover:bg-slate-800/80 transition-colors"
        >
          <Menu size={20} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
            <button
              onClick={handleSettings}
              className="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition-colors border-b border-slate-700"
            >
              <Settings size={18} />
              <span>Configuración</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-red-400 hover:bg-slate-800 flex items-center gap-3 transition-colors"
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
