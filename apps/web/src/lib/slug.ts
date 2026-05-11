/**
 * Generate a URL-safe slug from a free-text title.
 * Lowercase, ASCII letters/numbers, hyphens for spaces. Stripped of
 * accents and punctuation. Never empty (falls back to "untitled").
 */
export function slugify(input: string): string {
  const base = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  return base || 'untitled'
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function isValidSlug(s: string): boolean {
  return SLUG_PATTERN.test(s)
}
