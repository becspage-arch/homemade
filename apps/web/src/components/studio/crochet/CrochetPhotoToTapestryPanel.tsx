'use client'

/**
 * Photo to tapestry crochet.
 *
 * Same three beats as the cross-stitch photo panel: drop a photo, set the size
 * and the number of yarns on the right, then build. The preview is the colour
 * grid, because that is what a tapestry maker reads, with the symbol chart the
 * saved pattern will carry underneath it.
 *
 * Building the grid is quick (it is the quantise, not the compile). Saving is
 * the slow part: the server compiles the stitches for real and puts them through
 * the loom's audit gate before it writes anything, so the pattern that comes out
 * is one that genuinely works.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { CraftChart } from '@/lib/craft-charts/svg-chart'
import type { ChartDefinition } from '@/lib/craft-charts/types'
import type { CrochetProgram } from '@/lib/loom/crochet/engine/program'
import {
  TAPESTRY_MAX_CELLS,
  TAPESTRY_MAX_COLOURS,
  TAPESTRY_MAX_HEIGHT,
  TAPESTRY_MAX_WIDTH,
  TAPESTRY_MIN_COLOURS,
  TAPESTRY_MIN_SIDE,
  tapestrySizeProblem,
  type TapestryColour,
  type TapestryGrid,
} from '@/lib/studio/crochet/tapestry-program'

interface Props {
  signedIn: boolean
  onSaved: (newId: string) => void
  onCancel: () => void
  header?: ReactNode
}

interface Settings {
  width: number
  height: number
  colours: number
  backgroundRemoval: boolean
  smoothing: 'low' | 'medium' | 'high'
  lockAspect: boolean
}

const DEFAULTS: Settings = {
  width: 24,
  height: 24,
  colours: 4,
  backgroundRemoval: false,
  smoothing: 'medium',
  lockAspect: true,
}

export function CrochetPhotoToTapestryPanel({ signedIn, onSaved, onCancel, header }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoAspect, setPhotoAspect] = useState<number | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [grid, setGrid] = useState<TapestryGrid | null>(null)
  const [program, setProgram] = useState<CrochetProgram | null>(null)
  const [stale, setStale] = useState(false)
  const [building, setBuilding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [problems, setProblems] = useState<string[]>([])
  const [name, setName] = useState('Untitled tapestry')
  const [dragOver, setDragOver] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const inflight = useRef<AbortController | null>(null)

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
  }, [photoUrl])

  const sizeProblem = tapestrySizeProblem(settings.width, settings.height)

  const onFileChosen = (f: File | null) => {
    if (!f) return
    setFile(f)
    setGrid(null)
    setProgram(null)
    setStale(false)
    setError(null)
    setProblems([])
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    const url = URL.createObjectURL(f)
    setPhotoUrl(url)
    setName(prettifyName(f.name))
    const img = new Image()
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight
      setPhotoAspect(aspect)
      setSettings((s) => ({ ...s, height: fitHeight(s.width, aspect) }))
    }
    img.src = url
  }

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      if (next.lockAspect && photoAspect) {
        if (patch.width !== undefined && patch.height === undefined) {
          next.height = fitHeight(patch.width, photoAspect)
        } else if (patch.lockAspect === true && patch.width === undefined) {
          next.height = fitHeight(next.width, photoAspect)
        }
      }
      if (grid && !('lockAspect' in patch && Object.keys(patch).length === 1)) setStale(true)
      return next
    })
  }

  const build = useCallback(async () => {
    if (!file || sizeProblem) return
    setBuilding(true)
    setError(null)
    setProblems([])
    inflight.current?.abort()
    const controller = new AbortController()
    inflight.current = controller
    try {
      const form = new FormData()
      form.set('image', file)
      form.set('name', name)
      form.set('width', String(settings.width))
      form.set('height', String(settings.height))
      form.set('colours', String(settings.colours))
      form.set('smoothing', settings.smoothing)
      form.set('backgroundRemoval', settings.backgroundRemoval ? '1' : '0')
      const res = await fetch('/api/studio/crochet/photo-to-tapestry', {
        method: 'POST',
        body: form,
        signal: controller.signal,
      })
      const body = await res.json().catch(() => ({ error: 'Something went wrong.' }))
      if (!res.ok) throw new Error(body.error ?? 'Something went wrong.')
      setGrid(body.grid as TapestryGrid)
      setProgram(body.program as CrochetProgram)
      setStale(false)
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') setError(e.message)
    } finally {
      setBuilding(false)
    }
  }, [file, name, settings, sizeProblem])

  const save = async () => {
    if (!program || !grid) return
    setSaving(true)
    setError(null)
    setProblems([])
    try {
      const res = await fetch('/api/studio/crochet/patterns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'piece',
          name,
          origin: 'photo',
          program: { ...program, name },
        }),
      })
      const body = await res.json().catch(() => ({ error: 'Could not save.' }))
      if (!res.ok) {
        if (Array.isArray(body.problems)) setProblems(body.problems)
        throw new Error(body.error ?? 'Could not save.')
      }
      onSaved(body.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  const ready = grid && !stale
  const stitchCount = settings.width * settings.height

  return (
    <section className="studio-p2c">
      <div className="studio-p2c-preview">
        {ready && grid ? (
          <div className="crochet-tapestry-preview">
            <TapestryGridPreview grid={grid} />
            {showChart && program ? (
              <div className="crochet-tapestry-chart">
                <CraftChart definition={toChartDefinition(program, name)} />
              </div>
            ) : null}
          </div>
        ) : photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Your photo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div className="studio-p2c-preview-canvas">
            <p style={{ color: 'var(--studio-ink-mute)', textAlign: 'center' }}>
              Drop a photo on the right to begin
            </p>
          </div>
        )}
        {building && (
          <div className="studio-p2c-thinking" role="status" aria-live="polite">
            <Loader2 size={28} strokeWidth={1.6} className="studio-p2c-thinking-spin" />
            <p>Reading your photo</p>
            <p className="studio-p2c-thinking-sub">Picking the yarns and laying out the stitches.</p>
          </div>
        )}
        {saving && (
          <div className="studio-p2c-thinking" role="status" aria-live="polite">
            <Loader2 size={28} strokeWidth={1.6} className="studio-p2c-thinking-spin" />
            <p>Working the stitches</p>
            <p className="studio-p2c-thinking-sub">
              Every stitch is built and checked before the pattern is saved. This takes a few seconds.
            </p>
          </div>
        )}
        {grid && stale && !building && (
          <div className="studio-p2c-stale">Settings changed. Build it again to see them.</div>
        )}
      </div>

      <div className="studio-p2c-controls">
        {header}

        {!signedIn && (
          <div className="studio-dialog-notice">You will be asked to sign in before your pattern is saved.</div>
        )}

        {!file ? (
          <label
            className="studio-p2c-dropzone"
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const f = e.dataTransfer.files[0]
              if (f) onFileChosen(f)
            }}
            style={dragOver ? { borderColor: 'var(--studio-accent)' } : undefined}
          >
            <UploadCloud size={32} strokeWidth={1.4} style={{ color: 'var(--studio-accent)' }} />
            <p style={{ marginTop: 12, marginBottom: 4, fontSize: 16, color: 'var(--studio-ink)' }}>
              Drop a photo, or click to browse
            </p>
            <p style={{ fontSize: 12, color: 'var(--studio-ink-mute)' }}>JPG, PNG or WEBP</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
          </label>
        ) : (
          <>
            <div className="studio-dialog-field">
              <label htmlFor="tapestry-name">Pattern name</label>
              <input id="tapestry-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="studio-dialog-grid">
              <div className="studio-dialog-field">
                <label htmlFor="tapestry-width">Stitches across</label>
                <input
                  id="tapestry-width"
                  type="number"
                  min={TAPESTRY_MIN_SIDE}
                  max={TAPESTRY_MAX_WIDTH}
                  value={settings.width}
                  onChange={(e) => update({ width: Number(e.target.value) })}
                />
              </div>
              <div className="studio-dialog-field">
                <label htmlFor="tapestry-height">Rows</label>
                <input
                  id="tapestry-height"
                  type="number"
                  min={TAPESTRY_MIN_SIDE}
                  max={TAPESTRY_MAX_HEIGHT}
                  value={settings.height}
                  onChange={(e) => update({ height: Number(e.target.value) })}
                  disabled={settings.lockAspect && photoAspect !== null}
                />
              </div>
            </div>

            <label className="studio-p2c-checkbox">
              <input
                type="checkbox"
                checked={settings.lockAspect}
                onChange={(e) => update({ lockAspect: e.target.checked })}
              />
              <span>
                Keep the photo&apos;s shape
                <span className="studio-p2c-checkbox-hint">
                  Changing the width sets the rows to match, so nothing gets squashed.
                </span>
              </span>
            </label>

            <p className="studio-dialog-finished subtle">
              {stitchCount} stitches of the {TAPESTRY_MAX_CELLS} a pattern can hold
            </p>

            <div className="studio-p2c-slider">
              <div className="studio-p2c-slider-label">
                <span>Yarns</span>
                <span>{settings.colours}</span>
              </div>
              <input
                type="range"
                min={TAPESTRY_MIN_COLOURS}
                max={TAPESTRY_MAX_COLOURS}
                value={settings.colours}
                onChange={(e) => update({ colours: Number(e.target.value) })}
              />
            </div>

            <div className="studio-dialog-field">
              <label htmlFor="tapestry-smoothing">Tidy up single stitches</label>
              <select
                id="tapestry-smoothing"
                value={settings.smoothing}
                onChange={(e) => update({ smoothing: e.target.value as Settings['smoothing'] })}
              >
                <option value="low">Leave the detail</option>
                <option value="medium">Some tidying</option>
                <option value="high">Smooth it right out</option>
              </select>
            </div>

            <label className="studio-p2c-checkbox">
              <input
                type="checkbox"
                checked={settings.backgroundRemoval}
                onChange={(e) => update({ backgroundRemoval: e.target.checked })}
              />
              <span>Lift the colours and flatten a plain background</span>
            </label>

            {grid && (
              <>
                <label className="studio-p2c-checkbox">
                  <input type="checkbox" checked={showChart} onChange={(e) => setShowChart(e.target.checked)} />
                  <span>Show the symbol chart under the colours</span>
                </label>
                <YarnKey palette={grid.palette} />
              </>
            )}

            {sizeProblem && <div className="studio-dialog-error">{sizeProblem}</div>}

            <div className="studio-dialog-actions">
              <button type="button" className="studio-button ghost" onClick={onCancel}>
                Cancel
              </button>
              {ready ? (
                <>
                  <button type="button" className="studio-button ghost" onClick={() => setStale(true)}>
                    Change the settings
                  </button>
                  <button type="button" className="studio-button primary" onClick={save} disabled={saving}>
                    {saving ? 'Saving' : 'Save to my patterns'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="studio-button primary"
                  onClick={build}
                  disabled={building || Boolean(sizeProblem)}
                >
                  {building ? 'Building' : grid ? 'Build it again' : 'Build the pattern'}
                </button>
              )}
            </div>

            {error && <div className="studio-dialog-error">{error}</div>}
            {problems.length > 0 && (
              <ul className="crochet-studio-problems">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  )
}

/** The colour grid, one square per stitch. Drawn on a canvas so a 900-stitch
 *  grid stays light. */
