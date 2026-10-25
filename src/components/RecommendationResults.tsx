import type { CSSProperties } from 'react'
import { categoryById } from '../data/categories'
import { INTEREST_OPTIONS } from '../data/interests'
import { amazonSearchUrl } from '../engine/amazon'
import type { ChildProfile, RecommendedGift } from '../types'
import type { GiftRecommendationResult } from '../engine/recommend'

interface RecommendationResultsProps {
  profile: ChildProfile
  result: GiftRecommendationResult
  savedGiftCount: number
  onAlreadyHave: (giftId: string) => void
  onReplace: (giftId: string) => void
  onClearSaved: () => void
}

const interestLabels = new Map(INTEREST_OPTIONS.map((interest) => [interest.id, interest.label]))

function formatPrice(min: number, max: number) {
  return min === max ? `≈ ${min} €` : `≈ ${min}–${max} €`
}

function formatIdeaCount(count: number) {
  return count === 1 ? 'Idee' : 'Ideen'
}

function getReason(item: RecommendedGift) {
  const direct = item.reason.directInterestIds
    .map((interestId) => interestLabels.get(interestId))
    .filter((label): label is string => Boolean(label))
  const related = item.reason.relatedInterestIds
    .map((interestId) => interestLabels.get(interestId))
    .filter((label): label is string => Boolean(label))

  if (direct.length > 0 && related.length > 0) {
    return `Verbindet Lieblingsthemen: ${direct.join(', ')}; passt außerdem zu ${related.slice(0, 2).join(' und ')}.`
  }
  if (direct.length > 0) return `Passt genau zu den Interessen: ${direct.join(', ')}.`
  if (related.length > 0) return `Ergänzt die Interessen gut durch die Themen: ${related.slice(0, 2).join(' und ')}.`
  return 'Passt zum Alter und zu den gewählten Bedingungen.'
}

function GiftCard({ item, onAlreadyHave, onReplace }: Pick<RecommendationResultsProps, 'onAlreadyHave' | 'onReplace'> & { item: RecommendedGift }) {
  const { gift } = item
  const category = categoryById.get(gift.categoryId)
  const visualStyle = { '--gift-accent': category?.color ?? '#6578eb' } as CSSProperties

  return (
    <article className="gift-card">
      <div className="gift-visual" style={visualStyle} aria-label={gift.image.alt} role="img">
        <span className="gift-visual-spark spark-left" aria-hidden="true">✦</span>
        <span className="gift-category-icon" aria-hidden="true">{gift.image.icon}</span>
        <span className="gift-visual-spark spark-right" aria-hidden="true">✦</span>
        <span className="gift-category-label">{category?.label ?? 'Geschenk'}</span>
      </div>
      <div className="gift-card-content">
        <div className="gift-card-heading">
          <p className="gift-category">{category?.label ?? 'Katalogkategorie'}</p>
          <span className="match-score" title="Interne Übereinstimmungsbewertung, keine Produktbewertung">{item.matchPercent}% passend</span>
        </div>
        <h3>{gift.titleUk}</h3>
        <p className="gift-description">{gift.descriptionUk}</p>
        <p className="gift-reason"><strong>Warum es passt:</strong> {getReason(item)}</p>
        <dl className="gift-facts">
          <div><dt>Alter</dt><dd>{gift.ageMin}–{gift.ageMax} J.</dd></div>
          <div><dt>Richtwert</dt><dd>{formatPrice(gift.estimatedPrice.min, gift.estimatedPrice.max)}</dd></div>
          <div><dt>Spieler</dt><dd>{gift.players.min === gift.players.max ? gift.players.min : `${gift.players.min}–${gift.players.max}`}</dd></div>
        </dl>
        <div className="gift-actions">
          <a
            className="button button-primary amazon-link"
            href={amazonSearchUrl(gift.amazonSearchQuery)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`„${gift.titleUk}“ auf Amazon.de in einem neuen Tab suchen`}
          >
            Auf Amazon.de suchen <span aria-hidden="true">↗</span>
          </a>
          <button type="button" className="button button-ghost" onClick={() => onAlreadyHave(gift.id)}>Schon vorhanden</button>
          <button type="button" className="replace-link" onClick={() => onReplace(gift.id)}>Andere Idee <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>
  )
}

export function RecommendationResults({
  profile,
  result,
  savedGiftCount,
  onAlreadyHave,
  onReplace,
  onClearSaved,
}: RecommendationResultsProps) {
  const hasEnoughIdeas = result.recommendations.length >= 3

  return (
    <section className="recommendations" id="recommendations" aria-live="polite" aria-labelledby="recommendations-title">
      <div className="recommendations-heading">
        <div>
          <p className="eyebrow">ERGEBNIS DER AUSWAHL</p>
          <h2 id="recommendations-title">Ideen für ein {profile.age}-jähriges Kind</h2>
          <p>Wir zeigen unterschiedliche Richtungen, die zu Alter, Ausschlusskriterien und Budget passen.</p>
        </div>
        {savedGiftCount > 0 && (
          <div className="saved-note">
            <p>Als „Schon vorhanden“ gespeichert: {savedGiftCount}</p>
            <button type="button" onClick={onClearSaved}>Zurücksetzen</button>
          </div>
        )}
      </div>

      {!hasEnoughIdeas && (
        <aside className="result-warning" role="status">
          <strong>Unter allen Bedingungen haben wir nur {result.recommendations.length} {formatIdeaCount(result.recommendations.length)} gefunden.</strong>
          <span>Wir ergänzen keine zufälligen Geschenke. Ändere versuchsweise das Budget, die Spielerzahl oder eines der festen Kriterien.</span>
        </aside>
      )}

      {result.recommendations.length > 0 ? (
        <div className="gift-grid">
          {result.recommendations.map((item) => (
            <GiftCard key={item.gift.id} item={item} onAlreadyHave={onAlreadyHave} onReplace={onReplace} />
          ))}
        </div>
      ) : (
        <div className="results-empty">
          <span aria-hidden="true">⌁</span>
          <h3>Noch keine passende sichere Idee.</h3>
          <p>Behalte alle wichtigen Einschränkungen bei und lockere die übrigen Bedingungen etwas – die Auswahl wird sofort neu berechnet.</p>
        </div>
      )}

      <p className="amazon-disclaimer">Die Beträge sind ungefähre Spannen aus dem lokalen Katalog und keine aktuellen Amazon-Preise. Die Schaltfläche öffnet die Suche auf Amazon.de in einem neuen Tab.</p>
    </section>
  )
}
