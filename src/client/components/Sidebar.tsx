import React, { useState } from 'react';
import './Sidebar.css';

interface SidebarProps {
  playerName: string;
  playerColor: string;
  population: number;
  score: number;
  onAddCell: () => void;
  onRemoveCell: () => void;
  onPass: () => void;
}

type ActionMode = 'add' | 'remove' | 'pass' | null;

export default function Sidebar({
  playerName,
  playerColor,
  population,
  score,
  onAddCell,
  onRemoveCell,
  onPass,
}: SidebarProps) {
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [lastAction, setLastAction] = useState<string>('');

  const handleAddCell = () => {
    setActionMode('add');
    setLastAction('Add mode: click grid to place cells');
    onAddCell();
  };

  const handleRemoveCell = () => {
    setActionMode('remove');
    setLastAction('Remove mode: click grid to remove cells');
    onRemoveCell();
  };

  const handlePass = () => {
    setActionMode(null);
    setLastAction('Passed this turn');
    onPass();
  };

  return (
    <div className="sidebar">
      <div className="player-info">
        <div className="player-header">
          <div
            className="color-badge"
            style={{ backgroundColor: playerColor }}
          />
          <h2>{playerName}</h2>
        </div>

        <div className="stats">
          <div className="stat">
            <span className="stat-label">Population</span>
            <span className="stat-value">{population}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>
      </div>

      <div className="actions">
        <h3>Actions</h3>
        <button
          className={`action-button ${actionMode === 'add' ? 'active' : ''}`}
          onClick={handleAddCell}
        >
          ➕ Add Cell
        </button>
        <button
          className={`action-button ${actionMode === 'remove' ? 'active' : ''}`}
          onClick={handleRemoveCell}
        >
          ➖ Remove Cell
        </button>
        <button className="action-button pass-button" onClick={handlePass}>
          ⏭️ Pass
        </button>
      </div>

      {lastAction && (
        <div className="feedback">
          <p>{lastAction}</p>
        </div>
      )}
    </div>
  );
}
