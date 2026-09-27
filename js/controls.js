const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

export function applyDirection(state, key) {
  const newDir = DIRECTIONS[key]
  if (!newDir) return
  if (newDir.x !== -state.direction.x || newDir.y !== -state.direction.y) {
    state.direction = newDir
    state.canChangeDirection = false
  }
}

export function bindControls(state, controlButtons) {
  // teclado
  document.addEventListener('keydown', (e) => applyDirection(state, e.key))

  // botões on-screen
  controlButtons.forEach((btn) => {
    btn.addEventListener('click', () =>
      applyDirection(state, btn.dataset.direction)
    )
  })

  // touch
  let startX = 0
  let startY = 0

  document.addEventListener(
    'touchstart',
    (e) => {
      const t = e.changedTouches[0]
      startX = t.clientX
      startY = t.clientY
    },
    { passive: true }
  )

  document.addEventListener(
    'touchend',
    (e) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - startX
      const dy = t.clientY - startY
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (Math.max(absDx, absDy) < 20) return
      if (absDx > absDy)
        applyDirection(state, dx > 0 ? 'ArrowRight' : 'ArrowLeft')
      else applyDirection(state, dy > 0 ? 'ArrowDown' : 'ArrowUp')
    },
    { passive: true }
  )
}
