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

export interface CellOwnership {
  type: 'owned' | 'wild' | 'empty';
  playerId?: PlayerId;
  turnsSinceOwnershipChange?: number;
}

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

export interface PendingAction {
  playerId: PlayerId;
  type: 'add' | 'remove' | 'pass';
  cellPosition?: { x: number; y: number };
  committed: boolean;
}
