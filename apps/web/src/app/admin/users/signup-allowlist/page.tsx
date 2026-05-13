import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { SIGNUP_ALLOWLIST_ENABLED } from '@/lib/signup-allowlist'
import { removeAllowlistEntry } from './actions'
import { ConfirmRemoveButton } from './remove-button'

export const dynamic = 'force-dynamic'

export default async function SignupAllowlistPage() {
  // ADMIN-only — editors don't manage who can sign up.
  const actor = await getCurrentDbUser()
  if (!actor || !isAdmin(actor)) redirect('/admin')

  const entries = await prisma.signupAllowlist.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      addedBy: { select: { id: true, name: true, email: true, displayHandle: true } },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Signup allowlist</h1>
          <p>
            Pre-launch gate. Only the emails on this list can create an
            account — any other signup is rejected by the Clerk webhook and the
            JIT fallback in <code>get-current-user.ts</code>. Pair with the
            Clerk dashboard “Restrictions → Allowlist” feature (see{' '}
            <code>docs/clerk-restrictions-setup.md</code>).
          </p>
        </div>
        <Link href="/admin/users/signup-allowlist/new" className="admin-btn">
          add email
        </Link>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <strong>Status:</strong>{' '}
        {SIGNUP_ALLOWLIST_ENABLED ? (
          <span className="admin-pill flagged">enabled</span>
        ) : (
          <span className="admin-pill approved">disabled</span>
        )}
        <p style={{ marginTop: 8, opacity: 0.7 }}>
          Flipped via <code>SIGNUP_ALLOWLIST_ENABLED</code> in{' '}
          <code>apps/web/src/lib/signup-allowlist.ts</code>. Launch-day flip is
          tracked in <code>project_pre_launch_checklist.md</code>.
        </p>
      </div>

      {entries.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          No allowlist entries yet.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Added by</th>
              <th>Added</th>
              <th>Last used</th>
              <th>Note</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const addedByLabel = entry.addedBy
                ? entry.addedBy.name ?? entry.addedBy.displayHandle ?? entry.addedBy.email
                : '— (system seed)'
              return (
                <tr key={entry.id}>
                  <td>
                    <code>{entry.email}</code>
                  </td>
                  <td>{addedByLabel}</td>
                  <td>{entry.createdAt.toLocaleDateString('en-GB')}</td>
                  <td>
                    {entry.lastUsedAt ? (
                      entry.lastUsedAt.toLocaleDateString('en-GB')
                    ) : (
                      <span style={{ opacity: 0.4 }}>never</span>
                    )}
                  </td>
                  <td style={{ maxWidth: 320 }}>
                    {entry.note ?? <span style={{ opacity: 0.4 }}>—</span>}
                  </td>
                  <td>
                    <form action={removeAllowlistEntry.bind(null, entry.id)}>
                      <ConfirmRemoveButton email={entry.email} />
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
