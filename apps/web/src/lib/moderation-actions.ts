'use server'

import { revalidatePath } from 'next/cache'
import {
  prisma,
  ReviewStatus,
  UGCPhotoStatus,
  UGCStatus,
  ErrataStatus,
  ReportStatus,
  NotificationType,
  SuspensionStatus,
  UserRole,
} from '@homemade/db'
import { audit } from './audit'
import { notify } from './notify'
import { requireAdminRole } from './get-current-user'
import { inngest } from '@/inngest/client'
import { captureServerEvent } from './posthog'

async function fireOutcome(
  actorId: string,
  targetType: 'review' | 'photo' | 'question' | 'answer' | 'errata' | 'report' | 'user',
  targetId: string,
  outcome: string,
  extras: { tutorialId?: string; userId?: string } = {},
): Promise<void> {
  try {
    await inngest.send({
      name: 'moderation/outcome.notified',
      data: { actorId, targetType, targetId, outcome, ...extras },
    })
  } catch {
    // never block the moderation action on Inngest hiccups
  }
}

type ActionResult = { ok: true } | { ok: false; error: string }

function tutorialPath(t: { slug: string; category: { slug: string } } | null | undefined) {
  if (!t) return null
  return `/${t.category.slug}/${t.slug}`
}

// ────────────────────────────────────────────────────────────────────────────
// Reviews
// ────────────────────────────────────────────────────────────────────────────

