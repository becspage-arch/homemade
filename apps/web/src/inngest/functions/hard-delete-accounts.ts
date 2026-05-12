import 'server-only'
import { prisma, DeletionStatus } from '@homemade/db'
import { inngest } from '../client'
import { hardDeleteAccount } from '@/lib/hard-delete-account'

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
    const due = await step.run('find-due', async () =>
      prisma.accountDeletionRequest.findMany({
        where: {
          status: DeletionStatus.SCHEDULED,
          scheduledFor: { lte: new Date() },
        },
        select: { id: true, userId: true },
      }),
    )

    if (due.length === 0) return { processed: 0 }

    let processed = 0
    for (const req of due) {
      await step.run(`hard-delete-${req.userId}`, async () => {
        await hardDeleteAccount({
          userId: req.userId,
          requestId: req.id,
          actorId: req.userId,
          trigger: 'cron',
        })
      })
      processed++
    }

    return { processed }
  },
)
