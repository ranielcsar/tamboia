function createResultFruit({ a, b }) {
  const cols = Math.floor(bodyWidth / PIXEL);
  const rows = Math.floor(bodyHeight / PIXEL);
  return {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
    value: a * b,
  };
}

function createFruit(value) {
  const cols = Math.floor(bodyWidth / PIXEL);
  const rows = Math.floor(bodyHeight / PIXEL);
  return {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
    value: value ? Math.floor(Math.random() * (value / 2)) : Math.floor(Math.random() * 9) + 1,
  };
}

function drawFruit(ctx, fruit) {
  ctx.fillStyle = "#c33";
  ctx.fillRect(fruit.x * PIXEL, fruit.y * PIXEL, PIXEL, PIXEL);
  ctx.fillStyle = "snow";
  ctx.font = `${PIXEL / 1.4}px serif`;
  ctx.fillText(
    fruit.value,
    fruit.x * PIXEL + PIXEL / 7,
    fruit.y * PIXEL + PIXEL / 1.4,
    PIXEL
  );
}

function checkEatedFruit(snake, fruit, resultFruit) {
  if (hasEatFruit(snake, fruit)) return 'normal-fruit'
  if (resultFruit && hasEatFruit(snake, resultFruit)) return 'result-fruit'
}

function hasEatFruit(snake, fruit) {
  const head = snake[0];
  if (head.x === fruit.x && head.y === fruit.y) {
    return true;
  }
  return false;
}

function hasEatedFruit(snake) {
  if (values.a && values.b && !resultFruit) {
    resultFruit = createResultFruit({ a: values.a, b: values.b })
    fruit = createFruit(resultFruit.value)
  }

  const eatedFruit = checkEatedFruit(snake, fruit, resultFruit)
  switch (eatedFruit) {
    case 'normal-fruit':
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
        snake.pop()
        updateValues()
        break
      }
    case 'result-fruit':
      resetValuesAndFruits()
      updateValues()
      addNewSnakePart(snake)
      break
    default:
      break
  }
}

function resetValuesAndFruits() {
  values = { a: null, b: null }
  fruit = createFruit()
  resultFruit = null
}