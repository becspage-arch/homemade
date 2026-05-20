/**
 * Hand-curated re-search for the heroes where the orchestrator's title-only
 * query produced nonsensical matches (treble → scrabble tiles, etc.).
 *
 * For each entry below, force a specific search query and replace the hero.
 * Walks every free source in order (unsplash, pexels, wikimedia, pixabay),
 * picks the first hit that passes the quality gate. Excludes flux-schnell.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

const RECURATE: Array<{ slug: string; query: string; alt?: string[] }> = [
  { slug: 'crochet-magic-ring', query: 'amigurumi crochet ball', alt: ['crochet doily round', 'crochet pattern yarn'] },
]

interface ResultRow { slug: string; outcome: string; source?: string; mediaId?: string; sourceUrl?: string; usedQuery?: string }

function extFromContentType(ct: string | null): { ext: string; mime: string } {
  const c = (ct ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
  if (c === 'image/png') return { ext: 'png', mime: 'image/png' }
  if (c === 'image/webp') return { ext: 'webp', mime: 'image/webp' }
  if (c === 'image/avif') return { ext: 'avif', mime: 'image/avif' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

async function main() {
  const { prisma, r2Upload } = await import('../src/index.js')
  const { searchUnsplash } = await import('../../../apps/web/src/lib/image-sourcing/unsplash.js')
  const { searchPexels } = await import('../../../apps/web/src/lib/image-sourcing/pexels.js')
  const { searchWikimedia } = await import('../../../apps/web/src/lib/image-sourcing/wikimedia.js')
  const { MIN_WIDTH, MIN_HEIGHT, MIN_RATIO, MAX_RATIO } = await import('../../../apps/web/src/lib/image-sourcing/types.js')

  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })
  if (!author) throw new Error('Author not found')

  const passes = (r: any) => r?.url && r.width >= MIN_WIDTH && r.height >= MIN_HEIGHT && r.width / r.height >= MIN_RATIO && r.width / r.height <= MAX_RATIO

  const results: ResultRow[] = []
  for (const entry of RECURATE) {
    const t = await prisma.tutorial.findUnique({
      where: { slug: entry.slug },
      select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, status: true, heroMediaId: true, hero: { select: { id: true, source: true } } },
    })
    if (!t) { results.push({ slug: entry.slug, outcome: 'not-found' }); continue }

    const queries = [entry.query, ...(entry.alt ?? [])]
    let chosen: any = null
    let usedQuery: string | null = null

    outer: for (const q of queries) {
      for (const fn of [searchUnsplash, searchPexels, searchWikimedia] as Array<(q: string, opts?: any) => Promise<any[]>>) {
        const hits = await fn(q, { limit: 5 })
        for (const h of hits) {
          if (passes(h)) { chosen = h; usedQuery = q; break outer }
        }
      }
    }
    if (!chosen) {
      results.push({ slug: entry.slug, outcome: 'no-match' })
      console.log(`${entry.slug}: NO MATCH`)
      continue
    }

    const dl = await fetch(chosen.url, {
      headers: { 'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)', Accept: 'image/*,*/*;q=0.8' },
    })
    if (!dl.ok) { results.push({ slug: entry.slug, outcome: 'download-error' }); continue }
    const buf = Buffer.from(await dl.arrayBuffer())
    if (!buf.length) { results.push({ slug: entry.slug, outcome: 'empty-body' }); continue }
    const { ext, mime } = extFromContentType(dl.headers.get('content-type'))
    const filename = `${t.slug}-hero.${ext}`
    const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/phase-1-hero-recurate' })

    const media = await prisma.media.create({
      data: {
        r2Key: key, type: 'ILLUSTRATION', status: 'READY', filename, mimeType: mime,
        width: chosen.width, height: chosen.height, bytes: buf.length,
        source: chosen.source, sourceUrl: chosen.pageUrl, creatorName: chosen.creatorName,
        licenceCode: chosen.licenceCode, licenceUrl: chosen.licenceUrl, requiresAttribution: chosen.requiresAttribution,
      },
    })

    await prisma.$transaction(async (tx) => {
      await tx.tutorialVersion.create({
        data: {
          tutorialId: t.id, title: t.title, subtitle: t.subtitle, excerpt: t.excerpt, body: t.body as any, status: t.status,
          authorId: author!.id, changeNote: `hero re-curate (query "${usedQuery}"): replace ${t.hero?.source ?? 'previous'} hero.`,
        },
      })
      await tx.tutorial.update({ where: { id: t.id }, data: { heroMediaId: media.id, heroImageStrategy: 'REAL_PHOTO' } })
    })

    results.push({ slug: entry.slug, outcome: 'attached', source: chosen.source, mediaId: media.id, sourceUrl: chosen.pageUrl, usedQuery: usedQuery ?? undefined })
    console.log(`${entry.slug}: OK ${chosen.source} (q="${usedQuery}") ${chosen.width}x${chosen.height} media=${media.id}`)
    console.log(`  page: ${chosen.pageUrl}`)
  }

  console.log('\n=== summary ===')
  for (const r of results) console.log(`  ${r.slug.padEnd(40)} ${r.outcome.padEnd(15)} ${r.source ?? ''}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
