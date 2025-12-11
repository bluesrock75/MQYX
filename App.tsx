import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import GameOverModal from './components/GameOverModal';
import StartScreen from './components/StartScreen';
import { GameState, GameMode } from './types';
import { COLORS } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.CLASSIC);
  const [score, setScore] = useState<number>(0);

  const startGame = (mode: GameMode) => {
    setScore(0);
    setGameMode(mode);
    setGameState(GameState.PLAYING);
  };

  const restartGame = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  const goToMenu = () => {
    setScore(0);
    setGameState(GameState.MENU);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ backgroundColor: COLORS.GREEN_SHAPE }}></div>
        <div className="absolute top-40 -right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" style={{ backgroundColor: COLORS.BLUE_SHAPE }}></div>
        <div className="absolute -bottom-20 left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" style={{ backgroundColor: COLORS.RED_DOT }}></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Game Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200">
            
            <GameCanvas 
                gameState={gameState}
                gameMode={gameMode}
                setGameState={setGameState} 
                setScore={setScore} 
                score={score} 
            />

            {gameState === GameState.MENU && (
                <StartScreen onStart={startGame} />
            )}

            {gameState === GameState.GAME_OVER && (
                <GameOverModal 
                    score={score} 
                    gameMode={gameMode} 
                    onRestart={restartGame}
                    onMainMenu={goToMenu}
                />
            )}
        </div>
        
        {/* Footer/Controls Hint */}
        {gameState === GameState.PLAYING && (
            <div className="mt-4 text-center text-slate-400 text-sm font-medium animate-pulse">
                &larr; Slide to {gameMode === GameMode.CLASSIC ? 'Catch' : gameMode === GameMode.MONEY_RAIN ? 'Collect' : 'Hunt'} &rarr;
            </div>
        )}
      </div>
    </div>
  );
};

export default App;