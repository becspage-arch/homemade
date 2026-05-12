import 'server-only'

import { prisma, DeletionStatus, Prisma } from '@homemade/db'
import { audit } from './audit'

/**
 * The placeholder value that replaces a deleted user's email so the row
 * can stay (audit-log integrity) without retaining personal data. The email
 * column has a unique constraint, so we suffix with the user's id to keep
 * each scrubbed row distinct.
 */
const REDACTED_EMAIL_PREFIX = 'deleted-user'

/**
 * Hard-delete the personal data attached to a user account whose deletion
 * grace period has elapsed. We do not physically delete the `User` row —
 * `AuditLog.actorId` keeps a foreign key on it, and audit-log integrity is
 * a legal/operational requirement that outranks PII minimisation. Instead
 * we delete every user-owned content row and scrub the `User` row's
 * personal fields.
 *
 * Tutorials authored by the user are intentionally left in place. The
 * editorial value is high; the public layer renders authorless tutorials
 * as "Homemade" / no byline once the User row's personal fields are null.
 *
 * Pass `requestId` to also flip the `AccountDeletionRequest` to COMPLETED
 * inside the same transaction. Pass `actorId` so audit entries are
 * attributable to the actor who triggered the delete (the cron is
 * self-actor — it uses the deleted user's own id, since they're the one
 * whose data is being processed and we have nothing better to attribute
 * to until we model a system-actor).
 */
export async function hardDeleteAccount(input: {
  userId: string
  requestId: string | null
  actorId: string
  trigger: 'cron' | 'manual'
}): Promise<{
  ok: true
  deletedCounts: Record<string, number>
}> {
  const { userId, requestId, actorId, trigger } = input

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  })
  if (!existing) {
    throw new Error(`User ${userId} not found.`)
  }

  const deletedCounts = await prisma.$transaction(async (tx) => {
    // Children that point at user-owned aggregates (helpfuls / upvotes /
    // assignments) are dropped first so their parent deletes don't trip
    // referential checks. Most user-owned models declare onDelete: Cascade
    // on the User relation, but we never actually delete the User row, so
    // that cascade never fires — every delete here has to be explicit.
    const helpfuls = await tx.reviewHelpful.deleteMany({ where: { userId } })
    const upvotes = await tx.questionUpvote.deleteMany({ where: { userId } })
    const testAssignments = await tx.testAssignment.deleteMany({ where: { userId } })

    // User-authored UGC.
    const reviews = await tx.review.deleteMany({ where: { userId } })
    const ugcPhotos = await tx.uGCPhoto.deleteMany({ where: { userId } })
    const answers = await tx.answer.deleteMany({ where: { userId } })
    const questions = await tx.question.deleteMany({ where: { userId } })
    const errata = await tx.errata.deleteMany({ where: { userId } })
    const reports = await tx.report.deleteMany({ where: { reporterId: userId } })

    // Private-to-the-user state.
    const bookmarks = await tx.bookmark.deleteMany({ where: { userId } })
    const userProjects = await tx.userProject.deleteMany({ where: { userId } })
    const notifications = await tx.notification.deleteMany({ where: { userId } })
    const dataExportRequests = await tx.dataExportRequest.deleteMany({ where: { userId } })

    // Creator program — drop the profile and any pattern tests they own.
    // PatternTest cascades TestAssignment so re-deleting them isn't needed.
    const patternTests = await tx.patternTest.deleteMany({ where: { creatorId: userId } })
    const creatorProfile = await tx.creatorProfile.deleteMany({ where: { userId } })

    // Suspensions on this user (subject) — keep the moderation history?
    // Drop them. The suspension is a sanction tied to a now-deleted account;
    // there is nothing left to enforce.
    const suspensions = await tx.userSuspension.deleteMany({
      where: { userId },
    })

    // Scrub the User row. The unique-email constraint means we can't all
    // collapse to one literal placeholder; suffix with the user id to keep
    // every scrubbed row distinct without retaining the original address.
    const scrubData: Prisma.UserUpdateInput = {
      email: `${REDACTED_EMAIL_PREFIX}+${userId}@homemade.local`,
      name: null,
      displayHandle: null,
      bio: null,
      cookieConsent: Prisma.DbNull,
      beginnerMode: false,
      isSuspended: false,
      suspendedUntil: null,
      isCreator: false,
      creatorVerifiedAt: null,
      isPatternTester: false,
      deletionScheduledFor: null,
      deletedAt: new Date(),
      hardDeletedAt: new Date(),
    }
    await tx.user.update({ where: { id: userId }, data: scrubData })

    if (requestId) {
      await tx.accountDeletionRequest.update({
        where: { id: requestId },
        data: { status: DeletionStatus.COMPLETED, completedAt: new Date() },
      })
    }

    return {
      reviewHelpfuls: helpfuls.count,
      questionUpvotes: upvotes.count,
      testAssignments: testAssignments.count,
      reviews: reviews.count,
      ugcPhotos: ugcPhotos.count,
      answers: answers.count,
      questions: questions.count,
      errata: errata.count,
      reports: reports.count,
      bookmarks: bookmarks.count,
      userProjects: userProjects.count,
      notifications: notifications.count,
      dataExportRequests: dataExportRequests.count,
      patternTests: patternTests.count,
      creatorProfile: creatorProfile.count,
      suspensions: suspensions.count,
    }
  })

  // Audit log — outside the transaction so a downstream audit failure
  // doesn't roll back the actual deletion. Email is recorded as the
  // redacted placeholder so the audit log itself never carries the
  // original address.
  await audit({
    actorId,
    action: 'account.hard_deleted',
    resource: `User:${userId}`,
    metadata: {
      trigger,
      requestId,
      redactedEmail: `${REDACTED_EMAIL_PREFIX}+${userId}@homemade.local`,
      ...deletedCounts,
    },
  })

  return { ok: true, deletedCounts }
}
