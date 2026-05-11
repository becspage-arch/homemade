import 'server-only'
import { inngest } from '../client'

/**
 * Observability sink for moderation outcomes. The in-app `Notification`
 * row is still written synchronously by the moderation action (see
 * `lib/moderation-actions.ts` calling `notify()`); this function exists so
 * we have a single event surface in Inngest's dashboard for every
 * moderation outcome, and so that email / push / push-down delivery can
 * be added in a future session without touching every moderation call
 * site again.
 */
export const moderationOutcomeNotify = inngest.createFunction(
  {
    id: 'moderation-outcome-notify',
    name: 'Moderation: outcome notified',
    triggers: [{ event: 'moderation/outcome.notified' }],
  },
  async ({ event, logger }) => {
    logger.info('moderation outcome', event.data)
    return { received: true }
  },
)
