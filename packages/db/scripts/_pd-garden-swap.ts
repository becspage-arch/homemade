/**
 * Attach verified Wikimedia PD/CC heroes to the 2 remaining garden DRAFTs.
 *
 * Picks (each verified against the Wikimedia file description page):
 *   growing-calendula                File:Calendula officinalis 27122014 (3).jpg (CC-BY-SA, 4288x2848)
 *                                    "Yellow Calendula officinalis flower"
 *   growing-rosemary-from-cuttings   File:'Rosmarinus officinalis' Rosemary Capel Manor College Gardens Enfield London England.jpg
 *                                    (CC-BY-SA 4.0, 5472x3648)
 *                                    "Rosmarinus officinalis, Rosemary, at Capel Manor College and Gardens"
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
  { slug: 'growing-calendula', fileTitle: 'File:Calendula officinalis 27122014 (3).jpg' },
  { slug: 'growing-rosemary-from-cuttings', fileTitle: "File:'Rosmarinus officinalis' Rosemary Capel Manor College Gardens Enfield London England.jpg" },
]

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
async function fetchFileInfo(title: string) {
  const u = new URL('https://commons.wikimedia.org/w/api.php')
  u.searchParams.set('action', 'query'); u.searchParams.set('format', 'json'); u.searchParams.set('origin', '*')
  u.searchParams.set('titles', title); u.searchParams.set('prop', 'imageinfo')
  u.searchParams.set('iiprop', 'url|size|extmetadata|mime'); u.searchParams.set('iiurlwidth', '2400')
  const res = await fetch(u.toString(), { headers: { 'User-Agent': 'Homemade/1.0 (homemade.education; rebecca@homemade.education)' } })
  if (!res.ok) return null
  const data: any = await res.json()
  for (const p of Object.values(data.query?.pages ?? {}) as any[]) if (p.imageinfo?.[0]) return p.imageinfo[0]
  return null
}

async function main() {
  const { prisma, r2Upload } = await import('../src/index.js')
  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })
  if (!author) throw new Error('no author')

  for (const { slug, fileTitle } of SWAPS) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, status: true, hero: { select: { source: true } } },
    })
    if (!t) { console.log(`${slug}: NOT FOUND`); continue }
    const info: any = await fetchFileInfo(fileTitle)
    if (!info) { console.log(`${slug}: no file info`); continue }
    const licence = normaliseLicence(info.extmetadata?.LicenseShortName?.value)
    if (!licence) { console.log(`${slug}: licence not allowed`); continue }
    const dl = await fetch(info.url, { headers: { 'User-Agent': 'Homemade/1.0 (homemade.education; rebecca@homemade.education)' } })
    if (!dl.ok) { console.log(`${slug}: download ${dl.status}`); continue }
    const buf = Buffer.from(await dl.arrayBuffer())
    const ct = (dl.headers.get('content-type') ?? 'image/jpeg').split(';')[0]
    const ext = ct === 'image/png' ? 'png' : 'jpg'
    const filename = `${t.slug}-hero.${ext}`
    const { key } = await r2Upload(buf, ct, { filename, prefix: 'tutorials/phase-1-hero-pd' })

    const media = await prisma.media.create({
      data: {
        r2Key: key, type: 'ILLUSTRATION', status: 'READY', filename, mimeType: ct,
        width: info.width, height: info.height, bytes: buf.length,
        source: 'wikimedia', sourceUrl: info.descriptionurl,
        creatorName: stripHtml(info.extmetadata?.Artist?.value),
        licenceCode: licence.code as any,
        licenceUrl: info.extmetadata?.LicenseUrl?.value ?? null,
        requiresAttribution: licence.requiresAttribution,
      },
    })

    await prisma.$transaction(async (tx) => {
      await tx.tutorialVersion.create({
        data: {
          tutorialId: t.id, title: t.title, subtitle: t.subtitle, excerpt: t.excerpt, body: t.body as any, status: t.status,
          authorId: author!.id, changeNote: `pd-hero-swap: attach Wikimedia (${licence.code}) hero ${fileTitle}.`,
        },
      })
      await tx.tutorial.update({ where: { id: t.id }, data: { heroMediaId: media.id, heroImageStrategy: 'REAL_PHOTO' } })
    })
    console.log(`${slug}: OK wikimedia ${licence.code} ${info.width}x${info.height} media=${media.id}`)
    console.log(`  page: ${info.descriptionurl}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
