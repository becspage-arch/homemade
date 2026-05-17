/**
 * Admin preview for the macramé-knot renderer.
 *
 * Visit `/admin/dev/macrame-knot-preview` to see every one of the ten
 * fundamental macramé knots rendered end-to-end so the renderer can be
 * sanity-checked before the first Fibre arts anchor batch lands.
 *
 * Each knot is shown twice: as a single final-state diagram (the
 * shape PATTERN bodies use after the knot is taught) and as a
 * multi-step build-up (the shape the TECHNIQUE entry for the knot
 * uses the first time it's introduced).
 */

import { redirect } from 'next/navigation'
import { UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'

import { MacrameKnot } from '@/lib/chart-renderers/macrame-knot'
import type { MacrameKnotDefinition, MacrameKnotType } from '@/lib/chart-renderers/types'

import '@/components/public/tutorial-content/tutorial-content.css'

export const dynamic = 'force-dynamic'

const KNOT_GROUPS: ReadonlyArray<{
  heading: string
  blurb: string
  knots: ReadonlyArray<{ knotType: MacrameKnotType; caption: string; showSteps: boolean }>
}> = [
  {
    heading: 'Square-knot family',
    blurb:
      'Four-cord knots — two working cords (sienna / teal) wrap two filler cords (muted). The square knot balances "right over, left under" with "left over, right under"; the alternating-square pattern offsets each row.',
    knots: [
      { knotType: 'square', caption: 'Square knot — single final state.', showSteps: false },
      { knotType: 'square', caption: 'Square knot — multi-step build-up.', showSteps: true },
      { knotType: 'alternating-square', caption: 'Alternating square — two rows offset.', showSteps: false },
    ],
  },
  {
    heading: 'Half-hitch family',
    blurb:
      'Two-cord knots — one working cord (sienna or teal) wraps a vertical holding cord (muted). The double half-hitch repeats the move for a clearer diagonal.',
    knots: [
      { knotType: 'half-hitch-left', caption: 'Half-hitch (left) — final.', showSteps: false },
      { knotType: 'half-hitch-left', caption: 'Half-hitch (left) — steps.', showSteps: true },
      { knotType: 'half-hitch-right', caption: 'Half-hitch (right) — final.', showSteps: false },
      { knotType: 'double-half-hitch-left', caption: 'Double half-hitch (left) — final.', showSteps: false },
      { knotType: 'double-half-hitch-right', caption: 'Double half-hitch (right) — final.', showSteps: false },
    ],
  },
  {
    heading: "Lark's head + gathering",
    blurb:
      "Mount and bundle knots — the lark's head mounts a doubled cord on a holding dowel; the gathering (wrapping) knot binds the top of a plant hanger.",
    knots: [
      { knotType: 'larks-head', caption: "Lark's head — final.", showSteps: false },
      { knotType: 'larks-head', caption: "Lark's head — steps.", showSteps: true },
      { knotType: 'gathering', caption: 'Gathering knot — wraps a bundle.', showSteps: false },
    ],
  },
  {
    heading: 'Terminator knots',
    blurb:
      'Single-cord stop knots — the overhand is the simplest stop; the figure-8 is bulkier and easier to untie under load.',
    knots: [
      { knotType: 'overhand', caption: 'Overhand knot — single cord.', showSteps: false },
      { knotType: 'figure-8', caption: 'Figure-8 knot — single cord.', showSteps: false },
    ],
  },
]

export default async function MacrameKnotPreviewPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  // ADMIN-only — this is a renderer sandbox, not a creator surface.
  if (!hasRoleAtLeast(user, UserRole.ADMIN)) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Not for you</h1>
        <p>The macramé-knot renderer preview is admin-only.</p>
      </div>
    )
  }

  return (
    <div
      className="tutorial-content"
      style={{ padding: 32, maxWidth: 980, margin: '0 auto' }}
    >
      <h1 style={{ marginBottom: 8 }}>Macramé knot — renderer preview</h1>
      <p style={{ marginBottom: 28, color: 'var(--color-warm-taupe)' }}>
        Smoke-test page for{' '}
        <code>apps/web/src/lib/chart-renderers/macrame-knot.tsx</code>.
        The ten fundamental knots Fibre arts teaches first; PATTERN
        entries reference each by slug via the inline{' '}
        <code>macrameKnot</code> TipTap block.
      </p>
      {KNOT_GROUPS.map((group) => (
        <section key={group.heading} style={{ marginTop: 32 }}>
          <h2 style={{ marginBottom: 4 }}>{group.heading}</h2>
          <p style={{ marginBottom: 16, color: 'var(--color-warm-taupe)' }}>
            {group.blurb}
          </p>
          {group.knots.map((knot, i) => {
            const definition: MacrameKnotDefinition = {
              knotType: knot.knotType,
              showSteps: knot.showSteps,
              caption: knot.caption,
            }
            return (
              <div key={`${knot.knotType}-${i}`} style={{ marginBottom: 20 }}>
                <MacrameKnot definition={definition} />
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
