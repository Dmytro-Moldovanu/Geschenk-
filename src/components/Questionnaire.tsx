import { useMemo, useRef, useState, type FormEvent } from 'react'
import { INTEREST_OPTIONS, MAX_INTERESTS, MIN_INTERESTS } from '../data/interests'
import type { ChildProfile, ChildRestrictions, RestrictionKey } from '../types'

interface QuestionnaireProps {
  onComplete: (profile: ChildProfile) => void
  onResetProfile: () => void
}

type FormErrors = Partial<Record<'age' | 'interests' | 'budget', string>>

const emptyRestrictions: ChildRestrictions = {
  noScreens: false,
  quietOnly: false,
  noViolence: false,
  noSmallParts: false,
}

const restrictionOptions: Array<{ key: RestrictionKey; title: string; description: string }> = [
  { key: 'noScreens', title: 'Ohne große Bildschirme', description: 'Es werden nur Geschenke ohne Bildschirm berücksichtigt.' },
  { key: 'quietOnly', title: 'Nur leise Varianten', description: 'Laute und musikalische Spielzeuge werden ausgeschlossen.' },
  { key: 'noViolence', title: 'Ohne Gewalt', description: 'Waffen, Kämpfe und aggressive Geschichten werden ausgeschlossen.' },
  { key: 'noSmallParts', title: 'Ohne Kleinteile', description: 'Es bleiben sicherere Optionen für kleine Kinder.' },
]

const initialValues = {
  age: '',
  interests: [] as string[],
  budget: '',
  playerCount: '',
  restrictions: emptyRestrictions,
  alreadyHave: '',
  avoid: '',
}

