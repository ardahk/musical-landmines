# Road Mechanic + Proximity Sound Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Require players to build a connected road from start to goal, show the player's actual path in historical mini-grids, and make proximity sound immediately readable by mapping mine count to rising pitch.

**Architecture:** Three independent tracks — (1) game logic: reachability constraint + start auto-visit + playerPath tracking, (2) UI: dim unreachable tiles, show player path in MiniGrid, (3) audio: replace coordinate-pitch with a per-theme rising scale mapped to the 5 proximity levels.

**Tech Stack:** React 19, Tone.js 15, Vite, Vitest

---

### Task 1: Auto-visit the start tile on round start

**Files:**
- Modify: `src/game/gridGenerator.js`
- Modify: `src/hooks/useGame.js`
- Test: `src/game/gridGenerator.test.js`

**Step 1: Write failing test**

In `src/game/gridGenerator.test.js`, add:
```js
import { generateGrid } from './gridGenerator'

test('start tile begins as visited', () => {
  const grid = generateGrid(6, 0.3)
  const startCell = grid[5][0] // x=0, y=size-1
  expect(startCell.state).toBe('visited')
})
```

**Step 2: Run to verify it fails**
```bash
npm run test
```
Expected: FAIL — start cell state is `'hidden'`

**Step 3: Mark start tile visited in `buildCell`**

In `src/game/gridGenerator.js`, change `buildCell`:
```js
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
```

**Step 4: Run tests**
```bash
npm run test
```
Expected: PASS

**Step 5: Commit**
```bash
git add src/game/gridGenerator.js src/game/gridGenerator.test.js
git commit -m "feat: auto-visit start tile on grid generation"
```

---

### Task 2: Add `isReachable` helper and `playerPath` tracking

**Files:**
- Modify: `src/game/gridGenerator.js`
- Modify: `src/hooks/useGame.js`
- Test: `src/game/gridGenerator.test.js`

**Step 1: Write failing test for `isReachable`**

In `src/game/gridGenerator.test.js`, add:
```js
import { generateGrid, isReachable } from './gridGenerator'

test('tile adjacent to visited start is reachable', () => {
  const grid = generateGrid(6, 0)
  // (0,5) is start/visited; (1,5) and (0,4) and (1,4) should be reachable
  expect(isReachable(grid, 1, 5)).toBe(true)
  expect(isReachable(grid, 0, 4)).toBe(true)
})

test('tile not adjacent to any visited tile is not reachable', () => {
  const grid = generateGrid(6, 0)
  // (5,0) is goal; no visited neighbour yet
  expect(isReachable(grid, 5, 0)).toBe(false)
})
```

**Step 2: Run to verify it fails**
```bash
npm run test
```
Expected: FAIL — `isReachable` not exported

**Step 3: Export `isReachable` from `gridGenerator.js`**

Add at the bottom of `src/game/gridGenerator.js`:
```js
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
```

**Step 4: Run tests**
```bash
npm run test
```
Expected: PASS

**Step 5: Add `playerPath` set to game state**

In `src/hooks/useGame.js`, inside `initialState()` add `playerPath: new Set()` to the returned object.

In `REVEAL_TILE` case inside `reducer`, after `cell.state = 'visited'` line, add:
```js
const playerPath = new Set(state.playerPath)
playerPath.add(cell.id)
const nextState = { ...state, grid, playerPath }
```
And update all `{ ...state, grid }` → `{ ...state, grid, playerPath }` for the visited branch only.

Also reset `playerPath` in `SELECT_THEME`, `NEXT_ROUND`, and `RESET` cases:
```js
playerPath: new Set(),
```

**Step 6: Run tests**
```bash
npm run test
```
Expected: PASS

**Step 7: Commit**
```bash
git add src/game/gridGenerator.js src/game/gridGenerator.test.js src/hooks/useGame.js
git commit -m "feat: isReachable helper + playerPath tracking in game state"
```

---

