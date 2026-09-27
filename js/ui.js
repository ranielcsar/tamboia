import { getLevel } from './fruit.js'

export function updateHUD(state, dom) {
  const score = Math.max(0, state.snake.length - 3)
  const level = getLevel(state)

  if (level !== state.displayedLevel) {
    state.displayedLevel = level
    dom.levelDisplay.innerText = `nível: ${level}`
  }
  if (score !== state.displayedScore) {
    state.displayedScore = score
    dom.scoreDisplay.innerText = `${score} pts`
  }
}

export function updateValues(state, dom) {
  const { a, b } = state.values
  dom.leftNumber.textContent = a === null ? '?' : a
  dom.rightNumber.textContent = b === null ? '?' : b
  updateHUD(state, dom)
}

export function showGameOver(state, dom) {
  const score = Math.max(0, state.snake.length - 3)
  dom.finalScoreDisplay.innerText = `${score} pts`
  dom.gameOverDisplay.classList.remove('hidden')
}