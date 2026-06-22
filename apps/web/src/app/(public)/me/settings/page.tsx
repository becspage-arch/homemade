import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { SettingsForm } from './settings-form'
import { PushSettings } from './push-settings'
import { MakerProfileSettings } from './maker-profile-settings'
import { CookingUnitsSettings } from './cooking-units-settings'
import { ManageSubscriptionButton } from './manage-subscription'

export const dynamic = 'force-dynamic'

export default async function MeSettingsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const activeSub = await prisma.pushSubscription.findFirst({
    where: { userId: user.id, revokedAt: null },
    orderBy: { lastActiveAt: 'desc' },
    select: { enabledCategories: true },
  })

  // Latest billing subscription mirror (if they've ever subscribed) for the
  // Membership section. The Stripe Customer Portal is the source of truth; this
  // is a friendly summary so the page isn't blank before the portal opens.
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      status: true,
      plan: true,
      currency: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
    },
  })
  const isPremium = hasPremium(user)
  const hasBilling = Boolean(user.stripeCustomerId)

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
        <span className="me-section-label">Preferences</span>
        <h2 className="me-section-title">Recipe units</h2>
        <p className="me-section-description">
          Choose how recipe amounts and oven temperatures show on the page.
          Recipes are written once in grams, millilitres and conventional °C;
          this only changes how they read for you. Leave any setting on your
          region&apos;s default to let your location decide.
        </p>
        <CookingUnitsSettings
          initialOven={user.ovenPreference}
          initialWeight={user.weightPreference}
          initialVolume={user.volumePreference}
        />
      </section>

      <section>
        <span className="me-section-label">Maker profile</span>
        <h2 className="me-section-title">Your public page</h2>
        <p className="me-section-description">
          Your Maker profile lives at{' '}
          {user.displayHandle ? (
            <>
              <Link href={`/m/${user.displayHandle}`} className="me-nav-link">
                /m/{user.displayHandle}
              </Link>
            </>
          ) : (
            <em>—</em>
          )}
          . It shows your Made it log, your public Make it list, and (if
          you&apos;re a Creator) your published tutorials. Off by default —
          flip it on when you want others to see your work.
        </p>
        <MakerProfileSettings
          initialIsPublic={user.isPublicMakerProfile}
          initialHeaderMediaId={user.makerHeaderImageId}
          handle={user.displayHandle}
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
        <span className="me-section-label">Membership</span>
        <h2 className="me-section-title">Homemade Premium</h2>
        {hasBilling ? (
          <>
            <p className="me-section-description">
              {isPremium ? (
                <>
                  Your premium membership is active
                  {subscription?.plan
                    ? ` (${subscription.plan === 'annual' ? 'annual' : 'monthly'})`
                    : ''}
                  .{' '}
                  {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd
                    ? `It ends on ${subscription.currentPeriodEnd.toLocaleDateString(
                        'en-GB',
                        { day: 'numeric', month: 'long', year: 'numeric' },
                      )} and won't renew.`
                    : subscription?.currentPeriodEnd
                      ? `It renews on ${subscription.currentPeriodEnd.toLocaleDateString(
                          'en-GB',
                          { day: 'numeric', month: 'long', year: 'numeric' },
                        )}.`
                      : ''}
                </>
              ) : (
                <>
                  Your premium membership isn&apos;t active right now. You can
                  restart or update it from the billing portal.
                </>
              )}{' '}
              Change your plan, update your card or cancel anytime — your work
              always stays with you.
            </p>
            <ManageSubscriptionButton />
          </>
        ) : (
          <p className="me-section-description">
            You&apos;re on the free plan. Premium adds downloads, custom-fit
            patterns, recipe planning and your own AI assistant.{' '}
            <Link href="/premium" className="me-nav-link">
              See what&apos;s included
            </Link>
            .
          </p>
        )}
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
