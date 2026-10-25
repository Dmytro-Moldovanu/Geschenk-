import { RELATED_INTERESTS } from '../data/taxonomy'
import type {
  ChildProfile,
  ChildRestrictions,
  Gift,
  GiftMatchReason,
  RecommendationDiagnostics,
  RecommendationResult,
  RecommendedGift,
  SavedExclusions,
} from '../types'
import { mergeSavedExclusions, resolveTextExclusions, type ResolvedTextExclusions } from './text'

const EMPTY_EXCLUSIONS: SavedExclusions = {
  version: 1,
  giftIds: [],
  categoryIds: [],
  tagIds: [],
}

const MIN_RECOMMENDATIONS = 3
const MAX_RECOMMENDATIONS = 5

export interface GiftRecommendationResult extends RecommendationResult {
  resolvedExclusions: ResolvedTextExclusions
}

function effectiveRestrictions(
  profileRestrictions: ChildRestrictions,
  textRestrictions: Partial<ChildRestrictions>,
): ChildRestrictions {
  return {
    noScreens: profileRestrictions.noScreens || textRestrictions.noScreens === true,
    quietOnly: profileRestrictions.quietOnly || textRestrictions.quietOnly === true,
    noViolence: profileRestrictions.noViolence || textRestrictions.noViolence === true,
    noSmallParts: profileRestrictions.noSmallParts || textRestrictions.noSmallParts === true,
  }
}

function followsRestrictions(gift: Gift, restrictions: ChildRestrictions) {
  if (restrictions.noScreens && gift.features.hasScreen) return false
  if (restrictions.quietOnly && !['silent', 'low'].includes(gift.features.soundLevel)) return false
  if (restrictions.noViolence && gift.features.violenceLevel !== 'none') return false
  if (restrictions.noSmallParts && gift.features.hasSmallParts) return false
  return true
}

function supportsPlayerCount(gift: Gift, requestedPlayers: number | null) {
  if (requestedPlayers === null) return true
  return gift.players.min <= requestedPlayers && gift.players.max >= requestedPlayers
}

function fitsBudget(gift: Gift, budgetMax: number | null) {
  if (budgetMax === null) return true
  return gift.estimatedPrice.min <= budgetMax
}

function isExcluded(gift: Gift, exclusions: SavedExclusions) {
  return (
    exclusions.giftIds.includes(gift.id)
    || exclusions.categoryIds.includes(gift.categoryId)
    || gift.interestTags.some((tag) => exclusions.tagIds.includes(tag))
  )
}

function getMatchReason(gift: Gift, selectedInterests: readonly string[]): GiftMatchReason {
  const directInterestIds = selectedInterests.filter((interestId) => gift.interestTags.includes(interestId))
  const relatedWeights = new Map<string, number>()

  for (const selectedInterest of selectedInterests) {
    for (const related of RELATED_INTERESTS[selectedInterest] ?? []) {
      if (!gift.interestTags.includes(related.id) || selectedInterests.includes(related.id)) continue
      relatedWeights.set(related.id, Math.max(relatedWeights.get(related.id) ?? 0, related.weight))
    }
  }

  return {
    directInterestIds,
    relatedInterestIds: [...relatedWeights.keys()],
  }
}

function ageFitScore(gift: Gift, age: number) {
  const midpoint = (gift.ageMin + gift.ageMax) / 2
  const distanceFromMiddle = Math.abs(age - midpoint)
  return Math.max(1, 8 - Math.round(distanceFromMiddle * 1.5))
}

function budgetFitScore(gift: Gift, budgetMax: number | null) {
  if (budgetMax === null) return 4
  if (gift.estimatedPrice.max <= budgetMax) return 10
  return 4
}

