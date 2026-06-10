/**
 * StudioTopNav  -  slim sticky band at the top of every Studio page.
 *
 *   [Homemade] / [Cross-stitch] / Studio                    [user menu]
 *
 * "Homemade" links to /. The category breadcrumb links to /<category>.
 * "Studio" is the current location, not clickable. Right-aligned: user
 * avatar + name when signed in, "Sign in" CTA when not.
 *
 * Replaces the previous arrangement where the Studio pages had no path
 * back to the category or to the home page  -  users hit /studio/cross-
 * stitch and felt stranded.
 */

import Link from 'next/link'
import { STUDIO_CATEGORY_CONFIG, type StudioCategorySlug } from '@/lib/studio/category-config'
import './StudioTopNav.css'

interface StudioTopNavProps {
  category: StudioCategorySlug
  signedIn: boolean
  userName: string | null
}

export function StudioTopNav({ category, signedIn, userName }: StudioTopNavProps) {
  const config = STUDIO_CATEGORY_CONFIG[category]
  const firstName = userName?.split(' ')[0] ?? null
  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?'

  return (
    <nav className="studio-topnav" aria-label="Studio navigation">
      <div className="studio-topnav-crumbs">
        <Link href="/" className="studio-topnav-home" aria-label="Homemade home">
          homemade
        </Link>
        <span className="studio-topnav-sep" aria-hidden="true">/</span>
        <Link href={config.categoryHref} className="studio-topnav-category">
          {config.displayName}
        </Link>
        <span className="studio-topnav-sep" aria-hidden="true">/</span>
        <span className="studio-topnav-current" aria-current="page">
          Studio
        </span>
      </div>

      <div className="studio-topnav-user">
        {signedIn ? (
          <Link href="/me" className="studio-topnav-user-link">
            <span className="studio-topnav-avatar" aria-hidden="true">{initials}</span>
            {firstName && <span className="studio-topnav-username">{firstName}</span>}
          </Link>
        ) : (
          <Link href="/sign-in" className="studio-topnav-signin">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
