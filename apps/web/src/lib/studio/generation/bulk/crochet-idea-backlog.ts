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
 */

import { CROCHET_SHELF_BY_SLUG } from '../categories'
import { envelopeFor, shelfIsBuildable, type CrochetTreatment } from './crochet-forms'
import { findSubjectKeyMatch, subjectKey } from './subject-key'

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
  /** Can the loom build it today? */
  buildable: boolean
  /** One line for the authoring session. */
  brief: string
}

/**
 * Compact source row. Hand-maintained; everything derivable is derived, so a
 * new idea is one short line rather than a twelve-field object.
 *
 *   [title, motif, hook, colourway, treatment, code]
 *
 * `code` is size + difficulty as one letter each: size s|m|l|w (small, medium,
 * large, showpiece), difficulty b|i|a|w (beginner, intermediate, advanced,
 * showpiece). So 'sb' is a small beginner piece and 'ww' a showpiece.
 */
type Row = [
  title: string,
  motif: string,
  hook: string,
  colourway: string,
  treatment: CrochetTreatment,
  code: string,
]

/** A theme for a shelf the loom cannot build: [theme, hook, colourway]. */
type Theme = [theme: string, hook: string, colourway: string]

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

function buildIdeas(shelf: string, rows: Row[]): CrochetIdea[] {
  return rows.map(([title, motif, hook, colourway, treatment, code], i) => {
    const envelope = envelopeFor(shelf, treatment)
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
      buildable: true,
      brief: `${motif}: ${hook}. ${colourway} palette, built as ${treatment}${envelope ? ` (${envelope.note.replace(/\.$/, '')})` : ''}.`,
    }
  })
}

function buildThemes(shelf: string, themes: Theme[]): CrochetIdea[] {
  const shelfName = CROCHET_SHELF_BY_SLUG[shelf]?.name ?? shelf
  return themes.map(([theme, hook, colourway], i) => ({
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

const BUILDABLE_IDEAS: CrochetIdea[] = interleave(
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
 * THE BACKLOG. Buildable ideas first, in working order, then the themes for the
 * shelves the loom cannot reach. `seq` is assigned here and is the only thing
 * a session needs: work from seq 1 down.
 */
export const CROCHET_IDEA_BACKLOG: CrochetIdea[] = [...BUILDABLE_IDEAS, ...THEME_IDEAS].map(
  (idea, i) => ({ ...idea, seq: i + 1 }),
)

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
