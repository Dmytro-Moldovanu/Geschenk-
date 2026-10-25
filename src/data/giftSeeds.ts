import { GIFT_SEED_ROWS_A } from './giftSeedRowsA'
import { GIFT_SEED_ROWS_B } from './giftSeedRowsB'
import type { GiftSeed } from './giftSeedTypes'

export type { GiftSeed } from './giftSeedTypes'

/**
 * Die Produktdaten sind zur besseren Lesbarkeit thematisch aufgeteilt.
 * Neue Geschenke werden ausschließlich in den Datentabellen ergänzt;
 * der Empfehlungsalgorithmus muss dafür nicht geändert werden.
 */
export const GIFT_SEEDS_BY_CATEGORY: Record<string, readonly GiftSeed[]> = {
  ...GIFT_SEED_ROWS_A,
  ...GIFT_SEED_ROWS_B,
}
