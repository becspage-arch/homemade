/**
 * The crochet cost model, tested on the one rule that changed: a charted
 * tapestry hero never goes to Fal (`lib/loom/crochet/engine/heroPolicy.ts`), so
 * neither the fill estimate, the render stage's per-candidate budget check nor
 * the monthly spend window may charge a tapestry for the Fal finish.
 *
 *   cd apps/web && npx tsx --conditions=react-server \
 *     src/lib/studio/generation/bulk/crochet-cost.test.ts
 */

import assert from 'node:assert/strict'
import {
  ASSUMED_PASS_RATE,
  FAL_CREATIVE_UPSCALE_USD,
  ILLUSTRATION_USD,
  RENDER_ATTEMPTS_PER_CANDIDATE,
  TAPESTRY_SHARE,
  TAPESTRY_TREATMENT,
  crochetRenderUsd,
  estimateCrochetCost,
  fargateRenderUsd,
} from './crochet-cost'
import {
  CROCHET_HERO_FINISH_UNIT_COST,
  CROCHET_RENDER_UNIT_COST,
  PRO_UNIT_COST,
  approxCrochetSpend,
} from './spend-guard'

const results: { name: string; passed: boolean; detail?: string }[] = []
function check(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}
const close = (a: number, b: number, msg?: string) => assert.ok(Math.abs(a - b) < 1e-9, msg ?? `${a} != ${b}`)

check('a tapestry render pays Fargate and its illustration, never the Fal finish', () => {
  close(crochetRenderUsd(TAPESTRY_TREATMENT), fargateRenderUsd() + ILLUSTRATION_USD)
})

check('every other treatment pays Fargate and the Fal finish, and no illustration', () => {
  for (const t of ['flat-rows', 'round', 'amigurumi', null, undefined]) {
    close(crochetRenderUsd(t), fargateRenderUsd() + FAL_CREATIVE_UPSCALE_USD, `treatment ${String(t)}`)
  }
})

check('the fill estimate charges the Fal finish only on the non-tapestry share', () => {
  const e = estimateCrochetCost(100)
  const fal = e.lines.find((l) => l.label.startsWith('Fal creative upscale'))!
  const flux = e.lines.find((l) => l.label.startsWith('Flux illustration'))!
  const renders = (100 / ASSUMED_PASS_RATE) * RENDER_ATTEMPTS_PER_CANDIDATE
  close(fal.units, renders * (1 - TAPESTRY_SHARE))
  close(flux.units, renders * TAPESTRY_SHARE)
})

check('an all-tapestry estimate buys no Fal finish at all', () => {
  const e = estimateCrochetCost(10, { tapestryShare: 1 })
  const fal = e.lines.find((l) => l.label.startsWith('Fal creative upscale'))!
  assert.equal(fal.units, 0)
})

check('with no tapestries the estimate is what it was before the fix', () => {
  const e = estimateCrochetCost(10, { tapestryShare: 0, passRate: 1 })
  const renders = 10 * RENDER_ATTEMPTS_PER_CANDIDATE
  close(e.totalUsd, renders * (fargateRenderUsd() + FAL_CREATIVE_UPSCALE_USD))
})

check('the estimate and the per-render price agree', () => {
  const e = estimateCrochetCost(10, { passRate: 1, tapestryShare: TAPESTRY_SHARE })
  const renders = 10 * RENDER_ATTEMPTS_PER_CANDIDATE
  const expected =
    renders * (1 - TAPESTRY_SHARE) * crochetRenderUsd('round') +
    renders * TAPESTRY_SHARE * crochetRenderUsd(TAPESTRY_TREATMENT)
  close(e.totalUsd, expected)
})

check('the monthly spend window does not charge a tapestry for the Fal finish', () => {
  const since = new Date()
  const plain = approxCrochetSpend({ generations: 10, proGenerations: 0, since })
  const withTapestry = approxCrochetSpend({ generations: 10, proGenerations: 2, since })
  close(plain, 10 * (CROCHET_RENDER_UNIT_COST + CROCHET_HERO_FINISH_UNIT_COST))
  close(
    withTapestry,
    10 * CROCHET_RENDER_UNIT_COST + 8 * CROCHET_HERO_FINISH_UNIT_COST + 2 * PRO_UNIT_COST,
  )
})

check('the spend guard and the cost model use the same Fal rate', () => {
  close(CROCHET_HERO_FINISH_UNIT_COST, FAL_CREATIVE_UPSCALE_USD)
})

const failed = results.filter((r) => !r.passed)
for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `\n      ${r.detail}` : ''}`)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length) process.exit(1)
