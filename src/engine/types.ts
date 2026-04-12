import { MAX_PLAYERS } from '../shared/constants';

export enum PlayerColor {
  BLUE = '#0066FF',
  RED = '#FF0000',
  GREEN = '#00AA00',
  YELLOW = '#FFFF00',
  PURPLE = '#9900FF',
  ORANGE = '#FF8800',
  BLACK = '#000000',
  WHITE = '#FFFFFF',
}

export type PlayerId = number; // 0-7

/**
 * Validates that a number is a valid PlayerId (0 to MAX_PLAYERS-1).
 * @param id - The number to validate
 * @returns true if id is a valid PlayerId
 */
export function isValidPlayerId(id: number): id is PlayerId {
  return Number.isInteger(id) && id >= 0 && id < MAX_PLAYERS;
}

/**
 * Represents the ownership state of a cell in the game grid.
 * Uses discriminated union to enforce type safety:
 * - 'owned': Cell is owned by a specific player (requires playerId)
 * - 'wild': Cell is in a wild state (requires playerId)
 * - 'empty': Cell is empty (no playerId needed)
 */
export type CellOwnership =
  | { type: 'owned'; playerId: PlayerId; turnsSinceOwnershipChange?: number }
  | { type: 'wild'; playerId: PlayerId; turnsSinceOwnershipChange?: number }
  | { type: 'empty' };

export type GameGrid = CellOwnership[][];

export interface Player {
  id: PlayerId;
  color: PlayerColor;
  name: string;
  score: number;
  population: number;
  territory: Set<string>;
}

export interface GameState {
  grid: GameGrid;
  players: Map<PlayerId, Player>;
  generation: number;
  timer: {
    duration: number;
    elapsed: number;
  };
  actions: Map<PlayerId, PendingAction>;
}

/**
 * Represents an action pending commit by a player.
 * Uses discriminated union to enforce type safety:
 * - 'add' | 'remove': Requires cellPosition
 * - 'pass': Does not require cellPosition
 */
export type PendingAction =
  | {
      playerId: PlayerId;
      type: 'add' | 'remove';
      cellPosition: { x: number; y: number };
      committed: boolean;
    }
  | { playerId: PlayerId; type: 'pass'; committed: boolean };
