/**
 * Shared rules between `crochet-draft-triage.ts` (the dry-run / report tool)
 * and `generate-backlog-entries.ts` (the one-off that turns the keepers into
 * literal backlog rows). Split out so the two scripts can never drift apart
 * on what counts as a keeper — pure, no Prisma, no side effects on import.
 */
import { subjectKey } from '../../../apps/web/src/lib/studio/generation/bulk/subject-key.js'

// ── IP guardrail keyword screen (packages/db/prisma/design-direction.ts
//    IP_GUARDRAIL: no celebrity/brand/franchise IP). Checked against title —
//    a title-level hit is a confident block; body-level references would need
//    a human read, which stage 2 covers. ────────────────────────────────────
export const IP_GUARDRAIL_RE =
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
export const SHELF_RULES: [shelf: string, re: RegExp][] = [
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

export function mapShelf(title: string): string | null {
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
export const GENERIC_WORDS = new Set(
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
    'waistcoat', 'linen', 'shell', 'bobble', 'popcorn', 'puff', 'spike',
    // NOT 'crocodile' or 'spider': both name a real stitch AND a real
    // amigurumi animal subject ("Amigurumi crocodile", "Amigurumi spider") —
    // stripping them globally wrongly generic-junked two legitimate animals.
    'lemon', 'peel', 'granny', 'herringbone', 'basketweave', 'basket',
    'weave', 'tunisian', 'corner', 'c2c', 'solomons', 'knot', 'crossed', 'linked',
    'treble', 'double', 'half', 'single', 'v-stitch', 'diamond', 'mesh',
    // NOT 'star': also a real amigurumi/motif subject (a star shape), not
    // only "star stitch" — see crocodile/spider above.
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
export function bareTokens(title: string): string[] {
  return subjectKey(title)
    .split(' ')
    .filter((w) => w && !GENERIC_WORDS.has(w))
}

export function bareKey(title: string): string {
  return bareTokens(title).join(' ')
}

/** True when nothing survives bareTokens + the shelf's own search noun —
 *  i.e. the title names a technique, not a subject. */
export function isGenericConstructionOnly(title: string, shelf: string): boolean {
  const shelfWords = new Set(shelf.split('-'))
  const tokens = bareTokens(title).filter((w) => !shelfWords.has(w))
  return tokens.length === 0
}

// ── Manual downgrades from stage 2 (Claude reading each shelf batch) ───────
// Keyed by slug.
export const MANUAL_JUNK: Record<string, string> = {
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

  // Second read, against the ACTUAL draft bodies (once pulled for the
  // backlog brief): motif-granny-square's only buildable treatments are
  // grid-texture and disc — flat row/round stitch-and-colour bands, per
  // crochet-forms.ts. Several "motif" drafts describe shaping the engine
  // does not have (short rows, separate petals/wings/panels sewn together,
  // a freeform leaf or heart outline) — buildable by shelf, not honestly
  // buildable by construction. Same principle as the amigurumi base gate,
  // applied by hand because motif-granny-square only has THIS one bad batch
  // rather than a whole shelf family needing a standing rule.
  'crochet-animal-bee': 'body shaped in short-row bands, not a flat texture/colour motif',
  'crochet-animal-bird': 'teardrop body worked in short rows, not a flat texture/colour motif',
  'crochet-animal-butterfly': 'four separate wing panels assembled, not a single flat/round motif',
  'crochet-animal-fish': 'oval short-row body, not a flat texture/colour motif',
  'crochet-animal-fox': 'a shaped face construction, not a flat texture/colour motif',
  'crochet-animal-hedgehog': 'a shaped semicircular body, not a flat texture/colour motif',
  'crochet-daisy-basic': 'eight separate petals worked outward, not flat texture/colour bands',
  'crochet-daisy-layered-petals': 'two dimensional petal rings at different heights, not flat',
  'crochet-five-petal-flower-round': 'separate petals assembled round a centre, not a flat disc',
  'crochet-flower-dahlia': 'concentric petals that stand upright/angle outward, not flat',
  'crochet-flower-poppy': 'four separate petals assembled round a centre, not a flat disc',
  'crochet-willow-tree-motif': 'a shaped trunk-and-foliage applique, not a flat texture/colour motif',
  'crochet-themed-heart-basic': 'two shaped half-circle lobes, a heart outline the grid/disc builder cannot draw',
  'irish-crochet-flower-motif-crochet': 'five raised separate petals, not a flat texture/colour motif',
  'crochet-leaf-fern': 'a freeform pinnate leaf outline, not a square or round motif',
  'crochet-leaf-holly': 'a freeform lobed leaf outline, not a square or round motif',
  'crochet-leaf-ivy': 'a freeform three-lobe leaf outline, not a square or round motif',
  'crochet-leaf-maple': 'a freeform lobed leaf outline, not a square or round motif',
  'crochet-leaf-oak': 'a freeform lobed leaf outline, not a square or round motif',
  'crochet-rose-layered': 'a dimensional rolled/layered rose, not a flat texture/colour motif',
  'crochet-rose-rolled': 'a dimensional rolled rose, not a flat texture/colour motif',

  // Potholder's only treatments are grid-texture/grid-stripe (a flat
  // rectangle) — no disc option, and definitely no mitt-shaped or
  // two-discs-joined construction.
  'double-thick-oven-mitt': 'a hand-shaped mitt, not the flat rectangle grid-texture/grid-stripe builds',
  'round-pot-holder': 'described as two round discs joined — potholder has no disc treatment, only a flat rectangle',

  // Wall-hanging's only treatment is grid-tapestry — a flat 2D picture
  // panel. A planter basket is a 3D vessel with a flat BACK, not a picture;
  // it was shelved here only because its title happens to contain the words
  // "wall hanging".
  'wall-hanging-planter-basket': 'a 3D planter basket, not a flat tapestry picture panel',

  // Ornament's only treatment is sphere — a stuffed round bauble. A
  // stocking and a wreath are not spheres, whatever colour they are dyed.
  'advent-wreath-cover': 'a ring-shaped wreath cover, not the round bauble the sphere treatment builds',
  'crochet-christmas-stocking': 'a boot-shaped stocking, not the round bauble the sphere treatment builds',

  // Third read: the backlog test caps every non-buildable shelf's theme list
  // at thirty (keeps a list from bloating past what a session can browse
  // meaningfully). Shawl was the only shelf the draft conversion pushed over
  // that cap, so the six weakest hooks are cut here rather than raising a
  // cap a previous session set on purpose.
  'butterfly-lace-shawl-crochet': 'thin hook, cut to keep shawl themes within the 10-30 cap',
  'crochet-c2c-triangle-shawl': 'thin/generic hook, cut to keep shawl themes within the 10-30 cap',
  'crochet-toddler-shawl-dc': 'title truncated by stripping "crochet", and a thin hook; cut to keep shawl themes within the 10-30 cap',
  'rectangular-lace-shawl-crochet': 'thin/circular hook, cut to keep shawl themes within the 10-30 cap',
  'spiral-lace-shawl-crochet': 'hook is just "chain 6", cut to keep shawl themes within the 10-30 cap',
  'waterfall-lace-shawl-crochet': 'thin/generic hook, cut to keep shawl themes within the 10-30 cap',
}
