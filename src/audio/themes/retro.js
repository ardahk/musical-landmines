const retro = {
  key: 'retro',
  name: 'Retro 8-Bit',
  emoji: '🕹️',
  description: 'Chiptune beeps and game-over stabs',
  colorAccent: '#ff9f1c',
  scale: [0, 2, 4, 5, 7, 9, 11],
  rootNote: 'C4',
  proximity: {
    0: {
      a: { engine: 'synth', oscillator: 'square', note: 'C5', release: '16n', envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.06 } },
      b: { engine: 'synth', oscillator: 'square', note: 'E5', release: '16n', envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.06 } },
    },
    1: {
      a: { engine: 'synth', oscillator: 'square', note: 'G4', release: '16n', envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.06 } },
      b: { engine: 'synth', oscillator: 'square', note: 'F4', release: '16n', envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.06 } },
    },
    2: {
      a: { engine: 'fm', oscillator: 'square', note: 'E4', release: '8n', envelope: { attack: 0.002, decay: 0.18, sustain: 0.05, release: 0.08 } },
      b: { engine: 'fm', oscillator: 'square', note: 'D4', release: '8n', envelope: { attack: 0.002, decay: 0.18, sustain: 0.05, release: 0.08 } },
    },
    3: {
      a: { engine: 'synth', oscillator: 'square', note: 'A3', release: '8n', envelope: { attack: 0.002, decay: 0.22, sustain: 0.1, release: 0.08 }, effects: [{ type: 'bitcrusher', bits: 5, wet: 0.3 }] },
      b: { engine: 'synth', oscillator: 'square', note: 'G3', release: '8n', envelope: { attack: 0.002, decay: 0.22, sustain: 0.1, release: 0.08 }, effects: [{ type: 'bitcrusher', bits: 4, wet: 0.35 }] },
    },
    4: {
      a: { engine: 'duo', oscillator: 'square', note: 'F3', release: '4n', envelope: { attack: 0.002, decay: 0.26, sustain: 0.16, release: 0.1 }, effects: [{ type: 'bitcrusher', bits: 4, wet: 0.4 }] },
      b: { engine: 'duo', oscillator: 'square', note: 'F#3', release: '4n', envelope: { attack: 0.002, decay: 0.26, sustain: 0.16, release: 0.1 }, effects: [{ type: 'bitcrusher', bits: 3, wet: 0.42 }] },
    },
  },
  explosion: { engine: 'noise', noiseType: 'white', release: '16n', envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.08 }, effects: [{ type: 'bitcrusher', bits: 3, wet: 0.7 }] },
  success: { engine: 'synth', oscillator: 'square', note: 'C6', release: '8n', envelope: { attack: 0.002, decay: 0.2, sustain: 0.1, release: 0.1 } },
  roundComplete: { engine: 'synth', oscillator: 'square', note: 'A5', release: '8n', envelope: { attack: 0.002, decay: 0.2, sustain: 0.1, release: 0.1 } },
}

export default retro
