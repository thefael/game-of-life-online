// src/engine/gameState.ts
import { Grid } from './grid';
import { GameOfLife } from './gameOfLife';
import { TerritoryCompute } from './territory';
import { OwnershipManager } from './ownership';
import { ConquestManager } from './conquest';
import { ScoringManager } from './scoring';
import { GameState, Player, PlayerId, PendingAction, PlayerColor } from './types';
import { GRID_SIZE, MAX_PLAYERS } from '../shared/constants';

export class GameStateManager {
  private grid: Grid;
  private players: Map<PlayerId, Player> = new Map();
  private generation: number = 0;
  private gol: GameOfLife = new GameOfLife();
  private territory: TerritoryCompute = new TerritoryCompute();
  private ownership: OwnershipManager = new OwnershipManager();
  private conquest: ConquestManager = new ConquestManager();
  private scoring: ScoringManager = new ScoringManager();
  private actions: Map<PlayerId, PendingAction> = new Map();
  private gridSize: number;
  private maxPlayers: number;

  constructor(gridSize: number = GRID_SIZE, maxPlayers: number = MAX_PLAYERS) {
    this.gridSize = gridSize;
    this.maxPlayers = maxPlayers;
    this.grid = new Grid(gridSize);

    // Initialize with maxPlayers if maxPlayers > 0
    if (maxPlayers > 0) {
      const colors = Object.values(PlayerColor);
      for (let i = 0; i < maxPlayers && i < colors.length; i++) {
        this.addPlayer(`Player ${i + 1}`, colors[i]);
      }
    }
  }

  addPlayer(name: string, color: PlayerColor): Player {
    const id = this.players.size as PlayerId;
    // If maxPlayers is 0, allow unlimited players. Otherwise check the limit.
    if (this.maxPlayers > 0 && id >= this.maxPlayers) throw new Error('Max players reached');

    const player: Player = {
      id,
      name,
      color,
      score: 0,
      population: 0,
      territory: new Set(),
    };

    this.players.set(id, player);
    return player;
  }

  removePlayer(playerId: PlayerId): void {
    this.players.delete(playerId);
  }

  getPlayers(): Map<PlayerId, Player> {
    return this.players;
  }

  getGrid(): Grid {
    return this.grid;
  }

  getGeneration(): number {
    return this.generation;
  }

  addAction(playerId: PlayerId, type: 'add' | 'remove' | 'pass', cellPosition?: { x: number; y: number }): void {
    if (type === 'pass') {
      this.actions.set(playerId, {
        playerId,
        type: 'pass',
        committed: false,
      });
    } else {
      this.actions.set(playerId, {
        playerId,
        type: type as 'add' | 'remove',
        cellPosition: cellPosition || { x: 0, y: 0 },
        committed: false,
      });
    }
  }

  commitAction(playerId: PlayerId): void {
    const action = this.actions.get(playerId);
    if (action) {
      action.committed = true;
    }
  }

  tick(): void {
    // 1. Apply player actions to grid
    for (const action of this.actions.values()) {
      if (action.committed && action.type === 'add' && 'cellPosition' in action && action.cellPosition) {
        const cell = this.grid.getCell(action.cellPosition.x, action.cellPosition.y);
        if (cell.type === 'empty') {
          this.grid.setCell(action.cellPosition.x, action.cellPosition.y, {
            type: 'owned',
            playerId: action.playerId,
          });
        }
      }
    }

    // 2. Run Game of Life simulation
    this.grid = this.gol.tick(this.grid);

    // 3. Compute territories
    const territories = this.territory.getAllTerritory(this.grid);

    // 4. Update wild cells
    this.grid = this.ownership.updateWildCells(this.grid, territories);

    // 5. Update conquests
    this.grid = this.conquest.updateConquest(this.grid, territories);

    // 6. Update player scores
    for (const player of this.players.values()) {
      player.score = this.scoring.calculateTotalScore(this.grid, player.id);
      player.population = this.grid.getCellsByPlayer(player.id).length;
      player.territory = new Set(
        territories.get(player.id)
          ? this.getTerritoryCells(territories.get(player.id)!)
          : []
      );
    }

    // 7. Clear actions
    this.actions.clear();

    // 8. Increment generation
    this.generation++;
  }

  private getTerritoryCells(bounds: { minX: number; maxX: number; minY: number; maxY: number }): string[] {
    const cells: string[] = [];
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      for (let y = bounds.minY; y <= bounds.maxY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    return cells;
  }

  getGameState(): GameState {
    return {
      grid: this.grid.clone() as any,
      players: this.players,
      generation: this.generation,
      timer: { duration: 30, elapsed: 0 },
      actions: this.actions,
    };
  }
}
