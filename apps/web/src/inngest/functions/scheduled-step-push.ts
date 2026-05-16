import 'server-only'
import { prisma, UserProjectStatus, NotificationType } from '@homemade/db'
import { inngest } from '../client'
import { notifyWithPush } from '@/lib/push-notifications'

/**
 * Daily 09:00 UTC sweep: find UserProjects whose next scheduled step is due
 * today (offsetDays elapsed since the project's startedAt). Fire a push for
 * each, recording the Notification row + flipping the project's
 * nextScheduledAt cursor forward so we don't fire the same step twice.
 *
 * The schema doesn't yet carry nextScheduledAt on UserProject — for now we
 * derive eligibility purely from startedAt + ProjectSchedule.offsetDays, and
 * key idempotency off the Notification table (one row per project+step).
 */
export const scheduledStepPush = inngest.createFunction(
  {
    id: 'scheduled-step-push',
    name: 'Scheduled-step push (daily)',
    triggers: [{ cron: '0 9 * * *' }],
  },
  async ({ logger, step }) => {
    const now = new Date()

    const projects = await step.run('load-active-projects', async () =>
      prisma.userProject.findMany({
        where: {
          status: UserProjectStatus.IN_PROGRESS,
          user: { pushNotificationsEnabled: true },
        },
        select: {
          id: true,
          userId: true,
          tutorialId: true,
          startedAt: true,
          tutorial: { select: { title: true, slug: true, category: { select: { slug: true } } } },
        },
      }),
    )

    let dispatched = 0
    for (const project of projects) {
      const startedAtMs = new Date(project.startedAt).getTime()
      const elapsedDays = Math.floor(
        (now.getTime() - startedAtMs) / (24 * 60 * 60 * 1000),
      )
      const schedule = await prisma.projectSchedule.findMany({
        where: {
          tutorialId: project.tutorialId,
          offsetDays: { lte: elapsedDays },
          surfaceAs: { in: ['HERO', 'RAIL_CARD', 'NOTIFICATION_ONLY'] },
        },
        orderBy: { stepNumber: 'asc' },
      })

      for (const sched of schedule) {
        // Idempotency: skip if we already created a notification for this step.
        const marker = `step:${project.id}:${sched.stepNumber}`
        const existing = await prisma.notification.findFirst({
          where: { userId: project.userId, body: { contains: marker } },
          select: { id: true },
        })
        if (existing) continue

        const href = project.tutorial?.category?.slug
          ? `/${project.tutorial.category.slug}/${project.tutorial.slug}`
          : null

        await notifyWithPush({
          userId: project.userId,
          type: NotificationType.SYSTEM,
          body: `${sched.title} — ${sched.body} [${marker}]`,
          href,
          pushTitle: project.tutorial?.title ?? 'homemade',
          category: 'project_schedule',
        })
        dispatched++
      }
    }

    logger.info('scheduled-step push run', {
      projects: projects.length,
      dispatched,
    })
    return { projects: projects.length, dispatched }
  },
)
