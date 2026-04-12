// src/engine/gameOfLife.ts
import { Grid } from './grid';
import { CellOwnership, PlayerId } from './types';

export class GameOfLife {
  private birthRules = new Set([3]);
  private surviveRules = new Set([2, 3]);

  tick(grid: Grid): Grid {
    const newGrid = grid.clone();

    for (let y = 0; y < grid.gridSize; y++) {
      for (let x = 0; x < grid.gridSize; x++) {
        const currentCell = grid.getCell(x, y);
        const neighbors = grid.countNeighbors(x, y);

        const isAlive = currentCell.type === 'owned' || currentCell.type === 'wild';

        if (isAlive) {
          // Cell survives or dies
          if (!this.surviveRules.has(neighbors.total)) {
            newGrid.setCell(x, y, { type: 'empty' });
          }
        } else {
          // Cell may birth
          if (this.birthRules.has(neighbors.total)) {
            const ownerId = this.determineBirthOwner(neighbors.byPlayer);
            newGrid.setCell(x, y, { type: 'owned', playerId: ownerId });
          }
        }
      }
    }

    return newGrid;
  }

  private determineBirthOwner(neighborsByPlayer: Map<PlayerId, number>): PlayerId {
    let maxNeighbors = 0;
    let ownerId = 0;

    for (const [playerId, count] of neighborsByPlayer) {
      if (count > maxNeighbors) {
        maxNeighbors = count;
        ownerId = playerId;
      }
    }

    return ownerId;
  }
}
