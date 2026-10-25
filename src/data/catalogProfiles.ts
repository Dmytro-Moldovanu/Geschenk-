import type { ActivityType, GiftFeatures } from '../types'

export interface CatalogProfile {
  age: { min: number; max: number }
  price: { min: number; max: number }
  players: { min: number; max: number }
  features: GiftFeatures
  activities: ActivityType[]
}

const calmFeatures: GiftFeatures = {
  hasScreen: false,
  soundLevel: 'silent',
  violenceLevel: 'none',
  hasSmallParts: true,
}

function profile(
  age: CatalogProfile['age'],
  price: CatalogProfile['price'],
  players: CatalogProfile['players'],
  activities: ActivityType[],
  features: Partial<GiftFeatures> = {},
): CatalogProfile {
  return {
    age,
    price,
    players,
    activities,
    features: { ...calmFeatures, ...features },
  }
}

/**
 * Plausible Standardwerte für die einzelnen Katalogbereiche. Einzelne
 * Geschenke können abweichende Angaben zu Alter, Lautstärke und Sicherheit
 * erhalten.
 */
export const CATALOG_PROFILES: Record<string, CatalogProfile> = {
  lego: profile({ min: 4, max: 14 }, { min: 18, max: 90 }, { min: 1, max: 4 }, ['creative', 'intellectual']),
  'wood-build': profile({ min: 5, max: 15 }, { min: 15, max: 75 }, { min: 1, max: 3 }, ['creative', 'intellectual']),
  'magnetic-build': profile({ min: 3, max: 12 }, { min: 25, max: 105 }, { min: 1, max: 4 }, ['creative', 'intellectual'], { hasSmallParts: false }),
  'marble-runs': profile({ min: 4, max: 14 }, { min: 20, max: 95 }, { min: 1, max: 4 }, ['creative', 'intellectual']),
  robotics: profile({ min: 6, max: 15 }, { min: 35, max: 180 }, { min: 1, max: 3 }, ['creative', 'intellectual']),
  'coding-electronics': profile({ min: 8, max: 15 }, { min: 25, max: 130 }, { min: 1, max: 2 }, ['creative', 'intellectual']),
  'science-lab': profile({ min: 7, max: 15 }, { min: 14, max: 55 }, { min: 1, max: 3 }, ['creative', 'intellectual']),
  space: profile({ min: 6, max: 15 }, { min: 12, max: 130 }, { min: 1, max: 3 }, ['creative', 'intellectual']),
  dinosaurs: profile({ min: 4, max: 13 }, { min: 10, max: 65 }, { min: 1, max: 3 }, ['creative', 'roleplay']),
  architecture: profile({ min: 8, max: 16 }, { min: 18, max: 100 }, { min: 1, max: 2 }, ['creative', 'intellectual']),
  drawing: profile({ min: 4, max: 16 }, { min: 8, max: 60 }, { min: 1, max: 2 }, ['creative']),
  crafts: profile({ min: 5, max: 15 }, { min: 7, max: 48 }, { min: 1, max: 2 }, ['creative']),
  clay: profile({ min: 3, max: 14 }, { min: 6, max: 36 }, { min: 1, max: 3 }, ['creative'], { hasSmallParts: false }),
  music: profile({ min: 3, max: 14 }, { min: 12, max: 105 }, { min: 1, max: 6 }, ['creative', 'physical', 'social'], { soundLevel: 'moderate' }),
  'board-games': profile({ min: 4, max: 14 }, { min: 8, max: 48 }, { min: 2, max: 6 }, ['social', 'intellectual']),
  'strategy-games': profile({ min: 6, max: 16 }, { min: 12, max: 55 }, { min: 2, max: 5 }, ['social', 'intellectual']),
  puzzles: profile({ min: 5, max: 16 }, { min: 8, max: 45 }, { min: 1, max: 2 }, ['intellectual']),
  detective: profile({ min: 7, max: 14 }, { min: 10, max: 44 }, { min: 1, max: 6 }, ['social', 'intellectual', 'roleplay']),
  'rc-vehicles': profile({ min: 6, max: 14 }, { min: 22, max: 120 }, { min: 1, max: 2 }, ['physical', 'outdoor'], { soundLevel: 'moderate' }),
  trains: profile({ min: 3, max: 12 }, { min: 22, max: 130 }, { min: 1, max: 4 }, ['creative', 'roleplay']),
  cars: profile({ min: 3, max: 14 }, { min: 8, max: 80 }, { min: 1, max: 3 }, ['creative', 'physical']),
  sports: profile({ min: 4, max: 15 }, { min: 10, max: 150 }, { min: 1, max: 8 }, ['physical', 'outdoor'], { hasSmallParts: false }),
  outdoor: profile({ min: 4, max: 14 }, { min: 8, max: 65 }, { min: 1, max: 8 }, ['physical', 'outdoor'], { hasSmallParts: false }),
  animals: profile({ min: 3, max: 13 }, { min: 10, max: 85 }, { min: 1, max: 4 }, ['roleplay', 'collecting']),
  nature: profile({ min: 5, max: 14 }, { min: 10, max: 62 }, { min: 1, max: 3 }, ['outdoor', 'intellectual']),
  cooking: profile({ min: 3, max: 12 }, { min: 12, max: 180 }, { min: 1, max: 4 }, ['creative', 'roleplay', 'social'], { hasSmallParts: false }),
  dolls: profile({ min: 3, max: 12 }, { min: 12, max: 105 }, { min: 1, max: 3 }, ['roleplay', 'collecting']),
  roleplay: profile({ min: 3, max: 12 }, { min: 10, max: 95 }, { min: 1, max: 4 }, ['roleplay', 'social'], { hasSmallParts: false }),
  minecraft: profile({ min: 6, max: 14 }, { min: 8, max: 100 }, { min: 1, max: 4 }, ['creative', 'roleplay']),
  pokemon: profile({ min: 6, max: 15 }, { min: 8, max: 75 }, { min: 1, max: 4 }, ['collecting', 'social']),
  'star-wars': profile({ min: 6, max: 15 }, { min: 8, max: 120 }, { min: 1, max: 4 }, ['collecting', 'roleplay']),
  'harry-potter': profile({ min: 7, max: 15 }, { min: 8, max: 90 }, { min: 1, max: 4 }, ['collecting', 'roleplay']),
  books: profile({ min: 5, max: 16 }, { min: 7, max: 38 }, { min: 1, max: 2 }, ['intellectual']),
  preschool: profile({ min: 2, max: 6 }, { min: 12, max: 70 }, { min: 1, max: 4 }, ['creative', 'intellectual'], { hasSmallParts: false }),
  'toddler-sensory': profile({ min: 2, max: 14 }, { min: 8, max: 120 }, { min: 1, max: 2 }, ['creative', 'physical'], { hasSmallParts: false }),
  'teen-hobbies': profile({ min: 10, max: 17 }, { min: 18, max: 180 }, { min: 1, max: 2 }, ['creative', 'intellectual']),
}
