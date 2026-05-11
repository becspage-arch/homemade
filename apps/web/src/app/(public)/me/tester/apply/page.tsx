import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { TesterApplyForm } from './tester-apply-form'

export const dynamic = 'force-dynamic'

export default async function TesterApplyPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (user.isPatternTester) redirect('/me/tester')

  return (
    <>
      <section>
        <span className="me-section-label">Pattern tester</span>
        <h2 className="me-section-title">Join the tester pool</h2>
        <p className="me-section-description">
          Help creators refine their tutorials before they go public. You’ll get
          to apply to pattern tests that interest you and submit structured
          feedback when you’re done. Self-paced — no minimum commitment.
        </p>
      </section>

      <section>
        <TesterApplyForm />
      </section>
    </>
  )
}
