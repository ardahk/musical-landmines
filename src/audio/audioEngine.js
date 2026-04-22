import * as Tone from 'tone'

let currentTheme = null
let initialized = false
let masterChain = null
let limiter = null
let analyser = null
const activeVoices = []
let lastHoverAt = 0
const MAX_POLYPHONY = 4
let lastAudioError = null

const DEFAULT_SCALE = [0, 2, 4, 5, 7, 9, 11]
const DEFAULT_ROOT_NOTE = 'C3'

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function createEffect(effectConfig) {
  switch (effectConfig.type) {
    case 'reverb':
      return new Tone.Reverb({ decay: effectConfig.decay ?? 1.5, wet: effectConfig.wet ?? 0.2 })
    case 'distortion':
      return new Tone.Distortion(effectConfig.amount ?? 0.2)
    case 'chorus': {
      const chorus = new Tone.Chorus({
        frequency: effectConfig.frequency ?? 1.5,
        delayTime: effectConfig.delayTime ?? 2.5,
        depth: effectConfig.depth ?? 0.2,
        wet: effectConfig.wet ?? 0.2,
      })
      chorus.start()
      return chorus
    }
    case 'filter':
      return new Tone.Filter({ frequency: effectConfig.frequency ?? 1000, type: effectConfig.filterType ?? 'lowpass' })
    case 'bitcrusher':
      return new Tone.BitCrusher({ bits: effectConfig.bits ?? 4, wet: effectConfig.wet ?? 0.3 })
    case 'tremolo': {
      const tremolo = new Tone.Tremolo({ frequency: effectConfig.frequency ?? 6, depth: effectConfig.depth ?? 0.5 })
      tremolo.start()
      return tremolo
    }
    default:
      return null
  }
}

function createSynth(config) {
  const common = {
    oscillator: config.oscillator ? { type: config.oscillator } : undefined,
    envelope: config.envelope,
  }

  switch (config.engine) {
    case 'fm':
      return new Tone.FMSynth(common)
    case 'am':
      return new Tone.AMSynth(common)
    case 'duo':
      return new Tone.DuoSynth(common)
    case 'noise':
      return new Tone.NoiseSynth({ noise: { type: config.noiseType ?? 'white' }, envelope: config.envelope })
    case 'triangle':
    case 'synth':
    default:
      return new Tone.Synth(common)
  }
}

function disposeVoice(entry) {
  if (!entry) {
    return
  }
  clearTimeout(entry.timeoutId)
  entry.nodes.forEach((node) => {
    try {
      node.dispose()
    } catch {
      // ignore
    }
  })
  const index = activeVoices.indexOf(entry)
  if (index >= 0) {
    activeVoices.splice(index, 1)
  }
}

function keepPolyphonyBudget() {
  while (activeVoices.length >= MAX_POLYPHONY) {
    disposeVoice(activeVoices[0])
  }
}

function getLevel(adjacentMines) {
  if (adjacentMines <= 0) return 0
  if (adjacentMines <= 2) return 1
  if (adjacentMines <= 4) return 2
  if (adjacentMines <= 6) return 3
  return 4
}

// Timbre vector: proximity is expressed through added effects + detune, not pitch.
function buildTimbreEffects(level) {
  switch (level) {
    case 0:
      return []
    case 1:
      return [{ type: 'chorus', frequency: 2.2, depth: 0.25, wet: 0.25 }]
    case 2:
      return [{ type: 'filter', frequency: 900, filterType: 'bandpass' }, { type: 'tremolo', frequency: 5, depth: 0.4 }]
    case 3:
      return [{ type: 'distortion', amount: 0.3 }, { type: 'filter', frequency: 1400, filterType: 'lowpass' }]
    case 4:
    default:
      return [{ type: 'distortion', amount: 0.55 }, { type: 'bitcrusher', bits: 3, wet: 0.45 }]
  }
}

function detuneForLevel(level) {
  // Adds a subtle dissonance as proximity rises; returns cents.
  switch (level) {
    case 0: return 0
    case 1: return 0
    case 2: return -8
    case 3: return -18
    case 4:
    default: return -30
  }
}

// Level 0 = root (safe/low), level 4 = octave above (danger/high)
const PROXIMITY_DEGREES = [0, 2, 4, 5, 8]

