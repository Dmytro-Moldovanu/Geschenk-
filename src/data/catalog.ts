import { CATALOG_PROFILES } from './catalogProfiles'
import { categoryById } from './categories'
import { GIFT_SEEDS_BY_CATEGORY, type GiftSeed } from './giftSeeds'
import { KNOWN_INTEREST_IDS } from './taxonomy'
import type { ActivityType, Gift, GiftFeatures } from '../types'

function unique(values: Iterable<string>) {
  return [...new Set(values)]
}

function buildDescription(seed: GiftSeed, categoryDescription: string, activities: readonly ActivityType[]) {
  if (seed.descriptionUk) return seed.descriptionUk
  if (activities.includes('outdoor')) return `${categoryDescription} Eignet sich gut für aktives Spielen und eigene Wege draußen.`
  if (activities.includes('roleplay')) return `${categoryDescription} Bietet Raum für Rollen, Szenen und eigene Geschichten.`
  if (activities.includes('social')) return `${categoryDescription} Freunde oder die Familie können leicht mitmachen.`
  if (activities.includes('collecting')) return `${categoryDescription} Kann Teil einer Lieblingssammlung oder Fantasiewelt werden.`
  if (activities.includes('creative') && activities.includes('intellectual')) return `${categoryDescription} Hier ist Platz für eigene Ideen und die konzentrierte Suche nach Lösungen.`
  if (activities.includes('creative')) return `${categoryDescription} Eignet sich für ruhiges kreatives Arbeiten und eigene kleine Projekte.`
  return `${categoryDescription} Ein gutes Format für selbstständige Beschäftigung mit wachsendem Anspruch.`
}

function buildGift(categoryId: string, seed: GiftSeed, index: number): Gift {
  const category = categoryById.get(categoryId)
  const profile = CATALOG_PROFILES[categoryId]

  if (!category || !profile) {
    throw new Error(`Unbekannte Katalogkategorie: ${categoryId}`)
  }

  const features: GiftFeatures = { ...profile.features, ...seed.features }
  const interestTags = unique([...category.defaultTags, ...(seed.tags ?? [])])
    .filter((tag) => KNOWN_INTEREST_IDS.has(tag))
    .slice(0, 8)

  const activities = seed.activities ?? profile.activities

  return {
    id: `gift-${categoryId}-${index + 1}`,
    titleUk: seed.titleUk,
    descriptionUk: buildDescription(seed, category.description, activities),
    categoryId,
    subcategoryId: `${categoryId}-${index + 1}`,
    recommendationGroup: categoryId,
    interestTags,
    activities,
    ageMin: seed.ageMin ?? profile.age.min,
    ageMax: seed.ageMax ?? profile.age.max,
    estimatedPrice: {
      min: seed.price?.min ?? profile.price.min,
      max: seed.price?.max ?? profile.price.max,
      currency: 'EUR',
    },
    players: seed.players ?? profile.players,
    features,
    aliases: unique([seed.titleUk, seed.amazonSearchQuery, ...category.aliases, ...(seed.aliases ?? [])]),
    amazonSearchQuery: seed.amazonSearchQuery,
    image: {
      icon: category.icon,
      alt: `Illustration der Kategorie „${category.label}“ für das Geschenk „${seed.titleUk}“`,
      fallbackKey: category.id,
    },
  }
}

export const GIFT_CATALOG: Gift[] = Object.entries(GIFT_SEEDS_BY_CATEGORY).flatMap(([categoryId, seeds]) => (
  seeds.map((seed, index) => buildGift(categoryId, seed, index))
))

/**
 * Strukturprüfungen für automatische Tests und Erweiterungen des lokalen
 * Katalogs. Sie prüfen Datenqualität, aber keine aktuellen Amazon-Preise,
 * Lagerbestände oder tatsächlich verfügbaren Suchtreffer.
 */
export function validateCatalog(catalog: readonly Gift[] = GIFT_CATALOG) {
  const errors: string[] = []
  const ids = new Set<string>()
  const titles = new Set<string>()
  const categories = new Set<string>()

  if (catalog.length < 300) errors.push(`Der Katalog muss mindestens 300 Geschenke enthalten, aktuell sind es ${catalog.length}.`)

  for (const gift of catalog) {
    if (ids.has(gift.id)) errors.push(`Doppelte ID: ${gift.id}`)
    ids.add(gift.id)

    const titleKey = gift.titleUk.trim().toLocaleLowerCase('de-DE')
    if (titles.has(titleKey)) errors.push(`Doppelter Titel: ${gift.titleUk}`)
    titles.add(titleKey)

    if (!categoryById.has(gift.categoryId)) errors.push(`Unbekannte Kategorie bei ${gift.id}: ${gift.categoryId}`)
    categories.add(gift.categoryId)
    if (!gift.titleUk.trim() || !gift.descriptionUk.trim()) errors.push(`Leerer Titel oder leere Beschreibung: ${gift.id}`)
    if (gift.interestTags.length < 3 || gift.interestTags.length > 8) errors.push(`Ungültige Anzahl an Tags bei ${gift.id}`)
    if (gift.interestTags.some((tag) => !KNOWN_INTEREST_IDS.has(tag))) errors.push(`Unbekannter Tag bei ${gift.id}`)
    if (gift.ageMin < 1 || gift.ageMax > 17 || gift.ageMin > gift.ageMax) errors.push(`Ungültiges Alter bei ${gift.id}`)
    if (gift.estimatedPrice.min <= 0 || gift.estimatedPrice.max < gift.estimatedPrice.min) errors.push(`Ungültiger Preis bei ${gift.id}`)
    if (gift.players.min < 1 || gift.players.max < gift.players.min) errors.push(`Ungültige Spielerzahl bei ${gift.id}`)
    if (gift.aliases.length === 0) errors.push(`Keine alternativen Bezeichnungen bei ${gift.id}`)

    const queryWords = gift.amazonSearchQuery.trim().split(/\s+/).filter(Boolean)
    if (queryWords.length < 2 || queryWords.length > 6) errors.push(`Die Amazon-Suchanfrage muss 2–6 Wörter enthalten: ${gift.id}`)
  }

  if (categories.size < 30) errors.push(`Der Katalog muss mindestens 30 Kategorien enthalten, aktuell sind es ${categories.size}.`)
  return errors
}
