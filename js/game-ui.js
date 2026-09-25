let displayedScore = -1
let displayedLevel = -1

function updateHUD(snake) {
  const score = Math.max(0, snake.length - 3)
  const level = getLevel(snake)

  if (level !== displayedLevel) {
    displayedLevel = level
    levelDisplay.innerText = `nível: ${level}`
  }
  if (score !== displayedScore) {
    displayedScore = score
    scoreDisplay.innerText = `${score} pts`
  }
}

function updateValues() {
  const { a, b } = values
  leftNumber.textContent = a === null ? '?' : a
  rightNumber.textContent = b === null ? '?' : b
  updateHUD(SNAKE)
}

function showGameOver(snake) {
  const score = Math.max(0, snake.length - 3)
  finalScoreDisplay.innerText = `${score} pts`
  gameOverDisplay.classList.remove('hidden')
}
