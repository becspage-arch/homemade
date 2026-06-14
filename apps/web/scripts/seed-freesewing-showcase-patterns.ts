/**
 * Seed freesewing-backed SewingPattern showcase rows.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/seed-freesewing-showcase-patterns.ts
 *
 * Idempotent on slug. Bella + Brian + Aaron from S-5a; the remaining
 * S-5e batch (15 designs) lands here so the personalisation picker has
 * a reasonable launch catalogue.
 *
 * The rows ship with empty pieceList — the wrapper at
 * apps/web/src/lib/sewing/grading/ produces the SVG at server render
 * time, cached in SewingPatternDraftCache. Anonymous browse hits the
 * showcase render; signed-in personalisation goes through
 * POST /api/studio/sewing/personalisation per S-5a.
 *
 * Category.sewing stays NOT_READY + isPublicVisible=false per the
 * no-phased-rollout lock; the row's visibility is PUBLIC for the S-5e
 * batch (the picker filters on isFreesewingDesign + visibility=PUBLIC
 * to surface the catalogue once Category.sewing flips READY).
 */

import { prisma } from '@homemade/db'

type FreesewingGarmentCategory =
  | 'WOMENS_TOPS'
  | 'WOMENS_DRESSES'
  | 'WOMENS_BOTTOMS'
  | 'WOMENS_OUTERWEAR'
  | 'WOMENS_INTIMATES'
  | 'MENS_TOPS'
  | 'MENS_BOTTOMS'
  | 'MENS_OUTERWEAR'
  | 'UNISEX'

type FreesewingSkillLevel =
  | 'BEGINNER'
  | 'IMPROVER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT'

interface ShowcaseSeed {
  slug: string
  name: string
  description: string
  garmentCategory: FreesewingGarmentCategory
  garmentType: string
  skillLevel: FreesewingSkillLevel
  subCategorySlug: string
  freesewingPackageName: string
  freesewingDesignSlug: string
  /** Freesewing-side measurement keys this design needs. */
  requiredFreesewingKeys: string[]
  /** Visibility. PRIVATE for the S-5a smoke-test trio, PUBLIC for the rest. */
  visibility: 'PRIVATE' | 'PUBLIC'
  /** Author-population fields per pipeline-setup rule. */
  techniqueSlugs: string[]
  criticalTechniques: string[]
  aliases: string[]
}

