/**
 * Master KnittingNeedle seed data — one row per millimetre size, with UK
 * (old 14–000 numbering), US (modern 0–50 numbering), and JP conversions.
 * Mirrors the `CrochetHook` seed shape; the only difference is needle vs
 * hook nomenclature in the canonical name.
 *
 * Conversion notes:
 *
 *   - UK numbering is inverted from US: UK 14 = 2 mm, UK 000 = 10 mm.
 *   - Some sizes have no UK equivalent (2.25, 2.75, 3.5, 6.5, 12, 15+ mm).
 *   - Japanese sizes 0..14 exist for the common metric sizes; not every
 *     row has one (the table thins toward the larger end).
 *   - The same physical mm size is seeded ONCE — needle "type" (straight
 *     vs double-pointed vs circular vs interchangeable) is part of a
 *     pattern's instructions, not part of the master row identity. The
 *     pattern body says "5 mm 40 cm circular needle"; the master row is
 *     just `knitting-needle-5-0mm`.
 *
 * `suitableYarnWeightSlugs` mirrors `CrochetHook.suitableYarnWeightSlugs`
 * and references the master `YarnWeight` table's slugs (which crochet
 * seeded first — `lace`, `super-fine`, `fine`, `light`, `medium`,
 * `bulky`, `super-bulky`, `jumbo`).
 *
 * Sources for the conversion table: Craft Yarn Council needle conversion
 * chart, Knitter's Symbol Library, the back-cover sizing tables in Mary
 * Thomas's Knitting Book (1938), cross-checked against Knit Pro / KnitPicks
 * packaging.
 */

export interface KnittingNeedleSeed {
  slug: string
  mmSize: number
  canonicalName: string
  ukSize?: string
  usSize?: string
  jpSize?: string
  suitableYarnWeightSlugs: string[]
  notes?: string
}

