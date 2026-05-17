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
    // Knitting-specific categories. The DB column is free-form String; these
    // sit in the TypeScript union as a spelling gate for the seed file.
    | 'increase'
    | 'decrease'
    | 'cable'
    | 'bind-off'
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

  // ── Knitting basics ─────────────────────────────────────────────────
  {
    slug: 'knitting-knit',
    craft: 'knitting',
    canonicalName: 'Knit',
    ukName: 'Knit',
    usName: 'Knit',
    ukAbbreviation: 'k',
    usAbbreviation: 'k',
    category: 'basic',
    chartSymbol: 'knit',
    difficulty: 'BEGINNER',
    notes:
      'The right-side stitch. Empty cell in the standard knitting chart convention; the renderer draws a thin outlined cell.',
  },
  {
    slug: 'knitting-purl',
    craft: 'knitting',
    canonicalName: 'Purl',
    ukName: 'Purl',
    usName: 'Purl',
    ukAbbreviation: 'p',
    usAbbreviation: 'p',
    category: 'basic',
    chartSymbol: 'purl',
    difficulty: 'BEGINNER',
    notes:
      'The wrong-side stitch. Standard chart symbol is a filled centred dot.',
  },

  // ── Knitting pattern stitches (built from k + p) ────────────────────
  {
    slug: 'knitting-stocking-stitch',
    craft: 'knitting',
    canonicalName: 'Stocking stitch',
    ukName: 'Stocking stitch',
    usName: 'Stockinette stitch',
    ukAbbreviation: 'st st',
    usAbbreviation: 'st st',
    category: 'textured',
    difficulty: 'BEGINNER',
    parentStitchSlug: 'knitting-knit',
    notes:
      'Knit one row, purl the next. Smooth V columns on the right side; horizontal bumps on the wrong side. The fabric of every shop-bought jumper. UK / US naming diverges.',
  },
  {
    slug: 'knitting-garter-stitch',
    craft: 'knitting',
    canonicalName: 'Garter stitch',
    ukName: 'Garter stitch',
    usName: 'Garter stitch',
    ukAbbreviation: 'gtr',
    usAbbreviation: 'gtr',
    category: 'textured',
    difficulty: 'BEGINNER',
    parentStitchSlug: 'knitting-knit',
    notes:
      'Knit every row, every side. Bumpy ridges identical on both faces; the canonical beginner-scarf fabric.',
  },
  {
    slug: 'knitting-rib-1x1',
    craft: 'knitting',
    canonicalName: '1×1 ribbing',
    ukName: '1×1 rib',
    usName: '1×1 rib',
    ukAbbreviation: 'k1, p1 rib',
    usAbbreviation: 'k1, p1 rib',
    category: 'textured',
    difficulty: 'BEGINNER',
    notes:
      'Knit one, purl one across the row; on subsequent rows knit the knits and purl the purls. Stretchy; the classic cuff and brim.',
  },
  {
    slug: 'knitting-rib-2x2',
    craft: 'knitting',
    canonicalName: '2×2 ribbing',
    ukName: '2×2 rib',
    usName: '2×2 rib',
    ukAbbreviation: 'k2, p2 rib',
    usAbbreviation: 'k2, p2 rib',
    category: 'textured',
    difficulty: 'BEGINNER',
    notes:
      'Knit two, purl two across the row. Slightly more stretch than 1×1 with a clearer column. The standard hat-brim rib.',
  },
  {
    slug: 'knitting-seed-stitch',
    craft: 'knitting',
    canonicalName: 'Seed stitch',
    ukName: 'Moss stitch',
    usName: 'Seed stitch',
    ukAbbreviation: 'seed',
    usAbbreviation: 'seed',
    category: 'textured',
    difficulty: 'BEGINNER',
    notes:
      'Knit one purl one with the columns staggered each row. UK calls this moss stitch; US calls it seed — the most-cited UK / US confusion.',
  },
  {
    slug: 'knitting-double-moss',
    craft: 'knitting',
    canonicalName: 'Double moss stitch',
    ukAbbreviation: 'dbl moss',
    usAbbreviation: 'dbl moss',
    category: 'textured',
    difficulty: 'BEGINNER',
    notes:
      'Four-row variation of moss / seed; holds the pattern across larger plain panels.',
  },
  {
    slug: 'knitting-basket-weave',
    craft: 'knitting',
    canonicalName: 'Basket-weave',
    ukAbbreviation: 'basket-w',
    usAbbreviation: 'basket-w',
    category: 'textured',
    difficulty: 'INTERMEDIATE',
    notes:
      'Alternating blocks of stocking and reverse-stocking that swap every four rows. Reads like woven basket; common on cushions and dishcloths.',
  },
  {
    slug: 'knitting-fishermans-rib',
    craft: 'knitting',
    canonicalName: "Fisherman's rib",
    ukAbbreviation: 'fish rib',
    usAbbreviation: 'fish rib',
    category: 'textured',
    difficulty: 'INTERMEDIATE',
    notes:
      'A deep, lofty rib produced by knitting into the row below. Cosy; uses about a third more yarn than plain 1×1 ribbing.',
  },
  {
    slug: 'knitting-brioche',
    craft: 'knitting',
    canonicalName: 'Brioche stitch',
    ukAbbreviation: 'brk / brp',
    usAbbreviation: 'brk / brp',
    category: 'textured',
    difficulty: 'ADVANCED',
    notes:
      'A reversible stitch family built on slip-yarnovers. Lofty, plush, famously easy to mis-count.',
  },

  // ── Knitting increases + decreases ──────────────────────────────────
  {
    slug: 'knitting-yarn-over',
    craft: 'knitting',
    canonicalName: 'Yarn over',
    ukAbbreviation: 'yo',
    usAbbreviation: 'yo',
    category: 'increase',
    chartSymbol: 'yarn-over',
    difficulty: 'BEGINNER',
    notes:
      'An increase that also creates a small eyelet — the lace basic. UK pattern books may write "yfwd" (yarn forward) between knit stitches.',
  },
  {
    slug: 'knitting-make-1',
    craft: 'knitting',
    canonicalName: 'Make 1',
    ukAbbreviation: 'm1',
    usAbbreviation: 'm1',
    category: 'increase',
    chartSymbol: 'make-1',
    difficulty: 'BEGINNER',
    notes:
      'Invisible increase made by lifting the strand between two stitches and knitting into the back of it. Authors note M1L vs M1R when direction matters.',
  },
  {
    slug: 'knitting-k2tog',
    craft: 'knitting',
    canonicalName: 'Knit two together',
    ukAbbreviation: 'k2tog',
    usAbbreviation: 'k2tog',
    category: 'decrease',
    chartSymbol: 'k2tog',
    difficulty: 'BEGINNER',
    notes:
      'Right-leaning single decrease. Standard chart symbol leans the way the stitch sits.',
  },
  {
    slug: 'knitting-ssk',
    craft: 'knitting',
    canonicalName: 'Slip slip knit',
    ukAbbreviation: 'ssk',
    usAbbreviation: 'ssk',
    category: 'decrease',
    chartSymbol: 'ssk',
    difficulty: 'BEGINNER',
    notes:
      'Left-leaning single decrease, the mirror of k2tog. UK books may write "sl1, k1, psso".',
  },

  // ── Knitting cables ─────────────────────────────────────────────────
  {
    slug: 'knitting-cable-4-front',
    craft: 'knitting',
    canonicalName: 'Cable 4 front',
    ukAbbreviation: 'c4f',
    usAbbreviation: 'c4f',
    category: 'cable',
    chartSymbol: 'cable-4-front',
    difficulty: 'INTERMEDIATE',
    notes:
      'Slip 2 onto cable needle, hold to front; knit next 2 from left needle; knit 2 from cable needle. Leans the cable to the left.',
  },
  {
    slug: 'knitting-cable-4-back',
    craft: 'knitting',
    canonicalName: 'Cable 4 back',
    ukAbbreviation: 'c4b',
    usAbbreviation: 'c4b',
    category: 'cable',
    chartSymbol: 'cable-4-back',
    difficulty: 'INTERMEDIATE',
    notes:
      'Slip 2 onto cable needle, hold to back; knit next 2; knit 2 from cable needle. Mirror of c4f — leans right.',
  },
  {
    slug: 'knitting-cable-6-front',
    craft: 'knitting',
    canonicalName: 'Cable 6 front',
    ukAbbreviation: 'c6f',
    usAbbreviation: 'c6f',
    category: 'cable',
    chartSymbol: 'cable-4-front',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'knitting-cable-4-front',
    notes:
      'Six-stitch left-leaning cable; same method as c4f over three stitches each instead of two.',
  },
  {
    slug: 'knitting-cable-6-back',
    craft: 'knitting',
    canonicalName: 'Cable 6 back',
    ukAbbreviation: 'c6b',
    usAbbreviation: 'c6b',
    category: 'cable',
    chartSymbol: 'cable-4-back',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'knitting-cable-4-back',
    notes:
      'Six-stitch right-leaning cable; mirror of c6f.',
  },

  // ── Knitting colourwork ─────────────────────────────────────────────
  {
    slug: 'knitting-fair-isle',
    craft: 'knitting',
    canonicalName: 'Fair Isle',
    ukAbbreviation: 'FI',
    usAbbreviation: 'FI',
    category: 'colourwork',
    difficulty: 'INTERMEDIATE',
    notes:
      'Two-colour stranded knitting in repeating motifs, usually no more than two colours per row. The yarn not in use is carried (stranded) across the back of the work.',
  },
  {
    slug: 'knitting-intarsia',
    craft: 'knitting',
    canonicalName: 'Intarsia',
    ukAbbreviation: 'int',
    usAbbreviation: 'int',
    category: 'colourwork',
    difficulty: 'INTERMEDIATE',
    notes:
      'Working blocks of colour by twisting yarns at the colour change. No strands carried across the back; suited to flat-knitted motifs and pictures.',
  },

  // ── Knitting edges, special, bind-off ───────────────────────────────
  {
    slug: 'knitting-slip-stitch',
    craft: 'knitting',
    canonicalName: 'Slip stitch',
    ukAbbreviation: 'sl1',
    usAbbreviation: 'sl1',
    category: 'edging',
    chartSymbol: 'slip-stitch',
    difficulty: 'BEGINNER',
    notes:
      'Move a stitch from the left needle to the right without working it. Used to create chained selvedges and to set up many decreases.',
  },
  {
    slug: 'knitting-knit-tbl',
    craft: 'knitting',
    canonicalName: 'Knit through the back loop',
    ukAbbreviation: 'k1tbl',
    usAbbreviation: 'k1tbl',
    category: 'textured',
    chartSymbol: 'knit-tbl',
    difficulty: 'BEGINNER',
    notes:
      'Knit into the back leg of the stitch — produces a twisted stitch with a tighter, slanted column.',
  },
  {
    slug: 'knitting-wrap-and-turn',
    craft: 'knitting',
    canonicalName: 'Wrap and turn',
    ukAbbreviation: 'w&t',
    usAbbreviation: 'w&t',
    category: 'special',
    difficulty: 'INTERMEDIATE',
    notes:
      'Short-row technique that shapes fabric by wrapping a stitch with the working yarn and turning the work mid-row. Heel turns, sock toes, bust darts.',
  },
  {
    slug: 'knitting-three-needle-bind-off',
    craft: 'knitting',
    canonicalName: 'Three-needle bind-off',
    ukName: 'Three-needle cast-off',
    usName: 'Three-needle bind-off',
    ukAbbreviation: '3-ndl bo',
    usAbbreviation: '3-ndl bo',
    category: 'bind-off',
    difficulty: 'INTERMEDIATE',
    notes:
      'Joins two live edges into a single seam by knitting matched stitches together and binding off as you go. UK pattern books call it "cast-off".',
  },
]
