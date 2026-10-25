import { describe, expect, it } from 'vitest'
import { GIFT_CATALOG, validateCatalog } from '../data/catalog'
import { amazonSearchUrl } from '../engine/amazon'
import { recommendGifts } from '../engine/recommend'

describe('local gift catalog', () => {
  it('has a structurally valid and broad data set', () => {
    expect(validateCatalog()).toEqual([])
    expect(GIFT_CATALOG.length).toBeGreaterThanOrEqual(300)
    expect(new Set(GIFT_CATALOG.map((gift) => gift.categoryId)).size).toBeGreaterThanOrEqual(30)
  })

  it('keeps every Amazon search query concrete and non-empty', () => {
    for (const gift of GIFT_CATALOG) {
      const wordCount = gift.amazonSearchQuery.trim().split(/\s+/).filter(Boolean).length
      expect(wordCount).toBeGreaterThanOrEqual(2)
      expect(wordCount).toBeLessThanOrEqual(6)
      expect(new URL(amazonSearchUrl(gift.amazonSearchQuery)).searchParams.get('k')).toBe(gift.amazonSearchQuery)
    }
  })

  it('returns a varied 3–5 card result for a typical profile', () => {
    const result = recommendGifts({
      age: 9,
      interests: ['space', 'science', 'building'],
      budgetMax: 60,
      playerCount: null,
      restrictions: { noScreens: false, quietOnly: false, noViolence: false, noSmallParts: false },
      alreadyHaveText: '',
      avoidText: '',
    }, GIFT_CATALOG)

    expect(result.recommendations.length).toBeGreaterThanOrEqual(3)
    expect(result.recommendations.length).toBeLessThanOrEqual(5)
    expect(new Set(result.recommendations.map((item) => item.gift.categoryId)).size).toBeGreaterThanOrEqual(3)
  })
})

describe('Amazon.de search links', () => {
  it('encodes a German product query into a real Amazon.de search URL', () => {
    expect(amazonSearchUrl('Märklin my world')).toBe('https://www.amazon.de/s?k=M%C3%A4rklin%20my%20world')
  })
})
