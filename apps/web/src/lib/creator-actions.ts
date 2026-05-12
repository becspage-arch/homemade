'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  prisma,
  CreatorApplicationStatus,
  NotificationType,
  PatternTestStatus,
  TestAssignmentStatus,
  TutorialStatus,
  UserRole,
  type Prisma,
} from '@homemade/db'
import { audit } from './audit'
import { notify } from './notify'
import { getCurrentDbUser, requireAdminRole } from './get-current-user'
import { captureServerEvent } from './posthog'

type ActionResult<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string }

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,30}[a-z0-9])?$/

function trimOrNull(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const t = raw.trim()
  return t.length === 0 ? null : t
}

function clampLength(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max)
}

// ────────────────────────────────────────────────────────────────────────────
// Creator application — submit
// ────────────────────────────────────────────────────────────────────────────

interface CreatorApplicationInput {
  bio: string
  specialty: string
  displayHandle?: string | null
  applicationNote?: string | null
  websiteUrl?: string | null
  instagramHandle?: string | null
  youtubeHandle?: string | null
  tiktokHandle?: string | null
  substackUrl?: string | null
  pinterestHandle?: string | null
}

export async function submitCreatorApplication(
  input: CreatorApplicationInput,
): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Sign in to apply.' }
  if (user.isSuspended) return { ok: false, error: 'Suspended accounts can’t apply.' }

  const bio = clampLength(input.bio.trim(), 4000)
  const specialty = clampLength(input.specialty.trim(), 200)
  if (bio.length < 30) {
    return { ok: false, error: 'Tell us a bit more about yourself — at least a few sentences.' }
  }
  if (specialty.length === 0) {
    return { ok: false, error: 'Add a short specialty line.' }
  }

  const handleRaw = trimOrNull(input.displayHandle ?? null)?.toLowerCase() ?? null
  let nextHandle = user.displayHandle
  if (!user.displayHandle) {
    if (!handleRaw) return { ok: false, error: 'Pick a handle so readers can find your work.' }
    if (!HANDLE_PATTERN.test(handleRaw)) {
      return { ok: false, error: 'Handle: lowercase letters, numbers, underscores, hyphens. 3–32 chars.' }
    }
    const taken = await prisma.user.findUnique({ where: { displayHandle: handleRaw } })
    if (taken && taken.id !== user.id) {
      return { ok: false, error: 'That handle is taken. Try another.' }
    }
    nextHandle = handleRaw
  }

  const existing = await prisma.creatorProfile.findUnique({ where: { userId: user.id } })
  if (existing && existing.applicationStatus === CreatorApplicationStatus.APPLIED) {
    return { ok: false, error: 'Your application is already in review.' }
  }
  if (existing && existing.applicationStatus === CreatorApplicationStatus.APPROVED) {
    return { ok: false, error: 'You’re already a creator.' }
  }

  const data = {
    bio,
    specialty,
    applicationNote: clampLength(trimOrNull(input.applicationNote ?? null) ?? '', 4000) || null,
    websiteUrl: trimOrNull(input.websiteUrl ?? null),
    instagramHandle: trimOrNull(input.instagramHandle ?? null),
    youtubeHandle: trimOrNull(input.youtubeHandle ?? null),
    tiktokHandle: trimOrNull(input.tiktokHandle ?? null),
    substackUrl: trimOrNull(input.substackUrl ?? null),
    pinterestHandle: trimOrNull(input.pinterestHandle ?? null),
    applicationStatus: CreatorApplicationStatus.APPLIED,
    appliedAt: new Date(),
    decidedAt: null,
    decidedById: null,
    rejectionReason: null,
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: nextHandle && nextHandle !== user.displayHandle ? { displayHandle: nextHandle } : {},
    }),
    existing
      ? prisma.creatorProfile.update({ where: { id: existing.id }, data })
      : prisma.creatorProfile.create({ data: { ...data, userId: user.id } }),
  ])

  await audit({
    actorId: user.id,
    action: 'creator.application_submitted',
    resource: `User:${user.id}`,
    metadata: { specialty },
  })

  await captureServerEvent({
    event: 'creator_application_submitted',
    distinctId: user.clerkId,
    properties: { specialty },
  })

  revalidatePath('/me/creator')
  revalidatePath('/me/creator/apply')
  revalidatePath('/admin/creators')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Creator application — decide (admin)
// ────────────────────────────────────────────────────────────────────────────

