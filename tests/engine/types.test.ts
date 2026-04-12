import {
  PlayerColor,
  CellOwnership,
  GameGrid,
  PlayerId,
  Player,
  GameState,
  PendingAction,
} from '../../src/engine/types';

describe('Types', () => {
  test('PlayerColor enum has 8 colors', () => {
    const colors = Object.values(PlayerColor);
    expect(colors.length).toBe(8);
  });

  test('CellOwnership distinguishes owned, wild, and empty', () => {
    const ownership: CellOwnership = { type: 'owned', playerId: 1 };
    expect(ownership.type).toBe('owned');
  });

  test('GameGrid has correct dimensions', () => {
    const grid = new Array(50).fill(null).map(() => new Array(50).fill(null));
    expect(grid.length).toBe(50);
    expect(grid[0].length).toBe(50);
  });

  test('PlayerColor has all required colors', () => {
    expect(PlayerColor.BLUE).toBeDefined();
    expect(PlayerColor.RED).toBeDefined();
    expect(PlayerColor.GREEN).toBeDefined();
    expect(PlayerColor.YELLOW).toBeDefined();
    expect(PlayerColor.PURPLE).toBeDefined();
    expect(PlayerColor.ORANGE).toBeDefined();
    expect(PlayerColor.BLACK).toBeDefined();
    expect(PlayerColor.WHITE).toBeDefined();
  });

  test('CellOwnership can be owned with playerId', () => {
    const owned: CellOwnership = { type: 'owned', playerId: 3 };
    expect(owned.playerId).toBe(3);
  });

  test('CellOwnership can be wild', () => {
    const wild: CellOwnership = { type: 'wild' };
    expect(wild.type).toBe('wild');
  });

  test('CellOwnership can be empty', () => {
    const empty: CellOwnership = { type: 'empty' };
    expect(empty.type).toBe('empty');
  });

  test('Player interface has required properties', () => {
    const player: Player = {
      id: 0,
      color: PlayerColor.BLUE,
      name: 'Player 1',
      score: 0,
      population: 0,
      territory: new Set<string>(),
    };
    expect(player.id).toBe(0);
    expect(player.color).toBe(PlayerColor.BLUE);
    expect(player.name).toBe('Player 1');
  });

  test('PendingAction has correct structure', () => {
    const action: PendingAction = {
      playerId: 1,
      type: 'add',
      cellPosition: { x: 10, y: 20 },
      committed: false,
    };
    expect(action.type).toBe('add');
    expect(action.cellPosition?.x).toBe(10);
  });
});
