import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { ContactBlock } from '../contact-block'
import { LEGAL_ENTITY } from '@/lib/legal-entity'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Privacy Policy — Homemade',
  description: 'How Homemade collects, uses, stores and shares your data.',
  path: '/legal/privacy',
  ogType: 'article',
})

export default function PrivacyPage() {
  return (
    <article className="legal-page">
      <LegalHeader eyebrow="Privacy" title="Privacy Policy" />

      <div className="legal-toc" aria-labelledby="privacy-toc-title">
        <div className="legal-toc-title" id="privacy-toc-title">On this page</div>
        <ol>
          <li><a href="#who-we-are">1. Who we are</a></li>
          <li><a href="#what-we-collect">2. What we collect</a></li>
          <li><a href="#lawful-bases">3. Lawful bases for processing</a></li>
          <li><a href="#processors">4. Third-party processors</a></li>
          <li><a href="#transfers">5. International transfers</a></li>
          <li><a href="#retention">6. How long we keep things</a></li>
          <li><a href="#your-rights">7. Your rights</a></li>
          <li><a href="#children">8. Children</a></li>
          <li><a href="#cookies">9. Cookies</a></li>
          <li><a href="#changes">10. Changes to this policy</a></li>
        </ol>
      </div>

      <div className="legal-body">
        <h2 id="who-we-are">1. Who we are</h2>
        <p>
          Homemade is run by {LEGAL_ENTITY.name}. We are the data controller
          for personal data you give us through the site and the mobile apps.
          You can reach us about anything in this policy at{' '}
          <a href={`mailto:${LEGAL_ENTITY.dpoEmail}`}>{LEGAL_ENTITY.dpoEmail}</a>.
        </p>

        <h2 id="what-we-collect">2. What we collect</h2>
        <p>We collect four broad categories of information.</p>

        <h3>Account information</h3>
        <p>
          When you create an account we collect your email address, a chosen
          display handle if you set one, your name (if you give it), and any
          profile fields you fill in such as a short bio. Authentication is
          handled by Clerk, which stores your password hash on our behalf;
          we never see the plain-text password.
        </p>

        <h3>Content you create</h3>
        <p>
          We store the tutorials you read, bookmark, or start as projects;
          your private notes; the supplies you tick off; reviews you submit;
          photos you upload to community galleries; questions and answers
          you post; errata you report; and any messages you send to other
          users once messaging exists.
        </p>

        <h3>Usage information</h3>
        <p>
          When you visit the site we record server logs (IP address, request
          path, user agent, timestamps) to keep the service running and
          spot abuse. With your consent, we also collect product analytics
          events (which pages you visit, which features you use) and error
          reports to help us fix bugs.
        </p>

        <h3>Payment information</h3>
        <p>
          Once the premium tier launches, payment is handled by Stripe.
          Stripe processes your card details directly — we receive only the
          subscription state (active, cancelled, lapsed) and a billing
          country for tax purposes. We do not store card numbers.
        </p>

        <h2 id="lawful-bases">3. Lawful bases for processing</h2>
        <p>Under UK GDPR every use of personal data needs a lawful basis. Ours are:</p>
        <ul>
          <li>
            <strong>Contract</strong> — running your account, showing you the
            tutorials you bookmark, persisting your project state, and
            delivering paid subscriptions.
          </li>
          <li>
            <strong>Consent</strong> — product analytics, error monitoring,
            and any marketing emails you opt in to. You can withdraw consent
            at any time without affecting the rest of the service.
          </li>
          <li>
            <strong>Legitimate interest</strong> — security logging, abuse
            prevention, fraud detection, and aggregated service-improvement
            analysis carried out on anonymised data. We balance these uses
            against your rights and only proceed where the benefit to the
            service is clear and the impact on you is low.
          </li>
          <li>
            <strong>Legal obligation</strong> — keeping the records the law
            requires (for example, tax records once we are VAT-registered).
          </li>
        </ul>

        <h2 id="processors">4. Third-party processors</h2>
        <p>
          We use a small number of trusted suppliers to run the service. Each
          processes data on our instructions under a data processing
          agreement.
        </p>

        <ul>
          <li>
            <strong>Clerk</strong> (authentication) — email, name, password
            hash, session data. United States with EU-region availability.
          </li>
          <li>
            <strong>Neon</strong> (database) — all of your account and
            content data. Hosted in London (AWS eu-west-2).
          </li>
          <li>
            <strong>Amazon Web Services</strong> (application hosting) —
            request data, server logs. London (eu-west-2).
          </li>
          <li>
            <strong>Cloudflare</strong> (CDN, image delivery, edge
            protection) — IP address, request data, uploaded media. Global
            edge with EU presence.
          </li>
          <li>
            <strong>PostHog</strong> (product analytics, only with your
            consent) — pseudonymous event data. EU-region cluster.
          </li>
          <li>
            <strong>Sentry</strong> (error monitoring, only with your
            consent) — error events, stack traces, IP address. EU-region
            where available, otherwise United States.
          </li>
          <li>
            <strong>Inngest</strong> (background jobs once enabled) — job
            payloads which may include account identifiers. United States
            with EU region.
          </li>
          <li>
            <strong>Upstash Redis</strong> (caching, rate limiting) — IP
            address, request signatures, transient cache data. EU region.
          </li>
          <li>
            <strong>Typesense</strong> (search) — public tutorial content
            and search queries. EU region once the secret mount lands.
          </li>
          <li>
            <strong>Google Workspace</strong> (email) — any emails you send
            us, and our outbound notifications.
          </li>
          <li>
            <strong>Anthropic</strong> (AI features for editorial drafting)
            — never receives your personal data. Used internally for content
            drafting, not for handling user input.
          </li>
          <li>
            <strong>Stripe</strong> (added at premium launch) — payment
            card data, billing address, tax information. Global with UK and
            EU regions.
          </li>
        </ul>

        <h2 id="transfers">5. International transfers</h2>
        <p>
          Where data leaves the UK and the European Economic Area, we rely
          on the UK International Data Transfer Agreement and the European
          Standard Contractual Clauses with our suppliers. We do not
          transfer data to countries that the UK or the EU has deemed
          inadequate without one of these safeguards in place.
        </p>

        <h2 id="retention">6. How long we keep things</h2>
        <p>
          Account data is kept while your account is open. When you delete
          your account we run a 30-day grace period (during which you can
          cancel the deletion) and then hard-delete your personal content.
          Audit logs are retained for 12 months. Server logs roll over on a
          rolling 30-day basis. Database backups expire on the underlying
          rotation schedule of our hosting provider, typically 7 days.
        </p>

        <h2 id="your-rights">7. Your rights</h2>
        <p>UK GDPR gives you the following rights:</p>
        <ul>
          <li>Access — ask for a copy of the data we hold about you.</li>
          <li>Rectification — ask us to correct anything inaccurate.</li>
          <li>Erasure — ask us to delete your account and personal data.</li>
          <li>Restriction — ask us to limit how we use your data.</li>
          <li>Portability — receive your data in a machine-readable format.</li>
          <li>Objection — object to processing on legitimate-interest grounds.</li>
          <li>Withdrawal of consent — switch off analytics or marketing whenever you want.</li>
          <li>
            Complaint — lodge a complaint with the Information Commissioner&apos;s
            Office (the UK regulator) at{' '}
            <a href="https://ico.org.uk/make-a-complaint/" rel="noopener noreferrer">
              ico.org.uk
            </a>
            .
          </li>
        </ul>
        <p>
          The quickest way to exercise these rights is the{' '}
          <Link href="/me/data-rights">Data rights centre</Link> in your
          account — you can download an export of your data or schedule a
          deletion there. You can also email{' '}
          <a href={`mailto:${LEGAL_ENTITY.dpoEmail}`}>{LEGAL_ENTITY.dpoEmail}</a>{' '}
          and we will respond within one month.
        </p>

        <h2 id="children">8. Children</h2>
        <p>
          Homemade is not aimed at children. You must be at least 16 to hold
          an account — this matches the UK GDPR baseline for digital consent.
          If you believe a child has signed up, please tell us at{' '}
          <a href={`mailto:${LEGAL_ENTITY.dpoEmail}`}>{LEGAL_ENTITY.dpoEmail}</a>{' '}
          and we will remove the account.
        </p>

        <h2 id="cookies">9. Cookies</h2>
        <p>
          We use a small number of cookies and similar storage for things
          like keeping you signed in, remembering whether you have accepted
          analytics, and (with your consent) measuring how the site is used.
          The <Link href="/legal/cookies">Cookie Policy</Link> lists each one
          with its purpose and lifetime, and you can change your preferences
          at any time from the link in the footer.
        </p>

        <h2 id="changes">10. Changes to this policy</h2>
        <p>
          When we change this policy in a material way — for example, by
          adding a new processor, broadening retention periods, or changing
          a lawful basis — we will email account holders and show a notice
          on the next sign-in. We will keep the previous version available
          on request.
        </p>
      </div>

      <ContactBlock topic="privacy" />
    </article>
  )
}
