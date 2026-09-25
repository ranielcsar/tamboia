const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

let canChangeDirection = true

function applyDirection(key) {
  const newDir = directions[key]
  if (!newDir) return
  if (newDir.x !== -snakeDirection.x || newDir.y !== -snakeDirection.y) {
    snakeDirection = newDir
    canChangeDirection = false
  }
}

function changeSnakeDirection(event) {
  applyDirection(event.key)
}
document.addEventListener('keydown', changeSnakeDirection)

function setDirection(key) {
  applyDirection(key)
}

// touch
let touchStartX = 0
let touchStartY = 0

function handleTouchStart(event) {
  const touch = event.changedTouches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
}

function handleTouchEnd(event) {
  const touch = event.changedTouches[0]
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (Math.max(absDx, absDy) < 20) return

  if (absDx > absDy) {
    setDirection(dx > 0 ? 'ArrowRight' : 'ArrowLeft')
  } else {
    setDirection(dy > 0 ? 'ArrowDown' : 'ArrowUp')
  }
}

document.addEventListener('touchstart', handleTouchStart, { passive: true })
document.addEventListener('touchend', handleTouchEnd, { passive: true })
