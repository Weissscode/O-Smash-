/** Normalise pour la recherche : minuscules, sans accents ni apostrophes typographiques. */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}
