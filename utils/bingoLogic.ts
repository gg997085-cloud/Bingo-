
import { BingoCard, BingoCell, BingoColumn } from '../types';
import { BINGO_RANGES } from '../constants';

/**
 * A simple deterministic seedable random number generator (Mulberry32)
 */
export const createPRNG = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  let a = h;
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const getRandomInRange = (min: number, max: number, count: number, prng: () => number): number[] => {
  const nums = new Set<number>();
  while (nums.size < count) {
    nums.add(Math.floor(prng() * (max - min + 1)) + min);
  }
  return Array.from(nums).sort((a, b) => a - b);
};

export const generateCard = (seed: string): BingoCard => {
  const prng = createPRNG(seed);
  const columns: BingoColumn[] = ['B', 'I', 'N', 'G', 'O'];
  const card: BingoCard = [];

  for (let i = 0; i < 5; i++) {
    const colKey = columns[i];
    const { min, max } = BINGO_RANGES[colKey];
    const colNumbers = getRandomInRange(min, max, 5, prng);
    
    const row: BingoCell[] = colNumbers.map((num, idx) => ({
      number: (i === 2 && idx === 2) ? 'FREE' : num,
      isMarked: (i === 2 && idx === 2),
      isWinningCell: false
    }));
    card.push(row);
  }

  const rows: BingoCard = Array.from({ length: 5 }, () => Array(5).fill(null));
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 5; r++) {
      rows[r][c] = card[c][r];
    }
  }

  return rows;
};

export const checkWin = (card: BingoCard): { hasWon: boolean; winningCells: [number, number][] } => {
  const winningCells: [number, number][] = [];

  for (let r = 0; r < 5; r++) {
    if (card[r].every(cell => cell.isMarked)) {
      card[r].forEach((_, c) => winningCells.push([r, c]));
      return { hasWon: true, winningCells };
    }
  }

  for (let c = 0; c < 5; c++) {
    let allMarked = true;
    for (let r = 0; r < 5; r++) {
      if (!card[r][c].isMarked) {
        allMarked = false;
        break;
      }
    }
    if (allMarked) {
      for (let r = 0; r < 5; r++) winningCells.push([r, c]);
      return { hasWon: true, winningCells };
    }
  }

  let diag1 = true;
  for (let i = 0; i < 5; i++) {
    if (!card[i][i].isMarked) diag1 = false;
  }
  if (diag1) {
    for (let i = 0; i < 5; i++) winningCells.push([i, i]);
    return { hasWon: true, winningCells };
  }

  let diag2 = true;
  for (let i = 0; i < 5; i++) {
    if (!card[i][4 - i].isMarked) diag2 = false;
  }
  if (diag2) {
    for (let i = 0; i < 5; i++) winningCells.push([i, 4 - i]);
    return { hasWon: true, winningCells };
  }

  return { hasWon: false, winningCells: [] };
};
