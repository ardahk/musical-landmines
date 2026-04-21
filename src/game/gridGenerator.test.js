import { describe, expect, it } from 'vitest'
import { generateGrid, getNeighbors } from './gridGenerator'

function hasPathToGoal(grid) {
  const size = grid.length
  const start = [0, size - 1]
  const goal = [size - 1, 0]
  const queue = [start]
  const seen = new Set([start.join(',')])
  const moves = [
    [0, -1],
    [1, 0],
    [1, -1],
  ]

  while (queue.length > 0) {
    const [x, y] = queue.shift()
    if (x === goal[0] && y === goal[1]) {
      return true
    }

    for (const [dx, dy] of moves) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) {
        continue
      }
      const key = `${nx},${ny}`
      if (seen.has(key)) {
        continue
      }
      const cell = grid[ny][nx]
      if (cell.isMine) {
        continue
      }
      seen.add(key)
      queue.push([nx, ny])
    }
  }

  return false
}

describe('gridGenerator', () => {
  it('always creates a safe path from start to goal', () => {
    for (let i = 0; i < 50; i += 1) {
      const grid = generateGrid(8, 0.55)
      expect(hasPathToGoal(grid)).toBe(true)
    }
  })

  it('computes adjacent mine counts correctly', () => {
    const grid = generateGrid(7, 0.4)
    for (let y = 0; y < grid.length; y += 1) {
      for (let x = 0; x < grid.length; x += 1) {
        const expected = getNeighbors(grid, x, y).filter((n) => n.isMine).length
        expect(grid[y][x].adjacentMines).toBe(expected)
      }
    }
  })
})
