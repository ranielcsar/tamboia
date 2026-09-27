import { CONFIG } from './config.js'

export function createState(cols, rows) {
  return {
    // grid
    cols,
    rows,
    pixel: 0, // definido depois

    // cobra
    snake: CONFIG.initialSnake.map((s) => ({ ...s })),
    direction: { ...CONFIG.initialDirection },
    canChangeDirection: true,

    // frutas
    fruit: null,
    resultFruit: null,
    extraNormalFruits: [],
    values: { a: null, b: null },

    // loop
    currentSpeed: CONFIG.initialSpeed,
    running: false,
    rafId: null,
    lastTime: 0,
    accumulator: 0,

    // HUD
    displayedScore: -1,
    displayedLevel: -1,

    // grid de ocupação
    occupancy: new Uint8Array(cols * rows),
  }
}

export function resetState(state) {
  state.snake = CONFIG.initialSnake.map((s) => ({ ...s }))
  state.direction = { ...CONFIG.initialDirection }
  state.canChangeDirection = true
  state.fruit = null
  state.resultFruit = null
  state.extraNormalFruits = []
  state.values = { a: null, b: null }
  state.currentSpeed = CONFIG.initialSpeed
  state.displayedScore = -1
  state.displayedLevel = -1
  state.occupancy.fill(0)
}