import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
const W = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run/W1'
async function main() {
  const { prisma } = await import('../src/index.js')
  const db = prisma as any
  const manifest = JSON.parse(readFileSync(W + '/manifest.json', 'utf8'))
  const verify = JSON.parse(readFileSync(W + '/verify.json', 'utf8'))
  const pass = new Set(verify.filter((v: any) => (v.verdict || '').toUpperCase() === 'PASS').map((v: any) => v.genFile))
  const passEntries = manifest.filter((m: any) => pass.has(m.genFile))
  let missing = 0, notFlux = 0, ok = 0
  const samples: string[] = []
  for (const m of passEntries) {
    const t = await db.tutorial.findUnique({ where: { id: m.tutorialId }, select: { id: true, slug: true, status: true, hero: { select: { source: true } } } })
    if (!t) { missing++; if (samples.length < 6) samples.push(`MISSING id=${m.tutorialId} slug=${m.slug}`); continue }
    if (t.hero?.source === 'flux-pro') ok++
    else { notFlux++; if (samples.length < 6) samples.push(`NOTFLUX slug=${t.slug} status=${t.status} src=${t.hero?.source}`) }
  }
  console.log(`W1 PASS entries: ${passEntries.length}`)
  console.log(`  now flux-pro (committed): ${ok}`)
  console.log(`  findUnique MISSING: ${missing}`)
  console.log(`  exists but not flux-pro: ${notFlux}`)
  samples.forEach((s) => console.log('   ', s))
  // Are the missing ids found by a different status filter?
  if (missing > 0) {
    const ids = passEntries.map((m: any) => m.tutorialId)
    const found = await db.$queryRawUnsafe(`SELECT COUNT(*) n FROM "Tutorial" WHERE id = ANY($1)`, ids)
    console.log(`  raw SELECT count for all PASS ids: ${Number(found[0].n)} of ${ids.length}`)
  }
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
