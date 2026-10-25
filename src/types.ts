export type RestrictionKey = 'noScreens' | 'quietOnly' | 'noViolence' | 'noSmallParts'

export interface ChildRestrictions {
  noScreens: boolean
  quietOnly: boolean
  noViolence: boolean
  noSmallParts: boolean
}

export interface ChildProfile {
  age: number
  interests: string[]
  budgetMax: number | null
  playerCount: number | null
  restrictions: ChildRestrictions
  alreadyHaveText: string
  avoidText: string
}

export interface InterestOption {
  id: string
  label: string
  icon: string
  group: 'Gestalten' | 'Entdecken' | 'Spielen' | 'Bewegen' | 'Fantasieren'
}

export type ActivityType = 'creative' | 'physical' | 'intellectual' | 'social' | 'roleplay' | 'outdoor' | 'collecting'
export type SoundLevel = 'silent' | 'low' | 'moderate' | 'loud'
export type ViolenceLevel = 'none' | 'fantasy' | 'combat'

export interface GiftCategory {
  id: string
  label: string
  description: string
  icon: string
  color: string
  aliases: string[]
  defaultTags: string[]
  activityTypes: ActivityType[]
}

export interface GiftFeatures {
  hasScreen: boolean
  soundLevel: SoundLevel
  violenceLevel: ViolenceLevel
  hasSmallParts: boolean
}

export interface GiftImage {
  icon: string
  alt: string
  fallbackKey: string
}

export interface Gift {
  id: string
  titleUk: string
  descriptionUk: string
  categoryId: string
  subcategoryId: string
  recommendationGroup: string
  interestTags: string[]
  activities: ActivityType[]
  ageMin: number
  ageMax: number
  estimatedPrice: { min: number; max: number; currency: 'EUR' }
  players: { min: number; max: number }
  features: GiftFeatures
  aliases: string[]
  amazonSearchQuery: string
  image: GiftImage
}

export interface SavedExclusions {
  version: 1
  giftIds: string[]
  categoryIds: string[]
  tagIds: string[]
}

export interface GiftMatchReason {
  directInterestIds: string[]
  relatedInterestIds: string[]
}

export interface RecommendedGift {
  gift: Gift
  score: number
  matchPercent: number
  reason: GiftMatchReason
}

export interface RecommendationDiagnostics {
  total: number
  afterAge: number
  afterRestrictions: number
  afterExclusions: number
  afterPlayers: number
  afterBudget: number
}

export interface RecommendationResult {
  recommendations: RecommendedGift[]
  eligibleCount: number
  diagnostics: RecommendationDiagnostics
}
