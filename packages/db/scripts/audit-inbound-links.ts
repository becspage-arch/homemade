import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

/**
 * Counts inbound internal links per published Tutorial. Sources counted:
 *   - other published Tutorials that reference this tutorial's techniqueSlugs
 *     via the `techniqueLink` mark in their body (using `techniqueSlugs`
 *     denorm — the inline `techniqueLink` mark is reflected in that column)
 *   - other Tutorials carrying this slug in `craftStitchSlugs`
 *   - the Tutorial's own Category page (always 1)
 *
 * Flags tutorials with < 3 inbound links as orphans. The session-D hub-and-
 * spoke work is about pushing every tutorial above that floor.
 */
async function main() {
  const { prisma, TutorialStatus } = await import('../src/index.js')

  const published = await prisma.tutorial.findMany({
    where: { status: TutorialStatus.PUBLISHED },
    select: { id: true, slug: true, type: true, category: { select: { slug: true } } },
  })

  // Tutorial → set of inbound links from other tutorials.
  const inboundByTutorial = new Map<string, number>()
  // Initialise — every tutorial gets +1 from its own category page.
  for (const t of published) inboundByTutorial.set(t.id, 1)

  // Technique slugs → tutorials that reference them.
  // (Sample is gated by type=TECHNIQUE/STITCH/PATTERN because that's what
  // gets pulled into other rows; readings and remedies don't typically
  // become technique anchors.)
  const techniqueAnchors = published.filter((t) =>
    ['TECHNIQUE', 'STITCH'].includes(t.type),
  )
  for (const anchor of techniqueAnchors) {
    const inbound = await prisma.tutorial.count({
      where: {
        status: TutorialStatus.PUBLISHED,
        id: { not: anchor.id },
        OR: [
          { techniqueSlugs: { has: anchor.slug } },
          { craftStitchSlugs: { has: anchor.slug } },
        ],
      },
    })
    inboundByTutorial.set(anchor.id, (inboundByTutorial.get(anchor.id) ?? 0) + inbound)
  }

  // Histogram
  const buckets: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3-5': 0, '6-10': 0, '11+': 0 }
  const orphans: { slug: string; category: string; count: number }[] = []
  for (const t of published) {
    const c = inboundByTutorial.get(t.id) ?? 0
    if (c === 0) buckets['0'] += 1
    else if (c === 1) buckets['1'] += 1
    else if (c === 2) buckets['2'] += 1
    else if (c <= 5) buckets['3-5'] += 1
    else if (c <= 10) buckets['6-10'] += 1
    else buckets['11+'] += 1
    if (c < 3) {
      orphans.push({ slug: t.slug, category: t.category.slug, count: c })
    }
  }

  console.log('INBOUND-LINK DISTRIBUTION (published Tutorials)')
  for (const [bucket, n] of Object.entries(buckets)) {
    console.log(`  ${bucket.padEnd(6)} : ${n}`)
  }
  console.log(`\nTOTAL Tutorials with < 3 inbound links: ${orphans.length} / ${published.length}`)
  console.log('Sample orphans (first 30):')
  for (const o of orphans.slice(0, 30)) {
    console.log(`  ${o.category}/${o.slug}  (${o.count})`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
