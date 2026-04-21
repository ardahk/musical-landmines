import * as Tone from 'tone'

let currentTheme = null
let initialized = false
let masterChain = null
let limiter = null
const activeVoices = []
let lastHoverAt = 0
const MAX_POLYPHONY = 4

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
  entry.nodes.forEach((node) => node.dispose())
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

function playSynth(config, volumeDb = 0) {
  if (!initialized || !config) {
    return
  }

  keepPolyphonyBudget()

  const synth = createSynth(config)
  const gain = new Tone.Gain(1)
  const volume = new Tone.Volume(volumeDb)
  const effects = (config.effects ?? []).map(createEffect).filter(Boolean)

  if (effects.length > 0) {
    synth.chain(...effects, volume, gain, masterChain)
  } else {
    synth.chain(volume, gain, masterChain)
  }

  if (config.engine === 'noise') {
    synth.triggerAttackRelease(config.release ?? '8n')
  } else {
    synth.triggerAttackRelease(config.note ?? 'C4', config.release ?? '8n')
  }

  const nodes = [synth, volume, gain, ...effects]
  const timeoutId = window.setTimeout(() => {
    disposeVoice(entry)
  }, 1200)
  const entry = { nodes, timeoutId }
  activeVoices.push(entry)
}

export async function initializeAudio() {
  if (initialized) {
    return true
  }

  try {
    await Tone.start()
    limiter = new Tone.Limiter(-3)
    masterChain = new Tone.Volume(-12)
    masterChain.connect(limiter)
    limiter.toDestination()
    initialized = true
    return true
  } catch {
    return false
  }
}

export function setTheme(themeConfig) {
  currentTheme = themeConfig
}

export function playProximitySound(adjacentMines, variant = 'a', volumeDb = 0) {
  const now = nowMs()
  if (now - lastHoverAt < 80) {
    return
  }
  lastHoverAt = now

  if (!currentTheme) {
    return
  }

  const level = getLevel(adjacentMines)
  const voice = currentTheme.proximity[level]?.[variant] ?? currentTheme.proximity[level]?.a
  playSynth(voice, volumeDb)
}

export function playMineExplosion() {
  if (!currentTheme) {
    return
  }
  playSynth(currentTheme.explosion, -6)
}

export function playSuccess() {
  if (!currentTheme) {
    return
  }
  playSynth(currentTheme.success, -15)
}

export function playRoundComplete() {
  if (!currentTheme) {
    return
  }
  playSynth(currentTheme.roundComplete, -10)
}
