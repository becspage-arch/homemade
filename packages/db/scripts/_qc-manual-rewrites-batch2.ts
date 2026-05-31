/**
 * Manual rewrites for grade-level-strict BLOCK cases that qc-fix couldn't handle.
 * Each entry: { slug, oldPrefix (first 50+ chars to match), newText (full replacement) }
 * Uses full-paragraph replacement (drops inline marks to keep things simple).
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

interface Rewrite {
  slug: string
  oldPrefix: string  // first ~50 chars of the blocking paragraph — used to locate it
  newText: string    // full simplified replacement text
}

const REWRITES: Rewrite[] = [
  // compost-tea-making: grade 11.2 in orderedList
  {
    slug: 'compost-tea-making',
    oldPrefix: 'Strain the liquid through a piece of fabric and apply within',
    newText: 'Strain through cloth and use within 2 to 4 hours. Bacteria die fast once air stops reaching them.',
  },
  // domestic-wind-turbine-feasibility: grade 11.4 in troubleshooter
  {
    slug: 'domestic-wind-turbine-feasibility',
    oldPrefix: 'NOABL is a coarse model that does not account for local topography',
    newText: 'NOABL is a rough guide that misses local hills and trees. Get a proper wind survey before going ahead with any site showing under 7 m/s.',
  },
  // heat-pump-refrigerant-signs: grade 11.8 paragraph[0]
  {
    slug: 'heat-pump-refrigerant-signs',
    oldPrefix: 'The refrigerant circuit in a heat pump is a sealed system.',
    newText: 'The refrigerant circuit in a heat pump is sealed. It should not use up refrigerant; a low charge after fitting means a leak. Under F-gas rules, only a certified engineer may handle refrigerants. You can spot the signs yourself and tell the engineer what you found before the visit.',
  },
  // heat-pump-refrigerant-signs: grade 11.5 bulletList item
  {
    slug: 'heat-pump-refrigerant-signs',
    oldPrefix: 'Hissing or bubbling sounds from the outdoor unit or internal connections',
    newText: 'Hissing or bubbling from the outdoor unit or pipes: a refrigerant leak can make a hissing sound at the leak point.',
  },
  // introducing-a-new-pig-to-an-existing-group: grade 11.8 paragraph[2]
  {
    slug: 'introducing-a-new-pig-to-an-existing-group',
    oldPrefix: 'Mix in the late afternoon when pigs are full from their last feed',
    newText: 'Mix in the late afternoon when pigs have eaten and are tired. Hungry pigs fight harder and for longer. Use a large area or paddock, not a small pen; more space means fewer corner injuries. Match sizes where you can. One small pig among two large ones will be at a big disadvantage.',
  },
  // heat-pump-buffer-vessel-sizing: grade 11.7 paragraph[10]
  {
    slug: 'heat-pump-buffer-vessel-sizing',
    oldPrefix: 'Underfloor heating systems often hold enough water to prevent short-cycling',
    newText: 'Underfloor heating holds enough water that a buffer may not be needed. Some makers state the minimum water volume required; check the spec. Work out your circuit volume and compare before skipping the buffer.',
  },
  // rabbit-colony-vs-cage-system: grade 11.3 paragraph[0]
  {
    slug: 'rabbit-colony-vs-cage-system',
    oldPrefix: 'The choice between a colony system and a cage system depends on flock size',
    newText: 'Choosing between a colony and a cage system depends on how many rabbits you keep and how closely you need to watch each one.',
  },
  // rabbit-snuffles-management: grade 11.1 paragraph[4]
  {
    slug: 'rabbit-snuffles-management',
    oldPrefix: 'Long-term control means reducing stressors.',
    newText: 'Long-term control means less stress on the herd. Avoid overcrowding, keep good air flow, and handle rabbits less during hard times like weaning. Get new stock from a clean herd. Do not bring in rabbits with a runny nose to a clean group.',
  },
  // rabbit-snuffles-management: grade 11.4 paragraph[6] — need to identify prefix
  {
    slug: 'rabbit-snuffles-management',
    oldPrefix: 'Enrofloxacin is prescription-only and must be prescribed by a vet',
    newText: 'Enrofloxacin is prescription-only and must come from a vet. Some smaller practices may not stock rabbit antibiotics. Ask your vet for a written script if needed so you can collect from a larger surgery.',
  },
  // pv-optimiser-vs-string-inverter: grade 11.1 paragraph[2]
  {
    slug: 'pv-optimiser-vs-string-inverter',
    oldPrefix: 'A power optimiser is a DC-to-DC converter fitted behind each panel.',
    newText: 'A power optimiser is fitted behind each panel and lets it find its own best output before passing power to the main inverter. Each optimiser adds 30 to 70 pounds; a 10-panel system adds 300 to 700 pounds. On an unshaded roof, the gain is 1 to 3 percent, too small to pay back. On a shaded or split-facing roof, they can recover 5 to 15 percent of annual output. On a 4 kWp system at 27p/kWh, that is 46 to 138 pounds per year. Payback takes 2 to 15 years depending on the shade.',
  },
  // safe-battery-removal-before-disposal: grade 11.0 paragraph[0]
  {
    slug: 'safe-battery-removal-before-disposal',
    oldPrefix: 'The fire risk from lithium batteries in waste streams is well-documented.',
    newText: 'Lithium batteries cause fires in waste sites. Over 1,200 fires at UK waste sites in 2022 were linked to lithium batteries. The Battery Directive requires batteries to be sorted by law. In practice, the rules target shops and waste sites, not households. The real reason to separate them: batteries go to recycling streams that recover the materials.',
  },
  // sourcing-replacement-stock-after-a-disease-outbreak: grade 11.0 paragraph[7]
  {
    slug: 'sourcing-replacement-stock-after-a-disease-outbreak',
    oldPrefix: 'New stock arriving on the holding triggers the movement standstill clock',
    newText: 'New stock arriving on your holding starts the movement standstill: 6 days for sheep, cattle and goats; 20 days for pigs. No animal of that type may leave until the standstill ends. If stock arrives in two batches, the second batch resets the clock.',
  },
  // outdoor-tap-installation: grade 11.1 paragraph[1]
  {
    slug: 'outdoor-tap-installation',
    oldPrefix: 'An outdoor tap reduces the time and effort of garden watering',
    newText: 'An outdoor tap saves time in the garden and can fill a water butt in dry spells. The key requirement is a double-check valve, also called a backflow preventer. This stops dirty garden water from being drawn back into the drinking supply if a hose end is left under water. Fitting a tap without one breaks Water Fittings Regulations.',
  },
  // outdoor-tap-installation: grade 11.1 bulletList item
  {
    slug: 'outdoor-tap-installation',
    oldPrefix: 'Outside tap kit: includes the tap, double-check valve, isolating valve',
    newText: 'Outside tap kit: includes the tap, double-check valve, shutoff valve, wall elbow, copper pipe, and fittings.',
  },
  // inspecting-sealed-brood-for-chalkbrood: grade 12.0 bulletList
  {
    slug: 'inspecting-sealed-brood-for-chalkbrood',
    oldPrefix: 'If the colony has persistent heavy chalkbrood season after season',
    newText: 'If the colony has heavy chalkbrood year after year, requeen from hygienic stock. Select for bees with strong cleaning behaviour.',
  },
  // preventing-egg-eating-by-hens: grade 11.9 bulletList
  {
    slug: 'preventing-egg-eating-by-hens',
    oldPrefix: 'Overcrowding or boredom: hens with insufficient space and enrichment explore',
    newText: 'Overcrowding or boredom: hens with too little space or nothing to do will explore and peck at eggs. Add more space, pecking toys, or foraging material.',
  },
  // rabbit-myxomatosis-and-rhd-vaccination (already got scaffold fix but may still have real content block)
  // twin-lamb-disease-recognition-and-response: grade 11.5 blockquote[3]
  {
    slug: 'twin-lamb-disease-recognition-and-response',
    oldPrefix: 'A ewe found lying down and unable to rise in the last two weeks',
    newText: 'A ewe found lying down and unable to get up in the last two weeks before lambing is likely to have twin lamb disease. Treat with propylene glycol by mouth and call a vet if she does not respond within 2 to 4 hours.',
  },
  // pond-for-surface-water-management: grade 11.3 bulletList
  {
    slug: 'pond-for-surface-water-management',
    oldPrefix: 'Avoid locations directly under deciduous trees: leaf fall adds nutrients',
    newText: 'Avoid spots directly under deciduous trees: fallen leaves add nutrients and push algae growth. A few overhanging branches are fine; full canopy cover is not.',
  },
  // municipal-compost-vs-home-composting: grade 12.0 bulletList
  {
    slug: 'municipal-compost-vs-home-composting',
    oldPrefix: 'Neither system reliably handles: heavily waxed card, compostable plastic',
    newText: 'Neither system handles all waste well: heavily waxed card and compostable plastic packaging are not taken by most UK councils. Check your local rules for compostable plastics before putting them in the food caddy.',
  },
  // packaging-audit-at-home: grade 14.2 troubleshooter
  {
    slug: 'packaging-audit-at-home',
    oldPrefix: 'Loose produce is usually cheaper per kg than pre-packed',
    newText: 'Loose produce is usually cheaper per kg than pre-packed. Buying a bigger format cuts the cost per unit. The costly swaps are plastic-free or artisan brands. Look for loose or standard formats of the same item before switching to a premium product.',
  },
]

type TNode = {
  type?: string
  text?: string
  content?: TNode[]
  marks?: unknown[]
  attrs?: Record<string, unknown>
}

function extractText(node: TNode): string {
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  return ''
}

function walkAndReplace(node: TNode, oldPrefix: string, newText: string, replaced: { count: number }): TNode {
  if (!node || typeof node !== 'object') return node

  if (node.type === 'paragraph') {
    const fullText = extractText(node)
    if (fullText.startsWith(oldPrefix)) {
      replaced.count++
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: newText, marks: [] }],
      }
    }
    return node
  }

  // For blockquote/infoPanel text
  if (node.type === 'blockquote') {
    const fullText = extractText(node)
    if (fullText.startsWith(oldPrefix)) {
      replaced.count++
      return {
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: newText, marks: [] }],
        }],
      }
    }
  }

  if (Array.isArray(node.content)) {
    let anyChanged = false
    const newContent = node.content.map((child) => {
      const r = walkAndReplace(child as TNode, oldPrefix, newText, replaced)
      if (r !== child) anyChanged = true
      return r
    })
    if (anyChanged) return { ...node, content: newContent }
  }

  return node
}

async function main() {
  let fixed = 0
  let notFound = 0

  // Group by slug for efficiency
  const bySlug = new Map<string, Rewrite[]>()
  for (const r of REWRITES) {
    if (!bySlug.has(r.slug)) bySlug.set(r.slug, [])
    bySlug.get(r.slug)!.push(r)
  }

  for (const [slug, rewrites] of bySlug.entries()) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, body: true, revisedFrom: true },
    })
    if (!tutorial) {
      console.log(`SKIP ${slug} — not found`)
      notFound++
      continue
    }

    let body = tutorial.body as TNode
    let totalReplaced = 0

    for (const { oldPrefix, newText } of rewrites) {
      const replaced = { count: 0 }
      body = walkAndReplace(body, oldPrefix, newText, replaced) as TNode
      if (replaced.count === 0) {
        console.log(`  MISS ${slug}: prefix not found: "${oldPrefix.slice(0, 50)}"`)
      } else {
        totalReplaced += replaced.count
        console.log(`  HIT  ${slug}: replaced ${replaced.count} paragraph(s) matching "${oldPrefix.slice(0, 50)}"`)
      }
    }

    if (totalReplaced > 0) {
      await prisma.tutorial.update({
        where: { id: tutorial.id },
        data: {
          body: body as object,
          voiceRetrofittedAt: new Date(),
          revisedFrom: tutorial.revisedFrom ?? tutorial.body,
        },
      })
      console.log(`SAVED ${slug} (${totalReplaced} replacement(s))`)
      fixed++
    } else {
      console.log(`SKIP ${slug} — no paragraphs matched`)
    }
  }

  console.log(`\nDone: ${fixed} tutorials updated, ${notFound} not found`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