export async function decideCreatorApplication(input: {
  profileId: string
  decision: 'APPROVE' | 'REJECT'
  rejectionReason?: string | null
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })

  const profile = await prisma.creatorProfile.findUnique({
    where: { id: input.profileId },
    include: { user: { select: { id: true, clerkId: true, email: true, displayHandle: true } } },
  })
  if (!profile) return { ok: false, error: 'Application not found.' }
  if (profile.applicationStatus !== CreatorApplicationStatus.APPLIED) {
    return { ok: false, error: 'This application has already been decided.' }
  }

  if (input.decision === 'REJECT') {
    const reason = trimOrNull(input.rejectionReason ?? null)
    if (!reason) return { ok: false, error: 'Add a short reason so the applicant knows why.' }

    await prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        applicationStatus: CreatorApplicationStatus.REJECTED,
        decidedAt: new Date(),
        decidedById: actor.id,
        rejectionReason: reason,
      },
    })

    await audit({
      actorId: actor.id,
      action: 'creator.application_rejected',
      resource: `User:${profile.user.id}`,
      metadata: { reason },
    })

    await notify({
      userId: profile.user.id,
      type: NotificationType.CREATOR_APPLICATION_REJECTED,
      body: `Your creator application wasn’t accepted this round: ${reason}`,
      href: '/me/creator/apply',
    })

    await captureServerEvent({
      event: 'creator_application_rejected',
      distinctId: profile.user.clerkId,
      properties: { creatorUserId: profile.user.id, hasReason: Boolean(reason) },
    })

    revalidatePath('/admin/creators')
    revalidatePath(`/admin/creators/${profile.id}`)
    revalidatePath('/me/creator')
    return { ok: true }
  }

  await prisma.$transaction([
    prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        applicationStatus: CreatorApplicationStatus.APPROVED,
        decidedAt: new Date(),
        decidedById: actor.id,
        rejectionReason: null,
      },
    }),
    prisma.user.update({
      where: { id: profile.user.id },
      data: { isCreator: true, creatorVerifiedAt: new Date() },
    }),
  ])

  await audit({
    actorId: actor.id,
    action: 'creator.application_approved',
    resource: `User:${profile.user.id}`,
    metadata: { handle: profile.user.displayHandle },
  })

  await notify({
    userId: profile.user.id,
    type: NotificationType.CREATOR_APPLICATION_APPROVED,
    body: 'Your creator application is approved. Welcome — your dashboard is at /me/creator.',
    href: '/me/creator',
  })

  await captureServerEvent({
    event: 'creator_application_approved',
    distinctId: profile.user.clerkId,
    properties: { creatorUserId: profile.user.id },
  })

  revalidatePath('/admin/creators')
  revalidatePath(`/admin/creators/${profile.id}`)
  revalidatePath('/me/creator')
  revalidatePath('/makers')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Creator profile — edit
// ────────────────────────────────────────────────────────────────────────────

export async function updateCreatorProfile(input: {
  bio: string
  specialty: string
  displayHandle?: string | null
  websiteUrl?: string | null
  instagramHandle?: string | null
  youtubeHandle?: string | null
  tiktokHandle?: string | null
  substackUrl?: string | null
  pinterestHandle?: string | null
}): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Sign in.' }

  const profile = await prisma.creatorProfile.findUnique({ where: { userId: user.id } })
  if (!profile) return { ok: false, error: 'No creator profile to edit yet.' }

  const bio = clampLength(input.bio.trim(), 4000)
  const specialty = clampLength(input.specialty.trim(), 200)
  if (bio.length < 30) return { ok: false, error: 'Bio is too short — a few sentences at least.' }
  if (specialty.length === 0) return { ok: false, error: 'Add a short specialty line.' }

  const handleRaw = trimOrNull(input.displayHandle ?? null)?.toLowerCase() ?? null
  if (handleRaw && handleRaw !== user.displayHandle) {
    if (!HANDLE_PATTERN.test(handleRaw)) {
      return { ok: false, error: 'Handle: lowercase letters, numbers, underscores, hyphens. 3–32 chars.' }
    }
    const taken = await prisma.user.findUnique({ where: { displayHandle: handleRaw } })
    if (taken && taken.id !== user.id) {
      return { ok: false, error: 'That handle is taken.' }
    }
  }

  await prisma.$transaction([
    prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        bio,
        specialty,
        websiteUrl: trimOrNull(input.websiteUrl ?? null),
        instagramHandle: trimOrNull(input.instagramHandle ?? null),
        youtubeHandle: trimOrNull(input.youtubeHandle ?? null),
        tiktokHandle: trimOrNull(input.tiktokHandle ?? null),
        substackUrl: trimOrNull(input.substackUrl ?? null),
        pinterestHandle: trimOrNull(input.pinterestHandle ?? null),
      },
    }),
    ...(handleRaw && handleRaw !== user.displayHandle
      ? [
          prisma.user.update({
            where: { id: user.id },
            data: { displayHandle: handleRaw },
          }),
        ]
      : []),
  ])

  await audit({
    actorId: user.id,
    action: 'creator.profile_updated',
    resource: `User:${user.id}`,
    metadata: {},
  })

  revalidatePath('/me/creator/profile')
  revalidatePath('/me/creator')
  if (user.displayHandle) revalidatePath(`/makers/${user.displayHandle}`)
  if (handleRaw) revalidatePath(`/makers/${handleRaw}`)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Tester opt-in
