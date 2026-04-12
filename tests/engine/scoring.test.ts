// tests/engine/scoring.test.ts
import { ScoringManager } from '../../src/engine/scoring';
import { Grid } from '../../src/engine/grid';

describe('ScoringManager', () => {
  let scorer: ScoringManager;

  beforeEach(() => {
    scorer = new ScoringManager();
  });

  test('awards population bonus: +1 per 5 cells', () => {
    const grid = new Grid();
    // Player 0: 12 cells → 12 / 5 = 2 points
    for (let i = 0; i < 12; i++) {
      grid.setCell(i, 0, { type: 'owned', playerId: 0 });
    }

    const bonus = scorer.getPopulationBonus(grid, 0);
    expect(bonus).toBe(2);
  });

  test('rounds down population bonus', () => {
    const grid = new Grid();
    // 4 cells → 0 points, 5 cells → 1 point
    for (let i = 0; i < 4; i++) {
      grid.setCell(i, 0, { type: 'owned', playerId: 0 });
    }

    expect(scorer.getPopulationBonus(grid, 0)).toBe(0);

    grid.setCell(4, 0, { type: 'owned', playerId: 0 });
    expect(scorer.getPopulationBonus(grid, 0)).toBe(1);
  });

  test('detects blinker pattern (3 cells in line)', () => {
    const grid = new Grid();
    grid.setCell(5, 5, { type: 'owned', playerId: 0 });
    grid.setCell(6, 5, { type: 'owned', playerId: 0 });
    grid.setCell(7, 5, { type: 'owned', playerId: 0 });

    const hasBlinker = scorer.hasBlinker(grid, 0);
    expect(hasBlinker).toBe(true);
  });

  test('detects block pattern (2x2 square)', () => {
    const grid = new Grid();
    grid.setCell(5, 5, { type: 'owned', playerId: 0 });
    grid.setCell(6, 5, { type: 'owned', playerId: 0 });
    grid.setCell(5, 6, { type: 'owned', playerId: 0 });
    grid.setCell(6, 6, { type: 'owned', playerId: 0 });

    const hasBlock = scorer.hasBlock(grid, 0);
    expect(hasBlock).toBe(true);
  });
});
