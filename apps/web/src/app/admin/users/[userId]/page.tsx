import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma, SuspensionStatus, UserRole } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { posthogPersonUrl } from '@/lib/posthog-links'
import { SIGNUP_RISK_REASON_LABELS } from '@/lib/signup-risk'
import { UserDetailControls } from './user-controls'
import { CreatorTesterControls } from './creator-tester-controls'
import {
  MEMBER_COUNT_SELECT,
  PLAN_LABEL,
  SIGNAL_LABEL,
  SIGNAL_PILL_CLASS,
  computeSignal,
  contributionCount,
  finishedCountsByUser,
  planOf,
  savedCount,
  startedCount,
  studioDesignCount,
  type MemberCounts,
} from '../activity'
import { buildMemberTimeline } from '../timeline'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ userId: string }>
}

/** Maps a timeline `kind` onto the `_count` field that carries its true
 *  total (the itemised timeline below is capped per source). */
const KIND_COUNT_FIELD: Record<string, keyof MemberCounts> = {
  'Tutorial project': 'projects',
  'Chart progress': 'chartProgress',
  'Cross-stitch Studio': 'patternProgress',
  'Crochet Studio': 'crochetProjectProgress',
  'Needlework Studio': 'needleworkProjectProgress',
  'Knitting Studio': 'knittingProjectProgress',
  'Sewing Studio': 'sewingPatternProjects',
  'Planner queue': 'plannerProjects',
  Bookmark: 'bookmarks',
  'Saved pattern': 'savedPatterns',
  'Saved recipe': 'savedRecipes',
  'Cross-stitch design': 'patterns',
  'Crochet design': 'crochetPatterns',
  'Needlework design': 'needleworkPatterns',
  'Knitting design': 'knittingPatterns',
  Review: 'reviews',
  Photo: 'ugcPhotos',
  Question: 'questions',
  Answer: 'answers',
  'Errata report': 'errata',
  'Recipe authored': 'userRecipes',
  'Meal plan': 'mealPlans',
}

const KIND_ORDER = Object.keys(KIND_COUNT_FIELD)

function fmtDate(d: Date | null): string {
  return d ? d.toLocaleDateString('en-GB') : '—'
}

function fmtDateTime(d: Date | null): string {
  return d ? d.toLocaleString('en-GB') : '—'
}

