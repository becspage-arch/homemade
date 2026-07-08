import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StitchGlyph } from '@/components/public/stitch-glyph'
import { getStitchReference, REFERENCE_CRAFTS } from '@/lib/stitch-reference'
import { PrintButton } from './PrintButton'

import './print.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Stitch cheat sheet · homemade',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ craft: string }>
  searchParams: Promise<{ terminology?: string }>
}

/**
 * /stitches/[craft]/print — the printable cheat sheet. A compact, one-
 * thing-per-line card of symbol · name · abbreviation · working steps for
 * the quick-reference stitches only (those with authored steps). No site
 * chrome in print, no descriptions — just the method. Save as PDF from
 * the browser print dialog.
 */
export default async function StitchCheatSheetPage({ params, searchParams }: PageProps) {
  const { craft: craftSlug } = await params
  const sp = await searchParams
  const cfg = REFERENCE_CRAFTS[craftSlug]
  if (!cfg) notFound()

  const terminology: 'uk' | 'us' = sp.terminology === 'us' ? 'us' : 'uk'

  const groups = await getStitchReference(cfg.craft)
  // Cheat sheet carries only the quick-reference stitches — the ones with
  // concise authored steps. Specialty stitches live in their full lessons.
  const cheatGroups = groups
    .map((g) => ({ ...g, stitches: g.stitches.filter((s) => s.workingSteps) }))
    .filter((g) => g.stitches.length > 0)

  if (cheatGroups.length === 0) notFound()

  return (
    <div className="cheatsheet">
      <div className="cheatsheet-bar no-print">
        <div>
          <strong>{cfg.title} stitch cheat sheet</strong>
          <p>
            Save as PDF or print to paper from your browser (Ctrl/Cmd&nbsp;+&nbsp;P). Showing{' '}
            {terminology === 'uk' ? 'UK' : 'US'} terminology —{' '}
            <Link href={`/stitches/${craftSlug}/print?terminology=uk`}>UK</Link>
            {' · '}
            <Link href={`/stitches/${craftSlug}/print?terminology=us`}>US</Link>
            {' · '}
            <Link href={`/stitches/${craftSlug}`}>back to the full guide</Link>
          </p>
        </div>
        <PrintButton />
      </div>

      <article className="cheatsheet-sheet">
        <header className="cheatsheet-head">
          <h1>{cfg.title} stitch cheat sheet</h1>
          <p className="cheatsheet-sub">
            {terminology === 'uk' ? 'UK terminology' : 'US terminology'} · homemade.education
          </p>
        </header>

        <div className="cheatsheet-columns">
          {cheatGroups.map((group) => (
            <section key={group.category} className="cheatsheet-group">
              <h2>{group.label}</h2>
              {group.stitches.map((s) => {
                const name =
                  (terminology === 'uk' ? s.ukName : s.usName) ?? s.canonicalName
                const abbr =
                  (terminology === 'uk' ? s.ukAbbreviation : s.usAbbreviation) ??
                  s.ukAbbreviation ??
                  s.usAbbreviation
                return (
                  <div key={s.slug} className="cheatsheet-entry">
                    <div className="cheatsheet-entry-head">
                      <span className="cheatsheet-symbol" aria-hidden="true">
                        {s.chartSymbol ? (
                          <StitchGlyph craft={cfg.craft} symbol={s.chartSymbol} size={22} />
                        ) : null}
                      </span>
                      <span className="cheatsheet-name">{name}</span>
                      {abbr && <span className="cheatsheet-abbr">{abbr}</span>}
                    </div>
                    <ol className="cheatsheet-steps">
                      {s.workingSteps!.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )
              })}
            </section>
          ))}
        </div>
      </article>
    </div>
  )
}
