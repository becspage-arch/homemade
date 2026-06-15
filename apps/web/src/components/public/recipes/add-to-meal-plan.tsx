'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { addMealPlanEntry } from '@/lib/recipes/meal-plan-actions'
import { captureClientEvent } from '@/lib/client-analytics'

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
]

const MEALS = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snack' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'DRINK', label: 'Drink' },
  { value: 'SIDE', label: 'Side' },
  { value: 'OTHER', label: 'Other' },
]

/** Monday of the current week as YYYY-MM-DD, computed on the device. */
function thisMondayIso(): string {
  const now = new Date()
  const offset = (now.getDay() + 6) % 7 // 0 = Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const d = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Compact day + meal picker that slots the current recipe into the reader's
 * weekly plan. Signed-in only state (a meal plan is saved per account); an
 * anonymous reader who tries it gets a calm sign-in nudge from the server
 * action rather than a wall.
 */
export function AddToMealPlan({ tutorialSlug, tutorialId }: { tutorialSlug: string; tutorialId: string }) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(0)
  const [meal, setMeal] = useState('DINNER')
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'signin' | 'error'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function add() {
    setFeedback(null)
    startTransition(async () => {
      const res = await addMealPlanEntry({
        weekStartIso: thisMondayIso(),
        dayOfWeek: day,
        mealType: meal,
        tutorialSlug,
      })
      if (res.ok) {
        const label = DAYS.find((d) => d.value === day)?.label ?? ''
        setFeedback({ kind: 'ok', text: `Added to ${label}.` })
        captureClientEvent('meal_plan_recipe_added', { tutorialId, tutorialSlug })
      } else if (res.error === 'Sign in to plan meals.') {
        setFeedback({ kind: 'signin', text: 'Sign in to plan your week.' })
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'Could not add that.' })
      }
    })
  }

  return (
    <div className="add-to-plan">
      <button
        type="button"
        className="add-to-shopping-btn"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Add to meal plan
      </button>

      {open && (
        <div className="add-to-plan-picker">
          <label>
            <span>Day</span>
            <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Meal</span>
            <select value={meal} onChange={(e) => setMeal(e.target.value)}>
              {MEALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="add-to-shopping-btn" disabled={pending} onClick={add}>
            {pending ? 'Adding…' : 'Add'}
          </button>
        </div>
      )}

      {feedback && (
        <span className={`add-to-plan-feedback${feedback.kind === 'error' ? ' is-error' : ''}`}>
          {feedback.text}{' '}
          {feedback.kind === 'signin' && (
            <Link href="/sign-in" className="add-to-shopping-view">
              Sign in
            </Link>
          )}
          {feedback.kind === 'ok' && (
            <Link href="/meal-plan" className="add-to-shopping-view">
              View plan
            </Link>
          )}
        </span>
      )}
    </div>
  )
}
