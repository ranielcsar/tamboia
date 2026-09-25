const SNAKE = [
  { x: 3, y: 1 },
  { x: 2, y: 1 },
  { x: 1, y: 1 },
]

function drawSnakeBody(ctx, snake) {
  if (snake.length === 0) return
  ctx.fillStyle = 'darkgreen'
  ctx.fillRect(snake[0].x * PIXEL, snake[0].y * PIXEL, PIXEL, PIXEL)
  ctx.strokeRect(snake[0].x * PIXEL, snake[0].y * PIXEL, PIXEL, PIXEL)
  ctx.fillStyle = 'seagreen'
  for (let i = 1; i < snake.length; i++) {
    const segment = snake[i]
    ctx.fillRect(segment.x * PIXEL, segment.y * PIXEL, PIXEL, PIXEL)
    ctx.strokeRect(segment.x * PIXEL, segment.y * PIXEL, PIXEL, PIXEL)
  }
}

let snakeDirection = { x: 1, y: 0 }
function moveSnake(snake) {
  canChangeDirection = true

  const head = snake[0]
  let newHead = {
    x: head.x + snakeDirection.x,
    y: head.y + snakeDirection.y,
  }

  if (newHead.x < 0) {
    newHead.x = COLS - 1
  } else if (newHead.x >= COLS) {
    newHead.x = 0
  }

  if (newHead.y < 0) {
    newHead.y = ROWS - 1
  } else if (newHead.y >= ROWS) {
    newHead.y = 0
  }

  if (checkSelfCollision(newHead)) {
    gameOver(snake)
    return
  }

  const tail = snake[snake.length - 1]
  snake.unshift(newHead)
  snake.pop()
  occupancy[getCellIndex(tail.x, tail.y)] = 0
  occupancy[getCellIndex(newHead.x, newHead.y)] = 1
}

function addNewSnakePart(snake) {
  const lastIndex = snake.length - 1
  const tail = snake[lastIndex]
  const beforeTail = snake[lastIndex - 1]

  const dx = tail.x - beforeTail.x
  const dy = tail.y - beforeTail.y

  const newTail = {
    x: tail.x + dx,
    y: tail.y + dy,
  }
  snake.push(newTail)
  occupancy[getCellIndex(newTail.x, newTail.y)] = 1
}

function drawScaledCell(ctx, x, y, scale) {
  const size = PIXEL * scale
  const offset = (PIXEL - size) / 2
  const px = x * PIXEL + offset
  const py = y * PIXEL + offset

  ctx.fillRect(px, py, size, size)
  ctx.strokeRect(px, py, size, size)
}

const occupancy = new Uint8Array(COLS * ROWS)

function getCellIndex(x, y) {
  return y * COLS + x
}

function updateSnakeOccupancy(snake) {
  occupancy.fill(0)
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i]
    occupancy[getCellIndex(segment.x, segment.y)] = 1
  }
}

function checkSelfCollision(newHead) {
  return occupancy[getCellIndex(newHead.x, newHead.y)] === 1
}
