import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { PatternTestForm } from '../pattern-test-form'

export const dynamic = 'force-dynamic'

export default async function NewPatternTestPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isCreator) redirect('/me/creator')

  const tutorials = await prisma.tutorial.findMany({
    where: { creatorId: user.id },
    orderBy: { title: 'asc' },
    select: { id: true, title: true },
  })

  return (
    <>
      <section>
        <span className="me-section-label">Creator</span>
        <h2 className="me-section-title">New pattern test</h2>
        <p style={{ marginBottom: 16 }}>
          <Link href="/me/creator/patterns" className="me-nav-link">
            ← all pattern tests
          </Link>
        </p>
        {tutorials.length === 0 && (
          <p className="me-empty">
            You need at least one tutorial of your own before running a pattern test.
            <br />
            <Link href="/admin/tutorials/new" className="me-nav-link">
              Start a tutorial →
            </Link>
          </p>
        )}
      </section>

      {tutorials.length > 0 && (
        <section>
          <PatternTestForm
            tutorials={tutorials}
            defaults={{
              tutorialId: '',
              title: '',
              briefForTesters: '',
              maxTesters: 5,
              recruitingClosesAt: '',
            }}
          />
        </section>
      )}
    </>
  )
}
