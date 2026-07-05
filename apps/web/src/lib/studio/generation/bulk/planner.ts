import 'server-only'
import { anthropicConfigured, anthropicJson, PLANNER_MODEL } from '@/lib/anthropic'
import { STYLE, type StyleKey } from './cross-stitch-style'
import {
  CROSS_STITCH_THEMES,
  CROSS_STITCH_SIZE_LANES,
  NEEDLEWORK_THEMES,
  NEEDLEWORK_SIZE_LANES,
  NEEDLEWORK_SHELF,
  NEEDLEWORK_SHELF_NAME,
  type CrossStitchTheme,
  type NeedleworkTheme,
} from './subject-pool'

/**
 * The batch PLANNER — composes a varied set of briefs from the subject pool,
 * spanning the full complexity RANGE (a fresh planner each batch, so the set
 * never drifts). This ports the "a cold Claude session composes ~11 briefs
 * across the range" step of the retired PC routine into the server job. One
 * cheap Anthropic call per batch; the ruthless per-candidate vision gate is the
 * expensive judgment. Falls back to sampling the curated pool examples if the
 * model under-delivers, so a batch is always full + varied.
 */

export interface CrossStitchBrief {
  slug: string
  /** Subject phrase only (no style suffix) — the pipeline appends the style. */
  subject: string
  style: StyleKey
  /** Chart size in cells. */
  w: number
  h: number
  colours: number
  /** Optional source-saturation override (skin-heavy portraits). */
  sat?: number
  shelf: string
  shelfName: string
  themeId: string
}

export interface NeedleworkBrief {
  slug: string
  name: string
  subject: string
  widthMm: number
  frame: 'round' | 'rect' | 'none'
  detail: boolean
  fullScene: boolean
  tameWarm: boolean
  themeId: string
}

const STYLE_KEYS = Object.keys(STYLE) as StyleKey[]
const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, Math.round(n)))
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!

/**
 * Detailed styles (realistic pet portraits, fine-art faces) need a size + colour
 * floor — under-resolved they turn to mush (a 120-cell realistic collie has muddy
 * eyes). Raise the brief to at least a medium canvas. Flat/graphic styles are fine
 * small, so they're untouched.
 */
