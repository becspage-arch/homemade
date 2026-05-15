/**
 * Procedural card renderer — zero-cost hero placeholder for tutorials that
 * don't have a real photographic / AI-generated hero yet.
 *
 * The renderer emits an SVG string parameterised on (category-slug, title).
 * The SVG is served via `/api/procedural-card/[tutorialId]` and cached at
 * the Cloudflare edge. No external API calls, no R2 uploads — the rendered
 * markup is small (~2 KB) and the colour palette is locked to the brand
 * tokens. Replace with a real Media row whenever an author uploads one.
 *
 * Design language: category-tinted soft gradient, faint parchment texture,
 * tutorial title set in Fraunces, small `homemade` wordmark bottom-right.
 * No subtitle, no metadata, no decoration.
 */

export type ProceduralCardCategoryKey =
  | 'cooking'
  | 'baking'
  | 'garden'
  | 'mindset'
  | 'herbal'
  | 'crochet'
  | 'knitting'
  | 'needlework'
  | 'sewing'
  | 'fibre'
  | 'wood'
  | 'paper'
  | 'pottery'
  | 'animals'
  | 'home-repair'
  | 'natural-home'
  | 'sustainability'
  | 'default'

interface Palette {
  start: string
  end: string
  ink: string
  wordmark: string
}

const PALETTES: Record<ProceduralCardCategoryKey, Palette> = {
  cooking: { start: '#F5EDDC', end: '#E8DBC4', ink: '#4A4138', wordmark: '#8a937a' },
  baking: { start: '#EFE0C7', end: '#D9C49B', ink: '#5A4634', wordmark: '#8a937a' },
  garden: { start: '#D8E5D2', end: '#B8CFB4', ink: '#3F5040', wordmark: '#6f7d65' },
  mindset: { start: '#C3D1BC', end: '#A5BC9F', ink: '#36473A', wordmark: '#6f7d65' },
  herbal: { start: '#E8E2D0', end: '#C6CDB4', ink: '#494E3A', wordmark: '#7a826b' },
  crochet: { start: '#E8D2D2', end: '#D5B8B8', ink: '#594545', wordmark: '#8a6f6f' },
  knitting: { start: '#E8D2D2', end: '#D5B8B8', ink: '#594545', wordmark: '#8a6f6f' },
  needlework: { start: '#E8D2D2', end: '#D5B8B8', ink: '#594545', wordmark: '#8a6f6f' },
  sewing: { start: '#E8D2D2', end: '#D5B8B8', ink: '#594545', wordmark: '#8a6f6f' },
  fibre: { start: '#E8D2D2', end: '#D5B8B8', ink: '#594545', wordmark: '#8a6f6f' },
  wood: { start: '#D8C2A6', end: '#B89880', ink: '#4F3B28', wordmark: '#7a614a' },
  paper: { start: '#F5EDDC', end: '#E8DBC4', ink: '#4A4138', wordmark: '#8a937a' },
  pottery: { start: '#D4B8A0', end: '#B89880', ink: '#503929', wordmark: '#7a614a' },
  animals: { start: '#E5D8B8', end: '#C7B58E', ink: '#4F4226', wordmark: '#85754e' },
  'home-repair': { start: '#C4C9C0', end: '#A5AC9D', ink: '#3D423B', wordmark: '#737a6c' },
  'natural-home': { start: '#E8E2D0', end: '#D2CAB0', ink: '#494E3A', wordmark: '#7a826b' },
  sustainability: { start: '#C7B89A', end: '#A89878', ink: '#4A3F2A', wordmark: '#7a6b4e' },
  default: { start: '#E8E2D0', end: '#C6CDB4', ink: '#494E3A', wordmark: '#7a826b' },
}

/**
 * Map a Category slug as stored in the DB to a palette key. Falls through to
 * 'default' for unknown slugs. The "fibre arts" category exists at the spec
 * level but the DB slug isn't yet locked — keep mappings permissive.
 */
export function paletteKeyForCategory(
  slug: string | null | undefined,
): ProceduralCardCategoryKey {
  if (!slug) return 'default'
  const s = slug.toLowerCase()
  if (s in PALETTES) return s as ProceduralCardCategoryKey
  if (s.includes('cook')) return 'cooking'
  if (s.includes('bak')) return 'baking'
  if (s.includes('garden') || s.includes('grow')) return 'garden'
  if (s.includes('mind') || s.includes('practice')) return 'mindset'
  if (s.includes('herb')) return 'herbal'
  if (s.includes('crochet')) return 'crochet'
  if (s.includes('knit')) return 'knitting'
  if (s.includes('needle') || s.includes('embroid')) return 'needlework'
  if (s.includes('sew')) return 'sewing'
  if (s.includes('fibre') || s.includes('fiber')) return 'fibre'
  if (s.includes('wood')) return 'wood'
  if (s.includes('paper') || s.includes('word')) return 'paper'
  if (s.includes('pott') || s.includes('ceram')) return 'pottery'
  if (s.includes('animal') || s.includes('smallhold')) return 'animals'
  if (s.includes('repair') || s.includes('diy')) return 'home-repair'
  if (s.includes('natural')) return 'natural-home'
  if (s.includes('sustain') || s.includes('off-grid') || s.includes('energy')) {
    return 'sustainability'
  }
  return 'default'
}

