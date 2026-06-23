/**
 * Pilot commit: for each vision-verified Flux Pro hero, upload to R2,
 * create a VERIFIED Media row, and swap it in as the tutorial's hero
 * (snapshotting a TutorialVersion first). Old Media rows are left as-is.
 * Idempotent: skips tutorials whose hero is already source='flux-pro'.
 *
 * Flags: --dry-run
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}

import { prisma, r2Upload } from '../src'
import type { Prisma } from '@prisma/client'

const ROOT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-pilot'
const GEN = `${ROOT}/gen`

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const results: any[] = JSON.parse(readFileSync(resolve(ROOT, 'gen-results.json'), 'utf8'))
  const good = results.filter((r) => r.genFile && !r.error)

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' }, select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  let committed = 0, skipped = 0, failed = 0
  for (const r of good) {
    const t = await prisma.tutorial.findUnique({
      where: { id: r.tutorialId },
      select: {
        id: true, slug: true, title: true, subtitle: true, excerpt: true,
        body: true, status: true,
        hero: { select: { source: true } },
      },
    })
    if (!t) { failed++; console.log(`MISS ${r.slug} (tutorial gone)`); continue }
    if (t.hero?.source === 'flux-pro') { skipped++; console.log(`skip ${r.slug} (already flux-pro)`); continue }

    if (dryRun) { committed++; console.log(`DRY  ${r.slug}`); continue }

    try {
      const buf = readFileSync(resolve(GEN, r.genFile))
      const filename = `${t.slug}-hero-pro.jpg`
      const { key } = await r2Upload(buf, 'image/jpeg', { filename, prefix: 'tutorials/pro-regen' })

      const media = await prisma.media.create({
        data: {
          r2Key: key, type: 'PHOTO', status: 'READY', filename, mimeType: 'image/jpeg',
          width: r.width ?? null, height: r.height ?? null, bytes: buf.length,
          source: 'flux-pro', sourceUrl: r.falUrl ?? null,
          licenceCode: 'PROPRIETARY', requiresAttribution: false,
          verificationStatus: 'VERIFIED', verifiedAt: new Date(),
          verificationReason: 'flux-pro regen: vision-verified depicts the named dish',
        },
      })

      await prisma.$transaction(async (tx) => {
        await tx.tutorialVersion.create({
          data: {
            tutorialId: t.id, title: t.title, subtitle: t.subtitle, excerpt: t.excerpt,
            body: t.body as Prisma.InputJsonValue, status: t.status, authorId: author.id,
            changeNote: 'photo-accuracy: stock hero → flux-pro AI_GENERATED (vision-verified)',
          },
        })
        await tx.tutorial.update({
          where: { id: t.id },
          data: { heroMediaId: media.id, heroImageStrategy: 'AI_GENERATED', heroQuality: 'EDITORIAL' },
        })
      })
      committed++
      console.log(`OK   ${r.slug}`)
    } catch (e: any) {
      failed++
      console.log(`ERR  ${r.slug}: ${e?.message || e}`)
    }
  }
  console.log(`\nDONE  committed=${committed} skipped=${skipped} failed=${failed} (of ${good.length} verified)`)
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
