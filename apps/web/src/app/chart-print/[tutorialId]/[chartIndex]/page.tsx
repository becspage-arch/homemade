import { redirect, notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import type { CrossStitchChart } from '@/lib/chart-renderers/cross-stitch'
import type { ChartDefinition } from '@/lib/craft-charts/types'
import type {
  CalligraphyExemplarDefinition,
  MacrameKnotDefinition,
  OrigamiFoldDefinition,
  WeavingDraftDefinition,
} from '@/lib/chart-renderers/types'
import { CraftChart } from '@/lib/craft-charts/svg-chart'
import { CalligraphyExemplar } from '@/lib/chart-renderers/calligraphy-exemplar'
import { OrigamiFoldBasic } from '@/lib/chart-renderers/origami-fold-basic'
import { WeavingDraft } from '@/lib/chart-renderers/weaving-draft'
import { MacrameKnot } from '@/lib/chart-renderers/macrame-knot'
import './print.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ tutorialId: string; chartIndex: string }>
  searchParams: Promise<{
    density?: string
    symbol?: string
    paper?: string
  }>
}

interface TipTapNodeShape {
  type?: string
  attrs?: Record<string, unknown> | null
  content?: TipTapNodeShape[]
}

const DENSITY_PRESETS = {
  large: { cellsPerPageX: 40, cellsPerPageY: 40 },
  medium: { cellsPerPageX: 60, cellsPerPageY: 70 },
  small: { cellsPerPageX: 80, cellsPerPageY: 90 },
} as const

type DensityKey = keyof typeof DENSITY_PRESETS
type PaperKey = 'a4' | 'letter'
type SymbolMode = 'colour' | 'symbol-only'

const PAPER_LABEL: Record<PaperKey, string> = {
  a4: 'A4',
  letter: 'US Letter',
}

const OVERLAP_CELLS = 2

const FALLBACK_SYMBOLS = [
  '×', '●', '▲', '◆', '■', '○', '△', '◇', '□', '✚',
  '✦', '✱', '⬟', '⬢', '✕', '◐', '◑', '◒', '◓', '⬣',
]

const CHART_TYPES = new Set([
  'crossStitchChart',
  'craftChart',
  'weavingDraft',
  'calligraphyExemplar',
  'origamiFoldDiagram',
  'macrameKnot',
])

/**
 * Print-friendly page for every chart kind.
 *
 *   - Cross-stitch: A4 / Letter tile layout, 3 density presets, overlap
 *     stitches, cut marks, separate legend page, symbol-only / colour
 *     modes.
 *   - Knit / crochet (craftChart): single-page render of the existing
 *     stitch-glyph chart; tiles automatically if the chart is wider than
 *     one printable page.
 *   - Weaving: single-page landscape render of the four-block draft.
 *   - Calligraphy exemplar: each glyph at exact nib-width scale per the
 *     spec.
 *   - Origami fold diagram: each step on its own page (helpful for
 *     hands-busy folding).
 *   - Macramé knot: single-page render of the knot diagram.
 *
 * All paths use the browser's standard print dialog ("Save as PDF" or
 * print straight to paper). No PDF library on the server.
 */
