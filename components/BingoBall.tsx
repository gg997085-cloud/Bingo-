
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BingoBallProps {
  number: number | null;
  commentary: string;
}

export const BingoBall: React.FC<BingoBallProps> = ({ number, commentary }) => {
  if (number === null) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-32 flex items-center justify-center text-indigo-300/40 italic text-sm animate-pulse"
    >
      Prepare your cards...
    </motion.div>
  );

  const getLetter = (n: number) => {
    if (n <= 15) return 'B';
    if (n <= 30) return 'I';
    if (n <= 45) return 'N';
    if (n <= 60) return 'G';
    return 'O';
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4 w-full max-w-sm">
      <AnimatePresence mode="wait">
        <motion.div 
          key={number}
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative group pr-4"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-rose-500 rounded-full blur opacity-20 transition duration-1000"></div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="relative w-28 h-28 md:w-32 md:h-32 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-indigo-100"
          >
            <span className="text-indigo-400 font-bungee text-lg md:text-xl leading-none">{getLetter(number)}</span>
            <span className="text-indigo-900 font-bungee text-4xl md:text-5xl leading-none">{number}</span>
            <div className="absolute bottom-2 w-1.5 h-1.5 bg-indigo-200 rounded-full"></div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      <motion.div 
        key={commentary}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-indigo-900/30 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/5 text-center min-h-[40px] flex items-center justify-center"
      >
        <p className="text-amber-300 font-semibold italic text-xs md:text-sm">
          "{commentary}"
        </p>
      </motion.div>
    </div>
  );
};
