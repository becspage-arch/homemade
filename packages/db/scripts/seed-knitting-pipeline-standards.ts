/**
 * Knitting pipeline-setup standards (K-4).
 *
 * Populates `Category.knitting` with:
 *   - targetTutorialCount       : 5000 (saturation across 14 sub-cats
 *                                 including the K-5-deferred shapes)
 *   - techniqueSlugs[]          : every technique slug referenced
 *                                 anywhere in knitting — foundations,
 *                                 cast-on / bind-off methods,
 *                                 in-the-round methods, colourwork,
 *                                 lace, cable, brioche / double-knit,
 *                                 specialty.
 *   - criticalTechniques[]      : must-know prerequisites — knit, purl,
 *                                 long-tail cast on, standard bind off,
 *                                 gauge swatch, reading pattern, yarn
 *                                 over, decrease basics.
 *   - aliases[]                 : search synonyms covering UK/US overlaps
 *                                 ("tension" = UK gauge) and yarn-weight
 *                                 aliases ("worsted" = AU "10-ply").
 *
 * Note: `autopilotContentTypesEnabled` stays empty on knitting. The
 * routing fans out by sub-cat (project shape and technique discipline)
 * rather than by content type. Sub-cat-level routing is gated by
 * `SubCategory.autopilotEnabled`. See
 * `flip-knitting-subcat-autopilot.ts`.
 *
 * Idempotent. Re-running overwrites the array fields with the canonical
 * set plus the integer targetTutorialCount.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-knitting-pipeline-standards.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-knitting-pipeline-standards.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
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

const DRY_RUN = process.argv.includes('--dry-run')

// Saturation upper bound across all 14 sub-cats at maturity.
//   Scarves + cowls          : ~500
//   Hats                     : ~500
//   Mitts + gloves           : ~400
//   Shawls + wraps           : ~700
//   Blankets                 : ~400
//   Accessory (other)        : ~400
//   Colourwork (cross-shape) : ~400
//   Lace (cross-shape)       : ~400
//   Cable + Aran             : ~400
//   Brioche + double-knit    : ~300
//   Specialty                : ~200
//   Sweater + cardigan (K-5) : ~600
//   Vest (K-5)               : ~200
//   Sock (K-5)               : ~600
// Sum rounds to 5000.
const TARGET_TUTORIAL_COUNT = 5000

// Every technique slug referenced anywhere in knitting. Sorted
// alphabetically so a diff against a future state reads cleanly.
const TECHNIQUE_SLUGS = [
  'backward-loop-cast-on',
  'binding-off-stretchy',
  'blocking-spray',
  'blocking-steam',
  'blocking-wet',
  'bobble-stitch',
  'brioche-decrease-left',
  'brioche-decrease-right',
  'brioche-increase',
  'brioche-set-up-row',
  'brioche-two-colour',
  'cable-aran-honeycomb',
  'cable-aran-trinity-blackberry',
  'cable-back',
  'cable-front',
  'cable-without-needle',
  'cabling-bavarian-travelling-stitch',
  'centred-double-decrease',
  'centre-out-cast-on',
  'colour-change-jogless',
  'colour-change-stranded',
  'colourwork-dominant-colour',
  'colourwork-float-tension',
  'colourwork-mosaic',
  'colourwork-stranded-fair-isle',
  'colourwork-stranded-intarsia',
  'colourwork-stranded-twined',
  'colourwork-two-handed',
  'crochet-provisional-cast-on',
  'decrease-basics',
  'double-knit-edge-stitch',
  'double-knit-two-layer',
  'dpn-knitting',
  'entrelac',
  'fixed-circular-knitting',
  'gauge-swatch',
  'gauge-swatch-blocked',
  'gauge-swatch-pattern-stitch',
  'german-short-rows',
  'german-twisted-cast-on',
  'i-cord',
  'i-cord-applied-bind-off',
  'italian-tubular-bind-off',
  'italian-tubular-cast-on',
  'japanese-short-rows',
  'jenys-surprisingly-stretchy-bind-off',
  'judys-magic-cast-on',
  'kitchener-graft',
  'knit-2-together',
  'knit-3-together',
  'knit-stitch',
  'knit-vs-purl-distinction',
  'knitted-cast-on',
  'knitted-cast-on-provisional',
  'lifeline',
  'long-tail-cast-on',
  'long-tail-cast-on-provisional',
  'magic-loop',
  'mattress-stitch-seam',
  'mitre-square',
  'mosaic-knitting',
  'nupp-construction',
  'old-norwegian-cast-on',
  'picking-up-stitches',
  'picot-bind-off',
  'purl-stitch',
  'reading-pattern',
  'reading-stitch-chart',
  'reading-stitch-chart-flat-rs-row',
  'reading-stitch-chart-in-the-round',
  'reading-stitch-chart-ws-row',
  'reading-written-pattern',
  'russian-graft-bind-off',
  'sewn-bind-off',
  'sewn-tubular-bind-off',
  'short-circular-knitting',
  'short-row-shaping',
  'slip-slip-knit',
  'standard-bind-off',
  'standard-cast-off',
  'steeking',
  'stocking-stitch',
  'stretchy-bind-off',
  'suspended-bind-off',
  'three-needle-bind-off',
  'thumb-gusset',
  'tubular-bind-off',
  'twined-knitting',
  'two-circulars-knitting',
  'wet-blocking',
  'wrap-and-turn-short-rows',
  'yarn-over',
  'yarn-substitution',
]

// Must-know prerequisites. Every authored tutorial that uses any of
// these must list them in its `criticalTechniques[]`. Subset of
// TECHNIQUE_SLUGS.
const CRITICAL_TECHNIQUES = [
  'knit-stitch',
  'purl-stitch',
  'long-tail-cast-on',
  'standard-bind-off',
  'gauge-swatch',
  'reading-pattern',
  'knit-vs-purl-distinction',
  'yarn-over',
  'decrease-basics',
]

// Search synonyms. Knitting's UK/US confusion is lower than crochet's
// (knit and purl mean the same thing on both sides of the Atlantic)
// but yarn-weight terminology forks widely across regions:
//   UK         US           AU
//   --         --           --
//   4-ply      sport        5-ply
//   DK         worsted-ish  8-ply
//   Aran       worsted      12-ply
//   chunky     bulky        14-ply
//
// "Tension" is UK for "gauge". Knitting-needle sizing also forks (UK
// number, US number, JP number, mm — only mm is reliable).
const ALIASES = [
  '10-ply',
  '12-ply',
  '14-ply',
  '4-ply',
  '5-ply',
  '8-ply',
  'aran',
  'aran weight',
  'backward loop',
  'bind off',
  'binding off',
  'blanket',
  'blanket stitch',
  'blocking',
  'bobble',
  'brioche',
  'brioche stitch',
  'bulky',
  'cable',
  'cable needle',
  'cast off',
  'cast on',
  'casting off',
  'casting on',
  'chunky',
  'circular needle',
  'circular needles',
  'colourwork',
  'colorwork',
  'continental knitting',
  'cowl',
  'dec',
  'decrease',
  'dk',
  'double knit',
  'double knitting',
  'double pointed needle',
  'double pointed needles',
  'doubleknit',
  'dpn',
  'dpns',
  'english knitting',
  'fair isle',
  'fingering',
  'fingering weight',
  'fingerless mitt',
  'fisherman rib',
  'gauge',
  'gauge swatch',
  'german twisted',
  'glove',
  'graft',
  'grafting',
  'hat',
  'inc',
  'increase',
  'intarsia',
  'in the round',
  'judys magic',
  'k1',
  'k2',
  'k2tog',
  'kfb',
  'kitchener',
  'kitchener graft',
  'kitchener stitch',
  'knit',
  'knit stitch',
  'knit together',
  'lace',
  'lace weight',
  'laceweight',
  'left over yarn',
  'lifeline',
  'long tail',
  'long tail cast on',
  'm1',
  'm1l',
  'm1r',
  'magic loop',
  'mitt',
  'mitten',
  'mosaic',
  'nb',
  'needle',
  'needle size',
  'needles',
  'nupp',
  'p1',
  'p2',
  'p2tog',
  'pattern stitch',
  'pfb',
  'picking up stitches',
  'pickup',
  'pm',
  'provisional',
  'provisional cast on',
  'psso',
  'pullover',
  'purl',
  'purl stitch',
  'rib',
  'ribbing',
  'right side',
  'rnd',
  'row counter',
  'rs',
  'scarf',
  'shawl',
  'short row',
  'short rows',
  'sl',
  'sl1',
  'sl1yo',
  'slip',
  'slip slip knit',
  'sm',
  'sock',
  'socks',
  'sport',
  'sport weight',
  'sl st',
  'ssk',
  'standard bind off',
  'standard cast on',
  'stash',
  'steek',
  'steeking',
  'stitch',
  'stitch marker',
  'stitch markers',
  'stitches',
  'stockinette',
  'stocking stitch',
  'super bulky',
  'superwash',
  'sweater',
  'tbl',
  'tension',
  'tension square',
  'thumb',
  'thumb gusset',
  'tog',
  'travelling stitch',
  'treble',
  'tubular',
  'tubular bind off',
  'turn',
  'turning chain',
  'twined',
  'twined knitting',
  'two circulars',
  'v stitch',
  'w&t',
  'wet blocking',
  'wingspan',
  'with cable needle',
  'without cable needle',
  'worsted',
  'worsted weight',
  'wrap',
  'wrap and turn',
  'wrap & turn',
  'wrong side',
  'ws',
  'wyf',
  'wyib',
  'yarn',
  'yarn over',
  'yfwd',
  'yo',
  'yon',
  'yrn',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const before = await prisma.category.findUnique({
    where: { slug: 'knitting' },
    select: {
      id: true,
      slug: true,
      targetTutorialCount: true,
      autopilotContentTypesEnabled: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
    },
  })

  if (!before) {
    console.error(
      '[seed-knitting-pipeline-standards] knitting category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }

  console.log('[seed-knitting-pipeline-standards] before:')
  console.log(`  targetTutorialCount           : ${before.targetTutorialCount}`)
  console.log(
    `  autopilotContentTypesEnabled  : [${before.autopilotContentTypesEnabled.join(', ')}]`,
  )
  console.log(`  techniqueSlugs count          : ${before.techniqueSlugs.length}`)
  console.log(`  criticalTechniques count      : ${before.criticalTechniques.length}`)
  console.log(`  aliases count                 : ${before.aliases.length}`)

  console.log('\n[seed-knitting-pipeline-standards] target:')
  console.log(`  targetTutorialCount           : ${TARGET_TUTORIAL_COUNT}`)
  console.log(`  techniqueSlugs count          : ${TECHNIQUE_SLUGS.length}`)
  console.log(`  criticalTechniques count      : ${CRITICAL_TECHNIQUES.length}`)
  console.log(`  aliases count                 : ${ALIASES.length}`)

  if (DRY_RUN) {
    console.log('\n[seed-knitting-pipeline-standards] dry-run — no writes')
    await prisma.$disconnect()
    return
  }

  await prisma.category.update({
    where: { id: before.id },
    data: {
      targetTutorialCount: TARGET_TUTORIAL_COUNT,
      techniqueSlugs: TECHNIQUE_SLUGS,
      criticalTechniques: CRITICAL_TECHNIQUES,
      aliases: ALIASES,
    },
  })

  console.log('\n[seed-knitting-pipeline-standards] done.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-knitting-pipeline-standards] failed:', err)
  process.exit(1)
})
