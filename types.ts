import { Vector3 } from 'three';

export interface GameState {
  balance: number;
  logs: string[];
  isConnected: boolean;
  walletAddress: string | null;
  isOnboarded: boolean;
  userKey: string | null;
  addLog: (message: string) => void;
  incrementBalance: (amount: number) => void;
  setConnected: (address: string) => void;
  setOnboarded: (userKey: string) => void;
  disconnect: () => void;
  resetGame: () => void;
  clearUserKey: () => void;
}

export interface PlayerState {
  position: Vector3;
  target: Vector3;
  isMoving: boolean;
  setTarget: (point: Vector3) => void;
  updatePosition: (point: Vector3) => void;
  stopMoving: () => void;
}

export interface ChestData {
  id: string;
  position: [number, number, number];
  isOpen: boolean;
}

export enum EntityType {
  TREE = 'TREE',
  ROCK = 'ROCK',
  CHEST = 'CHEST'
}

export interface DecorObject {
  id: string;
  type: EntityType;
  position: [number, number, number];
  scale: number;
  rotation: number;
}