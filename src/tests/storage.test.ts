import { describe, expect, it } from 'vitest'
import { addGiftExclusion } from '../engine/storage'

describe('saved exclusions', () => {
  it('adds a gift once without changing category or tag exclusions', () => {
    const initial = { version: 1 as const, giftIds: ['gift-a'], categoryIds: ['lego'], tagIds: ['building'] }
    const next = addGiftExclusion(initial, ' gift-b ')
    const repeated = addGiftExclusion(next, 'gift-b')

    expect(next).toEqual({ version: 1, giftIds: ['gift-a', 'gift-b'], categoryIds: ['lego'], tagIds: ['building'] })
    expect(repeated).toEqual(next)
  })
})
