import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { ContactBlock } from '../contact-block'
import { LEGAL_ENTITY } from '@/lib/legal-entity'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Subscription Terms | Homemade',
  description: 'Billing, cancellation, refunds and price changes for the planned premium tier.',
  path: '/legal/subscription-terms',
  ogType: 'article',
})

export default function SubscriptionTermsPage() {
  return (
    <article className="legal-page">
      <LegalHeader eyebrow="Subscription" title="Subscription Terms" />

      <div className="legal-body">
        <p>
          These terms cover the premium subscription tier of Homemade. The tier
          is not yet available to buy. When you take out a premium subscription,
          you agree to these terms in addition to our{' '}
          <Link href="/legal/terms">Terms of Service</Link>.
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
          <strong>
            This subscription renews automatically each billing cycle unless
            you cancel. Cancel anytime in your account settings.
          </strong>
        </p>
        <p>
          Your subscription renews automatically at the end of each cycle at
          the price you are currently paying. We send a reminder email before
          annual renewals so you have time to cancel if you want to. Monthly
          renewals do not get a per-renewal reminder, but you can cancel at any
          time from your account.
        </p>

        <h2>Cancellation</h2>
        <p>
          You can cancel at any time from your account settings. Cancellation
          takes effect at the end of the current billing period. You keep
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

        <h2>Refunds: the Make-Something-You-Love Guarantee</h2>
        <p>
          If you don&apos;t make something you love in your first 90 days of
          premium, we&apos;ll give you your money back and another three months
          free to try again. To claim, email{' '}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`}>{LEGAL_ENTITY.contactEmail}</a>{' '}
          within your first 90 days and we&apos;ll sort it out. For most people
          that&apos;s all it takes.
        </p>
        <p>
          The conditions, so we can stop the rare person who tries it on: to
          qualify, your account needs to show you gave it a go, which means
          logging in and starting at least one project, pattern or recipe in
          each of the three months. If you&apos;ve done that and premium
          wasn&apos;t for you, the refund is yours.
        </p>
        <p>
          If you pay monthly, we refund the months you&apos;ve paid within that
          90 days. If you pay for the year, we refund the full year. Either way,
          you also get three months of premium free. This is on top of your
          normal cancellation rights, not instead of them.
        </p>
        <p>
          The guarantee is for your first premium subscription, once per person.
          We may turn down a claim if we see signs it&apos;s being abused, such
          as multiple accounts or a chargeback already raised. We might change
          or withdraw this for future subscribers, but we&apos;ll honour the
          version that applied when you joined.
        </p>
        <p>
          Outside the guarantee, we do not give pro-rata refunds for partial
          periods. If you were charged twice by mistake, or the service has been
          substantially unavailable, email us and we will put it right.
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
          subscription when you close your account. Please cancel
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
