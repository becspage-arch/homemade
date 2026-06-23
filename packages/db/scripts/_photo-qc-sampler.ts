import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

const OUT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-sample'
const R2_BASE = process.env.R2_PUBLIC_BASE_URL || 'https://media.homemade.education'
const CDN = process.env.CDN_IMAGE_TRANSFORM_ORIGIN || 'https://homemade.education'
const CF_HASH = process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH || ''

function urlFor(m: any): string | null {
  if (m.r2Key) return `${CDN}/cdn-cgi/image/width=600,format=auto/${R2_BASE}/${m.r2Key}`
  if (m.cloudflareId && CF_HASH) return `https://imagedelivery.net/${CF_HASH}/${m.cloudflareId}/public`
  if (m.sourceUrl) return m.sourceUrl
  return null
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const db = prisma as any
  mkdirSync(OUT, { recursive: true })

  const manifest: any[] = []
  let idx = 0

  async function sampleTutorials(catSlug: string, source: string, n: number) {
    const rows = await db.$queryRaw<any[]>`
      SELECT t.slug, t.title, m.id AS mid, m."r2Key", m."cloudflareId", m."sourceUrl", m.source, m.alt
      FROM "Tutorial" t
      JOIN "Category" c ON t."categoryId" = c.id
      JOIN "Media" m ON t."heroMediaId" = m.id
      WHERE t.status = 'PUBLISHED' AND c.slug = ${catSlug} AND m.source = ${source}
      ORDER BY random() LIMIT ${n}
    `
    for (const r of rows) {
      const url = urlFor(r)
      if (!url) continue
      manifest.push({ idx, kind: 'recipe', category: catSlug, source, title: r.title, slug: r.slug, alt: r.alt, url })
      idx++
    }
  }

  async function samplePatterns(source: string, n: number) {
    const rows = await db.$queryRaw<any[]>`
      SELECT p.slug, p.name AS title, m.id AS mid, m."r2Key", m."cloudflareId", m."sourceUrl", m.source, m.alt
      FROM "Pattern" p
      JOIN "SubCategory" sc ON p."subCategoryId" = sc.id
      JOIN "Category" c ON sc."categoryId" = c.id
      JOIN "Media" m ON p."thumbnailMediaId" = m.id
      WHERE p.visibility = 'PUBLIC' AND c.slug = 'cross-stitch' AND m.source = ${source}
      ORDER BY random() LIMIT ${n}
    `
    for (const r of rows) {
      const url = urlFor(r)
      if (!url) continue
      manifest.push({ idx, kind: 'pattern', category: 'cross-stitch', source, title: r.title, slug: r.slug, alt: r.alt, url })
      idx++
    }
  }

  // Cooking/baking stock + AI strata
  await sampleTutorials('cooking', 'pexels', 22)
  await sampleTutorials('cooking', 'unsplash', 14)
  await sampleTutorials('cooking', 'wikimedia', 6)
  await sampleTutorials('cooking', 'pixabay', 12)
  await sampleTutorials('cooking', 'flux-schnell', 10)
  await sampleTutorials('baking', 'pexels', 12)
  await sampleTutorials('baking', 'unsplash', 10)
  await sampleTutorials('baking', 'wikimedia', 6)
  await sampleTutorials('baking', 'pixabay', 8)
  await sampleTutorials('baking', 'flux-schnell', 8)
  // Cross-stitch
  await samplePatterns('wikimedia', 20)
  await samplePatterns('original', 10)

  // Download all
  let ok = 0, fail = 0
  for (const m of manifest) {
    try {
      const res = await fetch(m.url)
      if (!res.ok) { m.downloadError = `HTTP ${res.status}`; fail++; continue }
      const buf = Buffer.from(await res.arrayBuffer())
      const fname = `${String(m.idx).padStart(3, '0')}_${m.kind}_${m.source}.jpg`
      writeFileSync(resolve(OUT, fname), buf)
      m.file = fname
      ok++
    } catch (e: any) { m.downloadError = String(e?.message || e); fail++ }
  }

  writeFileSync(resolve(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`Sampled ${manifest.length} | downloaded ${ok} | failed ${fail}`)
  console.log(`Manifest: ${resolve(OUT, 'manifest.json')}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
