'use client'

/**
 * KnittingStashClient — the maker's yarn + needle inventory grid.
 *
 * v1 backs entries with localStorage so the page works today; once
 * the K-4 KnittingStash model lands the persistence layer swaps to
 * the API without touching the UI. The stash shape lives in
 * `./stash-types.ts` and is reused by the future crochet stash so
 * the refactor to a shared `<StashGrid />` is one straightforward
 * step.
 *
 * Stash entries are immutable rows of:
 *   - kind: 'yarn' | 'needle'
 *   - yarn: label + weightSlug + colour + skeins + yardage/skein
 *   - needle: label + mmSize + style (straight / circular / DPN)
 *
 * Projects-in-queue assignment is K-4: the matching UI needs the
 * KnittingProjectProgress + yarn-substitution rules to wire up.
 */

import { useCallback, useState } from 'react'
import { Plus, Circle, Ruler, Trash2 } from 'lucide-react'

import { StashGrid, StashCard } from './StashGrid'
import './stash.css'

type StashKind = 'yarn' | 'needle'

interface YarnEntry {
  id: string
  kind: 'yarn'
  label: string
  weightSlug: string | null
  colourName: string | null
  colourHex: string | null
  yardagePerSkein: number | null
  skeins: number | null
  notes: string | null
  addedAt: string
}

interface NeedleEntry {
  id: string
  kind: 'needle'
  label: string
  mmSize: number
  style: 'STRAIGHT' | 'CIRCULAR' | 'DPN' | 'INTERCHANGEABLE'
  length: number | null
  notes: string | null
  addedAt: string
}

type StashEntry = YarnEntry | NeedleEntry

const STORAGE_KEY = 'knitting-stash:entries'

interface YarnWeight {
  slug: string
  canonicalName: string
  standardCategory: number
}

interface NeedleRef {
  slug: string
  mmSize: number
  canonicalName: string
  ukSize: string | null
  usSize: string | null
}

interface Props {
  yarnWeights: YarnWeight[]
  needles: NeedleRef[]
}

export function KnittingStashClient({ yarnWeights, needles }: Props) {
  const [entries, setEntries] = useState<StashEntry[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as StashEntry[]) : []
    } catch {
      return []
    }
  })
  const [addKind, setAddKind] = useState<StashKind | null>(null)

  const persist = useCallback((next: StashEntry[]) => {
    setEntries(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }, [])

  const removeEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id))
  }

  const addEntry = (entry: StashEntry) => {
    persist([entry, ...entries])
    setAddKind(null)
  }

  const yarnEntries = entries.filter((e): e is YarnEntry => e.kind === 'yarn')
  const needleEntries = entries.filter((e): e is NeedleEntry => e.kind === 'needle')

  return (
    <div className="stash-page">
      <header className="stash-page-header">
        <p className="stash-page-overline">My stash</p>
        <h1 className="stash-page-heading">Knitting stash</h1>
        <p className="stash-page-lede">
          The yarn and needles you have on hand. Match them to patterns from your
          Make it list when you&apos;re ready to start.
        </p>
      </header>

      <div className="stash-page-add-buttons">
        <button
          type="button"
          className="stash-page-add-button"
          onClick={() => setAddKind('yarn')}
        >
          <Plus size={14} /> Add yarn
        </button>
        <button
          type="button"
          className="stash-page-add-button"
          onClick={() => setAddKind('needle')}
        >
          <Plus size={14} /> Add needles
        </button>
      </div>

      {addKind === 'yarn' && (
        <AddYarnForm
          yarnWeights={yarnWeights}
          onCancel={() => setAddKind(null)}
          onSubmit={addEntry}
        />
      )}
      {addKind === 'needle' && (
        <AddNeedleForm
          needles={needles}
          onCancel={() => setAddKind(null)}
          onSubmit={addEntry}
        />
      )}

      <section className="stash-section">
        <h2 className="stash-section-heading">
          <Circle size={16} /> Yarn ({yarnEntries.length})
        </h2>
        {yarnEntries.length === 0 ? (
          <p className="stash-empty">No yarn in your stash yet.</p>
        ) : (
          <StashGrid>
            {yarnEntries.map((entry) => (
              <StashCard key={entry.id}>
                <div className="stash-card-row stash-card-row-yarn">
                  {entry.colourHex && (
                    <span
                      className="stash-card-colour-pip"
                      style={{ background: entry.colourHex }}
                      aria-hidden
                    />
                  )}
                  <div className="stash-card-title">{entry.label}</div>
                  <button
                    type="button"
                    className="stash-card-delete"
                    onClick={() => removeEntry(entry.id)}
                    aria-label={`Remove ${entry.label}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="stash-card-meta">
                  {entry.colourName ? `${entry.colourName} · ` : ''}
                  {entry.weightSlug
                    ? yarnWeights.find((w) => w.slug === entry.weightSlug)
                        ?.canonicalName ?? entry.weightSlug
                    : 'Weight not set'}
                </div>
                <div className="stash-card-meta">
                  {entry.skeins ?? '?'} skein{entry.skeins === 1 ? '' : 's'}
                  {entry.yardagePerSkein
                    ? ` · ${entry.yardagePerSkein} yd / skein`
                    : ''}
                  {entry.yardagePerSkein && entry.skeins
                    ? ` · ${entry.skeins * entry.yardagePerSkein} yd total`
                    : ''}
                </div>
              </StashCard>
            ))}
          </StashGrid>
        )}
      </section>

      <section className="stash-section">
        <h2 className="stash-section-heading">
          <Ruler size={16} /> Needles ({needleEntries.length})
        </h2>
        {needleEntries.length === 0 ? (
          <p className="stash-empty">No needles in your stash yet.</p>
        ) : (
          <StashGrid>
            {needleEntries.map((entry) => (
              <StashCard key={entry.id}>
                <div className="stash-card-row">
                  <div className="stash-card-title">{entry.label}</div>
                  <button
                    type="button"
                    className="stash-card-delete"
                    onClick={() => removeEntry(entry.id)}
                    aria-label={`Remove ${entry.label}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="stash-card-meta">
                  {entry.mmSize} mm · {styleLabel(entry.style)}
                  {entry.length ? ` · ${entry.length} cm` : ''}
                </div>
              </StashCard>
            ))}
          </StashGrid>
        )}
      </section>

      <p className="stash-page-footer-note">
        Sync to your account is coming. For now, your stash lives in this browser.
      </p>
    </div>
  )
}

