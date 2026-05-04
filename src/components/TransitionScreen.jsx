import styles from './TransitionScreen.module.css'

const SEGMENTS = ['Signal', 'Sweep', 'Lock', 'Trace', 'Enter']

export default function TransitionScreen({ theme }) {
  return (
    <section className={styles.wrap} style={{ '--transition-accent': theme.colorAccent }}>
      <div className={styles.segments} aria-hidden>
        {SEGMENTS.map((segment, index) => (
          <span key={segment} style={{ '--i': index }} />
        ))}
      </div>
      <div className={styles.content}>
        <span>{theme.name}</span>
        <h2>Entering Field</h2>
      </div>
    </section>
  )
}
