/**
 * THE CROCHET IDEA BACKLOG — the named work queue behind the crochet autopilot.
 *
 * `crochet-planner.ts` invents a brief per batch from the design-direction axes.
 * That is good at variety and bad at coverage: nothing guarantees the catalogue
 * ends up with the SUBJECTS a crochet customer actually searches for, and
 * nothing stops the model spending a whole shelf on near-neighbours of the same
 * idea. This file is the other half — a hand-picked, deduped, market-weighted
 * list of ideas, in the order they should be worked, so the catalogue fills
 * towards a shape somebody chose.
 *
 * TWO KINDS OF ENTRY.
 *
 *   · `buildable: true` — an idea for one of the thirteen shelves the loom can
 *     build today (`crochet-forms.ts`). It names a treatment drawn ONLY from
 *     that shelf's envelope, so the autopilot can take it straight off the
 *     queue and commission it. These are named to their recommended target.
 *
 *   · `buildable: false` — a THEME for a shelf the engine cannot reach yet
 *     (garments, blankets, hats, lace, anything needing shaping, colourwork
 *     beyond stripes, or motif joins). It carries no treatment, because there
 *     is no honest one to name. These exist so the engine roadmap can follow
 *     demand rather than convenience: the longest theme lists sit on the
 *     shelves the market wants most and the loom can build least.
 *
 * DEDUPED AGAINST THE LIVE CATALOGUE, 6 September 2026. Every idea here was
 * checked against the 1,193 crochet Tutorial rows and the 17 CrochetPattern
 * rows then in the database, by the same `subjectKey` normaliser the publish
 * guard uses, at the same 0.6 overlap threshold. Sixty-five candidates were cut
 * or rewritten because they collided (seven buildable ideas, fifty-eight
 * themes), and roughly two hundred single-animal amigurumi subjects the
 * Tutorial library already carries were never written in the first place. The
 * file now collides with nothing.
 *
 * That check is also why the ideas below are MOTIF-led rather than stitch-led.
 * The Tutorial library owns the stitch-technique naming space ("waffle stitch
 * dishcloth", "bobble blanket", "granny square, six rounds"), so a pattern
 * called "waffle stitch dishcloth" would be a second row about a thing the site
 * already teaches. Re-run the check before adding to this file:
 *   cd apps/web && pnpm exec tsx scripts/check-crochet-idea-backlog.ts
 *
 * ORDER IS PART OF THE DATA. `CROCHET_IDEA_BACKLOG` is emitted in a weighted
 * round-robin across shelves rather than shelf by shelf, so a session that
 * works the first fifty entries produces a balanced browse grid — several
 * shelves, a spread of colourways, both easy and hard — instead of fifty
 * coasters. `seq` is that position.
 *
 * A THIRD, FINER-GRAINED CASE (6 September 2026, evening): on the four
 * amigurumi-treatment shelves (amigurumi, animal-toy, doll, baby-toy-lovey),
 * "the shelf is buildable" is not the same question as "this idea is
 * buildable" — the amigurumi engine only builds FOUR bodies today (ball, egg,
 * bear, bunny; `AMIGURUMI_BASES` in `loom/crochet/engine/amigurumiPresets.ts`),
 * so a brief for an otter or a border collie has nowhere honest to land even
 * though its shelf has a working treatment. `isHonestAmigurumiSubject` below
 * is the per-idea gate: an amigurumi-treatment row on one of these shelves is
 * `buildable: true` only when its motif IS one of those four bodies (any bear
 * species, any rabbit/hare, a plain ball or egg, or a named colour/pattern
 * variant of one) — everything else keeps its treatment (informational: this
 * is what it WOULD build as, once the engine grows more bases) but is
 * `buildable: false`, so `nextBuildableIdeas` never hands the routine a shape
 * the loom cannot honestly render. A `baby-toy-lovey` row on the `sphere`
 * treatment (a plain rattle ball) is never subject to this — it is already
 * just a ball, whatever it is named.
 */

import { CROCHET_SHELF_BY_SLUG } from '../categories'
import { envelopeFor, shelfIsBuildable, type CrochetTreatment } from './crochet-forms'
import { findSubjectKeyMatch, subjectKey } from './subject-key'
// Relative, not the `@/` alias: this file is imported at runtime by
// packages/db scripts (crochet-draft-triage.ts) run with tsx from outside
// apps/web, which cannot resolve the Next.js path alias.
import { AMIGURUMI_BASES } from '../../../loom/crochet/engine/amigurumiPresets'

export type IdeaSize = 'small' | 'medium' | 'large' | 'showpiece'
export type IdeaDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'showpiece'

/** One entry of the backlog. */
export interface CrochetIdea {
  /** Stable id: `<shelf>-<nn>`. Never renumber — the autopilot records it. */
  id: string
  /** Position in the interleaved working order. */
  seq: number
  /** A CROCHET_SHELVES slug. */
  shelf: string
  /** The pattern's working title, house voice. */
  title: string
  /** What the thing is — the subject or motif, in a couple of words. */
  motif: string
  /** The colourway family: a PALETTES slug from design-direction.ts. */
  colourway: string
  /** The engine treatment, from this shelf's crochet-forms envelope. Null on a
   *  theme for a shelf the loom cannot build. */
  treatment: CrochetTreatment | null
  sizeClass: IdeaSize
  difficulty: IdeaDifficulty
  /** The query this idea answers. */
  searchPhrase: string
  /** Normalised key, by the same rule as the publish guard's subject key. */
  dedupeKey: string
  /** Can the loom build it today? Shelf-buildable AND, on the four
   *  amigurumi-treatment shelves, honestly one of the four bodies the engine
   *  actually builds — see `isHonestAmigurumiSubject`. `treatment` can still
   *  be set when this is false (informational: what it would build as). */
  buildable: boolean
  /** Optional provenance: a draft Tutorial row this idea was converted from
   *  (6 September 2026 triage), by old slug. Absent on hand-authored ideas. */
  source?: { kind: 'draft-tutorial'; slug: string }
  /** One line for the authoring session. */
  brief: string
}

/**
 * Compact source row. Hand-maintained; everything derivable is derived, so a
 * new idea is one short line rather than a twelve-field object.
 *
 *   [title, motif, hook, colourway, treatment, code, sourceSlug?]
 *
 * `code` is size + difficulty as one letter each: size s|m|l|w (small, medium,
 * large, showpiece), difficulty b|i|a|w (beginner, intermediate, advanced,
 * showpiece). So 'sb' is a small beginner piece and 'ww' a showpiece.
 *
 * `sourceSlug` (6 September 2026 triage): the old Tutorial slug this idea was
 * converted from, when it came off the 959 pre-loom draft prose patterns
 * rather than being hand-authored. Absent on every hand-authored row.
 */
type Row = [
  title: string,
  motif: string,
  hook: string,
  colourway: string,
  treatment: CrochetTreatment,
  code: string,
  sourceSlug?: string,
]

/** A theme for a shelf the loom cannot build: [theme, hook, colourway,
 *  sourceSlug?] — sourceSlug has the same meaning as on `Row`. */
type Theme = [theme: string, hook: string, colourway: string, sourceSlug?: string]

const SIZE: Record<string, IdeaSize> = { s: 'small', m: 'medium', l: 'large', w: 'showpiece' }
const DIFF: Record<string, IdeaDifficulty> = {
  b: 'beginner',
  i: 'intermediate',
  a: 'advanced',
  w: 'showpiece',
}

/**
 * The noun a customer types for each shelf. Used for the search phrase and, via
 * the dedupe key, to keep "fox" on the amigurumi shelf a different idea from
 * "fox" on the soft-toy shelf.
 */
const SEARCH_NOUN: Record<string, string> = {
  amigurumi: 'amigurumi',
  'animal-toy': 'soft toy',
  doll: 'doll',
  'baby-toy-lovey': 'baby lovey',
  ornament: 'ornament',
  'wall-hanging': 'wall hanging',
  dishcloth: 'dishcloth',
  potholder: 'potholder',
  coaster: 'coaster',
  'motif-granny-square': 'granny square',
  bookmark: 'bookmark',
  pincushion: 'pincushion',
  headband: 'ear warmer',
  blanket: 'blanket',
  cushion: 'cushion',
  basket: 'basket',
  rug: 'rug',
  'plant-hanger': 'plant hanger',
  bunting: 'bunting',
  'pet-bed': 'pet bed',
  pouffe: 'pouffe',
  hat: 'hat',
  scarf: 'scarf',
  cowl: 'cowl',
  shawl: 'shawl',
  beret: 'beret',
  wrap: 'wrap',
  poncho: 'poncho',
  slippers: 'slippers',
  'fingerless-mitts': 'fingerless mitts',
  socks: 'socks',
  booties: 'baby booties',
  mittens: 'mittens',
  gloves: 'gloves',
  legwarmers: 'leg warmers',
  bag: 'bag',
  purse: 'purse',
  'hair-accessory': 'hair scrunchie',
  jewellery: 'necklace',
  backpack: 'backpack',
  belt: 'belt',
  'tea-cosy': 'tea cosy',
  towel: 'towel topper',
  cardigan: 'cardigan',
  'jumper-pullover': 'jumper',
  'tee-top': 'top',
  vest: 'vest',
  dress: 'dress',
  tunic: 'tunic',
  skirt: 'skirt',
  'jacket-coat': 'jacket',
  trousers: 'trousers',
  shorts: 'shorts',
  'jumpsuit-romper': 'romper',
  doily: 'doily',
  edging: 'edging',
  'applique-flower': 'flower applique',
}

/**
 * "crochet fox amigurumi pattern": the query the idea answers, with no word
 * said twice and always ending in "pattern". The shelf noun is dropped whole
 * when the motif already says it, so a "granny square bucket hat" does not
 * become "granny square bucket hat hat".
 */
function searchPhrase(motif: string, shelf: string): string {
  const noun = SEARCH_NOUN[shelf] ?? shelf.replace(/-/g, ' ')
  const motifWords = motif.toLowerCase().split(/\s+/).filter(Boolean)
  const nounWords = noun.toLowerCase().split(/\s+/).filter(Boolean)
  const overlaps = nounWords.some((w) => motifWords.includes(w))
  const seen = new Set<string>()
  const words: string[] = []
  for (const w of ['crochet', ...motifWords, ...(overlaps ? [] : nounWords)]) {
    if (!w || w === 'pattern' || seen.has(w)) continue
    seen.add(w)
    words.push(w)
  }
  words.push('pattern')
  return words.join(' ')
}

/**
 * The backlog's own identity key: the shelf plus the normalised motif. Shelf
 * scoped on purpose, so "fox" as a small amigurumi and "fox" as a big soft toy
 * are two ideas rather than one, and NOT a bare subject phrase, so it can never
 * be confused with a catalogue subject key. Matching against the live catalogue
 * runs on `subjectKey(motif)` instead, in `nextBuildableIdeas`.
 */
function dedupeKeyFor(motif: string, shelf: string): string {
  return `${shelf}:${subjectKey(motif)}`
}

function pad(n: number): string {
  return String(n).padStart(3, '0')
}

/**
 * The four shelves whose sole treatment (or, on baby-toy-lovey, one of two
 * treatments) is 'amigurumi' — the shaped-figure builder that only knows how
 * to lay out a bear body or a bunny body (`amigurumiFromDesign` in
 * `crochet-design.ts`). Belt and braces: fails loudly if the engine ever
 * grows a base beyond the four this file was written against, so the regex
 * below gets revisited rather than silently under- or over-matching.
 */
const AMIGURUMI_BASE_CONSTRAINED_SHELVES = new Set(['amigurumi', 'animal-toy', 'doll', 'baby-toy-lovey'])
if (AMIGURUMI_BASES.map((b) => b.id).sort().join(',') !== 'ball,bear,bunny,egg') {
  throw new Error(
    'AMIGURUMI_BASES changed shape — revisit isHonestAmigurumiSubject in crochet-idea-backlog.ts',
  )
}

/**
 * Bear (any species/colourway — a panda is a bear), rabbit/hare/bunny (any
 * breed), or a plain ball/egg (including a named colour or pattern variant,
 * e.g. "speckled egg", "ball of yarn"). Deliberately narrow: a subject only
 * passes because it names one of these bodies, never because it merely LOOKS
 * roundish (a pufferfish, a cupcake, a donut are all real shapes the engine
 * cannot lay out and stay off this list).
 */
const HONEST_AMIGURUMI_BASE_RE = /\bbears?\b|\bpandas?\b|\bbunn(?:y|ies)\b|\brabbits?\b|\bhares?\b|\bballs?\b|\beggs?\b/i

/** True when `motif` is honestly one of the four bodies the engine builds. */
export function isHonestAmigurumiSubject(motif: string): boolean {
  return HONEST_AMIGURUMI_BASE_RE.test(motif)
}

function buildIdeas(shelf: string, rows: Row[]): CrochetIdea[] {
  return rows.map(([title, motif, hook, colourway, treatment, code, sourceSlug], i) => {
    const envelope = envelopeFor(shelf, treatment)
    const baseConstrained = AMIGURUMI_BASE_CONSTRAINED_SHELVES.has(shelf) && treatment === 'amigurumi'
    const buildable = baseConstrained ? isHonestAmigurumiSubject(motif) : true
    return {
      id: `${shelf}-${pad(i + 1)}`,
      seq: 0,
      shelf,
      title,
      motif,
      colourway,
      treatment,
      sizeClass: SIZE[code[0]!] ?? 'medium',
      difficulty: DIFF[code[1]!] ?? 'intermediate',
      searchPhrase: searchPhrase(motif, shelf),
      dedupeKey: dedupeKeyFor(motif, shelf),
      buildable,
      ...(sourceSlug ? { source: { kind: 'draft-tutorial' as const, slug: sourceSlug } } : {}),
      brief: buildable
        ? `${motif}: ${hook}. ${colourway} palette, built as ${treatment}${envelope ? ` (${envelope.note.replace(/\.$/, '')})` : ''}.`
        : `${motif}: ${hook}. ${colourway} palette. Needs a body beyond the four the amigurumi engine builds today (ball, egg, bear, bunny), so not buildable yet.`,
    }
  })
}

