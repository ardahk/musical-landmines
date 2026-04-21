import styles from './ThemePicker.module.css'

export default function ThemePicker({ themes, onSelect, onPreview }) {
  return (
    <section className={styles.wrap}>
      <header>
        <h2>Select Audio Theme</h2>
        <p>Hover any card to audition a safe-tone clue.</p>
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
            <span className={styles.emoji}>{theme.emoji}</span>
            <strong>{theme.name}</strong>
            <small>{theme.description}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
