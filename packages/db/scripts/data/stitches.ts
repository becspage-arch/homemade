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
    // Cross-stitch categories. Counted work has no increases or decreases;
    // it has the counted stitches themselves, the lines worked over the top,
    // and the surface stitches used for detail.
    | 'outline'
    | 'surface'
  chartSymbol?: string
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  parentStitchSlug?: string
  notes?: string
  /** Other names the stitch goes by, so an outside pattern's wording resolves
   *  to this row. Omitted rows keep whatever aliases the DB already holds. */
  aliases?: string[]
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

  // ── Crochet extended basics ─────────────────────────────────────────
  {
    slug: 'crochet-quadruple-treble',
    craft: 'crochet',
    canonicalName: 'Quadruple treble',
    ukName: 'Quadruple treble',
    usName: 'Triple treble',
    ukAbbreviation: 'qtr',
    usAbbreviation: 'trtr',
    category: 'basic',
    chartSymbol: 'quadruple-treble',
    difficulty: 'INTERMEDIATE',
    notes:
      'Four yarn-overs before inserting the hook; five loops worked off in pairs. Used in deep lace arches and hairpin lace.',
  },

  // ── Crochet textured ────────────────────────────────────────────────
  {
    slug: 'crochet-fan-stitch',
    craft: 'crochet',
    canonicalName: 'Fan stitch',
    ukName: 'Fan stitch',
    usName: 'Fan stitch',
    ukAbbreviation: 'fan',
    usAbbreviation: 'fan',
    category: 'textured',
    chartSymbol: 'fan',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Seven (or any odd number of) trebles into one base stitch, spreading wide. Wider than a shell; common in shawls and lace borders.',
  },
  {
    slug: 'crochet-granny-cluster',
    craft: 'crochet',
    canonicalName: 'Granny cluster',
    ukName: 'Granny cluster',
    usName: 'Granny cluster',
    ukAbbreviation: 'gr-cl',
    usAbbreviation: 'gr-cl',
    category: 'textured',
    chartSymbol: 'treble-cluster',
    difficulty: 'BEGINNER',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Three trebles worked into the same chain space, the building block of all granny-square motifs. Identical to a 3tr cluster but always worked into a chain space rather than a stitch.',
  },
  {
    slug: 'crochet-crossed-double-treble',
    craft: 'crochet',
    canonicalName: 'Crossed double treble',
    ukName: 'Crossed double treble',
    usName: 'Crossed treble crochet',
    ukAbbreviation: 'cr-dtr',
    usAbbreviation: 'cr-tr',
    category: 'textured',
    chartSymbol: 'crossed-double-treble',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-double-treble',
    notes:
      'Two double trebles worked in reverse order so the second crosses in front of the first. Creates a taller X than the crossed treble; used in Victorian-style open lace.',
  },

  // ── Single-loop and post variants ──────────────────────────────────
  {
    slug: 'crochet-third-loop-htr',
    craft: 'crochet',
    canonicalName: 'Third-loop half treble',
    ukName: 'Third-loop half treble',
    usName: 'Third-loop half double crochet',
    ukAbbreviation: 'tl-htr',
    usAbbreviation: 'tl-hdc',
    category: 'special',
    chartSymbol: 'third-loop-htr',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-half-treble',
    notes:
      'The htr worked into the third (lowest) loop rather than the usual two. Creates a flat, fabric-like texture sometimes called camel stitch — no visible ridges, smoother than back-loop-only.',
  },
  {
    slug: 'crochet-flo-dc',
    craft: 'crochet',
    canonicalName: 'Front-loop double crochet',
    ukName: 'Front-loop double crochet',
    usName: 'Front-loop single crochet',
    ukAbbreviation: 'flo-dc',
    usAbbreviation: 'flo-sc',
    category: 'special',
    chartSymbol: 'front-loop',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-double-uk',
    notes:
      'Double crochet worked through the front loop only. Leaves a visible ridge of unworked back loops on the public side; the base for ribbed dc fabric.',
  },
  {
    slug: 'crochet-blo-dc',
    craft: 'crochet',
    canonicalName: 'Back-loop double crochet',
    ukName: 'Back-loop double crochet',
    usName: 'Back-loop single crochet',
    ukAbbreviation: 'blo-dc',
    usAbbreviation: 'blo-sc',
    category: 'special',
    chartSymbol: 'back-loop',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-double-uk',
    notes:
      'Double crochet through the back loop only. Leaves an unworked ridge of front loops; the classic ribbing trick for crochet hats and cuffs.',
  },
  {
    slug: 'crochet-flo-htr',
    craft: 'crochet',
    canonicalName: 'Front-loop half treble',
    ukName: 'Front-loop half treble',
    usName: 'Front-loop half double crochet',
    ukAbbreviation: 'flo-htr',
    usAbbreviation: 'flo-hdc',
    category: 'special',
    chartSymbol: 'front-loop',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-half-treble',
    notes:
      'Half treble through the front loop only. Produces a visible ridge of back loops and a slight diagonal texture.',
  },
  {
    slug: 'crochet-blo-htr',
    craft: 'crochet',
    canonicalName: 'Back-loop half treble',
    ukName: 'Back-loop half treble',
    usName: 'Back-loop half double crochet',
    ukAbbreviation: 'blo-htr',
    usAbbreviation: 'blo-hdc',
    category: 'special',
    chartSymbol: 'back-loop',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-half-treble',
    notes:
      'Half treble through the back loop only. Leaves an unworked ridge of front loops; used in the same ribbing contexts as blo-dc but with extra height.',
  },
  {
    slug: 'crochet-flo-tr',
    craft: 'crochet',
    canonicalName: 'Front-loop treble',
    ukName: 'Front-loop treble',
    usName: 'Front-loop double crochet',
    ukAbbreviation: 'flo-tr',
    usAbbreviation: 'flo-dc',
    category: 'special',
    chartSymbol: 'front-loop',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Treble through the front loop only. Leaves back-loop ridges; gives a lace-adjacent texture in open stitch patterns.',
  },
  {
    slug: 'crochet-blo-tr',
    craft: 'crochet',
    canonicalName: 'Back-loop treble',
    ukName: 'Back-loop treble',
    usName: 'Back-loop double crochet',
    ukAbbreviation: 'blo-tr',
    usAbbreviation: 'blo-dc',
    category: 'special',
    chartSymbol: 'back-loop',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Treble through the back loop only. Leaves a visible front-loop ridge; used in ribbed columnar panels.',
  },

  // ── Post stitches ───────────────────────────────────────────────────
  {
    slug: 'crochet-fpdc',
    craft: 'crochet',
    canonicalName: 'Front post double crochet',
    ukName: 'Front post double crochet',
    usName: 'Front post single crochet',
    ukAbbreviation: 'fpdc',
    usAbbreviation: 'fpsc',
    category: 'textured',
    chartSymbol: 'front-post',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-double-uk',
    notes:
      'Hook inserts around the post (vertical bar) of the stitch below from front to back to front. Pulls the stitch forward for a raised ribbed effect.',
  },
  {
    slug: 'crochet-bpdc',
    craft: 'crochet',
    canonicalName: 'Back post double crochet',
    ukName: 'Back post double crochet',
    usName: 'Back post single crochet',
    ukAbbreviation: 'bpdc',
    usAbbreviation: 'bpsc',
    category: 'textured',
    chartSymbol: 'back-post',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-double-uk',
    notes:
      'Hook inserts around the post from back to front to back. Pushes the stitch behind the work; alternating fpdc and bpdc rows make the classic ribbed fabric.',
  },
  {
    slug: 'crochet-fptr',
    craft: 'crochet',
    canonicalName: 'Front post treble',
    ukName: 'Front post treble',
    usName: 'Front post double crochet',
    ukAbbreviation: 'fptr',
    usAbbreviation: 'fpdc',
    category: 'textured',
    chartSymbol: 'front-post',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'A raised treble worked around the post from front to back to front. The height of a treble with a pronounced forward-popping column; the stitch behind Aran-style crochet cable panels.',
  },
  {
    slug: 'crochet-bptr',
    craft: 'crochet',
    canonicalName: 'Back post treble',
    ukName: 'Back post treble',
    usName: 'Back post double crochet',
    ukAbbreviation: 'bptr',
    usAbbreviation: 'bpdc',
    category: 'textured',
    chartSymbol: 'back-post',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-treble',
    notes:
      'A raised treble worked around the post from back to front to back. Alternating fptr and bptr across rows mimics the knitted brioche rib; used in Aran-style crochet panels.',
  },

  // ── Specialty stitches ──────────────────────────────────────────────
  {
    slug: 'crochet-solomons-knot',
    craft: 'crochet',
    canonicalName: "Solomon's knot",
    ukName: "Solomon's knot",
    usName: "Solomon's knot",
    ukAbbreviation: 'SK',
    usAbbreviation: 'SK',
    category: 'lace',
    chartSymbol: 'solomons-knot',
    difficulty: 'INTERMEDIATE',
    notes:
      'A long elongated chain loop locked with a single crochet into the back strand. Creates an open diamond mesh for shawls, bags, and lace scarves. Also called lover\'s knot.',
  },
  {
    slug: 'crochet-herringbone-htr',
    craft: 'crochet',
    canonicalName: 'Herringbone half treble',
    ukName: 'Herringbone half treble',
    usName: 'Herringbone half double crochet',
    ukAbbreviation: 'hb-htr',
    usAbbreviation: 'hb-hdc',
    category: 'textured',
    chartSymbol: 'herringbone-htr',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-half-treble',
    notes:
      'A modified htr where the yarn over is pulled through both loops and the first remaining loop in one movement. The stitch sits at a slight diagonal, creating a herringbone-weave surface.',
  },
  {
    slug: 'crochet-linked-dc',
    craft: 'crochet',
    canonicalName: 'Linked double crochet',
    ukName: 'Linked double crochet',
    usName: 'Linked single crochet',
    ukAbbreviation: 'lnk-dc',
    usAbbreviation: 'lnk-sc',
    category: 'textured',
    chartSymbol: 'linked-dc',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-double-uk',
    notes:
      'Each new stitch links into the horizontal thread of the previous stitch before inserting through the base stitch. Creates a dense, woven fabric with no visible gaps between columns.',
  },
  {
    slug: 'crochet-waistcoat-stitch',
    craft: 'crochet',
    canonicalName: 'Waistcoat stitch',
    ukName: 'Waistcoat stitch',
    usName: 'Waistcoat stitch',
    ukAbbreviation: 'wc',
    usAbbreviation: 'wc',
    category: 'textured',
    chartSymbol: 'waistcoat',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-double-uk',
    notes:
      'Double crochet worked into the two vertical strands of the V at the top of the stitch below, rather than the standard two horizontal loops. The fabric surface shows distinctive V columns — exactly like a knitted stocking stitch.',
  },
  {
    slug: 'crochet-crocodile-stitch',
    craft: 'crochet',
    canonicalName: 'Crocodile stitch',
    ukName: 'Crocodile stitch',
    usName: 'Crocodile stitch',
    ukAbbreviation: 'croc',
    usAbbreviation: 'croc',
    category: 'textured',
    chartSymbol: 'crocodile',
    difficulty: 'ADVANCED',
    parentStitchSlug: 'crochet-treble',
    notes:
      'Scale-like panels built from two sets of five trebles worked around the posts of a V-stitch foundation in opposite directions. The overlapping scales mimic crocodile or dragon skin.',
  },
  {
    slug: 'crochet-star-stitch',
    craft: 'crochet',
    canonicalName: 'Star stitch',
    ukName: 'Star stitch',
    usName: 'Star stitch',
    ukAbbreviation: 'star',
    usAbbreviation: 'star',
    category: 'textured',
    chartSymbol: 'star-stitch',
    difficulty: 'INTERMEDIATE',
    notes:
      'A cluster of five loops pulled through a central point to form a star-like gathered shape. Two or three chains close each star; the resulting fabric shows interlocking star motifs.',
  },
  {
    slug: 'crochet-spider-stitch',
    craft: 'crochet',
    canonicalName: 'Spider stitch',
    ukName: 'Spider stitch',
    usName: 'Spider stitch',
    ukAbbreviation: 'spi',
    usAbbreviation: 'spi',
    category: 'lace',
    chartSymbol: 'spider',
    difficulty: 'INTERMEDIATE',
    notes:
      'A lace-weight motif of multiple treble legs radiating from a centre chain. Common in filet crochet borders and Victorian needlework-style motifs. Named for the resemblance to a spider body.',
  },
  {
    slug: 'crochet-picot-chain',
    craft: 'crochet',
    canonicalName: 'Picot chain',
    ukName: 'Picot chain',
    usName: 'Picot chain',
    ukAbbreviation: 'pic-ch',
    usAbbreviation: 'pic-ch',
    category: 'edging',
    chartSymbol: 'picot',
    difficulty: 'BEGINNER',
    parentStitchSlug: 'crochet-picot',
    notes:
      'A row of picots separated by two chains — a refined version of the basic picot edge. Used at the finish of shawls, doilies, and collars where a regular row of simple picots reads too dense.',
  },

  // ── Decreases + increases ───────────────────────────────────────────
  {
    slug: 'crochet-dc2tog',
    craft: 'crochet',
    canonicalName: 'Double crochet two together',
    ukName: 'Double crochet two together',
    usName: 'Single crochet two together',
    ukAbbreviation: 'dc2tog',
    usAbbreviation: 'sc2tog',
    category: 'decrease',
    chartSymbol: 'dc2tog',
    difficulty: 'BEGINNER',
    parentStitchSlug: 'crochet-double-uk',
    notes:
      'Insert hook into next st, pull up loop; insert hook into following st, pull up loop — three loops on hook. Yarn over and pull through all three. One stitch decreased.',
  },
  {
    slug: 'crochet-invisible-decrease',
    craft: 'crochet',
    canonicalName: 'Invisible decrease',
    ukName: 'Invisible decrease',
    usName: 'Invisible decrease',
    ukAbbreviation: 'inv-dec',
    usAbbreviation: 'inv-dec',
    category: 'decrease',
    chartSymbol: 'invisible-dec',
    difficulty: 'BEGINNER',
    parentStitchSlug: 'crochet-double-uk',
    notes:
      'Insert hook through the front loop only of the next st, then through the front loop only of the following st — two loops on hook. Yarn over, pull through both, yarn over, pull through remaining two. Flatter and neater than the standard dc2tog; the standard close in amigurumi.',
  },
  {
    slug: 'crochet-surface-slip-stitch',
    craft: 'crochet',
    canonicalName: 'Surface slip stitch',
    ukName: 'Surface slip stitch',
    usName: 'Surface slip stitch',
    ukAbbreviation: 'surf-sl',
    usAbbreviation: 'surf-sl',
    category: 'special',
    chartSymbol: 'slip-stitch',
    difficulty: 'BEGINNER',
    parentStitchSlug: 'crochet-slip-stitch',
    notes:
      'Slip stitches worked on the surface of a finished piece without passing the hook through the main fabric. Creates raised decorative lines, faux seams, and coloured outlines on finished crochet.',
  },

  // ── Tunisian ────────────────────────────────────────────────────────
  {
    slug: 'crochet-tunisian-simple',
    craft: 'crochet',
    canonicalName: 'Tunisian simple stitch',
    ukName: 'Tunisian simple stitch',
    usName: 'Tunisian simple stitch',
    ukAbbreviation: 'Tss',
    usAbbreviation: 'Tss',
    category: 'special',
    chartSymbol: 'tunisian-simple',
    difficulty: 'INTERMEDIATE',
    notes:
      'The foundation Tunisian stitch. Forward pass: insert hook into each vertical bar and pull up a loop, keeping all loops on the hook. Return pass: yarn over and pull through two loops at a time until one remains. The fabric has a woven look.',
  },
  {
    slug: 'crochet-tunisian-knit',
    craft: 'crochet',
    canonicalName: 'Tunisian knit stitch',
    ukName: 'Tunisian knit stitch',
    usName: 'Tunisian knit stitch',
    ukAbbreviation: 'Tks',
    usAbbreviation: 'Tks',
    category: 'special',
    chartSymbol: 'tunisian-knit',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-tunisian-simple',
    notes:
      'Forward pass inserts hook through the interstitial loop between the front and back strands of the vertical bar — mimics the look of a knitted stocking stitch V on the right side.',
  },
  {
    slug: 'crochet-tunisian-purl',
    craft: 'crochet',
    canonicalName: 'Tunisian purl stitch',
    ukName: 'Tunisian purl stitch',
    usName: 'Tunisian purl stitch',
    ukAbbreviation: 'Tps',
    usAbbreviation: 'Tps',
    category: 'special',
    chartSymbol: 'tunisian-purl',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-tunisian-simple',
    notes:
      'Yarn held to the front before inserting hook into the vertical bar. Produces a purl bump on the right side; alternating knit and purl rows builds Tunisian ribbing.',
  },
  {
    slug: 'crochet-tunisian-full',
    craft: 'crochet',
    canonicalName: 'Tunisian full stitch',
    ukName: 'Tunisian full stitch',
    usName: 'Tunisian full stitch',
    ukAbbreviation: 'Tfs',
    usAbbreviation: 'Tfs',
    category: 'special',
    chartSymbol: 'tunisian-full',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-tunisian-simple',
    notes:
      'Hook inserts between vertical bars — into the gap, not the bar itself. Creates a woven wicker texture denser and thicker than the simple stitch.',
  },
  {
    slug: 'crochet-tunisian-extended',
    craft: 'crochet',
    canonicalName: 'Tunisian extended stitch',
    ukName: 'Tunisian extended stitch',
    usName: 'Tunisian extended stitch',
    ukAbbreviation: 'Tes',
    usAbbreviation: 'Tes',
    category: 'special',
    chartSymbol: 'tunisian-extended',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-tunisian-simple',
    notes:
      'A chain added to each loop before the next pick-up on the forward pass. Taller and more open than the simple stitch; the resulting fabric drapes better and curls less.',
  },
  {
    slug: 'crochet-tunisian-honeycomb',
    craft: 'crochet',
    canonicalName: 'Tunisian honeycomb',
    ukName: 'Tunisian honeycomb',
    usName: 'Tunisian honeycomb',
    ukAbbreviation: 'T-hc',
    usAbbreviation: 'T-hc',
    category: 'special',
    chartSymbol: 'tunisian-honeycomb',
    difficulty: 'ADVANCED',
    parentStitchSlug: 'crochet-tunisian-simple',
    notes:
      'Alternating rows of Tunisian knit and purl stitches offset to create hexagonal cell shapes. Reversible; produces a thick insulating fabric suited to dishcloths and pot holders.',
  },

  // ── Broomstick lace ─────────────────────────────────────────────────
  {
    slug: 'crochet-broomstick-loop',
    craft: 'crochet',
    canonicalName: 'Broomstick lace loop',
    ukName: 'Broomstick lace loop',
    usName: 'Broomstick lace loop',
    ukAbbreviation: 'BL',
    usAbbreviation: 'BL',
    category: 'special',
    chartSymbol: 'broomstick-loop',
    difficulty: 'INTERMEDIATE',
    notes:
      'A loop elongated onto a large dowel or thick knitting needle (the "broomstick"). Groups of five elongated loops are slipped back onto the hook and worked together to form a petal cluster. The specialDiscipline is BROOMSTICK.',
  },
  {
    slug: 'crochet-broomstick-cluster',
    craft: 'crochet',
    canonicalName: 'Broomstick lace cluster',
    ukName: 'Broomstick lace cluster',
    usName: 'Broomstick lace cluster',
    ukAbbreviation: 'BLC',
    usAbbreviation: 'BLC',
    category: 'special',
    chartSymbol: 'broomstick-cluster',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-broomstick-loop',
    notes:
      'Five elongated loops slipped back as a group onto the hook and worked off together with one double crochet per loop from the centre of the group. The raised petal shape that gives broomstick lace its distinctive look.',
  },

  // ── Hairpin lace ─────────────────────────────────────────────────────
  {
    slug: 'crochet-hairpin-basic',
    craft: 'crochet',
    canonicalName: 'Hairpin lace basic strip',
    ukName: 'Hairpin lace basic strip',
    usName: 'Hairpin lace basic strip',
    ukAbbreviation: 'HP',
    usAbbreviation: 'HP',
    category: 'lace',
    chartSymbol: 'hairpin-basic',
    difficulty: 'INTERMEDIATE',
    notes:
      'A central crochet column worked between the two prongs of a hairpin lace frame, looping the yarn around each prong in turn. The loops are the lace element; the column holds the strip together.',
  },
  {
    slug: 'crochet-hairpin-braid-join',
    craft: 'crochet',
    canonicalName: 'Hairpin braid join',
    ukName: 'Hairpin braid join',
    usName: 'Hairpin braid join',
    ukAbbreviation: 'HP-braid',
    usAbbreviation: 'HP-braid',
    category: 'joining',
    chartSymbol: 'hairpin-join',
    difficulty: 'INTERMEDIATE',
    parentStitchSlug: 'crochet-hairpin-basic',
    notes:
      'Joining two hairpin lace strips by braiding their loops together and securing with a row of slip stitches or chain loops. The join becomes part of the lace pattern.',
  },

  // ── Irish crochet ────────────────────────────────────────────────────
  {
    slug: 'crochet-irish-motif-basic',
    craft: 'crochet',
    canonicalName: 'Irish crochet motif',
    ukName: 'Irish crochet motif',
    usName: 'Irish crochet motif',
    ukAbbreviation: 'IC',
    usAbbreviation: 'IC',
    category: 'lace',
    chartSymbol: 'irish-motif',
    difficulty: 'ADVANCED',
    notes:
      'Raised dimensional motifs (roses, shamrocks, leaves) worked in fine thread and then assembled into a net ground. Traditional Irish crochet uses padded stitches that wrap a thick cord for extra relief.',
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

  {
    slug: 'knitting-brioche-knit',
    craft: 'knitting',
    canonicalName: 'Brioche knit',
    ukAbbreviation: 'brk',
    usAbbreviation: 'brk',
    category: 'textured',
    difficulty: 'INTERMEDIATE',
    notes:
      'Knit the stitch and its paired yarn-over together. The visible stitch of two-colour brioche; produces the raised knit column.',
  },
  {
    slug: 'knitting-brioche-purl',
    craft: 'knitting',
    canonicalName: 'Brioche purl',
    ukAbbreviation: 'brp',
    usAbbreviation: 'brp',
    category: 'textured',
    difficulty: 'INTERMEDIATE',
    notes:
      'Purl the stitch and its paired yarn-over together. The WS stitch of brioche; worked the same direction as brk but from the purl side.',
  },
  {
    slug: 'knitting-k3tog',
    craft: 'knitting',
    canonicalName: 'Knit three together',
    ukAbbreviation: 'k3tog',
    usAbbreviation: 'k3tog',
    category: 'decrease',
    chartSymbol: 'k3tog',
    difficulty: 'INTERMEDIATE',
    notes:
      'Right-leaning double decrease: insert needle into three stitches as if to knit, knit them together. Removes two stitches at once.',
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
  {
    slug: 'knitting-long-tail-cast-on',
    craft: 'knitting',
    canonicalName: 'Long-tail cast on',
    ukName: 'Long-tail cast on',
    usName: 'Long-tail cast on',
    ukAbbreviation: 'lt-co',
    usAbbreviation: 'lt-co',
    category: 'foundation',
    difficulty: 'BEGINNER',
    notes:
      'Two-strand cast-on worked with a measured tail and the working yarn — produces the first row and the cast-on edge in one pass. The default starting method in most modern UK knitting patterns.',
  },
  {
    slug: 'knitting-knit-cast-on',
    craft: 'knitting',
    canonicalName: 'Knitted cast on',
    ukName: 'Knitted cast on',
    usName: 'Knitted cast on',
    ukAbbreviation: 'k-co',
    usAbbreviation: 'k-co',
    category: 'foundation',
    difficulty: 'BEGINNER',
    notes:
      'A single-strand cast-on worked by knitting into the previous stitch and slipping the new loop back onto the left needle. Slower than the long-tail; useful for casting on mid-row.',
  },
  {
    slug: 'knitting-cast-off',
    craft: 'knitting',
    canonicalName: 'Cast off',
    ukName: 'Cast off',
    usName: 'Bind off',
    ukAbbreviation: 'co',
    usAbbreviation: 'bo',
    category: 'bind-off',
    difficulty: 'BEGINNER',
    notes:
      'The standard finished edge — knit two, pass the first stitch over the second and off the needle, continue. UK "cast off" equals US "bind off".',
  },

  // ── Cross-stitch ────────────────────────────────────────────────────
  // Counted cross-stitch has no UK/US terminology split, so ukName and
  // usName carry the same wording. Symbols are the grid-drawn glyphs in
  // `apps/web/src/lib/craft-charts/chart-symbols.ts`.
  {
    slug: 'cross-stitch-full-cross',
    craft: 'cross-stitch',
    canonicalName: 'Full cross stitch',
    ukName: 'Full cross stitch',
    usName: 'Full cross stitch',
    category: 'basic',
    chartSymbol: 'full-cross',
    difficulty: 'BEGINNER',
    aliases: ['cross stitch', 'whole stitch', 'full stitch'],
    notes:
      'Two diagonal stitches crossing over one fabric square. It fills the square and it is what almost every chart square asks for. Keep the top leg lying the same way across the whole piece and the finished surface catches the light evenly.',
  },
  {
    slug: 'cross-stitch-half-stitch',
    craft: 'cross-stitch',
    canonicalName: 'Half stitch',
    ukName: 'Half stitch',
    usName: 'Half stitch',
    category: 'basic',
    chartSymbol: 'half-stitch',
    difficulty: 'BEGINNER',
    aliases: ['half cross stitch', 'tent stitch'],
    notes:
      'The first leg of a cross on its own, worked corner to corner across one square. Used for soft background shading and for skies and water, where a lighter, flatter surface reads better than full crosses.',
  },
  {
    slug: 'cross-stitch-quarter-stitch',
    craft: 'cross-stitch',
    canonicalName: 'Quarter stitch',
    ukName: 'Quarter stitch',
    usName: 'Quarter stitch',
    category: 'basic',
    chartSymbol: 'quarter-stitch',
    difficulty: 'INTERMEDIATE',
    aliases: ['fractional stitch'],
    notes:
      'A short diagonal from one corner of the square into its centre. It fills a quarter of the square, so two different colours can share one square where a curve or a point needs a cleaner edge.',
  },
  {
    slug: 'cross-stitch-three-quarter-stitch',
    craft: 'cross-stitch',
    canonicalName: 'Three-quarter stitch',
    ukName: 'Three-quarter stitch',
    usName: 'Three-quarter stitch',
    category: 'basic',
    chartSymbol: 'three-quarter-stitch',
    difficulty: 'INTERMEDIATE',
    aliases: ['fractional stitch', 'three quarter cross stitch'],
    notes:
      'A half stitch plus a quarter stitch in the same square, filling a triangle of it. Charts use it to soften a curve or sharpen a point, usually paired with a quarter stitch of a second colour in the same square.',
  },
  {
    slug: 'cross-stitch-back-stitch',
    craft: 'cross-stitch',
    canonicalName: 'Back-stitch',
    ukName: 'Back-stitch',
    usName: 'Back-stitch',
    category: 'outline',
    chartSymbol: 'back-stitch',
    difficulty: 'BEGINNER',
    aliases: ['backstitch', 'outline stitch'],
    notes:
      'An unbroken line worked hole to hole over finished cross stitches. It draws outlines, whiskers, lettering and window frames, and it is always worked last so the line sits on top of the filled squares.',
  },
  {
    slug: 'cross-stitch-running-stitch',
    craft: 'cross-stitch',
    canonicalName: 'Running stitch',
    ukName: 'Running stitch',
    usName: 'Running stitch',
    category: 'outline',
    chartSymbol: 'running-stitch',
    difficulty: 'BEGINNER',
    aliases: ['straight running stitch'],
    notes:
      'A dashed line: one stitch, one gap, repeated along the row. Used for a softer outline than back-stitch, for basting a grid onto the fabric before you start, and for dotted detail such as stitched rain or a broken border.',
  },
  {
    slug: 'cross-stitch-long-stitch',
    craft: 'cross-stitch',
    canonicalName: 'Long stitch',
    ukName: 'Long stitch',
    usName: 'Long stitch',
    category: 'outline',
    chartSymbol: 'long-stitch',
    difficulty: 'INTERMEDIATE',
    aliases: ['straight stitch', 'long straight stitch'],
    notes:
      'One straight stitch carried over several squares in a single pass. Good for grass, fur, ship rigging and whiskers, where a line of separate small stitches would look broken.',
  },
  {
    slug: 'cross-stitch-french-knot',
    craft: 'cross-stitch',
    canonicalName: 'French knot',
    ukName: 'French knot',
    usName: 'French knot',
    category: 'surface',
    chartSymbol: 'french-knot',
    difficulty: 'INTERMEDIATE',
    aliases: ['french knots', 'knot stitch'],
    notes:
      'A small raised bead made by wrapping the thread round the needle and taking it back down close to where it came up. Used for eyes, berries, flower centres and dots on lettering.',
  },
  {
    slug: 'cross-stitch-lazy-daisy',
    craft: 'cross-stitch',
    canonicalName: 'Lazy daisy',
    ukName: 'Lazy daisy',
    usName: 'Lazy daisy',
    category: 'surface',
    chartSymbol: 'lazy-daisy',
    difficulty: 'INTERMEDIATE',
    aliases: ['detached chain stitch', 'detached chain'],
    notes:
      'A single chain loop held down by a small stitch at its tip. Worked in a ring it makes a flower; worked singly it makes a leaf or a petal on a sampler.',
  },
  {
    slug: 'cross-stitch-satin-stitch',
    craft: 'cross-stitch',
    canonicalName: 'Satin stitch',
    ukName: 'Satin stitch',
    usName: 'Satin stitch',
    category: 'surface',
    chartSymbol: 'satin-stitch',
    difficulty: 'INTERMEDIATE',
    aliases: ['flat stitch'],
    notes:
      'Straight stitches laid side by side to fill a small shape with a smooth, solid surface. On a counted piece it covers petals, leaves and ribbon bands where the grid of crosses would look too coarse.',
  },
]
