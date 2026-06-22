import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { getCurrentDbUser } from '@/lib/get-current-user'
import '../premium-page.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Welcome to Homemade Premium',
  description: 'Your premium membership is being set up.',
  path: '/premium/welcome',
})

/**
 * Stripe Checkout success landing. The subscription + entitlement are granted by
 * the webhook (checkout.session.completed), which may land a moment after the
 * redirect — so this page is reassuring rather than authoritative. A signed-in
 * buyer is pointed at their account; a guest is told to sign in with the email
 * they paid with (their account was just created for them).
 */
export default async function PremiumWelcomePage() {
  const user = await getCurrentDbUser()

  return (
    <div className="premium-page">
      <header className="premium-hero">
        <p className="premium-hero-eyebrow">Homemade Premium</p>
        <h1 className="premium-hero-title">You&apos;re all set</h1>
        <p className="premium-hero-lede">
          Thank you for joining. Your payment went through and your premium
          membership is being switched on now. It can take a moment to appear.
        </p>
      </header>

      <section className="premium-guarantee" aria-label="What happens next">
        <h2 className="premium-guarantee-title">What happens next</h2>
        {user ? (
          <p className="premium-guarantee-body">
            Your account is ready. Head back to whatever you were making, or open
            your{' '}
            <Link href="/me/settings">account settings</Link> to manage your
            membership anytime. If the premium tools don&apos;t unlock straight
            away, give it a minute and refresh.
          </p>
        ) : (
          <p className="premium-guarantee-body">
            We&apos;ve set up your account using the email you paid with. To start
            using your premium membership,{' '}
            <Link href="/sign-in">sign in</Link> with that email and we&apos;ll
            send you a code to get in. No password to remember.
          </p>
        )}
      </section>

      <p className="premium-footnote">
        A receipt is on its way to your inbox. Questions about your membership?
        Email hello@homemade.education.
      </p>
    </div>
  )
}
