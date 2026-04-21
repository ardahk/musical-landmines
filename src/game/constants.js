export const MAX_ROUNDS = 6

export function getRoundConfig(round) {
  if (round === 1) {
    return { size: 6, mineDensity: 0.3, parTime: 45 }
  }
  if (round === 2) {
    return { size: 6, mineDensity: 0.4, parTime: 40 }
  }
  if (round === 3) {
    return { size: 7, mineDensity: 0.45, parTime: 55 }
  }
  if (round === 4) {
    return { size: 7, mineDensity: 0.5, parTime: 50 }
  }
  return { size: 8, mineDensity: 0.52, parTime: 50 }
}
