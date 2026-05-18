import 'server-only'
import {
  prisma,
  TutorialStatus,
  TutorialType,
  sweepForTechnique,
} from '@homemade/db'
import { inngest } from '../client'
import { audit } from '@/lib/audit'

/**
 * Reverse-sweep (phase_technique_linking_002).
 *
 * Fires when a TECHNIQUE row transitions to PUBLISHED — or is re-saved
 * while PUBLISHED with title / slug / aliases changes that widen the
 * matcher. The sweep walks every same-Category PUBLISHED Tutorial of a
 * sweepable type, and appends the technique's slug to any row whose
 * body mentions the technique by title / slug-with-spaces / alias.
 *
 * Triggers are sent from:
 *   - `apps/web/src/app/admin/tutorials/actions.ts#transitionTutorialStatus`
 *     (admin status transition)
 *   - `apps/web/src/app/admin/tutorials/actions.ts#updateTutorial`
 *     (admin edit while PUBLISHED — covers title / slug / alias changes)
 *   - `apps/web/src/app/admin/tutorials/bulk-actions.ts`
 *     (admin bulk publish)
 *   - `apps/web/src/inngest/functions/scheduled-publish.ts`
 *     (cron flipping SCHEDULED → PUBLISHED)
 *
 * The CLI upload script (`packages/db/scripts/upload-tutorial.ts`) does
 * NOT trigger the sweep — Inngest event keys aren't wired into the CLI
 * path. The one-time backfill script catches techniques published via
 * upload + handles the historic backlog in a single pass.
 */
export const techniquePublishSweep = inngest.createFunction(
  {
    id: 'technique-publish-sweep',
    name: 'Technique publish: reverse-sweep recipes',
    triggers: [{ event: 'tutorial/technique-published' }],
    // One sweep per technique at a time. A second event for the same
    // slug while the first is mid-flight gets batched / deduplicated by
    // Inngest, so a rapid double-publish doesn't double the work.
    concurrency: { limit: 1, key: 'event.data.techniqueId' },
  },
  async ({ event, step, logger }) => {
    const techniqueId = String(event.data?.techniqueId ?? '')
    if (!techniqueId) {
      logger.warn('technique-publish-sweep fired without techniqueId — skipping')
      return { skipped: true, reason: 'missing-techniqueId' }
    }

    const technique = await step.run('load-technique', async () =>
      prisma.tutorial.findUnique({
        where: { id: techniqueId },
        select: {
          id: true,
          slug: true,
          title: true,
          aliases: true,
          categoryId: true,
          type: true,
          status: true,
          authorId: true,
        },
      }),
    )

    if (!technique) {
      logger.warn('technique not found', { techniqueId })
      return { skipped: true, reason: 'technique-not-found' }
    }

    if (technique.type !== TutorialType.TECHNIQUE) {
      // Defensive — caller filters but a stale event might land after
      // an author re-typed a row away from TECHNIQUE.
      logger.warn('event target is not a TECHNIQUE — skipping', {
        techniqueId,
        type: technique.type,
      })
      return { skipped: true, reason: 'not-technique' }
    }

    if (technique.status !== TutorialStatus.PUBLISHED) {
      logger.warn('technique no longer PUBLISHED — skipping', {
        techniqueId,
        status: technique.status,
      })
      return { skipped: true, reason: 'not-published' }
    }

    const result = await step.run('sweep', async () =>
      sweepForTechnique(prisma, {
        id: technique.id,
        slug: technique.slug,
        title: technique.title,
        aliases: technique.aliases,
        categoryId: technique.categoryId,
      }),
    )

    await step.run('audit', async () => {
      await audit({
        actorId: technique.authorId,
        action: 'technique.reverse_sweep',
        resource: `Tutorial:${technique.id}`,
        metadata: {
          techniqueSlug: result.techniqueSlug,
          recipesAnnotated: result.recipesAnnotated,
          candidatesConsidered: result.candidatesConsidered,
          sampleTitles: result.sampleTitles,
        },
      })
    })

    return result
  },
)
