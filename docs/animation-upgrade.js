// Kompatibilitätsschicht für die eigenständige HTML-Version.
// Die bearbeitbare React-Implementierung befindet sich in src/components/GiftBackground.tsx.
// Diese Datei ergänzt die bereits erstellte Offline-Version.
(() => {
  'use strict'
  const root = document.documentElement
  const colors = ['#ffd339', '#ff718b', '#6479f4', '#8d65dc', '#ff9b45', '#40c8bb', '#f16ab8', '#52b2ed', '#ffdc7c', '#9ac95f']
  const symbols = ['★', '♥', '✦', '✧']
  const rand = (seed) => {
    const n = Math.sin(seed * 127.1 + 78.233) * 43758.5453123
    return n - Math.floor(n)
  }
  const clamp = (n) => Math.min(Math.max(n, 0), 1)
  const smooth = (from, to, n) => {
    const x = clamp((n - from) / (to - from))
    return x * x * (3 - 2 * x)
  }
  const style = (vars) => Object.entries(vars).map(([key, value]) => `${key}:${value}`).join(';')
  let frame = 0
  let initialized = false

  function initialize() {
    if (initialized) return true
    const bg = document.querySelector('.gift-background')
    if (!bg) return false
    initialized = true
    bg.classList.add('gift-background--enhanced')

    const rays = Array.from({ length: 24 }, (_, i) => {
      const angle = -166 + i * (318 / 23)
      return `<span class="gift-light-ray" style="${style({
        '--ray-angle': `${angle.toFixed(2)}deg`,
        '--ray-length': `${(350 + rand(i + 190) * 1050).toFixed(0)}px`,
        '--ray-thickness': `${(5 + rand(i + 480) * 15).toFixed(1)}px`,
        '--ray-delay': (rand(i + 230) * .17).toFixed(3),
        '--ray-color': colors[i % colors.length],
      })}"></span>`
    }).join('')

    const streams = Array.from({ length: 18 }, (_, i) => `<span class="gift-color-stream" style="${style({
      '--stream-angle': `${(-65 + i * 8 + rand(i + 844) * 13).toFixed(2)}deg`,
      '--stream-length': `${(420 + rand(i + 391) * 820).toFixed(0)}px`,
      '--stream-width': `${(6 + rand(i + 150) * 12).toFixed(0)}px`,
      '--stream-delay': (rand(i + 318) * .2).toFixed(3),
      '--stream-color': colors[i * 3 % colors.length],
    })}"></span>`).join('')

    const particles = Array.from({ length: 504 }, (_, i) => {
      const column = i % 28
      const row = Math.floor(i / 28)
      const x = (column / 27) * 92 - 3 + rand(i + 1) * 6
      const y = (row / 17) * 120 - 32 + rand(i + 514) * 10
      const delay = rand(i + 928) * .33
      const kind = i % 14
      const glyph = kind >= 10 ? symbols[(i + Math.floor(i / 14)) % symbols.length] : ''
      return `<i class="confetti-shape confetti-shape-${kind}" style="${style({
        '--confetti-x': `${x.toFixed(2)}vw`,
        '--confetti-y': `${y.toFixed(2)}vh`,
        '--confetti-spin': `${((i % 2 ? -1 : 1) * (230 + rand(i + 305) * 910)).toFixed(0)}deg`,
        '--confetti-size': (0.62 + rand(i + 709) * .97).toFixed(2),
        '--confetti-delay': delay.toFixed(4),
        '--confetti-speed': (1 / (1 - delay)).toFixed(5),
        '--confetti-color': colors[i % colors.length],
      })}">${glyph}</i>`
    }).join('')

    bg.innerHTML = `
      <span class="background-blob background-blob-one"></span>
      <span class="background-blob background-blob-two"></span>
      <span class="background-blob background-blob-three"></span>
      <div class="gift-glow"></div>
      <div class="gift-light-rays">${rays}</div>
      <div class="gift-color-streams">${streams}</div>
      <div class="confetti-burst">${particles}</div>
      <div class="scroll-gift">
        <span class="gift-surprise gift-surprise-star">✦</span>
        <span class="gift-surprise gift-surprise-heart">♥</span>
        <span class="gift-surprise gift-surprise-dot"></span>
        <span class="gift-surprise gift-surprise-diamond">◆</span>
        <div class="background-gift-lid">
          <span class="background-bow background-bow-left"></span>
          <span class="background-bow background-bow-right"></span>
          <span class="background-bow-knot"></span>
        </div>
        <div class="background-gift-box"><span></span></div>
        <span class="background-ribbon background-ribbon-one"></span>
        <span class="background-ribbon background-ribbon-two"></span>
      </div>
      <span class="background-spark background-spark-one">✦</span>
      <span class="background-spark background-spark-two">✦</span>
      <span class="background-spark background-spark-three">✦</span>
      <span class="background-confetti background-confetti-one"></span>
      <span class="background-confetti background-confetti-two"></span>
      <span class="background-confetti background-confetti-three"></span>`

    const update = () => {
      frame = 0
      const range = Math.max(root.scrollHeight - window.innerHeight, 1)
      const p = clamp(window.scrollY / range)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const values = {
        '--enhanced-background-scroll': reduced ? 0 : p,
        '--background-scroll': reduced ? 0 : p,
        '--enhanced-gift-open': reduced ? 0 : smooth(.04, .33, p),
        '--gift-open': reduced ? 0 : smooth(.04, .33, p),
        '--enhanced-rays-progress': reduced ? 0 : smooth(.13, .47, p),
        '--enhanced-streams-progress': reduced ? 0 : smooth(.18, .85, p),
        '--enhanced-rays-opacity': reduced ? 0 : smooth(.12, .23, p) * (1 - smooth(.64, .98, p)),
        '--enhanced-confetti-progress': reduced ? 0 : smooth(.27, 1, p),
        '--enhanced-confetti-opacity': reduced ? 0 : smooth(.27, .41, p),
      }
      Object.entries(values).forEach(([key, value]) => root.style.setProperty(key, value.toFixed(5)))
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    if (typeof ResizeObserver !== 'undefined') {
      const shell = document.querySelector('.app-shell')
      if (shell) new ResizeObserver(onScroll).observe(shell)
    }
    return true
  }

  // React rendert asynchron; erst aktivieren, wenn der Hintergrund vorhanden ist.
  if (!initialize()) {
    const observer = new MutationObserver(() => {
      if (initialize()) observer.disconnect()
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
  }
})()
