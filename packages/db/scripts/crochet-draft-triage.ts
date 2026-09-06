/**
 * CROCHET DRAFT TRIAGE — Rebecca's 6 September 2026 decision.
 *
 * The 959 DRAFT PATTERN crochet Tutorial rows are prose patterns written
 * before the loom existed. Under the hero rule (the hero must be the loom's
 * own render of the pattern's stored program) they can never publish as they
 * are. Every one of them leaves the Tutorial table: junk is deleted outright;
 * a usable idea is converted into an entry in the idea backlog
 * (`crochet-idea-backlog.ts`) — which the crochet routine draws from and
 * which only ever publishes what the loom renders and a judge passes — and
 * the draft row is then deleted too. Nothing stays behind as a draft.
 *
 * THREE-STAGE TRIAGE (see notes/playbook_category_signoff.md Step 0b):
 *   1. Deterministic pre-triage (this file) — completeness, shelf mapping,
 *      buildability, duplicate detection against the published catalogue and
 *      the idea backlog, an IP-guardrail keyword screen, and a "generic
 *      construction only" detector for the flood of stitch-technique-named
 *      rows ("Waffle stitch dishcloth", "V-neck chunky pullover") that the
 *      backlog file's own doc comment says the Tutorial library must not
 *      duplicate a second time.
 *   2. A judge (Claude, reading — never an API call) reads the non-junk
 *      candidates in shelf batches and downgrades weak/generic survivors.
 *      Recorded here as MANUAL_JUNK, keyed by slug, so a re-run is
 *      deterministic and the reason travels with the row.
 *   3. The keepers get written into crochet-idea-backlog.ts by hand (a
 *      separate step, not this script) with `source: 'draft-tutorial'` and
 *      the old slug for provenance.
 *
 * USAGE
 *   cd packages/db && pnpm exec tsx scripts/crochet-draft-triage.ts [--apply] [--json]
 *
 * Dry run (default): prints counts and samples, changes nothing.
 * --apply: deletes every row classified JUNK *and* every row classified
 *   IDEA-* that has already been converted (see CONVERTED_SLUGS below —
 *   populated once the backlog additions are committed). A row that is
 *   IDEA-BUILDABLE/IDEA-THEME but NOT YET in CONVERTED_SLUGS is left alone on
 *   --apply, so the delete can never outrun the backlog conversion.
 * --json: also writes the full per-row classification as JSON for review.
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { writeFileSync } from 'node:fs'
import { prisma } from '@homemade/db'
import { checkCompleteness } from './qc-completeness-rules/index.js'
import { runVoiceCheck } from './voice-check-lib.js'

// These three are pure/dependency-free — importable straight from a tsx
// script without dragging in the rest of the Next app.
import { subjectKey, findSubjectKeyMatch, SUBJECT_JACCARD_MATCH } from '../../../apps/web/src/lib/studio/generation/bulk/subject-key.js'
import { shelfIsBuildable } from '../../../apps/web/src/lib/studio/generation/bulk/crochet-forms.js'
import { CROCHET_IDEA_BACKLOG } from '../../../apps/web/src/lib/studio/generation/bulk/crochet-idea-backlog.js'
import { CROCHET_SHELVES } from '../../../apps/web/src/lib/studio/generation/categories.js'

const VALID_SHELVES = new Set(CROCHET_SHELVES.map((s) => s.slug))

// ── IP guardrail keyword screen (packages/db/prisma/design-direction.ts
//    IP_GUARDRAIL: no celebrity/brand/franchise IP). Checked against title —
//    a title-level hit is a confident block; body-level references would need
//    a human read, which stage 2 covers. ────────────────────────────────────
const IP_GUARDRAIL_RE =
  /\b(pokemon|pikachu|disney|mickey|minnie|marvel|spider-?man|batman|superman|harry potter|hogwarts|star wars|baby yoda|grogu|minion|hello kitty|sanrio|pixar|frozen ii?|elsa|olaf|paw patrol|bluey|peppa pig|sonic the hedgehog|super mario|mario kart|luigi|zelda|naruto|totoro|ghibli|taylor swift|barbie|lego|nintendo|playstation|xbox|coca-?cola|pepsi|nike|adidas|gucci|chanel)\b/i

// ── Shelf mapping ───────────────────────────────────────────────────────────
//
// The 959 drafts sit under five COARSE legacy sub-categories (garments,
// homewares, amigurumi, lacework, motif-granny-square) predating the current
// fine-grained CROCHET_SHELVES. This table maps a title to the shelf a
// customer would actually browse it under. Checked top to bottom, first
// match wins — ordered specific-compound-noun first so "wrap dress" lands on
// `dress`, not `wrap`, and "wrap skirt" lands on `skirt`.
//
// A title matching nothing here has no CROCHET_SHELVES slug to publish under
// (the publisher refuses any shelf not on that list — Step 6a) and is JUNK on
// that basis alone, however good the idea: a phone-stand cosy or a luggage
// tag is a real thing to crochet, just not a shelf this catalogue carries.
const SHELF_RULES: [shelf: string, re: RegExp][] = [
  // Novelty items with no matching CROCHET_SHELVES slug despite a
  // coincidental keyword hit further down (a cable tidy is not a wrap, a
  // lunch wrap is not a garment). Checked first so they fall through to
  // "no shelf" rather than false-matching a real shelf's regex.
  ['__no_shelf__', /cable tidy wrap|cutlery travel wrap|packed lunch wrap/i],
  // Toys
  ['amigurumi', /\bamigurumi\b|\bkeychain\b/i],
  // Table linens — before the motif rule, so "hexagon motif table runner"
  // lands on the item it actually is (a table runner) rather than on
  // motif-granny-square because it happens to contain the word "motif".
  ['coaster', /table runner/i],
  // Small fixed-shape items with their own shelf
  ['doily', /\bdoil(y|ies)\b/i],
  ['bookmark', /\bbookmarks?\b/i],
  ['pincushion', /\bpin ?cushion\b/i],
  ['headband', /\bheadbands?\b|\bear warmers?\b/i],
  ['bunting', /\bbunting\b|\bgarlands?\b/i],
  ['wall-hanging', /\bwall[- ]?hanging\b|\bmobile hanging\b|\bhanging wall\b/i],
  ['ornament', /\bornaments?\b|christmas stocking|easter egg (cover|decoration)|pumpkin decoration|\badvent\b/i],
  ['edging', /\bedgings?\b|\btrims?\b(?!.*\b(top|dress|skirt)\b)|border (strip|edging)/i],
  // Kitchen / bath
  ['dishcloth', /\bdishcloths?\b|\bwashcloths?\b|\bface ?cloths?\b|dish scrubber/i],
  ['potholder', /\bpot ?holders?\b|\btrivets?\b|\boven mitts?\b/i],
  ['tea-cosy', /\btea cos(y|ies)\b|\begg cos(y|ies)\b/i],
  ['towel', /\btowels?\b/i],
  ['coaster', /\bcoasters?\b|\bplacemats?\b|tray liner/i],
  // Home & living
  [
    'plant-hanger',
    /plant hanger|(cactus|plant) pot cover|pot hanger|window hanger|herb pot (trio )?covers?/i,
  ],
  // Rug before basket: "basket weave door mat" is a rug named for its
  // stitch pattern, not a basket.
  ['rug', /\brugs?\b|door ?mat|doorstep mat|bath mat/i],
  ['basket', /\bbaskets?\b|trinket box|storage box|catch-all|desk tidy|bowl centrepiece|\bfruit bowl\b|storage pot cover/i],
  ['pet-bed', /pet bed/i],
  ['pouffe', /\bpouffes?\b|floor cushion/i],
  ['cushion', /\bcushions?\b/i],
  ['blanket', /\bblankets?\b|\bthrows?\b|\bafghans?\b/i],
  // Bags & small accessories
  ['bag', /\bbags?\b|\btotes?\b|\bshoppers?\b|handbag/i],
  ['purse', /\bpurses?\b|\bpouch(es)?\b/i],
  ['hair-accessory', /hair tie|scrunchie|hair clip/i],
  ['jewellery', /\bbrooch(es)?\b|\bnecklaces?\b|\bjewellery\b/i],
  ['backpack', /\bbackpacks?\b/i],
  ['belt', /\bbelts?\b/i],
  // Garments — specific silhouette nouns before the generic ones below
  ['dress', /\bdress(es)?\b|\bgowns?\b|\bnightgowns?\b/i],
  ['skirt', /\bskirts?\b/i],
  ['jumpsuit-romper', /\brompers?\b|\bplaysuits?\b|\bjumpsuits?\b|\bdungarees?\b|sleep sack/i],
  ['tunic', /\btunics?\b|\bkaftans?\b/i],
  ['vest', /\bvests?\b|\bwaistcoats?\b|\bgilets?\b/i],
  ['tee-top', /\btops?\b|\btees?\b|t-shirt|tank top|\btanks?\b|camisole|blouse|bralette|polo shirt/i],
  ['cardigan', /\bcardigans?\b|\bshrugs?\b|\bbolero(s)?\b/i],
  ['jumper-pullover', /\bjumpers?\b|\bpullovers?\b|\bjerseys?\b|\bsweaters?\b|\bhoodies?\b/i],
  ['jacket-coat', /\bjackets?\b|\bcoats?\b|\bblazers?\b/i],
  ['trousers', /\btrousers?\b|\bpants?\b|\bleggings?\b|\bculottes\b/i],
  ['shorts', /\bshorts?\b/i],
  // Hands, feet, legs
  ['slippers', /\bslippers?\b/i],
  ['fingerless-mitts', /fingerless|wrist warmers?|wrist cuffs?|boot cuffs?/i],
  ['socks', /\bsocks?\b/i],
  ['booties', /\bbooties?\b|\bbootys?\b/i],
  ['mittens', /\bmittens?\b/i],
  ['gloves', /\bgloves?\b/i],
  ['legwarmers', /leg ?warmers?/i],
  // Headwear, neckwear, wraps (after garments, so "wrap dress"/"wrap skirt"
  // etc. never reach here)
  ['hat', /\bhats?\b|\bbeanies?\b/i],
  ['scarf', /\bscarf\b|\bscarfs\b|\bscarves\b/i],
  ['cowl', /\bcowls?\b|\bsnoods?\b/i],
  ['shawl', /\bshawls?\b|shawlettes?/i],
  ['wrap', /\bwraps?\b|\bstoles?\b|swaddle/i],
  ['poncho', /\bponchos?\b/i],
  ['beret', /\bberets?\b/i],
  // Motifs / grannies / mandalas / hexagons — LAST, so "granny square
  // cardigan" or "granny square cushion cover" lands on the finished object
  // it actually is (cardigan/cushion — neither buildable) rather than on the
  // buildable motif-granny-square shelf just because it mentions "granny
  // square" in passing. A bare motif with no other finished-object noun
  // falls through to here correctly. Round-count / plain-technique variants
  // are filtered out later by the generic detector, not here.
  [
    'motif-granny-square',
    /\bmotifs?\b|granny[- ]square|granny (rectangle|triangle|stripe panel)|\bmandala\b|\bhexagon\b|african flower|bavarian (crochet )?square|bruges lace tile|log cabin square|mitred square|pinwheel motif|sunburst|kaleidoscope|catherine wheel|compass rose|overlay stitch square|tapestry crochet square|solid treble granny|join-as-you-go square|interlocking crochet square|double granny square|block motif|\bsquares?\b|\brounds?\b/i,
  ],
]

function mapShelf(title: string): string | null {
  for (const [shelf, re] of SHELF_RULES) {
    if (re.test(title)) return shelf === '__no_shelf__' ? null : shelf
  }
  return null
}

// ── "Generic construction only" detector ────────────────────────────────────
//
// The backlog file's own doc comment: a pattern named ONLY for its stitch or
// construction technique ("waffle stitch dishcloth", "bobble blanket",
// "granny square, six rounds") is "a second row about a thing the site
// already teaches" and must not be re-added. After the shelf noun and a fixed
// list of construction/stitch/size/colour-count words are stripped, a title
// with nothing load-bearing left is generic.
const GENERIC_WORDS = new Set(
  [
    // construction / fit
    'basic', 'classic', 'plain', 'simple', 'chunky', 'oversized', 'cropped', 'fitted',
    'extended', 'size', 'wide', 'long', 'short', 'sleeve', 'sleeves', 'drop', 'shoulder',
    'set', 'raglan', 'yoke', 'seamless', 'top', 'down', 'side', 'to', 'front', 'post',
    'back', 'loop', 'only', 'open', 'button', 'up', 'zip', 'hooded', 'sleeveless',
    'buttoned', 'buttoning', 'v', 'neck', 'mock', 'turtleneck', 'cowl', 'crew',
    'colour', 'color', 'block', 'blocked', 'two', 'tone', 'ombre', 'fade', 'striped',
    'stripe', 'stripes', 'colourwork', 'colorwork', 'fair', 'isle', 'style', 'ribbed',
    'rib', 'cabled', 'cable', 'effect', 'texture', 'textured', 'ribbing', 'lightweight',
    // stitch names
    'stitch', 'stitches', 'dc', 'htr', 'tr', 'sc', 'hdc', 'dtr', 'trc', 'moss', 'waffle',
    'waistcoat', 'linen', 'shell', 'bobble', 'popcorn', 'puff', 'spike', 'spider',
    'lemon', 'peel', 'granny', 'crocodile', 'herringbone', 'basketweave', 'basket',
    'weave', 'tunisian', 'corner', 'c2c', 'solomons', 'knot', 'crossed', 'linked',
    'treble', 'double', 'half', 'single', 'star', 'v-stitch', 'diamond', 'mesh',
    'sedge', 'overlay', 'mosaic', 'intarsia', 'lattice', 'offset', 'ripple', 'chevron',
    'horizontal', 'staggered', 'third', 'thick', 'thin', 'triple', 'picot', 'edged',
    'tie', 'dye', 'space', 'sequin', 'sparkle', 'seed', 'variegated', 'self', 'striping',
    'lace', 'lacy', 'fan', 'cluster', 'openwork', 'alpine', 'chain', 'chainless',
    'foundation', 'mixed', 'petal', 'blo', 'flo',
    // shelf-noun synonyms that leak through when a title mixes two of them
    // ("bobble wrap shawl") or names a different garment than the one the
    // shelf mapper matched on
    'wrap', 'shawl', 'shawlette', 'stole', 'cowl', 'snood', 'scarf', 'cover',
    // sizes / rounds / colour counts (motif shelf)
    'round', 'rounds', 'colour', 'colours', 'color', 'colors', 'version', 'panel',
    'advanced', 'eight', 'four', 'five', 'six', 'seven', 'nine', 'ten', 'twelve',
    'three', 'two', 'point', 'variant',
    // yarn / fibre words with no distinguishing subject
    'cotton', 'wool', 'mohair', 'bamboo', 'hemp', 'organic', 'natural', 'fibre', 'fiber',
    'aran', 'dk', 'merino',
    // audience / size framing, not a subject
    'baby', 'adult', 'accent', 'lap', 'skein',
    // garment-noun synonyms not equal to their CROCHET_SHELVES slug (blanket
    // vs throw/afghan, jumper-pullover vs jersey/sweater, dress vs gown,
    // vest vs gilet)
    'throw', 'afghan', 'jersey', 'sweater', 'gown', 'gilet',
    // filler
    'crochet', 'pattern', 'style', 'look', 'a', 'in', 'of', 'the', 'with', 'for', 'and',
    // the craft word repeated on every amigurumi title — never a subject
    'amigurumi',
  ].map((w) => w.toLowerCase()),
)

/** subjectKey tokens with the construction/stitch/filler vocabulary (and the
 *  repeated craft word) removed — what's left after stripping everything
 *  that names a TECHNIQUE rather than a SUBJECT. Used both for the generic
 *  detector and, joined back up, as the key for every dedupe comparison —
 *  the same "amigurumi" or "granny" appearing in every title on a shelf must
 *  not itself count as similarity. */
