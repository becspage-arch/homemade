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
  'Animals, florals, landscapes, fantasy and fairytale, pop art portraits, monochrome studies, Christmas, seasonal pieces, coastal and seaside, folk art and geometric, small makes, celestial, witchy and gothic, food and drink, nursery, quotes and sayings, and cosy scenes.'

/**
 * Shelves that may not have a row yet.
 *
 * A shelf row is normally created by the bulk publisher on its first gem (that
 * is how `nursery` appeared). The four shelves added on 6 September 2026 have no
 * patterns yet, so without this their descriptions would have nowhere to go and
 * the script would just report them missing every run. Creating the row here is
 * the same row, with the same name and order, the publisher would create — and
 * an empty shelf is invisible on the public grid, which only lists shelves that
 * hold something. Slug -> display name, and it must match `CROSS_STITCH_SHELVES`
 * in apps/web/src/lib/studio/generation/categories.ts.
 */
const CREATE_IF_MISSING: Record<string, string> = {
  christmas: 'Christmas',
  'small-makes': 'Small makes',
  coastal: 'Coastal & seaside',
  'folk-geometric': 'Folk art & geometric',
}

/** The order the bulk publisher gives a shelf row it has to create. */
const SHELF_ORDER = 50

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

  // ── The four shelves added 6 September 2026, and the one they shrank ──────
  // Christmas moved out of `seasonal` onto its own shelf (see
  // scripts/xs-refile-christmas.ts), so seasonal is now the rest of the year.
  christmas: 'Robins, reindeer, snowmen, gingerbread houses, stockings, baubles, nutcrackers, wreaths, and snowy villages.',
  seasonal: "Easter bunnies, spring chicks, autumn harvest baskets, conkers and leaves, and Valentine's hearts.",
  'small-makes': 'Ornaments, bookmarks, cards, keyrings, and coaster-size motifs.',
  coastal: 'Lighthouses, beach huts, sailing boats, seagulls, shells and sea glass, piers, deckchairs, rock pools, and harbours.',
  'folk-geometric': 'Scandinavian folk bands, folk-art birds, paper-cut roosters, mandalas, Otomi animals, Portuguese tiles, Fair Isle bands, quilt stars, and kilim borders.',
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
    let sub = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug } },
    })
    if (!sub && CREATE_IF_MISSING[slug]) {
      const name = CREATE_IF_MISSING[slug]
      console.log(`\n[descriptions] ${slug} (${name}): shelf row does not exist yet`)
      if (!APPLY) {
        console.log(`  [would create] with description ${JSON.stringify(description)}`)
        continue
      }
      sub = await prisma.subCategory.create({
        data: { categoryId: category.id, slug, name, order: SHELF_ORDER, description },
      })
      console.log(`  created with description ${JSON.stringify(description)}`)
      continue
    }
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
