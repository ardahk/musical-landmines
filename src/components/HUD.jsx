import styles from './HUD.module.css'

function formatTimer(ms) {
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

function Stat({ label, value, tone }) {
  return (
    <div className={styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${tone ? styles[tone] : ''}`}>{value}</span>
    </div>
  )
}

export default function HUD({ round, totalScore, lives, elapsedMs, parTime, theme }) {
  const overtime = elapsedMs / 1000 > parTime
  const hearts = '♥'.repeat(Math.max(0, lives)) + '♡'.repeat(Math.max(0, 5 - lives))

  return (
    <header className={styles.hud}>
      <div className={styles.group}>
        <Stat label="Round" value={round} />
        <Stat label="Score" value={totalScore} />
      </div>
      <div className={styles.group}>
        <Stat label="Lives" value={hearts} tone="lives" />
      </div>
      <div className={styles.group}>
        <Stat label="Time" value={formatTimer(elapsedMs)} tone={overtime ? 'danger' : 'timer'} />
        <div className={styles.theme}>
          <i style={{ background: theme.colorAccent }} />
          {theme.name}
        </div>
      </div>
    </header>
  )
}
