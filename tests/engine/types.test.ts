import {
  PlayerColor,
  CellOwnership,
  GameGrid,
  PlayerId,
  Player,
  GameState,
  PendingAction,
  isValidPlayerId,
  isCellOwnedType,
  isCellWildType,
  isCellEmptyType,
  isActionWithPosition,
  isActionPass,
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
    const wild: CellOwnership = { type: 'wild', playerId: 1 };
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

  test('isValidPlayerId validates range 0-7', () => {
    expect(isValidPlayerId(0)).toBe(true);
    expect(isValidPlayerId(7)).toBe(true);
    expect(isValidPlayerId(4)).toBe(true);
    expect(isValidPlayerId(8)).toBe(false);
    expect(isValidPlayerId(-1)).toBe(false);
    expect(isValidPlayerId(3.5)).toBe(false);
  });

  test('CellOwnership discriminated union with owned type requires playerId', () => {
    const owned: CellOwnership = { type: 'owned', playerId: 0 };
    expect(owned.type).toBe('owned');
    if (owned.type === 'owned') {
      expect(owned.playerId).toBe(0);
    }
  });

  test('CellOwnership discriminated union with wild type requires playerId', () => {
    const wild: CellOwnership = { type: 'wild', playerId: 1 };
    expect(wild.type).toBe('wild');
    if (wild.type === 'wild') {
      expect(wild.playerId).toBe(1);
    }
  });

  test('CellOwnership discriminated union with empty type has no playerId', () => {
    const empty: CellOwnership = { type: 'empty' };
    expect(empty.type).toBe('empty');
    expect('playerId' in empty).toBe(false);
  });

  test('CellOwnership supports optional turnsSinceOwnershipChange', () => {
    const ownedWithTurns: CellOwnership = {
      type: 'owned',
      playerId: 2,
      turnsSinceOwnershipChange: 5,
    };
    expect(ownedWithTurns.turnsSinceOwnershipChange).toBe(5);

    const wildWithTurns: CellOwnership = {
      type: 'wild',
      playerId: 3,
      turnsSinceOwnershipChange: 2,
    };
    expect(wildWithTurns.turnsSinceOwnershipChange).toBe(2);
  });

  test('PendingAction discriminated union with add/remove requires cellPosition', () => {
    const add: PendingAction = {
      playerId: 0,
      type: 'add',
      cellPosition: { x: 5, y: 5 },
      committed: true,
    };
    expect(add.type).toBe('add');
    if (add.type === 'add' || add.type === 'remove') {
      expect(add.cellPosition).toEqual({ x: 5, y: 5 });
    }

    const remove: PendingAction = {
      playerId: 1,
      type: 'remove',
      cellPosition: { x: 10, y: 15 },
      committed: false,
    };
    expect(remove.type).toBe('remove');
    if (remove.type === 'add' || remove.type === 'remove') {
      expect(remove.cellPosition).toEqual({ x: 10, y: 15 });
    }
  });

  test('PendingAction discriminated union with pass does not require cellPosition', () => {
    const pass: PendingAction = {
      playerId: 2,
      type: 'pass',
      committed: false,
    };
    expect(pass.type).toBe('pass');
    expect('cellPosition' in pass).toBe(false);
  });

  test('isValidPlayerId validates correctly', () => {
    expect(isValidPlayerId(0)).toBe(true);
    expect(isValidPlayerId(7)).toBe(true);
    expect(isValidPlayerId(8)).toBe(false);
    expect(isValidPlayerId(-1)).toBe(false);
  });

  test('type guards identify cell ownership states', () => {
    const owned: CellOwnership = { type: 'owned', playerId: 0 };
    const wild: CellOwnership = { type: 'wild', playerId: 1 };
    const empty: CellOwnership = { type: 'empty' };

    expect(isCellOwnedType(owned)).toBe(true);
    expect(isCellWildType(wild)).toBe(true);
    expect(isCellEmptyType(empty)).toBe(true);
  });

  test('type guards identify action types', () => {
    const add: PendingAction = { playerId: 0, type: 'add', cellPosition: { x: 5, y: 5 }, committed: true };
    const pass: PendingAction = { playerId: 0, type: 'pass', committed: false };

    expect(isActionWithPosition(add)).toBe(true);
    expect(isActionPass(pass)).toBe(true);
    expect(isActionPass(add)).toBe(false);
  });
});
