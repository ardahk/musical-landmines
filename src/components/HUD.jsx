import styles from './HUD.module.css'

function formatTimer(ms) {
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function HUD({ round, totalScore, lives, elapsedMs, parTime, theme }) {
  const overtime = elapsedMs / 1000 > parTime

  return (
    <header className={styles.hud}>
      <div>
        <strong>Round {round}</strong>
        <span>Score {totalScore}</span>
      </div>
      <div>
        <span className={styles.lifeLabel}>Lives {'◉'.repeat(Math.max(0, lives))}</span>
      </div>
      <div>
        <span className={overtime ? styles.timerDanger : styles.timer}>{formatTimer(elapsedMs)}</span>
        <span className={styles.theme}>
          <i style={{ background: theme.colorAccent }} />
          {theme.name}
        </span>
      </div>
    </header>
  )
}
