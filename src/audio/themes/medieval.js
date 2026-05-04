const medieval = {
  key: 'medieval',
  name: 'Medieval',
  emoji: '🛡️',
  description: 'Lute plucks and ominous halls',
  colorAccent: '#fbbf24',
  scale: [0, 2, 3, 5, 7, 8, 10],
  rootNote: 'D3',
  proximity: {
    0: {
      a: { engine: 'fm', oscillator: 'triangle', note: 'E5', release: '16n', envelope: { attack: 0.002, decay: 0.14, sustain: 0, release: 0.08 } },
      b: { engine: 'fm', oscillator: 'triangle', note: 'G5', release: '16n', envelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.08 } },
    },
    1: {
      a: { engine: 'synth', oscillator: 'triangle', note: 'C4', release: '8n', envelope: { attack: 0.004, decay: 0.2, sustain: 0.06, release: 0.1 } },
      b: { engine: 'am', oscillator: 'triangle', note: 'B3', release: '8n', envelope: { attack: 0.004, decay: 0.22, sustain: 0.06, release: 0.1 } },
    },
    2: {
      a: { engine: 'synth', oscillator: 'sine', note: 'D4', release: '4n', envelope: { attack: 0.01, decay: 0.26, sustain: 0.1, release: 0.24 }, effects: [{ type: 'reverb', wet: 0.28, decay: 2.3 }] },
      b: { engine: 'synth', oscillator: 'sine', note: 'C4', release: '4n', envelope: { attack: 0.01, decay: 0.26, sustain: 0.1, release: 0.24 }, effects: [{ type: 'reverb', wet: 0.3, decay: 2.5 }] },
    },
    3: {
      a: { engine: 'duo', oscillator: 'sawtooth', note: 'A2', release: '2n', envelope: { attack: 0.03, decay: 0.35, sustain: 0.2, release: 0.25 } },
      b: { engine: 'am', oscillator: 'square', note: 'G2', release: '2n', envelope: { attack: 0.03, decay: 0.35, sustain: 0.2, release: 0.25 } },
    },
    4: {
      a: { engine: 'duo', oscillator: 'square', note: 'F2', release: '2n', envelope: { attack: 0.02, decay: 0.36, sustain: 0.25, release: 0.26 }, effects: [{ type: 'distortion', amount: 0.35 }] },
      b: { engine: 'duo', oscillator: 'sawtooth', note: 'E2', release: '2n', envelope: { attack: 0.02, decay: 0.36, sustain: 0.25, release: 0.26 }, effects: [{ type: 'distortion', amount: 0.38 }] },
    },
  },
  explosion: { engine: 'noise', noiseType: 'brown', release: '8n', envelope: { attack: 0.001, decay: 0.24, sustain: 0.02, release: 0.18 }, effects: [{ type: 'filter', frequency: 300, filterType: 'lowpass' }] },
  success: { engine: 'fm', oscillator: 'triangle', note: 'A5', release: '4n', envelope: { attack: 0.01, decay: 0.22, sustain: 0.2, release: 0.4 } },
  roundComplete: { engine: 'synth', oscillator: 'triangle', note: 'G5', release: '8n', envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 } },
}

export default medieval
