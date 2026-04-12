// src/server/gameSession.ts
import { GameStateManager } from '../engine/gameState';
import { Player, PlayerColor, PlayerId } from '../engine/types';

export class GameSession {
  private sessionId: string;
  private gameState: GameStateManager;
  private clientToPlayerId: Map<string, PlayerId> = new Map();
  private usedColors: Set<PlayerColor> = new Set();
  private maxPlayers: number;

  constructor(sessionId: string, gridSize: number, maxPlayers: number) {
    this.sessionId = sessionId;
    // Pass 0 as maxPlayers to GameStateManager to prevent auto-initialization
    this.gameState = new GameStateManager(gridSize, 0);
    this.maxPlayers = maxPlayers;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getGameState(): GameStateManager {
    return this.gameState;
  }

  addPlayer(clientId: string, name: string, color: PlayerColor): Player {
    // Check if client already has a player
    if (this.clientToPlayerId.has(clientId)) {
      throw new Error(`Client ${clientId} already has a player`);
    }

    // Check if color is already used
    if (this.usedColors.has(color)) {
      throw new Error(`Color ${color} is already taken`);
    }

    // Check max players
    if (this.gameState.getPlayers().size >= this.maxPlayers) {
      throw new Error('Session is full');
    }

    // Add player to game state
    const player = this.gameState.addPlayer(name, color);

    // Track mapping
    this.clientToPlayerId.set(clientId, player.id);
    this.usedColors.add(color);

    return player;
  }

  removePlayer(clientId: string): void {
    const playerId = this.clientToPlayerId.get(clientId);

    if (playerId === undefined) return; // Player doesn't exist

    const players = this.gameState.getPlayers();
    const player = players.get(playerId);

    if (player) {
      this.usedColors.delete(player.color);
      // Remove player from game state
      this.gameState.removePlayer(playerId);
    }

    this.clientToPlayerId.delete(clientId);
  }

  getPlayerIdByClientId(clientId: string): PlayerId | undefined {
    return this.clientToPlayerId.get(clientId);
  }

  getPlayers(): Map<PlayerId, Player> {
    return this.gameState.getPlayers();
  }

  getClientCount(): number {
    return this.clientToPlayerId.size;
  }

  isSessionEmpty(): boolean {
    return this.clientToPlayerId.size === 0;
  }
}
