import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/public/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
} from '@/lib/seo/schema-builders'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

// Sibling to /about: same editorial shell, same type scale, same spacing.
// Reusing the stylesheet keeps the two pages identical rather than nearly so.
import '../../about/about-page.css'

export const metadata: Metadata = buildPublicMetadata({
  title: 'How the cross-stitch library is made',
  description:
    'Where the cross-stitch patterns come from: original designs made here, converted into counted floss charts, checked by eye before publication. Every image on the site is the chart itself.',
  path: '/cross-stitch/about-the-library',
  ogType: 'website',
})

/**
 * /cross-stitch/about-the-library — provenance.
 *
 * Plain, factual account of how the pattern library is made, linked from the
 * cross-stitch category intro and from the line under every pattern hero. It
 * exists because the one thing a visitor cannot check for themselves is
 * whether the picture on a listing is the chart or a rendering of it, and our
 * answer is the strong one: it is the chart.
 */
export default function CrossStitchProvenancePage() {
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Cross-stitch', href: '/cross-stitch' },
    { name: 'How the library is made', href: '/cross-stitch/about-the-library' },
  ]

  return (
    <article className="about-page">
      <JsonLd data={[buildOrganizationSchema(), buildBreadcrumbSchema(breadcrumbs)]} />
      <Breadcrumbs items={breadcrumbs} />

      <header className="about-hero">
        <p className="about-eyebrow">Cross-stitch</p>
        <h1 className="about-title">How the library is made</h1>
        <p className="about-lede">
          Every pattern in the cross-stitch library is an original design made here.
          This page sets out how each one is made and what has to be true before it is
          published.
        </p>
      </header>

      <section className="about-section">
        <h2>Where the designs come from</h2>
        <p>
          The patterns are original. Nothing is traced from another designer&apos;s chart
          and nothing is scanned out of a printed book. A design begins as artwork made
          for this library. That artwork is then converted into a counted chart: a grid
          of squares where each square holds one stitch in one floss colour, with the
          colours chosen from real stranded cotton shades rather than screen colours.
        </p>
      </section>

      <section className="about-section">
        <h2>Every image is the chart</h2>
        <p>
          The picture you see on a pattern page is the chart itself, drawn from the same
          grid of squares you will stitch. It is never a mock-up of a finished piece.
          Count the squares in the image and you are counting the stitches in the
          pattern.
        </p>
        <p>
          The finished size and the floss list on the page are read off that same chart.
          The stitch counts per colour, the number of skeins and the finished measurements
          all come from the grid, so they change when you change the fabric count and
          agree with what you will actually use.
        </p>
      </section>

      <section className="about-section">
        <h2>Checked by eye</h2>
        <p>
          Before a design is published, a person looks at the picture. Does a face still
          read as a face at stitching size? Do the colours separate, or run into one
          another? Does a shape hold together once it is squares rather than smooth
          lines? Is the floss list short enough to be worth stitching?
        </p>
        <p>
          A design that fails is rejected rather than tidied up and pushed out. That is
          why the library grows at the pace it does.
        </p>
      </section>

      <section className="about-section">
        <h2>Making your own</h2>
        <p>
          Members can put a photograph or a written idea through the same conversion and
          get a chart back: the grid, the floss list and the finished size, ready to open
          in the Studio and stitch. It is made the way the library&apos;s charts are made.
        </p>
        <p className="about-cta">
          <Link href="/cross-stitch">Browse the cross-stitch library</Link>
        </p>
      </section>
    </article>
  )
}
