/**
 * Run bookkeeping for the fanned-out bulk batches — the two pure predicates the
 * finaliser turns on, kept out of `run.ts` (which is `server-only` and drags in
 * sharp, Prisma and the Anthropic client) so they can be unit-tested on their own.
 */

/** The counters every fanned-out run accumulates. */
export interface RunCounters {
  requested: number
  published: number
  culled: number
  duplicates: number
  errors: number
  skipped: number
}

/**
 * Is a fanned-out run finished? Every dispatched idea reaches exactly ONE
 * terminal outcome — published, duplicate, culled, error or skipped — so the run
 * is done when those five add up to what was requested.
 *
 * `>=` not `===` deliberately: an Inngest retry can double-count an increment,
 * and a run that over-counts must still finish rather than hang open forever
 * waiting for an exact hit. Re-rolls are NOT terminal and are not counted here —
 * they re-emit the same idea, which will reach a terminal outcome later.
 */
export function runIsComplete(run: RunCounters): boolean {
  return run.published + run.culled + run.duplicates + run.errors + run.skipped >= run.requested
}

/** The one-line summary a finished run records (admin history + the audit log). */
export function summaryLine(
  s: RunCounters & {
    craft: string
    repaired: number
    generations: number
    modelBriefs?: number
    paleSkips?: number
    propRejects?: number
    collisionRejects?: number
    plannerMode?: string
  },
): string {
  // How much of the batch the planner model actually wrote. A run that fell back
  // to the pool sampler reads as a normal run otherwise, so it is stated.
  const authored =
    s.requested > 0 && s.modelBriefs != null ? ` · ${s.modelBriefs} of ${s.requested} briefs model-authored` : ''
  const pale = s.paleSkips ? ` · ${s.paleSkips} rejected as pale before the gate` : ''
  // What the brief post-filter refused before a single Flux call was made. A
  // batch that spent half its planner output on props is a planner problem, and
  // it is invisible unless the run says so.
  const props = s.propRejects ? ` · ${s.propRejects} briefs rejected for props` : ''
  const clashes = s.collisionRejects ? ` · ${s.collisionRejects} rejected as within-batch repeats` : ''
  // Which planner wrote the batch. Two modes now exist and they yield very
  // differently, so a run that does not say which one it ran under cannot be
  // compared with the ones either side of it.
  const mode = s.plannerMode ? ` · ${s.plannerMode} planner` : ''
  return `${s.craft}: ${s.published} gems published, ${s.culled} culled, ${s.duplicates} duplicates, ${s.skipped} skipped, ${s.repaired} repairs, ${s.generations} generations, ${s.errors} errors (of ${s.requested})${authored}${pale}${props}${clashes}${mode}`
}
