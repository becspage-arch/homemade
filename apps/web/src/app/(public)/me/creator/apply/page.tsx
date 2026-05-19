import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  prisma,
  CreatorApplicationStatus,
  UserProjectStatus,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { CreatorApplyChecklist } from './creator-apply-checklist'

export const dynamic = 'force-dynamic'

/**
 * Session A — Creator application is now Maker-profile-driven. The Maker's
 * own /m/{handle} IS the application: the strength of their Made it log,
 * notes, and photos is the pitch. This page surfaces a readiness checklist
 * and a single "Apply with my Maker profile" button. Admin reviewers open
 * /m/{handle} directly.
 *
 * The legacy /me/creator/apply form (bio, specialty, social links) moves to
 * /me/creator/profile post-approval. The form fields are kept on the
 * CreatorProfile model — admin still surfaces them in /admin/creators/[id].
 * What changes is who edits them: a Creator after approval, not an
 * applicant before. For pre-approval Makers, the bio + handle in /me/settings
 * is the full surface.
 */
export default async function CreatorApplyPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  })

  if (
    profile?.applicationStatus === CreatorApplicationStatus.APPROVED &&
    user.isCreator
  ) {
    redirect('/me/creator')
  }

  // Readiness signals — render as a checklist so the Maker knows what to
  // polish before applying.
  const [publicMadeItCount, withPhotosCount] = await Promise.all([
    prisma.userProject.count({
      where: { userId: user.id, isPublic: true },
    }),
    prisma.uGCPhoto.count({
      where: { userId: user.id, status: 'APPROVED' },
    }),
  ])

  const hasHandle = Boolean(user.displayHandle)
  const hasBio = Boolean(user.bio && user.bio.trim().length >= 20)
  const isPublic = user.isPublicMakerProfile
  const hasTenMakes = publicMadeItCount >= 10

  const pendingApplication =
    profile?.applicationStatus === CreatorApplicationStatus.APPLIED
  const lastRejection =
    profile?.applicationStatus === CreatorApplicationStatus.REJECTED
      ? profile.rejectionReason
      : null

  return (
    <>
      <section>
        <span className="me-section-label">Creator program</span>
        <h2 className="me-section-title">Apply with your Maker profile</h2>
        <p className="me-section-description">
          Your Maker profile is the application. We look at your Made it log,
          your notes, and your photos. When you&apos;re ready, hit apply — a
          reviewer opens your profile directly.
        </p>

        {pendingApplication && (
          <p className="me-empty" style={{ marginBottom: 20 }}>
            Your application is in the queue. You can keep polishing your
            profile while you wait — what reviewers see is whatever&apos;s
            live at the moment they open it.
          </p>
        )}

        {lastRejection && (
          <p className="me-empty" style={{ marginBottom: 20 }}>
            <strong>Last decision:</strong> {lastRejection}
          </p>
        )}
      </section>

      <section>
        <span className="me-section-label">Readiness</span>
        <h3 className="me-section-title" style={{ fontSize: 18 }}>
          Before you apply
        </h3>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '12px 0 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <ChecklistItem
            done={hasHandle}
            label="You&rsquo;ve set a Maker handle"
            hint={
              hasHandle
                ? `@${user.displayHandle}`
                : 'Pick one in settings — it becomes your profile URL.'
            }
            href="/me/settings"
          />
          <ChecklistItem
            done={hasBio}
            label="Your bio reads well"
            hint={
              hasBio
                ? 'Looks good.'
                : 'Add a few sentences in settings about what you make.'
            }
            href="/me/settings"
          />
          <ChecklistItem
            done={isPublic}
            label="Your profile is public"
            hint={
              isPublic
                ? `Live at /m/${user.displayHandle ?? '—'}`
                : 'Flip the public toggle in settings.'
            }
            href="/me/settings"
          />
          <ChecklistItem
            done={hasTenMakes}
            label="At least 10 Made it entries published"
            hint={`${publicMadeItCount} of 10 published${
              withPhotosCount > 0
                ? ` · ${withPhotosCount} with photos`
                : ''
            }.`}
            href="/me/projects"
          />
        </ul>
      </section>

      <section>
        <CreatorApplyChecklist
          canSubmit={hasHandle && hasBio && isPublic && !pendingApplication}
          handle={user.displayHandle}
        />
      </section>
    </>
  )
}

interface ChecklistItemProps {
  done: boolean
  label: string
  hint: string
  href: string
}

function ChecklistItem({ done, label, hint, href }: ChecklistItemProps) {
  return (
    <li
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 8,
        background: done ? 'rgba(107, 138, 100, 0.06)' : 'var(--color-warm-cream)',
        border: '0.5px solid var(--color-warm-taupe)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: done ? 'var(--color-sage)' : 'transparent',
          border: done ? 'none' : '1px solid var(--color-warm-taupe)',
          color: 'var(--color-cream)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          marginTop: 2,
        }}
      >
        {done ? '✓' : ''}
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontWeight: 500 }}>
          {label}
          {!done && (
            <>
              {' · '}
              <Link
                href={href}
                className="me-nav-link"
                style={{ fontWeight: 400 }}
              >
                fix →
              </Link>
            </>
          )}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 13,
            color: 'var(--color-warm-taupe)',
            marginTop: 2,
          }}
        >
          {hint}
        </span>
      </span>
    </li>
  )
}
