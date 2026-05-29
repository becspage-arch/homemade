/**
 * Bulk fixes for baking, fibre-arts, pottery-ceramics, animals-smallholding,
 * home-repair categories. Targets grade-level-strict and voice-violation BLOCKs.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

// [slug, fromText, toText]
const SLUG_FIXES: [string, string, string][] = [
  // ── ANIMALS-SMALLHOLDING ─────────────────────────────────────────────────

  ['abattoir-booking-and-movement-paperwork',
    'Arrive at the agreed time with the eAML2 reference, the FCI form, and animals correctly identified. Abattoirs cannot legally accept pigs without movement documentation. The abattoir will issue a kill sheet with deadweight and killing-out percentage; keep this for the holding records.',
    'Arrive on time with the eAML2 reference, FCI form, and correctly tagged animals. Abattoirs cannot legally take pigs without movement papers. The abattoir will give a kill sheet with deadweight and kill-out percentage; keep this for your records.'],

  ['adding-a-honey-super',
    'The right moment to add a super is when bees are occupying eight or nine of the brood frames and beginning to crowd the top bars during a routine inspection. At that point the colony has the numbers to work a second box and the population pressure that leads to swarming if there is nowhere to expand.',
    'Add a super when bees fill eight or nine brood frames and begin to crowd the top bars at inspection. At that point the colony is large enough to work a second box. Without room to expand, swarming pressure builds.'],

  ['biosecurity-on-a-smallholding',
    'Keep a visitor log for anyone entering the livestock area, particularly during disease alerts. APHA may request these records during a disease investigation. The holding register also provides the movement history needed to support disease tracing. Both are straightforward to maintain and have much value if a disease event does occur.',
    'Keep a visitor log for anyone entering the livestock area, especially during disease alerts. APHA may ask for these records in a disease inquiry. The holding register also gives the movement history needed for disease tracing. Both are easy to maintain and worth a great deal if disease does occur.'],

  ['colostrum-and-newborn-lamb-management',
    'A lamb born with no passive immunity is vulnerable to every pathogen in the lambing shed. Colostrum provides the antibody cover that fills this gap until the lamb\'s own immune system begins to function at two to three weeks. The gut closure window means every lambing shed decision in the first two hours should be organised around getting colostrum into the lamb.',
    'A lamb born with no passive immunity is open to every germ in the lambing shed. Colostrum gives the antibody cover that fills this gap until the lamb\'s own immune system starts at two to three weeks. The gut-closure window means every choice in the first two hours should focus on getting colostrum into the lamb.'],

  ['farrowing-pen-setup-for-an-outdoor-sow',
    'A sow should be moved into the prepared farrowing area five to seven days before her due date so she can settle into the space before farrowing begins. The preparation covers the farrowing arc or hut, the creep area, the perimeter fencing, and the anti-crush rails. Each element has a specific function; skipping any one of them increases piglet mortality.',
    'Move the sow into the farrowing area five to seven days before her due date so she can settle in. The setup covers the farrowing arc or hut, creep area, perimeter fence, and anti-crush rails. Each element has a clear job; leaving any one out raises piglet losses.'],

  ['mucking-out-a-pig-arc',
    'The arc should be mucked out completely once a week in summer and topped up with fresh straw every two to three days. In winter, a deep-litter approach reduces heat loss: add 5 to 10 cm of fresh straw on top of the existing bedding every two to three days and remove and replace the whole bed every three to four weeks.',
    'Muck out the arc fully once a week in summer. Top up with fresh straw every two to three days. In winter, use a deep-litter method to cut heat loss: add 5 to 10 cm of fresh straw on top every two to three days, and replace the whole bed every three to four weeks.'],

  ['registering-a-new-apiary-on-beebase',
    'Access to the free Beekeeper\'s Toolkit. The Toolkit is a set of PDFs covering disease identification and seasonal management.',
    'Access to the free Beekeeper\'s Toolkit: PDFs on disease recognition and seasonal care.'],

  ['registering-a-new-apiary-on-beebase',
    'A grid reference or accurate latitude and longitude for the apiary location. A six-figure OS grid reference is fine; the NBU map will pin the location automatically once you confirm.',
    'A grid reference or accurate latitude and longitude for the apiary site. A six-figure OS grid reference is fine; the NBU map will place it once you confirm.'],

  ['understanding-the-sheep-year',
    'The last six weeks before lambing are the period of heaviest feed demand: the foetus grows fastest at this point and the ewe is building udder tissue. Clostridial vaccination boosters go in four to six weeks before lambing to ensure passive immunity passes to the lambs through ',
    'The last six weeks before lambing are the time of highest feed demand: the foetus grows fastest then and the ewe is building udder tissue. Clostridial vaccine boosters go in four to six weeks before lambing to pass passive immunity to the lambs through '],

  ['worming-chickens',
    'For water-soluble products: ensure all drinkers are removed the night before treatment so birds are drinking when the medicated water is offered in the morning. Replace the medicated water with plain water after the stated treatment period.',
    'For water-soluble wormers: remove all drinkers the night before so birds are thirsty when the medicated water goes out in the morning. Replace it with plain water after the treatment period.'],

  // ── BAKING ────────────────────────────────────────────────────────────────

  ['fondant-modelling-figures',
    'Place finished figures on baking paper and leave to dry at room temperature for at least 2 hours before handling or placing on a cake. Figures can be dusted with edible lustre powder or painted with gel food colouring diluted in a small amount of clear alcohol or water once fully dry.',
    'Place finished figures on baking paper and leave to dry at room temperature for at least 2 hours. Figures can be dusted with edible lustre powder or painted with gel food colour diluted in a small amount of clear spirit or water once fully dry.'],

  ['macarons-coffee',
    'Coffee macarons follow the ',
    'Coffee macarons use the '],

  ['macarons-coffee',
    ' for stability. The critical step is ',
    ' for stable shells. The key step is '],

  ['macarons-coffee',
    ': under-folded paste produces cracked shells; over-folded paste produces flat, footless ones. Resting the piped shells until a dry skin forms is what creates the characteristic ',
    ': too little folding makes cracked shells; too much makes flat, footless ones. Resting piped shells until a skin forms creates the '],

  ['malted-seeded-loaf',
    'The malt extract does two things in this loaf: it feeds the yeast in the early proving stages and it gives the crumb its dark colour and the slight sweetness that makes malted bread work well with sharp cheddar or cold-roast-beef sandwiches. Do not substitute golden syrup or treacle, the flavour is different and the colour wrong.',
    'Malt extract does two things in this loaf: it feeds the yeast in the early prove and gives the crumb its dark colour and the slight sweetness that makes malted bread go well with sharp cheddar or cold beef. Do not swap in golden syrup or treacle; the flavour is different and the colour wrong.'],

  ['paris-brest',
    'Add all the flour at once and beat vigorously over medium heat for 1 to 2 minutes until the dough pulls cleanly from the pan sides and a light film coats the base.',
    'Add all the flour at once and beat hard over medium heat for 1 to 2 minutes until the dough pulls cleanly from the pan sides and a light film coats the base.'],

  ['plum-frangipane-tart',
    'Victoria plums, damsons, mirabelles and Marjorie\'s Seedlings all work; small plums halved, larger plums quartered. Damsons need an extra teaspoon of sugar in the frangipane; mirabelles and Victorias usually do not.',
    'Victoria plums, damsons, mirabelles, and Marjorie\'s Seedlings all work. Halve small plums; quarter larger ones. Damsons need an extra teaspoon of sugar in the frangipane; mirabelles and Victorias usually do not.'],

  ['portuguese-custard-tarts',
    'Roll the rough puff into a tight cylinder before slicing: the slice pressed into the muffin cup creates the spiral pastry base seen in the originals. Pressing the disc into the cup rather than rolling it out separately is what achieves the right casing thickness.',
    'Roll the rough puff into a tight cylinder before slicing: the slice pressed into the muffin cup creates the spiral pastry base of the originals. Pressing the disc into the cup rather than rolling it out is what gives the right casing thickness.'],

  // ── FIBRE-ARTS ────────────────────────────────────────────────────────────

  ['dyeing-with-pomegranate-skins',
    ' shifts the yellow to a muted olive-green, deepening the colour considerably. The iron reacts with both the tannin and the dye compound, pulling the result well away from yellow. This tutorial covers both the plain alum result and the iron after-bath variation. Because the after-bath uses iron sulphate, the wastewater section addresses foul-drain disposal for the iron bath.',
    ' shifts the yellow to a muted olive-green, deepening it a great deal. The iron reacts with both the tannin and the dye compound, pulling the result well away from yellow. This tutorial covers the plain alum result and the iron after-bath option. Because the after-bath uses iron sulphate, the wastewater section covers foul-drain disposal for the iron bath.'],

  ['dyeing-with-rhubarb-leaves',
    'Reducing the simmering time needed for the decoction.',
    'Reducing the simmering time needed to make the dye bath.'],

  ['four-shaft-overshot-table-mat',
    'The overshot structure produces a cloth with a geometric figure on one face and the inverse of that figure on the back. The Goose-Eye is a four-block pattern based on a rosette threading that creates a diamond-and-chevron figure across the mat width. It is one of the most widely documented traditional four-shaft overshot threadings in the British and North American guild canon.',
    'The overshot structure produces a cloth with a geometric figure on one side and its inverse on the back. The Goose-Eye is a four-block pattern with rosette threading that creates a diamond-and-chevron figure across the mat. It is one of the most widely known four-shaft overshot threadings in the British and North American guild record.'],

  ['hand-tufted-rug-basics',
    'Alternating row direction is a shading technique: rows laid in opposite directions catch light differently and create a contrast. This shows clearly in solid-colour sections and suits geometric designs.',
    'Alternating row direction is a shading method: rows laid in opposite directions catch light differently and create a contrast. This shows well in solid-colour sections and suits geometric designs.'],

  ['natural-dye-mordant-overview',
    'Wool, silk, and other protein fibres mordant readily with metallic salts and do not require tannin pre-treatment. Cotton, linen, and other cellulose fibres need a tannin pre-mordant step before metallic mordanting, as their surface chemistry does not bond metallic salts directly. The sequence for cellulose fibres is: scour, tannin bath, metallic mordant bath, dye bath.',
    'Wool, silk, and other protein fibres take metallic mordants well with no tannin pre-treatment. Cotton, linen, and other cellulose fibres need a tannin pre-mordant step before the metallic mordant, as their surface does not bond metallic salts directly. The sequence for cellulose fibres is: scour, tannin bath, metallic mordant bath, dye bath.'],

  // ── POTTERY-CERAMICS ──────────────────────────────────────────────────────

  ['coil-pinch-handled-tankard-air-dry',
    'Leave the outside coils visible and unpinched for a deliberate ridged texture, working as a decorative feature.',
    'Leave the outer coils unpinched for a ridged texture that works as a decorative feature.'],

  ['coil-pot-bowl-air-dry-clay',
    'Leave the coil ridges visible on the exterior by smoothing only the interior: the ribbed surface is a valid design statement.',
    'Leave the coil ridges on the outside by smoothing only the inside: the ribbed surface is a strong design feature.'],

  ['coil-pot-bowl-air-dry-clay',
    'Use paper clay for larger bowls: the cellulose fibres knit the coils together more securely and reduce cracking at joins on taller walls.',
    'Use paper clay for larger bowls: its fibres bind the coils more firmly and reduce cracking at joins on taller walls.'],

  ['paper-clay-mobile-fish-shapes',
    'Cut larger fish for a more substantial single-bar mobile; the same paper clay handles this scale without warping.',
    'Cut larger fish for a heavier single-bar mobile; paper clay handles this scale without warping.'],

  ['polymer-clay-bead-set',
    'Roll two colours together incompletely for a marble effect before shaping the bead.',
    'Blend two colours only partway for a marble look before shaping the bead.'],

  ['polymer-clay-leaf-pendant',
    'Mix two clay colours together incompletely before rolling for a two-tone marbled pendant.',
    'Blend two clay colours only partway before rolling for a two-tone marbled pendant.'],

  ['reading-clay-drying-stages',
    'Operations at leather-hard: score-and-slip joining, attaching handles, trimming with a knife, carving sgraffito decoration, adding coil layers. This is the most active stage for hand-builders because the clay holds its shape but can still be altered.',
    'Operations at leather-hard: score-and-slip joining, attaching handles, trimming with a knife, carving sgraffito details, adding coil layers. This is the most active stage for hand-builders: the clay holds its shape but can still be worked.'],

  ['slab-built-clay-lantern',
    'Skip the candle and use a small battery LED tea-light instead, which removes the heat consideration entirely.',
    'Skip the candle and use a small battery LED tea-light instead: no heat to worry about.'],

  ['underglaze-painting-on-bisqueware-no-kiln',
    'Commercial pre-mixed underglazes (the coloured slips used by ceramic studios on bisqueware before glaze firing) also work as surface paints on bone-dry air-dry clay. They produce a denser, more ceramic-like colour than standard acrylics because they are formulated with more clay content. Apply to a bone-dry sealed surface, let dry, then seal again with acrylic varnish.',
    'Commercial pre-mixed underglazes (the coloured slips used by ceramic studios on bisqueware before firing) also work as surface paints on bone-dry air-dry clay. They give a denser, more ceramic look than standard acrylics because they have more clay in the mix. Apply to a bone-dry sealed surface, let dry, then seal with acrylic varnish.'],

  // ── HOME-REPAIR ───────────────────────────────────────────────────────────

  ['patching-a-small-plasterboard-hole',
    ', Polyfilla One-Time, Tetrion Decorators Filler, or any general builders\'-merchant brand. The 600 g tub is plenty for ten small holes. Ready-mixed is more forgiving than powder-mix for one-evening work.',
    ', Polyfilla One-Time, Tetrion Decorators Filler, or any builders\'-merchant brand. The 600 g tub is enough for ten small holes. Ready-mixed is more forgiving than powder-mix for one evening\'s work.'],

  ['repairing-a-rotted-door-bottom-rail',
    ' to the remaining porous timber using the paint brush. Allow each coat to soak in fully and become dry and firm before mixing the filler. Ronseal, Selleys, and Everbuild all produce compatible hardener-and-filler systems, use hardener and filler from the same manufacturer.',
    ' to the remaining porous timber with the paint brush. Let each coat soak in fully and become firm before mixing the filler. Ronseal, Selleys, and Everbuild all make matching hardener-and-filler systems; use the hardener and filler from the same brand.'],

  ['treating-active-woodworm',
    'Old holes with dark frass or no frass do not indicate a live infestation. Confirm activity with the paper frass test before treating; unnecessary treatment is wasted product and unnecessary chemical exposure.',
    'Old holes with dark frass or no frass do not mean a live infestation. Check activity with the paper frass test before treating; treating old holes wastes product and adds unwanted chemical exposure.'],
]

function applyStringReplace(body: unknown, fromText: string, toText: string): { body: unknown; count: number } {
  let count = 0
  function walk(v: unknown): unknown {
    if (typeof v === 'string') {
      if (v.includes(fromText)) { count++; return (v as string).replaceAll(fromText, toText) }
      return v
    }
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) { out[k] = walk(val) }
      return out
    }
    return v
  }
  return { body: walk(body), count }
}

async function main() {
  let totalFixed = 0
  const grouped = new Map<string, [string, string][]>()
  for (const [slug, from, to] of SLUG_FIXES) {
    if (!grouped.has(slug)) grouped.set(slug, [])
    grouped.get(slug)!.push([from, to])
  }

  for (const [slug, pairs] of grouped) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true, revisedFrom: true } })
    if (!t) { console.log('NOT FOUND: ' + slug); continue }

    let body = t.body
    let changed = false
    const applied: string[] = []
    const missed: string[] = []

    for (const [from, to] of pairs) {
      const { body: newBody, count } = applyStringReplace(body, from, to)
      if (count > 0) { body = newBody; changed = true; applied.push(from.slice(0, 35) + '...') }
      else { missed.push(from.slice(0, 50)) }
    }

    if (changed) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: body as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? t.body },
      })
      totalFixed++
      console.log('Fixed: ' + slug + ' (' + applied.length + ' replacements)')
    } else {
      console.log('MISS:  ' + slug)
    }
    if (missed.length) {
      for (const m of missed) console.log('  MISS: ' + m)
    }
  }

  console.log('\nTotal fixed: ' + totalFixed)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
