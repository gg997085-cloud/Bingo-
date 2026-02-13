
export type BingoColumn = 'B' | 'I' | 'N' | 'G' | 'O';

export interface BingoCell {
  number: number | 'FREE';
  isMarked: boolean;
  isWinningCell: boolean;
}

export type BingoCard = BingoCell[][];

export interface GameState {
  drawnNumbers: number[];
  currentBall: number | null;
  card: BingoCard;
  isGameOver: boolean;
  hasWon: boolean;
  commentary: string;
  gameStarted: boolean;
  difficulty: 'Slow' | 'Normal' | 'Fast';
  rivals: RivalPlayer[];
}

export interface RivalPlayer {
  id: string;
  name: string;
  markedCount: number;
  isWinner: boolean;
  avatar: string;
}
