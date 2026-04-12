// tests/engine/ownership.test.ts
import { OwnershipManager } from '../../src/engine/ownership';
import { Grid } from '../../src/engine/grid';
import { WILD_TIMEOUT } from '../../src/shared/constants';

describe('OwnershipManager', () => {
  let om: OwnershipManager;

  beforeEach(() => {
    om = new OwnershipManager();
  });

  test('marks cell as wild after 3 turns outside territory', () => {
    const grid = new Grid();
    grid.setCell(5, 5, { type: 'owned', playerId: 0, turnsSinceOwnershipChange: 0 });
    grid.setCell(25, 25, { type: 'owned', playerId: 0, turnsSinceOwnershipChange: 0 });

    // Simulate moves: increment turn count
    let updatedGrid = grid.clone();
    updatedGrid.setCell(25, 25, { type: 'owned', playerId: 0, turnsSinceOwnershipChange: 1 });
    updatedGrid = updatedGrid.clone();
    updatedGrid.setCell(25, 25, { type: 'owned', playerId: 0, turnsSinceOwnershipChange: 2 });
    updatedGrid = updatedGrid.clone();
    updatedGrid.setCell(25, 25, { type: 'owned', playerId: 0, turnsSinceOwnershipChange: 3 });

    const territory = { minX: 4, maxX: 6, minY: 4, maxY: 6 };
    const result = om.updateWildCells(updatedGrid, new Map([[0, territory]]));

    const cell = result.getCell(25, 25);
    expect(cell.type).toBe('wild');
  });

  test('resets counter when cell returns to territory', () => {
    const grid = new Grid();
    grid.setCell(5, 5, { type: 'owned', playerId: 0, turnsSinceOwnershipChange: 2 });

    const territory = { minX: 4, maxX: 6, minY: 4, maxY: 6 };
    // Cell at (5,5) is still in territory, so counter resets
    const result = om.updateWildCells(grid, new Map([[0, territory]]));

    const cell = result.getCell(5, 5);
    expect(cell.type).toBe('owned');
    if (cell.type === 'owned' || cell.type === 'wild') {
      expect(cell.turnsSinceOwnershipChange).toBe(0);
    }
  });
});
