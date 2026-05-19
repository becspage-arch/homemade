import 'server-only'
import { prisma } from '@homemade/db'

const VISIT_THRESHOLD = 3
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Increment the visit counter for a (user, tutorial) pair. Anonymous
 * visitors are not tracked — caller already filters. Returns the new
 * visit count so the caller can decide whether to surface the prompt
 * without a second round-trip.
 */
export async function recordTutorialVisit(input: {
  userId: string
  tutorialId: string
}): Promise<{ count: number }> {
  const updated = await prisma.tutorialVisit.upsert({
    where: {
      userId_tutorialId: {
        userId: input.userId,
        tutorialId: input.tutorialId,
      },
    },
    update: {
      count: { increment: 1 },
      lastVisitedAt: new Date(),
    },
    create: {
      userId: input.userId,
      tutorialId: input.tutorialId,
      count: 1,
      lastVisitedAt: new Date(),
    },
    select: { count: true },
  })
  return updated
}

export interface PromptState {
  /** True when the prompt should render right now. */
  show: boolean
  /** The current visit count, for analytics. */
  visitCount: number
}

interface DismissalRecord {
  [tutorialId: string]: string // ISO date
}

function parseDismissalMap(raw: unknown): DismissalRecord {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: DismissalRecord = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string') out[key] = value
  }
  return out
}

/**
 * Should the "Did you make this?" prompt render for this Maker on this
 * tutorial? Rules:
 *   - Maker is signed in (caller's responsibility — we don't reach the
 *     User row otherwise).
 *   - VisitCount ≥ VISIT_THRESHOLD (default 3).
 *   - The Maker doesn't have a UserProject for this tutorial yet.
 *   - The Maker hasn't dismissed the prompt for this tutorial in the
 *     last 7 days.
 *
 * Returns visitCount alongside so analytics events can include it.
 */
export async function shouldShowDidYouMakeThisPrompt(input: {
  userId: string
  tutorialId: string
  visitCount: number
  dismissedDidYouMakeThis: unknown
}): Promise<PromptState> {
  if (input.visitCount < VISIT_THRESHOLD) {
    return { show: false, visitCount: input.visitCount }
  }

  const dismissed = parseDismissalMap(input.dismissedDidYouMakeThis)
  const dismissedAt = dismissed[input.tutorialId]
  if (dismissedAt) {
    const dismissedDate = new Date(dismissedAt)
    if (!Number.isNaN(dismissedDate.getTime())) {
      const age = Date.now() - dismissedDate.getTime()
      if (age < DISMISS_TTL_MS) {
        return { show: false, visitCount: input.visitCount }
      }
    }
  }

  // Don't surface if they already have a UserProject — any status (the
  // spec says "any status" so they're already tracking it as a project).
  const existing = await prisma.userProject.findUnique({
    where: {
      userId_tutorialId: {
        userId: input.userId,
        tutorialId: input.tutorialId,
      },
    },
    select: { id: true },
  })
  if (existing) {
    return { show: false, visitCount: input.visitCount }
  }

  return { show: true, visitCount: input.visitCount }
}

export const DID_YOU_MAKE_THIS_THRESHOLD = VISIT_THRESHOLD
export const DID_YOU_MAKE_THIS_DISMISS_TTL_MS = DISMISS_TTL_MS
