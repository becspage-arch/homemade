/**
 * Canon gap report (phase_dish_type_001).
 *
 * Audits the UK/US household food canon (prisma/food-canon.ts) against the
 * published catalogue: for every canon dish, counts how many published recipes
 * match. Zero matches = a genuine content gap a follow-on fill worker should
 * author. This script REPORTS only; it authors nothing.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}
import { prisma } from '../src'
import { FOOD_CANON, type CanonCategory } from '../prisma/food-canon'

interface Row { title: string; excerpt: string | null }

function matches(rows: Row[], terms: string[]): number {
  let n = 0
  for (const r of rows) {
    const t = r.title.toLowerCase()
    const e = (r.excerpt ?? '').toLowerCase()
    if (terms.some((m) => t.includes(m) || (m.includes(' ') && e.includes(m)))) n++
  }
  return n
}

async function main() {
  const byCat: Record<CanonCategory, Row[]> = { cooking: [], baking: [] }
  for (const slug of ['cooking', 'baking'] as CanonCategory[]) {
    const cat = await prisma.category.findUnique({ where: { slug }, select: { id: true } })
    if (!cat) continue
    byCat[slug] = await prisma.tutorial.findMany({
      where: { categoryId: cat.id, status: 'PUBLISHED' },
      select: { title: true, excerpt: true },
    })
  }

  const present: { name: string; cat: string; region: string; dishType: string; count: number }[] = []
  const missing: { name: string; cat: string; region: string; dishType: string }[] = []

  for (const d of FOOD_CANON) {
    const n = matches(byCat[d.category], d.match)
    if (n > 0) present.push({ name: d.name, cat: d.category, region: d.region, dishType: d.dishType, count: n })
    else missing.push({ name: d.name, cat: d.category, region: d.region, dishType: d.dishType })
  }

  console.log(`\n===== CANON GAP REPORT =====`)
  console.log(`Canon dishes audited: ${FOOD_CANON.length}  (present: ${present.length}, MISSING: ${missing.length})`)

  for (const cat of ['cooking', 'baking']) {
    const miss = missing.filter((m) => m.cat === cat)
    console.log(`\n## MISSING — ${cat} (${miss.length})`)
    for (const m of miss.sort((a, b) => a.dishType.localeCompare(b.dishType))) {
      console.log(`  [${m.region.toUpperCase().padEnd(4)}] ${m.name}  → shelf: ${m.dishType}`)
    }
  }

  // Thinly-covered canon (1-2 matches) — worth a stronger version.
  console.log(`\n## THIN COVERAGE (1-2 matches) — candidates for a definitive version`)
  for (const p of present.filter((p) => p.count <= 2).sort((a, b) => a.count - b.count)) {
    console.log(`  [${p.cat}] ${p.name}: ${p.count}`)
  }

  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
