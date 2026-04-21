import styles from './EndScreen.module.css'

function MiniGrid({ grid }) {
  return (
    <div className={styles.miniGrid} style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)` }}>
      {grid.flat().map((cell, index) => {
        let className = styles.miniCell
        if (cell.exploded) className = `${className} ${styles.miniExploded}`
        else if (cell.visited) className = `${className} ${styles.miniVisited}`
        else if (cell.mine) className = `${className} ${styles.miniMine}`
        else if (cell.path) className = `${className} ${styles.miniPath}`
        return <span key={index} className={className} />
      })}
    </div>
  )
}

export default function EndScreen({ mode, round, totalScore, roundScore, breakdown, history, canContinue, onContinue, onReset }) {
  const title =
    mode === 'gameover' ? 'Game Over' : mode === 'win' ? 'Mission Complete' : `Round ${round} Complete`

  return (
    <section className={styles.wrap}>
      <h2>{title}</h2>
      <p className={styles.scoreLine}>Round Score: {roundScore}</p>
      <p className={styles.scoreLine}>Total Score: {totalScore}</p>

      {breakdown && (
        <div className={styles.breakdown}>
          <span>Base {breakdown.base}</span>
          <span>Hover Penalty -{breakdown.hoverPenalty}</span>
          <span>Lives Penalty -{breakdown.livesPenalty}</span>
          <span>Time Bonus +{breakdown.timeBonus}</span>
          <span>Multiplier x{breakdown.perfectMultiplier}</span>
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

      <div className={styles.actions}>
        {mode === 'round' && canContinue ? (
          <button type="button" onClick={onContinue}>
            Next Round
          </button>
        ) : null}
        <button type="button" onClick={onReset}>
          Play Again
        </button>
      </div>
    </section>
  )
}
