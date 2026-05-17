/**
 * Admin preview for the origami-fold-basic renderer (v1 capability).
 *
 * Visit `/admin/dev/origami-fold-preview` to see a hand-authored fold
 * sequence rendered end-to-end so the v1 origami renderer can be
 * sanity-checked before the first Paper & word anchor batch lands.
 *
 * The fold sequence below is a "preliminary square base" — three steps
 * of valley + mountain folds on a plain square. It exercises both fold
 * kinds and both arrow kinds (straight + curved). It does NOT exercise
 * inside-reverse / petal / squash / sink / swivel / 3D collapse — those
 * are deferred to the advanced renderer per the build plan.
 */

import { redirect } from 'next/navigation'
import { UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'

import { OrigamiFoldBasic } from '@/lib/chart-renderers/origami-fold-basic'
import type { OrigamiFoldDefinition } from '@/lib/chart-renderers/types'

import '@/components/public/tutorial-content/tutorial-content.css'

export const dynamic = 'force-dynamic'

const PRELIMINARY_BASE: OrigamiFoldDefinition = {
  title: 'Preliminary square base — book fold then diagonal',
  stepCount: 3,
  steps: [
    {
      stepNumber: 1,
      caption:
        'Start with a square, coloured side down. Valley-fold in half along the vertical axis. Unfold.',
      folds: [
        {
          kind: 'valley',
          from: [50, 0],
          to: [50, 100],
          arrow: 'straight',
          arrowSide: 'right',
        },
      ],
    },
    {
      stepNumber: 2,
      caption:
        'Valley-fold in half along the horizontal axis. Unfold. The paper now has a clear cross of valley-fold creases.',
      folds: [
        {
          kind: 'valley',
          from: [0, 50],
          to: [100, 50],
          arrow: 'straight',
          arrowSide: 'left',
        },
      ],
    },
    {
      stepNumber: 3,
      caption:
        'Turn the paper over. Mountain-fold along one diagonal, rotating the upper-left flap down to the lower-right corner.',
      folds: [
        {
          kind: 'mountain',
          from: [0, 0],
          to: [100, 100],
          arrow: 'curved',
          arrowSide: 'left',
        },
      ],
    },
  ],
}

const FORTUNE_TELLER_START: OrigamiFoldDefinition = {
  title: 'Fortune teller — first two folds',
  stepCount: 2,
  steps: [
    {
      stepNumber: 1,
      caption:
        'Valley-fold both diagonals to locate the centre. The two creases form an X.',
      folds: [
        { kind: 'valley', from: [0, 0], to: [100, 100], arrow: 'none' },
        { kind: 'valley', from: [100, 0], to: [0, 100], arrow: 'none' },
      ],
    },
    {
      stepNumber: 2,
      caption:
        'Valley-fold each corner into the centre point. Four small triangles meet in the middle.',
      folds: [
        {
          kind: 'valley',
          from: [0, 0],
          to: [50, 50],
          arrow: 'straight',
          arrowSide: 'right',
        },
      ],
    },
  ],
}

export default async function OrigamiFoldPreviewPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  // ADMIN-only — this is a renderer sandbox, not a creator surface.
  if (!hasRoleAtLeast(user, UserRole.ADMIN)) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Not for you</h1>
        <p>The origami renderer preview is admin-only.</p>
      </div>
    )
  }

  return (
    <div className="tutorial-content" style={{ padding: 32, maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Origami fold diagram — renderer preview (v1)</h1>
      <p style={{ marginBottom: 28, color: 'var(--color-warm-taupe)' }}>
        Smoke-test page for{' '}
        <code>apps/web/src/lib/chart-renderers/origami-fold-basic.tsx</code>.
        v1 supports mountain (dash-dot) + valley (dashed) folds with
        straight or curved arrows. Advanced manoeuvres — inside reverse,
        outside reverse, petal, squash, sink, swivel, 3D collapse — are{' '}
        <strong>deferred</strong> to the advanced renderer per the build
        plan. Origami briefs that need any of those are rejected at
        intake.
      </p>
      <OrigamiFoldBasic definition={PRELIMINARY_BASE} />
      <OrigamiFoldBasic definition={FORTUNE_TELLER_START} />
    </div>
  )
}
