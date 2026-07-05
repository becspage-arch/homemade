import { prisma, Visibility } from '@homemade/db'
import { requireAdminRole } from '@/lib/get-current-user'
import { anthropicConfigured } from '@/lib/anthropic'
import { BulkRunControls } from './run-controls'

const INNGEST_DASHBOARD_URL = 'https://app.inngest.com/env/production/functions'

export const dynamic = 'force-dynamic'

interface AuditRow {
  id: string
  action: string
  createdAt: Date
  metadata: unknown
}

function line(row: AuditRow): string {
  const m = (row.metadata ?? {}) as Record<string, unknown>
  if (typeof m.line === 'string') return m.line
  if (row.action.endsWith('requested')) return `requested ${String(m.count ?? '?')} × ${String(m.craft ?? '?')}`
  return row.action
}

export default async function AdminBulkGenerationPage() {
  try {
    await requireAdminRole({ minimum: 'ADMIN' })
  } catch {
    return (
      <div className="admin-placeholder">
        <h1>Bulk generation</h1>
        <p>This page is for admins only.</p>
      </div>
    )
  }

  const [xsCount, nwCount, recent] = await Promise.all([
    prisma.pattern.count({ where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC } }),
    prisma.needleworkPattern.count({ where: { ownerUserId: null, visibility: Visibility.PUBLIC } }),
    prisma.auditLog.findMany({
      where: { action: { in: ['system.bulk_generation.completed', 'system.bulk_generation.requested'] } },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { id: true, action: true, createdAt: true, metadata: true },
    }),
  ])

  const gateWired = anthropicConfigured()
  const renderWired = process.env.LOOM_RENDER === 'fargate'
  const xsAutopilot = process.env.BULK_AUTOPILOT_CROSS_STITCH === '1'
  const nwAutopilot = process.env.BULK_AUTOPILOT_NEEDLEWORK === '1'

  return (
    <div className="admin-placeholder">
      <h1>Bulk generation</h1>
      <p>
        Server-side catalogue fill for cross-stitch and needlework — the gem routine that used
        to run on Rebecca&apos;s PC, now an admin-triggered / cron Inngest job. Each batch plans
        varied briefs across the full complexity range, generates on the shared engine, runs the
        ruthless keep-or-kill <strong>vision gate</strong>, and publishes only the gems. Progress
        and run history live in the Inngest dashboard.
      </p>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Live catalogue</h2>
        <ul style={{ marginTop: 8, lineHeight: 1.8 }}>
          <li>Cross-stitch — <strong>{xsCount}</strong> public patterns</li>
          <li>Needlework — <strong>{nwCount}</strong> public patterns</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Wiring</h2>
        <ul style={{ marginTop: 8, lineHeight: 1.8 }}>
          <li>Vision gate (Anthropic API): <strong>{gateWired ? 'wired' : 'NOT wired'}</strong>{!gateWired && ' — set ANTHROPIC_API_KEY (MOUNT_ANTHROPIC_SECRETS) or batches no-op'}</li>
          <li>Needlework render (Fargate): <strong>{renderWired ? 'wired' : 'NOT wired'}</strong>{!renderWired && ' — needlework batches no-op until LOOM_RENDER=fargate'}</li>
          <li>Cron autopilot — cross-stitch: <strong>{xsAutopilot ? 'ON' : 'paused'}</strong>, needlework: <strong>{nwAutopilot ? 'ON' : 'paused'}</strong> (stops at target automatically)</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Run a batch now</h2>
        <p style={{ marginBottom: 12 }}>
          Fires one batch server-side. It runs for a few minutes (needlework longer — it renders on
          Fargate). Come back here or open Inngest for the result.
        </p>
        {!gateWired && (
          <p style={{ marginBottom: 12, fontStyle: 'italic' }}>
            The vision gate isn&apos;t wired, so a batch would publish nothing. Buttons are disabled.
          </p>
        )}
        <BulkRunControls disabled={!gateWired} />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Recent manual runs</h2>
        {recent.length === 0 ? (
          <p style={{ marginTop: 8 }}>No manual runs recorded yet.</p>
        ) : (
          <ul style={{ marginTop: 8, lineHeight: 1.7 }}>
            {recent.map((r) => (
              <li key={r.id}>
                <code>{new Date(r.createdAt).toISOString().slice(0, 16).replace('T', ' ')}</code> — {line(r)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <a href={INNGEST_DASHBOARD_URL} target="_blank" rel="noopener noreferrer" className="admin-link">
          Open Inngest dashboard →
        </a>
      </section>
    </div>
  )
}
