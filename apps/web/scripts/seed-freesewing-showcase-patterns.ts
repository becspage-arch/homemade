/**
 * Seed freesewing-backed SewingPattern showcase rows.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/seed-freesewing-showcase-patterns.ts
 *
 * Idempotent on slug. Currently seeds one row (Bella body block) so the
 * S-5b browse + projector + S-5c tiled-print pipeline can be smoke-
 * tested end-to-end. Brian and Aaron land via the same script when the
 * S-5d personalisation flow needs them.
 *
 * The rows ship with empty pieceList — the wrapper at
 * apps/web/src/lib/sewing/grading/ produces the SVG at server render
 * time, cached in SewingPatternDraftCache. Anonymous browse hits the
 * showcase render; signed-in personalisation goes through
 * POST /api/studio/sewing/draft per S-5a.
 *
 * Category.sewing stays NOT_READY + isPublicVisible=false per the
 * no-phased-rollout lock; the row's visibility is PRIVATE so it
 * doesn't surface in any library listing.
 */

import { prisma } from '@homemade/db'

interface ShowcaseSeed {
  slug: string
  name: string
  description: string
  garmentCategory:
    | 'WOMENS_TOPS'
    | 'WOMENS_DRESSES'
    | 'WOMENS_BOTTOMS'
    | 'WOMENS_OUTERWEAR'
    | 'MENS_TOPS'
    | 'MENS_BOTTOMS'
    | 'UNISEX'
  garmentType: string
  freesewingPackageName: string
  freesewingDesignSlug: string
}

const SEEDS: ShowcaseSeed[] = [
  {
    slug: 'freesewing-bella-body-block',
    name: 'Bella body block',
    description:
      "Bella is a women's bodice block from the freesewing project. A body block is a fitted template that you adjust to your own measurements and then use as the basis for your own designs. Use this as a starting point for tops and dresses you draft yourself.",
    garmentCategory: 'WOMENS_TOPS',
    garmentType: 'body block',
    freesewingPackageName: '@freesewing/bella',
    freesewingDesignSlug: 'bella',
  },
]

async function main(): Promise<void> {
  for (const seed of SEEDS) {
    const data = {
      name: seed.name,
      description: seed.description,
      garmentCategory: seed.garmentCategory,
      garmentType: seed.garmentType,
      skillLevel: 'IMPROVER' as const,
      isFreesewingDesign: true,
      freesewingPackageName: seed.freesewingPackageName,
      freesewingVersion: '4.9.0',
      freesewingDesignSlug: seed.freesewingDesignSlug,
      sourceLicence: 'MIT' as const,
      sourceUrl: 'https://freesewing.org/designs/bella',
      attributionText:
        'This pattern was drafted using freesewing. The freesewing project is MIT-licensed open-source software created by Joost De Cock. https://freesewing.org',
      seamAllowanceIncluded: false,
      seamAllowanceCm: 1,
      // No static piece list — the wrapper renders pieces at draft time
      // from the user's measurements (or CYC defaults for showcase).
      pieceList: [] as unknown as object,
      supportedSizes: [
        { name: 'M', body: { bust: 92, waist: 74, hip: 100, height: 168 } },
      ] as unknown as object,
      availableFormats: [
        'A4_TILED',
        'LETTER_TILED',
        'A3_TILED',
        'LEGAL_TILED',
        'A0',
        'PROJECTOR',
        'BROWSE_ONLY',
      ] as Array<
        'A4_TILED' | 'LETTER_TILED' | 'A3_TILED' | 'LEGAL_TILED' | 'A0' | 'PROJECTOR' | 'LAYERED_PDF' | 'BROWSE_ONLY'
      >,
      requiredMeasurements: [
        'bustChestCm',
        'waistCm',
        'hipCm',
        'shoulderWidthCm',
        'backWaistLengthCm',
        'frontWaistLengthCm',
        'bustPointCm',
        'neckCircumferenceCm',
      ],
      optionalMeasurements: [] as string[],
      visibility: 'PRIVATE' as const,
      premium: false,
    }

    const row = await prisma.sewingPattern.upsert({
      where: { slug: seed.slug },
      create: { slug: seed.slug, ...data },
      update: data,
    })

    console.log(
      `Seeded freesewing SewingPattern: slug=${row.slug} id=${row.id} design=${row.freesewingDesignSlug} version=${row.freesewingVersion}`,
    )
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
