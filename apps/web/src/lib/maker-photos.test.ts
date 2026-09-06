/**
 * Maker photos — the three rules that must not drift.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/maker-photos.test.ts
 *
 * 1. The gate fails closed. Anything that is not an unambiguous approve or
 *    reject leaves the photo pending and invisible.
 * 2. Removed and rejected photos never show on a public surface.
 * 3. The UserPatternPhoto migration maps every old status to the right new one.
 */

import assert from 'node:assert/strict'
import {
  isPubliclyVisible,
  parseGateVerdict,
  targetData,
  targetWhere,
} from './maker-photo-rules'
import {
  mapLegacyPatternPhoto,
  type LegacyPatternPhoto,
} from '../../../../packages/db/scripts/migrate-user-pattern-photos'

let failures = 0
function check(name: string, fn: () => void): void {
  try {
    fn()
    console.log(`  ok  ${name}`)
  } catch (err) {
    failures++
    console.error(`  FAIL ${name}`)
    console.error(`       ${err instanceof Error ? err.message : String(err)}`)
  }
}

// ── 1. Gate verdict parsing, fail closed ────────────────────────────────────

console.log('\ngate verdict parsing')

check('a clean approve approves', () => {
  const r = parseGateVerdict({ decision: 'approve', reasons: [] })
  assert.equal(r.decision, 'approve')
  assert.deepEqual(r.reasons, [])
})

check('an approve carrying reasons still approves with none shown', () => {
  const r = parseGateVerdict({ decision: 'approve', reasons: ['looks fine'] })
  assert.equal(r.decision, 'approve')
  assert.deepEqual(r.reasons, [])
})

check('a reject with reasons rejects', () => {
  const r = parseGateVerdict({
    decision: 'reject',
    reasons: ['This looks like a screenshot rather than a photo.'],
  })
  assert.equal(r.decision, 'reject')
  assert.equal(r.reasons.length, 1)
})

check('a reject keeps at most two reasons', () => {
  const r = parseGateVerdict({ decision: 'reject', reasons: ['a', 'b', 'c', 'd'] })
  assert.equal(r.decision, 'reject')
  assert.deepEqual(r.reasons, ['a', 'b'])
})

check('a reject with no reason is held, not shown as a rejection', () => {
  const r = parseGateVerdict({ decision: 'reject', reasons: [] })
  assert.equal(r.decision, 'pending')
})

check('a reject with only blank reasons is held', () => {
  const r = parseGateVerdict({ decision: 'reject', reasons: ['   ', ''] })
  assert.equal(r.decision, 'pending')
})

check('an unknown decision is held, never approved', () => {
  for (const bad of ['keep', 'yes', 'APPROVE', 'maybe', '', null, undefined, 1]) {
    const r = parseGateVerdict({ decision: bad, reasons: [] })
    assert.equal(r.decision, 'pending', `decision ${String(bad)} should hold`)
  }
})

check('a non-object reply is held', () => {
  for (const bad of [null, undefined, 'approve', 42, [], [{ decision: 'approve' }]]) {
    assert.equal(parseGateVerdict(bad).decision, 'pending')
  }
})

check('a missing decision field is held', () => {
  assert.equal(parseGateVerdict({ reasons: ['x'] }).decision, 'pending')
})

check('non-string reasons are dropped, not stringified', () => {
  const r = parseGateVerdict({ decision: 'reject', reasons: [1, null, 'real reason'] })
  assert.equal(r.decision, 'reject')
  assert.deepEqual(r.reasons, ['real reason'])
})

// ── 2. Public visibility ────────────────────────────────────────────────────

console.log('\nsurface visibility')

check('an approved, not-removed photo shows', () => {
  assert.equal(isPubliclyVisible({ status: 'APPROVED', removedAt: null }), true)
})

check('a rejected photo never shows', () => {
  assert.equal(isPubliclyVisible({ status: 'REJECTED', removedAt: null }), false)
})

check('a pending photo never shows', () => {
  assert.equal(isPubliclyVisible({ status: 'PENDING_MODERATION', removedAt: null }), false)
})

check('a removed photo never shows, even when approved', () => {
  assert.equal(
    isPubliclyVisible({ status: 'APPROVED', removedAt: new Date('2026-09-01') }),
    false,
  )
})

check('a removed and rejected photo never shows', () => {
  assert.equal(
    isPubliclyVisible({ status: 'REJECTED', removedAt: new Date('2026-09-01') }),
    false,
  )
})

check('a tutorial target scopes to the tutorial only', () => {
  assert.deepEqual(targetWhere({ kind: 'tutorial', tutorialId: 't1' }), {
    tutorialId: 't1',
  })
})

check('a pattern target scopes to id and type together', () => {
  assert.deepEqual(
    targetWhere({ kind: 'pattern', patternId: 'p1', patternType: 'CROSS_STITCH' }),
    { patternId: 'p1', patternType: 'CROSS_STITCH' },
  )
})

