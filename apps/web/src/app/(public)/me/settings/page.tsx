import { redirect } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { SettingsForm } from './settings-form'
import { PushSettings } from './push-settings'

export const dynamic = 'force-dynamic'

export default async function MeSettingsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const activeSub = await prisma.pushSubscription.findFirst({
    where: { userId: user.id, revokedAt: null },
    orderBy: { lastActiveAt: 'desc' },
    select: { enabledCategories: true },
  })

  return (
    <>
      <section>
        <span className="me-section-label">Preferences</span>
        <h2 className="me-section-title">How you read</h2>
        <p className="me-section-description">
          Beginner mode pulls glossary terms into view and surfaces extra
          guidance on tutorials. Turn it off whenever you&apos;d rather read
          without the scaffolding.
        </p>
        <SettingsForm
          initialBeginnerMode={user.beginnerMode}
          initialHandle={user.displayHandle}
          initialBio={user.bio}
        />
      </section>

      <section>
        <span className="me-section-label">Mobile + notifications</span>
        <h2 className="me-section-title">On your phone</h2>
        <p className="me-section-description">
          Cooking mode strips a recipe down to the steps and keeps the screen
          awake. Notifications let us nudge you when your sourdough needs
          feeding or your moderation outcome lands.
        </p>
        <PushSettings
          initialCookingModeAutoEnable={user.cookingModeAutoEnable}
          initialPushEnabled={user.pushNotificationsEnabled}
          initialCategories={activeSub?.enabledCategories ?? []}
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
