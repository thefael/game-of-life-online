// src/server/websocket.ts
import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { addPlayerToSession, removePlayerFromSession, handlePlayerAction } from './gameManager';

export interface GameClient {
  id: string;
  ws: WebSocket;
  playerId?: number;
}

const clients: Map<string, GameClient> = new Map();

// ANSI color codes
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
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

function logError(source: string, step: string, message: string, err?: any) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `${RED}[${timestamp}] [${source}/${step}]${RESET}`;
  if (err) {
    console.error(prefix, message, err);
  } else {
    console.error(prefix, message);
  }
}

function sendAck(ws: WebSocket, messageId: string, status: 'success' | 'error', message: string) {
  const ack = {
    ackId: messageId,
    status,
    message,
    timestamp: Date.now(),
  };
  ws.send(JSON.stringify(ack));
}

export function setupWebSocket(httpServer: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: WebSocket) => {
    const clientId = generateClientId();
    const client: GameClient = { id: clientId, ws };

    clients.set(clientId, client);
    log('SERVER', 'CONNECT', `Client connected: ${clientId}`);

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        log('SERVER', 'MESSAGE', `Received message type: ${message.type}`, { messageId: message.id });
        handleMessage(client, message);
      } catch (err) {
        logError('SERVER', 'MESSAGE_PARSE', 'Failed to parse message', err);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      removePlayerFromSession(clientId);
      log('SERVER', 'CONNECT', `Client disconnected: ${clientId}`);
    });

    ws.on('error', (err) => {
      logError('SERVER', 'CONNECT', `WebSocket error for client ${clientId}`, err);
    });
  });

  return wss;
}

function generateClientId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function handleMessage(client: GameClient, message: any): void {
  if (message.type === 'playerJoin') {
    try {
      log('SERVER', 'PLAYER_JOIN', `Processing playerJoin for client ${client.id}`, {
        name: message.payload?.name,
        color: message.payload?.color,
      });

      const { sessionId, playerId } = addPlayerToSession(
        client.id,
        message.payload?.name,
        message.payload?.color
      );
      client.playerId = playerId;

      log('SERVER', 'PLAYER_JOIN', `Player joined: ${client.id}, playerId: ${playerId}`, {
        sessionId,
      });

      // Send ACK for playerJoin
      sendAck(client.ws, message.id, 'success', 'Player joined successfully');

      // Send initial gameState
      setTimeout(() => {
        if (client.ws.readyState === 1) {
          const gameState = require('./gameManager').getCurrentGameState();
          const gameStateMsg = {
            id: require('../shared/protocol').generateMessageId(),
            type: 'gameState',
            payload: gameState,
            timestamp: Date.now(),
          };
          log('SERVER', 'GAME_STATE', `Sending gameState to client ${client.id}`, {
            generation: gameState.generation,
          });
          client.ws.send(JSON.stringify(gameStateMsg));
        }
      }, 100);
    } catch (err) {
      logError('SERVER', 'PLAYER_JOIN', `Failed to process playerJoin`, err);
      sendAck(client.ws, message.id, 'error', `Player join failed: ${err}`);
    }
  } else if (message.type === 'playerAction') {
    try {
      handlePlayerAction(client.id, message);
    } catch (err) {
      logError('SERVER', 'PLAYER_ACTION', `Failed to process playerAction`, err);
    }
  }
}

export function getClients(): Map<string, GameClient> {
  return clients;
}

export function broadcastMessage(message: any): void {
  const payload = JSON.stringify(message);
  let sentCount = 0;
  for (const client of clients.values()) {
    if (client.ws.readyState === 1) { // OPEN
      client.ws.send(payload);
      sentCount++;
    }
  }
  log('SERVER', 'BROADCAST', `Broadcasted message type: ${message.type}`, { sentTo: sentCount });
}
