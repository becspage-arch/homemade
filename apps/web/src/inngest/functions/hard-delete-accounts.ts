import 'server-only'
import { prisma, DeletionStatus } from '@homemade/db'
import { inngest } from '../client'
import { hardDeleteAccount } from '@/lib/hard-delete-account'
import { captureServerEvent, flushPostHog } from '@/lib/posthog'

/**
 * Daily cron at 03:00 UTC. Picks up every AccountDeletionRequest whose
 * 30-day grace period has elapsed and runs the hard-delete helper for
 * each one. Each user is processed in its own Inngest step so a single
 * failure doesn't block the rest of the queue.
 */
export const hardDeleteScheduledAccounts = inngest.createFunction(
  {
    id: 'hard-delete-scheduled-accounts',
    name: 'Hard-delete scheduled account deletions',
    triggers: [{ cron: '0 3 * * *' }],
  },
  async ({ step }) => {
    // Pre-load the Clerk id + request timestamps alongside the queue. The
    // hard-delete scrubs personal columns but leaves clerkId in place, so we
    // could read it after — but reading before lets us fire the analytics
    // event with the same id PostHog already knows for this user even if a
    // future scrub change touches that column.
    const due = await step.run('find-due', async () =>
      prisma.accountDeletionRequest.findMany({
        where: {
          status: DeletionStatus.SCHEDULED,
          scheduledFor: { lte: new Date() },
        },
        select: {
          id: true,
          userId: true,
          reason: true,
          requestedAt: true,
          user: { select: { clerkId: true } },
        },
      }),
    )

    if (due.length === 0) return { processed: 0 }

    let processed = 0
    for (const req of due) {
      await step.run(`hard-delete-${req.userId}`, async () => {
        const completedAt = new Date()
        await hardDeleteAccount({
          userId: req.userId,
          requestId: req.id,
          actorId: req.userId,
          trigger: 'cron',
        })
        // Fire analytics after the scrub so we only emit on success.
        // distinctId is the Clerk id so the event stitches onto the same
        // PostHog person the user's lifecycle was tracked against.
        // `req.requestedAt` comes back as an ISO string because Inngest's
        // `step.run` serialises the find-due return value through JSON.
        await captureServerEvent({
          event: 'account_deletion_completed',
          distinctId: req.user.clerkId,
          properties: {
            userId: req.userId,
            daysScheduledFor: 30,
            requestedAt: req.requestedAt,
            completedAt: completedAt.toISOString(),
            reason: req.reason ?? null,
          },
        })
      })
      processed++
    }

    await flushPostHog()
    return { processed }
  },
)