export default async function AdminUserDetail({ params }: PageProps) {
  const { userId } = await params
  const [actor, target] = await Promise.all([
    getCurrentDbUser(),
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        suspensions: {
          orderBy: { createdAt: 'desc' },
          include: {
            suspendedBy: { select: { name: true, email: true } },
            liftedBy: { select: { name: true, email: true } },
          },
        },
        creatorProfile: true,
        _count: {
          select: {
            ...MEMBER_COUNT_SELECT,
            reportsFiled: true,
            tutorialsCreated: true,
            patternTests: true,
            testAssignments: true,
          },
        },
      },
    }),
  ])

  if (!target) notFound()

  const [timeline, finishedByUser] = await Promise.all([
    buildMemberTimeline(target.id),
    finishedCountsByUser([target.id]),
  ])

  const actorIsAdmin = isAdmin(actor)
  const counts = target._count as unknown as MemberCounts
  const started = startedCount(counts)
  const finished = finishedByUser.get(target.id) ?? 0
  const saved = savedCount(counts)
  const studioDesigns = studioDesignCount(counts)
  const contributions = contributionCount(counts)
  const signal = computeSignal({
    counts,
    lastSeenAt: target.lastSeenAt,
    createdAt: target.createdAt,
    signupRiskScore: target.signupRiskScore,
    emailDomain: target.emailDomain,
  })
  const plan = planOf(target)

  const groupedCounts = KIND_ORDER.map((kind) => {
    const field = KIND_COUNT_FIELD[kind]
    return { kind, count: field ? counts[field] : 0 }
  }).filter((g) => g.count > 0)

  const timelineCapNote = timeline.length >= 30 * 5 // heuristic: several sources hit their cap
  const posthogUrl = posthogPersonUrl(target.clerkId)

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{target.displayHandle ?? target.name ?? target.email}</h1>
          <p>
            {target.email}
            {' · '}
            <span className="admin-pill">{target.role.toLowerCase()}</span>{' '}
            <span className="admin-pill">{PLAN_LABEL[plan]}</span>{' '}
            <span className={`admin-pill ${SIGNAL_PILL_CLASS[signal]}`}>
              {SIGNAL_LABEL[signal]}
            </span>
            {target.isSuspended && (
              <>
                {' '}
                <span className="admin-pill flagged">
                  suspended
                  {target.suspendedUntil
                    ? ` · until ${target.suspendedUntil.toLocaleDateString('en-GB')}`
                    : ' · indefinite'}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <UserDetailControls
        userId={target.id}
        currentRole={target.role}
        isSuspended={target.isSuspended}
        premiumActive={target.premiumActive}
        actorIsAdmin={actorIsAdmin}
        isSelf={actor?.id === target.id}
        targetIsAdmin={target.role === UserRole.ADMIN}
      />

      <CreatorTesterControls
        userId={target.id}
        isCreator={target.isCreator}
        isPatternTester={target.isPatternTester}
        creatorVerifiedAt={target.creatorVerifiedAt}
        actorIsAdmin={actorIsAdmin}
        isSelf={actor?.id === target.id}
        displayHandle={target.displayHandle}
        creatorProfileStatus={target.creatorProfile?.applicationStatus ?? null}
        creatorProfileId={target.creatorProfile?.id ?? null}
      />

      <div className="admin-card" style={{ marginTop: 24 }}>
        <div className="admin-card-eyebrow">Account</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '4px 24px',
            fontFamily: 'var(--font-lora)',
            fontSize: 14,
          }}
        >
          <div>
            <strong>Last seen</strong>
            <br />
            {fmtDate(target.lastSeenAt)}
          </div>
          <div>
            <strong>Joined</strong>
            <br />
            {fmtDateTime(target.createdAt)}
          </div>
          <div>
            <strong>Onboarded</strong>
            <br />
            {target.onboardedAt ? fmtDate(target.onboardedAt) : 'not yet'}
          </div>
          <div>
            <strong>Country</strong>
            <br />
            {target.homeCountryCode ?? target.country ?? '—'}
          </div>
          <div>
            <strong>Device</strong>
            <br />
            {target.deviceClass ?? '—'}
          </div>
          <div>
            <strong>Acquisition channel</strong>
            <br />
            {target.acquisitionChannel ?? '—'}
          </div>
          <div>
            <strong>Signup cohort week</strong>
            <br />
            {target.signupCohortWeek ?? '—'}
          </div>
          <div>
            <strong>UTM source / medium / campaign</strong>
            <br />
            {[target.utmSource, target.utmMedium, target.utmCampaign].filter(Boolean).join(' / ') || '—'}
          </div>
          <div>
            <strong>PostHog</strong>
            <br />
            <a href={posthogUrl} target="_blank" rel="noreferrer">
              Open person page
            </a>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid var(--color-linen-grey)' }}>
          <strong style={{ fontFamily: 'var(--font-lora)', fontSize: 14 }}>Signup risk</strong>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 14, marginTop: 4 }}>
            Score {target.signupRiskScore} · email domain {target.emailDomain ?? '—'}
            {target.signupIp && <> · signed up from {target.signupIp}</>}
          </div>
          {target.signupRiskReasons.length > 0 && (
            <ul style={{ fontFamily: 'var(--font-lora)', fontSize: 13, margin: '6px 0 0' }}>
              {target.signupRiskReasons.map((r) => (
                <li key={r}>{SIGNUP_RISK_REASON_LABELS[r] ?? r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-eyebrow">Activity</div>
        <ul style={{ fontFamily: 'var(--font-lora)', lineHeight: 1.7 }}>
          <li>
            {started} projects started · {finished} finished
          </li>
          <li>{saved} things saved (bookmarks + saved patterns + saved recipes)</li>
          <li>{studioDesigns} designs made in the Studio</li>
          <li>{contributions} contributions (reviews, photos, questions, answers, errata)</li>
          {target.isCreator && (
            <>
              <li>{target._count.tutorialsCreated} creator tutorials</li>
              <li>{target._count.patternTests} pattern tests run</li>
            </>
          )}
          {target.isPatternTester && <li>{target._count.testAssignments} pattern test assignments</li>}
          <li>{target._count.reportsFiled} abuse reports filed</li>
        </ul>

        {groupedCounts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {groupedCounts.map((g) => (
              <span key={g.kind} className="admin-pill">
                {g.kind} · {g.count}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-eyebrow">Activity timeline</div>
        {timeline.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}>
            No activity recorded yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Kind</th>
                  <th>Item</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((e, i) => (
                  <tr key={i}>
                    <td>{fmtDate(e.date)}</td>
                    <td>{e.kind}</td>
                    <td>
                      {e.href ? (
                        <a href={e.href} target="_blank" rel="noreferrer">
                          {e.title}
                        </a>
                      ) : (
                        e.title
                      )}
                    </td>
                    <td>
                      {e.status === 'stalled' ? (
                        <span className="admin-pill pending">stalled</span>
                      ) : (
                        e.status
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {timelineCapNote && (
              <p style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)', marginTop: 8 }}>
                Showing the most recent activity per type. The counts above cover everything on record.
              </p>
            )}
          </div>
        )}
      </div>

      {target.suspensions.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-eyebrow">Suspension history</div>
          <ul style={{ fontFamily: 'var(--font-lora)', lineHeight: 1.7 }}>
            {target.suspensions.map((s) => (
              <li key={s.id} style={{ marginBottom: 8 }}>
                <strong>{s.status === SuspensionStatus.ACTIVE ? 'Active' : s.status.toLowerCase()}</strong>{' '}
                · started {s.startedAt.toLocaleDateString('en-GB')}
                {s.endsAt ? ` · until ${s.endsAt.toLocaleDateString('en-GB')}` : ' · indefinite'}
                {s.liftedAt ? ` · lifted ${s.liftedAt.toLocaleDateString('en-GB')}` : ''}
                <br />
                <span style={{ color: 'var(--color-warm-taupe)', fontSize: 13 }}>
                  Reason: {s.reason} · by {s.suspendedBy.email}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/admin/users" className="admin-btn secondary">
          Back to users
        </Link>
      </p>
    </div>
  )
}
