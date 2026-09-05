/**
 * Numeric audit runner — verifies every swatch in the dictionary is genuinely
 * stitched (see engine/auditChecks.ts for what that means). Run:
 *
 *   cd apps/web && npx tsx scripts/loom-audit.ts [stitch ...]
 *
 * Exits non-zero if anything fails. The loom-stitch pipeline runs the same
 * checks and refuses to render a failing build.
 */

import { buildRelaxedSwatch, isSwatchArg } from '../src/lib/loom/crochet/engine/buildSwatch'
import { auditProblems } from '../src/lib/loom/crochet/engine/auditChecks'
import { SWATCH_RECIPES, type SwatchArg } from '../src/lib/loom/crochet/engine/dictionary'

// `--yr=<mm>` re-runs the whole sweep at another yarn weight (fine 1.5 / worsted
// 2.4 / bulky 3.2) — cross-weight confirmation is part of every stitch's process.
const argv = process.argv.slice(2)
const yrArg = argv.find((a) => a.startsWith('--yr='))
const YR = yrArg ? Number(yrArg.slice(5)) : 2.4
const only = argv.filter((a) => !a.startsWith('--'))
for (const o of only) {
  if (!isSwatchArg(o)) {
    console.error(`unknown stitch '${o}' — known: ${Object.keys(SWATCH_RECIPES).join(', ')}`)
    process.exit(2)
  }
}
const args = (only.length ? only : Object.keys(SWATCH_RECIPES)) as SwatchArg[]

let anyFail = false
for (const arg of args) {
  const recipe = SWATCH_RECIPES[arg]
  const yr = YR
  const swatch = buildRelaxedSwatch(arg, recipe.auditW, yr)
  const problems = auditProblems(swatch, arg, recipe.auditW, yr)
  // A wip stitch is allowed to be broken (that is what wip means) — report it,
  // but only locked/reverify failures fail the run. The loom-stitch pipeline
  // still hard-stops on ANY audit failure, wip included.
  const status = problems.length ? (recipe.status === 'wip' ? 'FAIL (wip)' : 'FAIL') : 'PASS'
  if (problems.length && recipe.status !== 'wip') anyFail = true
  console.log(
    `${status}  ${arg.padEnd(11)} yr=${yr} [${recipe.status}] nodes=${swatch.built.model.nodes.length} links=${swatch.built.links.length}${problems.length ? '\n' + problems.map((p) => `  - ${p}`).join('\n') : ''}`,
  )
}

process.exit(anyFail ? 1 : 0)
