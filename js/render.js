import { getTheme } from './config.js'

export function drawSnake(ctx, state, theme) {
  const { snake, pixel } = state
  if (snake.length === 0) return

  ctx.fillStyle = theme.head
  ctx.fillRect(snake[0].x * pixel, snake[0].y * pixel, pixel, pixel)
  ctx.strokeRect(snake[0].x * pixel, snake[0].y * pixel, pixel, pixel)

  ctx.fillStyle = theme.body
  for (let i = 1; i < snake.length; i++) {
    const s = snake[i]
    ctx.fillRect(s.x * pixel, s.y * pixel, pixel, pixel)
    ctx.strokeRect(s.x * pixel, s.y * pixel, pixel, pixel)
  }
}

export function drawFruit(ctx, state, fruit, theme) {
  if (!fruit) return
  const { pixel } = state

  ctx.fillStyle = theme.fruit
  ctx.fillRect(fruit.x * pixel, fruit.y * pixel, pixel, pixel)
  ctx.fillStyle = theme.text
  ctx.fillText(
    fruit.value,
    fruit.x * pixel + pixel / 2,
    fruit.y * pixel + pixel / 2
  )
}

export function render(ctx, state) {
  const theme = getTheme()
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  drawSnake(ctx, state, theme)
  if (state.fruit) drawFruit(ctx, state, state.fruit, theme)
  if (state.resultFruit) drawFruit(ctx, state, state.resultFruit, theme)
  for (const f of state.extraNormalFruits) drawFruit(ctx, state, f, theme)
}
