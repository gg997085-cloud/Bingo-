
let audioCtx: AudioContext | null = null;
let bgMusicNode: GainNode | null = null;
let isPlaying = false;

export const playSound = (type: 'pop' | 'click' | 'win' | 'loss') => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.value = 0.1;

  const playOsc = (freq: number, startTime: number, duration: number, vol: number, type: OscillatorType = 'sine') => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(vol, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  switch (type) {
    case 'pop':
      playOsc(150, audioCtx.currentTime, 0.2, 0.5, 'sine');
      playOsc(300, audioCtx.currentTime, 0.1, 0.2, 'sine');
      break;
    case 'click':
      playOsc(800, audioCtx.currentTime, 0.05, 0.3, 'square');
      playOsc(400, audioCtx.currentTime + 0.02, 0.05, 0.2, 'sine');
      break;
    case 'win':
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        playOsc(f, audioCtx.currentTime + (i * 0.1), 0.8, 0.4, 'triangle');
      });
      break;
    case 'loss':
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      g.gain.setValueAtTime(0.3, now);
      g.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      osc.stop(now + 0.5);
      break;
  }
};

export const startBackgroundMusic = () => {
  if (isPlaying) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  bgMusicNode = audioCtx.createGain();
  bgMusicNode.gain.value = 0.03;
  bgMusicNode.connect(audioCtx.destination);
  
  isPlaying = true;
  const tempo = 120; // BPM
  const secondsPerBeat = 60 / tempo;

  const playBeat = (time: number) => {
    if (!isPlaying || !audioCtx) return;

    // Subtle Kick
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    g.gain.setValueAtTime(0.5, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(g);
    g.connect(bgMusicNode!);
    osc.start(time);
    osc.stop(time + 0.1);

    // Subtle Hat on off-beats
    const noise = audioCtx.createBufferSource();
    const bufferSize = audioCtx.sampleRate * 0.05;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.05, time + secondsPerBeat / 2);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + secondsPerBeat / 2 + 0.05);
    noise.connect(noiseGain);
    noiseGain.connect(bgMusicNode!);
    noise.start(time + secondsPerBeat / 2);

    // Schedule next beat
    const nextTime = time + secondsPerBeat;
    setTimeout(() => playBeat(nextTime), secondsPerBeat * 1000);
  };

  playBeat(audioCtx.currentTime);
};

export const stopBackgroundMusic = () => {
  isPlaying = false;
  if (bgMusicNode && audioCtx) {
    bgMusicNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    setTimeout(() => {
        bgMusicNode?.disconnect();
        bgMusicNode = null;
    }, 600);
  }
};
