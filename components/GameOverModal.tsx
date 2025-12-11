
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { generateGameOverMessage } from '../services/geminiService';
import { GameMode } from '../types';
import { COLORS } from '../constants';
import { playClick } from '../services/soundService';

interface GameOverModalProps {
  score: number;
  gameMode: GameMode;
  onRestart: () => void;
  onMainMenu?: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, gameMode, onRestart, onMainMenu }) => {
  const [message, setMessage] = useState<string>('Calculated Performance...');
  const [loading, setLoading] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let mounted = true;
    generateGameOverMessage(score, gameMode).then((msg) => {
        if(mounted) {
            setMessage(msg);
            setLoading(false);
        }
    });
    
    // Generate QR code
    QRCode.toDataURL(window.location.href, {
        color: { dark: COLORS.TEXT, light: '#FFFFFF00' },
        margin: 1,
        width: 200
    }).then(url => {
        if(mounted) setQrDataUrl(url);
    });

    return () => { mounted = false; };
  }, [score, gameMode]);

  const handleToggleQR = () => {
      playClick();
      setShowQR(!showQR);
  };

  const handleRestart = () => {
      playClick();
      onRestart();
  };
  
  const handleMainMenu = () => {
      playClick();
      if(onMainMenu) onMainMenu();
  }

  const handleShare = async () => {
    playClick();
    const text = `Action Item: I leveraged my core competencies to hit a score of ${score} in Synergy Bounce (${gameMode}). Can you optimize this metric?`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Synergy Bounce Performance Review',
          text: text,
          url: url
        });
      } catch (err) {
        // User cancelled or share failed, silently ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopyFeedback('Link Copied to Clipboard!');
        setTimeout(() => setCopyFeedback(''), 2000);
      } catch (err) {
        setCopyFeedback('Failed to copy');
      }
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-bounce-in transform scale-100 transition-all relative">
        
        {/* QR Toggle Button (Top Right) */}
        <button 
           onClick={handleToggleQR}
           className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
           title="Show QR Code"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 8V4h6v4H6zM6 20v-4h6v4H6zM6 14v-4h6v4H6zM18 8V4h2v4h-2z" />
            </svg>
        </button>

        {showQR && (
            <div className="absolute top-12 right-4 z-10 bg-white p-3 rounded-xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
                <img src={qrDataUrl} alt="Scan to Play" className="w-32 h-32" />
                <p className="text-xs text-slate-400 mt-1 font-bold">Scan to Compete</p>
            </div>
        )}

        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
           <div className="w-12 h-12 rounded-full" style={{ backgroundColor: COLORS.RED_DOT }}></div>
        </div>
        
        <h2 className="text-4xl font-black text-slate-800 mb-2">PROJECT CLOSED</h2>
        <p className="text-xl text-slate-500 font-bold mb-6">KPI Achieved: {gameMode === GameMode.MONEY_RAIN ? '$' : ''}{score}</p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 min-h-[100px] flex items-center justify-center flex-col">
            {loading ? (
                 <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                 </div>
            ) : (
                <p className="text-slate-700 italic text-lg leading-relaxed">"{message}"</p>
            )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRestart}
            className="w-full py-4 rounded-xl text-white font-bold text-xl transition-transform active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(to right, ${COLORS.BLUE_SHAPE}, ${COLORS.GREEN_SHAPE})` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Circle Back (Retry)
          </button>
          
          {onMainMenu && (
             <button
                onClick={handleMainMenu}
                className="w-full py-3 rounded-xl bg-white text-slate-700 font-bold text-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border-2 border-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return to HQ (Menu)
              </button>
          )}

          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-200"
          >
             {copyFeedback ? (
               <span className="text-green-600 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                 </svg>
                 {copyFeedback}
               </span>
             ) : (
               <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Delegate to Team (Share)
               </>
             )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;