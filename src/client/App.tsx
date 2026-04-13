import React, { useState } from 'react';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

export interface GameSession {
  sessionId: string;
  playerId: number;
  playerName: string;
  playerColor: string;
}

type Screen = 'lobby' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [session, setSession] = useState<GameSession | null>(null);

  const handleJoinGame = (sessionInfo: GameSession) => {
    setSession(sessionInfo);
    setScreen('game');
  };

  const handleExitGame = () => {
    setSession(null);
    setScreen('lobby');
  };

  return (
    <div className="app">
      {screen === 'lobby' && <Lobby onJoin={handleJoinGame} />}
      {screen === 'game' && session && (
        <Game session={session} onExit={handleExitGame} />
      )}
    </div>
  );
}
