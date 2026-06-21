import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { checkRecipeGate, getRecipeGateCopy } from '@/lib/recipes/premium-gates'
import {
  getWeekPlan,
  parseWeekStart,
  addDays,
  isoDate,
} from '@/lib/recipes/meal-plan'
import { MealPlanCalendar } from '@/components/public/recipes/meal-plan-calendar'
import { UpgradeBlock } from '@/components/premium/UpgradeBlock'

import './meal-plan.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Meal plan | Homemade',
  description: 'Plan your week from the Homemade recipe library.',
  path: '/meal-plan',
  ogType: 'website',
})

interface PageProps {
  searchParams: Promise<{ week?: string }>
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default async function MealPlanPage({ searchParams }: PageProps) {
  const user = await getCurrentDbUser()

  // A meal plan is saved per-user state, so it needs an account. Show a calm
  // sign-in prompt rather than a paywall (the MEAL_PLANNING gate is separate
  // and still off).
  if (!user) {
    return (
      <main className="meal-plan-page">
        <div className="meal-plan-signin">
          <h1 className="meal-plan-title">Plan your week</h1>
          <p>Sign in to save a weekly meal plan and build a shopping list from it.</p>
          <Link href="/sign-in" className="meal-plan-signin-cta">
            Sign in
          </Link>
        </div>
      </main>
    )
  }

  const gate = checkRecipeGate('MEAL_PLANNING', {
    signedIn: true,
    isPremium: hasPremium(user),
  })
  if (!gate.allowed) {
    const copy = getRecipeGateCopy('MEAL_PLANNING')
    return (
      <main className="meal-plan-page">
        <div className="meal-plan-signin">
          <h1 className="meal-plan-title">Plan your week</h1>
          <UpgradeBlock message={copy.message} rationale={copy.rationale} />
        </div>
      </main>
    )
  }

  const params = await searchParams
  const weekStart = parseWeekStart(params.week, new Date())
  const plan = await getWeekPlan(user.id, weekStart)

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return {
      dayOfWeek: i,
      iso: isoDate(date),
      dayNum: date.getUTCDate(),
      monthShort: MONTHS[date.getUTCMonth()]!.slice(0, 3),
    }
  })

  const last = addDays(weekStart, 6)
  const weekLabel =
    weekStart.getUTCMonth() === last.getUTCMonth()
      ? `${weekStart.getUTCDate()} to ${last.getUTCDate()} ${MONTHS[weekStart.getUTCMonth()]}`
      : `${weekStart.getUTCDate()} ${MONTHS[weekStart.getUTCMonth()]!.slice(0, 3)} to ${last.getUTCDate()} ${MONTHS[last.getUTCMonth()]!.slice(0, 3)}`

  const prevIso = isoDate(addDays(weekStart, -7))
  const nextIso = isoDate(addDays(weekStart, 7))

  return (
    <main className="meal-plan-page">
      <MealPlanCalendar
        weekStartIso={plan.weekStartIso}
        weekLabel={weekLabel}
        prevIso={prevIso}
        nextIso={nextIso}
        days={days}
        entries={plan.entries}
      />
    </main>
  )
}
