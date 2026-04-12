// src/server/handlers/broadcastHandler.ts
import { GameSession } from '../gameSession';
import { CellOwnership } from '../../engine/types';

export interface GameStateMessage {
  type: 'gameState';
  generation: number;
  gridSize: number;
  grid: Array<Array<CellOwnership>>;
  players: Array<{
    id: number;
    name: string;
    color: string;
    score: number;
    population: number;
  }>;
}

export interface GameUpdateMessage {
  type: 'gameUpdate';
  generation: number;
  elapsed: number;
  duration: number;
  players: Array<{
    id: number;
    score: number;
    population: number;
  }>;
}

export function createGameStateMessage(session: GameSession): GameStateMessage {
  const gameState = session.getGameState();
  const grid = gameState.getGrid();
  const players = gameState.getPlayers();

  return {
    type: 'gameState',
    generation: gameState.getGeneration(),
    gridSize: 50,
    grid: serializeGrid(grid),
    players: Array.from(players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      score: p.score,
      population: p.population,
    })),
  };
}

export function createGameUpdateMessage(
  session: GameSession,
  elapsedTime: number,
  totalDuration: number
): GameUpdateMessage {
  const gameState = session.getGameState();
  const players = gameState.getPlayers();

  return {
    type: 'gameUpdate',
    generation: gameState.getGeneration(),
    elapsed: elapsedTime,
    duration: totalDuration,
    players: Array.from(players.values()).map((p) => ({
      id: p.id,
      score: p.score,
      population: p.population,
    })),
  };
}

export function createPlayerJoinMessage(
  playerId: number,
  playerName: string,
  playerColor: string
): any {
  return {
    type: 'playerJoined',
    playerId,
    playerName,
    playerColor,
  };
}

export function createPlayerLeaveMessage(playerId: number): any {
  return {
    type: 'playerLeft',
    playerId,
  };
}

export function createErrorMessage(error: string): any {
  return {
    type: 'error',
    message: error,
  };
}

function serializeGrid(grid: any): Array<Array<CellOwnership>> {
  const cells: Array<Array<CellOwnership>> = [];

  for (let y = 0; y < 50; y++) {
    const row: Array<CellOwnership> = [];
    for (let x = 0; x < 50; x++) {
      const cell = grid.getCell(x, y);
      row.push(cell);
    }
    cells.push(row);
  }

  return cells;
}
