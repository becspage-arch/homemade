import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_ENTITY } from '@/lib/legal-entity'
import { Breadcrumbs } from '@/components/public/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
} from '@/lib/seo/schema-builders'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

import './about-page.css'

export const metadata: Metadata = buildPublicMetadata({
  title: 'About Homemade — how the library is made',
  description:
    'How Homemade is built: editorial process, AI-assistance disclosure, sourcing policy and how to get in touch.',
  path: '/about',
  ogType: 'website',
})

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
  ]
  return (
    <article className="about-page">
      <JsonLd
        data={[
          buildOrganizationSchema(),
          buildBreadcrumbSchema(breadcrumbs),
        ]}
      />
      <Breadcrumbs items={breadcrumbs} />

      <header className="about-header">
        <span className="about-eyebrow">About</span>
        <h1 className="about-title">How Homemade is made</h1>
      </header>

      <section className="about-body">
        <h2>The brief</h2>
        <p>
          Homemade is a library of clear, tested instructions for making things
          yourself — cooking, baking, herbal medicine, sewing, knitting, pottery,
          growing, and the rest. Every tutorial is structured the same way so
          you always know where to find ingredients, times, technique notes,
          and the bit you actually need at 9pm on a Tuesday.
        </p>

        <h2>The editorial process</h2>
        <p>
          Every tutorial passes through one editorial pass before it goes live.
          The pass checks the recipe scales, the times are realistic, the
          technique cross-references resolve to genuine technique tutorials,
          and the sources line up with what's claimed. Where a tutorial draws on
          a specific text — a classic recipe, an extension service guide, a
          herbal materia medica — that source is cited at the bottom of the
          tutorial.
        </p>

        <h2>AI assistance, used transparently</h2>
        <p>
          Drafts of the technique copy and the first cut of most tutorial
          structures are produced with AI assistance. Every published tutorial
          is reviewed by a human editor before it goes live; if a tutorial says
          it was tested in the Homemade kitchen, garden or studio, it was. AI
          is a drafting tool, not a publishing pipeline. We do not generate
          tutorials and publish them blind.
        </p>
        <p>
          Photography is sourced from licenced libraries (Unsplash, Pexels,
          Wikimedia Commons and similar) where it makes sense, original
          photography where it doesn&apos;t, and clearly labelled procedural
          cards as a last-resort fallback. Attribution sits on the hero image
          and the source files are tracked per tutorial.
        </p>

        <h2>Makers</h2>
        <p>
          Makers are the people who use Homemade. Some publish their own
          tutorials (the verified-Maker programme). Some share what they&apos;ve
          made on their public profile under <Link href="/makers">/makers</Link>.
          Both flow into the library — the Maker projects on a tutorial page
          are the real test that the instructions work outside the kitchen
          they were written in.
        </p>

        <h2>Getting in touch</h2>
        <p>
          Privacy questions: <a href={`mailto:${LEGAL_ENTITY.dpoEmail}`}>{LEGAL_ENTITY.dpoEmail}</a>.
          Copyright takedown: see <Link href="/legal/dmca">the DMCA policy</Link>.
          Anything else: <a href={`mailto:${LEGAL_ENTITY.contactEmail}`}>{LEGAL_ENTITY.contactEmail}</a>.
        </p>

        <p>
          Homemade is run by {LEGAL_ENTITY.name} in {LEGAL_ENTITY.jurisdiction}.
          See the <Link href="/legal">legal pages</Link> for the full set of
          policies that govern how the site works.
        </p>
      </section>
    </article>
  )
}
