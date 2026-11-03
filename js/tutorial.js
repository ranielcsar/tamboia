import { getTheme } from './config.js'
import { stopLoop } from './game.js'

function drawOverlay(ctx, w, h) {
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function drawSnake(ctx, snake, pixel, theme) {
  const head = snake[0]
  ctx.fillStyle = theme.head
  ctx.fillRect(head.x * pixel, head.y * pixel, pixel, pixel)
  ctx.strokeStyle = theme.stroke
  ctx.strokeRect(head.x * pixel, head.y * pixel, pixel, pixel)

  ctx.fillStyle = theme.body
  for (let i = 1; i < snake.length; i++) {
    const s = snake[i]
    ctx.fillRect(s.x * pixel, s.y * pixel, pixel, pixel)
    ctx.strokeRect(s.x * pixel, s.y * pixel, pixel, pixel)
  }
}

function drawPulseRing(ctx, cx, cy, pixel, t, theme, text = null) {
  const pulse = 1 + Math.sin(t * 0.006) * 0.15
  const ringR = pixel * 1.5 * pulse

  ctx.save()
  ctx.strokeStyle = theme.stroke
  ctx.lineWidth = Math.max(2, pixel * 0.12)
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  if (text) {
    const fontPx = Math.max(14, Math.floor(pixel / 1.6))
    ctx.save()
    ctx.font = `${fontPx}px Fredoka, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = theme.text
    ctx.fillText(text, cx, cy + pixel * 2.2)
    ctx.restore()
  }
}

function drawTexts(ctx, w, h, pixel, lines) {
  const fontPx = Math.max(14, Math.floor(pixel / 1.6))
  ctx.save()
  ctx.font = `${fontPx}px Fredoka, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = getTheme().text

  lines.forEach((line, index) => {
    // renderiza de baixo para cima baseado na quantidade de linhas
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

// --- PASSOS DO TUTORIAL ---

export const tutorialSteps = [
  {
    id: 'snake-head',
    snake: [
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ],
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
      carveHoles(ctx, pixel, [{ x: head.x, y: head.y, r: pixel * 1.6 }])
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
      drawTexts(ctx, w, h, pixel, ['Ela segue a direção que você escolher'])
    },
    bindNext(canvas, finish) {
      const onNext = () => {
        canvas.removeEventListener('pointerdown', onNext)
        finish()
      }
      canvas.addEventListener('pointerdown', onNext)
    },
  },
  {
    id: 'eat-fruits',
    snake: [
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ],
    fruits: [
      { x: 8, y: 5, value: 3 },
      { x: 11, y: 5, value: 4 },
    ],
    setup(dom) {
      this.t = 0
      this.phase = 'show-first'
      this.snake = [
        { x: 6, y: 5 },
        { x: 5, y: 5 },
        { x: 4, y: 5 },
      ]
      this.moveT = 0
      this.moveDuration = 450
      this.eaten = []
      this.dom = dom

      if (dom?.calc) dom.calc.classList.add('tutorial-highlight')
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
          const head = this.snake[0]
          this.snake.unshift({
            x: head.x + Math.sign(target.x - head.x),
            y: head.y + Math.sign(target.y - head.y),
          })
          this.snake.pop()

          if (head.x === target.x && head.y === target.y) {
            if (this.phase === 'moving-to-first') {
              this.eaten.push(this.fruits[0])
              this.phase = 'show-second'
              if (this.dom)
                this.dom.leftNumber.textContent = this.fruits[0].value
            } else {
              this.eaten.push(this.fruits[1])
              this.phase = 'done'
              if (this.dom)
                this.dom.rightNumber.textContent = this.fruits[1].value
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

      const holes = [{ x: this.snake[0].x, y: this.snake[0].y, r: pixel * 1.4 }]
      visibleFruits.forEach((f) =>
        holes.push({ x: f.x, y: f.y, r: pixel * 1.2 })
      )
      carveHoles(ctx, pixel, holes)

      drawSnake(ctx, this.snake, pixel, theme)

      // desenha frutas
      visibleFruits.forEach((f) => {
        ctx.fillStyle = theme.fruit
        ctx.fillRect(f.x * pixel, f.y * pixel, pixel, pixel)
        ctx.fillStyle = theme.text
        ctx.font = `${Math.floor(pixel / 1.4)}px Fredoka, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(f.value, f.x * pixel + pixel / 2, f.y * pixel + pixel / 2)
      })

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
      drawTexts(ctx, w, h, pixel, [msg])
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
          canvas.removeEventListener('pointerdown', onClick)
          if (this.dom?.calc)
            this.dom.calc.classList.remove('tutorial-highlight')
          finish()
        }
      }
      canvas.addEventListener('pointerdown', onClick)
    },
  },
  {
    id: 'correct-answer',
    snake: [
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ],
    fruits: [
      { x: 8, y: 5, value: 12 },
      { x: 11, y: 5, value: 14 },
    ],
    setup(dom) {
      this.t = 0
      this.phase = 'show-fruits'
      this.snake = [
        { x: 6, y: 5 },
        { x: 5, y: 5 },
        { x: 4, y: 5 },
      ]
      this.moveT = 0
      this.moveDuration = 450
      this.eaten = []
      this.dom = dom
      this.growT = 0
      this.growDuration = 400

      if (dom?.calc) dom.calc.classList.add('tutorial-highlight')
      if (dom) {
        dom.leftNumber.textContent = '3'
        dom.rightNumber.textContent = '4'
        dom.scoreDisplay.textContent = '0 pts'
      }
    },
    update(dt) {
      this.t += dt
      if (this.phase === 'moving-to-correct') {
        this.moveT += dt
        while (this.moveT >= this.moveDuration) {
          this.moveT -= this.moveDuration
          const target = this.fruits[0]
          const head = this.snake[0]
          this.snake.unshift({
            x: head.x + Math.sign(target.x - head.x),
            y: head.y + Math.sign(target.y - head.y),
          })
          this.snake.pop()

          if (head.x === target.x && head.y === target.y) {
            this.eaten.push(target)
            this.phase = 'growing'
            this.growT = 0
            if (this.dom) this.dom.scoreDisplay.textContent = '1 pts'

            const last = this.snake.length - 1
            const tail = this.snake[last]
            const beforeTail = this.snake[last - 1]
            this.newTail = {
              x: tail.x + (tail.x - beforeTail.x),
              y: tail.y + (tail.y - beforeTail.y),
            }
            break
          }
        }
      }
      if (this.phase === 'growing' && (this.growT += dt) >= this.growDuration) {
        this.phase = 'show-done'
        this.t = 0
      }
    },
    draw(ctx, state) {
      const pixel = state.pixel
      const theme = getTheme()
      const w = ctx.canvas.width
      const h = ctx.canvas.height

      drawOverlay(ctx, w, h)
      const visibleFruits = this.fruits.filter(
        (f, i) => !this.eaten.includes(f) && i === 0
      )

      const holes = [{ x: this.snake[0].x, y: this.snake[0].y, r: pixel * 1.4 }]
      visibleFruits.forEach((f) =>
        holes.push({ x: f.x, y: f.y, r: pixel * 1.2 })
      )
      if (this.newTail && ['growing', 'show-done'].includes(this.phase)) {
        holes.push({ x: this.newTail.x, y: this.newTail.y, r: pixel * 1.2 })
      }
      carveHoles(ctx, pixel, holes)

      drawSnake(ctx, this.snake, pixel, theme)

      if (this.newTail && ['growing', 'show-done'].includes(this.phase)) {
        ctx.save()
        ctx.globalAlpha = Math.min(1, this.growT / this.growDuration)
        ctx.fillStyle = theme.body
        ctx.fillRect(
          this.newTail.x * pixel,
          this.newTail.y * pixel,
          pixel,
          pixel
        )
        ctx.strokeRect(
          this.newTail.x * pixel,
          this.newTail.y * pixel,
          pixel,
          pixel
        )
        ctx.restore()
      }

      visibleFruits.forEach((f) => {
        ctx.fillStyle = theme.fruit
        ctx.fillRect(f.x * pixel, f.y * pixel, pixel, pixel)
        ctx.fillStyle = theme.text
        ctx.font = `${Math.floor(pixel / 1.4)}px Fredoka, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(f.value, f.x * pixel + pixel / 2, f.y * pixel + pixel / 2)
      })

      if (this.phase === 'show-fruits') {
        const f = this.fruits[0]
        const cx = f.x * pixel + pixel / 2
        const cy = f.y * pixel + pixel / 2
        drawPulseRing(ctx, cx, cy, pixel, this.t, theme)
        const fontPx = Math.max(14, Math.floor(pixel / 1.6))
        ctx.save()
        ctx.font = `${fontPx}px Fredoka, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = theme.text
        ctx.fillText('3 x 4 = 12', cx, cy - pixel * 1.8)
        ctx.fillText('Escolha a fruta correta!', cx, cy + pixel * 2.2)
        ctx.restore()
      }

      const texts = ['Acerte a multiplicação!']
      if (['growing', 'show-done'].includes(this.phase)) {
        texts[0] = 'Você acertou! A cobra cresce'
        texts.push('e você ganha pontos!', 'Clique para continuar')
      } else if (this.phase === 'done') {
        texts.push('Clique para continuar')
      }
      drawTexts(ctx, w, h, pixel, texts)
    },
    bindNext(canvas, finish) {
      const onClick = () => {
        if (this.phase === 'show-fruits') {
          this.phase = 'moving-to-correct'
          this.moveT = 0
        } else if (this.phase === 'show-done') {
          canvas.removeEventListener('pointerdown', onClick)
          if (this.dom?.calc)
            this.dom.calc.classList.remove('tutorial-highlight')
          finish()
        }
      }
      canvas.addEventListener('pointerdown', onClick)
    },
  },
  {
    id: 'wrong-answer',
    snake: [
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ],
    fruits: [
      { x: 8, y: 5, value: 12 },
      { x: 11, y: 5, value: 14 },
    ],
    setup(dom) {
      this.t = 0
      this.phase = 'show-fruits'
      this.snake = [
        { x: 6, y: 5 },
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ]
      this.moveT = 0
      this.moveDuration = 450
      this.eaten = []
      this.dom = dom
      this.shrinkT = 0
      this.shrinkDuration = 400

      if (dom?.calc) dom.calc.classList.add('tutorial-highlight')
      if (dom) {
        dom.leftNumber.textContent = '3'
        dom.rightNumber.textContent = '4'
        dom.scoreDisplay.textContent = '1 pts'
      }
    },
    update(dt) {
      this.t += dt
      if (this.phase === 'moving-to-wrong') {
        this.moveT += dt
        while (this.moveT >= this.moveDuration) {
          this.moveT -= this.moveDuration
          const target = this.fruits[1]
          const head = this.snake[0]
          this.snake.unshift({
            x: head.x + Math.sign(target.x - head.x),
            y: head.y + Math.sign(target.y - head.y),
          })
          this.snake.pop()

          if (head.x === target.x && head.y === target.y) {
            this.eaten.push(target)
            this.phase = 'shrinking'
            this.shrinkT = 0
            this.removedTail = this.snake[this.snake.length - 1]
            if (this.dom) this.dom.scoreDisplay.textContent = '0 pts'
            break
          }
        }
      }
      if (
        this.phase === 'shrinking' &&
        (this.shrinkT += dt) >= this.shrinkDuration
      ) {
        this.phase = 'show-done'
        this.t = 0
      }
    },
    draw(ctx, state) {
      const pixel = state.pixel
      const theme = getTheme()
      const w = ctx.canvas.width
      const h = ctx.canvas.height

      drawOverlay(ctx, w, h)
      const visibleFruits = this.fruits.filter(
        (f, i) => !this.eaten.includes(f) && i === 1
      )

      const holes = [{ x: this.snake[0].x, y: this.snake[0].y, r: pixel * 1.4 }]
      visibleFruits.forEach((f) =>
        holes.push({ x: f.x, y: f.y, r: pixel * 1.2 })
      )
      if (this.removedTail && ['shrinking', 'show-done'].includes(this.phase)) {
        holes.push({
          x: this.removedTail.x,
          y: this.removedTail.y,
          r: pixel * 1.2,
        })
      }
      carveHoles(ctx, pixel, holes)

      drawSnake(ctx, this.snake, pixel, theme)

      if (this.removedTail && ['shrinking', 'show-done'].includes(this.phase)) {
        ctx.save()
        ctx.globalAlpha = 1 - Math.min(1, this.shrinkT / this.shrinkDuration)
        ctx.fillStyle = theme.body
        ctx.fillRect(
          this.removedTail.x * pixel,
          this.removedTail.y * pixel,
          pixel,
          pixel
        )
        ctx.strokeRect(
          this.removedTail.x * pixel,
          this.removedTail.y * pixel,
          pixel,
          pixel
        )
        ctx.restore()
      }

      visibleFruits.forEach((f) => {
        ctx.fillStyle = theme.fruit
        ctx.fillRect(f.x * pixel, f.y * pixel, pixel, pixel)
        ctx.fillStyle = theme.text
        ctx.font = `${Math.floor(pixel / 1.4)}px Fredoka, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(f.value, f.x * pixel + pixel / 2, f.y * pixel + pixel / 2)
      })

      if (this.phase === 'show-fruits') {
        const f = this.fruits[1]
        const cx = f.x * pixel + pixel / 2
        const cy = f.y * pixel + pixel / 2
        drawPulseRing(ctx, cx, cy, pixel, this.t, theme)
        const fontPx = Math.max(14, Math.floor(pixel / 1.6))
        ctx.save()
        ctx.font = `${fontPx}px Fredoka, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = theme.text
        ctx.fillText('3 x 4 = 12', cx, cy - pixel * 1.8)
        ctx.fillText('Cuidado com a fruta errada!', cx, cy + pixel * 2.2)
        ctx.restore()
      }

      const texts = ['Acerte a multiplicação!']
      if (['shrinking', 'show-done'].includes(this.phase)) {
        texts[0] = 'Você errou! A cobra diminui'
        texts.push('e você perde pontos!', 'Clique para continuar')
      } else if (this.phase === 'done') {
        texts.push('Clique para continuar')
      }
      drawTexts(ctx, w, h, pixel, texts)
    },
    bindNext(canvas, finish) {
      const onClick = () => {
        if (this.phase === 'show-fruits') {
          this.phase = 'moving-to-wrong'
          this.moveT = 0
        } else if (this.phase === 'show-done') {
          canvas.removeEventListener('pointerdown', onClick)
          if (this.dom?.calc)
            this.dom.calc.classList.remove('tutorial-highlight')
          finish()
        }
      }
      canvas.addEventListener('pointerdown', onClick)
    },
  },
]

// --- loop do tutorial ---
let reqAnimFrameId = null
let last = 0

export function startTutorial(ctx, state, dom, onFinish) {
  stopLoop(state)
  state.tutorialActive = true

  let stepIndex = 0

  function runStep() {
    const step = tutorialSteps[stepIndex]
    if (!step) {
      finish()
      return
    }
    step.setup?.(dom)

    const stepLoop = (now) => {
      const dt = now - last
      last = now
      step.update?.(dt)

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      step.draw(ctx, state)

      reqAnimFrameId = requestAnimationFrame(stepLoop)
    }
    last = performance.now()
    reqAnimFrameId = requestAnimationFrame(stepLoop)

    const advance = () => {
      cancelAnimationFrame(reqAnimFrameId)
      reqAnimFrameId = null
      stepIndex++
      runStep()
    }
    step.bindNext?.(ctx.canvas, advance)
  }

  function finish() {
    cancelAnimationFrame(reqAnimFrameId)
    reqAnimFrameId = null
    state.tutorialActive = false
    onFinish?.()
  }

  runStep()
}

export function stopTutorial(state) {
  if (reqAnimFrameId !== null) cancelAnimationFrame(reqAnimFrameId)
  reqAnimFrameId = null
  state.tutorialActive = false
}
