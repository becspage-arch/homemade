import { prisma, TutorialStatus, PipelineStatus, Visibility } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { anthropicConfigured } from '@/lib/anthropic'
import { PATTERN_CATEGORIES } from '@/lib/studio/generation/categories'
import { autopilotStates } from '@/lib/studio/generation/bulk/autopilot-state'
import { RunBatchControl, AutopilotToggle } from './run-controls'

export const dynamic = 'force-dynamic'

const INNGEST_DASHBOARD_URL = 'https://app.inngest.com/env/production/functions'

/** Category ceilings — the cron idles once a craft hits its target (mirrors the Inngest job). */
const XS_TARGET = Number(process.env.BULK_XS_TARGET) || 1500
const NW_TARGET = Number(process.env.BULK_NW_TARGET) || 1500

function relativeTime(when: Date): string {
  const diff = Date.now() - when.getTime()
  const s = Math.floor(Math.max(0, diff) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function stateBadge(status: PipelineStatus): { text: string; color: string } {
  if (status === PipelineStatus.COMPLETE) return { text: 'At target', color: 'var(--color-espresso)' }
  if (status === PipelineStatus.NOT_READY) return { text: 'Not signed off', color: 'var(--color-warm-taupe)' }
  return { text: 'On demand', color: 'var(--color-sage)' }
}

interface RunRow {
  id: string
  craft: string
  trigger: string
  requested: number
  published: number
  culled: number
  repaired: number
  generations: number
  errors: number
  killReasons: string[]
  startedAt: Date
}

/** Most common cull reason in a run — the "why did it dip" signal. */
function topKill(reasons: string[]): string | null {
  if (!reasons?.length) return null
  const counts = new Map<string, number>()
  for (const r of reasons) counts.set(r, (counts.get(r) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0]
}

function runLine(r: RunRow): string {
  const tag = r.trigger === 'cron' ? 'auto' : 'manual'
  const done = r.published + r.culled + r.errors
  const inflight = done < r.requested ? ` · ${done}/${r.requested} done…` : ''
  const kill = topKill(r.killReasons)
  const killNote = kill ? ` · top kill: “${kill}”` : ''
  return `[${tag}] ${r.craft}: ${r.published} published, ${r.culled} culled, ${r.repaired} repairs, ${r.generations} gens, ${r.errors} errors (of ${r.requested})${inflight}${killNote}`
}

const H2: React.CSSProperties = { fontFamily: 'var(--font-fraunces)', fontSize: 22, margin: '0 0 12px', color: 'var(--color-espresso)' }
const LORA_SM: React.CSSProperties = { fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }

function ProgressBar({ pct, full }: { pct: number; full: boolean }) {
  return (
    <div style={{ height: 6, background: 'var(--color-linen-grey)', borderRadius: 3, overflow: 'hidden', maxWidth: 320 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: full ? 'var(--color-espresso)' : 'var(--color-sage)', borderRadius: 3 }} />
    </div>
  )
}

function CraftCard({
  name,
  published,
  target,
  autopilotOn,
  disabled,
  disabledReason,
  craft,
  defaultCount,
  extraNote,
}: {
  name: string
  published: number
  target: number
  autopilotOn: boolean
  disabled: boolean
  disabledReason?: string
  craft: 'cross-stitch' | 'needlework'
  defaultCount: number
  extraNote?: string
}) {
  const pct = target > 0 ? Math.min(100, Math.round((published / target) * 100)) : 0
  const full = published >= target
  return (
    <article className="admin-kpi-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 19, margin: 0, color: 'var(--color-espresso)' }}>{name}</h3>
        {full && <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>At target</span>}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 14, color: 'var(--color-espresso)', marginBottom: 6 }}>
          {published.toLocaleString()}
          <span style={{ color: 'var(--color-warm-taupe)' }}> / {target.toLocaleString()} published</span>
        </div>
        <ProgressBar pct={pct} full={full} />
      </div>
      {extraNote && <p style={{ ...LORA_SM, margin: 0, lineHeight: 1.5 }}>{extraNote}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
        <AutopilotToggle craft={craft} enabled={autopilotOn} />
        <RunBatchControl craft={craft} defaultCount={defaultCount} disabled={disabled} disabledReason={disabledReason} />
      </div>
    </article>
  )
}

export default async function AdminBulkGenerationPage() {
  const actor = await getCurrentDbUser()
  if (!actor || !isAdmin(actor)) redirect('/admin')

  const patternLedSlugs = Object.keys(PATTERN_CATEGORIES)
  const patternLedTypes = Object.values(PATTERN_CATEGORIES).map((c) => c.patternType)

  const [
    xsCount,
    nwCount,
    recent,
    categoriesRaw,
    publishedTutorialRows,
    patternCountRows,
    patternSubcatRows,
    subCats,
  ] = await Promise.all([
    prisma.pattern.count({ where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC } }),
    prisma.needleworkPattern.count({ where: { ownerUserId: null, visibility: Visibility.PUBLIC } }),
    prisma.bulkRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: {
        id: true, craft: true, trigger: true, requested: true, published: true,
        culled: true, repaired: true, generations: true, errors: true, killReasons: true, startedAt: true,
      },
    }),
    prisma.category.findMany({
      orderBy: [{ launchOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, slug: true, name: true, pipelineStatus: true, targetTutorialCount: true, lastAutopilotRunAt: true },
    }),
    prisma.tutorial.groupBy({ by: ['categoryId'], where: { status: TutorialStatus.PUBLISHED }, _count: { _all: true } }),
    prisma.pattern.groupBy({ by: ['type'], where: { visibility: Visibility.PUBLIC, ownerUserId: null }, _count: { _all: true } }),
    prisma.pattern.groupBy({ by: ['subCategoryId'], where: { visibility: Visibility.PUBLIC, ownerUserId: null, type: { in: patternLedTypes } }, _count: { _all: true } }),
    prisma.subCategory.findMany({ where: { category: { slug: { in: patternLedSlugs } } }, select: { id: true, name: true, categoryId: true } }),
  ])

  const publishedTutorialsByCategoryId = new Map(publishedTutorialRows.map((r) => [r.categoryId, r._count._all]))
  const publishedPatternsByType = new Map(patternCountRows.map((r) => [r.type, r._count._all]))
  const patternCountBySubcatId = new Map(patternSubcatRows.map((r) => [r.subCategoryId, r._count._all]))
  const subcatsByCategoryId = new Map<string, { name: string; count: number }[]>()
  for (const sc of subCats) {
    const list = subcatsByCategoryId.get(sc.categoryId) ?? []
    list.push({ name: sc.name, count: patternCountBySubcatId.get(sc.id) ?? 0 })
    subcatsByCategoryId.set(sc.categoryId, list)
  }
  for (const list of subcatsByCategoryId.values()) list.sort((a, b) => b.count - a.count)

  const gateWired = anthropicConfigured()
  const renderWired = process.env.LOOM_RENDER === 'fargate'
  const autopilot = await autopilotStates()
  const xsAutopilot = autopilot['cross-stitch']
  const nwAutopilot = autopilot.needlework

  const xsDisabled = !gateWired
  const nwDisabled = !gateWired || !renderWired
  const nwDisabledReason = !gateWired ? 'Gate not wired.' : !renderWired ? 'Fargate render not wired.' : undefined

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Bulk generation</h1>
          <p>
            Server-side catalogue fill for the pattern crafts. Each batch plans varied briefs across the
            full complexity range, generates on the shared engine, runs the ruthless keep-or-kill vision
            gate, and publishes only the gems — stopping automatically at each craft&rsquo;s target. Run one
            on demand below, or let the cron fill in the background. Every run — manual and automatic —
            is recorded under Recent runs below (published / culled / regenerations / errors + top kill
            reasons); live per-step logs are in the{' '}
            <a href={INNGEST_DASHBOARD_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-sage)' }}>Inngest dashboard</a>.
          </p>
        </div>
      </div>

      {/* ── Generation status: wiring ─────────────────────────────────── */}
      <section style={{ marginBottom: 20 }}>
        <p style={{ ...LORA_SM, margin: 0 }}>
          Vision gate: <strong style={{ color: gateWired ? 'var(--color-sage)' : 'var(--color-burnt-sienna)' }}>{gateWired ? 'wired' : 'not wired'}</strong>
          {'  ·  '}Needlework render (Fargate): <strong style={{ color: renderWired ? 'var(--color-sage)' : 'var(--color-burnt-sienna)' }}>{renderWired ? 'wired' : 'not wired'}</strong>
        </p>
      </section>

      {/* ── The two bulk crafts ───────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={H2}>Craft generation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <CraftCard
            name="Cross-stitch"
            published={xsCount}
            target={XS_TARGET}
            autopilotOn={xsAutopilot}
            disabled={xsDisabled}
            disabledReason={gateWired ? undefined : 'Gate not wired — a batch would publish nothing.'}
            craft="cross-stitch"
            defaultCount={8}
          />
          <CraftCard
            name="Needlework"
            published={nwCount}
            target={NW_TARGET}
            autopilotOn={nwAutopilot}
            disabled={nwDisabled}
            disabledReason={nwDisabledReason}
            craft="needlework"
            defaultCount={4}
            extraNote="Each piece renders individually on AWS, so needlework is slower + pricier than cross-stitch."
          />
        </div>
      </section>

      {/* ── Library progress across every category ────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={H2}>Library progress</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ width: 120 }}>State</th>
                <th style={{ width: 200 }}>Published / target</th>
                <th style={{ width: 130 }}>Last filled</th>
              </tr>
            </thead>
            <tbody>
              {categoriesRaw.map((cat) => {
                const cfg = PATTERN_CATEGORIES[cat.slug]
                const isPatternLed = Boolean(cfg)
                const published = cfg ? publishedPatternsByType.get(cfg.patternType) ?? 0 : publishedTutorialsByCategoryId.get(cat.id) ?? 0
                const target = cfg ? cfg.patternTarget : cat.targetTutorialCount
                const unit = cfg ? 'patterns' : 'guides'
                const pct = target && target > 0 ? Math.min(100, Math.round((published / target) * 100)) : 0
                const badge = stateBadge(cat.pipelineStatus)
                const breakdown = isPatternLed ? subcatsByCategoryId.get(cat.id) ?? [] : []
                return (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 15, color: 'var(--color-espresso)' }}>{cat.name}</div>
                      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: 'var(--color-warm-taupe)' }}>{cat.slug} · {unit}</div>
                      {breakdown.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {breakdown.map((b) => (
                            <span key={b.name} title={`${b.count} ${unit}`} style={{ fontFamily: 'var(--font-lora)', fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--color-linen-grey)', color: b.count === 0 ? 'var(--color-burnt-sienna)' : 'var(--color-espresso)' }}>
                              {b.name} {b.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: badge.color }}>{badge.text}</span>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-espresso)', marginBottom: 4 }}>
                        {published.toLocaleString()}
                        {target != null && <span style={{ color: 'var(--color-warm-taupe)' }}> / {target.toLocaleString()}</span>}
                      </div>
                      {target != null && target > 0 && <ProgressBar pct={pct} full={cat.pipelineStatus === PipelineStatus.COMPLETE} />}
                    </td>
                    <td style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
                      {cat.lastAutopilotRunAt ? relativeTime(cat.lastAutopilotRunAt) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Recent runs (manual + automatic cron) ─────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={H2}>Recent runs</h2>
        {recent.length === 0 ? (
          <p style={{ ...LORA_SM, margin: 0 }}>No runs recorded yet.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            {recent.map((r) => (
              <li key={r.id} style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-espresso)' }}>
                <span style={{ color: 'var(--color-warm-taupe)' }}>{relativeTime(new Date(r.startedAt))}</span> — {runLine(r)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
