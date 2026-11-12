import { getTheme } from './config.js'
import { stopLoop } from './game.js'

const LAYOUT = {
  overlayAlpha: 0.65,
  pulseSpeed: 0.006,
  pulseAmplitude: 0.1,
  ringRadiusMultiplier: 1.2,
  ringLineWidthMin: 2,
  ringLineWidthMultiplier: 0.12,
  fontBaseDivisor: 1.6,
  textYOffsetMultiplier: 2.2,
  holeRadiusHead: 1.2,
  holeRadiusFruit: 1.2,
  fruitFontDivisor: 1.4,
  calcResultOffsetMultiplier: 1.8,
}

const SCENARIO = {
  moveDuration: 450,
  growDuration: 400,
  shrinkDuration: 400,
  markDuration: 1200,
  initialSnakeHead: { x: 6, y: 5 },
  initialSnakeBody: [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
  ],
  endSnake: [
    { x: 14, y: 5 },
    { x: 13, y: 5 },
    { x: 12, y: 5 },
  ],
  answerFruitOffset: { x: 3, y: 0 },
}

const HIGHLIGHT_CLASS = 'tutorial-highlight'
const DOM_KEYS = ['calc', 'leftNumber', 'rightNumber', 'scoreDisplay']
const TEXT_KEYS = ['leftNumber', 'rightNumber', 'scoreDisplay']

const FONT_FAMILY = 'Fredoka, sans-serif'

const shared = { snake: null }

let reqAnimFrameId = null
let activeStep = null
let activeCtx = null
let activeDom = null
let domSnapshot = null

function getBaseFontPx(pixel) {
  return Math.max(14, Math.floor(pixel / LAYOUT.fontBaseDivisor))
}

function getFruitFontPx(pixel) {
  return Math.floor(pixel / LAYOUT.fruitFontDivisor)
}

function setFont(ctx, px) {
  ctx.font = `${px}px ${FONT_FAMILY}`
}

function cloneSnake(snake) {
  return snake.map((cell) => ({ ...cell }))
}

function getExtendedTail(snake) {
  const tail = snake[snake.length - 1]
  const beforeTail = snake[snake.length - 2]
  return {
    x: tail.x + (tail.x - beforeTail.x),
    y: tail.y + (tail.y - beforeTail.y),
  }
}

function clearHighlights(dom) {
  if (!dom) return
  for (const key of DOM_KEYS) dom[key]?.classList.remove(HIGHLIGHT_CLASS)
}

function snapshotDom(dom) {
  if (!dom) return null
  const snapshot = {}
  for (const key of TEXT_KEYS) {
    if (dom[key]) snapshot[key] = dom[key].textContent
  }
  return snapshot
}

function restoreDom(dom, snapshot) {
  if (!dom || !snapshot) return
  for (const key of TEXT_KEYS) {
    if (dom[key] && key in snapshot) dom[key].textContent = snapshot[key]
  }
}

function drawOverlay(ctx, w, h) {
  ctx.save()
  ctx.fillStyle = `rgba(0,0,0,${LAYOUT.overlayAlpha})`
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function drawSnake(ctx, snake, pixel, theme) {
  ctx.save()
  ctx.lineWidth = 1
  ctx.strokeStyle = theme.stroke

  const head = snake[0]
  ctx.fillStyle = theme.head
  ctx.fillRect(head.x * pixel, head.y * pixel, pixel, pixel)
  ctx.strokeRect(head.x * pixel, head.y * pixel, pixel, pixel)

  ctx.fillStyle = theme.body
  for (let i = 1; i < snake.length; i++) {
    ctx.fillRect(snake[i].x * pixel, snake[i].y * pixel, pixel, pixel)
    ctx.strokeRect(snake[i].x * pixel, snake[i].y * pixel, pixel, pixel)
  }
  ctx.restore()
}

function drawCell(ctx, cell, pixel, theme, alpha) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.lineWidth = 1
  ctx.strokeStyle = theme.stroke
  ctx.fillStyle = theme.body
  ctx.fillRect(cell.x * pixel, cell.y * pixel, pixel, pixel)
  ctx.strokeRect(cell.x * pixel, cell.y * pixel, pixel, pixel)
  ctx.restore()
}

