/**
 * One-off seed for the Needlework taxonomy.
 *
 * Inserts (or no-ops on conflict) sub-categories under the existing
 * `needlework` Category. The Category itself was seeded by
 * `seed-categories.ts`. This script is idempotent and slug-keyed.
 *
 * Sub-disciplines per the Needlework analysis memo (2026-06-09).
 * Two Studio archetypes:
 *   - Counted thread: blackwork, hardanger, needlepoint, sashiko
 *   - Surface / freehand: surface-embroidery, goldwork, ribbon-embroidery,
 *     stumpwork, candlewicking
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-needlework-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-needlework-taxonomy.ts --dry-run
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

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  // ── Counted-thread disciplines (grid / chart engine) ─────────────────────
  {
    slug: 'blackwork',
    name: 'Blackwork',
    description:
      'Counted repeating geometric patterns worked in black thread on even-weave fabric. Fill patterns tile within an outline shape at varying density. Tudor English origin, worked on 28-count evenweave with a tapestry needle.',
    order: 10,
  },
  {
    slug: 'hardanger',
    name: 'Hardanger',
    description:
      'Norwegian counted embroidery combining Kloster block satin stitch with drawn-thread cutwork and open-weave filling stitches. Worked on 22-count Hardanger fabric with pearl cotton in sizes 8 and 12.',
    order: 20,
  },
  {
    slug: 'needlepoint',
    name: 'Needlepoint',
    description:
      'Embroidery on open-weave canvas covering every hole with wool or silk thread. Uses tent stitch, bargello, basketweave, scotch stitch, and dozens of other canvas stitches. Charted and painted-canvas patterns both.',
    order: 30,
  },
  {
    slug: 'sashiko',
    name: 'Sashiko',
    description:
      'Japanese running-stitch embroidery in white thread on indigo cloth. Patterns are geometric, derived from traditional regional designs including asanoha, nowaki, and shippou. Originally stitched to reinforce and insulate worn fabric in northern Japan.',
    order: 40,
  },
  // ── Surface and freehand disciplines (vector / outline engine) ────────────
  {
    slug: 'surface-embroidery',
    name: 'Surface embroidery',
    description:
      'Freehand decorative stitching on fabric surface following a transferred line drawing. Includes crewel work in wool thread, redwork outline embroidery, botanical studies, and general surface stitching in stranded cotton or silk.',
    order: 50,
  },
  {
    slug: 'goldwork',
    name: 'Goldwork',
    description:
      'Embroidery using real or imitation gold thread couched onto the fabric surface. Thread types include purl, passing, jap gold, and check thread. Requires a slate frame. Historically associated with ecclesiastical and ceremonial work.',
    order: 60,
  },
  {
    slug: 'ribbon-embroidery',
    name: 'Ribbon embroidery',
    description:
      'Embroidery using silk ribbon to create dimensional petal shapes, leaves, and floral forms that stand away from the fabric surface. Worked with a chenille needle on firm ground fabric.',
    order: 70,
  },
  {
    slug: 'stumpwork',
    name: 'Stumpwork',
    description:
      'Raised English embroidery combining padding, wire frames, and needlelace to create three-dimensional elements that stand off the fabric. Requires solid surface embroidery skills as a foundation.',
    order: 80,
  },
  {
    slug: 'candlewicking',
    name: 'Candlewicking',
    description:
      'American colonial embroidery tradition using heavy cotton thread on muslin ground. Colonial knots, bullion stitches, and padded satin stitch in single-colour designs. An accessible entry point to surface embroidery.',
    order: 90,
  },
  // ── Foundations ────────────────────────────────────────────────────────────
  {
    slug: 'foundations',
    name: 'Foundations',
    description:
      'Core skills that underpin all needlework disciplines: setting up a hoop or frame, starting and finishing thread, transferring a design, reading a chart, choosing fabric and needle for the discipline.',
    order: 100,
  },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const needlework = await prisma.category.findUnique({ where: { slug: 'needlework' } })
  if (!needlework) {
    console.error(
      '[seed] needlework category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] needlework → ${needlework.id}`)

  let created = 0
  let unchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: needlework.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] needlework/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: needlework.id,
          },
        })
        console.log(`[seed] needlework/${spec.slug} → ${sub.id}`)
      }
      created += 1
      continue
    }

    unchanged += 1
  }

  console.log(
    `\n[seed] needlework-taxonomy: created=${created} unchanged=${unchanged} total=${SUB_CATEGORIES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
