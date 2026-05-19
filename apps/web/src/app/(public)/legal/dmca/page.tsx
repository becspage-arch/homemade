import type { Metadata } from 'next'
import { LegalHeader } from '../legal-header'
import { ContactBlock } from '../contact-block'
import { LEGAL_ENTITY } from '@/lib/legal-entity'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

export const metadata: Metadata = buildPublicMetadata({
  title: 'DMCA / Takedown Policy — Homemade',
  description: 'How to report copyright infringement on Homemade and how counter-notices work.',
  path: '/legal/dmca',
  ogType: 'article',
})

/* TODO(legal): file the formal DMCA designated agent registration with the
 * US Copyright Office (https://www.copyright.gov/dmca-directory/) so the
 * safe-harbour applies in the US. Until then, the page below sets out the
 * notice procedure but Rebecca must register the designated agent
 * separately. See docs/ico-registration.md for the broader list of
 * compliance follow-ups. */

export default function DmcaPage() {
  return (
    <article className="legal-page">
      <LegalHeader eyebrow="DMCA" title="DMCA / Takedown Policy" />

      <div className="legal-body">
        <p>
          Homemade respects intellectual property rights. If you believe
          content on Homemade infringes your copyright, you can send us a
          takedown notice and we will look into it promptly.
        </p>

        <p>
          <em>Designated agent registration pending.</em> While we operate
          out of the UK, we accept and act on notices that follow the
          procedure below. Once we have completed the formal US Copyright
          Office designated agent registration, that contact will be listed
          here.
        </p>

        <h2>How to send a notice</h2>
        <p>
          Send a written notice to{' '}
          <a href={`mailto:${LEGAL_ENTITY.legalEmail}`}>{LEGAL_ENTITY.legalEmail}</a>{' '}
          with the subject &ldquo;Copyright infringement notice&rdquo;. Your notice
          must include all of the following — incomplete notices will
          delay our response.
        </p>
        <ol>
          <li>
            <strong>Identification of the copyrighted work.</strong> Tell
            us what work you say is being infringed. If you are claiming
            rights in multiple works, list them.
          </li>
          <li>
            <strong>Identification of the infringing content on Homemade.</strong>{' '}
            Include direct URLs to each page or asset you say infringes
            your work, along with enough detail for us to find the content
            (the section of a tutorial, the photograph in a gallery, etc.).
          </li>
          <li>
            <strong>Your contact information.</strong> Your full name,
            address, telephone number, and email address.
          </li>
          <li>
            <strong>A good-faith statement.</strong> A statement that you
            have a good-faith belief that the use of the material in the
            way complained of is not authorised by the copyright owner, its
            agent, or the law.
          </li>
          <li>
            <strong>An accurate-information statement.</strong> A statement
            that the information in your notice is accurate, and that
            (under penalty of perjury) you are authorised to act on behalf
            of the owner of the right being infringed.
          </li>
          <li>
            <strong>Your signature.</strong> A physical or electronic
            signature (typed name is fine for electronic).
          </li>
        </ol>

        <h2>What happens next</h2>
        <p>
          When we receive a complete notice, we will: acknowledge receipt
          within five working days; assess whether the notice is valid on
          its face; remove or disable access to the content while we look
          into it if the notice is plausibly valid; and tell the user who
          posted the content that their content has been removed in
          response to a copyright notice.
        </p>
        <p>
          If we decide the notice is not valid — for example, because the
          use is fair dealing, the claimant is not the rights-holder, or
          the content does not match what is alleged — we will tell you why
          and the content will stay up.
        </p>

        <h2>Counter-notice</h2>
        <p>
          If you are a Homemade user and your content was removed in
          response to a notice you believe is mistaken or misdirected, you
          can send a counter-notice. Send it to{' '}
          <a href={`mailto:${LEGAL_ENTITY.legalEmail}`}>{LEGAL_ENTITY.legalEmail}</a>{' '}
          with the subject &ldquo;Counter-notice&rdquo; and include:
        </p>
        <ol>
          <li>Identification of the removed content and the URL it used to live at.</li>
          <li>
            A statement under penalty of perjury that you have a good-faith
            belief the content was removed by mistake or misidentification.
          </li>
          <li>
            Your name, address, telephone number, and a statement that you
            consent to the jurisdiction of the courts of {LEGAL_ENTITY.jurisdiction}{' '}
            (or, if you are outside England and Wales, of the place where
            we, Homemade, may be found).
          </li>
          <li>Your signature.</li>
        </ol>
        <p>
          We will forward valid counter-notices to the original claimant.
          If we do not receive notice of a court action within 10 to 14
          working days, we may restore the content.
        </p>

        <h2>Repeat infringer policy</h2>
        <p>
          We will terminate accounts of users who are the subject of
          repeated valid copyright notices, taking into account the
          seriousness of the infringement and the user&apos;s past conduct on
          the platform.
        </p>

        <h2>Misuse</h2>
        <p>
          Filing a false notice or counter-notice is unlawful under both UK
          and US law and exposes you to liability for damages, including
          costs and lawyers&apos; fees. Please read your notice carefully before
          sending it.
        </p>
      </div>

      <ContactBlock topic="legal" />
    </article>
  )
}