export function Questionnaire({ onComplete, onResetProfile }: QuestionnaireProps) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showValidationNotice, setShowValidationNotice] = useState(false)
  const ageInputRef = useRef<HTMLInputElement>(null)
  const budgetInputRef = useRef<HTMLInputElement>(null)
  const interestsSectionRef = useRef<HTMLFieldSetElement>(null)

  const selectionMessage = useMemo(() => {
    const count = values.interests.length
    if (count < MIN_INTERESTS) return `Wähle noch mindestens ${MIN_INTERESTS - count} Interesse(n).`
    if (count === MAX_INTERESTS) return 'Maximal 5 Interessen ausgewählt.'
    return `Du kannst noch ${MAX_INTERESTS - count} auswählen.`
  }, [values.interests.length])

  function toggleInterest(id: string) {
    setValues((current) => {
      const selected = current.interests.includes(id)
      if (!selected && current.interests.length >= MAX_INTERESTS) return current

      const interests = selected
        ? current.interests.filter((interest) => interest !== id)
        : [...current.interests, id]

      return { ...current, interests }
    })
    if (values.interests.includes(id) ? values.interests.length - 1 >= MIN_INTERESTS : values.interests.length + 1 >= MIN_INTERESTS) {
      setErrors((current) => ({ ...current, interests: undefined }))
    }
  }

  function validate() {
    const nextErrors: FormErrors = {}
    const age = Number(values.age)
    const budget = values.budget === '' ? null : Number(values.budget)

    if (values.age.trim() === '') {
      nextErrors.age = 'Bitte gib das Alter des Kindes ein.'
    } else if (!Number.isInteger(age) || age < 1 || age > 17) {
      nextErrors.age = 'Bitte gib ein Alter von 1 bis 17 Jahren ein.'
    }
    if (values.interests.length < MIN_INTERESTS || values.interests.length > MAX_INTERESTS) {
      nextErrors.interests = 'Bitte wähle 2 bis 5 Interessen aus.'
    }
    if (budget !== null && (!Number.isFinite(budget) || budget <= 0)) {
      nextErrors.budget = 'Das Budget muss eine positive Zahl in Euro sein oder leer bleiben.'
    }

    return nextErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setShowValidationNotice(true)
      // Zum ersten fehlerhaften Feld springen, statt beim Absenden zu bleiben.
      window.requestAnimationFrame(() => {
        const firstInvalid = nextErrors.age
          ? ageInputRef.current
          : nextErrors.interests
            ? interestsSectionRef.current
            : budgetInputRef.current
        firstInvalid?.focus({ preventScroll: true })
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }
    setShowValidationNotice(false)

    onComplete({
      age: Number(values.age),
      interests: values.interests,
      budgetMax: values.budget === '' ? null : Number(values.budget),
      playerCount: values.playerCount === '' ? null : Number(values.playerCount),
      restrictions: values.restrictions,
      alreadyHaveText: values.alreadyHave.trim(),
      avoidText: values.avoid.trim(),
    })
  }

  function handleReset() {
    setValues(initialValues)
    setErrors({})
    setShowValidationNotice(false)
    onResetProfile()
  }

  return (
    <form className="questionnaire" data-native-validation="true" onSubmit={handleSubmit} noValidate>
      <div className="form-section form-section-basics">
        <div className="section-heading">
          <span className="step-number">01</span>
          <div>
            <h2>Für wen suchen wir ein Geschenk?</h2>
            <p>Mit ein paar einfachen Angaben schließen wir unpassende Vorschläge aus.</p>
          </div>
        </div>

        <div className="field-grid field-grid-two">
          <label className="field">
            <span>Alter des Kindes <b aria-hidden="true">*</b></span>
            <input
              ref={ageInputRef}
              type="number"
              min="1"
              max="17"
              inputMode="numeric"
              value={values.age}
              onChange={(event) => {
                setValues((current) => ({ ...current, age: event.target.value }))
                setErrors((current) => ({ ...current, age: undefined }))
              }}
              aria-invalid={Boolean(errors.age)}
              aria-describedby={errors.age ? 'age-error' : undefined}
              placeholder="Z. B. 8"
              required
            />
            {errors.age && <small id="age-error" className="field-error">{errors.age}</small>}
          </label>

          <label className="field">
            <span>Maximales Budget <em>optional</em></span>
            <div className="input-with-suffix">
              <input
                ref={budgetInputRef}
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={values.budget}
                onChange={(event) => {
                  setValues((current) => ({ ...current, budget: event.target.value }))
                  setErrors((current) => ({ ...current, budget: undefined }))
                }}
                aria-invalid={Boolean(errors.budget)}
                aria-describedby={errors.budget ? 'budget-error' : undefined}
                placeholder="Z. B. 45"
              />
              <span>€</span>
            </div>
            {errors.budget ? <small id="budget-error" className="field-error">{errors.budget}</small> : <small>Nur ein Richtwert, kein Amazon-Preis.</small>}
          </label>
        </div>
      </div>

      <fieldset
        ref={interestsSectionRef}
        tabIndex={-1}
        className={`form-section interest-section${errors.interests ? ' has-validation-error' : ''}`}
        aria-invalid={Boolean(errors.interests)}
        aria-describedby={errors.interests ? 'interests-help interests-error' : 'interests-help'}
      >
        <legend>
          <span className="step-number">02</span>
          <span><strong>Wofür interessiert sich das Kind wirklich?</strong><small>Wähle 2 bis 5 Interessen aus.</small></span>
        </legend>
        <div className="interest-status" id="interests-help" aria-live="polite">
          <strong>{values.interests.length} / {MAX_INTERESTS}</strong>
          <span>{selectionMessage}</span>
        </div>
        <div className="interest-groups">
          {(['Gestalten', 'Entdecken', 'Spielen', 'Bewegen', 'Fantasieren'] as const).map((group) => (
            <div className="interest-group" key={group}>
              <h3>{group}</h3>
              <div className="interest-list">
                {INTEREST_OPTIONS.filter((interest) => interest.group === group).map((interest) => {
                  const selected = values.interests.includes(interest.id)
                  const unavailable = !selected && values.interests.length >= MAX_INTERESTS
                  return (
                    <label className={`interest-chip${selected ? ' is-selected' : ''}${unavailable ? ' is-disabled' : ''}`} key={interest.id}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleInterest(interest.id)}
                        disabled={unavailable}
                      />
                      <span aria-hidden="true">{interest.icon}</span>
                      <span>{interest.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        {errors.interests && <p id="interests-error" className="field-error" role="alert">{errors.interests}</p>}
      </fieldset>

      <div className="form-section preferences-section">
        <div className="section-heading">
          <span className="step-number">03</span>
          <div>
            <h2>Was ist besonders wichtig?</h2>
            <p>Die Einschränkungen wirken als feste Filter – unpassende Geschenke erscheinen nicht im Ergebnis.</p>
          </div>
        </div>

        <div className="preference-grid">
          <label className="field player-field">
            <span>Wie viele Personen sollen spielen?</span>
            <select
              value={values.playerCount}
              onChange={(event) => setValues((current) => ({ ...current, playerCount: event.target.value }))}
            >
              <option value="">Egal</option>
              <option value="1">Ein Kind</option>
              <option value="2">Zwei</option>
              <option value="3">Drei</option>
              <option value="4">Vier oder mehr</option>
            </select>
            <small>Wir zeigen Geschenke, die sich für diese Gruppengröße eignen.</small>
          </label>

          <div className="restriction-list" role="group" aria-label="Einschränkungen für Geschenke">
            {restrictionOptions.map((restriction) => (
              <label className="restriction-option" key={restriction.key}>
                <input
                  type="checkbox"
                  checked={values.restrictions[restriction.key]}
                  onChange={(event) => setValues((current) => ({
                    ...current,
                    restrictions: { ...current.restrictions, [restriction.key]: event.target.checked },
                  }))}
                />
                <span>
                  <strong>{restriction.title}</strong>
                  <small>{restriction.description}</small>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="field-grid field-grid-two text-fields">
          <label className="field">
            <span>Was ist schon vorhanden?</span>
            <textarea
              value={values.alreadyHave}
              onChange={(event) => setValues((current) => ({ ...current, alreadyHave: event.target.value }))}
              placeholder="Z. B. viel LEGO, GraviTrax, ein Malset"
              rows={3}
            />
            <small>Du kannst konkrete Geschenke oder eine ganze Kategorie angeben.</small>
          </label>
          <label className="field">
            <span>Was möchten wir auf keinen Fall?</span>
            <textarea
              value={values.avoid}
              onChange={(event) => setValues((current) => ({ ...current, avoid: event.target.value }))}
              placeholder="Z. B. Puppen, Waffen, laute Autos"
              rows={3}
            />
            <small>Wir schließen eindeutig erkennbare Kategorien und ähnliche Treffer aus.</small>
          </label>
        </div>
      </div>

      {showValidationNotice && Object.values(errors).some(Boolean) && (
        <div className="validation-toast" role="alert" aria-live="assertive">
          <span className="validation-toast-icon" aria-hidden="true">!</span>
          <div>
            <strong>Bitte prüfe deine Angaben</strong>
            <p>{errors.age || errors.interests || errors.budget}</p>
          </div>
          <button type="button" aria-label="Hinweis schließen" onClick={() => setShowValidationNotice(false)}>×</button>
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="button button-ghost" onClick={handleReset}>Fragebogen zurücksetzen</button>
        <button type="submit" className="button button-primary">Geschenke finden <span aria-hidden="true">→</span></button>
      </div>
    </form>
  )
}
