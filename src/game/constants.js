export const MAX_ROUNDS = 6

export function getRoundConfig(round) {
  if (round === 1) {
    return { size: 6, mineDensity: 0.26, parTime: 45, hoverDelayMs: 300 }
  }
  if (round === 2) {
    return { size: 6, mineDensity: 0.29, parTime: 40, hoverDelayMs: 380 }
  }
  if (round === 3) {
    return { size: 7, mineDensity: 0.34, parTime: 55, hoverDelayMs: 440 }
  }
  if (round === 4) {
    return { size: 7, mineDensity: 0.38, parTime: 50, hoverDelayMs: 500 }
  }
  if (round === 5) {
    return { size: 8, mineDensity: 0.40, parTime: 55, hoverDelayMs: 560 }
  }
  return { size: 8, mineDensity: 0.43, parTime: 55, hoverDelayMs: 600 }
}
