export function getCellIndex(state, x, y) {
  return y * state.cols + x
}

export function updateSnakeOccupancy(state) {
  state.occupancy.fill(0)
  for (const seg of state.snake) {
    state.occupancy[getCellIndex(state, seg.x, seg.y)] = 1
  }
}

export function checkSelfCollision(state, head) {
  return state.occupancy[getCellIndex(state, head.x, head.y)] === 1
}

export function moveSnake(state) {
  if (state.queuedDirection) {
    const q = state.queuedDirection
    if (!(q.x === -state.direction.x && q.y === -state.direction.y)) {
      state.direction = q
    }
    state.queuedDirection = null
  }

  const head = state.snake[0]
  const newHead = {
    x: head.x + state.direction.x,
    y: head.y + state.direction.y,
  }

  if (newHead.x < 0) newHead.x = state.cols - 1
  else if (newHead.x >= state.cols) newHead.x = 0
  if (newHead.y < 0) newHead.y = state.rows - 1
  else if (newHead.y >= state.rows) newHead.y = 0

  const tail = state.snake[state.snake.length - 1]
  const isTail = newHead.x === tail.x && newHead.y === tail.y

  if (!isTail && checkSelfCollision(state, newHead)) return false

  state.snake.unshift(newHead)
  state.snake.pop()

  state.occupancy[getCellIndex(state, tail.x, tail.y)] = 0
  state.occupancy[getCellIndex(state, newHead.x, newHead.y)] = 1
  return true
}

export function addNewSnakePart(state) {
  const last = state.snake.length - 1
  const tail = state.snake[last]
  const beforeTail = state.snake[last - 1]
  const newTail = {
    x: tail.x + (tail.x - beforeTail.x),
    y: tail.y + (tail.y - beforeTail.y),
  }
  state.snake.push(newTail)
  state.occupancy[getCellIndex(state, newTail.x, newTail.y)] = 1
}
