// tests/server/handlers/broadcastHandler.test.ts
import { createGameStateMessage, createGameUpdateMessage } from '../../../src/server/handlers/broadcastHandler';
import { GameSession } from '../../../src/server/gameSession';
import { PlayerColor } from '../../../src/engine/types';

describe('BroadcastHandler', () => {
  let session: GameSession;

  beforeEach(() => {
    session = new GameSession('test-session', 50, 2);
    session.addPlayer('client-1', 'Alice', PlayerColor.BLUE);
    session.addPlayer('client-2', 'Bob', PlayerColor.RED);
  });

  test('creates game state message with correct structure', () => {
    const message = createGameStateMessage(session);

    expect(message.type).toBe('gameState');
    expect(message.generation).toBeDefined();
    expect(message.players).toBeDefined();
    expect(message.gridSize).toBe(50);
  });

  test('includes all players in game state message', () => {
    const message = createGameStateMessage(session);

    expect(message.players.length).toBe(2);
    expect(message.players[0].name).toBe('Alice');
    expect(message.players[1].name).toBe('Bob');
  });

  test('creates game update message with timer and actions', () => {
    const message = createGameUpdateMessage(session, 15, 30);

    expect(message.type).toBe('gameUpdate');
    expect(message.elapsed).toBe(15);
    expect(message.duration).toBe(30);
    expect(message.generation).toBeDefined();
  });

  test('includes grid cells in game state message', () => {
    const gameState = session.getGameState();
    gameState.addAction(0, 'add', { x: 10, y: 10 });
    gameState.tick();

    const message = createGameStateMessage(session);

    expect(message.grid).toBeDefined();
    expect(Array.isArray(message.grid)).toBe(true);
  });

  test('serializes grid to array format', () => {
    const message = createGameStateMessage(session);

    // Grid should be array of 50x50 cells
    expect(message.grid.length).toBeGreaterThan(0);
    message.grid.forEach(row => {
      expect(Array.isArray(row)).toBe(true);
    });
  });
});