function bareTokens(title: string): string[] {
  return subjectKey(title)
    .split(' ')
    .filter((w) => w && !GENERIC_WORDS.has(w))
}

function bareKey(title: string): string {
  return bareTokens(title).join(' ')
}

/** True when nothing survives bareTokens + the shelf's own search noun —
 *  i.e. the title names a technique, not a subject. */
function isGenericConstructionOnly(title: string, shelf: string): boolean {
  const shelfWords = new Set(shelf.split('-'))
  const tokens = bareTokens(title).filter((w) => !shelfWords.has(w))
  return tokens.length === 0
}

// ── Manual downgrades from stage 2 (Claude reading each shelf batch) ───────
// Keyed by slug. Populated by hand after reading the deterministic survivors;
// empty on a first dry run.
const MANUAL_JUNK: Record<string, string> = {
  // Stage 2 read: "panda bear" is the same subject as "panda", just phrased
  // differently — the shared "amigurumi" + "bear" tokens weren't enough
  // signal once the craft word is stripped, so this one is called by hand.
  'amigurumi-panda-bear': 'same subject as amigurumi-panda ("panda" = "panda bear")',
  // Bare geometric shape + zero embellishment — the motif shelf's own
  // "granny square, six rounds" problem in miniature.
  'crochet-circular-base-motif': 'a bare circle with no motif — construction only, not a subject',
  'square-doily-crochet': 'a mitred square with no motif — construction only, not a subject',
  'large-centrepiece-doily-crochet': 'named only for size/placement, no motif or style',
  'oval-doily-crochet': 'named only for shape/placement, no motif or style',
  // Pure texture/construction, no subject, once the stitch vocabulary is
  // stripped — the dishcloth/pullover problem, just on blanket and cushion.
  'alpine-stitch-baby-blanket': 'stitch name + generic blanket, no subject',
  'blo-treble-blanket': 'stitch name + generic blanket, no subject',
  'chainless-foundation-blanket': 'names a start method, not a subject',
  'cluster-chain-baby-blanket': 'stitch name + generic blanket, no subject',
  'crochet-chunky-throw-shawl': 'construction only, and a confused shawl/throw hybrid title',
  'mixed-stitch-sampler-baby-blanket': 'a stitch sampler is a technique exercise, not a sellable subject',
  'petal-stitch-throw': 'petal is the stitch name here, not a motif — construction only',
  'bobble-textured-cushion-cover': 'stitch name + generic cushion, no subject',
  'linen-stitch-square-cushion': 'stitch name + default cushion shape, no subject',
  'fan-lace-edging-crochet': '"border edging" is a tautology on top of two stitch names',
}

