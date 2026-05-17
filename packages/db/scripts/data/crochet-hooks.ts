/**
 * Master CrochetHook seed data — one row per millimetre size, with the UK,
 * US, and JP conversions baked in. The mm size is the canonical sort key.
 *
 * Hook sizing is the single most-confused area for readers crossing patterns
 * from a different region. UK steel-and-imperial numbers run "backwards"
 * (smaller number = bigger hook), US uses letter+number codes, JP uses
 * fraction codes. The renderer surfaces all three from a single lookup.
 *
 * Sources for the conversion table: Craft Yarn Council hook conversion
 * chart, Coats & Clark legacy size charts, the back-cover sizing tables in
 * Pauline Turner's "How To Crochet" (HarperCollins, 2008), and Pierrot Yarns'
 * Japanese hook conversion table cross-checked against Tulip Etimo packaging.
 *
 * Empty UK / US / JP fields mean the size has no exact equivalent in that
 * convention — readers picking from a label or a translated pattern see the
 * nearest size in the renderer's substitution helper.
 *
 * Conventions:
 *
 *   - slug                      kebab-case ('crochet-hook-4-0mm'). URL-safe.
 *   - mmSize                    DOUBLE PRECISION — '4.5' rather than '4.5mm'.
 *                                Sort key; UNIQUE.
 *   - canonicalName             '4 mm hook (G/6)'.
 *   - ukSize / usSize / jpSize  string; empty when no equivalent.
 *   - suitableYarnWeightSlugs   YarnWeight master slugs.
 */

export interface CrochetHookSeed {
  slug: string
  mmSize: number
  canonicalName: string
  ukSize?: string
  usSize?: string
  jpSize?: string
  suitableYarnWeightSlugs: string[]
  notes?: string
}

