
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BingoBoard } from './components/BingoBoard';
import { BingoBall } from './components/BingoBall';
import { RivalList } from './components/RivalList';
import { GameState, RivalPlayer } from './types';
import { generateCard, checkWin, createPRNG } from './utils/bingoLogic';
import { SPEED_MS, RIVAL_NAMES } from './constants';
import { getBingoCommentary, getWinCelebration } from './services/geminiService';
import { playSound, startBackgroundMusic, stopBackgroundMusic } from './utils/audio';

const App: React.FC = () => {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("Player " + Math.floor(Math.random() * 99));
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [state, setState] = useState<GameState>({
    drawnNumbers: [],
    currentBall: null,
    card: generateCard("default"),
    isGameOver: false,
    hasWon: false,
    commentary: "Ready for Blitz?",
    gameStarted: false,
    difficulty: 'Normal',
    rivals: []
  });

  const [isOfflineMode] = useState(!process.env.API_KEY);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prngRef = useRef<() => number>(() => Math.random());

  const initRivals = (): RivalPlayer[] => {
    return RIVAL_NAMES.slice(0, 5).map((name, i) => ({
      id: `rival-${i}`,
      name,
      markedCount: 0,
      isWinner: false,
      avatar: ""
    }));
  };

  const toggleMusic = () => {
    if (musicEnabled) {
      stopBackgroundMusic();
    } else if (state.gameStarted) {
      startBackgroundMusic();
    }
    setMusicEnabled(!musicEnabled);
  };

  const handleShare = async () => {
    const code = roomCode || "BINGO" + Math.floor(Math.random() * 999);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Bingo Blitz!',
          text: `Hey! Play Bingo with me offline. Use Room Code: ${code}`,
          url: window.location.href,
        });
        setRoomCode(code);
      } catch (err) { console.log("Share failed", err); }
    } else {
      setRoomCode(code);
      alert(`Share this code: ${code}`);
    }
  };

  const startGame = () => {
    const finalSeed = roomCode || Math.random().toString(36).substring(7);
    const cardSeed = finalSeed + playerName; 
    prngRef.current = createPRNG(finalSeed);
    
    if (musicEnabled) {
      playSound('pop');
      startBackgroundMusic();
    }

    setState(prev => ({
      ...prev,
      drawnNumbers: [],
      currentBall: null,
      card: generateCard(cardSeed),
      isGameOver: false,
      hasWon: false,
      gameStarted: true,
      commentary: "Game on! Eyes on the board.",
      rivals: initRivals()
    }));
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopBackgroundMusic();
    setState(prev => ({
      ...prev,
      gameStarted: false,
      isGameOver: false,
      drawnNumbers: [],
      currentBall: null,
      rivals: []
    }));
  };

  const drawBall = useCallback(async () => {
    setState(prev => {
      if (prev.isGameOver || prev.drawnNumbers.length >= 75) return prev;
      let nextNum: number;
      const getNext = () => Math.floor(prngRef.current() * 75) + 1;
      do { nextNum = getNext(); } while (prev.drawnNumbers.includes(nextNum));
      const newDrawn = [...prev.drawnNumbers, nextNum];
      
      if (musicEnabled) playSound('pop');

      const newRivals = prev.rivals.map(rival => {
        if (prngRef.current() > 0.88 && rival.markedCount < 24) {
          return { ...rival, markedCount: rival.markedCount + 1 };
        }
        return rival;
      });

      const rivalWinner = newRivals.find(r => r.markedCount >= 24);
      if (rivalWinner) {
        if (musicEnabled) playSound('loss');
        stopBackgroundMusic();
      }
      
      return {
        ...prev,
        drawnNumbers: newDrawn,
        currentBall: nextNum,
        rivals: newRivals,
        isGameOver: !!rivalWinner,
        commentary: prev.commentary
      };
    });
  }, [musicEnabled]);

  useEffect(() => {
    if (state.currentBall) {
      getBingoCommentary(state.currentBall).then(comment => {
        setState(prev => ({ ...prev, commentary: comment }));
      });
    }
  }, [state.currentBall]);

  useEffect(() => {
    if (state.gameStarted && !state.isGameOver) {
      timerRef.current = setInterval(() => {
        drawBall();
      }, SPEED_MS[state.difficulty]);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.gameStarted, state.isGameOver, state.difficulty, drawBall]);

  const markCell = (row: number, col: number) => {
    if (state.isGameOver) return;
    const cell = state.card[row][col];
    if (cell.number === 'FREE') return;
    if (state.drawnNumbers.includes(cell.number as number)) {
      
      if (musicEnabled) playSound('click');
      if ('vibrate' in navigator) navigator.vibrate(20);

      const newCard = [...state.card];
      newCard[row][col].isMarked = true;
      const { hasWon, winningCells } = checkWin(newCard);
      if (hasWon) {
        if (musicEnabled) playSound('win');
        stopBackgroundMusic();
        winningCells.forEach(([r, c]) => { newCard[r][c].isWinningCell = true; });
        getWinCelebration("YOU").then(msg => {
          setState(prev => ({ ...prev, card: newCard, hasWon: true, isGameOver: true, commentary: msg }));
        });
      } else {
        setState(prev => ({ ...prev, card: newCard }));
      }
    }
  };

  const winningRival = state.rivals.find(r => r.markedCount >= 24);

  return (
    <div className="relative min-h-screen max-w-6xl mx-auto px-4 py-6 md:py-8 flex flex-col items-center select-none overflow-x-hidden">
      {/* Sound Control - Top Right */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50">
        <button 
          onClick={toggleMusic}
          className={`group flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-xl backdrop-blur-md ${musicEnabled ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white/10 text-white/30'}`}
          title={musicEnabled ? "Mute Sound" : "Unmute Sound"}
        >
          {musicEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>
      </div>

      <header className="mb-6 md:mb-8 text-center relative animate-in fade-in slide-in-from-top duration-700">
        <h1 className="text-4xl md:text-7xl font-bungee text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-400 drop-shadow-lg mb-1">
          BINGO BLITZ
        </h1>
        <div className="flex items-center justify-center gap-3">
           {isOfflineMode && <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-2 py-0.5 rounded-full uppercase font-bold border border-indigo-500/20 tracking-tighter">Offline Engine</span>}
           <span className="text-indigo-200/60 font-semibold tracking-widest uppercase text-[10px] md:text-xs">Multiplayer Sync</span>
        </div>
      </header>

      {!state.gameStarted ? (
        <div className="w-full max-w-xl flex flex-col gap-6 bg-white/5 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-amber-400 font-bungee text-xs">Room Code</label>
                <button onClick={handleShare} className="text-[10px] text-indigo-300 underline font-bold uppercase tracking-wider">Share Code</button>
              </div>
              <input 
                type="text" 
                placeholder="Ex: BINGO77"
                className="w-full bg-indigo-950/40 border border-indigo-500/20 rounded-2xl px-5 py-4 text-white placeholder:text-indigo-300/30 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center font-bungee tracking-widest"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-amber-400 font-bungee text-xs">Nickname</label>
              <input 
                type="text" 
                className="w-full bg-indigo-950/40 border border-indigo-500/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['Slow', 'Normal', 'Fast'] as const).map(speed => (
              <button
                key={speed}
                onClick={() => setState(prev => ({ ...prev, difficulty: speed }))}
                className={`py-3 rounded-xl font-bold text-xs transition-all ${state.difficulty === speed ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105' : 'bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60'}`}
              >
                {speed}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className="group relative w-full py-5 bg-indigo-600 rounded-2xl font-bungee text-2xl text-white hover:bg-indigo-500 transition-all shadow-xl active:scale-95"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-rose-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <span className="relative">START GAME</span>
          </button>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-3 hidden lg:flex flex-col gap-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-400 font-bungee text-sm">Session</h3>
                <span className="text-[10px] bg-indigo-500/30 px-2 py-1 rounded text-white font-mono">{roomCode || 'SOLO'}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-indigo-200/60">Drawn:</span><span className="font-bold">{state.drawnNumbers.length}</span></div>
                <div className="flex justify-between"><span className="text-indigo-200/60">Player:</span><span className="font-bold text-amber-400 truncate max-w-[80px]">{playerName}</span></div>
              </div>
              <button onClick={resetGame} className="mt-6 w-full py-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 transition-all text-[10px] font-bold uppercase tracking-widest">Quit</button>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-amber-400 font-bungee mb-2 text-sm">History</h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {state.drawnNumbers.slice().reverse().map((n, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold border border-white/5">{n}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col items-center gap-4">
            <BingoBall number={state.currentBall} commentary={state.commentary} />
            <BingoBoard card={state.card} onCellClick={markCell} isGameOver={state.isGameOver} />
            
            <div className="lg:hidden flex justify-between w-full max-w-md px-2 mt-2">
               <span className="text-[10px] font-bold text-indigo-300 uppercase">Room: {roomCode || 'SOLO'}</span>
               <button onClick={resetGame} className="text-[10px] font-bold text-rose-400 uppercase">Leave Game</button>
            </div>

            {state.isGameOver && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-indigo-950/90 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-sm text-center p-8 bg-indigo-900 rounded-[2.5rem] border-2 border-amber-500/30 shadow-2xl animate-in zoom-in duration-500">
                  <h2 className="text-4xl font-bungee text-amber-400 mb-2">
                    {state.hasWon ? 'BINGO!' : 'ROUND END'}
                  </h2>
                  <p className="text-white font-bold text-lg mb-4">
                     {state.hasWon ? 'Absolute Victory!' : `${winningRival?.name} beat you!`}
                  </p>
                  <p className="text-indigo-200 mb-8 italic text-xs leading-relaxed">"{state.commentary}"</p>
                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-amber-500 text-white font-bungee rounded-2xl shadow-lg active:scale-95 transition-all shadow-amber-500/20"
                  >
                    PLAY AGAIN
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 w-full lg:max-w-xs">
            <RivalList rivals={state.rivals} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
