import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const slugs: string[] = JSON.parse(readFileSync(resolve(__dirname, '../../../docs/voice-retrofit-2026-05-27-batch41/_slugs.json'), 'utf8'))
  const total: any = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining: any = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  // Set of applied slugs in this batch
  const inBatch: any = await prisma.tutorial.findMany({
    where: { slug: { in: slugs }, voiceRetrofittedAt: { not: null } },
    select: { slug: true, voiceRetrofittedAt: true, category: { select: { slug: true } }, type: true },
  })
  // Sort applied by voiceRetrofittedAt to find ones applied in this run
  const sorted = inBatch.slice().sort((a: any, b: any) => +new Date(b.voiceRetrofittedAt) - +new Date(a.voiceRetrofittedAt))
  const recent = sorted.filter((t: any) => {
    const ageMs = Date.now() - +new Date(t.voiceRetrofittedAt)
    return ageMs < 60 * 60 * 1000  // within last hour
  })
  console.log('TOTAL with voiceRetrofittedAt set:', total)
  console.log('REMAINING (PUBLISHED & voiceRetrofittedAt IS NULL):', remaining)
  console.log('IN BATCH applied:', inBatch.length, '/', slugs.length)
  console.log('IN BATCH applied within last hour:', recent.length)

  // category breakdown of in-batch
  const byCat: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const t of inBatch) {
    const c = t.category?.slug ?? 'unknown'
    byCat[c] = (byCat[c] || 0) + 1
    byType[t.type] = (byType[t.type] || 0) + 1
  }
  console.log('Category breakdown of applied:')
  for (const [k, v] of Object.entries(byCat)) console.log('  ' + k + ': ' + v)
  console.log('Type breakdown of applied:')
  for (const [k, v] of Object.entries(byType)) console.log('  ' + k + ': ' + v)

  // Random spot-check: pick first applied, fetch full
  const pick = sorted[0]
  console.log('\nSPOT-CHECK pick:', pick?.slug, 'voiceRetrofittedAt:', pick?.voiceRetrofittedAt)
  if (pick) {
    const full: any = await prisma.tutorial.findUnique({
      where: { slug: pick.slug },
      select: { slug: true, body: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
    })
    const firstPara = (full?.body?.content || []).find((b: any) => b.type === 'paragraph')
    const firstText = (firstPara?.content || []).map((c: any) => c.text || '').join('')
    console.log('Public URL: https://homemade.education/' + (full?.category?.slug || '') + '/' + pick.slug)
    console.log('First paragraph (DB):')
    console.log(firstText)
  }

  // Failed-blocker slugs (in batch, voiceRetrofittedAt IS NULL — known verbatim)
  const blockers = await prisma.tutorial.findMany({
    where: { slug: { in: slugs }, voiceRetrofittedAt: null },
    select: { slug: true },
  })
  console.log('\nBlocked (verbatim EFT karate-chop):')
  for (const b of blockers) console.log('  - ' + b.slug)

  // Slugs in batch
  console.log('\nAll batch slugs (' + slugs.length + '):')
  for (const s of slugs) console.log('  ' + s)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
