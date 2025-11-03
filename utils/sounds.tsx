// A simple sound utility using the Web Audio API to avoid external dependencies.

// Create a single AudioContext to be reused. It's best practice to create it
// only after a user interaction, but for simplicity, we'll create it on first use.
let audioCtx: AudioContext | null = null;
let isMuted = false;

const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
};

export const toggleMute = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    isMuted = !isMuted;
    if (isMuted && ctx.state === 'running') {
        ctx.suspend();
    } else if (!isMuted && ctx.state === 'suspended') {
        ctx.resume();
    }
};

// A function to play a sound with specific parameters
const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', vol: number = 0.5) => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;

    // Resume context if it was suspended, often required by browser policies
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
};

export const playSound = (soundType: 'click' | 'success' | 'failure' | 'win' | 'swoosh' | 'thud') => {
    switch (soundType) {
        case 'click':
            playTone(200, 0.1, 'triangle', 0.3);
            break;
        case 'success':
            playTone(440, 0.1, 'sine', 0.5);
            setTimeout(() => playTone(587.33, 0.15, 'sine', 0.5), 100);
            break;
        case 'failure':
            playTone(220, 0.2, 'sawtooth', 0.4);
            setTimeout(() => playTone(164.81, 0.3, 'sawtooth', 0.4), 150);
            break;
        case 'win':
             playTone(523.25, 0.1, 'sine', 0.5); // C5
             setTimeout(() => playTone(659.25, 0.1, 'sine', 0.5), 100); // E5
             setTimeout(() => playTone(783.99, 0.1, 'sine', 0.5), 200); // G5
             setTimeout(() => playTone(1046.50, 0.2, 'sine', 0.5), 300); // C6
            break;
        case 'swoosh':
            const ctx = getAudioContext();
            if(!ctx || isMuted) return;
            if (ctx.state === 'suspended') ctx.resume();
            
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.3);
            break;
        case 'thud':
            playTone(100, 0.15, 'square', 0.6);
            break;
    }
};
