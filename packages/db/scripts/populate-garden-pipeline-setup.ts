/**
 * Populate the Category-level pipeline-setup standards for Garden:
 *
 *   techniqueSlugs      — every technique referenced across the 17
 *                         per-sub-cat author prompts, consolidated.
 *   criticalTechniques  — the must-know prerequisites for the category
 *                         (subset of techniqueSlugs).
 *   aliases             — search synonyms used by the cross-category
 *                         sweep (UK / US name swaps, common alternates).
 *
 * `targetTutorialCount = 4000` and `isPublicVisible = false` were set
 * earlier and are not touched here. `pipelineStatus` is not touched
 * either; the READY flip lives in `flip-garden-ready.ts` and runs as a
 * separate auditable step.
 *
 * Idempotent. Safe to re-run; the script overwrites the three array
 * columns each time and reports before / after counts.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/populate-garden-pipeline-setup.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/populate-garden-pipeline-setup.ts --dry-run
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

// ──────────────────────────────────────────────────────────────────────
// Critical techniques — must-know prerequisites for the category.
// Every reader who follows any Garden tutorial needs this baseline.
// Subset of techniqueSlugs[].
// ──────────────────────────────────────────────────────────────────────
const CRITICAL_TECHNIQUES = [
  'reading-a-seed-packet',
  'sowing-depth',
  'spacing-fundamentals',
  'hardening-off-seedlings',
  'watering-deep-infrequent',
  'frost-protection-fleece',
  'pricking-out',
  'soil-testing-pH',
  'crop-rotation',
  'last-frost-date-uk-by-region',
] as const

// ──────────────────────────────────────────────────────────────────────
// Full technique slug set. Consolidated from the 17 per-sub-cat author
// prompts. Sorted alphabetically inside thematic groups to keep
// repeated re-runs deterministic.
// ──────────────────────────────────────────────────────────────────────
const TECHNIQUE_SLUGS = [
  // Sowing + propagation foundations
  'reading-a-seed-packet',
  'sowing-depth',
  'spacing-fundamentals',
  'direct-sowing',
  'module-sowing',
  'broadcast-sowing',
  'station-sowing',
  'fluid-sowing',
  'succession-sowing',
  'succession-sowing-soft-herbs',
  'succession-sowing-monthly-window',
  'chitting-potato',
  'pre-soaking-seed',
  'seed-stratification-cold',
  'seed-stratification-warm',
  'seed-scarification-nick',
  'seed-scarification-soak',
  'hardening-off-seedlings',
  'hardening-off-tender-herbs',
  'hardening-off-timing-by-region',
  'pricking-out',
  'potting-on',
  'damping-off-prevention-fungicide-free',
  'thinning',
  // Cuttings + grafting + layering
  'taking-cuttings-softwood',
  'taking-cuttings-semi-ripe',
  'taking-cuttings-hardwood',
  'taking-cuttings-root',
  'rooting-hormone-use-and-skip',
  'mist-bench-setup',
  'heated-propagator-temperature-by-family',
  'whip-and-tongue-graft',
  't-budding',
  'chip-budding',
  'layering-simple',
  'air-layering-houseplant',
  'serpentine-layering-vine',
  'dividing-perennial-clumps',
  'dividing-perennials',
  // Watering + feeding
  'watering-deep-infrequent',
  'watering-shallow-frequent',
  'bottom-watering',
  'comfrey-tea-making',
  'nettle-tea-making',
  'compost-tea-aerated',
  'compost-tea-non-aerated',
  // Soil + compost
  'soil-testing-pH',
  'soil-testing-nutrients',
  'soil-jar-test-texture',
  'lime-application-rate-calculation',
  'hot-composting-c-n-ratio',
  'hot-composting-turn-cadence',
  'cool-composting-build',
  'compost-turning-three-bin-system',
  'leaf-mould-making',
  'bokashi-ferment-and-bury',
  'worm-bin-build',
  'worm-bin-feeding',
  'worm-bin-harvest',
  'trench-composting',
  'biochar-charging',
  'green-manure',
  'green-manure-dig-in',
  'green-manure-sow-autumn-overwinter',
  'green-manure-sow-spring-quick',
  'succession-cover-cropping',
  // Mulching
  'mulching',
  'mulching-deep',
  'mulching-fruit-bush',
  'mulching-spring',
  'mulching-autumn',
  'woodchip-mulch-nitrogen-tie-up-avoidance',
  'gravel-mulch-mediterranean-bed',
  'living-mulch-clover-understory',
  'winter-mulching-mediterranean-herbs',
  // No-dig + permaculture
  'no-dig-bed-setup',
  'no-dig-ongoing-mulch',
  'sheet-mulching',
  'chop-and-drop',
  'hugelkultur-bed-building',
  'swale-on-contour',
  'forest-garden-canopy-selection',
  'forest-garden-shrub-layer',
  'forest-garden-ground-cover',
  'three-sisters-planting',
  'polyculture-bed-design',
  'perennial-vegetable-establishment',
  'nitrogen-fixer-pairing',
  'comfrey-bocking-14-cuttings',
  // Pruning + training
  'pruning-winter-tree-fruit',
  'pruning-summer-tree-fruit',
  'pruning-window-winter-tree-fruit',
  'pruning-window-spring-mediterranean-herbs',
  'pruning-window-summer-restricted-form',
  'formative-prune-tree-fruit',
  'renovation-prune-old-tree',
  'tip-bearing-vs-spur-bearing',
  'espalier',
  'cordon-training',
  'fan-training',
  'step-over',
  'cane-fruit-tying-in',
  'gooseberry-spurring',
  'blackcurrant-renewal-pruning',
  'strawberry-runner-management',
  'grape-vine-cane-prune',
  'grape-vine-spur-prune',
  'thinning-fruit-set',
  'rose-deadheading-old-vs-new',
  'clematis-group-1-pruning',
  'clematis-group-2-pruning',
  'clematis-group-3-pruning',
  'climber-tying-in',
  // Plant management
  'pinching-out',
  'staking',
  'earthing-up',
  'bolting-prevention',
  'deadheading',
  'mint-containment',
  'lifting-and-storing-dahlia-tuber',
  'overwintering-mediterranean-herbs',
  'overwintering-tender-perennials',
  'forcing-bulbs',
  'naturalising-bulbs',
  'chelsea-chop',
  'bay-as-standard-tree',
  // Pollination
  'pollination-groups',
  'choosing-rootstock',
  'planting-bare-root',
  'staking-young-tree',
  // Pest + disease management
  'pest-id-rule-of-three',
  'ipm-monitoring-yellow-trap',
  'ipm-monitoring-blue-trap',
  'companion-planting-cited-evidence',
  'crop-rotation',
  'crop-rotation-4-bed-system',
  'release-beneficial-on-schedule',
  'nematode-application-soil',
  'physical-barrier-net-mesh-size',
  'fleece-vs-flea-beetle',
  'netting-against-birds',
  'slug-pellet-iron-phosphate-vs-metaldehyde-banned',
  'slug-control-beer-trap',
  'slug-control-wool-pellet',
  'slug-control-nematode-phasmarhabditis',
  'aphid-id-by-host-plant',
  'aphid-control-soft-soap-spray',
  'aphid-control-ladybird-release',
  'vine-weevil-larva-id',
  'vine-weevil-adult-trap',
  'vine-weevil-nematode-treatment',
  'whitefly-encarsia-release',
  'whitefly-yellow-trap',
  'red-spider-mite-phytoseiulus-release',
  'powdery-mildew-prevention-spacing-watering',
  'powdery-mildew-treatment-milk-spray',
  'grey-mould-prevention-airflow',
  'damping-off-prevention',
  'late-blight-prevention-airflow-resistant-variety',
  'rust-management-host-specificity',
  'club-root-prevention-lime-rotation',
  'honey-fungus-id-rhizomorphs',
  'honey-fungus-management-resistant-trees',
  // Frost + season extension
  'last-frost-date-uk-by-region',
  'first-frost-date-uk-by-region',
  'frost-protection-fleece',
  'frost-protection-cloche',
  'frost-pocket-id',
  'microclimate-warm-wall',
  'microclimate-cold-frame',
  'greenhouse-shading-summer',
  'greenhouse-clean-down-autumn',
  // Harvest + seed saving
  'seed-saving-self-pollinated',
  'seed-saving-cross-pollinated',
  'storing-saved-seed-paper-envelope',
  'viability-test-paper-towel',
  'seed-collection-umbellifer',
  // Microgreens + indoor edibles + sprouts
  'sowing-microgreen-tray',
  'microgreen-blackout-stack',
  'microgreen-cutting-with-scissors',
  'microgreen-medium-coir',
  'microgreen-medium-compost',
  'microgreen-medium-hemp-mat',
  'microgreen-grow-light-led',
  'microgreen-flush-and-go-cycle',
  'microgreen-tray-stack-rotation',
  'sprout-jar-rinse-cycle',
  // Hydroponics
  'seedling-start-in-rockwool',
  'seedling-start-in-coco-plug',
  'nutrient-solution-mixing-two-part',
  'ec-measurement',
  'ph-measurement',
  'ph-adjustment',
  'reservoir-top-up',
  'reservoir-flush-and-replace',
  'system-cleaning-between-cycles',
  'nft-channel-flow-rate',
  'dwc-air-stone-sizing',
  'ebb-flow-timer-cycle',
  'dutch-bucket-emitter-flow',
  'kratky-water-level-management',
  'grow-light-distance',
  'grow-light-distance-by-crop',
  'ppfd-target-leafy',
  'ppfd-target-fruiting',
  'co2-supplementation-greenhouse',
  'pythium-prevention-hydroponic',
  // Mushroom growing
  'log-selection-fresh-cut',
  'log-inoculation-drill-and-plug',
  'wax-seal-mushroom-log',
  'straw-pasteurisation',
  'sawdust-supplementation',
  'bag-inoculation-sterile',
  'fruiting-conditions-temperature-humidity',
  'harvest-cut-at-base',
  'mushroom-id-verification',
  'cold-shock-fruiting-trigger',
  'humidity-tent-fruiting-chamber',
  'air-exchange-co2-fruiting',
  'spawn-run-temperature',
  // Foraging
  'rule-of-three-id-confirmation',
  'poisonous-look-alike-comparison',
  'foraging-legal-uk-summary',
  'safe-quantity-rule-of-thirds',
  'foraging-location-safety',
  'wild-garlic-id-vs-lily-of-valley',
  'wild-garlic-id-vs-autumn-crocus',
  'elderflower-id-and-cordial-prep',
  'elderberry-cooking-mandatory',
  'nettle-handling-and-cooking',
  'samphire-rock-vs-marsh-id',
  // Indoor + houseplant
  'houseplant-light-by-window-orientation',
  'houseplant-watering-by-finger-test',
  'houseplant-bottom-watering',
  'houseplant-feed-by-season',
  'houseplant-repotting-cadence',
  'houseplant-quarantine-new-arrival',
  'houseplant-pest-inspection-monthly',
  'succulent-watering-soak-and-dry',
  'orchid-watering-ice-cube-myth-debunk',
  'orchid-light-east-window',
  'african-violet-bottom-water-wick',
  'monstera-aerial-root-management',
  'sansevieria-low-light-tolerance',
  'peace-lily-droop-water-cue',
  'kokedama-moss-ball-make',
  'bottle-garden-closed-ecosystem',
  'led-grow-light-for-indoor-edibles',
  'fungus-gnat-control-yellow-trap-and-dry-out',
  'cuttings-water-root-then-pot',
  'terrarium-closed-vs-open-care',
  // Tools + equipment
  'cleaning-tools-after-use',
  'sharpening-secateurs-with-whetstone',
  'sharpening-spade-with-file',
  'oiling-wood-handle-linseed',
  'lubricating-secateur-pivot',
  'lawnmower-blade-removal-and-sharpen',
  'chainsaw-chain-tension-check',
  'tool-storage-rust-prevention',
  'secateur-bypass-vs-anvil-choice',
  'spade-handle-length-by-user-height',
  'wheelbarrow-load-balance',
  'gloves-by-task',
  'hori-hori-edge-maintenance',
  'pruning-saw-tooth-set',
  'dutch-hoe-shaft-angle',
  'watering-can-rose-coarse-vs-fine',
  'seep-hose-pressure-set',
  'cold-frame-vent-management',
  'shed-organisation-zone-by-task',
  'tool-budget-7-essentials',
  // Lawn + garden-wide seasonal
  'lawn-feed-cycle-spring-autumn',
  'autumn-clear-down-leave-for-wildlife',
  'winter-wash-fruit-trees',
  'greasebanding-fruit-trees-october',
  'bird-feeding-winter',
  'bird-box-clean-spring',
  'pond-clear-down-autumn',
  'pond-care-summer',
]

// Deduplicated, deterministic — handles overlaps from the consolidation
// without me having to chase them out by hand.
const TECHNIQUE_SLUGS_DEDUPED = Array.from(new Set(TECHNIQUE_SLUGS)).sort()
const CRITICAL_TECHNIQUES_SET = Array.from(new Set(CRITICAL_TECHNIQUES)).sort()

// ──────────────────────────────────────────────────────────────────────
// Aliases — search synonyms. UK / US name swaps + common alternates.
// Used by the cross-category sweep so "zucchini" finds courgette guides
// and "eggplant" finds aubergine guides.
// ──────────────────────────────────────────────────────────────────────
const ALIASES = [
  // UK / US vegetable name swaps
  'courgette',
  'zucchini',
  'aubergine',
  'eggplant',
  'swede',
  'rutabaga',
  'beetroot',
  'beet',
  'spring-onion',
  'green-onion',
  'scallion',
  'mangetout',
  'snow-pea',
  'rocket',
  'arugula',
  'coriander',
  'cilantro',
  'broad-bean',
  'fava-bean',
  'french-bean',
  'green-bean',
  'string-bean',
  'runner-bean',
  'pole-bean',
  // Herb + flower name swaps
  'wild-garlic',
  'ramsons',
  'jerusalem-artichoke',
  'sunchoke',
  'spring-greens',
  'collards',
  'lambs-lettuce',
  'corn-salad',
  'mache',
  // Method aliases
  'no-dig',
  'no-till',
  'lasagne-gardening',
  'sheet-mulch',
  'lasagna-gardening',
  // Bed / system aliases
  'raised-bed',
  'raised-garden-bed',
  'allotment',
  'community-garden',
  'kitchen-garden',
  'potager',
  // Tools / equipment aliases
  'secateurs',
  'pruners',
  'hori-hori',
  'soil-knife',
  'japanese-garden-knife',
  // Categories of growing
  'hothouse',
  'glasshouse',
  'greenhouse',
  'polytunnel',
  'hoophouse',
  'high-tunnel',
  // Microgreens + sprouts
  'micro-greens',
  'micros',
  // Compost + fertility
  'compost-bin',
  'compost-heap',
  'compost-pile',
  'worm-bin',
  'wormery',
  'vermicompost',
  'vermiculture',
  // Pest + disease
  'blackfly',
  'greenfly',
  'aphid',
  'aphids',
  'red-spider-mite',
  'two-spotted-mite',
  'whitefly',
  'fungus-gnat',
  'sciarid',
  'codling-moth',
  'cabbage-white',
  'club-root',
  'clubroot',
  'late-blight',
  'phytophthora',
  // Fruit / rootstock
  'm9',
  'm27',
  'mm106',
  'm25',
  'malling-9',
  // Seasonal labels
  'last-frost',
  'first-frost',
  'hardiness-zone',
  'usda-zone',
  'rhs-zone',
  // Foraging
  'foraging',
  'wildcrafting',
  'wild-harvest',
]

const ALIASES_DEDUPED = Array.from(new Set(ALIASES.map((a) => a.toLowerCase()))).sort()

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const before = await prisma.category.findUnique({
    where: { slug: 'garden' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
    },
  })

  if (!before) {
    console.error('[populate] garden category not found. Run seed-categories.ts first.')
    process.exit(2)
  }

  console.log('[populate] garden — before:')
  console.log(`  pipelineStatus       = ${before.pipelineStatus}`)
  console.log(`  targetTutorialCount  = ${before.targetTutorialCount ?? 'null'}`)
  console.log(`  techniqueSlugs       = ${before.techniqueSlugs.length} entries`)
  console.log(`  criticalTechniques   = ${before.criticalTechniques.length} entries`)
  console.log(`  aliases              = ${before.aliases.length} entries`)

  console.log('\n[populate] target:')
  console.log(`  techniqueSlugs       = ${TECHNIQUE_SLUGS_DEDUPED.length} entries`)
  console.log(`  criticalTechniques   = ${CRITICAL_TECHNIQUES_SET.length} entries`)
  console.log(`  aliases              = ${ALIASES_DEDUPED.length} entries`)

  // Verify criticalTechniques is a subset of techniqueSlugs.
  const techSet = new Set(TECHNIQUE_SLUGS_DEDUPED)
  const missing = CRITICAL_TECHNIQUES_SET.filter((t) => !techSet.has(t))
  if (missing.length > 0) {
    console.error(
      `\n[populate] FAIL: criticalTechniques entries missing from techniqueSlugs:\n  ${missing.join(', ')}`,
    )
    process.exit(3)
  }

  if (DRY_RUN) {
    console.log('\n[populate] dry-run — no changes written.')
    await prisma.$disconnect()
    return
  }

  const after = await prisma.category.update({
    where: { id: before.id },
    data: {
      techniqueSlugs: TECHNIQUE_SLUGS_DEDUPED,
      criticalTechniques: CRITICAL_TECHNIQUES_SET,
      aliases: ALIASES_DEDUPED,
    },
    select: {
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
    },
  })

  console.log('\n[populate] garden — after:')
  console.log(`  techniqueSlugs       = ${after.techniqueSlugs.length} entries`)
  console.log(`  criticalTechniques   = ${after.criticalTechniques.length} entries`)
  console.log(`  aliases              = ${after.aliases.length} entries`)
  console.log('[populate] OK')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[populate] failed:', err)
  process.exit(1)
})
