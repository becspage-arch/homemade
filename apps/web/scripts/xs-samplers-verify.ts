/**
 * xs-samplers-verify — take a published sampler round the personalise path
 * against the live database, and check what comes out the other end.
 *
 * Signing in cannot be driven from a cloud session, so this exercises what the
 * route does rather than the button that calls it: read the published row and
 * its lettering recipe, set somebody else's name into it, write the owned
 * pattern, then read that row back and check the art survived the change and
 * the words did not.
 *
 * The row is deleted again unless `--keep` is passed, so a verification run
 * leaves nothing behind in anybody's account.
 *
 * Run from apps/web:
 *
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-samplers-verify.ts
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-samplers-verify.ts --slug sampler-birth-rose-wreath --keep
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch {
    /* env from the shell */
  }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? '.env.credentials')

import { prisma, parsePatternData, computePatternMetrics, Visibility } from '@homemade/db'
import { isSamplerChartMeta, personaliseSampler } from '@/lib/studio/generation/samplers/chart'
import { SAMPLER_KINDS, cleanSamplerValues, missingRequired } from '@/lib/studio/generation/samplers/kinds'
import { SHELF_SLUG } from '@/lib/studio/generation/samplers/shelf'

const KEEP = process.argv.includes('--keep')

function arg(name: string, fallback = ''): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? (process.argv[i + 1] ?? fallback) : fallback
}

/** The words a made-up maker types in. Deliberately not the catalogue copy. */
const NEW_WORDS: Record<string, Record<string, string>> = {
  birth: { name: 'Elowen Grace', date: '2026-07-19', weight: '3.1 kg', length: '49 cm' },
  wedding: { nameOne: 'Nadia', nameTwo: 'Peter', date: '2027-05-08', place: 'Glasgow' },
  'new-home': { home: 'Kiln Cottage', date: '2026-10-02', names: 'The Bells' },
  'name-and-date': { name: 'Elowen Grace', date: '2026-07-19', line: 'For her first year' },
  anniversary: { nameOne: 'Nadia', nameTwo: 'Peter', date: '1996-05-08', years: 'Thirty years' },
}

async function main(): Promise<void> {
  const slug = arg('slug')
  const row = await prisma.pattern.findFirst({
    where: {
      type: 'CROSS_STITCH',
      ownerUserId: null,
      visibility: Visibility.PUBLIC,
      ...(slug ? { slug } : { subCategory: { slug: SHELF_SLUG } }),
    },
    select: { id: true, name: true, slug: true, data: true, generationMeta: true },
  })
  if (!row) throw new Error('no published sampler found — run xs-samplers-publish.ts --apply first')

  const gen = row.generationMeta as Record<string, unknown> | null
  const meta = gen?.sampler
  assert.ok(isSamplerChartMeta(meta), `${row.slug} carries no lettering recipe`)
  console.log(`sampler: ${row.slug}  (${SAMPLER_KINDS[meta.kind].label})`)

  const before = parsePatternData(row.data)
  const inkSymbols = new Set(meta.blocks.map((b) => b.inkSymbol))
  const artBefore = before.grid.cells.filter((c) => !inkSymbols.has(c.s))
  const wordsBefore = before.grid.cells.filter((c) => inkSymbols.has(c.s))
  console.log(`   published: ${artBefore.length} squares of art, ${wordsBefore.length} of lettering`)
  assert.ok(wordsBefore.length > 0, 'a published sampler has words on it')

  const values = cleanSamplerValues(meta.kind, NEW_WORDS[meta.kind] ?? {})
  assert.deepEqual(missingRequired(meta.kind, values), [], 'the test wording fills every required field')

  const personalised = await personaliseSampler(before, meta, values)
  const metrics = computePatternMetrics(personalised)

  // The owner is whoever runs this: the point is a real row against the real
  // database, not a real sign-in, which a cloud session cannot do.
  const owner = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  })
  if (!owner) throw new Error('no admin user to attribute the verification row to')

  const created = await prisma.pattern.create({
    data: {
      type: 'CROSS_STITCH',
      name: `Verification copy of ${row.name}`,
      data: personalised as unknown as object,
      ownerUserId: owner.id,
      visibility: Visibility.PRIVATE,
      forkedFromId: row.id,
      widthCells: metrics.widthCells,
      heightCells: metrics.heightCells,
      colourCount: metrics.colourCount,
      totalStitches: metrics.totalStitches,
      hasBackstitch: metrics.hasBackstitch,
      hasFrenchKnots: metrics.hasFrenchKnots,
      hasBeads: metrics.hasBeads,
      hasQuarterStitches: metrics.hasQuarterStitches,
      confettiShare: metrics.confettiShare,
      colourChangesPer100: metrics.colourChangesPer100,
      medianRunLength: metrics.medianRunLength,
      stitchability: metrics.stitchability,
      fabricCountSuggested: personalised.fabric.count,
      generationMeta: { sampler: { ...meta, values }, personalisedFrom: row.id } as unknown as object,
    },
    select: { id: true },
  })

  // Read it back the way the Studio would.
  const readBack = await prisma.pattern.findUniqueOrThrow({
    where: { id: created.id },
    select: { id: true, data: true, ownerUserId: true, visibility: true, widthCells: true, heightCells: true },
  })
  const after = parsePatternData(readBack.data)
  const artAfter = after.grid.cells.filter((c) => !inkSymbols.has(c.s))
  const wordsAfter = after.grid.cells.filter((c) => inkSymbols.has(c.s))

  assert.equal(readBack.ownerUserId, owner.id, 'the copy belongs to the maker')
  assert.equal(readBack.visibility, Visibility.PRIVATE, 'and it is not in the catalogue')
  assert.equal(readBack.widthCells, before.grid.width, 'same size as the piece it came from')
  assert.equal(readBack.heightCells, before.grid.height)
  assert.equal(artAfter.length, artBefore.length, 'every square of the art is still there')
  assert.deepEqual(
    artAfter.map((c) => `${c.x},${c.y},${c.s}`).sort(),
    artBefore.map((c) => `${c.x},${c.y},${c.s}`).sort(),
    'and every one of them is where it was',
  )
  assert.ok(wordsAfter.length > 0, 'the new words are on it')
  assert.notEqual(wordsAfter.length, wordsBefore.length, 'and they are different words')

  console.log(`   personal copy ${readBack.id}: ${artAfter.length} squares of art, ${wordsAfter.length} of lettering`)
  console.log(`   owner ${owner.email}, ${readBack.visibility}, ${metrics.colourCount} colours`)

  if (KEEP) {
    console.log(`   kept: /studio/cross-stitch?patternId=${readBack.id}`)
  } else {
    await prisma.pattern.delete({ where: { id: created.id } })
    console.log('   verification row deleted')
  }
  console.log('\npersonalise path verified against the live database.')
}

main()
  .catch((e) => {
    console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
