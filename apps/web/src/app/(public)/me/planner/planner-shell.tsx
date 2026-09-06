'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UpgradeBlock } from '@/components/premium/UpgradeBlock'
import { PremiumDownloadButton } from '@/components/premium/PremiumDownloadButton'
import { PLANNER_GATE_COPY, PLANNER_EXPORT_GATE_COPY } from '@/lib/planner/guard'
import type {
  PlannerProjectView,
  PlannerStashView,
  PlannerMaterials,
} from '@/lib/planner/service'

interface PlannerShellProps {
  craft: string
  projects: PlannerProjectView[]
  premium: boolean
  materials: PlannerMaterials | null
  stash: PlannerStashView[]
}

const STATUS_GROUPS: { status: PlannerProjectView['status']; label: string }[] = [
  { status: 'QUEUED', label: 'In the queue' },
  { status: 'IN_PROGRESS', label: 'Stitching now' },
  { status: 'FINISHED', label: 'Finished' },
]

function fmt(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}

export function PlannerShell({
  craft,
  projects,
  premium,
  materials,
  stash,
}: PlannerShellProps) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function mutate(run: () => Promise<Response>) {
    setError(null)
    start(async () => {
      try {
        const res = await run()
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          setError(body?.error ?? 'Something went wrong. Please try again.')
          return
        }
        router.refresh()
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  const updateProject = (id: string, body: Record<string, unknown>) =>
    mutate(() =>
      fetch(`/api/studio/planner/projects/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    )

  const removeProject = (id: string) =>
    mutate(() => fetch(`/api/studio/planner/projects/${id}`, { method: 'DELETE' }))

  return (
    <div className="planner">
      <header className="planner-head">
        <div>
          <p className="planner-overline">Cross-stitch</p>
          <h1 className="planner-title">Your project planner</h1>
          <p className="planner-lede">
            Line up what you want to stitch, work out the floss it needs, and check it
            against your stash before you shop.
          </p>
        </div>
        {projects.some((p) => p.craft === craft) && (
          <PremiumDownloadButton
            className="planner-download"
            href={`/api/studio/planner/export?craft=${craft}`}
            isPremium={premium}
            gateMessage={PLANNER_EXPORT_GATE_COPY.message}
            gateRationale={PLANNER_EXPORT_GATE_COPY.rationale}
          >
            Download plan (PDF)
          </PremiumDownloadButton>
        )}
      </header>

      {error && (
        <p className="planner-error" role="alert">
          {error}
        </p>
      )}

      <section className="planner-queue" aria-label="Your projects">
        {projects.length === 0 ? (
          <div className="planner-empty">
            <p>Your plan is empty.</p>
            <p>
              Browse the{' '}
              <Link href="/cross-stitch/patterns">cross-stitch patterns</Link> and add the
              ones you want to make.
            </p>
          </div>
        ) : (
          STATUS_GROUPS.map((group) => {
            const inGroup = projects.filter((p) => p.status === group.status)
            if (inGroup.length === 0) return null
            return (
              <div key={group.status} className="planner-group">
                <h2 className="planner-group-title">
                  {group.label} <span>{inGroup.length}</span>
                </h2>
                <ul className="planner-cards">
                  {inGroup.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      pending={pending}
                      onUpdate={updateProject}
                      onRemove={removeProject}
                    />
                  ))}
                </ul>
              </div>
            )
          })
        )}
      </section>

      <section className="planner-premium" aria-label="Materials and stash">
        <h2 className="planner-section-title">Materials and shopping list</h2>
        {premium ? (
          <PremiumPanel
            craft={craft}
            materials={materials}
            stash={stash}
            pending={pending}
            mutate={mutate}
          />
        ) : (
          <>
            <UpgradeBlock
              message={PLANNER_GATE_COPY.message}
              rationale={PLANNER_GATE_COPY.rationale}
            />
            {/* The stash itself is free, so a non-premium maker still gets the
                owned-colour count on every pattern page and library card. */}
            <p className="planner-stash-free">
              Your <Link href="/me/floss-stash">floss stash</Link> is free to keep. Every
              pattern page counts its colours against it.
            </p>
          </>
        )}
      </section>
    </div>
  )
}

function ProjectCard({
  project,
  pending,
  onUpdate,
  onRemove,
}: {
  project: PlannerProjectView
  pending: boolean
  onUpdate: (id: string, body: Record<string, unknown>) => void
  onRemove: (id: string) => void
}) {
  const fabricCount =
    typeof project.settings.fabricCount === 'number'
      ? (project.settings.fabricCount as number)
      : ''

  return (
    <li className="planner-card">
      {project.meta?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="planner-card-img" src={project.meta.imageUrl} alt="" loading="lazy" />
      ) : (
        <div className="planner-card-img planner-card-img--placeholder" aria-hidden="true" />
      )}
      <div className="planner-card-body">
        <p className="planner-card-name">
          {project.meta?.href ? (
            <Link href={project.meta.href}>{project.meta.name}</Link>
          ) : (
            (project.meta?.name ?? 'Pattern no longer available')
          )}
        </p>
        {project.meta?.spec && <p className="planner-card-spec">{project.meta.spec}</p>}

        <div className="planner-card-controls">
          <label className="planner-field">
            <span>Status</span>
            <select
              value={project.status}
              disabled={pending}
              onChange={(e) => onUpdate(project.id, { status: e.target.value })}
            >
              <option value="QUEUED">In the queue</option>
              <option value="IN_PROGRESS">Stitching now</option>
              <option value="FINISHED">Finished</option>
            </select>
          </label>

          <label className="planner-field">
            <span>Fabric count</span>
            <input
              type="number"
              min={6}
              max={40}
              inputMode="numeric"
              defaultValue={fabricCount}
              placeholder="default"
              disabled={pending}
              onBlur={(e) => {
                const v = e.target.value.trim()
                const n = v === '' ? null : Number(v)
                const current = fabricCount === '' ? null : fabricCount
                if (n === current) return
                onUpdate(project.id, { settings: { fabricCount: n } })
              }}
            />
          </label>
        </div>
      </div>
      <button
        type="button"
        className="planner-card-remove"
        disabled={pending}
        onClick={() => onRemove(project.id)}
        aria-label="Remove from plan"
      >
        Remove
      </button>
    </li>
  )
}

function PremiumPanel({
  craft,
  materials,
  stash,
  pending,
  mutate,
}: {
  craft: string
  materials: PlannerMaterials | null
  stash: PlannerStashView[]
  pending: boolean
  mutate: (run: () => Promise<Response>) => void
}) {
  const rows = materials?.rows ?? []
  const totals = materials?.totals

  return (
    <div className="planner-panel">
      {materials?.notes.map((note) => (
        <p key={note} className="planner-note">
          {note}
        </p>
      ))}

      {rows.length === 0 ? (
        <p className="planner-empty-note">
          Add a pattern to your plan to see the floss it needs.
        </p>
      ) : (
        <table className="planner-materials">
          <thead>
            <tr>
              <th>Colour</th>
              <th>Code</th>
              <th className="num">Need</th>
              <th className="num">Have</th>
              <th className="num">Buy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={row.quantityToBuy === 0 ? 'is-covered' : ''}>
                <td className="planner-colour">
                  <span
                    className="planner-swatch"
                    style={{ background: row.colourRgb ?? 'transparent' }}
                    aria-hidden="true"
                  />
                  {row.name}
                </td>
                <td>
                  {row.brand} {row.code}
                </td>
                <td className="num">{fmt(row.quantityNeeded)}</td>
                <td className="num">{row.quantityOwned > 0 ? fmt(row.quantityOwned) : '—'}</td>
                <td className="num strong">{fmt(row.quantityToBuy)}</td>
              </tr>
            ))}
          </tbody>
          {totals && (
            <tfoot>
              <tr>
                <td colSpan={2}>{totals.colours} colours</td>
                <td className="num">{fmt(totals.skeinsNeeded)}</td>
                <td className="num">{fmt(totals.skeinsOwned)}</td>
                <td className="num strong">{fmt(totals.skeinsToBuy)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      )}

      <StashManager craft={craft} stash={stash} pending={pending} mutate={mutate} />
    </div>
  )
}

function StashManager({
  craft,
  stash,
  pending,
  mutate,
}: {
  craft: string
  stash: PlannerStashView[]
  pending: boolean
  mutate: (run: () => Promise<Response>) => void
}) {
  const [brand, setBrand] = useState('DMC')
  const [code, setCode] = useState('')
  const [qty, setQty] = useState('1')

  function add() {
    const trimmed = code.trim()
    if (!trimmed) return
    mutate(() =>
      fetch('/api/studio/planner/stash', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          craft,
          brand,
          code: trimmed,
          quantityOwned: Number(qty) || 1,
        }),
      }),
    )
    setCode('')
    setQty('1')
  }

  const removeItem = (id: string) =>
    mutate(() => fetch(`/api/studio/planner/stash/${id}`, { method: 'DELETE' }))

  return (
    <div className="planner-stash">
      <h3 className="planner-stash-title">Your stash</h3>
      <p className="planner-stash-lede">
        Add the skeins you already own and the shopping list updates to show only what is
        left to buy.
      </p>

      <div className="planner-stash-add">
        <label className="planner-field">
          <span>Brand</span>
          <select value={brand} disabled={pending} onChange={(e) => setBrand(e.target.value)}>
            <option value="DMC">DMC</option>
            <option value="ANCHOR">Anchor</option>
            <option value="MADEIRA">Madeira</option>
          </select>
        </label>
        <label className="planner-field">
          <span>Code</span>
          <input
            type="text"
            value={code}
            placeholder="e.g. 310"
            disabled={pending}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <label className="planner-field">
          <span>Skeins</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={qty}
            disabled={pending}
            onChange={(e) => setQty(e.target.value)}
          />
        </label>
        <button type="button" className="planner-stash-btn" disabled={pending} onClick={add}>
          Add to stash
        </button>
      </div>

      {stash.length > 0 && (
        <ul className="planner-stash-list">
          {stash.map((item) => (
            <li key={item.id}>
              <span
                className="planner-swatch"
                style={{ background: item.colourRgb ?? 'transparent' }}
                aria-hidden="true"
              />
              <span className="planner-stash-code">
                {item.brand} {item.code}
              </span>
              {item.name && <span className="planner-stash-name">{item.name}</span>}
              <span className="planner-stash-qty">{fmt(item.quantityOwned)} skeins</span>
              <button
                type="button"
                className="planner-stash-remove"
                disabled={pending}
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.brand} ${item.code} from stash`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
