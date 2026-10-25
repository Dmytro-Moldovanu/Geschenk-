import { INTEREST_OPTIONS } from './interests'

export const KNOWN_INTEREST_IDS = new Set(INTEREST_OPTIONS.map((interest) => interest.id))

/**
 * Mögliche Formulierungen aus den Freitextfeldern des Fragebogens.
 * Die Begriffe sind bewusst konkret, damit unklare Formulierungen nicht
 * versehentlich ganze Kategorien ausschließen.
 */
export const INTEREST_ALIASES: Record<string, readonly string[]> = {
  building: ['baukasten', 'baukästen', 'bauen', 'bausteine', 'klemmbausteine', 'lego'],
  robots: ['roboter', 'robotik', 'robotikset'],
  coding: ['programmieren', 'coding', 'algorithmen'],
  architecture: ['architektur', 'gebäude', 'modelle', 'modellbau'],
  drawing: ['zeichnen', 'malen', 'farben', 'stifte', 'skizze'],
  crafts: ['basteln', 'handarbeit', 'applikationen', 'perlen'],
  clay: ['modellieren', 'knete', 'ton', 'modelliermasse'],
  fashion: ['mode', 'design', 'stil', 'schmuck'],
  cooking: ['kochen', 'backen', 'küche', 'rezepte'],
  music: ['musik', 'musikinstrumente', 'singen', 'rhythmus'],
  science: ['experimente', 'wissenschaft', 'versuche', 'chemie', 'physik'],
  space: ['weltraum', 'astronomie', 'planeten', 'raketen', 'teleskop'],
  dinosaurs: ['dinosaurier', 'dino', 'paläontologie', 'fossilien'],
  animals: ['tiere', 'tier', 'pferd', 'bauernhof'],
  nature: ['natur', 'insekten', 'naturforscher', 'naturforschung'],
  gardening: ['garten', 'pflanzen', 'gemüsegarten', 'blumen', 'samen'],
  books: ['bücher', 'buch', 'lesen', 'lexikon'],
  comics: ['comics', 'comic', 'manga', 'bildergeschichten'],
  languages: ['sprachen', 'wörter', 'englisch', 'lesen'],
  photography: ['foto', 'fotografie', 'kamera', 'video', 'stop motion'],
  'board-games': ['brettspiele', 'gesellschaftsspiele', 'brettspiel', 'kartenspiel'],
  strategy: ['strategie', 'taktik', 'schach', 'logik'],
  puzzles: ['knobelspiele', 'knobelspiel', 'puzzles', 'puzzle', 'rubiks cube'],
  detective: ['detektiv', 'detektive', 'rätselabenteuer', 'rätsel', 'codes'],
  magic: ['zaubertricks', 'zauberer', 'magie', 'illusionen'],
  vehicles: ['autos', 'fahrzeuge', 'auto', 'rennen', 'verkehr'],
  trains: ['züge', 'zug', 'eisenbahn', 'waggons'],
  planes: ['flugzeuge', 'flugzeug', 'luftfahrt', 'hubschrauber'],
  sports: ['sport', 'fußball', 'basketball', 'tennis'],
  outdoor: ['aktive spiele', 'draußen', 'outdoor', 'roller', 'bewegungsspiele'],
  camping: ['camping', 'wandern', 'zeltlager', 'expedition'],
  dance: ['tanzen', 'tanz', 'choreografie'],
  dolls: ['puppen', 'puppe', 'puppenhaus', 'barbie'],
  'role-play': ['rollenspiele', 'berufsspiel', 'arzt', 'kaufladen'],
  minecraft: ['minecraft', 'minecraft spielzeug'],
  pokemon: ['pokemon', 'pokémon'],
  'star-wars': ['star wars', 'krieg der sterne'],
  'harry-potter': ['harry potter', 'hogwarts'],
}

export interface RelatedInterest {
  id: string
  weight: number
}

/**
 * Verwandte Interessen für die Bewertung. Ein direkt ausgewähltes Interesse
 * erhält immer ein höheres Gewicht als ein nur verwandtes Thema.
 */
