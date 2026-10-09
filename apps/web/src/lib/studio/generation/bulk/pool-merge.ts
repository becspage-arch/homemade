/**
 * THE POOL MERGE — fold `poolExtras` onto the file's themes for one plan call.
 *
 * Split out of `planner.ts` for the same reason `range.ts` was: the planner is
 * `server-only` because it calls Anthropic, which makes it unimportable from a
 * plain test runner, and the merge is exactly the kind of pure, dependency-free
 * logic worth testing without that wall. `planner.ts` imports this and uses it;
 * nothing here touches a model, a database or the network — themes and extras
 * in, themes out.
 *
 * A routine session can clone the repo but cannot push a branch back to it — no
 * reviewer on the other end, no credential for it — so `xs-candidates.ts
 * pool-add` writes new subjects to `BulkAutopilotState.poolExtras`
 * (`candidates.ts`'s `addPoolExtras`) instead of to `subject-pool.ts`. This is
 * where they rejoin the pool the planner actually samples from: each extra's
 * subject is appended to its theme's `examples` (never mutating the file's own
 * arrays — a fresh clone every call), skipped when it normalises to a subject
 * the theme already has (the same `subjectKey` rule the publish guard uses),
 * and its optional `lanes` folded into the merged theme's `laneOverrides`
 * exactly as a hand-written entry's would be. An extra naming a theme that does
 * not exist (or no longer does) is dropped rather than thrown — the file is the
 * source of truth for which themes exist.
 *
 * Text-risk lane restrictions need nothing extra: `isTextRiskSubject` reads the
 * subject text itself, so a merged-in subject gets the same dense-lane-only
 * rule as a file one automatically. A lane restriction narrower than the
 * theme's default is honoured for the model-authored/post-filter check
 * (`planModelBriefs`'s `laneTags`, built from these merged themes); the deeper
 * range-enforcement machinery in `range.ts` (settling, the quick/dense
 * reservations) reads its own file-only lane tags, so a merged subject there
 * behaves like an ordinary un-overridden member of its theme — correct in the
 * ordinary case, and never looser than the theme's declared default.
 */

import { subjectKey as normaliseSubject, findSubjectKeyMatch } from './subject-key'
import type { CrossStitchTheme, PoolExtra } from './subject-pool'

export function mergeThemesWithExtras(
  baseThemes: readonly CrossStitchTheme[],
  extras: readonly PoolExtra[],
): CrossStitchTheme[] {
  if (!extras.length) return baseThemes as CrossStitchTheme[]
  const byTheme = new Map<string, PoolExtra[]>()
  for (const e of extras) {
    if (!e?.theme || !e.subject) continue
    byTheme.set(e.theme, [...(byTheme.get(e.theme) ?? []), e])
  }
  if (!byTheme.size) return baseThemes as CrossStitchTheme[]
  return baseThemes.map((theme) => {
    const adds = byTheme.get(theme.id)
    if (!adds?.length) return theme
    const existingKeys = new Set(theme.examples.map((e) => normaliseSubject(e)))
    const examples = [...theme.examples]
    let laneOverrides = theme.laneOverrides
    let setOf = theme.setOf
    for (const extra of adds) {
      const key = normaliseSubject(extra.subject)
      if (!key || existingKeys.has(key) || findSubjectKeyMatch(key, existingKeys)) continue
      existingKeys.add(key)
      examples.push(extra.subject)
      if (extra.lanes?.length) laneOverrides = { ...(laneOverrides ?? {}), [extra.subject]: extra.lanes }
      if (extra.laneOverrides) laneOverrides = { ...(laneOverrides ?? {}), ...extra.laneOverrides }
      if (typeof extra.setOf === 'number' && extra.setOf > (setOf ?? 0)) setOf = extra.setOf
    }
    return { ...theme, examples, ...(laneOverrides ? { laneOverrides } : {}), ...(setOf ? { setOf } : {}) }
  })
}