function proximityPitch(adjacentMines, theme) {
  const scale = theme?.scale ?? DEFAULT_SCALE
  const rootNote = theme?.rootNote ?? DEFAULT_ROOT_NOTE
  let rootMidi
  try {
    rootMidi = Tone.Frequency(rootNote).toMidi()
  } catch {
    rootMidi = Tone.Frequency(DEFAULT_ROOT_NOTE).toMidi()
  }
  const level = getLevel(adjacentMines)
  const degreeIndex = PROXIMITY_DEGREES[level]
  const octaveBonus = degreeIndex >= scale.length ? 12 : 0
  const semitone = scale[degreeIndex % scale.length]
  return Tone.Frequency(rootMidi + semitone + octaveBonus, 'midi').toNote()
}

function computePan({ x, gridSize }) {
  if (!gridSize || gridSize <= 1) return 0
  return ((x / (gridSize - 1)) - 0.5) * 1.2
}

function playSynth(config, { volumeDb = 0, note, extraEffects = [], detuneCents = 0, pan = 0 } = {}) {
  if (!initialized || !config) {
    return
  }

  keepPolyphonyBudget()

  const synth = createSynth(config)
  const gain = new Tone.Gain(1)
  const volume = new Tone.Volume(volumeDb)
  const panner = new Tone.Panner(pan)
  const themeEffects = (config.effects ?? []).map(createEffect).filter(Boolean)
  const timbreEffects = extraEffects.map(createEffect).filter(Boolean)
  const effects = [...themeEffects, ...timbreEffects]

  if (synth.detune && detuneCents) {
    try {
      synth.detune.value = detuneCents
    } catch {
      // ignore engines that don't expose detune
    }
  }

  const chain = [synth, ...effects, volume, gain, panner, masterChain]
  for (let i = 0; i < chain.length - 1; i += 1) {
    chain[i].connect(chain[i + 1])
  }

  if (config.engine === 'noise') {
    synth.triggerAttackRelease(config.release ?? '8n')
  } else {
    synth.triggerAttackRelease(note ?? config.note ?? 'C4', config.release ?? '8n')
  }

  const nodes = [synth, volume, gain, panner, ...effects]
  const timeoutId = window.setTimeout(() => {
    disposeVoice(entry)
  }, 1500)
  const entry = { nodes, timeoutId }
  activeVoices.push(entry)
}

export async function initializeAudio() {
  if (initialized) {
    return true
  }

  try {
    lastAudioError = null
    await Tone.start()
    if (Tone.context.state !== 'running') {
      await Tone.context.resume()
    }

    limiter = new Tone.Limiter(-3)
    analyser = new Tone.Analyser('fft', 64)
    masterChain = new Tone.Volume(-12)
    masterChain.connect(analyser)
    analyser.connect(limiter)
    limiter.toDestination()
    initialized = true
    return true
  } catch (error) {
    lastAudioError = error instanceof Error ? error.message : String(error)
    return false
  }
}

export function getLastAudioError() {
  return lastAudioError
}

export function getAnalyser() {
  return analyser
}

export function setTheme(themeConfig) {
  currentTheme = themeConfig
}

function getBaseVoice(theme) {
  return theme?.baseVoice ?? theme?.proximity?.[0]?.a ?? null
}

export function playTileSound(tile, { volumeDb = 0 } = {}) {
  const now = nowMs()
  if (now - lastHoverAt < 80) {
    return
  }
  lastHoverAt = now

  if (!currentTheme || !tile) {
    return
  }

  const base = getBaseVoice(currentTheme)
  if (!base) return

  const level = getLevel(tile.adjacentMines)
  const note = proximityPitch(tile.adjacentMines, currentTheme)
  const pan = computePan(tile)
  const extraEffects = buildTimbreEffects(level)
  const detuneCents = detuneForLevel(level)

  playSynth(base, { volumeDb, note, extraEffects, detuneCents, pan })
}

// Kept for backwards compatibility; delegates to tile-based sound when possible.
export function playProximitySound(adjacentMines, _variant, volumeDb = 0) {
  void _variant
  const now = nowMs()
  if (now - lastHoverAt < 80) {
    return
  }
  lastHoverAt = now

  if (!currentTheme) return
  const base = getBaseVoice(currentTheme)
  if (!base) return

  const level = getLevel(adjacentMines)
  playSynth(base, {
    volumeDb,
    extraEffects: buildTimbreEffects(level),
    detuneCents: detuneForLevel(level),
  })
}

export function playMineExplosion() {
  if (!currentTheme) return
  playSynth(currentTheme.explosion, { volumeDb: -6 })
}

export function playSuccess() {
  if (!currentTheme) return
  playSynth(currentTheme.success, { volumeDb: -15 })
}

export function playRoundComplete() {
  if (!currentTheme) return
  playSynth(currentTheme.roundComplete, { volumeDb: -10 })
}
