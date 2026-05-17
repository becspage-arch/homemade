/**
 * Master Stitch seed data — crochet first, knitting + needlework to follow.
 *
 * One row per named stitch. Slugs are craft-prefixed so the same word
 * across crafts doesn't collide ("treble" means different things in
 * crochet and knitting; "knit" and "purl" are knitting-only; "magic
 * ring" is crochet-only).
 *
 * The starter list covers the foundation set every crochet PATTERN
 * anchor needs (chain, slip stitch, double crochet UK, half treble,
 * treble, double treble, magic ring, working in front loop / back
 * loop), plus enough texture / motif stitches to support the granny-
 * square and hexagon anchors.
 *
 * Conventions:
 *
 *   - slug              craft-prefixed kebab-case ('crochet-treble-uk').
 *                       URL-safe and unambiguous across crafts.
 *   - craft             'crochet' for this batch; 'knitting' rows arrive
 *                       with the knitting pipeline.
 *   - canonicalName     UK terminology by default ('treble').
 *   - ukName / usName   the convention pair. Critical for crochet
 *                       because UK 'treble' = US 'double crochet';
 *                       UK 'double crochet' = US 'single crochet'.
 *   - ukAbbreviation /  the standard pattern shorthand. UK 'tr' = US
 *     usAbbreviation    'dc' is the canonical UK/US mismatch that
 *                       trips readers.
 *   - category          'basic' | 'foundation' | 'textured' | 'lace'
 *                       | 'colourwork' | 'edging' | 'joining' | 'special'.
 *   - chartSymbol       key in `apps/web/src/lib/craft-charts/chart-symbols.ts`.
 *                       Nullable.
 *   - parentStitchSlug  optional — points at the foundation stitch this
 *                       row builds from ('treble-cluster' → 'treble').
 *
 * See `docs/crochet-author.md` for the voice rules every Stitch
 * tutorial uses, and `apps/web/src/lib/craft-charts/chart-symbols.ts`
 * for the symbol set the renderer supports.
 */

export interface StitchSeed {
  slug: string
  craft: 'crochet' | 'knitting' | 'cross-stitch' | 'tatting'
  canonicalName: string
  ukName?: string
  usName?: string
  ukAbbreviation?: string
  usAbbreviation?: string
  category:
    | 'basic'
    | 'foundation'
    | 'textured'
    | 'lace'
    | 'colourwork'
    | 'edging'
    | 'joining'
    | 'special'
  chartSymbol?: string
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  parentStitchSlug?: string
  notes?: string
}

