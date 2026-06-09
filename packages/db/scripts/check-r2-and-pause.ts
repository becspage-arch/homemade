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

  // 1. PAUSED check
  const pauseRows = await (prisma as any).autopilotPauseState.findMany().catch(() => [])
  console.log('AUTOPILOT PAUSE ROWS:')
  pauseRows.forEach((r: any) => {
    console.log(`  stream=${r.streamName} pausedAt=${r.pausedAt} reason=${r.reason}`)
  })
  if (pauseRows.length === 0) console.log('  (none)')

  // 2. Cooking + Baking category state
  console.log('\nCOOKING + BAKING category state:')
  const cb = await prisma.category.findMany({
    where: { slug: { in: ['cooking', 'baking'] } },
    select: { slug: true, pipelineStatus: true, lastAutopilotRunAt: true, updatedAt: true },
  })
  cb.forEach((c) => console.log(`  ${c.slug}: ${c.pipelineStatus}  lastAutopilotRunAt=${c.lastAutopilotRunAt}  updatedAt=${c.updatedAt}`))

  // 3. Media r2Key population — count PUBLISHED tutorials with usable hero
  const heroIds = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', heroMediaId: { not: null } },
    select: { heroMediaId: true },
  })
  const mediaIds = heroIds.map((t) => t.heroMediaId).filter(Boolean) as string[]
  const rows = await (prisma as any).$queryRaw<any[]>`SELECT id, "r2Key", "cloudflareId", "sourceUrl", source FROM "Media" WHERE id = ANY(${mediaIds})`

  const haveR2 = rows.filter((m: any) => !!m.r2Key).length
  const haveCloudflare = rows.filter((m: any) => !!m.cloudflareId).length
  const haveBoth = rows.filter((m: any) => !!m.r2Key && !!m.cloudflareId).length
  const haveNeither = rows.filter((m: any) => !m.r2Key && !m.cloudflareId).length
  const haveR2OrCF = rows.filter((m: any) => !!m.r2Key || !!m.cloudflareId).length

  console.log(`\nPUBLISHED hero Media rows: ${rows.length}`)
  console.log(`  have r2Key:               ${haveR2}`)
  console.log(`  have cloudflareId:        ${haveCloudflare}`)
  console.log(`  have both:                ${haveBoth}`)
  console.log(`  have r2 OR cloudflareId:  ${haveR2OrCF}  ← these render`)
  console.log(`  have neither:             ${haveNeither}  ← these DO NOT render`)

  // 4. Sample 3 of each: r2-backed, cloudflare-backed, neither
  console.log('\nSAMPLE — r2-backed:')
  rows.filter((m: any) => !!m.r2Key).slice(0, 3).forEach((m: any) => {
    console.log(`  id=${m.id} r2Key=${m.r2Key} source=${m.source}`)
  })
  console.log('\nSAMPLE — cloudflareId-backed:')
  rows.filter((m: any) => !!m.cloudflareId && !m.r2Key).slice(0, 3).forEach((m: any) => {
    console.log(`  id=${m.id} cloudflareId=${m.cloudflareId} source=${m.source}`)
  })
  console.log('\nSAMPLE — neither:')
  rows.filter((m: any) => !m.r2Key && !m.cloudflareId).slice(0, 3).forEach((m: any) => {
    console.log(`  id=${m.id} sourceUrl=${(m.sourceUrl || '').slice(0, 80)} source=${m.source}`)
  })

  // 5. 16 DRAFTs check on r2Key
  console.log('\nDRAFT hero Media rows:')
  const draftHeroIds = await prisma.tutorial.findMany({
    where: { status: 'DRAFT', heroMediaId: { not: null } },
    select: { heroMediaId: true, slug: true },
  })
  const draftMediaIds = draftHeroIds.map((t) => t.heroMediaId).filter(Boolean) as string[]
  const draftRows = await (prisma as any).$queryRaw<any[]>`SELECT id, "r2Key", "cloudflareId" FROM "Media" WHERE id = ANY(${draftMediaIds})`
  const dHaveR2 = draftRows.filter((m: any) => !!m.r2Key).length
  console.log(`  total draft heroes: ${draftRows.length}`)
  console.log(`  with r2Key:         ${dHaveR2}`)
  console.log(`  with cloudflareId:  ${draftRows.filter((m: any) => !!m.cloudflareId).length}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
