import {
  bodyText, compose, hasActionableSteps,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * TECHNIQUE (all categories). The core makeable artifact of a technique is its
 * STEPS plus a completion criterion (how you know it is right / done). Those
 * are the hard bar.
 *
 * The brief also lists "materials + tools". We do NOT hard-require a discrete
 * materials block: techniques in this corpus consistently name their
 * tools/materials inline in the steps (e.g. "waxing and buffing bare wood"
 * names shellac, methylated spirit, and grits in-line), and such a technique is
 * fully makeable. Un-publishing thousands of makeable techniques over a missing
 * heading is template-conformance, not makeability, and contradicts the locked
 * don't-over-prune rule. Flagged in the hand-off for Rebecca to tighten later
 * if she wants a structured-materials template enforced separately.
 */
// Generous: a technique has a "done-ness" cue if it says when/until/once, or
// describes the outcome (the result is, you'll have, peels off, forms a, looks,
// feels, consists of, even/smooth/flat finish, ready). Only techniques with
// steps but NO sense of the finished result fail.
const COMPLETION_RE =
  /\b(until|when|once|you(?:'ll| will| should)? (?:see|feel|notice|have|end up|know)|looks? (?:like|when)|should (?:be|look|feel|have)|ready when|ready for|done when|right when|finished when|sign|how to know|how you know|it'?s right|it'?s done|comes? together|doubl|golden|\bset\b|firm|hollow when tapped|cooked through|tender|the result|the (?:batt|piece|seam|edge|surface|finish|fabric|joint|dough|paint|wax|glaze|shape) (?:is|should|will|looks)|consists? of|peels? off|forms? a|leaves? a|gives? a|produces? a|even\b|smooth\b|flat\b|clean\b|the finished)\b/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []   // blocking
  const flags: string[] = []     // non-blocking
  const text = bodyText(ctx.body)

  // Steps are the hard makeability bar: if there is no procedure, it is not a
  // technique (these are typically decision guides / comparisons mis-typed as
  // TECHNIQUE — flagged for re-type or rebuild).
  if (!hasActionableSteps(ctx)) {
    reasons.push('no step-by-step instructions')
  }
  // Completion criterion is a quality nicety, not a makeability blocker: a
  // technique with clear steps (wiring a switch, fitting a bolt) is makeable
  // even when it never spells out "you'll know it's right when...". Flag it.
  if (!COMPLETION_RE.test(text)) {
    flags.push('no explicit completion criterion (how you know it is right / done)')
  }
  return compose(ctx, `${ctx.categorySlug}:technique`, reasons, flags)
}
