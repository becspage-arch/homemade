import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/public/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
} from '@/lib/seo/schema-builders'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

import './about-page.css'

export const metadata: Metadata = buildPublicMetadata({
  title: 'About Homemade',
  description:
    'Homemade is one place for everything you might want to make at home: cooking, baking, growing, herbal preparations and traditional crafts, each one written out properly.',
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
        data={[buildOrganizationSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />
      <Breadcrumbs items={breadcrumbs} />

      <header className="about-hero">
        <p className="about-eyebrow">About</p>
        <h1 className="about-title">The home of all things homemade</h1>
        <p className="about-lede">
          Homemade is one place for everything you might want to make at home.
          The bread your family actually eats. The herbs on the kitchen
          windowsill. The blanket you knit for someone you love. Recipes,
          patterns and how-tos, each one written out properly and kept somewhere
          calm enough to follow.
        </p>
      </header>

      <section className="about-section">
        <h2>The idea</h2>
        <p>
          Making things by hand is one of the good, steady pleasures, and the
          internet has made it strangely hard. The method you want is buried
          under ten minutes of video, forty photographs and someone&apos;s life
          story. The measurements contradict the comments. You give up, or you
          muddle through.
        </p>
        <p>
          Homemade is the other way round. Every recipe, every craft, every
          growing season is taken seriously and laid out with care, so you can
          find what you need and get on with the making.
        </p>
      </section>

      <blockquote className="about-quote">
        Skills worth keeping are worth teaching properly. A slower life at home
        is something to be proud of, not performed.
      </blockquote>

      <section className="about-section">
        <h2>What you&apos;ll find</h2>
        <p>
          Cooking and baking. Growing things, indoors and out. Herbal
          preparations and a natural home. Knitting, crochet, cross-stitch,
          sewing, pottery and more, with new crafts added as we go. Whatever you
          are making, the page is built the same way, so you always know where
          the ingredients are, how long it takes, and the one step you needed
          reminding of.
        </p>
      </section>

      <section className="about-section">
        <h2>How the library is made</h2>
        <p>
          Every tutorial is researched, drafted and checked against the same
          standard before it goes live: that the quantities work, the timings
          are real, the techniques link through to proper instructions, and the
          sources hold up. Where a tutorial leans on a particular book or guide,
          it says so at the bottom.
        </p>
        <p>
          We use modern tools to research and draft, and a strict set of checks
          to make sure what reaches you is accurate, original, and written in a
          real voice rather than churned-out filler.
        </p>
      </section>

      <section className="about-section">
        <h2>Made with you</h2>
        <p>
          The people who use Homemade are Makers. Some cook from it on a Tuesday
          night and never tell a soul. Some share what they have made on their
          profile, and a few write tutorials of their own. What gets made from
          these pages is the real test of whether the instructions work, and it
          shapes what we write next.
        </p>
        <p className="about-cta">
          <Link href="/makers">See what Makers are making</Link>
        </p>
      </section>
    </article>
  )
}
