import {
  bodyText, compose, hasActionableSteps, hasMaterials,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * Surface needlework PATTERN (surface-embroidery, ribbon, stumpwork,
 * candlewicking, goldwork, foundations) — not chart-led. Needs a pattern
 * outline / transfer + a step-by-step stitching guide, a stitch reference
 * (which stitches go where), and a materials list.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  if (!hasActionableSteps(ctx)) {
    reasons.push('no step-by-step stitching guide (no outline/transfer worked through in steps)')
  }
  const stitchReference =
    /\bstitch(es)?\b/i.test(text) &&
    /(stitches used|which stitch|work .* stitch|use .* stitch|chain stitch|satin stitch|stem stitch|french knot|back ?stitch|split stitch|fly stitch|seed stitch)/i.test(text)
  if (!stitchReference) {
    reasons.push('no stitch reference (which stitches go where)')
  }
  if (!hasMaterials(ctx.body)) {
    reasons.push('no materials list (fabric, thread, needle)')
  }
  return compose(ctx, 'needlework-surface:pattern', reasons)
}
