import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma, TestAssignmentStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

interface ScoreField {
  score: number
  comment: string
}

interface FeedbackShape {
  patternClarity?: ScoreField
  instructionClarity?: ScoreField
  photoAccuracy?: ScoreField
  suppliesAccuracy?: ScoreField
  timeTakenMinutes?: number | null
  estimatedTimeMinutes?: number | null
  whatWorked?: string
  whatDidnt?: string
}

export default async function FeedbackPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isCreator) redirect('/me/creator')

  const test = await prisma.patternTest.findUnique({
    where: { id },
    select: { id: true, creatorId: true, title: true },
  })
  if (!test) notFound()
  if (test.creatorId !== user.id) notFound()

  const completed = await prisma.testAssignment.findMany({
    where: { patternTestId: test.id, status: TestAssignmentStatus.COMPLETED },
    orderBy: { completedAt: 'desc' },
    include: {
      user: { select: { name: true, displayHandle: true } },
    },
  })

  const feedbacks = completed
    .map((a) => ({
      assignmentId: a.id,
      tester: a.user.displayHandle ?? a.user.name ?? 'Anonymous',
      completedAt: a.completedAt,
      feedback: (a.feedback ?? null) as FeedbackShape | null,
    }))
    .filter((f) => f.feedback)

  const averages = computeAverages(feedbacks.map((f) => f.feedback!))

  return (
    <>
      <section>
        <span className="me-section-label">Pattern test</span>
        <h2 className="me-section-title">Feedback — {test.title}</h2>
        <p className="me-section-description">
          {feedbacks.length} tester{feedbacks.length === 1 ? '' : 's'} submitted feedback so far.
        </p>
        <p style={{ marginBottom: 16 }}>
          <Link href={`/me/creator/patterns/${test.id}`} className="me-nav-link">
            ← back to pattern test
          </Link>
        </p>
      </section>

      {feedbacks.length === 0 ? (
        <p className="me-empty">No feedback yet. Once testers finish, their scores and notes land here.</p>
      ) : (
        <>
          <section>
            <span className="me-section-label">Averages</span>
            <h2 className="me-section-title">At a glance</h2>
            <div className="me-grid">
              <AverageCard label="Pattern clarity" average={averages.patternClarity} />
              <AverageCard label="Instruction clarity" average={averages.instructionClarity} />
              <AverageCard label="Photo accuracy" average={averages.photoAccuracy} />
              <AverageCard label="Supplies accuracy" average={averages.suppliesAccuracy} />
            </div>
            {averages.timeTaken !== null && (
              <p style={{ fontFamily: 'var(--font-lora)', marginTop: 18, color: 'var(--color-warm-taupe)' }}>
                Average time taken: {averages.timeTaken} min
                {averages.estimated !== null && ` (estimated ${averages.estimated} min)`}
              </p>
            )}
          </section>

          <section>
            <span className="me-section-label">Detail</span>
            <h2 className="me-section-title">Each tester’s notes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {feedbacks.map((f) => (
                <article
                  key={f.assignmentId}
                  style={{
                    background: 'var(--color-soft-parchment)',
                    border: '0.5px solid var(--color-linen-grey)',
                    borderRadius: 4,
                    padding: 20,
                  }}
                >
                  <header style={{ marginBottom: 12, fontFamily: 'var(--font-lora)' }}>
                    <strong>{f.tester}</strong>
                    {f.completedAt && (
                      <span style={{ color: 'var(--color-warm-taupe)', marginLeft: 10 }}>
                        · {f.completedAt.toLocaleDateString('en-GB')}
                      </span>
                    )}
                  </header>
                  <FeedbackBlock feedback={f.feedback!} />
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}

function AverageCard({ label, average }: { label: string; average: number | null }) {
  return (
    <div className="me-project-card" style={{ alignItems: 'flex-start' }}>
      <span className="me-project-eyebrow">{label}</span>
      <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 32, color: 'var(--color-sage)' }}>
        {average === null ? '—' : `${average.toFixed(1)} / 5`}
      </span>
    </div>
  )
}

function FeedbackBlock({ feedback }: { feedback: FeedbackShape }) {
  return (
    <div style={{ fontFamily: 'var(--font-lora)', fontSize: 14, lineHeight: 1.6 }}>
      {(['patternClarity', 'instructionClarity', 'photoAccuracy', 'suppliesAccuracy'] as const).map(
        (key) => {
          const item = feedback[key]
          if (!item) return null
          return (
            <div key={key} style={{ marginBottom: 8 }}>
              <strong>{labelFor(key)}: {item.score}/5</strong>
              {item.comment && <> — {item.comment}</>}
            </div>
          )
        },
      )}
      {feedback.timeTakenMinutes != null && (
        <p style={{ marginTop: 8 }}>
          Took {feedback.timeTakenMinutes} min
          {feedback.estimatedTimeMinutes != null &&
            ` against an estimate of ${feedback.estimatedTimeMinutes} min`}
          .
        </p>
      )}
      {feedback.whatWorked && (
        <p style={{ marginTop: 10 }}>
          <strong>What worked:</strong> {feedback.whatWorked}
        </p>
      )}
      {feedback.whatDidnt && (
        <p style={{ marginTop: 6 }}>
          <strong>What didn’t:</strong> {feedback.whatDidnt}
        </p>
      )}
    </div>
  )
}

function labelFor(key: keyof FeedbackShape): string {
  switch (key) {
    case 'patternClarity':
      return 'Pattern clarity'
    case 'instructionClarity':
      return 'Instruction clarity'
    case 'photoAccuracy':
      return 'Photo accuracy'
    case 'suppliesAccuracy':
      return 'Supplies accuracy'
    default:
      return key
  }
}

function computeAverages(feedbacks: FeedbackShape[]): {
  patternClarity: number | null
  instructionClarity: number | null
  photoAccuracy: number | null
  suppliesAccuracy: number | null
  timeTaken: number | null
  estimated: number | null
} {
  if (feedbacks.length === 0) {
    return {
      patternClarity: null,
      instructionClarity: null,
      photoAccuracy: null,
      suppliesAccuracy: null,
      timeTaken: null,
      estimated: null,
    }
  }
  const avg = (vals: number[]) =>
    vals.length === 0 ? null : vals.reduce((a, b) => a + b, 0) / vals.length

  const pull = (key: 'patternClarity' | 'instructionClarity' | 'photoAccuracy' | 'suppliesAccuracy') =>
    feedbacks
      .map((f) => f[key]?.score)
      .filter((n): n is number => typeof n === 'number')

  const times = feedbacks
    .map((f) => (typeof f.timeTakenMinutes === 'number' ? f.timeTakenMinutes : null))
    .filter((n): n is number => typeof n === 'number')
  const estimates = feedbacks
    .map((f) =>
      typeof f.estimatedTimeMinutes === 'number' ? f.estimatedTimeMinutes : null,
    )
    .filter((n): n is number => typeof n === 'number')

  return {
    patternClarity: avg(pull('patternClarity')),
    instructionClarity: avg(pull('instructionClarity')),
    photoAccuracy: avg(pull('photoAccuracy')),
    suppliesAccuracy: avg(pull('suppliesAccuracy')),
    timeTaken: times.length === 0 ? null : Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    estimated: estimates.length === 0 ? null : Math.round(estimates.reduce((a, b) => a + b, 0) / estimates.length),
  }
}
