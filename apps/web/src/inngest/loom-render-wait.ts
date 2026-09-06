import 'server-only'

/**
 * WAITING FOR A FARGATE RENDER, the only way a server job is allowed to.
 *
 * The loom's photoreal base render is a four-vCPU Blender task that takes seven
 * to nine minutes from cold. Waiting for it inside a step is one HTTP request of
 * that length, and Cloudflare and the ALB both end a request at about a hundred
 * seconds — which is why the needlework autopilot was paused and the crochet one
 * shipped switched off.
 *
 * So nobody waits. The job starts the task in one step, and this helper then
 * SLEEPS — Inngest suspends the run and lets the container go — waking once a
 * minute to spend a single `describe-tasks` call asking whether it is done. No
 * request is ever longer than one AWS call, and the twenty minutes a render may
 * take costs the web service nothing while it passes.
 *
 * Twenty-five polls a minute apart is the ceiling. A cold render is usually
 * eight or nine minutes, but a dense scene is slower — the coaster this split
 * was proved against took fifteen and a half — so twenty-five leaves real
 * headroom over the worst honest case while still being short enough that a
 * task ECS has quietly lost does not hold an idea open for an hour.
 */

/** How long the run sleeps between two `describe-tasks` calls. */
export const RENDER_POLL_INTERVAL = '60s'

/** How many of those it takes before a render is declared dead (minutes). */
export const RENDER_POLL_LIMIT = 25

/** What one poll can say. STOPPED means the PNG is in the scratch bucket. */
export interface RenderPoll {
  state: 'RUNNING' | 'STOPPED' | 'FAILED'
  lastStatus: string | null
  exitCode: number | null
  reason: string | null
}

/** The slice of Inngest's `step` this needs — structural, so it is testable. */
export interface SleepingStep {
  sleep: (id: string, duration: string) => Promise<unknown>
  // Deliberately NOT generic: Inngest's own `step.run` returns `Jsonify<T>`,
  // and a poll result is flat JSON already, so pinning the one shape this
  // helper runs keeps the two assignable without a cast.
  run: (id: string, fn: () => Promise<RenderPoll>) => Promise<RenderPoll>
}

/** A render that never finished inside the ceiling, told apart from a failure. */
export class RenderTimeoutError extends Error {
  constructor(label: string, lastStatus: string | null) {
    super(
      `${label}: the Fargate render did not finish within ${RENDER_POLL_LIMIT} minutes ` +
        `(last status ${lastStatus ?? 'unknown'}). Check CloudWatch /homemade/loom-render.`,
    )
    this.name = 'RenderTimeoutError'
  }
}

/** A render that stopped badly — the container's own exit code and reason. */
export class RenderFailedError extends Error {
  constructor(label: string, poll: RenderPoll) {
    super(
      `${label}: the Fargate render failed (exit ${poll.exitCode ?? 'none'}, ` +
        `status ${poll.lastStatus ?? 'unknown'}, reason: ${poll.reason ?? 'n/a'}). ` +
        'Check CloudWatch /homemade/loom-render.',
    )
    this.name = 'RenderFailedError'
  }
}

/**
 * Sleep and poll until the render stops. Returns the winning poll; throws
 * `RenderFailedError` if the task stopped badly and `RenderTimeoutError` if it
 * never stopped at all. The step ids are derived from the loop index so they
 * stay stable when Inngest replays the run.
 */
export async function waitForRender(
  step: SleepingStep,
  label: string,
  poll: () => Promise<RenderPoll>,
): Promise<RenderPoll> {
  let last: RenderPoll = { state: 'RUNNING', lastStatus: null, exitCode: null, reason: null }
  for (let i = 1; i <= RENDER_POLL_LIMIT; i++) {
    await step.sleep(`${label}-wait-${i}`, RENDER_POLL_INTERVAL)
    last = await step.run(`${label}-poll-${i}`, poll)
    if (last.state === 'STOPPED') return last
    if (last.state === 'FAILED') throw new RenderFailedError(label, last)
  }
  throw new RenderTimeoutError(label, last.lastStatus)
}
