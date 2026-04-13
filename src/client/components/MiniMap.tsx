import React from 'react';
import { CellOwnership } from '../../engine/types';
import './MiniMap.css';

interface MiniMapProps {
  grid: CellOwnership[][];
  gridSize?: number;
}

const PlayerColorMap: Record<number, string> = {
  0: '#0066FF', // BLUE
  1: '#FF0000', // RED
  2: '#00AA00', // GREEN
  3: '#FFFF00', // YELLOW
  4: '#9900FF', // PURPLE
  5: '#FF8800', // ORANGE
  6: '#000000', // BLACK
  7: '#FFFFFF', // WHITE
};

export default function MiniMap({ grid, gridSize = 50 }: MiniMapProps) {
  const getCellColor = (cell: CellOwnership): string => {
    if (cell.type === 'empty') {
      return '#1a1a1a';
    }

    if (!cell.playerId && cell.playerId !== 0) {
      return '#1a1a1a';
    }

    const baseColor = PlayerColorMap[cell.playerId];

    if (cell.type === 'wild') {
      return baseColor + '80'; // 50% opacity
    }

    return baseColor;
  };

  return (
    <div className="minimap">
      <div className="minimap-title">Mini-Map</div>
      <div
        className="minimap-grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 2px)`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="minimap-cell"
              style={{
                backgroundColor: getCellColor(cell),
                width: '2px',
                height: '2px',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
