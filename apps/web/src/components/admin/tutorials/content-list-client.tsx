'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ContentListToolbar } from './content-list-toolbar'

// Plain string literal — importing TutorialStatus from @homemade/db would
// pull Prisma's runtime into the client bundle. Server keeps the enum.
export type TutorialStatusString =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'PENDING_MODERATION'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED'

export interface ContentRow {
  id: string
  slug: string
  title: string
  status: TutorialStatusString
  categoryName: string | null
  categorySlug: string | null
  publishedAt: string | null
  updatedAt: string
  heroUrl: string | null
  type: string
  creatorHandle: string | null
}

export interface SavedFilterChip {
  id: string
  name: string
  search: string
}

interface ContentListClientProps {
  rows: ContentRow[]
  savedFilters: SavedFilterChip[]
  currentSearchString: string
  totalMatching: number
  canBulk: boolean
  canDelete: boolean
  view: 'table' | 'grid'
}

export function ContentListClient({
  rows,
  savedFilters,
  currentSearchString,
  totalMatching,
  canBulk,
  canDelete,
  view,
}: ContentListClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const allVisibleSelected =
    rows.length > 0 && rows.every((r) => selectedIds.includes(r.id))

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !rows.some((r) => r.id === id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rows.map((r) => r.id)])))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <>
      <ContentListToolbar
        savedFilters={savedFilters}
        currentSearchString={currentSearchString}
        canBulk={canBulk}
        canDelete={canDelete}
        selection={{
          selectedIds,
          matchingCount: totalMatching,
          visibleIds: rows.map((r) => r.id),
        }}
        onSelectionChange={setSelectedIds}
        totalMatching={totalMatching}
      />

      {view === 'grid' ? (
        <ul className="content-grid">
          {rows.map((r) => (
            <li key={r.id} className="content-grid-card">
              <label className="content-grid-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onChange={() => toggleOne(r.id)}
                  aria-label={`Select ${r.title}`}
                />
              </label>
              <Link href={`/admin/tutorials/${r.id}`} className="content-grid-link">
                <div
                  className="content-grid-thumb"
                  style={{
                    backgroundImage: r.heroUrl ? `url(${r.heroUrl})` : undefined,
                  }}
                >
                  {!r.heroUrl && <span>—</span>}
                </div>
                <div className="content-grid-meta">
                  <span className="content-grid-title">{r.title}</span>
                  <StatusPill status={r.status} />
                  <span className="content-grid-cat">{r.categoryName ?? '—'}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <table className="content-table">
          <thead>
            <tr>
              <th className="content-table-checkbox">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  aria-label="Select all visible"
                />
              </th>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Published</th>
              <th aria-label="Edit" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="content-table-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r.id)}
                    onChange={() => toggleOne(r.id)}
                    aria-label={`Select ${r.title}`}
                  />
                </td>
                <td className="content-table-title">
                  <div className="content-table-title-row">
                    {r.heroUrl ? (
                      <span
                        className="content-table-thumb"
                        style={{ backgroundImage: `url(${r.heroUrl})` }}
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="content-table-thumb content-table-thumb-empty" aria-hidden="true" />
                    )}
                    <span>
                      <Link href={`/admin/tutorials/${r.id}`} className="content-table-link">
                        {r.title}
                      </Link>
                      <code className="content-table-slug">{r.slug}</code>
                    </span>
                  </div>
                </td>
                <td>{r.categoryName ?? '—'}</td>
                <td className="content-table-type">{r.type.toLowerCase()}</td>
                <td>
                  <Link
                    href={`?status=${r.status}`}
                    className="content-status-link"
                    title="Filter to this status"
                  >
                    <StatusPill status={r.status} />
                  </Link>
                </td>
                <td>{formatDate(r.updatedAt)}</td>
                <td>{r.publishedAt ? formatDate(r.publishedAt) : '—'}</td>
                <td>
                  <Link href={`/admin/tutorials/${r.id}`} className="content-table-edit">
                    edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

function StatusPill({ status }: { status: TutorialStatusString }) {
  return (
    <span className={`content-status-pill content-status-${status.toLowerCase()}`}>
      {status.toLowerCase().replace('_', ' ')}
    </span>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}
