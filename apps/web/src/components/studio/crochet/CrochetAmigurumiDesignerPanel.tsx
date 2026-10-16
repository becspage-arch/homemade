'use client'

/**
 * The amigurumi designer.
 *
 * A guided form, not a text box: pick a creature, a size, the two yarns, the eyes.
 * Every shape is one of the profiles the loom has already been run against, so
 * whatever the maker picks is a pattern that genuinely works.
 *
 * The preview is a schematic of the pieces at their real settled sizes, front on,
 * beside the round-by-round instructions written from the same program the
 * finished-piece photo will be rendered from.
 */

import { useMemo, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import {
  AMIGURUMI_BASES,
  AMIGURUMI_SIZES,
  EYE_SIZES,
  FACE_STYLES,
  HATS,
  HAT_HEX_DEFAULT,
  POMPOM_HEX_DEFAULT,
  isToy,
  amigurumiBaseSpec,
  buildAmigurumiProgram,
  amigurumiPresetName,
  presetSettledSizeMm,
  profileSizeMm,
  type AmigurumiBase,
  type AmigurumiChoices,
  type AmigurumiSize,
} from '@/lib/loom/crochet/engine/amigurumiPresets'
import { compositionPieces, writePieceInstructions, writeAssembly } from '@/lib/loom/crochet/engine/compositionPattern'
import { DOLL_FAIRY_DRESSING } from '@/lib/loom/crochet/engine/doll'
import { YARN_SHADES } from '@/lib/studio/crochet/yarn-shades'

interface Props {
  signedIn: boolean
  onSaved: (newId: string) => void
  onCancel: () => void
  header?: ReactNode
}

const DEFAULT_CHOICES: AmigurumiChoices = {
  base: 'bear',
  size: 'M',
  mainHex: '#b5814e',
  contrastHex: '#e6d3ae',
  eyeMm: 9,
  nose: true,
  paws: true,
}

export function CrochetAmigurumiDesignerPanel({ signedIn, onSaved, onCancel, header }: Props) {
  const [choices, setChoices] = useState<AmigurumiChoices>(DEFAULT_CHOICES)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [problems, setProblems] = useState<string[]>([])

  const program = useMemo(() => buildAmigurumiProgram({ ...choices, name: name || undefined }), [choices, name])
  const pieces = useMemo(() => compositionPieces(program), [program])
  const assembly = useMemo(() => writeAssembly(program), [program])
  const settled = presetSettledSizeMm(choices.base, choices.size)
  const displayName = name || amigurumiPresetName(choices)
  const set = (patch: Partial<AmigurumiChoices>) => setChoices((c) => ({ ...c, ...patch }))
  const spec = amigurumiBaseSpec(choices.base)

  const save = async () => {
    setSaving(true)
    setError(null)
    setProblems([])
    try {
      const res = await fetch('/api/studio/crochet/patterns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'designer', name: displayName, choices: { ...choices, name: undefined } }),
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

  return (
    <section className="studio-p2c">
      <div className="studio-p2c-preview crochet-designer-preview">
        <AmigurumiSchematic choices={choices} />
        <div className="crochet-designer-words">
          <h2>{displayName}</h2>
          <p className="crochet-designer-size">
            {(settled.width / 10).toFixed(1)} x {(settled.height / 10).toFixed(1)} cm in{' '}
            {program.yarnWeight === 'fine' ? '4 ply cotton on a 2.5 mm hook' : 'worsted yarn on a 4 mm hook'}
          </p>
          {pieces.map((piece) => (
            <div key={piece.section} className="crochet-designer-piece">
              <h3>
                {piece.label}
                {piece.makeQuantity > 1 ? ` (make ${piece.makeQuantity})` : ''}
              </h3>
              <ol>
                {writePieceInstructions(piece).map((line, i) => (
                  <li key={`${piece.section}-${i}`}>{line}</li>
                ))}
              </ol>
            </div>
          ))}
          <div className="crochet-designer-piece">
            <h3>Putting it together</h3>
            <ol>
              {assembly.map((line, i) => (
                <li key={`assembly-${i}`}>{line}</li>
              ))}
            </ol>
          </div>
        </div>
        {saving && (
          <div className="studio-p2c-thinking" role="status" aria-live="polite">
            <Loader2 size={28} strokeWidth={1.6} className="studio-p2c-thinking-spin" />
            <p>Saving your pattern</p>
            <p className="studio-p2c-thinking-sub">The photo of the finished piece follows on behind.</p>
          </div>
        )}
      </div>

      <div className="studio-p2c-controls">
        {header}

        {!signedIn && (
          <div className="studio-dialog-notice">You will be asked to sign in before your pattern is saved.</div>
        )}

        <div className="studio-dialog-field">
          <label htmlFor="ami-name">Name</label>
          <input
            id="ami-name"
            type="text"
            value={name}
            placeholder={amigurumiPresetName(choices)}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <fieldset className="crochet-designer-group">
          <legend>What are you making</legend>
          <div className="crochet-designer-cards">
            {AMIGURUMI_BASES.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={choices.base === b.id}
                className={`crochet-designer-card${choices.base === b.id ? ' is-active' : ''}`}
                // A doll arrives dressed as the fairy (hair, dress, wings,
                // flowers); the maker takes off what she does not want below.
                onClick={() => set(b.id === 'doll' && choices.base !== 'doll' ? { base: 'doll', ...DOLL_FAIRY_DRESSING, face: 'stitched', eyeMm: 0 } : { base: b.id as AmigurumiBase })}
              >
                <span className="crochet-designer-card-title">{b.label}</span>
                <span className="crochet-designer-card-sub">{b.blurb}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="crochet-designer-group">
          <legend>Size</legend>
          <div className="crochet-designer-chips">
            {AMIGURUMI_SIZES.map((s) => {
              const size = presetSettledSizeMm(choices.base, s.id as AmigurumiSize)
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={choices.size === s.id}
                  className={`crochet-designer-chip${choices.size === s.id ? ' is-active' : ''}`}
                  onClick={() => set({ size: s.id as AmigurumiSize })}
                >
                  {s.label}
                  <span>{(size.height / 10).toFixed(0)} cm</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <ShadePicker
          label="Main yarn"
          value={choices.mainHex}
          onChange={(hex) => set({ mainHex: hex })}
        />
        <ShadePicker
          label="Second yarn"
          hint={spec.contrastFor}
          value={choices.contrastHex}
          onChange={(hex) => set({ contrastHex: hex })}
        />

        <fieldset className="crochet-designer-group">
          <legend>Face</legend>
          <div className="crochet-designer-chips">
            {FACE_STYLES.map((f) => (
              <button
                key={f.id}
                type="button"
                title={f.blurb}
                aria-pressed={(choices.face ?? 'safety') === f.id}
                className={`crochet-designer-chip${(choices.face ?? 'safety') === f.id ? ' is-active' : ''}`}
                onClick={() => set({ face: f.id })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </fieldset>

        {(choices.face ?? 'safety') !== 'sleepy' && (choices.face ?? 'safety') !== 'stitched' && (
        <fieldset className="crochet-designer-group">
          <legend>Safety eyes</legend>
          <div className="crochet-designer-chips">
            {EYE_SIZES.map((mm) => (
              <button
                key={mm}
                type="button"
                aria-pressed={choices.eyeMm === mm}
                className={`crochet-designer-chip${choices.eyeMm === mm ? ' is-active' : ''}`}
                onClick={() => set({ eyeMm: mm })}
              >
                {mm === 0 ? 'None' : `${mm} mm`}
              </button>
            ))}
          </div>
          {choices.eyeMm > 0 && (
            <p className="crochet-designer-note">
              Safety eyes are not suitable for a toy given to a child under three. Embroider the face instead.
            </p>
          )}
        </fieldset>
        )}

        {isToy(choices.base) && (
          <fieldset className="crochet-designer-group">
            <legend>Hat</legend>
            <div className="crochet-designer-chips">
              <button
                type="button"
                aria-pressed={!choices.hat}
                className={`crochet-designer-chip${!choices.hat ? ' is-active' : ''}`}
                onClick={() => set({ hat: undefined })}
              >
                None
              </button>
              {HATS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  title={h.blurb}
                  aria-pressed={choices.hat === h.id}
                  className={`crochet-designer-chip${choices.hat === h.id ? ' is-active' : ''}`}
                  onClick={() => set({ hat: h.id })}
                >
                  {h.label}
                </button>
              ))}
            </div>
            {choices.hat && (
              <>
                <ShadePicker
                  label="Hat yarn"
                  value={choices.hatHex ?? HAT_HEX_DEFAULT}
                  onChange={(hex) => set({ hatHex: hex })}
                />
                <ShadePicker
                  label="Pompom yarn"
                  hint="A soft fluffy yarn, cream on a lilac cap."
                  value={choices.pompomHex ?? POMPOM_HEX_DEFAULT}
                  onChange={(hex) => set({ pompomHex: hex })}
                />
              </>
            )}
          </fieldset>
        )}

        {choices.base === 'doll' && (
          <fieldset className="crochet-designer-group">
            <legend>Dressing</legend>
            <p className="crochet-designer-note">
              The small size is a bare keyring charm; the dressing is for the medium and large doll.
            </p>
            <DressingToggle
              label="Hair"
              hint="A crocheted hair cap with corkscrew ringlets, worked as strips of 3 and 2 dc in each chain."
              value={choices.hairHex}
              defaultHex={DOLL_FAIRY_DRESSING.hairHex}
              onChange={(hex) => set({ hairHex: hex })}
            />
            <DressingToggle
              label="Dress"
              hint="A fitted bodice and a skirt worked from the waist round, with a scalloped frill at the hem."
              value={choices.skirt?.hex}
              defaultHex={DOLL_FAIRY_DRESSING.skirt.hex}
              onChange={(hex) => set({ skirt: hex ? { hex, hemHex: choices.skirt?.hemHex ?? DOLL_FAIRY_DRESSING.skirt.hemHex } : undefined })}
            />
            {choices.skirt && (
              <ShadePicker
                label="Frill yarn"
                value={choices.skirt.hemHex}
                onChange={(hex) => set({ skirt: { hex: choices.skirt!.hex, hemHex: hex } })}
              />
            )}
            <DressingToggle
              label="Wings"
              hint="Two flat lace lobes each, worked both sides of a chain with a chain space between every stitch."
              value={choices.wingsHex}
              defaultHex={DOLL_FAIRY_DRESSING.wingsHex}
              onChange={(hex) => set({ wingsHex: hex })}
            />
            <DressingToggle
              label="Flowers"
              hint="A rolled rose, two small flowers and a leaf each side of the hair, and a bouquet in her hands."
              value={choices.flowersHex}
              defaultHex={DOLL_FAIRY_DRESSING.flowersHex}
              onChange={(hex) => set({ flowersHex: hex })}
            />
          </fieldset>
        )}

        {spec.nose && (
          <label className="studio-p2c-checkbox">
            <input type="checkbox" checked={choices.nose} onChange={(e) => set({ nose: e.target.checked })} />
            <span>Give it a nose</span>
          </label>
        )}
        {spec.paws && (
          <label className="studio-p2c-checkbox">
            <input type="checkbox" checked={choices.paws} onChange={(e) => set({ paws: e.target.checked })} />
            <span>Paw pads in the second yarn</span>
          </label>
        )}

        <div className="studio-dialog-actions">
          <button type="button" className="studio-button ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="studio-button primary" onClick={save} disabled={saving}>
            {saving ? 'Saving' : 'Save to my patterns'}
          </button>
        </div>

        {error && <div className="studio-dialog-error">{error}</div>}
        {problems.length > 0 && (
          <ul className="crochet-studio-problems">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/** One piece of the doll's dressing: on or off, and its yarn when on. */
function DressingToggle({
  label,
  hint,
  value,
  defaultHex,
  onChange,
}: {
  label: string
  hint: string
  value: string | undefined
  defaultHex: string
  onChange: (hex: string | undefined) => void
}) {
  return (
    <>
      <label className="studio-p2c-checkbox">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked ? defaultHex : undefined)} />
        <span>{label}</span>
      </label>
      {value && <ShadePicker label={`${label} yarn`} hint={hint} value={value} onChange={(hex) => onChange(hex)} />}
    </>
  )
}

function ShadePicker({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (hex: string) => void
}) {
  return (
    <fieldset className="crochet-designer-group">
      <legend>{label}</legend>
      {hint && <p className="crochet-designer-note">{hint}</p>}
      <div className="crochet-shade-grid">
        {YARN_SHADES.map((shade) => (
          <button
            key={shade.name}
            type="button"
            title={shade.name}
            aria-label={shade.name}
            aria-pressed={value.toLowerCase() === shade.hex.toLowerCase()}
            className={`crochet-shade${value.toLowerCase() === shade.hex.toLowerCase() ? ' is-active' : ''}`}
            style={{ background: shade.hex }}
            onClick={() => onChange(shade.hex)}
          />
        ))}
      </div>
    </fieldset>
  )
}

interface Ellipse {
  cx: number
  cz: number
  rx: number
  rz: number
  hex: string
  key: string
}

/**
 * A front-on schematic of the pieces at their real settled sizes.
 *
 * Not the render: the render is the loom's job and arrives as a photo of the
 * finished piece a little later. This is the sketch a designer draws to see the
 * proportions, laid out with the same joins the program declares, flattened onto
 * the front view (side to side across, up the page for height).
 */
function AmigurumiSchematic({ choices }: { choices: AmigurumiChoices }) {
  const program = useMemo(() => buildAmigurumiProgram(choices), [choices])

  const { shapes, dots, bounds } = useMemo(() => {
    const byName = new Map<string, Ellipse>()
    const out: Ellipse[] = []
    for (const part of program.parts) {
      // A free-form piece (a frill, a lace wing, a rose) has no round profile
      // to size an ellipse from; the sketch shows the round-work pieces.
      if (part.custom) continue
      const base = profileSizeMm(part.rounds, program.yarnWeight)
      const scale = part.scale ?? 1
      const rx = (base.width / 2) * scale
      const rz = (base.height / 2) * scale
      const place = part.place as {
        on: string
        overlap?: number
        dir?: { x: number; y: number; z: number }
        aim?: { x: number; y: number; z: number }
        seat?: number
        offset?: { x?: number; y?: number; z?: number }
      }
      let cx = 0
      let cz = rz
      if (place.on !== 'ground') {
        const parent = byName.get(place.on)
        if (!parent) continue
        if (place.dir) {
          const u = flatten(place.dir)
          const a = flatten(place.aim ?? place.dir)
          const parentR = ellipseRadius(parent.rx, parent.rz, u)
          const seat = place.seat ?? 4
          const jx = parent.cx + u.x * (parentR - seat)
          const jz = parent.cz + u.z * (parentR - seat)
          cx = jx + a.x * rz
          cz = jz + a.z * rz
        } else {
          cx = parent.cx + (place.offset?.x ?? 0)
          cz = parent.cz + parent.rz - (place.overlap ?? 0) + rz
        }
      }
      const e: Ellipse = { cx, cz, rx, rz, hex: part.colourHex, key: part.name }
      byName.set(part.name, e)
      out.push(e)
    }

    const eyes: Ellipse[] = []
    for (const prop of program.props ?? []) {
      const parent = byName.get(prop.on)
      if (!parent) continue
      const u = flatten(prop.dir)
      const r = ellipseRadius(parent.rx, parent.rz, u)
      eyes.push({
        cx: parent.cx + u.x * r * 0.72,
        cz: parent.cz + u.z * r * 0.72,
        rx: prop.radiusMm * (prop.widen ?? 1),
        rz: prop.radiusMm * (prop.flatten ?? 1),
        hex: prop.colourHex,
        key: prop.name,
      })
    }

    let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity
    for (const e of [...out, ...eyes]) {
      minx = Math.min(minx, e.cx - e.rx); maxx = Math.max(maxx, e.cx + e.rx)
      minz = Math.min(minz, e.cz - e.rz); maxz = Math.max(maxz, e.cz + e.rz)
    }
    return { shapes: out, dots: eyes, bounds: { minx, maxx, minz, maxz } }
  }, [program])

  const pad = 8
  const w = bounds.maxx - bounds.minx + pad * 2
  const h = bounds.maxz - bounds.minz + pad * 2
  // Front view: x runs across, z runs up, so the SVG y axis is flipped.
  const toY = (z: number) => bounds.maxz + pad - z
  const toX = (x: number) => x - bounds.minx + pad

  return (
    <div className="crochet-designer-schematic">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="A sketch of the pieces and how they sit together">
        {[...shapes].reverse().map((e) => (
          <ellipse
            key={e.key}
            cx={toX(e.cx)}
            cy={toY(e.cz)}
            rx={e.rx}
            ry={e.rz}
            fill={e.hex}
            stroke="rgba(60, 47, 34, 0.22)"
            strokeWidth={0.7}
          />
        ))}
        {dots.map((e) => (
          <ellipse key={e.key} cx={toX(e.cx)} cy={toY(e.cz)} rx={e.rx} ry={e.rz} fill={e.hex} />
        ))}
      </svg>
      <p className="crochet-designer-schematic-note">
        A sketch of the pieces at their finished sizes. The photo of the real thing is made after you save.
      </p>
    </div>
  )
}

/** Project a direction onto the front view and make it a unit vector. */
function flatten(d: { x: number; y: number; z: number }): { x: number; z: number } {
  const len = Math.hypot(d.x, d.z) || 1
  return { x: d.x / len, z: d.z / len }
}

/** How far an ellipse's edge is from its centre along a unit direction. */
function ellipseRadius(rx: number, rz: number, u: { x: number; z: number }): number {
  const q = (u.x / Math.max(rx, 0.001)) ** 2 + (u.z / Math.max(rz, 0.001)) ** 2
  return 1 / Math.sqrt(Math.max(q, 1e-9))
}