// ────────────────────────────────────────────────────────────────────────────

export async function joinPatternTesterPool(): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Sign in.' }
  if (user.isSuspended) return { ok: false, error: 'Suspended accounts can’t join the tester pool.' }
  if (user.isPatternTester) return { ok: false, error: 'You’re already in the tester pool.' }

  await prisma.user.update({
    where: { id: user.id },
    data: { isPatternTester: true },
  })

  await audit({
    actorId: user.id,
    action: 'tester.opted_in',
    resource: `User:${user.id}`,
    metadata: {},
  })

  revalidatePath('/me/tester')
  revalidatePath('/me/tester/apply')
  return { ok: true }
}

export async function leavePatternTesterPool(): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Sign in.' }
  if (!user.isPatternTester) return { ok: false, error: 'You aren’t in the tester pool.' }

  await prisma.user.update({
    where: { id: user.id },
    data: { isPatternTester: false },
  })

  await audit({
    actorId: user.id,
    action: 'tester.opted_out',
    resource: `User:${user.id}`,
    metadata: {},
  })

  revalidatePath('/me/tester')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Pattern test — creator CRUD
// ────────────────────────────────────────────────────────────────────────────

async function requireCreator() {
  const user = await getCurrentDbUser()
  if (!user) throw new Error('Sign in.')
  if (!user.isCreator) throw new Error('Creator-only.')
  if (user.isSuspended) throw new Error('Suspended accounts can’t edit.')
  return user
}

interface PatternTestInput {
  tutorialId: string
  title: string
  briefForTesters: string
  maxTesters: number
  recruitingClosesAt: Date | null
}

function validatePatternTestInput(input: PatternTestInput): string | null {
  if (!input.tutorialId) return 'Pick which tutorial this test is for.'
  const title = input.title.trim()
  const brief = input.briefForTesters.trim()
  if (title.length < 5) return 'Add a short title.'
  if (brief.length < 30) return 'Brief: tell testers what they’ll do, in a couple of sentences.'
  if (!Number.isFinite(input.maxTesters) || input.maxTesters < 1 || input.maxTesters > 50) {
    return 'Pick between 1 and 50 testers.'
  }
  if (input.recruitingClosesAt && input.recruitingClosesAt.getTime() < Date.now()) {
    return 'Close date is in the past.'
  }
  return null
}

export async function createPatternTest(input: PatternTestInput): Promise<ActionResult<{ id: string }>> {
  const creator = await requireCreator()
  const err = validatePatternTestInput(input)
  if (err) return { ok: false, error: err }

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: input.tutorialId },
    select: { id: true, creatorId: true },
  })
  if (!tutorial) return { ok: false, error: 'Tutorial not found.' }
  if (tutorial.creatorId !== creator.id) {
    return { ok: false, error: 'You can only run pattern tests on tutorials you authored.' }
  }

  const test = await prisma.patternTest.create({
    data: {
      tutorialId: input.tutorialId,
      creatorId: creator.id,
      title: input.title.trim(),
      briefForTesters: input.briefForTesters.trim(),
      maxTesters: Math.floor(input.maxTesters),
      recruitingClosesAt: input.recruitingClosesAt,
      status: PatternTestStatus.DRAFT,
    },
  })

  await audit({
    actorId: creator.id,
    action: 'pattern_test.created',
    resource: `PatternTest:${test.id}`,
    metadata: { tutorialId: input.tutorialId },
  })

  await captureServerEvent({
    event: 'pattern_test_created',
    distinctId: creator.clerkId,
    properties: { patternTestId: test.id, tutorialId: input.tutorialId },
  })

  revalidatePath('/me/creator/patterns')
  return { ok: true, data: { id: test.id } }
}

