import styles from './ThemePicker.module.css'

function MiniPreview() {
  const cells = Array.from({ length: 9 })
  return (
    <div className={styles.miniPreview} aria-hidden>
      {cells.map((_, i) => (
        <span key={i} style={{ '--i': i }} />
      ))}
    </div>
  )
}

export default function ThemePicker({ themes, onSelect, onPreview }) {
  return (
    <section className={styles.wrap}>
      <header>
        <h2>Select Audio Theme</h2>
        <p>Hover any card to audition a safe-tone clue. Themes change sound only; difficulty stays the same.</p>
      </header>
      <div className={styles.grid}>
        {themes.map((theme) => (
          <button
            key={theme.key}
            type="button"
            className={styles.card}
            style={{ '--card-accent': theme.colorAccent }}
            onMouseEnter={() => onPreview({ theme })}
            onClick={() => onSelect(theme.key)}
          >
            <div className={styles.cardHead}>
              <span className={styles.emoji}>{theme.emoji}</span>
              <MiniPreview />
            </div>
            <strong>{theme.name}</strong>
            <small>{theme.description}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