### Task 3: Enforce road constraint in REVEAL_TILE + block unreachable clicks

**Files:**
- Modify: `src/hooks/useGame.js`
- Modify: `src/game/gridGenerator.js`

**Step 1: Guard reveal with reachability**

In `reducer` → `REVEAL_TILE` case, after the `original` null check, add:
```js
// Import isReachable at top of file
import { cloneGrid, createNeighborMap, generateGrid, isWinCondition, isReachable } from '../game/gridGenerator'

// In the REVEAL_TILE case, after the original null check:
if (!isReachable(state.grid, x, y)) {
  return state
}
```

> Note: `isStart` tile is pre-visited so its neighbours are always reachable from the first move.

**Step 2: Build + manual verify**
```bash
npm run build
```
Expected: no errors. Then `npm run dev` and try clicking a tile far from start — it should do nothing.

**Step 3: Commit**
```bash
git add src/hooks/useGame.js
git commit -m "feat: block reveal of tiles not connected to visited road"
```

---

### Task 4: Visual feedback for unreachable tiles

**Files:**
- Modify: `src/components/Tile.jsx`
- Modify: `src/components/Tile.module.css`
- Modify: `src/components/GameBoard.jsx`

**Step 1: Compute and pass `isReachable` from GameBoard**

In `src/components/GameBoard.jsx`, import `isReachable` and pass it as a prop to each Tile:
```js
import { isReachable } from '../game/gridGenerator'

// Inside the map:
<Tile
  ...
  reachable={cell.state === 'visited' || isReachable(grid, cell.x, cell.y)}
  ...
/>
```

