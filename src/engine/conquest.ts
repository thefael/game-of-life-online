// src/engine/conquest.ts
import { Grid } from './grid';
import { PlayerId } from './types';
import { TerritoryBounds } from './territory';
import { CONQUEST_TIMEOUT } from '../shared/constants';

export class ConquestManager {
  updateConquest(
    grid: Grid,
    territories: Map<PlayerId, TerritoryBounds>
  ): Grid {
    const newGrid = grid.clone();

    for (const [playerId, territory] of territories) {
      // Check all cells in this player's territory
      for (let x = territory.minX; x <= territory.maxX; x++) {
        for (let y = territory.minY; y <= territory.maxY; y++) {
          const cell = grid.getCell(x, y);

          // If it's a wild cell (owned by someone else), increment counter
          if (cell.type === 'wild' && cell.playerId !== playerId) {
            const turns = (cell.turnsSinceOwnershipChange ?? 0) + 1;

            if (turns >= CONQUEST_TIMEOUT) {
              // Conquer the cell
              newGrid.setCell(x, y, {
                type: 'owned',
                playerId,
                turnsSinceOwnershipChange: 0,
              });
            } else {
              // Still contested, increment counter
              newGrid.setCell(x, y, {
                ...cell,
                turnsSinceOwnershipChange: turns,
              });
            }
          }
        }
      }
    }

    return newGrid;
  }
}
