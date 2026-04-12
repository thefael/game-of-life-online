// src/engine/territory.ts
import { Grid } from './grid';
import { PlayerId } from './types';

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

    const xs = cells.map((c) => c.x);
    const ys = cells.map((c) => c.y);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  isCellInTerritory(x: number, y: number, bounds: TerritoryBounds): boolean {
    return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
  }

  getAllTerritory(grid: Grid): Map<PlayerId, TerritoryBounds> {
    const result = new Map<PlayerId, TerritoryBounds>();

    for (let playerId = 0; playerId < 8; playerId++) {
      const bounds = this.computeTerritory(grid, playerId);
      if (bounds) {
        result.set(playerId, bounds);
      }
    }

    return result;
  }
}
