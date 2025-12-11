
// Simple synthesizer using Web Audio API to avoid external asset dependencies

let audioCtx: AudioContext | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const createOscillator = (type: OscillatorType, freq: number, duration: number, volume: number = 0.1) => {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const playClick = () => {
  createOscillator('sine', 800, 0.1, 0.05);
};

export const playWallBounce = () => {
  // Dull thud
  createOscillator('triangle', 200, 0.1, 0.1);
};

export const playPaddleBounce = () => {
  // Cheerful chime (scoring)
  // Play a root and a fifth for a harmonious sound
  createOscillator('sine', 523.25, 0.3, 0.1); // C5
  if (!audioCtx) return;
  
  // Secondary harmonic
  setTimeout(() => {
     if(audioCtx) {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
        gain2.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.3);
     }
  }, 50);
};

export const playGameOver = () => {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.5);

  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5);
};

export const playShoot = () => {
  if (!audioCtx) return;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};

export const playCoin = () => {
    if (!audioCtx) return;
    // High pitched ding
    createOscillator('sine', 1200, 0.1, 0.05);
    setTimeout(() => {
       createOscillator('sine', 1600, 0.2, 0.05); 
    }, 50);
};