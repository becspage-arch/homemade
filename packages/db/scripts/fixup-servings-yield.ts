/**
 * Fix the 51 RECIPE rows where both `servings` and `yieldDescription` are set.
 *
 * Per the audit (docs/content-audit-2026-05-16.md). The voice-check rule
 * `servings-yield` flags rows where both are non-null. The rule is:
 *
 *   - Recipe yields portion counts (Serves 4) → keep `servings`, null out `yieldDescription`.
 *   - Recipe yields discrete items (12 muffins / 1 loaf / 1 jar of jam) → keep
 *     `yieldDescription`, null out `servings`.
 *   - Recipe yields an ingredient for something else (pastry / pasta dough /
 *     starter) → null out both.
 *
 * Per-slug decisions hardcoded below. Snapshots TutorialVersion before update.
 * Writes one summary AuditLog row at the end.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/fixup-servings-yield.ts
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'
import type { Prisma } from '@prisma/client'

type Decision =
  | { kind: 'servings'; reason: string }
  | { kind: 'yield'; reason: string }
  | { kind: 'neither'; reason: string }

const DECISIONS: Record<string, Decision> = {
  // Discrete-item yields — keep yieldDescription, null out servings.
  'air-fryer-falafel': { kind: 'yield', reason: 'falafel balls' },
  'baba-ganoush': { kind: 'yield', reason: 'a bowl/dip — yields a quantity, not portions' },
  'bread-and-butter-pickles': { kind: 'yield', reason: 'preserves — yields jars' },
  'buttermilk-pancakes': { kind: 'yield', reason: 'discrete pancakes' },
  'chilli-jam': { kind: 'yield', reason: 'preserves — yields jars' },
  'chocolate-layer-cake': { kind: 'yield', reason: 'a cake' },
  'classic-brownies': { kind: 'yield', reason: 'discrete brownies cut from a tray' },
  'cornbread': { kind: 'yield', reason: 'a loaf' },
  'cornish-pasty': { kind: 'yield', reason: 'discrete pasties' },
  'cranberry-sauce': { kind: 'yield', reason: 'preserves — yields a jar' },
  'falafel': { kind: 'yield', reason: 'discrete balls' },
  'flapjacks': { kind: 'yield', reason: 'discrete squares cut from a tray' },
  'fruit-scones': { kind: 'yield', reason: 'discrete scones' },
  'gooseberry-jam': { kind: 'yield', reason: 'preserves — yields jars' },
  'granola': { kind: 'yield', reason: 'yields a quantity to keep, not portions' },
  'green-tomato-chutney': { kind: 'yield', reason: 'preserves — yields jars' },
  'guacamole': { kind: 'yield', reason: 'a bowl/dip — yields a quantity' },
  'iced-tea-southern': { kind: 'yield', reason: 'a jug — yields a quantity' },
  'lemon-curd': { kind: 'yield', reason: 'preserves — yields jars' },
  'lemon-drizzle-cake': { kind: 'yield', reason: 'a cake' },
  'lemonade': { kind: 'yield', reason: 'a jug — yields a quantity' },
  'lime-marmalade': { kind: 'yield', reason: 'preserves — yields jars' },
  'margherita-pizza': { kind: 'yield', reason: 'a pizza' },
  'mince-pies': { kind: 'yield', reason: 'discrete pies' },
  'onion-bhaji': { kind: 'yield', reason: 'discrete bhajis' },
  'orange-marmalade': { kind: 'yield', reason: 'preserves — yields jars' },
  'piccalilli': { kind: 'yield', reason: 'preserves — yields jars' },
  'pierogi': { kind: 'yield', reason: 'discrete dumplings' },
  'pierogi-with-potato-and-cheese': { kind: 'yield', reason: 'discrete dumplings' },
  'pissaladiere': { kind: 'yield', reason: 'a tart' },
  'quick-pickled-red-onions': { kind: 'yield', reason: 'a jar' },
  'redcurrant-jelly': { kind: 'yield', reason: 'preserves — yields jars' },
  'sausage-roll': { kind: 'yield', reason: 'discrete rolls' },
  'scottish-shortbread': { kind: 'yield', reason: 'discrete fingers/wedges' },
  'seville-orange-marmalade': { kind: 'yield', reason: 'preserves — yields jars' },
  'strawberry-jam': { kind: 'yield', reason: 'preserves — yields jars' },
  'treacle-tart-classic': { kind: 'yield', reason: 'a tart' },
  'welsh-cakes': { kind: 'yield', reason: 'discrete cakes' },
  'yorkshire-puddings': { kind: 'yield', reason: 'discrete puddings' },

  // Portion-count yields — keep servings, null out yieldDescription.
  'beef-enchiladas': { kind: 'servings', reason: 'a sit-down meal — Serves N' },
  'bubble-and-squeak': { kind: 'servings', reason: 'a sit-down side — Serves N' },
  'buttermilk-fried-chicken': { kind: 'servings', reason: 'a sit-down meal — Serves N' },
  'chicken-fajitas': { kind: 'servings', reason: 'a sit-down meal — Serves N' },
  'croque-monsieur': { kind: 'servings', reason: 'sandwiches eaten as a meal — Serves N' },
  'kibbeh': { kind: 'servings', reason: 'a meal — Serves N' },
  'meatloaf': { kind: 'servings', reason: 'a sit-down meal — Serves N' },
  'new-england-lobster-roll': { kind: 'servings', reason: 'sandwiches eaten as a meal — Serves N' },
  'philly-cheesesteak': { kind: 'servings', reason: 'sandwiches eaten as a meal — Serves N' },
  'risotto-alla-milanese': { kind: 'servings', reason: 'a sit-down meal — Serves N' },
  'tarka-dal': { kind: 'servings', reason: 'a meal — Serves N' },
  'welsh-rarebit': { kind: 'servings', reason: 'a sit-down dish — Serves N' },
}

async function main(): Promise<void> {
  const slugs = Object.keys(DECISIONS).sort()
  console.log(`Decisions encoded for ${slugs.length} slugs.`)

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) {
    throw new Error('Author rebecca@homemade.education not found.')
  }

  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: slugs }, status: 'PUBLISHED' },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      body: true,
      status: true,
      servings: true,
      yieldDescription: true,
    },
  })

  const bySlug = new Map(rows.map((r) => [r.slug, r]))
  const missing = slugs.filter((s) => !bySlug.has(s))
  if (missing.length > 0) {
    console.warn(`WARN: ${missing.length} slugs not found / not published: ${missing.join(', ')}`)
  }

  let updated = 0
  let skipped = 0
  const report: {
    slug: string
    before: { s: number | null; y: string | null }
    after: { s: number | null; y: string | null }
    reason: string
  }[] = []

  for (const slug of slugs) {
    const row = bySlug.get(slug)
    if (!row) {
      skipped += 1
      continue
    }
    const decision = DECISIONS[slug]!
    let nextServings: number | null = row.servings
    let nextYield: string | null = row.yieldDescription

    if (decision.kind === 'servings') {
      nextYield = null
    } else if (decision.kind === 'yield') {
      nextServings = null
    } else {
      nextServings = null
      nextYield = null
    }

    if (nextServings === row.servings && nextYield === row.yieldDescription) {
      skipped += 1
      continue
    }

    await prisma.$transaction(async (tx) => {
      await tx.tutorialVersion.create({
        data: {
          tutorialId: row.id,
          title: row.title,
          subtitle: row.subtitle,
          excerpt: row.excerpt,
          body: row.body as Prisma.InputJsonValue,
          status: row.status,
          authorId: author.id,
          changeNote: `fixup-servings-yield: keep ${decision.kind} (${decision.reason})`,
        },
      })
      await tx.tutorial.update({
        where: { id: row.id },
        data: { servings: nextServings, yieldDescription: nextYield },
      })
    })

    updated += 1
    report.push({
      slug,
      before: { s: row.servings, y: row.yieldDescription },
      after: { s: nextServings, y: nextYield },
      reason: decision.reason,
    })
    console.log(
      `  ${slug}: servings ${row.servings ?? 'null'} -> ${nextServings ?? 'null'}, yield "${row.yieldDescription ?? ''}" -> "${nextYield ?? ''}" (${decision.reason})`,
    )
  }

  await prisma.auditLog.create({
    data: {
      actorId: author.id,
      action: 'tutorial.fixup-servings-yield',
      resource: 'tutorials',
      metadata: {
        runDate: new Date().toISOString().slice(0, 10),
        totalSlugs: slugs.length,
        updated,
        skipped,
        report,
      } as Prisma.InputJsonValue,
    },
  })

  console.log(`\nDONE - updated=${updated}, skipped=${skipped}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
