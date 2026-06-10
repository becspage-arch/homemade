'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SewingPlanStatus } from '@homemade/db'
import type { InitialPlan } from './page'

const STATUS_OPTIONS: { value: SewingPlanStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'In progress' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Done' },
]

interface FabricRow {
  id: string
  name: string
  fabricType?: string
  widthCm?: number
  lengthCm?: number
  notes?: string
}

interface NotionRow {
  id: string
  name: string
  quantity?: number
  notes?: string
}

interface ThreadRow {
  id: string
  colour: string
  weight?: string
  notes?: string
}

interface StepRow {
  id: string
  stepText: string
  isComplete: boolean
  completedAt?: string | null
  notes?: string
}

interface CuttingPlanShape {
  layoutNotes?: string
  fabricWidthCm?: number
  totalLengthCm?: number
  pieceList?: string[]
}

function genId() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-4)
}

function asArray<T>(input: unknown): T[] {
  return Array.isArray(input) ? (input as T[]) : []
}

interface Props {
  initial: InitialPlan
}

export function PlanEditorShell({ initial }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initial.title)
  const [editingTitle, setEditingTitle] = useState(false)
  const [status, setStatus] = useState<SewingPlanStatus>(initial.status)
  const [fabricList, setFabricList] = useState<FabricRow[]>(asArray<FabricRow>(initial.fabricList))
  const [notionsList, setNotionsList] = useState<NotionRow[]>(asArray<NotionRow>(initial.notionsList))
  const [threadList, setThreadList] = useState<ThreadRow[]>(asArray<ThreadRow>(initial.threadList))
  const [stepsList, setStepsList] = useState<StepRow[]>(asArray<StepRow>(initial.stepsList))
  const [cuttingPlan, setCuttingPlan] = useState<CuttingPlanShape>(
    initial.cuttingPlan && typeof initial.cuttingPlan === 'object'
      ? (initial.cuttingPlan as CuttingPlanShape)
      : {},
  )
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<string>(initial.updatedAt)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current)
  }, [])

  const persist = useCallback(async (patch: Record<string, unknown>) => {
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/me/sewing-plans/${initial.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error('save failed')
      const data = await res.json()
      if (data?.plan?.updatedAt) setLastSavedAt(data.plan.updatedAt)
      setSaveStatus('saved')
      if (savedTimer.current) clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
    }
  }, [initial.id])

  function persistFabric(next: FabricRow[]) {
    setFabricList(next)
    void persist({ fabricList: next })
  }
  function persistNotions(next: NotionRow[]) {
    setNotionsList(next)
    void persist({ notionsList: next })
  }
  function persistThreads(next: ThreadRow[]) {
    setThreadList(next)
    void persist({ threadList: next })
  }
  function persistSteps(next: StepRow[]) {
    setStepsList(next)
    void persist({ stepsList: next })
  }
  function persistCutting(next: CuttingPlanShape) {
    setCuttingPlan(next)
    void persist({ cuttingPlan: next })
  }

  function handleTitleSave() {
    const trimmed = title.trim() || 'Untitled sewing plan'
    setTitle(trimmed)
    setEditingTitle(false)
    if (trimmed !== initial.title) {
      void persist({ title: trimmed })
    }
  }

  function handleStatusChange(next: SewingPlanStatus) {
    setStatus(next)
    void persist({ status: next })
  }

  async function handleArchive() {
    if (!confirm('Archive this plan? You can still view it from the archive filter on the list page.')) return
    const res = await fetch(`/api/me/sewing-plans/${initial.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/me/sewing-plans')
      router.refresh()
    }
  }

  return (
    <div className="pd-page">
      <div className="pd-toolbar">
        <Link href="/me/sewing-plans" className="pd-back">
          ← All plans
        </Link>
        <div className="pd-toolbar-right">
          <span className="pd-save-indicator" aria-live="polite">
            {saveStatus === 'saving' && 'Saving…'}
            {saveStatus === 'saved' && 'Saved'}
            {saveStatus === 'error' && 'Could not save. Try again.'}
            {saveStatus === 'idle' && (
              <span className="pd-save-muted">
                Saved {new Date(lastSavedAt).toLocaleTimeString()}
              </span>
            )}
          </span>
          <Link
            href={`/me/sewing-plans/${initial.id}/print`}
            className="pd-print-cta"
          >
            Print this plan
          </Link>
        </div>
      </div>

      <header className="pd-header">
        {editingTitle ? (
          <input
            className="pd-title-edit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave()
              if (e.key === 'Escape') {
                setTitle(initial.title)
                setEditingTitle(false)
              }
            }}
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="pd-title"
            onClick={() => setEditingTitle(true)}
            aria-label="Rename plan"
          >
            {title}
          </button>
        )}
        <div className="pd-status-row">
          <label className="pd-status-label" htmlFor="pd-status">
            Status
          </label>
          <select
            id="pd-status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as SewingPlanStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <FabricSection rows={fabricList} onChange={persistFabric} />
      <NotionsSection rows={notionsList} onChange={persistNotions} />
      <ThreadSection rows={threadList} onChange={persistThreads} />
      <CuttingSection plan={cuttingPlan} onChange={persistCutting} />
      <StepsSection rows={stepsList} onChange={persistSteps} />

      <section className="pd-section">
        <h2 className="pd-section-heading">Notes</h2>
        <textarea
          className="pd-notes"
          rows={5}
          defaultValue={notes}
          placeholder="Free notes. Fitting changes, fabric source, alterations you want next time."
          onBlur={(e) => {
            const trimmed = e.target.value.trim()
            setNotes(trimmed)
            void persist({ notes: trimmed })
          }}
        />
      </section>

      <div className="pd-danger">
        <button type="button" className="pd-archive" onClick={handleArchive}>
          Archive this plan
        </button>
      </div>
    </div>
  )
}

function FabricSection({
  rows,
  onChange,
}: {
  rows: FabricRow[]
  onChange: (next: FabricRow[]) => void
}) {
  function update(id: string, patch: Partial<FabricRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  function add() {
    onChange([...rows, { id: genId(), name: '' }])
  }
  function remove(id: string) {
    onChange(rows.filter((r) => r.id !== id))
  }

  return (
    <section className="pd-section">
      <div className="pd-section-header">
        <h2 className="pd-section-heading">Fabric</h2>
        <button type="button" className="pd-add" onClick={add}>
          Add fabric
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="pd-empty">No fabric listed yet.</p>
      ) : (
        <ul className="pd-rows">
          {rows.map((r) => (
            <li key={r.id} className="pd-row pd-row-fabric">
              <input
                placeholder="Linen, 140 g/m²"
                value={r.name}
                onChange={(e) => update(r.id, { name: e.target.value })}
              />
              <input
                placeholder="Type (woven, knit…)"
                value={r.fabricType ?? ''}
                onChange={(e) => update(r.id, { fabricType: e.target.value })}
              />
              <input
                type="number"
                placeholder="Width (cm)"
                value={r.widthCm ?? ''}
                onChange={(e) =>
                  update(r.id, {
                    widthCm: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <input
                type="number"
                placeholder="Length (cm)"
                value={r.lengthCm ?? ''}
                onChange={(e) =>
                  update(r.id, {
                    lengthCm: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <input
                placeholder="Notes"
                value={r.notes ?? ''}
                onChange={(e) => update(r.id, { notes: e.target.value })}
              />
              <button type="button" className="pd-remove" onClick={() => remove(r.id)} aria-label="Remove fabric">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function NotionsSection({
  rows,
  onChange,
}: {
  rows: NotionRow[]
  onChange: (next: NotionRow[]) => void
}) {
  function update(id: string, patch: Partial<NotionRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  function add() {
    onChange([...rows, { id: genId(), name: '' }])
  }
  function remove(id: string) {
    onChange(rows.filter((r) => r.id !== id))
  }

  return (
    <section className="pd-section">
      <div className="pd-section-header">
        <h2 className="pd-section-heading">Notions</h2>
        <button type="button" className="pd-add" onClick={add}>
          Add notion
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="pd-empty">No notions listed yet.</p>
      ) : (
        <ul className="pd-rows">
          {rows.map((r) => (
            <li key={r.id} className="pd-row pd-row-notion">
              <input
                placeholder="Buttons, 15 mm shell"
                value={r.name}
                onChange={(e) => update(r.id, { name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={r.quantity ?? ''}
                onChange={(e) =>
                  update(r.id, {
                    quantity: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <input
                placeholder="Notes"
                value={r.notes ?? ''}
                onChange={(e) => update(r.id, { notes: e.target.value })}
              />
              <button type="button" className="pd-remove" onClick={() => remove(r.id)} aria-label="Remove notion">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ThreadSection({
  rows,
  onChange,
}: {
  rows: ThreadRow[]
  onChange: (next: ThreadRow[]) => void
}) {
  function update(id: string, patch: Partial<ThreadRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  function add() {
    onChange([...rows, { id: genId(), colour: '' }])
  }
  function remove(id: string) {
    onChange(rows.filter((r) => r.id !== id))
  }

  return (
    <section className="pd-section">
      <div className="pd-section-header">
        <h2 className="pd-section-heading">Thread</h2>
        <button type="button" className="pd-add" onClick={add}>
          Add thread
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="pd-empty">No thread listed yet.</p>
      ) : (
        <ul className="pd-rows">
          {rows.map((r) => (
            <li key={r.id} className="pd-row pd-row-thread">
              <input
                placeholder="Colour"
                value={r.colour}
                onChange={(e) => update(r.id, { colour: e.target.value })}
              />
              <input
                placeholder="Weight (50, 60…)"
                value={r.weight ?? ''}
                onChange={(e) => update(r.id, { weight: e.target.value })}
              />
              <input
                placeholder="Notes"
                value={r.notes ?? ''}
                onChange={(e) => update(r.id, { notes: e.target.value })}
              />
              <button type="button" className="pd-remove" onClick={() => remove(r.id)} aria-label="Remove thread">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CuttingSection({
  plan,
  onChange,
}: {
  plan: CuttingPlanShape
  onChange: (next: CuttingPlanShape) => void
}) {
  function update(patch: Partial<CuttingPlanShape>) {
    onChange({ ...plan, ...patch })
  }
  function addPiece() {
    update({ pieceList: [...(plan.pieceList ?? []), ''] })
  }
  function updatePiece(i: number, value: string) {
    const next = [...(plan.pieceList ?? [])]
    next[i] = value
    update({ pieceList: next })
  }
  function removePiece(i: number) {
    const next = [...(plan.pieceList ?? [])]
    next.splice(i, 1)
    update({ pieceList: next })
  }

  return (
    <section className="pd-section">
      <h2 className="pd-section-heading">Cutting plan</h2>
      <p className="pd-section-sub">
        Sketch out the layout, fabric width, and pieces. Promotes into the layout planner later.
      </p>
      <div className="pd-cutting-fields">
        <label className="pd-cutting-input">
          <span>Fabric width (cm)</span>
          <input
            type="number"
            defaultValue={plan.fabricWidthCm ?? ''}
            onBlur={(e) =>
              update({ fabricWidthCm: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </label>
        <label className="pd-cutting-input">
          <span>Total length needed (cm)</span>
          <input
            type="number"
            defaultValue={plan.totalLengthCm ?? ''}
            onBlur={(e) =>
              update({ totalLengthCm: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </label>
      </div>
      <label className="pd-cutting-notes">
        <span>Layout notes</span>
        <textarea
          rows={3}
          defaultValue={plan.layoutNotes ?? ''}
          placeholder="Single-layer layout, fold on the cross-grain, lay out the bodice front first."
          onBlur={(e) => update({ layoutNotes: e.target.value.trim() || undefined })}
        />
      </label>
      <div className="pd-pieces">
        <div className="pd-section-header pd-pieces-header">
          <h3>Pieces</h3>
          <button type="button" className="pd-add" onClick={addPiece}>
            Add piece
          </button>
        </div>
        {(plan.pieceList ?? []).length === 0 ? (
          <p className="pd-empty">No pieces listed yet.</p>
        ) : (
          <ul className="pd-rows">
            {(plan.pieceList ?? []).map((piece, i) => (
              <li key={i} className="pd-row pd-row-piece">
                <input
                  placeholder="Bodice front (cut 1 on fold)"
                  value={piece}
                  onChange={(e) => updatePiece(i, e.target.value)}
                />
                <button type="button" className="pd-remove" onClick={() => removePiece(i)} aria-label="Remove piece">
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function StepsSection({
  rows,
  onChange,
}: {
  rows: StepRow[]
  onChange: (next: StepRow[]) => void
}) {
  function update(id: string, patch: Partial<StepRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  function add() {
    onChange([...rows, { id: genId(), stepText: '', isComplete: false }])
  }
  function remove(id: string) {
    onChange(rows.filter((r) => r.id !== id))
  }
  function move(id: string, direction: -1 | 1) {
    const idx = rows.findIndex((r) => r.id === id)
    if (idx === -1) return
    const target = idx + direction
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    const [item] = next.splice(idx, 1)
    if (!item) return
    next.splice(target, 0, item)
    onChange(next)
  }
  function toggle(id: string) {
    onChange(
      rows.map((r) =>
        r.id === id
          ? {
              ...r,
              isComplete: !r.isComplete,
              completedAt: !r.isComplete ? new Date().toISOString() : null,
            }
          : r,
      ),
    )
  }

  const completed = rows.filter((r) => r.isComplete).length

  return (
    <section className="pd-section">
      <div className="pd-section-header">
        <h2 className="pd-section-heading">Steps</h2>
        <button type="button" className="pd-add" onClick={add}>
          Add step
        </button>
      </div>
      {rows.length > 0 && (
        <p className="pd-section-sub">
          {completed} of {rows.length} done.
        </p>
      )}
      {rows.length === 0 ? (
        <p className="pd-empty">No steps yet. Add the first one to start tracking your progress.</p>
      ) : (
        <ul className="pd-steps">
          {rows.map((r, i) => (
            <li key={r.id} className={`pd-step ${r.isComplete ? 'is-complete' : ''}`}>
              <input
                type="checkbox"
                checked={r.isComplete}
                onChange={() => toggle(r.id)}
                aria-label="Mark step complete"
              />
              <div className="pd-step-body">
                <textarea
                  rows={1}
                  value={r.stepText}
                  onChange={(e) => update(r.id, { stepText: e.target.value })}
                  placeholder="Step description"
                />
                <textarea
                  className="pd-step-notes"
                  rows={1}
                  defaultValue={r.notes ?? ''}
                  onBlur={(e) => update(r.id, { notes: e.target.value.trim() || undefined })}
                  placeholder="Notes (optional)"
                />
              </div>
              <div className="pd-step-actions">
                <button type="button" onClick={() => move(r.id, -1)} disabled={i === 0} aria-label="Move up">
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(r.id, 1)}
                  disabled={i === rows.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="pd-remove"
                  onClick={() => remove(r.id)}
                  aria-label="Remove step"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