function buildThemes(shelf: string, themes: Theme[]): CrochetIdea[] {
  const shelfName = CROCHET_SHELF_BY_SLUG[shelf]?.name ?? shelf
  return themes.map(([theme, hook, colourway, sourceSlug], i) => ({
    id: `${shelf}-t${pad(i + 1)}`,
    seq: 0,
    shelf,
    title: theme,
    motif: theme,
    colourway,
    treatment: null,
    sizeClass: 'medium' as IdeaSize,
    difficulty: 'intermediate' as IdeaDifficulty,
    searchPhrase: searchPhrase(theme, shelf),
    dedupeKey: dedupeKeyFor(theme, shelf),
    buildable: false,
    ...(sourceSlug ? { source: { kind: 'draft-tutorial' as const, slug: sourceSlug } } : {}),
    brief: `${shelfName} theme. ${theme}: ${hook}. ${colourway} palette. Waiting on engine work.`,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDABLE SHELVES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AMIGURUMI — the biggest seam in the market and the biggest here. The
 * Tutorial library already covers roughly two hundred single-animal subjects
 * (fox, panda, axolotl, capybara and so on), so none of those reappear: this
 * list is fresh species, dressed characters, food, objects and folklore.
 */
const AMIGURUMI: Row[] = [
  // ── Fresh British and woodland wildlife ──
  ['Riverbank otter', 'otter', 'floating on its back with a pebble on its tummy', 'scandi-calm', 'amigurumi', 'mi'],
  ['Sleepy dormouse', 'dormouse', 'curled in a hazel-leaf nest, eyes shut', 'mushroom-woodland', 'amigurumi', 'sb'],
  ['Bramble hare', 'hare', 'long ears laid back, mid-leap on a low base', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Velvet mole', 'mole', 'round body, pink paddle hands, a tiny spade', 'boho-earth', 'amigurumi', 'sb'],
  ['Hedgerow stoat', 'stoat', 'stretched long with a black tail tip', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Pipistrelle bat', 'bat', 'hanging upside down by felted claws', 'gothic-dusk', 'amigurumi', 'si'],
  ['Water vole', 'water vole', 'sat on a reed tuft nibbling a stem', 'wildflower-meadow', 'amigurumi', 'sb'],
  ['Pond newt friend', 'smooth newt', 'spotted belly and a wavy crest', 'wildflower-meadow', 'amigurumi', 'si'],
  ['Chalk-hill shrew', 'shrew', 'a whiskery snout and bead-black eyes', 'scandi-calm', 'amigurumi', 'sb'],
  ['Beaver with a log', 'beaver', 'flat stitched tail and a gnawed birch log', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Ferret in a scarf', 'ferret', 'long body, tiny striped scarf', 'bright-pop', 'amigurumi', 'mi'],
  ['Pine marten', 'pine marten', 'cream bib and a bushy dark tail', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Little chipmunk', 'chipmunk', 'stripes down the back, cheeks stuffed round', 'foxglove-autumn', 'amigurumi', 'sb'],
  ['Wolf cub', 'wolf cub', 'sat with oversized paws and a soft grey ruff', 'winter-frost', 'amigurumi', 'mi'],
  ['Fennec fox', 'fennec fox', 'enormous ears and a sand-coloured coat', 'boho-earth', 'amigurumi', 'mi'],
  ['Snow lynx', 'lynx', 'ear tufts and wide snowshoe paws', 'winter-frost', 'amigurumi', 'ma'],
  ['Ringtail raccoon', 'raccoon', 'bandit mask and a striped tail', 'scandi-calm', 'amigurumi', 'mi'],
  ['Stripy skunk', 'skunk', 'white stripe and a plume of a tail', 'elegant-mono', 'amigurumi', 'mi'],
  ['Armadillo ball', 'armadillo', 'banded shell that curls into a ball', 'boho-earth', 'amigurumi', 'ma'],
  ['Pangolin', 'pangolin', 'overlapping scale flaps in rows', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Sugar glider', 'sugar glider', 'membrane wings spread between paws', 'nursery-pastel', 'amigurumi', 'mi'],
  ['Wallaby and joey', 'wallaby', 'a pouch with a joey head peeping out', 'boho-earth', 'amigurumi', 'ma'],
  ['Bilby', 'bilby', 'silky ears and a black-and-white tail', 'scandi-calm', 'amigurumi', 'mi'],
  ['Tasmanian devil', 'tasmanian devil', 'stocky, white chest flash, grumpy face', 'gothic-dusk', 'amigurumi', 'mi'],
  ['Ring-tailed lemur', 'lemur', 'a striped tail curled right round the body', 'elegant-mono', 'amigurumi', 'ma'],
  ['Sleepy tarsier', 'tarsier', 'huge round eyes clinging to a branch', 'celestial-night', 'amigurumi', 'mi'],
  ['Marmoset', 'marmoset', 'white ear tufts and a long striped tail', 'vintage-tea', 'amigurumi', 'mi'],
  ['Musk ox', 'musk ox', 'a long shaggy skirt of loop stitch', 'winter-frost', 'amigurumi', 'ma'],
  ['Ibex on a ledge', 'ibex', 'sweeping ridged horns on a rock base', 'boho-earth', 'amigurumi', 'ma'],
  ['Baby moose', 'moose', 'knock-knees and soft velvet antler buds', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Okapi', 'okapi', 'striped legs and a long dark neck', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Tapir calf', 'tapir', 'spots and stripes and a wiggly snout', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Aardvark', 'aardvark', 'long snout, rabbit ears, digging claws', 'boho-earth', 'amigurumi', 'mi'],
  ['Wild boar piglet', 'boar piglet', 'humbug stripes down a round body', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Highland calf', 'highland calf', 'a shaggy fringe over both eyes', 'vintage-tea', 'amigurumi', 'mi'],
  ['Bactrian camel', 'camel', 'two humps and a haughty expression', 'boho-earth', 'amigurumi', 'ma'],
  ['Desert jerboa', 'jerboa', 'stilt legs and a tufted tail', 'boho-earth', 'amigurumi', 'si'],
  ['Snow leopard cub', 'snow leopard', 'rosette spots and a thick wrapped tail', 'winter-frost', 'amigurumi', 'ma'],
  ['Little jaguar', 'jaguar', 'a gold coat with dark rosettes', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Bengal tiger cub', 'tiger cub', 'bold stripes and pale ear spots', 'bright-pop', 'amigurumi', 'mi'],
  // ── Birds ──
  ['Barn owl', 'barn owl', 'heart-shaped face disc and pale wings', 'elegant-mono', 'amigurumi', 'ma'],
  ['Kingfisher', 'kingfisher', 'electric blue back and a dagger beak', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Garden wren', 'wren', 'a tiny round bird with a cocked tail', 'mushroom-woodland', 'amigurumi', 'sb'],
  ['Blue tit', 'blue tit', 'yellow breast and a blue cap', 'wildflower-meadow', 'amigurumi', 'sb'],
  ['Goldfinch', 'goldfinch', 'red face flash and gold wing bars', 'bright-pop', 'amigurumi', 'si'],
  ['Bullfinch', 'bullfinch', 'a rosy breast and a neat black cap', 'vintage-tea', 'amigurumi', 'si'],
  ['Woodpecker', 'woodpecker', 'clinging to a stumpy log with a red nape', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Magpie with treasure', 'magpie', 'a shiny bead held in the beak', 'elegant-mono', 'amigurumi', 'mi'],
  ['Jay', 'jay', 'pink body with a barred blue wing patch', 'wildflower-meadow', 'amigurumi', 'mi'],
  ['Raven', 'raven', 'a glossy black bird with a heavy beak', 'gothic-dusk', 'amigurumi', 'mi'],
  ['Swallow in flight', 'swallow', 'forked tail, wings pinned back', 'coastal-breeze', 'amigurumi', 'ma'],
  ['Grey heron', 'heron', 'folded neck on long stilt legs', 'scandi-calm', 'amigurumi', 'ma'],
  ['Spoonbill', 'spoonbill', 'a flat spoon of a beak and white plumes', 'elegant-mono', 'amigurumi', 'ma'],
  ['Little egret', 'egret', 'snow-white with black legs and gold feet', 'winter-frost', 'amigurumi', 'mi'],
  ['Puffling', 'puffin chick', 'a fluffy grey chick with an outsized beak', 'coastal-breeze', 'amigurumi', 'sb'],
  ['Gannet', 'gannet', 'buff head and dipped black wingtips', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Oystercatcher', 'oystercatcher', 'orange beak, pied body, pink legs', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Mallard duckling', 'duckling', 'a downy yellow ball with a dark eye stripe', 'nursery-pastel', 'amigurumi', 'sb'],
  ['Cygnet', 'cygnet', 'a grey fluffball with a stubby beak', 'scandi-calm', 'amigurumi', 'sb'],
  ['Pheasant', 'pheasant', 'copper body and a long barred tail', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Quail and eggs', 'quail', 'a plump quail with three speckled eggs', 'vintage-tea', 'amigurumi', 'mi'],
  ['Guinea fowl', 'guinea fowl', 'a spotted grey body and a bare blue head', 'elegant-mono', 'amigurumi', 'mi'],
  ['Cockatoo', 'cockatoo', 'a lifting yellow crest on a white bird', 'bright-pop', 'amigurumi', 'mi'],
  ['Lovebird pair', 'lovebirds', 'two little birds sat shoulder to shoulder', 'candy-kawaii', 'amigurumi', 'mi'],
  ['Hoopoe', 'hoopoe', 'a fan crest and barred wings', 'boho-earth', 'amigurumi', 'ma'],
  ['Emu chick', 'emu chick', 'stripes down a fuzzy body on long legs', 'boho-earth', 'amigurumi', 'mi'],
  ['Kakapo', 'kakapo', 'a round mossy-green parrot who cannot fly', 'wildflower-meadow', 'amigurumi', 'mi'],
  ['Nightjar', 'nightjar', 'bark-mottled wings and a wide soft mouth', 'gothic-dusk', 'amigurumi', 'ma'],
  ['Snowy ptarmigan', 'ptarmigan', 'a white winter bird with feathered feet', 'winter-frost', 'amigurumi', 'mi'],
  // ── Sea and shore ──
  ['Narwhal', 'narwhal', 'a spiral tusk and a speckled grey back', 'winter-frost', 'amigurumi', 'mi'],
  ['Beluga', 'beluga', 'a smooth white whale with a domed brow', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Orca', 'orca', 'crisp black and white with a tall fin', 'elegant-mono', 'amigurumi', 'mi'],
  ['Humpback and calf', 'humpback whale', 'a big whale with a small one alongside', 'coastal-breeze', 'amigurumi', 'lw'],
  ['Manta ray', 'manta ray', 'wide wings and a trailing tail', 'celestial-night', 'amigurumi', 'ma'],
  ['Hammerhead', 'hammerhead shark', 'a wide flat head with eyes at the tips', 'coastal-breeze', 'amigurumi', 'ma'],
  ['Sea otter with a shell', 'sea otter', 'floating with a scallop shell on its chest', 'scandi-calm', 'amigurumi', 'mi'],
  ['Manatee', 'manatee', 'a round grey body and a paddle tail', 'scandi-calm', 'amigurumi', 'mi'],
  ['Sea lion pup', 'sea lion', 'balanced on flippers with a whiskered nose', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Pufferfish', 'pufferfish', 'a spiky ball with a startled face', 'bright-pop', 'amigurumi', 'sb'],
  ['Clownfish and anemone', 'clownfish', 'a striped fish tucked in a frilled anemone', 'bright-pop', 'amigurumi', 'ma'],
  ['Betta fish', 'betta fish', 'long trailing fins in ombre colour', 'gothic-dusk', 'amigurumi', 'ma'],
  ['Koi', 'koi carp', 'red and white patches and trailing fins', 'vintage-tea', 'amigurumi', 'mi'],
  ['Cuttlefish', 'cuttlefish', 'a fringed skirt fin and W-shaped pupils', 'celestial-night', 'amigurumi', 'ma'],
  ['Nautilus', 'nautilus', 'a striped spiral shell with little tentacles', 'vintage-tea', 'amigurumi', 'ma'],
  ['Hermit crab', 'hermit crab', 'a soft crab in a swappable shell', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Sea urchin', 'sea urchin', 'a dense pincushion of spines', 'gothic-dusk', 'amigurumi', 'sb'],
  ['Nudibranch', 'sea slug', 'a frilled back in three loud colours', 'bright-pop', 'amigurumi', 'ma'],
  ['Sand dollar', 'sand dollar', 'a flat disc with a stitched five-petal star', 'coastal-breeze', 'amigurumi', 'sb'],
  ['Sea turtle hatchling', 'turtle hatchling', 'a tiny flipper-paddling hatchling', 'coastal-breeze', 'amigurumi', 'sb'],
  // ── Minibeasts ──
  ['Stag beetle', 'stag beetle', 'antler jaws and a glossy back', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Luna moth', 'luna moth', 'pale green wings with long tails', 'wildflower-meadow', 'amigurumi', 'ma'],
  ['Praying mantis', 'praying mantis', 'folded front legs and a swivel head', 'wildflower-meadow', 'amigurumi', 'ma'],
  ['Honeybee', 'honeybee', 'fuzzy bands and pollen baskets on the legs', 'foxglove-autumn', 'amigurumi', 'sb'],
  ['Damselfly', 'damselfly', 'a needle body and four gauzy wings', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Woodlouse', 'woodlouse', 'a segmented grey roll that curls up', 'scandi-calm', 'amigurumi', 'sb'],
  ['Glow worm', 'glow worm', 'a segmented body with a glowing tail tip', 'celestial-night', 'amigurumi', 'sb'],
  ['Cicada', 'cicada', 'stubby body and clear veined wings', 'boho-earth', 'amigurumi', 'mi'],
  // ── Reptiles and amphibians ──
  ['Poison dart frog', 'dart frog', 'a jewel-bright frog with black spots', 'bright-pop', 'amigurumi', 'sb'],
  ['Bearded dragon', 'bearded dragon', 'a spiny beard and a wide flat body', 'boho-earth', 'amigurumi', 'ma'],
  ['Corn snake coil', 'corn snake', 'a long coiled body in saddle blotches', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Terrapin', 'terrapin', 'a patterned shell and yellow neck stripes', 'wildflower-meadow', 'amigurumi', 'mi'],
  ['Blue-tongued skink', 'skink', 'a banded body and a stitched blue tongue', 'coastal-breeze', 'amigurumi', 'mi'],
  // ── Food ──
  ['Croissant', 'croissant', 'a curved buttery crescent with stitched flakes', 'vintage-tea', 'amigurumi', 'sb'],
  ['Cinnamon swirl', 'cinnamon roll', 'a spiral bun with a drizzle of icing', 'foxglove-autumn', 'amigurumi', 'sb'],
  ['Stack of pancakes', 'pancake stack', 'three pancakes, a pat of butter, syrup', 'vintage-tea', 'amigurumi', 'mi'],
  ['Toasted crumpet', 'crumpet', 'a holey top with a melting butter square', 'vintage-tea', 'amigurumi', 'sb'],
  ['Cream scone', 'scone', 'split with jam and a curl of cream', 'vintage-tea', 'amigurumi', 'sb'],
  ['Macaron trio', 'macarons', 'three pastel shells with piped filling', 'candy-kawaii', 'amigurumi', 'sb'],
  ['Battenberg slice', 'battenberg', 'pink and yellow squares in a marzipan wrap', 'candy-kawaii', 'amigurumi', 'mi'],
  ['Victoria sponge slice', 'victoria sponge', 'two layers, jam stripe, dusted top', 'vintage-tea', 'amigurumi', 'mi'],
  ['Mince pie', 'mince pie', 'a fluted case with a pastry star lid', 'winter-frost', 'amigurumi', 'sb'],
  ['Hot cross bun', 'hot cross bun', 'a glossy bun with a piped white cross', 'foxglove-autumn', 'amigurumi', 'sb'],
  ['Jam tart', 'jam tart', 'a pastry case with a glossy red centre', 'candy-kawaii', 'amigurumi', 'sb'],
  ['Swiss roll', 'swiss roll', 'a spiral of sponge and jam', 'candy-kawaii', 'amigurumi', 'sb'],
  ['Toffee apple', 'toffee apple', 'a shiny red coat and a wooden stick', 'foxglove-autumn', 'amigurumi', 'sb'],
  ['Ice lolly', 'ice lolly', 'a two-tone lolly with a bite taken out', 'bright-pop', 'amigurumi', 'sb'],
  ['Knickerbocker glory', 'ice cream sundae', 'scoops, sauce and a wafer in a tall glass', 'candy-kawaii', 'amigurumi', 'ma'],
  ['Bubble tea', 'bubble tea', 'a cup with stitched tapioca pearls and a straw', 'candy-kawaii', 'amigurumi', 'mi'],
  ['Espresso cup', 'espresso cup', 'a little cup and saucer with crema on top', 'elegant-mono', 'amigurumi', 'sb'],
  ['Brown Betty teapot', 'teapot', 'a round pot with a curved spout and lid', 'vintage-tea', 'amigurumi', 'ma'],
  ['Beans on toast', 'beans on toast', 'a slice with a pile of stitched beans', 'bright-pop', 'amigurumi', 'mi'],
  ['Fried breakfast egg', 'fried egg', 'a wobbly white with a bright yolk', 'bright-pop', 'amigurumi', 'sb'],
  ['Bao bun', 'bao bun', 'a soft folded bun with a shy face', 'candy-kawaii', 'amigurumi', 'sb'],
  ['Ramen bowl', 'ramen bowl', 'noodles, an egg half and a nori sheet', 'boho-earth', 'amigurumi', 'ma'],
  ['Dumpling', 'dumpling', 'a pleated crescent with a sleepy face', 'nursery-pastel', 'amigurumi', 'sb'],
  ['Cornish pasty', 'pasty', 'a crimped edge along a fat half moon', 'foxglove-autumn', 'amigurumi', 'sb'],
  ['Fish and chips', 'fish and chips', 'a battered fillet and chips in paper', 'coastal-breeze', 'amigurumi', 'ma'],
  ['Cheese wedge', 'cheese wedge', 'a holey yellow wedge with a rind', 'bright-pop', 'amigurumi', 'sb'],
  ['Baguette', 'baguette', 'a long loaf with slashed scoring', 'vintage-tea', 'amigurumi', 'sb'],
  ['Soft pretzel', 'pretzel', 'a knotted loop with salt-grain french knots', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Garden pea pod', 'pea pod', 'three peas in a pod, all smiling', 'wildflower-meadow', 'amigurumi', 'sb'],
  ['Bunch of carrots', 'carrots', 'three carrots with leafy tops tied together', 'bright-pop', 'amigurumi', 'sb'],
  ['Aubergine', 'aubergine', 'a glossy purple body and a green calyx', 'gothic-dusk', 'amigurumi', 'sb'],
  ['Corn on the cob', 'corn cob', 'bobbled kernels in a peeled-back husk', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Beetroot', 'beetroot', 'a deep magenta root with a wiry tail', 'gothic-dusk', 'amigurumi', 'sb'],
  ['Garlic bulb', 'garlic', 'papery lobes and a twisted neck', 'elegant-mono', 'amigurumi', 'sb'],
  ['Lemon and leaf', 'lemon', 'a dimpled lemon with one glossy leaf', 'bright-pop', 'amigurumi', 'sb'],
  ['Pomegranate', 'pomegranate', 'a crowned fruit split to show seeds', 'gothic-dusk', 'amigurumi', 'ma'],
  ['Fig', 'fig', 'a purple teardrop cut to a pink middle', 'gothic-dusk', 'amigurumi', 'sb'],
  ['Bunch of grapes', 'grapes', 'a cluster of small balls on a stem', 'gothic-dusk', 'amigurumi', 'mi'],
  ['Dragon fruit', 'dragon fruit', 'pink skin with green flames and a spotted middle', 'bright-pop', 'amigurumi', 'ma'],
  ['Blackberry', 'blackberry', 'a bobbled berry with a green calyx', 'mushroom-woodland', 'amigurumi', 'sb'],
  // ── Plants ──
  ['Monstera in a pot', 'monstera', 'split leaves standing out of a terracotta pot', 'boho-earth', 'amigurumi', 'ma'],
  ['Aloe vera pot', 'aloe', 'thick toothed leaves in a small pot', 'scandi-calm', 'amigurumi', 'mi'],
  ['String of pearls', 'string of pearls', 'trailing strands of little green beads', 'scandi-calm', 'amigurumi', 'mi'],
  ['Snake plant', 'snake plant', 'upright banded blades in a cylinder pot', 'boho-earth', 'amigurumi', 'mi'],
  ['Prickly pear', 'prickly pear', 'flat paddles with a bright bloom on top', 'bright-pop', 'amigurumi', 'mi'],
  ['Bonsai tree', 'bonsai', 'a gnarled trunk and clouds of foliage', 'elegant-mono', 'amigurumi', 'ma'],
  ['Fern in a pot', 'fern', 'unfurling fronds with a curled tip', 'wildflower-meadow', 'amigurumi', 'ma'],
  ['Dandelion clock', 'dandelion clock', 'a loop-stitch seed head on a stem', 'wildflower-meadow', 'amigurumi', 'mi'],
  ['Foxglove spire', 'foxglove', 'a stem of speckled bells in graded pinks', 'wildflower-meadow', 'amigurumi', 'ma'],
  ['Lavender bundle', 'lavender', 'tied stems with bobbled flower heads', 'vintage-tea', 'amigurumi', 'sb'],
  ['Thistle', 'thistle', 'a spiky purple head on a grey stem', 'boho-earth', 'amigurumi', 'mi'],
  ['Conker and case', 'conker', 'a glossy conker in a split spiny case', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Pinecone', 'pinecone', 'overlapping scales worked in a spiral', 'winter-frost', 'amigurumi', 'mi'],
  ['Chanterelle', 'chanterelle', 'a wavy gold funnel with ridged gills', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Snowdrop', 'snowdrop', 'a nodding white bell on a green stem', 'winter-frost', 'amigurumi', 'sb'],
  ['Tulip trio', 'tulips', 'three cupped blooms tied with twine', 'candy-kawaii', 'amigurumi', 'sb'],
  ['Peony head', 'peony', 'a fat ruffled bloom in blush pink', 'vintage-tea', 'amigurumi', 'ma'],
  ['Sprig of holly', 'holly', 'spined leaves and three red berries', 'winter-frost', 'amigurumi', 'sb'],
  // ── Objects ──
  ['Watering can', 'watering can', 'a rose-headed spout and a curved handle', 'wildflower-meadow', 'amigurumi', 'mi'],
  ['Wellington boot', 'wellington boot', 'a stubby boot with a daisy tucked in', 'bright-pop', 'amigurumi', 'mi'],
  ['Little umbrella', 'umbrella', 'a domed canopy and a crook handle', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Alarm clock', 'alarm clock', 'two bells on top and stitched hands', 'vintage-tea', 'amigurumi', 'mi'],
  ['Gramophone', 'gramophone', 'a flared horn on a little wooden box', 'vintage-tea', 'amigurumi', 'ma'],
  ['Typewriter', 'typewriter', 'a bobbled keyboard and a paper roll', 'elegant-mono', 'amigurumi', 'ma'],
  ['Sewing machine', 'sewing machine', 'a curved arm, a wheel and a spool', 'vintage-tea', 'amigurumi', 'ma'],
  ['Ball of yarn and hook', 'ball of yarn', 'a wound ball with a hook through it', 'candy-kawaii', 'amigurumi', 'sb'],
  ['Storm lantern', 'lantern', 'a glass body with a wire handle', 'gothic-dusk', 'amigurumi', 'mi'],
  ['Post box', 'post box', 'a red pillar box with a slot and a crown', 'bright-pop', 'amigurumi', 'mi'],
  ['Red phone box', 'phone box', 'a red box with stitched glazing bars', 'bright-pop', 'amigurumi', 'ma'],
  ['Double decker bus', 'double decker bus', 'two rows of windows and a rounded front', 'bright-pop', 'amigurumi', 'ma'],
  ['Little tractor', 'tractor', 'a big back wheel and a chunky cab', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Fire engine', 'fire engine', 'a ladder on top and a bell at the front', 'bright-pop', 'amigurumi', 'ma'],
  ['Submarine', 'submarine', 'a periscope and three porthole circles', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Lighthouse', 'lighthouse', 'red and white bands and a glowing top', 'coastal-breeze', 'amigurumi', 'ma'],
  ['Windmill', 'windmill', 'four sails on a white tower', 'scandi-calm', 'amigurumi', 'ma'],
  ['Shepherd hut', 'shepherd hut', 'a curved roof, a stable door and wheels', 'scandi-calm', 'amigurumi', 'ma'],
  ['Camper van', 'camper van', 'a split screen and a striped awning', 'bright-pop', 'amigurumi', 'ma'],
  ['Campfire', 'campfire', 'stacked logs with flame points', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Snow globe', 'snow globe', 'a dome on a base with a tiny tree inside', 'winter-frost', 'amigurumi', 'ma'],
  ['Music box', 'music box', 'a lidded box with a spinning figure', 'elegant-mono', 'amigurumi', 'ma'],
  ['Ballet shoe pair', 'ballet shoes', 'satin-look shoes with ribbon ties', 'nursery-pastel', 'amigurumi', 'mi'],
  ['Ukulele', 'ukulele', 'a small body, a sound hole and four strings', 'bright-pop', 'amigurumi', 'ma'],
  ['Accordion', 'accordion', 'a pleated bellows between two blocks', 'boho-earth', 'amigurumi', 'ma'],
  ['Rubber duck', 'rubber duck', 'a smug yellow duck with an orange bill', 'bright-pop', 'amigurumi', 'sb'],
  ['Spinning top', 'spinning top', 'a striped cone with a wooden peg', 'candy-kawaii', 'amigurumi', 'sb'],
  ['Paper plane', 'paper plane', 'crisp folded planes worked flat and stuffed', 'scandi-calm', 'amigurumi', 'sb'],
  ['Tin robot', 'robot', 'a boxy body, dial eyes and bendy arms', 'elegant-mono', 'amigurumi', 'ma'],
  ['Satellite', 'satellite', 'a body with two panel wings and a dish', 'celestial-night', 'amigurumi', 'ma'],
  ['Constellation cushioned star', 'constellation', 'a star cluster joined by stitched lines', 'celestial-night', 'amigurumi', 'mi'],
  ['Storm cloud', 'storm cloud', 'a grey cloud with a lightning bolt below', 'gothic-dusk', 'amigurumi', 'sb'],
  ['Hot water bottle', 'hot water bottle', 'a stitched cover with a ribbed neck', 'nursery-pastel', 'amigurumi', 'mi'],
  ['Tea trolley cake stand', 'cake stand', 'two tiers with three little cakes', 'vintage-tea', 'amigurumi', 'ma'],
  // ── Folklore and fantasy ──
  ['Hedge pixie', 'pixie', 'a pointed hat and curled leather shoes', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Selkie', 'selkie', 'a seal-skin cloak over a small figure', 'coastal-breeze', 'amigurumi', 'ma'],
  ['Kelpie', 'kelpie', 'a water horse with a weedy mane', 'gothic-dusk', 'amigurumi', 'ma'],
  ['Moss troll', 'troll', 'a lumpy body with loop-stitch moss', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Cave goblin', 'goblin', 'big ears, a pointed nose and a lantern', 'gothic-dusk', 'amigurumi', 'ma'],
  ['Hollow-tree dryad', 'dryad', 'a bark body with leaves for hair', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Yeti', 'yeti', 'a loop-stitch white body and blue feet', 'winter-frost', 'amigurumi', 'ma'],
  ['Jackalope', 'jackalope', 'a hare with a small set of antlers', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Rooftop gargoyle', 'gargoyle', 'a hunched stone figure with folded wings', 'gothic-dusk', 'amigurumi', 'ma'],
  ['Kitsune', 'kitsune', 'a white fox with three tails and a mask', 'elegant-mono', 'amigurumi', 'mw'],
  ['Tanuki', 'tanuki', 'a round racoon dog with a straw hat', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Qilin', 'qilin', 'a scaled deer with a single horn', 'celestial-night', 'amigurumi', 'mw'],
  ['Pegasus foal', 'pegasus', 'a small horse with feathered wings', 'nursery-pastel', 'amigurumi', 'ma'],
  ['Hippogriff', 'hippogriff', 'an eagle front and a horse back', 'boho-earth', 'amigurumi', 'mw'],
  ['Wyvern', 'wyvern', 'two legs, wide wings, a barbed tail', 'gothic-dusk', 'amigurumi', 'mw'],
  ['Kraken', 'kraken', 'a many-armed beast wrapped round a boat', 'coastal-breeze', 'amigurumi', 'ww'],
  ['Will-o-the-wisp', 'will o the wisp', 'a pale flame with a trailing tail', 'celestial-night', 'amigurumi', 'sb'],
  ['Bolt-necked monster', 'friendly monster', 'a green blockhead with mismatched eyes', 'gothic-dusk', 'amigurumi', 'mi'],
  ['Bandaged mummy', 'mummy', 'wrapped strips with one eye showing', 'boho-earth', 'amigurumi', 'mi'],
  ['Scarecrow', 'scarecrow', 'a straw fringe, a patched coat, a crow friend', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Snow queen', 'snow queen', 'a pale gown and a spiked ice crown', 'winter-frost', 'amigurumi', 'mw'],
  ['Tooth fairy', 'tooth fairy', 'a pocket on the back for a tooth', 'nursery-pastel', 'amigurumi', 'mi'],
  ['Sandman', 'sandman', 'a sleepy figure with a bag of stars', 'celestial-night', 'amigurumi', 'ma'],
  // ── Dressed character animals ──
  ['Otter in a raincoat', 'otter in a raincoat', 'a yellow mac and a matching sou wester', 'coastal-breeze', 'amigurumi', 'mw'],
  ['Mouse in a nightcap', 'mouse in a nightcap', 'a striped cap and a candle', 'nursery-pastel', 'amigurumi', 'ma'],
  ['Bear in a jumper', 'bear in a jumper', 'a removable fair isle jumper', 'winter-frost', 'amigurumi', 'mw'],
  ['Rabbit gardener', 'rabbit gardener', 'dungarees, a trowel and a carrot', 'wildflower-meadow', 'amigurumi', 'mw'],
  ['Fox in wellies', 'fox in wellies', 'four little boots and a puddle base', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Cat librarian', 'cat librarian', 'round glasses and a stack of books', 'vintage-tea', 'amigurumi', 'mw'],
  ['Sheep in a bobble hat', 'sheep in a bobble hat', 'loop-stitch fleece and a striped hat', 'winter-frost', 'amigurumi', 'ma'],
  ['Frog with a lily pad', 'frog with a lily pad', 'a frog sat on a flat green pad', 'wildflower-meadow', 'amigurumi', 'mi'],
  ['Pig baker', 'pig baker', 'an apron, a chef hat and a rolling pin', 'candy-kawaii', 'amigurumi', 'mw'],
  ['Hedgehog with a satchel', 'hedgehog with a satchel', 'bobble spines and a buckled bag', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Owl in a scholar cap', 'owl in a scholar cap', 'a mortarboard and a tiny scroll', 'elegant-mono', 'amigurumi', 'ma'],
  ['Duck with an umbrella', 'duck with an umbrella', 'a duck holding a spotted umbrella', 'bright-pop', 'amigurumi', 'ma'],
  ['Bee in a beanie', 'bee in a beanie', 'a fuzzy bee wearing a tiny hat', 'foxglove-autumn', 'amigurumi', 'sb'],
  ['Cat in a teacup', 'cat in a teacup', 'a curled cat asleep in a china cup', 'vintage-tea', 'amigurumi', 'ma'],
  ['Tortoise with a book', 'tortoise with a book', 'a shell like a reading nook', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Snail with a lantern', 'snail with a lantern', 'a spiral shell lit from inside', 'celestial-night', 'amigurumi', 'ma'],
  // ── Seasonal ──
  ['Bonfire night sparkler', 'sparkler', 'a stick with a burst of gold points', 'foxglove-autumn', 'amigurumi', 'sb'],
  ['Wassail apple', 'wassail apple', 'an apple with a ribbon and a clove star', 'winter-frost', 'amigurumi', 'sb'],
  ['May Day ribbon pole', 'maypole', 'a pole with hanging plaited ribbons', 'wildflower-meadow', 'amigurumi', 'ma'],
  ['Harvest wheat sheaf', 'wheat sheaf', 'tied stems with bobbled ears', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Advent candle', 'advent candle', 'a numbered candle with a flame tip', 'winter-frost', 'amigurumi', 'sb'],
  ['Nutcracker', 'nutcracker', 'a stiff little soldier with a lever jaw', 'winter-frost', 'amigurumi', 'mw'],
  ['Pancake day pan', 'frying pan', 'a pan with a flipping pancake', 'vintage-tea', 'amigurumi', 'mi'],
  ['Simnel cake', 'simnel cake', 'a marzipan top with eleven balls', 'vintage-tea', 'amigurumi', 'mi'],

  ['Acorn', 'acorn', 'this tiny acorn is one of the simplest amigurumi in the woodland collection', 'elegant-mono', 'amigurumi', 'sb', 'amigurumi-acorn'],
  ['Aeroplane', 'aeroplane', 'a white aeroplane with a long capsule fuselage, two flat oval wings, a cone nose, and two oval tail fins', 'boho-earth', 'amigurumi', 'mi', 'amigurumi-aeroplane'],
  ['Alien', 'alien', 'a green alien figure with a large sphere head, an oval body, two long capsule arms, and two cone antennae', 'vintage-tea', 'amigurumi', 'mi', 'amigurumi-alien'],
  ['Alpaca', 'alpaca', 'the alpaca has a long neck between the body and the small oval head', 'gothic-dusk', 'amigurumi', 'mi', 'amigurumi-alpaca'],
  ['Ankylosaurus', 'ankylosaurus', 'a green ankylosaurus with a wide oval armoured body, a sphere head, four short legs, and a club-tipped tail', 'coastal-breeze', 'amigurumi', 'mi', 'amigurumi-ankylosaurus'],
  ['Arctic fox', 'arctic fox', 'a white arctic fox with a large fluffy tail', 'winter-frost', 'amigurumi', 'mi', 'amigurumi-arctic-fox'],
  ['Astronaut', 'astronaut', 'an intermediate astronaut with a white sphere helmet, a cylinder body suit, and two capsule arms', 'wildflower-meadow', 'amigurumi', 'mi', 'amigurumi-astronaut'],
  ['Avocado', 'avocado', 'this avocado uses a pear body in two greens and an oval seed in brown', 'foxglove-autumn', 'amigurumi', 'sb', 'amigurumi-avocado'],
  ['Axolotl', 'axolotl', 'a pink axolotl made from a capsule body, six feathery cylinder gills on the head, and four short capsule legs', 'mushroom-woodland', 'amigurumi', 'mi', 'amigurumi-axolotl'],
  ['Baby Dinosaur Hatching Egg', 'baby dinosaur hatching egg', 'a hatching baby dinosaur worked as two pieces: a cracked egg shell and a small sphere head poking out of the top', 'nursery-pastel', 'amigurumi', 'mb', 'amigurumi-baby-dino'],
  ['Baby Elephant', 'baby elephant', 'a beginner-friendly baby elephant at approximately 12 cm finished height', 'celestial-night', 'amigurumi', 'mb', 'amigurumi-baby-elephant'],
  ['Baby seal', 'baby seal', 'a tiny white baby seal made from just two pieces: a sphere head and a small oval body', 'bright-pop', 'amigurumi', 'mb', 'amigurumi-baby-seal'],
  ['Badger', 'badger', 'the badger is a stocky, low-slung figure with a sphere head and an oval body, both worked in its signature grey-and-white pattern', 'candy-kawaii', 'amigurumi', 'mi', 'amigurumi-badger'],
  ['Bison', 'bison', 'the bison has a proportionally large head and a humped back', 'scandi-calm', 'amigurumi', 'mi', 'amigurumi-bison'],
  ['Boat', 'boat', 'a red boat made from an oval hull, a slim cylinder mast, and a flat oval sail', 'elegant-mono', 'amigurumi', 'mi', 'amigurumi-boat'],
  ['Book', 'book', 'a toy book made from a thick oval cover body and a slightly smaller flat oval page block', 'boho-earth', 'amigurumi', 'mb', 'amigurumi-book'],
  ['Brachiosaurus', 'brachiosaurus', 'a green brachiosaurus with a wide oval body and long cylinder neck. stuff the neck as you go to keep it upright', 'vintage-tea', 'amigurumi', 'mi', 'amigurumi-brachiosaurus'],
  ['Brown bear', 'brown bear', 'this bear is larger than the classic teddy and uses four legs for a seated pose', 'gothic-dusk', 'amigurumi', 'mi', 'amigurumi-brown-bear'],
  ['Budgerigar', 'budgerigar', 'materials about 35 g of bright green dk yarn, plus yellow for the face and blue for wing tips', 'coastal-breeze', 'amigurumi', 'mi', 'amigurumi-budgie'],
  ['Bumble bee', 'bumble bee', 'work the body as an oval in alternating yellow and black stripes using stripe carry', 'winter-frost', 'amigurumi', 'mb', 'amigurumi-bumble-bee'],
  ['Burger', 'burger', 'the burger has three pieces: a domed bun top, an oval patty, and a flat bun base', 'wildflower-meadow', 'amigurumi', 'mi', 'amigurumi-burger'],
  ['Cactus', 'cactus', 'a chunky green cactus with a tall cylinder body and two shorter cylinder arms', 'foxglove-autumn', 'amigurumi', 'mb', 'amigurumi-cactus'],
  ['Camera', 'camera', 'a toy camera built from an oval body, a cylinder lens, and a small oval viewfinder', 'mushroom-woodland', 'amigurumi', 'mi', 'amigurumi-camera'],
  ['Capybara', 'capybara', 'a brown capybara made from a rectangular oval head, a long oval body, and four short sturdy capsule legs', 'nursery-pastel', 'amigurumi', 'mi', 'amigurumi-capybara'],
  ['Car', 'car', 'a red toy car built from an oval body, four flat cylinder wheels, and two small cylinder headlights', 'celestial-night', 'amigurumi', 'mi', 'amigurumi-car'],
  ['Tabby Cat', 'tabby cat', 'a striped tabby cat with cone ears, a long tail, and a curious expression. worked in dk yarn at tight tension for a firm, poseable result', 'bright-pop', 'amigurumi', 'mi', 'amigurumi-cat'],
  ['Chameleon', 'chameleon', 'the chameleon uses a surface slip stitch ridge along the top of the body and tail to create the back crest', 'candy-kawaii', 'amigurumi', 'mi', 'amigurumi-chameleon'],
  ['Cheetah', 'cheetah', 'a sleek spotted cheetah made from a sphere head, an oval body, four slim capsule legs, and a long cylinder tail', 'scandi-calm', 'amigurumi', 'mi', 'amigurumi-cheetah'],
  ['Chick', 'chick', 'a tiny yellow chick that works up in about an hour', 'elegant-mono', 'amigurumi', 'sb', 'amigurumi-chick'],
  ['Chicken', 'chicken', 'a white or brown hen with a red comb and a yellow beak', 'boho-earth', 'amigurumi', 'mb', 'amigurumi-chicken'],
  ['Cloud', 'cloud', 'a white cloud made from three spheres joined together with a flat oval base', 'vintage-tea', 'amigurumi', 'mb', 'amigurumi-cloud'],
  ['Comet', 'comet', 'a beginner white comet with a sphere head and a streamer tail of looped yarn lengths', 'gothic-dusk', 'amigurumi', 'mb', 'amigurumi-comet'],
  ['Cow', 'cow', 'this holstein dairy cow uses a magic ring start for every piece', 'coastal-breeze', 'amigurumi', 'li', 'amigurumi-cow'],
  ['Crab', 'crab', 'a cheerful red crab built from a domed sphere body, two capsule claws, and six short cylinder legs', 'winter-frost', 'amigurumi', 'si', 'amigurumi-crab'],
  ['Crocodile', 'crocodile', 'this crocodile is built from five piece types: a sphere head, a capsule body, four short capsule legs', 'wildflower-meadow', 'amigurumi', 'li', 'amigurumi-crocodile'],
  ['Crow', 'crow', 'an all-black crow with a large sturdy beak and long wings', 'foxglove-autumn', 'amigurumi', 'mb', 'amigurumi-crow'],
  ['Cupcake', 'cupcake', 'this cupcake uses two pieces: a cylinder base for the cake case and a sphere swirl on top for the frosting', 'mushroom-woodland', 'amigurumi', 'sb', 'amigurumi-cupcake'],
  ['Fawn Deer', 'fawn deer', 'this fawn deer uses an oval head and a capsule body, with four slender wire-armature legs and cone antlers', 'nursery-pastel', 'amigurumi', 'mi', 'amigurumi-deer'],
  ['Diplodocus', 'diplodocus', 'a grey diplodocus with a wide oval body, a very long cylinder neck, a very long tapered cylinder tail, and a small sphere head', 'celestial-night', 'amigurumi', 'li', 'amigurumi-diplodocus'],
  ['Corgi', 'corgi', 'materials about 75 g of golden-orange dk yarn, plus cream for the muzzle and belly', 'bright-pop', 'amigurumi', 'mi', 'amigurumi-dog-corgi'],
  ['Dachshund', 'dachshund', 'materials around 70 g of brown dk-weight yarn', 'candy-kawaii', 'amigurumi', 'mi', 'amigurumi-dog-dachshund'],
  ['Golden Labrador', 'golden labrador', 'materials about 80 g of golden dk-weight yarn plus a small amount of dark brown for nose embroidery', 'scandi-calm', 'amigurumi', 'mi', 'amigurumi-dog-labrador'],
  ['Dolphin', 'dolphin', 'a streamlined dolphin made from a capsule body, cone snout, and two flat oval flippers', 'elegant-mono', 'amigurumi', 'mi', 'amigurumi-dolphin'],
  ['Donkey', 'donkey', 'a grey donkey with a short yarn mane and long capsule ears', 'boho-earth', 'amigurumi', 'li', 'amigurumi-donkey'],
  ['Donut', 'donut', 'a donut (torus) in amigurumi is made as a stuffed tube joined end to end', 'vintage-tea', 'amigurumi', 'mi', 'amigurumi-donut'],
  ['Dragon', 'dragon', 'work each piece using a magic ring start in green dk yarn on a 3.5 mm hook', 'gothic-dusk', 'amigurumi', 'mi', 'amigurumi-dragon'],
  ['Dragonfly', 'dragonfly', 'work the body as a capsule body', 'coastal-breeze', 'amigurumi', 'mi', 'amigurumi-dragonfly'],
  ['Duck', 'duck', 'a yellow duckling with an orange bill', 'winter-frost', 'amigurumi', 'mb', 'amigurumi-duck'],
  ['Eagle', 'eagle', 'a bald eagle with a white head, brown body, and large capsule wings', 'wildflower-meadow', 'amigurumi', 'mi', 'amigurumi-eagle'],
  ['Echidna', 'echidna', 'a brown echidna with a sphere head, an oval body covered in spike texture, and a narrow cone beak', 'foxglove-autumn', 'amigurumi', 'mi', 'amigurumi-echidna'],
  ['Fairy', 'fairy', 'work the head and body in a skin-tone or main colour dk yarn', 'mushroom-woodland', 'amigurumi', 'mi', 'amigurumi-fairy'],
  ['Flamingo', 'flamingo', 'this tall flamingo stands on two long legs thanks to a wire armature threaded through each leg before stuffing', 'nursery-pastel', 'amigurumi', 'li', 'amigurumi-flamingo'],
  ['Woodland Fox', 'woodland fox', 'a five-piece red and white fox with a pear-shaped body, fluffy tail, and pointed nose cone. colour changes create the classic muzzle and chest markings', 'celestial-night', 'amigurumi', 'mi', 'amigurumi-fox'],
  ['Gecko', 'gecko', 'this gecko has an oval body, sphere head, four slim legs, and a cylinder tail', 'bright-pop', 'amigurumi', 'mb', 'amigurumi-gecko'],
  ['Giraffe', 'giraffe', 'the giraffe stands on four capsule legs attached to a cylinder body', 'candy-kawaii', 'amigurumi', 'li', 'amigurumi-giraffe'],
  ['Goat', 'goat', 'a white goat with cone horns and a pointed beard', 'scandi-calm', 'amigurumi', 'mi', 'amigurumi-goat'],
  ['Goldfish', 'goldfish', 'materials about 40 g of bright orange dk yarn plus white for the belly', 'elegant-mono', 'amigurumi', 'mi', 'amigurumi-goldfish'],
  ['Gorilla', 'gorilla', 'a stocky black gorilla with a large sphere head, oval body, two long capsule arms, and two short capsule legs', 'boho-earth', 'amigurumi', 'mi', 'amigurumi-gorilla'],
  ['Griffin', 'griffin', 'the griffin combines eagle and lion elements', 'vintage-tea', 'amigurumi', 'la', 'amigurumi-griffin'],
  ['Grizzly bear', 'grizzly bear', 'the grizzly is posed standing upright with arms raised above the body', 'gothic-dusk', 'amigurumi', 'mi', 'amigurumi-grizzly-bear'],
  ['Guinea Pig', 'guinea pig', 'materials about 65 g of dk yarn in two or three colours for a patchy coat', 'coastal-breeze', 'amigurumi', 'mi', 'amigurumi-guinea-pig'],
  ['Hamster', 'hamster', 'materials about 55 g of sandy or golden dk yarn plus a small amount of cream for the belly', 'winter-frost', 'amigurumi', 'mi', 'amigurumi-hamster'],
  ['Heart', 'heart', 'a classic heart shape made from two sphere lobes joined side by side at the top, with a cone point base that tapers to the bottom tip', 'wildflower-meadow', 'amigurumi', 'mb', 'amigurumi-heart'],
  ['Hedgehog', 'hedgehog', 'this plump hedgehog uses spike stitch over the back half of the body to mimic spines', 'foxglove-autumn', 'amigurumi', 'mi', 'amigurumi-hedgehog'],
  ['Highland cow', 'highland cow', 'the signature feature of this highland cow is the shaggy forehead fringe', 'mushroom-woodland', 'amigurumi', 'mi', 'amigurumi-highland-cow'],
  ['Hippo', 'hippo', 'a chunky grey hippo built from a large sphere head, an oval body, four short capsule legs, and two small cone ears', 'nursery-pastel', 'amigurumi', 'mi', 'amigurumi-hippo'],
  ['Horse', 'horse', 'a sturdy brown horse with a yarn mane and tail', 'celestial-night', 'amigurumi', 'li', 'amigurumi-horse'],
  ['Hot Air Balloon', 'hot air balloon', 'a hot air balloon made from a large sphere balloon and a small open cylinder basket', 'bright-pop', 'amigurumi', 'mi', 'amigurumi-hot-air-balloon'],
  ['House', 'house', 'a toy house built from a cylinder wall section, a cone roof, and a flat oval door panel', 'candy-kawaii', 'amigurumi', 'mi', 'amigurumi-house'],
  ['Hummingbird', 'hummingbird', 'a tiny hummingbird worked entirely in small pieces', 'scandi-calm', 'amigurumi', 'sb', 'amigurumi-hummingbird'],
  ['Hyena', 'hyena', 'a tawny spotted hyena made from a sphere head, oval body, and four capsule legs', 'elegant-mono', 'amigurumi', 'mi', 'amigurumi-hyena'],
  ['Ice cream cone', 'ice cream cone', 'the ice cream cone has two pieces: a sphere scoop and a cone', 'boho-earth', 'amigurumi', 'sb', 'amigurumi-ice-cream-cone'],
  ['Iguana', 'iguana', 'this iguana has an oval body, sphere head, four short legs, a long cone tail', 'vintage-tea', 'amigurumi', 'li', 'amigurumi-iguana'],
  ['Jellyfish', 'jellyfish', 'a beginner-friendly pink jellyfish with a sphere bell and six long cylinder tentacles', 'gothic-dusk', 'amigurumi', 'sb', 'amigurumi-jellyfish'],
  ['Kangaroo', 'kangaroo', 'a brown kangaroo with a sphere head, oval body, long capsule legs, and an open-top cylinder joey pocket on the belly', 'coastal-breeze', 'amigurumi', 'mi', 'amigurumi-kangaroo'],
  ['Kitten', 'kitten', 'this kitten is designed for beginners', 'winter-frost', 'amigurumi', 'mb', 'amigurumi-kitten'],
  ['Kiwi', 'kiwi', 'a compact kiwi bird (apteryx) from new zealand, famous for its round body, tiny wings, and long slender beak', 'wildflower-meadow', 'amigurumi', 'mb', 'amigurumi-kiwi'],
  ['Koala', 'koala', 'a grey koala made from a large sphere head, an oval body, two wide oval ears, and two capsule arms', 'foxglove-autumn', 'amigurumi', 'mi', 'amigurumi-koala'],
  ['Komodo dragon', 'komodo dragon', 'this komodo dragon has an oval head, a large capsule body, four sturdy legs, and a thick tail', 'mushroom-woodland', 'amigurumi', 'li', 'amigurumi-komodo-dragon'],
  ['Ladybird', 'ladybird', 'start the body with a magic ring', 'nursery-pastel', 'amigurumi', 'sb', 'amigurumi-ladybird'],
  ['Autumn Leaf', 'autumn leaf', 'an autumn leaf in russet or golden orange, built from a stuffed oval body with a slim cylinder stem', 'celestial-night', 'amigurumi', 'mb', 'amigurumi-leaf'],
  ['Lion', 'lion', 'the mane is the defining feature', 'bright-pop', 'amigurumi', 'mi', 'amigurumi-lion'],
  ['Llama', 'llama', 'the llama uses a longer neck than the alpaca', 'candy-kawaii', 'amigurumi', 'mi', 'amigurumi-llama'],
  ['Lobster', 'lobster', 'a bold red lobster built from an oval body, two large capsule claws, and six slim cylinder legs', 'scandi-calm', 'amigurumi', 'mi', 'amigurumi-lobster'],
  ['Meerkat', 'meerkat', 'an alert meerkat standing upright', 'elegant-mono', 'amigurumi', 'mi', 'amigurumi-meerkat'],
  ['Mermaid', 'mermaid', 'work the head and body in a skin-tone dk yarn and the tail pieces in teal or turquoise', 'boho-earth', 'amigurumi', 'mi', 'amigurumi-mermaid'],
  ['Mini avocado keychain', 'mini avocado keychain', 'outer body in dark green yarn, start with a magic ring', 'vintage-tea', 'amigurumi', 'sb', 'amigurumi-mini-avocado'],
  ['Mini bear keychain', 'mini bear keychain', 'head start with a magic ring', 'gothic-dusk', 'amigurumi', 'sb', 'amigurumi-mini-bear'],
  ['Mini bee keychain', 'mini bee keychain', 'body in yellow yarn, start with a magic ring', 'coastal-breeze', 'amigurumi', 'sb', 'amigurumi-mini-bee'],
  ['Mini bunny keychain', 'mini bunny keychain', 'head start with a magic ring', 'winter-frost', 'amigurumi', 'sb', 'amigurumi-mini-bunny'],
  ['Mini cat keychain', 'mini cat keychain', 'head start with a magic ring', 'wildflower-meadow', 'amigurumi', 'sb', 'amigurumi-mini-cat'],
  ['Mini ghost keychain', 'mini ghost keychain', 'body in white yarn, start with a magic ring', 'foxglove-autumn', 'amigurumi', 'sb', 'amigurumi-mini-ghost'],
  ['Mini heart keychain', 'mini heart keychain', 'halves (make 2) start with a magic ring', 'mushroom-woodland', 'amigurumi', 'sb', 'amigurumi-mini-heart'],
  ['Mini mushroom keychain', 'mini mushroom keychain', 'cap in red yarn, start with a magic ring', 'nursery-pastel', 'amigurumi', 'sb', 'amigurumi-mini-mushroom'],
  ['Mini star keychain', 'mini star keychain', 'points (make 5) start with a magic ring', 'celestial-night', 'amigurumi', 'sb', 'amigurumi-mini-star'],
  ['Mini whale keychain', 'mini whale keychain', 'body in blue yarn, start with a magic ring', 'bright-pop', 'amigurumi', 'sb', 'amigurumi-mini-whale'],
  ['Monkey', 'monkey', 'the monkey sits on a pear-shaped body', 'candy-kawaii', 'amigurumi', 'mi', 'amigurumi-monkey'],
  ['Moon', 'moon', 'a beginner white sphere moon with crater texture added after assembly', 'scandi-calm', 'amigurumi', 'mb', 'amigurumi-moon'],
  ['Woodland Mouse', 'woodland mouse', 'this small grey wood mouse has a round sphere head, a pear-shaped body, and two flat cone ears', 'elegant-mono', 'amigurumi', 'mi', 'amigurumi-mouse-woodland'],
  ['Red Spotted Mushroom', 'red spotted mushroom', 'this cheerful red-spotted mushroom is not an animal but a favourite woodland accent piece', 'boho-earth', 'amigurumi', 'mb', 'amigurumi-mushroom'],
  ['Newt', 'newt', 'this newt has a capsule body, sphere head, four short legs, and a cylinder tail', 'vintage-tea', 'amigurumi', 'mb', 'amigurumi-newt'],
  ['Octopus', 'octopus', 'a beginner-friendly octopus: one sphere head and eight short cylinder tentacles', 'gothic-dusk', 'amigurumi', 'sb', 'amigurumi-octopus'],
  ['Ostrich', 'ostrich', 'a tall grey ostrich with a small sphere head, a long cylinder neck, an oval body, and two long cylinder legs', 'coastal-breeze', 'amigurumi', 'li', 'amigurumi-ostrich'],
  ['Woodland Owl', 'woodland owl', 'this round brown owl has a sphere head and an oval body, with wing ovals and a small beak cone attached', 'winter-frost', 'amigurumi', 'mi', 'amigurumi-owl'],
  ['Pachycephalosaurus', 'pachycephalosaurus', 'a green pachycephalosaurus with its signature oversized domed head, an oval body, two stocky back legs, and two small front arms', 'wildflower-meadow', 'amigurumi', 'mi', 'amigurumi-pachycephalosaurus'],
  ['Panda', 'panda', 'a giant panda worked in black and white dk yarn', 'foxglove-autumn', 'amigurumi', 'mi', 'amigurumi-panda'],
  ['Parrot', 'parrot', 'the parrot is worked in multiple bright colours using colour changes for the wing and tail feather sections', 'mushroom-woodland', 'amigurumi', 'mi', 'amigurumi-parrot'],
  ['Peacock', 'peacock', 'a jewel-toned peacock with five individual tail feathers fanned out behind the body', 'nursery-pastel', 'amigurumi', 'ma', 'amigurumi-peacock'],
  ['Pelican', 'pelican', 'a white pelican with its distinctive large pouch beak worked as a wide cylinder attached below the head', 'celestial-night', 'amigurumi', 'mi', 'amigurumi-pelican'],
  ['Penguin', 'penguin', 'a black and white penguin with an orange beak and feet', 'bright-pop', 'amigurumi', 'mi', 'amigurumi-penguin'],
  ['Phoenix', 'phoenix', 'work the body and wings using a magic ring start', 'candy-kawaii', 'amigurumi', 'li', 'amigurumi-phoenix'],
  ['Pig', 'pig', 'a round pink pig with a disc snout and a curly tail', 'scandi-calm', 'amigurumi', 'mb', 'amigurumi-pig'],
  ['Pigeon', 'pigeon', 'a plump city pigeon in grey and white dk', 'elegant-mono', 'amigurumi', 'mb', 'amigurumi-pigeon'],
  ['Pine Tree', 'pine tree', 'a classic pine tree with a tall dark green cone canopy and a short brown cylinder trunk', 'boho-earth', 'amigurumi', 'mb', 'amigurumi-pine-tree'],
  ['Pineapple', 'pineapple', 'the pineapple has an oval body in yellow and a short cylinder crown base in green', 'vintage-tea', 'amigurumi', 'sb', 'amigurumi-pineapple'],
  ['Pizza slice', 'pizza slice', 'a pizza slice is shaped as a wide, flat cone', 'gothic-dusk', 'amigurumi', 'mi', 'amigurumi-pizza-slice'],
  ['Planet Earth', 'planet earth', 'a beginner sphere planet earth worked in blue and green', 'coastal-breeze', 'amigurumi', 'mb', 'amigurumi-planet-earth'],
  ['Platypus', 'platypus', 'a brown platypus built from an oval body, a flat oval bill, and a broad flat capsule tail', 'winter-frost', 'amigurumi', 'mi', 'amigurumi-platypus'],
  ['Polar bear', 'polar bear', 'a white polar bear worked entirely in cream or white dk', 'wildflower-meadow', 'amigurumi', 'li', 'amigurumi-polar-bear'],
  ['Pterodactyl', 'pterodactyl', 'a brown pterodactyl with an oval body, two long capsule wings, a sphere head, and a cone beak', 'foxglove-autumn', 'amigurumi', 'mi', 'amigurumi-pterodactyl'],
  ['Puffin', 'puffin', 'a black and white puffin with a large striped orange beak', 'mushroom-woodland', 'amigurumi', 'mi', 'amigurumi-puffin'],
  ['Quokka', 'quokka', 'a small round quokka worked in warm brown dk yarn', 'nursery-pastel', 'amigurumi', 'mb', 'amigurumi-quokka'],
  ['Farm rabbit', 'farm rabbit', 'a seated white farm rabbit with long capsule ears and a fluffy sphere tail', 'celestial-night', 'amigurumi', 'mb', 'amigurumi-rabbit-farm'],
  ['Rainbow', 'rainbow', 'a cheerful rainbow arc worked in six colour stripes along a stuffed cylinder, with a small white cloud ball at each end', 'bright-pop', 'amigurumi', 'mb', 'amigurumi-rainbow'],
  ['Raindrop', 'raindrop', 'a compact blue raindrop about 7 cm tall, made from a sphere top and a cone bottom', 'candy-kawaii', 'amigurumi', 'sb', 'amigurumi-raindrop'],
  ['Red Panda', 'red panda', 'a red panda worked in rust and cream dk yarn', 'scandi-calm', 'amigurumi', 'mi', 'amigurumi-red-panda'],
  ['Reindeer', 'reindeer', 'a brown reindeer with cone antlers and a round red or brown snout', 'elegant-mono', 'amigurumi', 'li', 'amigurumi-reindeer'],
  ['Rhino', 'rhino', 'a solid grey rhino made from an oval head, a large oval body, four sturdy capsule legs, and a cone horn', 'boho-earth', 'amigurumi', 'mi', 'amigurumi-rhino'],
  ['Robin', 'robin', 'this cheerful robin has a warm colour-change breast panel worked in rounds', 'vintage-tea', 'amigurumi', 'mb', 'amigurumi-robin'],
  ['Rocket Ship', 'rocket ship', 'an intermediate rocket ship made from a cylinder body, a cone nose, and four small cone fins', 'gothic-dusk', 'amigurumi', 'mi', 'amigurumi-rocket-ship'],
  ['Rose', 'rose', 'a layered red rose built from a small sphere bud, five inner spiral cone petals, and seven wider outer cone petals', 'coastal-breeze', 'amigurumi', 'mi', 'amigurumi-rose'],
  ['Salamander', 'salamander', 'this salamander has a capsule body, sphere head, and four short legs', 'winter-frost', 'amigurumi', 'mb', 'amigurumi-salamander'],
  ['Saturn', 'saturn', 'a golden sphere planet with a flat oval ring sewn around its equator', 'wildflower-meadow', 'amigurumi', 'mi', 'amigurumi-saturn'],
  ['Seahorse', 'seahorse', 'a yellow seahorse made from a pear-shaped body, a small sphere head, and a narrow cone snout', 'foxglove-autumn', 'amigurumi', 'mi', 'amigurumi-seahorse'],
  ['Shark', 'shark', 'a grey shark with a long capsule body, a tall dorsal fin, and two cone tail fins', 'mushroom-woodland', 'amigurumi', 'mi', 'amigurumi-shark'],
  ['Sheep', 'sheep', 'a fluffy white sheep with a textured bobble stitch body and a darker face', 'nursery-pastel', 'amigurumi', 'mi', 'amigurumi-sheep'],
  ['Shooting Star', 'shooting star', 'a beginner yellow shooting star made from a small sphere centre and five cone points', 'celestial-night', 'amigurumi', 'mb', 'amigurumi-shooting-star'],
  ['Sloth', 'sloth', 'the sloth is designed to hang from a twig or dowel', 'bright-pop', 'amigurumi', 'mb', 'amigurumi-sloth'],
  ['Snail', 'snail', 'this garden snail has a pear-shaped body curling upward at the front and a sphere shell mounted on its back', 'candy-kawaii', 'amigurumi', 'mi', 'amigurumi-snail'],
  ['Python snake', 'python snake', 'this python is made from six oval body sections joined in a chain, plus a sphere head and a cone tongue', 'scandi-calm', 'amigurumi', 'li', 'amigurumi-snake-python'],
  ['Snowflake', 'snowflake', 'a flat white snowflake with a small sphere centre disc and six cone arms radiating outward at equal intervals', 'elegant-mono', 'amigurumi', 'mi', 'amigurumi-snowflake'],
  ['Snowman', 'snowman', 'a classic three-ball snowman with a top hat and a carrot nose', 'boho-earth', 'amigurumi', 'lb', 'amigurumi-snowman'],
  ['Snowy owl', 'snowy owl', 'a white snowy owl with large yellow eyes and capsule wings', 'vintage-tea', 'amigurumi', 'mi', 'amigurumi-snowy-owl'],
  ['Spider', 'spider', 'work a large body sphere and a smaller head sphere', 'gothic-dusk', 'amigurumi', 'mb', 'amigurumi-spider'],
  ['Squirrel', 'squirrel', 'this bushy-tailed squirrel has a sphere head and a pear body worked in warm brown dk', 'coastal-breeze', 'amigurumi', 'mi', 'amigurumi-squirrel'],
  ['Starfish', 'starfish', 'a five-pointed orange starfish made from a small sphere centre and five cone arms', 'winter-frost', 'amigurumi', 'mi', 'amigurumi-starfish'],
  ['Stegosaurus', 'stegosaurus', 'a green stegosaurus with a wide oval body, small sphere head, four capsule legs, and six flat cone spine plates running along the back', 'wildflower-meadow', 'amigurumi', 'mi', 'amigurumi-stegosaurus'],
  ['Strawberry', 'strawberry', 'this strawberry has two pieces: a sphere body in red and a cone leaf cap in green', 'foxglove-autumn', 'amigurumi', 'sb', 'amigurumi-strawberry'],
  ['Sun bear', 'sun bear', 'the sun bear is one of the smaller bears', 'mushroom-woodland', 'amigurumi', 'mb', 'amigurumi-sun-bear'],
  ['Sunflower', 'sunflower', 'a bright sunflower made from a sphere centre in dark brown or gold, twelve flat oval petals in yellow, and a slim green cylinder stem', 'nursery-pastel', 'amigurumi', 'mb', 'amigurumi-sunflower'],
  ['Sushi roll', 'sushi roll', 'this sushi roll uses a short black cylinder body and a small oval filling', 'celestial-night', 'amigurumi', 'sb', 'amigurumi-sushi-roll'],
  ['Swan', 'swan', 'a graceful white swan with a long curved neck supported by a wire armature', 'bright-pop', 'amigurumi', 'mi', 'amigurumi-swan'],
  ['T-Rex', 't-rex', 'a green t-rex built from five pieces: a sphere head, oval body, two tiny capsule arms, two larger capsule legs, and a tapered cylinder tail', 'candy-kawaii', 'amigurumi', 'mi', 'amigurumi-t-rex'],
  ['Teddy bear', 'teddy bear', 'this is a beginner-friendly bear built from simple shapes', 'scandi-calm', 'amigurumi', 'mb', 'amigurumi-teddy-bear'],
  ['Telephone', 'telephone', 'a classic old-style telephone made from an oval base body and a capsule handset', 'elegant-mono', 'amigurumi', 'mi', 'amigurumi-telephone'],
  ['Telescope', 'telescope', 'a dark blue cylinder telescope toy with a smaller cylinder eyepiece attached at one end', 'boho-earth', 'amigurumi', 'mi', 'amigurumi-telescope'],
  ['Toad', 'toad', 'this toad uses only three piece types: a sphere head, a large sphere body, and four short legs', 'vintage-tea', 'amigurumi', 'mb', 'amigurumi-toad'],
  ['Giant tortoise', 'giant tortoise', 'this tortoise centres on a large domed sphere shell', 'gothic-dusk', 'amigurumi', 'li', 'amigurumi-tortoise-giant'],
  ['Pet Tortoise', 'pet tortoise', 'materials about 60 g of dark green or brown dk yarn for the shell', 'coastal-breeze', 'amigurumi', 'mi', 'amigurumi-tortoise-pet'],
  ['Toucan', 'toucan', 'the beak is the centrepiece of this pattern', 'winter-frost', 'amigurumi', 'mi', 'amigurumi-toucan'],
  ['Train Engine', 'train engine', 'a blue train engine assembled from an oval body, four cylinder wheels, a cone chimney, and a small flattened sphere cab at the rear', 'wildflower-meadow', 'amigurumi', 'mi', 'amigurumi-train-engine'],
  ['Oak Tree', 'oak tree', 'a classic oak tree with a brown cylinder trunk and a large round green foliage ball', 'foxglove-autumn', 'amigurumi', 'mb', 'amigurumi-tree-oak'],
  ['Triceratops', 'triceratops', 'a green triceratops built from an oval head, oval body, three cone horns, and four capsule legs', 'mushroom-woodland', 'amigurumi', 'mi', 'amigurumi-triceratops'],
  ['Turtle', 'turtle', 'a green sea turtle with a rounded sphere body, a textured oval shell panel, and four flat capsule flippers', 'nursery-pastel', 'amigurumi', 'mi', 'amigurumi-turtle'],
  ['UFO', 'ufo', 'an intermediate silver ufo saucer with a teal dome on top', 'celestial-night', 'amigurumi', 'mi', 'amigurumi-ufo'],
  ['Unicorn', 'unicorn', 'work each piece in dk yarn using a 3.5 mm hook and a magic ring start', 'bright-pop', 'amigurumi', 'mi', 'amigurumi-unicorn'],
  ['Valentine bear', 'valentine bear', 'this valentine bear is a classic teddy silhouette worked in pink dk across seven pieces', 'candy-kawaii', 'amigurumi', 'mi', 'amigurumi-valentine-bear'],
  ['Velociraptor', 'velociraptor', 'an orange velociraptor with a sphere head, capsule body, two long capsule legs, and two cone sickle claws', 'scandi-calm', 'amigurumi', 'mi', 'amigurumi-velociraptor'],
  ['Walrus', 'walrus', 'a brown walrus with ivory cone tusks and flat flippers', 'elegant-mono', 'amigurumi', 'li', 'amigurumi-walrus'],
  ['Warthog', 'warthog', 'a compact brown warthog with a wide oval head, oval body, four short capsule legs, and two small cone tusks', 'boho-earth', 'amigurumi', 'mi', 'amigurumi-warthog'],
  ['Watermelon slice', 'watermelon slice', 'the slice is worked as the increase half of a sphere stopped at the equator, giving a dome of flesh', 'vintage-tea', 'amigurumi', 'mb', 'amigurumi-watermelon-slice'],
  ['Werewolf', 'werewolf', 'work all pieces in brown dk yarn', 'gothic-dusk', 'amigurumi', 'mi', 'amigurumi-werewolf'],
  ['Blue Whale', 'blue whale', 'this blue whale builds from three pieces: an oval body, two capsule flippers, and two oval tail flukes', 'coastal-breeze', 'amigurumi', 'mi', 'amigurumi-whale'],
  ['Wildebeest', 'wildebeest', 'a dark brown wildebeest (gnu) made from an oval head, a large oval body, four long capsule legs, and two curved cone horns', 'winter-frost', 'amigurumi', 'mi', 'amigurumi-wildebeest'],
  ['Witch', 'witch', 'work all pieces using a magic ring start', 'wildflower-meadow', 'amigurumi', 'mi', 'amigurumi-witch'],
  ['Wombat', 'wombat', 'a chunky brown wombat made from a wide sphere head, a generously stuffed oval body, and four short capsule legs', 'foxglove-autumn', 'amigurumi', 'mi', 'amigurumi-wombat'],
  ['Yak', 'yak', 'the yak coat is created by working loop stitch on every alternate round across both the body and the lower head', 'mushroom-woodland', 'amigurumi', 'mi', 'amigurumi-yak'],
  ['Zebra', 'zebra', 'the stripes are worked by switching yarn colours every 2 rounds', 'nursery-pastel', 'amigurumi', 'mi', 'amigurumi-zebra'],
]

/**
 * ANIMAL TOYS — the big huggable end of the toy range, as opposed to the small
 * collectible figures on the amigurumi shelf. Breed-led wherever it can be:
 * "border collie" is a query, "dog" is not.
 */
const ANIMAL_TOY: Row[] = [
  // ── Dogs ──
  ['Border collie', 'border collie', 'a white blaze and one ear up, one down', 'elegant-mono', 'amigurumi', 'mi'],
  ['Beagle pup', 'beagle', 'a tricolour coat and long soft ears', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Cocker spaniel', 'cocker spaniel', 'wavy loop-stitch ears down to the paws', 'vintage-tea', 'amigurumi', 'ma'],
  ['Toy poodle', 'poodle', 'bobble pompoms at the legs and tail', 'nursery-pastel', 'amigurumi', 'ma'],
  ['Pug', 'pug', 'a squashed muzzle and a curled tail', 'boho-earth', 'amigurumi', 'mi'],
  ['Dalmatian', 'dalmatian', 'a white body with hand-placed black spots', 'elegant-mono', 'amigurumi', 'ma'],
  ['Husky', 'husky', 'a masked face and a curled plume tail', 'winter-frost', 'amigurumi', 'ma'],
  ['Samoyed', 'samoyed', 'a loop-stitch white coat and a smiling mouth', 'winter-frost', 'amigurumi', 'ma'],
  ['Shiba inu', 'shiba inu', 'a curled tail and a cream mask', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Greyhound', 'greyhound', 'a deep chest, tucked waist and long legs', 'elegant-mono', 'amigurumi', 'ma'],
  ['Jack russell', 'jack russell', 'a patched eye and a stubby tail', 'bright-pop', 'amigurumi', 'mi'],
  ['Westie', 'west highland terrier', 'a white beard and pricked ears', 'winter-frost', 'amigurumi', 'mi'],
  ['Scottie dog', 'scottish terrier', 'a square black silhouette and a tartan collar', 'gothic-dusk', 'amigurumi', 'mi'],
  ['Yorkshire terrier', 'yorkshire terrier', 'a long silky coat and a topknot bow', 'vintage-tea', 'amigurumi', 'ma'],
  ['English bulldog', 'bulldog', 'a wide stance and a wrinkled brow', 'boho-earth', 'amigurumi', 'ma'],
  ['Great dane', 'great dane', 'a tall lanky body and folded ears', 'elegant-mono', 'amigurumi', 'ma'],
  ['Saint bernard', 'saint bernard', 'a barrel at the collar and a droopy face', 'winter-frost', 'amigurumi', 'ma'],
  ['Bernese mountain dog', 'bernese mountain dog', 'a tricolour coat and a broad chest', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['German shepherd', 'german shepherd', 'a black saddle and tall ears', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Golden retriever', 'golden retriever', 'a feathered tail and a tennis ball', 'vintage-tea', 'amigurumi', 'mi'],
  ['Basset hound', 'basset hound', 'ears longer than the legs', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Pomeranian', 'pomeranian', 'a loop-stitch pom of a body', 'candy-kawaii', 'amigurumi', 'ma'],
  ['Schnauzer', 'schnauzer', 'a bushy beard and thick eyebrows', 'scandi-calm', 'amigurumi', 'mi'],
  ['Cavalier spaniel', 'cavalier spaniel', 'chestnut patches and a soft muzzle', 'vintage-tea', 'amigurumi', 'mi'],
  ['Chihuahua', 'chihuahua', 'huge ears on a tiny frame, in a jumper', 'candy-kawaii', 'amigurumi', 'mi'],
  ['Old english sheepdog', 'old english sheepdog', 'a fringe over the eyes and a shaggy coat', 'scandi-calm', 'amigurumi', 'ma'],
  // ── Cats ──
  ['Siamese cat', 'siamese cat', 'dark points on a cream body, blue eyes', 'elegant-mono', 'amigurumi', 'mi'],
  ['Ragdoll cat', 'ragdoll cat', 'a floppy body that slumps when held', 'nursery-pastel', 'amigurumi', 'mi'],
  ['Maine coon', 'maine coon', 'ear tufts and a huge plume tail', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Bengal cat', 'bengal cat', 'a spotted coat and a lean stretch', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['British shorthair', 'british shorthair', 'a round blue-grey face and copper eyes', 'scandi-calm', 'amigurumi', 'mi'],
  ['Persian cat', 'persian cat', 'a flat face and a cloud of loop stitch', 'vintage-tea', 'amigurumi', 'ma'],
  ['Tortoiseshell cat', 'tortoiseshell cat', 'patched ginger and black in random blocks', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Ginger tom', 'ginger tom', 'a broad-cheeked marmalade cat, sat square', 'bright-pop', 'amigurumi', 'mi'],
  ['Tuxedo cat', 'tuxedo cat', 'a white bib and four white socks', 'elegant-mono', 'amigurumi', 'mi'],
  ['Russian blue', 'russian blue', 'a silver-grey coat and green eyes', 'scandi-calm', 'amigurumi', 'mi'],
  ['Sphynx cat', 'sphynx cat', 'a wrinkled bald body and a knitted vest', 'boho-earth', 'amigurumi', 'ma'],
  ['Norwegian forest cat', 'norwegian forest cat', 'a thick ruff and tufted paws', 'winter-frost', 'amigurumi', 'ma'],
  // ── Farm ──
  ['Jersey cow', 'jersey cow', 'a fawn coat, dark eyes and a brass bell', 'vintage-tea', 'amigurumi', 'mi'],
  ['Friesian cow', 'friesian cow', 'black and white patches placed by hand', 'elegant-mono', 'amigurumi', 'mi'],
  ['Herdwick sheep', 'herdwick sheep', 'a grey fleece and a white face', 'scandi-calm', 'amigurumi', 'mi'],
  ['Jacob sheep', 'jacob sheep', 'a spotted fleece and four horns', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Suffolk lamb', 'suffolk lamb', 'a black face and knobbly knees', 'nursery-pastel', 'amigurumi', 'mi'],
  ['Saddleback pig', 'saddleback pig', 'a white band across a black body', 'elegant-mono', 'amigurumi', 'mi'],
  ['Kunekune pig', 'kunekune pig', 'a round hairy pig with jaw tassels', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Billy goat', 'billy goat', 'curved horns and a wispy beard', 'boho-earth', 'amigurumi', 'mi'],
  ['Pygmy goat kid', 'pygmy goat', 'stumpy legs and a mischievous face', 'wildflower-meadow', 'amigurumi', 'mi'],
  ['Shire horse', 'shire horse', 'feathered hooves and a plaited mane', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Shetland pony', 'shetland pony', 'a long forelock over the eyes', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Appaloosa pony', 'appaloosa', 'a spotted rump and a striped hoof', 'boho-earth', 'amigurumi', 'ma'],
  ['Rocking horse', 'rocking horse', 'a dappled horse on curved rockers', 'vintage-tea', 'amigurumi', 'mw'],
  ['Cockerel', 'cockerel', 'a high comb and a sweep of tail feathers', 'bright-pop', 'amigurumi', 'ma'],
  ['Gosling', 'gosling', 'a soft yellow-green ball on flat feet', 'nursery-pastel', 'amigurumi', 'sb'],
  ['Farm cat on a bale', 'farm cat', 'a cat curled on a stitched straw bale', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Lop rabbit', 'lop rabbit', 'ears that hang past the chin', 'nursery-pastel', 'amigurumi', 'mi'],
  ['Dutch rabbit', 'dutch rabbit', 'a white blaze and a saddle of colour', 'scandi-calm', 'amigurumi', 'mi'],
  ['Angora rabbit', 'angora rabbit', 'a cloud of loop stitch with a hidden face', 'winter-frost', 'amigurumi', 'ma'],
  ['Sheepdog puppy', 'sheepdog puppy', 'oversized paws and a lolling tongue', 'scandi-calm', 'amigurumi', 'mi'],
  // ── Wild ──
  ['Black bear cub', 'black bear cub', 'a glossy dark coat and a tan muzzle', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Spectacled bear', 'spectacled bear', 'pale rings around both eyes', 'boho-earth', 'amigurumi', 'ma'],
  ['Sloth bear', 'sloth bear', 'a shaggy ruff and a long pale snout', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Caracal', 'caracal', 'tall black ear tufts and a sand coat', 'boho-earth', 'amigurumi', 'ma'],
  ['Serval', 'serval', 'long legs, big ears and bar-and-spot markings', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Ocelot', 'ocelot', 'chain-linked rosettes down the flanks', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Clouded leopard', 'clouded leopard', 'big cloud blotches and a very long tail', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Black panther', 'panther', 'a sleek dark cat with green eyes', 'gothic-dusk', 'amigurumi', 'mi'],
  ['Giant anteater', 'anteater', 'a tube snout and a banner of a tail', 'boho-earth', 'amigurumi', 'ma'],
  ['Numbat', 'numbat', 'white bars across a russet back', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Ringtail possum', 'possum', 'a curled prehensile tail and big eyes', 'scandi-calm', 'amigurumi', 'mi'],
  ['Kookaburra', 'kookaburra', 'a heavy beak and a barred blue wing', 'coastal-breeze', 'amigurumi', 'mi'],
  ['Cassowary', 'cassowary', 'a helmet casque and a blue neck', 'bright-pop', 'amigurumi', 'ma'],
  ['Dingo pup', 'dingo', 'a sandy coat and pricked ears', 'boho-earth', 'amigurumi', 'mi'],
  ['Orangutan', 'orangutan', 'long arms and a shaggy ginger coat', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Chimpanzee', 'chimpanzee', 'a soft pale face and long thumbs', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Gibbon', 'gibbon', 'arms long enough to hang from a shelf', 'scandi-calm', 'amigurumi', 'ma'],
  ['Mandrill', 'mandrill', 'a ridged blue and red face', 'bright-pop', 'amigurumi', 'ma'],
  ['Baboon', 'baboon', 'a long muzzle and a cape of loop stitch', 'boho-earth', 'amigurumi', 'ma'],
  ['Japanese macaque', 'macaque', 'a red face in a snow-white ruff', 'winter-frost', 'amigurumi', 'ma'],
  ['Proboscis monkey', 'proboscis monkey', 'a long soft nose and a pot belly', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Bush baby', 'bush baby', 'saucer eyes and a long fluffy tail', 'celestial-night', 'amigurumi', 'mi'],
  ['Bat-eared fox', 'bat eared fox', 'enormous ears on a slight body', 'boho-earth', 'amigurumi', 'mi'],
  ['Maned wolf', 'maned wolf', 'a russet coat on very long black legs', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Coati', 'coati', 'a banded tail held straight up', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Kinkajou', 'kinkajou', 'a curled tail and a round golden face', 'vintage-tea', 'amigurumi', 'mi'],
  ['Binturong', 'binturong', 'a shaggy black coat and white whiskers', 'gothic-dusk', 'amigurumi', 'ma'],
  ['Fossa', 'fossa', 'a lean russet body and a long straight tail', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Aye-aye', 'aye aye', 'huge ears and one long middle finger', 'gothic-dusk', 'amigurumi', 'ma'],
  ['Slow loris', 'slow loris', 'ringed eyes and a slow grip on a branch', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Wombat joey', 'wombat joey', 'a barrel body and a stubby nose', 'boho-earth', 'amigurumi', 'mi'],
  ['Bilby pair', 'bilby pair', 'two bilbies with linked tails', 'scandi-calm', 'amigurumi', 'ma'],
  ['Quoll', 'quoll', 'white spots on a russet coat', 'foxglove-autumn', 'amigurumi', 'mi'],
  ['Sunda pangolin', 'sunda pangolin', 'a curled armoured ball with a tail', 'boho-earth', 'amigurumi', 'ma'],
  ['Baby rhino', 'baby rhino', 'a soft nub of a horn and folded skin', 'scandi-calm', 'amigurumi', 'mi'],
  ['Baby tapir', 'baby tapir', 'a spotted and striped coat that fades', 'mushroom-woodland', 'amigurumi', 'mi'],
  ['Baby giraffe', 'baby giraffe', 'wobbly legs and ossicone bumps', 'nursery-pastel', 'amigurumi', 'ma'],
  ['Baby hippo', 'baby hippo', 'a wide mouth and stubby legs', 'nursery-pastel', 'amigurumi', 'mi'],
  ['Baby zebra', 'baby zebra', 'a soft brown-striped foal coat', 'scandi-calm', 'amigurumi', 'ma'],
  ['Baby elephant with a blanket', 'elephant with a blanket', 'a stitched saddle blanket over the back', 'boho-earth', 'amigurumi', 'ma'],
  // ── Prehistoric and imagined pets ──
  ['Dimetrodon', 'dimetrodon', 'a tall stitched sail down the back', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Parasaurolophus', 'parasaurolophus', 'a long swept-back crest', 'wildflower-meadow', 'amigurumi', 'ma'],
  ['Spinosaurus', 'spinosaurus', 'a crocodile snout and a spined sail', 'gothic-dusk', 'amigurumi', 'ma'],
  ['Iguanodon', 'iguanodon', 'thumb spikes and a heavy tail', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['Woolly mammoth', 'woolly mammoth', 'loop-stitch fur and curved tusks', 'winter-frost', 'amigurumi', 'ma'],
  ['Sabre-toothed cat', 'sabre toothed cat', 'two long fangs and a stub tail', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['Trilobite', 'trilobite', 'a ribbed flat shell in three lobes', 'boho-earth', 'amigurumi', 'mi'],
  ['Ammonite', 'ammonite', 'a ribbed spiral in stone colours', 'scandi-calm', 'amigurumi', 'mi'],
  ['Dodo', 'dodo', 'a plump grey bird with a hooked beak', 'vintage-tea', 'amigurumi', 'mi'],
  ['Thylacine', 'thylacine', 'a striped back and a stiff tail', 'foxglove-autumn', 'amigurumi', 'ma'],
  // ── Comfort-scale cuddlies ──
  ['Long-armed sloth cuddler', 'long armed sloth', 'arms that fasten round a child', 'scandi-calm', 'amigurumi', 'lw'],
  ['Weighted lap cat', 'weighted lap cat', 'a heavy-feeling cat that sits on a lap', 'vintage-tea', 'amigurumi', 'lw'],
  ['Giant floppy bunny', 'giant floppy bunny', 'ears as long as the body', 'nursery-pastel', 'amigurumi', 'lw'],
  ['Cushion-sized frog', 'cushion frog', 'a wide flat frog to sit on', 'wildflower-meadow', 'amigurumi', 'lw'],
  ['Snuggle fox roll', 'snuggle fox', 'a bolster fox with a wrapped tail', 'foxglove-autumn', 'amigurumi', 'lw'],
]

/**
 * DOLLS — human figures. Original characters only, never a named character or
 * a real person. The Tutorial library already has the fairy, the mermaid, the
 * gnome, the witch, the astronaut and Santa, so none of those come back.
 */
const DOLL: Row[] = [
  ['Wren the wildflower doll', 'wildflower doll', 'curly hair, a removable petal skirt, a daisy crown', 'wildflower-meadow', 'amigurumi', 'ww'],
  ['Marnie the gardener', 'gardener doll', 'dungarees, a trug of vegetables, muddy boots', 'wildflower-meadow', 'amigurumi', 'mw'],
  ['The lighthouse keeper', 'lighthouse keeper', 'an oilskin coat and a storm lamp', 'coastal-breeze', 'amigurumi', 'mw'],
  ['The village baker', 'baker doll', 'a flour-dusted apron and a bread basket', 'vintage-tea', 'amigurumi', 'ma'],
  ['The beekeeper', 'beekeeper doll', 'a veiled hat and a smoker, a bee on the sleeve', 'foxglove-autumn', 'amigurumi', 'mw'],
  ['The potter', 'potter doll', 'clay-streaked apron and a thrown bowl', 'boho-earth', 'amigurumi', 'ma'],
  ['The librarian', 'librarian doll', 'a cardigan, a stack of books, reading glasses', 'vintage-tea', 'amigurumi', 'ma'],
  ['The night nurse', 'nurse doll', 'a fob watch and a soft cap', 'winter-frost', 'amigurumi', 'ma'],
  ['The train guard', 'train guard doll', 'a peaked cap, a whistle and a flag', 'foxglove-autumn', 'amigurumi', 'ma'],
  ['The fisherwoman', 'fisherwoman doll', 'a gansey jumper and a creel of fish', 'coastal-breeze', 'amigurumi', 'mw'],
  ['The shepherd', 'shepherd doll', 'a crook, a felt hat and a lamb underarm', 'scandi-calm', 'amigurumi', 'mw'],
  ['The astronomer', 'astronomer doll', 'a star chart and a folding telescope', 'celestial-night', 'amigurumi', 'mw'],
  ['The botanist', 'botanist doll', 'a press of leaves and a magnifying glass', 'wildflower-meadow', 'amigurumi', 'ma'],
  ['The lifeboat crew', 'lifeboat crew doll', 'a yellow waterproof and a life ring', 'coastal-breeze', 'amigurumi', 'ma'],
  ['The postie', 'postal worker doll', 'a satchel of tiny letters and a cycle clip', 'bright-pop', 'amigurumi', 'ma'],
  ['The tailor', 'tailor doll', 'a tape measure round the neck and pinned cloth', 'elegant-mono', 'amigurumi', 'ma'],
  ['The chimney sweep', 'chimney sweep doll', 'a soot-smudged face and a brush', 'gothic-dusk', 'amigurumi', 'ma'],
  ['The market trader', 'market trader doll', 'a striped apron and a fruit crate', 'bright-pop', 'amigurumi', 'ma'],
  ['The knitter in a rocking chair', 'knitter doll', 'a lap of yarn and half a sock on needles', 'vintage-tea', 'amigurumi', 'mw'],
  ['The lifeguard', 'lifeguard doll', 'a whistle, a float and a sun-bleached cap', 'coastal-breeze', 'amigurumi', 'ma'],
  // ── Seasonal and festive figures ──
  ['The winter carol singer', 'carol singer doll', 'a muffler, a lantern and a songbook', 'winter-frost', 'amigurumi', 'ma'],
  ['The spring bride', 'bride doll', 'a lace veil and a posy of thread flowers', 'elegant-mono', 'amigurumi', 'mw'],
  ['The harvest queen', 'harvest queen doll', 'a wheat crown and a corn-dolly staff', 'foxglove-autumn', 'amigurumi', 'mw'],
  ['The bonfire watcher', 'bonfire watcher doll', 'a bobble hat, mittens and a sparkler', 'gothic-dusk', 'amigurumi', 'ma'],
  ['The May queen', 'may queen doll', 'ribbons in the hair and a blossom garland', 'wildflower-meadow', 'amigurumi', 'ma'],
  ['The ice skater', 'ice skater doll', 'a flared skirt and skates with tiny blades', 'winter-frost', 'amigurumi', 'ma'],
  ['The trick-or-treater', 'trick or treater doll', 'a sheet costume and a sweet bucket', 'gothic-dusk', 'amigurumi', 'ma'],
  ['The nativity shepherd boy', 'nativity shepherd doll', 'a striped robe and a rope belt', 'boho-earth', 'amigurumi', 'ma'],
  // ── Storybook roles ──
  ['The apprentice wizard', 'apprentice wizard', 'a too-big hat and a wonky wand', 'celestial-night', 'amigurumi', 'mw'],
  ['The knight', 'knight doll', 'a stitched chainmail body and a shield', 'elegant-mono', 'amigurumi', 'mw'],
  ['The pirate captain', 'pirate captain doll', 'a tricorn hat, a parrot and a map', 'coastal-breeze', 'amigurumi', 'mw'],
  ['The forest ranger', 'forest ranger doll', 'a canvas pack and a compass', 'mushroom-woodland', 'amigurumi', 'ma'],
  ['The little rag doll', 'rag doll', 'yarn plaits and a patched pinafore', 'vintage-tea', 'amigurumi', 'mi'],
  ['The circus acrobat', 'acrobat doll', 'a leotard, a sash and bendy arms', 'bright-pop', 'amigurumi', 'ma'],
  ['The clown with a sad smile', 'clown doll', 'a ruff, a pom hat and one painted tear', 'candy-kawaii', 'amigurumi', 'ma'],
  ['The ballerina', 'ballerina doll', 'a stiffened tutu and ribbon shoes', 'nursery-pastel', 'amigurumi', 'mw'],
  ['The pearl diver', 'pearl diver doll', 'a rope belt, a knife and a shell', 'coastal-breeze', 'amigurumi', 'ma'],
  ['The desert traveller', 'desert traveller doll', 'a wrapped headscarf and a water skin', 'boho-earth', 'amigurumi', 'ma'],
  ['The lamplighter', 'lamplighter doll', 'a long pole and a coat to the ankles', 'gothic-dusk', 'amigurumi', 'ma'],
  ['The mountain climber', 'climber doll', 'a coiled rope and a woolly hat', 'winter-frost', 'amigurumi', 'ma'],
  // ── Everyday and family ──
  ['Grandmother in a shawl', 'grandmother doll', 'a shawl, a bun and slippers', 'vintage-tea', 'amigurumi', 'ma'],
  ['Grandfather with a pipe', 'grandfather doll', 'a flat cap, a cardigan and a newspaper', 'scandi-calm', 'amigurumi', 'ma'],
  ['Sleepy toddler in pyjamas', 'toddler doll', 'button-front pyjamas and a comfort blanket', 'nursery-pastel', 'amigurumi', 'mi'],
  ['New baby in a knitted sack', 'baby doll', 'a swaddle sack and a tiny cap', 'nursery-pastel', 'amigurumi', 'mi'],
  ['School child with a satchel', 'school child doll', 'a satchel, a pleated skirt and a name tag', 'coastal-breeze', 'amigurumi', 'ma'],
  ['Swimmer in a striped costume', 'swimmer doll', 'a striped costume and a rubber ring', 'bright-pop', 'amigurumi', 'ma'],
  ['Cyclist in a jersey', 'cyclist doll', 'a numbered jersey and a helmet', 'bright-pop', 'amigurumi', 'ma'],
  ['Runner with a medal', 'runner doll', 'a vest, shorts and a ribboned medal', 'bright-pop', 'amigurumi', 'ma'],
  ['Doll in a dressing gown', 'dressing gown doll', 'a waffle-stitch robe and a mug', 'scandi-calm', 'amigurumi', 'ma'],
  ['Doll with a walking stick', 'walking doll', 'a stick, a wax jacket and a spaniel', 'mushroom-woodland', 'amigurumi', 'mw'],
  // ── Dress-up sets ──
  ['Doll with three outfits', 'wardrobe doll', 'one body, three snap-on outfits', 'candy-kawaii', 'amigurumi', 'ww'],
  ['Topsy-turvy doll', 'topsy turvy doll', 'one doll awake at one end, asleep at the other', 'nursery-pastel', 'amigurumi', 'mw'],
  ['Worry doll set', 'worry dolls', 'five thumb-sized dolls in a pouch', 'boho-earth', 'amigurumi', 'sb'],
  ['Pocket doll and sleeping bag', 'pocket doll', 'a small doll and a buttoned sleeping bag', 'wildflower-meadow', 'amigurumi', 'mi'],
  ['Nesting doll trio', 'nesting dolls', 'three sizes that stack inside each other', 'foxglove-autumn', 'amigurumi', 'mw'],
]

/**
 * BABY TOYS AND LOVEYS — dk weight, embroidered faces, no safety eyes, no
 * small parts. Half the shelf is the plain stuffed ball the loom already
 * proves; the other half is a simple two-piece figure.
 */
const BABY_TOY_LOVEY: Row[] = [
  ['Cloud rattle ball', 'cloud rattle', 'a soft ball with an embroidered sleepy face', 'nursery-pastel', 'sphere', 'sb'],
  ['Rainbow stripe ball', 'rainbow ball', 'six bands of colour round a soft ball', 'bright-pop', 'sphere', 'sb'],
  ['Speckled egg ball', 'speckled egg', 'a pale ball with french-knot speckles', 'nursery-pastel', 'sphere', 'sb'],
  ['Moon face ball', 'moon ball', 'a cream ball with a stitched crescent smile', 'celestial-night', 'sphere', 'sb'],
  ['Strawberry ball', 'strawberry ball', 'a red ball with seed knots and a green top', 'candy-kawaii', 'sphere', 'sb'],
  ['Apple ball', 'apple ball', 'a round apple with a stalk and one leaf', 'wildflower-meadow', 'sphere', 'sb'],
  ['Bumble ball', 'bumble ball', 'wide fuzzy bands and stitched wings', 'foxglove-autumn', 'sphere', 'sb'],
  ['Snowball rattle', 'snowball rattle', 'a white ball with a silver stitched flake', 'winter-frost', 'sphere', 'sb'],
  ['Beach ball', 'beach ball', 'six coloured panels round a soft ball', 'coastal-breeze', 'sphere', 'sb'],
  ['Sunshine ball', 'sunshine ball', 'a gold ball with a ring of stitched rays', 'bright-pop', 'sphere', 'sb'],
  ['Pumpkin rattle', 'pumpkin rattle', 'ribbed segments and a curled stalk', 'foxglove-autumn', 'sphere', 'sb'],
  ['Acorn rattle', 'acorn rattle', 'a textured cup over a smooth ball', 'mushroom-woodland', 'sphere', 'sb'],
  ['Peach ball', 'peach ball', 'a blush ball with a stitched crease', 'candy-kawaii', 'sphere', 'sb'],
  ['Melon slice ball', 'melon ball', 'a half-ball with a stitched rind edge', 'bright-pop', 'sphere', 'sb'],
  ['Star ball', 'star ball', 'a navy ball scattered with gold stars', 'celestial-night', 'sphere', 'sb'],
  ['Owl-face ball', 'owl ball', 'two stitched eye discs and a beak', 'mushroom-woodland', 'sphere', 'sb'],
  ['Ladybird ball', 'ladybird ball', 'red with black spots and a stitched line', 'bright-pop', 'sphere', 'sb'],
  ['Sheep-face ball', 'sheep ball', 'a bumpy cream ball with a dark face patch', 'scandi-calm', 'sphere', 'sb'],
  ['Frog-face ball', 'frog ball', 'a green ball with two raised eye bumps', 'wildflower-meadow', 'sphere', 'sb'],
  ['Kitten-face ball', 'kitten ball', 'stitched whiskers and two flat ears', 'nursery-pastel', 'sphere', 'sb'],
  ['Chick ball', 'chick ball', 'a yellow ball with a folded orange beak', 'nursery-pastel', 'sphere', 'sb'],
  ['Piglet ball', 'piglet ball', 'a pink ball with a stitched snout', 'candy-kawaii', 'sphere', 'sb'],
  ['Panda-face ball', 'panda ball', 'black ear patches and eye patches', 'elegant-mono', 'sphere', 'sb'],
  ['Fox-face ball', 'fox ball', 'a russet ball with a white muzzle patch', 'foxglove-autumn', 'sphere', 'sb'],
  ['Bear-face ball', 'bear ball', 'two round ears and a stitched snout', 'vintage-tea', 'sphere', 'sb'],
  ['Whale ball', 'whale ball', 'a blue ball with a flat tail and a spout', 'coastal-breeze', 'sphere', 'sb'],
  ['Turtle ball', 'turtle ball', 'a patterned shell dome on a soft ball', 'wildflower-meadow', 'sphere', 'sb'],
  ['Hedgehog ball', 'hedgehog ball', 'a bobbled back and a smooth face', 'mushroom-woodland', 'sphere', 'si'],
  ['Bunny-face ball', 'bunny ball', 'two long soft ears folded over', 'nursery-pastel', 'sphere', 'sb'],
  ['Mouse ball', 'mouse ball', 'two big round ears and a knotted tail', 'scandi-calm', 'sphere', 'sb'],
  // ── Two-piece figures ──
  ['Sleepy lamb comforter', 'lamb comforter', 'a bumpy body and knotted corners', 'nursery-pastel', 'amigurumi', 'si'],
  ['Bunny comforter', 'bunny comforter', 'a soft head over a square blanket', 'nursery-pastel', 'amigurumi', 'si'],
  ['Bear comforter', 'bear comforter', 'a round bear head on a ribbed square', 'vintage-tea', 'amigurumi', 'si'],
  ['Fox comforter', 'fox comforter', 'a pointed face and a tail corner', 'foxglove-autumn', 'amigurumi', 'si'],
  ['Elephant comforter', 'elephant comforter', 'a trunk and two wide flat ears', 'scandi-calm', 'amigurumi', 'si'],
  ['Duckling comforter', 'duckling comforter', 'a yellow head and a soft yellow square', 'nursery-pastel', 'amigurumi', 'si'],
  ['Whale comforter', 'whale comforter', 'a whale head over a wave-edged square', 'coastal-breeze', 'amigurumi', 'si'],
  ['Star comforter', 'star comforter', 'a five-point star head on a night square', 'celestial-night', 'amigurumi', 'si'],
  ['Cloud comforter', 'cloud comforter', 'a bumpy cloud over a pale blue square', 'coastal-breeze', 'amigurumi', 'si'],
  ['Cat comforter', 'cat comforter', 'a cat head with a stitched wink', 'nursery-pastel', 'amigurumi', 'si'],
  ['First doll', 'first doll', 'a simple soft body with embroidered features', 'nursery-pastel', 'amigurumi', 'si'],
  ['Pram rattle ring', 'rattle ring', 'a covered ring with two hanging balls', 'candy-kawaii', 'amigurumi', 'si'],
  ['Stacking rings set', 'stacking rings', 'four graded rings over a soft post', 'bright-pop', 'amigurumi', 'ma'],
  ['Soft stacking cubes', 'stacking cubes', 'three stuffed cubes with stitched faces', 'nursery-pastel', 'amigurumi', 'mi'],
  ['Pram garland', 'pram garland', 'five little balls strung on a cord', 'candy-kawaii', 'amigurumi', 'si'],
  ['Teething ring with a bunny', 'teething ring bunny', 'a wooden ring with a bunny head above', 'nursery-pastel', 'amigurumi', 'si'],
  ['Soft first book', 'soft book', 'three stuffed pages with stitched shapes', 'bright-pop', 'amigurumi', 'ma'],
  ['Peekaboo pocket friend', 'pocket friend', 'a small figure that hides in a pocket', 'wildflower-meadow', 'amigurumi', 'si'],
  ['Crinkle leaf toy', 'crinkle leaf', 'a leaf shape with a crinkle insert', 'wildflower-meadow', 'amigurumi', 'si'],
  ['Soft first blocks', 'soft blocks', 'three cubes with a letter on each face', 'nursery-pastel', 'amigurumi', 'ma'],
  ['Snuggle octopus', 'snuggle octopus', 'eight curled legs and a gentle face', 'coastal-breeze', 'amigurumi', 'si'],
  ['Snuggle bunny with long ears', 'snuggle bunny', 'a floppy body a baby can grip', 'nursery-pastel', 'amigurumi', 'si'],
  ['Little lion first friend', 'lion first friend', 'a loop-stitch mane and a stitched face', 'foxglove-autumn', 'amigurumi', 'si'],
  ['Little bear first friend', 'bear first friend', 'jointed-look arms with no hard parts', 'vintage-tea', 'amigurumi', 'si'],
  ['Squishy caterpillar', 'squishy caterpillar', 'five soft segments in graded colour', 'bright-pop', 'amigurumi', 'si'],
  ['Rainbow snake', 'rainbow snake', 'a long soft coil in seven colours', 'bright-pop', 'amigurumi', 'si'],
  ['Sensory pebble set', 'sensory pebbles', 'four pebbles in four different stitches', 'scandi-calm', 'amigurumi', 'si'],
]

/**
 * FLAT AND ROUND SHELVES. The Tutorial library owns the stitch-technique naming
 * space here ("waffle stitch dishcloth", "bobble blanket", "granny square, six
 * rounds"), so every idea below is led by its COLOUR STORY instead. That is
 * also what the engine is good at: the grid builder's range is stitch bands,
 * colour bands and one tapestry picture, not lace.
 */
const COASTER: Row[] = [
  ['Bramble hedge coaster', 'bramble hedge', 'deep berry over leaf green in two bands', 'mushroom-woodland', 'grid-stripe', 'sb'],
  ['Sea glass coaster', 'sea glass', 'three washed greens fading pale to deep', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Terracotta pot coaster', 'terracotta', 'a solid warm clay square with a darker edge', 'boho-earth', 'grid-plain', 'sb'],
  ['Oat and ink coaster', 'oat and ink', 'oatmeal ground, one charcoal band off centre', 'elegant-mono', 'grid-stripe', 'sb'],
  ['Rosehip round', 'rosehip', 'a disc worked from a red centre out to cream', 'foxglove-autumn', 'disc', 'sb'],
  ['Moss ring coaster', 'moss ring', 'a disc in three greens, darkest at the rim', 'wildflower-meadow', 'disc', 'sb'],
  ['Elderflower coaster', 'elderflower', 'a cream disc with one soft yellow round', 'wildflower-meadow', 'disc', 'sb'],
  ['Harvest gold coaster', 'harvest gold', 'wheat gold with two thin rust lines', 'foxglove-autumn', 'grid-stripe', 'sb'],
  ['Slate and chalk coaster', 'slate and chalk', 'even bands of grey and off white', 'scandi-calm', 'grid-stripe', 'sb'],
  ['Damson coaster', 'damson', 'a solid deep plum square, dense and plain', 'gothic-dusk', 'grid-plain', 'sb'],
  ['Frost ring coaster', 'frost ring', 'a pale disc with a silver-grey outer round', 'winter-frost', 'disc', 'sb'],
  ['Sunset stripe coaster', 'sunset stripe', 'coral to gold in four graded bands', 'bright-pop', 'grid-stripe', 'sb'],
  ['Ink dot round', 'ink dot', 'a black centre opening to bone white', 'elegant-mono', 'disc', 'sb'],
  ['Rockpool round', 'rockpool', 'teal, sand and shell in three rounds', 'coastal-breeze', 'disc', 'sb'],
  ['Heather moor coaster', 'heather moor', 'purple over olive in wide bands', 'boho-earth', 'grid-stripe', 'sb'],
  ['Butter yellow coaster', 'butter yellow', 'a plain sunny square with a cream border', 'candy-kawaii', 'grid-plain', 'sb'],
  ['Woodsmoke coaster', 'woodsmoke', 'a solid grey-brown square, quiet and thick', 'mushroom-woodland', 'grid-plain', 'sb'],
  ['Blush and bone coaster', 'blush and bone', 'two bands of pink against ivory', 'vintage-tea', 'grid-stripe', 'sb'],
  ['Marmalade round', 'marmalade', 'a disc from a dark orange centre to peel gold', 'bright-pop', 'disc', 'sb'],
  ['Pine forest coaster', 'pine forest', 'a solid deep green square with a black edge', 'winter-frost', 'grid-plain', 'sb'],
  ['Midnight ring coaster', 'midnight ring', 'indigo disc with one gold round near the rim', 'celestial-night', 'disc', 'si'],
  ['Cocoa and cream coaster', 'cocoa and cream', 'wide chocolate bands over cream', 'vintage-tea', 'grid-stripe', 'sb'],
  ['Fern shade coaster', 'fern shade', 'three greens light to dark, top to bottom', 'wildflower-meadow', 'grid-stripe', 'sb'],
  ['Clay and sky coaster', 'clay and sky', 'terracotta against a pale blue half', 'scandi-calm', 'grid-stripe', 'sb'],
  ['Bilberry round', 'bilberry', 'a deep blue disc with a green outer round', 'gothic-dusk', 'disc', 'sb'],
  ['Toffee coaster', 'toffee', 'a plain warm caramel square, thick and dense', 'foxglove-autumn', 'grid-plain', 'sb'],
  ['Chalk cliff coaster', 'chalk cliff', 'white over a grey-blue base band', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Sherbet round', 'sherbet', 'three sweet-shop pastels, centre out', 'candy-kawaii', 'disc', 'sb'],
  ['Ivy green coaster', 'ivy green', 'a solid dark green square with a paler rim', 'mushroom-woodland', 'grid-plain', 'sb'],
  ['Cranberry stripe coaster', 'cranberry', 'red and cream in narrow alternating rows', 'winter-frost', 'grid-stripe', 'sb'],
  ['Honeycomb gold coaster', 'honeycomb gold', 'a plain amber square with a bronze border', 'foxglove-autumn', 'grid-plain', 'sb'],
  ['Dusk lilac round', 'dusk lilac', 'a lilac disc fading to grey at the rim', 'celestial-night', 'disc', 'sb'],
  ['Storm sea coaster', 'storm sea', 'grey-blue and navy in uneven bands', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Meadow buttercup round', 'buttercup', 'a gold centre with two green rounds', 'wildflower-meadow', 'disc', 'sb'],

  ['Bobble dot table runner', 'bobble dot table runner', 'a textured table runner with raised bobble stitches scattered every four rows across a plain double crochet background. 30 × 90 cm in dk cotton on a 4 mm hook', 'foxglove-autumn', 'grid-plain', 'li', 'bobble-dot-table-runner'],
  ['Broomstick lace table runner', 'broomstick lace table runner', 'this runner uses a cluster spacing of 5 loops per cluster throughout', 'mushroom-woodland', 'grid-plain', 'lb', 'broomstick-lace-table-runner-crochet'],
  ['Corner-to-corner placemat', 'corner-to-corner placemat', 'a 30 × 40 cm placemat in the corner-to-corner (c2c) technique: diagonal pixel-block construction in dk cotton. intermediate skill for managing the increase and decrease sections', 'nursery-pastel', 'grid-plain', 'li', 'c2c-placemat'],
  ['Tray liner', 'tray liner', 'work a 30 x 20 cm rectangle in plain double crochet', 'celestial-night', 'grid-plain', 'mb', 'crochet-tray-liner'],
  ['Filet table runner', 'filet table runner', 'a traditional filet crochet table runner in fine cotton thread: a 25 × 80 cm runner worked in trebles and chain spaces, with a simple border motif in filled squares across each end', 'bright-pop', 'grid-plain', 'la', 'filet-crochet-table-runner'],
  ['Granny square placemat', 'granny square placemat', 'a 30 × 30 cm placemat made from four classic granny squares, each 15 cm, joined with a flat slip stitch seam. intermediate due to the joining seam. the squares themselves are beginner-level', 'candy-kawaii', 'grid-plain', 'li', 'granny-square-placemat'],
  ['Granny strip table runner', 'granny strip table runner', 'a granny strip table runner is 40 classic granny squares, 4 wide by 10 long: joined into a 36 × 90 cm table runner', 'scandi-calm', 'grid-plain', 'li', 'granny-strip-table-runner'],
  ['Hexagon motif table runner', 'hexagon motif table runner', 'a table runner built from 18 flat hexagon motifs joined in two staggered rows. each hexagon is 12 cm across, worked in dk cotton on a 4 mm hook. the finished runner is 24 cm wide and 90 cm long', 'elegant-mono', 'grid-plain', 'ma', 'hexagon-motif-table-runner'],
  ['Oval cotton placemat', 'oval cotton placemat', 'an oval cotton placemat is a 30 × 40 cm mat worked in double crochet outward from a foundation chain using oval construction', 'boho-earth', 'grid-plain', 'lb', 'oval-cotton-placemat'],
  ['Shell edge rectangle placemat', 'shell edge rectangle placemat', 'a 30 × 40 cm rectangle in dk cotton worked in double crochet, finished with a shell stitch border all around. beginner-friendly with one decorative edging round. one 100 m ball per placemat', 'vintage-tea', 'grid-plain', 'lb', 'shell-edge-rectangle-placemat'],
]

const DISHCLOTH: Row[] = [
  ['Blackberry and cream cloth', 'blackberry and cream', 'deep purple bands on undyed cotton', 'mushroom-woodland', 'grid-stripe', 'sb'],
  ['Sea foam cloth', 'sea foam', 'three sea greens, palest at the top', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Kitchen garden cloth', 'kitchen garden', 'leaf green and radish pink in wide bands', 'wildflower-meadow', 'grid-stripe', 'sb'],
  ['Ridged oat cloth', 'ridged oat', 'bands of dc, htr and back-loop ridge in oatmeal', 'scandi-calm', 'grid-texture', 'si'],
  ['Ink and bone cloth', 'ink and bone', 'a black and off-white texture ladder', 'elegant-mono', 'grid-texture', 'si'],
  ['Terracotta ridge cloth', 'terracotta ridge', 'stitch bands that read as ribs in clay red', 'boho-earth', 'grid-texture', 'si'],
  ['Plain sage cloth', 'plain sage', 'one soft green, dense and even, edge to edge', 'wildflower-meadow', 'grid-plain', 'sb'],
  ['Plain chalk cloth', 'plain chalk', 'a plain white cloth for a clean kitchen', 'elegant-mono', 'grid-plain', 'sb'],
  ['Citrus grove cloth', 'citrus grove', 'bright yellow over a deeper orange band', 'bright-pop', 'grid-stripe', 'sb'],
  ['Bracken cloth', 'bracken', 'rust and olive in alternating two-row bands', 'foxglove-autumn', 'grid-stripe', 'sb'],
  ['Heather cloth', 'heather', 'three purples from mauve to deep', 'boho-earth', 'grid-stripe', 'sb'],
  ['Milk and honey cloth', 'milk and honey', 'cream and warm gold, wide and calm', 'vintage-tea', 'grid-stripe', 'sb'],
  ['Winter berry cloth', 'winter berry', 'holly red on a frost white ground', 'winter-frost', 'grid-stripe', 'sb'],
  ['Bay and salt cloth', 'bay and salt', 'grey-green texture bands over white', 'coastal-breeze', 'grid-texture', 'si'],
  ['Cocoa ridge cloth', 'cocoa ridge', 'dark chocolate worked in stitch ladders', 'vintage-tea', 'grid-texture', 'si'],
  ['Plain indigo cloth', 'plain indigo', 'a deep flat blue with a firm edge', 'celestial-night', 'grid-plain', 'sb'],
  ['Rhubarb cloth', 'rhubarb and custard', 'pink and pale yellow in narrow bands', 'candy-kawaii', 'grid-stripe', 'sb'],
  ['Dune cloth', 'dune', 'sand and pale gold in soft graded bands', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Moor stone cloth', 'moor stone', 'grey texture bands with a darker base', 'scandi-calm', 'grid-texture', 'si'],
  ['Plain rosewood cloth', 'plain rosewood', 'a solid dusky red, dense enough to scrub', 'gothic-dusk', 'grid-plain', 'sb'],
  ['Meadow morning cloth', 'meadow morning', 'green, cream and buttercup in three bands', 'wildflower-meadow', 'grid-stripe', 'sb'],
  ['Copper pan cloth', 'copper pan', 'copper and charcoal stitch bands', 'foxglove-autumn', 'grid-texture', 'si'],
  ['Plain fern cloth', 'plain fern', 'a single mid green, worked square and flat', 'mushroom-woodland', 'grid-plain', 'sb'],
  ['Nordic blue cloth', 'nordic blue', 'ice blue and white, evenly banded', 'winter-frost', 'grid-stripe', 'sb'],
  ['Marigold cloth', 'marigold', 'hot orange over a rust base band', 'bright-pop', 'grid-stripe', 'sb'],
  ['Slate ladder cloth', 'slate ladder', 'four stitch heights in one grey', 'scandi-calm', 'grid-texture', 'si'],
  ['Plum and moss cloth', 'plum and moss', 'deep plum against dark moss green', 'gothic-dusk', 'grid-stripe', 'sb'],
  ['Plain cornflower cloth', 'plain cornflower', 'a clear mid blue, plain and thick', 'coastal-breeze', 'grid-plain', 'sb'],
  ['Apple loft cloth', 'apple loft', 'green and russet in wide alternating bands', 'foxglove-autumn', 'grid-stripe', 'sb'],
  ['Buttermilk ridge cloth', 'buttermilk ridge', 'front and back loop ridges in cream', 'vintage-tea', 'grid-texture', 'si'],
  ['Plain charcoal cloth', 'plain charcoal', 'a dark plain cloth that hides a stain', 'elegant-mono', 'grid-plain', 'sb'],
  ['Rosemary cloth', 'rosemary', 'grey-green and silver in narrow bands', 'scandi-calm', 'grid-stripe', 'sb'],
  ['Pantry stripe cloth', 'pantry stripe', 'red, white and blue, evenly spaced', 'bright-pop', 'grid-stripe', 'sb'],
  ['Peat and lichen cloth', 'peat and lichen', 'brown-black texture bands with a green flash', 'mushroom-woodland', 'grid-texture', 'si'],
  ['Plain oyster cloth', 'plain oyster', 'a soft grey-beige, plain, with a neat corner', 'scandi-calm', 'grid-plain', 'sb'],
  ['Spice market cloth', 'spice market', 'turmeric, paprika and cumin bands', 'boho-earth', 'grid-stripe', 'sb'],
  ['Snowdrop cloth', 'snowdrop', 'white with two thin green stems of stripe', 'winter-frost', 'grid-stripe', 'sb'],
  ['Peony cloth', 'peony', 'blush and deep pink in soft stitch bands', 'vintage-tea', 'grid-texture', 'si'],
  ['Plain aubergine cloth', 'plain aubergine', 'a dense dark purple with a clean edge', 'gothic-dusk', 'grid-plain', 'sb'],
  ['Lido cloth', 'lido', 'turquoise and white in bold wide bands', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Cake stand cloth', 'cake stand', 'icing pink, mint and cream in three bands', 'candy-kawaii', 'grid-stripe', 'sb'],

  ['Dish scrubber', 'dish scrubber', 'work in blo double crochet for a ridged surface texture', 'wildflower-meadow', 'grid-texture', 'mb', 'crochet-dish-scrubber'],
  ['Granny square dishcloth', 'granny square dishcloth', 'a granny square dishcloth is a single 5-round granny motif about 20 cm across', 'foxglove-autumn', 'grid-texture', 'mb', 'granny-square-dishcloth'],
  ['Htr BLO washcloth', 'htr blo washcloth', 'an htr blo washcloth is 20 x 20 cm', 'mushroom-woodland', 'grid-texture', 'mb', 'htr-blo-washcloth'],
  ['Rectangle dc dishcloth', 'rectangle dc dishcloth', 'a rectangle dc dishcloth is 20 x 30 cm in plain double crochet', 'nursery-pastel', 'grid-texture', 'lb', 'rectangle-dc-dishcloth'],
  ['Star stitch face cloth', 'star stitch face cloth', 'a star stitch face cloth is 20 x 20 cm', 'celestial-night', 'grid-texture', 'ma', 'star-stitch-face-cloth'],
]

const POTHOLDER: Row[] = [
  ['Cast iron potholder', 'cast iron', 'charcoal stitch bands, thick and dense', 'elegant-mono', 'grid-texture', 'si'],
  ['Bread oven potholder', 'bread oven', 'wheat and crust brown in stitch ladders', 'vintage-tea', 'grid-texture', 'si'],
  ['Chilli potholder', 'chilli', 'hot red over a dark green base', 'bright-pop', 'grid-stripe', 'sb'],
  ['Olive grove potholder', 'olive grove', 'olive and silver-green stitch bands', 'boho-earth', 'grid-texture', 'si'],
  ['Blue kitchen potholder', 'blue kitchen', 'delft blue and white in even bands', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Saffron potholder', 'saffron', 'deep gold worked in four stitch heights', 'foxglove-autumn', 'grid-texture', 'si'],
  ['Aga cream potholder', 'aga cream', 'cream ridges with one black line', 'elegant-mono', 'grid-texture', 'si'],
  ['Beetroot potholder', 'beetroot', 'magenta over a leaf green band', 'gothic-dusk', 'grid-stripe', 'sb'],
  ['Herb drawer potholder', 'herb drawer', 'three greens as stitch bands, dark to pale', 'wildflower-meadow', 'grid-texture', 'si'],
  ['Copper kettle potholder', 'copper kettle', 'copper and cream in narrow stripes', 'foxglove-autumn', 'grid-stripe', 'sb'],
  ['Rye loaf potholder', 'rye loaf', 'grey-brown bands with a seeded texture row', 'mushroom-woodland', 'grid-texture', 'si'],
  ['Farmhouse red potholder', 'farmhouse red', 'barn red and bone in wide bands', 'vintage-tea', 'grid-stripe', 'sb'],
  ['Winter kitchen potholder', 'winter kitchen', 'ice blue and white stitch ladders', 'winter-frost', 'grid-texture', 'si'],
  ['Marmalade pot potholder', 'marmalade pot', 'orange and dark peel in stripes', 'bright-pop', 'grid-stripe', 'sb'],
  ['Slate worktop potholder', 'slate worktop', 'four greys in graded stitch bands', 'scandi-calm', 'grid-texture', 'si'],
  ['Sugar bowl potholder', 'sugar bowl', 'white with two candy pink bands', 'candy-kawaii', 'grid-stripe', 'sb'],
  ['Woodfire potholder', 'woodfire', 'ember orange under charcoal texture bands', 'gothic-dusk', 'grid-texture', 'si'],
  ['Preserve shelf potholder', 'preserve shelf', 'damson, apricot and cream stripes', 'vintage-tea', 'grid-stripe', 'sb'],
  ['Sea salt potholder', 'sea salt', 'white ridges over a soft grey ground', 'coastal-breeze', 'grid-texture', 'si'],
  ['Turmeric potholder', 'turmeric', 'mustard and clay red in bold bands', 'boho-earth', 'grid-stripe', 'sb'],
  ['Nightshade potholder', 'nightshade', 'deep purple stitch bands with a black edge', 'celestial-night', 'grid-texture', 'si'],
  ['Buttercup potholder', 'buttercup kitchen', 'yellow and white in narrow stripes', 'wildflower-meadow', 'grid-stripe', 'sb'],

  ['Oven mitt pair', 'oven mitt pair', 'a pair of simple rectangular oven mitts in 100% aran cotton: double-layer construction for heat resistance, with a hanging loop. 18 × 30 cm each. intermediate skill for the double-layer finishing', 'foxglove-autumn', 'grid-texture', 'li', 'oven-mitt-pair'],
]

/**
 * MOTIFS AND GRANNY SQUARES. 2026's biggest crochet trend and the shelf the
 * current targets under-weight most. The Tutorial library already teaches the
 * constructions (mandala, African flower, mitred square, log cabin), so these
 * are named as COLOUR STORIES to join into a blanket or a bag.
 */
const MOTIF: Row[] = [
  ['Harvest field square', 'harvest field', 'wheat gold over stubble brown in stitch bands', 'foxglove-autumn', 'grid-texture', 'si'],
  ['Rockpool motif', 'rockpool tide', 'teal to sand in concentric rounds', 'coastal-breeze', 'disc', 'sb'],
  ['Heather moor square', 'heather moor', 'purple, olive and grey concentric bands', 'boho-earth', 'grid-stripe', 'sb'],
  ['Bramble patch square', 'bramble patch', 'berry, leaf and cream in stitch ladders', 'mushroom-woodland', 'grid-texture', 'si'],
  ['Cornfield round', 'cornfield', 'a gold centre opening to pale straw', 'wildflower-meadow', 'disc', 'sb'],
  ['Slate roof square', 'slate roof', 'four greys as stitch bands, dark to light', 'scandi-calm', 'grid-texture', 'si'],
  ['Sunrise square', 'sunrise', 'coral to gold in five colour bands', 'bright-pop', 'grid-stripe', 'sb'],
  ['Midnight round', 'midnight sky', 'indigo rounds with one gold ring', 'celestial-night', 'disc', 'si'],
  ['Orchard square', 'orchard', 'apple green and blossom pink concentric', 'wildflower-meadow', 'grid-stripe', 'sb'],
  ['Ember square', 'ember', 'red into black in graded stitch bands', 'gothic-dusk', 'grid-texture', 'si'],
  ['Chalk and ink square', 'chalk and ink', 'white and black in strict even bands', 'elegant-mono', 'grid-stripe', 'sb'],
  ['Rosehip motif', 'rosehip hedge', 'a red centre with a green outer ring', 'foxglove-autumn', 'disc', 'sb'],
  ['Winter hedge square', 'winter hedge', 'bare brown with a berry red flash', 'winter-frost', 'grid-texture', 'si'],
  ['Lido square', 'lido', 'turquoise and white in wide bold bands', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Sherbet motif', 'sherbet fountain', 'four sweet-shop pastels, centre out', 'candy-kawaii', 'disc', 'sb'],
  ['Peat bog square', 'peat bog', 'black-brown stitch bands with moss green', 'mushroom-woodland', 'grid-texture', 'si'],
  ['Marigold square', 'marigold', 'hot orange, rust and cream banded out', 'bright-pop', 'grid-stripe', 'sb'],
  ['Sea mist round', 'sea mist', 'grey-blue to white in soft rounds', 'scandi-calm', 'disc', 'sb'],
  ['Damson square', 'damson', 'deep plum with a bone outer band', 'gothic-dusk', 'grid-stripe', 'sb'],
  ['Beehive square', 'beehive', 'amber and honey stitch ladders', 'foxglove-autumn', 'grid-texture', 'si'],
  ['Bluebell wood round', 'bluebell wood', 'violet centre opening to leaf green', 'wildflower-meadow', 'disc', 'sb'],
  ['Tea rose square', 'tea rose', 'faded rose and sage in even bands', 'vintage-tea', 'grid-stripe', 'sb'],
  ['Snowfield square', 'snowfield', 'white on white in four stitch heights', 'winter-frost', 'grid-texture', 'si'],
  ['Terracotta square', 'terracotta tile', 'clay red with a thin cream border band', 'boho-earth', 'grid-stripe', 'sb'],
  ['Nightfall round', 'nightfall', 'navy to lilac to gold in rounds', 'celestial-night', 'disc', 'si'],
  ['Fern gully square', 'fern gully', 'three greens as raised stitch bands', 'mushroom-woodland', 'grid-texture', 'si'],
  ['Candyfloss round', 'candyfloss', 'a white centre with two pink rounds', 'candy-kawaii', 'disc', 'sb'],
  ['Harbour square', 'harbour', 'navy, white and rope brown banded', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Oat and ash square', 'oat and ash', 'oatmeal and grey in quiet stitch bands', 'scandi-calm', 'grid-texture', 'si'],
  ['Poppy field square', 'poppy field', 'scarlet with black and green bands', 'bright-pop', 'grid-stripe', 'sb'],
  ['Copper beech square', 'copper beech', 'copper and dark brown stitch ladders', 'foxglove-autumn', 'grid-texture', 'si'],
  ['Frosted pane round', 'frosted pane', 'ice blue rounds separated by white', 'winter-frost', 'disc', 'sb'],
  ['Dovecote square', 'dovecote', 'dove grey and white, plain and calm', 'elegant-mono', 'grid-stripe', 'sb'],
  ['Marrakesh square', 'marrakesh', 'saffron, teal and rust in wide bands', 'boho-earth', 'grid-stripe', 'sb'],
  ['Moss cushion round', 'moss cushion', 'mid green rounds with a darker rim', 'wildflower-meadow', 'disc', 'sb'],
  ['Blackcurrant square', 'blackcurrant', 'near-black purple with a leaf green band', 'gothic-dusk', 'grid-stripe', 'sb'],
  ['Buttermilk square', 'buttermilk', 'cream stitch ladders with a gold line', 'vintage-tea', 'grid-texture', 'si'],
  ['Rainy pavement square', 'rainy pavement', 'wet grey and slate in offset bands', 'scandi-calm', 'grid-stripe', 'sb'],
  ['Zest round', 'zest', 'lemon centre out to lime and white', 'bright-pop', 'disc', 'sb'],
  ['Woodsmoke square', 'woodsmoke', 'grey-brown stitch bands with an ash flash', 'mushroom-woodland', 'grid-texture', 'si'],
  ['Lagoon round', 'lagoon', 'turquoise deepening round by round', 'coastal-breeze', 'disc', 'sb'],
  ['Rose quartz square', 'rose quartz', 'blush and pearl in soft even bands', 'nursery-pastel', 'grid-stripe', 'sb'],
  ['Thunder square', 'thunder', 'charcoal ladders under one white flash', 'gothic-dusk', 'grid-texture', 'si'],
  ['Sunflower field round', 'sunflower field', 'a brown centre out to gold petal rounds', 'foxglove-autumn', 'disc', 'sb'],
  ['Lavender row square', 'lavender row', 'lilac and grey-green in narrow bands', 'vintage-tea', 'grid-stripe', 'sb'],
  ['Bonfire square', 'bonfire', 'orange to black in stitch height bands', 'gothic-dusk', 'grid-texture', 'si'],
  ['Baby blue round', 'baby blue', 'pale blue rounds with a cream edge', 'nursery-pastel', 'disc', 'sb'],
  ['Ochre earth square', 'ochre earth', 'ochre and umber in wide stitch bands', 'boho-earth', 'grid-texture', 'si'],
  ['Pistachio square', 'pistachio', 'soft green with a cream centre band', 'candy-kawaii', 'grid-stripe', 'sb'],
  ['Wet slate round', 'wet slate', 'grey rounds with a single black ring', 'elegant-mono', 'disc', 'sb'],
  ['Meadowsweet square', 'meadowsweet', 'cream and pale green stitch ladders', 'wildflower-meadow', 'grid-texture', 'si'],
  ['Cinnamon square', 'cinnamon', 'warm brown with two cream lines', 'vintage-tea', 'grid-stripe', 'sb'],
  ['Aurora round', 'aurora', 'green to violet across the rounds', 'celestial-night', 'disc', 'si'],
  ['Pebble beach square', 'pebble beach', 'four stone greys in stitch bands', 'coastal-breeze', 'grid-texture', 'si'],
  ['Hot pink square', 'hot pink', 'shocking pink with a black outline band', 'bright-pop', 'grid-stripe', 'sb'],
  ['Birch bark square', 'birch bark', 'white ladders broken by dark dashes', 'scandi-calm', 'grid-texture', 'si'],
  ['Foxglove square', 'foxglove', 'deep pink to cream in graded bands', 'wildflower-meadow', 'grid-stripe', 'sb'],
  ['Cocoa round', 'cocoa', 'dark chocolate rounds to a cream rim', 'vintage-tea', 'disc', 'sb'],
  ['Sea holly square', 'sea holly', 'steel blue with silver stitch ladders', 'coastal-breeze', 'grid-texture', 'si'],
  ['Icicle round', 'icicle', 'white centre out to pale silver-blue', 'winter-frost', 'disc', 'sb'],
  ['Autumn ditch square', 'autumn ditch', 'rust, mustard and bramble banded', 'foxglove-autumn', 'grid-stripe', 'sb'],
  ['Charcoal grid square', 'charcoal grid', 'black stitch ladders on bone', 'elegant-mono', 'grid-texture', 'si'],
  ['Marzipan square', 'marzipan', 'almond cream with a pink centre band', 'candy-kawaii', 'grid-stripe', 'sb'],
  ['Deep forest round', 'deep forest', 'green rounds darkening to near black', 'mushroom-woodland', 'disc', 'sb'],
  ['Gorse square', 'gorse', 'yellow with dark green spiny stitch bands', 'wildflower-meadow', 'grid-texture', 'si'],
  ['Sloe gin square', 'sloe gin', 'blue-black and dusty rose in bands', 'gothic-dusk', 'grid-stripe', 'sb'],

  ['African flower hexagon variant', 'african flower hexagon variant', 'the hexagon variant of the african flower changes the border construction so that each of the six corners forms a pointed tip rather than a rounded ch-2 space. the result is a true geometric hexagon that tiles without gaps in a flat grid, making it the joining-friendly choice for throws where the motifs sit edge to edge', 'scandi-calm', 'grid-texture', 'mi', 'crochet-african-flower-hexagon'],
  ['Bavarian square', 'bavarian square', 'the bavarian square locks each colour ring to the previous with front post trebles worked around the tops of the previous round', 'elegant-mono', 'grid-texture', 'mi', 'crochet-bavarian-square'],
  ['Bruges lace tile', 'bruges lace tile', 'bruges lace works narrow bruges ribbons as the structural components', 'boho-earth', 'grid-texture', 'ma', 'crochet-bruges-lace-tile'],
  ['Bullion round', 'bullion round', 'bullion stitches, long coiled cylinders made by wrapping the yarn many times before drawing through, stand proud of the fabric surface and radiate outward from the ring like spokes. a border of dc closes the outer edge. the result is a heavily textured circular motif that works best in smooth, high-twist cotton where the coils stay distinct', 'vintage-tea', 'disc', 'ma', 'crochet-bullion-round'],
  ['Catherine wheel motif', 'catherine wheel motif', 'the catherine wheel motif uses an eight-point star construction built from treble-cluster spokes alternating with fan shells, giving the tile its distinctive wheel-spoke appearance. worked in two colours, the spokes and fans read as separate bands; in a single colour the geometry is subtler. tiles at 12 cm into a striking radial-pattern throw', 'gothic-dusk', 'disc', 'mi', 'crochet-catherine-wheel-motif'],
  ['Compass rose round', 'compass rose round', 'the compass rose alternates four tall cardinal points in colour a with four shorter intercardinal points in colour b', 'coastal-breeze', 'disc', 'mi', 'crochet-compass-rose-round'],
  ['Daisy motif, bobble centre', 'daisy motif, bobble centre', 'the bobble-centre daisy builds five bobble stitches into a tight magic ring', 'winter-frost', 'grid-texture', 'mi', 'crochet-daisy-bobble-centre'],
  ['Filet motif', 'filet motif', 'filet crochet builds patterns by alternating open and filled filet cells in a regular grid', 'wildflower-meadow', 'grid-texture', 'mi', 'crochet-filet-motif'],
  ['Lotus motif', 'lotus motif', 'the lotus works a compact puff stitch centre in yellow or gold', 'foxglove-autumn', 'grid-texture', 'mi', 'crochet-flower-lotus'],
  ['Sunflower motif', 'sunflower motif', 'the sunflower builds a large bobble-textured centre disc from a magic ring outward in three rounds', 'mushroom-woodland', 'grid-texture', 'mi', 'crochet-flower-sunflower'],
  ['Granny rectangle', 'granny rectangle', 'the granny rectangle uses two corner positions instead of four, growing longer on the short sides and maintaining a fixed width. three rounds in dk cotton produce a 7 × 14 cm tile, twice as long as a three-round granny square, for scarves, bags, and bookmark strips worked in a grid', 'nursery-pastel', 'grid-texture', 'mb', 'crochet-granny-rectangle'],
  ['Granny triangle', 'granny triangle', 'the granny triangle works the same cluster-and-corner structure as the granny square but with three corners instead of four', 'celestial-night', 'grid-texture', 'mb', 'crochet-granny-triangle'],
  ['Interlocking square', 'interlocking square', 'two independent open-mesh grids form an interlocking mesh by inserting each grid\'s stitches through the chain spaces of the other', 'bright-pop', 'grid-texture', 'ma', 'crochet-interlocking-square'],
  ['Join-as-you-go square', 'join-as-you-go square', 'the jayg method works all rounds of a new square independently through round 3', 'candy-kawaii', 'grid-texture', 'mi', 'crochet-join-as-you-go-square'],
  ['Kaleidoscope round', 'kaleidoscope round', 'the kaleidoscope round is a scrap colour motif: each of the eight fan sections uses a different colour', 'scandi-calm', 'disc', 'mi', 'crochet-kaleidoscope-round'],
  ['Log cabin square, basic', 'log cabin square, basic', 'the log cabin square grows outward from a central rectangle by adding a log cabin strip along each side in rotation', 'elegant-mono', 'grid-texture', 'mb', 'crochet-log-cabin-square-basic'],
  ['Advanced mandala, ten rounds', 'advanced mandala, ten rounds', 'a mandala that distorts at round 6 cannot be blocked flat at round 10', 'boho-earth', 'disc', 'la', 'crochet-mandala-advanced-ten-round'],
  ['Mitred square, basic', 'mitred square, basic', 'the mitred square builds from a corner chain downward', 'vintage-tea', 'grid-texture', 'mb', 'crochet-mitred-square-basic'],
  ['Lacy circle motif', 'lacy circle motif', 'four rounds of treble shells separated by chain-2 spaces produce a 14 cm open-work disc with six-point symmetry', 'gothic-dusk', 'disc', 'mi', 'crochet-motif-circle-lacy'],
  ['Solid circle motif', 'solid circle motif', 'the solid circle uses twelve treble increases per round rather than six', 'coastal-breeze', 'disc', 'mb', 'crochet-motif-solid-circle'],
  ['Spiral round motif', 'spiral round motif', 'four rounds of continuous double crochet increases produce a 10 cm disc with no join bump, tracked by a single stitch marker', 'winter-frost', 'disc', 'mb', 'crochet-motif-spiral-round'],
  ['Six-point star motif', 'six-point star motif', 'four rounds of treble crochet with triple-increase points at six evenly-spaced positions produce a 14 cm star that blocks flat with clearly projecting points', 'wildflower-meadow', 'grid-texture', 'mi', 'crochet-motif-star-six-point'],
  ['Sunburst square motif', 'sunburst square motif', 'the sunburst square works double treble spikes back into the magic ring in round 2', 'foxglove-autumn', 'grid-texture', 'mi', 'crochet-motif-sunburst-square'],
  ['Pinwheel motif, basic', 'pinwheel motif, basic', 'the pinwheel motif works treble clusters into offset chain spaces on each round', 'mushroom-woodland', 'disc', 'mi', 'crochet-pinwheel-motif-basic'],
  ['Pinwheel motif, dense', 'pinwheel motif, dense', 'the dense pinwheel fills the space between each treble blade with double crochet stitches rather than leaving a chain space open', 'nursery-pastel', 'disc', 'mi', 'crochet-pinwheel-motif-dense'],
  ['Sunburst motif, advanced', 'sunburst motif, advanced', 'the advanced sunburst adds a fourth round of five-treble shells to the three-round basic version', 'celestial-night', 'grid-texture', 'mi', 'crochet-sunburst-motif-advanced'],
  ['Tapestry square', 'tapestry square', 'tapestry crochet keeps both colours in hand at all times', 'bright-pop', 'grid-texture', 'mi', 'crochet-tapestry-square'],
  ['Pumpkin motif', 'pumpkin motif', 'the pumpkin body is a simple flat disc from a magic ring, increased each round to stay flat', 'candy-kawaii', 'grid-texture', 'mb', 'crochet-themed-pumpkin'],
  ['Star wreath motif', 'star wreath motif', 'each star in the wreath has five treble cluster spokes from a magic ring', 'scandi-calm', 'grid-texture', 'li', 'crochet-themed-star-wreath'],
  ['Vintage fan round', 'vintage fan round', 'eight fan shells grow outward from the magic ring, each sitting in its own chain-2 space', 'elegant-mono', 'disc', 'mi', 'crochet-vintage-fan-round'],
  ['Vintage wheel square', 'vintage wheel square', 'the vintage wheel square builds eight radiating spokes in the first three rounds', 'boho-earth', 'disc', 'mi', 'crochet-vintage-wheel-square'],
  ['Irish square motif', 'irish square motif', 'the centre rose sits inside a series of chain loop rounds that step out to the four corner chains to form a square', 'vintage-tea', 'grid-texture', 'sb', 'irish-crochet-square-motif-crochet'],
]

const ORNAMENT: Row[] = [
  ['Frost bauble', 'frost bauble', 'a white ball with a pale silver spiral', 'winter-frost', 'sphere', 'sb'],
  ['Cranberry bauble', 'cranberry bauble', 'a deep red ball with a cream top band', 'winter-frost', 'sphere', 'sb'],
  ['Pine bauble', 'pine bauble', 'a dark green ball with a gold hanging loop', 'winter-frost', 'sphere', 'sb'],
  ['Gold spiral bauble', 'gold spiral', 'ochre and cream spiralling from the ring', 'foxglove-autumn', 'sphere', 'si'],
  ['Midnight star bauble', 'midnight star', 'indigo with a scatter of gold knots', 'celestial-night', 'sphere', 'si'],
  ['Blush pearl bauble', 'blush pearl', 'a soft pink ball with a pearl bead top', 'vintage-tea', 'sphere', 'sb'],
  ['Ink drop bauble', 'ink drop', 'jet black with one white spiral line', 'elegant-mono', 'sphere', 'si'],
  ['Candy stripe bauble', 'candy stripe', 'red and white spiralling round the ball', 'candy-kawaii', 'sphere', 'si'],
  ['Ochre clay bauble', 'ochre clay', 'a matt clay ball with a leather cord', 'boho-earth', 'sphere', 'sb'],
  ['Sea glass bauble', 'sea glass bauble', 'washed green with a sand-coloured base', 'coastal-breeze', 'sphere', 'sb'],
  ['Toadstool bauble', 'toadstool bauble', 'a red ball with white french-knot spots', 'mushroom-woodland', 'sphere', 'si'],
  ['Snowberry bauble', 'snowberry', 'pure white with a green stitched stalk', 'winter-frost', 'sphere', 'sb'],
  ['Robin red bauble', 'robin red', 'a red breast patch on a brown ball', 'foxglove-autumn', 'sphere', 'si'],
  ['Silver birch bauble', 'silver birch', 'white with short dark dashes', 'scandi-calm', 'sphere', 'si'],
  ['Plum velvet bauble', 'plum velvet', 'a deep plum ball in velvet yarn', 'gothic-dusk', 'sphere', 'sb'],
  ['Wassail orange bauble', 'wassail orange', 'orange with clove-dot knots', 'foxglove-autumn', 'sphere', 'si'],
  ['Mistletoe bauble', 'mistletoe', 'pale green with two white bead berries', 'winter-frost', 'sphere', 'sb'],
  ['Bright pop bauble', 'bright pop bauble', 'four bold colours in a quartered spiral', 'bright-pop', 'sphere', 'si'],
  ['Nursery cloud bauble', 'nursery cloud', 'a pale blue ball with a stitched smile', 'nursery-pastel', 'sphere', 'sb'],
  ['Copper glow bauble', 'copper glow', 'copper thread carried through cream', 'vintage-tea', 'sphere', 'si'],
  ['Egg bauble', 'egg bauble', 'a speckled egg shape for a spring branch', 'nursery-pastel', 'sphere', 'sb'],
  ['Pumpkin ornament', 'pumpkin ornament', 'a ribbed orange ball with a green stalk', 'foxglove-autumn', 'sphere', 'si'],
  ['Ghost ornament', 'ghost ornament', 'a white ball with two stitched eyes', 'gothic-dusk', 'sphere', 'sb'],
  ['Bat ornament', 'bat ornament', 'a black ball with two folded wing flaps', 'gothic-dusk', 'sphere', 'si'],
  ['Acorn ornament', 'acorn ornament', 'a textured cup over a smooth nut', 'mushroom-woodland', 'sphere', 'si'],
  ['Chestnut ornament', 'chestnut ornament', 'glossy brown with a pale scar patch', 'mushroom-woodland', 'sphere', 'sb'],
  ['Snowman head ornament', 'snowman head', 'a white ball with coal knots and a scarf', 'winter-frost', 'sphere', 'si'],
  ['Christmas pudding ornament', 'pudding ornament', 'a brown ball with a white sauce cap', 'vintage-tea', 'sphere', 'si'],
  ['Bell ornament', 'bell ornament', 'a gold ball with a stitched clapper below', 'elegant-mono', 'sphere', 'si'],
  ['Heart bauble', 'heart bauble', 'a red ball with a stitched white heart', 'candy-kawaii', 'sphere', 'sb'],
  ['Moon bauble', 'moon bauble', 'a cream ball with crater knots', 'celestial-night', 'sphere', 'si'],
  ['Sun bauble', 'sun bauble', 'a gold ball with a ring of stitched rays', 'bright-pop', 'sphere', 'si'],
  ['Beach pebble ornament', 'beach pebble', 'a grey ball with a single white stripe', 'coastal-breeze', 'sphere', 'sb'],
  ['Yarn ball ornament', 'yarn ball ornament', 'a ball wound to look like wound yarn', 'candy-kawaii', 'sphere', 'si'],
  ['Fig ornament', 'fig ornament', 'a purple teardrop with a stitched stalk', 'gothic-dusk', 'sphere', 'si'],
  ['Sprout ornament', 'sprout ornament', 'a green ball with stitched leaf overlaps', 'wildflower-meadow', 'sphere', 'si'],
  ['Wren ornament', 'wren ornament', 'a small brown bird ball with a cocked tail', 'mushroom-woodland', 'sphere', 'si'],
  ['Ice blue drop', 'ice blue drop', 'a teardrop ball in graded blues', 'winter-frost', 'sphere', 'si'],
  ['Advent number bauble', 'advent bauble', 'a plain ball with a stitched number', 'scandi-calm', 'sphere', 'si'],
  ['Rosemary sprig bauble', 'rosemary bauble', 'grey-green with a stitched sprig', 'scandi-calm', 'sphere', 'si'],

  ['Easter egg covers', 'easter egg covers', 'six small crochet sleeves in different stitch patterns cover wooden or plastic 6 cm easter eggs for a table display or easter tree', 'candy-kawaii', 'sphere', 'sb', 'crochet-easter-egg-covers'],
  ['Pumpkin decoration', 'pumpkin decoration', 'the pumpkin body is a round ball worked from top to bottom', 'scandi-calm', 'sphere', 'mb', 'crochet-pumpkin-decoration'],
]

const PINCUSHION: Row[] = [
  ['Tomato pincushion', 'tomato pincushion', 'a ribbed red ball with a green calyx', 'bright-pop', 'sphere', 'si'],
  ['Mushroom cap pincushion', 'mushroom pincushion', 'a red cap with white knot spots', 'mushroom-woodland', 'sphere', 'si'],
  ['Moss ball pincushion', 'moss ball', 'a dense green ball, firm and heavy', 'wildflower-meadow', 'sphere', 'sb'],
  ['Wool bale pincushion', 'wool bale', 'a cream ball with a stitched twine cross', 'scandi-calm', 'sphere', 'sb'],
  ['Plum pincushion', 'plum pincushion', 'a deep purple ball with a stitched crease', 'gothic-dusk', 'sphere', 'sb'],
]

const BOOKMARK: Row[] = [
  ['Bramble bookmark', 'bramble', 'a plain berry-purple strip with a tassel', 'mushroom-woodland', 'grid-plain', 'sb'],
  ['Sea glass bookmark', 'sea glass bookmark', 'three washed greens in narrow bands', 'coastal-breeze', 'grid-stripe', 'sb'],
  ['Ink line bookmark', 'ink line', 'a black strip with one white stripe', 'elegant-mono', 'grid-stripe', 'sb'],
  ['Buttercup bookmark', 'buttercup bookmark', 'a plain sunny yellow strip', 'wildflower-meadow', 'grid-plain', 'sb'],
  ['Sunset bookmark', 'sunset bookmark', 'coral to gold in four graded bands', 'bright-pop', 'grid-stripe', 'sb'],
  ['Woodsmoke bookmark', 'woodsmoke bookmark', 'a plain grey-brown strip, quiet and thin', 'scandi-calm', 'grid-plain', 'sb'],
  ['Midnight bookmark', 'midnight bookmark', 'navy with two thin gold lines', 'celestial-night', 'grid-stripe', 'sb'],
  ['Tea rose bookmark', 'tea rose bookmark', 'a plain faded pink strip with a picot end', 'vintage-tea', 'grid-plain', 'sb'],
  ['Fern bookmark', 'fern bookmark', 'three greens light to dark down the strip', 'wildflower-meadow', 'grid-stripe', 'sb'],
  ['Terracotta bookmark', 'terracotta bookmark', 'a plain clay strip with a leather tie', 'boho-earth', 'grid-plain', 'sb'],
  ['Frost bookmark', 'frost bookmark', 'white and ice blue in even bands', 'winter-frost', 'grid-stripe', 'sb'],

  ['Irish bookmark', 'irish bookmark', 'the body is a narrow strip of double crochet', 'celestial-night', 'grid-plain', 'sb', 'irish-crochet-bookmark-crochet'],
]

const HEADBAND: Row[] = [
  ['Oat rib ear warmer', 'oat rib', 'a deep oatmeal post-rib band with a twist', 'scandi-calm', 'grid-postrib', 'sb'],
  ['Charcoal rib ear warmer', 'charcoal rib', 'a dark post-rib band with a wood button', 'elegant-mono', 'grid-postrib', 'sb'],
  ['Moss rib ear warmer', 'moss rib', 'a mid green rib band, seamed at the back', 'wildflower-meadow', 'grid-postrib', 'sb'],
  ['Rust rib ear warmer', 'rust rib', 'a warm rust band with a knotted centre', 'foxglove-autumn', 'grid-postrib', 'si'],
  ['Cream rib ear warmer', 'cream rib', 'a wide cream band, plain and soft', 'vintage-tea', 'grid-postrib', 'sb'],
  ['Navy rib ear warmer', 'navy rib', 'a deep navy band with a cream button', 'coastal-breeze', 'grid-postrib', 'sb'],
  ['Plum rib ear warmer', 'plum rib', 'a rich plum band with a bow at the side', 'gothic-dusk', 'grid-postrib', 'si'],
  ['Ice rib ear warmer', 'ice rib', 'a pale blue band with a silver thread', 'winter-frost', 'grid-postrib', 'sb'],
  ['Ochre rib ear warmer', 'ochre rib', 'a mustard band with a leather tab', 'boho-earth', 'grid-postrib', 'sb'],
  ['Blush rib ear warmer', 'blush rib', 'a soft pink band with a pearl button', 'candy-kawaii', 'grid-postrib', 'sb'],
  ['Slate rib ear warmer', 'slate rib', 'a mid grey band, narrow and neat', 'scandi-calm', 'grid-postrib', 'sb'],
  ['Forest rib ear warmer', 'forest rib', 'a deep green band with a crossed centre', 'mushroom-woodland', 'grid-postrib', 'si'],
  ['Berry rib ear warmer', 'berry rib', 'a raspberry band, wide enough for ears', 'bright-pop', 'grid-postrib', 'sb'],
  ['Sand rib ear warmer', 'sand rib', 'a pale sand band with a shell button', 'coastal-breeze', 'grid-postrib', 'sb'],
  ['Indigo rib ear warmer', 'indigo rib', 'a dark blue band with a gold stitch line', 'celestial-night', 'grid-postrib', 'si'],
  ['Heather rib ear warmer', 'heather rib', 'a mauve band, deep and soft', 'boho-earth', 'grid-postrib', 'sb'],
  ['Snow rib ear warmer', 'snow rib', 'a pure white band with a twisted front', 'winter-frost', 'grid-postrib', 'si'],
  ['Toffee rib ear warmer', 'toffee rib', 'a caramel band with a horn button', 'foxglove-autumn', 'grid-postrib', 'sb'],
  ['Sage rib ear warmer', 'sage rib', 'a soft grey-green band, wide and plain', 'wildflower-meadow', 'grid-postrib', 'sb'],
  ['Dove rib ear warmer', 'dove rib', 'a pale grey band with a knotted side', 'elegant-mono', 'grid-postrib', 'si'],
  ['Coral rib ear warmer', 'coral rib', 'a bright coral band for a dull day', 'bright-pop', 'grid-postrib', 'sb'],
  ['Fern rib ear warmer', 'fern rib', 'a green band with a darker seam line', 'mushroom-woodland', 'grid-postrib', 'sb'],
  ['Rose rib ear warmer', 'rose rib', 'a dusty rose band with a bow', 'vintage-tea', 'grid-postrib', 'si'],
  ['Buttermilk rib ear warmer', 'buttermilk rib', 'a cream band with a wide twist', 'nursery-pastel', 'grid-postrib', 'si'],
  ['Storm rib ear warmer', 'storm rib', 'a blue-grey band, thick and warm', 'coastal-breeze', 'grid-postrib', 'sb'],
  ['Bracken rib ear warmer', 'bracken rib', 'a russet band with a tan button', 'foxglove-autumn', 'grid-postrib', 'sb'],
]

/**
 * WALL HANGINGS — the tapestry-crochet lane. The colour changes stitch by
 * stitch, so the subject has to read at roughly 32 x 32 stitches: bold shapes,
 * few colours, no fine detail. Anything that would need a gradient belongs on
 * a shelf the engine cannot reach yet.
 */
const WALL_HANGING: Row[] = [
  ['Toadstool panel', 'toadstool', 'one red cap with white spots on cream', 'mushroom-woodland', 'grid-tapestry', 'mi'],
  ['Moon phase panel', 'moon phases', 'five moons waxing across an indigo ground', 'celestial-night', 'grid-tapestry', 'ma'],
  ['Mountain range panel', 'mountain range', 'three peaks in flat colour blocks', 'scandi-calm', 'grid-tapestry', 'mi'],
  ['Sun and rays panel', 'sun and rays', 'a gold disc with eight straight rays', 'bright-pop', 'grid-tapestry', 'mi'],
  ['Rainbow arc panel', 'rainbow arc', 'six stacked arcs on a cream ground', 'bright-pop', 'grid-tapestry', 'mi'],
  ['Wave panel', 'wave', 'a single curling wave in three blues', 'coastal-breeze', 'grid-tapestry', 'ma'],
  ['Shaggy cow panel', 'shaggy cow head', 'a fringed head in silhouette blocks', 'foxglove-autumn', 'grid-tapestry', 'ma'],
  ['Fox head panel', 'fox head', 'a geometric fox face in rust and cream', 'foxglove-autumn', 'grid-tapestry', 'mi'],
  ['Bee and hive panel', 'bee and hive', 'one striped bee above a stepped skep', 'foxglove-autumn', 'grid-tapestry', 'mi'],
  ['Cactus panel', 'cactus', 'three cacti in graded greens on sand', 'boho-earth', 'grid-tapestry', 'mi'],
  ['Lighthouse panel', 'lighthouse panel', 'a banded tower against a flat sky', 'coastal-breeze', 'grid-tapestry', 'ma'],
  ['Diamond kilim panel', 'kilim diamond', 'stacked diamonds in rust, teal and cream', 'boho-earth', 'grid-tapestry', 'ma'],
  ['Chevron panel', 'chevron', 'bold zigzags in four earth colours', 'boho-earth', 'grid-tapestry', 'mi'],
  ['Checkerboard panel', 'checkerboard', 'black and bone squares, eight by eight', 'elegant-mono', 'grid-tapestry', 'mi'],
  ['Heart panel', 'heart panel', 'one large heart centred on cream', 'candy-kawaii', 'grid-tapestry', 'mi'],
  ['North star panel', 'north star', 'one gold star centred on deep navy', 'celestial-night', 'grid-tapestry', 'mi'],
  ['Tulip row panel', 'tulip row', 'three upright tulips on a pale ground', 'candy-kawaii', 'grid-tapestry', 'mi'],
  ['Conifer row panel', 'conifer row', 'three stepped conifers in dark green', 'winter-frost', 'grid-tapestry', 'mi'],
  ['Cottage panel', 'cottage', 'a house with a pitched roof and one window', 'vintage-tea', 'grid-tapestry', 'ma'],
  ['Balloon over hills panel', 'balloon over hills', 'a striped balloon above a flat horizon', 'bright-pop', 'grid-tapestry', 'ma'],
  ['Whale panel', 'whale panel', 'a whale silhouette with a spout', 'coastal-breeze', 'grid-tapestry', 'mi'],
  ['Cat in a window panel', 'cat in a window', 'a black cat shape in a lit frame', 'gothic-dusk', 'grid-tapestry', 'ma'],
  ['Owl panel', 'owl panel', 'a blocky owl with two ring eyes', 'mushroom-woodland', 'grid-tapestry', 'mi'],
  ['Fern frond panel', 'fern frond', 'one frond in flat green steps', 'wildflower-meadow', 'grid-tapestry', 'mi'],
  ['Arch panel', 'arch', 'three nested arches in warm neutrals', 'scandi-calm', 'grid-tapestry', 'mi'],
  ['Sunset stripe panel', 'sunset stripe panel', 'seven bands from cream to deep red', 'bright-pop', 'grid-tapestry', 'mi'],
  ['Snowflake panel', 'snowflake panel', 'a six-arm flake in white on ice blue', 'winter-frost', 'grid-tapestry', 'ma'],
  ['Ammonite panel', 'ammonite panel', 'a stepped spiral in stone colours', 'scandi-calm', 'grid-tapestry', 'ma'],
  ['Eye panel', 'eye', 'a single stylised eye in bone and black', 'elegant-mono', 'grid-tapestry', 'ma'],
  ['Hand panel', 'open hand', 'a flat hand shape with a heart in the palm', 'boho-earth', 'grid-tapestry', 'ma'],
  ['Mushroom trio panel', 'mushroom trio', 'three toadstools of different heights', 'mushroom-woodland', 'grid-tapestry', 'ma'],

  ['Mobile hanging', 'mobile hanging', 'make 4 small circle motifs for the bottom tier, 2 leaf shapes for the middle, and 2 small stars for the top tier', 'foxglove-autumn', 'grid-tapestry', 'lb', 'crochet-mobile-hanging'],
  ['Hanging wall star', 'hanging wall star', 'each panel starts at the centre back of the star and works outward through five points, turning with a point turn at each tip', 'mushroom-woodland', 'grid-tapestry', 'lb', 'hanging-wall-star'],
]

// ─────────────────────────────────────────────────────────────────────────────
// SHELVES THE LOOM CANNOT BUILD YET
//
// Theme lists, not named patterns. The length of a list is a demand signal for
// the engine roadmap: the longest lists here (blankets, hats, bags, garments)
// are the shelves the market wants most and the loom can build least, so they
// are where colourwork beyond stripes, tube shaping and garment grading pay off
// first. Each theme still carries a colourway so a future planner can dress it.
// ─────────────────────────────────────────────────────────────────────────────

const THEMES_HOME: Record<string, Theme[]> = {
  blanket: [
    ['Moon phase throw', 'eight moons waxing to full across indigo', 'celestial-night'],
    ['Wildflower meadow throw', 'scattered bloom motifs joined across cream', 'wildflower-meadow'],
    ['Colour block ripple', 'oatmeal and dusty blue with one terracotta stripe', 'scandi-calm'],
    ['Toadstool meadow baby blanket', 'rows of red caps among textured grass', 'mushroom-woodland'],
    ['Patchwork granny throw', 'sixty small squares joined as you go', 'bright-pop'],
    ['Corner to corner sunset', 'a diagonal gradient from cream to deep red', 'foxglove-autumn'],
    ['Highland tartan throw', 'crossed bands in heritage colours', 'gothic-dusk'],
    ['Nordic snowfall blanket', 'white on white with a scattered flake motif', 'winter-frost'],
    ['Rainbow ripple pram blanket', 'seven graded ripple bands', 'bright-pop'],
    ['Hexagon honeycomb throw', 'gold and amber hexagons joined edge to edge', 'foxglove-autumn'],
    ['Woodland creature blanket', 'a fox, an owl and a hedgehog in tapestry blocks', 'mushroom-woodland'],
    ['Seaside stripe blanket', 'navy, white and sand in uneven bands', 'coastal-breeze'],
    ['Chunky cocoon blanket', 'jumbo yarn worked in one huge stitch', 'scandi-calm'],
    ['Tea rose bedspread', 'faded rose motifs on a sage ground', 'vintage-tea'],
    ['Star quilt blanket', 'eight-point stars in a repeating grid', 'celestial-night'],
    ['Log cabin lap blanket', 'squares built outwards in tonal steps', 'boho-earth'],
    ['Bobble cloud baby blanket', 'raised clouds on a pale blue ground', 'nursery-pastel'],
    ['Autumn leaf throw', 'falling leaves in rust, mustard and plum', 'foxglove-autumn'],
    ['Weighted lap blanket', 'a dense heavy square for calm', 'scandi-calm'],
  
    ['Broomstick lace baby blanket', 'this blanket works petal rows throughout, then finishes with a double crochet border to keep the edges neat', 'bright-pop', 'broomstick-lace-baby-blanket-crochet'],
    ['Crocodile stitch accent blanket', 'a crocodile stitch accent blanket is 60 x 80 cm', 'candy-kawaii', 'crocodile-stitch-accent-blanket'],
    ['Filet mesh baby blanket', 'a filet mesh baby blanket is 70 x 80 cm', 'scandi-calm', 'filet-mesh-baby-blanket'],
    ['Granny square join blanket', 'a granny square join blanket is made from 42 classic four-round squares', 'elegant-mono', 'granny-square-join-blanket'],
    ['Magic ring granny motif blanket', 'a magic ring granny motif blanket is approximately 88 x 88 cm built from 121 small 4-round granny motifs', 'boho-earth', 'magic-ring-granny-motif-blanket'],
    ['Solomon\'s knot throw', 'a solomon\'s knot throw is 90 x 100 cm', 'vintage-tea', 'solomons-knot-throw'],
    ['Spider stitch baby blanket', 'a spider stitch baby blanket is 75 x 90 cm', 'gothic-dusk', 'spider-stitch-baby-blanket'],
  ],
  cushion: [
    ['Sunburst cushion', 'a raised centre boss with radiating colour', 'boho-earth'],
    ['Tapestry mountain cushion', 'a flat peak scene in three colours', 'scandi-calm'],
    ['Bobble stripe bolster', 'raised bobble bands along a tube', 'candy-kawaii'],
    ['Moon face cushion', 'a round cream cushion with stitched features', 'celestial-night'],
    ['Tasselled kilim cushion', 'a woven-look front with corner tassels', 'boho-earth'],
    ['Fringed lumbar cushion', 'a long rectangle with a deep fringe', 'foxglove-autumn'],
    ['Ribbed cable cushion', 'post stitches worked as fake cables', 'winter-frost'],
    ['Seashell cushion', 'a shell motif in sand and chalk', 'coastal-breeze'],
    ['Colour block round cushion', 'quartered colours on a flat disc', 'elegant-mono'],
    ['Velvet puff cushion', 'puff stitches in velvet yarn', 'gothic-dusk'],
    ['Daisy chain cushion', 'a ring of joined daisies on cream', 'wildflower-meadow'],
  
    ['Boho tassel cushion cover', 'both panels are worked in rows of double crochet', 'winter-frost', 'boho-tassel-cushion-cover'],
    ['Broomstick lace cushion cover', 'the front is a broomstick lace square in chunky yarn', 'wildflower-meadow', 'broomstick-lace-cushion-cover-crochet'],
    ['Button-fastening cushion cover', 'the back is made from two overlapping panels rather than one', 'foxglove-autumn', 'button-fastening-cushion-cover'],
    ['Crocodile stitch cushion cover', 'each crocodile scale is built on a v-frame of two trebles', 'mushroom-woodland', 'crocodile-stitch-cushion-cover'],
    ['Fan stitch rectangular cushion', 'seven trebles fan into each chain space, with an anchor dc at the centre of each fan in the next row', 'nursery-pastel', 'fan-stitch-rectangular-cushion'],
    ['Granny square cushion cover', 'this cushion cover uses two large granny cluster squares, each grown to 40 cm', 'celestial-night', 'granny-square-cushion-cover'],
    ['Mini granny hexagon cushion', 'each hexagon uses six granny clusters per round, one at each side', 'bright-pop', 'mini-granny-hexagon-cushion'],
    ['Neck rest cushion cover', 'two flat circles grow from a magic ring to 30 cm using dc in the round with 6 increases per round', 'candy-kawaii', 'neck-rest-cushion-cover'],
    ['Spider stitch cushion cover', 'the spider stitch draws up loops from four points and crosses them at the centre', 'scandi-calm', 'spider-stitch-cushion-cover'],
    ['Star stitch cushion cover', 'each star stitch draws up five loops and closes through an eye', 'elegant-mono', 'star-stitch-cushion-cover'],
    ['Tunisian honeycomb cushion cover', 'the honeycomb stitch is built from a two-row repeat', 'boho-earth', 'tunisian-honeycomb-cushion-crochet'],
  ],
  basket: [
    ['Firewood log carrier', 'a flat sling with two rigid handles', 'mushroom-woodland'],
    ['Under-bed storage box', 'a large soft box with a stiffened rim', 'scandi-calm'],
    ['Wall-hung post caddy', 'a flat-backed pocket for letters', 'vintage-tea'],
    ['Picnic cutlery caddy', 'a divided round with a centre post', 'wildflower-meadow'],
    ['Toadstool storage basket', 'a cream stalk body under a spotted lid', 'mushroom-woodland'],
    ['Rope coil laundry basket', 'crocheted over a rope core, tall and stiff', 'scandi-calm'],
    ['Hexagon desk tidy', 'a six-sided pot with a folded rim', 'elegant-mono'],
    ['Bathroom cotton basket', 'a soft-sided pot for cotton rounds', 'coastal-breeze'],
    ['Toy storage tub', 'a very large soft-sided tub with handles', 'nursery-pastel'],
    ['Wall pocket basket', 'a half-basket that hangs flat', 'boho-earth'],
    ['Lidded trinket pot', 'a small pot with a fitted domed lid', 'candy-kawaii'],
  
    ['Bathroom storage basket', 'a bathroom storage basket is 30 cm across and 10 cm tall', 'elegant-mono', 'bathroom-storage-basket'],
    ['Bedroom catch-all tray', 'a bedroom catch-all tray is 20 cm across and only 5 cm tall', 'boho-earth', 'bedroom-catch-all-tray'],
    ['Bread basket liner', 'work a flat circle in double crochet from a magic ring, adding 6 dc per round until the circle reaches 30 cm', 'vintage-tea', 'bread-basket-liner'],
    ['Catch-all entry basket', 'a catch-all entry basket is 35 x 20 cm and only 8 cm tall', 'gothic-dusk', 'catch-all-entry-basket'],
    ['Decorative bowl centrepiece', 'the base grows from a magic ring to 20 cm using standard dc increase rounds', 'coastal-breeze', 'decorative-bowl-centrepiece'],
    ['Fruit bowl basket', 'a fruit bowl basket is 28 cm across and 8 cm tall', 'winter-frost', 'fruit-bowl-basket'],
    ['Handled market basket', 'a handled market basket is 22 cm across and 15 cm tall', 'wildflower-meadow', 'handled-market-basket'],
    ['Laundry basket', 'a laundry basket is 35 cm across and 45 cm tall', 'foxglove-autumn', 'laundry-basket'],
    ['Lidded trinket box', 'a lidded trinket box is 12 cm across and 8 cm tall', 'mushroom-woodland', 'lidded-trinket-box'],
    ['Log holder basket', 'a log holder basket is 50 x 30 cm and 40 cm tall, worked in thick rope on a 12 mm hook', 'nursery-pastel', 'log-holder-basket'],
    ['Market tote basket', 'a market tote basket is 22 cm across and 25 cm tall with two 45 cm strap handles', 'celestial-night', 'market-tote-basket'],
    ['Mini trinket basket', 'a mini trinket basket is 10 cm across and 7 cm tall', 'bright-pop', 'mini-trinket-basket'],
    ['Nesting basket set', 'a nesting basket set is three round baskets in super-chunky rope on a 10 mm hook', 'candy-kawaii', 'nesting-basket-set'],
    ['Oval basket', 'an oval basket is 30 x 20 cm and 10 cm tall', 'scandi-calm', 'oval-basket'],
    ['Picnic storage basket', 'a picnic storage basket is 30 x 20 cm and 15 cm tall', 'elegant-mono', 'picnic-storage-basket'],
    ['Small coiled rope basket', 'a small coiled rope basket is 18 cm across and 8 cm tall', 'boho-earth', 'small-coiled-rope-basket'],
    ['Storage pot cover', 'a ribbed dc cylinder slips over a standard 12 cm storage pot or metal tin. front post and back post double crochet give it a stretchy ribbed fit', 'vintage-tea', 'storage-pot-cover'],
    ['Tall round basket', 'a tall round basket is 25 cm across and 30 cm tall', 'gothic-dusk', 'tall-round-basket'],
  ],
  rug: [
    ['Round rag rug', 'thick t-shirt yarn worked in a spiral', 'boho-earth'],
    ['Chevron bath mat', 'zigzag bands in cotton', 'coastal-breeze'],
    ['Loop pile bedside rug', 'a shaggy loop-stitch rectangle', 'scandi-calm'],
    ['Doorstep coir-look mat', 'a stiff dense rectangle in jute tones', 'mushroom-woodland'],
    ['Daisy field rug', 'joined flower motifs across a green ground', 'wildflower-meadow'],
    ['Colour block runner', 'four blocks along a long narrow rug', 'elegant-mono'],
    ['Spiral stripe round rug', 'a spiral of colour from the centre out', 'bright-pop'],
    ['Sheepskin-look rug', 'loop stitch in undyed cream', 'winter-frost'],
    ['Hexagon patchwork rug', 'joined hexagons in warm neutrals', 'boho-earth'],
    ['Nursery cloud rug', 'a cloud-shaped mat in soft pastels', 'nursery-pastel'],
    ['Moon rug', 'a crescent-shaped bedside mat', 'celestial-night'],
    ['Striped kitchen runner', 'a long thin mat in kitchen brights', 'candy-kawaii'],
  
    ['Basket weave door mat', 'a basket weave door mat is a 40 × 60 cm mat in chunky cotton worked in alternating columns of front and back post stitches', 'vintage-tea', 'basket-weave-door-mat'],
    ['Coiled rope rug', 'a 50 cm round rug made from thick cotton rope coiled in a flat spiral and joined with double crochet stitches through the rope. no yarn: works with 5 mm cotton macramé rope. advanced due to the tension needed to keep the coil flat', 'gothic-dusk', 'coiled-rope-rug'],
    ['Oval doorstep mat', 'the mat starts with an oval base worked along a 30 cm foundation chain', 'coastal-breeze', 'oval-doorstep-mat'],
    ['Striped rectangle rug', 'a striped rectangle rug is 50 × 80 cm of chunky cotton worked flat in double crochet with 4-row stripes in two colours', 'winter-frost', 'striped-rectangle-rug'],
  ],
  'plant-hanger': [
    ['Hanging terrarium sling', 'a cradle sized for a glass globe', 'celestial-night'],
    ['Balcony rail planter sling', 'a sling that hooks over a rail', 'coastal-breeze'],
    ['Minimalist plant cradle', 'wooden beads and a single tassel', 'scandi-calm'],
    ['Three-tier cascade hanger', 'three pots stepped down one cord', 'boho-earth'],
    ['Macrame-look knot hanger', 'square knots worked in crochet cord', 'boho-earth'],
    ['Window herb trio', 'three small pots on one rail', 'wildflower-meadow'],
    ['Fringed boho hanger', 'a deep fringe below the pot cradle', 'foxglove-autumn'],
    ['Leaf-edged pot cover', 'a sleeve with a leafy top edge', 'wildflower-meadow'],
    ['Beaded ceiling hanger', 'graded beads down four cords', 'elegant-mono'],
    ['Wall bracket pot sling', 'a flat-backed sling for a wall hook', 'scandi-calm'],
    ['Rope and ring hanger', 'a wooden ring with four cords', 'coastal-breeze'],
  
    ['Chunky rope plant hanger', 'a chunky rope plant hanger holds a large 15, 20 cm pot in a thick open-mesh cup worked from a magic ring', 'winter-frost', 'chunky-rope-plant-hanger'],
    ['Single-tier cotton plant hanger', 'a single-tier cotton plant hanger holds one pot', 'wildflower-meadow', 'cotton-plant-hanger-single-tier'],
    ['Herb pot trio covers', 'all three covers start from a flat magic ring base, then rise straight up in dc in the round', 'foxglove-autumn', 'herb-pot-trio-covers'],
    ['Mini cactus pot cover', 'the sleeve is a dc tube worked in the round', 'mushroom-woodland', 'mini-cactus-pot-cover'],
    ['Plant pot cover basket', 'a plant pot cover basket is 16 cm across and 15 cm tall', 'nursery-pastel', 'plant-pot-cover-basket'],
    ['Small-pot window hanger', 'a small-pot window hanger holds one 8, 10 cm pot on a window curtain rod or a nail, with a 25 cm total hanging length', 'celestial-night', 'small-pot-window-hanger'],
    ['Triple herb window hanger', 'a triple herb window hanger keeps three small 8 cm herb pots at the kitchen window on a wooden dowel or curtain rod', 'bright-pop', 'triple-herb-window-hanger'],
    ['Twin-pot plant hanger', 'a twin-pot plant hanger holds two 10, 12 cm pots side by side on a horizontal crochet bar', 'candy-kawaii', 'twin-pot-hanger'],
  ],
  bunting: [
    ['Spooky-cute Halloween bunting', 'pumpkins and friendly ghosts alternating', 'gothic-dusk'],
    ['Nursery cloud bunting', 'clouds and raindrops on a cotton cord', 'nursery-pastel'],
    ['Heart garland', 'small padded hearts on a chain', 'candy-kawaii'],
    ['Snowflake garland', 'stiffened white flakes on silver cord', 'winter-frost'],
    ['Star garland', 'five-point stars with a hanging loop', 'celestial-night'],
    ['Seaside flag bunting', 'navy, white and red flags', 'coastal-breeze'],
    ['Toadstool garland', 'red caps and cream stalks', 'mushroom-woodland'],
    ['Name bunting letters', 'individual letters to spell a name', 'nursery-pastel'],
    ['Daisy chain garland', 'joined daisies on a green cord', 'wildflower-meadow'],
    ['Egg garland', 'speckled eggs for a spring branch', 'nursery-pastel'],
  
    ['Heart bunting', 'each heart is made of two flat panels', 'bright-pop', 'heart-bunting'],
    ['Snowflake bunting', 'each snowflake works from a central ring outward through six arms', 'candy-kawaii', 'snowflake-bunting'],
    ['Triangle pennant bunting', 'each triangle starts at the wide top edge and tapers to a point', 'scandi-calm', 'triangle-pennant-bunting'],
  ],
  'pet-bed': [
    ['Round cat nest', 'a raised rim over a padded disc', 'scandi-calm'],
    ['Cat cave', 'an enclosed dome with a front opening', 'boho-earth'],
    ['Small dog donut bed', 'a stuffed ring around a flat base', 'foxglove-autumn'],
    ['Radiator cat hammock', 'a sling that hooks over a rail', 'vintage-tea'],
    ['Puppy blanket', 'a small washable throw for a crate', 'nursery-pastel'],
    ['Guinea pig tunnel', 'a soft open tube to hide in', 'wildflower-meadow'],
    ['Cat play mat', 'a flat mat with a hanging toy', 'bright-pop'],
    ['Pet basket liner', 'a fitted cushion for a wicker basket', 'mushroom-woodland'],
    ['Window ledge cat mat', 'a long thin sunbathing mat', 'coastal-breeze'],
    ['Rabbit hay bag', 'a hanging pouch for hay', 'wildflower-meadow'],
  ],
  pouffe: [
    ['Chunky floor pouffe', 'jumbo yarn worked over a firm insert', 'scandi-calm'],
    ['Striped drum pouffe', 'a tall cylinder in wide colour bands', 'bright-pop'],
    ['Boho tasselled pouffe', 'four corner tassels and a woven look', 'boho-earth'],
    ['Cable-look footstool cover', 'post stitches worked as fake cables', 'winter-frost'],
    ['Round meditation cushion', 'a firm disc with a carry handle', 'elegant-mono'],
    ['Nursery cloud pouffe', 'a soft low seat shaped like a cloud', 'nursery-pastel'],
    ['Kilim square pouffe', 'a flat woven-look top panel', 'boho-earth'],
    ['Velvet bobble pouffe', 'raised bobbles all over a deep colour', 'gothic-dusk'],
    ['Two-tone half pouffe', 'split colour top and bottom', 'elegant-mono'],
    ['Rope coil pouffe', 'crocheted over a thick rope core', 'coastal-breeze'],
  
    ['Striped floor cushion', 'two flat circles grow from a magic ring to 60 cm using standard dc increase rounds', 'gothic-dusk', 'striped-floor-cushion'],
  ],
}

/** Headwear, neckwear and wraps. Everything here needs tube shaping, crown
 *  decreases or a shaped triangle: none of it is in the engine today. */
const THEMES_WEAR: Record<string, Theme[]> = {
  hat: [
    ['Ribbed slouchy beanie', 'a deep folded brim and a soft slouch', 'scandi-calm'],
    ['Fair isle look beanie', 'a colourwork band round a plain crown', 'winter-frost'],
    ['Granny square bucket hat', 'six joined squares shaped into a bucket', 'bright-pop'],
    ['Bobble hat with a faux pom', 'a crocheted pom rather than fur', 'candy-kawaii'],
    ['Cabled beanie', 'post stitches worked as travelling cables', 'winter-frost'],
    ['Bear ear baby hat', 'two small round ears on a plain crown', 'nursery-pastel'],
    ['Newsboy cap', 'a panelled crown and a stiffened peak', 'vintage-tea'],
    ['Sun hat with a wide brim', 'raffia-look yarn and a stiff brim', 'coastal-breeze'],
    ['Cloche hat', 'a close 1920s shape with a side flower', 'vintage-tea'],
    ['Balaclava hood', 'a hood and neck in one piece', 'gothic-dusk'],
    ['Messy bun beanie', 'an open crown for a ponytail', 'boho-earth'],
    ['Fisherman rib watch cap', 'a dense rib in undyed wool', 'elegant-mono'],
    ['Striped beanie set', 'matching adult and child hats', 'bright-pop'],
    ['Mushroom cap hat', 'a red crown with white spots', 'mushroom-woodland'],
    ['Earflap hat with plaits', 'flaps with plaited ties', 'foxglove-autumn'],
    ['Turban headwrap hat', 'a twisted front and a smooth back', 'boho-earth'],
  
    ['Outdoor beanie', 'start with a magic ring', 'winter-frost', 'crochet-outdoor-beanie'],
    ['Children\'s beanie hat', 'start with a magic ring', 'wildflower-meadow', 'kids-beanie-hat-crochet'],
    ['Tunisian knit stitch beanie', 'the tunisian knit stitch creates a fabric that looks exactly like stocking stitch knitting', 'foxglove-autumn', 'tunisian-knit-stitch-hat-crochet'],
  ],
  scarf: [
    ['Chunky rib scarf', 'a wide dense rib in one colour', 'scandi-calm'],
    ['Rainbow gradient scarf', 'seven colours shading along the length', 'bright-pop'],
    ['Granny stripe scarf', 'classic granny clusters in stripes', 'foxglove-autumn'],
    ['Fringed blanket scarf', 'wide and short with a deep fringe', 'gothic-dusk'],
    ['Mesh summer scarf', 'an open mesh in cotton', 'coastal-breeze'],
    ['Pocket scarf', 'a pocket at each end for cold hands', 'winter-frost'],
    ['Bobble edge scarf', 'a plain body with bobbles down both edges', 'candy-kawaii'],
    ['Skinny neck tie scarf', 'a narrow strip to knot at the throat', 'elegant-mono'],
    ['Tapestry pattern scarf', 'a repeating geometric in two colours', 'boho-earth'],
    ['Baby stroller scarf', 'a short soft scarf with a button loop', 'nursery-pastel'],
    ['Mohair whisper scarf', 'a long light scarf in fuzzy yarn', 'vintage-tea'],
    ['Buttoned neck warmer', 'a short scarf that fastens flat', 'mushroom-woodland'],
    ['Colour block scarf', 'four solid blocks along the length', 'elegant-mono'],
  
    ['Autumn leaves scarf', 'a long scarf with a plain mesh body and a border strip of leaf motifs along both short ends', 'bright-pop', 'autumn-leaves-scarf-crochet'],
    ['Broomstick lace scarf', 'a classic long scarf worked in chunky yarn using broomstick lace. groups of loops are stretched over a large dowel and worked off together to create the signature petal clusters', 'candy-kawaii', 'broomstick-lace-scarf-crochet'],
    ['Filet lace scarf', 'a long scarf worked in filet mesh with a simple diamond filet motif repeated along the length', 'scandi-calm', 'filet-scarf-crochet'],
    ['Infinity lace scarf', 'an infinity scarf worked in the round as a long tube, then joined at the ends', 'elegant-mono', 'infinity-lace-scarf-crochet'],
    ['Mesh tube scarf', 'a tube scarf worked in the round in cotton sport yarn', 'boho-earth', 'mesh-tube-scarf-crochet'],
    ['Pineapple lace scarf', 'a long scarf built around a column of pineapple motifs running down the centre', 'vintage-tea', 'pineapple-lace-scarf-crochet'],
    ['Tunisian entrelac scarf', 'tunisian entrelac works row by row across a set of blocks', 'gothic-dusk', 'tunisian-entrelac-scarf-crochet'],
  ],
  cowl: [
    ['Chunky infinity cowl', 'a wide loop in jumbo yarn', 'scandi-calm'],
    ['Double wrap cowl', 'long enough to wrap twice', 'winter-frost'],
    ['Buttoned neck cowl', 'a flat band with three wooden buttons', 'mushroom-woodland'],
    ['Ribbed snood', 'a dense vertical rib tube', 'elegant-mono'],
    ['Mesh cotton cowl', 'a light open loop for summer', 'coastal-breeze'],
    ['Bobble cowl', 'raised bobbles scattered on a plain ground', 'candy-kawaii'],
    ['Colour block cowl', 'three solid bands round the loop', 'bright-pop'],
    ['Hooded cowl', 'a cowl that pulls up into a hood', 'gothic-dusk'],
    ['Faux cable cowl', 'post-stitch cables round the tube', 'winter-frost'],
    ['Mohair cloud cowl', 'a very light halo of fuzzy yarn', 'vintage-tea'],
    ['Child button cowl', 'a safe short loop for a child', 'nursery-pastel'],
    ['Tapestry band cowl', 'one colourwork band on a plain tube', 'boho-earth'],
  
    ['Broomstick lace cowl', 'this cowl uses a short flat panel in broomstick lace, then closes it with a cowl seam', 'scandi-calm', 'broomstick-lace-cowl-crochet'],
    ['Neck cowl shawl hybrid', 'this rectangle works up quickly on a 4 mm hook in dk yarn and sits at the borderline between a neck scarf and a shawl', 'elegant-mono', 'crochet-neck-cowl-shawl'],
    ['Tunisian smock stitch cowl', 'the smock stitch is worked in two stages', 'boho-earth', 'tunisian-smock-stitch-cowl-crochet'],
  ],
  shawl: [
    ['Faroese shoulder shawl', 'a shaped back gusset that stays put', 'winter-frost'],
    ['Ruffled tier shawlette', 'three gathered tiers down the back', 'candy-kawaii'],
    ['Reversible two-face shawl', 'a different colour on each side', 'elegant-mono'],
    ['Triangle shawl with a picot edge', 'a classic top-down triangle', 'wildflower-meadow'],
    ['Mohair evening wrap', 'a light rectangle for an evening out', 'elegant-mono'],
    ['Gradient sunset shawl', 'a colour shift from cream to deep red', 'foxglove-autumn'],
    ['Half hexagon shawl', 'built from joined half hexagons', 'boho-earth'],
    ['Beaded lace shawl', 'beads worked into the edging', 'celestial-night'],
    ['Boomerang shawl', 'an asymmetric shape with a long tail', 'gothic-dusk'],
    ['Summer cotton shawlette', 'a small light shawl for warm days', 'coastal-breeze'],
    ['Winter wool shoulder shawl', 'a thick square folded on the bias', 'winter-frost'],
  
    ['Asymmetric lace shawl', 'the asymmetric shawl grows by increasing at one end only on every row', 'scandi-calm', 'asymmetric-lace-shawl-crochet'],
    ['Beach cover shawl', 'a beach cover shawl is a 200 x 90 cm rectangle of open mesh worked in cotton sport weight on a 4 mm hook', 'elegant-mono', 'beach-cover-shawl-crochet'],
    ['Boho lace shawl', 'the boho shawl grows from a crescent spine outward', 'boho-earth', 'boho-lace-shawl-crochet'],
    ['Bridal lace shawl', 'the bridal shawl is worked from the top neck edge downward', 'vintage-tea', 'bridal-lace-shawl-crochet'],
    ['Broomstick lace triangular shawl', 'this shawl grows from a 3-stitch cast-on at the top edge', 'gothic-dusk', 'broomstick-lace-shawl-crochet'],
    ['Crescent lace shawl', 'the crescent shawl curves because you add stitches faster at the outer edge than at the inner edge', 'winter-frost', 'crescent-lace-shawl-crochet'],
    ['Asymmetric Wedge Shawl', 'this shawl is a wedge shape measuring approximately 130cm along the long straight edge and 65cm at the widest point', 'wildflower-meadow', 'crochet-asymmetric-wedge-shawl'],
    ['Baby Christening Shawl in Openwork Lace', 'this shawl is a 100cm square worked in lace weight yarn on a 2.5mm hook', 'foxglove-autumn', 'crochet-baby-christening-shawl-lace'],
    ['Folk striped shawl', 'this rectangular shawl works in horizontal treble stripes across three colours of dk yarn, with a colour change every four rows. the finished piece measures approximately 190 cm wide by 60 cm deep. the stripe sequence builds a bold folk-textile look that works in any combination of three coordinating shades', 'nursery-pastel', 'crochet-folk-striped-shawl'],
    ['Granny square rectangle shawl', 'this rectangle shawl is built from 100 granny squares arranged in a 5-wide by 20-long grid', 'celestial-night', 'crochet-granny-square-rectangle-shawl'],
    ['Meditation comfort shawl', 'this shawl uses a dc-treble column pattern throughout: each stitch in a row sits directly above the same stitch type in the row below', 'bright-pop', 'crochet-meditation-comfort-shawl'],
    ['Merino heirloom shawl', 'this shawl is based on a triangular lace construction published in weldon\'s practical crochet in 1890', 'candy-kawaii', 'crochet-merino-heirloom-shawl'],
    ['Mosaic rectangle shawl', 'this rectangular shawl uses mosaic crochet to place a two-colour geometric repeat across 175 cm of dk fabric on a 4 mm hook', 'scandi-calm', 'crochet-mosaic-shawl-blo'],
    ['Pineapple lace shawl', 'pineapple crochet is one of the most recognisable victorian lace patterns', 'elegant-mono', 'crochet-pineapple-lace-shawl'],
    ['Classic Prayer Shawl', 'this shawl is a straightforward top-down triangle measuring about 165cm across the top edge and 65cm from the top to the lower point', 'boho-earth', 'crochet-prayer-shawl-classic'],
    ['Triangle shawl with shell border', 'this top-down triangular shawl grows from a chain-2 spine into a full triangle in half treble, then gains a shell-stitch border along the lower two edges. finished size is roughly 145 cm wide and 70 cm deep in dk cotton on a 4.5 mm hook. the half treble body gives a dense, warm fabric; the shell border adds decorative width', 'gothic-dusk', 'crochet-triangle-shawl-shell-border'],
    ['Victorian collar shawlette', 'this collar shawlette works a scalloped lace edging in fingering-weight cotton on a 3 mm hook. each scallop unit is dc, ch 3, sl st, repeated across the row, with a shallow curve built by short-row shaping on the straight upper edge. finished size is approximately 80 cm wide by 25 cm deep. the pattern is adapted from weldon\'s practical crochet (1886)', 'coastal-breeze', 'crochet-victorian-collar-shawlette'],
    ['Filet shawl', 'a filet crochet shawl is a triangular piece 170 cm across the wingspan and 80 cm deep at the centre back', 'winter-frost', 'filet-crochet-shawl'],
    ['Vintage lace shawl', 'the vintage shawl alternates rows of treble clusters with open chain arches', 'mushroom-woodland', 'vintage-lace-shawl-crochet'],
  ],
  beret: [
    ['Slouchy wool beret', 'a soft flat crown and a snug band', 'scandi-calm'],
    ['Tam with a bobble', 'a wide tam and a crocheted pom', 'winter-frost'],
    ['Ribbed band beret', 'a deep rib band under a plain crown', 'elegant-mono'],
    ['Spiral crown beret', 'a visible spiral from the centre out', 'boho-earth'],
    ['Fair isle look tam', 'a colourwork band round the widest point', 'foxglove-autumn'],
    ['Cotton summer beret', 'a light open crown for warm days', 'coastal-breeze'],
    ['Velvet beret', 'a rich pile in a deep colour', 'gothic-dusk'],
    ['Child beret with a flower', 'a small beret with a corsage', 'candy-kawaii'],
    ['Tweed-look beret', 'flecked yarn in a heritage colour', 'mushroom-woodland'],
    ['Beret and mitts set', 'a matching pair in one colourway', 'vintage-tea'],
  ],
  wrap: [
    ['Fringed blanket wrap', 'a big rectangle to wear as a stole', 'gothic-dusk'],
    ['Mohair evening stole', 'a fine light wrap with a beaded edge', 'elegant-mono'],
    ['Granny stripe wrap', 'wide granny stripes in a long rectangle', 'bright-pop'],
    ['Travel wrap with a pocket', 'a wrap with one hidden pocket', 'scandi-calm'],
    ['Boho tassel wrap', 'four corner tassels and a woven look', 'boho-earth'],
    ['Mesh beach wrap', 'an open cotton mesh over swimwear', 'coastal-breeze'],
    ['Bridal lace stole', 'a fine ivory wrap for a wedding', 'vintage-tea'],
    ['Gradient rectangle wrap', 'a slow colour shift end to end', 'foxglove-autumn'],
    ['Reversible two-colour wrap', 'a different colour on each face', 'elegant-mono'],
    ['Weighted comfort wrap', 'a heavy wrap for calm', 'winter-frost'],
  
    ['Newborn cocoon swaddle wrap', 'begin at the base with an oval base : chain 6, work 3 increasing rounds to form a small oval', 'elegant-mono', 'baby-cocoon-wrap-crochet'],
    ['Basketweave Rectangle Wrap', 'a chunky rectangular wrap worked in alternating panels of front-post and back-post trebles to create a raised basketweave effect. aran weight yarn on a 5mm hook gives firm, structured fabric with satisfying depth', 'boho-earth', 'crochet-basketweave-rectangle-wrap'],
    ['Boho fringed wrap', 'this wrap is a straightforward rectangle of treble crochet in chunky yarn on a 6 mm hook', 'vintage-tea', 'crochet-boho-fringed-wrap'],
    ['Lace stole in Solomon\'s knot', 'solomon\'s knot is an elongated chain with a locking single crochet worked into the back loop, the result is an open, spiderweb lace fabric that uses very little yarn. this rectangular stole in lace-weight cotton is worked lengthwise, 200 cm long and 55 cm wide, on a 3 mm hook. the fabric is extremely light and drapes in long, fluid folds', 'gothic-dusk', 'crochet-lace-stole-solomon-knot'],
    ['Linen summer wrap', 'this wrap uses a dc mesh throughout: one double crochet (uk), one chain, one skipped stitch, repeated across the row', 'coastal-breeze', 'crochet-linen-summer-wrap'],
  ],
  poncho: [
    ['Wearable blanket poncho', 'a big rectangle with a neck slit', 'foxglove-autumn'],
    ['Buttoned shoulder cape', 'a short cape with three shoulder buttons', 'vintage-tea'],
    ['Fringed festival poncho', 'a deep fringe all round the hem', 'boho-earth'],
    ['Hooded child poncho', 'a hood and a front pocket', 'nursery-pastel'],
    ['Mesh beach poncho', 'open cotton to throw over swimwear', 'coastal-breeze'],
    ['Cape with a button collar', 'a shaped shoulder and a high collar', 'gothic-dusk'],
    ['Chunky winter poncho', 'jumbo yarn with a folded neck', 'winter-frost'],
    ['Tapestry pattern poncho', 'a bold repeating geometric', 'boho-earth'],
    ['Ruana open wrap', 'an open front with no seam', 'scandi-calm'],
    ['Bobble hem poncho', 'bobbles all along the lower edge', 'candy-kawaii'],
    ['Lace summer poncho', 'a light openwork body in cotton', 'wildflower-meadow'],
  
    ['Granny square poncho', 'work four large granny squares each 30 cm across', 'foxglove-autumn', 'granny-square-poncho-crochet'],
  ],
}

/** Hands, feet and legs. Thumb gussets, heel turns and toe decreases. */
const THEMES_EXTREMITIES: Record<string, Theme[]> = {
  slippers: [
    ['Ballet flat slippers', 'a low front and an elastic strap', 'nursery-pastel'],
    ['Chunky boot slippers', 'a high ankle and a folded cuff', 'winter-frost'],
    ['Loafer slippers with soles', 'a leather sole sewn on', 'mushroom-woodland'],
    ['Bear paw slippers', 'claw stitching and rounded toes', 'foxglove-autumn'],
    ['Mary jane slippers', 'a button strap across the foot', 'vintage-tea'],
    ['Moccasin slippers', 'a gathered toe seam and a fringe', 'boho-earth'],
    ['Slipper socks', 'a sock shape with a grippy sole', 'scandi-calm'],
    ['Toddler bootie slippers', 'a soft high ankle and a tie', 'nursery-pastel'],
    ['Sheepskin-look slippers', 'loop stitch lining in undyed cream', 'winter-frost'],
    ['Mule slippers', 'a backless slip-on', 'elegant-mono'],
    ['Bed socks with a ribbon', 'a lace top and a drawstring tie', 'candy-kawaii'],
  ],
  'fingerless-mitts': [
    ['Ribbed wrist warmers', 'a plain deep rib and a thumb hole', 'scandi-calm'],
    ['Cabled fingerless mitts', 'post-stitch cables up the back of the hand', 'winter-frost'],
    ['Long arm warmers', 'elbow length with a thumb gusset', 'gothic-dusk'],
    ['Lace wrist cuffs', 'a fine openwork cuff for evening', 'elegant-mono'],
    ['Tapestry pattern mitts', 'a two-colour repeat round the hand', 'boho-earth'],
    ['Convertible flip-top mitts', 'a flap that folds back over the fingers', 'mushroom-woodland'],
    ['Texting mitts', 'short cuffs and open fingertips', 'bright-pop'],
    ['Bobble edge mitts', 'a bobbled cuff on a plain hand', 'candy-kawaii'],
    ['Colour block mitts', 'three blocks up the arm', 'elegant-mono'],
    ['Child mitts on a cord', 'a pair joined by a cord through the sleeves', 'nursery-pastel'],
    ['Mohair wrist warmers', 'a light halo cuff', 'vintage-tea'],
    ['Gardening mitts', 'a tough cotton cuff and a reinforced palm', 'wildflower-meadow'],
  ],
  socks: [
    ['Ribbed everyday socks', 'a plain rib leg and a short row heel', 'scandi-calm'],
    ['Bed socks with a lace cuff', 'a soft loose leg and a tie', 'vintage-tea'],
    ['Striped sports socks', 'two contrast bands at the cuff', 'bright-pop'],
    ['Toe-up ankle socks', 'worked from the toe with a gusset', 'coastal-breeze'],
    ['Boot socks with a turned cuff', 'a thick leg to fold over a boot', 'foxglove-autumn'],
    ['Baby socks with a bootie cuff', 'a rolled top and a tie', 'nursery-pastel'],
    ['Cabled knee socks', 'travelling cables up the leg', 'winter-frost'],
    ['Slipper socks with grips', 'a fabric sole sewn on', 'mushroom-woodland'],
    ['Christmas stocking socks', 'a wearable pair to match a stocking', 'winter-frost'],
    ['Tabi split-toe socks', 'a divided toe worked in two parts', 'elegant-mono'],
  ],
  booties: [
    ['Mary jane baby booties', 'a strap and a shell button', 'nursery-pastel'],
    ['Ribbed cuff booties', 'a snug rib to stay on', 'scandi-calm'],
    ['Bunny ear booties', 'two soft ears at the ankle', 'candy-kawaii'],
    ['Trainer booties', 'a laced look with a contrast sole', 'bright-pop'],
    ['Christening booties', 'fine ivory with a picot edge', 'elegant-mono'],
    ['Boot-style booties', 'a high ankle with a folded cuff', 'mushroom-woodland'],
    ['Sandal booties', 'an open top for summer', 'coastal-breeze'],
    ['Bear paw booties', 'rounded toes and stitched claws', 'foxglove-autumn'],
    ['Preemie booties', 'very small and very soft', 'nursery-pastel'],
    ['Tie-front booties', 'a ribbon threaded through the ankle', 'vintage-tea'],
    ['Bootie and hat set', 'a matching pair and a cap', 'winter-frost'],
    ['Slipper booties with soles', 'a soft leather sole for a first walker', 'boho-earth'],
  ],
  mittens: [
    ['Fair isle look mittens', 'a colourwork band on the back of the hand', 'winter-frost'],
    ['Cabled mittens', 'post-stitch cables and a ribbed cuff', 'scandi-calm'],
    ['Child mittens on a string', 'joined by a long cord', 'nursery-pastel'],
    ['Thrummed lined mittens', 'a fleece-stuffed lining for deep cold', 'winter-frost'],
    ['Convertible mitten flaps', 'a flap over fingerless mitts', 'mushroom-woodland'],
    ['Lobster claw mittens', 'a split for two fingers', 'bright-pop'],
    ['Long gauntlet mittens', 'a cuff to the mid forearm', 'gothic-dusk'],
    ['Bear paw mittens', 'stitched claws on a round mitt', 'foxglove-autumn'],
    ['Tapestry pattern mittens', 'a repeating geometric round the hand', 'boho-earth'],
    ['Mohair lined mittens', 'a soft halo lining', 'vintage-tea'],
  ],
  gloves: [
    ['Five-finger everyday gloves', 'individual fingers and a thumb gusset', 'scandi-calm'],
    ['Lace evening gloves', 'a fine openwork to the wrist', 'elegant-mono'],
    ['Driving gloves', 'a short cuff and an open back', 'mushroom-woodland'],
    ['Opera length gloves', 'fine yarn to above the elbow', 'gothic-dusk'],
    ['Child five-finger gloves', 'small fingers and a snug rib cuff', 'nursery-pastel'],
    ['Tapestry cuff gloves', 'a colourwork band at the wrist', 'boho-earth'],
    ['Gardening gloves', 'tough cotton with a reinforced palm', 'wildflower-meadow'],
    ['Bridal lace gloves', 'ivory with a pearl button', 'vintage-tea'],
    ['Cycling gloves', 'padded palms and open fingertips', 'bright-pop'],
    ['Fingerless-to-full gloves', 'one pattern graded two ways', 'elegant-mono'],
  ],
  legwarmers: [
    ['Ribbed dance leg warmers', 'a long stretchy rib tube', 'candy-kawaii'],
    ['Chunky boot cuffs', 'a short cuff to show above a boot', 'foxglove-autumn'],
    ['Cabled leg warmers', 'travelling cables up the calf', 'winter-frost'],
    ['Baby leg warmers', 'soft short tubes for a crawler', 'nursery-pastel'],
    ['Striped retro leg warmers', 'bold 1980s colour bands', 'bright-pop'],
    ['Lace top leg warmers', 'an openwork frill at the knee', 'vintage-tea'],
    ['Slouchy ankle warmers', 'a loose gathered ankle', 'scandi-calm'],
    ['Tapestry band leg warmers', 'one colourwork band per leg', 'boho-earth'],
    ['Thigh-high leg warmers', 'a long tube with a ribbon tie', 'gothic-dusk'],
    ['Yoga leg warmers', 'a light cotton tube with a stirrup', 'coastal-breeze'],
  ],
}

/** Bags, small accessories and the kitchen shelves the engine cannot reach. */
const THEMES_CARRY: Record<string, Theme[]> = {
  bag: [
    ['Bobble bucket bag', 'a round base and a drawstring top', 'candy-kawaii'],
    ['Tapestry shopper', 'a two-colour geometric across the front', 'boho-earth'],
    ['Raffia beach basket bag', 'stiff paper yarn and leather handles', 'coastal-breeze'],
    ['Boho fringe shoulder bag', 'a long strap and a deep fringe', 'boho-earth'],
    ['Structured top-handle bag', 'a stiffened body and a short handle', 'elegant-mono'],
    ['Crossbody phone pouch', 'a small body on a long cord', 'scandi-calm'],
    ['Tote with an inside pocket', 'a lined tote with one patch pocket', 'mushroom-woodland'],
    ['Drawstring project bag', 'a wide base for a work in progress', 'wildflower-meadow'],
    ['Foldaway shopper', 'packs into its own pocket', 'bright-pop'],
    ['Bookbag with a flap', 'a buckled flap and a flat back', 'vintage-tea'],
    ['Weekend holdall', 'a big soft bag with two rope handles', 'foxglove-autumn'],
    ['Laptop sleeve bag', 'a padded sleeve with a strap', 'elegant-mono'],
    ['Half moon shoulder bag', 'a curved base and a short strap', 'gothic-dusk'],
    ['Baby changing bag', 'wipe-clean lining and a bottle pocket', 'nursery-pastel'],
  
    ['Broomstick lace handbag', 'the bag uses two matching broomstick lace panels joined by a narrow gusset strip', 'mushroom-woodland', 'broomstick-lace-bag-crochet'],
    ['Cotton bottle bag', 'a cotton bottle bag is a 25 cm circumference cylindrical carrier worked in double crochet from a circular base via a magic ring', 'nursery-pastel', 'cotton-bottle-bag'],
    ['Drawstring dry goods bag', 'a drawstring dry goods bag is a 15 × 20 cm closed-base cotton bag worked in double crochet from a magic ring', 'celestial-night', 'drawstring-dry-goods-bag'],
    ['Market shopper tote', 'work a 30 cm circular base from a magic ring, then continue straight up in dc rounds for 35 cm', 'bright-pop', 'market-shopper-tote'],
    ['Mesh produce bag', 'an open-mesh drawstring bag for loose fruit and vegetables: worked in a simple chain-space mesh in fingering cotton from the base upward. one size fits most produce. a beginner pattern in one ball', 'candy-kawaii', 'mesh-produce-bag'],
    ['Small string shopper bag', 'a small market bag 30 × 35 cm: worked flat in chain-space mesh in dk cotton string and joined at the sides, with two twisted handles. holds a standard small grocery shop. intermediate skill for the handle construction', 'scandi-calm', 'string-shopper-bag-small'],
    ['Tunisian mesh stitch market bag', 'this market bag uses tunisian mesh stitch throughout', 'elegant-mono', 'tunisian-mesh-stitch-market-bag-crochet'],
  ],
  purse: [
    ['Coin purse with a clasp', 'a metal frame sewn into the top', 'vintage-tea'],
    ['Zip pencil case', 'a flat rectangle with a sewn zip', 'bright-pop'],
    ['Card wallet', 'two card slots and a fold', 'elegant-mono'],
    ['Drawstring pouch', 'a round base and a cord top', 'boho-earth'],
    ['Make-up pouch', 'a wipe-clean lining and a zip', 'candy-kawaii'],
    ['Hook and notion pouch', 'divided pockets for crochet hooks', 'wildflower-meadow'],
    ['Phone pouch on a wrist strap', 'a snug pocket and a loop', 'coastal-breeze'],
    ['Tapestry clutch', 'a two-colour repeat with a wrist strap', 'boho-earth'],
    ['Beaded evening purse', 'beads worked into the fabric', 'gothic-dusk'],
    ['Passport wallet', 'a slim travel wallet with a pen loop', 'mushroom-woodland'],
    ['Toy coin purse for a child', 'a small bright purse with a button', 'nursery-pastel'],
  ],
  'hair-accessory': [
    ['Scrunchie set', 'three scrunchies in one colourway', 'candy-kawaii'],
    ['Bow hair clip', 'a stiffened bow on a metal clip', 'vintage-tea'],
    ['Flower hair pin', 'a small bloom on a kirby grip', 'wildflower-meadow'],
    ['Wide hair band', 'a fabric-backed band with a knot', 'scandi-calm'],
    ['Plaited headwrap', 'three strips plaited and joined', 'boho-earth'],
    ['Bun cover snood', 'a net to hold a bun in place', 'elegant-mono'],
    ['Baby head bow band', 'a soft band with an oversized bow', 'nursery-pastel'],
    ['Beaded hair tie', 'a tie with two wooden beads', 'mushroom-woodland'],
    ['Star hair clip set', 'three small stars on clips', 'celestial-night'],
    ['Shell hair pin', 'a small scallop on a pin', 'coastal-breeze'],
  
    ['Hair tie holder', 'work a flat circle base from a magic ring to 10 cm, then rise straight in dc for 8 cm', 'scandi-calm', 'hair-tie-holder'],
  ],
  jewellery: [
    ['Wrapped bead ring set', 'three fine rings with a seed bead', 'candy-kawaii'],
    ['Layered chain lariat', 'a long open-ended cord with two tassels', 'boho-earth'],
    ['Ear cuff pair', 'fine cord wrapped over a wire base', 'elegant-mono'],
    ['Beaded rope necklace', 'crochet cord with beads worked in', 'boho-earth'],
    ['Statement collar necklace', 'a stiffened lace collar', 'elegant-mono'],
    ['Hoop earrings', 'yarn worked over metal hoops', 'bright-pop'],
    ['Friendship bracelet set', 'three thin cords with a slide knot', 'candy-kawaii'],
    ['Pendant with a stone', 'a wrapped stone on a cord', 'scandi-calm'],
    ['Choker with a shell', 'a fine cord and a single shell', 'coastal-breeze'],
    ['Charm bracelet', 'tiny motifs on a chain', 'vintage-tea'],
    ['Star drop earrings', 'two small stars on hooks', 'celestial-night'],
  
    ['Flower brooch', 'work a magic ring, 10 dc', 'gothic-dusk', 'crochet-flower-brooch'],
    ['Irish rose brooch', 'the rose begins with a ring, then builds inner petals and outer petals in two separate rounds to give a layered look', 'coastal-breeze', 'irish-crochet-rose-brooch-crochet'],
  ],
  backpack: [
    ['Nappy backpack', 'a wipe-clean lining and a bottle pocket', 'nursery-pastel'],
    ['Boho fringed rucksack', 'a fringe across the flap', 'boho-earth'],
    ['Drawstring rucksack', 'a cord closure and two shoulder cords', 'boho-earth'],
    ['Child animal backpack', 'a face and ears on the flap', 'candy-kawaii'],
    ['Tapestry hiking pack', 'a two-colour geometric and a buckle', 'foxglove-autumn'],
    ['Mesh gym bag', 'a light open net with a cord', 'coastal-breeze'],
    ['Structured city backpack', 'a stiffened body and a padded back', 'elegant-mono'],
    ['Roll-top backpack', 'a rolled and clipped top', 'scandi-calm'],
    ['Toddler reins backpack', 'a small pack with a safety rein', 'nursery-pastel'],
    ['Laptop backpack', 'a padded sleeve inside a firm body', 'elegant-mono'],
    ['Festival mini backpack', 'a tiny pack on two thin cords', 'bright-pop'],
  ],
  belt: [
    ['Plaited waist belt', 'three strips plaited to a buckle', 'boho-earth'],
    ['Chunky rope tie belt', 'a thick cord tied at the front', 'scandi-calm'],
    ['Beaded festival belt', 'beads set along a flat band', 'bright-pop'],
    ['Corset lace belt', 'a wide band with eyelet lacing', 'gothic-dusk'],
    ['Skinny buckle belt', 'a narrow band and a small buckle', 'elegant-mono'],
    ['Fringed hip belt', 'a short belt with a hanging fringe', 'boho-earth'],
    ['Child dressing-up belt', 'a bright band with a felt buckle', 'candy-kawaii'],
    ['Obi-style wrap belt', 'a wide band that ties at the back', 'vintage-tea'],
    ['Rope sailor belt', 'a knotted cord with two rings', 'coastal-breeze'],
    ['Braided leather-look belt', 'a plait in leather-coloured cord', 'mushroom-woodland'],
  ],
  'tea-cosy': [
    ['Two-cup pot warmer', 'a small dome with a lift tab', 'scandi-calm'],
    ['Lift-off lid pot warmer', 'a top that comes away to pour', 'vintage-tea'],
    ['Ribbed thermal pot warmer', 'a dense rib that holds the heat', 'winter-frost'],
    ['Striped breakfast pot warmer', 'wide bands in three brights', 'bright-pop'],
    ['Bobble-topped pot warmer', 'a plain dome with a bobble handle', 'candy-kawaii'],
    ['Toadstool-topped pot warmer', 'a red spotted dome over cream', 'mushroom-woodland'],
    ['Classic two-pot tea cosy', 'a lined dome with two openings', 'vintage-tea'],
    ['Cafetiere cosy', 'a fitted sleeve with a button strap', 'scandi-calm'],
    ['Fair isle look tea cosy', 'a colourwork band round the dome', 'winter-frost'],
    ['Chicken egg cosies', 'four little hens with combs', 'bright-pop'],
    ['Floral vintage tea cosy', 'applied roses over a quilted dome', 'vintage-tea'],
  
    ['Boiled egg cosy set', 'each cosy starts at the top of the dome from a magic ring and grows outward to fit over the top of a boiled egg', 'winter-frost', 'boiled-egg-cosy-set'],
  ],
  towel: [
    ['Buttoned towel topper', 'a gathered top with a button loop', 'candy-kawaii'],
    ['Hanging hand towel', 'a cotton towel with a crochet hanger', 'coastal-breeze'],
    ['Hooded baby towel corner', 'a corner hood for a bath towel', 'nursery-pastel'],
    ['Face cloth set', 'three washcloths in graded colours', 'wildflower-meadow'],
    ['Guest towel edging', 'a shell edge sewn to a linen towel', 'vintage-tea'],
    ['Kitchen roll holder cover', 'a sleeve with a hanging tab', 'scandi-calm'],
    ['Beach towel corner tie', 'a loop and toggle to roll a towel', 'coastal-breeze'],
    ['Bath mitt', 'a soft washing mitt with a hanging loop', 'nursery-pastel'],
    ['Spa headband and cloth set', 'a wide band and two face cloths', 'elegant-mono'],
    ['Tea towel hanging loop', 'a buttoned tab sewn to a linen towel', 'mushroom-woodland'],
  ],
}

/** Garments. Every one needs grading, shaping and a schematic: the furthest
 *  from the engine and, on Ravelry and LoveCrafts, the most browsed. */
const THEMES_GARMENT: Record<string, Theme[]> = {
  cardigan: [
    ['Shawl collar wrap cardigan', 'a deep collar and a tie belt', 'foxglove-autumn'],
    ['Bell sleeve cardigan', 'a flared cuff and a fitted body', 'candy-kawaii'],
    ['Cropped shrug', 'a short body and a long sleeve', 'candy-kawaii'],
    ['Cabled boyfriend cardigan', 'post-stitch cables up both fronts', 'winter-frost'],
    ['Baby matinee jacket', 'a fine yoke and a ribbon tie', 'nursery-pastel'],
    ['Fitted button cardigan', 'shaped waist and five buttons', 'vintage-tea'],
    ['Bed jacket', 'a short light cardigan for sitting up', 'vintage-tea'],
    ['Fringed festival cardigan', 'a deep fringe along the hem', 'boho-earth'],
    ['Mohair open cardigan', 'a light halo with no fastening', 'vintage-tea'],
    ['Tapestry yoke cardigan', 'a colourwork band across the shoulders', 'foxglove-autumn'],
    ['Waffle textured cardigan', 'a raised grid over the whole body', 'scandi-calm'],
  
    ['Colour field cardigan', 'plan three colour fields across the back: left third in colour a', 'bright-pop', 'colour-field-cardigan-crochet'],
    ['Wedding shrug', 'work a single rectangle 120 cm wide by 55 cm tall using an open treble lace pattern', 'candy-kawaii', 'crochet-wedding-shrug'],
    ['Granny square cardigan', 'each granny square is 10 x 10 cm', 'scandi-calm', 'granny-square-cardigan'],
  ],
  'jumper-pullover': [
    ['Drop shoulder jumper', 'a simple boxy shape in aran wool', 'scandi-calm'],
    ['Fair isle look yoke jumper', 'a circular colourwork yoke', 'winter-frost'],
    ['Cropped boxy jumper', 'a short body and a wide neck', 'candy-kawaii'],
    ['Cabled fisherman jumper', 'travelling cables and a rolled neck', 'elegant-mono'],
    ['Mesh summer jumper', 'an open cotton stitch for warm days', 'coastal-breeze'],
    ['Baby jumper with a bear', 'a tapestry bear on the front', 'nursery-pastel'],
    ['Balloon sleeve jumper', 'a gathered full sleeve', 'vintage-tea'],
    ['Colour block raglan', 'raglan seams in contrast colour', 'elegant-mono'],
    ['Christmas jumper', 'a bold festive motif across the chest', 'winter-frost'],
    ['Oversized mohair jumper', 'a light halo in a huge shape', 'gothic-dusk'],
    ['Tapestry band jumper', 'one geometric band round the chest', 'boho-earth'],
  
    ['Granny square pullover', 'this pullover is built entirely from granny squares', 'boho-earth', 'granny-square-pullover-crochet'],
    ['Men\'s fisherman rib pullover', 'work back and front panels entirely in fisherman rib : every row alternates fpdc and bpdc across', 'vintage-tea', 'mens-fisherman-rib-pullover'],
  ],
  'tee-top': [
    ['Shirred bandeau', 'a tube with an elasticated back', 'coastal-breeze'],
    ['Boat neck cotton top', 'a wide neckline and a short sleeve', 'scandi-calm'],
    ['Asymmetric hem vest top', 'a stepped hem and a wide armhole', 'gothic-dusk'],
    ['Mesh festival crop top', 'an open net with a tie back', 'bright-pop'],
    ['Bralette top', 'a fitted triangle top with ties', 'candy-kawaii'],
    ['Lace camisole', 'a fine openwork body with straps', 'vintage-tea'],
    ['Boxy crop tee', 'a wide short body with drop shoulders', 'elegant-mono'],
    ['Tank with a scalloped hem', 'a shell edge along the bottom', 'wildflower-meadow'],
    ['Puff sleeve blouse', 'a gathered sleeve and a buttoned back', 'vintage-tea'],
    ['Tapestry panel tee', 'one colourwork panel on the front', 'boho-earth'],
    ['Child summer top', 'a light cotton top with a button back', 'nursery-pastel'],
  
    ['Lace evening top', 'work the back and front panels entirely in open treble lace : two treble stitches, chain 2, repeat across', 'celestial-night', 'lace-evening-top-crochet'],
    ['Men\'s ribbed tank top', 'work front and back panels entirely in 1x1 rib using fpdc and bpdc alternating across every row', 'bright-pop', 'mens-crochet-tank-top'],
    ['One-shoulder top', 'work front and back as dc rectangles to the underarm', 'candy-kawaii', 'one-shoulder-top-crochet'],
    ['Sparkle party top', 'choose a metallic yarn for maximum impact', 'scandi-calm', 'party-top-sequin-look-crochet'],
  ],
  vest: [
    ['Ribbed layering tank', 'a fine close rib to wear under a shirt', 'elegant-mono'],
    ['Fair isle look sleeveless jumper', 'a colourwork band across the chest', 'winter-frost'],
    ['Argyle look tank', 'a diamond colourwork front', 'vintage-tea'],
    ['Cropped waistcoat', 'a short fitted vest with buttons', 'elegant-mono'],
    ['Longline sleeveless duster', 'an open sleeveless layer to the knee', 'scandi-calm'],
    ['Fringed festival vest', 'a deep fringe at the hem', 'boho-earth'],
    ['Cabled tank top', 'post-stitch cables up the front', 'winter-frost'],
    ['Mesh layering vest', 'an open net to wear over a tee', 'coastal-breeze'],
    ['Child school tank', 'a simple v-neck in school colours', 'nursery-pastel'],
    ['Faux fur look gilet', 'loop stitch all over a sleeveless body', 'gothic-dusk'],
    ['Tapestry front waistcoat', 'a geometric front and a plain back', 'foxglove-autumn'],
  
    ['Broomstick lace vest', 'this vest uses a drop shoulder shape: two identical panels seamed at the shoulder seam and lower sides', 'candy-kawaii', 'broomstick-lace-vest-crochet'],
  ],
  dress: [
    ['Tiered ruffle sundress', 'three gathered tiers on thin straps', 'candy-kawaii'],
    ['Shirt dress with a collar', 'a buttoned placket and a stitched collar', 'scandi-calm'],
    ['Cottagecore midi dress', 'a fitted bodice and a full skirt', 'wildflower-meadow'],
    ['Beach cover-up dress', 'an open mesh over swimwear', 'coastal-breeze'],
    ['Baby christening gown', 'fine ivory with a picot hem', 'elegant-mono'],
    ['Pinafore dress', 'a bib front and two shoulder straps', 'mushroom-woodland'],
    ['Slip dress in fine cotton', 'a bias-look body on thin straps', 'vintage-tea'],
    ['Child party dress', 'a gathered skirt and a ribbon sash', 'candy-kawaii'],
    ['Long sleeve winter dress', 'a warm aran body to the knee', 'winter-frost'],
    ['Tapestry hem dress', 'a colourwork band round the hem', 'boho-earth'],
    ['Doll dress set', 'three dresses for a crocheted doll', 'nursery-pastel'],
  
    ['Smocked bodice dress', 'work the bodice in dc with smocking columns using fpdc every 4 stitches', 'nursery-pastel', 'smock-dress-crochet'],
  ],
  tunic: [
    ['Fisherman smock tunic', 'a square yoke and a front pouch pocket', 'coastal-breeze'],
    ['Belted longline tunic', 'a straight body and a tie belt', 'elegant-mono'],
    ['Bell sleeve tunic', 'a flared cuff and a scooped neck', 'vintage-tea'],
    ['Boho fringed tunic', 'a fringe at the hem and the cuffs', 'boho-earth'],
    ['Longline mesh tunic', 'an open net to layer over trousers', 'scandi-calm'],
    ['Child play tunic', 'a simple pull-on with a pocket', 'nursery-pastel'],
    ['Cotton work tunic', 'a plain body with two deep pockets', 'scandi-calm'],
    ['Lace panel tunic', 'an openwork band across the yoke', 'vintage-tea'],
    ['Tapestry hem tunic', 'a geometric band round the bottom', 'boho-earth'],
    ['Sleeveless summer tunic', 'a wide armhole and a split hem', 'wildflower-meadow'],
    ['Hooded lounge tunic', 'a soft hood and a kangaroo pocket', 'mushroom-woodland'],
  ],
  skirt: [
    ['Tiered gypsy skirt', 'three gathered tiers to the ankle', 'boho-earth'],
    ['Button-front denim-look skirt', 'a front placket and two pockets', 'coastal-breeze'],
    ['Ruffle tier skirt', 'three gathered tiers', 'candy-kawaii'],
    ['Pencil skirt in fine cotton', 'a fitted shape with a back split', 'elegant-mono'],
    ['Beach sarong skirt', 'an open mesh that ties at the hip', 'coastal-breeze'],
    ['Child twirl skirt', 'a very full circle skirt', 'nursery-pastel'],
    ['Wrap skirt with a tie', 'an overlap front and a long tie', 'boho-earth'],
    ['A-line midi skirt', 'a gentle flare from a fitted waist', 'scandi-calm'],
    ['Fringed hem mini skirt', 'a short skirt with a deep fringe', 'foxglove-autumn'],
    ['Tapestry panel skirt', 'a colourwork band round the hem', 'boho-earth'],
    ['Pleated school skirt', 'stitched-down pleats and a lining', 'elegant-mono'],
  
    ['Tree skirt', 'make 16 granny squares at 15 cm each', 'winter-frost', 'crochet-tree-skirt'],
  ],
  'jacket-coat': [
    ['Hooded parka', 'a long body, a hood and a front zip', 'scandi-calm'],
    ['Shawl collar cocoon coat', 'a wide collar and a curved hem', 'foxglove-autumn'],
    ['Cropped bomber jacket', 'a ribbed hem, cuffs and collar', 'elegant-mono'],
    ['Chunky wool coatigan', 'jumbo yarn and a shawl collar', 'scandi-calm'],
    ['Tapestry jacket', 'a bold geometric across the back', 'boho-earth'],
    ['Child duffle jacket', 'a hood and toggle fastenings', 'mushroom-woodland'],
    ['Denim-look jacket', 'a fitted body with a stitched yoke', 'coastal-breeze'],
    ['Longline winter coat', 'a heavy body to the knee with pockets', 'gothic-dusk'],
    ['Cropped shearling-look jacket', 'loop stitch collar and cuffs', 'winter-frost'],
    ['Cocoon coat', 'a curved shape with a wide sleeve', 'scandi-calm'],
    ['Fringed festival jacket', 'a fringe across the back yoke', 'boho-earth'],
  ],
  trousers: [
    ['Straight leg lounge pants', 'a plain leg and a drawstring waist', 'elegant-mono'],
    ['Harem trousers', 'a dropped crotch and a gathered ankle', 'boho-earth'],
    ['Baby leggings', 'a soft rib with a rolled waist', 'nursery-pastel'],
    ['Beach mesh trousers', 'an open net over swimwear', 'coastal-breeze'],
    ['Ribbed leggings', 'a fine rib with a fold-over waist', 'elegant-mono'],
    ['Chunky lounge joggers', 'a cuffed ankle and a drawstring', 'scandi-calm'],
    ['Flared festival trousers', 'a fitted hip and a wide flare', 'boho-earth'],
    ['Baby pull-on trousers', 'a soft waist and a rolled cuff', 'nursery-pastel'],
    ['Cropped culottes', 'a wide leg to the mid calf', 'vintage-tea'],
    ['Tapestry side stripe trousers', 'a colourwork stripe down each leg', 'bright-pop'],
    ['Doll trousers set', 'three pairs for a crocheted doll', 'candy-kawaii'],
  ],
  shorts: [
    ['High waist paperbag shorts', 'a gathered waist above a tie belt', 'vintage-tea'],
    ['Boxer-style lounge pair', 'a loose leg and a soft waistband', 'scandi-calm'],
    ['Board-style beach pair', 'a longer leg in fast-drying cotton', 'coastal-breeze'],
    ['Festival shorts', 'a short fitted pair with a tie waist', 'bright-pop'],
    ['Baby bloomer shorts', 'a gathered leg and a soft waist', 'nursery-pastel'],
    ['Beach shorts', 'a light open cotton pair', 'coastal-breeze'],
    ['Cycling-length shorts', 'a close fit in fine cotton', 'elegant-mono'],
    ['Child play shorts', 'an elastic waist and a patch pocket', 'nursery-pastel'],
    ['Ruffle hem shorts', 'a gathered frill at each leg', 'candy-kawaii'],
    ['Denim-look shorts', 'a stitched fly and two back pockets', 'coastal-breeze'],
    ['Doll shorts set', 'three pairs for a crocheted doll', 'wildflower-meadow'],
  ],
  'jumpsuit-romper': [
    ['Baby romper with a bear face', 'a face on the front bib', 'nursery-pastel'],
    ['Summer playsuit', 'a light cotton one-piece with ties', 'candy-kawaii'],
    ['Dungaree romper', 'a bib front and two button straps', 'mushroom-woodland'],
    ['Newborn sleep sack', 'a footed one-piece with a shoulder button', 'nursery-pastel'],
    ['Adult lounge jumpsuit', 'a wide leg and a wrap front', 'scandi-calm'],
    ['Festival playsuit', 'a short leg and a halter neck', 'bright-pop'],
    ['Beach jumpsuit', 'an open cotton mesh over swimwear', 'coastal-breeze'],
    ['Halloween costume romper', 'a pumpkin body with a green collar', 'gothic-dusk'],
    ['Christening romper', 'fine ivory with a picot leg edge', 'elegant-mono'],
    ['Doll romper set', 'three rompers for a crocheted doll', 'candy-kawaii'],
  ],
}

/** Doilies, edgings and appliqués: fine lace and picot work the engine has no
 *  stitch vocabulary for yet, plus the small motifs that finish other pieces. */
const THEMES_LACE: Record<string, Theme[]> = {
  doily: [
    ['Ripple-edge tray mat', 'a wavy border round a plain middle', 'scandi-calm'],
    ['Jam pot cover set', 'four small circles with a beaded edge', 'vintage-tea'],
    ['Lace candle mat', 'a stiffened ring to sit a candle on', 'elegant-mono'],
    ['Curtain tie-back in thread', 'a long lace band with a loop each end', 'wildflower-meadow'],
    ['Lampshade cover in fine cotton', 'an openwork sleeve over a frame', 'boho-earth'],
    ['Three-disc table runner', 'three joined lace circles', 'vintage-tea'],
    ['Thread lace bowl', 'a stiffened open bowl for keys', 'elegant-mono'],
    ['Wreath ring in thread', 'a lace ring to hang on a door', 'winter-frost'],
    ['Modern minimal doily', 'a plain disc with one lace round', 'scandi-calm'],
    ['Mandala wall doily', 'a large stiffened disc to hang', 'boho-earth'],
    ['Coaster-sized lace set', 'four small matching doilies', 'elegant-mono'],
    ['Bridal table doily', 'fine ivory thread with a beaded edge', 'elegant-mono'],
  
    ['Butterfly motif doily', 'each butterfly has a wing pair above and below a central body treble', 'winter-frost', 'butterfly-doily-crochet'],
    ['Filet grid square doily', 'filet crochet alternates filled squares and open squares to form pictures', 'wildflower-meadow', 'filet-square-doily-crochet'],
    ['Heart-shaped doily', 'the heart is shaped by lobe increases at two positions along the top and a v-decrease at the base point', 'foxglove-autumn', 'heart-doily-crochet'],
    ['Pineapple motif doily', 'the doily has 6 pineapple stitch sections, each beginning with a wide base fan that tapers to a point as the rounds decrease', 'mushroom-woodland', 'pineapple-doily-crochet'],
    ['Snowflake doily', 'each arm has three arm branches worked along its length', 'nursery-pastel', 'snowflake-doily-crochet'],
    ['Star doily', 'the star grows by adding point increases at 6 equally-spaced positions on every other round', 'celestial-night', 'star-doily-crochet'],
    ['Sunflower centre doily', 'the sunflower centre is worked in brown and yellow before a colour change to white adds the lace edge', 'bright-pop', 'sunflower-doily-crochet'],
    ['Vintage spider web doily', 'eight radial spokes run from the centre ring to the outer edge', 'candy-kawaii', 'vintage-spider-web-doily-crochet'],
  ],
  edging: [
    ['Ric-rac wave trim', 'a narrow zigzag band for a hem', 'candy-kawaii'],
    ['Corded firm trim for a bag', 'a dense round cord along a seam', 'boho-earth'],
    ['Shell edging for a pillowcase', 'a five-treble shell repeat', 'vintage-tea'],
    ['Picot trim for a collar', 'a fine chain picot repeat', 'elegant-mono'],
    ['Leaf border for a shelf', 'a repeating leaf along a strip', 'wildflower-meadow'],
    ['Filet lace strip', 'a chart-led filet band', 'vintage-tea'],
    ['Beaded edge for an evening wrap', 'beads set into the last round', 'gothic-dusk'],
    ['Ruffle edge for a baby blanket', 'a doubled gathered frill', 'nursery-pastel'],
    ['Crab stitch firm edge', 'a dense reverse-worked border', 'elegant-mono'],
    ['Bobble edge for a cushion', 'raised bobbles along one seam', 'candy-kawaii'],
    ['Pointed border for a shawl', 'a triangular point repeat', 'boho-earth'],
  
    ['Bullion stitch edging', 'the bullion stitch takes practice to keep even', 'elegant-mono', 'bullion-edging-crochet'],
    ['Floral lace chain trim', 'each chain flower is joined to the previous flower by a joining chain of 6 stitches, creating a flexible chain of blooms', 'boho-earth', 'floral-lace-trim-crochet'],
    ['Leaf border edging', 'each leaf cluster is widest at its leaf base and narrows to a point with decreasing trebles', 'vintage-tea', 'leaf-edging-crochet'],
    ['Pineapple motif border strip', 'each pineapple section is worked above its chain arc base', 'gothic-dusk', 'pineapple-edging-crochet'],
    ['Scallop border edging', 'each scallop arc spans 6 base stitches', 'coastal-breeze', 'scallop-edging-crochet'],
  ],
  'applique-flower': [
    ['Five-petal daisy set', 'six small daisies in one colourway', 'wildflower-meadow'],
    ['Sunflower applique', 'a dark centre and long gold petals', 'foxglove-autumn'],
    ['Butterfly applique', 'a flat butterfly with a beaded body', 'candy-kawaii'],
    ['Star applique set', 'five stars for a jumper or a bag', 'celestial-night'],
    ['Heart applique set', 'three sizes for patching a knee', 'candy-kawaii'],
    ['Poppy applique', 'a red bloom with a black centre', 'bright-pop'],
    ['Snowflake applique set', 'six stiffened white flakes', 'winter-frost'],
    ['Shell applique set', 'four seaside shapes for a bag', 'coastal-breeze'],
    ['Toadstool applique', 'a red cap with white spots', 'mushroom-woodland'],
    ['Initial letter applique', 'a single letter to sew on a pocket', 'scandi-calm'],
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLY
// ─────────────────────────────────────────────────────────────────────────────

/** The buildable ideas, shelf by shelf, in author order. */
const BUILDABLE_BY_SHELF: Record<string, Row[]> = {
  amigurumi: AMIGURUMI,
  'animal-toy': ANIMAL_TOY,
  doll: DOLL,
  'baby-toy-lovey': BABY_TOY_LOVEY,
  coaster: COASTER,
  dishcloth: DISHCLOTH,
  potholder: POTHOLDER,
  'motif-granny-square': MOTIF,
  ornament: ORNAMENT,
  pincushion: PINCUSHION,
  bookmark: BOOKMARK,
  headband: HEADBAND,
  'wall-hanging': WALL_HANGING,
}

const ALL_THEMES: Record<string, Theme[]> = {
  ...THEMES_HOME,
  ...THEMES_WEAR,
  ...THEMES_EXTREMITIES,
  ...THEMES_CARRY,
  ...THEMES_GARMENT,
  ...THEMES_LACE,
}

/**
 * Weighted round robin. Each shelf's entries are laid on a 0..1 line at
 * `(i + 0.5) / count`, and the merged order is that line sorted. A shelf with
 * two hundred ideas therefore appears roughly every third entry and a shelf
 * with five appears roughly every hundred and thirtieth, which is exactly the
 * balance the browse grid wants while it fills.
 */
function interleave(groups: Record<string, CrochetIdea[]>): CrochetIdea[] {
  const placed: { at: number; shelf: string; idea: CrochetIdea }[] = []
  for (const [shelf, list] of Object.entries(groups)) {
    if (list.length === 0) continue
    list.forEach((idea, i) => placed.push({ at: (i + 0.5) / list.length, shelf, idea }))
  }
  placed.sort((a, b) => a.at - b.at || a.shelf.localeCompare(b.shelf))
  return spaceColourways(placed.map((p) => p.idea))
}

/**
 * One deterministic pass that pushes an entry back when it repeats the previous
 * entry's colourway, so the first page of the grid is not five sage things in a
 * row. It only ever swaps with the next entry that differs, and only inside a
 * short window, so the shelf balance the round robin produced survives.
 */
function spaceColourways(list: CrochetIdea[]): CrochetIdea[] {
  const out = [...list]
  const WINDOW = 4
  for (let i = 1; i < out.length; i++) {
    if (out[i]!.colourway !== out[i - 1]!.colourway) continue
    for (let j = i + 1; j < Math.min(i + 1 + WINDOW, out.length); j++) {
      if (out[j]!.colourway === out[i - 1]!.colourway) continue
      const tmp = out[i]!
      out[i] = out[j]!
      out[j] = tmp
      break
    }
  }
  return out
}

/**
 * Ideas from the thirteen shelves with a working treatment. NOT all
 * `buildable: true` any more — the four amigurumi-treatment shelves carry a
 * per-idea flag on top (see `isHonestAmigurumiSubject`), so this array is a
 * mix until the partition below sorts it out.
 */
const BUILDABLE_SHELF_IDEAS: CrochetIdea[] = interleave(
  Object.fromEntries(
    Object.entries(BUILDABLE_BY_SHELF).map(([shelf, rows]) => [shelf, buildIdeas(shelf, rows)]),
  ),
)

const THEME_IDEAS: CrochetIdea[] = interleave(
  Object.fromEntries(
    Object.entries(ALL_THEMES).map(([shelf, themes]) => [shelf, buildThemes(shelf, themes)]),
  ),
)

/**
 * THE BACKLOG. Buildable ideas first, in working order, then everything the
 * loom cannot honestly build yet — a stable partition on `buildable`, not a
 * concatenation, because `BUILDABLE_SHELF_IDEAS` itself now interleaves a few
 * hundred amigurumi/animal-toy/doll ideas the engine cannot render (see
 * above) among the ones it can. `seq` is assigned here and is the only thing
 * a session needs: work from seq 1 down.
 */
const ALL_IDEAS_UNSEQUENCED: CrochetIdea[] = [...BUILDABLE_SHELF_IDEAS, ...THEME_IDEAS]
export const CROCHET_IDEA_BACKLOG: CrochetIdea[] = [
  ...ALL_IDEAS_UNSEQUENCED.filter((i) => i.buildable),
  ...ALL_IDEAS_UNSEQUENCED.filter((i) => !i.buildable),
].map((idea, i) => ({ ...idea, seq: i + 1 }))

/** Just the part the autopilot can commission today. */
export const CROCHET_BUILDABLE_IDEAS: CrochetIdea[] = CROCHET_IDEA_BACKLOG.filter((i) => i.buildable)

/** Just the themes waiting on engine work. */
export const CROCHET_IDEA_THEMES: CrochetIdea[] = CROCHET_IDEA_BACKLOG.filter((i) => !i.buildable)

/**
 * THE RECOMMENDED SHELF TARGETS, as data rather than prose.
 *
 * A PROPOSAL, not the live config: `CROCHET_SHELVES` in `../categories.ts` is
 * still the number the autopilot stops at. These are the numbers the September
 * 2026 market comparison argues for — total 1,500 rather than 1,200, with toys
 * up from 22% to 28% of the catalogue, motifs and granny squares nearly
 * doubled, dishcloths up (the most common first project a beginner makes), bags
 * up (granny-square bags and mesh totes are the 2026 trend), and headbands down
 * (a modest niche that only carries thirty because the engine happens to build
 * it). Rebecca decides whether to adopt them; adopting means editing
 * CROCHET_SHELVES, and the category target follows because it is the sum.
 */
export const RECOMMENDED_CROCHET_SHELF_TARGETS: Record<string, number> = {
  // Toys
  amigurumi: 220,
  'animal-toy': 100,
  doll: 50,
  'baby-toy-lovey': 50,
  // Home and living
  blanket: 142,
  cushion: 36,
  basket: 25,
  ornament: 36,
  'wall-hanging': 28,
  rug: 12,
  'plant-hanger': 12,
  bunting: 14,
  'pet-bed': 10,
  pouffe: 6,
  // Headwear, neckwear, wraps
  hat: 70,
  scarf: 50,
  headband: 24,
  cowl: 30,
  shawl: 28,
  beret: 12,
  wrap: 12,
  poncho: 10,
  // Hands, feet, legs
  slippers: 20,
  'fingerless-mitts': 18,
  socks: 12,
  booties: 14,
  mittens: 10,
  gloves: 6,
  legwarmers: 6,
  // Bags and small accessories
  bag: 40,
  purse: 18,
  'hair-accessory': 12,
  jewellery: 8,
  backpack: 6,
  belt: 3,
  // Kitchen and bath
  dishcloth: 36,
  potholder: 20,
  'tea-cosy': 10,
  towel: 6,
  // Garments
  cardigan: 25,
  'jumper-pullover': 20,
  'tee-top': 20,
  vest: 14,
  dress: 10,
  tunic: 5,
  skirt: 5,
  'jacket-coat': 5,
  trousers: 3,
  shorts: 4,
  'jumpsuit-romper': 3,
  // Motifs and components
  'motif-granny-square': 60,
  coaster: 30,
  doily: 22,
  edging: 18,
  'applique-flower': 20,
  bookmark: 10,
  pincushion: 4,
}

/** The backlog entries for one shelf, in working order. */
export function ideasForShelf(shelf: string): CrochetIdea[] {
  return CROCHET_IDEA_BACKLOG.filter((i) => i.shelf === shelf)
}

/** How many ideas the backlog carries per shelf. */
export function backlogCountsByShelf(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const idea of CROCHET_IDEA_BACKLOG) counts[idea.shelf] = (counts[idea.shelf] ?? 0) + 1
  return counts
}

/**
 * The next `n` buildable ideas whose dedupe keys are not already taken. The
 * caller passes the catalogue's subject keys; the backlog does the rest.
 */
export function nextBuildableIdeas(n: number, takenKeys: Iterable<string> = []): CrochetIdea[] {
  const taken = [...takenKeys].filter(Boolean)
  const out: CrochetIdea[] = []
  for (const idea of CROCHET_BUILDABLE_IDEAS) {
    if (out.length >= n) break
    if (findSubjectKeyMatch(subjectKey(idea.motif), taken)) continue
    out.push(idea)
  }
  return out
}

/** Every shelf the backlog mentions, buildable or not. */
export function backlogShelves(): string[] {
  return [...new Set(CROCHET_IDEA_BACKLOG.map((i) => i.shelf))]
}

/** True when the shelf has buildable entries AND the loom agrees it is buildable. */
export function backlogShelfIsBuildable(shelf: string): boolean {
  return shelfIsBuildable(shelf)
}
