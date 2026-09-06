/**
 * WHAT IT COSTS TO FILL THE CROCHET CATALOGUE.
 *
 * The standing rule now says every autopilot gets a budget and a total-fill
 * cost estimate before it is switched on. The crochet autopilot's model work is
 * free (it happens inside a Claude Max session, not through a per-token API),
 * so everything that is actually billed is DETERMINISTIC and can be costed
 * exactly: a Fargate task per render, a Fal creative upscale per hero, an R2 PUT
 * per published pattern, and an illustration on the one pictorial lane.
 *
 * Every rate below is a NAMED CONSTANT with a note saying where the number came
 * from, because a cost model whose inputs are buried in arithmetic cannot be
 * corrected. Rebecca should overwrite any of them from an actual invoice; the
 * `estimate` stage of `scripts/crochet-autopilot.ts` prints the model with its
 * assumptions listed so a wrong one is visible rather than load-bearing.
 *
 * Pure and dependency-free so it can be read, tested and corrected on its own.
 */

// ── The rates ───────────────────────────────────────────────────────────────

/**
 * AWS Fargate on-demand, eu-west-2 (London) — the region the render task runs
 * in (`LOOM_RENDER_REGION`, defaulting to eu-west-2 in
 * `scripts/loom-fargate-render.ts`). Published Linux/X86 per-vCPU-hour price.
 */
export const FARGATE_VCPU_HOUR_USD = 0.04656

/** AWS Fargate on-demand, eu-west-2 — published per-GB-hour price. */
export const FARGATE_GB_HOUR_USD = 0.00511

/**
 * The render task's size, from the `homemade-loom-render` task definition in
 * `infra/lib/homemade-stack.ts`: `cpu: 4096` (4 vCPU) and
 * `memoryLimitMiB: 8192` (8 GB, the Fargate minimum at 4 vCPU).
 */
export const RENDER_TASK_VCPU = 4096 / 1024
export const RENDER_TASK_GB = 8192 / 1024

/**
 * Measured wall-clock for one cold render, in minutes. The pipeline notes put a
 * cold Fargate task at "seven to nine minutes" of Cycles path tracing
 * (`bulk/crochet.ts` and `inngest/functions/bulk-generation.ts` both say so, and
 * the observed first-batch renders sat in that band); eight is the middle of it.
 * Billing is per second from task start, so this is the whole bill for a task.
 */
export const RENDER_WALL_CLOCK_MINUTES = 8

/**
 * fal.ai clarity-upscaler — the locked creative-upscale finish every hero goes
 * through (`scripts/loom-hybrid-fal.ts`, `ENDPOINTS.upscale`), at 2x on a single
 * render. Fal bills this lane per megapixel; five cents is the order of the
 * charge for one 2x pass at the sizes the loom renders. CORRECT THIS FROM AN
 * INVOICE — it is the least certain number in the model.
 */
export const FAL_CREATIVE_UPSCALE_USD = 0.05

/**
 * One Flux 1.1 Pro illustration — the same rate the cross-stitch spend guard
 * uses (`PRO_UNIT_COST` in `bulk/spend-guard.ts`). Only the pictorial tapestry
 * lane pays it; every other treatment builds its picture from stitches.
 */
export const ILLUSTRATION_USD = 0.032

/**
 * Cloudflare R2 for the hero PNG plus its derivatives. R2 charges for storage
 * and for class-A operations, and a few hundred KB per pattern against R2's
 * per-GB-month pricing rounds to well under a tenth of a cent. Carried as a
 * named zero so the model states it rather than silently omitting it.
 */
export const R2_PER_PATTERN_USD = 0

// ── The assumptions ─────────────────────────────────────────────────────────

/**
 * Renders per candidate that reaches the render stage. The runner allows ONE
 * repair render per candidate (`MAX_CROCHET_REPAIRS`), and only for a staging
 * fault — the geometry is deterministic, so nothing about the object itself is
 * worth re-rendering. 1.15 assumes about one candidate in seven takes it.
 * ASSUMPTION: not yet measured over a real run of batches.
 */
export const RENDER_ATTEMPTS_PER_CANDIDATE = 1.15

/**
 * The share of candidates a judged batch keeps. Crochet should sit far above
 * cross-stitch's roughly one-in-fourteen, because the object is built from an
 * audited stitch program rather than interpreted from an illustration: the
 * geometry cannot come out malformed, so a kill is a staging or a taste
 * judgement rather than a broken render.
 * ASSUMPTION: not yet measured. The first judged batches replace it.
 */
