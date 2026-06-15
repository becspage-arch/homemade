import 'server-only'
import { inngest } from '../client'
import { runModerationBatch } from '@/lib/recipes/recipe-moderation'

/**
 * Every five minutes — run the deterministic moderation pass over any recipes
 * sitting in PENDING_AI_MODERATION.
 *
 * Deterministic only, so it carries no AI-provider spend (per the no-API-spend
 * lock). It no-ops cheaply when the queue is empty: the batch runner returns
 * straight away after a single indexed count. The semantic judgements that need
 * a model are handled separately by a Claude Code worker session reading the
 * same queue, never a runtime API call and never a human reviewer.
 */
export const moderateUserRecipesCron = inngest.createFunction(
  {
    id: 'moderate-user-recipes',
    name: 'Recipes: moderation queue sweep',
    triggers: [{ cron: '*/5 * * * *' }],
  },
  async ({ step }) => {
    const summary = await step.run('moderate', async () => {
      const result = await runModerationBatch({ limit: 50 })
      return {
        pending: result.pending,
        approved: result.approved,
        rejected: result.rejected,
      }
    })
    return summary
  },
)
