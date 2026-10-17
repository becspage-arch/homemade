/**
 * CROCHET TAG BACKFILL — the go-live tagging gate for crochet.
 *
 * Cross-stitch's close-out tagged 2,333 untagged public patterns from their
 * shelf and title. This is the same pass for crochet, using the one rule the
 * bulk publisher now born-tags with (`src/crochet-tagging.ts`): the brief's
 * Look and Territory where the row has one (AUTHORED), the home shelf (DERIVED)
 * and the name (BACKFILL).
 *
 * TAGS ONLY. It never edits a pattern, its status, its visibility or its hero,
 * and it never removes a tag: `addContentTags` adds beside what is there, so a
 * hand-set or vision tag survives. It reads `generationMeta.brief` and nothing
 * else of the row's JSON.
 *
 * DRY RUN BY DEFAULT: prints what it would add per pattern and the coverage
 * before and after, and writes nothing. `--apply` writes. Every slug must
 * resolve against the CollectionTag table; one that does not stops the run
 * before any write (the vocabulary needs re-seeding, not inventing).
 *
 * STYLE comes only from a brief's Look. Rows without a brief (the hand-built
 * sign-off and starter rows) get no style tag here; that needs a look at the
 * hero, and the run lists them.
 *
 * After an --apply, refresh search so the tags reach Typesense:
 *   pnpm --filter "@homemade/db" run search:backfill
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/crochet-tag-backfill.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/crochet-tag-backfill.ts --include-private
 *   pnpm --filter "@homemade/db" exec tsx scripts/crochet-tag-backfill.ts --apply
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
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

const APPLY = process.argv.includes('--apply')
const INCLUDE_PRIVATE = process.argv.includes('--include-private')

async function main(): Promise<void> {
  const { prisma, addContentTags, resolveTags } = await import('../src/index.js')
  const { crochetTagSlugs } = await import('../src/crochet-tagging.js')

  const rows = await prisma.crochetPattern.findMany({
    where: {
      ownerUserId: null,
      ...(INCLUDE_PRIVATE ? {} : { visibility: 'PUBLIC' as const }),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      visibility: true,
      generationMeta: true,
      subCategory: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })

  const existing = await prisma.collectionTagAssignment.findMany({
    where: { contentType: 'CROCHET_PATTERN', contentId: { in: rows.map((r) => r.id) } },
    select: { contentId: true, tag: { select: { slug: true } } },
  })
  const has = new Map<string, Set<string>>()
  for (const a of existing) {
    const set = has.get(a.contentId) ?? new Set<string>()
    set.add(a.tag.slug)
    has.set(a.contentId, set)
  }

  interface Plan {
    id: string
    slug: string
    authored: string[]
    derived: string[]
    keyword: string[]
    hasBrief: boolean
  }
  const plans: Plan[] = rows.map((r) => {
    const brief = (r.generationMeta as { brief?: { look?: string; territory?: string; treatment?: string } } | null)?.brief ?? null
    const t = crochetTagSlugs({ name: r.name, shelfSlug: r.subCategory?.slug ?? null, brief })
    const already = has.get(r.id) ?? new Set<string>()
    return {
      id: r.id,
      slug: r.slug ?? r.id,
      authored: t.authored.filter((s) => !already.has(s)),
      derived: t.derived.filter((s) => !already.has(s)),
      keyword: t.keyword.filter((s) => !already.has(s)),
      hasBrief: brief !== null,
    }
  })

  const wanted = [...new Set(plans.flatMap((p) => [...p.authored, ...p.derived, ...p.keyword]))]
  const { unknown } = await resolveTags(wanted)
  if (unknown.length) {
    console.error(`[crochet-tags] STOP: not in the CollectionTag table: ${unknown.join(', ')}. Re-seed the vocabulary; nothing written.`)
    process.exit(1)
  }

  const taggedBefore = rows.filter((r) => (has.get(r.id)?.size ?? 0) > 0).length
  const taggedAfter = rows.filter(
    (r, i) => (has.get(r.id)?.size ?? 0) > 0 || plans[i]!.authored.length + plans[i]!.derived.length + plans[i]!.keyword.length > 0,
  ).length

  console.log(`[crochet-tags] ${APPLY ? 'APPLY' : 'DRY RUN'} over ${rows.length} ${INCLUDE_PRIVATE ? 'house' : 'public house'} crochet patterns`)
  for (const p of plans) {
    const add = [
      ...p.authored.map((s) => `${s} (authored)`),
      ...p.derived.map((s) => `${s} (shelf)`),
      ...p.keyword.map((s) => `${s} (name)`),
    ]
    console.log(`  ${p.slug}: ${add.length ? add.join(', ') : 'nothing to add'}${p.hasBrief ? '' : '  [no brief: style needs a look at the hero]'}`)
  }
  console.log(`[crochet-tags] tagged before ${taggedBefore}/${rows.length}, after ${taggedAfter}/${rows.length}`)
  const untaggedAfter = plans.filter(
    (p, i) => (has.get(rows[i]!.id)?.size ?? 0) === 0 && p.authored.length + p.derived.length + p.keyword.length === 0,
  )
  if (untaggedAfter.length) {
    console.log(`[crochet-tags] still untagged after this pass (needs a look): ${untaggedAfter.map((p) => p.slug).join(', ')}`)
  }

  if (!APPLY) {
    console.log('[crochet-tags] dry run: nothing written. Re-run with --apply, then search:backfill.')
    await prisma.$disconnect()
    return
  }

  let writes = 0
  for (const p of plans) {
    const ref = { type: 'CROCHET_PATTERN' as const, id: p.id }
    if (p.authored.length) writes += (await addContentTags(ref, p.authored, 'AUTHORED')).applied.length
    if (p.derived.length) writes += (await addContentTags(ref, p.derived, 'DERIVED')).applied.length
    if (p.keyword.length) writes += (await addContentTags(ref, p.keyword, 'BACKFILL')).applied.length
  }
  console.log(`[crochet-tags] wrote ${writes} assignments. Now run: pnpm --filter "@homemade/db" run search:backfill`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[crochet-tags] failed', err)
  process.exit(1)
})
