import 'server-only'
import { anthropicConfigured, anthropicJson, PLANNER_MODEL } from '@/lib/anthropic'
import { STYLE, type StyleKey } from './cross-stitch-style'
import { subjectKey as normaliseSubject, findSubjectKeyMatch } from './subject-key'
import { CROSS_STITCH_SHELF_BY_SLUG } from '../categories'
import { applyWarmFurGuard } from './brief-rules'
import { postFilterBriefs, countRejects, type BriefReject } from './brief-filter'
import { shelfQuotaCounts } from './shelf-plan'
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
  /**
   * Who wrote this brief: the planner model, or the curated pool sampler used as
   * the fallback. Recorded on the published pattern and counted per run, because
   * "the model timed out and we sampled instead" is a quiet failure that
   * otherwise looks exactly like a normal batch.
   */
  source: 'model' | 'sampler'
  /**
   * Whether the planner was free to invent this subject or had to choose one
   * from the theme's pool and dress it. Recorded on the published pattern so a
   * later yield comparison does not depend on remembering which deploy ran.
   */
  plannerMode: PlannerMode
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

/** Every size/colour correction a finished brief gets, in one place. */
function settleBrief(b: CrossStitchBrief): CrossStitchBrief {
  return applyWarmFurGuard(applyStyleFloors(b))
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
}
/** A short unique suffix so a new gem never overwrites an existing slug. */
function uniqueSuffix(): string {
  return Math.floor(Math.random() * 1e6).toString(36).padStart(4, '0').slice(-4)
}

// ─────────────────────────── CROSS-STITCH ───────────────────────────

/**
 * Kept deliberately tight. This system prompt is re-sent on every planner call
 * and the call has a hard latency budget — the first version ran to some 700
 * words of encouragement and worked examples, and the calls timed out, which
 * silently dropped every batch to pool-sampled briefs. The bar and the hard
 * rules survive; the pep talk did not.
 */
const XS_SYSTEM = `You are the creative director for Homemade's cross-stitch catalogue, aiming to be the best collection in the world. You choose WHAT to make; an illustrator and a ruthless quality gate handle HOW.

THE BAR — beautiful OR genuinely fun, with a hook. Rich jewel-tone fantasy, moody botanicals, art-nouveau florals, celestial and moon-phase pieces, gothic-elegant, cottagecore, witchy apothecary, goblincore. Or characterful: an animal with real personality, a witty wordless visual gag, kawaii-with-attitude. The hook goes in the SUBJECT ITSELF and its palette — e.g. "a fox in a mustard-yellow raincoat", "a celestial black cat curled into a crescent moon" — never in a second little thing added alongside it.

Write the subject as ONE noun phrase: what it is, its pose or setting, its palette. Nothing it holds, wears or is beside.

Generic filler FAILS: a plain basket of fruit, a bare wreath, "a [breed] portrait" — unless elevated with a distinctive hook, character or twist. If it sounds like every other Etsy chart, rewrite it.

HARD RULES
- NEVER repeat a subject the catalogue already has, or a re-wording of one. "A big japanese garden" and "a japanese garden scene" are the same idea. Reach for what is NOT on the list you are given.
- Serve the SHELF QUOTA exactly, using only the themes listed.
- Span the size range: at least one 'mini', a couple of small/medium, a 'large', and exactly one 'dense' when the batch calls for it. Never a wall of medium pieces.
- Vary subject, style, shape and size across the set.
- No readable text or lettering (the converter cannot render it). No copying a specific shop, celebrity, brand or franchise design.
- Respect each theme's notes (fair/pale faces only; wordless signage; tame warm-red animals).
- STITCHABLE, not just clever. Every brief has ONE dominant subject that fills the frame and reads at a glance. Supporting details must be big enough to survive stitch resolution: no tiny props, no small creature "on" or "inside" a large scene (a beetle on a stem, a snail on a house, a cat asleep in a case all vanish). The hook lives in the main subject's pose, costume or setting, not in a small extra element.
- COLOUR that stitches bright. Ask for rich saturated colour with clear light-dark contrast. Avoid "moody", "dark", "smoky", "misty", "dusky" or "muted" palettes and dark backgrounds: they convert to washed-out mush. Dark subjects (a skull, a black cat, a stormy sky) must sit against a bright or pale ground.
- Faces are a risk: a face is only worth briefing when it is large, front-on and clearly appealing; skulls, masks and "unsettling" faces are out.
- Use ONLY the style keys and shelf slugs given. Reply with JSON only.`

