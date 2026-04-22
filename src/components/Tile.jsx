import { useEffect, useRef, useState } from 'react'
import styles from './Tile.module.css'

export default function Tile({ cell, isGoal, isStart, disabled, hoverDelayMs = 450, onHoverIntent, onReveal, reachable = true }) {
  const timeoutRef = useRef(null)
  const rafRef = useRef(null)
  const tileRef = useRef(null)
  const [arming, setArming] = useState(false)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const startHoverTimer = (event) => {
    if (disabled || cell.state !== 'hidden' || !reachable) return
    // Shift skips the arming delay for accessibility / rapid scanning.
    const delay = event?.shiftKey ? 0 : hoverDelayMs
    setArming(true)

    if (tileRef.current) {
      tileRef.current.style.setProperty('--arming-progress', '0deg')
    }

    if (delay === 0) {
      onHoverIntent({ x: cell.x, y: cell.y, adjacentMines: cell.adjacentMines })
      setArming(false)
      return
    }

    const startTs = performance.now()
    const tick = () => {
      const elapsed = performance.now() - startTs
      const pct = Math.min(1, elapsed / delay)
      if (tileRef.current) {
        tileRef.current.style.setProperty('--arming-progress', `${pct * 360}deg`)
      }
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    timeoutRef.current = window.setTimeout(() => {
      onHoverIntent({ x: cell.x, y: cell.y, adjacentMines: cell.adjacentMines })
      setArming(false)
    }, delay)
  }

  const clearHoverTimer = () => {
    setArming(false)
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (tileRef.current) {
      tileRef.current.style.setProperty('--arming-progress', '0deg')
    }
  }

  const classNames = [styles.tile]
  if (cell.state === 'visited') classNames.push(styles.visited)
  if (cell.state === 'exploded') classNames.push(styles.exploded)
  if (isGoal) classNames.push(styles.goal)
  if (isStart) classNames.push(styles.start)
  if (arming) classNames.push(styles.arming)
  if (!reachable && cell.state === 'hidden') classNames.push(styles.locked)

  return (
    <button
      ref={tileRef}
      type="button"
      className={classNames.join(' ')}
      onMouseEnter={startHoverTimer}
      onMouseLeave={clearHoverTimer}
      onClick={() => onReveal({ x: cell.x, y: cell.y })}
      disabled={disabled || cell.state !== 'hidden'}
      aria-label={`Tile ${cell.x}, ${cell.y}`}
    >
      {cell.state === 'exploded' && <span className={styles.mineIcon}>☠</span>}
      {cell.state === 'visited' && <span className={styles.dot} />}
      {cell.state === 'hidden' && isStart && (
        <svg className={styles.markerIcon} viewBox="0 0 16 16" aria-hidden>
          <path d="M3 2v12M3 3h8l-1.5 2L11 7H3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      )}
      {cell.state === 'hidden' && isGoal && (
        <svg className={styles.markerIcon} viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="8" r="1" fill="currentColor" />
        </svg>
      )}
    </button>
  )
}
