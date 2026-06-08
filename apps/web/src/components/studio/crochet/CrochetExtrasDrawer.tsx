'use client'

/**
 * CrochetExtrasDrawer — a single side-drawer that groups three
 * Studio extras: stitch markers, gauge log, colour scheme save.
 *
 *   Markers     — drop a labelled marker on a row, list all markers
 *                  for this project, delete with a tap.
 *   Gauge       — log a new swatch reading any time you want to.
 *                 Surfaces the most recent gauge inline.
 *   Schemes     — name and save the colours you're using; lists
 *                 the user's saved schemes.
 *
 * One drawer keeps the toolbar light. The three sub-panels live as
 * collapsible accordions.
 */

import { useCallback, useEffect, useState } from 'react'
import { Pin, Ruler, Palette, Trash2, Plus } from 'lucide-react'

import type { ProjectSetup } from './types'

interface StitchMarker {
  id: string
  position: {
    type?: string
    section?: string
    rowNumber?: number
  } | null
  label: string | null
  colour: string | null
  createdAt: string
}

interface GaugeLog {
  id: string
  stitchesPer10cm: number | null
  rowsPer10cm: number | null
  hookMm: number | null
  yarnLabel: string | null
  blocked: boolean
  notes: string | null
  createdAt: string
}

interface ColourScheme {
  id: string
  name: string
  colours: Array<{ hex: string; label?: string }>
  sourceCrochetPatternId: string | null
  createdAt: string
  updatedAt: string
}

interface Props {
  crochetPatternId: string
  sections: string[]
  projectSetup: ProjectSetup | null
}

export function CrochetExtrasDrawer({ crochetPatternId, sections, projectSetup }: Props) {
  const [activePanel, setActivePanel] = useState<'markers' | 'gauge' | 'schemes' | null>(null)

  return (
    <div className="crochet-studio-extras-drawer">
      <div className="crochet-studio-extras-tabs" role="tablist">
        <ExtrasTab
          icon={<Pin size={14} strokeWidth={1.5} />}
          label="Markers"
          active={activePanel === 'markers'}
          onClick={() => setActivePanel(activePanel === 'markers' ? null : 'markers')}
        />
        <ExtrasTab
          icon={<Ruler size={14} strokeWidth={1.5} />}
          label="Gauge"
          active={activePanel === 'gauge'}
          onClick={() => setActivePanel(activePanel === 'gauge' ? null : 'gauge')}
        />
        <ExtrasTab
          icon={<Palette size={14} strokeWidth={1.5} />}
          label="Colours"
          active={activePanel === 'schemes'}
          onClick={() => setActivePanel(activePanel === 'schemes' ? null : 'schemes')}
        />
      </div>

      {activePanel === 'markers' && (
        <MarkersPanel crochetPatternId={crochetPatternId} sections={sections} />
      )}
      {activePanel === 'gauge' && (
        <GaugePanel crochetPatternId={crochetPatternId} projectSetup={projectSetup} />
      )}
      {activePanel === 'schemes' && (
        <SchemesPanel crochetPatternId={crochetPatternId} projectSetup={projectSetup} />
      )}
    </div>
  )
}

function ExtrasTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`crochet-studio-extras-tab${active ? ' is-active' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// ────────────────────────────────────────────────────────────────────
// Markers panel
// ────────────────────────────────────────────────────────────────────

function MarkersPanel({
  crochetPatternId,
  sections,
}: {
  crochetPatternId: string
  sections: string[]
}) {
  const [markers, setMarkers] = useState<StitchMarker[] | null>(null)
  const [adding, setAdding] = useState(false)
  const [section, setSection] = useState(sections[0] ?? 'Pattern')
  const [rowNumber, setRowNumber] = useState('')
  const [label, setLabel] = useState('')
  const [colour, setColour] = useState('#7d957d')

  const reload = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/studio/crochet/stitch-markers?crochetPatternId=${encodeURIComponent(crochetPatternId)}`,
      )
      if (res.ok) {
        const data = (await res.json()) as StitchMarker[]
        setMarkers(data)
      }
    } catch {
      // silent
    }
  }, [crochetPatternId])

  useEffect(() => {
    let cancelled = false
    const id = setTimeout(() => {
      if (cancelled) return
      void reload()
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [reload])

  const addMarker = async () => {
    const rn = Number(rowNumber)
    if (!Number.isFinite(rn) || rn <= 0) return
    try {
      const res = await fetch('/api/studio/crochet/stitch-markers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          crochetPatternId,
          position: { type: 'row', section, rowNumber: rn },
          label: label.trim() || null,
          colour,
        }),
      })
      if (res.ok) {
        setRowNumber('')
        setLabel('')
        setAdding(false)
        void reload()
      }
    } catch {
      // silent
    }
  }

  const deleteMarker = async (id: string) => {
    try {
      const res = await fetch(`/api/studio/crochet/stitch-markers/${id}`, { method: 'DELETE' })
      if (res.ok) void reload()
    } catch {
      // silent
    }
  }

  return (
    <div className="crochet-studio-extras-panel">
      <p className="crochet-studio-extras-help">
        Drop a marker on any row to remember a spot, a stitch count, or a colour change.
      </p>

      {!adding && (
        <button
          type="button"
          className="crochet-studio-extras-primary"
          onClick={() => setAdding(true)}
        >
          <Plus size={14} strokeWidth={1.8} />
          <span>Add a marker</span>
        </button>
      )}

      {adding && (
        <div className="crochet-studio-extras-form">
          <label>
            <span>Section</span>
            <select value={section} onChange={(e) => setSection(e.target.value)}>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Row / round number</span>
            <input
              type="number"
              min="1"
              value={rowNumber}
              onChange={(e) => setRowNumber(e.target.value)}
              placeholder="e.g. 47"
            />
          </label>
          <label>
            <span>Label (optional)</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Colour change · stitch count check"
            />
          </label>
          <label>
            <span>Colour</span>
            <input type="color" value={colour} onChange={(e) => setColour(e.target.value)} />
          </label>
          <div className="crochet-studio-extras-form-actions">
            <button type="button" onClick={addMarker} className="primary">
              Save marker
            </button>
            <button type="button" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {markers === null ? (
        <p className="crochet-studio-extras-loading">Loading…</p>
      ) : markers.length === 0 ? (
        <p className="crochet-studio-extras-empty">No markers yet.</p>
      ) : (
        <ul className="crochet-studio-extras-list">
          {markers.map((m) => (
            <li key={m.id} className="crochet-studio-extras-marker">
              <span
                className="crochet-studio-extras-marker-pip"
                style={m.colour ? { background: m.colour, borderColor: m.colour } : undefined}
                aria-hidden
              />
              <span className="crochet-studio-extras-marker-body">
                <strong>
                  {m.position?.section ?? 'Pattern'} · row {m.position?.rowNumber ?? '?'}
                </strong>
                {m.label && <span className="crochet-studio-extras-marker-label">{m.label}</span>}
              </span>
              <button
                type="button"
                className="crochet-studio-extras-delete"
                onClick={() => deleteMarker(m.id)}
                aria-label="Delete marker"
              >
                <Trash2 size={12} strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Gauge panel
// ────────────────────────────────────────────────────────────────────

function GaugePanel({
  crochetPatternId,
  projectSetup,
}: {
  crochetPatternId: string
  projectSetup: ProjectSetup | null
}) {
  const [logs, setLogs] = useState<GaugeLog[] | null>(null)
  const [adding, setAdding] = useState(false)
  const [sts, setSts] = useState('')
  const [rows, setRows] = useState('')
  const [hookMm, setHookMm] = useState(projectSetup?.hook?.mmSize?.toString() ?? '')
  const [blocked, setBlocked] = useState(false)
  const [notes, setNotes] = useState('')

  const reload = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/studio/crochet/project-gauges?crochetPatternId=${encodeURIComponent(crochetPatternId)}`,
      )
      if (res.ok) {
        const data = (await res.json()) as GaugeLog[]
        setLogs(data)
      }
    } catch {
      // silent
    }
  }, [crochetPatternId])

  useEffect(() => {
    let cancelled = false
    const id = setTimeout(() => {
      if (cancelled) return
      void reload()
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [reload])

  const addLog = async () => {
    const stsValue = Number(sts)
    const rowsValue = Number(rows)
    const hookValue = Number(hookMm)
    try {
      const res = await fetch('/api/studio/crochet/project-gauges', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          crochetPatternId,
          stitchesPer10cm: Number.isFinite(stsValue) && stsValue > 0 ? stsValue : null,
          rowsPer10cm: Number.isFinite(rowsValue) && rowsValue > 0 ? rowsValue : null,
          hookMm: Number.isFinite(hookValue) && hookValue > 0 ? hookValue : null,
          yarnLabel: projectSetup?.yarn?.label ?? null,
          blocked,
          notes: notes.trim() || null,
        }),
      })
      if (res.ok) {
        setSts('')
        setRows('')
        setNotes('')
        setBlocked(false)
        setAdding(false)
        void reload()
      }
    } catch {
      // silent
    }
  }

  return (
    <div className="crochet-studio-extras-panel">
      <p className="crochet-studio-extras-help">
        Log your swatch as you go. Re-swatch any time and the latest reading shows in the footer.
      </p>

      {!adding && (
        <button
          type="button"
          className="crochet-studio-extras-primary"
          onClick={() => setAdding(true)}
        >
          <Plus size={14} strokeWidth={1.8} />
          <span>Log a new swatch</span>
        </button>
      )}

      {adding && (
        <div className="crochet-studio-extras-form">
          <label>
            <span>Stitches per 10 cm</span>
            <input
              type="number"
              step="0.5"
              min="1"
              max="60"
              value={sts}
              onChange={(e) => setSts(e.target.value)}
              placeholder="18"
            />
          </label>
          <label>
            <span>Rows per 10 cm</span>
            <input
              type="number"
              step="0.5"
              min="1"
              max="60"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              placeholder="10"
            />
          </label>
          <label>
            <span>Hook size (mm)</span>
            <input
              type="number"
              step="0.25"
              min="0.5"
              max="25"
              value={hookMm}
              onChange={(e) => setHookMm(e.target.value)}
            />
          </label>
          <label className="crochet-studio-extras-checkbox">
            <input type="checkbox" checked={blocked} onChange={(e) => setBlocked(e.target.checked)} />
            <span>Measured after blocking</span>
          </label>
          <label>
            <span>Notes</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Loose at the start; tightened up by row 12"
            />
          </label>
          <div className="crochet-studio-extras-form-actions">
            <button type="button" onClick={addLog} className="primary">
              Save log
            </button>
            <button type="button" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {logs === null ? (
        <p className="crochet-studio-extras-loading">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="crochet-studio-extras-empty">No swatches logged.</p>
      ) : (
        <ul className="crochet-studio-extras-list">
          {logs.map((g) => (
            <li key={g.id} className="crochet-studio-extras-gauge">
              <div className="crochet-studio-extras-gauge-readout">
                {g.stitchesPer10cm != null && <span>{g.stitchesPer10cm} sts</span>}
                {g.rowsPer10cm != null && <span>{g.rowsPer10cm} rows</span>}
                {g.hookMm != null && <span>{g.hookMm} mm</span>}
                {g.blocked && <span className="crochet-studio-extras-gauge-blocked">blocked</span>}
              </div>
              {g.notes && (
                <p className="crochet-studio-extras-gauge-notes">{g.notes}</p>
              )}
              <p className="crochet-studio-extras-gauge-time">{new Date(g.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Colour schemes panel
// ────────────────────────────────────────────────────────────────────

function SchemesPanel({
  crochetPatternId,
  projectSetup,
}: {
  crochetPatternId: string
  projectSetup: ProjectSetup | null
}) {
  const [schemes, setSchemes] = useState<ColourScheme[] | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [colours, setColours] = useState<Array<{ hex: string; label: string }>>(() => {
    const yarn = projectSetup?.yarn
    if (yarn?.colourHex) {
      return [{ hex: yarn.colourHex, label: yarn.colourName ?? '' }]
    }
    return [{ hex: '#9CAF88', label: '' }]
  })

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`/api/studio/crochet/colour-schemes`)
      if (res.ok) {
        const data = (await res.json()) as ColourScheme[]
        setSchemes(data)
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const id = setTimeout(() => {
      if (cancelled) return
      void reload()
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [reload])

  const save = async () => {
    if (!name.trim()) return
    try {
      const res = await fetch('/api/studio/crochet/colour-schemes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          colours: colours.filter((c) => c.hex).map((c) => ({ hex: c.hex, label: c.label || undefined })),
          sourceCrochetPatternId: crochetPatternId,
        }),
      })
      if (res.ok) {
        setName('')
        setAdding(false)
        void reload()
      }
    } catch {
      // silent
    }
  }

  const deleteScheme = async (id: string) => {
    try {
      const res = await fetch(`/api/studio/crochet/colour-schemes/${id}`, { method: 'DELETE' })
      if (res.ok) void reload()
    } catch {
      // silent
    }
  }

  const updateColour = (index: number, patch: Partial<{ hex: string; label: string }>) => {
    setColours((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  return (
    <div className="crochet-studio-extras-panel">
      <p className="crochet-studio-extras-help">
        Save the colours you&apos;re using on this project so you can match them next time.
      </p>

      {!adding && (
        <button
          type="button"
          className="crochet-studio-extras-primary"
          onClick={() => setAdding(true)}
        >
          <Plus size={14} strokeWidth={1.8} />
          <span>Save this scheme</span>
        </button>
      )}

      {adding && (
        <div className="crochet-studio-extras-form">
          <label>
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Granny blanket palette"
            />
          </label>
          {colours.map((c, i) => (
            <div key={i} className="crochet-studio-extras-form-row">
              <input
                type="color"
                value={c.hex}
                onChange={(e) => updateColour(i, { hex: e.target.value })}
              />
              <input
                type="text"
                value={c.label}
                onChange={(e) => updateColour(i, { label: e.target.value })}
                placeholder="Sage"
              />
              {colours.length > 1 && (
                <button
                  type="button"
                  className="crochet-studio-extras-delete"
                  onClick={() => setColours((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove colour"
                >
                  <Trash2 size={12} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="crochet-studio-extras-link"
            onClick={() => setColours((prev) => [...prev, { hex: '#9CAF88', label: '' }])}
          >
            <Plus size={12} strokeWidth={1.5} /> Add another colour
          </button>
          <div className="crochet-studio-extras-form-actions">
            <button type="button" onClick={save} className="primary" disabled={!name.trim()}>
              Save scheme
            </button>
            <button type="button" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {schemes === null ? (
        <p className="crochet-studio-extras-loading">Loading…</p>
      ) : schemes.length === 0 ? (
        <p className="crochet-studio-extras-empty">No saved schemes yet.</p>
      ) : (
        <ul className="crochet-studio-extras-list">
          {schemes.map((s) => (
            <li key={s.id} className="crochet-studio-extras-scheme">
              <div className="crochet-studio-extras-scheme-strip">
                {s.colours.map((c, i) => (
                  <span
                    key={i}
                    className="crochet-studio-extras-scheme-swatch"
                    style={{ background: c.hex }}
                    title={c.label ?? c.hex}
                  />
                ))}
              </div>
              <span className="crochet-studio-extras-scheme-name">{s.name}</span>
              <button
                type="button"
                className="crochet-studio-extras-delete"
                onClick={() => deleteScheme(s.id)}
                aria-label="Delete scheme"
              >
                <Trash2 size={12} strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