export async function updatePatternTest(input: PatternTestInput & {
  patternTestId: string
}): Promise<ActionResult> {
  const creator = await requireCreator()
  const err = validatePatternTestInput(input)
  if (err) return { ok: false, error: err }

  const test = await prisma.patternTest.findUnique({ where: { id: input.patternTestId } })
  if (!test) return { ok: false, error: 'Pattern test not found.' }
  if (test.creatorId !== creator.id) return { ok: false, error: 'Not your pattern test.' }

  await prisma.patternTest.update({
    where: { id: test.id },
    data: {
      title: input.title.trim(),
      briefForTesters: input.briefForTesters.trim(),
      maxTesters: Math.floor(input.maxTesters),
      recruitingClosesAt: input.recruitingClosesAt,
    },
  })

  await audit({
    actorId: creator.id,
    action: 'pattern_test.updated',
    resource: `PatternTest:${test.id}`,
    metadata: {},
  })

  revalidatePath('/me/creator/patterns')
  revalidatePath(`/me/creator/patterns/${test.id}`)
  revalidatePath('/patterns')
  revalidatePath(`/patterns/${test.id}`)
  return { ok: true }
}

const ALLOWED_TEST_TRANSITIONS: Record<PatternTestStatus, readonly PatternTestStatus[]> = {
  [PatternTestStatus.DRAFT]: [PatternTestStatus.RECRUITING, PatternTestStatus.CANCELLED],
  [PatternTestStatus.RECRUITING]: [PatternTestStatus.IN_PROGRESS, PatternTestStatus.CANCELLED, PatternTestStatus.DRAFT],
  [PatternTestStatus.IN_PROGRESS]: [PatternTestStatus.COMPLETED, PatternTestStatus.CANCELLED],
  [PatternTestStatus.COMPLETED]: [],
  [PatternTestStatus.CANCELLED]: [PatternTestStatus.DRAFT],
}

