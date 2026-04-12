// tests/server/gameLoop.test.ts
import { GameLoop } from '../../src/server/gameLoop';
import { GameSession } from '../../src/server/gameSession';
import { PlayerColor } from '../../src/engine/types';

describe('GameLoop', () => {
  let gameLoop: GameLoop;
  let session: GameSession;

  beforeEach(() => {
    session = new GameSession('test-session', 50, 2);
    gameLoop = new GameLoop(session, 1); // 1 second for testing
  });

  afterEach(() => {
    gameLoop.stop();
  });

  test('initializes with session and timer duration', () => {
    expect(gameLoop.getSession()).toBe(session);
    expect(gameLoop.isRunning()).toBe(false);
  });

  test('starts and stops the game loop', (done) => {
    expect(gameLoop.isRunning()).toBe(false);
    gameLoop.start();
    expect(gameLoop.isRunning()).toBe(true);

    setTimeout(() => {
      gameLoop.stop();
      expect(gameLoop.isRunning()).toBe(false);
      done();
    }, 100);
  });

  test('tracks elapsed time during tick', (done) => {
    gameLoop.start();

    setTimeout(() => {
      const elapsed = gameLoop.getElapsedTime();
      expect(elapsed).toBeGreaterThan(0);
      gameLoop.stop();
      done();
    }, 200);
  });

  test('resets timer after tick completes', (done) => {
    let tickCount = 0;
    gameLoop.onTick(() => {
      tickCount++;
    });

    gameLoop.start();

    setTimeout(() => {
      expect(tickCount).toBeGreaterThan(0);
      const elapsedAfterTick = gameLoop.getElapsedTime();
      expect(elapsedAfterTick).toBeLessThan(gameLoop.getDuration());
      gameLoop.stop();
      done();
    }, 1500);
  });

  test('calls tick callback when timer completes', (done) => {
    let tickCalled = false;
    gameLoop.onTick(() => {
      tickCalled = true;
    });

    gameLoop.start();

    setTimeout(() => {
      expect(tickCalled).toBe(true);
      gameLoop.stop();
      done();
    }, 1500);
  });
});
