import 'server-only'
import { anthropicConfigured, anthropicJson, PLANNER_MODEL } from '@/lib/anthropic'
import { STYLE, type StyleKey } from './cross-stitch-style'
import { subjectKey as normaliseSubject, findSubjectKeyMatch } from './subject-key'
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
 *
 * ── WHY THIS WAS REWRITTEN (September 2026) ────────────────────────────────
 * The catalogue filled with duplicates and the planner was half the cause:
 *   · it was shown only the last 40 published NAMES, so anything older than a
 *     couple of batches was invisible and got re-commissioned;
 *   · when the model under-delivered, the fallback copied a curated pool
 *     example VERBATIM — and the pool is finite, so the same handful of
 *     examples shipped over and over;
 *   · nothing checked a returned brief against the catalogue at all;
 *   · themes were picked uniformly at random, which is how `animals` reached
 *     197 patterns while `nursery` sat at 0.
 *
 * So now: the avoid list is the whole catalogue as normalised SUBJECT KEYS, every
 * brief (model-written or sampled) is post-filtered through the same key rule the
 * publish guard uses, the sampler varies an example with a hook rather than
 * copying it, and each batch's shelves are drawn in proportion to how far each
 * shelf is from its target.
 */

export interface CrossStitchBrief {
  slug: string
  /** Subject phrase only (no style suffix) — the pipeline appends the style. */
  subject: string
  /** The normalised subject key — the dedupe signal, carried with the brief so
   *  the publish guard and the run record never have to re-derive it. */
  subjectKey: string
  style: StyleKey
  /** Chart size in cells. */
  w: number
  h: number
  colours: number
  /** Size lane this brief was placed in (mini | small | medium | large | dense). */
  lane: string
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

/** Styles that need a real canvas — never placed in the `mini` lane. */
const DETAIL_STYLES: StyleKey[] = ['dogportrait', 'artface', 'icon']

/**
 * Detailed styles (realistic pet portraits, fine-art faces) need a size + colour
 * floor — under-resolved they turn to mush (a 120-cell realistic collie has muddy
 * eyes). Raise the brief to at least a medium canvas. Flat/graphic styles are fine
 * small, so they're untouched.
 */
function applyStyleFloors(b: CrossStitchBrief): CrossStitchBrief {
  if (!DETAIL_STYLES.includes(b.style)) return b
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

AVOID generic filler: a plain basket of fruit, a plain single flower, "a [breed] portrait", a bare wreath — UNLESS you elevate it with a distinctive hook, character, rich styling or a twist. If it sounds like every other Etsy chart, rewrite it. Boring, safe, "medium and fine" is a FAIL — we are building the best cross-stitch collection in the world, so every brief should be one a stitcher screenshots to show a friend.

Hard rules:
- NEVER repeat a subject the catalogue already has. You are given the existing subjects; anything that is the same IDEA as one of them — however differently worded — is REJECTED and wastes the slot. "A big japanese garden" and "a japanese garden scene" are the same idea. Reach for what is NOT on that list.
- Serve the SHELF QUOTA you are given exactly: the batch has a required number of briefs per shelf, chosen from how far each shelf is from its target. Use only themes on the shelves listed.
- Span the WHOLE SIZE RANGE, extremes included — deliberately reach for both ends, never a wall of medium pieces:
  · at least one 'mini' TINY piece (a tiny pocket charm / single sweet character) in every batch;
  · a couple of small/medium pieces;
  · a large showpiece;
  · and when the batch is big enough, exactly one 'dense' 100+ colour showpiece — the big heirloom end.
  Extraordinary in BOTH directions — tiny-and-adorable and big-and-jaw-dropping — not everything clustered in the middle.
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

/** What the caller knows about the live catalogue when it asks for a batch. */
export interface XsPlanContext {
  /**
   * Normalised subject keys of the whole PUBLIC catalogue (most recent first,
   * already capped by the caller). Every brief is filtered against this — the
   * old planner saw only the last 40 names.
   */
  avoidSubjectKeys?: string[]
  /**
   * One shelf slug per brief this batch should produce, drawn in proportion to
   * shelf deficit. Empty / omitted → every non-hold shelf is fair game.
   */
  shelfSlots?: string[]
  /** Shelf lines for the prompt: what the batch must serve and why. */
  shelfQuota?: { slug: string; name: string; briefs: number; deficit: number }[]
}

function themesForShelves(shelves: string[] | undefined): CrossStitchTheme[] {
  if (!shelves?.length) return CROSS_STITCH_THEMES
  const wanted = new Set(shelves)
  const subset = CROSS_STITCH_THEMES.filter((t) => wanted.has(t.shelf))
  return subset.length ? subset : CROSS_STITCH_THEMES
}

function xsPromptText(count: number, ctx: XsPlanContext): string {
  const shelves = ctx.shelfSlots?.length ? [...new Set(ctx.shelfSlots)] : undefined
  const themes = themesForShelves(shelves)
    .map(
      (t) => `- ${t.id} (shelf ${t.shelf}): ${t.title}. styles: ${t.styles.join('/')}. e.g. ${t.examples.slice(0, 3).join('; ')}.${t.notes ? ' NOTE: ' + t.notes : ''}`,
    )
    .join('\n')
  const lanes = CROSS_STITCH_SIZE_LANES.map(
    (l) => `- ${l.lane}: ~${l.cells} cells, ${l.colours} colours — ${l.note}`,
  ).join('\n')
  const quota = ctx.shelfQuota?.length
    ? `SHELF QUOTA — this batch must serve exactly these shelves (each shelf's gap to its target in brackets):\n${ctx.shelfQuota
        .map((q) => `- ${q.slug} (${q.name}): ${q.briefs} brief${q.briefs === 1 ? '' : 's'} [gap ${q.deficit}]`)
        .join('\n')}\n\n`
    : ''
  const dense = count >= DENSE_BATCH_FLOOR ? `\n- EXACTLY ONE brief in this batch must use sizeLane "dense" (the 100+ colour heirloom showpiece). Not two.` : `\n- This batch is small: do NOT use sizeLane "dense".`
  const avoid = ctx.avoidSubjectKeys?.length
    ? `\nTHE CATALOGUE ALREADY HAS THESE SUBJECTS — do not repeat any of them, and do not submit a re-wording of one. One per line:\n${ctx.avoidSubjectKeys.join('\n')}\n`
    : ''
  return `Compose ${count} cross-stitch briefs as a JSON array. Each: {"themeId","subject","style","sizeLane","w","h","colours"} and optional "sat" (0.9–1.1, only for portraits with skin).

${quota}THEMES (use themeId + one of its styles + its shelf):
${themes}

SIZE LANES (spread this batch ACROSS THE FULL RANGE incl. the extremes — at least one 'mini', a couple of small/medium, a 'large'; w/h in cells, pick shape to suit the subject):
${lanes}
${dense}

- subject: a specific, vivid noun phrase WITHOUT any style words (e.g. "a sleeping red fox curled in autumn leaves"), invented around the theme examples — do NOT just copy them.
- style: one style key from the chosen theme's list.
- w/h: cells for the size lane; make tall subjects tall, wide subjects wide, wreaths square.
- colours: within the size lane's range.
${avoid}
Return ONLY the JSON array of ${count} briefs.`
}

function coerceXsBrief(raw: RawXsBrief, seen: Set<string>, allowed: CrossStitchTheme[]): CrossStitchBrief | null {
  const theme = allowed.find((t) => t.id === raw.themeId) ?? CROSS_STITCH_THEMES.find((t) => t.id === raw.themeId)
  if (!theme || !raw.subject || raw.subject.trim().length < 4) return null
  const style: StyleKey =
    raw.style && STYLE_KEYS.includes(raw.style as StyleKey) && theme.styles.includes(raw.style as StyleKey)
      ? (raw.style as StyleKey)
      : pick(theme.styles)
  const lane = CROSS_STITCH_SIZE_LANES.find((l) => l.lane === raw.sizeLane) ?? CROSS_STITCH_SIZE_LANES[0]
  const [loC, hiC] = lane.colours.split('–').map((s) => parseInt(s, 10))
  const w = clamp(raw.w ?? 150, 48, 230)
  const h = clamp(raw.h ?? 150, 48, 230)
  const colours = clamp(raw.colours ?? loC!, 6, 160)
  const subject = raw.subject.trim()
  return applyStyleFloors({
    slug: mintSlug(theme.id, subject, seen),
    subject,
    subjectKey: normaliseSubject(subject),
    style,
    w,
    h,
    colours: clamp(colours, loC ?? 6, hiC ?? colours),
    lane: lane.lane,
    ...(typeof raw.sat === 'number' ? { sat: clamp(raw.sat * 100, 90, 115) / 100 } : {}),
    shelf: theme.shelf,
    shelfName: theme.shelfName,
    themeId: theme.id,
  })
}

function mintSlug(themeId: string, subject: string, seen: Set<string>): string {
  const base = slugify(`${themeId}-${subject}`)
  let slug = `${base}-${uniqueSuffix()}`
  while (seen.has(slug)) slug = `${base}-${uniqueSuffix()}`
  seen.add(slug)
  return slug
}

/** Mid canvas per lane for the fallback — keeps the sampler honest to each lane. */
const FALLBACK_MID_CELLS: Record<string, number> = { mini: 68, small: 120, medium: 155, large: 210, dense: 215 }

/** Batches of this size or larger carry exactly one dense showpiece. */
export const DENSE_BATCH_FLOOR = 8

// ─────────────────── the fallback sampler (never verbatim) ───────────────────

/**
 * A distinctive fragment lifted off another example of the same theme — the
 * "hook" the sampler varies a base example with, so a fallback brief is never
 * the pool example copied out. Prefers the trailing prepositional phrase
 * ("...with a paper boat", "...among autumn leaves"), which is where the
 * curated examples keep their character.
 */
function hookFrom(example: string): string {
  const m = /\b(with|in|among|on|under|by|beside|through|over)\b\s+.+$/i.exec(example)
  if (m) return m[0].trim()
  const stripped = example.replace(/^an?\s+/i, '').trim()
  return stripped ? `with ${stripped}` : ''
}

/** Every hook this theme can offer, longest (most distinctive) first. */
function themeHooks(theme: CrossStitchTheme): string[] {
  const hooks = theme.examples.map(hookFrom).filter((h) => h.length > 6)
  return [...new Set(hooks)].sort((a, b) => b.length - a.length)
}

/**
 * Compose a fallback subject that is NOT already in the catalogue: a curated
 * example varied with a hook from a different example of the same theme. Tries
 * every base × hook pairing before giving up, and never returns a bare example
 * that already exists.
 *
 * Returns null when the theme is genuinely exhausted (every combination is
 * taken) — the caller then moves to another theme rather than shipping a
 * duplicate.
 */
function sampleSubject(theme: CrossStitchTheme, taken: (key: string) => boolean): string | null {
  const examples = [...theme.examples].sort(() => Math.random() - 0.5)
  const hooks = themeHooks(theme)
  // A bare example only if the catalogue has never had it.
  for (const base of examples) {
    if (!taken(normaliseSubject(base))) return base
  }
  for (const base of examples) {
    const baseKeyTokens = new Set(normaliseSubject(base).split(' '))
    for (const hook of hooks) {
      // A hook that only repeats words the base already has adds nothing.
      const hookTokens = normaliseSubject(hook).split(' ').filter(Boolean)
      if (!hookTokens.length || hookTokens.every((t) => baseKeyTokens.has(t))) continue
      const subject = `${base}, ${hook}`
      if (!taken(normaliseSubject(subject))) return subject
    }
  }
  return null
}

/** Deterministic-ish fallback brief from the curated examples (always safe). */
function sampleXsBrief(theme: CrossStitchTheme, seen: Set<string>, taken: (key: string) => boolean): CrossStitchBrief | null {
  const subject = sampleSubject(theme, taken)
  if (!subject) return null
  // Span mini → large in the fallback (never force the dense/epic extremes
  // unguided — those need a deliberate brief), so a fallback batch still varies.
  const lane = pick(CROSS_STITCH_SIZE_LANES.slice(0, 4))
  const [loC, hiC] = lane.colours.split('–').map((s) => parseInt(s, 10))
  const isTall = /tall|stem|spire|foxglove|delphinium|hollyhock|lighthouse/i.test(subject)
  const isWide = /band|row|field|landscape|wide|receding/i.test(subject)
  const midCells = FALLBACK_MID_CELLS[lane.lane] ?? 155
  const w = isTall ? Math.round(midCells * 0.75) : isWide ? Math.round(midCells * 1.3) : midCells
  const h = isTall ? Math.round(midCells * 1.3) : isWide ? Math.round(midCells * 0.7) : midCells
  return applyStyleFloors({
    slug: mintSlug(theme.id, subject, seen),
    subject,
    subjectKey: normaliseSubject(subject),
    style: pick(theme.styles),
    w: clamp(w, 48, 230),
    h: clamp(h, 48, 230),
    colours: clamp((loC! + hiC!) / 2, 6, 160),
    lane: lane.lane,
    shelf: theme.shelf,
    shelfName: theme.shelfName,
    themeId: theme.id,
  })
}

// ───────────────────────────── the size range ─────────────────────────────

function laneByName(name: string): (typeof CROSS_STITCH_SIZE_LANES)[number] {
  return CROSS_STITCH_SIZE_LANES.find((l) => l.lane === name) ?? CROSS_STITCH_SIZE_LANES[2]!
}

/** Re-size a brief into a lane, keeping its aspect ratio and its subject. */
function applyLane(b: CrossStitchBrief, laneName: string): CrossStitchBrief {
  const lane = laneByName(laneName)
  const [loC, hiC] = lane.colours.split('–').map((s) => parseInt(s, 10))
  const mid = FALLBACK_MID_CELLS[lane.lane] ?? 155
  const ratio = b.h > 0 ? b.w / b.h : 1
  const w = ratio >= 1 ? mid : Math.round(mid * ratio)
  const h = ratio >= 1 ? Math.round(mid / ratio) : mid
  return applyStyleFloors({
    ...b,
    lane: lane.lane,
    w: clamp(w, 48, 230),
    h: clamp(h, 48, 230),
    colours: clamp((loC! + hiC!) / 2, 6, 160),
  })
}

/**
 * Hold the batch to the RANGE rule: at least one mini, a couple of small/medium,
 * a large, and — only when the batch is big enough — EXACTLY ONE dense 100+
 * colour Flux 1.1 Pro showpiece. The complexity range is the point of this
 * catalogue, so it is enforced after the fact rather than hoped for.
 */
export function enforceRange(briefs: CrossStitchBrief[], count: number): CrossStitchBrief[] {
  if (briefs.length === 0) return briefs
  const out = [...briefs]
  const wantDense = count >= DENSE_BATCH_FLOOR
  const idxOf = (lane: string): number[] => out.map((b, i) => (b.lane === lane ? i : -1)).filter((i) => i >= 0)

  // ── dense: exactly one when the batch has room, none otherwise ────────────
  const dense = idxOf('dense')
  if (wantDense) {
    if (dense.length === 0) {
      // Promote the biggest canvas that isn't the mini we still need.
      const candidates = out.map((b, i) => ({ i, area: b.w * b.h })).sort((a, b) => b.area - a.area)
      const pickIdx = candidates[0]!.i
      out[pickIdx] = applyLane(out[pickIdx]!, 'dense')
    } else {
      for (const i of dense.slice(1)) out[i] = applyLane(out[i]!, 'large')
    }
  } else {
    for (const i of dense) out[i] = applyLane(out[i]!, 'large')
  }

  const denseIdx = out.findIndex((b) => b.lane === 'dense')

  // ── mini: at least one, and never a detail style ─────────────────────────
  if (!out.some((b) => b.lane === 'mini')) {
    const candidate = out
      .map((b, i) => ({ b, i }))
      .filter(({ b, i }) => i !== denseIdx && !DETAIL_STYLES.includes(b.style))
      .sort((a, b) => a.b.w * a.b.h - b.b.w * b.b.h)[0]
    if (candidate) out[candidate.i] = applyLane(candidate.b, 'mini')
  }

  // ── large: at least one (the dense showpiece does not count) ──────────────
  if (!out.some((b, i) => b.lane === 'large' && i !== denseIdx)) {
    const candidate = out
      .map((b, i) => ({ b, i }))
      .filter(({ b, i }) => i !== denseIdx && b.lane !== 'mini')
      .sort((a, b) => b.b.w * b.b.h - a.b.w * a.b.h)[0]
    if (candidate) out[candidate.i] = applyLane(candidate.b, 'large')
  }

  // ── a couple of small/medium in between ──────────────────────────────────
  // Take from the SURPLUS at either end — a second large, a second mini — never
  // the single piece each extreme of the range needs.
  const midCount = (): number => out.filter((b) => b.lane === 'small' || b.lane === 'medium').length
  if (out.length >= 4) {
    for (const lane of ['small', 'medium'] as const) {
      if (midCount() >= 2) break
      const surplus = [...idxOf('large').filter((i) => i !== denseIdx).slice(1), ...idxOf('mini').slice(1)]
      const i = surplus[0]
      if (i == null) break
      out[i] = applyLane(out[i]!, lane)
    }
  }
  return out
}

// ───────────────────────────────── plan ─────────────────────────────────

/**
 * Plan one batch of cross-stitch briefs.
 *
 * Every brief that comes back is guaranteed to be (a) on a shelf that still
 * wants patterns, (b) not the same idea as anything already in the catalogue,
 * (c) not the same idea as another brief in this batch, and (d) part of a set
 * that spans the size range. The publish-path guard re-checks (b) against the
 * live catalogue at publish time — this is the cheap first line, not the only one.
 */
export async function planCrossStitchBriefs(count: number, ctx: XsPlanContext = {}): Promise<CrossStitchBrief[]> {
  const seen = new Set<string>()
  const avoid = new Set((ctx.avoidSubjectKeys ?? []).filter(Boolean))
  const batchKeys = new Set<string>()
  /** Is this subject already the catalogue's, or already this batch's? */
  const taken = (key: string): boolean => {
    if (!key) return true // a subject that normalises to nothing is never usable
    if (avoid.has(key) || batchKeys.has(key)) return true
    return findSubjectKeyMatch(key, avoid) !== null || findSubjectKeyMatch(key, batchKeys) !== null
  }
  const accept = (b: CrossStitchBrief): boolean => {
    if (taken(b.subjectKey)) return false
    batchKeys.add(b.subjectKey)
    return true
  }

  const shelves = ctx.shelfSlots?.length ? [...new Set(ctx.shelfSlots)] : undefined
  const allowed = themesForShelves(shelves)
  const out: CrossStitchBrief[] = []
  let rejected = 0

  if (anthropicConfigured()) {
    try {
      const raw = await anthropicJson<RawXsBrief[]>({
        model: PLANNER_MODEL,
        system: XS_SYSTEM,
        prompt: xsPromptText(count, ctx),
        maxTokens: 2600,
      })
      for (const r of Array.isArray(raw) ? raw : []) {
        const b = coerceXsBrief(r, seen, allowed)
        if (!b) continue
        if (!accept(b)) {
          rejected++
          continue
        }
        out.push(b)
        if (out.length >= count) break
      }
    } catch {
      // fall through to sampling
    }
  }
  if (rejected > 0) {
    console.warn(`[bulk cross-stitch planner] rejected ${rejected} model brief(s) as duplicates of the live catalogue`)
  }

  // ── Top up from the curated pool, favouring the shelves this batch owes ────
  // The sampler NEVER copies an example the catalogue already has: it varies a
  // base with a hook from another example of the same theme, and moves on to a
  // different theme when a theme is exhausted.
  const wantedSlots = ctx.shelfSlots?.length ? [...ctx.shelfSlots] : []
  // Drop the slots the model already served, so the top-up fills the remainder.
  for (const b of out) {
    const i = wantedSlots.indexOf(b.shelf)
    if (i >= 0) wantedSlots.splice(i, 1)
  }
  const exhausted = new Set<string>()
  let guard = 0
  while (out.length < count && guard++ < count * 12) {
    const slot = wantedSlots.shift()
    const pool = (slot ? CROSS_STITCH_THEMES.filter((t) => t.shelf === slot) : allowed).filter((t) => !exhausted.has(t.id))
    const theme = pool.length ? pick(pool) : allowed.filter((t) => !exhausted.has(t.id))[0]
    if (!theme) break // every theme in play is exhausted — ship a short batch
    const b = sampleXsBrief(theme, seen, taken)
    if (!b) {
      exhausted.add(theme.id)
      continue
    }
    if (!accept(b)) {
      exhausted.add(theme.id)
      continue
    }
    out.push(b)
  }

  return enforceRange(out.slice(0, count), count)
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