function scoreGift(gift: Gift, profile: ChildProfile) {
  const reason = getMatchReason(gift, profile.interests)
  const relatedScore = reason.relatedInterestIds.reduce((total, relatedId) => {
    const weight = profile.interests.reduce((highest, selectedInterest) => {
      const relation = (RELATED_INTERESTS[selectedInterest] ?? []).find((item) => item.id === relatedId)
      return Math.max(highest, relation?.weight ?? 0)
    }, 0)
    return total + Math.round(weight * 14)
  }, 0)

  const score = reason.directInterestIds.length * 32
    + relatedScore
    + ageFitScore(gift, profile.age)
    + budgetFitScore(gift, profile.budgetMax)

  const matchPercent = Math.min(99, Math.max(45, Math.round(48 + score * 0.36)))
  return { score, matchPercent, reason }
}

function rankGifts(gifts: readonly Gift[], profile: ChildProfile): RecommendedGift[] {
  return gifts
    .map((gift) => ({ gift, ...scoreGift(gift, profile) }))
    .sort((left, right) => right.score - left.score || left.gift.id.localeCompare(right.gift.id))
}

/**
 * Die erste Ergebnisliste soll abwechslungsreich bleiben. Nur die Bevorzugung
 * unterschiedlicher Geschenkgruppen wird gelockert, wenn durch feste Filter
 * weniger als drei passende Alternativen übrig bleiben.
 */
function selectDiverseRecommendations(ranked: readonly RecommendedGift[]) {
  const recommendations: RecommendedGift[] = []
  const recommendationGroups = new Set<string>()

  for (const item of ranked) {
    if (recommendations.length === MAX_RECOMMENDATIONS) break
    if (recommendationGroups.has(item.gift.recommendationGroup)) continue
    recommendations.push(item)
    recommendationGroups.add(item.gift.recommendationGroup)
  }

  if (recommendations.length >= MIN_RECOMMENDATIONS) return recommendations

  for (const item of ranked) {
    if (recommendations.length === MAX_RECOMMENDATIONS) break
    if (recommendations.some((selected) => selected.gift.id === item.gift.id)) continue
    recommendations.push(item)
  }

  return recommendations
}

/**
 * Feste Filter werden vor der Bewertung in festgelegter Reihenfolge angewendet:
 * Alter → Sicherheit → Ausschlüsse → Spielerzahl → Budget → Bewertung.
 */
export function recommendGifts(
  profile: ChildProfile,
  catalog: readonly Gift[],
  savedExclusions: SavedExclusions = EMPTY_EXCLUSIONS,
): GiftRecommendationResult {
  const resolvedExclusions = resolveTextExclusions(
    `${profile.alreadyHaveText}\n${profile.avoidText}`,
    catalog,
  )
  const exclusions = mergeSavedExclusions(savedExclusions, resolvedExclusions)
  const restrictions = effectiveRestrictions(profile.restrictions, resolvedExclusions.requestedRestrictions)

  const ageSuitable = catalog.filter((gift) => profile.age >= gift.ageMin && profile.age <= gift.ageMax)
  const restrictionSuitable = ageSuitable.filter((gift) => followsRestrictions(gift, restrictions))
  const exclusionSuitable = restrictionSuitable.filter((gift) => !isExcluded(gift, exclusions))
  const playerSuitable = exclusionSuitable.filter((gift) => supportsPlayerCount(gift, profile.playerCount))
  const budgetSuitable = playerSuitable.filter((gift) => fitsBudget(gift, profile.budgetMax))
  const ranked = rankGifts(budgetSuitable, profile)

  const diagnostics: RecommendationDiagnostics = {
    total: catalog.length,
    afterAge: ageSuitable.length,
    afterRestrictions: restrictionSuitable.length,
    afterExclusions: exclusionSuitable.length,
    afterPlayers: playerSuitable.length,
    afterBudget: budgetSuitable.length,
  }

  return {
    recommendations: selectDiverseRecommendations(ranked),
    eligibleCount: budgetSuitable.length,
    diagnostics,
    resolvedExclusions,
  }
}