> Visited tiles are always "reachable" visually (they're already part of the road).

**Step 2: Use `reachable` prop in Tile**

In `src/components/Tile.jsx`, add `reachable = true` to props.

Add to classNames logic:
```js
if (!reachable && cell.state === 'hidden') classNames.push(styles.locked)
```

**Step 3: Add `.locked` CSS**

In `src/components/Tile.module.css`, add:
```css
.locked {
  opacity: 0.45;
  filter: saturate(0.3);
}

.locked:hover {
  transform: none;
  filter: saturate(0.3) brightness(1);
  cursor: default;
}
```

**Step 4: Build and verify visually**
```bash
npm run dev
```
Tiles far from start should appear dimmed. Tiles adjacent to the visited start tile should look normal.

**Step 5: Commit**
```bash
git add src/components/GameBoard.jsx src/components/Tile.jsx src/components/Tile.module.css
git commit -m "feat: dim unreachable tiles to guide road construction"
```

---

### Task 5: Show player path in historical mini-grids

**Files:**
- Modify: `src/hooks/useGame.js` — `compressGrid` must capture playerPath
- Modify: `src/components/EndScreen.jsx`
- Modify: `src/components/EndScreen.module.css`

**Step 1: Pass `playerPath` into `compressGrid`**

In `src/hooks/useGame.js`, update `compressGrid` signature and body:
```js
function compressGrid(grid, playerPath) {
  return grid.map((row) =>
    row.map((cell) => ({
      mine: cell.isMine,
      visited: cell.state === 'visited',
      exploded: cell.state === 'exploded',
      path: cell.isPath,
      playerPath: playerPath?.has(cell.id) ?? false,
    })),
  )
}
```

In `finishRound`, update the `compressGrid` call:
```js
grid: compressGrid(state.grid, state.playerPath),
```

**Step 2: Render player path in MiniGrid**

In `src/components/EndScreen.jsx`, update the class assignment in `MiniGrid`:
```js
let className = styles.miniCell
if (cell.exploded) className = `${className} ${styles.miniExploded}`
else if (cell.playerPath) className = `${className} ${styles.miniPlayerPath}`
else if (cell.visited) className = `${className} ${styles.miniVisited}`
else if (cell.mine) className = `${className} ${styles.miniMine}`
else if (cell.path) className = `${className} ${styles.miniPath}`
```

**Step 3: Add `.miniPlayerPath` CSS**

In `src/components/EndScreen.module.css`, find the existing mini-cell styles and add:
```css
.miniPlayerPath {
  background: color-mix(in oklab, var(--accent), transparent 25%);
  box-shadow: 0 0 3px color-mix(in oklab, var(--accent), transparent 40%);
}
```

**Step 4: Build and test**
```bash
npm run build && npm run test
```
Expected: all pass

**Step 5: Commit**
```bash
git add src/hooks/useGame.js src/components/EndScreen.jsx src/components/EndScreen.module.css
git commit -m "feat: show player road in round history mini-grids"
```

---

### Task 6: Revert coordinate pitch — map proximity level to rising notes

**Files:**
- Modify: `src/audio/audioEngine.js`

**Step 1: Replace `computeTilePitch` with `proximityPitch`**

In `src/audio/audioEngine.js`, remove the `computeTilePitch` function entirely. Add instead:

```js
// Maps proximity level (0–4) to scale degrees that ascend clearly.
// Level 0 = root (safe), level 4 = octave above (danger).
const PROXIMITY_DEGREES = [0, 2, 4, 5, 8]  // indices into the scale + octave logic

function proximityPitch(adjacentMines, theme) {
  const scale = theme?.scale ?? DEFAULT_SCALE
  const rootNote = theme?.rootNote ?? DEFAULT_ROOT_NOTE
  let rootMidi
  try {
    rootMidi = Tone.Frequency(rootNote).toMidi()
  } catch {
    rootMidi = Tone.Frequency(DEFAULT_ROOT_NOTE).toMidi()
  }
  const level = getLevel(adjacentMines)
  const degreeIndex = PROXIMITY_DEGREES[level]
  const octaveBonus = degreeIndex >= scale.length ? 12 : 0
  const semitone = scale[degreeIndex % scale.length]
  return Tone.Frequency(rootMidi + semitone + octaveBonus, 'midi').toNote()
}
```

**Step 2: Update `playTileSound` to use `proximityPitch`**

In `playTileSound`, change:
```js
const note = computeTilePitch(tile, currentTheme)
```
to:
```js
const note = proximityPitch(tile.adjacentMines, currentTheme)
```

Remove the `computePan` call and pan logic from `playTileSound` since pan is no longer coordinate-meaningful without unique pitch (the pitch itself communicates proximity now). Or keep pan if preferred — it still gives left/right orientation:
```js
// keep pan for spatial orientation even without coordinate pitch
const pan = computePan(tile)
```

**Step 3: Build + lint**
```bash
npm run build && npm run lint
```
Expected: no errors

**Step 4: Manual verify**

`npm run dev`, enable audio, hover over tiles near start (0 mines) → low clear tone. Hover near clusters of mines → distinctly higher tone. Should feel like a Geiger counter.

**Step 5: Commit**
```bash
git add src/audio/audioEngine.js
git commit -m "feat: pitch rises with mine proximity (Geiger counter feel)"
```

---

### Task 7: Final integration check

**Step 1: Run full test suite + lint + build**
```bash
npm run test && npm run lint && npm run build
```
Expected: all green

**Step 2: Smoke test in browser**
```bash
npm run dev
```
Checklist:
- [ ] Start tile is immediately visited (flag icon shows as visited dot)
- [ ] Tiles adjacent to start are lit; far tiles are dimmed
- [ ] Clicking a dimmed tile does nothing
- [ ] Building a road tile-by-tile to goal completes the round
- [ ] Trying to skip directly to goal is blocked until road reaches it
- [ ] After round, mini-grid shows glowing path cells for the route taken
- [ ] Hovering a 0-mine tile plays a low clear note
- [ ] Hovering a tile with 6+ adjacent mines plays a noticeably higher note
- [ ] Sound pitch rises progressively as you move toward mine clusters

**Step 3: Commit**
```bash
git add .
git commit -m "chore: integration verified — road mechanic + path display + proximity pitch"
```
