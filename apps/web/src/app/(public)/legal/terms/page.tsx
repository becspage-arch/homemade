import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { ContactBlock } from '../contact-block'
import { LEGAL_ENTITY } from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Terms of Service — Homemade',
  description: 'The rules of using Homemade.',
}

export default function TermsPage() {
  return (
    <article className="legal-page">
      <LegalHeader eyebrow="Terms" title="Terms of Service" />

      <div className="legal-toc" aria-labelledby="terms-toc-title">
        <div className="legal-toc-title" id="terms-toc-title">On this page</div>
        <ol>
          <li><a href="#who-we-are">1. Who we are</a></li>
          <li><a href="#the-service">2. The service</a></li>
          <li><a href="#your-account">3. Your account</a></li>
          <li><a href="#acceptable-use">4. Acceptable use</a></li>
          <li><a href="#your-content">5. Your content and the licence you grant us</a></li>
          <li><a href="#our-content">6. Our content</a></li>
          <li><a href="#premium">7. Premium subscription</a></li>
          <li><a href="#disclaimers">8. Disclaimers</a></li>
          <li><a href="#liability">9. Limitation of liability</a></li>
          <li><a href="#termination">10. Termination</a></li>
          <li><a href="#governing-law">11. Governing law and disputes</a></li>
          <li><a href="#changes">12. Changes to these terms</a></li>
        </ol>
      </div>

      <div className="legal-body">
        <h2 id="who-we-are">1. Who we are</h2>
        <p>
          Homemade is run by {LEGAL_ENTITY.name}. When these terms say
          "we", "us" or "our", they mean Homemade. When they say "you" or
          "your", they mean you, the person using the site or the apps.
        </p>

        <h2 id="the-service">2. The service</h2>
        <p>
          Homemade is a community library of tutorials, recipes and patterns
          for making things at home — gardening, cooking, baking, crochet,
          knitting, weaving, repair, and adjacent crafts. We also run a
          creator programme and pattern-testing scheme that some members
          can join. By using the service you agree to these terms.
        </p>

        <h2 id="your-account">3. Your account</h2>
        <ul>
          <li>One account per person.</li>
          <li>
            You must be at least 16 years old. Younger users can use the
            site through a parent or carer's account.
          </li>
          <li>Give accurate information when you sign up.</li>
          <li>
            Keep your password to yourself. You are responsible for what
            happens on your account.
          </li>
          <li>
            Tell us promptly if you think someone has used your account
            without permission, at{' '}
            <a href={`mailto:${LEGAL_ENTITY.contactEmail}`}>{LEGAL_ENTITY.contactEmail}</a>.
          </li>
        </ul>

        <h2 id="acceptable-use">4. Acceptable use</h2>
        <p>
          You agree to use Homemade within the bounds of our{' '}
          <Link href="/legal/acceptable-use">Acceptable Use Policy</Link>.
          That policy forms part of these terms, and breaking it is a breach
          of these terms.
        </p>

        <h2 id="your-content">5. Your content and the licence you grant us</h2>
        <p>
          You keep ownership of anything you create on Homemade — your
          reviews, photos, questions, answers, errata reports, project
          notes, and any other contributions you publish. To run the
          service, we need a licence to use that content.
        </p>

        <p>
          By submitting content to Homemade, you grant {LEGAL_ENTITY.name} a{' '}
          <strong>
            perpetual, irrevocable, worldwide, royalty-free, sublicensable
            licence
          </strong>{' '}
          to use, reproduce, modify (including resizing, cropping, and
          colour-correction), distribute, publish, translate, and display
          your content in connection with the Homemade service and any
          marketing of the service.
        </p>

        <p>
          "Marketing" includes social media posts, email newsletters,
          printed materials, paid advertising, and case studies. Where we
          show your content publicly we will credit you using your display
          handle (or your name where you have asked us to).
        </p>

        <p>
          You warrant that you own — or have permission to grant — the
          rights to anything you submit. This includes any people, products
          or locations shown in photographs. If a person appears in a photo
          you upload, you confirm you have their consent to do so.
        </p>

        <p>
          You can remove content from the site at any time. Removal takes
          effect from the moment it is processed and stops future uses.
          Past uses — for example, marketing materials that have already
          been printed, social posts already published, or advertising
          already paid for — are not retroactively withdrawn by removing
          content from the site. Your UK GDPR right to erasure of personal
          data sits alongside this licence: we will always honour requests
          to remove identifying information about you, and the licence does
          not give us the right to keep personal data after you have asked
          for it to be deleted.
        </p>

        <h2 id="our-content">6. Our content</h2>
        <p>
          The tutorials we author or commission, the editorial articles, the
          glossary, the design and branding of the site, and the Homemade
          name and wordmark are owned by {LEGAL_ENTITY.name} or our
          licensors. Creator-authored tutorials are owned by their authors
          and licensed to us under the creator programme terms; the
          attribution on each tutorial shows who authored it.
        </p>
        <p>
          You may save tutorials for personal use, print them for your own
          reference, and share short quotations with attribution. You may
          not republish, resell, or systematically scrape our content
          without written permission.
        </p>

        <h2 id="premium">7. Premium subscription</h2>
        <p>
          A paid premium tier is planned. When it launches, paid features
          will be governed by the{' '}
          <Link href="/legal/subscription-terms">Subscription Terms</Link>{' '}
          in addition to these terms.
        </p>

        <h2 id="disclaimers">8. Disclaimers</h2>
        <p>
          Tutorials on Homemade are guidance, not professional advice. Where
          a tutorial covers food preparation, gardening with chemicals or
          sharp tools, woodwork, electrical or plumbing work, or anything
          else with a risk profile, the responsibility for following safe
          practice rests with you. We do not warrant that every tutorial
          will suit your circumstances, your equipment, your ingredients,
          or your skill level.
        </p>
        <p>
          If you have allergies or specific dietary requirements, read
          ingredient lists carefully — we cannot guarantee a recipe is
          allergen-free even when it is labelled as such, because of cross-
          contamination risks outside our control. If you are unsure
          whether a project is safe for you, please seek professional
          advice.
        </p>
        <p>
          The service is provided "as is" and "as available". We do our
          best to keep it running but we do not promise uninterrupted
          access.
        </p>

        <h2 id="liability">9. Limitation of liability</h2>
        <p>
          Nothing in these terms excludes liability that cannot be excluded
          under UK law — including liability for death or personal injury
          caused by our negligence, fraud, or any other liability that
          consumer law in your jurisdiction does not allow us to limit.
        </p>
        <p>
          Subject to that, we are not liable for indirect or consequential
          loss, loss of profits, loss of goodwill, loss of data, or losses
          that were not reasonably foreseeable when you started using
          Homemade. Our total liability to you under or in connection with
          these terms is limited to the amount you have paid us in the 12
          months before the event giving rise to the claim, or £100,
          whichever is greater.
        </p>

        <h2 id="termination">10. Termination</h2>
        <p>
          You can close your account at any time from the{' '}
          <Link href="/me/data-rights">Data rights centre</Link>. We can
          suspend or close your account if you breach these terms or our{' '}
          <Link href="/legal/acceptable-use">Acceptable Use Policy</Link>.
          When we close an account for cause we will tell you why, unless
          a legal obligation prevents us from doing so.
        </p>

        <h2 id="governing-law">11. Governing law and disputes</h2>
        <p>
          These terms are governed by the laws of {LEGAL_ENTITY.jurisdiction}.
          If something goes wrong, please write to us first at{' '}
          <a href={`mailto:${LEGAL_ENTITY.legalEmail}`}>{LEGAL_ENTITY.legalEmail}</a>{' '}
          and we will try to resolve it informally. If that fails, the
          courts of England and Wales have non-exclusive jurisdiction over
          any dispute. If you are a consumer living in another part of the
          UK or the EU, you can also bring proceedings in your local
          courts.
        </p>

        <h2 id="changes">12. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Material changes
          will be notified by email and on the next sign-in; smaller
          tidy-ups (typos, clarifications, processor name changes) will be
          made quietly with the "last updated" date refreshed.
        </p>
      </div>

      <ContactBlock topic="legal" />
    </article>
  )
}
