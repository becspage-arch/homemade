import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@homemade/db'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const user = await currentUser()

  const [tutorialCount, categoryCount, glossaryCount, mediaCount] = await Promise.all([
    prisma.tutorial.count(),
    prisma.category.count(),
    prisma.glossaryTerm.count(),
    prisma.media.count(),
  ])

  const firstName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress?.split('@')[0] ?? 'there'

  return (
    <div className="mx-auto max-w-4xl">
      <h1
        className="text-5xl text-[var(--color-espresso)]"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
      >
        Good morning, {firstName}.
      </h1>

      <p
        className="mt-6 text-lg text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)' }}
      >
        The library is still small. When there&apos;s enough to publish, this page becomes a real
        editorial dashboard.
      </p>

      <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
        <StatCard label="Tutorials" value={tutorialCount} />
        <StatCard label="Categories" value={categoryCount} />
        <StatCard label="Glossary terms" value={glossaryCount} />
        <StatCard label="Media items" value={mediaCount} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-soft-parchment)] p-6">
      <div
        className="text-xs uppercase text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
      >
        {label}
      </div>
      <div
        className="mt-3 text-4xl text-[var(--color-sage)]"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
      >
        {value}
      </div>
    </div>
  )
}
