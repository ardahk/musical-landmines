import { useEffect, useRef, useState } from 'react'
import styles from './StartScreen.module.css'

const GUIDE_HOVER_DELAY_MS = 450

function SoundGuideButton({ level, children, onSoundExample }) {
  const timeoutRef = useRef(null)
  const rafRef = useRef(null)
  const buttonRef = useRef(null)
  const [arming, setArming] = useState(false)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const clearHover = () => {
    setArming(false)
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (buttonRef.current) {
      buttonRef.current.style.setProperty('--arming-progress', '0deg')
    }
  }

  const startHover = (event) => {
    clearHover()
    setArming(true)
    const delay = event?.shiftKey ? 0 : GUIDE_HOVER_DELAY_MS

    if (buttonRef.current) {
      buttonRef.current.style.setProperty('--arming-progress', '0deg')
    }

    if (delay === 0) {
      onSoundExample(level)
      setArming(false)
      return
    }

    const startTs = performance.now()
    const tick = () => {
      const elapsed = performance.now() - startTs
      const pct = Math.min(1, elapsed / delay)
      if (buttonRef.current) {
        buttonRef.current.style.setProperty('--arming-progress', `${pct * 360}deg`)
      }
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    timeoutRef.current = window.setTimeout(() => {
      onSoundExample(level)
      setArming(false)
      if (buttonRef.current) {
        buttonRef.current.style.setProperty('--arming-progress', '0deg')
      }
    }, delay)
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={arming ? styles.armingExample : ''}
      onMouseEnter={startHover}
      onMouseLeave={clearHover}
      onFocus={startHover}
      onBlur={clearHover}
      aria-label={`${children} example sound`}
    >
      {children}
    </button>
  )
}

export default function StartScreen({ onPlay, onSoundExample, yourScore = 0 }) {
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
      <div className={styles.soundGuide} aria-label="Sound guide">
        <h2>Sound Guide</h2>
        <dl>
          <div>
            <dt>
              <SoundGuideButton level="low" onSoundExample={onSoundExample}>
                One calm pulse
              </SoundGuideButton>
            </dt>
            <dd>Safe tile with no nearby mines.</dd>
          </div>
          <div>
            <dt>
              <SoundGuideButton level="medium" onSoundExample={onSoundExample}>
                Two tighter pulses
              </SoundGuideButton>
            </dt>
            <dd>Medium caution: one or two nearby mines.</dd>
          </div>
          <div>
            <dt>
              <SoundGuideButton level="danger" onSoundExample={onSoundExample}>
                Three fast warning pulses
              </SoundGuideButton>
            </dt>
            <dd>Danger: this tile is a mine or has heavy nearby risk.</dd>
          </div>
        </dl>
      </div>
      <button type="button" onClick={onPlay}>
        Play
      </button>
      <aside className={styles.yourScore}>
        <span>Your Score</span>
        <strong>{yourScore}</strong>
      </aside>
    </section>
  )
}
