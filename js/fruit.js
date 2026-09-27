import { CONFIG } from './config.js'
import { getCellIndex, addNewSnakePart } from './snake.js'

function isOccupied(state, x, y) {
  if (state.occupancy[getCellIndex(state, x, y)] === 1) return true
  for (const f of state.extraNormalFruits)
    if (f.x === x && f.y === y) return true
  if (state.fruit && state.fruit.x === x && state.fruit.y === y) return true
  if (
    state.resultFruit &&
    state.resultFruit.x === x &&
    state.resultFruit.y === y
  )
    return true
  return false
}

export function getEmptyPosition(state) {
  const total = state.cols * state.rows
  const occupied =
    state.snake.length +
    state.extraNormalFruits.length +
    (state.fruit ? 1 : 0) +
    (state.resultFruit ? 1 : 0)

  if (occupied >= total) return null

  const maxAttempts = Math.min(32, total - occupied)
  for (let i = 0; i < maxAttempts; i++) {
    const x = Math.floor(Math.random() * state.cols)
    const y = Math.floor(Math.random() * state.rows)
    if (!isOccupied(state, x, y)) return { x, y }
  }

  const start = Math.floor(Math.random() * total)
  for (let i = 0; i < total; i++) {
    const index = (start + i) % total
    const x = index % state.cols
    const y = Math.floor(index / state.cols)
    if (!isOccupied(state, x, y)) return { x, y }
  }
  return null
}

export function createFruit(state, value, position) {
  let newValue = Math.floor(Math.random() * 9) + 1

  if (value !== undefined) {
    const { a, b } = state.values

    if (a === 1 && b === 1) return null

    if (a === 0 || a === 1 || b === 0 || b === 1) {
      newValue = a === 0 || b === 0 ? 0 : 1
    } else {
      const candidates = [
        a * (b - 1),
        a * (b + 1),
        (a - 1) * b,
        (a + 1) * b,
        value - 2,
        value + 2,
        value - 4,
        value + 4,
      ]
      const used = new Set()
      for (const f of state.extraNormalFruits) used.add(f.value)
      if (state.fruit) used.add(state.fruit.value)

      let count = 0
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i]
        if (c >= 0 && c !== value && c % 2 === value % 2 && !used.has(c)) {
          candidates[count++] = c
        }
      }
      if (count > 0) newValue = candidates[Math.floor(Math.random() * count)]
      else {
        let fallback = value + 2
        while (used.has(fallback) || fallback === value) fallback += 2
        newValue = fallback
      }
    }
  }

  const pos = position || getEmptyPosition(state)
  if (!pos) return null
  return { x: pos.x, y: pos.y, value: newValue }
}

export function createResultFruit(state, a, b) {
  const pos = getEmptyPosition(state)
  if (!pos) return null
  return { x: pos.x, y: pos.y, value: a * b }
}

export function updateExtraFruits(state) {
  const { a, b } = state.values
  if (a === null || b === null || a === 1 || b === 1) {
    state.extraNormalFruits = []
    return
  }

  const target = getTargetFruitCount(state)
  let total =
    (state.fruit ? 1 : 0) +
    (state.resultFruit ? 1 : 0) +
    state.extraNormalFruits.length

  while (total < target) {
    const pos = getEmptyPosition(state)
    if (!pos) break
    const refVal = state.resultFruit ? state.resultFruit.value : undefined
    const nf = createFruit(state, refVal, pos)
    if (!nf) break
    state.extraNormalFruits.push(nf)
    total++
  }
  while (total > target && state.extraNormalFruits.length > 0) {
    state.extraNormalFruits.pop()
    total--
  }
}

function getTargetFruitCount(state) {
  const level = getLevel(state)
  if (level <= 1) return 2
  return Math.min(1 + level, CONFIG.maxFruits)
}

export function getLevel(state) {
  const score = Math.max(0, state.snake.length - 3)
  return Math.floor(score / CONFIG.levelScoreStep) + 1
}

export function checkSpeed(state) {
  const level = getLevel(state)
  state.currentSpeed = Math.max(
    CONFIG.minSpeed,
    CONFIG.initialSpeed - (level - 1) * CONFIG.speedStep
  )
}

function hasEatFruit(snake, fruit) {
  if (!fruit) return false
  const head = snake[0]
  return head.x === fruit.x && head.y === fruit.y
}

export function resetValuesAndFruits(state) {
  state.values = { a: null, b: null }
  state.extraNormalFruits = []
  state.fruit = createFruit(state)
  state.resultFruit = null
}

export function hasEatedFruit(state) {
  const snake = state.snake

  for (let i = 0; i < state.extraNormalFruits.length; i++) {
    if (hasEatFruit(snake, state.extraNormalFruits[i])) {
      const eatenVal = state.extraNormalFruits[i].value
      state.extraNormalFruits.splice(i, 1)
      if (!state.values.a) {
        state.values.a = eatenVal
      } else if (!state.values.b) {
        state.values.b = eatenVal
      } else if (state.values.a && state.values.b && state.resultFruit) {
        resetValuesAndFruits(state)
        snake.pop()
      }
      checkSpeed(state)
      return
    }
  }

  if (hasEatFruit(snake, state.fruit)) {
    if (!state.values.a) {
      state.values.a = state.fruit.value
      state.fruit = createFruit(state)
    } else if (!state.values.b) {
      state.values.b = state.fruit.value
    } else if (state.values.a && state.values.b && state.resultFruit) {
      resetValuesAndFruits(state)
      const removed = snake.pop()
      if (removed)
        state.occupancy[getCellIndex(state, removed.x, removed.y)] = 0
    }
    checkSpeed(state)
    return
  }

  if (state.resultFruit && hasEatFruit(snake, state.resultFruit)) {
    resetValuesAndFruits(state)
    addNewSnakePart(state)
    checkSpeed(state)
  }
}
