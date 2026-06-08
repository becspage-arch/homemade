import { prisma, TutorialStatus } from '@homemade/db'
import { addWeeks, isoWeekStartUtc } from '@/lib/editorial-picks'
import {
  clearMagazinePickAction,
  setMagazinePickAction,
} from '@/lib/magazine-picks-actions'

export const dynamic = 'force-dynamic'

const WEEKS_AHEAD = 4
const POSITIONS = [1, 2, 3, 4]

function formatWeek(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

async function setFromFormAction(formData: FormData): Promise<void> {
  'use server'
  const categoryId = String(formData.get('categoryId') ?? '')
  const weekStartingIso = String(formData.get('weekStartingIso') ?? '')
  const position = Number(formData.get('position') ?? 0)
  const tutorialId = String(formData.get('tutorialId') ?? '')
  if (!categoryId || !weekStartingIso || !position || !tutorialId) return
  await setMagazinePickAction({
    categoryId,
    weekStartingIso,
    position,
    tutorialId,
  })
}

async function clearFromFormAction(formData: FormData): Promise<void> {
  'use server'
  const categoryId = String(formData.get('categoryId') ?? '')
  const weekStartingIso = String(formData.get('weekStartingIso') ?? '')
  const position = Number(formData.get('position') ?? 0)
  if (!categoryId || !weekStartingIso || !position) return
  await clearMagazinePickAction({ categoryId, weekStartingIso, position })
}

export default async function CategoryMagazinePicksPage() {
  const now = new Date()
  const startWeek = isoWeekStartUtc(now)
  const weeks: Date[] = []
  for (let i = 0; i < WEEKS_AHEAD; i += 1) {
    weeks.push(addWeeks(startWeek, i))
  }

  const recipeCategories = await prisma.category.findMany({
    where: { archetype: 'RECIPE', isPublicVisible: true },
    orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      tutorials: {
        where: { status: TutorialStatus.PUBLISHED },
        orderBy: { title: 'asc' },
        select: { id: true, title: true, slug: true },
      },
    },
  })

  const allPicks = await prisma.categoryMagazinePick.findMany({
    where: { weekStarting: { in: weeks } },
    include: {
      tutorial: { select: { id: true, title: true } },
    },
  })

  // Map [categoryId][weekIso][position] -> pick
  const lookup = new Map<string, Map<string, Map<number, typeof allPicks[number]>>>()
  for (const p of allPicks) {
    const byCategory = lookup.get(p.categoryId) ?? new Map()
    const byWeek = byCategory.get(p.weekStarting.toISOString()) ?? new Map()
    byWeek.set(p.position, p)
    byCategory.set(p.weekStarting.toISOString(), byWeek)
    lookup.set(p.categoryId, byCategory)
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280 }}>
      <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 28, margin: 0 }}>
        Recipe magazine picks
      </h1>
      <p style={{ fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)', marginTop: 8 }}>
        Pin a feature + up to three supporting tutorials per Recipe category per
        week. The feature is the large hero card; supporting cards render
        beside it. Empty positions fall back to the algorithmic most-loved
        EDITORIAL hero picker.
      </p>

      {recipeCategories.map((cat) => (
        <section
          key={cat.id}
          style={{
            marginTop: 32,
            padding: 20,
            border: '0.5px solid var(--color-linen-grey)',
            borderRadius: 12,
            background: 'var(--color-cream)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 22, margin: 0 }}>
            {cat.name}
          </h2>
          <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-warm-taupe)' }}>
            {cat.tutorials.length} published tutorials to choose from.
          </p>

          {weeks.map((week) => {
            const weekIso = week.toISOString()
            return (
              <div
                key={weekIso}
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: 'var(--color-soft-parchment)',
                  borderRadius: 10,
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, margin: 0, marginBottom: 12 }}>
                  Week of {formatWeek(week)}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                  {POSITIONS.map((position) => {
                    const existing = lookup.get(cat.id)?.get(weekIso)?.get(position) ?? null
                    return (
                      <div
                        key={position}
                        style={{
                          padding: 12,
                          background: 'var(--color-cream)',
                          borderRadius: 8,
                          border: '0.5px solid var(--color-linen-grey)',
                        }}
                      >
                        <p style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-sage)', margin: 0 }}>
                          {position === 1 ? 'Feature' : `Supporting ${position - 1}`}
                        </p>
                        <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: 14, margin: '6px 0 10px' }}>
                          {existing ? existing.tutorial.title : '(unpinned)'}
                        </p>

                        <form action={setFromFormAction} style={{ display: 'flex', gap: 6 }}>
                          <input type="hidden" name="categoryId" value={cat.id} />
                          <input type="hidden" name="weekStartingIso" value={weekIso} />
                          <input type="hidden" name="position" value={position} />
                          <select
                            name="tutorialId"
                            defaultValue={existing?.tutorialId ?? ''}
                            style={{
                              flex: 1,
                              fontFamily: 'var(--font-lora)',
                              fontSize: 12,
                              padding: 6,
                              border: '0.5px solid var(--color-linen-grey)',
                              borderRadius: 6,
                              background: 'var(--color-cream)',
                            }}
                          >
                            <option value="">Pick a tutorial…</option>
                            {cat.tutorials.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            style={{
                              fontFamily: 'var(--font-lora)',
                              fontSize: 12,
                              padding: '6px 10px',
                              background: 'var(--color-sage)',
                              color: 'var(--color-cream)',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                            }}
                          >
                            Set
                          </button>
                        </form>
                        {existing && (
                          <form action={clearFromFormAction} style={{ marginTop: 6 }}>
                            <input type="hidden" name="categoryId" value={cat.id} />
                            <input type="hidden" name="weekStartingIso" value={weekIso} />
                            <input type="hidden" name="position" value={position} />
                            <button
                              type="submit"
                              style={{
                                fontFamily: 'var(--font-lora)',
                                fontSize: 11,
                                padding: '4px 8px',
                                background: 'transparent',
                                border: '0.5px solid var(--color-warm-taupe)',
                                color: 'var(--color-warm-taupe)',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              Clear pin
                            </button>
                          </form>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
