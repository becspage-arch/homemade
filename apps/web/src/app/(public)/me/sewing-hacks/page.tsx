import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { listHacksForUser } from '@/lib/sewing/hack'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your sewing hacks · homemade',
  description: 'Saved hacks from the visual hack composer.',
  robots: { index: false, follow: false },
}

/**
 * /me/sewing-hacks — companion to /me/sewing-projects. Lists the user's
 * saved SewingPatternHack rows with a link back into the composer to
 * iterate.
 */
export default async function MySewingHacksPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/me/sewing-hacks')

  const hacks = await listHacksForUser(user.id)

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
          Your sewing hacks
        </h1>
        <p style={{ color: '#5c5347', marginTop: '0.4rem' }}>
          Saved option sets from the hack composer. Open one to keep tinkering.
        </p>
      </header>

      {hacks.length === 0 ? (
        <section
          style={{
            padding: '2rem',
            background: '#fafaf6',
            borderRadius: '14px',
            textAlign: 'center',
          }}
        >
          <p>No hacks yet. Open a pattern in the hack composer to start.</p>
          <p style={{ marginTop: '1rem' }}>
            <Link
              href="/studio/sewing/hack"
              style={{
                display: 'inline-block',
                padding: '0.6rem 1.2rem',
                background: '#c97551',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Open the hack composer
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
          {hacks.map((h) => {
            const targetSlug = h.freesewingDesignSlug ?? h.parentPatternSlug
            const composerHref = targetSlug
              ? `/studio/sewing/hack/${encodeURIComponent(targetSlug)}?hack=${encodeURIComponent(h.id)}`
              : `/studio/sewing/hack`
            const operationCount = Object.keys(h.hackOptions).length
            return (
              <li
                key={h.id}
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
                    href={composerHref}
                    style={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontWeight: 500,
                      fontSize: '1.15rem',
                      textDecoration: 'none',
                      color: '#3d2f22',
                    }}
                  >
                    {h.name ?? `Hack of ${h.parentPatternName}`}
                  </Link>
                  <div
                    style={{
                      color: '#5c5347',
                      fontSize: '0.9rem',
                      marginTop: '0.3rem',
                    }}
                  >
                    Based on {h.parentPatternName}
                    {' · '}
                    {operationCount} option{operationCount === 1 ? '' : 's'} set
                    {' · '}
                    Updated {h.updatedAt.toLocaleDateString('en-GB')}
                  </div>
                </div>
                <Link
                  href={composerHref}
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
            )
          })}
        </ul>
      )}
    </main>
  )
}
