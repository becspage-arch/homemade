import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { scheduledPublishTutorial } from '@/inngest/functions/scheduled-publish'
import { typesenseReindex } from '@/inngest/functions/typesense-reindex'
import { moderationOutcomeNotify } from '@/inngest/functions/moderation-notify'
import { hardDeleteScheduledAccounts } from '@/inngest/functions/hard-delete-accounts'
import { editorialPicksRefresh } from '@/inngest/functions/editorial-picks-cron'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    scheduledPublishTutorial,
    typesenseReindex,
    moderationOutcomeNotify,
    hardDeleteScheduledAccounts,
    editorialPicksRefresh,
  ],
})
