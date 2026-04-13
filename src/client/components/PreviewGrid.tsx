import React, { useMemo } from 'react';
import { CellOwnership } from '../../engine/types';
import './PreviewGrid.css';

interface PreviewGridProps {
  previewGrid: CellOwnership[][];
  currentGrid: CellOwnership[][];
  gridSize?: number;
  cellSize?: number;
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

const SecondaryColorMap: Record<number, string> = {
  0: '#6699FF', // BLUE lighter
  1: '#FF6666', // RED lighter
  2: '#66DD66', // GREEN lighter
  3: '#FFFF99', // YELLOW lighter
  4: '#CC66FF', // PURPLE lighter
  5: '#FFBB66', // ORANGE lighter
  6: '#999999', // BLACK lighter
  7: '#EEEEEE', // WHITE lighter
};

export default function PreviewGrid({
  previewGrid,
  currentGrid,
  gridSize = 50,
  cellSize = 10,
}: PreviewGridProps) {
  // Identify newly born cells (exist in preview but not in current)
  const newCells = useMemo(() => {
    const newSet = new Set<string>();
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const current = currentGrid[y]?.[x];
        const preview = previewGrid[y]?.[x];

        const currentAlive =
          current?.type === 'owned' || current?.type === 'wild';
        const previewAlive =
          preview?.type === 'owned' || preview?.type === 'wild';

        if (!currentAlive && previewAlive) {
          newSet.add(`${x}-${y}`);
        }
      }
    }
    return newSet;
  }, [currentGrid, previewGrid, gridSize]);

  const getCellColor = (cell: CellOwnership, isNew: boolean): string => {
    if (cell.type === 'empty') {
      return '#333333';
    }

    if (!cell.playerId && cell.playerId !== 0) {
      return '#333333';
    }

    const baseColor = isNew
      ? SecondaryColorMap[cell.playerId]
      : PlayerColorMap[cell.playerId];

    if (cell.type === 'wild') {
      return baseColor + '80'; // 50% opacity
    }

    return baseColor;
  };

  return (
    <div
      className="preview-grid"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        gap: '1px',
      }}
    >
      {previewGrid.map((row, y) =>
        row.map((cell, x) => {
          const isNew = newCells.has(`${x}-${y}`);
          return (
            <div
              key={`${x}-${y}`}
              className={`preview-cell ${isNew ? 'new-cell' : ''}`}
              style={{
                backgroundColor: getCellColor(cell, isNew),
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
              title={`(${x},${y}) - ${cell.type}${isNew ? ' (NEW)' : ''}`}
            />
          );
        })
      )}
    </div>
  );
}
