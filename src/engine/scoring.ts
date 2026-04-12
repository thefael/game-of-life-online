// src/engine/scoring.ts
import { Grid } from './grid';
import { PlayerId } from './types';
import { POPULATION_BONUS_THRESHOLD } from '../shared/constants';

export class ScoringManager {
  getPopulationBonus(grid: Grid, playerId: PlayerId): number {
    const cells = grid.getCellsByPlayer(playerId);
    return Math.floor(cells.length / POPULATION_BONUS_THRESHOLD);
  }

  hasBlinker(grid: Grid, playerId: PlayerId): boolean {
    const cells = grid.getCellsByPlayer(playerId);

    for (const cell of cells) {
      // Check horizontal line of 3
      const h1 = grid.getCell(cell.x - 1, cell.y);
      const h2 = grid.getCell(cell.x + 1, cell.y);
      if (
        h1.type === 'owned' && h1.playerId === playerId &&
        h2.type === 'owned' && h2.playerId === playerId
      ) {
        return true;
      }

      // Check vertical line of 3
      const v1 = grid.getCell(cell.x, cell.y - 1);
      const v2 = grid.getCell(cell.x, cell.y + 1);
      if (
        v1.type === 'owned' && v1.playerId === playerId &&
        v2.type === 'owned' && v2.playerId === playerId
      ) {
        return true;
      }
    }

    return false;
  }

  hasBlock(grid: Grid, playerId: PlayerId): boolean {
    const cells = grid.getCellsByPlayer(playerId);

    for (const cell of cells) {
      const r = grid.getCell(cell.x + 1, cell.y);
      const d = grid.getCell(cell.x, cell.y + 1);
      const dr = grid.getCell(cell.x + 1, cell.y + 1);

      if (
        r.type === 'owned' && r.playerId === playerId &&
        d.type === 'owned' && d.playerId === playerId &&
        dr.type === 'owned' && dr.playerId === playerId
      ) {
        return true;
      }
    }

    return false;
  }

  calculateTotalScore(grid: Grid, playerId: PlayerId): number {
    let score = 0;

    // Population bonus
    score += this.getPopulationBonus(grid, playerId);

    // Pattern bonuses
    if (this.hasBlinker(grid, playerId)) score += 3;
    if (this.hasBlock(grid, playerId)) score += 2;

    return score;
  }
}
