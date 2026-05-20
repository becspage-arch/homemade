/**
 * Swap 7 weak Unsplash hero matches for verified PD / CC-licensed Wikimedia
 * Commons images. Each pick was checked against the file description page
 * to confirm the image genuinely depicts the tutorial's subject (the
 * "if it's not a magic ring, we don't accept it" standard).
 *
 * Picks:
 *   crochet-magic-ring                    → Szydełkowe magiczne kółko.jpg
 *                                           (verified: "Crochet magic circle.
 *                                            A basic stitch in the art of
 *                                            amigurumi.")
 *   long-tail-cast-on                     → Caston.jpg
 *                                           (verified: "A long-tail cast-on
 *                                            used to begin a knitted item")
 *   how-to-work-a-treble                  → Crochet Treble (Step 6).jpg
 *   growing-strawberries                  → Growing strawberries (5693937467).jpg
 *   growing-tomatoes-from-seed            → Tomato seedlings (464355129).jpg
 *   running-and-backstitch-by-hand        → Running stitch for hand embroidery.jpg
 *   cross-stitch-alphabet-sampler-border  → Sampler, 19th century (CH 18616507).jpg
 *
 * The other 7 tutorials keep their existing Unsplash heroes (those were
 * already verified after the orchestrator re-curate pass).
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

const SWAPS: Array<{ slug: string; fileTitle: string }> = [
  { slug: 'crochet-magic-ring',                   fileTitle: 'File:Szydełkowe magiczne kółko.jpg' },
  { slug: 'long-tail-cast-on',                    fileTitle: 'File:Caston.jpg' },
  { slug: 'how-to-work-a-treble',                 fileTitle: 'File:Crochet Treble (Step 6).jpg' },
  { slug: 'growing-strawberries',                 fileTitle: 'File:Growing strawberries (5693937467).jpg' },
  { slug: 'growing-tomatoes-from-seed',           fileTitle: 'File:Tomato seedlings (464355129).jpg' },
  { slug: 'running-and-backstitch-by-hand',       fileTitle: 'File:Running stitch for hand embroidery.jpg' },
  { slug: 'cross-stitch-alphabet-sampler-border', fileTitle: 'File:Sampler, 19th century (CH 18616507).jpg' },
]

interface MWInfo {
  url: string
  width: number
  height: number
  descriptionurl: string
  extmetadata?: {
    LicenseShortName?: { value?: string }
    Artist?: { value?: string }
    LicenseUrl?: { value?: string }
  }
}

function stripHtml(s: string | undefined | null): string | null {
  if (!s) return null
  return s.replace(/<[^>]*>/g, '').trim() || null
}

function normaliseLicence(raw: string | undefined): { code: string; requiresAttribution: boolean } | null {
  if (!raw) return null
  const k = raw.trim().toLowerCase()
  if (k.includes('cc0')) return { code: 'CC0', requiresAttribution: false }
  if (k.includes('public domain')) return { code: 'PD', requiresAttribution: false }
  if (k.includes('by-sa')) return { code: 'CC-BY-SA', requiresAttribution: true }
  if (k.includes('cc by') || k.includes('cc-by')) return { code: 'CC-BY', requiresAttribution: true }
  return null
}

async function fetchFileInfo(title: string): Promise<MWInfo | null> {
  const u = new URL('https://commons.wikimedia.org/w/api.php')
  u.searchParams.set('action', 'query')
  u.searchParams.set('format', 'json')
  u.searchParams.set('origin', '*')
  u.searchParams.set('titles', title)
  u.searchParams.set('prop', 'imageinfo')
  u.searchParams.set('iiprop', 'url|size|extmetadata|mime')
  u.searchParams.set('iiurlwidth', '2400')
  const res = await fetch(u.toString(), {
    headers: { 'User-Agent': 'Homemade/1.0 (homemade.education; rebecca@homemade.education)' },
  })
  if (!res.ok) return null
  const data: any = await res.json()
  const pages = data.query?.pages ?? {}
  for (const p of Object.values(pages) as any[]) {
    const info = p.imageinfo?.[0]
    if (info) return info as MWInfo
  }
  return null
}

function extFromMime(mime: string | null | undefined, fallback: string): { ext: string; mime: string } {
  const c = (mime ?? '').toLowerCase()
  if (c === 'image/png') return { ext: 'png', mime: 'image/png' }
  if (c === 'image/webp') return { ext: 'webp', mime: 'image/webp' }
  if (c === 'image/avif') return { ext: 'avif', mime: 'image/avif' }
  if (c === 'image/jpeg' || c === 'image/jpg') return { ext: 'jpg', mime: 'image/jpeg' }
  return { ext: fallback, mime: `image/${fallback}` }
}

async function main() {
  const { prisma, r2Upload } = await import('../src/index.js')
  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  for (const { slug, fileTitle } of SWAPS) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, status: true, heroMediaId: true, hero: { select: { source: true } } },
    })
    if (!t) { console.log(`${slug}: NOT FOUND`); continue }

    const info = await fetchFileInfo(fileTitle)
    if (!info) { console.log(`${slug}: NO FILE INFO for ${fileTitle}`); continue }
    const licence = normaliseLicence(info.extmetadata?.LicenseShortName?.value)
    if (!licence) { console.log(`${slug}: LICENCE not allowed: ${info.extmetadata?.LicenseShortName?.value}`); continue }
    if (info.width < 1024) { console.log(`${slug}: TOO SMALL ${info.width}x${info.height}`); continue }

    const dl = await fetch(info.url, {
      headers: {
        'User-Agent': 'Homemade/1.0 (homemade.education; rebecca@homemade.education)',
        Accept: 'image/*,*/*;q=0.8',
      },
    })
    if (!dl.ok) { console.log(`${slug}: download ${dl.status}`); continue }
    const buf = Buffer.from(await dl.arrayBuffer())
    if (!buf.length) { console.log(`${slug}: empty download`); continue }
    const { ext, mime } = extFromMime(dl.headers.get('content-type'), 'jpg')
    const filename = `${t.slug}-hero.${ext}`
    const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/phase-1-hero-pd' })

    const media = await prisma.media.create({
      data: {
        r2Key: key,
        type: 'ILLUSTRATION',
        status: 'READY',
        filename,
        mimeType: mime,
        width: info.width,
        height: info.height,
        bytes: buf.length,
        source: 'wikimedia',
        sourceUrl: info.descriptionurl,
        creatorName: stripHtml(info.extmetadata?.Artist?.value),
        licenceCode: licence.code as any,
        licenceUrl: info.extmetadata?.LicenseUrl?.value ?? null,
        requiresAttribution: licence.requiresAttribution,
      },
    })

    await prisma.$transaction(async (tx) => {
      await tx.tutorialVersion.create({
        data: {
          tutorialId: t.id,
          title: t.title,
          subtitle: t.subtitle,
          excerpt: t.excerpt,
          body: t.body as any,
          status: t.status,
          authorId: author!.id,
          changeNote: `pd-hero-swap: replace ${t.hero?.source ?? 'previous'} hero with Wikimedia (${licence.code}) ${fileTitle}.`,
        },
      })
      await tx.tutorial.update({
        where: { id: t.id },
        data: { heroMediaId: media.id, heroImageStrategy: 'REAL_PHOTO' },
      })
    })
    console.log(`${slug}: OK wikimedia ${licence.code} ${info.width}x${info.height} media=${media.id}`)
    console.log(`  page: ${info.descriptionurl}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