export const KNITTING_NEEDLES: KnittingNeedleSeed[] = [
  // ── Lace / fine / sock band ───────────────────────────────────────────
  {
    slug: 'knitting-needle-2-0mm',
    mmSize: 2.0,
    canonicalName: '2 mm needle (UK 14 / US 0)',
    ukSize: '14',
    usSize: '0',
    jpSize: '0',
    suitableYarnWeightSlugs: ['lace', 'fingering'],
    notes: 'The smallest commonly stocked size. Lace shawls and very fine sock yarn.',
  },
  {
    slug: 'knitting-needle-2-25mm',
    mmSize: 2.25,
    canonicalName: '2.25 mm needle (US 1)',
    usSize: '1',
    jpSize: '1',
    suitableYarnWeightSlugs: ['fingering'],
  },
  {
    slug: 'knitting-needle-2-5mm',
    mmSize: 2.5,
    canonicalName: '2.5 mm needle (UK 13)',
    ukSize: '13',
    jpSize: '1',
    suitableYarnWeightSlugs: ['fingering'],
    notes: 'UK 4-ply sock standard.',
  },
  {
    slug: 'knitting-needle-2-75mm',
    mmSize: 2.75,
    canonicalName: '2.75 mm needle (US 2)',
    usSize: '2',
    jpSize: '2',
    suitableYarnWeightSlugs: ['fingering'],
  },
  {
    slug: 'knitting-needle-3-0mm',
    mmSize: 3.0,
    canonicalName: '3 mm needle (UK 11)',
    ukSize: '11',
    jpSize: '3',
    suitableYarnWeightSlugs: ['fingering', 'sport'],
  },
  {
    slug: 'knitting-needle-3-25mm',
    mmSize: 3.25,
    canonicalName: '3.25 mm needle (UK 10 / US 3)',
    ukSize: '10',
    usSize: '3',
    jpSize: '4',
    suitableYarnWeightSlugs: ['sport'],
  },
  {
    slug: 'knitting-needle-3-5mm',
    mmSize: 3.5,
    canonicalName: '3.5 mm needle (US 4)',
    usSize: '4',
    jpSize: '4',
    suitableYarnWeightSlugs: ['sport'],
  },
  {
    slug: 'knitting-needle-3-75mm',
    mmSize: 3.75,
    canonicalName: '3.75 mm needle (UK 9 / US 5)',
    ukSize: '9',
    usSize: '5',
    jpSize: '5',
    suitableYarnWeightSlugs: ['sport', 'dk'],
  },

  // ── DK / aran band — the bread-and-butter of UK knitting ──────────────
  {
    slug: 'knitting-needle-4-0mm',
    mmSize: 4.0,
    canonicalName: '4 mm needle (UK 8 / US 6)',
    ukSize: '8',
    usSize: '6',
    jpSize: '6',
    suitableYarnWeightSlugs: ['dk'],
    notes: 'The default DK needle for most British patterns.',
  },
  {
    slug: 'knitting-needle-4-5mm',
    mmSize: 4.5,
    canonicalName: '4.5 mm needle (UK 7 / US 7)',
    ukSize: '7',
    usSize: '7',
    jpSize: '7',
    suitableYarnWeightSlugs: ['dk', 'aran'],
  },
  {
    slug: 'knitting-needle-5-0mm',
    mmSize: 5.0,
    canonicalName: '5 mm needle (UK 6 / US 8)',
    ukSize: '6',
    usSize: '8',
    jpSize: '8',
    suitableYarnWeightSlugs: ['aran'],
    notes: 'The default aran / worsted needle. Garter scarves, ribbed hats.',
  },
  {
    slug: 'knitting-needle-5-5mm',
    mmSize: 5.5,
    canonicalName: '5.5 mm needle (UK 5 / US 9)',
    ukSize: '5',
    usSize: '9',
    jpSize: '9',
    suitableYarnWeightSlugs: ['aran', 'chunky'],
  },

  // ── Bulky / chunky band ───────────────────────────────────────────────
  {
    slug: 'knitting-needle-6-0mm',
    mmSize: 6.0,
    canonicalName: '6 mm needle (UK 4 / US 10)',
    ukSize: '4',
    usSize: '10',
    jpSize: '10',
    suitableYarnWeightSlugs: ['chunky'],
  },
  {
    slug: 'knitting-needle-6-5mm',
    mmSize: 6.5,
    canonicalName: '6.5 mm needle (UK 3 / US 10½)',
    ukSize: '3',
    usSize: '10½',
    jpSize: '10',
    suitableYarnWeightSlugs: ['chunky'],
  },
  {
    slug: 'knitting-needle-7-0mm',
    mmSize: 7.0,
    canonicalName: '7 mm needle (UK 2)',
    ukSize: '2',
    jpSize: '11',
    suitableYarnWeightSlugs: ['chunky'],
  },
  {
    slug: 'knitting-needle-7-5mm',
    mmSize: 7.5,
    canonicalName: '7.5 mm needle (UK 1)',
    ukSize: '1',
    jpSize: '12',
    suitableYarnWeightSlugs: ['chunky'],
  },
  {
    slug: 'knitting-needle-8-0mm',
    mmSize: 8.0,
    canonicalName: '8 mm needle (UK 0 / US 11)',
    ukSize: '0',
    usSize: '11',
    jpSize: '13',
    suitableYarnWeightSlugs: ['chunky', 'super-chunky'],
  },
  {
    slug: 'knitting-needle-9-0mm',
    mmSize: 9.0,
    canonicalName: '9 mm needle (UK 00 / US 13)',
    ukSize: '00',
    usSize: '13',
    jpSize: '14',
    suitableYarnWeightSlugs: ['super-chunky'],
  },
  {
    slug: 'knitting-needle-10-0mm',
    mmSize: 10.0,
    canonicalName: '10 mm needle (UK 000 / US 15)',
    ukSize: '000',
    usSize: '15',
    suitableYarnWeightSlugs: ['super-chunky'],
  },

  // ── Statement / arm-knitting band ─────────────────────────────────────
  {
    slug: 'knitting-needle-12-0mm',
    mmSize: 12.0,
    canonicalName: '12 mm needle (US 17)',
    usSize: '17',
    suitableYarnWeightSlugs: ['super-chunky', 'jumbo'],
  },
  {
    slug: 'knitting-needle-15-0mm',
    mmSize: 15.0,
    canonicalName: '15 mm needle (US 19)',
    usSize: '19',
    suitableYarnWeightSlugs: ['jumbo'],
    notes: 'Statement throws, arm-knit pieces.',
  },
]
