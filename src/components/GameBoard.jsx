import Tile from './Tile'
import styles from './GameBoard.module.css'

export default function GameBoard({ grid, goal, start, disabled, onHoverIntent, onReveal }) {
  if (!grid) {
    return null
  }

  return (
    <section className={styles.wrap}>
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
            onHoverIntent={onHoverIntent}
            onReveal={onReveal}
          />
        ))}
      </div>
    </section>
  )
}
