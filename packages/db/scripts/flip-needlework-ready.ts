/**
 * phase_needlework_pipeline_setup_001 — needlework pipeline-setup standards.
 *
 * Sets:
 *   Category.needlework.targetTutorialCount    = 4000
 *   Category.needlework.techniqueSlugs[]       = consolidated set from the
 *                                                10 master author prompts
 *   Category.needlework.criticalTechniques[]   = must-know prerequisites
 *   Category.needlework.aliases[]              = search synonyms
 *   Category.needlework.isPublicVisible        = true
 *
 * Does NOT touch pipelineStatus. This script runs on every deploy, so
 * forcing READY here re-armed the autopilot gate each rollout and undid
 * any pause. The gate is now owned by the per-category sign-off flow and
 * the admin Ready/Paused toggle (/admin/system/autopilot). Until needlework
 * clears its sign-off it stays PAUSED; this step only re-asserts the
 * authoring standards (techniques, aliases, targets, sub-cat flags).
 *
 *   SubCategory.autopilotEnabled per discipline:
 *     foundations         = true
 *     surface-embroidery  = true
 *     blackwork           = true
 *     sashiko             = true
 *     candlewicking       = true
 *     hardanger           = true
 *     needlepoint         = true
 *     goldwork            = false (specialist curation)
 *     ribbon-embroidery   = false (specialist curation)
 *     stumpwork           = false (specialist curation)
 *
 * Per the null-sort memory: needlework lands at the back of the
 * autopilot rotation with lastAutopilotRunAt = NULL after the flip.
 * That is correct; the script does NOT backdate.
 *
 * Idempotent. Safe to re-run; values are set absolutely.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-needlework-ready.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-needlework-ready.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

const DRY_RUN = process.argv.includes('--dry-run')

const TARGET_TUTORIAL_COUNT = 4000

// Consolidated from the 10 master author prompts. Every technique slug
// referenced across foundations, surface-embroidery, blackwork, sashiko,
// candlewicking, hardanger, and needlepoint prompts. Specialist stubs
// (goldwork, ribbon-embroidery, stumpwork) contribute nothing yet.
const TECHNIQUE_SLUGS = [
  // Foundations (cross-cutting)
  'threading-a-needle',
  'mounting-fabric-in-hoop',
  'mounting-fabric-on-frame',
  'tying-off-cleanly',
  'starting-thread-away-knot',
  'starting-thread-waste-knot',
  'starting-thread-loop-start',
  'transferring-patterns',
  'choosing-fabric',
  'choosing-thread',
  'reading-a-counted-chart',
  'reading-a-route-diagram',
  'working-in-good-light',
  'looking-after-the-hands',

  // Surface embroidery
  'stem-stitch',
  'back-stitch',
  'split-stitch',
  'chain-stitch',
  'whipped-back-stitch',
  'pekinese-stitch',
  'satin-stitch',
  'padded-satin',
  'long-and-short-stitch',
  'brick-stitch',
  'laid-work',
  'couched-fill',
  'encroaching-satin',
  'bayeux-stitch',
  'french-knot',
  'colonial-knot',
  'bullion-knot',
  'cast-on-stitch',
  'palestrina-knot',
  'woven-picot',
  'fly-stitch',
  'feather-stitch',
  'fishbone-stitch',
  'herringbone-stitch',
  'blanket-stitch',
  'buttonhole-stitch',
  'cretan-stitch',
  'coral-stitch',
  'lazy-daisy',
  'roumanian-stitch',
  'couching',
  'padded-couching',
  'trellis-fill',
  'basket-stitch',
  'prick-and-pounce',
  'water-soluble-transfer',
  'heat-erasable-transfer',
  'light-box-transfer',
  'carbon-paper-transfer',
  'tissue-paper-tear-away',

  // Blackwork
  'holbein-stitch',
  'double-running-stitch',
  'geometric-fill',
  'lattice-fill',
  'sampler-band',

  // Sashiko
  'running-stitch',
  'hitomezashi',
  'moyozashi',
  'kogin',
  'sashiko-loading-rhythm',

  // Candlewicking
  'white-on-white',

  // Hardanger
  'kloster-block',
  'cutting-threads-for-hardanger',
  'woven-bar',
  'wrapped-bar',
  'dove-eye-filling',
  'spider-web-filling',
  'square-filet',
  'eyelet-stitch',
  'four-sided-stitch',
  'pulled-thread-fill',

  // Needlepoint
  'tent-stitch-continental',
  'tent-stitch-basketweave',
  'tent-stitch-half-cross',
  'slanted-gobelin',
  'oblique-slav-stitch',
  'gobelin-stitch',
  'hungarian-stitch',
  'mosaic-stitch',
  'scotch-stitch',
  'cashmere-stitch',
  'jacquard-stitch',
  'bargello',
  'florentine-stitch',
  'rhodes-stitch',
  'smyrna-cross',
  'algerian-eye',
  'ray-stitch',
  'stretching-canvas-on-frame',
  'blocking-finished-canvas',
]

// The must-know prerequisites without which a needlework tutorial
// cannot work. Every entry is also in TECHNIQUE_SLUGS.
const CRITICAL_TECHNIQUES = [
  'threading-a-needle',
  'mounting-fabric-in-hoop',
  'running-stitch',
  'back-stitch',
  'tying-off-cleanly',
  'transferring-patterns',
  'choosing-fabric',
  'choosing-thread',
]

// Search synonyms used by the cross-category sweep. Includes UK / US
// spelling pairs, common informal names, and discipline-overlap
// synonyms. Does NOT include sashiko-cultural-specific aliases that
// would imply cultural authority we do not have.
const ALIASES = [
  // Embroidery generic
  'embroidery',
  'hand embroidery',
  'needlework',
  'fancy work',
  'plain sewing',

  // Stitch synonyms
  'straight stitch',
  'outline stitch',
  'satin work',
  'detached chain stitch',
  'continental stitch',
  'basketweave stitch',
  'tapestry stitch',
  'half cross stitch',
  'colonial knots',
  'french knots',

  // Discipline synonyms
  'whitework',
  'redwork',
  'crewel work',
  'crewel embroidery',
  'canvas work',
  'canvaswork',
  'tapestry',
  'tapestry work',
  'Berlin work',
  'Berlinwork',
  'hardanger embroidery',
  'Norwegian embroidery',
  'cutwork',
  'drawn thread',
  'drawn-thread work',
  'pulled thread',
  'sashiko embroidery',
  'Japanese running stitch',
  'colonial embroidery',
  'colonial knot embroidery',
  'sampler',
  'samplers',

  // Pattern / motif synonyms
  'fill stitch',
  'fill pattern',
  'geometric repeat',
  'tile pattern',
  'border pattern',
  'sampler band',

  // Material synonyms
  'evenweave',
  'even-weave',
  'aida',
  'aida cloth',
  'hardanger fabric',
  'needlepoint canvas',
  'pearl cotton',
  'perle cotton',
  'stranded cotton',
  'embroidery floss',
  'embroidery silk',
  'sashiko thread',
  'sashiko ito',
  'crewel wool',
  'tapestry wool',
  'persian wool',
  'persian yarn',

  // Tool synonyms
  'tapestry needle',
  'embroidery needle',
  'chenille needle',
  'sashiko needle',
  'milliners needle',
  'embroidery hoop',
  'embroidery frame',
  'slate frame',
  'scroll frame',
  'q-snap',
  'magnifier loupe',
  'daylight lamp',
]

const SUB_CAT_FLAGS: Array<{ slug: string; autopilotEnabled: boolean }> = [
  { slug: 'foundations', autopilotEnabled: true },
  { slug: 'surface-embroidery', autopilotEnabled: true },
  { slug: 'blackwork', autopilotEnabled: true },
  { slug: 'sashiko', autopilotEnabled: true },
  { slug: 'candlewicking', autopilotEnabled: true },
  { slug: 'hardanger', autopilotEnabled: true },
  { slug: 'needlepoint', autopilotEnabled: true },
  { slug: 'goldwork', autopilotEnabled: false },
  { slug: 'ribbon-embroidery', autopilotEnabled: false },
  { slug: 'stumpwork', autopilotEnabled: false },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const before = await prisma.category.findUnique({
    where: { slug: 'needlework' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
      isPublicVisible: true,
      lastAutopilotRunAt: true,
    },
  })
  if (!before) {
    throw new Error('needlework Category row not present; run seed-categories.ts first')
  }
  console.log('[flip] category before:', {
    slug: before.slug,
    pipelineStatus: before.pipelineStatus,
    targetTutorialCount: before.targetTutorialCount,
    techniqueSlugsCount: before.techniqueSlugs.length,
    criticalTechniquesCount: before.criticalTechniques.length,
    aliasesCount: before.aliases.length,
    isPublicVisible: before.isPublicVisible,
    lastAutopilotRunAt: before.lastAutopilotRunAt,
  })

  // Sanity: every entry in CRITICAL_TECHNIQUES must appear in
  // TECHNIQUE_SLUGS.
  for (const critical of CRITICAL_TECHNIQUES) {
    if (!TECHNIQUE_SLUGS.includes(critical)) {
      throw new Error(`critical technique '${critical}' missing from TECHNIQUE_SLUGS`)
    }
  }

  if (DRY_RUN) {
    console.log('[flip] would set Category.needlework:')
    console.log('  pipelineStatus           = (left untouched — owned by sign-off + admin toggle)')
    console.log('  targetTutorialCount      = ' + TARGET_TUTORIAL_COUNT)
    console.log('  techniqueSlugs count     = ' + TECHNIQUE_SLUGS.length)
    console.log('  criticalTechniques count = ' + CRITICAL_TECHNIQUES.length)
    console.log('  aliases count            = ' + ALIASES.length)
    console.log('  isPublicVisible          = true')
    console.log('[flip] would set SubCategory.autopilotEnabled per discipline:')
    for (const row of SUB_CAT_FLAGS) {
      console.log(`  ${row.slug.padEnd(20)} = ${row.autopilotEnabled}`)
    }
    console.log('  (dry-run)')
    await prisma.$disconnect()
    return
  }

  const after = await prisma.category.update({
    where: { slug: 'needlework' },
    data: {
      // pipelineStatus intentionally NOT set — see header. The gate is
      // managed by sign-off + the admin Ready/Paused toggle, not forced
      // on every deploy.
      targetTutorialCount: TARGET_TUTORIAL_COUNT,
      techniqueSlugs: TECHNIQUE_SLUGS,
      criticalTechniques: CRITICAL_TECHNIQUES,
      aliases: ALIASES,
      isPublicVisible: true,
    },
    select: {
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
      isPublicVisible: true,
      lastAutopilotRunAt: true,
    },
  })
  console.log('[flip] category after:', {
    slug: after.slug,
    pipelineStatus: after.pipelineStatus,
    targetTutorialCount: after.targetTutorialCount,
    techniqueSlugsCount: after.techniqueSlugs.length,
    criticalTechniquesCount: after.criticalTechniques.length,
    aliasesCount: after.aliases.length,
    isPublicVisible: after.isPublicVisible,
    lastAutopilotRunAt: after.lastAutopilotRunAt,
  })

  console.log('[flip] sub-category autopilotEnabled flags:')
  for (const row of SUB_CAT_FLAGS) {
    const updated = await prisma.subCategory.update({
      where: { categoryId_slug: { categoryId: before.id, slug: row.slug } },
      data: { autopilotEnabled: row.autopilotEnabled },
      select: { slug: true, autopilotEnabled: true, order: true },
    })
    console.log(`  ${updated.slug.padEnd(20)} autopilotEnabled = ${updated.autopilotEnabled}  (order=${updated.order})`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[flip] failed:', err)
  process.exit(1)
})
