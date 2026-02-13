
import React from 'react';
import { RivalPlayer } from '../types';

interface RivalListProps {
  rivals: RivalPlayer[];
}

const Avatar: React.FC<{ name: string; isWinner: boolean }> = ({ name, isWinner }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  
  // Deterministic color based on name
  const colors = [
    'from-pink-500 to-rose-600',
    'from-purple-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600'
  ];
  const colorIndex = name.length % colors.length;

  return (
    <div className={`
      w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2
      bg-gradient-to-br ${colors[colorIndex]}
      ${isWinner ? 'border-amber-400 scale-110 animate-pulse' : 'border-white/20'}
    `}>
      {initials}
    </div>
  );
};

export const RivalList: React.FC<RivalListProps> = ({ rivals }) => {
  return (
    <div className="w-full max-w-xs bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <h3 className="text-amber-400 font-bungee text-lg">Live Room</h3>
        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
      </div>
      <div className="space-y-4">
        {rivals.map((rival) => (
          <div key={rival.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <Avatar name={rival.name} isWinner={rival.isWinner} />
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${rival.isWinner ? 'text-amber-400' : 'text-white'}`}>
                  {rival.name} {rival.isWinner && '🏆'}
                </span>
                <div className="w-24 h-1.5 bg-indigo-950 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full transition-all duration-1000 ${rival.isWinner ? 'bg-amber-400' : 'bg-indigo-400'}`}
                    style={{ width: `${Math.min(100, (rival.markedCount / 24) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-indigo-300 uppercase">Progress</span>
              <span className="text-xs text-white font-mono">{rival.markedCount}/24</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
