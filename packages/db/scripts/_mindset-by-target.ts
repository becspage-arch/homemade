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

async function main() {
  const { prisma, TutorialStatus } = await import('../src/index.js')

  const cat = await prisma.category.findUnique({ where: { slug: 'mindset' } })
  if (!cat) {
    console.error('mindset category missing')
    process.exit(1)
  }

  const all = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: TutorialStatus.PUBLISHED },
    select: { slug: true, practiceTargets: true, subCategory: { select: { slug: true } } },
  })

  const byTarget = new Map<string, number>()
  const bySub = new Map<string, number>()
  let untagged = 0
  for (const row of all) {
    if (!row.practiceTargets || row.practiceTargets.length === 0) {
      untagged++
    } else {
      for (const t of row.practiceTargets) {
        byTarget.set(t, (byTarget.get(t) ?? 0) + 1)
      }
    }
    const s = row.subCategory?.slug ?? '(no-sub)'
    bySub.set(s, (bySub.get(s) ?? 0) + 1)
  }

  const totalPublished = all.length
  console.log(`Total PUBLISHED mindset: ${totalPublished}`)
  console.log(`Untagged (no practiceTargets): ${untagged}`)
  console.log('\nBy practiceTarget (counts; tutorials with multiple targets count in each):')
  const sortedTargets = [...byTarget.entries()].sort((a, b) => b[1] - a[1])
  for (const [t, n] of sortedTargets) {
    console.log(`  ${t.padEnd(15)} ${String(n).padStart(4)}`)
  }
  console.log('\nBy sub-category (practice type):')
  const sortedSubs = [...bySub.entries()].sort((a, b) => b[1] - a[1])
  for (const [s, n] of sortedSubs) {
    console.log(`  ${s.padEnd(20)} ${String(n).padStart(4)}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
