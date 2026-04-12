// tests/engine/territory.test.ts
import { TerritoryCompute } from '../../src/engine/territory';
import { Grid } from '../../src/engine/grid';

describe('TerritoryCompute', () => {
  let territory: TerritoryCompute;

  beforeEach(() => {
    territory = new TerritoryCompute();
  });

  test('computes territory as bounding box of owned cells', () => {
    const grid = new Grid();
    grid.setCell(5, 5, { type: 'owned', playerId: 0 });
    grid.setCell(10, 10, { type: 'owned', playerId: 0 });

    const bounds = territory.computeTerritory(grid, 0);

    expect(bounds!.minX).toBe(5);
    expect(bounds!.maxX).toBe(10);
    expect(bounds!.minY).toBe(5);
    expect(bounds!.maxY).toBe(10);
  });

  test('returns null for player with no cells', () => {
    const grid = new Grid();
    const bounds = territory.computeTerritory(grid, 0);
    expect(bounds).toBeNull();
  });

  test('includes wild cells in territory', () => {
    const grid = new Grid();
    grid.setCell(5, 5, { type: 'owned', playerId: 0 });
    grid.setCell(8, 8, { type: 'wild', playerId: 0 });

    const bounds = territory.computeTerritory(grid, 0);

    expect(bounds!.minX).toBe(5);
    expect(bounds!.maxX).toBe(8);
  });

  test('checks if cell is in territory', () => {
    const bounds = { minX: 5, maxX: 10, minY: 5, maxY: 10 };

    expect(territory.isCellInTerritory(7, 7, bounds)).toBe(true);
    expect(territory.isCellInTerritory(4, 7, bounds)).toBe(false);
    expect(territory.isCellInTerritory(11, 7, bounds)).toBe(false);
  });
});
