import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}

const OUT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-pilot'
const CUR = `${OUT}/current`
const CDN = 'https://homemade.education/cdn-cgi/image/width=560,format=auto/https://media.homemade.education'

async function main() {
  const { prisma } = await import('../src/index.js')
  const db = prisma as any
  mkdirSync(CUR, { recursive: true })

  const rows = await db.$queryRaw<any[]>`
    SELECT t.id, t.slug, t.title, c.slug AS category, sc.slug AS "subCategory",
           m.id AS "mediaId", m."r2Key", m."cloudflareId", m.source
    FROM "Tutorial" t
    JOIN "Category" c ON t."categoryId" = c.id
    LEFT JOIN "SubCategory" sc ON t."subCategoryId" = sc.id
    JOIN "Media" m ON t."heroMediaId" = m.id
    WHERE t.status = 'PUBLISHED'
      AND c.slug IN ('cooking','baking')
      AND m.source IN ('pexels','unsplash','wikimedia','pixabay')
      AND (m."r2Key" IS NOT NULL OR m."cloudflareId" IS NOT NULL)
    ORDER BY random()
    LIMIT 100
  `

  const manifest: any[] = []
  let i = 0
  for (const r of rows) {
    const ing = await db.recipeIngredient.findMany({
      where: { tutorialId: r.id },
      select: { ingredient: { select: { name: true } } },
      orderBy: { position: 'asc' }, take: 4,
    })
    const ingredients = ing.map((x: any) => x.ingredient.name.toLowerCase())
    const url = r.r2Key ? `${CDN}/${r.r2Key}` : null
    const file = `cur_${String(i).padStart(3, '0')}.jpg`
    if (url) {
      try {
        const res = await fetch(url)
        if (res.ok) writeFileSync(resolve(CUR, file), Buffer.from(await res.arrayBuffer()))
      } catch {}
    }
    manifest.push({
      idx: i, tutorialId: r.id, slug: r.slug, title: r.title,
      category: r.category, subCategory: r.subCategory,
      currentSource: r.source, currentMediaId: r.mediaId,
      ingredients, currentFile: file,
    })
    i++
  }
  writeFileSync(resolve(OUT, 'pilot.json'), JSON.stringify(manifest, null, 2))
  console.log(`Selected ${manifest.length}; current heroes downloaded to ${CUR}`)
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
