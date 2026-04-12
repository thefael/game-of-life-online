// tests/server/handlers/actionHandler.test.ts
import { handlePlayerAction } from '../../../src/server/handlers/actionHandler';
import { GameSession } from '../../../src/server/gameSession';
import { PlayerColor } from '../../../src/engine/types';

describe('ActionHandler', () => {
  let session: GameSession;

  beforeEach(() => {
    session = new GameSession('test-session', 50, 2);
    session.addPlayer('client-1', 'Alice', PlayerColor.BLUE);
    session.addPlayer('client-2', 'Bob', PlayerColor.RED);
  });

  test('processes add cell action', () => {
    const clientId = 'client-1';
    const playerId = session.getPlayerIdByClientId(clientId);

    handlePlayerAction(session, clientId, {
      type: 'add',
      cellPosition: { x: 10, y: 10 },
    });

    const gameState = session.getGameState();
    const action = gameState.getGameState().actions.get(playerId!);
    expect(action).toBeDefined();
    expect(action!.type).toBe('add');
    expect(action!.committed).toBe(false);
  });

  test('processes remove cell action', () => {
    const clientId = 'client-1';
    const playerId = session.getPlayerIdByClientId(clientId);

    handlePlayerAction(session, clientId, {
      type: 'remove',
      cellPosition: { x: 10, y: 10 },
    });

    const gameState = session.getGameState();
    const action = gameState.getGameState().actions.get(playerId!);
    expect(action!.type).toBe('remove');
  });

  test('processes pass action', () => {
    const clientId = 'client-1';
    const playerId = session.getPlayerIdByClientId(clientId);

    handlePlayerAction(session, clientId, {
      type: 'pass',
    });

    const gameState = session.getGameState();
    const action = gameState.getGameState().actions.get(playerId!);
    expect(action!.type).toBe('pass');
  });

  test('commits action when confirmed', () => {
    const clientId = 'client-1';
    const playerId = session.getPlayerIdByClientId(clientId);

    handlePlayerAction(session, clientId, {
      type: 'add',
      cellPosition: { x: 10, y: 10 },
    });

    handlePlayerAction(session, clientId, {
      type: 'add',
      cellPosition: { x: 10, y: 10 },
      confirmed: true,
    });

    const gameState = session.getGameState();
    const action = gameState.getGameState().actions.get(playerId!);
    expect(action!.committed).toBe(true);
  });

  test('ignores actions from unknown clients', () => {
    const initialSize = session.getGameState().getGameState().actions.size;

    handlePlayerAction(session, 'unknown-client', {
      type: 'pass',
    });

    expect(session.getGameState().getGameState().actions.size).toBe(initialSize);
  });
});
