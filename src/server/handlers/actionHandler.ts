// src/server/handlers/actionHandler.ts
import { GameSession } from '../gameSession';
import { PlayerId } from '../../engine/types';

export interface PlayerActionMessage {
  type: 'add' | 'remove' | 'pass';
  cellPosition?: { x: number; y: number };
  confirmed?: boolean;
}

export function handlePlayerAction(
  session: GameSession,
  clientId: string,
  message: PlayerActionMessage
): void {
  // Get player ID from client ID
  const playerId = session.getPlayerIdByClientId(clientId);

  // Ignore if client is not a player in this session
  if (playerId === undefined) {
    console.warn(`Unknown client attempting action: ${clientId}`);
    return;
  }

  const gameState = session.getGameState();

  // Handle different action types
  switch (message.type) {
    case 'add':
      if (!message.cellPosition) {
        console.warn(`Add action missing cellPosition from client ${clientId}`);
        return;
      }
      gameState.addAction(playerId, 'add', message.cellPosition);
      break;

    case 'remove':
      if (!message.cellPosition) {
        console.warn(`Remove action missing cellPosition from client ${clientId}`);
        return;
      }
      gameState.addAction(playerId, 'remove', message.cellPosition);
      break;

    case 'pass':
      gameState.addAction(playerId, 'pass');
      break;

    default:
      console.warn(`Unknown action type: ${(message as any).type}`);
  }

  // Handle action confirmation
  if (message.confirmed) {
    gameState.commitAction(playerId);
  }
}

export function validateActionMessage(message: any): message is PlayerActionMessage {
  if (!message || typeof message !== 'object') return false;
  if (!['add', 'remove', 'pass'].includes(message.type)) return false;

  if (message.type === 'add' || message.type === 'remove') {
    if (!message.cellPosition ||
        typeof message.cellPosition.x !== 'number' ||
        typeof message.cellPosition.y !== 'number') {
      return false;
    }
  }

  return true;
}
