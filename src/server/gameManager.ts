// src/server/gameManager.ts
import { GameSession } from './gameSession';
import { GameLoop } from './gameLoop';
import { broadcastMessage } from './websocket';
import { PlayerColor } from '../engine/types';
import { TIMER_DURATION } from '../shared/constants';

// ANSI color codes
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function log(source: string, step: string, message: string, data?: any) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `${CYAN}[${timestamp}] [${source}/${step}]${RESET}`;
  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

const ColorArray = [
  PlayerColor.BLUE,
  PlayerColor.RED,
  PlayerColor.GREEN,
  PlayerColor.YELLOW,
  PlayerColor.PURPLE,
  PlayerColor.ORANGE,
  PlayerColor.BLACK,
  PlayerColor.WHITE,
];

let currentSession: GameSession | null = null;
let currentGameLoop: GameLoop | null = null;

export function getOrCreateSession(): GameSession {
  if (!currentSession) {
    currentSession = new GameSession('default-session', 50, 8);
    console.log('Created new game session');
  }
  return currentSession;
}

export function startGameIfNeeded(): void {
  if (!currentSession) {
    currentSession = getOrCreateSession();
  }

  if (!currentGameLoop && currentSession.getPlayers().size > 0) {
    console.log('Starting game loop...');
    currentGameLoop = new GameLoop(currentSession, TIMER_DURATION);

    // Broadcast state updates
    currentGameLoop.onTick(() => {
      const gsm = currentSession!.getGameState();
      const gsd = gsm.getGameState();
      const aliveCells = gsd.grid.flat().filter((c: any) => c.type !== 'empty').length;

      log('SERVER', 'GAME_TICK', `Tick! Gen=${gsm.getGeneration()}, Alive=${aliveCells}`, {
        players: currentSession!.getPlayers().size,
      });

      // Send full gameState after each tick
      broadcastMessage({
        id: require('../shared/protocol').generateMessageId(),
        type: 'gameState',
        payload: {
          generation: gsm.getGeneration(),
          gridSize: 50,
          grid: gsd.grid,
          players: Array.from(currentSession!.getPlayers().values()).map((p) => ({
            id: p.id,
            name: p.name,
            color: p.color,
            score: p.score,
            population: p.population,
          })),
        },
        timestamp: Date.now(),
      });
    });

    currentGameLoop.start();
  }
}

function initializePlayerStartingCells(
  gameState: any,
  playerId: number,
  gridSize: number
): void {
  // Define starting positions for each player (corners)
  const corners = [
    { x: 3, y: 3 },      // Top-left
    { x: gridSize - 8, y: 3 },      // Top-right
    { x: 3, y: gridSize - 8 },      // Bottom-left
    { x: gridSize - 8, y: gridSize - 8 },  // Bottom-right
    { x: Math.floor(gridSize / 2) - 3, y: 3 },  // Top-center
    { x: Math.floor(gridSize / 2) - 3, y: gridSize - 8 },  // Bottom-center
    { x: 3, y: Math.floor(gridSize / 2) - 3 },  // Left-center
    { x: gridSize - 8, y: Math.floor(gridSize / 2) - 3 },  // Right-center
  ];

  const startPos = corners[playerId % corners.length];

  // Create a Glider pattern - a classic moving pattern in Conway's Game of Life
  // The glider moves diagonally, perfect for seeing movement visually
  const gliderPattern = [
    { x: startPos.x + 1, y: startPos.y },
    { x: startPos.x + 2, y: startPos.y + 1 },
    { x: startPos.x, y: startPos.y + 2 },
    { x: startPos.x + 1, y: startPos.y + 2 },
    { x: startPos.x + 2, y: startPos.y + 2 },
  ];

  for (const cell of gliderPattern) {
    if (cell.x < gridSize && cell.y < gridSize && cell.x >= 0 && cell.y >= 0) {
      // Use initializeCell to place cells directly (bypasses action queue)
      gameState.initializeCell(playerId, cell.x, cell.y);
    }
  }
}

export function addPlayerToSession(
  clientId: string,
  name: string,
  color: string
): { sessionId: string; playerId: number } {
  const session = getOrCreateSession();

  // Map string color to PlayerColor enum
  let playerColor: PlayerColor = PlayerColor.BLUE;
  const colorEntry = Object.entries(PlayerColor).find((entry) => entry[1] === color);
  if (colorEntry) {
    playerColor = colorEntry[1] as PlayerColor;
  }

  const player = session.addPlayer(clientId, name, playerColor);

  // Initialize starting cells for this player
  const gameState = session.getGameState();
  initializePlayerStartingCells(gameState, player.id, 50);

  // Send initial state
  const gsm = session.getGameState();
  const gameStateData = gsm.getGameState();
  broadcastMessage({
    id: require('../shared/protocol').generateMessageId(),
    type: 'gameState',
    payload: {
      generation: gsm.getGeneration(),
      gridSize: 50,
      grid: gameStateData.grid,
      players: Array.from(session.getPlayers().values()).map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        score: p.score,
        population: p.population,
      })),
    },
    timestamp: Date.now(),
  });

  // Start game if this is the first player
  startGameIfNeeded();

  return {
    sessionId: session.getSessionId(),
    playerId: player.id,
  };
}

export function removePlayerFromSession(clientId: string): void {
  if (currentSession) {
    currentSession.removePlayer(clientId);

    if (currentSession.getClientCount() === 0) {
      console.log('No players left, stopping game loop');
      if (currentGameLoop) {
        currentGameLoop.stop();
        currentGameLoop = null;
      }
    }
  }
}

export function getCurrentGameState() {
  if (!currentSession) return null;

  const gsm = currentSession.getGameState();
  const gameStateData = gsm.getGameState();

  return {
    generation: gsm.getGeneration(),
    gridSize: 50,
    grid: gameStateData.grid,
    players: Array.from(currentSession.getPlayers().values()).map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      score: p.score,
      population: p.population,
    })),
  };
}

export function handlePlayerAction(
  clientId: string,
  action: any
): void {
  if (!currentSession) return;

  const playerId = currentSession.getPlayerIdByClientId(clientId);
  if (playerId === undefined) return;

  const gameState = currentSession.getGameState();

  if (action.action === 'add' && action.x !== undefined && action.y !== undefined) {
    gameState.addAction(playerId, 'add', { x: action.x, y: action.y });
    gameState.commitAction(playerId);
  } else if (action.action === 'remove' && action.x !== undefined && action.y !== undefined) {
    gameState.addAction(playerId, 'remove', { x: action.x, y: action.y });
    gameState.commitAction(playerId);
  } else if (action.action === 'pass') {
    gameState.addAction(playerId, 'pass');
    gameState.commitAction(playerId);
  }

  // Retransmit current game state after action
  const gameModel = gameState.getGameState();
  broadcastMessage({
    id: require('../shared/protocol').generateMessageId(),
    type: 'gameState',
    payload: {
      generation: gameState.getGeneration(),
      gridSize: 50,
      grid: gameModel.grid,
      players: Array.from(currentSession.getPlayers().values()).map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        score: p.score,
        population: p.population,
      })),
    },
    timestamp: Date.now(),
  });
}