export async function transitionPatternTestStatus(input: {
  patternTestId: string
  target: PatternTestStatus
}): Promise<ActionResult> {
  const creator = await requireCreator()
  const test = await prisma.patternTest.findUnique({ where: { id: input.patternTestId } })
  if (!test) return { ok: false, error: 'Pattern test not found.' }
  if (test.creatorId !== creator.id) return { ok: false, error: 'Not your pattern test.' }

  if (!ALLOWED_TEST_TRANSITIONS[test.status].includes(input.target)) {
    return {
      ok: false,
      error: `Can’t move from ${test.status.toLowerCase()} to ${input.target.toLowerCase()}.`,
    }
  }

  const data: Prisma.PatternTestUpdateInput = { status: input.target }
  if (input.target === PatternTestStatus.COMPLETED) data.completedAt = new Date()

  await prisma.patternTest.update({ where: { id: test.id }, data })

  await audit({
    actorId: creator.id,
    action: 'pattern_test.transitioned',
    resource: `PatternTest:${test.id}`,
    metadata: { from: test.status, to: input.target },
  })

  if (input.target === PatternTestStatus.RECRUITING) {
    await captureServerEvent({
      event: 'pattern_test_recruiting_opened',
      distinctId: creator.clerkId,
      properties: { patternTestId: test.id },
    })
  } else if (input.target === PatternTestStatus.COMPLETED) {
    await captureServerEvent({
      event: 'pattern_test_completed',
      distinctId: creator.clerkId,
      properties: { patternTestId: test.id },
    })
  }

  revalidatePath('/me/creator/patterns')
  revalidatePath(`/me/creator/patterns/${test.id}`)
  revalidatePath('/patterns')
  revalidatePath(`/patterns/${test.id}`)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Pattern test — tester applies
// ────────────────────────────────────────────────────────────────────────────

export async function applyToPatternTest(input: {
  patternTestId: string
  note?: string | null
}): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Sign in to apply.' }
  if (user.isSuspended) return { ok: false, error: 'Suspended accounts can’t apply.' }

  const test = await prisma.patternTest.findUnique({
    where: { id: input.patternTestId },
    include: { _count: { select: { assignments: { where: { status: TestAssignmentStatus.ACCEPTED } } } } },
  })
  if (!test) return { ok: false, error: 'Pattern test not found.' }
  if (test.status !== PatternTestStatus.RECRUITING) {
    return { ok: false, error: 'This pattern test isn’t recruiting right now.' }
  }
  if (test.creatorId === user.id) {
    return { ok: false, error: 'You can’t test your own pattern.' }
  }
  const existing = await prisma.testAssignment.findUnique({
    where: { patternTestId_userId: { patternTestId: test.id, userId: user.id } },
  })
  if (existing) return { ok: false, error: 'You’ve already applied.' }

  await prisma.testAssignment.create({
    data: {
      patternTestId: test.id,
      userId: user.id,
      applicationNote: trimOrNull(input.note ?? null),
      status: TestAssignmentStatus.APPLIED,
    },
  })

  await audit({
    actorId: user.id,
    action: 'pattern_test.applied',
    resource: `PatternTest:${test.id}`,
    metadata: {},
  })

  await captureServerEvent({
    event: 'pattern_test_application_submitted',
    distinctId: user.clerkId,
    properties: { patternTestId: test.id, tutorialId: test.tutorialId },
  })

  revalidatePath('/patterns')
  revalidatePath(`/patterns/${test.id}`)
  revalidatePath('/me/tester/assignments')
  revalidatePath(`/me/creator/patterns/${test.id}/applicants`)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Pattern test — creator decides on applicant
// ────────────────────────────────────────────────────────────────────────────

export async function decideTestApplicant(input: {
  assignmentId: string
  decision: 'ACCEPT' | 'REJECT'
  rejectionReason?: string | null
}): Promise<ActionResult> {
  const creator = await requireCreator()

  const assignment = await prisma.testAssignment.findUnique({
    where: { id: input.assignmentId },
    include: {
      patternTest: { select: { id: true, creatorId: true, title: true } },
      user: { select: { clerkId: true } },
    },
  })
  if (!assignment) return { ok: false, error: 'Application not found.' }
  if (assignment.patternTest.creatorId !== creator.id) {
    return { ok: false, error: 'Not your pattern test.' }
  }
  if (assignment.status !== TestAssignmentStatus.APPLIED) {
    return { ok: false, error: 'Already decided.' }
  }

  if (input.decision === 'REJECT') {
    const reason = trimOrNull(input.rejectionReason ?? null)
    await prisma.testAssignment.update({
      where: { id: assignment.id },
      data: {
        status: TestAssignmentStatus.REJECTED,
        decidedAt: new Date(),
        rejectionReason: reason,
      },
    })
    await audit({
      actorId: creator.id,
      action: 'pattern_test.applicant_rejected',
      resource: `TestAssignment:${assignment.id}`,
      metadata: { patternTestId: assignment.patternTestId },
    })
    await notify({
      userId: assignment.userId,
      type: NotificationType.PATTERN_TEST_APPLICATION_REJECTED,
      body: `Your application to test “${assignment.patternTest.title}” wasn’t taken this round.${reason ? ` ${reason}` : ''}`,
      href: '/me/tester/assignments',
    })
    await captureServerEvent({
      event: 'pattern_test_application_rejected',
      distinctId: assignment.user.clerkId,
      properties: {
        assignmentId: assignment.id,
        patternTestId: assignment.patternTestId,
        hasReason: Boolean(reason),
      },
    })
  } else {
    await prisma.testAssignment.update({
      where: { id: assignment.id },
      data: {
        status: TestAssignmentStatus.ACCEPTED,
        decidedAt: new Date(),
      },
    })
    await audit({
      actorId: creator.id,
      action: 'pattern_test.applicant_accepted',
      resource: `TestAssignment:${assignment.id}`,
      metadata: { patternTestId: assignment.patternTestId },
    })
    await notify({
      userId: assignment.userId,
      type: NotificationType.PATTERN_TEST_APPLICATION_ACCEPTED,
      body: `You’re in: “${assignment.patternTest.title}”. Open the assignment to start.`,
      href: '/me/tester/assignments',
    })
    await captureServerEvent({
      event: 'pattern_test_application_accepted',
      distinctId: assignment.user.clerkId,
      properties: {
        assignmentId: assignment.id,
        patternTestId: assignment.patternTestId,
      },
    })
  }

  revalidatePath(`/me/creator/patterns/${assignment.patternTest.id}/applicants`)
  revalidatePath('/me/tester/assignments')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Pattern test — tester lifecycle
// ────────────────────────────────────────────────────────────────────────────

export async function startTestAssignment(input: { assignmentId: string }): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Sign in.' }
  const assignment = await prisma.testAssignment.findUnique({ where: { id: input.assignmentId } })
  if (!assignment) return { ok: false, error: 'Assignment not found.' }
  if (assignment.userId !== user.id) return { ok: false, error: 'Not your assignment.' }
  if (assignment.status !== TestAssignmentStatus.ACCEPTED) {
    return { ok: false, error: 'You can’t start this yet.' }
  }
  await prisma.testAssignment.update({
    where: { id: assignment.id },
    data: { status: TestAssignmentStatus.IN_PROGRESS, startedAt: new Date() },
  })
  await captureServerEvent({
    event: 'pattern_test_started',
    distinctId: user.clerkId,
    properties: { assignmentId: assignment.id, patternTestId: assignment.patternTestId },
  })
  revalidatePath(`/me/tester/assignments/${assignment.id}`)
  revalidatePath('/me/tester/assignments')
  return { ok: true }
}

export async function withdrawTestAssignment(input: { assignmentId: string }): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Sign in.' }
  const assignment = await prisma.testAssignment.findUnique({ where: { id: input.assignmentId } })
  if (!assignment) return { ok: false, error: 'Assignment not found.' }
  if (assignment.userId !== user.id) return { ok: false, error: 'Not your assignment.' }
  if (
    assignment.status === TestAssignmentStatus.COMPLETED ||
    assignment.status === TestAssignmentStatus.WITHDRAWN ||
    assignment.status === TestAssignmentStatus.REJECTED
  ) {
    return { ok: false, error: 'Already closed.' }
  }
  await prisma.testAssignment.update({
    where: { id: assignment.id },
    data: { status: TestAssignmentStatus.WITHDRAWN, withdrawnAt: new Date() },
  })
  await captureServerEvent({
    event: 'pattern_test_withdrawn',
    distinctId: user.clerkId,
    properties: { assignmentId: assignment.id, patternTestId: assignment.patternTestId },
  })
  revalidatePath(`/me/tester/assignments/${assignment.id}`)
  revalidatePath('/me/tester/assignments')
  return { ok: true }
}