function styleLabel(s: NeedleEntry['style']): string {
  switch (s) {
    case 'STRAIGHT':
      return 'straight'
    case 'CIRCULAR':
      return 'circular'
    case 'DPN':
      return 'DPN'
    case 'INTERCHANGEABLE':
      return 'interchangeable tips'
    default:
      return s
  }
}

function AddYarnForm({
  yarnWeights,
  onCancel,
  onSubmit,
}: {
  yarnWeights: YarnWeight[]
  onCancel: () => void
  onSubmit: (entry: YarnEntry) => void
}) {
  const [label, setLabel] = useState('')
  const [weightSlug, setWeightSlug] = useState('')
  const [colourName, setColourName] = useState('')
  const [colourHex, setColourHex] = useState('#6b8a9b')
  const [skeins, setSkeins] = useState<string>('')
  const [yardage, setYardage] = useState<string>('')
  const [notes, setNotes] = useState('')

  return (
    <form
      className="stash-add-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (!label.trim()) return
        onSubmit({
          id: `yarn-${Date.now()}`,
          kind: 'yarn',
          label: label.trim(),
          weightSlug: weightSlug || null,
          colourName: colourName.trim() || null,
          colourHex: colourHex || null,
          yardagePerSkein: yardage ? Number(yardage) : null,
          skeins: skeins ? Number(skeins) : null,
          notes: notes.trim() || null,
          addedAt: new Date().toISOString(),
        })
      }}
    >
      <div className="stash-add-form-grid">
        <label>
          <span>Yarn name</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Drops Karisma"
            required
          />
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
          <span>Colour name</span>
          <input
            type="text"
            value={colourName}
            onChange={(e) => setColourName(e.target.value)}
            placeholder="Heather"
          />
        </label>
        <label>
          <span>Colour</span>
          <input type="color" value={colourHex} onChange={(e) => setColourHex(e.target.value)} />
        </label>
        <label>
          <span>Skeins</span>
          <input
            type="number"
            min="1"
            value={skeins}
            onChange={(e) => setSkeins(e.target.value)}
          />
        </label>
        <label>
          <span>Yardage per skein</span>
          <input
            type="number"
            min="1"
            value={yardage}
            onChange={(e) => setYardage(e.target.value)}
          />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          <span>Notes</span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dye lot, project earmark, etc."
          />
        </label>
      </div>
      <div className="stash-add-form-actions">
        <button type="submit" className="stash-add-form-primary">
          Add to stash
        </button>
        <button type="button" className="stash-add-form-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function AddNeedleForm({
  needles,
  onCancel,
  onSubmit,
}: {
  needles: NeedleRef[]
  onCancel: () => void
  onSubmit: (entry: NeedleEntry) => void
}) {
  const [needleSlug, setNeedleSlug] = useState('')
  const [label, setLabel] = useState('')
  const [style, setStyle] = useState<NeedleEntry['style']>('STRAIGHT')
  const [length, setLength] = useState<string>('')

  return (
    <form
      className="stash-add-form"
      onSubmit={(e) => {
        e.preventDefault()
        const needle = needles.find((n) => n.slug === needleSlug)
        if (!needle) return
        const displayLabel =
          label.trim() ||
          `${needle.mmSize} mm ${styleLabel(style)}${length ? ` · ${length} cm` : ''}`
        onSubmit({
          id: `needle-${Date.now()}`,
          kind: 'needle',
          label: displayLabel,
          mmSize: needle.mmSize,
          style,
          length: length ? Number(length) : null,
          notes: null,
          addedAt: new Date().toISOString(),
        })
      }}
    >
      <div className="stash-add-form-grid">
        <label>
          <span>Size</span>
          <select value={needleSlug} onChange={(e) => setNeedleSlug(e.target.value)} required>
            <option value="">—</option>
            {needles.map((n) => (
              <option key={n.slug} value={n.slug}>
                {n.canonicalName}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Style</span>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as NeedleEntry['style'])}
          >
            <option value="STRAIGHT">Straight</option>
            <option value="CIRCULAR">Circular</option>
            <option value="DPN">Double-pointed</option>
            <option value="INTERCHANGEABLE">Interchangeable tips</option>
          </select>
        </label>
        <label>
          <span>Cable length (cm, circular only)</span>
          <input
            type="number"
            min="20"
            max="200"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="80"
            disabled={style === 'STRAIGHT' || style === 'DPN'}
          />
        </label>
        <label>
          <span>Custom label (optional)</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="4 mm circulars (80 cm)"
          />
        </label>
      </div>
      <div className="stash-add-form-actions">
        <button type="submit" className="stash-add-form-primary">
          Add to stash
        </button>
        <button type="button" className="stash-add-form-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
