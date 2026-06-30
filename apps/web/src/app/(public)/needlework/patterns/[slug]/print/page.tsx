import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { prisma, Visibility } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { fromStoredVectorData, storedDocument } from '@/lib/needlework/pattern'
import { buildPatternDocument } from '@/lib/needlework/engine/document'
import { patternToPrintTemplate } from '@/lib/needlework/engine/print-template'
import { PatternUnlockCta } from '@/components/public/pattern-access/PatternUnlockCta'
import './print.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Print embroidery pattern · homemade',
  robots: { index: false, follow: false },
}

const LETTER_COUNTRIES = new Set(['US', 'CA', 'MX', 'PH'])

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ paper?: string }>
}

/**
 * /needlework/patterns/[slug]/print — the printable 1:1 transfer template.
 *
 * Free with a (free) account — printing the pattern is part of the core
 * free-with-login pattern, NOT a premium action. Anonymous visitors get the
 * inline log-in/sign-up gate; the route returns them here after auth.
 *
 * Lays out, in print order: the tiled 1:1 transfer template (true-mm A4/Letter
 * pages with registration marks), a calibration sheet, the labelled colour
 * guide, the floss + stitch keys, and the worked steps. The pages print at
 * exact scale; Ctrl/Cmd+P → "Save as PDF" is the way out.
 */
export default async function NeedleworkPrintPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  const user = await getCurrentDbUser()
  if (!user) {
    return (
      <div className="nw-print nw-print--a4">
        <div className="nw-print-controls no-print">
          <PatternUnlockCta
            craftLabel="this transfer template"
            returnTo={`/needlework/patterns/${slug}/print`}
            unlocks={[
              'The 1:1 printable transfer template',
              'The labelled colour guide + floss key',
              'The full step-by-step',
            ]}
          />
        </div>
      </div>
    )
  }

  const row = await prisma.needleworkPattern.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      ownerUserId: true,
      visibility: true,
      vectorData: true,
      threadTypes: true,
      designer: { select: { displayName: true } },
    },
  })
  if (
    !row ||
    row.ownerUserId !== null ||
    !(row.visibility === Visibility.PUBLIC || row.visibility === Visibility.UNLISTED)
  ) {
    notFound()
  }

  const canonical = fromStoredVectorData(row.vectorData)
  if (!canonical) notFound()
  const doc =
    storedDocument(row.vectorData) ??
    buildPatternDocument(canonical.stitchedElements, canonical.finishedSizeMm, {
      title: row.name,
      outline: canonical.outline,
    })

  const h = await headers()
  const cc = (h.get('cf-ipcountry') ?? h.get('x-vercel-ip-country') ?? '').toUpperCase()
  const paperParam = (sp.paper ?? '').toLowerCase()
  const paper: 'A4' | 'Letter' =
    paperParam === 'letter' ? 'Letter' : paperParam === 'a4' ? 'A4' : LETTER_COUNTRIES.has(cc) ? 'Letter' : 'A4'

  const template = patternToPrintTemplate(canonical.stitchedElements, canonical.finishedSizeMm, {
    page: paper,
    // Dense patterns tile the clean derived outline, not the stitch cloud.
    outline: canonical.outline,
  })

  return (
    <div className={`nw-print nw-print--${paper.toLowerCase()}`}>
      <div className="nw-print-controls no-print">
        <strong>Print this transfer template</strong>
        <p>
          Use your browser&apos;s print dialog (Ctrl/Cmd+P) and choose &ldquo;Save as PDF&rdquo;. Print at
          <strong> 100% (actual size)</strong>, not &ldquo;fit to page&rdquo; — check the calibration square measures
          50&nbsp;mm before you trace. Paper:{' '}
          <a href="?paper=a4">A4</a> · <a href="?paper=letter">US Letter</a>
        </p>
        <p>
          <Link href={`/needlework/patterns/${slug}`}>← Back to the pattern</Link>
        </p>
      </div>

      <article className="nw-print-article">
        <header className="nw-print-header">
          <h1>{row.name}</h1>
          {row.designer?.displayName && <p className="nw-print-designer">by {row.designer.displayName}</p>}
          <p className="nw-print-size">
            Finished size {canonical.finishedSizeMm.width.toFixed(0)} × {canonical.finishedSizeMm.height.toFixed(0)} mm ·{' '}
            {template.cols * template.rows} sheet{template.cols * template.rows > 1 ? 's' : ''} ({paper})
          </p>
        </header>

        {/* Calibration sheet first — measure it before trusting the template. */}
        <section className="nw-print-page nw-print-page--calibration">
          <div className="nw-print-svg" dangerouslySetInnerHTML={{ __html: template.calibrationSvg }} />
        </section>

        {/* The tiled 1:1 transfer template. */}
        {template.pages.map((pg) => (
          <section key={pg.name} className="nw-print-page">
            <div className="nw-print-svg" dangerouslySetInnerHTML={{ __html: pg.svg }} />
          </section>
        ))}

        {/* The labelled colour guide (line art + [stitch][colour] labels). */}
        <section className="nw-print-guide">
          <h2>Colour guide</h2>
          <div className="nw-print-guide-svg" dangerouslySetInnerHTML={{ __html: doc.colourGuideSvg }} />
        </section>

        {/* Floss key. */}
        <section className="nw-print-keys">
          <h2>Floss key</h2>
          <table>
            <thead><tr><th>#</th><th>DMC</th><th>Colour</th></tr></thead>
            <tbody>
              {doc.flossKey.map((f) => (
                <tr key={f.code}>
                  <td>{f.number}</td>
                  <td>{f.code}</td>
                  <td>
                    <span className="nw-print-swatch" style={{ background: f.hex }} /> {f.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Stitch key. */}
        <section className="nw-print-keys">
          <h2>Stitch key</h2>
          <table>
            <thead><tr><th></th><th>Stitch</th><th>How</th></tr></thead>
            <tbody>
              {doc.stitchKey.map((s) => (
                <tr key={s.slug}>
                  <td><strong>{s.letter}</strong></td>
                  <td>{s.name}</td>
                  <td>{s.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Threads / materials. */}
        {row.threadTypes.length > 0 && (
          <section className="nw-print-keys">
            <h2>Threads</h2>
            <ul>{row.threadTypes.map((t: string) => <li key={t}>{t}</li>)}</ul>
          </section>
        )}

        {/* Worked steps. */}
        <section className="nw-print-steps">
          <h2>How to stitch it</h2>
          <ol>{doc.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
        </section>
      </article>
    </div>
  )
}