interface FeedbackInput {
  patternClarityScore: number
  patternClarityComment: string
  instructionClarityScore: number
  instructionClarityComment: string
  photoAccuracyScore: number
  photoAccuracyComment: string
  suppliesAccuracyScore: number
  suppliesAccuracyComment: string
  timeTakenMinutes: number | null
  estimatedTimeMinutes: number | null
  whatWorked: string
  whatDidnt: string
}

function validScore(n: number): boolean {
  return Number.isFinite(n) && n >= 1 && n <= 5 && Number.isInteger(n)
}

export async function submitTestFeedback(input: {
  assignmentId: string
  feedback: FeedbackInput
}): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Sign in.' }
  const assignment = await prisma.testAssignment.findUnique({
    where: { id: input.assignmentId },
    include: { patternTest: { select: { id: true, creatorId: true, title: true } } },
  })
  if (!assignment) return { ok: false, error: 'Assignment not found.' }
  if (assignment.userId !== user.id) return { ok: false, error: 'Not your assignment.' }
  if (
    assignment.status !== TestAssignmentStatus.IN_PROGRESS &&
    assignment.status !== TestAssignmentStatus.ACCEPTED
  ) {
    return { ok: false, error: 'You can’t submit feedback for this assignment.' }
  }

  const f = input.feedback
  if (
    !validScore(f.patternClarityScore) ||
    !validScore(f.instructionClarityScore) ||
    !validScore(f.photoAccuracyScore) ||
    !validScore(f.suppliesAccuracyScore)
  ) {
    return { ok: false, error: 'Scores must be 1–5.' }
  }
  if (f.whatWorked.trim().length === 0 || f.whatDidnt.trim().length === 0) {
    return { ok: false, error: 'Fill in what worked and what didn’t.' }
  }

  const feedbackJson: Prisma.InputJsonValue = {
    patternClarity: { score: f.patternClarityScore, comment: f.patternClarityComment.trim() },
    instructionClarity: { score: f.instructionClarityScore, comment: f.instructionClarityComment.trim() },
    photoAccuracy: { score: f.photoAccuracyScore, comment: f.photoAccuracyComment.trim() },
    suppliesAccuracy: { score: f.suppliesAccuracyScore, comment: f.suppliesAccuracyComment.trim() },
    timeTakenMinutes: f.timeTakenMinutes,
    estimatedTimeMinutes: f.estimatedTimeMinutes,
    whatWorked: f.whatWorked.trim(),
    whatDidnt: f.whatDidnt.trim(),
    submittedAt: new Date().toISOString(),
  }

  await prisma.testAssignment.update({
    where: { id: assignment.id },
    data: {
      feedback: feedbackJson,
      status: TestAssignmentStatus.COMPLETED,
      completedAt: new Date(),
      ...(assignment.status === TestAssignmentStatus.ACCEPTED ? { startedAt: assignment.startedAt ?? new Date() } : {}),
    },
  })

  await audit({
    actorId: user.id,
    action: 'pattern_test.feedback_submitted',
    resource: `TestAssignment:${assignment.id}`,
    metadata: { patternTestId: assignment.patternTestId },
  })

  await notify({
    userId: assignment.patternTest.creatorId,
    type: NotificationType.PATTERN_TEST_FEEDBACK_RECEIVED,
    body: `Feedback submitted on “${assignment.patternTest.title}”.`,
    href: `/me/creator/patterns/${assignment.patternTest.id}/feedback`,
  })

  await captureServerEvent({
    event: 'pattern_test_feedback_submitted',
    distinctId: user.clerkId,
    properties: {
      assignmentId: assignment.id,
      patternTestId: assignment.patternTestId,
      timeTakenMinutes: f.timeTakenMinutes,
    },
  })

  revalidatePath(`/me/tester/assignments/${assignment.id}`)
  revalidatePath('/me/tester/assignments')
  revalidatePath(`/me/creator/patterns/${assignment.patternTest.id}/feedback`)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Creator-tutorial moderation
