/**
 * SUBJECT KEY — the text half of the duplicate guard.
 *
 * The image fingerprints in `similarity.ts` catch two rows that LOOK the same.
 * They cannot catch the other failure mode that filled this catalogue with
 * duplicates: the same IDEA, generated five times over, landing five visibly
 * different-but-interchangeable charts ("big japanese garden" ×5). That is a
 * TEXT problem, and this is the text normaliser that fixes it.
 *
 * A subject key is the subject phrase reduced to its load-bearing nouns and
 * adjectives: lowercased, punctuation stripped, articles / prepositions / craft
 * and style words removed, light plural folding, whitespace collapsed. Two
 * subjects with the same key are the same idea however they were phrased.
 *
 * Pure and dependency-free (no `server-only`, no Prisma) so the planner, the
 * publish guard, the backfill script and the tests all share ONE definition.
 */

/**
 * Words that carry no subject meaning. Articles, prepositions, conjunctions and
 * the craft/style vocabulary the planner and the style lanes sprinkle around a
 * subject ("a cross-stitch illustration of ...", "in a cute storybook style").
 *
 * Deliberately conservative: a word only belongs here if dropping it can never
 * merge two genuinely different designs. Colour words, animals, moods, seasons
 * and settings all stay — they are what makes one garden different from another.
 */
const STOPWORDS = new Set([
  // articles / determiners / pronouns
  'a', 'an', 'the', 'this', 'that', 'these', 'those', 'its', 'it', 'his', 'her', 'their', 'some', 'any',
  // prepositions / conjunctions / copulas
  'of', 'in', 'on', 'at', 'to', 'into', 'onto', 'from', 'by', 'with', 'without', 'for', 'and', 'or',
  'as', 'is', 'are', 'be', 'being', 'over', 'under', 'up', 'down', 'out', 'off', 'through', 'across',
  // craft / medium vocabulary
  'cross', 'stitch', 'crossstitch', 'crossstitched', 'stitched', 'stitching', 'chart', 'pattern',
  'patterns', 'design', 'designs', 'embroidery', 'needlework', 'sampler', 'motif', 'piece', 'artwork',
  // generic style / rendering vocabulary
  'style', 'styled', 'illustration', 'illustrated', 'illustrative', 'picture', 'image', 'art',
  'drawing', 'drawn', 'render', 'rendered', 'graphic', 'graphical', 'print', 'poster', 'flat',
  // composition words: every landscape is "a scene", every wreath is a "composition"
  'scene', 'composition', 'view', 'depiction',
  'modern', 'classic', 'simple', 'detailed', 'clean', 'crisp', 'bold', 'beautiful', 'pretty',
  'lovely', 'charming', 'stylish', 'stylised', 'stylized', 'aesthetic', 'themed', 'inspired',
  // filler adjectives the planner reaches for that never distinguish two designs
  'very', 'really', 'quite', 'nice', 'good', 'great',
])

/**
 * Light plural folding so "gardens" and "garden" are one idea. Only the safe
 * cases: never touch a short word, a double-s ending (grass, moss), or the
 * -ss/-us/-is endings that are not plurals.
 */
function singularise(word: string): string {
  if (word.length <= 3) return word
  if (/(ss|us|is|as|os)$/.test(word)) return word
  if (/ies$/.test(word)) return `${word.slice(0, -3)}y`
  if (/(ches|shes|xes|zes|ses)$/.test(word)) return word.slice(0, -2)
  if (/s$/.test(word)) return word.slice(0, -1)
  return word
}

/** The load-bearing tokens of a subject, in order, after normalisation. */
export function subjectTokens(subject: string): string[] {
  return subject
    .normalize('NFKD')
    .replace(/[‘’ʼ]/g, "'") // curly apostrophes → straight
    .toLowerCase()
    .replace(/'s\b/g, '') // possessives carry no extra subject meaning
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(singularise)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w))
}

/**
 * The normalised subject key. Empty string when a subject reduces to nothing
 * (all stopwords) — callers must treat an empty key as "no signal", never as a
 * match, or every such row would collide with every other.
 */
export function subjectKey(subject: string): string {
  return subjectTokens(subject).join(' ')
}

/** Token-set Jaccard overlap of two subjects, 0..1. */
export function subjectJaccard(a: string, b: string): number {
  const sa = new Set(subjectTokens(a))
  const sb = new Set(subjectTokens(b))
  if (sa.size === 0 || sb.size === 0) return 0
  let inter = 0
  for (const t of sa) if (sb.has(t)) inter++
  return inter / (sa.size + sb.size - inter)
}

/** Same rule as `subjectJaccard` but on two ALREADY-normalised keys. */
export function keyJaccard(keyA: string, keyB: string): number {
  const sa = new Set(keyA.split(' ').filter(Boolean))
  const sb = new Set(keyB.split(' ').filter(Boolean))
  if (sa.size === 0 || sb.size === 0) return 0
  let inter = 0
  for (const t of sa) if (sb.has(t)) inter++
  return inter / (sa.size + sb.size - inter)
}

/**
 * The overlap at which two subject keys are the SAME IDEA. Measured against the
 * September 2026 duplicate clusters: the repeated stems ("big japanese garden"
 * vs "big japanese garden scene") sit at 0.75–1.00, while shelf-mates that are
 * genuinely different pieces ("a red fox in autumn leaves" vs "a red squirrel
 * among autumn leaves and toadstools") sit at 0.43 or below.
 */
export const SUBJECT_JACCARD_MATCH = 0.6

/**
 * Binary: does this key match anything in the catalogue? Exact match first
 * (cheap, and the common case), then the token-overlap rule. Returns the
 * matched key so the caller can name what it collided with.
 *
 * An empty candidate key never matches — a subject that normalises away carries
 * no signal, and matching it would block every publish.
 */
export function findSubjectKeyMatch(
  key: string,
  existing: Iterable<string>,
  threshold: number = SUBJECT_JACCARD_MATCH,
): { key: string; overlap: number } | null {
  if (!key) return null
  const tokens = new Set(key.split(' ').filter(Boolean))
  if (tokens.size === 0) return null
  let best: { key: string; overlap: number } | null = null
  for (const other of existing) {
    if (!other) continue
    if (other === key) return { key: other, overlap: 1 }
    const overlap = keyJaccard(key, other)
    if (overlap >= threshold && (!best || overlap > best.overlap)) best = { key: other, overlap }
  }
  return best
}
