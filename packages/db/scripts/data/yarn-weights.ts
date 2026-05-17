/**
 * Master YarnWeight seed data — the Craft Yarn Council standard weight
 * categories 0..7 with the UK / US naming conventions baked in side by side.
 *
 * Authoring crochet + knitting patterns hinges on naming weight correctly.
 * UK "DK" is US "light worsted"; UK "4-ply" is US "fingering". The lookup
 * table below is the canonical reference the renderer uses when surfacing
 * "needle equivalents" beside hook sizes and vice versa.
 *
 * Conventions:
 *
 *   - slug              kebab-case, unique. URL-safe.
 *   - canonicalName     the British convention name. UK-first policy.
 *   - standardCategory  Craft Yarn Council 0..7. INT — unique per row.
 *   - ukNames / usNames the alternative names on yarn labels and in older
 *                       pattern books.
 *   - wrapsPerInch      text range — '14-18' lets a range fit.
 *   - recommendedHookRangeMm  / recommendedNeedleRangeMm
 *                       text ranges in millimetres — '3.0-3.5mm'.
 *   - typicalDrape      'drapey' | 'stable' | 'firm' | 'stiff'.
 *   - typicalProjects   plain-prose hint surfaced in the substitution helper.
 *
 * Sources for the conversion table: Craft Yarn Council weight standards,
 * British Hand Knitting Confederation legacy ply tables, Ravelry yarn-
 * database conversions cross-checked against Stylecraft, Sirdar, and
 * Drops label conventions.
 */

export interface YarnWeightSeed {
  slug: string
  canonicalName: string
  standardCategory: number
  ukNames: string[]
  usNames: string[]
  wrapsPerInch?: string
  recommendedHookRangeMm?: string
  recommendedNeedleRangeMm?: string
  typicalDrape?: 'drapey' | 'stable' | 'firm' | 'stiff'
  typicalProjects?: string
  notes?: string
}

export const YARN_WEIGHTS: YarnWeightSeed[] = [
  {
    slug: 'lace',
    canonicalName: 'Lace',
    standardCategory: 0,
    ukNames: ['1-ply', '2-ply'],
    usNames: ['lace', 'cobweb', 'fingering'],
    wrapsPerInch: '18+',
    recommendedHookRangeMm: '1.5-2.25mm',
    recommendedNeedleRangeMm: '1.5-2.25mm',
    typicalDrape: 'drapey',
    typicalProjects:
      'Lace shawls, doilies, fine edgings. Most often paired with a steel hook in cotton thread.',
  },
  {
    slug: 'fingering',
    canonicalName: '4-ply / fingering',
    standardCategory: 1,
    ukNames: ['4-ply', 'baby weight'],
    usNames: ['fingering', 'sock', 'baby'],
    wrapsPerInch: '14-18',
    recommendedHookRangeMm: '2.25-3.5mm',
    recommendedNeedleRangeMm: '2.25-3.25mm',
    typicalDrape: 'drapey',
    typicalProjects:
      'Sock yarn, baby cardigans, fine summer tops, openwork shawls. The traditional UK 4-ply weight.',
  },
  {
    slug: 'sport',
    canonicalName: 'Sport',
    standardCategory: 2,
    ukNames: ['baby', 'sport'],
    usNames: ['sport', 'baby'],
    wrapsPerInch: '12-14',
    recommendedHookRangeMm: '3.5-4.5mm',
    recommendedNeedleRangeMm: '3.25-3.75mm',
    typicalDrape: 'drapey',
    typicalProjects:
      'Light cardigans, summer garments, lighter baby blankets. Sits between 4-ply and DK on the British scale.',
  },
  {
    slug: 'dk',
    canonicalName: 'DK',
    standardCategory: 3,
    ukNames: ['DK', '8-ply'],
    usNames: ['DK', 'light worsted'],
    wrapsPerInch: '11-13',
    recommendedHookRangeMm: '4.0-5.0mm',
    recommendedNeedleRangeMm: '3.75-4.5mm',
    typicalDrape: 'stable',
    typicalProjects:
      'Blankets, cushion covers, garments, dishcloths. The default British weight for adult cardigans and general crochet. UK "DK" = US "light worsted" — the most common UK / US naming mismatch.',
    notes:
      'The single most-used weight in British crochet and knitting. If a UK pattern names no weight, the default assumption is DK.',
  },
  {
    slug: 'aran',
    canonicalName: 'Aran',
    standardCategory: 4,
    ukNames: ['Aran', '10-ply'],
    usNames: ['worsted', 'afghan'],
    wrapsPerInch: '8-11',
    recommendedHookRangeMm: '5.0-6.5mm',
    recommendedNeedleRangeMm: '4.5-5.5mm',
    typicalDrape: 'stable',
    typicalProjects:
      'Cabled jumpers (the classic Aran), warm blankets, throws, hats. UK "Aran" = US "worsted". The next step up from DK and the typical North-Atlantic-island-jumper weight.',
  },
  {
    slug: 'chunky',
    canonicalName: 'Chunky',
    standardCategory: 5,
    ukNames: ['Chunky', '12-ply'],
    usNames: ['bulky'],
    wrapsPerInch: '7-9',
    recommendedHookRangeMm: '6.5-9.0mm',
    recommendedNeedleRangeMm: '5.5-8.0mm',
    typicalDrape: 'firm',
    typicalProjects:
      'Quick blankets, oversized scarves, hats, fast garments. Fastest weight for a same-day project that still drapes.',
  },
  {
    slug: 'super-chunky',
    canonicalName: 'Super chunky',
    standardCategory: 6,
    ukNames: ['Super chunky', '14-ply'],
    usNames: ['super bulky'],
    wrapsPerInch: '5-6',
    recommendedHookRangeMm: '9.0-15.0mm',
    recommendedNeedleRangeMm: '8.0-12.75mm',
    typicalDrape: 'firm',
    typicalProjects:
      'Statement throws, oversized hats, weighted-floor cushions. The "knit a blanket in a weekend" weight.',
  },
  {
    slug: 'jumbo',
    canonicalName: 'Jumbo',
    standardCategory: 7,
    ukNames: ['Jumbo', 'roving'],
    usNames: ['jumbo', 'roving'],
    wrapsPerInch: '<5',
    recommendedHookRangeMm: '15.0mm+',
    recommendedNeedleRangeMm: '12.75mm+',
    typicalDrape: 'stiff',
    typicalProjects:
      'Arm-knitted blankets, basket-style rugs, statement homewares. Often worked with very large hooks (or fingers) on un-spun roving.',
  },
]
