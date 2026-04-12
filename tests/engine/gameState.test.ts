// tests/engine/gameState.test.ts
import { GameStateManager } from '../../src/engine/gameState';
import { PlayerColor } from '../../src/engine/types';

describe('GameStateManager', () => {
  let state: GameStateManager;

  beforeEach(() => {
    state = new GameStateManager(50, 2);
  });

  test('initializes with 2 players', () => {
    expect(state.getPlayers().size).toBe(2);
  });

  test('adds player with color', () => {
    const state2 = new GameStateManager(50, 0);
    const player = state2.addPlayer('Alice', PlayerColor.BLUE);
    expect(player.name).toBe('Alice');
    expect(player.color).toBe(PlayerColor.BLUE);
  });

  test('executes a single turn: action + tick + update', () => {
    const initialGen = state.getGeneration();
    state.addAction(0, 'add', { x: 10, y: 10 });
    state.tick();
    expect(state.getGeneration()).toBe(initialGen + 1);
  });
});
