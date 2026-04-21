const underwater = {
  key: 'underwater',
  name: 'Underwater',
  emoji: '🌊',
  description: 'Pressure drones and liquid echoes',
  colorAccent: '#38bdf8',
  proximity: {
    0: {
      a: { engine: 'synth', oscillator: 'sine', note: 'D5', release: '16n', envelope: { attack: 0.003, decay: 0.16, sustain: 0, release: 0.1 }, effects: [{ type: 'chorus', frequency: 1.5, delayTime: 2.2, depth: 0.2, wet: 0.3 }] },
      b: { engine: 'synth', oscillator: 'sine', note: 'F5', release: '16n', envelope: { attack: 0.004, decay: 0.16, sustain: 0, release: 0.1 }, effects: [{ type: 'chorus', frequency: 1.2, delayTime: 2.6, depth: 0.2, wet: 0.25 }] },
    },
    1: {
      a: { engine: 'am', oscillator: 'triangle', note: 'C4', release: '8n', envelope: { attack: 0.02, decay: 0.2, sustain: 0.08, release: 0.15 } },
      b: { engine: 'synth', oscillator: 'triangle', note: 'B3', release: '8n', envelope: { attack: 0.02, decay: 0.22, sustain: 0.08, release: 0.16 } },
    },
    2: {
      a: { engine: 'fm', oscillator: 'sine', note: 'A3', release: '4n', envelope: { attack: 0.08, decay: 0.25, sustain: 0.2, release: 0.25 }, effects: [{ type: 'reverb', wet: 0.35, decay: 2.6 }] },
      b: { engine: 'fm', oscillator: 'triangle', note: 'G3', release: '4n', envelope: { attack: 0.07, decay: 0.26, sustain: 0.2, release: 0.25 }, effects: [{ type: 'reverb', wet: 0.32, decay: 2.4 }] },
    },
    3: {
      a: { engine: 'duo', oscillator: 'sawtooth', note: 'F2', release: '2n', envelope: { attack: 0.05, decay: 0.32, sustain: 0.3, release: 0.25 }, effects: [{ type: 'reverb', wet: 0.4, decay: 3.2 }] },
      b: { engine: 'am', oscillator: 'sine', note: 'E2', release: '2n', envelope: { attack: 0.05, decay: 0.3, sustain: 0.25, release: 0.28 }, effects: [{ type: 'reverb', wet: 0.4, decay: 3 }] },
    },
    4: {
      a: { engine: 'duo', oscillator: 'sine', note: 'B4', release: '2n', envelope: { attack: 0.02, decay: 0.36, sustain: 0.18, release: 0.3 }, effects: [{ type: 'distortion', amount: 0.4 }] },
      b: { engine: 'fm', oscillator: 'square', note: 'C5', release: '2n', envelope: { attack: 0.01, decay: 0.36, sustain: 0.2, release: 0.3 }, effects: [{ type: 'distortion', amount: 0.45 }] },
    },
  },
  explosion: { engine: 'noise', noiseType: 'brown', release: '8n', envelope: { attack: 0.001, decay: 0.3, sustain: 0.04, release: 0.2 }, effects: [{ type: 'filter', frequency: 280, filterType: 'lowpass' }] },
  success: { engine: 'fm', oscillator: 'sine', note: 'E5', release: '4n', envelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.45 }, effects: [{ type: 'chorus', frequency: 1.2, delayTime: 2, depth: 0.25, wet: 0.2 }] },
  roundComplete: { engine: 'synth', oscillator: 'triangle', note: 'D5', release: '8n', envelope: { attack: 0.02, decay: 0.2, sustain: 0.15, release: 0.3 } },
}

export default underwater
