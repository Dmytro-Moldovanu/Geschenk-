import { describe, expect, it } from 'vitest'
import { recommendGifts } from '../engine/recommend'
import type { ChildProfile, Gift } from '../types'

const unrestricted = {
  noScreens: false,
  quietOnly: false,
  noViolence: false,
  noSmallParts: false,
}

function makeProfile(overrides: Partial<ChildProfile> = {}): ChildProfile {
  return {
    age: 9,
    interests: ['science', 'space'],
    budgetMax: null,
    playerCount: null,
    restrictions: unrestricted,
    alreadyHaveText: '',
    avoidText: '',
    ...overrides,
  }
}

function makeGift(id: string, overrides: Partial<Gift> = {}): Gift {
  const base: Gift = {
    id,
    titleUk: id,
    descriptionUk: 'Testgeschenk.',
    categoryId: 'science-lab',
    subcategoryId: id,
    recommendationGroup: 'science-lab',
    interestTags: ['science', 'space', 'puzzles'],
    activities: ['intellectual'],
    ageMin: 6,
    ageMax: 12,
    estimatedPrice: { min: 20, max: 30, currency: 'EUR' },
    players: { min: 1, max: 4 },
    features: { hasScreen: false, soundLevel: 'silent', violenceLevel: 'none', hasSmallParts: false },
    aliases: [id],
    amazonSearchQuery: `Test Geschenk ${id}`,
    image: { icon: '🧪', alt: 'Testillustration', fallbackKey: 'science-lab' },
  }

  return {
    ...base,
    ...overrides,
    features: { ...base.features, ...overrides.features },
    estimatedPrice: overrides.estimatedPrice ?? base.estimatedPrice,
    players: overrides.players ?? base.players,
    interestTags: overrides.interestTags ?? base.interestTags,
    activities: overrides.activities ?? base.activities,
    aliases: overrides.aliases ?? base.aliases,
    image: overrides.image ?? base.image,
  }
}

describe('recommendGifts', () => {
  it('filters by age before scoring', () => {
    const result = recommendGifts(makeProfile(), [
      makeGift('young', { ageMin: 3, ageMax: 7 }),
      makeGift('right-age', { ageMin: 8, ageMax: 11, recommendationGroup: 'space' }),
    ])

    expect(result.recommendations.map((item) => item.gift.id)).toEqual(['right-age'])
    expect(result.diagnostics.afterAge).toBe(1)
  })

  it('enforces screen, noise, violence and small-parts restrictions', () => {
    const safe = makeGift('safe', { recommendationGroup: 'safe' })
    const result = recommendGifts(makeProfile({
      restrictions: { noScreens: true, quietOnly: true, noViolence: true, noSmallParts: true },
    }), [
      safe,
      makeGift('screen', { features: { hasScreen: true, soundLevel: 'silent', violenceLevel: 'none', hasSmallParts: false } }),
      makeGift('noisy', { features: { hasScreen: false, soundLevel: 'loud', violenceLevel: 'none', hasSmallParts: false } }),
      makeGift('fantasy-combat', { features: { hasScreen: false, soundLevel: 'silent', violenceLevel: 'fantasy', hasSmallParts: false } }),
      makeGift('small-parts', { features: { hasScreen: false, soundLevel: 'silent', violenceLevel: 'none', hasSmallParts: true } }),
    ])

    expect(result.recommendations.map((item) => item.gift.id)).toEqual(['safe'])
    expect(result.diagnostics.afterRestrictions).toBe(1)
  })

  it('respects a player count and maximum budget', () => {
    const result = recommendGifts(makeProfile({ playerCount: 4, budgetMax: 30 }), [
      makeGift('solo', { players: { min: 1, max: 1 } }),
      makeGift('pricey', { players: { min: 2, max: 5 }, estimatedPrice: { min: 40, max: 50, currency: 'EUR' } }),
      makeGift('family-fit', { players: { min: 2, max: 6 }, estimatedPrice: { min: 24, max: 30, currency: 'EUR' } }),
    ])

    expect(result.recommendations.map((item) => item.gift.id)).toEqual(['family-fit'])
  })

  it('excludes a whole category when the free text says there is already lots of it', () => {
    const result = recommendGifts(makeProfile({ alreadyHaveText: 'Schon viel LEGO vorhanden.' }), [
      makeGift('lego-technic', { titleUk: 'LEGO Technic', categoryId: 'lego', recommendationGroup: 'lego', aliases: ['LEGO Technic'] }),
      makeGift('lego-city', { titleUk: 'LEGO City', categoryId: 'lego', recommendationGroup: 'lego', aliases: ['LEGO City'] }),
      makeGift('science-kit', { categoryId: 'science-lab', recommendationGroup: 'science-lab' }),
    ])

    expect(result.recommendations.map((item) => item.gift.id)).toEqual(['science-kit'])
  })

  it('can exclude one exact item without throwing away the whole category', () => {
    const result = recommendGifts(makeProfile({ alreadyHaveText: 'LEGO Technic' }), [
      makeGift('lego-technic', { titleUk: 'LEGO Technic', categoryId: 'lego', recommendationGroup: 'lego', aliases: ['LEGO Technic'] }),
      makeGift('lego-city', { titleUk: 'LEGO City', categoryId: 'lego', recommendationGroup: 'lego', aliases: ['LEGO City'] }),
      makeGift('science-kit', { categoryId: 'science-lab', recommendationGroup: 'science-lab' }),
    ])

    expect(result.recommendations.map((item) => item.gift.id)).toContain('lego-city')
    expect(result.recommendations.map((item) => item.gift.id)).not.toContain('lego-technic')
  })

  it('ranks direct interests first and keeps categories diverse when alternatives exist', () => {
    const catalog = [
      makeGift('science-top', { categoryId: 'science-lab', recommendationGroup: 'science-lab', interestTags: ['science', 'space', 'puzzles'] }),
      makeGift('science-second', { categoryId: 'science-lab', recommendationGroup: 'science-lab', interestTags: ['science', 'space', 'puzzles'] }),
      makeGift('space-model', { categoryId: 'space', recommendationGroup: 'space', interestTags: ['space', 'building', 'drawing'] }),
      makeGift('architecture', { categoryId: 'architecture', recommendationGroup: 'architecture', interestTags: ['building', 'architecture', 'drawing'] }),
      makeGift('drawing', { categoryId: 'drawing', recommendationGroup: 'drawing', interestTags: ['drawing', 'crafts', 'fashion'] }),
    ]
    const result = recommendGifts(makeProfile(), catalog)

    expect(result.recommendations[0]?.gift.categoryId).toBe('science-lab')
    expect(new Set(result.recommendations.slice(0, 3).map((item) => item.gift.categoryId)).size).toBe(3)
  })


  it('does not pad a result that has fewer than three valid gifts', () => {
    const result = recommendGifts(makeProfile(), [
      makeGift('one', { recommendationGroup: 'one' }),
      makeGift('two', { recommendationGroup: 'two' }),
    ])

    expect(result.eligibleCount).toBe(2)
    expect(result.recommendations).toHaveLength(2)
  })
})
