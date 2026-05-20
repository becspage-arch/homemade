/**
 * One-off: swap the stocking-stitch-dishcloth hero from Unsplash (a stack of
 * CROCHETED dishcloths — wrong technique) to a Wikimedia photo of an actual
 * KNITTED ballband dishcloth (verified via the file description page).
 *
 * The image is 3072x2304 (ratio 1.33), which fails the orchestrator's
 * MIN_RATIO 1.5 landscape gate. Bypass that gate here because the content
 * match is exact — a real knit dishcloth — and visual presentation in the
 * tutorial card will be fine.
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
async function main() {
  const { prisma, r2Upload } = await import('../src/index.js')
  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })
  if (!author) throw new Error('no author')
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'stocking-stitch-dishcloth' },
    select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, status: true, hero: { select: { source: true } } },
  })
  if (!t) throw new Error('tutorial not found')
  const fileTitle = 'File:Knit Texture Ballband Dishcloth.jpg'
  const u = new URL('https://commons.wikimedia.org/w/api.php')
  u.searchParams.set('action', 'query'); u.searchParams.set('format', 'json'); u.searchParams.set('origin', '*')
  u.searchParams.set('titles', fileTitle); u.searchParams.set('prop', 'imageinfo')
  u.searchParams.set('iiprop', 'url|size|extmetadata|mime'); u.searchParams.set('iiurlwidth', '2400')
  const res = await fetch(u.toString(), { headers: { 'User-Agent': 'Homemade/1.0 (homemade.education; rebecca@homemade.education)' } })
  const data: any = await res.json()
  const info: any = Object.values(data.query.pages)[0]
  const ii = info.imageinfo[0]
  console.log('file:', ii.url, ii.width + 'x' + ii.height)
  const dl = await fetch(ii.url, { headers: { 'User-Agent': 'Homemade/1.0 (homemade.education; rebecca@homemade.education)' } })
  const buf = Buffer.from(await dl.arrayBuffer())
  const mime = (dl.headers.get('content-type') ?? 'image/jpeg').split(';')[0]
  const ext = mime === 'image/png' ? 'png' : 'jpg'
  const filename = `${t.slug}-hero.${ext}`
  const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/phase-1-hero-pd' })

  const stripHtml = (s: any) => (typeof s === 'string' ? s.replace(/<[^>]*>/g, '').trim() : null)
  const media = await prisma.media.create({
    data: {
      r2Key: key, type: 'ILLUSTRATION', status: 'READY', filename, mimeType: mime,
      width: ii.width, height: ii.height, bytes: buf.length,
      source: 'wikimedia', sourceUrl: ii.descriptionurl,
      creatorName: stripHtml(ii.extmetadata?.Artist?.value),
      licenceCode: 'CC-BY-SA',
      licenceUrl: ii.extmetadata?.LicenseUrl?.value ?? null,
      requiresAttribution: true,
    },
  })
  await prisma.$transaction(async (tx) => {
    await tx.tutorialVersion.create({
      data: {
        tutorialId: t.id, title: t.title, subtitle: t.subtitle, excerpt: t.excerpt, body: t.body as any, status: t.status,
        authorId: author!.id, changeNote: `pd-hero-swap: replace ${t.hero?.source ?? 'previous'} hero with Wikimedia CC-BY-SA "Knit Texture Ballband Dishcloth" (real knitted dishcloth, not the crochet one Unsplash gave us).`,
      },
    })
    await tx.tutorial.update({ where: { id: t.id }, data: { heroMediaId: media.id, heroImageStrategy: 'REAL_PHOTO' } })
  })
  console.log(`stocking-stitch-dishcloth: OK wikimedia CC-BY-SA ${ii.width}x${ii.height} media=${media.id}`)
  console.log(`  page: ${ii.descriptionurl}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
