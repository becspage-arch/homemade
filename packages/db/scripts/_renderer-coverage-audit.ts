/**
 * Renderer coverage audit (READ ONLY). Renders every published craft tutorial
 * that has a chartDefinition and categorises the verifier outcome, so we can
 * see what actually fails and why before changing the renderer.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname
  for (let d = 0; d < 12; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

import { renderPattern, defaultPalette } from '../../../apps/web/src/lib/crochet/renderer/index.js'
import type { ChartDefinition } from '../../../apps/web/src/lib/craft-charts/types.js'

function categorise(issue: string): string {
  if (/lower than round/.test(issue)) return 'decrease'
  if (/grows >3x/.test(issue)) return 'growth>3x'
  if (/unknown stitch symbol/.test(issue)) return 'unknown-symbol'
  if (/Stitch count mismatch/.test(issue)) return 'count-mismatch'
  if (/centroid outside canvas/.test(issue)) return 'centroid-outside'
  if (/Degenerate placement/.test(issue)) return 'degenerate'
  return 'other'
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const cats = await prisma.category.findMany({ where: { slug: { in: ['crochet', 'knitting', 'needlework'] } }, select: { id: true, slug: true } })
  let total = 0, ok = 0, notOk = 0
  const cat: Record<string, number> = {}
  const unknownSymbols: Record<string, number> = {}
  const okIfSoftOnly = { count: 0 } // would pass if decrease/growth were non-blocking
  const failExamples: string[] = []

  for (const c of cats) {
    const rows = await prisma.tutorial.findMany({
      where: { categoryId: c.id, status: 'PUBLISHED' },
      select: { slug: true, chartDefinition: true },
    })
    for (const r of rows) {
      if (r.chartDefinition == null) continue
      total++
      let res
      try { res = renderPattern(r.chartDefinition as unknown as ChartDefinition, { palette: defaultPalette() }) }
      catch (e) { notOk++; cat['threw'] = (cat['threw'] ?? 0) + 1; if (failExamples.length < 12) failExamples.push(`${r.slug}: THREW ${String(e).slice(0, 60)}`); continue }
      if (res.verify.ok) { ok++; continue }
      notOk++
      const kinds = new Set(res.verify.issues.map(categorise))
      for (const k of kinds) cat[k] = (cat[k] ?? 0) + 1
      for (const iss of res.verify.issues) {
        const um = iss.match(/"([^"]+)"@rnd/g)
        if (um) for (const u of um) { const key = u.replace(/"|@rnd/g, ''); unknownSymbols[key] = (unknownSymbols[key] ?? 0) + 1 }
      }
      // would it pass if decrease + growth were downgraded to non-blocking?
      const hard = res.verify.issues.filter((i) => !/lower than round|grows >3x/.test(i))
      if (hard.length === 0) okIfSoftOnly.count++
      if (failExamples.length < 12) failExamples.push(`${r.slug}: [${[...kinds].join(',')}]`)
    }
  }
  console.log(`charted patterns rendered: ${total}`)
  console.log(`  verify.ok: ${ok}`)
  console.log(`  verify NOT ok: ${notOk}`)
  console.log(`  of those, would pass if decrease/growth were non-blocking: ${okIfSoftOnly.count}`)
  console.log('issue categories (patterns hitting each):', JSON.stringify(cat, null, 0))
  console.log('unknown symbols:', JSON.stringify(unknownSymbols))
  console.log('examples:'); for (const e of failExamples) console.log('  ' + e)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
