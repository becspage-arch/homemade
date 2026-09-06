/**
 * Write plain-list descriptions for the cross-stitch category and its
 * sub-category shelves: the category description (which wrongly promised
 * "art reproductions" while that shelf has 0 patterns), 3 shelves whose
 * descriptions needed rewriting to the plain-list voice already used by
 * seasonal/cocktails/landscapes/monochrome, and every shelf that had no
 * description at all. Each is grounded in what's actually on the shelf
 * (sampled pattern names), not aspirational.
 *
 * Idempotent: only writes a row whose current text differs from the target,
 * and re-running with the same target text is a no-op.
 *
 * Dry-run by default. Pass --apply to write.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-shelf-descriptions.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-shelf-descriptions.ts --apply
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const candidate of [
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../../..', '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

const APPLY = process.argv.includes('--apply')

/** Cross-stitch category description. */
const CATEGORY_DESCRIPTION =
  'Animals, florals, landscapes, fantasy and fairytale, pop art portraits, monochrome studies, seasonal pieces, celestial, witchy and gothic, food and drink, nursery, quotes and sayings, and cosy scenes.'

/** Sub-category slug -> new description. */
const SUB_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  // Rewrites (previously in the old "factual anchor" / framing voice).
  animals: 'Cats, foxes, owls, rabbits, hedgehogs, and other woodland creatures.',
  'quotes-and-sayings': 'Motherhood humour, sarcastic one-liners, coffee quotes, and everyday sayings.',
  'pride-and-inclusive': 'Pride flags, rainbows, and LGBTQ+ quotes and affirmations.',

  // Previously empty.
  fantasy: "Dragons, unicorns, mermaids, fairies, phoenixes, and toadstool cottages.",
  transport: 'Camper vans, hot-air balloons, and tractors.',
  'witchy-gothic': 'Black cats, crystals, dried herbs, moths, and crescent moons.',
  'famous-faces': 'Cleopatra, Marie Antoinette, Shakespeare, Beethoven, Van Gogh, and other historical figures.',
  hobbies: 'Painting and other maker hobbies.',
  floral: 'Wildflowers, foxgloves, peonies, sunflowers, lavender, wreaths, and botanical studies.',
  halloween: "Pumpkins, ghosts, black cats, haunted houses, and jack-o'-lanterns.",
  celestial: 'Suns, moons, stars, and constellations.',
  food: 'Cupcakes, pancakes, macarons, gingerbread, jam, and teapots.',
  whimsical: 'Cats, capybaras, axolotls, corgis, and other playful animal scenes.',
  retro: 'Roller skates and other retro pieces.',
  scenes: 'Cottages, tea shops, bookshops, seaside villages, and cosy high streets.',
  portraits: 'Pop-art glamour, retro fashion, and stylised portraits.',
  // Created by the bulk publisher on its first nursery gem (2026-09-06).
  nursery: 'Sailboats, sleepy animals, moons and stars, and soft pieces for a baby\'s room.',
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const category = await prisma.category.findUnique({ where: { slug: 'cross-stitch' } })
  if (!category) throw new Error('cross-stitch category not found')

  console.log('\n[descriptions] category: cross-stitch')
  if (category.description === CATEGORY_DESCRIPTION) {
    console.log('  unchanged (already matches)')
  } else {
    console.log(`  current : ${JSON.stringify(category.description)}`)
    console.log(`  new     : ${JSON.stringify(CATEGORY_DESCRIPTION)}`)
    if (APPLY) {
      await prisma.category.update({
        where: { id: category.id },
        data: { description: CATEGORY_DESCRIPTION },
      })
      console.log('  written')
    } else {
      console.log('  [would write]')
    }
  }

  for (const [slug, description] of Object.entries(SUB_CATEGORY_DESCRIPTIONS)) {
    const sub = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug } },
    })
    if (!sub) {
      console.log(`\n[descriptions] ${slug}: NOT FOUND, skipping`)
      continue
    }
    console.log(`\n[descriptions] ${slug} (${sub.name})`)
    if (sub.description === description) {
      console.log('  unchanged (already matches)')
      continue
    }
    console.log(`  current : ${JSON.stringify(sub.description)}`)
    console.log(`  new     : ${JSON.stringify(description)}`)
    if (APPLY) {
      await prisma.subCategory.update({ where: { id: sub.id }, data: { description } })
      console.log('  written')
    } else {
      console.log('  [would write]')
    }
  }

  console.log(APPLY ? '\n[descriptions] applied.' : '\n[descriptions] dry-run only — pass --apply to write.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[descriptions] failed:', err)
  process.exit(1)
})
