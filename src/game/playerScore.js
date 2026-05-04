const PLAYER_SCORE_KEY = 'musical-landmines-player-score'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

export function readPlayerScore() {
  if (!canUseStorage()) {
    return 0
  }
  const score = Number(window.localStorage.getItem(PLAYER_SCORE_KEY) ?? 0)
  return Number.isFinite(score) ? score : 0
}

export function addPlayerScore(score) {
  if (!Number.isFinite(score) || score <= 0) {
    return readPlayerScore()
  }
  const nextScore = readPlayerScore() + score
  if (canUseStorage()) {
    window.localStorage.setItem(PLAYER_SCORE_KEY, String(nextScore))
  }
  return nextScore
}
