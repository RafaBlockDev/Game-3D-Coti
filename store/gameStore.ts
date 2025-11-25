import { create } from 'zustand';
import { Vector3 } from 'three';
import { GameState, PlayerState } from '../types';

interface GlobalStore extends GameState, PlayerState {}

export const useGameStore = create<GlobalStore>((set) => ({
  // Game Logic
  balance: 0,
  logs: ["Welcome to COTI Realms. Please connect your wallet."],
  isConnected: false,
  walletAddress: null,
  isOnboarded: false,
  userKey: null,

  addLog: (message: string) => set((state) => ({ logs: [message, ...state.logs].slice(0, 5) })),
  incrementBalance: (amount: number) => set((state) => ({ balance: state.balance + amount })),
  setConnected: (address: string) => set({ isConnected: true, walletAddress: address }),
  setOnboarded: (userKey: string) => set({ isOnboarded: true, userKey }),
  disconnect: () => set({ isConnected: false, walletAddress: null, balance: 0, logs: ["Welcome to COTI Realms. Please connect your wallet."], isOnboarded: false, userKey: null }),
  resetGame: () => set({ balance: 0, logs: ["System: Game reset."], position: new Vector3(0, 0, 0), target: new Vector3(0, 0, 0), isMoving: false }),
  clearUserKey: () => set({ isOnboarded: false, userKey: null }),

  // Player Logic
  position: new Vector3(0, 0, 0),
  target: new Vector3(0, 0, 0),
  isMoving: false,
  setTarget: (point: Vector3) => set({ target: point, isMoving: true }),
  updatePosition: (point: Vector3) => set({ position: point }),
  stopMoving: () => set({ isMoving: false }),
}));