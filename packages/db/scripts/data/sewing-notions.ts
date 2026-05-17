/**
 * Master sewing-notion list — single source of truth for `SewingNotion`.
 *
 * Seeded via `packages/db/scripts/seed-sewing-notions.ts` (idempotent
 * upsert). Starter set of ~25 entries covering the haberdashery items
 * referenced across the PATTERN + TECHNIQUE backlog.
 *
 * `category` is the high-level grouping for browse + filter. Generic
 * categories rather than brand-specific items — the master list never
 * carries a brand or product name.
 *
 * Notes:
 * - `thread` covers fibre + intended use, not a brand or spool size.
 * - `elastic` covers the construction (knit / woven / shirring / fold-
 *   over). Width belongs in the body prose of the tutorial that uses it.
 * - `interfacing` rows live here too even though they're closer to a
 *   fabric — the haberdashery shop sells them on the same shelf and the
 *   author thinks of them as notions.
 */

import type { SewingNotionSeed } from './types.js'

export const SEWING_NOTIONS: SewingNotionSeed[] = [
  // ──────────────────────── Thread ────────────────────────
  {
    slug: 'thread-cotton',
    name: 'Cotton thread',
    category: 'thread',
    notes:
      'All-natural-fibre thread. Use on natural fibres where the seam should age with the fabric (quilting, heirloom shirting). Less elastic than polyester; can snap on stretched seams.',
  },
  {
    slug: 'thread-polyester',
    name: 'Polyester thread',
    category: 'thread',
    notes:
      'The default all-purpose thread. Strong, elastic, works on every domestic machine, suits every fabric category from light cotton up to denim. Buy the size 50 / Tex 27 weight unless the tutorial says otherwise.',
  },
  {
    slug: 'thread-silk',
    name: 'Silk thread',
    category: 'thread',
    notes:
      'Fine, smooth, glossy. Used for hand-tacking and for hand-stitched hems on tailored garments — the thread sinks into the cloth and barely shows.',
  },
  {
    slug: 'thread-button',
    name: 'Button thread',
    category: 'thread',
    notes:
      'Heavy polyester or polyester-cotton blend for sewing on buttons by hand and for hand-stitched buttonholes. Too thick for machine use on a domestic machine.',
  },
  {
    slug: 'embroidery-floss',
    name: 'Embroidery floss',
    category: 'thread',
    notes:
      'Six-strand cotton thread for hand embroidery, sashiko-style visible mending, and decorative running stitch on light cottons. Separate strands as needed (one or two strands for fine work, all six for bold stitch).',
  },

  // ──────────────────────── Elastic ────────────────────────
  {
    slug: 'elastic-knit',
    name: 'Knit elastic',
    category: 'elastic',
    notes:
      'Soft braided knit elastic for waistbands and cuffs. Narrows under tension; thread through a casing for waistbands.',
  },
  {
    slug: 'elastic-woven',
    name: 'Woven elastic',
    category: 'elastic',
    notes:
      'Flat woven elastic that holds its width under tension. The choice for visible waistbands and for elastic threaded into bag tops.',
  },
  {
    slug: 'elastic-shirring',
    name: 'Shirring elastic',
    category: 'elastic',
    notes:
      'Fine thin elastic wound onto the bobbin to gather rows of stitching ("shirring"). Used on the bodice of gathered-rectangle sundresses and on smocked cuffs.',
  },
  {
    slug: 'elastic-fold-over',
    name: 'Fold-over elastic',
    category: 'elastic',
    notes:
      'Slightly stretchy binding-elastic with a centre fold-line. Wraps and finishes a raw edge in one pass — used on baby bibs and reusable cloth pads.',
  },

  // ──────────────────────── Binding + trim ────────────────────────
  {
    slug: 'bias-binding-cotton',
    name: 'Cotton bias binding',
    category: 'binding',
    notes:
      'Pre-folded cotton bias strip for binding raw edges and necklines. Sold in 12 mm, 25 mm, and 50 mm widths in the UK.',
  },
  {
    slug: 'bias-binding-satin',
    name: 'Satin bias binding',
    category: 'binding',
    notes:
      'Satin-finish polyester bias binding. Slippery; pin frequently. Used as a decorative bound edge on light-weight items.',
  },
  {
    slug: 'ribbon-grosgrain',
    name: 'Grosgrain ribbon',
    category: 'trim',
    notes:
      'Crosswise-ribbed woven ribbon. Holds a fold well; used for apron ties and bag straps.',
  },
  {
    slug: 'lace-trim-cotton',
    name: 'Cotton lace trim',
    category: 'trim',
    notes:
      'Open-work cotton lace. The traditional decorative edge on baby bibs, pinafores, and napkins.',
  },
  {
    slug: 'ric-rac',
    name: 'Ric-rac',
    category: 'trim',
    notes:
      'Zigzag-shaped flat trim. Sewn along the centre line to leave a scalloped edge on both sides. Common decorative edge on aprons and children`s clothes.',
  },
  {
    slug: 'pom-pom-trim',
    name: 'Pom-pom trim',
    category: 'trim',
    notes:
      'Flat tape with small pom-poms hanging off one edge. Sewn into a seam so only the pom-poms emerge on the finished side.',
  },

  // ──────────────────────── Closures + fasteners ────────────────────────
  {
    slug: 'button-shirt',
    name: 'Shirt button',
    category: 'closure',
    notes:
      'Flat two- or four-hole button, 10–12 mm. The shirting-and-cushion default. Sew on with button thread, leaving a thread shank the depth of the buttonhole fabric.',
  },
  {
    slug: 'button-coat',
    name: 'Coat button',
    category: 'closure',
    notes:
      'Larger 20–30 mm button. Use on coats, heavy bags, and for the visible decorative buttons on envelope-back cushions.',
  },
  {
    slug: 'button-shank',
    name: 'Shank button',
    category: 'closure',
    notes:
      'Button with a built-in loop on the back. Sits above the fabric on its own — no thread shank to build.',
  },
  {
    slug: 'button-toggle',
    name: 'Toggle',
    category: 'closure',
    notes:
      'Long wooden or horn closure, paired with a fabric or leather loop. Duffle-coat and rustic-bag closure.',
  },
  {
    slug: 'zip-regular',
    name: 'Regular nylon zip',
    category: 'closure',
    notes:
      'Coil-tooth nylon zip. The all-purpose zip for cushion covers, bag pockets, and skirt openings up to 25 cm.',
  },
  {
    slug: 'zip-invisible',
    name: 'Invisible zip',
    category: 'closure',
    notes:
      'Concealed coil zip that disappears into the seam. Requires an invisible-zip foot. Used in fitted skirts and dresses (out of launch scope) and on the back seam of bolster covers.',
  },
  {
    slug: 'zip-chunky',
    name: 'Chunky metal or plastic zip',
    category: 'closure',
    notes:
      'Large-tooth zip for jackets, heavy bags, and tent doors. Use a zipper foot and a size-90 jeans needle.',
  },
  {
    slug: 'zip-open-ended',
    name: 'Open-ended zip',
    category: 'closure',
    notes:
      'Zip that separates fully at the base (a coat zip). Used in jackets and in any pattern where both sides need to open free of each other.',
  },
  {
    slug: 'snap-fastener',
    name: 'Snap fastener',
    category: 'fastener',
    notes:
      'Press-stud pair, sewn or hammered through the fabric. Quick-release closure for bibs, bags, and reusable pads. Hammer-in versions need a punch tool and a hard surface.',
  },
  {
    slug: 'hook-and-eye',
    name: 'Hook and eye',
    category: 'fastener',
    notes:
      'Tiny metal hook-and-loop pair. Concealed waistband closure on skirts and trousers; secondary closure at the top of a zip.',
  },
  {
    slug: 'eyelet',
    name: 'Eyelet',
    category: 'fastener',
    notes:
      'Metal-rimmed hole for a drawstring or lacing. Hammered through with an eyelet-setter; works on canvas, denim, and double-layer cotton.',
  },
  {
    slug: 'grommet',
    name: 'Grommet',
    category: 'fastener',
    notes:
      'Heavy-duty eyelet for curtain headings, tarpaulins, and weight-bearing applications. Bigger than a haberdashery eyelet; usually needs a press tool.',
  },

  // ──────────────────────── Cord + drawstrings ────────────────────────
  {
    slug: 'drawstring-cord',
    name: 'Drawstring cord',
    category: 'cord',
    notes:
      'Round braided cord, 3–6 mm diameter. The drawstring on bags, hoodies, and waist-tied trousers.',
  },

  // ──────────────────────── Stuffing + wadding ────────────────────────
  {
    slug: 'stuffing-polyester',
    name: 'Polyester toy stuffing',
    category: 'stuffing',
    notes:
      'Hollow-fibre polyester wadding for soft toys, cushions, and draught excluders. Washable; holds loft. Avoid for items meant to compost.',
  },
  {
    slug: 'stuffing-wool',
    name: 'Wool stuffing',
    category: 'stuffing',
    notes:
      'Carded wool fleece. Natural, biodegradable, slightly heavier than polyester. The choice for heirloom soft toys and for cushions intended to compost.',
  },
  {
    slug: 'stuffing-cotton-scraps',
    name: 'Cotton scraps',
    category: 'stuffing',
    notes:
      'Cut-up fabric leftovers. The historical pin-cushion and small-toy filling. Free, lumpy, charming when the pattern wants a hand-made not a slick finish.',
  },
  {
    slug: 'fusible-web',
    name: 'Fusible web',
    category: 'interfacing',
    notes:
      'Iron-on adhesive sheet (Bondaweb / Wonder-Under). Used to bond appliqué shapes to a base fabric before stitching. Apply with a dry iron, then peel the backing.',
  },
]
