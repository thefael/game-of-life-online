// tests/engine/conquest.test.ts
import { ConquestManager } from '../../src/engine/conquest';
import { Grid } from '../../src/engine/grid';
import { CONQUEST_TIMEOUT } from '../../src/shared/constants';

describe('ConquestManager', () => {
  let cm: ConquestManager;

  beforeEach(() => {
    cm = new ConquestManager();
  });

  test('conquers wild cell after 3 turns in territory', () => {
    const grid = new Grid();
    grid.setCell(5, 5, { type: 'wild', playerId: 1, turnsSinceOwnershipChange: 0 });
    grid.setCell(4, 4, { type: 'owned', playerId: 0 });
    grid.setCell(4, 5, { type: 'owned', playerId: 0 });
    grid.setCell(5, 4, { type: 'owned', playerId: 0 });

    const territory = { minX: 4, maxX: 6, minY: 4, maxY: 6 };

    let updatedGrid = grid.clone();
    updatedGrid.setCell(5, 5, { type: 'wild', playerId: 1, turnsSinceOwnershipChange: 1 });

    updatedGrid = updatedGrid.clone();
    updatedGrid.setCell(5, 5, { type: 'wild', playerId: 1, turnsSinceOwnershipChange: 2 });

    updatedGrid = updatedGrid.clone();
    updatedGrid.setCell(5, 5, { type: 'wild', playerId: 1, turnsSinceOwnershipChange: 3 });

    const result = cm.updateConquest(updatedGrid, new Map([[0, territory]]));

    const cell = result.getCell(5, 5);
    expect(cell.type).toBe('owned');
    if (cell.type === 'owned') {
      expect(cell.playerId).toBe(0);
    }
  });

  test('does not conquer cell outside territory', () => {
    const grid = new Grid();
    grid.setCell(20, 20, { type: 'wild', playerId: 1, turnsSinceOwnershipChange: 3 });

    const territory = { minX: 4, maxX: 6, minY: 4, maxY: 6 };
    const result = cm.updateConquest(grid, new Map([[0, territory]]));

    const cell = result.getCell(20, 20);
    expect(cell.type).toBe('wild');
  });
});
