import { useEffect, useMemo, useReducer } from 'react'
import { cloneGrid, createNeighborMap, generateGrid, isWinCondition } from '../game/gridGenerator'
import { MAX_ROUNDS, getRoundConfig } from '../game/constants'
import { calculateRoundScore } from '../game/scoring'

const START_LIVES = 3

function createRoundState(round) {
  const roundConfig = getRoundConfig(round)
  const grid = generateGrid(roundConfig.size, roundConfig.mineDensity)
  return {
    roundConfig,
    grid,
    gridMeta: { neighborMap: createNeighborMap(grid) },
    start: { x: 0, y: roundConfig.size - 1 },
    goal: { x: roundConfig.size - 1, y: 0 },
  }
}

function initialState() {
  const round = 1
  const roundState = createRoundState(round)

  return {
    screen: 'start',
    themeKey: null,
    round,
    ...roundState,
    lives: START_LIVES,
    totalScore: 0,
    roundScore: 0,
    hoverCount: 0,
    roundStartLives: START_LIVES,
    startTimeMs: null,
    elapsedMs: 0,
    history: [],
    lastRoundBreakdown: null,
    audioEnabled: false,
  }
}

function compressGrid(grid) {
  return grid.map((row) =>
    row.map((cell) => ({
      mine: cell.isMine,
      visited: cell.state === 'visited',
      exploded: cell.state === 'exploded',
      path: cell.isPath,
    })),
  )
}

function finishRound(state, nextScreen) {
  const endTime = Date.now()
  const timeTaken = Math.max(0, Math.round((endTime - state.startTimeMs) / 1000))
  const livesLost = state.roundStartLives - state.lives
  const breakdown = calculateRoundScore({
    hoverCount: state.hoverCount,
    livesLost,
    timeTaken,
    parTime: state.roundConfig.parTime,
    perfectRound: livesLost === 0,
  })

  const historyEntry = {
    round: state.round,
    size: state.roundConfig.size,
    score: breakdown.finalScore,
    livesAfter: state.lives,
    grid: compressGrid(state.grid),
  }

  return {
    ...state,
    screen: nextScreen,
    roundScore: breakdown.finalScore,
    totalScore: state.totalScore + breakdown.finalScore,
    elapsedMs: endTime - state.startTimeMs,
    lastRoundBreakdown: {
      ...breakdown,
      timeTaken,
      parTime: state.roundConfig.parTime,
      hoverCount: state.hoverCount,
      livesLost,
    },
    history: [...state.history, historyEntry],
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, screen: 'theme' }

    case 'SELECT_THEME': {
      const fresh = initialState()
      return {
        ...fresh,
        screen: 'game',
        themeKey: action.payload.themeKey,
        audioEnabled: state.audioEnabled,
        startTimeMs: Date.now(),
      }
    }

    case 'ENABLE_AUDIO':
      return { ...state, audioEnabled: true }

    case 'REGISTER_HOVER':
      return { ...state, hoverCount: state.hoverCount + 1 }

    case 'REVEAL_TILE': {
      if (state.screen !== 'game') {
        return state
      }
      const { x, y } = action.payload
      const original = state.grid[y]?.[x]
      if (!original || original.state !== 'hidden') {
        return state
      }

      const grid = cloneGrid(state.grid)
      const cell = grid[y][x]

      if (cell.isMine) {
        cell.state = 'exploded'
        const lives = state.lives - 1
        if (lives <= 0) {
          return finishRound({ ...state, grid, lives: 0 }, 'gameOver')
        }
        return { ...state, grid, lives }
      }

      cell.state = 'visited'
      const nextState = { ...state, grid }

      if (isWinCondition(grid, state.goal)) {
        if (state.round >= MAX_ROUNDS) {
          return finishRound(nextState, 'win')
        }
        return finishRound(nextState, 'roundEnd')
      }

      return nextState
    }

    case 'NEXT_ROUND': {
      const nextRound = state.round + 1
      const roundState = createRoundState(nextRound)
      const bonusLife = state.round % 2 === 0 ? 1 : 0
      const lives = state.lives + bonusLife

      return {
        ...state,
        screen: 'game',
        round: nextRound,
        ...roundState,
        lives,
        roundStartLives: lives,
        roundScore: 0,
        hoverCount: 0,
        startTimeMs: Date.now(),
        elapsedMs: 0,
        lastRoundBreakdown: null,
      }
    }

    case 'RESET': {
      const fresh = initialState()
      return {
        ...fresh,
        audioEnabled: state.audioEnabled,
      }
    }

    case 'TICK':
      if (state.screen !== 'game' || !state.startTimeMs) {
        return state
      }
      return { ...state, elapsedMs: Date.now() - state.startTimeMs }

    default:
      return state
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => {
    if (state.screen !== 'game') {
      return undefined
    }

    const timer = window.setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 250)

    return () => window.clearInterval(timer)
  }, [state.screen])

  const api = useMemo(
    () => ({
      begin: () => dispatch({ type: 'START_GAME' }),
      chooseTheme: (themeKey) => dispatch({ type: 'SELECT_THEME', payload: { themeKey } }),
      enableAudio: () => dispatch({ type: 'ENABLE_AUDIO' }),
      registerHover: ({ x, y }) => dispatch({ type: 'REGISTER_HOVER', payload: { x, y } }),
      revealTile: ({ x, y }) => {
        const previous = state
        dispatch({ type: 'REVEAL_TILE', payload: { x, y } })
        const targetCell = previous.grid[y]?.[x]
        if (!targetCell || targetCell.state !== 'hidden') {
          return null
        }
        if (targetCell.isMine && previous.lives <= 1) {
          return { event: 'mine_and_gameover' }
        }
        if (targetCell.isMine) {
          return { event: 'mine' }
        }
        const isGoal = x === previous.goal.x && y === previous.goal.y
        if (!isGoal) {
          return { event: 'safe' }
        }
        if (previous.round >= MAX_ROUNDS) {
          return { event: 'game_win' }
        }
        return { event: 'round_complete' }
      },
      nextRound: () => dispatch({ type: 'NEXT_ROUND' }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return { state, ...api }
}
