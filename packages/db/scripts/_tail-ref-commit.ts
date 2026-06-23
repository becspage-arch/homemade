/** Commit the 7 reference ingredient/subject heroes (all vision-verified PASS by Opus).
 *  Reads ref/manifest.json; for each genFile: R2 upload + VERIFIED flux-pro Media + hero swap. */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
import { prisma, r2Upload } from '../src'
import type { Prisma } from '@prisma/client'
const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run'
async function main() {
  const man: any[] = JSON.parse(readFileSync(resolve(RUN, 'ref', 'manifest.json'), 'utf8'))
  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })
  if (!author) throw new Error('author not found')
  let committed = 0, failed = 0
  for (const r of man.filter((x) => x.genFile)) {
    const t = await prisma.tutorial.findUnique({ where: { id: r.tutorialId }, select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, status: true } })
    if (!t) { failed++; continue }
    let ok = false
    for (let a = 1; a <= 4 && !ok; a++) {
      try {
        const buf = readFileSync(resolve(RUN, 'ref', 'gen', r.genFile))
        const filename = `${t.slug}-hero-pro.jpg`
        const { key } = await r2Upload(buf, 'image/jpeg', { filename, prefix: 'tutorials/pro-regen' })
        const media = await prisma.media.create({ data: { r2Key: key, type: 'PHOTO', status: 'READY', filename, mimeType: 'image/jpeg', width: r.width ?? null, height: r.height ?? null, bytes: buf.length, source: 'flux-pro', sourceUrl: r.falUrl ?? null, licenceCode: 'PROPRIETARY', requiresAttribution: false, verificationStatus: 'VERIFIED', verifiedAt: new Date(), verificationReason: 'flux-pro: ingredient/subject image for reference entry, vision-verified' } })
        await prisma.$transaction(async (tx) => {
          await tx.tutorialVersion.create({ data: { tutorialId: t.id, title: t.title, subtitle: t.subtitle, excerpt: t.excerpt, body: t.body as Prisma.InputJsonValue, status: t.status, authorId: author.id, changeNote: 'photo-accuracy: ingredient/subject hero for reference entry (vision-verified)' } })
          await tx.tutorial.update({ where: { id: t.id }, data: { heroMediaId: media.id, heroImageStrategy: 'AI_GENERATED', heroQuality: 'EDITORIAL' } })
        })
        ok = true; committed++
      } catch (e: any) {
        const msg = String(e?.message || e)
        if (/terminated|ECONNRESET|Closed|timeout|connection|pool/i.test(msg) && a < 4) { await prisma.$connect().catch(() => {}); await new Promise((res) => setTimeout(res, 1200 * a)); continue }
        failed++; console.log(`ERR ${t.slug}: ${msg}`); ok = true
      }
    }
  }
  console.log(`tail-ref-commit: committed=${committed} error=${failed}`)
  process.exit(0)
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
