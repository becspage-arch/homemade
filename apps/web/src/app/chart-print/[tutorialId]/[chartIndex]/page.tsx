import { redirect, notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import type { CrossStitchChart } from '@/lib/chart-renderers/cross-stitch'
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

/**
 * Print-friendly page for the cross-stitch chart. Splits the chart into
 * A4 / Letter tiles, draws overlap stitches between pages and cut marks
 * at trim edges, includes a legend page at the end.
 *
 * The user reaches this from the chart-viewer toolbar's "Print" button.
 * They use the browser's standard print dialog (Ctrl/Cmd+P) and pick
 * "Save as PDF" to write a PDF, or print straight to paper. No PDF
 * library on the server.
 *
 * Density presets per the synthesis doc:
 *   large    40×40 cells/page
 *   medium   60×70 cells/page
 *   small    80×90 cells/page
 *
 * Symbol modes:
 *   colour       Cell fills + symbol overlay (saves nothing on ink)
 *   symbol-only  Black-and-white symbols only (ink-saver)
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

  // Walk the body to find the Nth chart node. Currently only cross-stitch
  // print is supported; other crafts fall through to a "not yet printable"
  // message rather than 404.
  const chartNodes = body.content.filter((n) =>
    n.type === 'crossStitchChart' ||
      n.type === 'craftChart' ||
      n.type === 'weavingDraft' ||
      n.type === 'calligraphyExemplar' ||
      n.type === 'origamiFoldDiagram' ||
      n.type === 'macrameKnot',
  )
  const node = chartNodes[chartIndex]
  if (!node) notFound()

  if (node.type !== 'crossStitchChart') {
    return (
      <div className="chart-print-unsupported">
        <h1>Print not yet supported for this chart type</h1>
        <p>
          Cross-stitch charts can be printed today. Print for{' '}
          {labelForType(node.type)} charts is on the roadmap.
        </p>
        <p>
          <a href={`/sign-in`}>Back</a>
        </p>
      </div>
    )
  }

  const def = node.attrs?.definition as CrossStitchChart | undefined
  if (!def || typeof def !== 'object') notFound()

  // Load the user's progress so the print can render marked cells
  // visually (small tick mark) if they want.
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
      {paper === 'letter' ? (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: '@page { size: letter portrait; margin: 0; }',
          }}
        />
      ) : null}
      <div className="chart-print-controls no-print">
        <strong>Print this chart</strong>
        <p>
          {def.title ?? 'Cross-stitch chart'} ·{' '}
          {def.width}×{def.height} stitches · {tiles.length} tile
          {tiles.length === 1 ? '' : 's'} ·{' '}
          {PAPER_LABEL[paper]} · {density} ·{' '}
          {symbol === 'symbol-only' ? 'symbol-only' : 'colour + symbol'}
        </p>
        <p className="chart-print-controls__hint">
          Use your browser&apos;s print dialog (Ctrl/Cmd+P) and pick
          &ldquo;Save as PDF&rdquo; or print straight to paper. Trim each
          tile along the dashed cut marks and tape together — the overlap
          stitches help align adjacent tiles.
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
        <ChartTilePage
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

      <LegendPage definition={def} paper={paper} />
    </div>
  )

  function buildHref(opts: { paper: PaperKey; density: DensityKey; symbol: SymbolMode }): string {
    const qs = new URLSearchParams({
      paper: opts.paper,
      density: opts.density,
      symbol: opts.symbol,
    })
    return `/chart-print/${tutorialId}/${chartIndex}?${qs.toString()}`
  }
}

function labelForType(type: string | undefined): string {
  switch (type) {
    case 'craftChart':
      return 'knitting / crochet'
    case 'weavingDraft':
      return 'weaving draft'
    case 'calligraphyExemplar':
      return 'calligraphy exemplar'
    case 'origamiFoldDiagram':
      return 'origami fold'
    case 'macrameKnot':
      return 'macramé knot'
    default:
      return 'this'
  }
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

function ChartTilePage({
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
  // Compute a per-page printable area in mm. We work in mm so the
  // browser's print scaling produces a true-to-scale chart.
  const printableMm = paper === 'a4' ? { w: 180, h: 257 } : { w: 175, h: 240 }
  // Cell size in mm — pick whichever fits, capped at 4.5mm so the
  // largest tiles still leave a margin for labels + cut marks.
  const cellMm = Math.min(
    printableMm.w / (tileWidth + 2),
    printableMm.h / (tileHeight + 4),
    4.5,
  )
  const gridWidthMm = tileWidth * cellMm
  const gridHeightMm = tileHeight * cellMm

  // Palette index
  const paletteIndex = new Map<string, { hex: string; symbol: string; name: string }>()
  definition.palette.forEach((entry, i) => {
    const symbol = entry.symbol ?? FALLBACK_SYMBOLS[i % FALLBACK_SYMBOLS.length] ?? '?'
    paletteIndex.set(entry.key, { hex: entry.hex, symbol, name: entry.name })
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
        {/* Cells */}
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
          const isOverlapCol =
            tile.startX > 0 && localX < OVERLAP_CELLS && tile.startX !== 0
          const isOverlapRow =
            tile.startY > 0 && localY < OVERLAP_CELLS && tile.startY !== 0
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
                fill={
                  symbolMode === 'symbol-only'
                    ? '#000'
                    : textOnFill(indexed.hex)
                }
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

        {/* Grid lines */}
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

        {/* Ruler labels every 10 stitches, using the chart's absolute
            coordinates rather than the tile-local ones so a stitcher can
            cross-reference tiles. */}
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

        {/* Cut marks at the trim edges */}
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
      {showTop ? (
        <line x1={0} y1={0} x2={gridWidthMm} y2={0} strokeDasharray="2 2" />
      ) : null}
      {showBottom ? (
        <line
          x1={0}
          y1={gridHeightMm}
          x2={gridWidthMm}
          y2={gridHeightMm}
          strokeDasharray="2 2"
        />
      ) : null}
      {showLeft ? (
        <line x1={0} y1={0} x2={0} y2={gridHeightMm} strokeDasharray="2 2" />
      ) : null}
      {showRight ? (
        <line
          x1={gridWidthMm}
          y1={0}
          x2={gridWidthMm}
          y2={gridHeightMm}
          strokeDasharray="2 2"
        />
      ) : null}
      {/* Crosshairs at the corners */}
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

function LegendPage({
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
