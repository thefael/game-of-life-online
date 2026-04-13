// WebSocket protocol with handshake and confirmation

export interface ProtocolMessage {
  id: string; // Unique message ID for tracking
  type: string;
  payload: any;
  timestamp: number;
}

export interface ProtocolAck {
  ackId: string; // References the message being acknowledged
  status: 'success' | 'error';
  message: string;
  timestamp: number;
}

// Step 1: Client connects (no payload needed)
export interface ClientConnectedMessage extends ProtocolMessage {
  type: 'clientConnected';
  payload: undefined;
}

// Step 2: Client sends playerJoin
export interface PlayerJoinMessage extends ProtocolMessage {
  type: 'playerJoin';
  payload: {
    name: string;
    color: string;
  };
}

// Step 3: Server sends gameState
export interface GameStateMessage extends ProtocolMessage {
  type: 'gameState';
  payload: {
    generation: number;
    gridSize: number;
    grid: Array<Array<any>>;
    players: Array<{
      id: number;
      name: string;
      color: string;
      score: number;
      population: number;
    }>;
  };
}

// Step 4: Server sends gameUpdate (every tick)
export interface GameUpdateMessage extends ProtocolMessage {
  type: 'gameUpdate';
  payload: {
    generation: number;
    elapsed: number;
    duration: number;
    players: Array<{
      id: number;
      score: number;
      population: number;
    }>;
  };
}

// Error message
export interface ErrorMessage extends ProtocolMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
  };
}

export type WebSocketMessage =
  | ProtocolMessage
  | ProtocolAck
  | ClientConnectedMessage
  | PlayerJoinMessage
  | GameStateMessage
  | GameUpdateMessage
  | ErrorMessage;

export function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
