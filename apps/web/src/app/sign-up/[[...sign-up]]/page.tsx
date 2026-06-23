import { SignUp } from '@clerk/nextjs'

/**
 * Clerk's catch-all `<SignUp />` route. Same pattern as `/sign-in` —
 * the `[[...sign-up]]` segment catches Clerk's email-verification and
 * OAuth callback URLs.
 *
 * Public signups are OPEN as of the go-live (2026-06-23): the pre-launch
 * "accounts aren't open yet" notice is gone and the live form is restored,
 * paired with SIGNUP_ALLOWLIST_ENABLED = false in lib/signup-allowlist.ts.
 * New accounts land as free MEMBER.
 *
 * `/sign-up` is exposed via PUBLIC_PATHS in `proxy.ts` so Clerk's link from
 * the sign-in form to "Create account" works.
 */
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <SignUp />
    </main>
  )
}
