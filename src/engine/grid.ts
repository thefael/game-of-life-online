import { CellOwnership, PlayerId } from './types';
import { GRID_SIZE } from '../shared/constants';

export class Grid {
  private cells: CellOwnership[][];
  private size: number;

  constructor(size: number = GRID_SIZE) {
    this.size = size;
    this.cells = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({ type: 'empty' as const }))
      );
  }

  private normalize(x: number, y: number): [number, number] {
    return [(x + this.size) % this.size, (y + this.size) % this.size];
  }

  getCell(x: number, y: number): CellOwnership {
    const [nx, ny] = this.normalize(x, y);
    return this.cells[ny][nx];
  }

  setCell(x: number, y: number, ownership: CellOwnership): void {
    const [nx, ny] = this.normalize(x, y);
    this.cells[ny][nx] = ownership;
  }

  countNeighbors(x: number, y: number): {
    total: number;
    byPlayer: Map<PlayerId, number>;
  } {
    const byPlayer = new Map<PlayerId, number>();
    let total = 0;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const neighbor = this.getCell(x + dx, y + dy);
        if (neighbor.type === 'owned' || neighbor.type === 'wild') {
          total++;
          const pid = neighbor.playerId!;
          byPlayer.set(pid, (byPlayer.get(pid) ?? 0) + 1);
        }
      }
    }

    return { total, byPlayer };
  }

  getCellsByPlayer(playerId: PlayerId): Array<{ x: number; y: number }> {
    const cells: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = this.cells[y][x];
        if ((cell.type === 'owned' || cell.type === 'wild') && cell.playerId === playerId) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }

  clone(): Grid {
    const newGrid = new Grid(this.size);
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        newGrid.setCell(x, y, { ...this.cells[y][x] });
      }
    }
    return newGrid;
  }

  get gridSize(): number {
    return this.size;
  }

  serialize(): CellOwnership[][] {
    return this.cells.map(row => row.map(cell => ({ ...cell })));
  }
}
