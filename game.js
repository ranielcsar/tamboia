function getPixelValue(width, height) {
  let [widthDiv, heightDiv] = [16, 9]

  if (width > 1360) widthDiv = widthDiv * 3
  if (height > 600) heightDiv = heightDiv * 3

  return Math.max(Math.floor(width / widthDiv), Math.floor(height / heightDiv));
}

const
  bodyWidth = document.body.offsetWidth,
  bodyHeight = document.body.offsetHeight
const
  PIXEL = getPixelValue(bodyWidth, bodyHeight),
  CANVAS = document.querySelector("#screen"),
  CTX = CANVAS.getContext('2d')
CANVAS.width = bodyWidth
CANVAS.height = bodyHeight

function changeSnakeDirection(event) {
  const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  }
  if (event.key in directions) snakeDirection = directions[event.key];
}
document.addEventListener("keydown", changeSnakeDirection);

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].screenX - touchStartX;
  const dy = e.changedTouches[0].screenY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 30) direction = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
  } else {
    if (Math.abs(dy) > 30) direction = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
  }
}, { passive: true });

function gameLoop(ctx, snake) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  moveSnake(ctx, snake)
  drawSnakeBody(ctx, snake)
  hasEatedFruit(snake, fruit, resultFruit)
  drawFruit(ctx, fruit)
  if (resultFruit) drawFruit(ctx, resultFruit)
}