import { SignUp } from '@clerk/nextjs'

/**
 * Clerk's catch-all `<SignUp />` route. Same pattern as `/sign-in` —
 * the `[[...sign-up]]` segment catches Clerk's email-verification and
 * OAuth callback URLs.
 *
 * Splash gate exposes `/sign-up` via PUBLIC_PATHS in `proxy.ts` so
 * Clerk's link from the sign-in form to "Create account" works.
 */
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <SignUp />
    </main>
  )
}
