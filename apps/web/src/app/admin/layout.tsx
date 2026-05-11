import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentDbUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (!isAdmin(user)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <h1
          className="text-4xl text-[var(--color-sage)] lowercase"
          style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '0.18em', fontWeight: 300 }}
        >
          not for you
        </h1>
        <p
          className="mt-8 text-xs uppercase text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.3em' }}
        >
          this part of homemade is for editors
        </p>
      </main>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-[var(--color-linen-grey)] bg-[var(--color-soft-parchment)] px-8 py-4">
        <Link
          href="/admin"
          className="text-2xl text-[var(--color-sage)] lowercase"
          style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '0.18em', fontWeight: 300 }}
        >
          homemade admin
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/admin/tutorials"
            className="text-xs uppercase text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
          >
            tutorials
          </Link>
          <Link
            href="/admin/categories"
            className="text-xs uppercase text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
          >
            categories
          </Link>
          <Link
            href="/admin/sub-categories"
            className="text-xs uppercase text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
          >
            sub-cats
          </Link>
          <Link
            href="/admin/tags"
            className="text-xs uppercase text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
          >
            tags
          </Link>
          <Link
            href="/admin/glossary"
            className="text-xs uppercase text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
          >
            glossary
          </Link>
          <Link
            href="/admin/media"
            className="text-xs uppercase text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
          >
            media
          </Link>
          <UserButton />
        </nav>
      </header>
      <main className="flex-1 px-8 py-12">{children}</main>
    </div>
  )
}
