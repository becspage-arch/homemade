/**
 * Give spoon-measured ingredients a density so tsp / tbsp / cup convert to
 * grams — both for the recipe-page units renderer and for nutrition.
 *
 * Source of the value: the per-tsp gram weight already vetted in each
 * ingredient's nutritionalInfoPer100g.gramsPerUnit.tsp (ground spices, dried
 * herbs, thin sauces). densityGPerMl = tsp_grams / 5 (a teaspoon is 5 ml), so
 * the gram result is identical to what nutrition already computed — this just
 * also lights up the weight⇄volume toggle in the ingredients list. Only touches
 * rows whose density is currently null; never overwrites an authored density.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/set-spoon-densities.ts          # dry run
 *   pnpm --filter "@homemade/db" exec tsx scripts/set-spoon-densities.ts --apply
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 8; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p }
}
import { prisma } from '../src'

// Categories where a tsp/tbsp measure means "by volume of a powder/liquid", so
// a derived density is sensible. Whole produce / meat / fresh herbs measured by
// piece or handful are excluded — a density would mislead the renderer there.
const VOLUME_MEASURED = new Set(['spice', 'baking', 'condiment', 'sweetener', 'flour', 'other'])

async function main() {
  const apply = process.argv.includes('--apply')
  const rows = await prisma.ingredient.findMany({
    where: { densityGPerMl: null },
    select: { id: true, slug: true, name: true, category: true, nutritionalInfoPer100g: true },
  })

  const updates: { id: string; slug: string; density: number }[] = []
  for (const r of rows) {
    if (!VOLUME_MEASURED.has(r.category)) continue
    const n = r.nutritionalInfoPer100g as Record<string, unknown> | null
    const gpu = n && typeof n === 'object' ? (n.gramsPerUnit as Record<string, unknown> | undefined) : undefined
    const tsp = gpu && typeof gpu.tsp === 'number' ? (gpu.tsp as number) : null
    if (tsp == null || tsp <= 0) continue
    const density = Math.round((tsp / 5) * 100) / 100
    if (density <= 0) continue
    updates.push({ id: r.id, slug: r.slug, density })
  }

  console.log(`${apply ? 'APPLY' : 'DRY RUN'} — ${updates.length} ingredients get a density`)
  for (const u of updates.sort((a, b) => a.slug.localeCompare(b.slug))) {
    console.log(`  ${u.slug}\t${u.density} g/ml  (1 tsp ≈ ${(u.density * 5).toFixed(1)} g)`)
    if (apply) await prisma.ingredient.update({ where: { id: u.id }, data: { densityGPerMl: u.density } })
  }
  if (!apply) console.log('\n(dry run — nothing written. Re-run with --apply.)')
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
