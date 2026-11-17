export const THEMES = {
  classic: {
    head: 'darkgreen',
    body: 'seagreen',
    fruit: '#c33',
    text: '#ffffff',
    uiText: '#161619',
    stroke: 'snow',
    background: 'khaki',
  },
  alternativeYellow: {
    head: '#a7aefb',
    body: '#fbf4a7',
    fruit: '#a7fbca',
    text: '#2d3748',
    uiText: '#ffffff',
    stroke: '#264653',
    background: '#caa7fb',
  },
  contrast: {
    head: '#00ff00',
    body: '#008000',
    fruit: '#ff0000',
    text: '#ffffff',
    uiText: '#ffffff',
    stroke: '#ffffff',
    background: '#000000',
  },
  playful: {
    head: '#2ecc71',
    body: '#1abc9c',
    fruit: '#e74c3c',
    text: '#ffffff',
    uiText: '#2c3e50',
    stroke: '#ffffff',
    background: '#f1f2f6',
  },
  dalton: {
    head: '#0072b2',
    body: '#56b4e9',
    fruit: '#e69f00',
    text: '#000000',
    uiText: '#000000',
    stroke: '#ffffff',
    background: '#f5f5f5',
  },
}

export const CONFIG = {
  initialSnake: [
    { x: 3, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 1 },
  ],
  initialDirection: { x: 1, y: 0 },
  initialSpeed: 100,
  minSpeed: 50,
  speedStep: 5,
  levelScoreStep: 10,
  maxFruits: 6,
  theme: 'classic',
}

export function getTheme() {
  return THEMES[CONFIG.theme] ?? THEMES.classic
}

export function setTheme(name) {
  if (THEMES[name]) CONFIG.theme = name
}

export function getLayoutAxis() {
  const portrait =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(orientation: portrait)').matches
  return portrait ? 'y' : 'x'
}

export function isPortraitLayout() {
  return getLayoutAxis() === 'y'
}

export function onOrientationChange(callback) {
  if (typeof window === 'undefined' || !window.matchMedia) return function () {}
  const mql = window.matchMedia('(orientation: portrait)')
  function handler() {
    callback(mql.matches ? 'y' : 'x')
  }
  mql.addEventListener?.('change', handler)
  return function () {
    mql.removeEventListener?.('change', handler)
  }
}
