import type { ActivityType, GiftFeatures } from '../types'

/**
 * Kompakte bearbeitbare Daten für einen Katalogeintrag. Beim Aufbau des
 * Katalogs werden Standardwerte, eine stabile Kennung und Ersatzdarstellungen
 * ergänzt.
 */
export interface GiftSeed {
  titleUk: string
  amazonSearchQuery: string
  aliases?: string[]
  tags?: string[]
  ageMin?: number
  ageMax?: number
  price?: { min: number; max: number }
  players?: { min: number; max: number }
  features?: Partial<GiftFeatures>
  activities?: ActivityType[]
  descriptionUk?: string
}
