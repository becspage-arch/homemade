import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma, TutorialStatus, PipelineStatus, Visibility } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { PATTERN_CATEGORIES } from '@/lib/studio/generation/categories'

export const dynamic = 'force-dynamic'

/**
 * Content library — a READ-ONLY progress + fill cockpit.
 *
 * The old hourly tutorial autopilot is retired: it is globally paused and no
 * category is left READY, so nothing fires on a schedule. Content now grows
 * ON DEMAND only — you start a Claude Code session and ask it to fill a
 * category; it reads the category's locked look + sub-categories, generates a
 * batch, runs the vision gate + QC, and publishes the good ones. Nothing on
 * this page can trigger generation, so it can never produce junk.
 *
 * Pattern-led categories (cross-stitch, future knitting/crochet) are measured
 * in published library patterns toward a pattern target; everything else in
 * published teaching tutorials toward targetTutorialCount. The pattern targets
 * + sub-category structure come from the generation registry.
 */
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

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-lora)',
  fontSize: 11,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: 'var(--color-warm-taupe)',
  marginBottom: 4,
}

export default async function AdminContentLibraryPage() {
  const actor = await getCurrentDbUser()
  if (!actor || !isAdmin(actor)) redirect('/admin')

  const patternLedSlugs = Object.keys(PATTERN_CATEGORIES)
  const patternLedTypes = Object.values(PATTERN_CATEGORIES).map((c) => c.patternType)

  const [categoriesRaw, publishedTutorialRows, patternCountRows, patternSubcatRows, subCats] =
    await Promise.all([
      prisma.category.findMany({
        orderBy: [{ launchOrder: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          slug: true,
          name: true,
          pipelineStatus: true,
          targetTutorialCount: true,
          lastAutopilotRunAt: true,
        },
      }),
      prisma.tutorial.groupBy({
        by: ['categoryId'],
        where: { status: TutorialStatus.PUBLISHED },
        _count: { _all: true },
      }),
      prisma.pattern.groupBy({
        by: ['type'],
        where: { visibility: Visibility.PUBLIC, ownerUserId: null },
        _count: { _all: true },
      }),
      prisma.pattern.groupBy({
        by: ['subCategoryId'],
        where: { visibility: Visibility.PUBLIC, ownerUserId: null, type: { in: patternLedTypes } },
        _count: { _all: true },
      }),
      prisma.subCategory.findMany({
        where: { category: { slug: { in: patternLedSlugs } } },
        select: { id: true, name: true, categoryId: true },
      }),
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

  // Image verification coverage (a content-health read-out, kept informational)
  const verificationGroups = await prisma.media.groupBy({
    by: ['verificationStatus'],
    where: { tutorialsHero: { some: { status: TutorialStatus.PUBLISHED } } },
    _count: { _all: true },
  })
  const verificationCounts = { VERIFIED: 0, UNVERIFIED: 0, REJECTED: 0, REJECTED_USED_PROCEDURAL: 0, SYNTHETIC_FALLBACK: 0 }
  for (const g of verificationGroups) verificationCounts[g.verificationStatus] = g._count._all
  const verificationTotal = Object.values(verificationCounts).reduce((a, b) => a + b, 0)
  const verificationCoverage = verificationTotal > 0 ? Math.round((verificationCounts.VERIFIED / verificationTotal) * 100) : 0

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Content library</h1>
          <p>
            Progress across every category, and how to add more. Content grows on demand only —
            nothing here runs on a schedule, so this page can show and instruct but never
            generate. The old hourly autopilot is retired (globally paused, no category READY).
          </p>
        </div>
      </div>

      {/* ── How to fill more ─────────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 22, margin: '0 0 12px', color: 'var(--color-espresso)' }}>
          How to fill more
        </h2>
        <article className="admin-kpi-card" style={{ padding: 18, fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-espresso)', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 10px' }}>
            To add content to a category, start a Claude Code session and ask it to fill that
            category with a theme + a count (for example: <em>&ldquo;fill cross-stitch with 30
            Halloween patterns&rdquo;</em>). The session reads the category&rsquo;s locked look and
            sub-categories, generates a batch, runs the vision gate + QC, and publishes the good
            ones into the right sub-category. Borderline output waits in a review queue for a look.
          </p>
          <ul style={{ margin: '0 0 4px', paddingLeft: 18 }}>
            <li>
              <strong>Pattern categories</strong> (cross-stitch, and future knitting / crochet)
              generate through the chart pipeline — <code>scripts/xs-gen-from-json.ts</code> into
              the <Link href="/admin/cross-stitch/review" style={{ color: 'var(--color-sage)' }}>review queue</Link>.
            </li>
            <li>
              <strong>Tutorial categories</strong> (cooking, baking, and the rest) author through
              the recipe / technique worker, held to the completeness gate.
            </li>
          </ul>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
            The thin spots below show where each category is light. The sub-category breakdown is the
            &ldquo;where&rdquo;; the steps above are the &ldquo;how&rdquo;.
          </p>
        </article>
      </section>

      {/* ── Per-category progress ────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 22, margin: '0 0 12px', color: 'var(--color-espresso)' }}>
          Library progress
        </h2>

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
                const published = cfg
                  ? publishedPatternsByType.get(cfg.patternType) ?? 0
                  : publishedTutorialsByCategoryId.get(cat.id) ?? 0
                const target = cfg ? cfg.patternTarget : cat.targetTutorialCount
                const unit = cfg ? 'patterns' : 'guides'
                const pct = target && target > 0 ? Math.min(100, Math.round((published / target) * 100)) : 0
                const badge = stateBadge(cat.pipelineStatus)
                const breakdown = isPatternLed ? subcatsByCategoryId.get(cat.id) ?? [] : []

                return (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 15, color: 'var(--color-espresso)' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: 'var(--color-warm-taupe)' }}>
                        {cat.slug} · {unit}
                      </div>
                      {breakdown.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {breakdown.map((b) => (
                            <span
                              key={b.name}
                              title={`${b.count} ${unit}`}
                              style={{
                                fontFamily: 'var(--font-lora)',
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 10,
                                background: 'var(--color-linen-grey)',
                                color: b.count === 0 ? 'var(--color-burnt-sienna)' : 'var(--color-espresso)',
                              }}
                            >
                              {b.name} {b.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: badge.color }}>
                        {badge.text}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-espresso)', marginBottom: 4 }}>
                        {published.toLocaleString()}
                        {target != null && <span style={{ color: 'var(--color-warm-taupe)' }}> / {target.toLocaleString()}</span>}
                      </div>
                      {target != null && target > 0 && (
                        <div style={{ height: 4, background: 'var(--color-linen-grey)', borderRadius: 2, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: cat.pipelineStatus === PipelineStatus.COMPLETE ? 'var(--color-espresso)' : 'var(--color-sage)',
                              borderRadius: 2,
                            }}
                          />
                        </div>
                      )}
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

      {/* ── Image verification ───────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 22, margin: 0, color: 'var(--color-espresso)' }}>
            Image verification
          </h2>
          <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
            Hero coverage on PUBLISHED tutorials —{' '}
            <strong style={{ color: 'var(--color-espresso)' }}>{verificationCoverage}%</strong> verified
          </span>
        </header>
        <article
          className="admin-kpi-card"
          style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-espresso)' }}
        >
          {[
            { label: 'Verified', value: verificationCounts.VERIFIED },
            { label: 'Unverified', value: verificationCounts.UNVERIFIED },
            { label: 'Rejected', value: verificationCounts.REJECTED },
            { label: 'Used procedural', value: verificationCounts.REJECTED_USED_PROCEDURAL },
          ].map((cell) => (
            <div key={cell.label}>
              <div style={LABEL_STYLE}>{cell.label}</div>
              <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 28, fontWeight: 400 }}>{cell.value}</div>
            </div>
          ))}
        </article>
      </section>
    </div>
  )
}
