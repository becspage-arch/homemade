/**
 * Pre-upload slug validator. Reads a batch dir, checks every ingredientSlug
 * and recipeTools[].slug against the live DB. Prints offenders per file.
 *   pnpm --filter @homemade/db exec tsx scripts/_validate-slugs.ts <batchDirName>
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const batchName = process.argv[2]
if (!batchName) { console.error('usage: _validate-slugs.ts <batchDirName>'); process.exit(1) }
const BATCH_DIR = resolve(__dirname, 'batches', batchName)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any)

function collectIngredientSlugs(node: any, out: Set<string>) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) { node.forEach(n => collectIngredientSlugs(n, out)); return }
  if (node.type === 'ingredientsList' && node.attrs?.items) {
    for (const it of node.attrs.items) if (it.ingredientSlug) out.add(it.ingredientSlug)
  }
  for (const k of Object.keys(node)) collectIngredientSlugs(node[k], out)
}

async function main() {
  const ings = new Set((await prisma.ingredient.findMany({ select: { slug: true } })).map((i: any) => i.slug))
  const tools = new Set((await prisma.tool.findMany({ select: { slug: true } })).map((t: any) => t.slug))
  const files = readdirSync(BATCH_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_')).sort()
  let bad = 0
  for (const f of files) {
    const doc = JSON.parse(readFileSync(resolve(BATCH_DIR, f), 'utf8'))
    const ingSet = new Set<string>()
    collectIngredientSlugs(doc.body, ingSet)
    const badIng = [...ingSet].filter(s => !ings.has(s))
    const badTool = (doc.recipeTools || []).map((t: any) => t.slug).filter((s: string) => !tools.has(s))
    if (badIng.length || badTool.length) {
      bad++
      console.log(`\n${f}`)
      if (badIng.length) console.log(`  bad ingredients: ${badIng.join(', ')}`)
      if (badTool.length) console.log(`  bad tools: ${badTool.join(', ')}`)
    }
  }
  console.log(bad ? `\n${bad} file(s) with bad slugs` : `\nAll ${files.length} files: slugs valid`)
  await prisma.$disconnect(); await pool.end()
}
main().catch(e => { console.error(e); process.exit(1) })
