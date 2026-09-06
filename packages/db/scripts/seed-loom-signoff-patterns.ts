/**
 * LOOM SIGN-OFF PATTERN ROWS — the six-sample sign-off set (STITCH_ENGINE.md
 * §8e-3) seeded as real `CrochetPattern` rows carrying their executable
 * `loomProgram`, so the bulk path the site actually uses can be run end to end:
 *
 *   this seeder  →  apps/web/scripts/render-patterns-on-publish-batch.ts
 *                →  Fargate base render → Fal hero → fidelity gate
 *                →  R2 → Media row → heroMediaId/loomHeroMediaId + chartData
 *                →  the pattern's library card serves the hero.
 *
 * Every row is written PRIVATE and stays PRIVATE — nothing in the sign-off set
 * goes public before Rebecca's quality-bar lock. No Tutorial rows are created
 * or touched; `sourceTutorialId` is deliberately left null (these are engine
 * proofs, not teaching entries), so the rows are only reachable from the Studio
 * by id/slug until someone deliberately publishes them.
 *
 * Idempotent by slug: re-running updates the same rows in place and never
 * creates a second one. The loom* render fields are NOT written here — they
 * belong to the render step, and clearing them would force a needless re-render.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-loom-signoff-patterns.ts
 */

import { config as loadEnv } from 'dotenv'

loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { PATTERN_PROOFS } from '../../../apps/web/scripts/loom-pattern-proofs'
import { COMPOSITION_PROOFS } from '../../../apps/web/scripts/loom-composition-proofs'
import { writeInstructions, type CrochetProgram, type YarnWeight } from '../../../apps/web/src/lib/loom/crochet/engine/program'
import type { StitchId } from '../../../apps/web/src/lib/loom/crochet/engine/dictionary'
import type { CompositionProgram } from '../../../apps/web/src/lib/loom/crochet/engine/composition'
import {
  compositionRowsStructured,
  compositionPieces,
  compositionNotions,
} from '../../../apps/web/src/lib/loom/crochet/engine/compositionPattern'

import type { Prisma } from '../src'
import { prisma, Visibility, ensureHouseDesigner } from '../src'

/** Slug prefix the batch renderer selects on (`--slug-prefix loom-signoff-`). */
const SLUG_PREFIX = 'loom-signoff-'

/**
 * The loom speaks internal US stitch ids; the catalogue's `craftStitchSlugs`
 * vocabulary (packages/db/scripts/data/stitches.ts) is UK. This is the map, and
 * it is the reason a stored pattern never has to hand-keep its stitch list:
 * the program is the source, the tags are derived.
 */
const STITCH_SLUG_BY_ID: Partial<Record<StitchId, string>> = {
  ch: 'crochet-chain',
  slst: 'crochet-slip-stitch',
  sc: 'crochet-double-uk',
  hdc: 'crochet-half-treble',
  dc: 'crochet-treble',
  tr: 'crochet-double-treble',
  dtr: 'crochet-triple-treble',
  scblo: 'crochet-blo-dc',
  scflo: 'crochet-flo-dc',
  fpdc: 'crochet-fptr',
  bpdc: 'crochet-bptr',
  bobble: 'crochet-bobble',
  picot: 'crochet-picot',
}

/** Program yarn weight → the master `YarnWeight.slug` (British convention). */
const YARN_SLUG_BY_WEIGHT: Record<YarnWeight, string> = {
  lace: 'lace',
  fine: 'fingering',
  sport: 'sport',
  dk: 'dk',
  worsted: 'aran',
  aran: 'aran',
  bulky: 'chunky',
  'super-bulky': 'super-chunky',
}

/** How the finished object is presented in its own hero render. A stored
 *  pattern has no proof-name lookup table to consult, so it carries its own. */
type Staging = 'swatch' | 'flatlay' | 'loop' | 'flatband'

interface SignoffSpec {
  /** Key into PATTERN_PROOFS or COMPOSITION_PROOFS. */
  program: string
  /** Slug suffix — the row's slug is `loom-signoff-<slug>`. */
  slug: string
  name: string
  description: string
  subCategorySlug: string
  staging?: Staging
  shapeCategory: 'AMIGURUMI' | 'MOTIF' | 'ACCESSORY' | 'HOMEWARE' | 'DECOR' | 'WEARABLE_ACCESSORY'
  construction: 'ROW' | 'SEAMED' | 'AMIGURUMI'
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  craftTechniqueTags: string[]
  /** Extra stitch slugs the grid can't tell you about (magic ring, seams). */
  extraStitchSlugs?: string[]
  yardage: number
  estimatedHours: number
  safetyNotes?: string
}

