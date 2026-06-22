import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { CraftChart } from '@/lib/craft-charts/svg-chart'
import type { ChartDefinition } from '@/lib/craft-charts/types'
import { applyTerminology } from '@/components/studio/crochet/terminology'
import type { PatternRow, TerminologyMode } from '@/components/studio/crochet/types'
import './print.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Print crochet pattern · homemade',
  robots: { index: false, follow: false },
}

const VALID_PAPER = new Set(['a4', 'letter', 'a3', 'a2', 'a1', 'a0', 'legal'])

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ paper?: string; terminology?: string }>
}

/**
 * /studio/crochet/[slug]/print — print-friendly server render of a
 * crochet pattern. Single-page layout suitable for browser print to
 * PDF or paper. No interactivity, no Studio chrome.
 *
 * Sections (in print order):
 *
 *   1. Title + designer
 *   2. Finished size + gauge
 *   3. Materials (yarn, hook)
 *   4. Abbreviations key
 *   5. Pattern, per section
 *   6. Chart (if available)
 *
 * Reuses the same row + terminology rendering as the Studio. Paper
 * size is set via @page CSS injected from the query string. The
 * browser print dialog (Ctrl/Cmd+P) is the way out.
 */
export default async function CrochetPatternPrintPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  // Printing / downloading any pattern is a universal premium action across
  // every category. Free + signed-in makers use the on-screen Studio; taking
  // the pattern to print or PDF is premium. (Independent-designer content is
  // additionally gated on the pattern page itself via isPremiumContent.)
  const user = await getCurrentDbUser()
  if (!hasPremium(user)) {
    return (
      <div className="crochet-print crochet-print--a4">
        <div className="crochet-print-controls">
          <strong>Printing is a premium feature</strong>
          <p>
            Working a pattern on screen in the Studio is free once you&apos;re signed in. Printing
            or saving any pattern as a PDF is part of Homemade premium.
          </p>
          <p>
            <Link href="/premium">See what premium includes</Link>
            {' · '}
            <Link href={`/studio/crochet?slug=${encodeURIComponent(slug)}`}>Back to the Studio</Link>
          </p>
        </div>
      </div>
    )
  }

  const paper = sp.paper && VALID_PAPER.has(sp.paper.toLowerCase()) ? sp.paper.toLowerCase() : 'a4'
  const terminology: TerminologyMode = sp.terminology === 'us' ? 'us' : 'uk'

  const pattern = await prisma.crochetPattern.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      description: true,
      rowsStructured: true,
      chartData: true,
      gaugeText: true,
      finishedSizeText: true,
      abbreviationsUsed: true,
      craftStitchSlugs: true,
      craftTechniqueTags: true,
      terminologyConvention: true,
      designer: { select: { displayName: true } },
      primaryYarnWeight: { select: { canonicalName: true } },
      primaryHook: { select: { canonicalName: true } },
    },
  })

  if (!pattern) notFound()

  const rows = normaliseRows(pattern.rowsStructured)
  const sections: string[] = []
  for (const row of rows) {
    if (!sections.includes(row.section)) sections.push(row.section)
  }

  // Abbreviation legend rows. Joins the per-pattern abbreviation list
  // against the master Stitch table for the canonical name. Falls back
  // to the abbreviation itself when no master row exists.
  const stitchRows = await prisma.stitch.findMany({
    where: { slug: { in: pattern.craftStitchSlugs } },
    select: { ukAbbreviation: true, usAbbreviation: true, ukName: true, usName: true, canonicalName: true },
  })

  const legend: Array<{ abbr: string; term: string }> = pattern.abbreviationsUsed.map((abbr) => {
    const lower = abbr.toLowerCase()
    const match = stitchRows.find((s) => {
      const known = terminology === 'uk' ? s.ukAbbreviation : s.usAbbreviation
      return known?.toLowerCase() === lower
    })
    const term = match
      ? terminology === 'uk'
        ? match.ukName ?? match.canonicalName
        : match.usName ?? match.canonicalName
      : abbr
    return { abbr: terminology === 'uk' ? (match?.ukAbbreviation ?? abbr) : (match?.usAbbreviation ?? abbr), term }
  })

  const chart = pattern.chartData as ChartDefinition | null

  return (
    <div className={`crochet-print crochet-print--${paper}`}>
      <div className="crochet-print-controls no-print">
        <strong>Print this pattern</strong>
        <p>
          Use your browser&apos;s print dialog (Ctrl/Cmd+P) and pick &ldquo;Save as PDF&rdquo; to write a
          PDF or print straight to paper. Paper size is set in the URL: append{' '}
          <code>?paper=letter</code>, <code>?paper=a3</code>, or other size to override.
        </p>
        <p>
          Terminology:{' '}
          <a href={withQuery(sp, { terminology: 'uk' })}>UK</a> ·{' '}
          <a href={withQuery(sp, { terminology: 'us' })}>US</a>
        </p>
      </div>

      <article className="crochet-print-article">
        <header className="crochet-print-header">
          <h1>{pattern.name}</h1>
          {pattern.designer?.displayName && (
            <p className="crochet-print-designer">by {pattern.designer.displayName}</p>
          )}
          {pattern.description && (
            <p className="crochet-print-description">{pattern.description}</p>
          )}
        </header>

        <section className="crochet-print-meta">
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
          {(pattern.primaryYarnWeight?.canonicalName || pattern.primaryHook?.canonicalName) && (
            <div>
              <h2>Materials</h2>
              <ul>
                {pattern.primaryYarnWeight?.canonicalName && (
                  <li>
                    <strong>Yarn.</strong> {pattern.primaryYarnWeight.canonicalName}
                  </li>
                )}
                {pattern.primaryHook?.canonicalName && (
                  <li>
                    <strong>Hook.</strong> {pattern.primaryHook.canonicalName}
                  </li>
                )}
              </ul>
            </div>
          )}
        </section>

        {legend.length > 0 && (
          <section className="crochet-print-abbreviations">
            <h2>Abbreviations ({terminology === 'uk' ? 'UK terminology' : 'US terminology'})</h2>
            <dl>
              {legend.map((item, i) => (
                <div key={i}>
                  <dt>{item.abbr}</dt>
                  <dd>{item.term}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="crochet-print-pattern">
          <h2>Pattern</h2>
          {sections.map((section) => {
            const sectionRows = rows.filter((r) => r.section === section)
            return (
              <div key={section} className="crochet-print-section">
                {sections.length > 1 && <h3>{section}</h3>}
                <ol className="crochet-print-rows">
                  {sectionRows.map((row) => {
                    const label =
                      row.rowLabel ?? (row.isRoundNotRow ? `Round ${row.rowNumber}` : `Row ${row.rowNumber}`)
                    return (
                      <li key={`${row.section}-${row.rowNumber}`}>
                        <strong>{label}.</strong>{' '}
                        {applyTerminology(row.instruction, terminology)}
                        {(row.stitchCount !== undefined || row.stitchCountAsCluster !== undefined) && (
                          <span className="crochet-print-row-count">
                            {' ('}
                            {row.stitchCount !== undefined ? `${row.stitchCount} sts` : ''}
                            {row.stitchCount !== undefined && row.stitchCountAsCluster !== undefined ? ', ' : ''}
                            {row.stitchCountAsCluster !== undefined
                              ? `${row.stitchCountAsCluster} clusters`
                              : ''}
                            {')'}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>
            )
          })}
        </section>

        {chart && (
          <section className="crochet-print-chart">
            <h2>Chart</h2>
            <CraftChart definition={{ ...chart, terminologyConvention: terminology }} />
          </section>
        )}
      </article>
    </div>
  )
}

function normaliseRows(raw: unknown): PatternRow[] {
  if (!Array.isArray(raw)) return []
  const out: PatternRow[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const section = typeof row.section === 'string' && row.section ? row.section : 'Pattern'
    const rowNumber = typeof row.rowNumber === 'number' ? row.rowNumber : null
    const instruction = typeof row.instruction === 'string' ? row.instruction : ''
    if (rowNumber === null || !instruction) continue
    out.push({
      section,
      rowNumber,
      rowLabel: typeof row.rowLabel === 'string' ? row.rowLabel : undefined,
      instruction,
      stitchCount: typeof row.stitchCount === 'number' ? row.stitchCount : undefined,
      stitchCountAsCluster:
        typeof row.stitchCountAsCluster === 'number' ? row.stitchCountAsCluster : undefined,
      isRoundNotRow: row.isRoundNotRow === true,
    })
  }
  return out
}

function withQuery(current: Record<string, string | undefined>, overrides: Record<string, string>): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(current)) {
    if (v) qs.set(k, v)
  }
  for (const [k, v] of Object.entries(overrides)) {
    qs.set(k, v)
  }
  return `?${qs.toString()}`
}