export async function moderateReview(input: {
  reviewId: string
  action: 'APPROVE' | 'HIDE' | 'REMOVE'
  note?: string | null
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const review = await prisma.review.findUnique({
    where: { id: input.reviewId },
    include: {
      tutorial: { select: { slug: true, title: true, category: { select: { slug: true } } } },
    },
  })
  if (!review) return { ok: false, error: 'Review not found.' }

  const requiresNote = input.action === 'HIDE' || input.action === 'REMOVE'
  const note = input.note?.trim() ?? ''
  if (requiresNote && !note) {
    return { ok: false, error: 'Add a short note so the user knows why.' }
  }

  const nextStatus =
    input.action === 'APPROVE'
      ? ReviewStatus.PUBLISHED
      : input.action === 'HIDE'
        ? ReviewStatus.HIDDEN
        : ReviewStatus.REMOVED

  await prisma.review.update({
    where: { id: review.id },
    data: {
      status: nextStatus,
      moderatedAt: new Date(),
      moderatedById: actor.id,
      moderationNote: note || null,
    },
  })

  const actionLabel =
    input.action === 'APPROVE'
      ? 'REVIEW_APPROVED'
      : input.action === 'HIDE'
        ? 'REVIEW_HIDDEN'
        : 'REVIEW_REMOVED'

  await audit({
    actorId: actor.id,
    action: actionLabel.toLowerCase().replace('_', '.'),
    resource: `Review:${review.id}`,
    metadata: { tutorialId: review.tutorialId, before: review.status, after: nextStatus, note },
  })

  // Notify the user
  const notifType: NotificationType =
    input.action === 'APPROVE'
      ? NotificationType.REVIEW_PUBLISHED
      : input.action === 'HIDE'
        ? NotificationType.REVIEW_HIDDEN
        : NotificationType.REVIEW_REMOVED
  const message =
    input.action === 'APPROVE'
      ? `Your review of “${review.tutorial.title}” is now published.`
      : `Your review of “${review.tutorial.title}” was ${input.action === 'HIDE' ? 'hidden' : 'removed'}: ${note}`

  await notify({
    userId: review.userId,
    type: notifType,
    body: message,
    href: tutorialPath(review.tutorial),
  })

  await fireOutcome(actor.id, 'review', review.id, input.action, {
    tutorialId: review.tutorialId,
    userId: review.userId,
  })

  if (input.action === 'APPROVE') {
    await captureServerEvent({
      event: 'review_published',
      distinctId: review.userId,
      properties: { reviewId: review.id, tutorialId: review.tutorialId },
    })
  }

  revalidatePath('/admin/reviews')
  const path = tutorialPath(review.tutorial)
  if (path) revalidatePath(path)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// UGC photos
// ────────────────────────────────────────────────────────────────────────────

export async function moderateUgcPhoto(input: {
  photoId: string
  action: 'APPROVE' | 'REJECT'
  rejectionReason?: string | null
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const photo = await prisma.uGCPhoto.findUnique({
    where: { id: input.photoId },
    include: {
      tutorial: { select: { slug: true, title: true, category: { select: { slug: true } } } },
    },
  })
  if (!photo) return { ok: false, error: 'Photo not found.' }

  const reason = input.rejectionReason?.trim() ?? ''
  if (input.action === 'REJECT' && !reason) {
    return { ok: false, error: 'Give a short reason so the user knows why.' }
  }

  const nextStatus =
    input.action === 'APPROVE' ? UGCPhotoStatus.APPROVED : UGCPhotoStatus.REJECTED

  await prisma.uGCPhoto.update({
    where: { id: photo.id },
    data: {
      status: nextStatus,
      moderatedAt: new Date(),
      moderatedById: actor.id,
      rejectionReason: input.action === 'REJECT' ? reason : null,
    },
  })

  await audit({
    actorId: actor.id,
    action: input.action === 'APPROVE' ? 'photo.approved' : 'photo.rejected',
    resource: `UGCPhoto:${photo.id}`,
    metadata: { tutorialId: photo.tutorialId, before: photo.status, after: nextStatus, reason },
  })

  await notify({
    userId: photo.userId,
    type:
      input.action === 'APPROVE'
        ? NotificationType.PHOTO_APPROVED
        : NotificationType.PHOTO_REJECTED,
    body:
      input.action === 'APPROVE'
        ? `Your photo of “${photo.tutorial.title}” is now visible to readers.`
        : `Your photo of “${photo.tutorial.title}” wasn’t approved: ${reason}`,
    href: tutorialPath(photo.tutorial),
  })

  await fireOutcome(actor.id, 'photo', photo.id, input.action, {
    tutorialId: photo.tutorialId,
    userId: photo.userId,
  })

  await captureServerEvent({
    event: input.action === 'APPROVE' ? 'photo_approved' : 'photo_rejected',
    distinctId: photo.userId,
    properties: { photoId: photo.id, tutorialId: photo.tutorialId },
  })

  revalidatePath('/admin/ugc-photos')
  const path = tutorialPath(photo.tutorial)
  if (path) revalidatePath(path)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Questions & Answers
// ────────────────────────────────────────────────────────────────────────────

export async function moderateQuestion(input: {
  questionId: string
  action: 'APPROVE' | 'HIDE' | 'REMOVE'
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const q = await prisma.question.findUnique({
    where: { id: input.questionId },
    include: {
      tutorial: { select: { slug: true, title: true, category: { select: { slug: true } } } },
    },
  })
  if (!q) return { ok: false, error: 'Question not found.' }

  const nextStatus =
    input.action === 'APPROVE'
      ? UGCStatus.PUBLISHED
      : input.action === 'HIDE'
        ? UGCStatus.HIDDEN
        : UGCStatus.REMOVED

  await prisma.question.update({
    where: { id: q.id },
    data: { status: nextStatus },
  })

  await audit({
    actorId: actor.id,
    action:
      input.action === 'APPROVE'
        ? 'question.approved'
        : input.action === 'HIDE'
          ? 'question.hidden'
          : 'question.removed',
    resource: `Question:${q.id}`,
    metadata: { before: q.status, after: nextStatus },
  })

  await notify({
    userId: q.userId,
    type:
      input.action === 'APPROVE'
        ? NotificationType.QUESTION_PUBLISHED
        : NotificationType.QUESTION_HIDDEN,
    body:
      input.action === 'APPROVE'
        ? `Your question on “${q.tutorial.title}” is now visible.`
        : `Your question on “${q.tutorial.title}” was hidden.`,
    href: tutorialPath(q.tutorial),
  })

  await fireOutcome(actor.id, 'question', q.id, input.action, {
    tutorialId: q.tutorialId,
    userId: q.userId,
  })

  revalidatePath('/admin/questions')
  const path = tutorialPath(q.tutorial)
  if (path) revalidatePath(path)
  return { ok: true }
}

export async function moderateAnswer(input: {
  answerId: string
  action: 'APPROVE' | 'HIDE'
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const a = await prisma.answer.findUnique({
    where: { id: input.answerId },
    include: {
      question: {
        include: {
          tutorial: { select: { slug: true, title: true, category: { select: { slug: true } } } },
        },
      },
    },
  })
  if (!a) return { ok: false, error: 'Answer not found.' }

  const nextStatus =
    input.action === 'APPROVE' ? UGCStatus.PUBLISHED : UGCStatus.HIDDEN

  await prisma.answer.update({
    where: { id: a.id },
    data: { status: nextStatus },
  })

  await audit({
    actorId: actor.id,
    action: input.action === 'APPROVE' ? 'answer.approved' : 'answer.hidden',
    resource: `Answer:${a.id}`,
    metadata: { questionId: a.questionId, before: a.status, after: nextStatus },
  })

  await notify({
    userId: a.userId,
    type:
      input.action === 'APPROVE'
        ? NotificationType.ANSWER_PUBLISHED
        : NotificationType.ANSWER_HIDDEN,
    body:
      input.action === 'APPROVE'
        ? `Your answer on “${a.question.tutorial.title}” is now visible.`
        : `Your answer on “${a.question.tutorial.title}” was hidden.`,
    href: tutorialPath(a.question.tutorial),
  })

  await fireOutcome(actor.id, 'answer', a.id, input.action, {
    userId: a.userId,
  })

  revalidatePath('/admin/questions')
  const path = tutorialPath(a.question.tutorial)
  if (path) revalidatePath(path)
  return { ok: true }
}

/**
 * Admins / editors can add an answer directly from the moderation queue. The
 * answer publishes immediately with `isAuthorAnswer = true`.
 */
export async function adminPostAnswer(input: {
  questionId: string
  body: string
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })
  const body = input.body.trim()
  if (body.length === 0) return { ok: false, error: 'Answer cannot be empty.' }
  if (body.length > 5000) return { ok: false, error: 'Answers are capped at 5,000 characters.' }

  const q = await prisma.question.findUnique({
    where: { id: input.questionId },
    include: {
      tutorial: { select: { slug: true, category: { select: { slug: true } } } },
    },
  })
  if (!q) return { ok: false, error: 'Question not found.' }

  const answer = await prisma.answer.create({
    data: {
      userId: actor.id,
      questionId: q.id,
      body,
      isAuthorAnswer: true,
      status: UGCStatus.PUBLISHED,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'answer.author_posted',
    resource: `Answer:${answer.id}`,
    metadata: { questionId: q.id },
  })

  revalidatePath('/admin/questions')
  const path = tutorialPath(q.tutorial)
  if (path) revalidatePath(path)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Errata
// ────────────────────────────────────────────────────────────────────────────

export async function resolveErrata(input: {
  errataId: string
  action: 'ADDRESS' | 'DISMISS'
  note?: string | null
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const errata = await prisma.errata.findUnique({
    where: { id: input.errataId },
    include: {
      tutorial: { select: { slug: true, title: true, category: { select: { slug: true } } } },
    },
  })
  if (!errata) return { ok: false, error: 'Errata not found.' }

  const note = input.note?.trim() ?? ''
  const nextStatus =
    input.action === 'ADDRESS' ? ErrataStatus.ADDRESSED : ErrataStatus.DISMISSED

  await prisma.errata.update({
    where: { id: errata.id },
    data: {
      status: nextStatus,
      resolvedAt: new Date(),
      resolvedById: actor.id,
      resolutionNote: note || null,
    },
  })

  await audit({
    actorId: actor.id,
    action: input.action === 'ADDRESS' ? 'errata.addressed' : 'errata.dismissed',
    resource: `Errata:${errata.id}`,
    metadata: { tutorialId: errata.tutorialId, note },
  })

  if (errata.userId) {
    await notify({
      userId: errata.userId,
      type:
        input.action === 'ADDRESS'
          ? NotificationType.ERRATA_ADDRESSED
          : NotificationType.ERRATA_DISMISSED,
      body:
        input.action === 'ADDRESS'
          ? `The issue you flagged on “${errata.tutorial.title}” has been addressed.${note ? ` ${note}` : ''}`
          : `The issue you flagged on “${errata.tutorial.title}” has been reviewed.${note ? ` ${note}` : ''}`,
      href: tutorialPath(errata.tutorial),
    })
  }

  await fireOutcome(actor.id, 'errata', errata.id, input.action, {
    tutorialId: errata.tutorialId,
    userId: errata.userId ?? undefined,
  })

  revalidatePath('/admin/errata')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Reports
// ────────────────────────────────────────────────────────────────────────────

export async function resolveReport(input: {
  reportId: string
  action: 'RESOLVED_ACTION_TAKEN' | 'RESOLVED_NO_ACTION' | 'DISMISSED'
  resolutionAction?: string | null
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const report = await prisma.report.findUnique({ where: { id: input.reportId } })
  if (!report) return { ok: false, error: 'Report not found.' }

  const nextStatus: ReportStatus =
    input.action === 'RESOLVED_ACTION_TAKEN'
      ? ReportStatus.RESOLVED_ACTION_TAKEN
      : input.action === 'RESOLVED_NO_ACTION'
        ? ReportStatus.RESOLVED_NO_ACTION
        : ReportStatus.DISMISSED

  await prisma.report.update({
    where: { id: report.id },
    data: {
      status: nextStatus,
      resolvedAt: new Date(),
      resolvedById: actor.id,
      resolutionAction: input.resolutionAction?.trim() || null,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'report.resolved',
    resource: `Report:${report.id}`,
    metadata: {
      targetType: report.targetType,
      targetId: report.targetId,
      before: report.status,
      after: nextStatus,
    },
  })

  revalidatePath('/admin/reports')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// User role changes + suspensions
// ────────────────────────────────────────────────────────────────────────────

export async function changeUserRole(input: {
  userId: string
  role: 'ADMIN' | 'EDITOR' | 'MEMBER'
}): Promise<ActionResult> {
  // Only ADMIN can change roles.
  const actor = await requireAdminRole({ minimum: 'ADMIN' })

  if (actor.id === input.userId) {
    return { ok: false, error: 'You can’t change your own role.' }
  }

  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, email: true },
  })
  if (!target) return { ok: false, error: 'User not found.' }

  let nextRole: UserRole
  switch (input.role) {
    case 'ADMIN':
      nextRole = UserRole.ADMIN
      break
    case 'EDITOR':
      nextRole = UserRole.EDITOR
      break
    case 'MEMBER':
      nextRole = UserRole.MEMBER
      break
    default:
      return { ok: false, error: 'Unknown role.' }
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { role: nextRole },
  })

  await audit({
    actorId: actor.id,
    action: 'user.role_changed',
    resource: `User:${target.id}`,
    metadata: { email: target.email, before: target.role, after: nextRole },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${target.id}`)
  return { ok: true }
}

export async function suspendUser(input: {
  userId: string
  reason: string
  endsAt: Date | null
}): Promise<ActionResult> {
  // Permanent bans require ADMIN; bounded suspensions can be applied by EDITOR.
  const minimum = input.endsAt === null ? 'ADMIN' : 'EDITOR'
  const actor = await requireAdminRole({ minimum })

  const reason = input.reason.trim()
  if (!reason) return { ok: false, error: 'Add a short reason.' }

  if (actor.id === input.userId) {
    return { ok: false, error: 'You can’t suspend yourself.' }
  }

  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, email: true, isSuspended: true },
  })
  if (!target) return { ok: false, error: 'User not found.' }
  if (target.role === UserRole.ADMIN) {
    return { ok: false, error: 'Cannot suspend an admin.' }
  }
  if (target.isSuspended) {
    return { ok: false, error: 'User is already suspended.' }
  }

  await prisma.$transaction([
    prisma.userSuspension.create({
      data: {
        userId: target.id,
        suspendedById: actor.id,
        reason,
        endsAt: input.endsAt,
      },
    }),
    prisma.user.update({
      where: { id: target.id },
      data: { isSuspended: true, suspendedUntil: input.endsAt },
    }),
  ])

  await audit({
    actorId: actor.id,
    action: 'user.suspended',
    resource: `User:${target.id}`,
    metadata: { reason, endsAt: input.endsAt?.toISOString() ?? null },
  })

  await notify({
    userId: target.id,
    type: NotificationType.ACCOUNT_SUSPENDED,
    body: `Your account has been suspended${input.endsAt ? ` until ${input.endsAt.toLocaleDateString('en-GB')}` : ''}. ${reason}`,
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${target.id}`)
  revalidatePath('/admin/users/suspended')
  return { ok: true }
}

export async function liftSuspension(input: { userId: string }): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, isSuspended: true, email: true },
  })
  if (!target) return { ok: false, error: 'User not found.' }
  if (!target.isSuspended) {
    return { ok: false, error: 'User isn’t suspended.' }
  }

  await prisma.$transaction([
    prisma.userSuspension.updateMany({
      where: { userId: target.id, status: SuspensionStatus.ACTIVE },
      data: {
        status: SuspensionStatus.LIFTED,
        liftedAt: new Date(),
        liftedById: actor.id,
      },
    }),
    prisma.user.update({
      where: { id: target.id },
      data: { isSuspended: false, suspendedUntil: null },
    }),
  ])

  await audit({
    actorId: actor.id,
    action: 'user.unsuspended',
    resource: `User:${target.id}`,
    metadata: { email: target.email },
  })

  await notify({
    userId: target.id,
    type: NotificationType.ACCOUNT_UNSUSPENDED,
    body: 'Your account has been restored. Welcome back.',
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${target.id}`)
  revalidatePath('/admin/users/suspended')
  return { ok: true }
}
