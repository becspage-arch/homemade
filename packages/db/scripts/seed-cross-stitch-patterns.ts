/**
 * Seed three hand-crafted starter patterns + the Stitching Mama designer
 * row stub. Idempotent on slug — re-running updates the pattern data
 * but never duplicates rows.
 *
 * Patterns:
 *   - "Tiny alphabet sampler"  — 30 × 12, sage + charcoal
 *   - "Garden bird silhouette" — 38 × 36, warm taupe + terracotta
 *   - "Wild flower"            — 44 × 48, sage stem + coral petals + ochre centre
 *
 * Full Stitching Mama catalogue import lives in Phase C; this stub just
 * creates the Designer row so the seed patterns + future tutorial-
 * migrated patterns have somewhere to point.
 */

import {
  prisma,
  parsePatternData,
  computePatternMetrics,
  PATTERN_SCHEMA_VERSION,
  Visibility,
  type PatternData,
  type PatternCell,
} from '../src/index.js'

async function main() {
  const designer = await prisma.designer.upsert({
    where: { slug: 'stitching-mama' },
    create: {
      slug: 'stitching-mama',
      displayName: 'Stitching Mama',
      bio: 'House label for the Homemade cross-stitch library. Full catalogue lands in Phase C.',
      isHouseDesigner: true,
    },
    update: {},
    select: { id: true, slug: true, displayName: true },
  })
  console.log(`Designer ready: ${designer.displayName} (${designer.id})`)

  const subCategory = await prisma.subCategory.findFirst({
    where: { category: { slug: 'cross-stitch' } },
    orderBy: { order: 'asc' },
    select: { id: true, slug: true, name: true },
  })

  const patterns = [tinyAlphabetSampler(), gardenBirdSilhouette(), wildFlower()]

  for (const def of patterns) {
    const data = parsePatternData(def.data)
    const metrics = computePatternMetrics(data)
    const result = await prisma.pattern.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        type: 'CROSS_STITCH',
        name: def.name,
        description: def.description,
        data: data as unknown as object,
        designerId: designer.id,
        subCategoryId: subCategory?.id ?? null,
        difficulty: def.difficulty,
        estimatedHours: def.estimatedHours,
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
        widthCells: metrics.widthCells,
        heightCells: metrics.heightCells,
        colourCount: metrics.colourCount,
        totalStitches: metrics.totalStitches,
        hasBackstitch: metrics.hasBackstitch,
        hasFrenchKnots: metrics.hasFrenchKnots,
        hasBeads: metrics.hasBeads,
        hasQuarterStitches: metrics.hasQuarterStitches,
        fabricCountSuggested: data.fabric.count,
      },
      update: {
        name: def.name,
        description: def.description,
        data: data as unknown as object,
        difficulty: def.difficulty,
        estimatedHours: def.estimatedHours,
        widthCells: metrics.widthCells,
        heightCells: metrics.heightCells,
        colourCount: metrics.colourCount,
        totalStitches: metrics.totalStitches,
        hasBackstitch: metrics.hasBackstitch,
        hasFrenchKnots: metrics.hasFrenchKnots,
        hasBeads: metrics.hasBeads,
        hasQuarterStitches: metrics.hasQuarterStitches,
        fabricCountSuggested: data.fabric.count,
      },
      select: { id: true, slug: true, name: true },
    })
    console.log(`  ✓ ${result.slug} — ${result.name} (${result.id})`)
  }

  console.log('Seed complete.')
}

interface SeedPattern {
  slug: string
  name: string
  description: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedHours: number
  data: PatternData
}

