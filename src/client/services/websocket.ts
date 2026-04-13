import { Logger, LogLevel } from '../../shared/logger';
import {
  ProtocolMessage,
  ProtocolAck,
  GameStateMessage,
  GameUpdateMessage,
  generateMessageId,
} from '../../shared/protocol';

export type GameMessage = GameStateMessage | GameUpdateMessage;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Function[]> = new Map();
  private ackWaiters: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(url: string = 'ws://localhost:3001') {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        Logger.log(LogLevel.INFO, 'CLIENT', 'CONNECT', 'Connecting to WebSocket...');
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          Logger.log(LogLevel.SUCCESS, 'CLIENT', 'CONNECT', 'WebSocket connection established');
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (err) {
            Logger.log(LogLevel.ERROR, 'CLIENT', 'MESSAGE_PARSE', 'Failed to parse message', err);
          }
        };

        this.ws.onerror = (event: Event) => {
          Logger.log(LogLevel.ERROR, 'CLIENT', 'CONNECT', 'WebSocket error', event);
          this.emit('error', event);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          Logger.log(LogLevel.WARN, 'CLIENT', 'CONNECT', 'WebSocket connection closed');
          this.emit('disconnected');
          this.attemptReconnect();
        };
      } catch (err) {
        Logger.log(LogLevel.ERROR, 'CLIENT', 'CONNECT', 'Connection error', err);
        reject(err);
      }
    });
  }

  private handleMessage(message: any) {
    // Check if it's an ACK
    if (message.ackId) {
      const waiter = this.ackWaiters.get(message.ackId);
      if (waiter) {
        clearTimeout(waiter.timeout);
        this.ackWaiters.delete(message.ackId);

        if (message.status === 'success') {
          Logger.log(
            LogLevel.SUCCESS,
            'CLIENT',
            'ACK',
            `Received ACK for message ${message.ackId}`,
            message
          );
          waiter.resolve(message);
        } else {
          Logger.log(
            LogLevel.ERROR,
            'CLIENT',
            'ACK',
            `ACK failed for message ${message.ackId}: ${message.message}`,
            message
          );
          waiter.reject(new Error(message.message));
        }
      }
      return;
    }

    // Regular message
    if (message.type) {
      Logger.log(LogLevel.INFO, 'CLIENT', 'MESSAGE', `Received message type: ${message.type}`, message);
      this.emit('message', message);
      this.emit(message.type, message);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      Logger.log(LogLevel.WARN, 'CLIENT', 'CONNECT', `Reconnecting in ${delay}ms...`);
      setTimeout(() => this.connect().catch(console.error), delay);
    }
  }

  async sendWithAck(message: any, timeoutMs: number = 5000): Promise<ProtocolAck> {
    const messageId = generateMessageId();
    const fullMessage = { ...message, id: messageId, timestamp: Date.now() };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.ackWaiters.delete(messageId);
        Logger.log(
          LogLevel.ERROR,
          'CLIENT',
          'TIMEOUT',
          `No ACK received for message ${messageId} after ${timeoutMs}ms`,
          fullMessage
        );
        reject(new Error(`ACK timeout for message type ${message.type}`));
      }, timeoutMs);

      this.ackWaiters.set(messageId, { resolve, reject, timeout });

      if (this.ws?.readyState === WebSocket.OPEN) {
        Logger.log(LogLevel.DEBUG, 'CLIENT', 'SEND', `Sending message: ${message.type}`, fullMessage);
        this.ws.send(JSON.stringify(fullMessage));
      } else {
        clearTimeout(timeout);
        this.ackWaiters.delete(messageId);
        Logger.log(LogLevel.ERROR, 'CLIENT', 'SEND', 'WebSocket not connected');
        reject(new Error('WebSocket not connected'));
      }
    });
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage = { ...message, id: generateMessageId(), timestamp: Date.now() };
      Logger.log(LogLevel.DEBUG, 'CLIENT', 'SEND', `Sending message: ${message.type}`, fullMessage);
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      Logger.log(LogLevel.WARN, 'CLIENT', 'SEND', 'WebSocket not connected', message);
    }
  }

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }

  disconnect(): void {
    if (this.ws) {
      Logger.log(LogLevel.INFO, 'CLIENT', 'DISCONNECT', 'Disconnecting WebSocket');
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
