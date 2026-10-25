import { useMemo, useState } from 'react'
import { Questionnaire } from './components/Questionnaire'
import { RecommendationResults } from './components/RecommendationResults'
import { GiftBackground } from './components/GiftBackground'
import { GIFT_CATALOG } from './data/catalog'
import { recommendGifts } from './engine/recommend'
import { addGiftExclusion, clearSavedExclusions, loadSavedExclusions, saveSavedExclusions } from './engine/storage'
import type { ChildProfile, SavedExclusions } from './types'
import './App.css'

function App() {
  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [savedExclusions, setSavedExclusions] = useState(() => loadSavedExclusions())
  const [skippedGiftIds, setSkippedGiftIds] = useState<string[]>([])

  const activeExclusions = useMemo<SavedExclusions>(() => ({
    ...savedExclusions,
    giftIds: [...new Set([...savedExclusions.giftIds, ...skippedGiftIds])],
  }), [savedExclusions, skippedGiftIds])

  const result = useMemo(
    () => (profile ? recommendGifts(profile, GIFT_CATALOG, activeExclusions) : null),
    [activeExclusions, profile],
  )

  function handleComplete(nextProfile: ChildProfile) {
    setProfile(nextProfile)
    setSkippedGiftIds([])
    requestAnimationFrame(() => {
      document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function handleResetProfile() {
    setProfile(null)
    setSkippedGiftIds([])
  }

  function handleAlreadyHave(giftId: string) {
    setSavedExclusions((current) => {
      const next = addGiftExclusion(current, giftId)
      saveSavedExclusions(next)
      return next
    })
  }

  function handleReplace(giftId: string) {
    setSkippedGiftIds((current) => [...new Set([...current, giftId])])
  }

  function handleClearSaved() {
    setSavedExclusions(clearSavedExclusions())
  }

  return (
    <div className="app-shell">
      <GiftBackground />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Geschenk? — zum Seitenanfang">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>Geschenk<span>?</span></span>
        </a>
        <p>Intelligente Geschenksuche für Kinder</p>
      </header>

      <main id="top">
        <section className="hero-panel" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="eyebrow">KEINE ZUFÄLLIGE LISTE, SONDERN EINE PASSENDE AUSWAHL</p>
            <h1 id="page-title">Ein Geschenk, das<br /><em>wirklich begeistert.</em></h1>
            <p>Erzähl uns kurz etwas über das Kind – Alter, Interessen und wichtige Ausschlusskriterien. Wir finden mehrere unterschiedliche Ideen statt fünf ähnlicher Schachteln.</p>
            <ul className="hero-promises" aria-label="Das bietet der Service">
              <li>3–5 unterschiedliche Ideen</li>
              <li>Berücksichtigt Ausschlusskriterien</li>
              <li>Suche auf Amazon.de</li>
            </ul>
          </div>
          <div className="hero-illustration" aria-hidden="true">
            <span className="hero-orbit hero-orbit-one" />
            <span className="hero-orbit hero-orbit-two" />
            <span className="hero-spark hero-spark-one">✦</span>
            <span className="hero-spark hero-spark-two">✦</span>
            <span className="hero-spark hero-spark-three">✦</span>
            <span className="hero-spark hero-spark-four">★</span>
            <span className="hero-spark hero-spark-five">★</span>
            <span className="hero-spark hero-spark-six">✧</span>
            <img className="hero-gift-image" src={`${import.meta.env.BASE_URL}geschenkbox.png`} alt="" />
            <span className="interest-icon icon-rocket" title="Weltraum">🚀</span>
            <span className="interest-icon icon-palette" title="Kunst">🎨</span>
            <span className="interest-icon icon-ball" title="Fußball">⚽</span>
            <span className="interest-icon icon-headphones" title="Musik">🎧</span>
            <span className="interest-icon icon-dino" title="Dinosaurier">🦕</span>
            <span className="interest-icon icon-book" title="Lesen">📖</span>
            <span className="interest-icon icon-brick" title="Bauen">🧱</span>
            <span className="interest-icon icon-gamepad" title="Gaming">🎮</span>
            <span className="interest-icon icon-robot" title="Robotik">🤖</span>
            <span className="interest-icon icon-puzzle" title="Rätsel">🧩</span>
            <span className="interest-icon icon-trophy" title="Sport">🏆</span>
            <span className="interest-icon icon-basketball" title="Basketball">🏀</span>
            <span className="interest-icon icon-music" title="Musizieren">🎵</span>
            <span className="interest-icon icon-science" title="Wissenschaft">🔬</span>
          </div>
        </section>

        <section className="planner-layout" aria-label="Fragebogen zur Geschenkauswahl">
          <div className="planner-intro">
            <p className="eyebrow">GESCHENKAUSWAHL</p>
            <h2>Beginnen wir mit<br />eurer Geschichte.</h2>
            <p>Der Fragebogen dauert etwa eine Minute. Wir senden ihn nicht an einen Server; im Browser werden nur Markierungen wie „Schon vorhanden“ gespeichert.</p>
          </div>

          <Questionnaire onComplete={handleComplete} onResetProfile={handleResetProfile} />
        </section>

        {profile && result && (
          <RecommendationResults
            profile={profile}
            result={result}
            savedGiftCount={savedExclusions.giftIds.length}
            onAlreadyHave={handleAlreadyHave}
            onReplace={handleReplace}
            onClearSaved={handleClearSaved}
          />
        )}
      </main>

      <footer>
        <span>Geschenk?</span>
        <p>Geschenke, die zum Kind passen – nicht nur zur Altersangabe auf der Verpackung.</p>
      </footer>
    </div>
  )
}

export default App
