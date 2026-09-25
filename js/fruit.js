let fruit = null
let resultFruit = null
let extraNormalFruits = []
let values = { a: null, b: null }

function isOccupied(x, y, snake) {
  if (occupancy[getCellIndex(x, y)] === 1) return true
  for (let i = 0; i < extraNormalFruits.length; i++) {
    if (extraNormalFruits[i].x === x && extraNormalFruits[i].y === y)
      return true
  }
  if (fruit && fruit.x === x && fruit.y === y) return true
  if (resultFruit && resultFruit.x === x && resultFruit.y === y) return true
  return false
}

function getEmptyPosition(snake) {
  const totalCells = COLS * ROWS
  const occupiedCount =
    snake.length +
    extraNormalFruits.length +
    (fruit ? 1 : 0) +
    (resultFruit ? 1 : 0)

  if (occupiedCount >= totalCells) return null

  const maxAttempts = Math.min(32, totalCells - occupiedCount)
  for (let i = 0; i < maxAttempts; i++) {
    const x = Math.floor(Math.random() * COLS)
    const y = Math.floor(Math.random() * ROWS)
    if (!isOccupied(x, y, snake)) return { x, y }
  }

  const start = Math.floor(Math.random() * totalCells)
  for (let i = 0; i < totalCells; i++) {
    const index = (start + i) % totalCells
    const x = index % COLS
    const y = Math.floor(index / COLS)
    if (!isOccupied(x, y, snake)) return { x, y }
  }

  return null
}

function updateExtraFruits(snake) {
  if (values.a === null || values.b === null) {
    extraNormalFruits = []
    return
  }

  if (values.a === 1 || values.b === 1) {
    extraNormalFruits = []
    return
  }

  const targetCount = getTargetFruitCount(snake)
  let currentTotal = 0
  if (fruit) currentTotal++
  if (resultFruit) currentTotal++
  currentTotal += extraNormalFruits.length

  while (currentTotal < targetCount) {
    const pos = getEmptyPosition(snake)
    if (!pos) break
    const refVal = resultFruit ? resultFruit.value : undefined
    const newF = createFruit(refVal, pos)
    if (!newF) break
    extraNormalFruits.push(newF)
    currentTotal++
  }

  while (currentTotal > targetCount && extraNormalFruits.length > 0) {
    extraNormalFruits.pop()
    currentTotal--
  }
}

function createFruit(value, position) {
  let newValue = Math.floor(Math.random() * 9) + 1

  if (value !== undefined) {
    const { a, b } = values

    if (a === 1 && b === 1) {
      return null
    }

    if (a === 0 || a === 1 || b === 0 || b === 1) {
      newValue = a === 0 || b === 0 ? 0 : 1
    } else {
      const candidates = [
        a * (b - 1),
        a * (b + 1),
        (a - 1) * b,
        (a + 1) * b,
        value - 2,
        value + 2,
        value - 4,
        value + 4,
      ]
      const usedValues = new Set()
      for (let i = 0; i < extraNormalFruits.length; i++)
        usedValues.add(extraNormalFruits[i].value)
      if (fruit) usedValues.add(fruit.value)

      let optionCount = 0
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i]
        if (
          candidate >= 0 &&
          candidate !== value &&
          candidate % 2 === value % 2 &&
          !usedValues.has(candidate)
        ) {
          candidates[optionCount++] = candidate
        }
      }

      if (optionCount > 0) {
        newValue = candidates[Math.floor(Math.random() * optionCount)]
      } else {
        let fallback = value + 2
        while (usedValues.has(fallback) || fallback === value) fallback += 2
        newValue = fallback
      }
    }
  }

  const pos = position || getEmptyPosition(SNAKE)
  if (!pos) return null

  return {
    x: pos.x,
    y: pos.y,
    value: newValue,
  }
}

function drawFruit(ctx, fruit) {
  if (!fruit) return
  ctx.fillStyle = '#c33'
  ctx.fillRect(fruit.x * PIXEL, fruit.y * PIXEL, PIXEL, PIXEL)
  ctx.fillStyle = 'snow'
  ctx.fillText(
    fruit.value,
    fruit.x * PIXEL + PIXEL / 2,
    fruit.y * PIXEL + PIXEL / 2
  )
}

function hasEatFruit(snake, fruit) {
  if (!fruit) return false
  const head = snake[0]
  if (head.x === fruit.x && head.y === fruit.y) {
    return true
  }
  return false
}

function hasEatedFruit(snake) {
  for (let i = 0; i < extraNormalFruits.length; i++) {
    if (hasEatFruit(snake, extraNormalFruits[i])) {
      const eatenVal = extraNormalFruits[i].value
      extraNormalFruits.splice(i, 1)
      if (!values.a) {
        values.a = eatenVal
        updateValues()
      } else if (!values.b) {
        values.b = eatenVal
        updateValues()
      } else if (values.a && values.b && resultFruit) {
        resetValuesAndFruits()
        snake.pop()
        updateValues()
      }
      checkSpeed(snake)
      return
    }
  }

  const eatedFruit = checkEatedFruit(snake, fruit, resultFruit)
  switch (eatedFruit) {
    case 'number-fruit':
      if (!values.a) {
        values.a = fruit.value
        fruit = createFruit()
        updateValues()
        break
      }
      if (!values.b) {
        values.b = fruit.value
        updateValues()
        break
      }

      if (values.a && values.b && resultFruit) {
        resetValuesAndFruits()
        const removedTail = snake.pop()
        if (removedTail)
          occupancy[getCellIndex(removedTail.x, removedTail.y)] = 0
        updateValues()
        break
      }
    case 'result-fruit':
      resetValuesAndFruits()
      addNewSnakePart(snake)
      updateValues()
      break
    default:
      break
  }
  checkSpeed(snake)
}

function createResultFruit({ a, b }) {
  const pos = getEmptyPosition(SNAKE)
  if (!pos) return null
  return {
    x: pos.x,
    y: pos.y,
    value: a * b,
  }
}

function checkEatedFruit(snake, fruit, resultFruit) {
  if (hasEatFruit(snake, fruit)) return 'number-fruit'
  if (resultFruit && hasEatFruit(snake, resultFruit)) return 'result-fruit'
}

function resetValuesAndFruits() {
  values = { a: null, b: null }
  extraNormalFruits = []
  fruit = createFruit()
  resultFruit = null
}
