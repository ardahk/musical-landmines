import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './App.module.css'
import StartScreen from './components/StartScreen'
import ThemePicker from './components/ThemePicker'
import GameBoard from './components/GameBoard'
import HUD from './components/HUD'
import EndScreen from './components/EndScreen'
import TransitionScreen from './components/TransitionScreen'
import { useGame } from './hooks/useGame'
import { useAudio } from './hooks/useAudio'
import { themeMap, themesList } from './audio/themes'
import { addPlayerScore, readPlayerScore } from './game/playerScore'

function isDesktopSupported() {
  if (typeof window === 'undefined') {
    return true
  }
  const hasHover = window.matchMedia('(hover: hover)').matches
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches
  return hasHover && hasFinePointer
}

export default function App() {
  const desktopSupported = useMemo(() => isDesktopSupported(), [])
  const [yourScore, setYourScore] = useState(() => readPlayerScore())
  const [savedScoreKey, setSavedScoreKey] = useState(null)
  const [musicMuted, setMusicMutedState] = useState(false)
  const [musicLevel, setMusicLevel] = useState(120)
  const [sfxLevel, setSfxLevel] = useState(125)
  const {
    state,
    begin,
    chooseTheme,
    enterGame,
    enableAudio,
    registerHover,
    revealTile,
    nextRound,
    reset,
  } = useGame()

  const selectedTheme = themeMap[state.themeKey] ?? themesList[0]

  const {
    initAudio,
    playHover,
    playExplosion,
    playRoundComplete,
    playSuccess,
    playTransitionMusic,
    changeMusicLevel,
    changeSfxLevel,
    muteMusic,
    setAudioTheme,
    startMenuMusic,
    startThemeMusic,
    stopMusic,
  } = useAudio(selectedTheme)

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', selectedTheme.colorAccent)
    setAudioTheme(selectedTheme)
  }, [selectedTheme, setAudioTheme])

  useEffect(() => {
    changeMusicLevel(musicLevel)
  }, [changeMusicLevel, musicLevel])

  useEffect(() => {
    changeSfxLevel(sfxLevel)
  }, [changeSfxLevel, sfxLevel])

  const unlockAudio = useCallback(async () => {
    const ok = await initAudio()
    enableAudio()
    return ok
  }, [enableAudio, initAudio])

  const handleBegin = async () => {
    await unlockAudio()
    begin()
  }

  const handleThemeSelect = async (themeKey) => {
    await unlockAudio()
    chooseTheme(themeKey)
  }

  const handleMusicToggle = async () => {
    await unlockAudio()
    const nextMuted = !musicMuted
    setMusicMutedState(nextMuted)
    muteMusic(nextMuted)
  }

  const handleAudioControlEntry = () => {
    unlockAudio()
  }

  const handleMusicLevelChange = (event) => {
    const nextLevel = Number(event.target.value)
    setMusicLevel(nextLevel)
    if (nextLevel > 0 && musicMuted) {
      setMusicMutedState(false)
      muteMusic(false)
    }
  }

  const handleSfxLevelChange = (event) => {
    setSfxLevel(Number(event.target.value))
  }

  const handleSoundExample = async (level) => {
    await unlockAudio()
    const scifiTheme = themeMap.scifi ?? themesList[0]
    setAudioTheme(scifiTheme)

    const exampleTiles = {
      low: { x: 2, y: 2, adjacentMines: 0, isMine: false, gridSize: 6 },
      medium: { x: 2, y: 2, adjacentMines: 1, isMine: false, gridSize: 6 },
      danger: { x: 2, y: 2, adjacentMines: 0, isMine: true, gridSize: 6 },
    }
    playHover({ tile: exampleTiles[level] ?? exampleTiles.low })
  }

  const currentScoreKey = state.screen === 'win' || state.screen === 'gameOver'
    ? `${state.startTimeMs}:${state.totalScore}:${state.history.length}`
    : null

  const saveScore = useCallback((score, scoreKey) => {
    if (!scoreKey) {
      return
    }
    setYourScore(addPlayerScore(score))
    setSavedScoreKey(scoreKey)
  }, [])

  useEffect(() => {
    if ((state.screen === 'win' || state.screen === 'gameOver') && currentScoreKey && savedScoreKey !== currentScoreKey) {
      const timeoutId = window.setTimeout(() => {
        saveScore(state.totalScore, currentScoreKey)
      }, 0)
      return () => window.clearTimeout(timeoutId)
    }
    return undefined
  }, [currentScoreKey, saveScore, savedScoreKey, state.screen, state.totalScore])

  useEffect(() => {
    if (!state.audioEnabled || musicMuted) {
      stopMusic()
      return undefined
    }

    if (['game', 'roundEnd', 'gameOver', 'win'].includes(state.screen)) {
      startThemeMusic(selectedTheme)
      return undefined
    }

    if (state.screen === 'transition') {
      playTransitionMusic(selectedTheme)
      return undefined
    }

    startMenuMusic()
    return undefined
  }, [
    musicMuted,
    playTransitionMusic,
    selectedTheme,
    startMenuMusic,
    startThemeMusic,
    state.audioEnabled,
    state.screen,
    stopMusic,
  ])

  useEffect(() => {
    if (state.screen !== 'transition') {
      return undefined
    }
    const timeoutId = window.setTimeout(() => {
      enterGame()
    }, 1350)
    return () => window.clearTimeout(timeoutId)
  }, [enterGame, state.screen])

  const handleHoverIntent = ({ x, y, adjacentMines, isMine }) => {
    registerHover({ x, y })
    const gridSize = state.roundConfig?.size ?? state.grid?.length ?? 8
    playHover({ tile: { x, y, adjacentMines, isMine, gridSize } })
  }

  const handleReveal = ({ x, y }) => {
    const result = revealTile({ x, y })
    if (!result) {
      return
    }

    if (result.event === 'mine' || result.event === 'mine_and_gameover') {
      playExplosion()
    }

    if (result.event === 'round_complete') {
      playRoundComplete()
    }

    if (result.event === 'game_win') {
      playSuccess()
    }
  }

  if (!desktopSupported) {
    return (
      <div className={styles.centeredWrap}>
        <div className={styles.desktopOnlyCard}>
          <h1>Musical Landmines</h1>
          <p>This game is desktop-only. Open it on a computer with a mouse or trackpad.</p>
        </div>
      </div>
    )
  }

  return (
    <main className={styles.app}>
      <details className={styles.audioControls}>
        <summary>{musicMuted ? 'Audio Off' : 'Audio'}</summary>
        <div className={styles.audioPanel}>
          <button
            className={styles.musicToggle}
            type="button"
            aria-pressed={musicMuted}
            onClick={handleMusicToggle}
          >
            {musicMuted ? 'Music Off' : 'Music On'}
          </button>
          <label>
            <span>Music {musicLevel}</span>
            <input
              type="range"
              min="0"
              max="200"
              value={musicLevel}
              onPointerDown={handleAudioControlEntry}
              onFocus={handleAudioControlEntry}
              onChange={handleMusicLevelChange}
              aria-label="Music volume"
            />
          </label>
          <label>
            <span>SFX {sfxLevel}</span>
            <input
              type="range"
              min="0"
              max="200"
              value={sfxLevel}
              onPointerDown={handleAudioControlEntry}
              onFocus={handleAudioControlEntry}
              onChange={handleSfxLevelChange}
              aria-label="Sound effects volume"
            />
          </label>
        </div>
      </details>

      {state.screen === 'start' && (
        <StartScreen
          onPlay={handleBegin}
          onSoundExample={handleSoundExample}
          yourScore={yourScore}
        />
      )}

      {state.screen === 'theme' && (
        <ThemePicker
          themes={themesList}
          onSelect={handleThemeSelect}
          onPreview={({ theme }) => {
            setAudioTheme(theme)
            playHover({ tile: { x: 2, y: 2, adjacentMines: 0, gridSize: 6 } })
          }}
        />
      )}

      {state.screen === 'transition' && <TransitionScreen theme={selectedTheme} />}

      {state.screen === 'game' && (
        <section className={styles.gameStage}>
          <HUD
            round={state.round}
            totalScore={state.totalScore}
            lives={state.lives}
            elapsedMs={state.elapsedMs}
            parTime={state.roundConfig.parTime}
            theme={selectedTheme}
          />
          <GameBoard
            grid={state.grid}
            goal={state.goal}
            start={state.start}
            disabled={state.screen !== 'game'}
            hoverDelayMs={state.roundConfig?.hoverDelayMs ?? 450}
            onHoverIntent={handleHoverIntent}
            onReveal={handleReveal}
          />
        </section>
      )}

      {state.screen === 'roundEnd' && (
        <EndScreen
          mode="round"
          round={state.round}
          totalScore={state.totalScore}
          roundScore={state.roundScore}
          breakdown={state.lastRoundBreakdown}
          history={state.history}
          canContinue={state.lives > 0}
          onContinue={nextRound}
          onReset={reset}
        />
      )}

      {state.screen === 'gameOver' && (
        <EndScreen
          mode="gameover"
          round={state.round}
          totalScore={state.totalScore}
          roundScore={state.roundScore}
          breakdown={state.lastRoundBreakdown}
          history={state.history}
          canContinue={false}
          onContinue={nextRound}
          onReset={reset}
        />
      )}

      {state.screen === 'win' && (
        <EndScreen
          mode="win"
          round={state.round}
          totalScore={state.totalScore}
          roundScore={state.roundScore}
          breakdown={state.lastRoundBreakdown}
          history={state.history}
          canContinue={false}
          onContinue={nextRound}
          onReset={reset}
        />
      )}
    </main>
  )
}
