
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BingoCard } from '../types';

interface BingoBoardProps {
  card: BingoCard;
  onCellClick: (row: number, col: number) => void;
  isGameOver: boolean;
}

export const BingoBoard: React.FC<BingoBoardProps> = ({ card, onCellClick, isGameOver }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-[2.5rem] p-4 shadow-2xl border border-white/10"
    >
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
              <motion.button
                key={`${rIdx}-${cIdx}`}
                whileHover={!isGameOver && cell.number !== 'FREE' ? { scale: 1.05 } : {}}
                whileTap={!isGameOver && cell.number !== 'FREE' ? { scale: 0.95 } : {}}
                disabled={isGameOver || (cell.number === 'FREE')}
                onClick={() => onCellClick(rIdx, cIdx)}
                className={`
                  aspect-square flex items-center justify-center text-lg md:text-xl font-bold rounded-2xl transition-colors duration-300
                  ${cell.isMarked 
                    ? cell.isWinningCell 
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-inner z-10'
                      : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-inner' 
                    : 'bg-white/90 text-indigo-900 hover:bg-white'}
                  ${cell.number === 'FREE' ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-[10px] text-white font-bungee' : ''}
                  relative overflow-hidden
                `}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cell.isMarked ? 'marked' : 'unmarked'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {cell.number}
                  </motion.span>
                </AnimatePresence>
                
                {cell.isMarked && !cell.isWinningCell && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none"
                  >
                    <div className="w-full h-full border-4 border-amber-900/20 rounded-2xl"></div>
                  </motion.div>
                )}
                
                {cell.isWinningCell && (
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-white/10 pointer-events-none"
                  />
                )}
              </motion.button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};