check('writing a tutorial photo clears the pattern side', () => {
  assert.deepEqual(targetData({ kind: 'tutorial', tutorialId: 't1' }), {
    tutorialId: 't1',
    patternId: null,
    patternType: null,
  })
})

check('writing a pattern photo clears the tutorial side', () => {
  assert.deepEqual(
    targetData({ kind: 'pattern', patternId: 'p1', patternType: 'SEWING' }),
    { tutorialId: null, patternId: 'p1', patternType: 'SEWING' },
  )
})

// ── 3. UserPatternPhoto migration ───────────────────────────────────────────

console.log('\nUserPatternPhoto migration')

const REVIEWED = new Date('2026-08-01T10:00:00Z')
const CREATED = new Date('2026-07-01T10:00:00Z')

function fixture(over: Partial<LegacyPatternPhoto> = {}): LegacyPatternPhoto {
  return {
    id: 'old1',
    userId: 'u1',
    patternId: 'p1',
    patternType: 'CROSS_STITCH',
    mediaId: 'm1',
    caption: 'My first robin',
    status: 'APPROVED',
    reviewedAt: REVIEWED,
    reviewedByUserId: 'admin1',
    reviewNotes: null,
    isFeatured: true,
    isHero: true,
    createdAt: CREATED,
    ...over,
  }
}

check('an approved row carries over whole', () => {
  const m = mapLegacyPatternPhoto(fixture())
  assert.equal(m.status, 'APPROVED')
  assert.equal(m.patternId, 'p1')
  assert.equal(m.patternType, 'CROSS_STITCH')
  assert.equal(m.tutorialId, null)
  assert.equal(m.mediaId, 'm1')
  assert.equal(m.caption, 'My first robin')
  assert.equal(m.removedAt, null)
  assert.equal(m.isFeatured, true)
  assert.equal(m.isHero, true)
  assert.deepEqual(m.moderatedAt, REVIEWED)
  assert.equal(m.moderatedById, 'admin1')
  assert.deepEqual(m.createdAt, CREATED)
  assert.equal(m.rejectionReason, null)
})

check('a pending row stays pending with no gate verdict', () => {
  const m = mapLegacyPatternPhoto(fixture({ status: 'PENDING', reviewedAt: null, reviewedByUserId: null }))
  assert.equal(m.status, 'PENDING_MODERATION')
  assert.equal(m.gateVerdict, null)
  assert.equal(m.removedAt, null)
})

check('a rejected row keeps its reason', () => {
  const m = mapLegacyPatternPhoto(
    fixture({ status: 'REJECTED', reviewNotes: 'Not a photo of a finished piece.' }),
  )
  assert.equal(m.status, 'REJECTED')
  assert.equal(m.rejectionReason, 'Not a photo of a finished piece.')
  assert.equal(m.removedAt, null)
})

check('a rejected row with no note still gets something the maker can read', () => {
  const m = mapLegacyPatternPhoto(fixture({ status: 'REJECTED', reviewNotes: '  ' }))
  assert.equal(m.rejectionReason, 'Not accepted.')
})

check('a rescinded row becomes rejected AND removed, so it never resurfaces', () => {
  const m = mapLegacyPatternPhoto(fixture({ status: 'RESCINDED' }))
  assert.equal(m.status, 'REJECTED')
  assert.deepEqual(m.removedAt, REVIEWED)
  assert.equal(isPubliclyVisible({ status: m.status, removedAt: m.removedAt }), false)
})

check('a rescinded row with no review date falls back to its creation date', () => {
  const m = mapLegacyPatternPhoto(fixture({ status: 'RESCINDED', reviewedAt: null }))
  assert.deepEqual(m.removedAt, CREATED)
})

check('curation does not survive on a photo that is not approved', () => {
  for (const status of ['PENDING', 'REJECTED', 'RESCINDED']) {
    const m = mapLegacyPatternPhoto(fixture({ status }))
    assert.equal(m.isFeatured, false, `${status} should not stay featured`)
    assert.equal(m.isHero, false, `${status} should not stay hero`)
  }
})

check('a migrated verdict says where it came from', () => {
  const m = mapLegacyPatternPhoto(fixture())
  assert.equal(m.gateVerdict?.source, 'migrated')
  assert.equal(m.gateVerdict?.decision, 'approve')
})

check('every carried-over row lands on exactly one target', () => {
  for (const status of ['APPROVED', 'PENDING', 'REJECTED', 'RESCINDED']) {
    const m = mapLegacyPatternPhoto(fixture({ status }))
    const hasTutorial = m.tutorialId !== null
    const hasPattern = m.patternId !== null && m.patternType !== null
    assert.equal(hasTutorial !== hasPattern, true, `${status} must have one target`)
  }
})

console.log(
  failures === 0 ? '\nAll maker-photo checks passed.' : `\n${failures} check(s) failed.`,
)
process.exit(failures === 0 ? 0 : 1)