/**
 * FREE vs CONSTRAINED planning.
 *
 * Six batches of evidence (September 2026): briefs the model INVENTED yielded
 * about 17% gems, briefs sampled from the curated pool about 40%. The gap is not
 * taste — the model's inventions are often lovely — it is that an invented
 * subject keeps reaching for a second small thing Flux cannot render, and no
 * amount of prompt rule or prop pattern stopped it, because there is always a
 * new way to phrase "and also a little …".
 *
 * So the model stops inventing. In CONSTRAINED mode it picks a subject from the
 * theme's own example list and DRESSES it — setting, palette, season, time of
 * day, pose, expression — and the head-noun check throws out anything that is
 * not a dressing of a pool subject. The model still does the work only it can
 * do: choosing which subject suits which shelf, style, lane and canvas.
 *
 * `BULK_PLANNER_MODE=free` restores the old behaviour without a deploy.
 */
export type PlannerMode = 'free' | 'constrained'
export const PLANNER_MODE: PlannerMode = process.env.BULK_PLANNER_MODE === 'free' ? 'free' : 'constrained'

/**
 * The constrained system prompt. Much shorter than the free one, because most of
 * what the free prompt spent its words on — what makes a good subject, what not
 * to invent, how not to add props — is now decided by the pool and enforced
 * mechanically. What is left is genuinely the model's job.
 */
