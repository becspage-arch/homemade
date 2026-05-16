'use client'

import { useState, useTransition } from 'react'
import { updateCookingModeAutoEnable } from '@/lib/user-state-actions'

const CATEGORY_OPTIONS: { key: string; label: string; help: string }[] = [
  {
    key: 'project_schedule',
    label: 'Project schedule reminders',
    help: 'Sourdough feeding, marinade timings, plant care nudges.',
  },
  {
    key: 'moderation_outcome',
    label: 'Moderation outcomes',
    help: 'When your photo, review, or question is approved or removed.',
  },
  {
    key: 'creator_application',
    label: 'Creator + tester programme',
    help: 'Application status, tutorial reviews, feedback.',
  },
  {
    key: 'weekly_digest',
    label: 'Weekly digest',
    help: "What's in season and a few new picks.",
  },
]

interface Props {
  initialCookingModeAutoEnable: boolean
  initialPushEnabled: boolean
  initialCategories: string[]
}

export function PushSettings({
  initialCookingModeAutoEnable,
  initialPushEnabled,
  initialCategories,
}: Props) {
  const [cookingAuto, setCookingAuto] = useState(initialCookingModeAutoEnable)
  const [pushEnabled, setPushEnabled] = useState(initialPushEnabled)
  const [categories, setCategories] = useState<string[]>(
    initialCategories.length > 0
      ? initialCategories
      : CATEGORY_OPTIONS.map((c) => c.key),
  )
  const [status, setStatus] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const toggleCooking = (next: boolean) => {
    setCookingAuto(next)
    startTransition(async () => {
      await updateCookingModeAutoEnable(next)
    })
  }

  const toggleCategory = async (key: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...categories, key]))
      : categories.filter((c) => c !== key)
    setCategories(next)
    try {
      const res = await fetch('/api/me/push/categories', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ categories: next }),
      })
      if (!res.ok) throw new Error('Save failed')
      setStatus('saved.')
    } catch {
      setStatus('Could not save. Try again.')
    }
  }

  const disablePush = async () => {
    setStatus('Turning off…')
    try {
      const res = await fetch('/api/me/push/unregister', { method: 'POST' })
      if (!res.ok) throw new Error('failed')
      setPushEnabled(false)
      setStatus('Push notifications off.')
    } catch {
      setStatus('Could not disable. Try again.')
    }
  }

  return (
    <div className="me-form" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label className="me-toggle">
        <input
          type="checkbox"
          checked={cookingAuto}
          onChange={(e) => toggleCooking(e.target.checked)}
        />
        <span>Open recipes in cooking mode on mobile</span>
      </label>

      <div style={{ borderTop: '0.5px solid var(--color-linen-grey)', paddingTop: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, margin: '0 0 8px', color: 'var(--color-sage)' }}>
          Push notifications
        </h3>
        {!pushEnabled ? (
          <p className="me-feedback">
            Push notifications are off. Turn them on from the prompt that
            appears after you start your first project, or from the app
            settings on your device.
          </p>
        ) : (
          <>
            <p className="me-feedback" style={{ marginBottom: 12 }}>
              Choose what you&apos;d like to hear about.
            </p>
            {CATEGORY_OPTIONS.map((opt) => {
              const on = categories.includes(opt.key)
              return (
                <label
                  key={opt.key}
                  className="me-toggle"
                  style={{ marginBottom: 10, alignItems: 'flex-start' }}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => toggleCategory(opt.key, e.target.checked)}
                  />
                  <span>
                    <strong style={{ display: 'block', fontWeight: 500 }}>
                      {opt.label}
                    </strong>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--color-warm-taupe)',
                        display: 'block',
                        marginTop: 2,
                      }}
                    >
                      {opt.help}
                    </span>
                  </span>
                </label>
              )
            })}
            <button
              type="button"
              className="me-button secondary"
              style={{ marginTop: 8 }}
              onClick={disablePush}
            >
              Turn off all push notifications
            </button>
          </>
        )}
        {status && <p className="me-feedback" style={{ marginTop: 8 }}>{status}</p>}
      </div>
    </div>
  )
}
