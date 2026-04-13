import React, { useEffect, useState, useRef } from 'react';
import { GameSession } from '../App';
import { WebSocketClient } from '../services/websocket';
import { GameState, GameStateStore } from '../services/gameState';
import Grid from '../components/Grid';
import Sidebar from '../components/Sidebar';
import Timer from '../components/Timer';
import MiniMap from '../components/MiniMap';
import Ranking from '../components/Ranking';
import { Logger, LogLevel } from '../../shared/logger';
import { TIMER_DURATION } from '../../shared/constants';
import './Game.css';

interface GameProps {
  session: GameSession;
  onExit: () => void;
}

export default function Game({ session, onExit }: GameProps) {
  const [gameState, setGameState] = useState<GameStateStore>({
    generation: 0,
    grid: Array(50).fill(null).map(() => Array(50).fill({ type: 'empty' })),
    gridSize: 50,
    players: [],
    elapsed: 0,
    duration: TIMER_DURATION * 1000, // Convert seconds to milliseconds
    previewGrid: Array(50).fill(null).map(() => Array(50).fill({ type: 'empty' })),
  });
  const [ws, setWs] = useState<WebSocketClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [actionMode, setActionMode] = useState<'add' | 'remove' | 'pass' | null>(null);
  const [showFuture, setShowFuture] = useState(false);
  const gameStateRef = useRef(new GameState());
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connectAndSetup = async () => {
      try {
        // Step 1: Connect WebSocket
        Logger.log(LogLevel.INFO, 'CLIENT', 'SETUP', 'Starting connection setup');
        const wsClient = new WebSocketClient();
        wsRef.current = wsClient;

        Logger.log(LogLevel.INFO, 'CLIENT', 'SETUP', 'Establishing WebSocket connection');
        await wsClient.connect();

        if (!isMounted) {
          Logger.log(LogLevel.WARN, 'CLIENT', 'SETUP', 'Component unmounted, aborting setup');
          return;
        }

        Logger.log(LogLevel.SUCCESS, 'CLIENT', 'SETUP', 'WebSocket connected successfully');

        // Step 2: Send playerJoin with ACK
        Logger.log(LogLevel.INFO, 'CLIENT', 'SETUP', 'Sending playerJoin message');
        try {
          await wsClient.sendWithAck({
            type: 'playerJoin',
            payload: {
              name: session.playerName,
              color: session.playerColor,
            },
          });
          Logger.log(LogLevel.SUCCESS, 'CLIENT', 'SETUP', 'playerJoin ACK received');
        } catch (err) {
          Logger.log(LogLevel.ERROR, 'CLIENT', 'SETUP', 'playerJoin failed', err);
          throw err;
        }

        if (!isMounted) return;

        setWs(wsClient);
        setConnected(true);

        // Subscribe to game state updates
        wsClient.on('gameState', (msg: any) => {
          const grid = msg.payload?.grid;
          const generation = msg.payload?.generation;
          const isValidGrid = Array.isArray(grid) && grid.length > 0;

          Logger.log(LogLevel.INFO, 'CLIENT', 'GAME_STATE', `Received gameState gen=${generation}`, {
            gridValid: isValidGrid,
            gridType: typeof grid,
            gridLength: grid?.length,
            firstRowLength: grid?.[0]?.length,
            aliveCells: isValidGrid ? grid.flat().filter((c: any) => c.type !== 'empty').length : 0,
          });

          if (!isValidGrid) {
            Logger.log(LogLevel.ERROR, 'CLIENT', 'GAME_STATE', 'Invalid grid received', {
              grid,
            });
            return;
          }

          const oldGeneration = gameStateRef.current.getState().generation;
          gameStateRef.current.updateGameState({
            grid,
            generation,
            gridSize: msg.payload?.gridSize,
            players: msg.payload?.players,
          });
          const newState = gameStateRef.current.getState();

          Logger.log(LogLevel.SUCCESS, 'CLIENT', 'GAME_STATE', 'Grid updated', {
            oldGen: oldGeneration,
            newGen: newState.generation,
            cellsAlive: newState.grid.flat().filter((c: any) => c.type !== 'empty').length,
          });

          setGameState(newState);
        });

        wsClient.on('gameUpdate', (msg: any) => {
          Logger.log(LogLevel.DEBUG, 'CLIENT', 'GAME_UPDATE', 'Received gameUpdate', {
            generation: msg.payload?.generation,
            elapsed: msg.payload?.elapsed,
          });

          gameStateRef.current.updateGameState({
            generation: msg.payload?.generation,
            elapsed: msg.payload?.elapsed,
            duration: msg.payload?.duration,
          });
          // Update players
          const currentState = gameStateRef.current.getState();
          const updatedPlayers = currentState.players.map((p) => {
            const update = msg.payload?.players.find((u: any) => u.id === p.id);
            return update ? { ...p, ...update } : p;
          });
          gameStateRef.current.updateGameState({ players: updatedPlayers });
          setGameState(gameStateRef.current.getState());
        });

        wsClient.on('disconnected', () => {
          Logger.log(LogLevel.WARN, 'CLIENT', 'SETUP', 'Disconnected from server');
          if (isMounted) setConnected(false);
        });

        wsClient.on('error', (err: any) => {
          Logger.log(LogLevel.ERROR, 'CLIENT', 'SETUP', 'WebSocket error', err);
        });
      } catch (err) {
        Logger.log(LogLevel.ERROR, 'CLIENT', 'SETUP', 'Setup failed', err);
        if (isMounted) setConnected(false);
      }
    };

    connectAndSetup();

    return () => {
      isMounted = false;
      // Don't disconnect here - let the WebSocket handle its own lifecycle
      // Only disconnect when the component actually unmounts or session changes
    };
  }, []);

  const currentPlayer = gameState.players.find(
    (p) => p.id === session.playerId
  );

  const handleAddCell = () => {
    setActionMode(actionMode === 'add' ? null : 'add');
  };

  const handleRemoveCell = () => {
    setActionMode(actionMode === 'remove' ? null : 'remove');
  };

  const handlePass = () => {
    ws?.send({
      type: 'playerAction',
      action: 'pass',
      playerId: session.playerId,
    });
    setActionMode(null);
  };

  const handleGridClick = (x: number, y: number) => {
    if (actionMode === 'add') {
      ws?.send({
        type: 'playerAction',
        action: 'add',
        playerId: session.playerId,
        x,
        y,
      });
    } else if (actionMode === 'remove') {
      ws?.send({
        type: 'playerAction',
        action: 'remove',
        playerId: session.playerId,
        x,
        y,
      });
    }
  };

  // Cleanup only on component unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="header-left">
          <h1>Generation {gameState.generation}</h1>
          <button
            className="toggle-button"
            onClick={() => setShowFuture(!showFuture)}
          >
            {showFuture ? '🔮 FUTURO' : '👁️ PRESENTE'}
          </button>
        </div>
        <button className="exit-button" onClick={onExit}>
          ← Exit Game
        </button>
      </div>

      <div className="game-content">
        <div className="game-main">
          <Grid
            grid={showFuture ? gameState.previewGrid : gameState.grid}
            gridSize={gameState.gridSize}
            onCellClick={handleGridClick}
          />
        </div>

        <div className="game-sidebar">
          {currentPlayer && (
            <Sidebar
              playerName={currentPlayer.name}
              playerColor={currentPlayer.color}
              population={currentPlayer.population}
              score={currentPlayer.score}
              onAddCell={handleAddCell}
              onRemoveCell={handleRemoveCell}
              onPass={handlePass}
            />
          )}
        </div>

        <div className="game-right-panel">
          <div className="ranking-section">
            <Ranking
              players={gameState.players}
              currentPlayerId={session.playerId}
            />
          </div>

          <div className="timer-section">
            <Timer
              elapsed={gameState.elapsed}
              duration={gameState.duration}
            />
          </div>

          <div className="minimap-section">
            <MiniMap grid={gameState.grid} gridSize={gameState.gridSize} />
          </div>
        </div>
      </div>

      {!connected && (
        <div className="connection-status">
          Disconnected from server
        </div>
      )}
    </div>
  );
}
