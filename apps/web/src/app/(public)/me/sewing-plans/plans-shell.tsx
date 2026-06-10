'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SewingPlanStatus } from '@homemade/db'
import type { PlanSummary } from './page'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'ACTIVE', label: 'In progress' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'PAUSED', label: 'Paused' },
  { key: 'COMPLETED', label: 'Done' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

const STATUS_LABEL: Record<SewingPlanStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'In progress',
  PAUSED: 'Paused',
  COMPLETED: 'Done',
  ARCHIVED: 'Archived',
}

interface Props {
  initial: PlanSummary[]
}

export function PlansShell({ initial }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [pending, setPending] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'all') return initial
    return initial.filter((p) => p.status === filter)
  }, [initial, filter])

  async function createPlan() {
    const title = newTitle.trim() || 'Untitled sewing plan'
    setPending(true)
    try {
      const res = await fetch('/api/me/sewing-plans', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error('create failed')
      const data = await res.json()
      if (data?.plan?.id) {
        router.push(`/me/sewing-plans/${data.plan.id}`)
      } else {
        setCreating(false)
        setNewTitle('')
        router.refresh()
      }
    } catch {
      setPending(false)
    }
  }

  return (
    <div className="sp-page">
      <header className="sp-header">
        <div className="sp-header-text">
          <p className="sp-overline">Sewing</p>
          <h1 className="sp-heading">Your sewing plans</h1>
          <p className="sp-lede">
            Project plans for your sewing, with materials, cutting, steps, and notes in one place.
            Save them, print them, work from them.
          </p>
        </div>
        <button
          type="button"
          className="sp-new-cta"
          onClick={() => setCreating(true)}
        >
          Start a plan
        </button>
      </header>

      {creating && (
        <div className="sp-new-form">
          <label htmlFor="sp-new-title">Plan title</label>
          <input
            id="sp-new-title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Linen wrap dress"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') void createPlan()
              if (e.key === 'Escape') {
                setCreating(false)
                setNewTitle('')
              }
            }}
          />
          <div className="sp-new-form-actions">
            <button
              type="button"
              className="primary"
              onClick={() => void createPlan()}
              disabled={pending}
            >
              {pending ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false)
                setNewTitle('')
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <nav className="sp-filters" aria-label="Filter sewing plans">
        {FILTERS.map((f) => (
          <button
            type="button"
            key={f.key}
            className={filter === f.key ? 'active' : ''}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <div className="sp-empty">
          {filter === 'all'
            ? 'No plans yet. Start one to keep your project together, with materials, cutting, steps, and notes in one place.'
            : 'Nothing here.'}
        </div>
      ) : (
        <ul className="sp-grid">
          {filtered.map((p) => (
            <li key={p.id} className="sp-card">
              <Link href={`/me/sewing-plans/${p.id}`} className="sp-card-link">
                <div className="sp-card-status">{STATUS_LABEL[p.status]}</div>
                <div className="sp-card-title">{p.title}</div>
                <div className="sp-card-meta">
                  Updated {new Date(p.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
