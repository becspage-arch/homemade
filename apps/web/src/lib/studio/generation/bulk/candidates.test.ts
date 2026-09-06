/**
 * THE CANDIDATES GATE MODE — the rules that decide what a candidates-mode
 * firing counts as, what a session is warned about, and what a re-roll rebuilds.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/candidates.test.ts
 *
 * Pure functions only. `candidates.ts` reaches Prisma, so the three functions
 * exercised here are the three that do not: the warning wording, the brief
 * rebuild, and the run-status arithmetic in `run-status.ts` that decides when a
 * parked run is finished. Everything else in that module is a database write and
 * belongs to the end-to-end proof, not to a unit test.
 */

import assert from 'node:assert/strict'
import { candidateWarnings, rebuildBrief, PENDING_BACKLOG_WARN, UNJUDGED_WARN_HOURS } from './candidates'
import { runIsComplete, summaryLine } from './run-status'
import { isLibraryPattern } from '@/lib/studio/library-visibility'

const HOUR = 3_600_000
const now = new Date('2026-09-06T12:00:00Z')

// ── the banner ────────────────────────────────────────────────────────────────

{
  // A quiet, healthy parking bay says nothing at all.
  const warns = candidateWarnings(
    { pending: 12, oldest: new Date(now.getTime() - 2 * HOUR), lastJudgedAt: new Date(now.getTime() - 2 * HOUR) },
    now,
  )
  assert.equal(warns.length, 0, 'a bay judged two hours ago is healthy')
}

{
  // Over the backlog line, whatever the judging history says.
  const warns = candidateWarnings(
    {
      pending: PENDING_BACKLOG_WARN + 1,
      oldest: new Date(now.getTime() - HOUR),
      lastJudgedAt: new Date(now.getTime() - HOUR),
    },
    now,
  )
  assert.equal(warns.length, 1)
  assert.match(warns[0]!, /not keeping up/)
}

{
  // Nothing judged for longer than the window, with work waiting.
  const warns = candidateWarnings(
    {
      pending: 20,
      oldest: new Date(now.getTime() - (UNJUDGED_WARN_HOURS + 2) * HOUR),
      lastJudgedAt: new Date(now.getTime() - (UNJUDGED_WARN_HOURS + 1) * HOUR),
    },
    now,
  )
  assert.equal(warns.length, 1)
  assert.match(warns[0]!, /Nothing has been judged/)
}

{
  // Never judged, with work waiting, is its own sentence.
  const warns = candidateWarnings({ pending: 5, oldest: new Date(now.getTime() - HOUR), lastJudgedAt: null }, now)
  assert.equal(warns.length, 1)
  assert.match(warns[0]!, /ever been judged/)
}

{
  // An EMPTY bay never warns, however long ago the last decision was. Nothing is
  // waiting, so there is nothing to be late for.
  const warns = candidateWarnings({ pending: 0, oldest: null, lastJudgedAt: null }, now)
  assert.equal(warns.length, 0, 'an empty parking bay is not a problem')
}

// ── the re-roll rebuild ───────────────────────────────────────────────────────

const META = {
  brief: {
    subject: 'a highland cow in a knitted hat',
    themeId: 'farm',
    shelf: 'animals',
    lane: 'medium',
    source: 'model',
    plannerMode: 'constrained',
    dressed: true,
    w: 150,
    h: 160,
    colours: 42,
  },
  style: 'cute',
}

{
  const brief = rebuildBrief(META, 'animals-highland-cow-r1')
  assert.ok(brief, 'a complete meta rebuilds')
  assert.equal(brief.slug, 'animals-highland-cow-r1')
  assert.equal(brief.subject, 'a highland cow in a knitted hat')
  assert.equal(brief.shelf, 'animals')
  assert.equal(brief.shelfName, 'Animals', 'the shelf name comes from the canonical list, not the meta')
  assert.equal(brief.style, 'cute', 'the style sits beside the brief in the meta, not inside it')
  assert.equal(brief.lane, 'medium')
  assert.equal(brief.w, 150)
  assert.equal(brief.h, 160)
  assert.equal(brief.colours, 42)
  assert.equal(brief.source, 'sampler', 'a re-roll is the sampler’s work — no model was called')
  assert.ok(brief.subjectKey.length > 0, 'the subject key is derived when the meta has none')
}

{
  // A style the STYLE table no longer has falls back rather than throwing.
  const brief = rebuildBrief({ ...META, style: 'no-such-style' }, 'x')
  assert.ok(brief)
  assert.equal(brief.style, 'bright')
}

{
  assert.equal(rebuildBrief(null, 'x'), null, 'no meta, no brief')
  assert.equal(rebuildBrief({ brief: {} }, 'x'), null, 'no subject, no brief')
  assert.equal(
    rebuildBrief({ brief: { subject: 'a fox', shelf: 'not-a-shelf' } }, 'x'),
    null,
    'a shelf that no longer exists must never be generated into',
  )
}

// ── when is a parked run finished ─────────────────────────────────────────────

{
  // A candidates run's ideas end as `parked`, and `published` stays at zero for
  // hours. Without parked in the sum such a run never finishes and the stalled
  // sweep eventually alerts on a firing that worked perfectly.
  const run = { requested: 12, published: 0, culled: 0, duplicates: 0, errors: 0, skipped: 0, parked: 12 }
  assert.equal(runIsComplete(run), true)
  assert.equal(runIsComplete({ ...run, parked: 11 }), false)
}

{
  // A mixed ending still adds up: ten parked, one duplicate, one discarded.
  const run = { requested: 12, published: 0, culled: 1, duplicates: 1, errors: 0, skipped: 0, parked: 10 }
  assert.equal(runIsComplete(run), true)
}

{
  // And an API-mode run, with no `parked` field at all, is unchanged.
  const run = { requested: 10, published: 3, culled: 7, duplicates: 0, errors: 0, skipped: 0 }
  assert.equal(runIsComplete(run), true)
  assert.equal(runIsComplete({ ...run, culled: 6 }), false)
}

{
  const line = summaryLine({
    craft: 'cross-stitch',
    requested: 12,
    published: 0,
    culled: 1,
    duplicates: 1,
    skipped: 0,
    errors: 0,
    repaired: 1,
    generations: 13,
    parked: 10,
  })
  assert.match(line, /10 parked for judging/, 'a parked run must say so or it reads as a total failure')
}

// ── a candidate is not a library pattern ─────────────────────────────────────

{
  // The whole promise of the parking bay: an UNLISTED house row reaches nothing.
  assert.equal(isLibraryPattern({ ownerUserId: null, visibility: 'PUBLIC' as never }), true)
  assert.equal(
    isLibraryPattern({ ownerUserId: null, visibility: 'UNLISTED' as never }),
    false,
    'an un-judged candidate is not openable, downloadable or forkable',
  )
  assert.equal(isLibraryPattern({ ownerUserId: null, visibility: 'PRIVATE' as never }), false)
  assert.equal(isLibraryPattern({ ownerUserId: 'user_1', visibility: 'PUBLIC' as never }), false)
}

console.log('candidates.test.ts — all assertions passed')