function drawFruit(ctx, fruit, pixel, theme) {
  ctx.fillStyle = theme.fruit
  ctx.fillRect(fruit.x * pixel, fruit.y * pixel, pixel, pixel)

  setFont(ctx, getFruitFontPx(pixel))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = theme.text
  ctx.fillText(
    fruit.value,
    fruit.x * pixel + pixel / 2,
    fruit.y * pixel + pixel / 2
  )
}

function drawPulseRing(ctx, cx, cy, pixel, t, theme, text = null, alpha = 1) {
  const pulse = 1 + Math.sin(t * LAYOUT.pulseSpeed) * LAYOUT.pulseAmplitude
  const ringR = pixel * LAYOUT.ringRadiusMultiplier * pulse

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = theme.stroke
  ctx.lineWidth = Math.max(
    LAYOUT.ringLineWidthMin,
    pixel * LAYOUT.ringLineWidthMultiplier
  )
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  if (text) {
    ctx.save()
    setFont(ctx, getBaseFontPx(pixel))
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = theme.text
    ctx.fillText(text, cx, cy + pixel * LAYOUT.textYOffsetMultiplier)
    ctx.restore()
  }
}

function drawTexts(ctx, w, h, pixel, lines, theme) {
  ctx.save()
  setFont(ctx, getBaseFontPx(pixel))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = theme.text

  lines.forEach((line, index) => {
    const yPos = h - pixel * (2 + (lines.length - 1 - index))
    ctx.fillText(line, w / 2, yPos)
  })
  ctx.restore()
}

