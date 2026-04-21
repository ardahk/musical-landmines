const horror = {
  key: 'horror',
  name: 'Horror',
  emoji: '🩸',
  description: 'Whispers, dread, and scraping dissonance',
  colorAccent: '#f87171',
  proximity: {
    0: {
      a: { engine: 'synth', oscillator: 'sine', note: 'A4', release: '8n', envelope: { attack: 0.03, decay: 0.2, sustain: 0.02, release: 0.25 }, effects: [{ type: 'reverb', wet: 0.45, decay: 2.5 }] },
      b: { engine: 'synth', oscillator: 'sine', note: 'G#4', release: '8n', envelope: { attack: 0.03, decay: 0.2, sustain: 0.02, release: 0.25 }, effects: [{ type: 'reverb', wet: 0.48, decay: 2.8 }] },
    },
    1: {
      a: { engine: 'triangle', oscillator: 'triangle', note: 'E4', release: '8n', envelope: { attack: 0.01, decay: 0.25, sustain: 0.06, release: 0.2 } },
      b: { engine: 'synth', oscillator: 'triangle', note: 'D#4', release: '8n', envelope: { attack: 0.01, decay: 0.24, sustain: 0.06, release: 0.2 } },
    },
    2: {
      a: { engine: 'am', oscillator: 'sine', note: 'C3', release: '4n', envelope: { attack: 0.02, decay: 0.26, sustain: 0.16, release: 0.2 } },
      b: { engine: 'am', oscillator: 'triangle', note: 'B2', release: '4n', envelope: { attack: 0.02, decay: 0.28, sustain: 0.18, release: 0.2 } },
    },
    3: {
      a: { engine: 'synth', oscillator: 'sawtooth', note: 'G3', release: '2n', envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.24 }, effects: [{ type: 'reverb', wet: 0.4, decay: 3 }, { type: 'distortion', amount: 0.25 }] },
      b: { engine: 'fm', oscillator: 'sawtooth', note: 'F#3', release: '2n', envelope: { attack: 0.02, decay: 0.32, sustain: 0.2, release: 0.24 }, effects: [{ type: 'reverb', wet: 0.4, decay: 2.8 }, { type: 'distortion', amount: 0.3 }] },
    },
    4: {
      a: { engine: 'duo', oscillator: 'square', note: 'C4', release: '2n', envelope: { attack: 0.01, decay: 0.34, sustain: 0.26, release: 0.26 }, effects: [{ type: 'distortion', amount: 0.6 }] },
      b: { engine: 'duo', oscillator: 'sawtooth', note: 'B3', release: '2n', envelope: { attack: 0.01, decay: 0.34, sustain: 0.26, release: 0.26 }, effects: [{ type: 'distortion', amount: 0.65 }] },
    },
  },
  explosion: { engine: 'noise', noiseType: 'white', release: '8n', envelope: { attack: 0.001, decay: 0.25, sustain: 0.02, release: 0.18 }, effects: [{ type: 'distortion', amount: 0.7 }] },
  success: { engine: 'fm', oscillator: 'triangle', note: 'F5', release: '4n', envelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.35 }, effects: [{ type: 'reverb', wet: 0.35, decay: 2 }] },
  roundComplete: { engine: 'synth', oscillator: 'triangle', note: 'D5', release: '8n', envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.26 } },
}

export default horror
