const scifi = {
  key: 'scifi',
  name: 'Sci-Fi',
  emoji: '🚀',
  description: 'Sonar pings and alien signals',
  colorAccent: '#00f5ff',
  scale: [0, 2, 3, 5, 7, 8, 10],
  rootNote: 'C3',
  proximity: {
    0: {
      a: { engine: 'synth', oscillator: 'sine', note: 'C5', release: '8n', envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.1 }, effects: [{ type: 'reverb', wet: 0.25, decay: 1.4 }] },
      b: { engine: 'synth', oscillator: 'sine', note: 'E5', release: '8n', envelope: { attack: 0.01, decay: 0.18, sustain: 0, release: 0.08 }, effects: [{ type: 'reverb', wet: 0.18, decay: 1.1 }] },
    },
    1: {
      a: { engine: 'am', oscillator: 'triangle', note: 'G4', release: '8n', envelope: { attack: 0.01, decay: 0.22, sustain: 0, release: 0.1 } },
      b: { engine: 'fm', oscillator: 'triangle', note: 'F4', release: '8n', envelope: { attack: 0.012, decay: 0.2, sustain: 0, release: 0.1 } },
    },
    2: {
      a: { engine: 'fm', oscillator: 'sine', note: 'E4', release: '8n', envelope: { attack: 0.02, decay: 0.25, sustain: 0, release: 0.12 }, effects: [{ type: 'distortion', amount: 0.2 }] },
      b: { engine: 'duo', oscillator: 'sawtooth', note: 'D#4', release: '8n', envelope: { attack: 0.02, decay: 0.3, sustain: 0, release: 0.14 } },
    },
    3: {
      a: { engine: 'synth', oscillator: 'sawtooth', note: 'A3', release: '4n', envelope: { attack: 0.03, decay: 0.25, sustain: 0.12, release: 0.2 }, effects: [{ type: 'distortion', amount: 0.35 }] },
      b: { engine: 'am', oscillator: 'square', note: 'G3', release: '4n', envelope: { attack: 0.02, decay: 0.3, sustain: 0.18, release: 0.18 } },
    },
    4: {
      a: { engine: 'duo', oscillator: 'square', note: 'A3', release: '2n', envelope: { attack: 0.01, decay: 0.35, sustain: 0.2, release: 0.28 }, effects: [{ type: 'distortion', amount: 0.5 }] },
      b: { engine: 'fm', oscillator: 'square', note: 'A#3', release: '2n', envelope: { attack: 0.01, decay: 0.36, sustain: 0.22, release: 0.28 }, effects: [{ type: 'distortion', amount: 0.55 }] },
    },
  },
  explosion: { engine: 'noise', noiseType: 'white', release: '8n', envelope: { attack: 0.001, decay: 0.24, sustain: 0, release: 0.14 }, effects: [{ type: 'filter', frequency: 420, filterType: 'lowpass' }] },
  success: { engine: 'fm', oscillator: 'sine', note: 'G5', release: '4n', envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.4 }, effects: [{ type: 'reverb', wet: 0.35, decay: 2 }] },
  roundComplete: { engine: 'synth', oscillator: 'triangle', note: 'E5', release: '8n', envelope: { attack: 0.01, decay: 0.22, sustain: 0.1, release: 0.3 }, effects: [{ type: 'reverb', wet: 0.2, decay: 1.8 }] },
}

export default scifi
