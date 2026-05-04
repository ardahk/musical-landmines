import { useCallback, useEffect } from 'react'
import {
  initializeAudio,
  playTransitionMusic,
  playMineExplosion,
  playRoundComplete,
  playSuccess,
  playTileSound,
  setTheme,
  setMusicLevel,
  setMusicMuted,
  setSfxLevel,
  startMenuMusic,
  startThemeMusic,
  stopMusic,
} from '../audio/audioEngine'

export function useAudio(theme) {
  useEffect(() => {
    if (theme) {
      setTheme(theme)
    }
  }, [theme])

  const initAudio = useCallback(async () => {
    const ok = await initializeAudio()
    return ok
  }, [])

  const setAudioTheme = useCallback((nextTheme) => {
    setTheme(nextTheme)
  }, [])

  const playHover = useCallback(({ tile, volumeDb = 0 }) => {
    if (!tile) return
    playTileSound(tile, { volumeDb })
  }, [])

  const muteMusic = useCallback((nextMuted) => {
    setMusicMuted(nextMuted)
  }, [])

  const changeMusicLevel = useCallback((level) => {
    setMusicLevel(level)
  }, [])

  const changeSfxLevel = useCallback((level) => {
    setSfxLevel(level)
  }, [])

  return {
    initAudio,
    setAudioTheme,
    changeMusicLevel,
    changeSfxLevel,
    muteMusic,
    playTransitionMusic,
    playHover,
    playExplosion: playMineExplosion,
    playRoundComplete,
    playSuccess,
    startMenuMusic,
    startThemeMusic,
    stopMusic,
  }
}
