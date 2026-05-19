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
 * Reports Media rows that are missing alt text but ARE attached to a
 * published Tutorial hero. These are the rows that genuinely hurt SEO +
 * accessibility — Media on unpublished tutorials or detached rows aren't
 * surfaced.
 *
 * Pass `--backfill` to populate alt from the parent Tutorial.title for
 * every missing row. Better than nothing while we wait for hand-crafted
 * alt text.
 */
async function main() {
  const { prisma, TutorialStatus } = await import('../src/index.js')
  const args = new Set(process.argv.slice(2))
  const backfill = args.has('--backfill')

  const missing = await prisma.media.findMany({
    where: {
      OR: [{ alt: null }, { alt: '' }],
      tutorialsHero: {
        some: { status: TutorialStatus.PUBLISHED },
      },
    },
    select: {
      id: true,
      alt: true,
      tutorialsHero: {
        where: { status: TutorialStatus.PUBLISHED },
        select: { id: true, title: true, slug: true },
        take: 1,
      },
    },
  })

  console.log(`Found ${missing.length} hero Media rows with missing alt text`)
  for (const m of missing.slice(0, 40)) {
    const t = m.tutorialsHero[0]
    console.log(`  ${m.id}  →  ${t?.slug ?? '<no tutorial>'}  (${t?.title ?? ''})`)
  }
  if (missing.length > 40) {
    console.log(`  ... and ${missing.length - 40} more`)
  }

  if (backfill) {
    let updated = 0
    for (const m of missing) {
      const t = m.tutorialsHero[0]
      if (!t) continue
      await prisma.media.update({
        where: { id: m.id },
        data: { alt: t.title },
      })
      updated += 1
    }
    console.log(`\nBackfilled alt text on ${updated} Media rows from their Tutorial.title`)
  } else {
    console.log('\n(pass --backfill to populate alt from Tutorial.title for every missing row)')
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