export const RELATED_INTERESTS: Record<string, readonly RelatedInterest[]> = {
  building: [{ id: 'architecture', weight: 0.6 }, { id: 'robots', weight: 0.5 }, { id: 'vehicles', weight: 0.35 }],
  robots: [{ id: 'coding', weight: 0.8 }, { id: 'science', weight: 0.55 }, { id: 'building', weight: 0.45 }],
  coding: [{ id: 'robots', weight: 0.8 }, { id: 'science', weight: 0.55 }, { id: 'puzzles', weight: 0.4 }],
  architecture: [{ id: 'building', weight: 0.75 }, { id: 'drawing', weight: 0.45 }, { id: 'puzzles', weight: 0.2 }],
  drawing: [{ id: 'crafts', weight: 0.7 }, { id: 'comics', weight: 0.55 }, { id: 'fashion', weight: 0.45 }],
  crafts: [{ id: 'drawing', weight: 0.65 }, { id: 'clay', weight: 0.5 }, { id: 'fashion', weight: 0.5 }],
  clay: [{ id: 'crafts', weight: 0.55 }, { id: 'animals', weight: 0.35 }, { id: 'drawing', weight: 0.35 }],
  fashion: [{ id: 'drawing', weight: 0.55 }, { id: 'crafts', weight: 0.6 }, { id: 'dolls', weight: 0.3 }],
  cooking: [{ id: 'crafts', weight: 0.4 }, { id: 'role-play', weight: 0.7 }, { id: 'nature', weight: 0.25 }],
  music: [{ id: 'dance', weight: 0.75 }, { id: 'role-play', weight: 0.3 }],
  science: [{ id: 'space', weight: 0.7 }, { id: 'robots', weight: 0.45 }, { id: 'nature', weight: 0.4 }],
  space: [{ id: 'science', weight: 0.7 }, { id: 'building', weight: 0.35 }, { id: 'star-wars', weight: 0.25 }],
  dinosaurs: [{ id: 'animals', weight: 0.55 }, { id: 'science', weight: 0.5 }, { id: 'nature', weight: 0.4 }],
  animals: [{ id: 'nature', weight: 0.75 }, { id: 'dinosaurs', weight: 0.45 }, { id: 'role-play', weight: 0.3 }],
  nature: [{ id: 'animals', weight: 0.75 }, { id: 'science', weight: 0.5 }, { id: 'gardening', weight: 0.55 }],
  gardening: [{ id: 'nature', weight: 0.75 }, { id: 'science', weight: 0.35 }, { id: 'crafts', weight: 0.25 }],
  books: [{ id: 'comics', weight: 0.45 }, { id: 'detective', weight: 0.4 }, { id: 'harry-potter', weight: 0.3 }],
  comics: [{ id: 'drawing', weight: 0.6 }, { id: 'books', weight: 0.5 }, { id: 'star-wars', weight: 0.25 }],
  languages: [{ id: 'books', weight: 0.45 }, { id: 'puzzles', weight: 0.3 }],
  photography: [{ id: 'drawing', weight: 0.45 }, { id: 'comics', weight: 0.3 }],
  'board-games': [{ id: 'strategy', weight: 0.55 }, { id: 'puzzles', weight: 0.45 }, { id: 'detective', weight: 0.25 }],
  strategy: [{ id: 'puzzles', weight: 0.65 }, { id: 'board-games', weight: 0.5 }, { id: 'coding', weight: 0.25 }],
  puzzles: [{ id: 'strategy', weight: 0.65 }, { id: 'detective', weight: 0.45 }, { id: 'building', weight: 0.25 }],
  detective: [{ id: 'puzzles', weight: 0.6 }, { id: 'books', weight: 0.4 }, { id: 'magic', weight: 0.25 }],
  magic: [{ id: 'harry-potter', weight: 0.7 }, { id: 'detective', weight: 0.35 }, { id: 'role-play', weight: 0.35 }],
  vehicles: [{ id: 'trains', weight: 0.45 }, { id: 'planes', weight: 0.45 }, { id: 'building', weight: 0.3 }],
  trains: [{ id: 'vehicles', weight: 0.55 }, { id: 'building', weight: 0.4 }, { id: 'role-play', weight: 0.25 }],
  planes: [{ id: 'vehicles', weight: 0.55 }, { id: 'space', weight: 0.35 }, { id: 'building', weight: 0.3 }],
  sports: [{ id: 'outdoor', weight: 0.7 }, { id: 'dance', weight: 0.25 }],
  outdoor: [{ id: 'sports', weight: 0.7 }, { id: 'nature', weight: 0.45 }, { id: 'camping', weight: 0.45 }],
  camping: [{ id: 'outdoor', weight: 0.7 }, { id: 'nature', weight: 0.65 }, { id: 'science', weight: 0.2 }],
  dance: [{ id: 'music', weight: 0.75 }, { id: 'sports', weight: 0.3 }],
  dolls: [{ id: 'role-play', weight: 0.7 }, { id: 'fashion', weight: 0.3 }],
  'role-play': [{ id: 'dolls', weight: 0.55 }, { id: 'cooking', weight: 0.5 }, { id: 'detective', weight: 0.25 }],
  minecraft: [{ id: 'building', weight: 0.65 }, { id: 'vehicles', weight: 0.25 }, { id: 'puzzles', weight: 0.25 }],
  pokemon: [{ id: 'board-games', weight: 0.45 }, { id: 'strategy', weight: 0.35 }],
  'star-wars': [{ id: 'space', weight: 0.65 }, { id: 'building', weight: 0.35 }],
  'harry-potter': [{ id: 'books', weight: 0.6 }, { id: 'magic', weight: 0.75 }, { id: 'detective', weight: 0.3 }],
}
