import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { ContactBlock } from '../contact-block'
import { LEGAL_ENTITY } from '@/lib/legal-entity'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Acceptable Use Policy — Homemade',
  description: 'What is welcome on Homemade, and what is not.',
  path: '/legal/acceptable-use',
  ogType: 'article',
})

export default function AcceptableUsePage() {
  return (
    <article className="legal-page">
      <LegalHeader eyebrow="Acceptable use" title="Acceptable Use Policy" />

      <div className="legal-body">
        <p>
          Homemade is a community library of how-to content. This policy
          covers what you can and cannot do here. Breaking it is a breach
          of our <Link href="/legal/terms">Terms of Service</Link> and we
          can suspend or close your account in response.
        </p>

        <h2>What is welcome</h2>
        <ul>
          <li>
            Tutorials, photos, reviews, questions and answers that help
            other people make things at home.
          </li>
          <li>
            Plain-spoken feedback, including criticism, given with care for
            the person who made the thing.
          </li>
          <li>
            Errata reports that help us fix mistakes.
          </li>
          <li>
            Linking to your own site, social profile or shop where it is
            relevant and the rules below allow it.
          </li>
        </ul>

        <h2>What is not</h2>

        <h3>Illegal content</h3>
        <p>
          Do not post or link to anything illegal in the UK. This includes
          content that infringes copyright or trademarks, content that
          breaks consumer law (for example, undisclosed advertising), or
          content that could lead to harm.
        </p>

        <h3>Harassment, abuse and hate speech</h3>
        <p>
          Do not threaten, harass, dox, intimidate, demean or harm anyone.
          Hate speech aimed at people because of their race, ethnicity,
          national origin, religion, gender, gender identity, sexual
          orientation, disability or age has no place here. Disagree with
          ideas, never attack people.
        </p>

        <h3>Spam and unsolicited promotion</h3>
        <p>
          Do not post repetitive, low-quality, machine-generated or bulk
          content. Promotional content is fine inside dedicated marketplace
          areas (when those launch) and where you have explicit permission
          — for example, a creator linking to their pattern shop from their
          profile. Off-topic promotion is not.
        </p>

        <h3>Copyright and trademark infringement</h3>
        <p>
          Only upload content you have the right to share. Do not pass off
          someone else&apos;s tutorial, photograph or pattern as your own. If
          you adapt someone else&apos;s work, credit them. If you believe
          someone has infringed your rights on Homemade, follow our{' '}
          <Link href="/legal/dmca">DMCA / Takedown Policy</Link>.
        </p>

        <h3>Sexually explicit content</h3>
        <p>
          Homemade is a homemaking community, not an adult site. Nudity in
          life-drawing, breastfeeding context, or anatomical reference is
          fine where it serves the tutorial. Anything sexually explicit is
          not allowed.
        </p>

        <h3>Scraping and automated access</h3>
        <p>
          Do not scrape, crawl, or mass-download tutorials, photos, or
          patterns without our written permission. Reasonable use of public
          RSS feeds and the public API (when it launches) is welcome —
          aggressive use is not.
        </p>

        <h3>Security probing and vulnerability research</h3>
        <p>
          We welcome co-ordinated disclosure. If you have found a security
          issue, please email{' '}
          <a href={`mailto:${LEGAL_ENTITY.legalEmail}`}>{LEGAL_ENTITY.legalEmail}</a>{' '}
          and we will work with you. Do not run automated security testing
          against the live site without checking with us first, do not
          access accounts that are not yours, and do not exfiltrate data
          beyond what is needed to demonstrate the problem.
        </p>

        <h3>Misrepresentation</h3>
        <p>
          Do not impersonate someone else, claim a professional credential
          you do not hold, or knowingly post false health, food-safety, or
          safety-critical information.
        </p>

        <h2>Reporting a problem</h2>
        <p>
          Most pages with user-generated content have a &ldquo;Report&rdquo; link
          alongside reviews, photos, questions and answers. Use it. Reports
          go to a moderation queue that an editor or admin reviews. For
          serious or sensitive concerns, write to{' '}
          <a href={`mailto:${LEGAL_ENTITY.legalEmail}`}>{LEGAL_ENTITY.legalEmail}</a>.
        </p>

        <h2>What happens after a breach</h2>
        <p>
          Depending on what happened, we may: edit or remove content; hide
          it from public view while we investigate; warn the account
          holder; impose a temporary suspension; permanently close the
          account; or report serious matters to the police. We try to
          match the response to the breach and we will tell you when we
          take action against your account unless a legal obligation
          prevents us.
        </p>
      </div>

      <ContactBlock topic="general" />
    </article>
  )
}
