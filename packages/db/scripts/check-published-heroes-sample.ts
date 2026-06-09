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
  const { prisma } = await import('../src/index.js')

  // 1. How many PUBLISHED tutorials have heroMediaId set
  const pubTotal = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const pubWithHeroId = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', heroMediaId: { not: null } },
  })

  // 2. Of those, how many have a Media row with cloudflareId
  const heroMedia = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', heroMediaId: { not: null } },
    select: { heroMediaId: true },
  })
  const mediaIds = heroMedia.map((t: any) => t.heroMediaId).filter(Boolean) as string[]

  const mediaRows = await prisma.media.findMany({
    where: { id: { in: mediaIds } },
    select: { cloudflareId: true, sourceUrl: true, source: true },
  })
  const withCloudflare = mediaRows.filter((m: any) => !!m.cloudflareId).length
  const withSourceUrlOnly = mediaRows.filter((m: any) => !m.cloudflareId && !!m.sourceUrl).length
  const withNothing = mediaRows.filter((m: any) => !m.cloudflareId && !m.sourceUrl).length

  console.log(`PUBLISHED total: ${pubTotal}`)
  console.log(`PUBLISHED with heroMediaId set: ${pubWithHeroId}`)
  console.log(`PUBLISHED with NO heroMediaId: ${pubTotal - pubWithHeroId}`)
  console.log(`\nOf the ${mediaRows.length} hero Media rows for PUBLISHED tutorials:`)
  console.log(`  - have cloudflareId (uploaded):    ${withCloudflare}`)
  console.log(`  - have only sourceUrl (NOT uploaded): ${withSourceUrlOnly}`)
  console.log(`  - have neither:                       ${withNothing}`)

  // Per source breakdown for non-uploaded
  const noUpload = mediaRows.filter((m: any) => !m.cloudflareId)
  const bySource: Record<string, number> = {}
  noUpload.forEach((m: any) => { bySource[m.source || '(null)'] = (bySource[m.source || '(null)'] || 0) + 1 })
  console.log(`\nBreakdown of the ${noUpload.length} non-uploaded by source:`)
  Object.entries(bySource).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(`  ${String(c).padStart(5)} | ${s}`))
}
main().catch((e) => { console.error(e); process.exit(1) })
