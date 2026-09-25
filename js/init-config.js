function getPixelValue(width, height) {
  let widthDiv = 16
  let heightDiv = 9

  if (width > 1360) widthDiv *= 3
  if (height > 600) heightDiv *= 3

  return Math.min(Math.floor(width / widthDiv), Math.floor(height / heightDiv))
}

const main = document.body.querySelector('main'),
  bodyWidth = main.offsetWidth,
  bodyHeight = main.offsetHeight
const PIXEL = getPixelValue(bodyWidth, bodyHeight),
  CANVAS = document.body.querySelector('main > #screen'),
  CTX = CANVAS.getContext('2d'),
  levelDisplay = document.getElementById('level-display'),
  scoreDisplay = document.getElementById('score-display'),
  gameOverDisplay = document.getElementById('game-over'),
  finalScoreDisplay = document.getElementById('final-score'),
  restartButton = document.getElementById('restart-btn'),
  leftNumber = document.querySelector('.left-number span'),
  rightNumber = document.querySelector('.right-number span')

const COLS = Math.floor(bodyWidth / PIXEL)
const ROWS = Math.floor(bodyHeight / PIXEL)
CANVAS.width = COLS * PIXEL
CANVAS.height = ROWS * PIXEL
CTX.strokeStyle = 'snow'
CTX.textAlign = 'center'
CTX.textBaseline = 'middle'
CTX.font = `${PIXEL / 1.4}px Fredoka`

restartButton.addEventListener('click', () => {
  gameOverDisplay.classList.add('hidden')
  resetGame(SNAKE)
})

const controlButtons = document.querySelectorAll('.ctrl-btn[data-direction]')
controlButtons.forEach((button) => {
  button.addEventListener('click', () => setDirection(button.dataset.direction))
})
