/**
 * Seed the cross-stitch glossary — one GlossaryTerm row per stitch,
 * material, tool, fabric, and technique the cross-stitch master prompt
 * (`docs/cross-stitch-author.md`) references inline.
 *
 * Idempotent / safe to re-run: upserts on (categoryId, slug).
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-cross-stitch-glossary.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-cross-stitch-glossary.ts --dry-run
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

const DRY_RUN = process.argv.includes('--dry-run')

interface GlossarySpec {
  slug: string
  term: string
  definition: string
  category: 'stitch' | 'material' | 'tool' | 'fabric' | 'technique'
}

const ENTRIES: GlossarySpec[] = [
  // Stitches
  {
    slug: 'full-cross',
    term: 'Full cross-stitch',
    category: 'stitch',
    definition:
      'Two diagonal stitches worked over one Aida square, both leaning the same way, to form an X. The default stitch of cross-stitch. Come up at bottom-left, down at top-right, up at bottom-right, down at top-left.',
  },
  {
    slug: 'half-cross',
    term: 'Half cross-stitch',
    category: 'stitch',
    definition:
      'Only the first diagonal of a full cross. Lighter coverage on the fabric, usually used for backgrounds or shading where the chart calls for a half-tone.',
  },
  {
    slug: 'quarter-cross',
    term: 'Quarter cross-stitch',
    category: 'stitch',
    definition:
      'A half-diagonal stitch from one corner of an Aida square to its centre. Pairs with three-quarter cross in the same square to break a colour boundary across the middle of a cell.',
  },
  {
    slug: 'three-quarter-cross',
    term: 'Three-quarter cross-stitch',
    category: 'stitch',
    definition:
      'A full diagonal plus a half-diagonal back to the centre of the square. Used at edges and curves to soften the stepped look a full-cross-only chart gives.',
  },
  {
    slug: 'back-stitch',
    term: 'Back-stitch',
    category: 'stitch',
    definition:
      'A solid outline stitch worked in a single strand along the back-stitch layer of the chart. You stitch backwards along the line one stitch at a time, each stitch finishing where the previous one started.',
  },
  {
    slug: 'french-knot',
    term: 'French knot',
    category: 'stitch',
    definition:
      'A small raised dot on the fabric surface. Bring the needle up, wrap the thread around the needle two or three times, then take the needle back down through the same hole while holding the wraps taut.',
  },
  {
    slug: 'bead',
    term: 'Bead',
    category: 'stitch',
    definition:
      'A glass or seed bead attached to the fabric with a half cross-stitch in matching thread. Beads sit on top of the cross-stitch surface and catch the light.',
  },
  {
    slug: 'couching',
    term: 'Couching',
    category: 'stitch',
    definition:
      'A thicker thread laid on the surface of the fabric and caught at regular intervals by a single-strand stitch over the top. Used for stems, outlines, and metallic lines that would be too bulky to pull through the fabric.',
  },
  {
    slug: 'lazy-daisy',
    term: 'Lazy daisy',
    category: 'stitch',
    definition:
      'A petal-shaped chain-stitch loop, caught at the tip by a small straight stitch. Group five or six lazy daisies around a centre to make a small flower.',
  },
  {
    slug: 'woven-wheel',
    term: 'Woven wheel',
    category: 'stitch',
    definition:
      'A circular rose worked by laying five or seven straight-stitch spokes, then weaving thread over and under the spokes from the centre outwards. Builds a domed flower with a layered look.',
  },
  {
    slug: 'satin-stitch',
    term: 'Satin stitch',
    category: 'stitch',
    definition:
      'Parallel straight stitches packed side by side to fill a shape with a smooth surface. The stitches usually all lean the same way to catch the light in one direction.',
  },
  {
    slug: 'stem-stitch',
    term: 'Stem stitch',
    category: 'stitch',
    definition:
      'A line stitch with the thread held to one side of the needle as each stitch goes in. Builds a rope-like outline used for botanical stems and other curved lines.',
  },
  {
    slug: 'chain-stitch',
    term: 'Chain stitch',
    category: 'stitch',
    definition:
      'A line of linked loops, each one holding the next. The needle comes up through the fabric, goes back down through the same hole, and up again a stitch length forwards with the thread caught in the loop.',
  },
  {
    slug: 'fly-stitch',
    term: 'Fly stitch',
    category: 'stitch',
    definition:
      'A short V shape caught with a small straight stitch at the base. Used in clusters for leaf veins, bird feathers, and grass blades.',
  },

  // Fabric
  {
    slug: 'aida',
    term: 'Aida',
    category: 'fabric',
    definition:
      'A stiff, evenly-woven cross-stitch fabric with clearly visible squares formed by groups of threads. The default for beginners. Counted in squares per inch: 11ct, 14ct, 16ct, and 18ct are the common counts.',
  },
  {
    slug: 'evenweave',
    term: 'Evenweave',
    category: 'fabric',
    definition:
      'A fabric with the same number of warp and weft threads per inch, worked over two threads for cross-stitch. A 28ct evenweave gives the same finished size as 14ct Aida but with a softer drape and a finer thread count for detail.',
  },
  {
    slug: 'linen',
    term: 'Linen',
    category: 'fabric',
    definition:
      'A natural-fibre evenweave with a slightly irregular grain. Worked over two threads for cross-stitch. The most refined fabric choice: 28ct, 32ct, and 36ct linens are common.',
  },
  {
    slug: 'fabric-count',
    term: 'Fabric count',
    category: 'fabric',
    definition:
      'The number of stitches per inch of fabric. A 14ct fabric gives 14 stitches per inch; 18ct gives 18. A higher count makes the finished piece smaller and the stitches finer.',
  },

  // Materials
  {
    slug: 'stranded-cotton',
    term: 'Stranded cotton',
    category: 'material',
    definition:
      'The standard cross-stitch floss. Six strands twisted together into one length; you separate out two strands for full cross on 14ct Aida and one strand for back-stitch.',
  },
  {
    slug: 'skein',
    term: 'Skein',
    category: 'material',
    definition:
      'The bundled length of stranded cotton sold under one DMC, Anchor, or Madeira code. Standard skein is around 8 metres of six-strand thread.',
  },
  {
    slug: 'dmc',
    term: 'DMC',
    category: 'material',
    definition:
      'The most widely-stocked floss brand worldwide, with around 500 colour codes. Anchor and Madeira publish DMC-conversion charts so a DMC pattern can be stitched in any of the three brands.',
  },
  {
    slug: 'anchor',
    term: 'Anchor',
    category: 'material',
    definition:
      'A UK and European floss brand with around 460 codes. Published DMC equivalences make it the common alternative when DMC is out of stock.',
  },
  {
    slug: 'madeira',
    term: 'Madeira',
    category: 'material',
    definition:
      'A German floss brand with around 470 codes in the Mouliné range. Published DMC equivalences make it the third major option for cross-stitch.',
  },

  // Tools
  {
    slug: 'tapestry-needle',
    term: 'Tapestry needle',
    category: 'tool',
    definition:
      'A blunt-tipped needle that slips between fabric threads instead of piercing them. Size 24 is the default for 14ct Aida; finer fabrics need a higher-number, finer needle.',
  },
  {
    slug: 'embroidery-hoop',
    term: 'Embroidery hoop',
    category: 'tool',
    definition:
      'Two wooden or plastic rings that grip the fabric flat for stitching. Pick a hoop about two inches wider than the longest edge of the pattern.',
  },
  {
    slug: 'embroidery-scissors',
    term: 'Embroidery scissors',
    category: 'tool',
    definition:
      'Small sharp scissors kept just for thread, never used on fabric or paper. The fine points let you trim a strand close to the back of the work without nicking the surrounding stitches.',
  },
  {
    slug: 'floss-bobbin',
    term: 'Floss bobbin',
    category: 'tool',
    definition:
      'A flat plastic or card spool used to organise stranded cotton by brand code. Wind the skein onto the bobbin, write the code on the tab, and the colour stays sorted between sittings.',
  },
  {
    slug: 'stranding-stick',
    term: 'Stranding stick',
    category: 'tool',
    definition:
      'A thin needle-like stick used to lift one strand from the six-strand skein cleanly, without tangling the others. Easier on the hands than separating strands by feel.',
  },

  // Techniques
  {
    slug: 'starting-thread',
    term: 'Starting a thread',
    category: 'technique',
    definition:
      'Two common methods: the loop method (fold a single strand in half, thread the needle through the loop, catch the loop on the first stitch) and the waste-knot method (knot the end, push the needle in from the front a few squares away, work over the trailing tail at the back).',
  },
  {
    slug: 'ending-thread',
    term: 'Ending a thread',
    category: 'technique',
    definition:
      'Run the needle under four or five stitches on the back of the work, snug but not tight, then snip close. No knots on the back: knots catch on framing and show through thin fabric.',
  },
  {
    slug: 'parking',
    term: 'Parking',
    category: 'technique',
    definition:
      'A technique for stitching one row across the width of a pattern in many colours at once: you leave each colour threaded in the fabric a few squares ahead, ready for its next stitch, instead of starting and ending each thread.',
  },
  {
    slug: 'railroading',
    term: 'Railroading',
    category: 'technique',
    definition:
      'Pulling each stitch through with the two strands kept side by side rather than twisted, so the cross sits flat with parallel rails on the surface. Slower than working with twisted strands but the finish reads cleaner on photographs.',
  },
  {
    slug: 'gridding',
    term: 'Gridding',
    category: 'technique',
    definition:
      'Marking the fabric with washable thread or grid pen in ten-by-ten squares before you start, matching the heavy lines on the chart. Makes counting much faster on a large pattern.',
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const category = await prisma.category.findUnique({
    where: { slug: 'cross-stitch' },
    select: { id: true },
  })
  if (!category) {
    throw new Error('cross-stitch Category row not present; run seed-cross-stitch-category.ts first')
  }

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const spec of ENTRIES) {
    const existing = await prisma.glossaryTerm.findUnique({
      where: { slug: spec.slug },
      select: { id: true, definition: true, term: true, categoryId: true },
    })
    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] ${spec.slug} (${spec.category})`)
      } else {
        await prisma.glossaryTerm.create({
          data: {
            slug: spec.slug,
            term: spec.term,
            definition: spec.definition,
            categoryId: category.id,
          },
        })
      }
      created += 1
    } else if (
      existing.definition !== spec.definition ||
      existing.term !== spec.term ||
      existing.categoryId !== category.id
    ) {
      if (DRY_RUN) {
        console.log(`  [would update] ${spec.slug}`)
      } else {
        await prisma.glossaryTerm.update({
          where: { slug: spec.slug },
          data: {
            term: spec.term,
            definition: spec.definition,
            categoryId: category.id,
          },
        })
      }
      updated += 1
    } else {
      unchanged += 1
    }
  }

  console.log('')
  console.log('[seed] cross-stitch glossary summary')
  console.log(`  created  : ${created}`)
  console.log(`  updated  : ${updated}`)
  console.log(`  unchanged: ${unchanged}`)
  console.log(`  total    : ${ENTRIES.length}`)
  if (DRY_RUN) console.log('  (dry-run)')

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
