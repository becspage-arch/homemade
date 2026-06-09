import type { Metadata } from 'next'

import { renderKnittingChartSvg } from '@/lib/knitting/renderer'
import {
  loadKnittingPatternForStudio,
  loadDemoKnittingPattern,
} from '@/lib/knitting/load-pattern'
import './print.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Print knitting pattern · homemade',
  robots: { index: false, follow: false },
}

const VALID_PAPER = new Set(['a4', 'letter', 'a3', 'legal'])

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ paper?: string; bw?: string; nokey?: string; demo?: string }>
}

/**
 * /studio/knitting/[slug]/print — print-friendly server render of a
 * knitting pattern. Single-page layout suitable for browser print to
 * PDF or paper. No interactivity, no Studio chrome.
 *
 * Sections (in print order):
 *
 *   1. Title + designer
 *   2. Finished size + gauge
 *   3. Materials (yarn, needles, cast-on / bind-off)
 *   4. Abbreviations key
 *   5. Pattern, per section
 *   6. Chart (if available, with B&W toggle)
 *
 * Paper size + B&W + hide-key toggles via query string:
 *   ?paper=letter         — switch paper size
 *   ?bw=1                 — render the chart with the PRINT theme
 *   ?nokey=1              — hide the chart key
 *
 * v1: ?demo=1 routes to the demo pattern for smoke-testing. Once a
 * dedicated KnittingPattern model lands the demo branch goes away.
 */
export default async function KnittingPatternPrintPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  const paper =
    sp.paper && VALID_PAPER.has(sp.paper.toLowerCase()) ? sp.paper.toLowerCase() : 'a4'
  const bw = sp.bw === '1'
  const showKey = sp.nokey !== '1'

  const pattern =
    sp.demo === '1'
      ? loadDemoKnittingPattern()
      : await loadKnittingPatternForStudio({ slug })

  if (!pattern) {
    // v1: fall through to demo so the print route returns 200 with a
    // friendly explainer. Real not-found path is K-4 once knitting
    // patterns live in their own table.
    const demo = loadDemoKnittingPattern()
    return renderPrint({ pattern: demo, paper, bw, showKey, notice: 'Showing the sample pattern — no pattern matches this slug yet.' })
  }

  return renderPrint({ pattern, paper, bw, showKey, notice: null })
}

function renderPrint({
  pattern,
  paper,
  bw,
  showKey,
  notice,
}: {
  pattern: NonNullable<Awaited<ReturnType<typeof loadKnittingPatternForStudio>>>
  paper: string
  bw: boolean
  showKey: boolean
  notice: string | null
}) {
  const rows = pattern.rowsStructured
  const sections: string[] = []
  for (const row of rows) {
    if (!sections.includes(row.section)) sections.push(row.section)
  }

  const chartRender = pattern.chartData
    ? renderKnittingChartSvg(pattern.chartData, {
        theme: bw ? 'PRINT' : 'DEFAULT',
        showChartKey: showKey,
        showRowNumbers: true,
        showStitchCount: true,
      })
    : null

  return (
    <div className={`knit-print knit-print--${paper}${bw ? ' knit-print--bw' : ''}`}>
      <div className="knit-print-controls no-print">
        <strong>Print this pattern</strong>
        <p>
          Use your browser&apos;s print dialog (Ctrl/Cmd+P) and pick &ldquo;Save as
          PDF&rdquo; to write a PDF or print straight to paper. Paper size and
          B&amp;W are set in the URL: append <code>?paper=letter</code> or
          <code> ?bw=1</code> to override. Hide the chart key with{' '}
          <code>?nokey=1</code>.
        </p>
        {notice && <p style={{ color: '#8a4f1f' }}>{notice}</p>}
      </div>

      <article className="knit-print-article">
        <header className="knit-print-header">
          <h1>{pattern.name}</h1>
          {pattern.designerName && (
            <p className="knit-print-designer">by {pattern.designerName}</p>
          )}
          {pattern.description && (
            <p className="knit-print-description">{pattern.description}</p>
          )}
        </header>

        <section className="knit-print-meta">
          {pattern.finishedSizeText && (
            <div>
              <h2>Finished size</h2>
              <p>{pattern.finishedSizeText}</p>
            </div>
          )}
          {pattern.gaugeText && (
            <div>
              <h2>Gauge</h2>
              <p>{pattern.gaugeText}</p>
            </div>
          )}
          {(pattern.primaryYarnWeightName ||
            pattern.primaryNeedleMm ||
            pattern.castOnMethod ||
            pattern.bindOffMethod) && (
            <div>
              <h2>Materials &amp; methods</h2>
              <ul>
                {pattern.primaryYarnWeightName && (
                  <li>
                    <strong>Yarn.</strong> {pattern.primaryYarnWeightName}
                  </li>
                )}
                {pattern.primaryNeedleMm && (
                  <li>
                    <strong>Needles.</strong> {pattern.primaryNeedleMm} mm
                    {pattern.primaryNeedleName ? ` (${pattern.primaryNeedleName})` : ''}
                  </li>
                )}
                {pattern.castOnMethod && (
                  <li>
                    <strong>Cast on.</strong> {humanise(pattern.castOnMethod)}
                  </li>
                )}
                {pattern.bindOffMethod && (
                  <li>
                    <strong>Bind off.</strong> {humanise(pattern.bindOffMethod)}
                  </li>
                )}
              </ul>
            </div>
          )}
        </section>

        {pattern.abbreviationsUsed.length > 0 && (
          <section className="knit-print-abbreviations">
            <h2>Abbreviations</h2>
            <dl>
              {pattern.abbreviationsUsed.map((abbr) => (
                <div key={abbr}>
                  <dt>{abbr}</dt>
                  <dd />
                </div>
              ))}
            </dl>
          </section>
        )}

        {rows.length > 0 && (
          <section className="knit-print-pattern">
            <h2>Pattern</h2>
            {sections.map((section) => {
              const sectionRows = rows.filter((r) => r.section === section)
              return (
                <div key={section} className="knit-print-section">
                  {sections.length > 1 && <h3>{section}</h3>}
                  <ol className="knit-print-rows">
                    {sectionRows.map((row) => {
                      const label =
                        row.rowLabel ??
                        (row.isRoundNotRow ? `Round ${row.rowNumber}` : `Row ${row.rowNumber}`)
                      return (
                        <li key={`${row.section}-${row.rowNumber}`}>
                          <strong>{label}.</strong> {row.instruction}
                          {row.stitchCount != null && (
                            <span className="knit-print-row-count"> ({row.stitchCount} sts)</span>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )
            })}
          </section>
        )}

        {chartRender && (
          <section className={`knit-print-chart${showKey ? '' : ' knit-print-chart--nokey'}`}>
            <h2>Chart</h2>
            <div
              className="knit-print-chart-svg"
              dangerouslySetInnerHTML={{ __html: chartRender.svg }}
            />
          </section>
        )}

        <footer className="knit-print-footer">
          <p>homemade.education{pattern.slug ? ` · ${pattern.slug}` : ''}</p>
        </footer>
      </article>
    </div>
  )
}

function humanise(method: string): string {
  return method
    .toLowerCase()
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}
