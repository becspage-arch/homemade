import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  PENDING_MODERATION: 'In review',
  PUBLISHED: 'Published',
  HIDDEN: 'Hidden',
  REMOVED: 'Removed',
}

export default async function MyQuestionsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const [questions, answers] = await Promise.all([
    prisma.question.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        tutorial: {
          select: {
            title: true,
            slug: true,
            category: { select: { slug: true } },
          },
        },
      },
    }),
    prisma.answer.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        question: {
          include: {
            tutorial: {
              select: {
                title: true,
                slug: true,
                category: { select: { slug: true } },
              },
            },
          },
        },
      },
    }),
  ])

  return (
    <>
      <section>
        <span className="me-section-label">Your questions</span>
        <h2 className="me-section-title">Questions</h2>
        {questions.length === 0 ? (
          <p className="me-empty">
            You haven’t asked any questions yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {questions.map((q) => (
              <div
                key={q.id}
                style={{
                  background: 'var(--color-cream)',
                  border: '0.5px solid var(--color-linen-grey)',
                  borderRadius: 4,
                  padding: 18,
                  fontFamily: 'var(--font-lora)',
                }}
              >
                <Link
                  href={`/${q.tutorial.category.slug}/${q.tutorial.slug}#qa`}
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 16,
                    color: 'var(--color-espresso)',
                    textDecoration: 'none',
                  }}
                >
                  on {q.tutorial.title}
                </Link>
                <p style={{ margin: '8px 0' }}>{q.body}</p>
                <div className="me-project-meta">
                  <span className="me-status-pill">{STATUS_LABEL[q.status] ?? q.status}</span>
                  <span>· {q.upvoteCount} upvotes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <span className="me-section-label">Your answers</span>
        <h2 className="me-section-title">Answers</h2>
        {answers.length === 0 ? (
          <p className="me-empty">You haven’t answered any questions yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {answers.map((a) => (
              <div
                key={a.id}
                style={{
                  background: 'var(--color-cream)',
                  border: '0.5px solid var(--color-linen-grey)',
                  borderRadius: 4,
                  padding: 18,
                  fontFamily: 'var(--font-lora)',
                }}
              >
                <Link
                  href={`/${a.question.tutorial.category.slug}/${a.question.tutorial.slug}#qa`}
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 16,
                    color: 'var(--color-espresso)',
                    textDecoration: 'none',
                  }}
                >
                  on {a.question.tutorial.title}
                </Link>
                <p
                  style={{
                    margin: '6px 0',
                    fontSize: 13,
                    color: 'var(--color-warm-taupe)',
                  }}
                >
                  Q: {a.question.body}
                </p>
                <p style={{ margin: '4px 0' }}>{a.body}</p>
                <div className="me-project-meta">
                  <span className="me-status-pill">{STATUS_LABEL[a.status] ?? a.status}</span>
                  {a.isAuthorAnswer && <span>· from Homemade</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