const XS_CONSTRAINED_SYSTEM = `You are the creative director for Homemade's cross-stitch catalogue. A curated pool of subjects already exists; your job is to CHOOSE from it and DRESS what you choose, not to invent.

FOR EACH BRIEF
- subject: take one of the SUBJECTS listed under the theme you are serving, and either use it as it stands or change it ONLY in setting, palette, season, time of day, pose or expression. Keep what the thing IS, word for word where you can.
- You may NOT add an object, creature or accessory that is not already in the listed subject. No "with a …", nothing held, worn, perched or beside. If the listed subject already has one, keep it.
- Pick the style key, size lane, w/h and colour count that suit the subject.

HARD RULES
- Serve the SHELF QUOTA exactly, using only the themes listed.
- Span the size range: at least one 'mini', a couple of small/medium, a 'large', and exactly one 'dense' when the batch calls for it.
- Do not choose a subject the catalogue already has (you are given the list), and do not choose the same subject twice in one batch.
- Rich saturated colour with clear light-dark contrast. No moody, dark, smoky, misty or muted palettes and no dark grounds; a dark subject sits against a bright or pale ground.
- No readable text or lettering. No copying a specific shop, celebrity, brand or franchise design.
- Respect each theme's notes (fair/pale faces only; wordless signage; tame warm-red animals).
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

/** A shelf that is already the size it should be — never planned into. */
function isHoldShelf(slug: string): boolean {
  return Boolean(CROSS_STITCH_SHELF_BY_SLUG[slug]?.hold)
}

/** Every theme that still has a generation lane. */
const PLANNABLE_THEMES: CrossStitchTheme[] = CROSS_STITCH_THEMES.filter((t) => !isHoldShelf(t.shelf))

/**
 * The allowed subjects per theme — constrained mode's whole vocabulary. Built
 * from every theme, not just the plannable ones, so a brief on a hold shelf is
 * rejected for being on a hold shelf rather than for being off-pool.
 */
const EXAMPLES_BY_THEME: Record<string, readonly string[]> = Object.fromEntries(
  CROSS_STITCH_THEMES.map((t) => [t.id, t.examples]),
)

function themesForShelves(shelves: string[] | undefined): CrossStitchTheme[] {
  if (!shelves?.length) return PLANNABLE_THEMES
  const wanted = new Set(shelves.filter((s) => !isHoldShelf(s)))
  const subset = PLANNABLE_THEMES.filter((t) => wanted.has(t.shelf))
  return subset.length ? subset : PLANNABLE_THEMES
}

function xsPromptText(count: number, ctx: XsPlanContext, banned: string[] = []): string {
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
  // Only the most recent slice goes in the prompt; the full list is still
  // enforced after the fact (see `taken` in planCrossStitchBriefs).
  const shown = (ctx.avoidSubjectKeys ?? []).slice(0, PROMPT_AVOID_LIMIT)
  const more = (ctx.avoidSubjectKeys?.length ?? 0) - shown.length
  const avoid = shown.length
    ? `\nTHE CATALOGUE ALREADY HAS THESE SUBJECTS — do not repeat any of them, and do not submit a re-wording of one. One per line:\n${shown.join('\n')}\n${more > 0 ? `(…and ${more} more older subjects. Anything that repeats one of those is rejected too, so reach for genuinely new ideas rather than safe ones.)\n` : ''}`
    : ''
  // The retry round after the post-filter: name what was just thrown out, and
  // why, so the second attempt is not a re-roll of the same mistake.
  const rejected = banned.length
    ? `\nTHESE BRIEFS WERE JUST REJECTED — do not write these, and no props at all:\n${banned.slice(0, 20).map((b) => `- ${b}`).join('\n')}\n`
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
- subject: ONE noun phrase. No "with a …", no "wearing/holding/carrying a …", no "topped with", no "beside a", no "tiny/little/single". In the mini and small lanes: at most 12 words, and no "with", "and" or "beside" at all.
${avoid}${rejected}
Return ONLY the JSON array of ${count} briefs.`
}

/**
 * The constrained prompt. Same shelf quota, lanes and avoid list as the free one;
 * the difference is that each theme arrives with its FULL subject list rather
 * than three teaser examples, because that list is now the allowed set rather
 * than a flavour hint.
 */
function xsConstrainedPromptText(count: number, ctx: XsPlanContext, banned: string[] = []): string {
  const shelves = ctx.shelfSlots?.length ? [...new Set(ctx.shelfSlots)] : undefined
  const themes = themesForShelves(shelves)
    .map(
      (t) =>
        `- ${t.id} (shelf ${t.shelf}): ${t.title}. styles: ${t.styles.join('/')}.${t.notes ? ' NOTE: ' + t.notes : ''}\n  SUBJECTS: ${t.examples.map((e) => `"${e}"`).join('; ')}`,
    )
    .join('\n')
  const lanes = CROSS_STITCH_SIZE_LANES.map((l) => `- ${l.lane}: ~${l.cells} cells, ${l.colours} colours — ${l.note}`).join('\n')
  const quota = ctx.shelfQuota?.length
    ? `SHELF QUOTA — this batch must serve exactly these shelves (each shelf's gap to its target in brackets):\n${ctx.shelfQuota
        .map((q) => `- ${q.slug} (${q.name}): ${q.briefs} brief${q.briefs === 1 ? '' : 's'} [gap ${q.deficit}]`)
        .join('\n')}\n\n`
    : ''
  const dense = count >= DENSE_BATCH_FLOOR ? `\n- EXACTLY ONE brief in this batch must use sizeLane "dense" (the 100+ colour heirloom showpiece). Not two.` : `\n- This batch is small: do NOT use sizeLane "dense".`
  const shown = (ctx.avoidSubjectKeys ?? []).slice(0, PROMPT_AVOID_LIMIT)
  const avoid = shown.length
    ? `\nTHE CATALOGUE ALREADY HAS THESE — do not choose a subject that repeats one. One per line:\n${shown.join('\n')}\n`
    : ''
  const rejected = banned.length
    ? `\nTHESE WERE JUST REJECTED — do not write these again:\n${banned.slice(0, 20).map((b) => `- ${b}`).join('\n')}\n`
    : ''
  return `Compose ${count} cross-stitch briefs as a JSON array. Each: {"themeId","subject","style","sizeLane","w","h","colours"} and optional "sat" (0.9–1.15, only where a theme note calls for it).

${quota}THEMES AND THEIR SUBJECTS (choose subjects from these lists only):
${themes}

SIZE LANES (spread this batch across the range; w/h in cells, pick shape to suit the subject):
${lanes}
${dense}

- subject: one of the listed SUBJECTS for the theme, optionally re-dressed in setting, palette, season, time of day, pose or expression. Nothing added.
- style: one style key from the chosen theme's list.
- w/h: cells for the size lane; tall subjects tall, wide subjects wide, wreaths square.
- colours: within the size lane's range.
${avoid}${rejected}
Return ONLY the JSON array of ${count} briefs.`
}