// ────────────────────────────────────────────────────────────────────────────

/**
 * Creator submits a draft for admin review. Only PENDING_MODERATION drafts
 * appear in the admin moderation queue; otherwise they’re invisible to admins.
 */
export async function submitCreatorTutorialForModeration(input: {
  tutorialId: string
}): Promise<ActionResult> {
  const creator = await requireCreator()
  const tutorial = await prisma.tutorial.findUnique({
    where: { id: input.tutorialId },
  })
  if (!tutorial) return { ok: false, error: 'Tutorial not found.' }
  if (tutorial.creatorId !== creator.id) return { ok: false, error: 'Not your tutorial.' }
  if (tutorial.status !== TutorialStatus.DRAFT) {
    return { ok: false, error: 'Only drafts can be submitted for review.' }
  }

  await prisma.tutorial.update({
    where: { id: tutorial.id },
    data: { status: TutorialStatus.PENDING_MODERATION },
  })

  await audit({
    actorId: creator.id,
    action: 'tutorial.submitted_for_moderation',
    resource: `Tutorial:${tutorial.id}`,
    metadata: {},
  })

  await captureServerEvent({
    event: 'creator_tutorial_submitted_for_review',
    distinctId: creator.clerkId,
    properties: { tutorialId: tutorial.id },
  })

  // Notify admins. We notify any user with role ADMIN — small list pre-launch.
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { id: true },
  })
  for (const a of admins) {
    await notify({
      userId: a.id,
      type: NotificationType.CREATOR_TUTORIAL_SUBMITTED,
      body: `Creator submitted “${tutorial.title}” for review.`,
      href: `/admin/creators`,
    })
  }

  revalidatePath('/me/creator/tutorials')
  revalidatePath(`/me/creator/tutorials/${tutorial.id}`)
  revalidatePath('/admin/creators')
  return { ok: true }
}

/**
 * Admin moderates a creator-submitted tutorial: either publish, or send back
 * to draft with an optional note. The note is captured in the audit log
 * metadata and the user-facing notification.
 */