function tinyAlphabetSampler(): SeedPattern {
  // A six-letter "stitch" set (the word STITCH itself) — a tiny first
  // project. Two colours. ~120 stitches.
  const W = 30
  const H = 12
  const cells: PatternCell[] = []
  const place = (x: number, y: number, s: string) => cells.push({ x, y, s })

  // Border frame in sage.
  for (let x = 0; x < W; x++) {
    place(x, 0, 'A')
    place(x, H - 1, 'A')
  }
  for (let y = 0; y < H; y++) {
    place(0, y, 'A')
    place(W - 1, y, 'A')
  }

  // Letters — 5×7 cell glyphs centred. Use B (charcoal) for the strokes.
  const glyphs: Record<string, string[]> = {
    S: ['01110', '10001', '10000', '01110', '00001', '10001', '01110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  }
  const word = ['S', 'T', 'I', 'T', 'C', 'H']
  let x0 = 2
  for (const letter of word) {
    const rows = glyphs[letter]
    if (!rows) continue
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r]!
      for (let c = 0; c < row.length; c++) {
        if (row.charAt(c) === '1') place(x0 + c, 2 + r, 'B')
      }
    }
    x0 += 6
  }

  return {
    slug: 'tiny-alphabet-sampler',
    name: 'Tiny alphabet sampler',
    description: 'A first-stitch sampler — six letters in a sage border. Designed to learn the X-shape in one sitting.',
    difficulty: 'BEGINNER',
    estimatedHours: 1,
    data: {
      schemaVersion: PATTERN_SCHEMA_VERSION,
      type: 'CROSS_STITCH',
      grid: { width: W, height: H, cells, backstitch: [], frenchKnots: [], beads: [] },
      palette: [
        { symbol: 'A', brand: 'DMC', code: '522', name: 'Fern green', rgb: '#8a9778', strandsFullCross: 2, strandsBackstitch: 1 },
        { symbol: 'B', brand: 'DMC', code: '310', name: 'Black', rgb: '#000000', strandsFullCross: 2, strandsBackstitch: 1 },
      ],
      fabric: { count: 14, colourRgb: '#F5EBD8', type: 'Aida' },
      metadata: { designer: 'Stitching Mama', year: 2026, license: 'LIBRARY_FREE' },
    },
  }
}

function gardenBirdSilhouette(): SeedPattern {
  // A simple full-bodied bird in a single warm-taupe colour, with a
  // terracotta belly. 38 × 36, ~330 stitches.
  const W = 38
  const H = 36
  const cells: PatternCell[] = []

  // Bird shape — body, head, wing, tail. Drawn as boolean rows.
  const rows = [
    '......................................',
    '..............████████................',
    '...........██████████████.............',
    '.........████████████████████.........',
    '.......████████████████████████.......',
    '......██████████████████████████......',
    '.....█████████████████████████████....',
    '...████████████████████████████████...',
    '..██████████████████████████████████..',
    '.████████████████████████████████████.',
    '████████████████████████████████████..',
    '████████████████████████████████████..',
    '████████████████████████████████████..',
    '.████████████████████████████████████.',
    '..██████████████████████████████████..',
    '..██████████████████████████████████..',
    '..██████████████████████████████████..',
    '..██████████████████████████████████..',
    '...████████████████████████████████...',
    '...████████████████████████████████...',
    '....██████████████████████████████....',
    '....██████████████████████████████....',
    '....██████████████████████████████....',
    '.....████████████████████████████.....',
    '.....████████████████████████████.....',
    '......██████████████████████████......',
    '......██████████████████████████......',
    '.......████████████████████████.......',
    '........██████████████████████........',
    '.........████████████████████.........',
    '..........██████████████████..........',
    '...........████████████████...........',
    '............██████████████............',
    '..............██████████..............',
    '...............████████...............',
    '................██████................',
  ]
  for (let y = 0; y < rows.length && y < H; y++) {
    const row = rows[y]!
    for (let x = 0; x < row.length && x < W; x++) {
      if (row.charAt(x) === '█') {
        // Belly in terracotta — middle ⅓ of the bird body.
        if (y >= 10 && y <= 20 && x >= 12 && x <= 26) {
          cells.push({ x, y, s: 'B' })
        } else {
          cells.push({ x, y, s: 'A' })
        }
      }
    }
  }
  // Eye — single black knot
  const frenchKnots = [{ x: 8, y: 9, s: 'C' }]
  // Beak — short back-stitch line
  const backstitch = [{ x1: 2, y1: 10, x2: 0, y2: 11, s: 'C' }]

  return {
    slug: 'garden-bird-silhouette',
    name: 'Garden bird silhouette',
    description: 'A round-bellied garden bird in warm taupe and terracotta. A weekend project at 14-count.',
    difficulty: 'BEGINNER',
    estimatedHours: 4,
    data: {
      schemaVersion: PATTERN_SCHEMA_VERSION,
      type: 'CROSS_STITCH',
      grid: { width: W, height: H, cells, backstitch, frenchKnots, beads: [] },
      palette: [
        { symbol: 'A', brand: 'DMC', code: '840', name: 'Medium beige brown', rgb: '#937a5e', strandsFullCross: 2, strandsBackstitch: 1 },
        { symbol: 'B', brand: 'DMC', code: '356', name: 'Terracotta', rgb: '#b8624d', strandsFullCross: 2, strandsBackstitch: 1 },
        { symbol: 'C', brand: 'DMC', code: '310', name: 'Black', rgb: '#000000', strandsFullCross: 2, strandsBackstitch: 1 },
      ],
      fabric: { count: 14, colourRgb: '#F5EBD8', type: 'Aida' },
      metadata: { designer: 'Stitching Mama', year: 2026, license: 'LIBRARY_FREE' },
    },
  }
}

