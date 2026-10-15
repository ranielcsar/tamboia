const SCREENS = ['menu', 'settings', 'about', 'game']

export function showScreen(name) {
  if (!SCREENS.includes(name)) return
  for (const s of SCREENS) {
    const el = document.getElementById(`screen-${s}`)
    if (!el) continue
    el.classList.toggle('hidden', s !== name)
  }
}

export function bindScreens() {
  document.getElementById('btn-start')?.addEventListener('click', () => {
    showScreen('game')
    window.dispatchEvent(new CustomEvent('game:start'))
  })

  document.getElementById('btn-settings')?.addEventListener('click', () => {
    showScreen('settings')
  })

  document.getElementById('btn-about')?.addEventListener('click', () => {
    showScreen('about')
  })

  document.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => showScreen('menu'))
  })

  document.getElementById('menu-btn')?.addEventListener('click', () => {
    showScreen('menu')
  })
}
