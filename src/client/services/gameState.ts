import { CellOwnership } from '../../engine/types';
import { TIMER_DURATION } from '../../shared/constants';

export interface Player {
  id: number;
  name: string;
  color: string;
  score: number;
  population: number;
}

export interface GameStateStore {
  generation: number;
  grid: CellOwnership[][];
  gridSize: number;
  players: Player[];
  elapsed: number;
  duration: number;
  previewGrid: CellOwnership[][];
}

const initialState: GameStateStore = {
  generation: 0,
  grid: [],
  gridSize: 50,
  players: [],
  elapsed: 0,
  duration: TIMER_DURATION * 1000,
  previewGrid: [],
};

export class GameState {
  private state: GameStateStore = { ...initialState };
  private listeners: Function[] = [];

  updateGameState(newState: Partial<GameStateStore>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  getState(): GameStateStore {
    return { ...this.state };
  }

  subscribe(listener: Function): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  reset(): void {
    this.state = { ...initialState };
    this.notifyListeners();
  }
}
