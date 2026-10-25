import { useEffect, type CSSProperties } from 'react'

type ParticleStyle = CSSProperties & Record<`--${string}`, string>

// Reproduzierbare Zufallswerte verhindern Flackern beim erneuten React-Rendern.
function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 127.1 + 78.233) * 43758.5453123
  return value - Math.floor(value)
}

const COLORS = ['#ffd339', '#ff718b', '#6479f4', '#8d65dc', '#ff9b45', '#40c8bb', '#f16ab8', '#52b2ed', '#ffdc7c', '#9ac95f']
const SYMBOLS = ['★', '♥', '✦', '✧']

// 504 Teile: dreimal so viele wie ursprünglich (168).
// Am Seitenende erreichen auch verzögert startende Teilchen ihre Endposition.
const CONFETTI = Array.from({ length: 504 }, (_, index) => {
  const column = index % 28
  const row = Math.floor(index / 28)
  const noiseX = pseudoRandom(index + 1)
  const noiseY = pseudoRandom(index + 514)
  const x = (column / 27) * 92 - 3 + noiseX * 6
  const y = (row / 17) * 120 - 32 + noiseY * 10
  const delay = pseudoRandom(index + 928) * 0.33
  const kind = index % 14

  const style: ParticleStyle = {
    '--confetti-x': `${x.toFixed(2)}vw`,
    '--confetti-y': `${y.toFixed(2)}vh`,
    '--confetti-spin': `${((index % 2 ? -1 : 1) * (230 + pseudoRandom(index + 305) * 910)).toFixed(0)}deg`,
    '--confetti-size': `${(0.62 + pseudoRandom(index + 709) * 0.97).toFixed(2)}`,
    '--confetti-delay': delay.toFixed(4),
    '--confetti-speed': (1 / (1 - delay)).toFixed(5),
    '--confetti-color': COLORS[index % COLORS.length],
  }

  return { style, kind, symbol: SYMBOLS[(index + Math.floor(index / 14)) % SYMBOLS.length] }
})

const LIGHT_RAYS = Array.from({ length: 24 }, (_, index) => {
  const angle = -166 + index * (318 / 23)
  const length = 350 + pseudoRandom(index + 190) * 1050
  const thickness = 5 + pseudoRandom(index + 480) * 15
  return {
    '--ray-angle': `${angle.toFixed(2)}deg`,
    '--ray-length': `${length.toFixed(0)}px`,
    '--ray-thickness': `${thickness.toFixed(1)}px`,
    '--ray-delay': `${(pseudoRandom(index + 230) * 0.17).toFixed(3)}`,
    '--ray-color': COLORS[index % COLORS.length],
  } as ParticleStyle
})

// Breitere, geschwungene Farbstreifen bewegen sich hinter dem Inhalt.
const COLOR_STREAMS = Array.from({ length: 18 }, (_, index) => ({
  '--stream-angle': `${(-65 + index * 8 + pseudoRandom(index + 844) * 13).toFixed(2)}deg`,
  '--stream-length': `${(420 + pseudoRandom(index + 391) * 820).toFixed(0)}px`,
  '--stream-width': `${(6 + pseudoRandom(index + 150) * 12).toFixed(0)}px`,
  '--stream-delay': `${(pseudoRandom(index + 318) * 0.2).toFixed(3)}`,
  '--stream-color': COLORS[(index * 3) % COLORS.length],
} as ParticleStyle))

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)
const smoothStep = (from: number, to: number, progress: number) => {
  const x = clamp01((progress - from) / (to - from))
  return x * x * (3 - 2 * x)
}

export function GiftBackground() {
  useEffect(() => {
    const root = document.documentElement
    let frame = 0
    const properties = ['--background-scroll', '--gift-open', '--rays-progress', '--rays-opacity', '--streams-progress', '--confetti-progress', '--confetti-opacity']

    const applyProgress = (progress: number) => {
      // Keine unabhängige Zeitschleife: die Scroll-Position steuert
      // die Animation in beiden Richtungen gleich.
      const open = smoothStep(0.04, 0.33, progress)
      const rays = smoothStep(0.13, 0.47, progress)
      const streams = smoothStep(0.18, 0.85, progress)
      const raysOpacity = smoothStep(0.12, 0.23, progress) * (1 - smoothStep(0.64, 0.98, progress))
      const confetti = smoothStep(0.27, 1, progress)
      const confettiOpacity = smoothStep(0.27, 0.41, progress)

      const values: Record<string, number> = {
        '--background-scroll': progress,
        '--gift-open': open,
        '--rays-progress': rays,
        '--rays-opacity': raysOpacity,
        '--streams-progress': streams,
        '--confetti-progress': confetti,
        '--confetti-opacity': confettiOpacity,
      }
      for (const [property, value] of Object.entries(values)) root.style.setProperty(property, value.toFixed(5))
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyProgress(0)
      return () => properties.forEach((property) => root.style.removeProperty(property))
    }

    const updateScrollPosition = () => {
      frame = 0
      const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      applyProgress(clamp01(window.scrollY / scrollRange))
    }

    const handleScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(updateScrollPosition)
    }

    updateScrollPosition()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    // Nach der Eingabe wird die Seite durch Ergebnisse länger.
    // Den Fortschritt bei Höhenänderungen neu berechnen.
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(handleScroll)
      : null
    const appShell = document.querySelector('.app-shell')
    if (appShell) resizeObserver?.observe(appShell)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      resizeObserver?.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      properties.forEach((property) => root.style.removeProperty(property))
    }
  }, [])

  return (
    <div className="gift-background" aria-hidden="true">
      <span className="background-blob background-blob-one" />
      <span className="background-blob background-blob-two" />
      <span className="background-blob background-blob-three" />

      <div className="gift-glow" />
      <div className="gift-light-rays">
        {LIGHT_RAYS.map((style, index) => <span key={index} style={style} className="gift-light-ray" />)}
      </div>
      <div className="gift-color-streams">
        {COLOR_STREAMS.map((style, index) => <span key={index} style={style} className="gift-color-stream" />)}
      </div>

      <div className="confetti-burst">
        {CONFETTI.map(({ style, kind, symbol }, index) => (
          <i key={index} style={style} className={`confetti-shape confetti-shape-${kind}`}>
            {kind >= 10 ? symbol : null}
          </i>
        ))}
      </div>

      <div className="scroll-gift">
        <span className="gift-surprise gift-surprise-star">✦</span>
        <span className="gift-surprise gift-surprise-heart">♥</span>
        <span className="gift-surprise gift-surprise-dot" />
        <span className="gift-surprise gift-surprise-diamond">◆</span>
        <div className="background-gift-lid">
          <span className="background-bow background-bow-left" />
          <span className="background-bow background-bow-right" />
          <span className="background-bow-knot" />
        </div>
        <div className="background-gift-box"><span /></div>
        <span className="background-ribbon background-ribbon-one" />
        <span className="background-ribbon background-ribbon-two" />
      </div>

      <span className="background-spark background-spark-one">✦</span>
      <span className="background-spark background-spark-two">✦</span>
      <span className="background-spark background-spark-three">✦</span>
      <span className="background-confetti background-confetti-one" />
      <span className="background-confetti background-confetti-two" />
      <span className="background-confetti background-confetti-three" />
    </div>
  )
}
