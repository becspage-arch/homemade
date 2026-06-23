/** Commit cross-stitch tutorial heroes per chunk. Reads chunks/NNN/manifest.json + verify.json. */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
import { prisma, r2Upload } from '../src'
import type { Prisma } from '@prisma/client'
const ROOT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-xstitch'
function arg(n: string) { const a = process.argv.find(x => x.startsWith(`--${n}=`)); if (a) return a.slice(n.length + 3); const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined }
async function main() {
  const cn = arg('chunk'); if (cn === undefined) throw new Error('--chunk required')
  const pad = String(Number(cn)).padStart(3, '0')
  const base = resolve(ROOT, 'chunks', pad)
  const manifest: any[] = JSON.parse(readFileSync(resolve(base, 'manifest.json'), 'utf8'))
  const verify: any[] = JSON.parse(readFileSync(resolve(base, 'verify.json'), 'utf8'))
  const vmap = new Map(verify.map((v) => [v.genFile, (v.verdict || '').toUpperCase()]))
  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })
  if (!author) throw new Error('author not found')
  let committed = 0, skipped = 0, notpass = 0, missing = 0, failed = 0
  for (const r of manifest) {
    if (!r.genFile || r.error) { failed++; continue }
    if (vmap.get(r.genFile) !== 'PASS') { notpass++; continue }
    const t = await prisma.tutorial.findUnique({ where: { id: r.tutorialId }, select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, status: true, hero: { select: { source: true } } } })
    if (!t) { missing++; continue }
    if (t.hero?.source === 'flux-pro') { skipped++; continue }
    let ok = false
    for (let a = 1; a <= 4 && !ok; a++) {
      try {
        const buf = readFileSync(resolve(base, 'gen', r.genFile))
        const filename = `${t.slug}-hero-pro.jpg`
        const { key } = await r2Upload(buf, 'image/jpeg', { filename, prefix: 'tutorials/pro-regen' })
        const media = await prisma.media.create({ data: { r2Key: key, type: 'PHOTO', status: 'READY', filename, mimeType: 'image/jpeg', width: r.width ?? null, height: r.height ?? null, bytes: buf.length, source: 'flux-pro', sourceUrl: r.falUrl ?? null, licenceCode: 'PROPRIETARY', requiresAttribution: false, verificationStatus: 'VERIFIED', verifiedAt: new Date(), verificationReason: 'flux-pro: unique cross-stitch tutorial hero, vision-verified' } })
        await prisma.$transaction(async (tx) => {
          await tx.tutorialVersion.create({ data: { tutorialId: t.id, title: t.title, subtitle: t.subtitle, excerpt: t.excerpt, body: t.body as Prisma.InputJsonValue, status: t.status, authorId: author.id, changeNote: 'photo-accuracy: unique cross-stitch tutorial hero (vision-verified)' } })
          await tx.tutorial.update({ where: { id: t.id }, data: { heroMediaId: media.id, heroImageStrategy: 'AI_GENERATED', heroQuality: 'EDITORIAL' } })
        })
        ok = true; committed++
      } catch (e: any) {
        const msg = String(e?.message || e)
        if (/terminated|ECONNRESET|Closed|timeout|connection|pool/i.test(msg) && a < 4) { await prisma.$connect().catch(() => {}); await new Promise((res) => setTimeout(res, 1200 * a)); continue }
        failed++; ok = true
      }
    }
  }
  console.log(`chunk ${pad}: committed=${committed} skipped=${skipped} notPass=${notpass} missing=${missing} error=${failed}`)
  process.exit(0)
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
