const LEADERBOARD_KEY = 'musical-landmines-leaderboard'
const PLAYER_NAME_KEY = 'musical-landmines-player-name'
const MAX_ENTRIES = 10

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function cleanName(name) {
  return name.trim().replace(/\s+/g, ' ').slice(0, 24)
}

export function readPlayerName() {
  if (!canUseStorage()) {
    return ''
  }
  return window.localStorage.getItem(PLAYER_NAME_KEY) ?? ''
}

function savePlayerName(name) {
  const cleaned = cleanName(name)
  if (canUseStorage() && cleaned) {
    window.localStorage.setItem(PLAYER_NAME_KEY, cleaned)
  }
  return cleaned
}

export function readLeaderboard() {
  if (!canUseStorage()) {
    return []
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEADERBOARD_KEY) ?? '[]')
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
      .filter((entry) => entry?.name && Number.isFinite(entry?.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

export function recordLeaderboardScore(name, score) {
  const cleaned = savePlayerName(name)
  if (!cleaned || !Number.isFinite(score)) {
    return readLeaderboard()
  }

  const entries = readLeaderboard()
  const existing = entries.find((entry) => entry.name.toLowerCase() === cleaned.toLowerCase())
  if (existing) {
    existing.name = cleaned
    existing.score += score
    existing.games = (existing.games ?? 1) + 1
  } else {
    entries.push({ name: cleaned, score, games: 1 })
  }

  const nextEntries = entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES)
  if (canUseStorage()) {
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(nextEntries))
  }
  return nextEntries
}
