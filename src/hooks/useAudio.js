import { useCallback, useEffect, useState } from 'react'
import {
  initializeAudio,
  playMineExplosion,
  playProximitySound,
  playRoundComplete,
  playSuccess,
  setTheme,
} from '../audio/audioEngine'

function pickVariant(round, forceVariant) {
  if (forceVariant) {
    return forceVariant
  }
  if (round < 3) {
    return 'a'
  }
  return Math.random() < 0.5 ? 'a' : 'b'
}

function pickBlurNeighbors(neighborCounts) {
  if (!neighborCounts || neighborCounts.length === 0) {
    return []
  }
  const count = 1 + Math.floor(Math.random() * 2)
  const shuffled = [...neighborCounts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function useAudio(theme) {
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (theme) {
      setTheme(theme)
    }
  }, [theme])

  const initAudio = useCallback(async () => {
    const ok = await initializeAudio()
    setStatus(ok ? 'ready' : 'failed')
    return ok
  }, [])

  const setAudioTheme = useCallback((nextTheme) => {
    setTheme(nextTheme)
  }, [])

  const playHover = useCallback(({ adjacentMines, round, neighborCounts = [], forceVariant = null }) => {
    const variant = pickVariant(round, forceVariant)
    playProximitySound(adjacentMines, variant)

    if (round >= 5) {
      const blurNeighbors = pickBlurNeighbors(neighborCounts)
      blurNeighbors.forEach((neighborCount) => {
        playProximitySound(neighborCount, pickVariant(round), -14)
      })
    }
  }, [])

  return {
    status,
    initAudio,
    setAudioTheme,
    playHover,
    playExplosion: playMineExplosion,
    playRoundComplete,
    playSuccess,
  }
}
