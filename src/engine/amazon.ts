/**
 * Die Anwendung liest keine Amazon-Daten aus. Sie öffnet lediglich eine
 * echte Amazon.de-Suche mit dem konkreten Suchbegriff aus dem lokalen Katalog.
 */
export function amazonSearchUrl(amazonSearchQuery: string) {
  return `https://www.amazon.de/s?k=${encodeURIComponent(amazonSearchQuery.trim())}`
}
