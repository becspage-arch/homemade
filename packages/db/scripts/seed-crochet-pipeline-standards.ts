/**
 * Crochet pipeline-setup standards (Worker X1).
 *
 * Populates `Category.crochet` with:
 *   - targetTutorialCount       : 2500 (honest upper bound across all
 *                                 six content types at maturity)
 *   - autopilotContentTypesEnabled : ['TECHNIQUE','STITCH','MOTIF','HOMEWARE']
 *                                  GARMENT + AMIGURUMI wait for Worker X2.
 *   - techniqueSlugs[]          : every technique slug referenced
 *                                 anywhere in crochet — Foundations,
 *                                 Stitches, Motifs, plus the slugs the
 *                                 new author prompts surface.
 *   - criticalTechniques[]      : the must-know prerequisites — chain,
 *                                 slip stitch, dc, htr, tr, magic ring,
 *                                 reading patterns, gauge swatching.
 *   - aliases[]                 : alternative names + search synonyms
 *                                 (UK/US conflicts documented inline).
 *
 * Idempotent. Re-running overwrites the four array fields with the
 * canonical set + the integer targetTutorialCount; safe to run as
 * many times as needed.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-pipeline-standards.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-pipeline-standards.ts --dry-run
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

// Content types autopilot is cleared to author for crochet after X1.
// GARMENT + AMIGURUMI append after Worker X2 ships the grading library
// + shape math.
const AUTOPILOT_CONTENT_TYPES = ['TECHNIQUE', 'STITCH', 'MOTIF', 'HOMEWARE']

// Honest upper bound across all six content types at maturity:
//   Foundations + Stitches saturate at ~150-200
//   Motifs at ~1000
//   Homewares at ~400
//   Garments at ~600 (waits on X2)
//   Amigurumi at ~600 (waits on X2)
//   Lacework specialty at ~150 (waits on later worker)
// Sum rounds to 2500.
const TARGET_TUTORIAL_COUNT = 2500

// Every technique slug referenced anywhere in crochet. Consolidated
// from the published Foundations + Stitches + Motifs library
// (237 tutorials at fire time) plus the slugs the new author prompts
// surface. Sorted alphabetically so a diff against a future state
// reads cleanly.
const TECHNIQUE_SLUGS = [
  'crochet-blocking-acrylic',
  'crochet-blocking-cotton',
  'crochet-blocking-spray',
  'crochet-blocking-steam',
  'crochet-blocking-wet',
  'crochet-carrying-yarn',
  'crochet-chain',
  'crochet-chainless-foundation',
  'crochet-chart-reading',
  'crochet-colour-change',
  'crochet-counting-stitches',
  'crochet-counting-turning-chain',
  'crochet-crocheting-in-the-round',
  'crochet-decrease-invisible',
  'crochet-decrease-standard',
  'crochet-double-crochet',
  'crochet-double-treble',
  'crochet-edging-crab-stitch',
  'crochet-edging-picot',
  'crochet-edging-scallop',
  'crochet-edging-single-row',
  'crochet-fastening-off',
  'crochet-fastening-off-invisible',
  'crochet-flo-blo',
  'crochet-foundation-chain',
  'crochet-frogging',
  'crochet-gauge-swatching',
  'crochet-half-treble',
  'crochet-holding-hook',
  'crochet-holding-yarn',
  'crochet-increase-standard',
  'crochet-joining-as-you-go',
  'crochet-joining-mattress-stitch',
  'crochet-joining-single-crochet',
  'crochet-joining-slip-stitch',
  'crochet-joining-whip-stitch',
  'crochet-left-handed-mirror',
  'crochet-magic-ring',
  'crochet-pattern-repeat-notation',
  'crochet-post-stitch-back',
  'crochet-post-stitch-front',
  'crochet-reading-stitch-tops',
  'crochet-reading-written-patterns',
  'crochet-round-gauge',
  'crochet-slip-knot',
  'crochet-slip-stitch',
  'crochet-stitch-marker-use',
  'crochet-surface-crochet',
  'crochet-tension-adjustment',
  'crochet-tension-swatching',
  'crochet-three-needle-equivalent-bind-off',
  'crochet-tinking',
  'crochet-treble',
  'crochet-triple-treble',
  'crochet-turning-chain',
  'crochet-tunisian-foundation',
  'crochet-tunisian-return-pass',
  'crochet-weaving-in-ends',
  'crochet-working-in-spaces',
  'crochet-working-into-back-bump',
  'crochet-working-into-bottom-loop',
  'crochet-working-into-stitch-tops',
  'crochet-yarn-over',
  'crochet-yarn-substitution',
]

// Must-know prerequisites. Every authored tutorial that uses any of
// these must list them in its `criticalTechniques[]`. Subset of
// TECHNIQUE_SLUGS.
const CRITICAL_TECHNIQUES = [
  'crochet-chain',
  'crochet-slip-stitch',
  'crochet-double-crochet',
  'crochet-half-treble',
  'crochet-treble',
  'crochet-magic-ring',
  'crochet-gauge-swatching',
  'crochet-reading-written-patterns',
  'crochet-yarn-over',
  'crochet-counting-stitches',
  'crochet-turning-chain',
  'crochet-fastening-off',
  'crochet-weaving-in-ends',
]

// Alternative names + search synonyms. The UK/US terminology conflict
// is the canonical crochet pain point — the renderer toggles between
// UK and US at view time, but the search layer needs both spellings
// to find the same tutorial.
//
// UK-vs-US mapping (the renderer canonical is UK):
//   UK dc   = US sc  (single crochet)
//   UK htr  = US hdc (half double crochet)
//   UK tr   = US dc  (double crochet)  <- CAUTION — same word, different stitch
//   UK dtr  = US tr  (treble)          <- CAUTION — same word, different stitch
//   UK ttr  = US dtr (double treble)
//
// The aliases below capture the US names so a reader searching
// "single crochet" finds the UK dc tutorial, "half double crochet"
// finds the UK htr tutorial, etc. Where a word means a different
// stitch in each convention (treble), we list both spellings as
// aliases on the canonical tutorial; the body prose names the
// conflict explicitly.
const ALIASES = [
  'aran',
  'bind off',
  'block',
  'blocking',
  'bobble',
  'bobble stitch',
  'cast off',
  'ch',
  'chain',
  'chunky',
  'cluster',
  'crab stitch',
  'crochet hook',
  'crochet thread',
  'crochet wool',
  'dc',
  'dc uk',
  'dc us',
  'decrease',
  'dishcloth',
  'dk',
  'doily',
  'double crochet',
  'double crochet uk',
  'double crochet us',
  'double knit',
  'double knitting',
  'double treble',
  'doubles',
  'doubles uk',
  'dtr',
  'fan stitch',
  'fasten off',
  'fingering',
  'flo',
  'blo',
  'front loop only',
  'back loop only',
  'foundation chain',
  'frog',
  'frogging',
  'fpdc',
  'bpdc',
  'fptr',
  'bptr',
  'gauge',
  'granny',
  'granny square',
  'granny stitch',
  'half double crochet',
  'half treble',
  'hdc',
  'hexagon',
  'hook',
  'htr',
  'invisible decrease',
  'magic circle',
  'magic loop',
  'magic ring',
  'mandala',
  'motif',
  'picot',
  'popcorn',
  'popcorn stitch',
  'post stitch',
  'puff',
  'puff stitch',
  'reverse single crochet',
  'rounds',
  'rows',
  'sc',
  'sc us',
  'shell',
  'shell stitch',
  'single crochet',
  'sl st',
  'slip stitch',
  'sport weight',
  'star stitch',
  'stitch count',
  'stitch marker',
  'stranded crochet',
  'super chunky',
  'tapestry crochet',
  'tapestry needle',
  'tension',
  'tension square',
  'tr',
  'tr uk',
  'tr us',
  'treble',
  'treble uk',
  'treble us',
  'trebles',
  'trebles uk',
  'tunisian',
  'tunisian crochet',
  'turning chain',
  'v stitch',
  'washcloth',
  'weave in ends',
  'wool',
  'worsted',
  'yarn',
  'yarn over',
  'yo',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const before = await prisma.category.findUnique({
    where: { slug: 'crochet' },
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
    console.error('[seed-crochet-pipeline-standards] crochet category not found. Run seed-categories.ts first.')
    process.exit(2)
  }

  console.log('[seed-crochet-pipeline-standards] before:')
  console.log(`  targetTutorialCount           : ${before.targetTutorialCount}`)
  console.log(`  autopilotContentTypesEnabled  : [${before.autopilotContentTypesEnabled.join(', ')}]`)
  console.log(`  techniqueSlugs count          : ${before.techniqueSlugs.length}`)
  console.log(`  criticalTechniques count      : ${before.criticalTechniques.length}`)
  console.log(`  aliases count                 : ${before.aliases.length}`)

  console.log('\n[seed-crochet-pipeline-standards] target:')
  console.log(`  targetTutorialCount           : ${TARGET_TUTORIAL_COUNT}`)
  console.log(`  autopilotContentTypesEnabled  : [${AUTOPILOT_CONTENT_TYPES.join(', ')}]`)
  console.log(`  techniqueSlugs count          : ${TECHNIQUE_SLUGS.length}`)
  console.log(`  criticalTechniques count      : ${CRITICAL_TECHNIQUES.length}`)
  console.log(`  aliases count                 : ${ALIASES.length}`)

  if (DRY_RUN) {
    console.log('\n[seed-crochet-pipeline-standards] dry-run — no writes')
    await prisma.$disconnect()
    return
  }

  await prisma.category.update({
    where: { id: before.id },
    data: {
      targetTutorialCount: TARGET_TUTORIAL_COUNT,
      autopilotContentTypesEnabled: AUTOPILOT_CONTENT_TYPES,
      techniqueSlugs: TECHNIQUE_SLUGS,
      criticalTechniques: CRITICAL_TECHNIQUES,
      aliases: ALIASES,
    },
  })

  console.log('\n[seed-crochet-pipeline-standards] done.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-crochet-pipeline-standards] failed:', err)
  process.exit(1)
})
