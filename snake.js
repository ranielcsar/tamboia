function drawSnakeBody(ctx, snake) {
  ctx.strokeStyle = 'snow'
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = 'seagreen'
    if (i === 0) ctx.fillStyle = 'darkgreen'
    const [x, y] = [snake[i].x, snake[i].y]
    ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
    ctx.strokeRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
  }
}

function moveSnake(ctx, snake) {
  const head = snake[0]
  let newHead = { x: head.x + snakeDirection.x, y: head.y + snakeDirection.y }

  if (head.x * PIXEL < 0) {
    newHead.x = Math.floor(bodyWidth / PIXEL);
  } else if (head.x * PIXEL > bodyWidth) {
    newHead.x = 0;
  }

  if (head.y * PIXEL < 0) {
    newHead.y = Math.floor(bodyHeight / PIXEL);
  } else if (head.y * PIXEL >= bodyHeight) {
    newHead.y = 0;
  }

  snake.unshift(newHead)
  snake.pop()
}

function addNewSnakePart(snake) {
  const tail = snake[snake.length - 1]
  const beforeTail = snake[snake.length - 2] || tail
  snake.push({
    x: tail.x + (tail.x - beforeTail.x),
    y: tail.y + (tail.y - beforeTail.y)
  })
}