export const ASSUMED_PASS_RATE = 0.6

/**
 * The share of candidates on the pictorial tapestry lane, which is the only one
 * that also buys an illustration. One shelf of the thirteen buildable ones
 * (`wall-hanging`) is tapestry-only, and it is a small shelf, so a low single
 * figure. ASSUMPTION: derived from the shelf targets, not from a run.
 */
export const TAPESTRY_SHARE = 0.05

/**
 * Design expansions per candidate. The loom audit gives a design two revisions
 * before the candidate is culled (`MAX_DESIGN_REVISIONS`), but an expansion is
 * arithmetic on this box — it starts no task and buys no image — so it costs
 * nothing and is carried here at zero to say so explicitly.
 */
export const EXPANSION_USD = 0

// ── The model ───────────────────────────────────────────────────────────────

export interface CostLine {
  label: string
  /** What one unit costs. */
  unitUsd: number
  /** How many units, for the quantity being costed. */
  units: number
  /** Where the rate came from, in one line. */
  source: string
}

export interface CostEstimate {
  /** How many PUBLISHED patterns this estimate is for. */
  patterns: number
  /** Candidates that must be rendered to publish that many, at the pass rate. */
  candidates: number
  /** Render attempts across those candidates. */
  renders: number
  lines: CostLine[]
  totalUsd: number
  /** Total divided by published patterns. */
  perPatternUsd: number
  /** Fargate task-hours, for the sanity check that it is not weeks of compute. */
  taskHours: number
}

/** One Fargate render task, billed at the task's size for its wall clock. */
export function fargateRenderUsd(): number {
  const perHour = RENDER_TASK_VCPU * FARGATE_VCPU_HOUR_USD + RENDER_TASK_GB * FARGATE_GB_HOUR_USD
  return perHour * (RENDER_WALL_CLOCK_MINUTES / 60)
}

/**
 * Cost the deterministic work of publishing `patterns` crochet patterns.
 *
 * `passRate` is the share of judged candidates kept; at 1 the estimate costs
 * only the candidates that ship, which is the floor rather than the forecast.
 */
export function estimateCrochetCost(
  patterns: number,
  opts: { passRate?: number; tapestryShare?: number } = {},
): CostEstimate {
  const passRate = Math.min(1, Math.max(0.01, opts.passRate ?? ASSUMED_PASS_RATE))
  const tapestryShare = Math.min(1, Math.max(0, opts.tapestryShare ?? TAPESTRY_SHARE))
  const candidates = patterns / passRate
  const renders = candidates * RENDER_ATTEMPTS_PER_CANDIDATE

  const lines: CostLine[] = [
    {
      label: 'Fargate base render',
      unitUsd: fargateRenderUsd(),
      units: renders,
      source: `${RENDER_TASK_VCPU} vCPU + ${RENDER_TASK_GB} GB for ${RENDER_WALL_CLOCK_MINUTES} min at eu-west-2 on-demand ($${FARGATE_VCPU_HOUR_USD}/vCPU-h, $${FARGATE_GB_HOUR_USD}/GB-h)`,
    },
    {
      label: 'Fal creative upscale (hero finish)',
      unitUsd: FAL_CREATIVE_UPSCALE_USD,
      units: renders,
      source: 'fal-ai/clarity-upscaler at 2x, one pass per render',
    },
    {
      label: 'Flux illustration (pictorial lane only)',
      unitUsd: ILLUSTRATION_USD,
      units: renders * tapestryShare,
      source: `Flux 1.1 Pro at the spend guard's rate, on the ${Math.round(tapestryShare * 100)}% of candidates that are tapestry`,
    },
    {
      label: 'Design expansion + loom audit',
      unitUsd: EXPANSION_USD,
      units: candidates,
      source: 'arithmetic in this process — no task, no image, no model call',
    },
    {
      label: 'R2 storage + operations',
      unitUsd: R2_PER_PATTERN_USD,
      units: patterns,
      source: 'a few hundred KB per pattern; rounds to nothing at R2 pricing',
    },
  ]

  const totalUsd = lines.reduce((sum, l) => sum + l.unitUsd * l.units, 0)
  return {
    patterns,
    candidates,
    renders,
    lines,
    totalUsd,
    perPatternUsd: patterns > 0 ? totalUsd / patterns : 0,
    taskHours: (renders * RENDER_WALL_CLOCK_MINUTES) / 60,
  }
}
