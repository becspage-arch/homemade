import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { loadSewingProjectsForUser } from '@/lib/sewing/load-pattern'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your sewing projects · homemade',
  description: 'Sewing patterns you have in progress.',
  robots: { index: false, follow: false },
}

/**
 * /me/sewing-projects - sewing-side companion to /me/crochet-stash and
 * /me/sewing-plans. Shows the user's active SewingPatternProject rows
 * with a link back into the Studio.
 */
export default async function MySewingProjectsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/me/sewing-projects')

  const projects = await loadSewingProjectsForUser(user.id)

  return (
    <main
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
      }}
    >
      <header style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 500,
            margin: 0,
            fontSize: '2rem',
          }}
        >
          Your sewing projects
        </h1>
        <p style={{ color: '#5c5347', marginTop: '0.4rem' }}>
          Patterns you have in progress. Open one to pick up where you left off.
        </p>
      </header>

      {projects.length === 0 ? (
        <section
          style={{
            padding: '2rem',
            background: '#fafaf6',
            borderRadius: '14px',
            textAlign: 'center',
          }}
        >
          <p>No projects yet.</p>
          <p style={{ marginTop: '1rem' }}>
            <Link
              href="/studio/sewing"
              style={{
                display: 'inline-block',
                padding: '0.6rem 1.2rem',
                background: '#c97551',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Open the Sewing Studio
            </Link>
          </p>
        </section>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gap: '0.8rem',
          }}
        >
          {projects.map((p) => (
            <li
              key={p.id}
              style={{
                background: '#fafaf6',
                padding: '1rem 1.2rem',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <Link
                  href={`/studio/sewing/${encodeURIComponent(p.patternSlug)}`}
                  style={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontWeight: 500,
                    fontSize: '1.15rem',
                    textDecoration: 'none',
                    color: '#3d2f22',
                  }}
                >
                  {p.patternName}
                </Link>
                <div style={{ color: '#5c5347', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                  {p.selectedSize ? `Size ${p.selectedSize}` : 'Size not picked'}
                  {p.stepsTotal > 0 && (
                    <>
                      {' · '}
                      {p.stepsCompleted}/{p.stepsTotal} steps
                    </>
                  )}
                  {' · '}
                  Last worked {new Date(p.lastWorkedAt).toLocaleDateString('en-GB')}
                </div>
              </div>
              <Link
                href={`/studio/sewing/${encodeURIComponent(p.patternSlug)}`}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#c97551',
                  color: '#fff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                }}
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
