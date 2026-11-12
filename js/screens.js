const SCREENS = ['menu', 'settings', 'about', 'game']

const TUTORIAL_SEEN_KEY = 'tamboia:tutorialSeen'

function hasSeenTutorial() {
  try {
    return localStorage.getItem(TUTORIAL_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markTutorialSeen() {
  try {
    localStorage.setItem(TUTORIAL_SEEN_KEY, '1')
  } catch {}
}

function updateTutorialButtonVisibility() {
  const btnTutorial = document.getElementById('btn-tutorial')
  if (btnTutorial) {
    btnTutorial.classList.toggle('hidden', !hasSeenTutorial())
  }
}

export function showScreen(name) {
  if (!SCREENS.includes(name)) return
  if (name === 'menu') {
    updateTutorialButtonVisibility()
  }
  for (const s of SCREENS) {
    const el = document.getElementById(`screen-${s}`)
    if (!el) continue
    el.classList.toggle('hidden', s !== name)
  }
}

export function bindScreens() {
  updateTutorialButtonVisibility()

  document.getElementById('btn-start')?.addEventListener('click', () => {
    showScreen('game')
    if (!hasSeenTutorial()) {
      markTutorialSeen()
      window.dispatchEvent(new CustomEvent('game:tutorial'))
    } else {
      window.dispatchEvent(new CustomEvent('game:start'))
    }
  })

  document.getElementById('btn-settings')?.addEventListener('click', () => {
    showScreen('settings')
  })

  document.getElementById('btn-about')?.addEventListener('click', () => {
    showScreen('about')
  })

  document.getElementById('btn-tutorial')?.addEventListener('click', () => {
    showScreen('game')
    window.dispatchEvent(
      new CustomEvent('game:tutorial', { detail: { fromMenu: true } })
    )
  })

  document.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => showScreen('menu'))
  })

  document.getElementById('menu-btn')?.addEventListener('click', () => {
    showScreen('menu')
  })
}
