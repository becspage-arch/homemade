import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { scheduledPublishTutorial } from '@/inngest/functions/scheduled-publish'
import { typesenseReindex } from '@/inngest/functions/typesense-reindex'
import { moderationOutcomeNotify } from '@/inngest/functions/moderation-notify'
import { hardDeleteScheduledAccounts } from '@/inngest/functions/hard-delete-accounts'
import { editorialPicksRefresh } from '@/inngest/functions/editorial-picks-cron'
import {
  analyticsRollupNightly,
  analyticsRollupBackfill,
} from '@/inngest/functions/analytics-rollup'
import { scheduledStepPush } from '@/inngest/functions/scheduled-step-push'
import { techniquePublishSweep } from '@/inngest/functions/technique-publish-sweep'
import { moderateUserRecipesCron } from '@/inngest/functions/moderate-user-recipes-cron'
import { needleworkHeroRender } from '@/inngest/functions/needlework-hero-render'
import { crochetHeroRender } from '@/inngest/functions/crochet-hero-render'
import { bulkCrossStitchBatch, bulkCrossStitchIdea, bulkNeedleworkBatch, bulkCrochetBatch } from '@/inngest/functions/bulk-generation'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    scheduledPublishTutorial,
    typesenseReindex,
    moderationOutcomeNotify,
    hardDeleteScheduledAccounts,
    editorialPicksRefresh,
    analyticsRollupNightly,
    analyticsRollupBackfill,
    scheduledStepPush,
    techniquePublishSweep,
    moderateUserRecipesCron,
    needleworkHeroRender,
    crochetHeroRender,
    bulkCrossStitchBatch,
    bulkCrossStitchIdea,
    bulkNeedleworkBatch,
    bulkCrochetBatch,
  ],
})
