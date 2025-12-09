import React, { useState, useCallback } from 'react';
import { Cup } from './components/Cup';
import { GameState, CupData } from './types';
import { RotateCcw, Play, Trophy } from 'lucide-react';

// Configuration
const BASE_SHUFFLE_COUNT = 5;
const SHUFFLE_SPEED_MS = 500;

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  
  const [cups, setCups] = useState<CupData[]>([
    { id: 0, hasBall: false },
    { id: 1, hasBall: true },
    { id: 2, hasBall: false },
  ]);

  const [revealedCupId, setRevealedCupId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  // --- Logic ---

  const swapCups = async (currentCups: CupData[]) => {
    const newCups = [...currentCups];
    const count = newCups.length;
    const idx1 = Math.floor(Math.random() * count);
    let idx2 = Math.floor(Math.random() * count);
    
    // Ensure we pick two different cups
    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * count);
    }
    
    const temp = newCups[idx1];
    newCups[idx1] = newCups[idx2];
    newCups[idx2] = temp;
    return newCups;
  };

  const runShuffleSequence = async (startingCups: CupData[], shuffleCount: number) => {
    let currentLayout = startingCups;
    setMessage("Bardaklar karışıyor...");

    for (let i = 0; i < shuffleCount; i++) {
      await new Promise(r => setTimeout(r, SHUFFLE_SPEED_MS));
      currentLayout = await swapCups(currentLayout);
      setCups(currentLayout);
    }

    await new Promise(r => setTimeout(r, SHUFFLE_SPEED_MS));
    setGameState(GameState.GUESSING);
    setMessage("Top hangi bardakta?");
  };

  const startGame = useCallback(() => {
    // 1. Setup Game
    setRevealedCupId(null);
    setLastCorrect(null);
    setMessage("Top burada! Dikkatli bak.");
    
    // Determine number of cups based on streak
    // 0-4 wins: 3 cups
    // 5-9 wins: 4 cups
    // 10-14 wins: 5 cups
    // etc.
    const numCups = 3 + Math.floor(streak / 5);
    
    // Pick winner
    const winningId = Math.floor(Math.random() * numCups);
    
    // Generate cup objects
    const initialCups = Array.from({ length: numCups }, (_, i) => ({
      id: i,
      hasBall: i === winningId,
    }));
    
    setCups(initialCups);
    
    // 2. Show Ball (Lift the winning cup)
    setGameState(GameState.SHOWING_BALL);
    
    // Calculate difficulty (shuffle count) based on streak
    const currentShuffleCount = BASE_SHUFFLE_COUNT + streak;
    
    // 3. Start Shuffle after delay
    setTimeout(() => {
      setGameState(GameState.SHUFFLING);
      runShuffleSequence(initialCups, currentShuffleCount);
    }, 1500); 

  }, [streak]);

  const handleCupClick = (clickedCup: CupData) => {
    if (gameState !== GameState.GUESSING) return;

    setGameState(GameState.REVEAL);
    setRevealedCupId(clickedCup.id); // Reveal clicked cup

    if (clickedCup.hasBall) {
      // Correct
      setMessage("Tebrikler! Doğru tahmin.");
      setLastCorrect(true);
      setStreak(s => s + 1);
    } else {
      // Incorrect
      setMessage("Yanlış tahmin"); // Specific text request
      setLastCorrect(false);
      setStreak(0);
      
      // Also reveal the actual location after a brief moment
      const winningCup = cups.find(c => c.hasBall);
      setTimeout(() => {
          if (winningCup) setRevealedCupId(winningCup.id);
      }, 1000);
    }
  };

  // Determine if a cup should be lifted visually
  const isCupLifted = (cup: CupData) => {
    if (gameState === GameState.SHOWING_BALL && cup.hasBall) return true;
    if (gameState === GameState.REVEAL) {
      // Lift if it is the one user clicked OR if it is the winner (logic handled in click handler)
      return cup.id === revealedCupId;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white overflow-hidden relative font-poppins selection:bg-red-500/30">
        
      {/* Background Image - Landscape */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Dark Overlay for better visibility */}
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[1px]"></div>

      {/* Background Table */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[70vh] bg-emerald-900 rounded-[100%] shadow-[inset_0_0_150px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.5)] z-0 border-y-8 border-emerald-950/50"></div>

      {/* Header */}
      <div className="absolute top-8 w-full px-8 flex justify-between items-center z-50 max-w-2xl">
        <h1 className="text-3xl font-bold text-amber-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">Bul Karayı</h1>
        <div className="flex items-center space-x-3 bg-black/60 px-5 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-mono text-2xl font-bold">{streak}</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative z-10 w-full max-w-5xl h-80 flex items-center justify-center perspective-1000">
        {cups.map((cup, index) => (
          <Cup
            key={cup.id}
            id={cup.id}
            hasBall={cup.hasBall}
            positionIndex={index} 
            totalCups={cups.length}
            isLifted={isCupLifted(cup)}
            onClick={() => handleCupClick(cup)}
            canInteract={gameState === GameState.GUESSING}
          />
        ))}
      </div>

      {/* Controls & Messages */}
      <div className="z-20 flex flex-col items-center space-y-6 h-40">
        <p className={`text-2xl font-bold transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center ${gameState === GameState.GUESSING ? 'scale-110 text-yellow-300' : 'text-gray-100'}`}>
          {message}
        </p>

        {/* Start Button */}
        {gameState === GameState.IDLE && (
          <button
            onClick={startGame}
            className="group flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transform transition active:scale-95 text-xl border border-white/20"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Oyuna Başla</span>
          </button>
        )}

        {/* End Game Actions */}
        {gameState === GameState.REVEAL && (
          <div className="flex flex-col items-center animate-fade-in-up space-y-3">
             {/* If incorrect, show the prompt text above the button */}
             {!lastCorrect && (
                <p className="text-white/90 font-semibold drop-shadow-md animate-pulse">Bir daha oynamak ister misiniz?</p>
             )}

            <button
              onClick={startGame}
              className={`flex items-center space-x-2 px-8 py-3 rounded-full font-bold shadow-xl transform transition hover:scale-105 active:scale-95 text-lg ${
                lastCorrect 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                  : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white border border-white/20'
              }`}
            >
              <RotateCcw className={`w-5 h-5 ${lastCorrect ? 'animate-spin-once' : ''}`} />
              {/* Button text specific logic based on user prompt */}
              <span>{lastCorrect ? 'Tekrar Oyna' : 'Tekrar Oynamak İster misiniz?'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;