const SPECS: SignoffSpec[] = [
  {
    program: 'simple-coaster',
    slug: 'simple-coaster',
    name: 'Solid double crochet coaster',
    description:
      'A plain one-colour coaster worked flat in rows of double crochet. The first thing to make once you can chain and work a row: no shaping, no colour changes, just an even square of dense fabric.',
    subCategorySlug: 'coaster',
    staging: 'flatlay',
    shapeCategory: 'HOMEWARE',
    construction: 'ROW',
    difficulty: 'BEGINNER',
    craftTechniqueTags: ['working-in-rows', 'turning-chain'],
    extraStitchSlugs: ['crochet-chain'],
    yardage: 25,
    estimatedHours: 1,
  },
  {
    program: 'stripe-dishcloth',
    slug: 'stripe-dishcloth',
    name: 'Two-colour striped dishcloth',
    description:
      'An everyday cotton dishcloth in two colours, changed at the edge every two rows. Alternating bands of double crochet and half treble give it a gentle ridged texture that scrubs.',
    subCategorySlug: 'dishcloth',
    staging: 'flatlay',
    shapeCategory: 'HOMEWARE',
    construction: 'ROW',
    difficulty: 'BEGINNER',
    craftTechniqueTags: ['working-in-rows', 'colour-change', 'stripes'],
    extraStitchSlugs: ['crochet-chain'],
    yardage: 120,
    estimatedHours: 3,
  },
  {
    program: 'flat-texture-panel',
    slug: 'texture-panel',
    name: 'Stitch-sampler texture panel',
    description:
      'A single panel that stacks five stitch families in bands: double crochet, half treble, treble, a back-loop ridge and a front-loop ridge. Make one as a mug rug, or repeat the bands end to end for a scarf.',
    subCategorySlug: 'homewares',
    staging: 'flatlay',
    shapeCategory: 'HOMEWARE',
    construction: 'ROW',
    difficulty: 'INTERMEDIATE',
    craftTechniqueTags: ['working-in-rows', 'texture', 'loop-work'],
    extraStitchSlugs: ['crochet-chain'],
    yardage: 220,
    estimatedHours: 5,
  },
  {
    program: 'post-rib-headband',
    slug: 'post-rib-headband',
    name: 'Post-rib headband',
    description:
      'A stretchy reversible headband in 1x1 post rib. Worked flat as a strip, then the short ends are seamed into a loop so the ribs run right round the circumference.',
    subCategorySlug: 'headband',
    // Staged flat, not standing (STITCH_ENGINE.md §8e-3/§8f, 2026-09-05): at
    // this proof's real settled size the standing `loop` reads as a cuff/
    // basket, not a headband — `flatband` lays the finished, seamed strip on
    // the ground as a product photo instead.
    staging: 'flatband',
    shapeCategory: 'WEARABLE_ACCESSORY',
    construction: 'SEAMED',
    difficulty: 'INTERMEDIATE',
    craftTechniqueTags: ['working-in-rows', 'post-stitches', 'seaming'],
    extraStitchSlugs: ['crochet-chain', 'crochet-whipstitch-join'],
    yardage: 90,
    estimatedHours: 2,
  },
  {
    program: 'cottage-tapestry',
    slug: 'cottage-tapestry',
    name: 'Cottage garden tapestry panel',
    description:
      'A tapestry crochet picture panel: sky and sun, a tree, a cottage with a roof and windows, and a strip of flowering grass. Every stitch is a plain double crochet; the colour changes stitch by stitch and the unused yarns are carried inside the stitches.',
    subCategorySlug: 'wall-hanging',
    staging: 'flatlay',
    shapeCategory: 'DECOR',
    construction: 'ROW',
    difficulty: 'INTERMEDIATE',
    craftTechniqueTags: ['tapestry-crochet', 'colour-change', 'carrying-yarn', 'working-in-rows'],
    extraStitchSlugs: ['crochet-chain'],
    yardage: 300,
    estimatedHours: 8,
  },
  {
    program: 'amigurumi-ball',
    slug: 'amigurumi-ball',
    name: 'Stuffed crochet ball',
    description:
      'A firm stuffed ball worked in a spiral from a magic ring, increasing to the equator and decreasing back. The shape every amigurumi is built from, and the place to learn even tension in the round.',
    subCategorySlug: 'amigurumi',
    shapeCategory: 'AMIGURUMI',
    construction: 'AMIGURUMI',
    difficulty: 'BEGINNER',
    craftTechniqueTags: ['working-in-the-round', 'magic-ring', 'spiral-rounds', 'stuffing'],
    extraStitchSlugs: ['crochet-magic-ring', 'crochet-invisible-decrease'],
    yardage: 60,
    estimatedHours: 2,
    safetyNotes:
      'A stuffed toy for a baby or a child under three should be firmly stuffed and closed with no loose ends. Do not add plastic parts to a toy for that age group.',
  },
  {
    program: 'amigurumi-bear-bigear',
    slug: 'amigurumi-bear',
    name: 'Sitting bear',
    description:
      'A sitting bear worked in spiral rounds and sewn together: a broad body, a round head on a short neck, two ears set on the sides of the crown, arms and legs with contrast paw pads, and a pale muzzle. Safety eyes and a stitched nose finish the face.',
    subCategorySlug: 'amigurumi',
    shapeCategory: 'AMIGURUMI',
    construction: 'AMIGURUMI',
    difficulty: 'INTERMEDIATE',
    craftTechniqueTags: ['working-in-the-round', 'magic-ring', 'spiral-rounds', 'stuffing', 'sewing-up', 'colour-change'],
    extraStitchSlugs: ['crochet-magic-ring', 'crochet-invisible-decrease', 'crochet-whipstitch-join'],
    yardage: 220,
    estimatedHours: 10,
    safetyNotes:
      'Safety eyes are a choking hazard. For a child under three, embroider the eyes and nose in yarn instead and make sure every seam is closed.',
  },
]

