import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}
async function main() {
  const { prisma, TutorialStatus } = await import('../src/index.js')
  // Categories state
  const cats = await prisma.category.findMany({
    orderBy: { launchOrder: 'asc' },
    select: { id: true, slug: true, pipelineStatus: true, launchOrder: true, lastAutopilotRunAt: true, isPublicVisible: true, _count: { select: { subCategories: true } } },
  })
  const pub = await prisma.tutorial.groupBy({ by: ['categoryId'], where: { status: TutorialStatus.PUBLISHED }, _count: { _all: true } })
  const drf = await prisma.tutorial.groupBy({ by: ['categoryId'], where: { status: TutorialStatus.DRAFT }, _count: { _all: true } })
  const idSlug = new Map(cats.map((c: any) => [c.id, c.slug]))
  const pubMap = new Map<string, number>(); for (const r of pub) { const s = idSlug.get(r.categoryId); if (s) pubMap.set(s, r._count._all) }
  const drfMap = new Map<string, number>(); for (const r of drf) { const s = idSlug.get(r.categoryId); if (s) drfMap.set(s, r._count._all) }
  console.log('CATEGORIES')
  console.log('ord | slug                  | status      | subs | last fire        | PUB    | DRAFT')
  for (const c of cats) {
    const fire = c.lastAutopilotRunAt ? c.lastAutopilotRunAt.toISOString().slice(0, 16).replace('T', ' ') : '—'
    console.log(` ${String(c.launchOrder).padStart(2)} | ${c.slug.padEnd(21)} | ${c.pipelineStatus.padEnd(11)} | ${String(c._count.subCategories).padStart(4)} | ${fire.padEnd(16)} | ${String(pubMap.get(c.slug) ?? 0).padStart(6)} | ${String(drfMap.get(c.slug) ?? 0).padStart(5)}`)
  }
  // Image verification state
  console.log('\nIMAGE VERIFICATION')
  const groups = await prisma.media.groupBy({
    by: ['verificationStatus'],
    where: { tutorialsHero: { some: { status: TutorialStatus.PUBLISHED } } },
    _count: { _all: true },
  })
  for (const g of groups) console.log(`  ${g.verificationStatus.padEnd(28)} : ${g._count._all}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
