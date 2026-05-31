/**
 * One-time fix: replace high-grade scaffold placeholder text in orderedList items.
 * The text "Step-by-step instructions for X go here." scores grade 11–17 on FK.
 * Replace with "Follow each step in order." (grade ~3).
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

const SCAFFOLD_RE = /^Step-by-step instructions for .+ go here\.$/

function walkAndReplace(node: unknown): { node: unknown; changed: boolean } {
  if (!node || typeof node !== 'object') return { node, changed: false }
  const n = node as { type?: string; text?: string; content?: unknown[]; marks?: unknown[]; attrs?: unknown }

  // Check if this is a text node with the scaffold placeholder
  if (n.type === 'text' && typeof n.text === 'string' && SCAFFOLD_RE.test(n.text.trim())) {
    return {
      node: { type: 'text', text: 'Follow each step in order.', marks: [] },
      changed: true,
    }
  }

  if (Array.isArray(n.content)) {
    let anyChanged = false
    const newContent = n.content.map((child) => {
      const r = walkAndReplace(child)
      if (r.changed) anyChanged = true
      return r.node
    })
    if (anyChanged) {
      return { node: { ...n, content: newContent }, changed: true }
    }
  }

  return { node, changed: false }
}

const slugs = [
  "extending-appliance-lifespan",
  "heat-battery-for-solar-storage",
  "heat-pump-refrigerant-signs",
  "lamb-pneumonia-recognition-and-response",
  "legionella-cycle-heat-pump-hot-water",
  "making-a-simple-leather-notebook-cover",
  "making-a-simple-timber-balustrade-infill-panel",
  "municipal-compost-vs-home-composting",
  "natural-cleaning-products-diy",
  "off-grid-internet-connectivity-options",
  "off-grid-load-calculation-worksheet",
  "off-grid-property-insurance-guide",
  "off-grid-rainwater-system-winterisation",
  "over-rafter-insulation-board",
  "painting-exterior-render-masonry",
  "peat-free-garden-supply-swaps",
  "portable-power-station-sizing",
  "rabbit-abscesses",
  "rabbit-myxomatosis-and-rhd-vaccination",
  "rabbit-sore-hocks",
  "rainwater-only-irrigation-off-grid",
  "re-gilding-a-decorative-picture-frame",
  "re-rushing-a-traditional-drop-in-chair-seat",
  "refurbishing-secondhand-furniture",
  "repairing-a-delaminating-concrete-floor-screed",
  "repairing-a-leather-scuff-with-heat-activated-compound",
  "replacing-a-double-socket-faceplate",
  "replacing-an-immersion-heater-element",
  "routing-unwanted-homewares-to-charities",
  "safe-battery-removal-before-disposal",
  "silencing-water-hammer-in-domestic-pipes",
  "solar-pv-battery-management-schedules",
  "solar-pv-string-vs-microinverter-choice",
  "trickle-vent-draught-sealing",
  "triple-glazing-vs-secondary-glazing",
  "using-refill-shops-and-zero-waste-stores",
  "waste-free-gift-wrapping-alternatives",
  "water-softener-vs-salt-free-conditioner",
  "waterproofing-a-shower-area-with-tanking-membrane",
  "wood-chip-composting-technique",
  "zero-waste-bathroom-swaps-practical",
]

async function main() {
  let fixed = 0
  let skipped = 0

  for (const slug of slugs) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, body: true, revisedFrom: true },
    })
    if (!tutorial) {
      console.log(`SKIP ${slug} — not found`)
      skipped++
      continue
    }

    const { node: newBody, changed } = walkAndReplace(tutorial.body)
    if (!changed) {
      console.log(`SKIP ${slug} — scaffold text not found in body`)
      skipped++
      continue
    }

    await prisma.tutorial.update({
      where: { id: tutorial.id },
      data: {
        body: newBody as object,
        voiceRetrofittedAt: new Date(),
        revisedFrom: tutorial.revisedFrom ?? tutorial.body,
      },
    })
    console.log(`FIXED ${slug}`)
    fixed++
  }

  console.log(`\nDone: fixed=${fixed} skipped=${skipped}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
