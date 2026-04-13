// src/server/gameLoop.ts
import { GameSession } from './gameSession';
import { TIMER_DURATION } from '../shared/constants';

export type TickCallback = () => void;

export class GameLoop {
  private session: GameSession;
  private duration: number; // in milliseconds
  private isLoopRunning: boolean = false;
  private startTime: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private tickCallbacks: TickCallback[] = [];

  constructor(session: GameSession, durationSeconds: number = TIMER_DURATION) {
    this.session = session;
    this.duration = durationSeconds * 1000; // Convert to milliseconds
  }

  start(): void {
    if (this.isLoopRunning) return;

    this.isLoopRunning = true;
    this.startTime = Date.now();

    // Main game loop - tick happens every 30 seconds
    this.timerInterval = setInterval(() => {
      this.onTimerComplete();
    }, this.duration);

    // Update loop - send frequent elapsed time updates to clients
    this.updateInterval = setInterval(() => {
      for (const callback of this.tickCallbacks) {
        callback();
      }
    }, 100); // Send updates every 100ms for smooth timer display
  }

  stop(): void {
    if (!this.isLoopRunning) return;

    this.isLoopRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private onTimerComplete(): void {
    // Execute game state tick
    this.session.getGameState().tick();

    // Reset timer for next round
    this.startTime = Date.now();

    // Callbacks will be called by the update interval, no need to call them here
  }

  onTick(callback: TickCallback): void {
    this.tickCallbacks.push(callback);
  }

  getSession(): GameSession {
    return this.session;
  }

  isRunning(): boolean {
    return this.isLoopRunning;
  }

  getDuration(): number {
    return this.duration;
  }

  getElapsedTime(): number {
    if (!this.isLoopRunning) return 0;
    return Date.now() - this.startTime;
  }

  getTimeRemaining(): number {
    if (!this.isLoopRunning) return this.duration;
    const remaining = this.duration - this.getElapsedTime();
    return Math.max(0, remaining);
  }
}
