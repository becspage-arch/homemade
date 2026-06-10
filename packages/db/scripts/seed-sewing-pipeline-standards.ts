/**
 * Sewing pipeline-setup standards (S-3 pipeline-setup, 2026-06-10).
 *
 * Populates `Category.sewing` with:
 *   - targetTutorialCount  : 3000 (honest upper bound across all 16
 *                            sub-cats at maturity; freesewing 60+ base
 *                            designs + in-house designs + designer
 *                            onboarding additions)
 *   - techniqueSlugs[]     : every sewing technique referenced anywhere
 *                            in the author prompts (machine + hand,
 *                            seams + hems + edges, closures, pockets,
 *                            interfacing, gathering, pleating, sleeve
 *                            + dart construction, finishing)
 *   - criticalTechniques[] : the must-know prerequisites without which
 *                            a sewing tutorial cannot work
 *   - aliases[]            : search synonyms (UK vs US sewing
 *                            terminology, common shop terms)
 *
 * Never touches:
 *   - pipelineStatus           : stays NOT_READY per the no-phased-
 *                                rollout lock (project_sewing_locked_decisions)
 *   - isPublicVisible          : stays false
 *   - launchOrder              : stays 9
 *   - autopilotContentTypesEnabled : stays empty; sewing routes by
 *                                sub-cat per project_sewing_locked_decisions
 *
 * Idempotent. Re-running overwrites the array fields with the canonical
 * set plus the integer targetTutorialCount.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-pipeline-standards.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-pipeline-standards.ts --dry-run
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

// 3000 across all 16 sub-cats at maturity. freesewing ships 60+ ready
// designs at MIT, in-house designs fill the children's / lingerie /
// quilting / costume gaps the freesewing catalogue does not cover, and
// independent-designer onboarding (S-7 / Worker J) adds the long tail.
// Indie pattern designers publish 20-60 patterns across a career;
// 50 onboarded designers at 50 patterns each is 2500 alone.
const TARGET_TUTORIAL_COUNT = 3000

// Every sewing technique referenced anywhere in the master author
// prompts. Sorted alphabetically so a diff against a future state
// reads cleanly. Slugs follow the existing sewing-prefixed naming
// already used in phase_sewing_pipeline_001 (sewing-french-seam,
// sewing-double-fold-hem). Unprefixed slugs cover techniques that
// belong to sewing without disambiguation (basting, gathering).
const TECHNIQUE_SLUGS = [
  'attaching-binding',
  'attaching-cuff',
  'attaching-waistband',
  'back-stitch-hand',
  'backstitch-anchor',
  'bagged-lining',
  'basting',
  'bias-binding',
  'bias-cutting',
  'blanket-stitch-hand',
  'blind-hem-hand',
  'blind-hem-machine',
  'bound-edge',
  'box-corner',
  'box-pleat',
  'button-loop',
  'button-shank',
  'buttonhole-hand',
  'buttonhole-machine',
  'buttonhole-keyhole',
  'casing-elastic',
  'casing-drawstring',
  'choosing-fabric',
  'choosing-interfacing',
  'choosing-thread',
  'choosing-needle',
  'collar-band-and-stand',
  'collar-flat',
  'collar-shawl',
  'cutting-on-fold',
  'cutting-on-grain',
  'cutting-single-layer',
  'dart-construction',
  'dart-french',
  'darting-curved',
  'dolman-sleeve',
  'double-fold-hem',
  'drawstring-channel',
  'ease-distribution',
  'ease-stitching',
  'edge-stitching',
  'enclosing-seam-allowance',
  'fabric-prep-pre-wash',
  'finishing-seam-allowance',
  'flat-felled-seam',
  'fly-front-button',
  'fly-front-zip',
  'french-seam',
  'gathered-ruffle',
  'gathered-skirt',
  'gathering-machine',
  'godet-insertion',
  'grading-between-sizes',
  'gusset-construction',
  'hand-tacking',
  'hem-hand',
  'hem-machine',
  'hem-rolled',
  'hem-tape',
  'herringbone-stitch-hand',
  'hong-kong-finish',
  'in-seam-pocket',
  'interfacing-fusible',
  'interfacing-sew-in',
  'invisible-zipper-insertion',
  'kangaroo-pocket',
  'lapped-zipper-insertion',
  'lay-with-nap',
  'lining-attached',
  'lining-floating',
  'lining-partial',
  'machine-blind-hem',
  'machine-buttonhole-four-step',
  'machine-buttonhole-one-step',
  'mitered-corner',
  'mock-flat-felled-seam',
  'narrow-hem',
  'notched-collar',
  'overcasting-hand',
  'overlocker-finishing',
  'patch-pocket',
  'pin-tucks',
  'pintuck-foot',
  'pivoting-corners',
  'pleated-skirt',
  'pleating-knife-pleats',
  'pleating-box-pleats',
  'pleating-inverted',
  'pocket-flap',
  'pre-washing',
  'pressing-darts',
  'pressing-seams-open',
  'pressing-seams-to-side',
  'princess-seam',
  'raglan-sleeve',
  'reinforced-seam',
  'rolled-hem',
  'running-stitch-hand',
  'seam-allowance-trimming',
  'seam-pressing',
  'set-in-sleeve',
  'sewing-machine-basics',
  'sewing-machine-tension',
  'sewing-on-button-flat',
  'sewing-on-button-shank',
  'sewing-on-hook-and-eye',
  'sewing-on-snap',
  'shank-button-attachment',
  'shoulder-yoke',
  'slip-stitch-hand',
  'staystitching',
  'stitching-in-the-ditch',
  'straight-grain',
  'straight-stitch-basic',
  'tailored-vent',
  'tension-test',
  'thread-trace',
  'topstitching',
  'transferring-pattern-markings',
  'turning-corners',
  'turning-edges-cleanly',
  'understitching',
  'underlining',
  'walking-foot',
  'waistband-elasticated',
  'waistband-flat',
  'waistband-tailored',
  'welt-pocket',
  'winding-bobbin',
  'zigzag-stitch',
  'zipper-fly',
  'zipper-invisible',
  'zipper-lapped',
  'zipper-foot',
]

// The must-know prerequisites without which a sewing tutorial cannot
// work. Every entry is also in TECHNIQUE_SLUGS.
const CRITICAL_TECHNIQUES = [
  'sewing-machine-basics',
  'straight-stitch-basic',
  'sewing-machine-tension',
  'winding-bobbin',
  'choosing-fabric',
  'choosing-thread',
  'cutting-on-grain',
  'transferring-pattern-markings',
  'basting',
  'finishing-seam-allowance',
]

// Search synonyms. UK / US sewing terminology pairs + common shop
// names + abbreviations sewists routinely type into search. Sorted
// for diff-friendliness.
const ALIASES = [
  // Direction + orientation
  'right side',
  'wrong side',
  'RS',
  'WS',
  'rs to rs',
  'right sides together',
  'wrong sides together',

  // Seam allowance abbreviations
  'seam allowance',
  'SA',
  'seam allowances',
  '1.5 cm seam allowance',

  // Stitch terminology
  'top stitch',
  'topstitch',
  'edgestitch',
  'edge stitch',
  'understitch',
  'understitching',
  'stitch in the ditch',
  'ditch stitching',
  'stay stitch',
  'staystitch',
  'baste',
  'basting',
  'tacking',
  'tack stitch',
  'thread trace',

  // Seam types
  'plain seam',
  'french seam',
  'flat felled seam',
  'flat-felled',
  'mock flat felled',
  'hong kong finish',
  'bound seam',
  'pinked edge',
  'overlock',
  'overlocked',
  'serger',
  'serged',
  'merrow',

  // Hems + edges
  'rolled hem',
  'narrow hem',
  'blind hem',
  'double fold hem',
  'turned hem',
  'hem tape',
  'bias binding',
  'bias tape',
  'bias trim',
  'fold-over elastic',
  'FOE',

  // Closures
  'zip',
  'zipper',
  'invisible zip',
  'concealed zip',
  'lapped zip',
  'separating zip',
  'open ended zip',
  'fly front',
  'fly placket',
  'press stud',
  'snap fastener',
  'snap',
  'popper',
  'hook and eye',
  'hooks and eyes',
  'button',
  'buttonhole',
  'keyhole buttonhole',
  'bound buttonhole',

  // Pockets
  'patch pocket',
  'in-seam pocket',
  'inseam pocket',
  'welt pocket',
  'double welt',
  'single welt',
  'kangaroo pocket',
  'slash pocket',
  'jet pocket',

  // Sleeves + necklines
  'set-in sleeve',
  'set in sleeve',
  'raglan sleeve',
  'dolman sleeve',
  'drop shoulder',
  'kimono sleeve',
  'cap sleeve',
  'puff sleeve',
  'gathered sleeve',
  'crew neck',
  'scoop neck',
  'v-neck',
  'boat neck',
  'square neck',
  'notched collar',
  'shawl collar',
  'mandarin collar',
  'peter pan collar',

  // Bodice + skirt
  'princess seam',
  'princess line',
  'dart',
  'bust dart',
  'waist dart',
  'french dart',
  'fish-eye dart',
  'yoke',
  'shoulder yoke',
  'gathered skirt',
  'pleated skirt',
  'a-line skirt',
  'circle skirt',
  'pencil skirt',
  'box pleat',
  'knife pleat',
  'inverted pleat',

  // Materials
  'fabric',
  'cloth',
  'material',
  'woven',
  'knit',
  'jersey',
  'stretch fabric',
  'four-way stretch',
  'two-way stretch',
  'cotton',
  'calico',
  'muslin',
  'cheesecloth',
  'linen',
  'wool',
  'silk',
  'polyester',
  'viscose',
  'rayon',
  'denim',
  'twill',
  'canvas',
  'drill',
  'poplin',
  'lawn',
  'voile',
  'chiffon',
  'organza',
  'satin',
  'fleece',
  'french terry',
  'ponte',
  'rib knit',
  'interlock',
  'tricot',

  // Notions
  'thread',
  'all-purpose thread',
  'top thread',
  'bobbin thread',
  'gutermann',
  'mettler',
  'interfacing',
  'fusible interfacing',
  'sew-in interfacing',
  'fusing',
  'iron-on interfacing',
  'bondaweb',
  'fusible web',
  'underlining',
  'lining',
  'silesia',
  'pocketing',
  'elastic',
  'woven elastic',
  'braided elastic',
  'knit elastic',
  'drawstring',
  'cord',
  'twill tape',
  'ribbon',
  'piping',

  // Tools + machine
  'sewing machine',
  'overlocker',
  'serger',
  'coverstitch',
  'walking foot',
  'zipper foot',
  'invisible zipper foot',
  'buttonhole foot',
  'rotary cutter',
  'cutting mat',
  'pinking shears',
  'fabric shears',
  'embroidery scissors',
  'pins',
  'wonder clips',
  'tape measure',
  'tailor chalk',
  'tailors chalk',
  'water-soluble pen',
  'heat-erasable pen',
  'tracing wheel',
  'carbon paper',
  'tailor tack',

  // Grading + sizing
  'grading',
  'grade between sizes',
  'pattern grading',
  'size grading',
  'cup grading',
  'bust adjustment',
  'FBA',
  'full bust adjustment',
  'SBA',
  'small bust adjustment',
  'lengthen',
  'shorten',
  'pattern adjustment',
  'pattern alteration',
  'made to measure',
  'custom fit',
  'ease',
  'wearing ease',
  'design ease',
  'negative ease',

  // Body measurements
  'bust',
  'chest',
  'waist',
  'hip',
  'high hip',
  'body height',
  'inseam',
  'outseam',
  'shoulder width',
  'arm length',
  'back waist length',

  // Fit + finish
  'fitted',
  'semi-fitted',
  'loose-fitting',
  'oversized',
  'tailored',
  'unstructured',

  // Process
  'pre-wash',
  'pre-washing',
  'pre-shrink',
  'cut on the fold',
  'cut on the bias',
  'cut single layer',
  'lay with nap',
  'lay without nap',
  'pattern matching',
  'plaid matching',
  'stripe matching',

  // Calibration
  'print at 100%',
  'do not fit to page',
  'A4 tiled',
  'A0',
  'projector pattern',
  'projector grid',
  'paperless pattern',
  'no-trim pattern',
  'layered PDF',
  'tiled PDF',

  // Indie + sewing-blog vocabulary
  'PDF pattern',
  'paper pattern',
  'pattern hack',
  'hack',
  'frankenpattern',
  'mash up',
  'pattern mashup',
  'self-drafted',
  'self drafted',
  'test sew',
  'toile',
  'muslin fitting',

  // Costume + cosplay
  'cosplay',
  'fancy dress',
  'theatrical costume',
  'foam armour',
  'worbla',

  // Specialty
  'leatherwork',
  'leather sewing',
  'upholstery',
  'sailmaking',
  'oilcloth',
  'waterproof seam',
  'taped seam',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const before = await prisma.category.findUnique({
    where: { slug: 'sewing' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      isPublicVisible: true,
      launchOrder: true,
      targetTutorialCount: true,
      autopilotContentTypesEnabled: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
    },
  })
  if (!before) {
    console.error('[seed-sewing-pipeline-standards] sewing category not found. Run seed-categories.ts first.')
    process.exit(2)
  }

  console.log('[seed-sewing-pipeline-standards] before:')
  console.log(`  pipelineStatus               : ${before.pipelineStatus}`)
  console.log(`  isPublicVisible              : ${before.isPublicVisible}`)
  console.log(`  launchOrder                  : ${before.launchOrder}`)
  console.log(`  targetTutorialCount          : ${before.targetTutorialCount}`)
  console.log(`  autopilotContentTypesEnabled : [${before.autopilotContentTypesEnabled.join(', ')}]`)
  console.log(`  techniqueSlugs count         : ${before.techniqueSlugs.length}`)
  console.log(`  criticalTechniques count     : ${before.criticalTechniques.length}`)
  console.log(`  aliases count                : ${before.aliases.length}`)

  // Sanity: every CRITICAL_TECHNIQUES entry must appear in TECHNIQUE_SLUGS.
  for (const critical of CRITICAL_TECHNIQUES) {
    if (!TECHNIQUE_SLUGS.includes(critical)) {
      throw new Error(`critical technique '${critical}' missing from TECHNIQUE_SLUGS`)
    }
  }

  console.log('\n[seed-sewing-pipeline-standards] target:')
  console.log(`  targetTutorialCount          : ${TARGET_TUTORIAL_COUNT}`)
  console.log(`  techniqueSlugs count         : ${TECHNIQUE_SLUGS.length}`)
  console.log(`  criticalTechniques count     : ${CRITICAL_TECHNIQUES.length}`)
  console.log(`  aliases count                : ${ALIASES.length}`)
  console.log(`  pipelineStatus               : UNCHANGED (${before.pipelineStatus})`)
  console.log(`  isPublicVisible              : UNCHANGED (${before.isPublicVisible})`)
  console.log(`  launchOrder                  : UNCHANGED (${before.launchOrder})`)

  if (DRY_RUN) {
    console.log('\n[seed-sewing-pipeline-standards] dry-run, no writes')
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

  const after = await prisma.category.findUnique({
    where: { id: before.id },
    select: {
      pipelineStatus: true,
      isPublicVisible: true,
      launchOrder: true,
      targetTutorialCount: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
    },
  })

  console.log('\n[seed-sewing-pipeline-standards] after:')
  console.log(`  pipelineStatus               : ${after!.pipelineStatus}`)
  console.log(`  isPublicVisible              : ${after!.isPublicVisible}`)
  console.log(`  launchOrder                  : ${after!.launchOrder}`)
  console.log(`  targetTutorialCount          : ${after!.targetTutorialCount}`)
  console.log(`  techniqueSlugs count         : ${after!.techniqueSlugs.length}`)
  console.log(`  criticalTechniques count     : ${after!.criticalTechniques.length}`)
  console.log(`  aliases count                : ${after!.aliases.length}`)
  console.log('\n[seed-sewing-pipeline-standards] done.')

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-sewing-pipeline-standards] failed:', err)
  process.exit(1)
})
