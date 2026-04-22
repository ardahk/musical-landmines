function inBounds(size, x, y) {
  return x >= 0 && y >= 0 && x < size && y < size
}

const ADJ_OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
]

const SAFE_PATH_OFFSETS = [
  [0, -1],
  [1, 0],
  [1, -1],
]

function buildCell(x, y, size) {
  const isStart = x === 0 && y === size - 1
  return {
    id: `${x},${y}`,
    x,
    y,
    isMine: false,
    isPath: false,
    adjacentMines: 0,
    state: isStart ? 'visited' : 'hidden',
    isStart,
    isGoal: x === size - 1 && y === 0,
  }
}

export function getNeighbors(grid, x, y) {
  const size = grid.length
  return ADJ_OFFSETS.map(([dx, dy]) => {
    const nx = x + dx
    const ny = y + dy
    if (!inBounds(size, nx, ny)) {
      return null
    }
    return grid[ny][nx]
  }).filter(Boolean)
}

function getPathStepOptions(size, x, y) {
  return SAFE_PATH_OFFSETS.map(([dx, dy]) => {
    const nx = x + dx
    const ny = y + dy
    if (!inBounds(size, nx, ny)) {
      return null
    }
    if (nx > size - 1 || ny < 0) {
      return null
    }
    return [nx, ny]
  }).filter(Boolean)
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function generateSafePath(size) {
  const start = [0, size - 1]
  const goal = [size - 1, 0]
  const path = [start]

  let [x, y] = start
  while (x !== goal[0] || y !== goal[1]) {
    const options = getPathStepOptions(size, x, y).filter(([nx, ny]) => nx >= x && ny <= y)

    const progressOptions = options.filter(([nx, ny]) => nx > x || ny < y)
    const [nextX, nextY] = randomChoice(progressOptions)
    path.push([nextX, nextY])
    x = nextX
    y = nextY
  }

  return path
}

export function generateGrid(size, mineDensity) {
  const grid = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => buildCell(x, y, size)),
  )

  const safePath = generateSafePath(size)
  const safeSet = new Set(safePath.map(([x, y]) => `${x},${y}`))

  for (const [x, y] of safePath) {
    grid[y][x].isPath = true
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const cell = grid[y][x]
      if (safeSet.has(cell.id)) {
        continue
      }
      cell.isMine = Math.random() < mineDensity
    }
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const neighbors = getNeighbors(grid, x, y)
      grid[y][x].adjacentMines = neighbors.reduce((count, neighbor) => count + (neighbor.isMine ? 1 : 0), 0)
    }
  }

  return grid
}

export function createNeighborMap(grid) {
  const map = {}
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid.length; x += 1) {
      map[`${x},${y}`] = getNeighbors(grid, x, y).map((neighbor) => neighbor.adjacentMines)
    }
  }
  return map
}

export function isWinCondition(grid, goal) {
  const goalCell = grid[goal.y][goal.x]
  return goalCell.state === 'visited'
}

export function cloneGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ ...cell })))
}

export function isReachable(grid, x, y) {
  const size = grid.length
  for (const [dx, dy] of ADJ_OFFSETS) {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && ny >= 0 && nx < size && ny < size) {
      if (grid[ny][nx].state === 'visited') return true
    }
  }
  return false
}
