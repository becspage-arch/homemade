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

  const counts = await (prisma as any).$queryRaw<any[]>`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE "revisedFrom" IS NOT NULL) AS "revisedFromSet",
      COUNT(*) FILTER (WHERE "voiceRetrofittedAt" IS NOT NULL) AS "voiceRetrofittedAtSet",
      COUNT(*) FILTER (WHERE "revisedFrom" IS NOT NULL AND "voiceRetrofittedAt" IS NULL) AS "revisedNoVoice",
      COUNT(*) FILTER (WHERE "revisedFrom" IS NULL AND "voiceRetrofittedAt" IS NOT NULL) AS "voiceNoRevised",
      COUNT(*) FILTER (WHERE "revisedFrom" IS NOT NULL AND "voiceRetrofittedAt" IS NOT NULL) AS "both"
    FROM "Tutorial"
    WHERE status = 'PUBLISHED'
  `
  const c = counts[0]
  console.log('PUBLISHED Tutorial field state:')
  console.log(`  total:                                  ${c.total}`)
  console.log(`  revisedFrom set:                        ${c.revisedFromSet}`)
  console.log(`  voiceRetrofittedAt set:                 ${c.voiceRetrofittedAtSet}`)
  console.log(`  revisedFrom set but voice null:         ${c.revisedNoVoice}  ← image worker contamination`)
  console.log(`  voice set but revisedFrom null:         ${c.voiceNoRevised}  ← would mean voice apply skipped revisedFrom`)
  console.log(`  both set (real voice retrofits):        ${c.both}  ← voice-retrofitted with snapshot`)

  // Look at the most recent batch — what timestamp do they have?
  console.log('\nMost recent 5 tutorials by voiceRetrofittedAt:')
  const recent = await (prisma as any).$queryRaw<any[]>`
    SELECT slug, "voiceRetrofittedAt", "revisedFrom" IS NOT NULL AS "hasRevised"
    FROM "Tutorial"
    WHERE "voiceRetrofittedAt" IS NOT NULL
    ORDER BY "voiceRetrofittedAt" DESC
    LIMIT 5
  `
  recent.forEach((r: any) => {
    console.log(`  ${r.slug.padEnd(50)} | ${new Date(r.voiceRetrofittedAt).toISOString()} | revisedFrom=${r.hasRevised}`)
  })

  // Did batch3 actually populate voiceRetrofittedAt? Look at slugs in batch3 dir
  console.log('\nBatch 3 verification — checking slugs from docs/voice-retrofit-2026-05-25-batch3/:')
  const batch3Path = resolve(__dirname, '../../../docs/voice-retrofit-2026-05-25-batch3')
  if (existsSync(batch3Path)) {
    const fs = await import('node:fs/promises')
    const entries = await fs.readdir(batch3Path)
    const slugs = entries
      .filter((e) => e.endsWith('.json') && !e.startsWith('_'))
      .map((e) => e.replace(/\.json$/, ''))
      .slice(0, 50)
    console.log(`  found ${slugs.length} batch3 slug files`)
    if (slugs.length > 0) {
      const rows = await (prisma as any).$queryRaw<any[]>`
        SELECT slug, "voiceRetrofittedAt" IS NOT NULL AS "hasVoice", "revisedFrom" IS NOT NULL AS "hasRevised"
        FROM "Tutorial"
        WHERE slug = ANY(${slugs})
      `
      const withVoice = rows.filter((r: any) => r.hasVoice).length
      const withRevised = rows.filter((r: any) => r.hasRevised).length
      console.log(`  batch3 slugs with voiceRetrofittedAt set: ${withVoice} / ${rows.length}`)
      console.log(`  batch3 slugs with revisedFrom set:        ${withRevised} / ${rows.length}`)
    }
  } else {
    console.log('  batch3 directory not found')
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