export const STITCHES: StitchSeed[] = [
  // ── Crochet basics ──────────────────────────────────────────────────
  {
    slug: 'crochet-chain',
    craft: 'crochet',
    canonicalName: 'Chain',
    ukName: 'Chain',
    usName: 'Chain',
    ukAbbreviation: 'ch',
    usAbbreviation: 'ch',
    category: 'foundation',
    chartSymbol: 'chain',
    difficulty: 'BEGINNER',
    notes:
      'The first stitch most crocheters learn. The starting chain anchors every flat piece; the turning chain begins each new row.',
  },
  {
    slug: 'crochet-slip-stitch',
    craft: 'crochet',
    canonicalName: 'Slip stitch',
    ukName: 'Slip stitch',
    usName: 'Slip stitch',
    ukAbbreviation: 'sl st',
    usAbbreviation: 'sl st',
    category: 'basic',
    chartSymbol: 'slip-stitch',
    difficulty: 'BEGINNER',
    notes:
      'The shortest crochet stitch. Used for joining rounds, moving across stitches without adding height, and surface decoration.',
  },
  {
    slug: 'crochet-double-uk',
    craft: 'crochet',
    canonicalName: 'Double crochet',
    ukName: 'Double crochet',
    usName: 'Single crochet',
    ukAbbreviation: 'dc',
    usAbbreviation: 'sc',
    category: 'basic',
    chartSymbol: 'double-crochet-uk',
    difficulty: 'BEGINNER',
    notes:
      'The smallest worked stitch and the densest. UK "double crochet" equals US "single crochet" — the same move under two names. Trip-trip point for readers crossing patterns from a US source.',
  },
  {
    slug: 'crochet-half-treble',
    craft: 'crochet',
    canonicalName: 'Half treble',
    ukName: 'Half treble',
    usName: 'Half double crochet',
    ukAbbreviation: 'htr',
    usAbbreviation: 'hdc',
    category: 'basic',
    chartSymbol: 'half-treble',
    difficulty: 'BEGINNER',
    notes:
      'One step taller than a double; one step shorter than a treble. The compromise stitch — denser than treble, taller than double.',
  },
  {
    slug: 'crochet-treble',
    craft: 'crochet',
    canonicalName: 'Treble',
    ukName: 'Treble',
    usName: 'Double crochet',
    ukAbbreviation: 'tr',
    usAbbreviation: 'dc',
    category: 'basic',
    chartSymbol: 'treble',
    difficulty: 'BEGINNER',
    notes:
      'The workhorse pattern stitch in UK crochet — the granny square is treble clusters. UK "treble" equals US "double crochet"; the second of the canonical UK/US shifts.',
  },
  {
    slug: 'crochet-double-treble',
    craft: 'crochet',
    canonicalName: 'Double treble',
    ukName: 'Double treble',
    usName: 'Treble crochet',
    ukAbbreviation: 'dtr',
    usAbbreviation: 'tr',
    category: 'basic',
    chartSymbol: 'double-treble',
    difficulty: 'INTERMEDIATE',
    notes:
      'One step taller than a treble. UK "double treble" equals US "treble". Used in lace and openwork.',
  },
  {
    slug: 'crochet-triple-treble',
    craft: 'crochet',
    canonicalName: 'Triple treble',
    ukName: 'Triple treble',
    usName: 'Double treble',
    ukAbbreviation: 'trtr',
    usAbbreviation: 'dtr',
    category: 'basic',
    chartSymbol: 'triple-treble',
    difficulty: 'INTERMEDIATE',
  },

  // ── Crochet foundations ─────────────────────────────────────────────
  {
    slug: 'crochet-magic-ring',
    craft: 'crochet',
    canonicalName: 'Magic ring',
    ukName: 'Magic ring',
    usName: 'Magic ring',
    ukAbbreviation: 'MR',
    usAbbreviation: 'MR',
    category: 'foundation',
    chartSymbol: 'magic-ring',
    difficulty: 'BEGINNER',
    notes:
      'Adjustable loop for starting in-the-round work. Pulls closed once the first round is anchored — no centre hole, the cleanest start for granny squares, hexagons, amigurumi, and circular motifs.',
  },
  {
    slug: 'crochet-chainless-foundation-treble',
    craft: 'crochet',
    canonicalName: 'Chainless foundation treble',
    ukName: 'Chainless foundation treble',
    usName: 'Chainless foundation double crochet',
    ukAbbreviation: 'cfd',
    usAbbreviation: 'fdc',
    category: 'foundation',
    chartSymbol: 'foundation-treble',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Builds the first row directly without a starting chain — the foundation stays elastic instead of pulled tight. Use for blankets and garments where the bottom edge needs stretch.',
  },

  // ── Working-in-loops variants (front loop / back loop / both loops) ─
  {
    slug: 'crochet-front-loop-only',
    craft: 'crochet',
    canonicalName: 'Front loop only',
    ukName: 'Front loop only',
    usName: 'Front loop only',
    ukAbbreviation: 'flo',
    usAbbreviation: 'flo',
    category: 'special',
    chartSymbol: 'front-loop',
    difficulty: 'INTERMEDIATE',
    notes:
      'Modifier rather than a stitch. Worked into only the front loop of the previous row, leaving a visible ridge of unworked back loops. The texture trick behind ribbed crochet.',
  },
  {
    slug: 'crochet-back-loop-only',
    craft: 'crochet',
    canonicalName: 'Back loop only',
    ukName: 'Back loop only',
    usName: 'Back loop only',
    ukAbbreviation: 'blo',
    usAbbreviation: 'blo',
    category: 'special',
    chartSymbol: 'back-loop',
    difficulty: 'INTERMEDIATE',
    notes:
      'Mirror of front-loop. Leaves a ridge of unworked front loops on the public side. Used in colourwork tapestry crochet and for joining.',
  },

  // ── Textured / motif workhorses ─────────────────────────────────────
  {
    slug: 'crochet-treble-cluster',
    craft: 'crochet',
    canonicalName: 'Treble cluster',
    ukName: 'Treble cluster',
    usName: 'Double crochet cluster',
    ukAbbreviation: '3tr-cl',
    usAbbreviation: '3dc-cl',
    category: 'textured',
    chartSymbol: 'treble-cluster',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Three (or more) trebles worked together into the same stitch, joined at the top. The granny square corner is two clusters with two chains between.',
  },
  {
    slug: 'crochet-shell',
    craft: 'crochet',
    canonicalName: 'Shell',
    ukName: 'Shell',
    usName: 'Shell',
    ukAbbreviation: 'shell',
    usAbbreviation: 'shell',
    category: 'textured',
    chartSymbol: 'shell',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Five (or any odd number of) stitches worked into the same base stitch, fanning out. The defining stitch of shell-stitch blankets and edgings.',
  },
  {
    slug: 'crochet-bobble',
    craft: 'crochet',
    canonicalName: 'Bobble',
    ukName: 'Bobble',
    usName: 'Bobble',
    ukAbbreviation: 'bo',
    usAbbreviation: 'bo',
    category: 'textured',
    chartSymbol: 'bobble',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'A cluster of trebles drawn together at the top and pushed out on the public side. Bobble stitch blankets, baby cardigans, and textured cushion covers.',
  },
  {
    slug: 'crochet-puff',
    craft: 'crochet',
    canonicalName: 'Puff stitch',
    ukName: 'Puff stitch',
    usName: 'Puff stitch',
    ukAbbreviation: 'puff',
    usAbbreviation: 'puff',
    category: 'textured',
    chartSymbol: 'puff',
    difficulty: 'INTERMEDIATE',
    notes:
      'Three or more elongated half trebles worked into the same stitch and pulled together. Softer than a bobble; common in flowery motifs.',
  },
  {
    slug: 'crochet-popcorn',
    craft: 'crochet',
    canonicalName: 'Popcorn',
    ukName: 'Popcorn',
    usName: 'Popcorn',
    ukAbbreviation: 'pc',
    usAbbreviation: 'pc',
    category: 'textured',
    chartSymbol: 'popcorn',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Several trebles worked into the same base, then the first removed-from-hook stitch picked back up and pulled through. A defined bobble with a flat back — used in Aran-style afghans.',
  },
  {
    slug: 'crochet-picot',
    craft: 'crochet',
    canonicalName: 'Picot',
    ukName: 'Picot',
    usName: 'Picot',
    ukAbbreviation: 'p',
    usAbbreviation: 'p',
    category: 'edging',
    chartSymbol: 'picot',
    difficulty: 'BEGINNER',
    notes:
      'Three chains closed back into the first chain with a slip stitch — a tiny decorative loop. Finishes edges on shawls, lace edgings, and baby clothes.',
  },
  {
    slug: 'crochet-v-stitch',
    craft: 'crochet',
    canonicalName: 'V-stitch',
    ukName: 'V-stitch',
    usName: 'V-stitch',
    ukAbbreviation: 'V-st',
    usAbbreviation: 'V-st',
    category: 'textured',
    chartSymbol: 'v-stitch',
    difficulty: 'BEGINNER',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Two trebles separated by one chain, worked into the same base — a fan-like spacer. Lacy blankets, shawls, hexagon motifs.',
  },
  {
    slug: 'crochet-cross-stitch-crochet',
    craft: 'crochet',
    canonicalName: 'Crossed treble',
    ukName: 'Crossed treble',
    usName: 'Crossed double crochet',
    ukAbbreviation: 'cr-tr',
    usAbbreviation: 'cr-dc',
    category: 'textured',
    chartSymbol: 'crossed-treble',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Two trebles worked in reverse order so the second crosses in front of the first — used in lacy panels and Victorian crochet edgings.',
  },

  // ── Joining + assembly ──────────────────────────────────────────────
  {
    slug: 'crochet-join-as-you-go',
    craft: 'crochet',
    canonicalName: 'Join-as-you-go',
    ukName: 'Join-as-you-go',
    usName: 'Join-as-you-go',
    ukAbbreviation: 'JAYG',
    usAbbreviation: 'JAYG',
    category: 'joining',
    difficulty: 'INTERMEDIATE',
    notes:
      'Method rather than a stitch — joining motifs as the final round of each is worked, instead of sewing them together at the end. The cleanest finish for granny-square blankets.',
  },
  {
    slug: 'crochet-whipstitch-join',
    craft: 'crochet',
    canonicalName: 'Whipstitch join',
    ukName: 'Whipstitch join',
    usName: 'Whipstitch join',
    ukAbbreviation: 'whip',
    usAbbreviation: 'whip',
    category: 'joining',
    difficulty: 'BEGINNER',
    notes:
      'A tapestry-needle seam — the traditional simple join, worked through the back loops only for a flat seam.',
  },
  {
    slug: 'crochet-slip-stitch-seam',
    craft: 'crochet',
    canonicalName: 'Slip stitch seam',
    ukName: 'Slip stitch seam',
    usName: 'Slip stitch seam',
    ukAbbreviation: 'sl st seam',
    usAbbreviation: 'sl st seam',
    category: 'joining',
    difficulty: 'BEGINNER',
    parentStitchSlug: 'crochet-slip-stitch',
    notes:
      'Joining two pieces with a row of slip stitches through the matching edges. Visible from the public side; used for granny-square seams when the seam itself should show.',
  },
]
