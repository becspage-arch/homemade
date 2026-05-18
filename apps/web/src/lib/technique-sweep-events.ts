import 'server-only'
import { inngest } from '@/inngest/client'

/**
 * Fire-and-forget Inngest trigger for the reverse-sweep
 * (phase_technique_linking_002). Caller passes the Tutorial.id of a
 * TECHNIQUE row that just became (or stayed) PUBLISHED with a widened
 * matcher; the Inngest function in
 * `apps/web/src/inngest/functions/technique-publish-sweep.ts` picks up
 * the event, walks every same-Category PUBLISHED Tutorial, and appends
 * the technique's slug to `techniqueSlugs` on any match.
 *
 * Send failures are swallowed — the same idempotent sweep can be
 * re-run later by the one-time backfill script, so a transient Inngest
 * outage doesn't break the publish flow.
 */
export async function notifyTechniquePublished(techniqueId: string): Promise<void> {
  try {
    await inngest.send({
      name: 'tutorial/technique-published',
      data: { techniqueId },
    })
  } catch (err) {
    console.error('inngest.send tutorial/technique-published failed', {
      techniqueId,
      err,
    })
  }
}
