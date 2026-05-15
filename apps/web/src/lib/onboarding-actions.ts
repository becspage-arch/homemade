'use server'

import { revalidatePath } from 'next/cache'
import { prisma, ExperienceLevel } from '@homemade/db'
import { getCurrentDbUser } from './get-current-user'
import { audit } from './audit'
import { captureServerEvent, flushPostHog } from './posthog'

const VALID_DIETARY_FLAGS = new Set([
  'vegan',
  'vegetarian',
  'glutenFree',
  'dairyFree',
  'nutFree',
  'halal',
  'kosher',
  'pescatarian',
])

const VALID_EXPERIENCE_LEVELS = new Set<ExperienceLevel>([
  ExperienceLevel.BEGINNER,
  ExperienceLevel.INTERMEDIATE,
  ExperienceLevel.CONFIDENT,
])

interface OnboardingSubmission {
  primaryCategoryIds: string[]
  dietaryFlags: string[]
  /**
   * String literal matching the Prisma `ExperienceLevel` enum. Loosely typed
   * so client callers don't need to import the enum (which would drag Prisma
   * into the browser bundle).
   */
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'CONFIDENT' | null
}

/**
 * Persist the onboarding card's three steps. Idempotent — calling twice
 * leaves the second call's values in place but only fires `onboarding_completed`
 * once (the first call sets `onboardedAt`).
 */
export async function completeOnboardingAction(
  submission: OnboardingSubmission,
): Promise<void> {
  const user = await getCurrentDbUser()
  if (!user) throw new Error('Not signed in.')

  const dietaryFlags = submission.dietaryFlags.filter((d) =>
    VALID_DIETARY_FLAGS.has(d),
  )
  const experienceLevel: ExperienceLevel | null =
    submission.experienceLevel &&
    VALID_EXPERIENCE_LEVELS.has(submission.experienceLevel as ExperienceLevel)
      ? (submission.experienceLevel as ExperienceLevel)
      : null

  const wasAlreadyOnboarded = user.onboardedAt !== null

  await prisma.user.update({
    where: { id: user.id },
    data: {
      onboardedAt: user.onboardedAt ?? new Date(),
      primaryCategoryIds: submission.primaryCategoryIds.slice(0, 17),
      dietaryFlags,
      experienceLevel,
      // Default beginner mode on first onboarding for BEGINNER selection.
      beginnerMode:
        !wasAlreadyOnboarded && experienceLevel === ExperienceLevel.BEGINNER
          ? true
          : user.beginnerMode,
    },
  })

  await audit({
    actorId: user.id,
    action: wasAlreadyOnboarded
      ? 'user.onboarding_updated'
      : 'user.onboarding_completed',
    resource: `User:${user.id}`,
    metadata: {
      primaryCategoryIds: submission.primaryCategoryIds,
      dietaryFlags,
      experienceLevel,
    },
  })

  if (!wasAlreadyOnboarded) {
    await captureServerEvent({
      event: 'onboarding_completed',
      distinctId: user.id,
      properties: {
        primaryCategoryCount: submission.primaryCategoryIds.length,
        dietaryFlagCount: dietaryFlags.length,
        experienceLevel: experienceLevel ?? 'unspecified',
      },
    })
    await flushPostHog()
  }

  revalidatePath('/')
}

/**
 * Mark onboarding skipped — no preferences captured, but `onboardedAt` set so
 * the card doesn't pop again. The user can still fill preferences later from
 * /me/settings.
 */
export async function skipOnboardingAction(): Promise<void> {
  const user = await getCurrentDbUser()
  if (!user) throw new Error('Not signed in.')

  if (user.onboardedAt) {
    // Already done — no-op.
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { onboardedAt: new Date() },
  })

  await audit({
    actorId: user.id,
    action: 'user.onboarding_skipped',
    resource: `User:${user.id}`,
  })

  await captureServerEvent({
    event: 'onboarding_skipped',
    distinctId: user.id,
  })
  await flushPostHog()

  revalidatePath('/')
}