function applyStyleFloors(b: CrossStitchBrief): CrossStitchBrief {
  const needsDetail: StyleKey[] = ['dogportrait', 'artface', 'icon']
  if (!needsDetail.includes(b.style)) return b
  return {
    ...b,
    w: Math.max(b.w, 160),
    h: Math.max(b.h, 160),
    colours: Math.max(b.colours, 34),
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
}
/** A short unique suffix so a new gem never overwrites an existing slug. */
function uniqueSuffix(): string {
  return Math.floor(Math.random() * 1e6).toString(36).padStart(4, '0').slice(-4)
}

// ─────────────────────────── CROSS-STITCH ───────────────────────────

const XS_SYSTEM = `You are the creative director composing briefs for Homemade's cross-stitch catalogue — aiming to be the BEST cross-stitch collection in the world. You pick WHAT to make; a separate illustrator + a ruthless quality gate handle HOW. Your job is a set of STANDOUT designs people stop scrolling for.

THE BAR — every brief must be beautiful OR genuinely fun, ideally with a hook:
- BEAUTIFUL: rich jewel-tone fantasy, moody botanicals, art-nouveau florals, celestial + moon-phase pieces, stained-glass styling, gothic-elegant, folk-art with intricate borders, magical glowing scenes, cottagecore and dark-academia moods.
- FUN / CHARACTERFUL: animals doing human things with real personality and props, witty visual gags, kawaii-with-attitude, unexpected charming mash-ups. Give the subject a STORY or a hook, not just "an animal".
- Trend-aware best-sellers: cottagecore, mushroom houses, witchy apothecary, galaxy/celestial, goblincore, moody florals, moon-and-botanicals.

Gold-standard examples of the bar (invent NEW ideas of THIS calibre — do not copy these):
- "a fox in a tiny mustard raincoat reading a treasure map by lantern light"
- "a cosy mushroom cottage with glowing windows, fairy lights and a snail visitor at dusk"
- "a celestial black cat curled inside a crescent moon among stars and moths"
- "a highland cow with a crown of wildflowers and a bumblebee on its nose"
- "an art-nouveau peacock with jewel-tone tail feathers and trailing irises"
- "a hedgehog barista pulling a tiny espresso in a woodland cafe"
- "a witch's apothecary shelf of glowing potion bottles, herbs and a curious cat"

AVOID generic filler: a plain basket of fruit, a plain single flower, "a [breed] portrait", a bare wreath — UNLESS you elevate it with a distinctive hook, character, rich styling or a twist. If it sounds like every other Etsy chart, rewrite it.

Hard rules:
- Span the full COMPLEXITY RANGE in every batch: mostly small/medium, a couple of large showpieces, and occasionally one dense 100+ colour showpiece. Never all one size.
- Vary SUBJECT, STYLE, SHAPE (square/tall/wide/circular) and SIZE — a samey set fails even if each piece is fine.
- Only the generic-generation lanes below. No readable text/lettering (the converter can't render text). No copying a specific shop/celebrity/brand/franchise design.
- Respect each theme's notes (e.g. faces fair/pale only; wordless signage; tame warm-red animals).
- Use ONLY the style keys and shelf slugs given. Reply with JSON only.`

interface RawXsBrief {
  themeId?: string
  subject?: string
  style?: string
  sizeLane?: string
  w?: number
  h?: number
  colours?: number
  sat?: number
}

function xsPromptText(count: number, recentSlugs: string[]): string {
  const themes = CROSS_STITCH_THEMES.map(
    (t) => `- ${t.id} (shelf ${t.shelf}): ${t.title}. styles: ${t.styles.join('/')}. e.g. ${t.examples.slice(0, 3).join('; ')}.${t.notes ? ' NOTE: ' + t.notes : ''}`,
  ).join('\n')
  const lanes = CROSS_STITCH_SIZE_LANES.map(
    (l) => `- ${l.lane}: ~${l.cells} cells, ${l.colours} colours — ${l.note}`,
  ).join('\n')
  return `Compose ${count} cross-stitch briefs as a JSON array. Each: {"themeId","subject","style","sizeLane","w","h","colours"} and optional "sat" (0.9–1.1, only for portraits with skin).

THEMES (use themeId + one of its styles + its shelf):
${themes}

SIZE LANES (spread the batch across these; w/h in cells, pick shape to suit the subject):
${lanes}

- subject: a specific, vivid noun phrase WITHOUT any style words (e.g. "a sleeping red fox curled in autumn leaves"), invented around the theme examples — do NOT just copy them.
- style: one style key from the chosen theme's list.
- w/h: cells for the size lane; make tall subjects tall, wide subjects wide, wreaths square.
- colours: within the size lane's range.
${recentSlugs.length ? `Avoid repeating these recent subjects: ${recentSlugs.slice(0, 40).join(', ')}.` : ''}
Return ONLY the JSON array of ${count} briefs.`
}

function coerceXsBrief(raw: RawXsBrief, seen: Set<string>): CrossStitchBrief | null {
  const theme = CROSS_STITCH_THEMES.find((t) => t.id === raw.themeId)
  if (!theme || !raw.subject || raw.subject.trim().length < 4) return null
  const style: StyleKey =
    raw.style && STYLE_KEYS.includes(raw.style as StyleKey) && theme.styles.includes(raw.style as StyleKey)
      ? (raw.style as StyleKey)
      : pick(theme.styles)
  const lane = CROSS_STITCH_SIZE_LANES.find((l) => l.lane === raw.sizeLane) ?? CROSS_STITCH_SIZE_LANES[0]
  const [loC, hiC] = lane.colours.split('–').map((s) => parseInt(s, 10))
  const w = clamp(raw.w ?? 150, 90, 240)
  const h = clamp(raw.h ?? 150, 90, 240)
  const colours = clamp(raw.colours ?? loC!, 6, 160)
  const base = slugify(`${theme.id}-${raw.subject}`)
  let slug = `${base}-${uniqueSuffix()}`
  while (seen.has(slug)) slug = `${base}-${uniqueSuffix()}`
  seen.add(slug)
  return applyStyleFloors({
    slug,
    subject: raw.subject.trim(),
    style,
    w,
    h,
    colours: clamp(colours, loC ?? 14, hiC ?? colours),
    ...(typeof raw.sat === 'number' ? { sat: clamp(raw.sat * 100, 90, 115) / 100 } : {}),
    shelf: theme.shelf,
    shelfName: theme.shelfName,
    themeId: theme.id,
  })
}

/** Deterministic-ish fallback brief from the curated examples (always safe). */
function sampleXsBrief(theme: CrossStitchTheme, seen: Set<string>): CrossStitchBrief {
  const lane = pick(CROSS_STITCH_SIZE_LANES.slice(0, 3)) // never force dense in the fallback
  const [loC, hiC] = lane.colours.split('–').map((s) => parseInt(s, 10))
  const subject = pick(theme.examples)
  const isTall = /tall|stem|spire|foxglove|delphinium|hollyhock|lighthouse/i.test(subject)
  const isWide = /band|row|field|landscape|wide|receding/i.test(subject)
  const isWreath = theme.styles.includes('wreath') && /wreath|ring/i.test(subject)
  const midCells = lane.lane === 'small' ? 120 : lane.lane === 'medium' ? 155 : 210
  const w = isTall ? Math.round(midCells * 0.75) : isWide ? Math.round(midCells * 1.3) : midCells
  const h = isTall ? Math.round(midCells * 1.3) : isWide ? Math.round(midCells * 0.7) : isWreath ? midCells : midCells
  const base = slugify(`${theme.id}-${subject}`)
  let slug = `${base}-${uniqueSuffix()}`
  while (seen.has(slug)) slug = `${base}-${uniqueSuffix()}`
  seen.add(slug)
  return applyStyleFloors({
    slug, subject, style: pick(theme.styles),
    w: clamp(w, 90, 240), h: clamp(h, 90, 240),
    colours: clamp((loC! + hiC!) / 2, 6, 160),
    shelf: theme.shelf, shelfName: theme.shelfName, themeId: theme.id,
  })
}

export async function planCrossStitchBriefs(count: number, recentSlugs: string[] = []): Promise<CrossStitchBrief[]> {
  const seen = new Set<string>()
  const out: CrossStitchBrief[] = []
  if (anthropicConfigured()) {
    try {
      const raw = await anthropicJson<RawXsBrief[]>({
        model: PLANNER_MODEL,
        system: XS_SYSTEM,
        prompt: xsPromptText(count, recentSlugs),
        maxTokens: 2200,
      })
      for (const r of Array.isArray(raw) ? raw : []) {
        const b = coerceXsBrief(r, seen)
        if (b) out.push(b)
        if (out.length >= count) break
      }
    } catch {
      // fall through to sampling
    }
  }
  // Top up (or fully populate) from the curated pool so a batch is always full.
  let guard = 0
  while (out.length < count && guard++ < count * 4) {
    out.push(sampleXsBrief(pick(CROSS_STITCH_THEMES), seen))
  }
  return out.slice(0, count)
}

// ─────────────────────────── NEEDLEWORK ───────────────────────────

const NW_SYSTEM = `You compose briefs for Homemade's needlework (thread-painting / surface-embroidery) catalogue. You pick WHAT to make; a separate illustrator, the loom render, and a ruthless quality gate handle HOW. Your job is a varied, best-seller set.

Hard rules:
- Span sizes (small hoop → large / bleed scene) across the batch.
- Vary subject + theme. No readable text. No copying a specific shop/celebrity/brand/franchise design.
- Respect each theme's frame/scene defaults and notes (fair/pale faces; wordless signage; tame warm reds).
- Reply with JSON only.`

interface RawNwBrief {
  themeId?: string
  subject?: string
  sizeLane?: string
}

function nwPromptText(count: number, recentSlugs: string[]): string {
  const themes = NEEDLEWORK_THEMES.map(
    (t) => `- ${t.id}: ${t.title}. ${t.fullScene ? 'frameless bleed scene' : 'hoop'}. e.g. ${t.examples.slice(0, 3).join('; ')}.${t.notes ? ' NOTE: ' + t.notes : ''}`,
  ).join('\n')
  const lanes = NEEDLEWORK_SIZE_LANES.map((l) => `- ${l.lane}: ~${l.widthMm}mm — ${l.note}`).join('\n')
  return `Compose ${count} needlework briefs as a JSON array. Each: {"themeId","subject","sizeLane"}.

THEMES:
${themes}

SIZE LANES:
${lanes}

- subject: a specific, vivid noun phrase for a naturalistic thread-painting (e.g. "a red fox curled asleep in autumn leaves"), invented around the theme examples.
${recentSlugs.length ? `Avoid repeating these recent subjects: ${recentSlugs.slice(0, 40).join(', ')}.` : ''}
Return ONLY the JSON array of ${count} briefs.`
}

function coerceNwBrief(raw: RawNwBrief, seen: Set<string>): NeedleworkBrief | null {
  const theme = NEEDLEWORK_THEMES.find((t) => t.id === raw.themeId)
  if (!theme || !raw.subject || raw.subject.trim().length < 4) return null
  return buildNwBrief(theme, raw.subject.trim(), raw.sizeLane, seen)
}

function buildNwBrief(theme: NeedleworkTheme, subject: string, sizeLane: string | undefined, seen: Set<string>): NeedleworkBrief {
  const lane = NEEDLEWORK_SIZE_LANES.find((l) => l.lane === sizeLane) ?? pick(NEEDLEWORK_SIZE_LANES)
  const base = slugify(`nw-${theme.id}-${subject}`)
  let slug = `${base}-${uniqueSuffix()}`
  while (seen.has(slug)) slug = `${base}-${uniqueSuffix()}`
  seen.add(slug)
  const name = subject.replace(/^an?\s+/i, '').replace(/\b\w/, (c) => c.toUpperCase())
  // Bulk needlework stays within renderable density: bounded width, and NO
  // full-bleed scenes (they stitch the whole canvas → tens of thousands of
  // strokes → the loom hangs). Frameless themes become a framed subject instead.
  return {
    slug,
    name,
    subject,
    widthMm: Math.min(lane.widthMm, 200),
    frame: theme.frame === 'none' ? 'rect' : theme.frame,
    detail: lane.detail,
    fullScene: false,
    tameWarm: theme.tameWarm ?? false,
    themeId: theme.id,
  }
}

export async function planNeedleworkBriefs(count: number, recentSlugs: string[] = []): Promise<NeedleworkBrief[]> {
  const seen = new Set<string>()
  const out: NeedleworkBrief[] = []
  if (anthropicConfigured()) {
    try {
      const raw = await anthropicJson<RawNwBrief[]>({
        model: PLANNER_MODEL,
        system: NW_SYSTEM,
        prompt: nwPromptText(count, recentSlugs),
        maxTokens: 1800,
      })
      for (const r of Array.isArray(raw) ? raw : []) {
        const b = coerceNwBrief(r, seen)
        if (b) out.push(b)
        if (out.length >= count) break
      }
    } catch {
      // fall through
    }
  }
  let guard = 0
  while (out.length < count && guard++ < count * 4) {
    const theme = pick(NEEDLEWORK_THEMES)
    out.push(buildNwBrief(theme, pick(theme.examples), undefined, seen))
  }
  return out.slice(0, count)
}

export { NEEDLEWORK_SHELF, NEEDLEWORK_SHELF_NAME }
