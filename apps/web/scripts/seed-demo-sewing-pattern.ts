/**
 * Seed the demo SewingPattern row used by the Studio smoke-test path.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/seed-demo-sewing-pattern.ts
 *
 * Idempotent on slug. The demo data lives in
 * `src/lib/sewing/demo-pattern.ts` and is shared with the in-memory
 * ?demo=1 path so the same A-line skirt renders both ways.
 *
 * The pattern is kept at visibility=PRIVATE in the DB so it doesn't
 * surface in the public library. The Studio's slug route bypasses the
 * library and loads it directly.
 */

import { prisma } from '@homemade/db'
import {
  DEMO_SEWING_PATTERN_SLUG,
  loadDemoSewingPattern,
} from '../src/lib/sewing/demo-pattern'

async function main(): Promise<void> {
  const demo = loadDemoSewingPattern()
  const data = {
    name: demo.name,
    description: demo.description,
    garmentCategory: 'WOMENS_BOTTOMS' as const,
    garmentType: demo.garmentType,
    skillLevel: 'IMPROVER' as const,
    seamAllowanceIncluded: demo.seamAllowanceIncluded,
    seamAllowanceCm: demo.seamAllowanceCm,
    supportedSizes: demo.supportedSizes as unknown as object,
    pieceList: demo.pieces as unknown as object,
    instructionsBody: demo.instructionsBody as unknown as object,
    recommendedNotions: demo.recommendedNotions as unknown as object,
    fabricRequirementsCm: demo.fabricRequirements as unknown as object,
    cuttingLayouts: demo.cuttingLayouts as unknown as object,
    attributionText: demo.attributionText,
    sourceLicence: 'PROPRIETARY_HOMEMADE' as const,
    visibility: 'PRIVATE' as const,
  }

  const row = await prisma.sewingPattern.upsert({
    where: { slug: DEMO_SEWING_PATTERN_SLUG },
    create: { slug: DEMO_SEWING_PATTERN_SLUG, ...data },
    update: data,
  })

  console.log(
    `Seeded SewingPattern: slug=${row.slug} id=${row.id} name=${row.name}`,
  )
  console.log(
    `  pieces=${(row.pieceList as unknown as unknown[])?.length ?? 0} instructionsBody=${row.instructionsBody ? 'set' : 'null'}`,
  )
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
