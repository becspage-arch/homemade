import { redirect } from 'next/navigation'
import { UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'
import {
  renderCrossStitchChart,
  type CrossStitchChart,
} from '@/lib/chart-renderers/cross-stitch'

export const dynamic = 'force-dynamic'

/**
 * Internal admin preview for the cross-stitch chart renderer. Hand-built
 * test chart so the rendering output can be visually verified before the
 * autopilot starts producing charts inside Needlework tutorials. No
 * server actions, no DB reads — purely a renderer smoke screen.
 *
 * Route: /admin/dev/cross-stitch-preview (admin-only).
 */
export default async function CrossStitchPreviewPage() {
  const user = await getCurrentDbUser()
  if (!user || !hasRoleAtLeast(user, UserRole.ADMIN)) {
    redirect('/admin')
  }

  const chart: CrossStitchChart = {
    title: 'Strawberry sprig — preview chart',
    caption:
      'Worked on 14-count Aida with two strands of stranded cotton. Read top-to-bottom, left-to-right.',
    width: 18,
    height: 18,
    fabricCount: 14,
    finishedSizeText: '3.3 × 3.3 cm at 14-count',
    palette: [
      {
        key: 'fruit',
        name: 'tea rose red',
        hex: '#c33a3a',
        dmcCode: '349',
        anchorCode: '13',
        skeinEstimate: '1 skein',
      },
      {
        key: 'highlight',
        name: 'apricot blush',
        hex: '#f7b7a0',
        dmcCode: '353',
        anchorCode: '6',
        skeinEstimate: '1 skein',
      },
      {
        key: 'leaf-dark',
        name: 'fern green',
        hex: '#4f7a3a',
        dmcCode: '3346',
        anchorCode: '267',
        skeinEstimate: '1 skein',
      },
      {
        key: 'leaf-light',
        name: 'soft sage',
        hex: '#9bbf7a',
        dmcCode: '522',
        anchorCode: '859',
        skeinEstimate: '1 skein',
      },
      {
        key: 'seed',
        name: 'mustard ochre',
        hex: '#e3b94c',
        dmcCode: '725',
        anchorCode: '305',
        skeinEstimate: '1 skein',
      },
    ],
    cells: buildPreviewCells(),
  }

  const svg = renderCrossStitchChart(chart)

  return (
    <div style={{ padding: '24px', maxWidth: '720px' }}>
      <h1 style={{ marginTop: 0 }}>Cross-stitch renderer preview</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Hand-built test chart for visual verification of{' '}
        <code>renderCrossStitchChart</code>. Reads top-left to bottom-right
        on an 18 × 18 grid; bold rules at every 10 stitches; the legend
        carries DMC + Anchor cross-references and a unique symbol per
        colour for monochrome readability.
      </p>
      <div
        style={{ border: '1px solid #e5e0d8', padding: 16, borderRadius: 8 }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <details style={{ marginTop: 24 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
          Raw SVG output
        </summary>
        <pre
          style={{
            background: '#f6f3ee',
            padding: 12,
            borderRadius: 6,
            overflowX: 'auto',
            fontSize: 11,
          }}
        >
          {svg}
        </pre>
      </details>
    </div>
  )
}

/**
 * Hand-placed cells for the strawberry sprig. Coordinates are 0-indexed
 * from the top-left of the 18×18 grid.
 */
function buildPreviewCells() {
  const cells: { x: number; y: number; paletteKey: string }[] = []
  const push = (x: number, y: number, paletteKey: string): void => {
    cells.push({ x, y, paletteKey })
  }

  // Leaves — top of the chart, two clusters either side of the stem.
  const leafDark: [number, number][] = [
    [6, 1], [7, 1], [8, 1],
    [5, 2], [6, 2], [7, 2], [8, 2], [9, 2],
    [10, 2], [11, 2], [12, 2],
    [11, 3], [12, 3], [13, 3],
    [13, 4],
  ]
  for (const [x, y] of leafDark) push(x, y, 'leaf-dark')

  const leafLight: [number, number][] = [
    [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3],
    [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4], [12, 4],
    [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5],
  ]
  for (const [x, y] of leafLight) push(x, y, 'leaf-light')

  // Stem (single column of fern green to anchor the fruit body).
  for (let y = 5; y <= 7; y++) push(8, y, 'leaf-dark')

  // Fruit body — heart-ish shape.
  const fruit: [number, number][] = [
    [6, 7], [7, 7], [9, 7], [10, 7],
    [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8],
    [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9], [11, 9],
    [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10],
    [6, 11], [7, 11], [8, 11], [9, 11], [10, 11],
    [7, 12], [8, 12], [9, 12],
    [8, 13],
  ]
  for (const [x, y] of fruit) push(x, y, 'fruit')

  // Highlights on the fruit body.
  const highlight: [number, number][] = [
    [6, 8], [7, 8],
    [6, 9],
  ]
  for (const [x, y] of highlight) push(x, y, 'highlight')

  // Seeds — dots of mustard scattered across the fruit.
  const seeds: [number, number][] = [
    [8, 8], [10, 9], [7, 10], [9, 10], [8, 11],
  ]
  for (const [x, y] of seeds) push(x, y, 'seed')

  return cells
}
