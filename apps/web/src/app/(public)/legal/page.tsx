import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalHeader } from './legal-header'

export const metadata: Metadata = {
  title: 'Legal — Homemade',
  description:
    'Privacy, terms, cookies, acceptable use, takedowns, subscription terms.',
}

const PAGES = [
  {
    href: '/legal/privacy',
    title: 'Privacy Policy',
    description:
      'What we collect, why we collect it, who processes it, and the rights you have over your data.',
  },
  {
    href: '/legal/terms',
    title: 'Terms of Service',
    description:
      'The rules of using Homemade — your account, content licence, and the things both sides agree to.',
  },
  {
    href: '/legal/cookies',
    title: 'Cookie Policy',
    description: 'What cookies we set, what they do, and how to change your mind.',
  },
  {
    href: '/legal/acceptable-use',
    title: 'Acceptable Use Policy',
    description: 'Behaviour and content we welcome — and the kinds we do not.',
  },
  {
    href: '/legal/dmca',
    title: 'DMCA / Takedown Policy',
    description: 'How to report copyright infringement and how counter-notices work.',
  },
  {
    href: '/legal/subscription-terms',
    title: 'Subscription Terms',
    description:
      'Billing, cancellation, refunds and price changes for the planned premium tier.',
  },
] as const

export default function LegalIndexPage() {
  return (
    <article className="legal-index">
      <LegalHeader eyebrow="Legal" title="The fine print" />
      <p className="legal-body">
        Every policy that governs how Homemade works, in one place. The
        privacy and cookie pages cover how we look after your data. The terms
        and subscription pages cover the agreement you make when you use the
        site. Acceptable use and the takedown policy cover content rules and
        how to report problems.
      </p>
      <div className="legal-index-grid">
        {PAGES.map((page) => (
          <Link key={page.href} href={page.href} className="legal-index-card">
            <h2 className="legal-index-card-title">{page.title}</h2>
            <p className="legal-index-card-description">{page.description}</p>
          </Link>
        ))}
      </div>
    </article>
  )
}
