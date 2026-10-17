/**
 * CROCHET STARTER ROWS: fix or cull the six June starter patterns.
 *
 * DRY RUN BY DEFAULT. It reads the six rows, prints exactly what it would
 * change on each, and writes nothing. The plan (and every stitch count, with
 * how it was worked out) lives in `src/crochet-starter-plan.ts`.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/crochet-starter-fix.ts
 *       Dry run of the recommended plan: cull all six to PRIVATE.
 *   ... --fix <slug,slug|all>
 *       Use the field fix instead of the cull for those slugs (they stay
 *       PUBLIC). A fix that would still fail the completeness gate, or whose
 *       June text has changed, is refused.
 *   ... --overlay-out <file>
 *       Also write the planned change as an overlay for
 *       `crochet-golive-check.ts --overlay <file>`, which shows the gates the
 *       change would flip without writing anything.
 *   ... --apply
 *       Do it. First writes a JSON backup of every row (and Media row) it will
 *       touch to /mnt/project-files/homemade/crochet-bar/starter-backup/, and
 *       stops if the backup cannot be written. Nothing is ever deleted: a cull
 *       sets visibility PRIVATE and records why in `generationMeta.cull`.
 *
 * Search: a culled row is removed from the crochet search collection, non-fatal
 * (from a cloud sandbox Typesense may be unreachable; `search:backfill`
 * rebuilds from the database, which leaves PRIVATE rows out).
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 8; d++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) {
      loadEnv({ path: c, override: true, quiet: true })
      break
    }
    const p = dirname(dir)
    if (p === dir) break
    dir = p
  }
}

const BACKUP_DIR = '/mnt/project-files/homemade/crochet-bar/starter-backup'
const HOUSE_DESIGNER_SLUG = 'homemade'

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] ?? null : null
}

/** What the go-live check's `--overlay` reads: per slug, a visibility and fields to set. */
export interface GoLiveOverlayEntry {
  visibility?: 'PRIVATE' | 'PUBLIC'
  set?: Record<string, unknown>
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const { prisma, ensureHouseDesigner, removeCrochetPatternFromSearchSafe } = await loadDb()
  const { STARTER_PLANS, planFix } = await import('../src/crochet-starter-plan.js')
  const { checkCrochetPatternCompleteness } = await import('../src/crochet-completeness.js')