// Per-design seed config. Each entry carries the freesewing-side keys
// the wrapper needs at render time, plus the author-population fields
// pipeline-setup expects (techniqueSlugs + criticalTechniques + aliases).
const SEEDS: ShowcaseSeed[] = [
  {
    slug: 'freesewing-bella-body-block',
    name: 'Bella body block',
    description:
      "A women's bodice block drafted to your bust, waist, and hip, with an optional high-bust adjustment. Use it as a starting point for tops and dresses you draft yourself, or as a fit check before cutting a new pattern.",
    garmentCategory: 'WOMENS_TOPS',
    garmentType: 'body block',
    skillLevel: 'IMPROVER',
    subCategorySlug: 'womens-tops',
    freesewingPackageName: '@freesewing/bella',
    freesewingDesignSlug: 'bella',
    requiredFreesewingKeys: [
      'highBust','chest','underbust','waist','waistBack','bustSpan','neck',
      'hpsToBust','hpsToWaistFront','hpsToWaistBack','shoulderToShoulder','shoulderSlope',
    ],
    visibility: 'PRIVATE',
    techniqueSlugs: ['dart-construction','princess-seam','transferring-pattern-markings','staystitching','pressing-darts','pressing-seams-open'],
    criticalTechniques: ['dart-construction','transferring-pattern-markings'],
    aliases: ['bodice block','bodice sloper','fitted top block','fitted block','bella'],
  },
  {
    slug: 'freesewing-brian-body-block',
    name: 'Brian body block',
    description:
      "A men's body block for a fitted woven top. Use it as a starting point for shirts, tunics, and outerwear, or as a fit check before cutting your own design.",
    garmentCategory: 'MENS_TOPS',
    garmentType: 'body block',
    skillLevel: 'IMPROVER',
    subCategorySlug: 'mens-tops',
    freesewingPackageName: '@freesewing/brian',
    freesewingDesignSlug: 'brian',
    requiredFreesewingKeys: [
      'biceps','chest','hpsToBust','hpsToWaistBack','neck','shoulderToShoulder',
      'shoulderSlope','waistToArmpit','waistToHips',
    ],
    visibility: 'PRIVATE',
    techniqueSlugs: ['set-in-sleeve','staystitching','pressing-seams-open','transferring-pattern-markings','dart-construction'],
    criticalTechniques: ['set-in-sleeve','transferring-pattern-markings'],
    aliases: ['mens body block','mens sloper','fitted block','brian'],
  },
  {
    slug: 'freesewing-aaron-knit-a-shirt',
    name: 'Aaron knit A-shirt',
    description:
      'A simple knit A-shirt with shoulder straps and a scooped neckline. Works in light jersey or stretch fabrics.',
    garmentCategory: 'UNISEX',
    garmentType: 'knit top',
    skillLevel: 'BEGINNER',
    subCategorySlug: 'unisex',
    freesewingPackageName: '@freesewing/aaron',
    freesewingDesignSlug: 'aaron',
    requiredFreesewingKeys: [
      'biceps','chest','hpsToBust','hpsToWaistBack','neck','shoulderToShoulder',
      'shoulderSlope','waistToArmpit','waistToHips','hips',
    ],
    visibility: 'PRIVATE',
    techniqueSlugs: ['narrow-hem','rolled-hem','zigzag-stitch','bias-binding','overlocker-finishing'],
    criticalTechniques: ['narrow-hem'],
    aliases: ['a-shirt','knit tank','knit vest','aaron'],
  },
  // ── S-5e batch ─────────────────────────────────────────────────────────────
  {
    slug: 'freesewing-bee-bikini-top',
    name: 'Bee bikini top',
    description:
      "A women's bikini top with band-tie straps, drafted to your bust and high-bust measurements. Knit or woven fabrics with light interfacing.",
    garmentCategory: 'WOMENS_INTIMATES',
    garmentType: 'bikini top',
    skillLevel: 'INTERMEDIATE',
    subCategorySlug: 'womens-intimates',
    freesewingPackageName: '@freesewing/bee',
    freesewingDesignSlug: 'bee',
    requiredFreesewingKeys: [
      'bustPointToUnderbust','bustSpan','chest','highBust','hpsToBust','hpsToWaistBack',
      'hpsToWaistFront','neck','shoulderSlope','shoulderToShoulder','underbust','waist','waistBack',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['narrow-hem','rolled-hem','bias-binding','interfacing-fusible','dart-construction','zigzag-stitch'],
    criticalTechniques: ['narrow-hem','bias-binding'],
    aliases: ['bikini top','swim top','swimsuit top','bee'],
  },
  {
    slug: 'freesewing-bent-body-block',
    name: 'Bent body block',
    description:
      "A men's body block with a two-part tailored sleeve. Use it as the base for blazers, jackets, and structured shirts.",
    garmentCategory: 'MENS_TOPS',
    garmentType: 'body block',
    skillLevel: 'ADVANCED',
    subCategorySlug: 'mens-tops',
    freesewingPackageName: '@freesewing/bent',
    freesewingDesignSlug: 'bent',
    requiredFreesewingKeys: [
      'biceps','chest','hpsToBust','hpsToWaistBack','neck','shoulderSlope',
      'shoulderToElbow','shoulderToShoulder','shoulderToWrist','waistToArmpit','waistToHips','wrist',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['set-in-sleeve','interfacing-fusible','staystitching','pressing-seams-open','transferring-pattern-markings','dart-construction','tailored-vent'],
    criticalTechniques: ['set-in-sleeve','interfacing-fusible'],
    aliases: ['blazer block','tailored block','two-piece sleeve block','bent'],
  },
  {
    slug: 'freesewing-carlita-coat',
    name: 'Carlita coat',
    description:
      "A women's long coat with welt chest pockets, collar, and a back belt. Tailored construction in medium-to-heavy wovens.",
    garmentCategory: 'WOMENS_OUTERWEAR',
    garmentType: 'coat',
    skillLevel: 'ADVANCED',
    subCategorySlug: 'womens-outerwear',
    freesewingPackageName: '@freesewing/carlita',
    freesewingDesignSlug: 'carlita',
    requiredFreesewingKeys: [
      'biceps','bustSpan','chest','highBust','hpsToBust','hpsToWaistBack','neck','seat',
      'shoulderSlope','shoulderToElbow','shoulderToShoulder','shoulderToWrist','waist',
      'waistToArmpit','waistToFloor','waistToHips','waistToSeat','wrist',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['welt-pocket','notched-collar','interfacing-fusible','lining-attached','bagged-lining','set-in-sleeve','sewing-on-button-flat','buttonhole-machine','pressing-seams-open'],
    criticalTechniques: ['welt-pocket','notched-collar','interfacing-fusible','lining-attached'],
    aliases: ['ladies coat','tailored coat','sherlock coat','overcoat','carlita'],
  },
  {
    slug: 'freesewing-carlton-coat',
    name: 'Carlton coat',
    description:
      "A men's long coat with welt chest pockets, collar, and a back belt. Tailored construction in medium-to-heavy wovens.",
    garmentCategory: 'MENS_OUTERWEAR',
    garmentType: 'coat',
    skillLevel: 'ADVANCED',
    subCategorySlug: 'mens-outerwear',
    freesewingPackageName: '@freesewing/carlton',
    freesewingDesignSlug: 'carlton',
    requiredFreesewingKeys: [
      'biceps','chest','hpsToBust','hpsToWaistBack','neck','seat','shoulderSlope',
      'shoulderToElbow','shoulderToShoulder','shoulderToWrist','waist','waistToArmpit',
      'waistToFloor','waistToHips','waistToSeat','wrist',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['welt-pocket','notched-collar','interfacing-fusible','lining-attached','bagged-lining','set-in-sleeve','sewing-on-button-flat','buttonhole-machine','pressing-seams-open'],
    criticalTechniques: ['welt-pocket','notched-collar','interfacing-fusible','lining-attached'],
    aliases: ['mens coat','tailored coat','sherlock coat','overcoat','carlton'],
  },
  {
    slug: 'freesewing-cathrin-corset',
    name: 'Cathrin underbust corset',
    description:
      'A panelled underbust corset and waist trainer. Eleven or thirteen panels, boned, with back lacing. Specialist construction in coutil with light boning.',
    garmentCategory: 'WOMENS_INTIMATES',
    garmentType: 'corset',
    skillLevel: 'EXPERT',
    subCategorySlug: 'womens-intimates',
    freesewingPackageName: '@freesewing/cathrin',
    freesewingDesignSlug: 'cathrin',
    requiredFreesewingKeys: ['hips','underbust','waist','waistToHips','waistToUnderbust'],
    visibility: 'PUBLIC',
    techniqueSlugs: ['interfacing-sew-in','boning-channel','bias-binding','flat-felled-seam','underlining','pressing-seams-open','reinforced-seam'],
    criticalTechniques: ['boning-channel','underlining','bias-binding'],
    aliases: ['underbust corset','waist trainer','panelled corset','cathrin'],
  },
  {
    slug: 'freesewing-charlie-chinos',
    name: 'Charlie chinos',
    description:
      "Men's chino trousers with welt back pockets, belt loops, and a fly-front closure. Cotton twill or canvas.",
    garmentCategory: 'MENS_BOTTOMS',
    garmentType: 'trousers',
    skillLevel: 'INTERMEDIATE',
    subCategorySlug: 'mens-bottoms',
    freesewingPackageName: '@freesewing/charlie',
    freesewingDesignSlug: 'charlie',
    requiredFreesewingKeys: [
      'crossSeam','crossSeamFront','knee','seat','seatBack','waist','waistBack',
      'waistToFloor','waistToHips','waistToKnee','waistToSeat','waistToUpperLeg',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['fly-front-zip','welt-pocket','waistband-tailored','in-seam-pocket','flat-felled-seam','topstitching','sewing-on-button-flat'],
    criticalTechniques: ['fly-front-zip','welt-pocket','waistband-tailored'],
    aliases: ['chinos','chino trousers','flat-front trousers','mens trousers','charlie'],
  },
  {
    slug: 'freesewing-diana-draped-top',
    name: 'Diana draped top',
    description:
      "A women's knit top with a draped neckline. Beginner-friendly in light jersey or stretch fabrics.",
    garmentCategory: 'WOMENS_TOPS',
    garmentType: 'knit top',
    skillLevel: 'BEGINNER',
    subCategorySlug: 'womens-tops',
    freesewingPackageName: '@freesewing/diana',
    freesewingDesignSlug: 'diana',
    requiredFreesewingKeys: [
      'biceps','chest','hips','hpsToBust','hpsToWaistBack','neck','shoulderSlope',
      'shoulderToShoulder','shoulderToWrist','waist','waistToArmpit','waistToHips','wrist',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['narrow-hem','zigzag-stitch','overlocker-finishing','bias-binding','set-in-sleeve'],
    criticalTechniques: ['narrow-hem','overlocker-finishing'],
    aliases: ['draped top','cowl neck top','drape neck top','knit top','diana'],
  },
  {
    slug: 'freesewing-huey-hoodie',
    name: 'Huey zip-up hoodie',
    description:
      'A zip-up hoodie with kangaroo pocket, ribbed cuffs, and an adjustable hood. Sweatshirt fleece or French terry.',
    garmentCategory: 'UNISEX',
    garmentType: 'sweatshirt',
    skillLevel: 'INTERMEDIATE',
    subCategorySlug: 'unisex',
    freesewingPackageName: '@freesewing/huey',
    freesewingDesignSlug: 'huey',
    requiredFreesewingKeys: [
      'biceps','chest','head','hips','hpsToBust','hpsToWaistBack','neck','shoulderSlope',
      'shoulderToShoulder','shoulderToWrist','waistToArmpit','waistToHips','wrist',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['kangaroo-pocket','zipper-fly','set-in-sleeve','overlocker-finishing','zigzag-stitch','attaching-cuff','topstitching'],
    criticalTechniques: ['kangaroo-pocket','zipper-fly','attaching-cuff'],
    aliases: ['hoodie','zip-up hoodie','zip hoodie','sweatshirt','huey'],
  },
  {
    slug: 'freesewing-noble-bodice',
    name: 'Noble princess seam bodice',
    description:
      "A women's princess seam bodice block with shoulder or armhole dart options. Use as the base for fitted tops and dresses.",
    garmentCategory: 'WOMENS_TOPS',
    garmentType: 'bodice block',
    skillLevel: 'INTERMEDIATE',
    subCategorySlug: 'womens-tops',
    freesewingPackageName: '@freesewing/noble',
    freesewingDesignSlug: 'noble',
    requiredFreesewingKeys: [
      'bustSpan','chest','highBust','hpsToBust','hpsToWaistBack','hpsToWaistFront','neck',
      'shoulderSlope','shoulderToShoulder','underbust','waist','waistBack',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['princess-seam','dart-construction','staystitching','pressing-seams-open','transferring-pattern-markings'],
    criticalTechniques: ['princess-seam','dart-construction'],
    aliases: ['princess seam bodice','fitted bodice','strappy top block','noble'],
  },
  {
    slug: 'freesewing-onyx-one-piece',
    name: 'Onyx one-piece',
    description:
      'A one-piece garment with neckband or hood, optional skirt, and a front or back zipper. Works for jumpsuits, onesies, and all-in-one designs.',
    garmentCategory: 'UNISEX',
    garmentType: 'jumpsuit',
    skillLevel: 'ADVANCED',
    subCategorySlug: 'unisex',
    freesewingPackageName: '@freesewing/onyx',
    freesewingDesignSlug: 'onyx',
    requiredFreesewingKeys: [
      'ankle','biceps','chest','crossSeam','head','hips','hpsToWaistBack','hpsToWaistFront',
      'inseam','neck','seat','shoulderToWrist','upperLeg','waist','waistToArmpit',
      'waistToHips','waistToSeat','waistToUpperLeg','wrist',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['zipper-fly','raglan-sleeve','gusset-construction','overlocker-finishing','attaching-cuff','flat-felled-seam'],
    criticalTechniques: ['zipper-fly','gusset-construction','raglan-sleeve'],
    aliases: ['onesie','jumpsuit','one-piece','all-in-one','onyx'],
  },
  {
    slug: 'freesewing-slim-pencil-skirt',
    name: 'Slim pencil skirt',
    description:
      "A women's fitted pencil skirt with curved darts, back vent, and side or back zip placement. Mid-weight woven fabrics.",
    garmentCategory: 'WOMENS_BOTTOMS',
    garmentType: 'skirt',
    skillLevel: 'IMPROVER',
    subCategorySlug: 'womens-bottoms',
    freesewingPackageName: '@freesewing/penelope',
    freesewingDesignSlug: 'penelope',
    requiredFreesewingKeys: ['seat','waist','waistToHips','waistToKnee','waistToSeat'],
    visibility: 'PUBLIC',
    techniqueSlugs: ['dart-construction','invisible-zipper-insertion','lapped-zipper-insertion','waistband-tailored','tailored-vent','interfacing-fusible','blind-hem-hand'],
    criticalTechniques: ['dart-construction','invisible-zipper-insertion','waistband-tailored'],
    aliases: ['pencil skirt','straight skirt','fitted skirt','slim skirt'],
  },
  {
    slug: 'freesewing-sandy-circle-skirt',
    name: 'Sandy circle skirt',
    description:
      "A women's circle skirt drafted from your waist measurement. Adjustable circle ratio from a full circle down to a quarter circle.",
    garmentCategory: 'WOMENS_BOTTOMS',
    garmentType: 'skirt',
    skillLevel: 'BEGINNER',
    subCategorySlug: 'womens-bottoms',
    freesewingPackageName: '@freesewing/sandy',
    freesewingDesignSlug: 'sandy',
    requiredFreesewingKeys: ['hips','waist','waistToFloor','waistToHips'],
    visibility: 'PUBLIC',
    techniqueSlugs: ['waistband-flat','invisible-zipper-insertion','rolled-hem','narrow-hem','interfacing-fusible'],
    criticalTechniques: ['waistband-flat'],
    aliases: ['circle skirt','full skirt','flared skirt','sandy'],
  },
  {
    slug: 'freesewing-simon-button-down-shirt',
    name: 'Simon button-down shirt',
    description:
      "A men's button-down shirt with stand collar, cuffs, and box pleat options. Cotton or linen wovens.",
    garmentCategory: 'MENS_TOPS',
    garmentType: 'shirt',
    skillLevel: 'IMPROVER',
    subCategorySlug: 'mens-tops',
    freesewingPackageName: '@freesewing/simon',
    freesewingDesignSlug: 'simon',
    requiredFreesewingKeys: [
      'biceps','chest','hips','hpsToBust','hpsToWaistBack','neck','shoulderSlope',
      'shoulderToShoulder','shoulderToWrist','waist','waistToArmpit','waistToHips','wrist',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['collar-band-and-stand','set-in-sleeve','flat-felled-seam','attaching-cuff','buttonhole-machine','sewing-on-button-flat','interfacing-fusible','topstitching'],
    criticalTechniques: ['collar-band-and-stand','attaching-cuff','flat-felled-seam'],
    aliases: ['button-down shirt','button-up shirt','dress shirt','collared shirt','simon'],
  },
  {
    slug: 'freesewing-titan-trouser-block',
    name: 'Titan trouser block',
    description:
      'A unisex trouser block. Use as a starting point for tailored trousers, joggers, or wide-leg pants.',
    garmentCategory: 'UNISEX',
    garmentType: 'trouser block',
    skillLevel: 'IMPROVER',
    subCategorySlug: 'unisex',
    freesewingPackageName: '@freesewing/titan',
    freesewingDesignSlug: 'titan',
    requiredFreesewingKeys: [
      'crossSeam','crossSeamFront','knee','seat','seatBack','waist','waistBack',
      'waistToFloor','waistToHips','waistToKnee','waistToSeat','waistToUpperLeg',
    ],
    visibility: 'PUBLIC',
    techniqueSlugs: ['dart-construction','waistband-tailored','fly-front-zip','in-seam-pocket','staystitching','pressing-seams-open','transferring-pattern-markings'],
    criticalTechniques: ['dart-construction','waistband-tailored','transferring-pattern-markings'],
    aliases: ['trouser block','pants block','trouser sloper','titan'],
  },
  {
    slug: 'freesewing-waralee-wrap-pants',
    name: 'Waralee wrap pants',
    description:
      'Unisex wrap pants with an overlapping front and ties at the waist. Light woven fabrics. Beginner-friendly construction.',
    garmentCategory: 'UNISEX',
    garmentType: 'wrap pants',
    skillLevel: 'BEGINNER',
    subCategorySlug: 'unisex',
    freesewingPackageName: '@freesewing/waralee',
    freesewingDesignSlug: 'waralee',
    requiredFreesewingKeys: ['crotchDepth','inseam','seat','waistToHips'],
    visibility: 'PUBLIC',
    techniqueSlugs: ['narrow-hem','rolled-hem','french-seam','flat-felled-seam','patch-pocket','welt-pocket','casing-drawstring'],
    criticalTechniques: ['french-seam'],
    aliases: ['wrap pants','wrap trousers','tie-front pants','thai fisherman pants','waralee'],
  },
]

async function main(): Promise<void> {
  // Resolve sub-category ids up-front so the seed runs in a single pass.
  const sewing = await prisma.category.findUnique({ where: { slug: 'sewing' } })
  if (!sewing) {
    console.error('[seed] sewing category not found. Run seed-categories.ts first.')
    process.exit(2)
  }
  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: sewing.id },
    select: { id: true, slug: true },
  })
  const subCatBySlug = new Map(subCats.map((s) => [s.slug, s.id]))

  for (const seed of SEEDS) {
    const subCategoryId = subCatBySlug.get(seed.subCategorySlug) ?? null
    if (!subCategoryId) {
      console.warn(
        `[seed] sub-cat ${seed.subCategorySlug} missing, pattern ${seed.slug} will land without subCategoryId`,
      )
    }

    const data = {
      name: seed.name,
      description: seed.description,
      garmentCategory: seed.garmentCategory,
      garmentType: seed.garmentType,
      subCategoryId,
      skillLevel: seed.skillLevel,
      isFreesewingDesign: true,
      freesewingPackageName: seed.freesewingPackageName,
      freesewingVersion: '4.9.0',
      freesewingDesignSlug: seed.freesewingDesignSlug,
      sourceLicence: 'MIT' as const,
      sourceUrl: `https://freesewing.org/designs/${seed.freesewingDesignSlug}`,
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
        'LAYERED_PDF',
        'BROWSE_ONLY',
      ] as Array<
        'A4_TILED' | 'LETTER_TILED' | 'A3_TILED' | 'LEGAL_TILED' | 'A0' | 'PROJECTOR' | 'LAYERED_PDF' | 'BROWSE_ONLY'
      >,
      requiredMeasurements: seed.requiredFreesewingKeys,
      optionalMeasurements: [] as string[],
      techniqueSlugs: seed.techniqueSlugs,
      criticalTechniques: seed.criticalTechniques,
      aliases: seed.aliases,
      visibility: seed.visibility,
      premium: false,
      publishedAt: seed.visibility === 'PUBLIC' ? new Date() : null,
    }

    const row = await prisma.sewingPattern.upsert({
      where: { slug: seed.slug },
      create: { slug: seed.slug, ...data },
      update: data,
    })

    console.log(
      `[seed] sewing pattern: slug=${row.slug} id=${row.id} design=${row.freesewingDesignSlug} visibility=${row.visibility} subCat=${seed.subCategorySlug}`,
    )
  }
  console.log(`[seed] total processed: ${SEEDS.length}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
