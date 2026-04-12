// src/server/websocket.ts
import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export interface GameClient {
  id: string;
  ws: WebSocket;
  playerId?: number;
}

const clients: Map<string, GameClient> = new Map();

export function setupWebSocket(httpServer: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: WebSocket) => {
    const clientId = generateClientId();
    const client: GameClient = { id: clientId, ws };

    clients.set(clientId, client);

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(client, message);
      } catch (err) {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for client ${clientId}:`, err);
    });
  });

  return wss;
}

function generateClientId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function handleMessage(client: GameClient, message: any): void {
  // Placeholder for message routing
  // Will be implemented in Task 10 (ActionHandler)
  console.log(`Message from client ${client.id}:`, message);
}

export function getClients(): Map<string, GameClient> {
  return clients;
}

export function broadcastMessage(message: any): void {
  const payload = JSON.stringify(message);
  for (const client of clients.values()) {
    if (client.ws.readyState === 1) { // OPEN
      client.ws.send(payload);
    }
  }
}
