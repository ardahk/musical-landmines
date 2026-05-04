import * as Tone from 'tone'

let currentTheme = null
let initialized = false
let masterChain = null
let limiter = null
let analyser = null
const activeVoices = []
let lastHoverAt = 0
const MAX_POLYPHONY = 8
let musicMode = null
let musicThemeKey = null
let musicMuted = false
let musicBaseVolumeDb = -18
let musicFadeOffsetDb = 0
let musicFadeTimer = null
let musicUserVolumeDb = 0
let sfxUserVolumeDb = 0
const musicTimers = []
const MUSIC_FADE_MS = 420

const DEFAULT_SCALE = [0, 2, 4, 5, 7, 9, 11]
const DEFAULT_ROOT_NOTE = 'C3'
const DETECTOR_PATTERNS = [
  { pulseCount: 1, intervalMs: 0, volumeDb: -5, duration: '16n', degree: 0, detuneCents: 0 },
  { pulseCount: 2, intervalMs: 120, volumeDb: 1, duration: '16n', degree: 4, detuneCents: -12 },
  { pulseCount: 3, intervalMs: 70, volumeDb: 1, duration: '32n', degree: 7, detuneCents: -28 },
]

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function clearMusicTimers() {
  while (musicTimers.length > 0) {
    window.clearInterval(musicTimers.pop())
  }
}

export function stopMusic() {
  if (musicFadeTimer) {
    window.clearInterval(musicFadeTimer)
    musicFadeTimer = null
  }
  clearMusicTimers()
  musicMode = null
  musicThemeKey = null
  musicFadeOffsetDb = 0
}

export function setMusicMuted(nextMuted) {
  musicMuted = nextMuted
  if (musicMuted) {
    stopMusic()
  }
}

function levelToDb(level) {
  const clamped = Math.max(0, Math.min(200, Number(level) || 0))
  if (clamped <= 100) {
    return -36 + (clamped / 100) * 36
  }
  return ((clamped - 100) / 100) * 14
}

export function setMusicLevel(level) {
  musicUserVolumeDb = levelToDb(level)
}

export function setSfxLevel(level) {
  sfxUserVolumeDb = levelToDb(level)
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

function getClosenessLevel(tile) {
  if (tile?.isMine) return 2
  const adjacentMines = tile?.adjacentMines ?? 0
  if (adjacentMines <= 0) return 0
  if (adjacentMines <= 2) return 1
  return 2
}

// Detector bands are shared across themes so proximity is readable before it is decorative.
function buildTimbreEffects(level) {
  switch (level) {
    case 0:
      return [{ type: 'filter', frequency: 1800, filterType: 'lowpass' }]
    case 1:
      return [{ type: 'filter', frequency: 1150, filterType: 'bandpass' }, { type: 'tremolo', frequency: 7, depth: 0.35 }]
    case 2:
    default:
      return [{ type: 'distortion', amount: 0.42 }, { type: 'filter', frequency: 1650, filterType: 'bandpass' }]
  }
}

function detuneForLevel(level) {
  switch (level) {
    case 0: return 0
    case 1: return -12
    default: return -30
  }
}

function detectorPitch(level, theme) {
  const scale = theme?.scale ?? DEFAULT_SCALE
  const rootNote = theme?.rootNote ?? DEFAULT_ROOT_NOTE
  let rootMidi
  try {
    rootMidi = Tone.Frequency(rootNote).toMidi()
  } catch {
    rootMidi = Tone.Frequency(DEFAULT_ROOT_NOTE).toMidi()
  }
  const degreeIndex = DETECTOR_PATTERNS[level]?.degree ?? 0
  const octaveBonus = degreeIndex >= scale.length ? 12 : 0
  const semitone = scale[degreeIndex % scale.length]
  return Tone.Frequency(rootMidi + semitone + octaveBonus, 'midi').toNote()
}

function noteForDegree(theme, degreeIndex, octaveOffset = 0) {
  const scale = theme?.scale ?? DEFAULT_SCALE
  const rootNote = theme?.rootNote ?? DEFAULT_ROOT_NOTE
  let rootMidi
  try {
    rootMidi = Tone.Frequency(rootNote).toMidi()
  } catch {
    rootMidi = Tone.Frequency(DEFAULT_ROOT_NOTE).toMidi()
  }
  const octaveBonus = degreeIndex >= scale.length ? 12 : 0
  const semitone = scale[degreeIndex % scale.length]
  return Tone.Frequency(rootMidi + semitone + octaveBonus + octaveOffset, 'midi').toNote()
}

function computePan({ x, gridSize }) {
  if (!gridSize || gridSize <= 1) return 0
  return ((x / (gridSize - 1)) - 0.5) * 1.2
}

function playSynth(config, { volumeDb = 0, note, extraEffects = [], detuneCents = 0, pan = 0, release } = {}) {
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
    synth.triggerAttackRelease(release ?? config.release ?? '8n')
  } else {
    synth.triggerAttackRelease(note ?? config.note ?? 'C4', release ?? config.release ?? '8n')
  }

  const nodes = [synth, volume, gain, panner, ...effects]
  const timeoutId = window.setTimeout(() => {
    disposeVoice(entry)
  }, 1500)
  const entry = { nodes, timeoutId }
  activeVoices.push(entry)
}

