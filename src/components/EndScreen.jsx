import styles from './EndScreen.module.css'

function MiniGrid({ grid }) {
  return (
    <div className={styles.miniGrid} style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)` }}>
      {grid.flat().map((cell, index) => {
        let className = styles.miniCell
        if (cell.exploded) className = `${className} ${styles.miniExploded}`
        else if (cell.playerPath) className = `${className} ${styles.miniPlayerPath}`
        else if (cell.visited) className = `${className} ${styles.miniVisited}`
        else if (cell.mine) className = `${className} ${styles.miniMine}`
        else if (cell.path) className = `${className} ${styles.miniPath}`
        return <span key={index} className={className} />
      })}
    </div>
  )
}

const SCORE_DESCRIPTIONS = {
  base: 'Each round starts with 1000 base points before penalties, bonuses, or multipliers.',
  hoverPenalty: 'Each completed hover clue costs 5 points, so fewer checks preserve more score.',
  livesPenalty: 'Each life lost during the round subtracts 200 points.',
  timeBonus: 'You earn 10 bonus points for every second you finish under the round par time.',
  perfectMultiplier: 'A round with no lives lost doubles the score after penalties and bonuses.',
}

export default function EndScreen({
  mode,
  round,
  totalScore,
  roundScore,
  breakdown,
  history,
  canContinue,
  playerName,
  scoreSaved,
  onSaveScore,
  onContinue,
  onReset,
}) {
  const title =
    mode === 'gameover' ? 'Game Over' : mode === 'win' ? 'Mission Complete' : `Round ${round} Complete`
  const showScoreForm = (mode === 'win' || mode === 'gameover') && !scoreSaved

  const handleScoreSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSaveScore(formData.get('name')?.toString() ?? '')
  }

  return (
    <section className={styles.wrap}>
      <h2>{title}</h2>
      <p className={styles.scoreLine}>Round Score: {roundScore}</p>
      <p className={styles.scoreLine}>Total Score: {totalScore}</p>

      {breakdown && (
        <div className={styles.breakdown}>
          <span title={SCORE_DESCRIPTIONS.base}>Base {breakdown.base}</span>
          <span title={SCORE_DESCRIPTIONS.hoverPenalty}>Hover Penalty -{breakdown.hoverPenalty}</span>
          <span title={SCORE_DESCRIPTIONS.livesPenalty}>Lives Penalty -{breakdown.livesPenalty}</span>
          <span title={SCORE_DESCRIPTIONS.timeBonus}>Time Bonus +{breakdown.timeBonus}</span>
          <span title={SCORE_DESCRIPTIONS.perfectMultiplier}>Multiplier x{breakdown.perfectMultiplier}</span>
        </div>
      )}

      <div className={styles.history}>
        {history.slice(-4).map((entry) => (
          <article key={entry.round}>
            <small>R{entry.round} · {entry.score}</small>
            <MiniGrid grid={entry.grid} />
          </article>
        ))}
      </div>

      {showScoreForm && (
        <form className={styles.scoreForm} onSubmit={handleScoreSubmit}>
          <label htmlFor="player-name">Name for leaderboard</label>
          <div>
            <input
              id="player-name"
              name="name"
              type="text"
              defaultValue={playerName}
              maxLength={24}
              autoComplete="nickname"
              required
            />
            <button type="submit">Save Score</button>
          </div>
        </form>
      )}

      <div className={styles.actions}>
        {mode === 'round' && canContinue ? (
          <button type="button" onClick={onContinue}>
            Next Round
          </button>
        ) : (
          <button type="button" onClick={onReset}>
            Play Again
          </button>
        )}
      </div>
    </section>
  )
}
