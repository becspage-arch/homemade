import Link from 'next/link'
import {
  prisma,
  EditorialPickStatus,
  TutorialStatus,
} from '@homemade/db'
import {
  addWeeks,
  isoWeekStartUtc,
} from '@/lib/editorial-picks'
import {
  pinEditorialPickAction,
  regenerateEditorialPicksAction,
  replaceEditorialPickAction,
  unpinEditorialPickAction,
} from '@/lib/editorial-picks-actions'

export const dynamic = 'force-dynamic'

const WEEKS_AHEAD = 4
const PICKS_PER_WEEK = 5

function formatWeek(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function statusLabel(status: EditorialPickStatus): string {
  switch (status) {
    case 'AUTO_SELECTED':
      return 'auto-selected'
    case 'MANUALLY_PINNED':
      return 'pinned'
    case 'MANUALLY_REPLACED':
      return 'replaced'
  }
}

export default async function EditorialPicksPage() {
  const now = new Date()
  const startWeek = isoWeekStartUtc(now)
  const weeks: Date[] = []
  for (let i = 0; i < WEEKS_AHEAD; i += 1) {
    weeks.push(addWeeks(startWeek, i))
  }

  const [picks, publishedTutorials] = await Promise.all([
    prisma.weeklyEditorialPick.findMany({
      where: { weekStarting: { in: weeks } },
      orderBy: [{ weekStarting: 'asc' }, { position: 'asc' }],
      include: {
        tutorial: {
          select: {
            id: true,
            slug: true,
            title: true,
            category: { select: { name: true, slug: true } },
          },
        },
      },
    }),
    prisma.tutorial.findMany({
      where: { status: TutorialStatus.PUBLISHED },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        category: { select: { name: true } },
      },
    }),
  ])

  const byWeek = new Map<string, typeof picks>()
  for (const week of weeks) {
    byWeek.set(week.toISOString(), [])
  }
  for (const pick of picks) {
    const key = pick.weekStarting.toISOString()
    const arr = byWeek.get(key)
    if (arr) arr.push(pick)
  }

  const isEmpty = picks.length === 0

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1
          className="text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          Editorial picks
        </h1>
        <form action={regenerateEditorialPicksAction}>
          <button
            type="submit"
            className="bg-[var(--color-sage)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            regenerate all auto-picks
          </button>
        </form>
      </div>

      <p
        className="mt-4 text-sm text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)' }}
      >
        The Sunday-night cron seeds five picks per week, four weeks ahead.
        Pin a row to lock it for future cron runs. Replace any position to
        override an auto-pick. The cron next runs Sunday 22:00 UTC.
      </p>

      {isEmpty && (
        <div
          className="mt-8 rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-soft-parchment)] p-6"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          <p className="text-sm text-[var(--color-warm-taupe)]">
            No picks yet for the next four weeks. Click{' '}
            <span className="text-[var(--color-sage)]">
              regenerate all auto-picks
            </span>{' '}
            above to seed them.
          </p>
        </div>
      )}

      <div className="mt-12 space-y-12">
        {weeks.map((week) => {
          const weekPicks = byWeek.get(week.toISOString()) ?? []
          const isCurrentWeek = week.getTime() === startWeek.getTime()
          return (
            <section key={week.toISOString()}>
              <h2
                className="text-2xl text-[var(--color-espresso)]"
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
              >
                Week of {formatWeek(week)}
                {isCurrentWeek && (
                  <span
                    className="ml-3 text-xs uppercase tracking-[0.25em] text-[var(--color-sage)]"
                    style={{ fontFamily: 'var(--font-lora)' }}
                  >
                    this week
                  </span>
                )}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: PICKS_PER_WEEK }).map((_, idx) => {
                  const pos = idx + 1
                  const pick = weekPicks.find((p) => p.position === pos)
                  return (
                    <PickCard
                      key={`${week.toISOString()}-${pos}`}
                      position={pos}
                      pick={pick}
                      publishedTutorials={publishedTutorials}
                    />
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

interface PickRow {
  id: string
  weekStarting: Date
  position: number
  tutorialId: string
  status: EditorialPickStatus
  selectedBy: string | null
  selectedAt: Date | null
  replacedAutoPickId: string | null
  reason: string | null
  createdAt: Date
  updatedAt: Date
  tutorial: {
    id: string
    slug: string
    title: string
    category: { name: string; slug: string } | null
  }
}

function PickCard({
  position,
  pick,
  publishedTutorials,
}: {
  position: number
  pick: PickRow | undefined
  publishedTutorials: {
    id: string
    title: string
    slug: string
    category: { name: string } | null
  }[]
}) {
  if (!pick) {
    return (
      <div
        className="rounded-sm border border-dashed border-[var(--color-linen-grey)] p-4 text-sm text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)' }}
      >
        <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-sage)]">
          position {position}
        </div>
        <p className="mt-2">No pick yet. Run regenerate to fill.</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-soft-parchment)] p-4"
      style={{ fontFamily: 'var(--font-lora)' }}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em]">
        <span className="text-[var(--color-sage)]">position {position}</span>
        <span className="text-[var(--color-warm-taupe)]">
          {statusLabel(pick.status)}
        </span>
      </div>
      <h3
        className="mt-3 text-lg text-[var(--color-espresso)]"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
      >
        <Link
          href={`/admin/tutorials/${pick.tutorial.id}`}
          className="hover:text-[var(--color-sage)]"
        >
          {pick.tutorial.title}
        </Link>
      </h3>
      {pick.tutorial.category && (
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-warm-taupe)]">
          {pick.tutorial.category.name}
        </p>
      )}
      {pick.reason && (
        <p className="mt-3 text-xs text-[var(--color-warm-taupe)]">
          Note: {pick.reason}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3">
        {pick.status === EditorialPickStatus.MANUALLY_PINNED ? (
          <form action={unpinEditorialPickAction.bind(null, pick.id)}>
            <button
              type="submit"
              className="text-xs uppercase tracking-[0.2em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
            >
              unpin
            </button>
          </form>
        ) : (
          <form action={pinEditorialPickAction.bind(null, pick.id)}>
            <button
              type="submit"
              className="text-xs uppercase tracking-[0.2em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
            >
              pin
            </button>
          </form>
        )}
        <form
          action={async (formData: FormData) => {
            'use server'
            const replacement = formData.get('replacement')?.toString() ?? ''
            const reason = formData.get('reason')?.toString() ?? ''
            if (!replacement) return
            await replaceEditorialPickAction(pick.id, replacement, reason || null)
          }}
          className="flex flex-col gap-2"
        >
          <label
            htmlFor={`replace-${pick.id}`}
            className="text-xs uppercase tracking-[0.2em] text-[var(--color-warm-taupe)]"
          >
            replace with
          </label>
          <select
            id={`replace-${pick.id}`}
            name="replacement"
            className="border border-[var(--color-linen-grey)] bg-[var(--color-cream)] p-2 text-sm"
            style={{ fontFamily: 'var(--font-lora)' }}
            defaultValue=""
          >
            <option value="" disabled>
              choose a tutorial…
            </option>
            {publishedTutorials.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
                {t.category ? ` — ${t.category.name}` : ''}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="reason"
            placeholder="reason (optional)"
            className="border border-[var(--color-linen-grey)] bg-[var(--color-cream)] p-2 text-sm"
            style={{ fontFamily: 'var(--font-lora)' }}
          />
          <button
            type="submit"
            className="bg-[var(--color-sage)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
          >
            replace
          </button>
        </form>
      </div>
    </div>
  )
}
