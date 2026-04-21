import { useEffect, useRef, useState } from 'react'
import styles from './Tile.module.css'

const HOVER_DELAY_MS = 1000

export default function Tile({ cell, isGoal, isStart, disabled, onHoverIntent, onReveal }) {
  const timeoutRef = useRef(null)
  const [arming, setArming] = useState(false)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startHoverTimer = () => {
    if (disabled || cell.state !== 'hidden') {
      return
    }
    setArming(true)
    timeoutRef.current = window.setTimeout(() => {
      onHoverIntent({ x: cell.x, y: cell.y, adjacentMines: cell.adjacentMines })
      setArming(false)
    }, HOVER_DELAY_MS)
  }

  const clearHoverTimer = () => {
    setArming(false)
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const classNames = [styles.tile]
  if (cell.state === 'visited') classNames.push(styles.visited)
  if (cell.state === 'exploded') classNames.push(styles.exploded)
  if (isGoal) classNames.push(styles.goal)
  if (isStart) classNames.push(styles.start)
  if (arming) classNames.push(styles.arming)

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      onMouseEnter={startHoverTimer}
      onMouseLeave={clearHoverTimer}
      onClick={() => onReveal({ x: cell.x, y: cell.y })}
      disabled={disabled || cell.state !== 'hidden'}
      aria-label={`Tile ${cell.x}, ${cell.y}`}
    >
      {cell.state === 'exploded' && <span>☠</span>}
      {cell.state === 'visited' && <span className={styles.dot} />}
    </button>
  )
}