export async function moderateCreatorTutorial(input: {
  tutorialId: string
  decision: 'PUBLISH' | 'SEND_BACK'
  note?: string | null
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: input.tutorialId },
    include: {
      category: { select: { slug: true } },
      creator: { select: { id: true, clerkId: true } },
    },
  })
  if (!tutorial) return { ok: false, error: 'Tutorial not found.' }
  if (!tutorial.creatorId || !tutorial.creator) {
    return { ok: false, error: 'Not a creator-authored tutorial.' }
  }
  if (tutorial.status !== TutorialStatus.PENDING_MODERATION) {
    return { ok: false, error: 'This tutorial isn’t pending moderation.' }
  }

  const note = trimOrNull(input.note ?? null)

  if (input.decision === 'PUBLISH') {
    // Was this the creator's first publication? Count prior PUBLISHED rows
    // before flipping.
    const priorPublishedCount = await prisma.tutorial.count({
      where: {
        creatorId: tutorial.creatorId,
        status: TutorialStatus.PUBLISHED,
        id: { not: tutorial.id },
      },
    })
    const isFirstPublish = priorPublishedCount === 0

    await prisma.tutorial.update({
      where: { id: tutorial.id },
      data: {
        status: TutorialStatus.PUBLISHED,
        publishedAt: tutorial.publishedAt ?? new Date(),
      },
    })
    await audit({
      actorId: actor.id,
      action: 'tutorial.creator_published',
      resource: `Tutorial:${tutorial.id}`,
      metadata: { note },
    })
    await notify({
      userId: tutorial.creatorId,
      type: NotificationType.CREATOR_TUTORIAL_PUBLISHED,
      body: `Your tutorial “${tutorial.title}” is live.${note ? ` ${note}` : ''}`,
      href: `/${tutorial.category.slug}/${tutorial.slug}`,
    })
    await captureServerEvent({
      event: 'creator_tutorial_approved',
      distinctId: tutorial.creator.clerkId,
      properties: { tutorialId: tutorial.id, creatorUserId: tutorial.creatorId },
    })
    if (isFirstPublish) {
      await captureServerEvent({
        event: 'creator_first_publish',
        distinctId: tutorial.creator.clerkId,
        properties: {
          tutorialId: tutorial.id,
          creatorUserId: tutorial.creatorId,
          isFirst: true,
        },
      })
    }
  } else {
    if (!note) return { ok: false, error: 'Add a note so the creator knows what to change.' }
    await prisma.tutorial.update({
      where: { id: tutorial.id },
      data: { status: TutorialStatus.DRAFT },
    })
    await audit({
      actorId: actor.id,
      action: 'tutorial.creator_sent_back',
      resource: `Tutorial:${tutorial.id}`,
      metadata: { note },
    })
    await notify({
      userId: tutorial.creatorId,
      type: NotificationType.CREATOR_TUTORIAL_REJECTED,
      body: `Your tutorial “${tutorial.title}” was sent back for changes: ${note}`,
      href: `/me/creator/tutorials/${tutorial.id}`,
    })
    await captureServerEvent({
      event: 'creator_tutorial_returned_for_edits',
      distinctId: tutorial.creator.clerkId,
      properties: { tutorialId: tutorial.id, creatorUserId: tutorial.creatorId },
    })
  }

  revalidatePath('/admin/creators')
  revalidatePath(`/admin/creators/${tutorial.creatorId}`)
  revalidatePath('/me/creator/tutorials')
  revalidatePath(`/me/creator/tutorials/${tutorial.id}`)
  revalidatePath(`/${tutorial.category.slug}/${tutorial.slug}`)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Admin: revoke creator status
// ────────────────────────────────────────────────────────────────────────────

export async function revokeCreatorStatus(input: { userId: string }): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    include: { creatorProfile: true },
  })
  if (!target) return { ok: false, error: 'User not found.' }
  if (!target.isCreator) return { ok: false, error: 'User isn’t a creator.' }
  if (actor.id === target.id) return { ok: false, error: 'You can’t revoke your own creator status.' }
  const targetClerkId = target.clerkId

  await prisma.$transaction([
    prisma.user.update({
      where: { id: target.id },
      data: { isCreator: false, creatorVerifiedAt: null },
    }),
    ...(target.creatorProfile
      ? [
          prisma.creatorProfile.update({
            where: { id: target.creatorProfile.id },
            data: { applicationStatus: CreatorApplicationStatus.REJECTED, decidedAt: new Date(), decidedById: actor.id, rejectionReason: 'Status revoked by admin.' },
          }),
        ]
      : []),
  ])

  await audit({
    actorId: actor.id,
    action: 'creator.status_revoked',
    resource: `User:${target.id}`,
    metadata: {},
  })

  await captureServerEvent({
    event: 'creator_status_revoked',
    distinctId: targetClerkId,
    properties: { creatorUserId: target.id },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${target.id}`)
  revalidatePath('/admin/creators')
  revalidatePath('/makers')
  return { ok: true }
}

export async function setPatternTesterStatus(input: {
  userId: string
  enabled: boolean
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })
  const target = await prisma.user.findUnique({ where: { id: input.userId } })
  if (!target) return { ok: false, error: 'User not found.' }
  if (target.isPatternTester === input.enabled) {
    return { ok: false, error: input.enabled ? 'Already a tester.' : 'Not a tester.' }
  }
  await prisma.user.update({
    where: { id: target.id },
    data: { isPatternTester: input.enabled },
  })
  await audit({
    actorId: actor.id,
    action: input.enabled ? 'tester.added' : 'tester.removed',
    resource: `User:${target.id}`,
    metadata: {},
  })
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${target.id}`)
  return { ok: true }
}

// Re-export the redirect helper for forms that want server-side redirects.
export async function redirectAfterAction(path: string): Promise<never> {
  redirect(path)
}
