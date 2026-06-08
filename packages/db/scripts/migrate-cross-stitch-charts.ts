/**
 * One-shot migration: every legacy `crossStitchChart` TipTap node in a
 * Tutorial body becomes a canonical Pattern row + a `patternInset` node
 * pointing at it. Idempotent on re-run (skips tutorials whose nodes are
 * already `patternInset`).
 *
 * Run with:
 *   pnpm --filter @homemade/db exec tsx scripts/migrate-cross-stitch-charts.ts
 *
 * Reports a count of nodes migrated + a sample of 3 tutorial slugs
 * before/after so the worker hand-off can paste it verbatim.
 */

import {
  prisma,
  parsePatternData,
  computePatternMetrics,
  PATTERN_SCHEMA_VERSION,
  Visibility,
  type PatternData,
  type PaletteEntry,
} from '../src/index.js'

interface LegacyPaletteEntry {
  key: string
  name: string
  hex: string
  dmcCode?: string
  anchorCode?: string
  symbol?: string
  skeinEstimate?: string
}

interface LegacyCell {
  x: number
  y: number
  paletteKey: string
}

interface LegacyDefinition {
  title?: string
  caption?: string
  width: number
  height: number
  fabricCount?: number
  finishedSizeText?: string
  palette: LegacyPaletteEntry[]
  cells: LegacyCell[]
}

const FALLBACK_SYMBOLS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  '×','●','▲','◆','■','○','△','◇','□','✚','✦','✱',
]

interface BodyNode {
  type?: string
  attrs?: Record<string, unknown> | null
  content?: BodyNode[]
}

async function main() {
  const since = process.argv.includes('--all') ? undefined : undefined
  const slugSubstring = argValue('--slug')

  const where: Record<string, unknown> = {}
  if (slugSubstring) where.slug = { contains: slugSubstring }
  if (since) where.updatedAt = { gte: since }

  const tutorials = await prisma.tutorial.findMany({
    where,
    select: { id: true, slug: true, title: true, body: true, patternId: true },
  })

  let scanned = 0
  let migratedNodes = 0
  let migratedTutorials = 0
  const samples: Array<{ slug: string; before: number; after: number; patternId: string | null }> = []

  for (const t of tutorials) {
    scanned++
    const body = t.body as unknown
    if (!body || typeof body !== 'object') continue
    const rootDoc = body as BodyNode
    if (!Array.isArray(rootDoc.content)) continue

    let beforeCount = 0
    let firstPatternId: string | null = null
    const replaced: BodyNode[] = []
    for (const node of rootDoc.content) {
      if (node.type === 'crossStitchChart') {
        beforeCount++
        const def = node.attrs?.definition as LegacyDefinition | undefined
        if (!def || typeof def !== 'object') {
          replaced.push(node)
          continue
        }
        const data = legacyToPatternData(def)
        if (!data) {
          replaced.push(node)
          continue
        }

        const metrics = computePatternMetrics(data)
        const pattern = await prisma.pattern.create({
          data: {
            type: 'CROSS_STITCH',
            name: def.title?.trim() || t.title,
            description: def.caption?.trim() || undefined,
            data: data as unknown as object,
            ownerUserId: null,
            sourceTutorialId: t.id,
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
          select: { id: true },
        })
        firstPatternId = firstPatternId ?? pattern.id
        replaced.push({ type: 'patternInset', attrs: { patternId: pattern.id } })
        migratedNodes++
      } else {
        replaced.push(node)
      }
    }

    if (beforeCount > 0) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: {
          body: { ...rootDoc, content: replaced } as unknown as object,
          patternId: firstPatternId,
        },
      })
      migratedTutorials++
      if (samples.length < 3) samples.push({ slug: t.slug, before: beforeCount, after: 0, patternId: firstPatternId })
      console.log(`  ✓ ${t.slug}: ${beforeCount} chart → patternInset (${firstPatternId})`)
    }
  }

  console.log('\n— Summary —')
  console.log(`Tutorials scanned:   ${scanned}`)
  console.log(`Tutorials migrated:  ${migratedTutorials}`)
  console.log(`Chart nodes → Pattern rows: ${migratedNodes}`)
  console.log('\nSample slugs:')
  for (const s of samples) {
    console.log(`  • ${s.slug} — Pattern: ${s.patternId}`)
  }
}

function legacyToPatternData(def: LegacyDefinition): PatternData | null {
  if (!def.palette || def.palette.length === 0) return null
  if (!Array.isArray(def.cells)) return null

  const usedSymbols = new Set<string>()
  const keyToSymbol = new Map<string, string>()
  const palette: PaletteEntry[] = def.palette.map((legacy, i) => {
    let symbol = legacy.symbol?.trim() || FALLBACK_SYMBOLS[i] || legacy.key.charAt(0).toUpperCase() || 'A'
    if (usedSymbols.has(symbol)) {
      for (const s of FALLBACK_SYMBOLS) {
        if (!usedSymbols.has(s)) {
          symbol = s
          break
        }
      }
    }
    usedSymbols.add(symbol)
    keyToSymbol.set(legacy.key, symbol)
    const rgb = legacy.hex.startsWith('#') ? legacy.hex : `#${legacy.hex}`
    return {
      symbol,
      brand: 'DMC' as const,
      code: legacy.dmcCode?.trim() || legacy.anchorCode?.trim() || legacy.key.toUpperCase(),
      name: legacy.name.trim(),
      rgb,
      strandsFullCross: 2,
      strandsBackstitch: 1,
    }
  })

  const cells = def.cells
    .filter((c) => c && Number.isInteger(c.x) && Number.isInteger(c.y) && keyToSymbol.has(c.paletteKey))
    .map((c) => ({ x: c.x, y: c.y, s: keyToSymbol.get(c.paletteKey)! }))

  try {
    return parsePatternData({
      schemaVersion: PATTERN_SCHEMA_VERSION,
      type: 'CROSS_STITCH',
      grid: { width: def.width, height: def.height, cells, backstitch: [], frenchKnots: [], beads: [] },
      palette,
      fabric: { count: def.fabricCount ?? 14, colourRgb: '#F5EBD8', type: 'Aida' },
      metadata: {},
    })
  } catch (err) {
    console.warn(`  ! parsePatternData rejected legacy chart: ${String(err)}`)
    return null
  }
}

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag)
  if (i === -1) return undefined
  return process.argv[i + 1]
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
