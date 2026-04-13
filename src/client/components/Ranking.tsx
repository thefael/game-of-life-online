import React, { useMemo } from 'react';
import './Ranking.css';

interface Player {
  id: number;
  color: string;
  name: string;
  score: number;
  population: number;
}

interface RankingProps {
  players: Player[];
  currentPlayerId: number;
}

export default function Ranking({ players, currentPlayerId }: RankingProps) {
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  return (
    <div className="ranking">
      <div className="ranking-title">Rankings</div>
      <div className="ranking-list">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`ranking-row ${
              player.id === currentPlayerId ? 'current-player' : ''
            }`}
          >
            <div className="rank">{index + 1}</div>
            <div
              className="color-badge"
              style={{ backgroundColor: player.color }}
            />
            <div className="player-name">{player.name}</div>
            <div className="score">{player.score}</div>
            <div className="population">{player.population}</div>
          </div>
        ))}
      </div>
      <div className="ranking-legend">
        <div className="legend-item">
          <span>Score</span>
        </div>
        <div className="legend-item">
          <span>Pop</span>
        </div>
      </div>
    </div>
  );
}
