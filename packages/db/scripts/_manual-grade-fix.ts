/**
 * _manual-grade-fix.ts
 * Manually rewrites paragraphs that fail grade-level-strict to grade 6-8.
 * Applies only to tutorials stuck in qc-unfixable after the mechanical pass.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

// Navigate body using absolute array indices (matching qc-audit path format).
// Returns the parent node and the child index to replace, or isAttrBody for infoPanel attrs.body.
function getParentAndIndex(
  body: any,
  pathStr: string,
): { parent: any; childIdx: number; isAttrBody: boolean } | null {
  const parts = pathStr.split(' > ').filter(p => p !== 'body')
  let current = body

  for (let pi = 0; pi < parts.length - 1; pi++) {
    const part = parts[pi]!
    const m = part.match(/^(\w+)\[(\d+)\]$/)
    if (!m) return null
    const idx = parseInt(m[2]!)
    const child = current?.content?.[idx]
    if (!child) return null
    current = child
  }

  const lastPart = parts[parts.length - 1]!
  if (lastPart === 'body') {
    return { parent: current, childIdx: -1, isAttrBody: true }
  }
  const m = lastPart.match(/^(\w+)\[(\d+)\]$/)
  if (!m) return null
  const idx = parseInt(m[2]!)
  return { parent: current, childIdx: idx, isAttrBody: false }
}

// Each entry: [slug, path, new simplified text]
const rewrites: Array<[string, string, string]> = [
  // colloidal-oat-melt-pour-soap — paragraph[0] — grade 11.4
  [
    'colloidal-oat-melt-pour-soap',
    'body > paragraph[0]',
    'The key ingredient in this recipe is the type of oat. Ordinary rolled or porridge oats sink to the bottom of the mould before the base sets. This gives you an uneven bar with a scratchy bottom. Colloidal oatmeal is ground to a fine powder that stays mixed in. Stir it in just before pouring and work quickly to keep the particles spread through the soap.',
  ],
  // colloidal-oat-melt-pour-soap — paragraph[11] — grade 11.9
  [
    'colloidal-oat-melt-pour-soap',
    'body > paragraph[11]',
    'Wrap each bar in clingfilm to stop it sweating. The bars are ready to use straight away. They work well for very dry, eczema-prone, or sensitive skin, where a gentle melt-and-pour bar suits better than cold-process.',
  ],

  // crater-glaze-surface-texture — infoPanel[0] > paragraph[1] — grade 11.8
  [
    'crater-glaze-surface-texture',
    'body > infoPanel[0] > paragraph[1]',
    'Wear gloves and a respirator when handling raw oxides and glaze additives. Never use them near food preparation. This tutorial uses lithium carbonate as the gas-producing additive instead of barium carbonate. Barium carbonate is highly toxic. Lithium carbonate is a safer choice for the same gas-release effect, but still needs gloves and a P100 respirator when you measure and mix it. Never swap in barium carbonate without much stronger safety measures.',
  ],
  // crater-glaze-surface-texture — bulletList[14] > listItem[0] > paragraph[0] — grade 11.8
  [
    'crater-glaze-surface-texture',
    'body > bulletList[14] > listItem[0] > paragraph[0]',
    'Colour inside craters: dry-brush a contrasting glaze or iron oxide wash over the fired surface. Re-fire to set the colour inside the pits.',
  ],
  // crater-glaze-surface-texture — bulletList[14] > listItem[1] > paragraph[0] — grade 11.2
  [
    'crater-glaze-surface-texture',
    'body > bulletList[14] > listItem[1] > paragraph[0]',
    'Partial coverage: brush crater glaze across the middle and plain glaze above and below. This shows both surfaces next to each other.',
  ],

  // drip-emitter-maintenance — orderedList[2] > listItem[1] > paragraph[0] — grade 11.3
  [
    'drip-emitter-maintenance',
    'body > orderedList[2] > listItem[1] > paragraph[0]',
    'Take the end-cap off each lateral line and flush it for 30 seconds to clear sediment from the pipe before working on the emitters.',
  ],

  // dyeing-with-ivy-berries — paragraph[17] — grade 11.6
  [
    'dyeing-with-ivy-berries',
    'body > paragraph[17]',
    'No mordant: on un-mordanted wool, ivy berries give a pale, washed-out grey with poor fastness. Using alum mordant makes a real difference to the depth of colour and how long it lasts.',
  ],

  // home-battery-economy-7-charging — bulletList[11] > listItem[0] > paragraph[0] — grade 11.7
  [
    'home-battery-economy-7-charging',
    'body > bulletList[11] > listItem[0] > paragraph[0]',
    'Solar and battery together: the system charges from solar during the day. Economy 7 tops up whatever space is left overnight. The saving from arbitrage is smaller because some capacity is kept free for solar.',
  ],

  // managing-a-legacy-feed-in-tariff — bulletList[3] > listItem[0] — grade 11.7
  [
    'managing-a-legacy-feed-in-tariff',
    'body > bulletList[3] > listItem[0] > paragraph[0]',
    'Generation payment: based on the meter reading you send to your FiT administrator, usually quarterly or annually. The rate is whatever was set when you joined the scheme, and goes up each year in line with RPI.',
  ],
  // managing-a-legacy-feed-in-tariff — bulletList[3] > listItem[1] — grade 11.2
  [
    'managing-a-legacy-feed-in-tariff',
    'body > bulletList[3] > listItem[1] > paragraph[0]',
    'Export payment: either a set 50% of your generation total (deemed export) or a reading from an export meter. Deemed export is paid with no action needed. Actual export requires you to submit a meter reading.',
  ],

  // paper-clay-christmas-ornament-set — bulletList[13] > listItem[1] — grade 11.7
  [
    'paper-clay-christmas-ornament-set',
    'body > bulletList[13] > listItem[1] > paragraph[0]',
    'Press dried herb sprigs into the surface before you cut the shapes to make botanical-imprint ornaments.',
  ],

  // paper-clay-fairy-door-miniature — bulletList[13] > listItem[2] — grade 12.0
  [
    'paper-clay-fairy-door-miniature',
    'body > bulletList[13] > listItem[2] > paragraph[0]',
    'Miniature window: cut a small hole in the upper panel before the clay dries. Glue a thin piece of clear plastic behind it after painting.',
  ],
  // paper-clay-fairy-door-miniature — bulletList[13] > listItem[3] — grade 11.2
  [
    'paper-clay-fairy-door-miniature',
    'body > bulletList[13] > listItem[3] > paragraph[0]',
    'Make it 150 mm tall for a bigger garden display. Scale all the hardware up to match.',
  ],

  // photo-mounting-options — paragraph[9] — grade 11.7
  [
    'photo-mounting-options',
    'body > paragraph[9]',
    'Best for: prints made at home or copy prints where you still have the original file. Not suitable for one-of-a-kind original photos.',
  ],

  // pinch-pot-cactus-planter-trio — bulletList[13] > listItem[0] — grade 11.6
  [
    'pinch-pot-cactus-planter-trio',
    'body > bulletList[13] > listItem[0] > paragraph[0]',
    'Grouped set on a tray: make five or six pots in different sizes using the same three shapes. Arrange them on a wooden tray or a piece of slate for a neat display.',
  ],

  // polymer-clay-faux-agate-pendant — bulletList[17] > listItem[0] — grade 11.1
  [
    'polymer-clay-faux-agate-pendant',
    'body > bulletList[17] > listItem[0] > paragraph[0]',
    'Press a small piece of mica-powder-dusted clay into the accent layer to add a metallic shimmer to the banding.',
  ],
  // polymer-clay-faux-agate-pendant — bulletList[17] > listItem[2] — grade 11.7
  [
    'polymer-clay-faux-agate-pendant',
    'body > bulletList[17] > listItem[2] > paragraph[0]',
    'Try earthy red and terracotta with translucent clay for a carnelian agate look instead of the teal and white version.',
  ],

  // polymer-clay-faux-druzy-crystal-pendant — bulletList[13] > listItem[1] — grade 11.3
  [
    'polymer-clay-faux-druzy-crystal-pendant',
    'body > bulletList[13] > listItem[1] > paragraph[0]',
    'Geode slice: cut the pendant into a smooth half-circle. Build up rings of coloured clay around the druzy centre to form a banded agate rim.',
  ],

  // polymer-clay-faux-labradorite-pendant — bulletList[13] > listItem[0] — grade 11.7
  [
    'polymer-clay-faux-labradorite-pendant',
    'body > bulletList[13] > listItem[0] > paragraph[0]',
    'Gold flash version: swap the blue-green pearl layer for a gold or bronze metallic sheet to get a golden labradorite effect.',
  ],
  // polymer-clay-faux-labradorite-pendant — bulletList[13] > listItem[2] — grade 11.1
  [
    'polymer-clay-faux-labradorite-pendant',
    'body > bulletList[13] > listItem[2] > paragraph[0]',
    'Matched earring set: cut two smaller oval slices from the same block to make a pendant-and-earring set with the same pattern.',
  ],

  // pyrography-christmas-tree-ornaments — bulletList[10] > listItem[0] — grade 11.3
  [
    'pyrography-christmas-tree-ornaments',
    'body > bulletList[10] > listItem[0] > paragraph[0]',
    'Named ornaments: add a name and year to make a personal gift or to start a yearly family ornament tradition.',
  ],

  // replacing-a-double-socket-faceplate — paragraph[0] — grade 11.2
  [
    'replacing-a-double-socket-faceplate',
    'body > paragraph[0]',
    'Changing a socket faceplate like-for-like is Part P exempt work in England. It falls under Schedule 4 of the Building Regulations. Before touching any wire, carry out the full live-dead-live isolation check. A ring-main socket has two cable sets in the back box. A spur socket has one. Both are wired the same way, just with a different number of connections.',
  ],

  // replacing-a-shower-pump — paragraph[0] — grade 11.5
  [
    'replacing-a-shower-pump',
    'body > paragraph[0]',
    'Home shower pumps on gravity-fed systems are almost always twin impeller units in the positive head setup. Replacing like-for-like is simple: keep the same pipe spacing, flow direction, and electrical connection. The pump rating is on the casing. Match it exactly when buying a replacement.',
  ],

  // rich-heel-balm — paragraph[0] — grade 11.4
  [
    'rich-heel-balm',
    'body > paragraph[0]',
    'A good heel balm needs an occlusive base that stays on the skin long enough for the moisturising ingredients to soak in. Shea butter is deeply moisturising. Coconut oil is antibacterial. Beeswax gives the balm enough body so it stays on the heel instead of slipping off. Apply at night, put on cotton socks, and remove them in the morning.',
  ],

  // rose-sachet — paragraph[0] — grade 11.3
  [
    'rose-sachet',
    'body > paragraph[0]',
    'Dried rose petals give the sachet its scent and look. Orris root powder acts as a fixative — it holds the aromatic oils in the petals and lets them out slowly. Together they keep the sachet fragrant for months rather than weeks. Rose geranium oil adds strength and staying power to the rose scent.',
  ],

  // solar-pv-dc-cable-sizing — bulletList[8] > listItem[1] — grade 11.4
  [
    'solar-pv-dc-cable-sizing',
    'body > bulletList[8] > listItem[1] > paragraph[0]',
    'MC4 connectors are the standard connector for solar PV. You can use compatible MC4 connectors from different brands together, as long as both are rated for the same current. Using incompatible connectors voids the warranty and can lead to loose joints.',
  ],

  // solar-pv-inverter-fault-diagnosis — bulletList[2] > listItem[2] — grade 11.9
  [
    'solar-pv-inverter-fault-diagnosis',
    'body > bulletList[2] > listItem[2] > paragraph[0]',
    'Seasonal pattern: a system putting out 30% of its summer output in December is working correctly for a south-facing 30 degree pitch in the UK. Always compare to the maker\'s expected production table, not to your summer readings.',
  ],

  // solid-brick-garage-internal-insulation — infoPanel[1] > paragraph[0] — grade 11.8
  [
    'solid-brick-garage-internal-insulation',
    'body > infoPanel[1] > paragraph[0]',
    'Building Regulations: turning a garage into a room to live in requires Building Regulations approval. Using it as a workshop, home gym, or storage space does not. This tutorial covers the insulation work for both situations. Structural and fire-safety work for a habitable room is not covered here.',
  ],

  // routing-unwanted-homewares-to-charities — bulletList[2] > listItem[4] — grade 11.3
  [
    'routing-unwanted-homewares-to-charities',
    'body > bulletList[2] > listItem[4] > paragraph[0]',
    'Building materials: try salvage dealers or SALVO. Community RePaint takes leftover paint. Habitat for Humanity ReStores take building materials in some areas.',
  ],
]

async function main() {
  let fixed = 0
  let failed = 0

  for (const [slug, pathStr, newText] of rewrites) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, body: true },
    })
    if (!tutorial?.body) {
      console.log(`SKIP (not found): ${slug}`)
      failed++
      continue
    }

    const body = JSON.parse(JSON.stringify(tutorial.body)) as any
    const result = getParentAndIndex(body, pathStr)
    if (!result) {
      console.log(`SKIP (path nav failed): ${slug} @ ${pathStr}`)
      failed++
      continue
    }

    const { parent, childIdx, isAttrBody } = result

    if (isAttrBody) {
      if (!parent.attrs) parent.attrs = {}
      parent.attrs.body = newText
    } else {
      const child = parent?.content?.[childIdx]
      if (!child) {
        console.log(`SKIP (child missing at [${childIdx}]): ${slug} @ ${pathStr}`)
        failed++
        continue
      }
      child.content = [{ type: 'text', text: newText }]
    }

    await prisma.tutorial.update({
      where: { id: tutorial.id },
      data: { body, voiceRetrofittedAt: new Date() },
    })
    console.log(`FIXED: ${slug} @ ${pathStr}`)
    fixed++
  }

  console.log(`\nDone: ${fixed} fixed, ${failed} failed/skipped`)
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
