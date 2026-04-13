import React, { useState, useRef, useEffect } from 'react';
import { CellOwnership } from '../../engine/types';
import './Grid.css';

interface GridProps {
  grid: CellOwnership[][];
  gridSize?: number;
  cellSize?: number;
  onCellClick?: (x: number, y: number) => void;
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

export default function Grid({
  grid,
  gridSize = 50,
  cellSize = 10,
  onCellClick,
}: GridProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const getCellColor = (cell: CellOwnership): string => {
    if (cell.type === 'empty') {
      return '#444444'; // Lighter for visibility
    }

    if (!cell.playerId && cell.playerId !== 0) {
      return '#444444';
    }

    const baseColor = PlayerColorMap[cell.playerId];

    if (cell.type === 'wild') {
      return baseColor + '80'; // 50% opacity
    }

    return baseColor;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(true);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        e.preventDefault();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1; // Scroll down = zoom out, up = zoom in
        setZoom((prevZoom) => {
          const newZoom = prevZoom * delta;
          return Math.max(0.5, Math.min(5, newZoom)); // Clamp between 0.5x and 5x
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (spacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && spacePressed) {
      setOffsetX(e.clientX - panStart.x);
      setOffsetY(e.clientY - panStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleCellClick = (e: React.MouseEvent, x: number, y: number) => {
    if (!isPanning && !spacePressed) {
      onCellClick?.(x, y);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`grid-container ${isPanning ? 'panning' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gap: '1px',
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="grid-cell"
              style={{
                backgroundColor: getCellColor(cell),
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                border: '1px solid #222',
              }}
              onClick={(e) => handleCellClick(e, x, y)}
              title={`(${x},${y}) - ${cell.type}`}
            />
          ))
        )}
      </div>
      {spacePressed && <div className="pan-hint">Drag to pan</div>}
      <div className="zoom-hint">{(zoom * 100).toFixed(0)}%</div>
    </div>
  );
}
