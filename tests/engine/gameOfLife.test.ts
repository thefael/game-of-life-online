// tests/engine/gameOfLife.test.ts
import { GameOfLife } from '../../src/engine/gameOfLife';
import { Grid } from '../../src/engine/grid';

describe('GameOfLife', () => {
  let gol: GameOfLife;

  beforeEach(() => {
    gol = new GameOfLife();
  });

  test('applies B3/S23 rules correctly', () => {
    const grid = new Grid(5);
    // Set up a blinker: 3 cells in a vertical line at (2, 1-3)
    grid.setCell(2, 1, { type: 'owned', playerId: 0 });
    grid.setCell(2, 2, { type: 'owned', playerId: 0 });
    grid.setCell(2, 3, { type: 'owned', playerId: 0 });

    const nextGen = gol.tick(grid);

    // After tick, blinker should be horizontal at (1-3, 2)
    expect(nextGen.getCell(1, 2).type).toBe('owned');
    expect(nextGen.getCell(2, 2).type).toBe('owned');
    expect(nextGen.getCell(3, 2).type).toBe('owned');
    expect(nextGen.getCell(2, 1).type).toBe('empty');
    expect(nextGen.getCell(2, 3).type).toBe('empty');
  });

  test('dead cell with 3 neighbors becomes alive', () => {
    const grid = new Grid(5);
    grid.setCell(1, 1, { type: 'owned', playerId: 0 });
    grid.setCell(2, 1, { type: 'owned', playerId: 0 });
    grid.setCell(1, 2, { type: 'owned', playerId: 0 });
    // (2, 2) has 3 neighbors and should birth

    const nextGen = gol.tick(grid);
    const cell = nextGen.getCell(2, 2);
    expect(cell.type).not.toBe('empty');
    if (cell.type === 'owned' || cell.type === 'wild') {
      expect(cell.playerId).toBeDefined();
    } else {
      fail('Cell should have been born');
    }
  });

  test('newborn cell belongs to player with most neighbors', () => {
    const grid = new Grid(5);
    grid.setCell(1, 1, { type: 'owned', playerId: 0 });
    grid.setCell(2, 1, { type: 'owned', playerId: 0 });
    grid.setCell(1, 2, { type: 'owned', playerId: 1 });
    // (2, 2) births: player 0 has 2 neighbors, player 1 has 1
    // Player 0 should own it

    const nextGen = gol.tick(grid);
    const cell = nextGen.getCell(2, 2);
    if (cell.type === 'owned' || cell.type === 'wild') {
      expect(cell.playerId).toBe(0);
    } else {
      fail('Cell should have been born');
    }
  });
});