function isComposition(p: CrochetProgram | CompositionProgram): p is CompositionProgram {
  return Array.isArray((p as CompositionProgram).parts)
}

function resolveProgram(name: string): CrochetProgram | CompositionProgram {
  const flat = PATTERN_PROOFS[name]
  if (flat) return flat
  const composed = COMPOSITION_PROOFS[name]
  if (composed) return composed
  throw new Error(
    `unknown program '${name}' — flat: ${Object.keys(PATTERN_PROOFS).join(', ')}; ` +
      `compositions: ${Object.keys(COMPOSITION_PROOFS).join(', ')}`,
  )
}

/** Every stitch the program actually works, as catalogue slugs. Derived, so a
 *  pattern's stitch tags can never disagree with the stitches it contains. */
function stitchSlugsFor(program: CrochetProgram | CompositionProgram, extra: string[] = []): string[] {
  const ids = new Set<StitchId>()
  if (isComposition(program)) {
    for (const part of program.parts) ids.add(part.stitch)
  } else {
    if (program.stitch) ids.add(program.stitch)
    for (const row of program.grid ?? []) for (const id of row.stitches) ids.add(id)
  }
  const slugs = new Set<string>(extra)
  for (const id of ids) {
    const slug = STITCH_SLUG_BY_ID[id]
    if (slug) slugs.add(slug)
  }
  return [...slugs].sort()
}

/** "About 20 by 20 cm." from the program's own declared finished size — which
 *  the render's SIZE CONSISTENCY gate has already checked against the settled
 *  geometry, so this claim is measured, not aspirational. */
function finishedSizeText(program: CrochetProgram | CompositionProgram): string | null {
  const size = program.finishedSizeMm
  if (!size) return null
  const cm = (mm: number) => (mm / 10).toFixed(mm % 10 === 0 ? 0 : 1)
  return `About ${cm(size.width)} by ${cm(size.height)} cm.`
}

/** The abbreviations legend, derived from the stitches the program works. */
const ABBREV_BY_SLUG: Record<string, string> = {
  'crochet-chain': 'ch',
  'crochet-slip-stitch': 'sl st',
  'crochet-double-uk': 'dc',
  'crochet-half-treble': 'htr',
  'crochet-treble': 'tr',
  'crochet-double-treble': 'dtr',
  'crochet-triple-treble': 'trtr',
  'crochet-blo-dc': 'blo dc',
  'crochet-flo-dc': 'flo dc',
  'crochet-fptr': 'fptr',
  'crochet-bptr': 'bptr',
  'crochet-bobble': 'bob',
  'crochet-picot': 'picot',
  'crochet-magic-ring': 'MR',
  'crochet-invisible-decrease': 'inv dec',
}

interface StructuredRow {
  section: string
  rowNumber: number
  rowLabel: string
  instruction: string
  stitchCount?: number
}

/** The written face, from the SAME program the geometry compiles from. The
 *  render step rewrites this after every successful render; seeding it means a
 *  freshly-seeded row is already a readable pattern. */
function rowsStructuredFor(program: CrochetProgram | CompositionProgram): StructuredRow[] {
  if (isComposition(program)) return compositionRowsStructured(program) as StructuredRow[]
  return writeInstructions(program).map((line, i) => ({
    section: 'Body',
    rowNumber: i,
    rowLabel: line.split(':')[0] ?? `Line ${i + 1}`,
    instruction: line,
  }))
}

