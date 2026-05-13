import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { ContactBlock } from '../contact-block'
import { LEGAL_ENTITY } from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Subscription Terms — Homemade',
  description: 'Billing, cancellation, refunds and price changes.',
}

export default function SubscriptionTermsPage() {
  return (
    <article className="legal-page">
      <LegalHeader eyebrow="Subscription" title="Subscription Terms" />

      <div className="legal-body">
        <p>
          These terms cover the premium subscription tier of Homemade. The
          tier is currently planned and not yet available — pricing is
          shown as a placeholder until Phase 8 of the build. When you take
          out a premium subscription, you agree to these terms in addition
          to our <Link href="/legal/terms">Terms of Service</Link>.
        </p>

        <h2>What premium includes</h2>
        <p>
          The premium tier is planned to include access to subscriber-only
          tutorials, downloadable PDF patterns, an offline reader mode in
          the mobile apps, and tools for managing larger seasonal projects.
          The exact feature set will be confirmed when the tier launches.
        </p>

        <h2>Billing cycle</h2>
        <p>
          Premium is sold as a monthly or annual subscription. Annual is
          offered at a discount to monthly. The cycle starts on the day
          you subscribe and renews automatically until you cancel.
        </p>

        <h2>Auto-renewal</h2>
        <p>
          Your subscription renews automatically at the end of each cycle.
          We send a reminder email before annual renewals so you have time
          to cancel if you want to. Monthly renewals do not get a
          per-renewal reminder, but you can cancel at any time from your
          account.
        </p>

        <h2>Cancellation</h2>
        <p>
          You can cancel at any time from your account settings. Cancellation
          takes effect at the end of the current billing period — you keep
          access until then, and we do not pro-rate refunds for partial
          periods. Once a cancellation is in flight, automatic renewal
          stops.
        </p>

        <h2>Your statutory cancellation right</h2>
        <p>
          The Consumer Contracts (Information, Cancellation and Additional
          Charges) Regulations 2013 give consumers in the UK a 14-day
          cooling-off period for digital services. There is a standard
          exception: if you start using the digital service inside the
          14-day window, you waive that right. By signing up to premium
          and using any premium feature you agree to start the service
          immediately and acknowledge that you lose the 14-day cancellation
          right for that purchase.
        </p>

        <h2>Refunds</h2>
        <p>
          We do not give pro-rata refunds for partial periods. We may offer
          a goodwill refund at our discretion — for example, if the service
          has been substantially unavailable, if you were charged twice by
          mistake, or in other cases where a refund seems fair. Email{' '}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`}>{LEGAL_ENTITY.contactEmail}</a>{' '}
          and we will look into it.
        </p>

        <h2>Price changes</h2>
        <p>
          We will give you at least 30 days&apos; notice by email before any
          price increase, and the new price will only apply from your next
          renewal after that notice period ends. You can cancel before the
          new price takes effect and you will keep your current price
          until the end of your billing period.
        </p>

        <h2>VAT and other taxes</h2>
        <p>
          Prices shown to UK consumers will be inclusive of VAT once we are
          VAT-registered. Until then, prices are exclusive of any VAT or
          equivalent tax. If your local jurisdiction levies sales or
          digital services tax on the purchase, that may be added at
          checkout.
        </p>

        <h2>Account closure</h2>
        <p>
          Closing your Homemade account also ends any active premium
          subscription. We do not refund the remaining portion of a
          subscription when you close your account — please cancel
          renewals first and let the period run out if you want to keep
          the access you have already paid for.
        </p>

        <h2>Disputes</h2>
        <p>
          These terms are governed by the laws of {LEGAL_ENTITY.jurisdiction}.
          The courts of England and Wales have non-exclusive jurisdiction
          over any dispute about a subscription. If you are a UK or EU
          consumer outside England and Wales, you can also bring
          proceedings in your local courts.
        </p>
      </div>

      <ContactBlock topic="general" />
    </article>
  )
}
