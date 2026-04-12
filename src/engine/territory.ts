// src/engine/territory.ts
import { Grid } from './grid';
import { PlayerId } from './types';
import { MAX_PLAYERS } from '../shared/constants';

export interface TerritoryBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class TerritoryCompute {
  computeTerritory(grid: Grid, playerId: PlayerId): TerritoryBounds | null {
    const cells = grid.getCellsByPlayer(playerId);

    if (cells.length === 0) return null;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const cell of cells) {
      minX = Math.min(minX, cell.x);
      maxX = Math.max(maxX, cell.x);
      minY = Math.min(minY, cell.y);
      maxY = Math.max(maxY, cell.y);
    }

    return { minX, maxX, minY, maxY };
  }

  isCellInTerritory(x: number, y: number, bounds: TerritoryBounds): boolean {
    return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
  }

  getAllTerritory(grid: Grid): Map<PlayerId, TerritoryBounds> {
    const result = new Map<PlayerId, TerritoryBounds>();

    for (let playerId = 0; playerId < MAX_PLAYERS; playerId++) {
      const bounds = this.computeTerritory(grid, playerId);
      if (bounds) {
        result.set(playerId, bounds);
      }
    }

    return result;
  }
}
