// tests/server/gameSession.test.ts
import { GameSession } from '../../src/server/gameSession';
import { PlayerColor } from '../../src/engine/types';

describe('GameSession', () => {
  let session: GameSession;

  beforeEach(() => {
    session = new GameSession('session-1', 50, 2);
  });

  test('initializes with session id and game state', () => {
    expect(session.getSessionId()).toBe('session-1');
    expect(session.getPlayers().size).toBe(0);
  });

  test('allows player to join with color', () => {
    const clientId = 'client-1';
    const player = session.addPlayer(clientId, 'Alice', PlayerColor.BLUE);

    expect(player).toBeDefined();
    expect(player.name).toBe('Alice');
    expect(player.color).toBe(PlayerColor.BLUE);
    expect(session.getPlayers().size).toBe(1);
  });

  test('tracks client to player mapping', () => {
    session.addPlayer('client-1', 'Alice', PlayerColor.BLUE);
    const playerId = session.getPlayerIdByClientId('client-1');

    expect(playerId).toBe(0);
  });

  test('removes player when client disconnects', () => {
    session.addPlayer('client-1', 'Alice', PlayerColor.BLUE);
    expect(session.getPlayers().size).toBe(1);

    session.removePlayer('client-1');
    expect(session.getPlayers().size).toBe(0);
  });

  test('prevents duplicate color assignment', () => {
    session.addPlayer('client-1', 'Alice', PlayerColor.BLUE);

    expect(() => {
      session.addPlayer('client-2', 'Bob', PlayerColor.BLUE);
    }).toThrow();
  });

  test('enforces max player limit', () => {
    const limitedSession = new GameSession('session-2', 50, 1);
    limitedSession.addPlayer('client-1', 'Alice', PlayerColor.BLUE);

    expect(() => {
      limitedSession.addPlayer('client-2', 'Bob', PlayerColor.RED);
    }).toThrow();
  });
});
