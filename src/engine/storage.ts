import type { SavedExclusions } from '../types'

export const SAVED_EXCLUSIONS_STORAGE_KEY = 'podarunok-recommender:exclusions:v1'

function createEmptyExclusions(): SavedExclusions {
  return {
    version: 1,
    giftIds: [],
    categoryIds: [],
    tagIds: [],
  }
}

function normalizeIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    return null
  }

  return [...new Set(value.map((item) => item.trim()).filter(Boolean))]
}

function normalizeSavedExclusions(value: unknown): SavedExclusions | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<SavedExclusions>
  if (candidate.version !== 1) {
    return null
  }

  const giftIds = normalizeIds(candidate.giftIds)
  const categoryIds = normalizeIds(candidate.categoryIds)
  const tagIds = normalizeIds(candidate.tagIds)

  if (!giftIds || !categoryIds || !tagIds) {
    return null
  }

  return { version: 1, giftIds, categoryIds, tagIds }
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadSavedExclusions(): SavedExclusions {
  const storage = getLocalStorage()
  if (!storage) {
    return createEmptyExclusions()
  }

  try {
    const savedValue = storage.getItem(SAVED_EXCLUSIONS_STORAGE_KEY)
    if (!savedValue) {
      return createEmptyExclusions()
    }

    return normalizeSavedExclusions(JSON.parse(savedValue)) ?? createEmptyExclusions()
  } catch {
    return createEmptyExclusions()
  }
}

export function saveSavedExclusions(value: SavedExclusions): boolean {
  const normalized = normalizeSavedExclusions(value)
  const storage = getLocalStorage()

  if (!normalized || !storage) {
    return false
  }

  try {
    storage.setItem(SAVED_EXCLUSIONS_STORAGE_KEY, JSON.stringify(normalized))
    return true
  } catch {
    return false
  }
}

export function addGiftExclusion(current: SavedExclusions, giftId: string): SavedExclusions {
  const normalized = normalizeSavedExclusions(current) ?? createEmptyExclusions()
  const normalizedGiftId = giftId.trim()

  if (!normalizedGiftId) {
    return normalized
  }

  return {
    ...normalized,
    giftIds: [...new Set([...normalized.giftIds, normalizedGiftId])],
  }
}

export function clearSavedExclusions(): SavedExclusions {
  const storage = getLocalStorage()

  if (storage) {
    try {
      storage.removeItem(SAVED_EXCLUSIONS_STORAGE_KEY)
    } catch {
      // Auch ohne Speicherung bleibt der leere Wert im Arbeitsspeicher verwendbar.
    }
  }

  return createEmptyExclusions()
}
