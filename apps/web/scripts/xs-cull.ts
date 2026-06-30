/** Reversible cull: set PUBLIC cross-stitch patterns -> PRIVATE + drop from search.
 *  Input JSON: array of { slug, reason }. Appends to a master manifest.
 *  Run from MAIN checkout.
 *    tsx scripts/xs-cull.ts <cull.json> [--apply]
 *  Without --apply it's a dry run (counts only). */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch { /* env from shell */ }
}
loadEnvFile('C:/Users/Rebecca/Projects/code/homemade/.env.credentials')
import { prisma, Visibility } from '@homemade/db'

const SCRATCH = 'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-jolly-visvesvaraya-564eb8/a77e9b9e-ee18-4618-899c-bbd75803d8b3/scratchpad'
const MANIFEST = `${SCRATCH}/culled-manifest.json`

interface CullRec { slug: string; reason: string }

async function main(): Promise<void> {
  const file = process.argv[2]
  const apply = process.argv.includes('--apply')
  if (!file) throw new Error('usage: xs-cull.ts <cull.json> [--apply]')
  const recs: CullRec[] = JSON.parse(readFileSync(file, 'utf8'))
  const { removePatternFromSearch } = await import('@homemade/search')

  let flipped = 0, alreadyPrivate = 0, notFound = 0
  const done: { slug: string; reason: string; at: string }[] = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : []
  const seen = new Set(done.map((d) => d.slug))

  for (const r of recs) {
    const p = await prisma.pattern.findUnique({ where: { slug: r.slug }, select: { id: true, visibility: true } })
    if (!p) { notFound++; continue }
    if (p.visibility === Visibility.PRIVATE) { alreadyPrivate++; continue }
    if (apply) {
      await prisma.pattern.update({ where: { id: p.id }, data: { visibility: Visibility.PRIVATE } })
      await removePatternFromSearch(p.id)
      if (!seen.has(r.slug)) { done.push({ slug: r.slug, reason: r.reason, at: new Date().toISOString() }); seen.add(r.slug) }
    }
    flipped++
  }
  if (apply) writeFileSync(MANIFEST, JSON.stringify(done, null, 2))
  console.log(`${apply ? 'APPLIED' : 'DRY RUN'} · input ${recs.length} · would-flip ${flipped} · already-private ${alreadyPrivate} · not-found ${notFound}`)
  if (apply) console.log(`manifest now holds ${done.length} culled slugs`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
