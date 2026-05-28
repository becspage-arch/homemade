'use client'

import { useState, useTransition } from 'react'
import {
  completeOnboardingAction,
  skipOnboardingAction,
} from '@/lib/onboarding-actions'

import './onboarding-card.css'

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

const EXPERIENCE_OPTIONS: { value: ExperienceLevelLiteral; label: string }[] = [
  { value: 'BEGINNER', label: 'Just starting out' },
  { value: 'INTERMEDIATE', label: 'Making things for a while' },
  { value: 'CONFIDENT', label: 'I know my way around' },
]

const QUESTIONS = [
  'What are you drawn to?',
  "Anything you’d rather skip?",
  'Where are you at?',
]

export function OnboardingCard({ categories }: OnboardingCardProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [pickedCategories, setPickedCategories] = useState<string[]>([])
  const [pickedDietary, setPickedDietary] = useState<string[]>([])
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

  function handleContinue() {
    if (step < 2) {
      setStep((step + 1) as 1 | 2)
    }
  }

  function handleExperience(value: ExperienceLevelLiteral) {
    startTransition(async () => {
      await completeOnboardingAction({
        primaryCategoryIds: pickedCategories,
        dietaryFlags: pickedDietary,
        experienceLevel: value,
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

  const showContinue =
    step === 0
      ? pickedCategories.length > 0
      : step === 1
      ? true
      : false

  return (
    <section className="ob-card" aria-labelledby="ob-question">
      <div className="ob-header">
        <h2 id="ob-question" className="ob-question">
          {QUESTIONS[step]}
        </h2>
        <button
          type="button"
          className="ob-skip"
          onClick={handleSkip}
          disabled={isPending}
        >
          Skip for now
        </button>
      </div>

      <div className="ob-tiles-wrap">
        {step === 0 && (
          <div className="ob-tile-row">
            {categories.map((cat) => {
              const picked = pickedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`ob-tile${picked ? ' picked' : ''}`}
                  onClick={() => toggleCategory(cat.id)}
                  aria-pressed={picked}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        )}

        {step === 1 && (
          <div className="ob-tile-row">
            {DIETARY_OPTIONS.map((opt) => {
              const picked = pickedDietary.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`ob-tile${picked ? ' picked' : ''}`}
                  onClick={() => toggleDietary(opt.value)}
                  aria-pressed={picked}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        )}

        {step === 2 && (
          <div className="ob-tile-row">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="ob-tile ob-tile-experience"
                onClick={() => handleExperience(opt.value)}
                disabled={isPending}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showContinue && (
        <div className="ob-footer">
          <button
            type="button"
            className="ob-continue"
            onClick={handleContinue}
            disabled={isPending}
          >
            Continue
          </button>
        </div>
      )}
    </section>
  )
}