interface ProceduralCardInput {
  title: string
  categorySlug?: string | null
  width?: number
  height?: number
}

const DEFAULT_WIDTH = 1600
const DEFAULT_HEIGHT = 1068 // 3:2 aspect for the hero variant

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Wrap a title into at most three lines that fit a target character budget.
 * The font scales by line count so a one-line title reads big and a three-
 * line title still fits without overlapping the wordmark. Empty title falls
 * back to the wordmark itself.
 */
function wrapTitle(title: string, maxChars: number): string[] {
  const clean = title.trim().replace(/\s+/g, ' ')
  if (clean.length === 0) return []
  if (clean.length <= maxChars) return [clean]

  const words = clean.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (!current) {
      current = word
      continue
    }
    if (current.length + 1 + word.length <= maxChars) {
      current += ' ' + word
    } else {
      lines.push(current)
      current = word
      if (lines.length === 2) break
    }
  }
  if (current && lines.length < 3) lines.push(current)
  // If the final line was still way too long because of one giant word,
  // soft-truncate with an ellipsis so the card never spills over.
  return lines.map((line) =>
    line.length > maxChars + 6 ? line.slice(0, maxChars + 3) + '…' : line,
  )
}

/**
 * Render the procedural card as an SVG string. Output is deterministic for a
 * given (title, categorySlug) so the URL can be safely cached at the edge.
 */
export function renderProceduralCardSvg(input: ProceduralCardInput): string {
  const width = input.width ?? DEFAULT_WIDTH
  const height = input.height ?? DEFAULT_HEIGHT
  const palette = PALETTES[paletteKeyForCategory(input.categorySlug)]

  // Title sizing scales with line count and width. The big single-line case
  // reads ~115 px on the 1600-wide hero; three lines shrink to ~72 px.
  const maxChars = Math.round(width / 28)
  const lines = wrapTitle(input.title, maxChars)
  const lineCount = Math.max(1, lines.length)
  const baseFont =
    lineCount === 1
      ? Math.round(width * 0.072)
      : lineCount === 2
        ? Math.round(width * 0.058)
        : Math.round(width * 0.046)
  const leading = Math.round(baseFont * 1.12)
  const blockHeight = leading * lineCount
  const startY = Math.round((height - blockHeight) / 2) + Math.round(baseFont * 0.85)

  const gradientId = `g-${palette.start.slice(1)}-${palette.end.slice(1)}`

  // Hand-tuned parchment grain — a sparse mix of low-opacity dots.
  const grainCircles: string[] = []
  // Deterministic pseudo-random spread keyed off the rendered SVG dimensions
  // so cached output never shifts between requests.
  const seed = (width * 31 + height * 17) % 1000
  for (let i = 0; i < 28; i += 1) {
    const px = ((seed + i * 73) * 19) % width
    const py = ((seed + i * 47) * 23) % height
    const r = ((seed + i * 11) % 3) + 1
    grainCircles.push(
      `<circle cx="${px}" cy="${py}" r="${r}" fill="${palette.ink}" fill-opacity="0.05"/>`,
    )
  }

  const titleLines = lines
    .map(
      (line, idx) =>
        `<text x="${width / 2}" y="${startY + idx * leading}" text-anchor="middle" font-family="'Fraunces', Georgia, serif" font-size="${baseFont}" font-weight="400" letter-spacing="-0.005em" fill="${palette.ink}">${escapeXml(line)}</text>`,
    )
    .join('')

  // Soft rule above title — quiet visual anchor when title is short.
  const ruleY = startY - baseFont - Math.round(baseFont * 0.55)
  const ruleHalf = Math.min(120, Math.round(width * 0.06))
  const rule = `<line x1="${width / 2 - ruleHalf}" y1="${ruleY}" x2="${width / 2 + ruleHalf}" y2="${ruleY}" stroke="${palette.wordmark}" stroke-width="1" stroke-opacity="0.5"/>`

  const wordmarkSize = Math.round(width * 0.018)
  const wordmark = `<text x="${width - Math.round(width * 0.03)}" y="${height - Math.round(height * 0.04)}" text-anchor="end" font-family="'Fraunces', Georgia, serif" font-size="${wordmarkSize}" fill="${palette.wordmark}" fill-opacity="0.6" letter-spacing="0.18em">homemade</text>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${palette.start}"/><stop offset="100%" stop-color="${palette.end}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#${gradientId})"/>${grainCircles.join('')}${rule}${titleLines}${wordmark}</svg>`
}

/**
 * Build the stable per-tutorial procedural-card URL. The renderer is a Next
 * route at `/api/procedural-card/[tutorialId]` that reads the tutorial's
 * title + category and emits an SVG. The URL is the same across requests
 * so Cloudflare can cache aggressively.
 *
 * The `v` cache-bust suffix is only used when callers want to force a refresh
 * (e.g. after a title rename). Default leaves it off so the URL is fully stable.
 */
export function proceduralCardUrl(tutorialId: string, opts: { v?: number } = {}): string {
  const base = `/api/procedural-card/${encodeURIComponent(tutorialId)}`
  return opts.v ? `${base}?v=${opts.v}` : base
}