function carveHoles(ctx, pixel, holes) {
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  for (const hcell of holes) {
    ctx.beginPath()
    ctx.arc(
      hcell.x * pixel + pixel / 2,
      hcell.y * pixel + pixel / 2,
      hcell.r,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
  ctx.restore()
}

function buildHoles(snake, fruits, pixel, extraHole = null) {
  const holes = [
    {
      x: snake[0].x,
      y: snake[0].y,
      r: pixel,
    },
  ]
  for (const f of fruits) {
    holes.push({
      x: f.x,
      y: f.y,
      r: pixel,
    })
  }
  if (extraHole) {
    holes.push({
      x: extraHole.x,
      y: extraHole.y,
      r: pixel,
    })
  }
  return holes
}

function stepSnakeToward(snake, target) {
  const head = snake[0]
  const next = {
    x: head.x + Math.sign(target.x - head.x),
    y: head.y,
  }
  snake.unshift(next)
  snake.pop()
  return next.x === target.x && next.y === target.y
}

function addCanvasListener(canvas, handler) {
  canvas.addEventListener('pointerdown', handler)
  return () => canvas.removeEventListener('pointerdown', handler)
}

function createAnswerStep({
  id,
  outcome,
  fruitValue,
  popupText,
  popupHint,
  doneTexts,
}) {
  const grow = outcome === 'grow'

  return {
    id,
    snake: cloneSnake(SCENARIO.endSnake),
    setup(dom) {
      const base = cloneSnake(shared.snake ?? SCENARIO.endSnake)
      const head = base[0]

      this.t = 0
      this.phase = 'show-fruits'
      this.snake = grow ? base : [...base, getExtendedTail(base)]
      this.fruit = {
        x: head.x + SCENARIO.answerFruitOffset.x,
        y: head.y + SCENARIO.answerFruitOffset.y,
        value: fruitValue,
      }
      this.cell = null
      this.eaten = false
      this.moveT = 0
      this.markT = 0
      this.animT = 0
      this.moveDuration = SCENARIO.moveDuration
      this.animDuration = grow ? SCENARIO.growDuration : SCENARIO.shrinkDuration
      this.dom = dom

      if (dom) {
        dom.leftNumber.textContent = '3'
        dom.rightNumber.textContent = '4'
        dom.scoreDisplay.textContent = grow ? '0 pts' : '1 pts'
      }
    },
    update(dt) {
      this.t += dt

      if (this.phase === 'moving') {
        this.moveT += dt
        while (this.moveT >= this.moveDuration) {
          this.moveT -= this.moveDuration
          if (stepSnakeToward(this.snake, this.fruit)) {
            this.eaten = true
            this.animT = 0
            if (grow) {
              this.cell = getExtendedTail(this.snake)
              this.phase = 'growing'
            } else {
              this.cell = this.snake.pop()
              this.markT = 0
              this.phase = 'marking'
            }
            break
          }
        }
        return
      }

      if (this.phase === 'marking') {
        this.markT += dt
        if (this.markT >= SCENARIO.markDuration) {
          this.phase = 'shrinking'
          this.animT = 0
        }
        return
      }

      if (this.phase === 'growing' || this.phase === 'shrinking') {
        this.animT += dt
        if (this.animT >= this.animDuration) {
          if (!grow) this.cell = null
          this.phase = 'show-done'
          this.t = 0
          if (this.dom?.scoreDisplay) {
            this.dom.scoreDisplay.textContent = grow ? '1 pts' : '0 pts'
            this.dom.scoreDisplay.classList.add(HIGHLIGHT_CLASS)
          }
        }
      }
    },
    getCellAlpha() {
      const progress = Math.min(1, this.animT / this.animDuration)
      if (grow) return this.phase === 'growing' ? progress : 1
      return this.phase === 'shrinking' ? 1 - progress : 1
    },
    draw(ctx, state) {
      const pixel = state.pixel
      const theme = getTheme()
      const w = ctx.canvas.width
      const h = ctx.canvas.height

      drawOverlay(ctx, w, h)

      const visibleFruits = this.eaten ? [] : [this.fruit]

      carveHoles(
        ctx,
        pixel,
        buildHoles(this.snake, visibleFruits, pixel, this.cell)
      )

      drawSnake(ctx, this.snake, pixel, theme)

      const cellAlpha = this.getCellAlpha()
      if (this.cell) drawCell(ctx, this.cell, pixel, theme, cellAlpha)

      visibleFruits.forEach((f) => drawFruit(ctx, f, pixel, theme))

      if (this.phase === 'show-fruits') {
        const cx = this.fruit.x * pixel + pixel / 2
        const cy = this.fruit.y * pixel + pixel / 2
        drawPulseRing(ctx, cx, cy, pixel, this.t, theme)

        ctx.save()
        setFont(ctx, getBaseFontPx(pixel))
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = theme.text
        ctx.fillText(
          popupText,
          cx,
          cy - pixel * LAYOUT.calcResultOffsetMultiplier
        )
        ctx.fillText(popupHint, cx, cy + pixel * LAYOUT.textYOffsetMultiplier)
        ctx.restore()
      }

      const ringOnCell =
        this.cell &&
        (grow
          ? this.phase === 'show-done'
          : this.phase === 'marking' || this.phase === 'shrinking')

      if (ringOnCell) {
        drawPulseRing(
          ctx,
          this.cell.x * pixel + pixel / 2,
          this.cell.y * pixel + pixel / 2,
          pixel,
          this.t,
          theme,
          null,
          cellAlpha
        )
      }

      const texts = ['Acerte a multiplicação!']
      if (this.eaten) {
        texts[0] = doneTexts[0]
        texts.push(doneTexts[1])
        if (this.phase === 'show-done') texts.push('Clique para continuar')
      }
      drawTexts(ctx, w, h, pixel, texts, theme)
    },
    bindNext(canvas, finish) {
      const onClick = () => {
        if (this.phase === 'show-fruits') {
          this.phase = 'moving'
          this.moveT = 0
        } else if (this.phase === 'show-done') {
          removeListener()
          clearHighlights(this.dom)
          finish()
        }
      }
      const removeListener = addCanvasListener(canvas, onClick)
      this._removeListener = removeListener
    },
  }
}

export const tutorialSteps = [
  {
    id: 'snake-head',
    snake: [{ ...SCENARIO.initialSnakeHead }, ...SCENARIO.initialSnakeBody],
    setup() {
      this.t = 0
    },
    update(dt) {
      this.t += dt
    },
    draw(ctx, state) {
      const pixel = state.pixel
      const theme = getTheme()
      const w = ctx.canvas.width
      const h = ctx.canvas.height
      const head = this.snake[0]
      const cx = head.x * pixel + pixel / 2
      const cy = head.y * pixel + pixel / 2

      drawOverlay(ctx, w, h)
      carveHoles(ctx, pixel, [{ x: head.x, y: head.y, r: pixel }])
      drawSnake(ctx, this.snake, pixel, theme)
      drawPulseRing(
        ctx,
        cx,
        cy,
        pixel,
        this.t,
        theme,
        'Esta é a cabeça da cobra'
      )
      drawTexts(
        ctx,
        w,
        h,
        pixel,
        ['Ela segue a direção que você escolher'],
        theme
      )
    },
    bindNext(canvas, finish) {
      const remove = addCanvasListener(canvas, () => {
        remove()
        finish()
      })
      this._removeListener = remove
    },
  },
  {
    id: 'eat-fruits',
    snake: [{ ...SCENARIO.initialSnakeHead }, ...SCENARIO.initialSnakeBody],
    fruits: [
      { x: 10, y: 5, value: 3 },
      { x: 14, y: 5, value: 4 },
    ],
    setup(dom) {
      this.t = 0
      this.phase = 'show-first'
      this.snake = [
        { ...SCENARIO.initialSnakeHead },
        ...SCENARIO.initialSnakeBody,
      ]
      this.moveT = 0
      this.moveDuration = SCENARIO.moveDuration
      this.eaten = []
      this.dom = dom

      if (dom?.calc) dom.calc.classList.add(HIGHLIGHT_CLASS)
      if (dom) {
        dom.leftNumber.textContent = '?'
        dom.rightNumber.textContent = '?'
      }
    },
    update(dt) {
      this.t += dt
      if (
        this.phase === 'moving-to-first' ||
        this.phase === 'moving-to-second'
      ) {
        this.moveT += dt
        while (this.moveT >= this.moveDuration) {
          this.moveT -= this.moveDuration
          const target =
            this.phase === 'moving-to-first' ? this.fruits[0] : this.fruits[1]
          const ate = stepSnakeToward(this.snake, target)

          if (ate) {
            if (this.phase === 'moving-to-first') {
              this.eaten.push(this.fruits[0])
              this.phase = 'show-second'
              if (this.dom?.calc)
                this.dom.calc.classList.remove(HIGHLIGHT_CLASS)
              if (this.dom?.leftNumber) {
                this.dom.leftNumber.classList.add(HIGHLIGHT_CLASS)
                this.dom.leftNumber.textContent = this.fruits[0].value
              }
            } else {
              this.eaten.push(this.fruits[1])
              this.phase = 'done'
              shared.snake = cloneSnake(this.snake)
              if (this.dom?.leftNumber)
                this.dom.leftNumber.classList.remove(HIGHLIGHT_CLASS)
              if (this.dom?.rightNumber) {
                this.dom.rightNumber.classList.add(HIGHLIGHT_CLASS)
                this.dom.rightNumber.textContent = this.fruits[1].value
              }
            }
            this.t = 0
            break
          }
        }
      }
    },
    draw(ctx, state) {
      const pixel = state.pixel
      const theme = getTheme()
      const w = ctx.canvas.width
      const h = ctx.canvas.height

      drawOverlay(ctx, w, h)

      const visibleFruits = this.fruits.filter(
        (f, i) =>
          !this.eaten.includes(f) &&
          (i === 0 ||
            (this.phase !== 'show-first' && this.phase !== 'moving-to-first'))
      )

      carveHoles(ctx, pixel, buildHoles(this.snake, visibleFruits, pixel))
      drawSnake(ctx, this.snake, pixel, theme)
      visibleFruits.forEach((f) => drawFruit(ctx, f, pixel, theme))

      if (this.phase === 'show-first') {
        const f = this.fruits[0]
        drawPulseRing(
          ctx,
          f.x * pixel + pixel / 2,
          f.y * pixel + pixel / 2,
          pixel,
          this.t,
          theme,
          'A fruta contém um número!'
        )
      }

      const msg =
        this.phase === 'show-first' || this.phase === 'moving-to-first'
          ? 'Ela vira o primeiro número da conta'
          : 'Agora o segundo número'
      drawTexts(ctx, w, h, pixel, [msg], theme)
    },
    bindNext(canvas, finish) {
      const onClick = () => {
        if (this.phase === 'show-first') {
          this.phase = 'moving-to-first'
          this.moveT = 0
        } else if (this.phase === 'show-second') {
          this.phase = 'moving-to-second'
          this.moveT = 0
        } else if (this.phase === 'done') {
          remove()
          clearHighlights(this.dom)
          finish()
        }
      }
      const remove = addCanvasListener(canvas, onClick)
      this._removeListener = remove
    },
  },
  createAnswerStep({
    id: 'correct-answer',
    outcome: 'grow',
    fruitValue: 12,
    popupText: '3 x 4 = 12',
    popupHint: 'Escolha a fruta correta!',
    doneTexts: ['Você acertou!', 'A cobra cresce e você ganha pontos!'],
  }),
  createAnswerStep({
    id: 'wrong-answer',
    outcome: 'shrink',
    fruitValue: 14,
    popupText: '3 x 4 = 12',
    popupHint: 'Cuidado com a fruta errada!',
    doneTexts: ['Você errou!', 'A cobra diminui e você perde pontos!'],
  }),
]

function cleanupTutorial(state) {
  if (reqAnimFrameId !== null) cancelAnimationFrame(reqAnimFrameId)
  reqAnimFrameId = null

  if (activeStep?._removeListener) {
    activeStep._removeListener()
    activeStep._removeListener = null
  }
  activeStep = null

  clearHighlights(activeDom)
  restoreDom(activeDom, domSnapshot)

  if (activeCtx) {
    activeCtx.clearRect(0, 0, activeCtx.canvas.width, activeCtx.canvas.height)
  }

  for (const step of tutorialSteps) {
    step.dom = null
    step.cell = null
  }

  shared.snake = null
  activeCtx = null
  activeDom = null
  domSnapshot = null
  state.tutorialActive = false
}

export function startTutorial(ctx, state, dom, onFinish) {
  if (state.tutorialActive) stopTutorial(state)

  stopLoop(state)
  state.tutorialActive = true

  activeCtx = ctx
  activeDom = dom
  domSnapshot = snapshotDom(dom)
  shared.snake = null

  let stepIndex = 0

  function runStep() {
    const step = tutorialSteps[stepIndex]
    if (!step) {
      finish()
      return
    }
    activeStep = step
    step.setup?.(dom)

    let last = 0
    let started = false

    const stepLoop = (now) => {
      if (!started) {
        last = now
        started = true
      }
      const dt = now - last
      last = now

      step.update?.(dt)

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      step.draw(ctx, state)

      reqAnimFrameId = requestAnimationFrame(stepLoop)
    }
    reqAnimFrameId = requestAnimationFrame(stepLoop)

    const advance = () => {
      if (reqAnimFrameId !== null) cancelAnimationFrame(reqAnimFrameId)
      reqAnimFrameId = null
      activeStep = null
      stepIndex++
      runStep()
    }
    step.bindNext?.(ctx.canvas, advance)
  }

  function finish() {
    cleanupTutorial(state)
    onFinish?.()
  }

  runStep()
}

export function stopTutorial(state) {
  cleanupTutorial(state)
}