function wildFlower(): SeedPattern {
  // A single stem with 5 coral petals and a sage stem. 44 × 48, ~640
  // stitches. Six colours total.
  const W = 44
  const H = 48
  const cells: PatternCell[] = []
  const place = (x: number, y: number, s: string) => {
    if (x >= 0 && x < W && y >= 0 && y < H) cells.push({ x, y, s })
  }

  // Stem in sage — vertical centre line with two leaves.
  for (let y = 22; y < 46; y++) {
    place(22, y, 'A')
    if (y > 24 && y < 44) place(21, y, 'B')
  }
  // Left leaf
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j <= i; j++) place(17 + j, 30 + i, 'B')
    for (let j = 0; j <= i; j++) place(17 + j, 34 - i, 'B')
  }
  // Right leaf
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j <= i; j++) place(27 - j, 36 + i, 'B')
    for (let j = 0; j <= i; j++) place(27 - j, 40 - i, 'B')
  }

  // Five coral petals around (22, 14) — each petal is a 7-cell teardrop.
  const petalCentres = [
    { cx: 22, cy: 8, angle: 0 },
    { cx: 16, cy: 12, angle: 1 },
    { cx: 19, cy: 19, angle: 2 },
    { cx: 25, cy: 19, angle: 3 },
    { cx: 28, cy: 12, angle: 4 },
  ]
  for (const { cx, cy } of petalCentres) {
    for (let dy = -3; dy <= 3; dy++) {
      const halfWidth = 3 - Math.abs(dy)
      for (let dx = -halfWidth; dx <= halfWidth; dx++) {
        place(cx + dx, cy + dy, 'C')
      }
    }
    // Petal highlight — soft cream centre
    place(cx, cy, 'D')
    place(cx + 1, cy, 'D')
    place(cx, cy - 1, 'D')
  }

  // Centre — ochre yellow disc, 3-cell radius
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 3) place(22 + dx, 14 + dy, 'E')
    }
  }
  // Three French knots in the centre for texture
  const frenchKnots = [
    { x: 22, y: 14, s: 'F' },
    { x: 21, y: 13, s: 'F' },
    { x: 23, y: 15, s: 'F' },
  ]

  return {
    slug: 'wild-flower',
    name: 'Wild flower',
    description: 'A single stem with five coral petals and a sage leaf pair. French knots at the centre add a small texture detail.',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 6,
    data: {
      schemaVersion: PATTERN_SCHEMA_VERSION,
      type: 'CROSS_STITCH',
      grid: { width: W, height: H, cells, backstitch: [], frenchKnots, beads: [] },
      palette: [
        { symbol: 'A', brand: 'DMC', code: '935', name: 'Dark avocado green', rgb: '#48631c', strandsFullCross: 2, strandsBackstitch: 1 },
        { symbol: 'B', brand: 'DMC', code: '522', name: 'Fern green', rgb: '#8a9778', strandsFullCross: 2, strandsBackstitch: 1 },
        { symbol: 'C', brand: 'DMC', code: '350', name: 'Medium coral', rgb: '#e36459', strandsFullCross: 2, strandsBackstitch: 1 },
        { symbol: 'D', brand: 'DMC', code: '353', name: 'Peach', rgb: '#f7c0ab', strandsFullCross: 2, strandsBackstitch: 1 },
        { symbol: 'E', brand: 'DMC', code: '725', name: 'Topaz', rgb: '#eebe45', strandsFullCross: 2, strandsBackstitch: 1 },
        { symbol: 'F', brand: 'DMC', code: '780', name: 'Very dark topaz', rgb: '#8e631c', strandsFullCross: 2, strandsBackstitch: 1 },
      ],
      fabric: { count: 14, colourRgb: '#F5EBD8', type: 'Aida' },
      metadata: { designer: 'Stitching Mama', year: 2026, license: 'LIBRARY_FREE' },
    },
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
