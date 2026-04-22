import Tile from './Tile'
import SpectrumStrip from './SpectrumStrip'
import styles from './GameBoard.module.css'
import { isReachable } from '../game/gridGenerator'

export default function GameBoard({ grid, goal, start, disabled, hoverDelayMs, onHoverIntent, onReveal }) {
  if (!grid) {
    return null
  }

  return (
    <section className={styles.wrap}>
      <SpectrumStrip active={!disabled} />
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
      >
        {grid.flat().map((cell) => (
          <Tile
            key={cell.id}
            cell={cell}
            isGoal={cell.x === goal.x && cell.y === goal.y}
            isStart={cell.x === start.x && cell.y === start.y}
            disabled={disabled}
            hoverDelayMs={hoverDelayMs}
            onHoverIntent={onHoverIntent}
            onReveal={onReveal}
            reachable={cell.state === 'visited' || isReachable(grid, cell.x, cell.y)}
          />
        ))}
      </div>
    </section>
  )
}
