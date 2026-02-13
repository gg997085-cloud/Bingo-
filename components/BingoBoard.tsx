
import React from 'react';
import { BingoCard } from '../types';

interface BingoBoardProps {
  card: BingoCard;
  onCellClick: (row: number, col: number) => void;
  isGameOver: boolean;
}

export const BingoBoard: React.FC<BingoBoardProps> = ({ card, onCellClick, isGameOver }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-[2.5rem] p-4 shadow-2xl border border-white/10">
      <div className="grid grid-cols-5 gap-2 mb-4">
        {headers.map((h) => (
          <div key={h} className="text-center text-2xl font-bungee text-amber-400 drop-shadow-md">
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {card.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            {row.map((cell, cIdx) => (
              <button
                key={`${rIdx}-${cIdx}`}
                disabled={isGameOver || (cell.number === 'FREE')}
                onClick={() => onCellClick(rIdx, cIdx)}
                className={`
                  aspect-square flex items-center justify-center text-lg md:text-xl font-bold rounded-2xl transition-all duration-300
                  ${cell.isMarked 
                    ? cell.isWinningCell 
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-inner scale-110 rotate-3 z-10 animate-in zoom-in-50 duration-300'
                      : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-inner scale-100 animate-in zoom-in-75' 
                    : 'bg-white/90 text-indigo-900 hover:bg-white active:scale-90'}
                  ${cell.number === 'FREE' ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-[10px] text-white font-bungee' : ''}
                  relative overflow-hidden
                `}
              >
                {cell.number}
                {cell.isMarked && !cell.isWinningCell && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none animate-in fade-in duration-500">
                    <div className="w-full h-full border-4 border-amber-900/20 rounded-2xl"></div>
                  </div>
                )}
                {/* Visual ripple/pop effect on mark */}
                {cell.isMarked && (
                  <div className="absolute inset-0 bg-white/20 animate-ping rounded-full pointer-events-none opacity-0"></div>
                )}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
