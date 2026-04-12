// src/engine/ownership.ts
import { Grid } from './grid';
import { PlayerId, CellOwnership } from './types';
import { TerritoryBounds } from './territory';
import { WILD_TIMEOUT, MAX_PLAYERS } from '../shared/constants';

export class OwnershipManager {
  updateWildCells(
    grid: Grid,
    territories: Map<PlayerId, TerritoryBounds>
  ): Grid {
    const newGrid = grid.clone();

    for (let playerId = 0; playerId < MAX_PLAYERS; playerId++) {
      const cells = grid.getCellsByPlayer(playerId);
      const territory = territories.get(playerId);

      for (const { x, y } of cells) {
        const cell = grid.getCell(x, y);
        const isInTerritory = territory && this.isCellInTerritory(x, y, territory);

        if (isInTerritory) {
          // Reset counter: cell is back in territory
          if (cell.type === 'owned') {
            newGrid.setCell(x, y, {
              type: 'owned',
              playerId: cell.playerId,
              turnsSinceOwnershipChange: 0,
            });
          } else if (cell.type === 'wild') {
            newGrid.setCell(x, y, {
              type: 'wild',
              playerId: cell.playerId,
              turnsSinceOwnershipChange: 0,
            });
          }
        } else {
          // Increment counter: cell is outside territory
          const turns = (cell.type === 'owned' || cell.type === 'wild' ? cell.turnsSinceOwnershipChange ?? 0 : 0) + 1;

          if (turns >= WILD_TIMEOUT) {
            // Cell becomes wild
            newGrid.setCell(x, y, {
              type: 'wild',
              playerId,
              turnsSinceOwnershipChange: 0,
            });
          } else {
            // Still owned, but incrementing counter
            if (cell.type === 'owned') {
              newGrid.setCell(x, y, {
                type: 'owned',
                playerId: cell.playerId,
                turnsSinceOwnershipChange: turns,
              });
            } else if (cell.type === 'wild') {
              newGrid.setCell(x, y, {
                type: 'wild',
                playerId: cell.playerId,
                turnsSinceOwnershipChange: turns,
              });
            }
          }
        }
      }
    }

    return newGrid;
  }

  private isCellInTerritory(
    x: number,
    y: number,
    bounds: TerritoryBounds
  ): boolean {
    return (
      x >= bounds.minX &&
      x <= bounds.maxX &&
      y >= bounds.minY &&
      y <= bounds.maxY
    );
  }
}
