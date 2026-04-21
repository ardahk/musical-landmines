const BASE_SCORE = 1000

export function calculateRoundScore({ hoverCount, livesLost, timeTaken, parTime, perfectRound }) {
  let score = BASE_SCORE
  const hoverPenalty = hoverCount * 5
  const livesPenalty = livesLost * 200
  const timeBonus = Math.max(0, (parTime - timeTaken) * 10)
  score -= hoverPenalty
  score -= livesPenalty
  score += timeBonus

  if (perfectRound) {
    score *= 2
  }

  const finalScore = Math.max(0, Math.round(score))

  return {
    base: BASE_SCORE,
    hoverPenalty,
    livesPenalty,
    timeBonus,
    perfectMultiplier: perfectRound ? 2 : 1,
    finalScore,
  }
}