function coerceXsBrief(raw: RawXsBrief, seen: Set<string>, allowed: CrossStitchTheme[]): CrossStitchBrief | null {
  // A theme off this batch's quota is tolerated; a theme on a HOLD shelf is not
  // — those shelves are the size they should be and get no generation lane.
  const theme = allowed.find((t) => t.id === raw.themeId) ?? PLANNABLE_THEMES.find((t) => t.id === raw.themeId)
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
  return settleBrief({
    slug: mintSlug(theme.id, subject, seen),
    subject,
    subjectKey: normaliseSubject(subject),
    source: 'model',
    plannerMode: PLANNER_MODE,
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

/**
 * How many existing subjects to SHOW the model.
 *
 * The planner filters every returned brief against the WHOLE avoid list, and the
 * publish guard checks the whole live catalogue again — so the model does not
 * need to see all of it, it only needs enough to steer away from the obvious
 * repeats. Rendering all ~800 into the prompt made the call slow enough that the
 * gateway killed the step at ~100s (HTTP 504) and the batch never fanned out.
 * The most recent couple of hundred is what actually shapes its choices; the
 * rest is enforced, not suggested.
 */
export const PROMPT_AVOID_LIMIT = 120

/**
 * How long to wait for one chunk of briefs before falling back to the sampler.
 *
 * Each Inngest step is one HTTP request and the gateway kills those at ~100s.
 * Chunking put each model call in its OWN step, so each gets that budget to
 * itself rather than sharing one — hence 75s here, where a single combined call
 * had to fit two chunks and the catalogue reads into the same request.
 *
 * Overridable without a deploy: BULK_PLANNER_TIMEOUT_MS.
 */
export const PLANNER_TIMEOUT_MS = Number(process.env.BULK_PLANNER_TIMEOUT_MS) || 75_000

/**
 * Retries INSIDE one planner call. The shared Anthropic helper defaults to 3,
 * i.e. up to four sequential attempts with backoff — which on a slow or
 * rate-limited call silently consumed the whole timeout budget and returned
 * nothing, so every batch fell through to the sampler. The planner has its own
 * fallback, so one retry is the right trade: a transient blip is survivable, a
 * retry storm is not.
 */
export const PLANNER_RETRIES = 1

/** Reject rather than hang, so the caller can fall back. */
function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    work.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e instanceof Error ? e : new Error(String(e)))
      },
    )
  })
}

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
  return settleBrief({
    slug: mintSlug(theme.id, subject, seen),
    subject,
    subjectKey: normaliseSubject(subject),
    source: 'sampler',
    plannerMode: PLANNER_MODE,
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
  // Re-settle after a lane change: a brief demoted INTO mini may now need the
  // warm-fur saturation it did not need as a large piece.
  return settleBrief({
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
 * How many briefs to ask the model for in ONE call.
 *
 * Each Inngest step is one HTTP request and the gateway kills those at ~100s. A
 * single call for ten briefs ran past that and the whole dispatcher 504'd; the
 * batch then fell back to the pool sampler every time, which is a quiet failure
 * — a sampled batch looks like a normal batch until you read the subjects. Two
 * calls of five, each its own step with its own timeout, comfortably fit.
 */
export const MODEL_CHUNK = Number(process.env.BULK_PLANNER_CHUNK) || 5

/** Is this subject already the catalogue's, or already this batch's? */
function makeTaken(avoid: Set<string>, batch: Set<string>): (key: string) => boolean {
  return (key: string): boolean => {
    if (!key) return true // a subject that normalises to nothing is never usable
    if (avoid.has(key) || batch.has(key)) return true
    return findSubjectKeyMatch(key, avoid) !== null || findSubjectKeyMatch(key, batch) !== null
  }
}

/** One planner chunk: the briefs that survived, and everything the filter threw out. */
export interface PlanChunk {
  briefs: CrossStitchBrief[]
  /** Subjects the post-filter rejected, with the reason — shown to the retry call. */
  rejects: { subject: string; kind: BriefReject<CrossStitchBrief>['kind']; reason: string }[]
}

/** The counters a run records for the post-filter's work. */
export interface RejectCounts {
  propRejects: number
  collisionRejects: number
}

/** Fold a chunk's rejects into the run counters. */
export function tallyRejects(chunks: PlanChunk[]): RejectCounts {
  const all = chunks.flatMap((c) => c.rejects)
  return {
    // Off-pool and prop rejects share a counter: both mean the model asked for
    // something un-buildable and the filter caught it before Flux was paid.
    propRejects: all.filter((r) => r.kind === 'prop' || r.kind === 'off-pool').length,
    collisionRejects: all.filter((r) => r.kind === 'collision').length,
  }
}

/** The reject lines the retry call is shown ("do not write these"). */
export function rejectedSubjects(chunks: PlanChunk[]): string[] {
  return chunks.flatMap((c) => c.rejects).map((r) => `${r.subject} — ${r.reason}`)
}

/**
 * The shelf slots a batch still owes, after the briefs it already has.
 *
 * The retry round asks for the MISSING count, and it should ask for it on the
 * shelves the rejected briefs were meant to serve — otherwise a batch that lost
 * both its `cocktails` briefs to the prop filter comes back with two more
 * `animals`, and the shelf quota quietly stops meaning anything.
 */
export function remainingShelfSlots(ctx: XsPlanContext, have: CrossStitchBrief[]): string[] {
  const slots = ctx.shelfSlots?.length ? [...ctx.shelfSlots] : []
  if (!slots.length) return []
  for (const b of have) {
    const i = slots.indexOf(b.shelf)
    if (i >= 0) slots.splice(i, 1)
  }
  return slots
}

/**
 * ONE model call: ask for `count` briefs and keep the ones that are not already
 * in the catalogue, not already this batch's, and not thrown out by the
 * post-filter (props, within-batch collisions). Returns model-authored briefs
 * only, possibly fewer than asked for — or none, if the call fails or times out.
 *
 * Its own function so the dispatcher can run each chunk as a separate Inngest
 * step, and so a slow or failed chunk costs only that chunk.
 */
export async function planModelBriefs(
  count: number,
  ctx: XsPlanContext = {},
  alreadyPicked: CrossStitchBrief[] = [],
  banned: string[] = [],
): Promise<PlanChunk> {
  if (count <= 0 || !anthropicConfigured()) return { briefs: [], rejects: [] }

  const constrained = PLANNER_MODE === 'constrained'
  const seen = new Set<string>()
  const avoid = new Set((ctx.avoidSubjectKeys ?? []).filter(Boolean))
  const batchKeys = new Set(alreadyPicked.map((b) => b.subjectKey).filter(Boolean))
  const taken = makeTaken(avoid, batchKeys)
  const allowed = themesForShelves(ctx.shelfSlots?.length ? [...new Set(ctx.shelfSlots)] : undefined)

  const candidates: CrossStitchBrief[] = []
  let duplicates = 0
  try {
    const raw = await withTimeout(
      anthropicJson<RawXsBrief[]>({
        model: PLANNER_MODEL,
        system: constrained ? XS_CONSTRAINED_SYSTEM : XS_SYSTEM,
        prompt: constrained ? xsConstrainedPromptText(count, ctx, banned) : xsPromptText(count, ctx, banned),
        maxTokens: 4000,
        retries: PLANNER_RETRIES,
      }),
      PLANNER_TIMEOUT_MS,
      'cross-stitch planner',
    )
    for (const r of Array.isArray(raw) ? raw : []) {
      const b = coerceXsBrief(r, seen, allowed)
      if (!b) continue
      if (taken(b.subjectKey)) {
        duplicates++
        continue
      }
      batchKeys.add(b.subjectKey)
      candidates.push(b)
      if (candidates.length >= count) break
    }
  } catch (err) {
    // A slow or failed model call must not take the batch with it — the caller
    // tops up from the pool instead.
    console.warn(
      `[bulk cross-stitch planner] model briefs unavailable, the pool will fill in: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
  if (duplicates > 0) {
    console.warn(`[bulk cross-stitch planner] rejected ${duplicates} model brief(s) as duplicates of the live catalogue`)
  }

  // The post-filter. Off-pool subjects, props and within-batch collisions are all
  // binary, and all are cheaper to catch here than after a Flux generation and a
  // gate call. In constrained mode the prop filter drops to its light backstop:
  // the head-noun check already holds the brief to a pool subject, and several
  // curated subjects legitimately carry the very phrases the strict filter bans.
  const { kept, rejects } = postFilterBriefs(candidates, alreadyPicked, {
    props: constrained ? 'light' : 'strict',
    ...(constrained ? { examplesByTheme: EXAMPLES_BY_THEME } : {}),
    ...(ctx.shelfSlots?.length ? { shelfQuota: shelfQuotaCounts(ctx.shelfSlots) } : {}),
  })
  const counts = countRejects(rejects)
  if (counts.props || counts.collisions) {
    console.warn(
      `[bulk cross-stitch planner] post-filter dropped ${counts.props} brief(s) off-pool/props and ${counts.collisions} for within-batch collision`,
    )
    for (const r of rejects) console.warn(`[bulk cross-stitch planner]   ✕ "${r.brief.subject}" — ${r.reason}`)
  }
  return {
    briefs: kept,
    rejects: rejects.map((r: BriefReject<CrossStitchBrief>) => ({ subject: r.brief.subject, kind: r.kind, reason: r.reason })),
  }
}

/**
 * Bring a partial set up to `count` from the curated pool and hold the whole
 * batch to the size range. Sampled briefs are marked `source: 'sampler'`, so the
 * run records how much of the batch the model actually wrote.
 *
 * The collision rule runs here too, over the WHOLE assembled batch — model
 * briefs and sampled ones together — because a sampled top-up can land on the
 * same idea as a model brief just as easily as two model briefs can. The PROP
 * filter deliberately does not: the curated pool examples are written in exactly
 * the "a fox in a mustard raincoat" register it rejects, and filtering the
 * fallback to nothing would turn a slow Anthropic call into an empty batch.
 */
export function finaliseBriefs(modelBriefs: CrossStitchBrief[], count: number, ctx: XsPlanContext = {}): CrossStitchBrief[] {
  const avoid = new Set((ctx.avoidSubjectKeys ?? []).filter(Boolean))
  const batchKeys = new Set<string>()
  const seen = new Set<string>()
  const out: CrossStitchBrief[] = []
  for (const b of modelBriefs) {
    if (batchKeys.has(b.subjectKey) || seen.has(b.slug)) continue
    if (postFilterBriefs([b], out, { props: false }).kept.length === 0) continue
    batchKeys.add(b.subjectKey)
    seen.add(b.slug)
    out.push(b)
    if (out.length >= count) break
  }
  const taken = makeTaken(avoid, batchKeys)

  // Top up, favouring the shelves this batch still owes. The sampler NEVER
  // copies an example the catalogue already has: it varies a base with a hook
  // from another example of the same theme, and moves on when a theme is spent.
  const wantedSlots = remainingShelfSlots(ctx, out)
  const allowed = themesForShelves(ctx.shelfSlots?.length ? [...new Set(ctx.shelfSlots)] : undefined)
  const exhausted = new Set<string>()
  let guard = 0
  while (out.length < count && guard++ < count * 12) {
    const slot = wantedSlots.shift()
    const pool = (slot ? PLANNABLE_THEMES.filter((t) => t.shelf === slot) : allowed).filter((t) => !exhausted.has(t.id))
    const theme = pool.length ? pick(pool) : allowed.filter((t) => !exhausted.has(t.id))[0]
    if (!theme) break // every theme in play is exhausted — ship a short batch
    const b = sampleXsBrief(theme, seen, taken)
    if (!b || taken(b.subjectKey)) {
      exhausted.add(theme.id)
      continue
    }
    // A sampled brief that repeats a brief already in this batch is dropped and
    // the loop tries again — the guard bounds it, so a spent theme cannot spin.
    if (postFilterBriefs([b], out, { props: false }).kept.length === 0) continue
    batchKeys.add(b.subjectKey)
    out.push(b)
  }

  return enforceRange(out.slice(0, count), count)
}

/** How many of a planned batch the model actually wrote. */
export function modelAuthoredCount(briefs: CrossStitchBrief[]): number {
  return briefs.filter((b) => b.source === 'model').length
}

/**
 * Plan one batch of cross-stitch briefs, model call included. This is the
 * all-in-one path for a local/inline caller; the Inngest dispatcher runs the
 * same pieces as separate steps so each model call gets its own request budget.
 *
 * Every brief that comes back is guaranteed to be (a) on a shelf that still
 * wants patterns, (b) not the same idea as anything already in the catalogue,
 * (c) not the same idea as another brief in this batch, (d) free of the props
 * Flux cannot render, and (e) part of a set that spans the size range. The
 * publish-path guard re-checks (b) against the live catalogue at publish time —
 * this is the cheap first line, not the only one.
 */
export async function planCrossStitchBriefs(
  count: number,
  ctx: XsPlanContext = {},
): Promise<{ briefs: CrossStitchBrief[] } & RejectCounts> {
  const chunks: PlanChunk[] = []
  const briefs: CrossStitchBrief[] = []
  for (let taken = 0; taken < count; taken += MODEL_CHUNK) {
    const want = Math.min(MODEL_CHUNK, count - taken)
    const chunk = await planModelBriefs(want, ctx, briefs)
    chunks.push(chunk)
    briefs.push(...chunk.briefs)
  }
  // In FREE mode a reject is worth one more model call, because a fresh
  // invention might land. In CONSTRAINED mode it is not: a brief that failed the
  // head-noun check asked for something outside the pool, and the sampler draws
  // from that same pool with a 40% gem rate against the model's 17% — so the
  // slot goes straight to it rather than paying for another round trip.
  if (briefs.length < count && PLANNER_MODE === 'free') {
    const retryCtx: XsPlanContext = { ...ctx, shelfSlots: remainingShelfSlots(ctx, briefs) }
    const retry = await planModelBriefs(count - briefs.length, retryCtx, briefs, rejectedSubjects(chunks))
    chunks.push(retry)
    briefs.push(...retry.briefs)
  }
  return { briefs: finaliseBriefs(briefs, count, ctx), ...tallyRejects(chunks) }
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
