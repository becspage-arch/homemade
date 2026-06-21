import Link from 'next/link'
import './premium.css'

/**
 * StudioAuthGate — the warm "sign in free to use the Studio" prompt shown when
 * an anonymous visitor opens a Studio surface. This is an AUTH gate, not a
 * paywall: the Studio is free for any signed-in Maker. Anonymous users can
 * still view all content; they just need a free account to work in the Studio.
 *
 * `returnTo` round-trips them back to the surface they wanted after sign-in.
 */
export function StudioAuthGate({
  craftLabel = 'the Studio',
  returnTo,
}: {
  craftLabel?: string
  returnTo?: string
}) {
  const signInHref = returnTo
    ? `/sign-in?redirect_url=${encodeURIComponent(returnTo)}`
    : '/sign-in'
  return (
    <section className="studio-auth-gate">
      <p className="studio-auth-gate-overline">Free with an account</p>
      <h1 className="studio-auth-gate-title">Sign in to use {craftLabel}</h1>
      <p className="studio-auth-gate-lede">
        The Studio is free — sign in and you can mark stitches as you go, save
        your progress, and pick up on any device. It only takes a moment.
      </p>
      <Link href={signInHref} className="studio-auth-gate-cta">
        Sign in free
      </Link>
      <Link href="/cross-stitch/patterns" className="studio-auth-gate-secondary">
        Or keep browsing the library
      </Link>
    </section>
  )
}
