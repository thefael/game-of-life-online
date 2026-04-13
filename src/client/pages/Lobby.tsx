import React, { useState, useEffect } from 'react';
import { GameSession } from '../App';
import { WebSocketClient } from '../services/websocket';
import './Lobby.css';

interface LobbyProps {
  onJoin: (session: GameSession) => void;
}

const COLORS = [
  { name: 'Blue', value: '#0066FF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Green', value: '#00AA00' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Purple', value: '#9900FF' },
  { name: 'Orange', value: '#FF8800' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
];

export default function Lobby({ onJoin }: LobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      const ws = new WebSocketClient();
      await ws.connect();

      // Send join message
      ws.send({
        type: 'playerJoin',
        name: playerName,
        color: selectedColor,
      });

      // Simulate getting playerId (in real app, server would assign)
      const playerId = Math.floor(Math.random() * 8);

      const session: GameSession = {
        sessionId: 'session-1',
        playerId,
        playerName,
        playerColor: selectedColor,
      };

      onJoin(session);
    } catch (err) {
      setError('Failed to connect to game server');
      setConnecting(false);
      console.error('Connection error:', err);
    }
  };

  return (
    <div className="lobby">
      <div className="lobby-container">
        <h1 className="lobby-title">Game of Life Online</h1>
        <p className="lobby-subtitle">Multiplayer Conway's Game of Life</p>

        <form onSubmit={handleJoinGame} className="lobby-form">
          <div className="form-group">
            <label htmlFor="name">Player Name</label>
            <input
              id="name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              disabled={connecting}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label>Choose Color</label>
            <div className="color-grid">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`color-button ${
                    selectedColor === color.value ? 'active' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                  disabled={connecting}
                />
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="join-button"
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
}
