/**
 * Admin preview for the weaving-draft renderer.
 *
 * Visit `/admin/dev/weaving-draft-preview` to see hand-authored weaving
 * drafts rendered end-to-end so the renderer can be sanity-checked
 * before the first Fibre arts anchor batch lands.
 *
 * The drafts below exercise:
 *   - 2-shaft plain weave (frame loom) — the simplest weave structure;
 *     drawdown should be a perfect checkerboard.
 *   - 4-shaft straight-draw twill — the canonical 2/2 twill; drawdown
 *     should show diagonal lines.
 *   - 4-shaft rosepath — a pointed-twill draft; drawdown should show
 *     diamond / "rosepath" repeats.
 *   - Tablet weaving — card-rotation draft; the labels switch from
 *     "shaft / treadle" to "card / rotation".
 */

import { redirect } from 'next/navigation'
import { UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'

import { WeavingDraft } from '@/lib/chart-renderers/weaving-draft'
import type { WeavingDraftDefinition } from '@/lib/chart-renderers/types'

import '@/components/public/tutorial-content/tutorial-content.css'

export const dynamic = 'force-dynamic'

// Plain weave — two shafts, two treadles, straight draw. The simplest
// possible weave structure; drawdown is a perfect checkerboard.
const PLAIN_WEAVE: WeavingDraftDefinition = {
  title: 'Plain weave on two shafts (frame loom)',
  loomType: 'frame',
  threading: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
  tieUp: [
    [1, 0],
    [0, 1],
  ],
  treadling: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
  caption: 'Read warp left-to-right and picks top-to-bottom. Drawdown reads as a perfect checkerboard — the diagnostic signature of tabby.',
}

// 2/2 twill — four shafts, four treadles, straight draw threading,
// the standard twill tie-up.
const STRAIGHT_TWILL: WeavingDraftDefinition = {
  title: '2/2 twill — four-shaft straight draw',
  loomType: 'four-shaft',
  threading: [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
  tieUp: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 0, 1],
  ],
  treadling: [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
  caption: '2-up / 2-down twill. The diagonal lines in the drawdown are the diagnostic signature of twill structure.',
}

// Rosepath — four-shaft pointed-twill threading; the same twill tie-up
// as above produces diamond / "rosepath" repeats in the drawdown.
const ROSEPATH: WeavingDraftDefinition = {
  title: 'Rosepath — four-shaft pointed twill',
  loomType: 'four-shaft',
  threading: [1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 3, 4],
  tieUp: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 0, 1],
  ],
  treadling: [1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 3, 4],
  caption: 'Pointed-twill threading + standard twill tie-up. Drawdown shows the diamond / rosepath repeats classical to Scandinavian + Eastern European weaving.',
}

// Card weaving — four cards, two rotations. The renderer relabels the
// shaft / treadle headers as "cards" / "rotation" without changing the
// draft geometry.
const CARD_BAND: WeavingDraftDefinition = {
  title: 'Tablet-woven band — four cards, alternating rotation',
  loomType: 'card',
  threading: [1, 2, 3, 4, 4, 3, 2, 1],
  tieUp: [
    [1, 0, 1, 0],
    [0, 1, 0, 1],
  ],
  treadling: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
  caption: 'Four cards threaded then mirrored, alternating forward / reverse rotation per pick. The same shape as a floor-loom draft; the renderer relabels the columns to "cards" + "rotation".',
}

export default async function WeavingDraftPreviewPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  // ADMIN-only — this is a renderer sandbox, not a creator surface.
  if (!hasRoleAtLeast(user, UserRole.ADMIN)) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Not for you</h1>
        <p>The weaving-draft renderer preview is admin-only.</p>
      </div>
    )
  }

  return (
    <div
      className="tutorial-content"
      style={{ padding: 32, maxWidth: 980, margin: '0 auto' }}
    >
      <h1 style={{ marginBottom: 8 }}>Weaving draft — renderer preview</h1>
      <p style={{ marginBottom: 28, color: 'var(--color-warm-taupe)' }}>
        Smoke-test page for{' '}
        <code>apps/web/src/lib/chart-renderers/weaving-draft.tsx</code>.
        The standard four-block draft layout — threading, tie-up,
        treadling, computed drawdown — across the loom types Fibre arts
        publishes. The drawdown grid is computed server-side from the
        other three; authors don&apos;t write it.
      </p>
      <WeavingDraft definition={PLAIN_WEAVE} />
      <WeavingDraft definition={STRAIGHT_TWILL} />
      <WeavingDraft definition={ROSEPATH} />
      <WeavingDraft definition={CARD_BAND} />
    </div>
  )
}
