'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

interface StashYarn {
  id: string
  label: string
  weightSlug?: string
  yardage?: number
  colourHex?: string
  colourName?: string
  leftoverYardage?: number
  notes?: string
}

interface StashHook {
  slug: string
  canonicalName: string
  mmSize: number
  ukSize: string | null
  usSize: string | null
}

interface YarnWeight {
  slug: string
  canonicalName: string
  standardCategory: number
}

interface Props {
  yarns: StashYarn[]
  hooks: StashHook[]
  allHooks: StashHook[]
  yarnWeights: YarnWeight[]
}

export function CrochetStashShell({ yarns, hooks, allHooks, yarnWeights }: Props) {
  const router = useRouter()
  const [addingYarn, setAddingYarn] = useState(false)
  const [addingHook, setAddingHook] = useState(false)
  const refresh = () => router.refresh()

  return (
    <div className="crochet-stash-page">
      <header className="crochet-stash-header">
        <p className="crochet-stash-overline">Crochet</p>
        <h1 className="crochet-stash-heading">Your stash.</h1>
        <p className="crochet-stash-lede">
          Yarns and hooks you own. New projects pre-fill from here so you spend less time hunting for
          a 4 mm Tulip and more time crocheting.
        </p>
      </header>

      <section className="crochet-stash-section">
        <div className="crochet-stash-section-header">
          <h2>Yarns</h2>
          <button
            type="button"
            className="crochet-stash-cta"
            onClick={() => setAddingYarn(true)}
          >
            <Plus size={14} strokeWidth={1.8} />
            <span>Add a yarn</span>
          </button>
        </div>

        {addingYarn && (
          <AddYarnForm
            yarnWeights={yarnWeights}
            onSaved={() => {
              setAddingYarn(false)
              refresh()
            }}
            onCancel={() => setAddingYarn(false)}
          />
        )}

        {yarns.length === 0 ? (
          <p className="crochet-stash-empty">No yarns logged yet.</p>
        ) : (
          <ul className="crochet-stash-grid">
            {yarns.map((y) => (
              <li key={y.id} className="crochet-stash-card">
                {y.colourHex && (
                  <span
                    className="crochet-stash-card-pip"
                    style={{ background: y.colourHex }}
                    aria-hidden
                  />
                )}
                <div className="crochet-stash-card-body">
                  <div className="crochet-stash-card-title">
                    {y.colourName ? `${y.colourName} ` : ''}
                    {y.label}
                  </div>
                  <div className="crochet-stash-card-sub">
                    {y.weightSlug && <span>{y.weightSlug.toUpperCase()}</span>}
                    {y.yardage != null && <span>{y.yardage} yds</span>}
                    {y.leftoverYardage != null && <span>{y.leftoverYardage} yds left</span>}
                  </div>
                  {y.notes && <p className="crochet-stash-card-notes">{y.notes}</p>}
                </div>
                <button
                  type="button"
                  className="crochet-stash-card-delete"
                  aria-label={`Remove ${y.label}`}
                  onClick={async () => {
                    if (!confirm(`Remove ${y.label} from your stash?`)) return
                    await fetch(`/api/me/crochet-stash/yarns/${y.id}`, { method: 'DELETE' })
                    refresh()
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="crochet-stash-section">
        <div className="crochet-stash-section-header">
          <h2>Hooks</h2>
          <button
            type="button"
            className="crochet-stash-cta"
            onClick={() => setAddingHook(true)}
          >
            <Plus size={14} strokeWidth={1.8} />
            <span>Add a hook</span>
          </button>
        </div>

        {addingHook && (
          <AddHookForm
            allHooks={allHooks}
            ownedSlugs={new Set(hooks.map((h) => h.slug))}
            onSaved={() => {
              setAddingHook(false)
              refresh()
            }}
            onCancel={() => setAddingHook(false)}
          />
        )}

        {hooks.length === 0 ? (
          <p className="crochet-stash-empty">No hooks logged yet.</p>
        ) : (
          <ul className="crochet-stash-grid">
            {hooks.map((h) => (
              <li key={h.slug} className="crochet-stash-card">
                <div className="crochet-stash-card-body">
                  <div className="crochet-stash-card-title">{h.canonicalName}</div>
                  <div className="crochet-stash-card-sub">
                    {h.ukSize && <span>UK {h.ukSize}</span>}
                    {h.usSize && <span>US {h.usSize}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  className="crochet-stash-card-delete"
                  aria-label={`Remove ${h.canonicalName}`}
                  onClick={async () => {
                    if (!confirm(`Remove ${h.canonicalName} from your stash?`)) return
                    await fetch(`/api/me/crochet-stash/hooks/${h.slug}`, { method: 'DELETE' })
                    refresh()
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function AddYarnForm({
  yarnWeights,
  onSaved,
  onCancel,
}: {
  yarnWeights: YarnWeight[]
  onSaved: () => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState('')
  const [colourName, setColourName] = useState('')
  const [colourHex, setColourHex] = useState('#9CAF88')
  const [weightSlug, setWeightSlug] = useState('')
  const [yardage, setYardage] = useState('')
  const [notes, setNotes] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async () => {
    if (!label.trim()) return
    setPending(true)
    try {
      const res = await fetch('/api/me/crochet-stash/yarns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          colourName: colourName.trim() || undefined,
          colourHex,
          weightSlug: weightSlug || undefined,
          yardage: yardage ? Number(yardage) : undefined,
          notes: notes.trim() || undefined,
        }),
      })
      if (res.ok) onSaved()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="crochet-stash-form">
      <label>
        <span>Yarn name</span>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Stylecraft Special DK" />
      </label>
      <label>
        <span>Colour</span>
        <input value={colourName} onChange={(e) => setColourName(e.target.value)} placeholder="Sage" />
      </label>
      <label>
        <span>Colour swatch</span>
        <input type="color" value={colourHex} onChange={(e) => setColourHex(e.target.value)} />
      </label>
      <label>
        <span>Weight</span>
        <select value={weightSlug} onChange={(e) => setWeightSlug(e.target.value)}>
          <option value="">—</option>
          {yarnWeights.map((w) => (
            <option key={w.slug} value={w.slug}>
              {w.canonicalName}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Yardage</span>
        <input
          type="number"
          min="0"
          step="1"
          value={yardage}
          onChange={(e) => setYardage(e.target.value)}
          placeholder="295"
        />
      </label>
      <label className="full">
        <span>Notes</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="A whole skein in my stash, plus half of another"
        />
      </label>
      <div className="crochet-stash-form-actions">
        <button type="button" className="primary" onClick={submit} disabled={pending || !label.trim()}>
          {pending ? 'Saving…' : 'Save yarn'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function AddHookForm({
  allHooks,
  ownedSlugs,
  onSaved,
  onCancel,
}: {
  allHooks: StashHook[]
  ownedSlugs: Set<string>
  onSaved: () => void
  onCancel: () => void
}) {
  const [slug, setSlug] = useState('')
  const [pending, setPending] = useState(false)
  const available = allHooks.filter((h) => !ownedSlugs.has(h.slug))

  const submit = async () => {
    if (!slug) return
    setPending(true)
    try {
      const res = await fetch('/api/me/crochet-stash/hooks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (res.ok) onSaved()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="crochet-stash-form">
      <label className="full">
        <span>Hook size</span>
        <select value={slug} onChange={(e) => setSlug(e.target.value)}>
          <option value="">Pick a size…</option>
          {available.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.canonicalName}
              {h.ukSize ? ` · UK ${h.ukSize}` : ''}
              {h.usSize ? ` · US ${h.usSize}` : ''}
            </option>
          ))}
        </select>
      </label>
      <div className="crochet-stash-form-actions">
        <button type="button" className="primary" onClick={submit} disabled={pending || !slug}>
          {pending ? 'Saving…' : 'Save hook'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
