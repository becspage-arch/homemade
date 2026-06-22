import Link from 'next/link'

/**
 * Pre-launch, public account creation is CLOSED. Signups are restricted to the
 * server-enforced allowlist (SIGNUP_ALLOWLIST_ENABLED), so the live Clerk
 * <SignUp /> form is hidden behind this notice — the page stays reachable (it's
 * in PUBLIC_PATHS and is where Clerk's sign-in form links "create account") but
 * no one can register. Allowlisted testers and admins sign in at /sign-in.
 *
 * TODO(launch): restore the live form on launch day —
 *   import { SignUp } from '@clerk/nextjs'
 *   ...return <main ...><SignUp /></main>
 * and flip SIGNUP_ALLOWLIST_ENABLED = false (lib/signup-allowlist.ts).
 */
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <div style={{ maxWidth: 420 }}>
        <h1
          style={{
            fontFamily: 'var(--font-fraunces, var(--font-display))',
            fontWeight: 400,
            fontSize: 30,
            lineHeight: 1.2,
            color: 'var(--color-espresso)',
            margin: '0 0 14px',
          }}
        >
          New accounts aren&apos;t open yet
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--color-warm-taupe)',
            margin: '0 0 24px',
          }}
        >
          We&apos;re still getting Homemade ready. Sign-ups open when we launch.
          If you already have an account, you can sign in.
        </p>
        <Link
          href="/sign-in"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-lora)',
            fontSize: 14,
            letterSpacing: '0.04em',
            color: 'var(--color-cream)',
            background: 'var(--color-sage)',
            padding: '11px 22px',
            borderRadius: 4,
            textDecoration: 'none',
          }}
        >
          Sign in
        </Link>
      </div>
    </main>
  )
}