function fadeMusicOffset({ fromDb, toDb, durationMs = MUSIC_FADE_MS, onComplete }) {
  if (musicFadeTimer) {
    window.clearInterval(musicFadeTimer)
    musicFadeTimer = null
  }

  const startedAt = nowMs()
  musicFadeOffsetDb = fromDb
  musicFadeTimer = window.setInterval(() => {
    const pct = Math.min(1, (nowMs() - startedAt) / durationMs)
    musicFadeOffsetDb = fromDb + ((toDb - fromDb) * pct)
    if (pct >= 1) {
      window.clearInterval(musicFadeTimer)
      musicFadeTimer = null
      onComplete?.()
    }
  }, 30)
}

export async function initializeAudio() {
  if (initialized) {
    return true
  }

  try {
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
  } catch {
    return false
  }
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

function getDetectorVoice(theme, level) {
  if (theme?.detectorVoices?.[level]) {
    return theme.detectorVoices[level]
  }
  const proximityKey = level === 0 ? 0 : level === 1 ? 2 : 4
  return theme?.proximity?.[proximityKey]?.a ?? getBaseVoice(theme)
}

function getMusicVoice(theme, overrides = {}) {
  return {
    engine: overrides.engine ?? 'synth',
    oscillator: overrides.oscillator ?? 'sine',
    release: overrides.release ?? '8n',
    envelope: overrides.envelope ?? { attack: 0.02, decay: 0.18, sustain: 0.12, release: 0.3 },
    effects: overrides.effects ?? theme?.proximity?.[0]?.a?.effects ?? [{ type: 'reverb', wet: 0.18, decay: 1.8 }],
  }
}

function startMusicPattern({ mode, theme, degrees, intervalMs, volumeDb, octaveOffset = 12, voice }) {
  const themeKey = theme?.key ?? 'menu'
  if (!initialized || musicMuted) {
    return
  }

  if (musicMode === mode && musicThemeKey === themeKey) {
    musicBaseVolumeDb = volumeDb
    return
  }

  const startNewPattern = () => {
    clearMusicTimers()
    musicMode = mode
    musicThemeKey = themeKey
    musicBaseVolumeDb = volumeDb
    musicFadeOffsetDb = -18

    let step = 0
    const playStep = () => {
      const degree = degrees[step % degrees.length]
      const note = noteForDegree(theme, degree, octaveOffset)
      const pan = step % 2 === 0 ? -0.18 : 0.18
      playSynth(voice ?? getMusicVoice(theme), {
        volumeDb: musicBaseVolumeDb + musicFadeOffsetDb + musicUserVolumeDb,
        note,
        pan,
        release: '8n',
      })
      step += 1
    }

    playStep()
    musicTimers.push(window.setInterval(playStep, intervalMs))
    fadeMusicOffset({ fromDb: -18, toDb: 0 })
  }

  if (musicMode) {
    fadeMusicOffset({
      fromDb: musicFadeOffsetDb,
      toDb: -18,
      onComplete: startNewPattern,
    })
    return
  }

  startNewPattern()
}

export function startMenuMusic() {
  startMusicPattern({
    mode: 'menu',
    theme: { key: 'menu', scale: DEFAULT_SCALE, rootNote: DEFAULT_ROOT_NOTE },
    degrees: [0, 2, 4, 7, 4, 2],
    intervalMs: 760,
    volumeDb: -17,
    octaveOffset: 12,
    voice: getMusicVoice(null, {
      oscillator: 'triangle',
      envelope: { attack: 0.04, decay: 0.22, sustain: 0.1, release: 0.4 },
      effects: [{ type: 'reverb', wet: 0.25, decay: 2.2 }],
    }),
  })
}

export function startThemeMusic(theme) {
  startMusicPattern({
    mode: 'theme',
    theme,
    degrees: [0, 2, 4, 2, 5, 4, 2, 1],
    intervalMs: 620,
    volumeDb: -27,
    octaveOffset: 12,
    voice: getMusicVoice(theme, {
      oscillator: theme?.key === 'retro' ? 'square' : theme?.key === 'horror' ? 'triangle' : 'sine',
      effects: theme?.proximity?.[1]?.a?.effects ?? theme?.proximity?.[0]?.a?.effects,
    }),
  })
}

export function playTransitionMusic(theme) {
  if (!initialized || musicMuted || !theme) {
    return
  }

  if (musicMode === 'transition' && musicThemeKey === theme.key) {
    return
  }

  clearMusicTimers()
  musicMode = 'transition'
  musicThemeKey = theme.key
  musicBaseVolumeDb = -18
  musicFadeOffsetDb = 0

  const degrees = [0, 2, 4, 5, 7]
  degrees.forEach((degree, index) => {
    const timeoutId = window.setTimeout(() => {
      playSynth(getMusicVoice(theme, {
        oscillator: theme.key === 'retro' ? 'square' : 'triangle',
        envelope: { attack: 0.01, decay: 0.18, sustain: 0.08, release: 0.24 },
      }), {
        volumeDb: -15 + index + musicUserVolumeDb,
        note: noteForDegree(theme, degree, 12),
        pan: ((index / (degrees.length - 1)) - 0.5) * 0.8,
        release: '16n',
      })
    }, index * 150)
    musicTimers.push(timeoutId)
  })
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

  const level = getClosenessLevel(tile)
  const detectorVoice = getDetectorVoice(currentTheme, level)
  if (!detectorVoice) return

  const pattern = DETECTOR_PATTERNS[level]
  const note = detectorPitch(level, currentTheme)
  const pan = computePan(tile)
  const extraEffects = buildTimbreEffects(level)
  const detuneCents = pattern.detuneCents ?? detuneForLevel(level)

  for (let i = 0; i < pattern.pulseCount; i += 1) {
    window.setTimeout(() => {
      playSynth(detectorVoice, {
        volumeDb: volumeDb + pattern.volumeDb + sfxUserVolumeDb,
        note,
        extraEffects,
        detuneCents,
        pan,
        release: pattern.duration,
      })
    }, i * pattern.intervalMs)
  }
}

export function playMineExplosion() {
  if (!currentTheme) return
  playSynth(currentTheme.explosion, { volumeDb: -6 + sfxUserVolumeDb })
}

export function playSuccess() {
  if (!currentTheme) return
  playSynth(currentTheme.success, { volumeDb: -15 + sfxUserVolumeDb })
}

export function playRoundComplete() {
  if (!currentTheme) return
  playSynth(currentTheme.roundComplete, { volumeDb: -10 + sfxUserVolumeDb })
}
