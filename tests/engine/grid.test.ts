import { Grid } from '../../src/engine/grid';
import { GRID_SIZE } from '../../src/shared/constants';

describe('Grid', () => {
  let grid: Grid;

  beforeEach(() => {
    grid = new Grid(GRID_SIZE);
  });

  test('initializes with all cells empty', () => {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const cell = grid.getCell(x, y);
        expect(cell.type).toBe('empty');
      }
    }
  });

  test('sets cell ownership', () => {
    grid.setCell(5, 5, { type: 'owned', playerId: 0 });
    const cell = grid.getCell(5, 5);
    expect(cell.type).toBe('owned');
    if (cell.type === 'owned') {
      expect(cell.playerId).toBe(0);
    }
  });

  test('wraps coordinates toroidally', () => {
    grid.setCell(GRID_SIZE, 0, { type: 'owned', playerId: 1 });
    const cell = grid.getCell(0, 0);
    if (cell.type === 'owned') {
      expect(cell.playerId).toBe(1);
    }
  });

  test('counts live neighbors correctly', () => {
    grid.setCell(4, 4, { type: 'owned', playerId: 0 });
    grid.setCell(5, 4, { type: 'owned', playerId: 0 });
    grid.setCell(5, 5, { type: 'owned', playerId: 1 });
    grid.setCell(6, 4, { type: 'owned', playerId: 1 });

    const neighbors = grid.countNeighbors(5, 4);
    expect(neighbors.total).toBe(3);
    expect(neighbors.byPlayer.get(0)).toBe(1);
    expect(neighbors.byPlayer.get(1)).toBe(2);
  });

  test('returns all cells owned by a player', () => {
    grid.setCell(0, 0, { type: 'owned', playerId: 0 });
    grid.setCell(1, 1, { type: 'owned', playerId: 0 });
    grid.setCell(2, 2, { type: 'owned', playerId: 1 });

    const p0Cells = grid.getCellsByPlayer(0);
    expect(p0Cells.length).toBe(2);
    expect(p0Cells).toContainEqual({ x: 0, y: 0 });
  });

  test('clones grid independently', () => {
    grid.setCell(5, 5, { type: 'owned', playerId: 0 });
    const cloned = grid.clone();

    cloned.setCell(5, 5, { type: 'owned', playerId: 1 });

    const originalCell = grid.getCell(5, 5);
    const clonedCell = cloned.getCell(5, 5);
    if (originalCell.type === 'owned' && clonedCell.type === 'owned') {
      expect(originalCell.playerId).toBe(0);
      expect(clonedCell.playerId).toBe(1);
    }
  });
});
