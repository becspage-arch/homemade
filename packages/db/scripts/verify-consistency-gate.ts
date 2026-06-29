/**
 * Verifies the recipe consistency gate end-to-end against the live data:
 *   1. the fixed rum-and-raisin PASSES;
 *   2. a raisin-less copy is FLAGGED (the gate would have caught the bug);
 *   3. across every published RECIPE, the only blocks are the known broken /
 *      surfaced set — no new false-blocks on correct recipes.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let d = __dirname; for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p } }
import { prisma } from '../src'
import { findRecipeMethodGaps } from '../src/recipe-consistency-gate.js'

interface N { type?: string; attrs?: Record<string, unknown>; content?: N[] }
function stripIngredient(body: N, idSubstr: string): N {
  const clone: N = JSON.parse(JSON.stringify(body))
  const walk = (n?: N) => {
    if (!n || typeof n !== 'object') return
    if (n.type === 'ingredientsList' && n.attrs && Array.isArray(n.attrs.items)) {
      n.attrs.items = (n.attrs.items as Array<Record<string, unknown>>).filter(
        (it) => !(typeof it.ingredientId === 'string' && it.ingredientId.includes(idSubstr)) &&
          !(typeof it.name === 'string' && it.name.toLowerCase().includes('raisin')),
      )
    }
    if (Array.isArray(n.content)) for (const c of n.content) walk(c)
  }
  walk(clone)
  return clone
}

async function main() {
  // 1 + 2 — rum-and-raisin
  const rr = await prisma.tutorial.findUnique({ where: { slug: 'rum-and-raisin-ice-cream' } })
  if (rr) {
    const passGaps = await findRecipeMethodGaps(rr.body)
    console.log(`1) rum-and-raisin (fixed): ${passGaps.length === 0 ? 'PASSES ✓' : 'FAILS ✗ ' + JSON.stringify(passGaps.map((g) => g.text))}`)
    const without = stripIngredient(rr.body as unknown as N, 'raisin')
    const flagGaps = await findRecipeMethodGaps(without)
    const caught = flagGaps.some((g) => g.phrase.includes('raisin'))
    console.log(`2) rum-and-raisin minus raisins: ${caught ? 'FLAGGED ✓' : 'MISSED ✗'} → ${JSON.stringify(flagGaps.map((g) => g.text))}`)
  }

  // 3 — whole corpus
  const recipes = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', type: 'RECIPE' },
    select: { slug: true, body: true },
    orderBy: { slug: 'asc' },
  })
  const blocked: Array<{ slug: string; gaps: string[] }> = []
  for (const r of recipes) {
    const gaps = await findRecipeMethodGaps(r.body)
    if (gaps.length > 0) blocked.push({ slug: r.slug, gaps: gaps.map((g) => g.text) })
  }
  console.log(`\n3) Published recipes the gate would BLOCK: ${blocked.length} / ${recipes.length}`)
  for (const b of blocked) console.log(`   - ${b.slug}: ${b.gaps.join('; ')}`)
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