interface DraftRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: unknown
  chartDefinition: unknown
  finishedSizeText: string | null
  gaugeText: string | null
  primaryHookId: string | null
  subCategorySlug: string | null
}

type Verdict = 'JUNK' | 'IDEA-BUILDABLE' | 'IDEA-THEME'

interface Classified extends DraftRow {
  shelf: string | null
  buildable: boolean
  verdict: Verdict
  reasons: string[]
}

async function loadDrafts(): Promise<DraftRow[]> {
  const category = await prisma.category.findFirst({ where: { slug: 'crochet' } })
  if (!category) throw new Error('crochet category not found')
  const rows = await prisma.tutorial.findMany({
    where: { categoryId: category.id, type: 'PATTERN', status: 'DRAFT' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      chartDefinition: true,
      finishedSizeText: true,
      gaugeText: true,
      primaryHookId: true,
      subCategory: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })
  return rows.map((r) => ({ ...r, subCategorySlug: r.subCategory?.slug ?? null }))
}

/** subjectKeys of everything already live: published crochet Tutorial
 *  PATTERN rows (by title) + published CrochetPattern rows (by name). */
async function loadPublishedKeys(): Promise<string[]> {
  const category = await prisma.category.findFirst({ where: { slug: 'crochet' } })
  const pubTutorials = await prisma.tutorial.findMany({
    where: { categoryId: category!.id, type: 'PATTERN', status: 'PUBLISHED' },
    select: { title: true },
  })
  const pubPatterns = await prisma.crochetPattern.findMany({
    where: { visibility: 'PUBLIC' },
    select: { name: true },
  })
  return [
    ...pubTutorials.map((t) => bareKey(t.title)),
    ...pubPatterns.map((p) => bareKey(p.name)),
  ].filter(Boolean)
}

function classify(
  row: DraftRow,
  publishedKeys: string[],
  seenDraftKeys: Map<string, string>, // shelf|key -> first slug seen
): Classified {
  const reasons: string[] = []

  const completeness = checkCompleteness({
    slug: row.slug,
    categorySlug: 'crochet',
    subCategorySlug: row.subCategorySlug,
    type: 'PATTERN',
    body: row.body,
    hasChart: !!row.chartDefinition,
  })

  const shelf = mapShelf(row.title)
  const buildable = shelf ? shelfIsBuildable(shelf) : false
  const key = bareKey(row.title)

  if (!completeness.ok) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: completeness.reasons }
  }

  if (IP_GUARDRAIL_RE.test(row.title)) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: ['IP guardrail: named brand/franchise/celebrity in title'] }
  }

  if (!shelf) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: ['no CROCHET_SHELVES slug covers this item type'] }
  }
  if (!VALID_SHELVES.has(shelf)) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: [`mapped shelf "${shelf}" is not in CROCHET_SHELVES`] }
  }

  const pubMatch = findSubjectKeyMatch(key, publishedKeys, SUBJECT_JACCARD_MATCH)
  if (pubMatch) {
    return {
      ...row, shelf, buildable, verdict: 'JUNK',
      reasons: [`duplicate of a published pattern (subject key "${pubMatch.key}", overlap ${pubMatch.overlap.toFixed(2)})`],
    }
  }

  const backlogKeysForShelf = CROCHET_IDEA_BACKLOG.filter((i) => i.shelf === shelf).map((i) =>
    bareKey(i.motif),
  )
  const backlogMatch = findSubjectKeyMatch(key, backlogKeysForShelf, SUBJECT_JACCARD_MATCH)
  if (backlogMatch) {
    return {
      ...row, shelf, buildable, verdict: 'JUNK',
      reasons: [`duplicate of an existing backlog idea (subject key "${backlogMatch.key}", overlap ${backlogMatch.overlap.toFixed(2)})`],
    }
  }

  const seenKey = `${shelf}|${key}`
  const priorSlug = seenDraftKeys.get(seenKey)
  if (key && priorSlug) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: [`duplicate of another draft in this batch (${priorSlug})`] }
  }
  // Also check near-duplicates already accepted on the same shelf (not just
  // exact key match) so e.g. "panda" and "panda bear" collapse to one.
  for (const [otherKey, otherSlug] of seenDraftKeys) {
    if (!otherKey.startsWith(`${shelf}|`)) continue
    const otherSubjectKey = otherKey.slice(shelf.length + 1)
    const overlap = key && otherSubjectKey ? findSubjectKeyMatch(key, [otherSubjectKey], SUBJECT_JACCARD_MATCH) : null
    if (overlap) {
      return { ...row, shelf, buildable, verdict: 'JUNK', reasons: [`near-duplicate of another draft in this batch (${otherSlug}, overlap ${overlap.overlap.toFixed(2)})`] }
    }
  }

  if (isGenericConstructionOnly(row.title, shelf)) {
    return {
      ...row, shelf, buildable, verdict: 'JUNK',
      reasons: ['generic construction/stitch name only, no distinguishing subject — the kind of row the Tutorial library already owns the naming space for'],
    }
  }

  if (MANUAL_JUNK[row.slug]) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: [MANUAL_JUNK[row.slug]!] }
  }

  seenDraftKeys.set(seenKey, row.slug)
  return { ...row, shelf, buildable, verdict: buildable ? 'IDEA-BUILDABLE' : 'IDEA-THEME', reasons: [] }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const dumpJson = process.argv.includes('--json')

  const [drafts, publishedKeys] = await Promise.all([loadDrafts(), loadPublishedKeys()])
  console.log(`Loaded ${drafts.length} draft PATTERN crochet tutorials.`)
  console.log(`Published dedupe universe: ${publishedKeys.length} subject keys.\n`)

  const seenDraftKeys = new Map<string, string>()
  const classified = drafts.map((row) => classify(row, publishedKeys, seenDraftKeys))

  // ── Voice check, informational only (not part of the verdict) ───────────
  let voiceErrorRows = 0
  for (const row of classified) {
    const report = runVoiceCheck({ title: row.title, excerpt: row.excerpt, body: row.body })
    if (report.errors.length > 0) voiceErrorRows++
  }

  // ── Counts ────────────────────────────────────────────────────────────
  const byVerdict: Record<Verdict, number> = { JUNK: 0, 'IDEA-BUILDABLE': 0, 'IDEA-THEME': 0 }
  const byShelf: Record<string, Record<Verdict, number>> = {}
  for (const row of classified) {
    byVerdict[row.verdict]++
    const shelf = row.shelf ?? '(unmapped)'
    byShelf[shelf] ??= { JUNK: 0, 'IDEA-BUILDABLE': 0, 'IDEA-THEME': 0 }
    byShelf[shelf]![row.verdict]++
  }

  console.log('=== VERDICT COUNTS ===')
  console.log(byVerdict)
  console.log(`\nRows with a voice-check error (informational, not auto-junked): ${voiceErrorRows}`)

  console.log('\n=== BY SHELF ===')
  for (const [shelf, counts] of Object.entries(byShelf).sort((a, b) => {
    const totalA = a[1].JUNK + a[1]['IDEA-BUILDABLE'] + a[1]['IDEA-THEME']
    const totalB = b[1].JUNK + b[1]['IDEA-BUILDABLE'] + b[1]['IDEA-THEME']
    return totalB - totalA
  })) {
    console.log(
      `  ${shelf.padEnd(24)} JUNK ${String(counts.JUNK).padStart(3)}  BUILDABLE ${String(counts['IDEA-BUILDABLE']).padStart(3)}  THEME ${String(counts['IDEA-THEME']).padStart(3)}`,
    )
  }

  console.log('\n=== JUNK REASON BREAKDOWN ===')
  const reasonCounts: Record<string, number> = {}
  for (const row of classified) {
    if (row.verdict !== 'JUNK') continue
    const bucket = row.reasons[0]!.split(' (')[0]!.split(':')[0]!.slice(0, 60)
    reasonCounts[bucket] = (reasonCounts[bucket] ?? 0) + 1
  }
  for (const [reason, n] of Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${reason}`)
  }

  console.log('\n=== SAMPLE JUNK (12) ===')
  const junkSample = classified.filter((r) => r.verdict === 'JUNK')
  for (const row of junkSample.slice(0, 4).concat(junkSample.slice(200, 204)).concat(junkSample.slice(-4))) {
    console.log(`  [${row.slug}] "${row.title}" — ${row.reasons[0]}`)
  }

  console.log('\n=== SAMPLE KEEPERS (12) ===')
  const keepers = classified.filter((r) => r.verdict !== 'JUNK')
  for (const row of keepers.slice(0, 6).concat(keepers.slice(-6))) {
    console.log(`  [${row.verdict}] [${row.slug}] "${row.title}" — shelf: ${row.shelf}`)
  }

  if (dumpJson) {
    const outPath = process.env.TRIAGE_JSON_OUT ?? '/tmp/crochet-draft-triage-report.json'
    writeFileSync(outPath, JSON.stringify(classified, null, 2))
    console.log(`\nFull classification written to ${outPath}`)
  }

  if (apply) {
    console.log('\n=== APPLY ===')
    console.log('NOT IMPLEMENTED YET pending backlog conversion — see CONVERTED_SLUGS.')
    // Deletion happens in a follow-up pass once every IDEA-* row has a
    // corresponding backlog entry committed; see the task hand-off.
  } else {
    console.log('\nDry run only — nothing changed. Re-run with --apply once Rebecca has signed off.')
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
