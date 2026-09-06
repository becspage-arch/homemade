'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

import { StashGrid, StashCard } from '@/components/stash/StashGrid'

interface StashFloss {
  id: string
  brand: string | null
  code: string | null
  name: string | null
  colourRgb: string | null
  quantityOwned: number
  notes: string | null
}

interface Props {
  craft: string
  stash: StashFloss[]
}

const BRANDS = [
  { value: 'DMC', label: 'DMC' },
  { value: 'ANCHOR', label: 'Anchor' },
  { value: 'MADEIRA', label: 'Madeira' },
]

function brandLabel(brand: string | null): string {
  return BRANDS.find((b) => b.value === brand)?.label ?? (brand ?? '')
}

function fmt(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}

export function FlossStashShell({ craft, stash }: Props) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [pending, start] = useTransition()
  const refresh = () => router.refresh()

  const remove = (item: StashFloss) => {
    const label = `${brandLabel(item.brand)} ${item.code ?? ''}`.trim()
    if (!confirm(`Remove ${label} from your stash?`)) return
    start(async () => {
      await fetch(`/api/studio/planner/stash/${item.id}`, { method: 'DELETE' })
      refresh()
    })
  }

  const setQuantity = (item: StashFloss, quantityOwned: number) => {
    start(async () => {
      await fetch(`/api/studio/planner/stash/${item.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quantityOwned }),
      })
      refresh()
    })
  }

  return (
    <div className="floss-stash-page">
      <header className="floss-stash-header">
        <p className="floss-stash-overline">Cross-stitch</p>
        <h1 className="floss-stash-heading">Your floss stash.</h1>
        <p className="floss-stash-lede">
          The colours already in your drawer. Every pattern page counts its palette against
          this list and shows you the short list of what is left to buy.
        </p>
      </header>

      <section className="floss-stash-section">
        <div className="floss-stash-section-header">
          <h2>Floss</h2>
          <button type="button" className="floss-stash-cta" onClick={() => setAdding(true)}>
            <Plus size={14} strokeWidth={1.8} />
            <span>Add a colour</span>
          </button>
        </div>

        {adding && (
          <AddFlossForm
            craft={craft}
            onSaved={() => {
              setAdding(false)
              refresh()
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        <p className="floss-stash-note">
          Use the code printed on the skein band. DMC, Anchor and Madeira all work: a chart
          written in one brand is matched to your stash in another through the published
          conversion charts.
        </p>

        {stash.length === 0 ? (
          <p className="floss-stash-empty">No floss logged yet.</p>
        ) : (
          <StashGrid>
            {stash.map((item) => (
              <StashCard key={item.id} className="floss-stash-card-inner">
                <span
                  className="floss-stash-card-pip"
                  style={{ background: item.colourRgb ?? 'transparent' }}
                  aria-hidden
                />
                <div className="floss-stash-card-body">
                  <div className="floss-stash-card-title">
                    {brandLabel(item.brand)} {item.code}
                  </div>
                  {item.name && <div className="floss-stash-card-name">{item.name}</div>}
                  <label className="floss-stash-card-qty">
                    <span>Skeins</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      defaultValue={fmt(item.quantityOwned)}
                      disabled={pending}
                      onBlur={(e) => {
                        const next = Number(e.target.value)
                        if (!Number.isFinite(next) || next < 0) return
                        if (next === item.quantityOwned) return
                        setQuantity(item, next)
                      }}
                    />
                  </label>
                  {item.notes && <p className="floss-stash-card-notes">{item.notes}</p>}
                </div>
                <button
                  type="button"
                  className="floss-stash-card-delete"
                  aria-label={`Remove ${brandLabel(item.brand)} ${item.code ?? ''} from your stash`}
                  disabled={pending}
                  onClick={() => remove(item)}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </StashCard>
            ))}
          </StashGrid>
        )}
      </section>

      <p className="floss-stash-footer">
        Planning several projects at once? The{' '}
        <Link href="/me/planner">project planner</Link> adds up the floss across everything
        in your queue and takes your stash off the total.
      </p>
    </div>
  )
}

function AddFlossForm({
  craft,
  onSaved,
  onCancel,
}: {
  craft: string
  onSaved: () => void
  onCancel: () => void
}) {
  const [brand, setBrand] = useState('DMC')
  const [code, setCode] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const trimmed = code.trim()
    if (!trimmed) return
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/studio/planner/stash', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          craft,
          brand,
          code: trimmed,
          quantityOwned: Number(quantity) || 1,
          notes: notes.trim() || undefined,
        }),
      })
      if (res.ok) {
        onSaved()
        return
      }
      setError('That did not save. Check the code and try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="floss-stash-form">
      <label>
        <span>Brand</span>
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          {BRANDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Code</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="310"
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
      </label>
      <label>
        <span>Skeins</span>
        <input
          type="number"
          min="0"
          step="0.5"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </label>
      <label>
        <span>Notes</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Half a skein left"
        />
      </label>
      {error && (
        <p className="floss-stash-form-error" role="alert">
          {error}
        </p>
      )}
      <div className="floss-stash-form-actions">
        <button
          type="button"
          className="primary"
          onClick={submit}
          disabled={pending || !code.trim()}
        >
          {pending ? 'Saving…' : 'Save colour'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
