import styles from './StartScreen.module.css'

export default function StartScreen({ onPlay }) {
  return (
    <section className={styles.wrap}>
      <div className={styles.bgGrid} />
      <h1>MUSICAL LANDMINES</h1>
      <p className={styles.tagline}>Cross the minefield by listening, not guessing.</p>
      <ul>
        <li>Hover over a tile for 1 second to hear its danger tone.</li>
        <li>Click tiles to reveal a route from start to goal.</li>
        <li>Survive all rounds and preserve your lives.</li>
      </ul>
      <button type="button" onClick={onPlay}>
        Play
      </button>
    </section>
  )
}
