import { getTheme, THEMES, setTheme } from './config.js'
import { createState } from './state.js'
import { bindControls } from './controls.js'
import { startLoop, resetGame } from './game.js'
import { updateValues } from './ui.js'
import { render } from './render.js'
import { bindScreens, showScreen } from './screens.js'

function Game() {
  bindScreens()
  showScreen('menu')

  const main = document.querySelector('#screen-game main')
  const canvas = main.querySelector('#screen')
  const ctx = canvas.getContext('2d')

  const dom = {
    levelDisplay: document.getElementById('level-display'),
    scoreDisplay: document.getElementById('score-display'),
    gameOverDisplay: document.getElementById('game-over'),
    finalScoreDisplay: document.getElementById('final-score'),
    restartButton: document.getElementById('restart-btn'),
    leftNumber: document.querySelector('.left-number span'),
    rightNumber: document.querySelector('.right-number span'),
    controlButtons: document.querySelectorAll('.ctrl-btn[data-direction]'),
  }

  let state = null
  let controlsBound = false

  function getPixelValue(w, h) {
    let wd = 16,
      hd = 9
    if (w > 1360) wd *= 3
    if (h > 600) hd *= 3
    return Math.min(Math.floor(w / wd), Math.floor(h / hd))
  }

  function setupCanvas() {
    const width = main.clientWidth
    const height = main.clientHeight

    const PIXEL = getPixelValue(width, height)
    const COLS = Math.max(1, Math.floor(width / PIXEL))
    const ROWS = Math.max(1, Math.floor(height / PIXEL))

    canvas.width = COLS * PIXEL
    canvas.height = ROWS * PIXEL

    ctx.strokeStyle = getTheme().stroke
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `${PIXEL / 1.4}px Fredoka`

    state = createState(COLS, ROWS)
    state.pixel = PIXEL

    if (!controlsBound) {
      bindControls(state, dom.controlButtons)
      dom.restartButton.addEventListener('click', () =>
        resetGame(state, dom, ctx)
      )
      controlsBound = true
    }

    return state
  }

  window.addEventListener('game:start', () => {
    if (!state) setupCanvas()
    resetGame(state, dom, ctx)
    updateValues(state, dom)
    startLoop(ctx, state, dom)
  })

  function applyThemeToCanvas() {
    const t = getTheme()
    ctx.strokeStyle = t.stroke
    ctx.fillStyle = t.text
  }

  function applyTheme(name) {
    setTheme(name)
    const t = getTheme()
    const root = document.documentElement.style
    root.setProperty('--bg', t.background)
    root.setProperty('--text', t.text)
    root.setProperty('--ui-text', t.uiText)
    root.setProperty('--stroke', t.stroke)
    root.setProperty('--fruit', t.fruit)
    applyThemeToCanvas()
    if (state) render(ctx, state)
  }

  const themeBtn = document.getElementById('theme-btn')
  const themeNames = Object.keys(THEMES)
  let themeIndex = 0
  themeBtn?.addEventListener('click', () => {
    themeIndex = (themeIndex + 1) % themeNames.length
    applyTheme(themeNames[themeIndex])
  })

  window.setGameTheme = applyTheme
}

Game()
