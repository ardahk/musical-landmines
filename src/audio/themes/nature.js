const nature = {
  key: 'nature',
  name: 'Nature',
  emoji: '🌿',
  description: 'Birds, wind, and rustling tension',
  colorAccent: '#4ade80',
  scale: [0, 2, 4, 7, 9],
  rootNote: 'G3',
  proximity: {
    0: {
      a: { engine: 'fm', oscillator: 'sine', note: 'A5', release: '16n', envelope: { attack: 0.002, decay: 0.16, sustain: 0, release: 0.08 } },
      b: { engine: 'synth', oscillator: 'triangle', note: 'C6', release: '16n', envelope: { attack: 0.004, decay: 0.15, sustain: 0, release: 0.08 } },
    },
    1: {
      a: { engine: 'noise', noiseType: 'pink', release: '8n', envelope: { attack: 0.003, decay: 0.2, sustain: 0.04, release: 0.12 }, effects: [{ type: 'filter', frequency: 1200, filterType: 'bandpass' }] },
      b: { engine: 'noise', noiseType: 'brown', release: '8n', envelope: { attack: 0.01, decay: 0.2, sustain: 0.05, release: 0.12 }, effects: [{ type: 'filter', frequency: 900, filterType: 'bandpass' }] },
    },
    2: {
      a: { engine: 'synth', oscillator: 'triangle', note: 'E4', release: '8n', envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.08 } },
      b: { engine: 'am', oscillator: 'triangle', note: 'D4', release: '8n', envelope: { attack: 0.01, decay: 0.18, sustain: 0.04, release: 0.1 } },
    },
    3: {
      a: { engine: 'am', oscillator: 'sine', note: 'B2', release: '4n', envelope: { attack: 0.03, decay: 0.26, sustain: 0.15, release: 0.2 }, effects: [{ type: 'reverb', wet: 0.25, decay: 1.8 }] },
      b: { engine: 'synth', oscillator: 'triangle', note: 'A2', release: '4n', envelope: { attack: 0.02, decay: 0.25, sustain: 0.15, release: 0.2 }, effects: [{ type: 'reverb', wet: 0.3, decay: 2 }] },
    },
    4: {
      a: { engine: 'noise', noiseType: 'white', release: '4n', envelope: { attack: 0.002, decay: 0.28, sustain: 0.08, release: 0.18 }, effects: [{ type: 'distortion', amount: 0.45 }] },
      b: { engine: 'duo', oscillator: 'sawtooth', note: 'G3', release: '4n', envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.2 } },
    },
  },
  explosion: { engine: 'noise', noiseType: 'white', release: '8n', envelope: { attack: 0.001, decay: 0.26, sustain: 0.02, release: 0.16 }, effects: [{ type: 'distortion', amount: 0.3 }] },
  success: { engine: 'synth', oscillator: 'triangle', note: 'A5', release: '4n', envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.35 }, effects: [{ type: 'reverb', wet: 0.3, decay: 2.2 }] },
  roundComplete: { engine: 'fm', oscillator: 'sine', note: 'F5', release: '8n', envelope: { attack: 0.01, decay: 0.2, sustain: 0.14, release: 0.3 } },
}

export default nature
