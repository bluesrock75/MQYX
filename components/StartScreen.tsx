
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { COLORS } from '../constants';
import { initAudio, playClick } from '../services/soundService';
import { GameMode } from '../types';

interface StartScreenProps {
  onStart: (mode: GameMode) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [copyFeedback, setCopyFeedback] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.CLASSIC);

  useEffect(() => {
    // Generate QR code for current URL
    QRCode.toDataURL(window.location.href, {
      color: {
        dark: COLORS.TEXT,
        light: '#FFFFFF00' // Transparent background
      },
      margin: 1,
      width: 200
    })
    .then(url => setQrDataUrl(url))
    .catch(err => console.error("QR Error", err));
  }, []);

  const handleStart = () => {
    initAudio(); // Initialize Web Audio Context
    playClick();
    onStart(selectedMode);
  };

  const handleToggleQR = () => {
    playClick();
    setShowQR(!showQR);
  };

  const handleShare = async () => {
    playClick();
    const text = "FYI: I'm circling back on this critical initiative called Synergy Bounce. Please review and contribute.";
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Synergy Bounce Invitation',
          text: text,
          url: url
        });
      } catch (err) { }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopyFeedback('Link Copied!');
        setTimeout(() => setCopyFeedback(''), 2000);
      } catch (err) { }
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-4 text-center overflow-y-auto">
      
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2">
         {/* QR Toggle */}
         <button 
            onClick={handleToggleQR}
            className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-full border border-slate-100 hover:shadow-sm transition-all"
            title="Show Mobile QR Code"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 8V4h6v4H6zM6 20v-4h6v4H6zM6 14v-4h6v4H6zM18 8V4h2v4h-2z" />
            </svg>
         </button>
         
         {/* Share Button */}
         <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-semibold bg-slate-50 px-4 py-2 rounded-full border border-slate-100 hover:bg-white hover:shadow-sm"
         >
            {copyFeedback ? (
               <span className="text-green-500 text-sm font-bold">{copyFeedback}</span>
            ) : (
               <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm">Invite Colleagues</span>
               </>
            )}
         </button>
      </div>

      {/* QR Code Modal/Popover */}
      {showQR && (
          <div className="absolute top-20 right-4 z-50 bg-white p-4 rounded-xl shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-200">
              <h3 className="text-sm font-bold text-slate-500 mb-2">Scan to Play on Mobile</h3>
              {qrDataUrl && <img src={qrDataUrl} alt="Scan to Play" className="w-40 h-40 mx-auto" />}
          </div>
      )}

      {/* CSS Logo Recreation based on user image */}
      <div className="relative w-48 h-36 mb-6 transform hover:scale-105 transition-transform duration-500">
         <div 
            className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-[80px] rounded-tl-[40px] z-10"
            style={{ backgroundColor: COLORS.GREEN_SHAPE }}
         ></div>
         <div 
            className="absolute bottom-0 right-0 w-28 h-36 rounded-tr-[80px] rounded-tl-[60px] z-0"
            style={{ backgroundColor: COLORS.BLUE_SHAPE }}
         ></div>
         <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full shadow-lg z-20 animate-bounce"
            style={{ backgroundColor: COLORS.RED_DOT }}
         ></div>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tighter">
        <span style={{color: COLORS.GREEN_SHAPE}}>Synergy</span>
        <span style={{color: COLORS.BLUE_SHAPE}}>Bounce</span>
      </h1>

      {/* Mode Selection */}
      <div className="flex gap-4 mb-8 w-full max-w-2xl px-4 overflow-x-auto pb-2">
          <button 
             onClick={() => { playClick(); setSelectedMode(GameMode.CLASSIC); }}
             className={`flex-1 min-w-[120px] p-4 rounded-xl border-2 transition-all ${selectedMode === GameMode.CLASSIC ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'}`}
          >
              <div className="text-2xl mb-2">🔴</div>
              <div className="font-bold text-slate-800">Classic</div>
              <div className="text-xs text-slate-500">Bounce the Idea</div>
          </button>

          <button 
             onClick={() => { playClick(); setSelectedMode(GameMode.SHOOTER); }}
             className={`flex-1 min-w-[120px] p-4 rounded-xl border-2 transition-all ${selectedMode === GameMode.SHOOTER ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-slate-200 hover:border-green-300'}`}
          >
              <div className="text-2xl mb-2">🔫</div>
              <div className="font-bold text-slate-800">Cash Hunter</div>
              <div className="text-xs text-slate-500">Shoot the Capital</div>
          </button>

          <button 
             onClick={() => { playClick(); setSelectedMode(GameMode.MONEY_RAIN); }}
             className={`flex-1 min-w-[120px] p-4 rounded-xl border-2 transition-all ${selectedMode === GameMode.MONEY_RAIN ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' : 'border-slate-200 hover:border-yellow-300'}`}
          >
              <div className="text-2xl mb-2">💸</div>
              <div className="font-bold text-slate-800">Capital Rain</div>
              <div className="text-xs text-slate-500">60s Money Grab</div>
          </button>
      </div>

      <button
        onClick={handleStart}
        className="px-12 py-5 rounded-full text-white font-bold text-2xl shadow-blue-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:translate-y-0"
        style={{ 
            backgroundColor: 
                selectedMode === GameMode.CLASSIC ? COLORS.BLUE_SHAPE : 
                selectedMode === GameMode.SHOOTER ? COLORS.GREEN_SHAPE : COLORS.GOLD 
        }}
      >
        {selectedMode === GameMode.CLASSIC ? 'Start Bouncing' : selectedMode === GameMode.SHOOTER ? 'Start Hunting' : 'Collect Bonus'}
      </button>
      
      <p className="mt-8 text-sm text-slate-400">Use Arrow Keys, Mouse, or Touch to move.</p>
    </div>
  );
};

export default StartScreen;