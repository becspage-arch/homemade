/**
 * One-off: rewrite SubCategory.description for every sub-category row that
 * has had its description updated in the taxonomy seed files.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/update-subcategory-descriptions.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

interface SubCatDesc {
  categorySlug: string
  subSlug: string
  description: string
}

const DESCRIPTIONS: SubCatDesc[] = [
  // cooking
  { categorySlug: 'cooking', subSlug: 'sauces', description: 'Mother sauces and their derivatives.' },
  { categorySlug: 'cooking', subSlug: 'preserves', description: 'Jams, jellies, chutneys, pickles.' },
  // baking
  { categorySlug: 'baking', subSlug: 'bread', description: 'Tin loaves, sourdough, focaccia, soda bread, enriched doughs.' },
  { categorySlug: 'baking', subSlug: 'cakes', description: 'Sponges, Madeira cakes, layer cakes, fruit cakes.' },
  { categorySlug: 'baking', subSlug: 'pastries', description: 'Shortcrust, puff, rough puff, choux, filo, laminated doughs.' },
  { categorySlug: 'baking', subSlug: 'biscuits', description: 'Shortbread, ginger biscuits, oat biscuits, sablés, savoury biscuits.' },
  { categorySlug: 'baking', subSlug: 'pies', description: 'Sweet and savoury pies, tarts, quiches.' },
  { categorySlug: 'baking', subSlug: 'scones', description: 'Sweet scones, cheese scones, fruit scones, drop scones.' },
  { categorySlug: 'baking', subSlug: 'sweets-confectionery', description: 'Caramels, fudge, honeycomb, marshmallows, tempered chocolate.' },
  { categorySlug: 'baking', subSlug: 'cake-decorating', description: 'Buttercream piping, fondant work, royal icing, mirror glazes, sugarpaste figures.' },
  // mindset
  { categorySlug: 'mindset', subSlug: 'tapping', description: 'EFT tapping scripts.' },
  { categorySlug: 'mindset', subSlug: 'energy-statement', description: 'Short release-and-allow statements.' },
  { categorySlug: 'mindset', subSlug: 'spell', description: 'Folk-magic-shaped focusing rituals with simple physical objects (candle, salt, water, paper).' },
  { categorySlug: 'mindset', subSlug: 'ritual', description: 'Weekly and seasonal ceremonies.' },
  { categorySlug: 'mindset', subSlug: 'activity', description: 'Object-based, in-the-world practices — coin rituals, wardrobe anchors, walk-by visualisations.' },
  { categorySlug: 'mindset', subSlug: 'journal-prompt', description: 'Question sets for the page.' },
  { categorySlug: 'mindset', subSlug: 'visualisation', description: 'Image-led practices walked through in second-person prose.' },
  { categorySlug: 'mindset', subSlug: 'meditation', description: 'Short guided meditations — body scan, breathwork, image-led.' },
  { categorySlug: 'mindset', subSlug: 'reading', description: 'Long-form explainers on how a method works, where a lineage comes from, and what the evidence says.' },
  // garden
  { categorySlug: 'garden', subSlug: 'foraging', description: 'Wild food identification — UK hedgerow, woodland, coastline. Absolute-beginner safety rules.' },
  // herbal-medicine
  { categorySlug: 'herbal-medicine', subSlug: 'materia-medica', description: 'Single-herb profiles. Latin binomial, parts used, primary actions, key constituents, traditional uses, safety.' },
  { categorySlug: 'herbal-medicine', subSlug: 'womens-health', description: 'Remedies for period discomfort, perimenopausal symptoms, mild cycle support.' },
  { categorySlug: 'herbal-medicine', subSlug: 'mental-emotional', description: 'Mild-mood remedies.' },
  { categorySlug: 'herbal-medicine', subSlug: 'immune-support', description: 'Remedies for the seasonal cold, mild flu support, immune-tonic herbs.' },
  // crochet
  { categorySlug: 'crochet', subSlug: 'stitches', description: 'Individual named stitch tutorials — chain, slip stitch, double crochet, half treble, treble, double treble, and textured stitches (bobble, shell, V-stitch, cluster, puff, popcorn).' },
  { categorySlug: 'crochet', subSlug: 'motifs', description: 'In-the-round repeating shapes — granny squares, hexagons, circles, mandalas, flowers, and the joining techniques that turn individual motifs into finished pieces.' },
  { categorySlug: 'crochet', subSlug: 'homewares', description: 'Finished-item patterns for the home — dishcloths, facecloths, pot holders, blankets, cushion covers, baskets, and storage vessels.' },
  { categorySlug: 'crochet', subSlug: 'garments', description: 'Wearable patterns — shawls, scarves, hats, mittens, socks, and simple top-down or granny-square-construction garments.' },
  { categorySlug: 'crochet', subSlug: 'foundations', description: 'Long-form articles on the craft — gauge swatching, blocking, joining methods, reading a pattern chart, choosing yarn, understanding tension.' },
  // knitting
  { categorySlug: 'knitting', subSlug: 'stitches', description: 'Single-stitch tutorials — knit, purl, k2tog, cables, lace.' },
  { categorySlug: 'knitting', subSlug: 'foundations', description: 'Casting on, casting off, reading a chart, choosing yarn and needles, gauge swatching, blocking.' },
  { categorySlug: 'knitting', subSlug: 'scarves-shawls', description: 'Garter scarves, ribbed scarves, lace shawls, triangular shawls.' },
  { categorySlug: 'knitting', subSlug: 'hats', description: 'Ribbed hats, watch caps, slouch hats, berets, baby bonnets.' },
  { categorySlug: 'knitting', subSlug: 'dishcloths-homewares', description: 'Dishcloths, washcloths, tea cosies, coasters, cushion covers.' },
  { categorySlug: 'knitting', subSlug: 'baby', description: 'Baby blankets, booties, bonnets, cardigans.' },
  { categorySlug: 'knitting', subSlug: 'blankets', description: 'Throws, lap blankets, modular blankets, mitred-square projects.' },
  { categorySlug: 'knitting', subSlug: 'socks', description: 'Cuff-down and toe-up socks, fingering-weight and worsted-weight variants, heel constructions.' },
  { categorySlug: 'knitting', subSlug: 'garments', description: 'Jumpers, cardigans, vests.' },
  // fibre-arts
  { categorySlug: 'fibre-arts', subSlug: 'felting', description: 'Wet felting, needle felting, nuno felting, hat-shaping, wet-felted vessels.' },
  { categorySlug: 'fibre-arts', subSlug: 'spinning', description: 'Drop spindle (top-whorl, bottom-whorl), supported spindle, spinning wheel (Saxony, castle, e-spinner), fibre preparation (carding, combing, blending).' },
  { categorySlug: 'fibre-arts', subSlug: 'weaving', description: 'Frame loom, rigid heddle, four-shaft, tapestry, inkle, card weaving.' },
  { categorySlug: 'fibre-arts', subSlug: 'natural-dyeing', description: 'Plant dyes, mineral mordants, indigo, eco-printing.' },
  { categorySlug: 'fibre-arts', subSlug: 'macrame', description: "Square, alternating square, half-hitch, double half-hitch, lark's head, gathering, overhand, and figure-8 knots, plus plant hangers, wall hangings, and belts." },
  { categorySlug: 'fibre-arts', subSlug: 'rug-making', description: 'Hooked, latch-hook, rag rugs, locker hook.' },
  // needlework
  { categorySlug: 'needlework', subSlug: 'cross-stitch', description: 'Counted cross-stitch on Aida, evenweave, and linen, plus stamped cross-stitch on pre-printed cloth. Includes blackwork, Assisi, and miniature work.' },
  { categorySlug: 'needlework', subSlug: 'needlepoint', description: 'Worked on canvas with wool or stranded cotton — canvaswork, bargello flame stitch, and petit point.' },
  { categorySlug: 'needlework', subSlug: 'tatting', description: 'Knotted lace worked with a shuttle or a tatting needle. Rings and chains build edgings, doilies, motifs.' },
  { categorySlug: 'needlework', subSlug: 'lacemaking', description: 'Bobbin lace worked on a pillow with bobbins, pricked patterns, and pins; needle lace built up from a couched thread skeleton.' },
  // sewing
  { categorySlug: 'sewing', subSlug: 'techniques', description: 'Hand-stitch types, machine-stitch fundamentals, seam and hem and edge finishes, closures, gathering and pleating, fabric prep and pattern marking.' },
  { categorySlug: 'sewing', subSlug: 'homewares-soft-furnishing', description: 'Cushion covers (envelope, zip, button-back), bolster covers, hot-water-bottle covers, oven mitts, pot holders, draught excluders.' },
  { categorySlug: 'sewing', subSlug: 'curtains-blinds', description: 'Rod-pocket, tab-top, eyelet-headed, and café-curtain styles. Lining and blackout-lining methods.' },
  { categorySlug: 'sewing', subSlug: 'baby-children', description: 'Bibs, simple swaddles, cot bumpers, baby blankets, simple baby trousers, kid aprons, child pinafores from gathered rectangles.' },
  { categorySlug: 'sewing', subSlug: 'soft-toys', description: 'Stuffed rabbits, simple bears, fabric dolls, fish-shaped pillows, snake draught-excluders, simple amigurumi-adjacent shapes.' },
  { categorySlug: 'sewing', subSlug: 'kitchen-table-linens', description: 'Tea towels, napkins, table runners, tablecloths, placemats, bread bags.' },
  { categorySlug: 'sewing', subSlug: 'mending-visible-mending', description: 'Patch mending, sashiko-style visible repair, darning (woven and Swiss), invisible mending, button replacement, tear repair, hem rescue.' },
  { categorySlug: 'sewing', subSlug: 'quilting', description: 'Patchwork basics, binding, basting, straight-line and free-motion quilting, hand quilting, simple block-and-strip designs.' },
  { categorySlug: 'sewing', subSlug: 'reusable-household', description: 'Reusable kitchen roll, snack bags, beeswax-wrap replacements, breast pads, sanitary pads, makeup-removal pads, produce bags.' },
  { categorySlug: 'sewing', subSlug: 'christmas-seasonal', description: "Christmas stockings, advent calendars, fabric tree ornaments, bunting and flags, lavender bags, Easter chicks, Hallowe'en decorations." },
  { categorySlug: 'sewing', subSlug: 'simple-clothing-rectangles', description: 'Drawstring and elastic-waist trousers and shorts, gathered-rectangle peasant tops, simple A-line skirts (rectangle plus pleat), gathered sundresses and nightdresses.' },
  { categorySlug: 'sewing', subSlug: 'accessories-small-projects', description: 'Eye masks, hair scrunchies, headbands, fabric flowers, brooches, lavender hearts.' },
  // wood-natural-craft
  { categorySlug: 'wood-natural-craft', subSlug: 'whittling', description: 'Knife-only projects worked from a small blank — birds, butter knives, pot stirrers, simple figures, walking-stick details.' },
  { categorySlug: 'wood-natural-craft', subSlug: 'spoon-carving', description: 'Green-wood eating spoons, cooking spoons, ladles, kuksas, scoops. Sycamore, birch, lime, cherry.' },
  { categorySlug: 'wood-natural-craft', subSlug: 'green-woodwork', description: 'Chairs, stools, mallets, tool handles, riven-blank work at the shaving horse. Hazel, ash, oak, beech.' },
  { categorySlug: 'wood-natural-craft', subSlug: 'seasoned-wood', description: 'Boxes, frames, picture frames, small furniture, joinery basics. Kiln-dried or air-dried board stock.' },
  { categorySlug: 'wood-natural-craft', subSlug: 'basketry-willow', description: 'Round baskets, square baskets, hurdles, garden structures, willow-rod fencing. Salix triandra, viminalis, purpurea.' },
  { categorySlug: 'wood-natural-craft', subSlug: 'pyrography', description: 'Wood burning, design transfer, shading techniques. Birch, lime, sycamore, maple, beech, poplar, untreated pine only; ventilation required.' },
  // paper-word
  { categorySlug: 'paper-word', subSlug: 'bookbinding', description: 'Coptic, long-stitch, Japanese stab, pamphlet, accordion, dos-à-dos, and perfect-bound book structures. From signatures and end-papers up to covered boards.' },
  { categorySlug: 'paper-word', subSlug: 'calligraphy', description: 'Broad-edge and pointed-pen calligraphy traditions — Foundational, Roman capitals, Italic, Spencerian, Copperplate, uncial.' },
  { categorySlug: 'paper-word', subSlug: 'papermaking', description: 'Sheet-forming from cotton linter and recycled fibre, embedded inclusions, watermarks, sized paper, and the Japanese washi tradition (kozo, gampi, mitsumata).' },
  { categorySlug: 'paper-word', subSlug: 'journalling-craft', description: "The making of journals and journal pages — page layouts, spreads, hand-lettered headers, washi-tape techniques, ephemera collage, traveller's notebooks, signature binding for journals." },
  { categorySlug: 'paper-word', subSlug: 'zines', description: 'Folded mini-zines (the eight-page from one A4), perfect-bound zines, photocopy aesthetics, accordion-fold zines.' },
  { categorySlug: 'paper-word', subSlug: 'scrapbooking', description: 'Page layouts, ephemera collage, mixed-media techniques, photo-corner mounting.' },
  { categorySlug: 'paper-word', subSlug: 'origami', description: 'Origami models from pre-1928 published folds — Kindergarten Gifts and Occupations, Friedrich Fröbel, and late-Meiji Japanese primers.' },
  // pottery-ceramics
  { categorySlug: 'pottery-ceramics', subSlug: 'hand-building-no-equipment', description: 'Pinch, coil, slab, drape, hump, and sprig-moulded work in air-dry, polymer, paper-clay, and kiln-fired bodies that can be built without a wheel.' },
  { categorySlug: 'pottery-ceramics', subSlug: 'surface-decoration', description: 'Sgraffito, mishima inlay, slip-trailing, terra sigillata, burnishing, carving, stamping, and impressed work on greenware and bisque.' },
  { categorySlug: 'pottery-ceramics', subSlug: 'throwing', description: "Wheel work — centring, opening, pulling walls, trimming foot rings, lidded forms, throwing off the hump. Requires a potter's wheel." },
  { categorySlug: 'pottery-ceramics', subSlug: 'glazing', description: 'Dipping, brushing, pouring, spraying, and layering glazes on bisqueware. Both raw-material chemistry and pre-mixed commercial glazes.' },
  { categorySlug: 'pottery-ceramics', subSlug: 'firing', description: 'Bisque and glaze firing schedules at cone 06, 04, 6, and 9-10. Electric kiln cycles, pyrometric-cone witness firings, raku and pit-fire methods.' },
  { categorySlug: 'pottery-ceramics', subSlug: 'clay-fundamentals', description: 'Choosing a clay body, wedging, reclaim, drying stages (wet → leather-hard → bone-dry → greenware), bisque vs. glazeware, the differences between earthenware, stoneware, and porcelain.' },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } })
  const idBySlug = new Map(categories.map((c) => [c.slug, c.id]))

  let updated = 0
  let current = 0
  let notFound = 0

  for (const { categorySlug, subSlug, description } of DESCRIPTIONS) {
    const categoryId = idBySlug.get(categorySlug)
    if (!categoryId) {
      console.log(`  [skip] category not found: ${categorySlug}`)
      notFound++
      continue
    }
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId, slug: subSlug } },
    })
    if (!existing) {
      console.log(`  [skip] subcategory not found: ${categorySlug}/${subSlug}`)
      notFound++
      continue
    }
    if (existing.description === description) {
      current++
      continue
    }
    await prisma.subCategory.update({
      where: { id: existing.id },
      data: { description },
    })
    console.log(`  [update] ${categorySlug}/${subSlug}`)
    updated++
  }

  console.log(`\nDone. Updated ${updated}, already current ${current}, not found ${notFound}.`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
