/**
 * Mechanical corrections a planned brief gets before it is generated.
 *
 * Pure and structurally typed, so the planner (`server-only`, it calls
 * Anthropic) can apply them and a plain test runner can still check them.
 */

/** Animals whose warm fur cooks to pink under the high-saturation lanes. */
const WARM_FUR =
  /\b(fox|foxes|vixen|ginger|red squirrel|squirrel|robin|highland cow|red panda|irish setter|marmalade|chestnut)\b/i

/** The source saturation a warm-furred subject gets in the small lanes. */
export const WARM_FUR_SAT = 1.15

/** The parts of a brief this rule reads. */
export interface WarmFurBrief {
  subject: string
  lane: string
  sat?: number
}

/**
 * Warm-red fur at nine colours comes out PINK.
 *
 * The cute lanes pre-saturate hard (about 1.45) because Flux trends pastel, and
 * at a mini or small colour budget there are not enough floss steps left to hold
 * a red-orange coat apart from its own highlights — so it quantises to pink and
 * the face muddles with it. That is exactly how a mini red fox shipped and had
 * to be culled. The subject pool has always said so in prose for the planner
 * model to read; this is the mechanical form, which the pool SAMPLER obeys too.
 *
 * Only touches briefs that have not chosen their own saturation, and only in the
 * two small lanes — a large fox has the colour budget to be a proper fox, so
 * leaving those lanes releases the saturation this rule imposed.
 */
export function applyWarmFurGuard<T extends WarmFurBrief>(b: T): T {
  const small = b.lane === 'mini' || b.lane === 'small'
  if (!small) return b.sat === WARM_FUR_SAT ? { ...b, sat: undefined } : b
  if (b.sat != null) return b
  if (!WARM_FUR.test(b.subject)) return b
  return { ...b, sat: WARM_FUR_SAT }
}
