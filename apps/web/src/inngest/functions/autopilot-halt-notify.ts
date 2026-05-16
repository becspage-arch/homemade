import 'server-only'
import * as Sentry from '@sentry/nextjs'

import { inngest } from '../client'
import { prisma } from '@homemade/db'

/**
 * Autopilot halt notification — phase_8_content_integration_001.
 *
 * Hourly: read unsent rows from AutopilotHaltSignal, surface them, mark them
 * sent. No email service is wired yet, so this falls back to Sentry capture
 * (severity: warning) plus a CloudWatch log line. When Postmark / Resend is
 * wired, swap the surface step for a real email send.
 *
 * The signal table is the contract — workers and scheduled tasks write rows
 * here without caring about the delivery path. Migrating from
 * console-and-Sentry to real email is a one-function change.
 */
export const autopilotHaltNotify = inngest.createFunction(
  {
    id: 'autopilot-halt-notify',
    name: 'Autopilot halt: notify',
    triggers: [{ cron: '0 * * * *' }],
  },
  async ({ step }) => {
    const signals = await step.run('load-unsent', async () => {
      return prisma.autopilotHaltSignal.findMany({
        where: { notifiedAt: null },
        orderBy: { createdAt: 'asc' },
      })
    })

    if (signals.length === 0) return { notified: 0 }

    await step.run('surface-and-mark', async () => {
      for (const signal of signals) {
        const subject = `Homemade autopilot: ${signal.stream} halted — ${signal.reason}`
        const body = signal.detail ?? '(no detail provided)'

        // CloudWatch surface.
        console.warn(`[autopilot-halt] ${subject}`)
        console.warn(`[autopilot-halt]   detail: ${body}`)

        // Sentry surface so the alert lands in the same dashboard as deploy errors.
        Sentry.captureMessage(subject, {
          level: 'warning',
          tags: {
            kind: 'autopilot-halt',
            stream: signal.stream,
            reason: signal.reason,
          },
          extra: { detail: body, signalId: signal.id, createdAt: signal.createdAt },
        })

        await prisma.autopilotHaltSignal.update({
          where: { id: signal.id },
          data: { notifiedAt: new Date() },
        })
      }
    })

    return { notified: signals.length }
  },
)