async function main(): Promise<void> {
  const designer = await ensureHouseDesigner()
  console.log(`[seed] house designer ${designer.slug} (${designer.id})`)

  const subCategories = new Map(
    (
      await prisma.subCategory.findMany({
        where: { category: { slug: 'crochet' } },
        select: { id: true, slug: true },
      })
    ).map((s) => [s.slug, s.id]),
  )
  const yarnWeights = new Map(
    (await prisma.yarnWeight.findMany({ select: { id: true, slug: true } })).map((y) => [y.slug, y.id]),
  )
  const hooks = new Map(
    (await prisma.crochetHook.findMany({ select: { id: true, mmSize: true } })).map((h) => [h.mmSize, h.id]),
  )

  let created = 0
  let updated = 0
  for (const spec of SPECS) {
    const slug = `${SLUG_PREFIX}${spec.slug}`
    const program = resolveProgram(spec.program)
    const composed = isComposition(program)

    const subCategoryId = subCategories.get(spec.subCategorySlug)
    if (!subCategoryId) {
      console.warn(`[seed] SKIP ${slug} — no crochet sub-category '${spec.subCategorySlug}'`)
      continue
    }
    const yarnSlug = YARN_SLUG_BY_WEIGHT[program.yarnWeight ?? 'worsted']
    const primaryYarnWeightId = yarnWeights.get(yarnSlug) ?? null
    if (!primaryYarnWeightId) console.warn(`[seed] ${slug} — no YarnWeight '${yarnSlug}', leaving it null`)
    const primaryHookId = program.hookMm != null ? (hooks.get(program.hookMm) ?? null) : null
    if (program.hookMm != null && !primaryHookId) {
      console.warn(`[seed] ${slug} — no CrochetHook at ${program.hookMm} mm, leaving it null`)
    }

    const craftStitchSlugs = stitchSlugsFor(program, spec.extraStitchSlugs)
    const pieces = composed
      ? compositionPieces(program).map((p) => ({
          name: p.label,
          sectionLabel: p.section,
          makeQuantity: p.makeQuantity,
          stuffing: 'firm',
          stitchCountTotal: p.rounds.reduce((a, b) => a + b, 0),
        }))
      : null

    // The stored program carries its own finished-object STAGING: a DB row has
    // no proof-name lookup table, so the render step reads it from here.
    const storedProgram = composed
      ? (program as unknown as Prisma.InputJsonValue)
      : ({ ...(program as CrochetProgram), staging: spec.staging ?? 'swatch' } as unknown as Prisma.InputJsonValue)

    const data = {
      name: spec.name,
      description: spec.description,
      rowsStructured: rowsStructuredFor(program) as unknown as Prisma.InputJsonValue,
      loomProgram: storedProgram,
      format: 'WRITTEN_AND_CHART' as const,
      construction: spec.construction,
      shapeCategory: spec.shapeCategory,
      difficulty: spec.difficulty,
      premium: false,
      terminologyConvention: 'uk',
      gaugeText: program.gaugeText ?? null,
      finishedSizeText: finishedSizeText(program),
      abbreviationsUsed: craftStitchSlugs.map((s) => ABBREV_BY_SLUG[s]).filter((a): a is string => Boolean(a)),
      craftStitchSlugs,
      craftTechniqueTags: spec.craftTechniqueTags,
      notions: composed ? compositionNotions(program) : [],
      safetyNotes: spec.safetyNotes ?? null,
      estimatedHours: spec.estimatedHours,
      yardageBySize: { default: spec.yardage } as unknown as Prisma.InputJsonValue,
      pieceCount: composed ? (pieces?.length ?? 1) : 1,
      pieces: (pieces as unknown as Prisma.InputJsonValue) ?? undefined,
      buildOrder: composed
        ? ((pieces ?? []).map((p) => p.name).concat('Assembly') as unknown as Prisma.InputJsonValue)
        : undefined,
      primaryYarnWeightId,
      primaryHookId,
      subCategoryId,
      designerId: designer.id,
      ownerUserId: null,
      // PRIVATE, and it stays PRIVATE. Nothing in the sign-off set is public
      // before the quality bar is locked.
      visibility: Visibility.PRIVATE,
      publishedAt: null,
    }

    const existing = await prisma.crochetPattern.findUnique({ where: { slug }, select: { id: true } })
    if (existing) {
      await prisma.crochetPattern.update({ where: { slug }, data })
      updated += 1
      console.log(`[seed] UPDATED ${slug}  id=${existing.id}  program=${spec.program}  ${composed ? 'composition' : 'flat'}`)
    } else {
      const row = await prisma.crochetPattern.create({ data: { slug, ...data }, select: { id: true } })
      created += 1
      console.log(`[seed] CREATED ${slug}  id=${row.id}  program=${spec.program}  ${composed ? 'composition' : 'flat'}`)
    }
  }

  console.log(`[seed] done — ${created} created, ${updated} updated, all PRIVATE.`)
  console.log(
    '[seed] next: cd apps/web && npx tsx scripts/render-patterns-on-publish-batch.ts --slug-prefix ' + SLUG_PREFIX,
  )
}

main()
  .catch((err) => {
    console.error('[seed] Unhandled error:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
