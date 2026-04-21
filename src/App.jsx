import { useEffect, useMemo } from 'react'
import styles from './App.module.css'
import StartScreen from './components/StartScreen'
import ThemePicker from './components/ThemePicker'
import GameBoard from './components/GameBoard'
import HUD from './components/HUD'
import EndScreen from './components/EndScreen'
import { useGame } from './hooks/useGame'
import { useAudio } from './hooks/useAudio'
import { themeMap, themesList } from './audio/themes'

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
  const {
    state,
    begin,
    chooseTheme,
    enableAudio,
    registerHover,
    revealTile,
    nextRound,
    reset,
  } = useGame()

  const selectedTheme = themeMap[state.themeKey] ?? themesList[0]

  const {
    status: audioStatus,
    initAudio,
    playHover,
    playExplosion,
    playRoundComplete,
    playSuccess,
    setAudioTheme,
  } = useAudio(selectedTheme)

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', selectedTheme.colorAccent)
    setAudioTheme(selectedTheme)
  }, [selectedTheme, setAudioTheme])

  const onEnableAudio = async () => {
    const ok = await initAudio()
    if (ok) {
      enableAudio()
    }
  }

  const handleHoverIntent = ({ x, y, adjacentMines }) => {
    registerHover({ x, y })
    playHover({
      adjacentMines,
      round: state.round,
      neighborCounts: state.round >= 5 ? state.gridMeta?.neighborMap?.[`${x},${y}`] : [],
    })
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
      {state.screen === 'start' && <StartScreen onPlay={begin} />}

      {state.screen === 'theme' && (
        <ThemePicker
          themes={themesList}
          onSelect={chooseTheme}
          onPreview={({ theme }) => {
            if (!state.audioEnabled) {
              return
            }
            setAudioTheme(theme)
            playHover({ adjacentMines: 0, round: 1, forceVariant: 'a' })
          }}
        />
      )}

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
          {!state.audioEnabled && (
            <button className={styles.audioPrompt} type="button" onClick={onEnableAudio}>
              {audioStatus === 'ready' ? 'Enable Audio to Start Hover Clues' : 'Audio Unavailable'}
            </button>
          )}
          <GameBoard
            grid={state.grid}
            goal={state.goal}
            start={state.start}
            disabled={!state.audioEnabled || state.screen !== 'game'}
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
