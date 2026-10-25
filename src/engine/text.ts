import { GIFT_CATEGORIES } from '../data/categories'
import { INTEREST_ALIASES } from '../data/taxonomy'
import type { ChildRestrictions, Gift, SavedExclusions } from '../types'

export interface ResolvedTextExclusions {
  giftIds: string[]
  categoryIds: string[]
  tagIds: string[]
  requestedRestrictions: Partial<ChildRestrictions>
  matchedPhrases: string[]
}

export function normalizeForMatch(value: string) {
  return value
    .toLocaleLowerCase('de-DE')
    .normalize('NFKD')
    .replace(/[’'`ʼ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function containsPhrase(haystack: string, phrase: string) {
  const normalizedPhrase = normalizeForMatch(phrase)
  if (normalizedPhrase.length < 3) return false
  return ` ${haystack} `.includes(` ${normalizedPhrase} `)
}

function unique(values: Iterable<string>) {
  return [...new Set(values)]
}

function matchesRestriction(text: string, patterns: readonly string[]) {
  return patterns.some((pattern) => containsPhrase(text, pattern))
}

/**
 * Wandelt verständliche Freitexteingaben in ausdrückliche Ausschlüsse um.
 * Unbekannte Begriffe werden nicht erraten, damit die Auswahl nicht durch
 * versteckte, zu breite Interpretationen unnötig eingeschränkt wird.
 */
export function resolveTextExclusions(text: string, catalog: readonly Gift[]): ResolvedTextExclusions {
  const normalizedText = normalizeForMatch(text)
  if (!normalizedText) {
    return { giftIds: [], categoryIds: [], tagIds: [], requestedRestrictions: {}, matchedPhrases: [] }
  }

  const giftIds = new Set<string>()
  const categoryIds = new Set<string>()
  const tagIds = new Set<string>()
  const matchedPhrases = new Set<string>()
  const specificGiftPhraseLengths = new Map<string, number>()

  for (const gift of catalog) {
    const matchingAlias = [gift.titleUk, ...gift.aliases]
      .map((alias) => normalizeForMatch(alias))
      .filter((alias) => alias.length >= 8 || alias.split(' ').length >= 2)
      .sort((left, right) => right.length - left.length)
      .find((alias) => containsPhrase(normalizedText, alias))

    if (matchingAlias) {
      giftIds.add(gift.id)
      matchedPhrases.add(matchingAlias)
      specificGiftPhraseLengths.set(
        gift.categoryId,
        Math.max(specificGiftPhraseLengths.get(gift.categoryId) ?? 0, matchingAlias.length),
      )
    }
  }

  for (const category of GIFT_CATEGORIES) {
    const matchingAlias = [category.label, ...category.aliases]
      .map((alias) => normalizeForMatch(alias))
      .sort((left, right) => right.length - left.length)
      .find((alias) => containsPhrase(normalizedText, alias))

    if (!matchingAlias) continue

    const specificGiftLength = specificGiftPhraseLengths.get(category.id) ?? 0
    if (specificGiftLength > matchingAlias.length) continue

    categoryIds.add(category.id)
    matchedPhrases.add(matchingAlias)
  }

  for (const [interestId, aliases] of Object.entries(INTEREST_ALIASES)) {
    const matchingAlias = aliases
      .map((alias) => normalizeForMatch(alias))
      .sort((left, right) => right.length - left.length)
      .find((alias) => containsPhrase(normalizedText, alias))

    if (matchingAlias) {
      tagIds.add(interestId)
      matchedPhrases.add(matchingAlias)
    }
  }

  const requestedRestrictions: Partial<ChildRestrictions> = {
    ...(matchesRestriction(normalizedText, ['bildschirm', 'bildschirme', 'tablet']) ? { noScreens: true } : {}),
    ...(matchesRestriction(normalizedText, ['laut', 'laute', 'lautes', 'lärm', 'musikalisch']) ? { quietOnly: true } : {}),
    ...(matchesRestriction(normalizedText, ['gewalt', 'waffen', 'kämpfe', 'kämpfen']) ? { noViolence: true } : {}),
    ...(matchesRestriction(normalizedText, ['kleinteile', 'kleine teile']) ? { noSmallParts: true } : {}),
  }

  return {
    giftIds: unique(giftIds),
    categoryIds: unique(categoryIds),
    tagIds: unique(tagIds),
    requestedRestrictions,
    matchedPhrases: unique(matchedPhrases),
  }
}

export function mergeSavedExclusions(
  saved: SavedExclusions,
  ...resolved: ResolvedTextExclusions[]
): SavedExclusions {
  return {
    version: 1,
    giftIds: unique([saved.giftIds, ...resolved.map((item) => item.giftIds)].flat()),
    categoryIds: unique([saved.categoryIds, ...resolved.map((item) => item.categoryIds)].flat()),
    tagIds: unique([saved.tagIds, ...resolved.map((item) => item.tagIds)].flat()),
  }
}
