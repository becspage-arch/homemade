/**
 * Admin preview for the calligraphy-exemplar renderer.
 *
 * Visit `/admin/dev/calligraphy-preview` to see a handful of canonical
 * exemplars rendered end-to-end so the authoring + rendering pipeline can
 * be sanity-checked before the first Paper & word anchor batch lands.
 *
 * The exemplars below are intentionally hand-authored, illustrative
 * fixtures — not production-grade glyphs. Production-grade exemplars are
 * authored inside individual tutorial briefs once the pilot batch fires.
 */

import { redirect } from 'next/navigation'
import { UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'

import { CalligraphyExemplar } from '@/lib/chart-renderers/calligraphy-exemplar'
import type {
  CalligraphyExemplarDefinition,
} from '@/lib/chart-renderers/types'

import '@/components/public/tutorial-content/tutorial-content.css'

export const dynamic = 'force-dynamic'

const EXEMPLARS: CalligraphyExemplarDefinition[] = [
  {
    alphabet: 'foundational-lower',
    letter: 'a',
    nibAngle: 30,
    xHeight: 4,
    guideLines: ['cap-height', 'x-height', 'baseline', 'descender'],
    outline:
      'M 38 42 C 22 42 22 70 38 70 C 54 70 60 60 60 50 L 60 78 L 64 78 L 64 42 L 60 42 L 60 50 C 60 44 50 42 38 42 Z',
    ductus: [
      // Stroke 1 — the bowl (clockwise, starts top-right).
      { stroke: 1, path: 'M 60 50 C 60 42 28 42 28 56 C 28 70 60 70 60 60', arrowAt: 'end' },
      // Stroke 2 — the stem on the right, head to tail.
      { stroke: 2, path: 'M 62 42 L 62 78', arrowAt: 'end' },
      // Stroke 3 — the entry serif at the top of the stem.
      { stroke: 3, path: 'M 56 42 L 64 42', arrowAt: 'end' },
    ],
  },
  {
    alphabet: 'roman-capital',
    letter: 'A',
    nibAngle: 30,
    xHeight: 7,
    guideLines: ['cap-height', 'baseline'],
    outline:
      'M 50 22 L 22 78 L 30 78 L 36 64 L 64 64 L 70 78 L 78 78 L 50 22 Z M 40 56 L 50 36 L 60 56 Z',
    ductus: [
      // Stroke 1 — left diagonal, top to bottom.
      { stroke: 1, path: 'M 50 22 L 22 78', arrowAt: 'end' },
      // Stroke 2 — right diagonal, top to bottom.
      { stroke: 2, path: 'M 50 22 L 78 78', arrowAt: 'end' },
      // Stroke 3 — crossbar.
      { stroke: 3, path: 'M 38 60 L 62 60', arrowAt: 'end' },
    ],
  },
  {
    alphabet: 'italic-lower',
    letter: 'a',
    nibAngle: 45,
    xHeight: 5,
    guideLines: ['cap-height', 'x-height', 'baseline'],
    outline:
      'M 60 44 C 60 40 30 40 30 56 C 30 72 60 72 64 60 L 66 78 L 70 78 L 72 44 L 66 44 Z',
    ductus: [
      // Stroke 1 — the bowl, slightly sloped to the right.
      { stroke: 1, path: 'M 62 50 C 60 42 30 42 30 56 C 30 70 60 70 64 60', arrowAt: 'end' },
      // Stroke 2 — the stem on the right.
      { stroke: 2, path: 'M 68 42 L 66 78', arrowAt: 'end' },
    ],
  },
]

export default async function CalligraphyPreviewPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  // ADMIN-only — this is a renderer sandbox, not a creator surface.
  if (!hasRoleAtLeast(user, UserRole.ADMIN)) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Not for you</h1>
        <p>The calligraphy renderer preview is admin-only.</p>
      </div>
    )
  }

  return (
    <div className="tutorial-content" style={{ padding: 32, maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Calligraphy exemplar — renderer preview</h1>
      <p style={{ marginBottom: 28, color: 'var(--color-warm-taupe)' }}>
        Smoke-test page for{' '}
        <code>apps/web/src/lib/chart-renderers/calligraphy-exemplar.tsx</code>.
        Three exemplars: Foundational <code>a</code>, Roman capital{' '}
        <code>A</code>, Italic <code>a</code>. Outlines + numbered ductus +
        guide-lines + nib-angle chip.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {EXEMPLARS.map((def) => (
          <CalligraphyExemplar
            key={`${def.alphabet}-${def.letter}`}
            definition={def}
          />
        ))}
      </div>
    </div>
  )
}
