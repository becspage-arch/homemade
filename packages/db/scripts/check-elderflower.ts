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

  const t = await prisma.tutorial.findUnique({
    where: { slug: 'elderflower-cold-infusion' },
    include: {
      recipeIngredients: { include: { ingredient: true } },
      recipeTools: { include: { tool: true } },
    },
  })
  if (!t) { console.log('not found'); return }
  console.log('SLUG:', t.slug)
  console.log('TITLE:', t.title)
  console.log('TYPE:', t.type)
  console.log('STATUS:', t.status)
  console.log('servings:', t.servings)
  console.log('yieldDescription:', t.yieldDescription)
  console.log('\nrecipeIngredients count:', t.recipeIngredients.length)
  t.recipeIngredients.forEach((i: any) => {
    console.log(`  ${i.quantity} ${i.unit} ${i.ingredient?.name || '(missing ingredient ref)'} — note: ${i.notes || '(none)'}`)
  })
  console.log('\nrecipeTools count:', t.recipeTools.length)
  t.recipeTools.forEach((tool: any) => {
    console.log(`  ${tool.tool?.name || '(missing tool ref)'} — note: ${tool.notes || '(none)'}`)
  })

  // Check body for ingredientsList block
  const body = t.body as any
  console.log('\nbody node types:')
  const content = body?.content || []
  content.forEach((n: any, i: number) => {
    let extra = ''
    if (n.type === 'heading') extra = ` "${(n.content || []).map((c: any) => c.text).join('')}"`
    if (n.type === 'ingredientsList') extra = ` (count: ${n.attrs?.items?.length || 0})`
    if (n.type === 'suppliesCard') extra = ` (count: ${n.attrs?.items?.length || 0})`
    console.log(`  ${String(i).padStart(3)}: ${n.type}${extra}`)
  })
}
main().catch((e) => { console.error(e); process.exit(1) })
