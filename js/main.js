import { getTheme, THEMES, setTheme } from './config.js'
import { createState } from './state.js'
import { bindControls } from './controls.js'
import { startLoop, resetGame } from './game.js'
import { updateValues } from './ui.js'
import { render } from './render.js'
;(function Game() {
  // ===== DOM =====
  const main = document.body.querySelector('main')
  const width = main.offsetWidth
  const height = main.offsetHeight

  const PIXEL = getPixelValue(width, height)
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

  const COLS = Math.floor(width / PIXEL)
  const ROWS = Math.floor(height / PIXEL)
  canvas.width = COLS * PIXEL
  canvas.height = ROWS * PIXEL

  ctx.strokeStyle = getTheme().stroke
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${PIXEL / 1.4}px Fredoka`

  // ===== Estado =====
  const state = createState(COLS, ROWS)
  state.pixel = PIXEL

  // ===== Bind =====
  bindControls(state, dom.controlButtons)
  dom.restartButton.addEventListener('click', () => resetGame(state, dom, ctx))

  // ===== Start =====
  resetGame(state, dom, ctx)
  updateValues(state, dom)
  startLoop(ctx, state, dom)

  // ===== Helpers =====
  function getPixelValue(w, h) {
    let wd = 16,
      hd = 9
    if (w > 1360) wd *= 3
    if (h > 600) hd *= 3
    return Math.min(Math.floor(w / wd), Math.floor(h / hd))
  }

  // ===== Tema =====
  function applyThemeToCanvas() {
    const t = getTheme()
    ctx.strokeStyle = t.stroke
    ctx.fillStyle = t.text
  }

  function applyTheme(name) {
    setTheme(name)
    const t = getTheme()

    // CSS vars para o HUD (header, botão, game-over)
    const root = document.documentElement.style
    root.setProperty('--bg', t.background)
    root.setProperty('--text', t.text)
    root.setProperty('--ui-text', t.uiText)
    root.setProperty('--stroke', t.stroke)
    root.setProperty('--fruit', t.fruit)

    applyThemeToCanvas()
    render(ctx, state)
  }

  const themeBtn = document.getElementById('theme-btn')
  const themeNames = Object.keys(THEMES)
  let themeIndex = 0
  themeBtn?.addEventListener('click', () => {
    themeIndex = (themeIndex + 1) % themeNames.length
    applyTheme(themeNames[themeIndex])
  })

  // expõe para o console / botões futuros
  window.setGameTheme = applyTheme
})()
