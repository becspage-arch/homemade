/**
 * Full run — commit stage. Reads <wave>/manifest.json and <wave>/verify.json
 * (array of {genFile, verdict:"PASS"|"FAIL"}). Commits PASS entries: upload to
 * R2, create VERIFIED flux-pro Media, swap hero in a tx (snapshot version).
 * Idempotent (skips heroes already flux-pro). FAIL entries are reported, not
 * committed. Writes <wave>/failed-ids.json (tutorialIds of FAILs) for retry.
 *
 * Flags: --wave LABEL (required)  --dry-run
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }

import { prisma, r2Upload } from '../src'
import type { Prisma } from '@prisma/client'

const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run'
function arg(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`))
  if (a) return a.slice(name.length + 3)
  const i = process.argv.indexOf(`--${name}`)
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  return undefined
}

async function main() {
  const wave = arg('wave'); if (!wave) throw new Error('--wave required')
  const dryRun = process.argv.includes('--dry-run')
  const base = resolve(RUN, wave)
  const manifest: any[] = JSON.parse(readFileSync(resolve(base, 'manifest.json'), 'utf8'))
  const verify: any[] = JSON.parse(readFileSync(resolve(base, 'verify.json'), 'utf8'))
  const vmap = new Map(verify.map((v) => [v.genFile, (v.verdict || '').toUpperCase()]))

  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })
  if (!author) throw new Error('author not found')

  let committed = 0, skipped = 0, failed = 0, notpass = 0
  const failedIds: string[] = []
  for (const r of manifest) {
    if (!r.genFile || r.error) { failed++; continue }
    const verdict = vmap.get(r.genFile)
    if (verdict !== 'PASS') { notpass++; failedIds.push(r.tutorialId); continue }

    const t = await prisma.tutorial.findUnique({
      where: { id: r.tutorialId },
      select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, status: true, hero: { select: { source: true } } },
    })
    if (!t) { failed++; continue }
    if (t.hero?.source === 'flux-pro') { skipped++; continue }
    if (dryRun) { committed++; continue }
    let done = false
    for (let attempt = 1; attempt <= 4 && !done; attempt++) {
      try {
        const buf = readFileSync(resolve(base, 'gen', r.genFile))
        const filename = `${t.slug}-hero-pro.jpg`
        const { key } = await r2Upload(buf, 'image/jpeg', { filename, prefix: 'tutorials/pro-regen' })
        const media = await prisma.media.create({
          data: {
            r2Key: key, type: 'PHOTO', status: 'READY', filename, mimeType: 'image/jpeg',
            width: r.width ?? null, height: r.height ?? null, bytes: buf.length,
            source: 'flux-pro', sourceUrl: r.falUrl ?? null, licenceCode: 'PROPRIETARY', requiresAttribution: false,
            verificationStatus: 'VERIFIED', verifiedAt: new Date(),
            verificationReason: 'flux-pro regen: vision-verified depicts the named dish',
          },
        })
        await prisma.$transaction(async (tx) => {
          await tx.tutorialVersion.create({
            data: { tutorialId: t.id, title: t.title, subtitle: t.subtitle, excerpt: t.excerpt, body: t.body as Prisma.InputJsonValue, status: t.status, authorId: author.id, changeNote: 'photo-accuracy: stock hero -> flux-pro AI_GENERATED (vision-verified)' },
          })
          await tx.tutorial.update({ where: { id: t.id }, data: { heroMediaId: media.id, heroImageStrategy: 'AI_GENERATED', heroQuality: 'EDITORIAL' } })
        })
        committed++; done = true
      } catch (e: any) {
        const msg = String(e?.message || e)
        const transient = /terminated|ECONNRESET|Closed|timeout|connection|pool/i.test(msg)
        if (transient && attempt < 4) { await prisma.$connect().catch(() => {}); await new Promise((res) => setTimeout(res, 1500 * attempt)); continue }
        failed++; console.log(`ERR ${r.slug}: ${msg}`); done = true
      }
    }
  }
  writeFileSync(resolve(base, 'failed-ids.json'), JSON.stringify(failedIds, null, 2))
  console.log(`[${wave}] committed=${committed} skipped=${skipped} notPass=${notpass} error=${failed}`)
  process.exit(0)
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
