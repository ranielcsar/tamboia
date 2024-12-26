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
    value: value ? Math.floor(Math.random() * value) + 1 : Math.floor(Math.random() * 9) + 1,
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
  let eatedFruit = ""
  if (hasEatFruit(snake, fruit)) eatedFruit = 'normal-fruit'
  if (resultFruit && hasEatFruit(snake, resultFruit)) eatedFruit = 'result-fruit'  
  return eatedFruit
}

function hasEatFruit(snake, fruit) {
  const head = snake[0];
  if (head.x === fruit.x && head.y === fruit.y) {
    return true;
  }
  return false;
}
