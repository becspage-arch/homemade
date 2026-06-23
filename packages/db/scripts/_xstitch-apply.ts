/** Apply cross-stitch description fixes + delete 2 sample patterns. */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
import { prisma } from '../src'

const CATEGORY_DESC = 'Animals, florals, landscapes, art reproductions, quotes and sayings, seasonal, monochrome, cocktails, home and cosy, and pride and inclusive patterns.'
const SUBCATS: Record<string, string> = {
  'art-reproductions': 'Van Gogh, Klimt, Monet, Hokusai, Mucha, and other classic paintings.',
  'cocktails': 'Cocktails, spritzes, sangria, coffees, and beer.',
  'home-cosy': 'Cottages, reading nooks, tea tables, candlelit scenes, and village evenings.',
  'landscapes': 'Mountains, coastlines, forests, fields, lighthouses, and city skylines.',
  'monochrome': 'Blackwork, redwork, Delft blue, and single-colour studies.',
  'seasonal': "Christmas, Halloween, Easter, Valentine's, autumn, and other seasonal designs.",
}
const DELETE_PATTERN_IDS = ['cmqmr2p0l00010y0jw5aztidi', 'cmqmr2oxp00000y0jco6n6nl0']

async function main() {
  const cat = await prisma.category.findUnique({ where: { slug: 'cross-stitch' }, select: { id: true } })
  if (!cat) throw new Error('cross-stitch category not found')

  await prisma.category.update({ where: { slug: 'cross-stitch' }, data: { description: CATEGORY_DESC } })
  console.log('category description updated')

  for (const [slug, desc] of Object.entries(SUBCATS)) {
    const r = await prisma.subCategory.updateMany({ where: { slug, categoryId: cat.id }, data: { description: desc } })
    console.log(`subcat ${slug}: updated ${r.count}`)
  }

  for (const id of DELETE_PATTERN_IDS) {
    const p = await prisma.pattern.findUnique({ where: { id }, select: { name: true } })
    if (!p) { console.log(`pattern ${id}: not found (already gone)`); continue }
    try {
      await prisma.pattern.delete({ where: { id } })
      console.log(`pattern deleted: ${p.name}`)
    } catch (e: any) {
      console.log(`pattern ${p.name} delete blocked by FK: ${String(e?.message || e).slice(0, 160)}`)
    }
  }
  process.exit(0)
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