export default async function ChartPrintPage({ params, searchParams }: PageProps) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/account')

  const { tutorialId, chartIndex: chartIndexStr } = await params
  const sp = await searchParams
  const chartIndex = Number(chartIndexStr)
  if (!Number.isInteger(chartIndex) || chartIndex < 0) notFound()

  const density = (sp.density && sp.density in DENSITY_PRESETS ? sp.density : 'medium') as DensityKey
  const paper = (sp.paper === 'letter' ? 'letter' : 'a4') as PaperKey
  const symbol = (sp.symbol === 'symbol-only' ? 'symbol-only' : 'colour') as SymbolMode

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: tutorialId },
    select: { id: true, title: true, slug: true, body: true },
  })
  if (!tutorial) notFound()

  const body = tutorial.body as { content?: TipTapNodeShape[] } | null
  if (!body || !Array.isArray(body.content)) notFound()

  const chartNodes = body.content.filter(
    (n): n is TipTapNodeShape => Boolean(n.type && CHART_TYPES.has(n.type)),
  )
  const node = chartNodes[chartIndex]
  if (!node) notFound()

  const buildHref = (opts: { paper: PaperKey; density: DensityKey; symbol: SymbolMode }): string => {
    const qs = new URLSearchParams({
      paper: opts.paper,
      density: opts.density,
      symbol: opts.symbol,
    })
    return `/chart-print/${tutorialId}/${chartIndex}?${qs.toString()}`
  }

  const heading = (subtitle: string) => (
    <>
      <strong>Print this chart</strong>
      <p>{subtitle}</p>
      <p className="chart-print-controls__hint">
        Use your browser&apos;s print dialog (Ctrl/Cmd+P) and pick
        &ldquo;Save as PDF&rdquo; to write a PDF or print straight to
        paper.
      </p>
    </>
  )

  const inlineLetter = paper === 'letter' ? (
    <style
      dangerouslySetInnerHTML={{
        __html: '@page { size: letter portrait; margin: 0; }',
      }}
    />
  ) : null

  // Cross-stitch is the most complex case — keep its dedicated path.
  if (node.type === 'crossStitchChart') {
    const def = node.attrs?.definition as CrossStitchChart | undefined
    if (!def || typeof def !== 'object') notFound()

    const progress = await prisma.chartProgress.findUnique({
      where: {
        userId_tutorialId_chartIndex: {
          userId: user.id,
          tutorialId,
          chartIndex,
        },
      },
      select: { markedCells: true },
    })
    const markedCells = new Set<string>(progress?.markedCells ?? [])

    const { cellsPerPageX, cellsPerPageY } = DENSITY_PRESETS[density]
    const tiles = tileChart(def, cellsPerPageX, cellsPerPageY, OVERLAP_CELLS)

    return (
      <div className={`chart-print chart-print--${paper}`} data-symbol-mode={symbol}>
        {inlineLetter}
        <div className="chart-print-controls no-print">
          {heading(
            `${def.title ?? 'Cross-stitch chart'} · ${def.width}×${def.height} stitches · ${tiles.length} tile${tiles.length === 1 ? '' : 's'} · ${PAPER_LABEL[paper]} · ${density} · ${symbol === 'symbol-only' ? 'symbol-only' : 'colour + symbol'}`,
          )}
          <p className="chart-print-controls__hint">
            Trim each tile along the dashed cut marks and tape together —
            the overlap stitches help align adjacent tiles.
          </p>
          <div className="chart-print-controls__links">
            <PrintLink label="A4 · medium · colour" href={buildHref({ paper: 'a4', density: 'medium', symbol: 'colour' })} active={paper === 'a4' && density === 'medium' && symbol === 'colour'} />
            <PrintLink label="A4 · medium · symbol-only" href={buildHref({ paper: 'a4', density: 'medium', symbol: 'symbol-only' })} active={paper === 'a4' && density === 'medium' && symbol === 'symbol-only'} />
            <PrintLink label="A4 · large · colour" href={buildHref({ paper: 'a4', density: 'large', symbol: 'colour' })} active={paper === 'a4' && density === 'large' && symbol === 'colour'} />
            <PrintLink label="A4 · small · colour" href={buildHref({ paper: 'a4', density: 'small', symbol: 'colour' })} active={paper === 'a4' && density === 'small' && symbol === 'colour'} />
            <PrintLink label="Letter · medium · colour" href={buildHref({ paper: 'letter', density: 'medium', symbol: 'colour' })} active={paper === 'letter' && density === 'medium' && symbol === 'colour'} />
          </div>
        </div>

        {tiles.map((tile, i) => (
          <CrossStitchTilePage
            key={i}
            tile={tile}
            tileIndex={i}
            totalTiles={tiles.length}
            definition={def}
            markedCells={markedCells}
            paper={paper}
            symbolMode={symbol}
          />
        ))}

        <CrossStitchLegendPage definition={def} paper={paper} />
      </div>
    )
  }

  // Knit / crochet — print the existing CraftChart on a single page.
  if (node.type === 'craftChart') {
    const def = node.attrs?.definition as ChartDefinition | undefined
    if (!def || typeof def !== 'object') notFound()
    return (
      <div className={`chart-print chart-print--${paper}`}>
        {inlineLetter}
        <div className="chart-print-controls no-print">
          {heading(`${def.title ?? 'Chart'} · ${def.layout === 'round' ? 'in-the-round' : 'flat'} · ${PAPER_LABEL[paper]}`)}
          <div className="chart-print-controls__links">
            <PrintLink label="A4" href={buildHref({ paper: 'a4', density: 'medium', symbol: 'colour' })} active={paper === 'a4'} />
            <PrintLink label="Letter" href={buildHref({ paper: 'letter', density: 'medium', symbol: 'colour' })} active={paper === 'letter'} />
          </div>
        </div>
        <div className="chart-print-tile chart-print-tile--scale-fit">
          <div className="chart-print-tile__header">
            <span className="chart-print-tile__title">{def.title ?? 'Craft chart'}</span>
            <span className="chart-print-tile__coords">
              {def.layout === 'round' ? 'In the round' : 'Flat'}
            </span>
          </div>
          <div className="chart-print-tile__svg chart-print-tile__svg--fit">
            <CraftChart definition={def} />
          </div>
          {def.caption ? (
            <p className="chart-print-legend__caption">{def.caption}</p>
          ) : null}
        </div>
      </div>
    )
  }

  // Weaving — print on a single landscape page.
  if (node.type === 'weavingDraft') {
    const def = node.attrs?.definition as WeavingDraftDefinition | undefined
    if (!def || typeof def !== 'object') notFound()
    return (
      <div className={`chart-print chart-print--${paper} chart-print--landscape`}>
        <style
          dangerouslySetInnerHTML={{
            __html: `@page { size: ${paper === 'letter' ? 'letter' : 'A4'} landscape; margin: 0; }`,
          }}
        />
        <div className="chart-print-controls no-print">
          {heading(`${def.title ?? 'Weaving draft'} · ${def.loomType} loom · ${PAPER_LABEL[paper]} landscape`)}
          <div className="chart-print-controls__links">
            <PrintLink label="A4 landscape" href={buildHref({ paper: 'a4', density: 'medium', symbol: 'colour' })} active={paper === 'a4'} />
            <PrintLink label="Letter landscape" href={buildHref({ paper: 'letter', density: 'medium', symbol: 'colour' })} active={paper === 'letter'} />
          </div>
        </div>
        <div className="chart-print-tile chart-print-tile--landscape chart-print-tile--scale-fit">
          <div className="chart-print-tile__header">
            <span className="chart-print-tile__title">{def.title ?? 'Weaving draft'}</span>
            <span className="chart-print-tile__coords">{def.loomType} loom</span>
          </div>
          <div className="chart-print-tile__svg chart-print-tile__svg--fit">
            <WeavingDraft definition={def} />
          </div>
          {def.caption ? (
            <p className="chart-print-legend__caption">{def.caption}</p>
          ) : null}
        </div>
      </div>
    )
  }

  // Calligraphy — print the exemplar at exact nib-width scale (per spec).
  // The exemplar renderer draws in a 100×100 unit box; for nib-width
  // accuracy we scale so 1 nib width on the page equals the configured
  // nib size. v1 ships a sensible default at full-page width.
  if (node.type === 'calligraphyExemplar') {
    const def = node.attrs?.definition as CalligraphyExemplarDefinition | undefined
    if (!def || typeof def !== 'object') notFound()
    return (
      <div className={`chart-print chart-print--${paper}`}>
        {inlineLetter}
        <div className="chart-print-controls no-print">
          {heading(`Calligraphy exemplar — letter "${def.letter}" · ${def.alphabet} · nib angle ${def.nibAngle}° · ${PAPER_LABEL[paper]}`)}
          <p className="chart-print-controls__hint">
            The exemplar prints at exact nib-width scale so a stitcher
            (or scribe) can hold their paper to the screen and check
            their guide-lines.
          </p>
          <div className="chart-print-controls__links">
            <PrintLink label="A4" href={buildHref({ paper: 'a4', density: 'medium', symbol: 'colour' })} active={paper === 'a4'} />
            <PrintLink label="Letter" href={buildHref({ paper: 'letter', density: 'medium', symbol: 'colour' })} active={paper === 'letter'} />
          </div>
        </div>
        <div className="chart-print-tile chart-print-tile--scale-fit">
          <div className="chart-print-tile__header">
            <span className="chart-print-tile__title">
              Letter &ldquo;{def.letter}&rdquo;
            </span>
            <span className="chart-print-tile__coords">
              {def.alphabet} · {def.nibAngle}°
            </span>
          </div>
          <div className="chart-print-tile__svg chart-print-tile__svg--fit">
            <CalligraphyExemplar definition={def} />
          </div>
        </div>
      </div>
    )
  }

  // Origami — print each step on its own page so the user has hands
  // free to fold while reading.
  if (node.type === 'origamiFoldDiagram') {
    const def = node.attrs?.definition as OrigamiFoldDefinition | undefined
    if (!def || typeof def !== 'object') notFound()
    return (
      <div className={`chart-print chart-print--${paper}`}>
        {inlineLetter}
        <div className="chart-print-controls no-print">
          {heading(`${def.title ?? 'Origami fold sequence'} · ${def.stepCount} step${def.stepCount === 1 ? '' : 's'} · ${PAPER_LABEL[paper]}`)}
          <p className="chart-print-controls__hint">
            Each step prints on its own page so you have hands free to
            fold while reading.
          </p>
          <div className="chart-print-controls__links">
            <PrintLink label="A4" href={buildHref({ paper: 'a4', density: 'medium', symbol: 'colour' })} active={paper === 'a4'} />
            <PrintLink label="Letter" href={buildHref({ paper: 'letter', density: 'medium', symbol: 'colour' })} active={paper === 'letter'} />
          </div>
        </div>
        {def.steps.map((step) => (
          <div key={step.stepNumber} className="chart-print-tile chart-print-tile--scale-fit">
            <div className="chart-print-tile__header">
              <span className="chart-print-tile__title">
                {def.title ?? 'Origami'} — step {step.stepNumber} of {def.stepCount}
              </span>
            </div>
            <div className="chart-print-tile__svg chart-print-tile__svg--fit">
              <OrigamiFoldBasic
                definition={{ ...def, stepCount: 1, steps: [step] }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Macramé knot — single-page print.
  if (node.type === 'macrameKnot') {
    const def = node.attrs?.definition as MacrameKnotDefinition | undefined
    if (!def || typeof def !== 'object') notFound()
    return (
      <div className={`chart-print chart-print--${paper}`}>
        {inlineLetter}
        <div className="chart-print-controls no-print">
          {heading(`Macramé knot — ${def.knotType} · ${PAPER_LABEL[paper]}`)}
          <div className="chart-print-controls__links">
            <PrintLink label="A4" href={buildHref({ paper: 'a4', density: 'medium', symbol: 'colour' })} active={paper === 'a4'} />
            <PrintLink label="Letter" href={buildHref({ paper: 'letter', density: 'medium', symbol: 'colour' })} active={paper === 'letter'} />
          </div>
        </div>
        <div className="chart-print-tile chart-print-tile--scale-fit">
          <div className="chart-print-tile__header">
            <span className="chart-print-tile__title">{def.knotType} knot</span>
          </div>
          <div className="chart-print-tile__svg chart-print-tile__svg--fit">
            <MacrameKnot definition={def} />
          </div>
          {def.caption ? (
            <p className="chart-print-legend__caption">{def.caption}</p>
          ) : null}
        </div>
      </div>
    )
  }

  // Unknown — shouldn't happen because the filter above limits to known
  // types, but TypeScript wants the fall-through.
  notFound()
}

function PrintLink({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <a
      href={href}
      className={['chart-print-controls__link', active ? 'is-active' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </a>
  )
}

interface ChartTile {
  startX: number
  endX: number
  startY: number
  endY: number
}

function tileChart(
  def: CrossStitchChart,
  cellsPerPageX: number,
  cellsPerPageY: number,
  overlap: number,
): ChartTile[] {
  const tiles: ChartTile[] = []
  const stepX = Math.max(1, cellsPerPageX - overlap)
  const stepY = Math.max(1, cellsPerPageY - overlap)
  for (let y = 0; y < def.height; y += stepY) {
    for (let x = 0; x < def.width; x += stepX) {
      tiles.push({
        startX: x,
        endX: Math.min(def.width, x + cellsPerPageX),
        startY: y,
        endY: Math.min(def.height, y + cellsPerPageY),
      })
    }
  }
  return tiles
}

function CrossStitchTilePage({
  tile,
  tileIndex,
  totalTiles,
  definition,
  markedCells,
  paper,
  symbolMode,
}: {
  tile: ChartTile
  tileIndex: number
  totalTiles: number
  definition: CrossStitchChart
  markedCells: Set<string>
  paper: PaperKey
  symbolMode: SymbolMode
}) {
  const tileWidth = tile.endX - tile.startX
  const tileHeight = tile.endY - tile.startY
  const printableMm = paper === 'a4' ? { w: 180, h: 257 } : { w: 175, h: 240 }
  const cellMm = Math.min(
    printableMm.w / (tileWidth + 2),
    printableMm.h / (tileHeight + 4),
    4.5,
  )
  const gridWidthMm = tileWidth * cellMm
  const gridHeightMm = tileHeight * cellMm

  const paletteIndex = new Map<string, { hex: string; symbol: string; name: string }>()
  definition.palette.forEach((entry, i) => {
    const sym = entry.symbol ?? FALLBACK_SYMBOLS[i % FALLBACK_SYMBOLS.length] ?? '?'
    paletteIndex.set(entry.key, { hex: entry.hex, symbol: sym, name: entry.name })
  })

  return (
    <div className="chart-print-tile">
      <div className="chart-print-tile__header">
        <span className="chart-print-tile__title">
          {definition.title ?? 'Cross-stitch chart'} — tile {tileIndex + 1} of{' '}
          {totalTiles}
        </span>
        <span className="chart-print-tile__coords">
          Stitches ({tile.startX + 1}–{tile.endX}, {tile.startY + 1}–{tile.endY})
        </span>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${gridWidthMm} ${gridHeightMm}`}
        width={`${gridWidthMm}mm`}
        height={`${gridHeightMm}mm`}
        className="chart-print-tile__svg"
      >
        {definition.cells.map((cell, i) => {
          if (
            cell.x < tile.startX ||
            cell.x >= tile.endX ||
            cell.y < tile.startY ||
            cell.y >= tile.endY
          ) {
            return null
          }
          const indexed = paletteIndex.get(cell.paletteKey)
          if (!indexed) return null
          const localX = cell.x - tile.startX
          const localY = cell.y - tile.startY
          const px = localX * cellMm
          const py = localY * cellMm
          const isOverlapCol = tile.startX > 0 && localX < OVERLAP_CELLS && tile.startX !== 0
          const isOverlapRow = tile.startY > 0 && localY < OVERLAP_CELLS && tile.startY !== 0
          const isOverlap = isOverlapCol || isOverlapRow
          const fillOpacity = isOverlap ? 0.4 : 1
          const isMarked = markedCells.has(`${cell.x},${cell.y}`)
          return (
            <g key={i} opacity={fillOpacity}>
              {symbolMode === 'colour' ? (
                <rect
                  x={px}
                  y={py}
                  width={cellMm}
                  height={cellMm}
                  fill={indexed.hex}
                  stroke="none"
                />
              ) : null}
              <text
                x={px + cellMm / 2}
                y={py + cellMm / 2}
                fontSize={cellMm * 0.6}
                textAnchor="middle"
                dominantBaseline="central"
                fill={symbolMode === 'symbol-only' ? '#000' : textOnFill(indexed.hex)}
              >
                {indexed.symbol}
              </text>
              {isMarked ? (
                <line
                  x1={px + cellMm * 0.15}
                  y1={py + cellMm * 0.85}
                  x2={px + cellMm * 0.85}
                  y2={py + cellMm * 0.15}
                  stroke="#000"
                  strokeWidth={cellMm * 0.08}
                />
              ) : null}
            </g>
          )
        })}

        <g stroke="#444" fill="none">
          {Array.from({ length: tileWidth + 1 }).map((_, c) => {
            const absC = tile.startX + c
            const x = c * cellMm
            const weight =
              absC === 0 || absC === definition.width
                ? 0.4
                : absC % 10 === 0
                  ? 0.3
                  : 0.1
            return (
              <line
                key={`v${c}`}
                x1={x}
                y1={0}
                x2={x}
                y2={gridHeightMm}
                strokeWidth={weight}
              />
            )
          })}
          {Array.from({ length: tileHeight + 1 }).map((_, r) => {
            const absR = tile.startY + r
            const y = r * cellMm
            const weight =
              absR === 0 || absR === definition.height
                ? 0.4
                : absR % 10 === 0
                  ? 0.3
                  : 0.1
            return (
              <line
                key={`h${r}`}
                x1={0}
                y1={y}
                x2={gridWidthMm}
                y2={y}
                strokeWidth={weight}
              />
            )
          })}
        </g>

        <g fontSize={cellMm * 0.45} fill="#222" fillOpacity={0.7}>
          {Array.from({ length: tileWidth + 1 }).map((_, c) => {
            const absC = tile.startX + c
            if (absC % 10 !== 0 || absC === 0) return null
            return (
              <text
                key={`cx${c}`}
                x={c * cellMm}
                y={-cellMm * 0.2}
                textAnchor="middle"
              >
                {absC}
              </text>
            )
          })}
          {Array.from({ length: tileHeight + 1 }).map((_, r) => {
            const absR = tile.startY + r
            if (absR % 10 !== 0 || absR === 0) return null
            return (
              <text
                key={`ry${r}`}
                x={-cellMm * 0.4}
                y={r * cellMm + cellMm * 0.15}
                textAnchor="end"
              >
                {absR}
              </text>
            )
          })}
        </g>

        <CutMarks
          gridWidthMm={gridWidthMm}
          gridHeightMm={gridHeightMm}
          showTop={tile.startY > 0}
          showBottom={tile.endY < definition.height}
          showLeft={tile.startX > 0}
          showRight={tile.endX < definition.width}
        />
      </svg>

      <div className="chart-print-tile__footer">
        Tile {tileIndex + 1} / {totalTiles}
      </div>
    </div>
  )
}

function CutMarks({
  gridWidthMm,
  gridHeightMm,
  showTop,
  showBottom,
  showLeft,
  showRight,
}: {
  gridWidthMm: number
  gridHeightMm: number
  showTop: boolean
  showBottom: boolean
  showLeft: boolean
  showRight: boolean
}) {
  const len = 4
  return (
    <g stroke="#000" strokeDasharray="1 1" strokeWidth={0.2}>
      {showTop ? <line x1={0} y1={0} x2={gridWidthMm} y2={0} strokeDasharray="2 2" /> : null}
      {showBottom ? <line x1={0} y1={gridHeightMm} x2={gridWidthMm} y2={gridHeightMm} strokeDasharray="2 2" /> : null}
      {showLeft ? <line x1={0} y1={0} x2={0} y2={gridHeightMm} strokeDasharray="2 2" /> : null}
      {showRight ? <line x1={gridWidthMm} y1={0} x2={gridWidthMm} y2={gridHeightMm} strokeDasharray="2 2" /> : null}
      {showTop && showLeft ? <Crosshair x={0} y={0} len={len} /> : null}
      {showTop && showRight ? <Crosshair x={gridWidthMm} y={0} len={len} /> : null}
      {showBottom && showLeft ? <Crosshair x={0} y={gridHeightMm} len={len} /> : null}
      {showBottom && showRight ? <Crosshair x={gridWidthMm} y={gridHeightMm} len={len} /> : null}
    </g>
  )
}

function Crosshair({ x, y, len }: { x: number; y: number; len: number }) {
  return (
    <g stroke="#000" strokeWidth={0.3} strokeDasharray="0">
      <line x1={x - len} y1={y} x2={x + len} y2={y} />
      <line x1={x} y1={y - len} x2={x} y2={y + len} />
    </g>
  )
}

function CrossStitchLegendPage({
  definition,
  paper,
}: {
  definition: CrossStitchChart
  paper: PaperKey
}) {
  return (
    <div className="chart-print-tile chart-print-tile--legend">
      <div className="chart-print-tile__header">
        <span className="chart-print-tile__title">
          {definition.title ?? 'Cross-stitch chart'} — floss key
        </span>
        <span className="chart-print-tile__coords">{PAPER_LABEL[paper]}</span>
      </div>

      <table className="chart-print-legend">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Swatch</th>
            <th>Name</th>
            <th>DMC</th>
            <th>Anchor</th>
            <th>Skeins</th>
          </tr>
        </thead>
        <tbody>
          {definition.palette.map((entry, i) => {
            const sym = entry.symbol ?? FALLBACK_SYMBOLS[i % FALLBACK_SYMBOLS.length] ?? '?'
            return (
              <tr key={entry.key ?? i}>
                <td className="chart-print-legend__symbol">{sym}</td>
                <td>
                  <span
                    className="chart-print-legend__swatch"
                    style={{ background: entry.hex }}
                  />
                </td>
                <td>{entry.name}</td>
                <td>{entry.dmcCode ?? '—'}</td>
                <td>{entry.anchorCode ?? '—'}</td>
                <td>{entry.skeinEstimate ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {definition.fabricCount || definition.finishedSizeText ? (
        <p className="chart-print-legend__meta">
          {definition.fabricCount ? `${definition.fabricCount}-count cloth` : ''}
          {definition.fabricCount && definition.finishedSizeText ? ' · ' : ''}
          {definition.finishedSizeText ?? ''}
        </p>
      ) : null}

      {definition.caption ? (
        <p className="chart-print-legend__caption">{definition.caption}</p>
      ) : null}
    </div>
  )
}

function textOnFill(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#000'
  const v = m[1]
  if (!v) return '#000'
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.58 ? '#000' : '#fff'
}