  const fixArg = arg('--fix')
  const fixSlugs = new Set(
    fixArg === 'all' ? STARTER_PLANS.map((p) => p.slug) : (fixArg ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  )
  for (const s of fixSlugs) {
    if (!STARTER_PLANS.some((p) => p.slug === s)) throw new Error(`--fix: ${s} is not one of the six starter rows`)
  }

  const live = await prisma.crochetPattern.findMany({
    where: { slug: { in: STARTER_PLANS.map((p) => p.slug) }, ownerUserId: null },
    include: { subCategory: { select: { slug: true } } },
  })
  const bySlug = new Map(live.map((r) => [r.slug, r]))

  // The house designer, read only. --apply goes through ensureHouseDesigner().
  const house = await prisma.designer.findUnique({ where: { slug: HOUSE_DESIGNER_SLUG }, select: { id: true } })
  if (!house) throw new Error('the house designer row is missing; stop and look before going further')

  console.log(`Crochet starter rows: ${apply ? 'APPLYING' : 'DRY RUN (nothing is written)'}\n`)

  type Step =
    | { kind: 'cull'; id: string; slug: string; reason: string; meta: Record<string, unknown> }
    | { kind: 'fix'; id: string; slug: string; fields: Record<string, unknown>; heroAlt?: { mediaId: string; to: string } }
  const steps: Step[] = []
  const overlay: Record<string, GoLiveOverlayEntry> = {}
  const problems: string[] = []

  for (const plan of STARTER_PLANS) {
    const row = bySlug.get(plan.slug)
    console.log(`== ${plan.slug}`)
    if (!row) {
      problems.push(`${plan.slug}: not found`)
      console.log('   NOT FOUND\n')
      continue
    }
    const input = { ...row, subCategorySlug: row.subCategory?.slug ?? null }
    const before = checkCrochetPatternCompleteness(input)
    const hasImage = Boolean(row.loomHeroMediaId || row.heroMediaId || row.thumbnailMediaId)
    console.log(`   ${plan.what}`)
    console.log(`   now: ${row.visibility}, image: ${hasImage ? 'yes' : 'none'}, completeness: ${before.blocked ? `FAIL (${before.rules.join(', ')})` : 'pass'}`)
    console.log(`   engine: ${plan.engine}`)

    const outcome = planFix(input, plan, house.id)
    const choice = fixSlugs.has(plan.slug) ? 'fix' : plan.recommended
    console.log(`   recommended: ${plan.recommended.toUpperCase()}${choice !== plan.recommended ? `, chosen: ${choice.toUpperCase()}` : ''}`)

    // The field fix, always shown, so the choice can be made on what it would be.
    console.log('   field fix (what a fix would write):')
    if (outcome.refusals.length) for (const r of outcome.refusals) console.log(`     REFUSED: ${r}`)
    console.log(`     designerId: null -> house designer (${HOUSE_DESIGNER_SLUG})`)
    console.log(`     estimatedHours: ${String(row.estimatedHours)} -> ${outcome.fields?.estimatedHours ?? '-'} (bulk publisher's rule, 1 h per 400 sts)`)
    console.log(`     notions: ${JSON.stringify(row.notions)} -> ${JSON.stringify(plan.fix.notions)}`)
    for (const e of plan.fix.instructions) {
      console.log(`     ${e.rowLabel}: ends "${e.from.slice(-44)}"`)
      console.log(`       -> ends "${e.to.slice(-44)}"   [${e.derivation}]`)
    }
    console.log(`     + last line: "${plan.fix.finishingLine}"`)
    for (const h of plan.fix.helpNotes ?? []) console.log(`     help note on ${h.rowLabel}: long dash replaced with a full stop`)
    if (plan.fix.gaugeText) console.log(`     gaugeText: "${plan.fix.gaugeText.from}"\n       -> "${plan.fix.gaugeText.to}"   [${plan.fix.gaugeText.why}]`)
    if (plan.fix.dropThumbnail) console.log(`     thumbnailMediaId: ${String(row.thumbnailMediaId)} -> null (Flux image; the Media row is kept)`)
    if (plan.fix.dropRoundPhotos) console.log('     referencePhotoMediaId removed from every round (Flux round photos)')
    if (plan.fix.heroAlt) console.log(`     hero Media alt: "${plan.fix.heroAlt.from}" -> "${plan.fix.heroAlt.to}"`)
    console.log(`     completeness after fix: ${outcome.stillFailing.length ? `still FAIL: ${outcome.stillFailing.join(' ')}` : 'pass'}`)
    for (const u of plan.fix.unfixable) console.log(`     cannot fix "${u.rule}": ${u.why}`)
    const imageAfter = Boolean(row.loomHeroMediaId || row.heroMediaId || (!plan.fix.dropThumbnail && row.thumbnailMediaId))
    console.log(`     image after fix: ${imageAfter ? 'the existing hero, unchanged' : 'none (the go-live image gate stays FAIL)'}`)

    if (choice === 'cull') {
      if (row.visibility === 'PRIVATE') {
        console.log('   CULL: already PRIVATE, nothing to do\n')
        continue
      }
      console.log(`   CULL: visibility PUBLIC -> PRIVATE; generationMeta.cull = { reason, source: "crochet-starter-fix", at }`)
      console.log(`     reason: ${plan.cullReason}\n`)
      const meta = row.generationMeta && typeof row.generationMeta === 'object' && !Array.isArray(row.generationMeta) ? (row.generationMeta as Record<string, unknown>) : {}
      steps.push({ kind: 'cull', id: row.id, slug: plan.slug, reason: plan.cullReason, meta })
      overlay[plan.slug] = { visibility: 'PRIVATE' }
    } else {
      if (!outcome.fields || outcome.stillFailing.length) {
        problems.push(`${plan.slug}: the fix is refused (${[...outcome.refusals, ...outcome.stillFailing].join(' ')})`)
        console.log('   FIX: REFUSED, see above\n')
        continue
      }
      let heroAlt: { mediaId: string; to: string } | undefined
      if (plan.fix.heroAlt && row.heroMediaId) {
        const media = await prisma.media.findUnique({ where: { id: row.heroMediaId }, select: { alt: true } })
        if (media?.alt === plan.fix.heroAlt.from) heroAlt = { mediaId: row.heroMediaId, to: plan.fix.heroAlt.to }
        else if (media?.alt !== plan.fix.heroAlt.to) problems.push(`${plan.slug}: the hero alt text no longer reads as it did in June`)
      }
      console.log('   FIX: write the field fix above; visibility stays PUBLIC\n')
      steps.push({ kind: 'fix', id: row.id, slug: plan.slug, fields: outcome.fields as unknown as Record<string, unknown>, heroAlt })
      const set: Record<string, unknown> = { ...outcome.fields }
      if (plan.fix.dropThumbnail) set.hasImage = Boolean(row.loomHeroMediaId || row.heroMediaId)
      overlay[plan.slug] = { set }
    }
  }

  const overlayOut = arg('--overlay-out')
  if (overlayOut) {
    writeFileSync(overlayOut, JSON.stringify(overlay, null, 2))
    console.log(`Overlay for crochet-golive-check.ts --overlay -> ${overlayOut}`)
  }

  if (problems.length) {
    console.log(`\nSTOPPED: ${problems.length} problem(s):`)
    for (const p of problems) console.log(`  - ${p}`)
    await prisma.$disconnect()
    process.exitCode = 1
    return
  }
  console.log(`Plan: ${steps.filter((s) => s.kind === 'cull').length} cull, ${steps.filter((s) => s.kind === 'fix').length} fix.`)

  if (!apply) {
    console.log('Dry run: nothing written. Add --apply to do it.')
    await prisma.$disconnect()
    return
  }

  // ── Backup first. No backup, no write. ────────────────────────────────────
  const touched = live.filter((r) => steps.some((s) => s.id === r.id))
  const mediaIds = steps.flatMap((s) => (s.kind === 'fix' && s.heroAlt ? [s.heroAlt.mediaId] : []))
  const media = mediaIds.length ? await prisma.media.findMany({ where: { id: { in: mediaIds } } }) : []
  mkdirSync(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = resolve(BACKUP_DIR, `starter-rows-${stamp}.json`)
  writeFileSync(backupFile, JSON.stringify({ at: new Date().toISOString(), steps, crochetPatterns: touched, media }, null, 2))
  console.log(`Backup -> ${backupFile}`)

  const designer = steps.some((s) => s.kind === 'fix') ? await ensureHouseDesigner() : null
  const at = new Date().toISOString()
  for (const s of steps) {
    if (s.kind === 'cull') {
      await prisma.crochetPattern.update({
        where: { id: s.id },
        select: { id: true },
        data: {
          visibility: 'PRIVATE',
          // Merged, so any existing generation record survives the cull.
          generationMeta: { ...s.meta, cull: { reason: s.reason, source: 'crochet-starter-fix', at } } as never,
        },
      })
      await removeCrochetPatternFromSearchSafe(s.id, s.slug)
      console.log(`  culled ${s.slug}`)
    } else {
      const fields = { ...s.fields, designerId: designer?.id ?? s.fields.designerId }
      await prisma.crochetPattern.update({ where: { id: s.id }, select: { id: true }, data: fields as never })
      if (s.heroAlt) await prisma.media.update({ where: { id: s.heroAlt.mediaId }, select: { id: true }, data: { alt: s.heroAlt.to } })
      console.log(`  fixed ${s.slug}`)
    }
  }
  console.log('Done. Re-run crochet-golive-check.ts, then search:backfill.')
  await prisma.$disconnect()
}

async function loadDb() {
  const { prisma, ensureHouseDesigner } = await import('../src/index.js')
  async function removeCrochetPatternFromSearchSafe(id: string, slug: string): Promise<void> {
    try {
      const { removeCrochetPatternFromSearch } = await import('@homemade/search')
      await removeCrochetPatternFromSearch(id)
    } catch (err) {
      console.warn(`  search removal did not run for ${slug} (${err instanceof Error ? err.message : String(err)}); search:backfill leaves PRIVATE rows out`)
    }
  }
  return { prisma, ensureHouseDesigner, removeCrochetPatternFromSearchSafe }
}

main().catch((err) => {
  console.error('[crochet-starter-fix] failed', err)
  process.exit(2)
})
