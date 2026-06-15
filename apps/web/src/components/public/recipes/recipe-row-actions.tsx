'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  deleteUserRecipe,
  setUserRecipeVisibility,
  resubmitUserRecipe,
} from '@/lib/recipes/user-recipe-actions'
import { VISIBILITY_OPTIONS } from '@/lib/recipes/recipe-vocab'

interface Props {
  id: string
  status: string
  visibility: string
}

export function RecipeRowActions({ id, status, visibility }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  function refresh(): void {
    router.refresh()
  }

  function onDelete(): void {
    setError(null)
    startTransition(async () => {
      const res = await deleteUserRecipe(id)
      if (!res.ok) setError(res.error ?? 'Could not delete.')
      else refresh()
    })
  }

  function onVisibility(value: string): void {
    setError(null)
    startTransition(async () => {
      const res = await setUserRecipeVisibility(id, value)
      if (!res.ok) setError(res.error ?? 'Could not update.')
      else refresh()
    })
  }

  function onResubmit(): void {
    setError(null)
    startTransition(async () => {
      const res = await resubmitUserRecipe(id)
      if (!res.ok) setError(res.error ?? 'Could not send for review.')
      else refresh()
    })
  }

  const canResubmit = status === 'DRAFT' || status === 'REJECTED'

  return (
    <div className="recipe-row-actions">
      <Link href={`/me/recipes/${id}/edit`} className="recipe-row-action">
        Edit
      </Link>

      <label className="recipe-row-visibility">
        <span className="recipe-row-visibility-label">Visibility</span>
        <select
          value={visibility}
          disabled={pending}
          onChange={(e) => onVisibility(e.target.value)}
        >
          {VISIBILITY_OPTIONS.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </label>

      {canResubmit && (
        <button type="button" className="recipe-row-action" disabled={pending} onClick={onResubmit}>
          Send for review
        </button>
      )}

      {confirming ? (
        <span className="recipe-row-confirm">
          <span>Delete?</span>
          <button type="button" className="recipe-row-action danger" disabled={pending} onClick={onDelete}>
            Yes
          </button>
          <button type="button" className="recipe-row-action" onClick={() => setConfirming(false)}>
            No
          </button>
        </span>
      ) : (
        <button
          type="button"
          className="recipe-row-action danger"
          disabled={pending}
          onClick={() => setConfirming(true)}
        >
          Delete
        </button>
      )}

      {error && <span className="me-feedback error">{error}</span>}
    </div>
  )
}
