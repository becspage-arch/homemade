import 'server-only'
import { prisma, TutorialStatus } from '@homemade/db'
import { inngest } from '../client'
import { audit } from '@/lib/audit'
import { syncTutorialById } from '@/lib/search-sync'
import { captureServerEvent, flushPostHog } from '@/lib/posthog'

/**
 * Flip Tutorial.SCHEDULED → PUBLISHED for any row whose scheduledFor has
 * passed. Runs every 5 minutes.
 */
export const scheduledPublishTutorial = inngest.createFunction(
  {
    id: 'scheduled-publish-tutorial',
    name: 'Scheduled publish: tutorials',
    triggers: [{ cron: '*/5 * * * *' }],
  },
  async ({ step }) => {
    const due = await step.run('find-due', async () =>
      prisma.tutorial.findMany({
        where: {
          status: TutorialStatus.SCHEDULED,
          scheduledFor: { lte: new Date() },
        },
        select: { id: true, slug: true, authorId: true, categoryId: true },
      }),
    )

    if (due.length === 0) return { transitioned: 0 }

    for (const t of due) {
      await step.run(`publish-${t.id}`, async () => {
        await prisma.tutorial.update({
          where: { id: t.id },
          data: {
            status: TutorialStatus.PUBLISHED,
            publishedAt: new Date(),
            scheduledFor: null,
          },
        })
        await audit({
          actorId: t.authorId,
          action: 'tutorial.transition',
          resource: `Tutorial:${t.id}`,
          metadata: {
            from: TutorialStatus.SCHEDULED,
            to: TutorialStatus.PUBLISHED,
            trigger: 'scheduled-publish',
          },
        })
        await syncTutorialById(t.id)
        await captureServerEvent({
          event: 'tutorial_published_scheduled',
          distinctId: t.authorId,
          properties: { tutorialId: t.id, slug: t.slug },
        })
      })
    }
    await flushPostHog()

    return { transitioned: due.length }
  },
)
