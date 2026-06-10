/**
 * Backfill techniqueSlugs + criticalTechniques + aliases on the 30
 * S-4 SewingPattern rows authored in the S-4 content batch (2026-06-10).
 *
 * Fields added by migration phase_sewing_technique_slugs_001.
 * Run after that migration has applied.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/backfill-sewing-technique-slugs.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/backfill-sewing-technique-slugs.ts --dry-run
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
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

const DRY_RUN = process.argv.includes('--dry-run')

interface TechniqueData {
  techniqueSlugs: string[]
  criticalTechniques: string[]
  aliases: string[]
}

const DATA: Record<string, TechniqueData> = {
  // ── HOME ──────────────────────────────────────────────────────────────────
  'sewing-pillowcase-housewife-french-seam': {
    techniqueSlugs: ['hem-machine', 'french-seam', 'cutting-on-grain', 'straight-stitch-basic', 'pressing-seams-open'],
    criticalTechniques: ['french-seam', 'cutting-on-grain'],
    aliases: ['pillowcase', 'pillow case', 'housewife pillowcase', 'Oxford pillowcase'],
  },
  'sewing-cushion-cover-envelope-back': {
    techniqueSlugs: ['hem-machine', 'straight-stitch-basic', 'cutting-on-grain', 'pressing-seams-open', 'finishing-seam-allowance'],
    criticalTechniques: ['straight-stitch-basic', 'cutting-on-grain'],
    aliases: ['cushion cover', 'cushion case', 'envelope cushion', 'pillow cover'],
  },
  'sewing-tea-towel-mitred-corners': {
    techniqueSlugs: ['mitered-corner', 'hem-machine', 'cutting-on-grain', 'straight-stitch-basic', 'pressing-seams-open'],
    criticalTechniques: ['mitered-corner', 'cutting-on-grain'],
    aliases: ['tea towel', 'dish towel', 'kitchen towel', 'mitred corner hem'],
  },
  'sewing-kitchen-apron-cross-back': {
    techniqueSlugs: ['hem-machine', 'topstitching', 'straight-stitch-basic', 'cutting-on-grain', 'pressing-seams-open', 'finishing-seam-allowance'],
    criticalTechniques: ['topstitching', 'cutting-on-grain'],
    aliases: ['apron', 'cross back apron', 'cross-back apron', 'bib apron', 'kitchen apron'],
  },
  'sewing-pot-holder-oven-mitt-set': {
    techniqueSlugs: ['quilting-straight-line', 'bias-binding', 'straight-stitch-basic', 'cutting-on-grain', 'finishing-seam-allowance'],
    criticalTechniques: ['quilting-straight-line', 'bias-binding'],
    aliases: ['pot holder', 'oven glove', 'oven mitt', 'heat pad', 'hot pad'],
  },
  'sewing-table-runner-mitred-border': {
    techniqueSlugs: ['mitered-corner', 'hem-machine', 'straight-stitch-basic', 'cutting-on-grain', 'pressing-seams-open', 'topstitching'],
    criticalTechniques: ['mitered-corner', 'cutting-on-grain'],
    aliases: ['table runner', 'table centre', 'tablerunner'],
  },
  'sewing-rod-pocket-curtain-panel': {
    techniqueSlugs: ['casing-rod-pocket', 'hem-machine', 'cutting-on-grain', 'straight-stitch-basic', 'topstitching'],
    criticalTechniques: ['casing-rod-pocket', 'cutting-on-grain'],
    aliases: ['rod pocket curtain', 'slot-top curtain', 'channel top curtain', 'curtain panel'],
  },
  'sewing-eyelet-curtain-heading': {
    techniqueSlugs: ['interfacing-fusible', 'hem-machine', 'cutting-on-grain', 'straight-stitch-basic', 'topstitching'],
    criticalTechniques: ['interfacing-fusible', 'cutting-on-grain'],
    aliases: ['eyelet curtain', 'grommet curtain', 'ring-top curtain', 'eyelet heading'],
  },
  'sewing-throw-blanket-binding': {
    techniqueSlugs: ['bias-binding', 'mitered-corner', 'straight-stitch-basic', 'cutting-on-grain', 'pressing-seams-open'],
    criticalTechniques: ['bias-binding', 'cutting-on-grain'],
    aliases: ['throw blanket', 'lap blanket', 'fleece throw', 'bound blanket'],
  },
  'sewing-drum-lampshade-cover': {
    techniqueSlugs: ['bias-binding', 'interfacing-fusible', 'straight-stitch-basic', 'cutting-on-grain', 'topstitching'],
    criticalTechniques: ['bias-binding', 'interfacing-fusible'],
    aliases: ['lampshade cover', 'lamp shade fabric', 'drum shade', 'lampshade fabric'],
  },

  // ── ACCESSORIES ──────────────────────────────────────────────────────────
  'sewing-knit-headband-twist-front': {
    techniqueSlugs: ['casing-elastic', 'straight-stitch-basic', 'cutting-on-grain', 'turning-edges-cleanly', 'topstitching'],
    criticalTechniques: ['turning-edges-cleanly', 'straight-stitch-basic'],
    aliases: ['headband', 'knot headband', 'twist headband', 'jersey headband', 'knit headband'],
  },
  'sewing-hair-scrunchie': {
    techniqueSlugs: ['casing-elastic', 'straight-stitch-basic', 'cutting-on-grain', 'turning-edges-cleanly'],
    criticalTechniques: ['casing-elastic', 'turning-edges-cleanly'],
    aliases: ['scrunchie', 'hair tie', 'hair scrunchie', 'fabric hair band'],
  },
  'sewing-belt-d-ring-closure': {
    techniqueSlugs: ['interfacing-fusible', 'topstitching', 'straight-stitch-basic', 'cutting-on-grain', 'turning-edges-cleanly'],
    criticalTechniques: ['interfacing-fusible', 'topstitching'],
    aliases: ['belt', 'd-ring belt', 'fabric belt', 'D ring belt', 'adjustable belt'],
  },
  'sewing-mens-tie-standard': {
    techniqueSlugs: ['bias-cutting', 'pressing-seams-open', 'straight-stitch-basic', 'cutting-on-grain', 'topstitching'],
    criticalTechniques: ['bias-cutting', 'pressing-seams-open'],
    aliases: ['tie', 'necktie', 'mens tie', "men's tie", 'business tie', 'silk tie'],
  },
  'sewing-bow-tie-self-tie': {
    techniqueSlugs: ['interfacing-fusible', 'turning-edges-cleanly', 'straight-stitch-basic', 'topstitching', 'pressing-seams-open'],
    criticalTechniques: ['interfacing-fusible', 'turning-edges-cleanly'],
    aliases: ['bow tie', 'self-tie bow tie', 'bowtie', 'self tie bow tie'],
  },
  'sewing-knit-infinity-scarf': {
    techniqueSlugs: ['straight-stitch-basic', 'cutting-on-grain', 'turning-edges-cleanly', 'finishing-seam-allowance'],
    criticalTechniques: ['straight-stitch-basic', 'cutting-on-grain'],
    aliases: ['infinity scarf', 'loop scarf', 'circle scarf', 'jersey scarf', 'knit scarf'],
  },
  'sewing-snood-ribbed-cuffs': {
    techniqueSlugs: ['straight-stitch-basic', 'cutting-on-grain', 'finishing-seam-allowance', 'topstitching'],
    criticalTechniques: ['straight-stitch-basic', 'cutting-on-grain'],
    aliases: ['snood', 'neck warmer', 'cowl', 'tube scarf', 'jersey snood'],
  },
  'sewing-sun-hat-wide-brim': {
    techniqueSlugs: ['interfacing-fusible', 'topstitching', 'straight-stitch-basic', 'pressing-seams-open', 'finishing-seam-allowance', 'cutting-on-grain'],
    criticalTechniques: ['interfacing-fusible', 'topstitching'],
    aliases: ['sun hat', 'wide brim hat', 'summer hat', 'floppy hat', 'bucket hat'],
  },

  // ── BABIES / KIDS ─────────────────────────────────────────────────────────
  'sewing-baby-bib-snap-closure': {
    techniqueSlugs: ['turning-edges-cleanly', 'straight-stitch-basic', 'cutting-on-grain', 'topstitching', 'finishing-seam-allowance'],
    criticalTechniques: ['turning-edges-cleanly', 'topstitching'],
    aliases: ['bib', 'baby bib', 'dribble bib', 'feeding bib', 'snap bib'],
  },
  'sewing-baby-blanket-mitred-binding': {
    techniqueSlugs: ['bias-binding', 'mitered-corner', 'straight-stitch-basic', 'cutting-on-grain', 'pressing-seams-open'],
    criticalTechniques: ['bias-binding', 'mitered-corner'],
    aliases: ['baby blanket', 'receiving blanket', 'pram blanket', 'cot blanket', 'swaddle blanket'],
  },
  'sewing-kids-apron-one-size': {
    techniqueSlugs: ['hem-machine', 'topstitching', 'straight-stitch-basic', 'cutting-on-grain', 'finishing-seam-allowance'],
    criticalTechniques: ['topstitching', 'cutting-on-grain'],
    aliases: ['kids apron', 'childrens apron', "children's apron", 'craft apron', 'cooking apron for kids'],
  },
  'sewing-kids-tshirt-nested-sizes': {
    techniqueSlugs: ['cutting-on-grain', 'straight-stitch-basic', 'finishing-seam-allowance', 'topstitching', 'hem-machine'],
    criticalTechniques: ['cutting-on-grain', 'straight-stitch-basic'],
    aliases: ['kids t-shirt', 'childrens tshirt', "children's t shirt", 'kids tee', 'jersey tshirt', 'graded t-shirt'],
  },

  // ── BAGS ─────────────────────────────────────────────────────────────────
  'sewing-tote-bag-interfaced-handles': {
    techniqueSlugs: ['interfacing-fusible', 'topstitching', 'straight-stitch-basic', 'cutting-on-grain', 'pressing-seams-open', 'finishing-seam-allowance'],
    criticalTechniques: ['interfacing-fusible', 'topstitching'],
    aliases: ['tote bag', 'shopping bag', 'canvas tote', 'shopper bag', 'market bag'],
  },
  'sewing-drawstring-storage-bag': {
    techniqueSlugs: ['casing-drawstring', 'straight-stitch-basic', 'cutting-on-grain', 'finishing-seam-allowance'],
    criticalTechniques: ['casing-drawstring', 'cutting-on-grain'],
    aliases: ['drawstring bag', 'storage bag', 'produce bag', 'gift bag', 'laundry bag'],
  },
  'sewing-pencil-case-zip': {
    techniqueSlugs: ['zipper-foot', 'box-corner', 'interfacing-fusible', 'straight-stitch-basic', 'topstitching', 'cutting-on-grain'],
    criticalTechniques: ['zipper-foot', 'box-corner'],
    aliases: ['pencil case', 'pencil pouch', 'zip pouch', 'zipped pencil case', 'stationery case'],
  },
  'sewing-project-bag-drawstring-handle': {
    techniqueSlugs: ['casing-drawstring', 'topstitching', 'straight-stitch-basic', 'cutting-on-grain', 'finishing-seam-allowance'],
    criticalTechniques: ['casing-drawstring', 'topstitching'],
    aliases: ['project bag', 'knitting bag', 'craft bag', 'yarn bag', 'WIP bag'],
  },
  'sewing-simple-backpack-drawstring': {
    techniqueSlugs: ['casing-drawstring', 'box-corner', 'topstitching', 'straight-stitch-basic', 'cutting-on-grain', 'finishing-seam-allowance'],
    criticalTechniques: ['casing-drawstring', 'topstitching'],
    aliases: ['backpack', 'rucksack', 'drawstring backpack', 'gym bag', 'school bag'],
  },
  'sewing-bucket-bag-magnetic-closure': {
    techniqueSlugs: ['interfacing-fusible', 'topstitching', 'straight-stitch-basic', 'cutting-on-grain', 'pressing-seams-open', 'finishing-seam-allowance'],
    criticalTechniques: ['interfacing-fusible', 'topstitching'],
    aliases: ['bucket bag', 'barrel bag', 'bucket handbag', 'cylindrical bag', 'tub bag'],
  },
  'sewing-makeup-pouch-boxed-corners': {
    techniqueSlugs: ['zipper-foot', 'box-corner', 'interfacing-fusible', 'straight-stitch-basic', 'topstitching', 'cutting-on-grain'],
    criticalTechniques: ['zipper-foot', 'box-corner'],
    aliases: ['makeup pouch', 'cosmetic bag', 'wash bag', 'toiletry pouch', 'zip cosmetics bag'],
  },
  'sewing-sling-bag-adjustable-strap': {
    techniqueSlugs: ['zipper-foot', 'interfacing-fusible', 'topstitching', 'straight-stitch-basic', 'cutting-on-grain', 'pressing-seams-open', 'finishing-seam-allowance'],
    criticalTechniques: ['zipper-foot', 'interfacing-fusible'],
    aliases: ['sling bag', 'crossbody bag', 'cross body bag', 'shoulder bag', 'messenger bag'],
  },
}

async function main() {
  const { prisma } = await import('../src/index.js')

  let updated = 0
  let missing = 0

  for (const [slug, data] of Object.entries(DATA)) {
    const existing = await prisma.sewingPattern.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) {
      console.warn(`  ⚠ Not found: ${slug}`)
      missing++
      continue
    }
    if (DRY_RUN) {
      console.log(`  dry-run: ${slug} → techniqueSlugs[${data.techniqueSlugs.length}] criticalTechniques[${data.criticalTechniques.length}] aliases[${data.aliases.length}]`)
    } else {
      await prisma.sewingPattern.update({
        where: { slug },
        data: {
          techniqueSlugs: data.techniqueSlugs,
          criticalTechniques: data.criticalTechniques,
          aliases: data.aliases,
        },
      })
      console.log(`  ✓ ${slug}`)
      updated++
    }
  }

  console.log(`\n${DRY_RUN ? 'dry-run' : 'updated'}: ${updated} patterns, ${missing} not found`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
