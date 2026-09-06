/**
 * Cross-stitch glossary — the terms the eight READING foundation pieces and
 * the `/stitches/cross-stitch` reference page rely on.
 *
 * The category already carries 43 glossary terms (fabric, floss, brands,
 * stitch variants, framing) seeded by earlier stitch-library and chart-
 * tutorial work. This script tops up the handful that were still missing —
 * needle sizing, frames, confetti, chart symbols, grid lines, centre marks,
 * a single strand of floss — so every term the new readings tooltip actually
 * resolves.
 *
 * Idempotent: upserts by slug (create if missing, update term + definition +
 * body if the row already exists so a copy edit here reaches the DB on
 * re-run). Never deletes. Safe to re-run any number of times.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-glossary.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
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

interface TermSeed {
  slug: string
  term: string
  definition: string
  body?: string
}

/**
 * New terms only — every slug here was confirmed absent from the DB (and
 * free of a same-slug row in another category, since GlossaryTerm.slug is
 * globally unique) before this script was written. The 43 pre-existing
 * cross-stitch terms (aida, evenweave, linen, floss, dmc, anchor, madeira,
 * skein, stranded-cotton, tapestry-needle, embroidery-hoop, q-snap,
 * railroading, parking, back-stitch, french-knot, fractional-stitch,
 * half-cross, three-quarter-cross, quarter-cross, blocking-cross-stitch,
 * lacing-method, cross-stitch-chart-key, and the rest) are left untouched —
 * this script only adds what was genuinely missing.
 */
const NEW_TERMS: TermSeed[] = [
  {
    slug: 'needle-size',
    term: 'Needle size',
    definition:
      'The number stamped on a pack of tapestry needles. A higher number is a finer, shorter needle. Cross-stitch matches the needle to the fabric count: a size 24 suits 14-count Aida, a size 26 suits 16 and 18-count, and a size 28 suits fine evenweave and linen.',
  },
  {
    slug: 'scroll-frame',
    term: 'Scroll frame',
    definition:
      'A rectangular wooden frame with a roller bar at the top and bottom. The fabric is sewn to webbing on each roller and the rollers turned to take up slack, so the whole piece stays taut without the curve or the marks a hoop leaves.',
  },
  {
    slug: 'confetti',
    term: 'Confetti stitching',
    definition:
      'Single stitches of a colour scattered through a design rather than grouped into a block, the way a handful of confetti lands. Slower to work than a solid block, because the needle changes colour for one stitch at a time instead of filling an area before moving on.',
  },
  {
    slug: 'finishing-cross-stitch',
    term: 'Finishing',
    definition:
      'Everything that happens after the last stitch: washing the piece, pressing it flat, and mounting or framing it for display. A chart is only half the project; finishing is what turns stitched fabric into a piece on the wall.',
  },
  {
    slug: 'symbol',
    term: 'Symbol',
    definition:
      'The small printed mark inside a chart square, such as a cross, a dot, a triangle or a letter, standing in for one thread colour. The key beside the chart says which colour each symbol means.',
  },
  {
    slug: 'grid-line',
    term: 'Grid line',
    definition:
      'A line printed across a chart. Heavier grid lines run every ten squares to make counting large numbers of stitches faster; the lighter lines in between mark each individual square.',
  },
  {
    slug: 'centre-mark',
    term: 'Centre mark',
    definition:
      'A small arrow or short line printed on the margin of a chart, at the middle of each edge. Where the mark on the top or bottom edge lines up with the mark on a side edge is the exact centre of the design, and counting starts there.',
  },
  {
    slug: 'strand',
    term: 'Strand',
    definition:
      'One of the six fine threads twisted together in a length of stranded cotton. A pattern states how many strands to put back together in the needle: usually two for 14-count Aida and one for back-stitch.',
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const category = await prisma.category.findUnique({ where: { slug: 'cross-stitch' } })
  if (!category) {
    throw new Error('Category "cross-stitch" not found. Run seed-categories.ts first.')
  }

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const t of NEW_TERMS) {
    const existing = await prisma.glossaryTerm.findUnique({ where: { slug: t.slug } })
    if (!existing) {
      await prisma.glossaryTerm.create({
        data: {
          slug: t.slug,
          term: t.term,
          definition: t.definition,
          categoryId: category.id,
          body: t.body ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: t.body }] }] } : undefined,
        },
      })
      created += 1
      console.log(`  [created] ${t.slug} — "${t.term}"`)
      continue
    }
    if (existing.categoryId !== category.id) {
      console.warn(
        `  [skip] ${t.slug} exists under a different category (${existing.categoryId}) — leaving untouched.`,
      )
      continue
    }
    if (existing.term !== t.term || existing.definition !== t.definition) {
      await prisma.glossaryTerm.update({
        where: { slug: t.slug },
        data: { term: t.term, definition: t.definition },
      })
      updated += 1
      console.log(`  [updated] ${t.slug}`)
    } else {
      unchanged += 1
    }
  }

  const total = await prisma.glossaryTerm.count({ where: { categoryId: category.id } })
  console.log(`\n[xs-glossary] created ${created}, updated ${updated}, unchanged ${unchanged}.`)
  console.log(`[xs-glossary] cross-stitch category now has ${total} glossary terms.`)

  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error('[xs-glossary] failed:', err)
  process.exit(1)
})
