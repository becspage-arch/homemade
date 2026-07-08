import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/public/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumbSchema } from '@/lib/seo/schema-builders'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { StitchGlyph } from '@/components/public/stitch-glyph'
import { getStitchReference, REFERENCE_CRAFTS } from '@/lib/stitch-reference'
import { StitchReferenceControls } from './StitchReferenceControls'

import './stitches-page.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ craft: string }>
}

function resolveCraft(slug: string) {
  return REFERENCE_CRAFTS[slug] ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { craft } = await params
  const cfg = resolveCraft(craft)
  if (!cfg) return { title: 'Stitch guide · homemade' }
  return buildPublicMetadata({
    title: `${cfg.title} stitch guide — symbols, abbreviations & how to work them`,
    description: `Every ${cfg.title.toLowerCase()} stitch in one place: what each chart symbol means, the UK and US names and abbreviations, a plain reminder of how to work it, and a link to the full lesson. Print it or save it as a PDF to keep beside any pattern.`,
    path: `/stitches/${craft}`,
    ogType: 'website',
  })
}

/**
 * /stitches/[craft] — the public stitch reference. A standalone cheat
 * sheet you can open without being inside a pattern: the chart-symbol
 * key, every stitch abbreviation (UK + US), and a one-line reminder of
 * how each stitch is worked, grouped by category and linking through to
 * the full lesson. Print-clean (Ctrl/Cmd+P → Save as PDF). Free.
 */
export default async function StitchGuidePage({ params }: PageProps) {
  const { craft: craftSlug } = await params
  const cfg = resolveCraft(craftSlug)
  if (!cfg) notFound()

  const groups = await getStitchReference(cfg.craft)
  if (groups.length === 0) notFound()

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: `${cfg.title} stitch guide`, href: `/stitches/${craftSlug}` },
  ]

  return (
    <div id="stitch-reference-root" className="stitches-page" data-terminology="uk">
      <JsonLd data={[buildBreadcrumbSchema(breadcrumbs)]} />
      <div className="no-print">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <header className="stitches-hero">
        <p className="stitches-eyebrow">Reference</p>
        <h1 className="stitches-title">{cfg.title} stitch guide</h1>
        <p className="stitches-lede">
          Every stitch in one place — what each chart symbol means, its name and abbreviation, and a
          plain reminder of how it&apos;s worked. Keep it open beside a pattern, or print it and save
          it as a PDF for the pattern folder.
        </p>
      </header>

      <StitchReferenceControls craft={craftSlug} initial="uk" />

      <section className="stitches-howto no-print" aria-label="How to use this guide">
        <p>
          A crochet chart draws the piece as a map of symbols, one per stitch. Match a symbol on your
          chart to the key below to see which stitch it is. The{' '}
          <span className="stitches-term-uk">UK</span>
          <span className="stitches-term-us">US</span> toggle switches every name and abbreviation
          between British and American terminology — worth knowing that UK{' '}
          <em>double crochet</em> and US <em>single crochet</em> are the same stitch under two names.
        </p>
      </section>

      {groups.map((group) => (
        <section key={group.category} className="stitches-group">
          <div className="stitches-group-head">
            <h2>{group.label}</h2>
            {group.blurb && <p className="stitches-group-blurb">{group.blurb}</p>}
          </div>
          <ul className="stitches-list">
            {group.stitches.map((s) => {
              const ukName = s.ukName ?? s.canonicalName
              const usName = s.usName ?? s.canonicalName
              const hasAbbr = Boolean(s.ukAbbreviation || s.usAbbreviation)
              return (
                <li key={s.slug} className="stitch-row">
                  <div className="stitch-symbol-cell" aria-hidden="true">
                    {s.chartSymbol ? (
                      <StitchGlyph craft={cfg.craft} symbol={s.chartSymbol} size={32} />
                    ) : (
                      <span className="stitch-symbol-none" title="Worked per pattern — no single chart symbol">
                        —
                      </span>
                    )}
                  </div>
                  <div className="stitch-body">
                    <div className="stitch-headline">
                      <span className="stitch-name">
                        <span className="stitches-term-uk">{ukName}</span>
                        <span className="stitches-term-us">{usName}</span>
                      </span>
                      {hasAbbr && (
                        <code className="stitch-abbr">
                          <span className="stitches-term-uk">
                            {s.ukAbbreviation ?? s.usAbbreviation}
                          </span>
                          <span className="stitches-term-us">
                            {s.usAbbreviation ?? s.ukAbbreviation}
                          </span>
                        </code>
                      )}
                    </div>
                    {s.workingSteps ? (
                      <details className="stitch-how">
                        <summary>How to work it</summary>
                        <ol className="stitch-steps">
                          {s.workingSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </details>
                    ) : (
                      s.notes && <p className="stitch-note">{s.notes}</p>
                    )}
                  </div>
                  <div className="stitch-actions no-print">
                    {s.tutorial && (
                      <Link
                        href={`/${s.tutorial.categorySlug}/${s.tutorial.slug}`}
                        className="stitch-learn-link"
                      >
                        How to →
                      </Link>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <footer className="stitches-footer no-print">
        <p>
          Working a pattern? Open the{' '}
          <Link href="/make">Studio</Link> to follow it stitch by stitch — this guide is always a tap
          away from inside it.
        </p>
      </footer>
    </div>
  )
}
