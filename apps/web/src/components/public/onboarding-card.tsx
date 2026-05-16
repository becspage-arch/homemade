'use client'

import { useState, useTransition } from 'react'
import {
  completeOnboardingAction,
  skipOnboardingAction,
} from '@/lib/onboarding-actions'

import './onboarding-card.css'

// String literals matching the Prisma `ExperienceLevel` enum. Mirrored on the
// client so the bundle doesn't drag in `@homemade/db` (and therefore Prisma).
type ExperienceLevelLiteral = 'BEGINNER' | 'INTERMEDIATE' | 'CONFIDENT'

interface CategoryOption {
  id: string
  name: string
  slug: string
}

interface OnboardingCardProps {
  categories: CategoryOption[]
}

const DIETARY_OPTIONS: { value: string; label: string }[] = [
  { value: 'vegan', label: 'vegan' },
  { value: 'vegetarian', label: 'vegetarian' },
  { value: 'glutenFree', label: 'gluten-free' },
  { value: 'dairyFree', label: 'dairy-free' },
  { value: 'nutFree', label: 'nut allergy' },
  { value: 'halal', label: 'halal' },
  { value: 'kosher', label: 'kosher' },
  { value: 'pescatarian', label: 'pescatarian' },
]

const EXPERIENCE_OPTIONS: {
  value: ExperienceLevelLiteral
  label: string
  caption: string
}[] = [
  {
    value: 'BEGINNER',
    label: 'Just starting',
    caption: 'I want clear, step-by-step guidance.',
  },
  {
    value: 'INTERMEDIATE',
    label: 'Making things for a while',
    caption: 'I know my way around but still pick up tips.',
  },
  {
    value: 'CONFIDENT',
    label: 'I know my way around',
    caption: 'Just give me the recipe.',
  },
]

export function OnboardingCard({ categories }: OnboardingCardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [pickedCategories, setPickedCategories] = useState<string[]>([])
  const [pickedDietary, setPickedDietary] = useState<string[]>([])
  const [experience, setExperience] = useState<ExperienceLevelLiteral | null>(null)
  const [isPending, startTransition] = useTransition()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  function toggleCategory(id: string) {
    setPickedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  function toggleDietary(value: string) {
    setPickedDietary((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    )
  }

  function handleSubmit() {
    startTransition(async () => {
      await completeOnboardingAction({
        primaryCategoryIds: pickedCategories,
        dietaryFlags: pickedDietary,
        experienceLevel: experience,
      })
      setDismissed(true)
    })
  }

  function handleSkip() {
    startTransition(async () => {
      await skipOnboardingAction()
      setDismissed(true)
    })
  }

  return (
    <section className="onboarding-card" aria-labelledby="onboarding-heading">
      <header className="onboarding-card-header">
        <h2 id="onboarding-heading" className="onboarding-card-title">
          Welcome.
        </h2>
      </header>

      <ol className="onboarding-steps" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <li
            key={n}
            className={`onboarding-step-dot${step === n ? ' active' : ''}${step > n ? ' done' : ''}`}
          />
        ))}
      </ol>

      {step === 1 && (
        <div className="onboarding-step-body">
          <p className="onboarding-step-label">
            Step 1 of 3 · What you&apos;re interested in
          </p>
          <div className="onboarding-category-grid">
            {categories.map((cat) => {
              const picked = pickedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`onboarding-category-button${picked ? ' picked' : ''}`}
                  onClick={() => toggleCategory(cat.id)}
                  aria-pressed={picked}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-step-body">
          <p className="onboarding-step-label">
            Step 2 of 3 · Anything to avoid
          </p>
          <p className="onboarding-step-hint">
            Recipes that need any of these will sit lower for you.
          </p>
          <div className="onboarding-dietary-grid">
            {DIETARY_OPTIONS.map((opt) => {
              const picked = pickedDietary.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`onboarding-chip${picked ? ' picked' : ''}`}
                  onClick={() => toggleDietary(opt.value)}
                  aria-pressed={picked}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="onboarding-step-body">
          <p className="onboarding-step-label">
            Step 3 of 3 · How much you already know
          </p>
          <div className="onboarding-experience-grid">
            {EXPERIENCE_OPTIONS.map((opt) => {
              const picked = experience === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`onboarding-experience-card${picked ? ' picked' : ''}`}
                  onClick={() => setExperience(opt.value)}
                  aria-pressed={picked}
                >
                  <span className="onboarding-experience-label">
                    {opt.label}
                  </span>
                  <span className="onboarding-experience-caption">
                    {opt.caption}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <footer className="onboarding-card-footer">
        <button
          type="button"
          className="onboarding-skip"
          onClick={handleSkip}
          disabled={isPending}
        >
          Skip
        </button>
        <div className="onboarding-card-cta-row">
          {step > 1 && (
            <button
              type="button"
              className="onboarding-back"
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              disabled={isPending}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              className="onboarding-next"
              onClick={() => setStep((step + 1) as 1 | 2 | 3)}
              disabled={isPending}
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              className="onboarding-next"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? 'Saving…' : 'Begin'}
            </button>
          )}
        </div>
      </footer>
    </section>
  )
}