export const CROCHET_HOOKS: CrochetHookSeed[] = [
  // Steel hooks (thread / fine lace).
  {
    slug: 'crochet-hook-0-6mm',
    mmSize: 0.6,
    canonicalName: '0.6 mm steel (UK 7)',
    ukSize: '7',
    usSize: '14',
    jpSize: '',
    suitableYarnWeightSlugs: ['lace'],
    notes:
      'Steel hook for the finest crochet cotton. Doilies, tatted-style edgings, miniature lace.',
  },
  {
    slug: 'crochet-hook-1-0mm',
    mmSize: 1.0,
    canonicalName: '1.0 mm steel (UK 5)',
    ukSize: '5',
    usSize: '11',
    jpSize: '',
    suitableYarnWeightSlugs: ['lace'],
  },
  {
    slug: 'crochet-hook-1-25mm',
    mmSize: 1.25,
    canonicalName: '1.25 mm steel (UK 4)',
    ukSize: '4',
    usSize: '8',
    jpSize: '',
    suitableYarnWeightSlugs: ['lace'],
  },
  {
    slug: 'crochet-hook-1-5mm',
    mmSize: 1.5,
    canonicalName: '1.5 mm steel (UK 2.5)',
    ukSize: '2.5',
    usSize: '7',
    jpSize: '',
    suitableYarnWeightSlugs: ['lace'],
  },
  {
    slug: 'crochet-hook-1-75mm',
    mmSize: 1.75,
    canonicalName: '1.75 mm (UK 2)',
    ukSize: '2',
    usSize: '5',
    jpSize: '',
    suitableYarnWeightSlugs: ['lace'],
  },
  {
    slug: 'crochet-hook-2-0mm',
    mmSize: 2.0,
    canonicalName: '2.0 mm (UK 14, US B/1)',
    ukSize: '14',
    usSize: 'B/1',
    jpSize: '2/0',
    suitableYarnWeightSlugs: ['lace', 'fingering'],
  },
  {
    slug: 'crochet-hook-2-25mm',
    mmSize: 2.25,
    canonicalName: '2.25 mm (UK 13)',
    ukSize: '13',
    usSize: 'B/1',
    jpSize: '',
    suitableYarnWeightSlugs: ['fingering'],
  },
  {
    slug: 'crochet-hook-2-5mm',
    mmSize: 2.5,
    canonicalName: '2.5 mm (UK 12)',
    ukSize: '12',
    usSize: 'C/2',
    jpSize: '3/0',
    suitableYarnWeightSlugs: ['fingering'],
  },
  {
    slug: 'crochet-hook-2-75mm',
    mmSize: 2.75,
    canonicalName: '2.75 mm (US C/2)',
    ukSize: '',
    usSize: 'C/2',
    jpSize: '',
    suitableYarnWeightSlugs: ['fingering'],
  },
  {
    slug: 'crochet-hook-3-0mm',
    mmSize: 3.0,
    canonicalName: '3.0 mm (UK 11)',
    ukSize: '11',
    usSize: 'D/3',
    jpSize: '4/0',
    suitableYarnWeightSlugs: ['fingering', 'sport'],
  },
  {
    slug: 'crochet-hook-3-25mm',
    mmSize: 3.25,
    canonicalName: '3.25 mm (UK 10, US D/3)',
    ukSize: '10',
    usSize: 'D/3',
    jpSize: '',
    suitableYarnWeightSlugs: ['fingering', 'sport'],
  },
  {
    slug: 'crochet-hook-3-5mm',
    mmSize: 3.5,
    canonicalName: '3.5 mm (UK 9, US E/4)',
    ukSize: '9',
    usSize: 'E/4',
    jpSize: '5/0',
    suitableYarnWeightSlugs: ['sport', 'dk'],
  },
  {
    slug: 'crochet-hook-3-75mm',
    mmSize: 3.75,
    canonicalName: '3.75 mm (US F/5)',
    ukSize: '',
    usSize: 'F/5',
    jpSize: '',
    suitableYarnWeightSlugs: ['dk'],
  },
  {
    slug: 'crochet-hook-4-0mm',
    mmSize: 4.0,
    canonicalName: '4.0 mm (UK 8, US G/6)',
    ukSize: '8',
    usSize: 'G/6',
    jpSize: '6/0',
    suitableYarnWeightSlugs: ['dk'],
    notes:
      'The default British DK hook. Granny squares, dishcloths, blankets — most kitchen-table British crochet uses this size.',
  },
  {
    slug: 'crochet-hook-4-5mm',
    mmSize: 4.5,
    canonicalName: '4.5 mm (UK 7, US 7)',
    ukSize: '7',
    usSize: '7',
    jpSize: '7/0',
    suitableYarnWeightSlugs: ['dk', 'aran'],
  },
  {
    slug: 'crochet-hook-5-0mm',
    mmSize: 5.0,
    canonicalName: '5.0 mm (UK 6, US H/8)',
    ukSize: '6',
    usSize: 'H/8',
    jpSize: '8/0',
    suitableYarnWeightSlugs: ['dk', 'aran'],
  },
  {
    slug: 'crochet-hook-5-5mm',
    mmSize: 5.5,
    canonicalName: '5.5 mm (UK 5, US I/9)',
    ukSize: '5',
    usSize: 'I/9',
    jpSize: '10/0',
    suitableYarnWeightSlugs: ['aran'],
  },
  {
    slug: 'crochet-hook-6-0mm',
    mmSize: 6.0,
    canonicalName: '6.0 mm (UK 4, US J/10)',
    ukSize: '4',
    usSize: 'J/10',
    jpSize: '',
    suitableYarnWeightSlugs: ['aran', 'chunky'],
  },
  {
    slug: 'crochet-hook-6-5mm',
    mmSize: 6.5,
    canonicalName: '6.5 mm (UK 3, US K/10.5)',
    ukSize: '3',
    usSize: 'K/10.5',
    jpSize: '',
    suitableYarnWeightSlugs: ['aran', 'chunky'],
  },
  {
    slug: 'crochet-hook-7-0mm',
    mmSize: 7.0,
    canonicalName: '7.0 mm (UK 2)',
    ukSize: '2',
    usSize: '',
    jpSize: '',
    suitableYarnWeightSlugs: ['chunky'],
  },
  {
    slug: 'crochet-hook-8-0mm',
    mmSize: 8.0,
    canonicalName: '8.0 mm (UK 0, US L/11)',
    ukSize: '0',
    usSize: 'L/11',
    jpSize: '',
    suitableYarnWeightSlugs: ['chunky'],
  },
  {
    slug: 'crochet-hook-9-0mm',
    mmSize: 9.0,
    canonicalName: '9.0 mm (UK 00, US M/13)',
    ukSize: '00',
    usSize: 'M/13',
    jpSize: '',
    suitableYarnWeightSlugs: ['chunky', 'super-chunky'],
  },
  {
    slug: 'crochet-hook-10-0mm',
    mmSize: 10.0,
    canonicalName: '10.0 mm (UK 000, US N/15)',
    ukSize: '000',
    usSize: 'N/15',
    jpSize: '',
    suitableYarnWeightSlugs: ['super-chunky'],
  },
  {
    slug: 'crochet-hook-12-0mm',
    mmSize: 12.0,
    canonicalName: '12.0 mm (US P/17)',
    ukSize: '',
    usSize: 'P/17',
    jpSize: '',
    suitableYarnWeightSlugs: ['super-chunky'],
  },
  {
    slug: 'crochet-hook-15-0mm',
    mmSize: 15.0,
    canonicalName: '15.0 mm (US Q)',
    ukSize: '',
    usSize: 'Q',
    jpSize: '',
    suitableYarnWeightSlugs: ['super-chunky', 'jumbo'],
  },
  {
    slug: 'crochet-hook-19-0mm',
    mmSize: 19.0,
    canonicalName: '19.0 mm (US S)',
    ukSize: '',
    usSize: 'S',
    jpSize: '',
    suitableYarnWeightSlugs: ['jumbo'],
  },
  {
    slug: 'crochet-hook-25-0mm',
    mmSize: 25.0,
    canonicalName: '25.0 mm (US U)',
    ukSize: '',
    usSize: 'U',
    jpSize: '',
    suitableYarnWeightSlugs: ['jumbo'],
    notes:
      'Statement-piece hook for chunky roving. Often used for arm-crochet projects on un-spun fibre.',
  },
]
