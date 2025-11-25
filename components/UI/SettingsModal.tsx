import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { X, RotateCcw, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const resetGame = useGameStore((state) => state.resetGame);
  const clearUserKey = useGameStore((state) => state.clearUserKey);
  const addLog = useGameStore((state) => state.addLog);

  if (!isOpen) return null;

  const handleResetGame = () => {
    if (confirm('¿Estás seguro de que quieres resetear el juego? Se perderá tu progreso actual.')) {
      resetGame();
      addLog("System: Game reset successfully.");
      onClose();
    }
  };

  const handleClearKey = () => {
    if (confirm('¿Eliminar la clave de usuario? Necesitarás hacer onboarding nuevamente la próxima vez que te conectes.')) {
      clearUserKey();
      addLog("System: User key cleared. Onboarding required on next login.");
      onClose();
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <h2 className="text-xl font-bold text-slate-100">Configuración</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Reset Game */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors">
            <button
              onClick={handleResetGame}
              className="w-full text-left flex items-start gap-4"
            >
              <div className="bg-orange-600/20 p-2 rounded-lg border border-orange-500/50">
                <RotateCcw size={20} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-100 mb-1">Reset Game</h3>
                <p className="text-sm text-slate-400">Reinicia el progreso del juego (balance, posición, logs) pero mantiene tu wallet conectada.</p>
              </div>
            </button>
          </div>

          {/* Clear User Key */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors">
            <button
              onClick={handleClearKey}
              className="w-full text-left flex items-start gap-4"
            >
              <div className="bg-red-600/20 p-2 rounded-lg border border-red-500/50">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-100 mb-1">Eliminar User Key</h3>
                <p className="text-sm text-slate-400">Elimina la clave de usuario del estado. Requerirá onboarding nuevamente la próxima vez.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800 px-6 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">COTI Realms - Confidential Gaming Prototype</p>
        </div>
      </div>
    </div>
  );
};
