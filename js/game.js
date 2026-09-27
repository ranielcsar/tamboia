import { moveSnake } from './snake.js'
import {
  hasEatedFruit,
  createFruit,
  createResultFruit,
  updateExtraFruits,
  resetValuesAndFruits,
} from './fruit.js'
import { render } from './render.js'
import { updateValues, showGameOver } from './ui.js'

export function gameLoop(ctx, state, dom) {
  if (state.snake.length < 3) {
    gameOver(state, dom)
    return
  }

  const alive = moveSnake(state)
  if (!alive) {
    gameOver(state, dom)
    return
  }

  hasEatedFruit(state)

  if (
    state.values.a !== null &&
    state.values.b !== null &&
    !state.resultFruit
  ) {
    state.resultFruit = createResultFruit(state, state.values.a, state.values.b)
    state.fruit = createFruit(state, state.resultFruit.value)
  }

  updateExtraFruits(state)
  updateValues(state, dom)
  render(ctx, state)
}

export function startLoop(ctx, state, dom) {
  if (state.running) return
  state.running = true
  state.lastTime = performance.now()
  state.accumulator = 0
  state.rafId = requestAnimationFrame((t) => loop(t, ctx, state, dom))
}

export function stopLoop(state) {
  state.running = false
  if (state.rafId !== null) cancelAnimationFrame(state.rafId)
  state.rafId = null
}

function loop(now, ctx, state, dom) {
  if (!state.running) return
  let delta = now - state.lastTime
  state.lastTime = now
  if (delta > 250) delta = 250

  state.accumulator += delta
  while (state.running && state.accumulator >= state.currentSpeed) {
    gameLoop(ctx, state, dom)
    state.accumulator -= state.currentSpeed
  }

  if (state.running)
    state.rafId = requestAnimationFrame((t) => loop(t, ctx, state, dom))
}

function gameOver(state, dom) {
  stopLoop(state)
  showGameOver(state, dom)
}

export function resetGame(state, dom, ctx) {
  resetValuesAndFruits(state)
  state.values = { a: null, b: null }
  state.fruit = createFruit(state)
  state.resultFruit = null
  state.extraNormalFruits = []
  state.currentSpeed = 100

  dom.gameOverDisplay.classList.add('hidden')

  state.snake.length = 0
  state.snake.push({ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 })
  state.direction = { x: 1, y: 0 }
  state.occupancy.fill(0)
  for (const s of state.snake) state.occupancy[s.y * state.cols + s.x] = 1

  stopLoop(state)
  startLoop(ctx, state, dom)
}
