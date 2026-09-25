let currentSpeed = 100
let rafId = null
let running = false
let lastTime = 0
let accumulator = 0

function startLoop() {
  if (running) return
  running = true
  lastTime = performance.now()
  accumulator = 0
  rafId = requestAnimationFrame(loop)
}

function stopLoop() {
  running = false
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
}

function loop(now) {
  if (!running) return
  let delta = now - lastTime
  lastTime = now
  if (delta > 250) delta = 250 // evita salto grande ao voltar de uma aba em background

  accumulator += delta
  while (running && accumulator >= currentSpeed) {
    gameLoop(CTX, SNAKE)
    accumulator -= currentSpeed
  }

  if (running) rafId = requestAnimationFrame(loop)
}

function getLevel(snake) {
  const score = Math.max(0, snake.length - 3)
  return Math.floor(score / 10) + 1
}

function getTargetFruitCount(snake) {
  const level = getLevel(snake)
  if (level <= 1) return 2
  return Math.min(1 + level, 6)
}

function checkSpeed(snake) {
  const level = getLevel(snake)
  const targetSpeed = Math.max(50, 100 - (level - 1) * 5)
  currentSpeed = targetSpeed
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function resetGame(snake) {
  snake.length = 0
  snake.push({ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 })
  snakeDirection = { x: 1, y: 0 }
  currentSpeed = 100
  displayedScore = -1
  displayedLevel = -1

  gameOverDisplay.classList.add('hidden')

  resetValuesAndFruits()
  updateSnakeOccupancy(snake)
  updateValues()

  stopLoop()
  startLoop()
}

function gameOver(snake) {
  stopLoop()
  showGameOver(snake)
}

function gameLoop(ctx, snake) {
  if (snake.length < 3) {
    gameOver(snake)
    return
  }

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  moveSnake(snake)
  drawSnakeBody(ctx, snake)
  hasEatedFruit(snake)

  if (values.a !== null && values.b !== null && !resultFruit) {
    resultFruit = createResultFruit({ a: values.a, b: values.b })
    fruit = createFruit(resultFruit.value)
  }

  updateExtraFruits(snake)

  if (fruit) drawFruit(ctx, fruit)
  if (resultFruit) drawFruit(ctx, resultFruit)
  for (let i = 0; i < extraNormalFruits.length; i++) {
    drawFruit(ctx, extraNormalFruits[i])
  }
}
