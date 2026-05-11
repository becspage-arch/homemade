import { redirect } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { SettingsForm } from './settings-form'

export const dynamic = 'force-dynamic'

export default async function MeSettingsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  return (
    <>
      <section>
        <span className="me-section-label">Preferences</span>
        <h2 className="me-section-title">How you read</h2>
        <p className="me-section-description">
          Beginner mode pulls glossary terms into view and surfaces extra
          guidance on tutorials. Turn it off whenever you'd rather read
          without the scaffolding.
        </p>
        <SettingsForm
          initialBeginnerMode={user.beginnerMode}
          initialHandle={user.displayHandle}
          initialBio={user.bio}
        />
      </section>

      <section>
        <span className="me-section-label">Account</span>
        <h2 className="me-section-title">Sign out</h2>
        <p className="me-section-description">
          Signed in as {user.email}.
        </p>
        <SignOutButton>
          <button type="button" className="me-button secondary">
            Sign out
          </button>
        </SignOutButton>
      </section>
    </>
  )
}