function TapestryGridPreview({ grid }: { grid: TapestryGrid }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const cell = 14
    canvas.width = grid.width * cell
    canvas.height = grid.height * cell
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const hex = new Map(grid.palette.map((c) => [c.key, c.hex]))
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        ctx.fillStyle = hex.get(grid.cells[y * grid.width + x] ?? '') ?? '#ffffff'
        ctx.fillRect(x * cell, y * cell, cell, cell)
      }
    }
    ctx.strokeStyle = 'rgba(60, 47, 34, 0.10)'
    ctx.lineWidth = 1
    for (let x = 0; x <= grid.width; x++) {
      ctx.beginPath()
      ctx.moveTo(x * cell + 0.5, 0)
      ctx.lineTo(x * cell + 0.5, grid.height * cell)
      ctx.stroke()
    }
    for (let y = 0; y <= grid.height; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * cell + 0.5)
      ctx.lineTo(grid.width * cell, y * cell + 0.5)
      ctx.stroke()
    }
  }, [grid])
  return <canvas ref={ref} className="crochet-tapestry-canvas" aria-label="Your pattern, one square for each stitch" />
}

function YarnKey({ palette }: { palette: TapestryColour[] }) {
  return (
    <div className="crochet-yarn-key">
      <h3>Yarns</h3>
      <ul>
        {palette.map((c) => (
          <li key={c.key}>
            <span className="crochet-yarn-swatch" style={{ background: c.hex }} aria-hidden />
            <span className="crochet-yarn-name">{c.name}</span>
            <span className="crochet-yarn-count">{c.stitches} sts</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The symbol chart the saved pattern carries: every stitch is a single crochet,
 *  so the chart reads as the shape and the colour grid carries the picture. */
function toChartDefinition(program: CrochetProgram, title: string): ChartDefinition {
  const rows = (program.grid ?? []).map((row, i) => ({
    rowNumber: i + 1,
    rightSide: i % 2 === 0,
    stitches: row.stitches.map((_, c) => ({
      symbol: 'double-crochet-uk',
      colourKey: row.cellColours?.[c],
    })),
  }))
  return {
    title,
    layout: 'flat',
    craft: 'crochet',
    terminologyConvention: 'uk',
    rows,
    caption: 'Read right-side rows right to left, wrong-side rows left to right.',
  }
}

function fitHeight(width: number, aspect: number): number {
  return Math.max(TAPESTRY_MIN_SIDE, Math.min(TAPESTRY_MAX_HEIGHT, Math.round(width / aspect)))
}

function prettifyName(filename: string): string {
  return (
    filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() ||
    'Untitled tapestry'
  )
}
