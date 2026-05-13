import { SignIn } from '@clerk/nextjs'

/**
 * Clerk's catch-all `<SignIn />` route. The `[[...sign-in]]` segment is
 * optional + greedy so Clerk's internal redirects (verify-email,
 * factor-two, OAuth callback) all resolve under this one page.
 *
 * Splash gate exposes `/sign-in` via PUBLIC_PATHS in `proxy.ts` so anyone
 * with a Clerk account can reach the sign-in form even before they have
 * the splash unlock cookie — useful for admins (Rebecca) and any
 * pre-launch testers.
 */
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <SignIn />
    </main>
  )
}
