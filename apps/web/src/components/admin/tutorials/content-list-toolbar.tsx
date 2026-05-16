'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { captureClientEvent } from '@/lib/client-analytics'
import { createSavedFilter, deleteSavedFilter } from '@/app/admin/tutorials/saved-filter-actions'
import { bulkTutorialAction } from '@/app/admin/tutorials/bulk-actions'

interface SavedFilterChip {
  id: string
  name: string
  search: string
}

interface SelectionState {
  selectedIds: string[]
  matchingCount: number
  visibleIds: string[]
}

interface ContentListToolbarProps {
  savedFilters: SavedFilterChip[]
  currentSearchString: string
  canBulk: boolean
  canDelete: boolean
  selection: SelectionState
  onSelectionChange: (ids: string[]) => void
  totalMatching: number
}

/**
 * Renders the saved-filters chip row + bulk-action bar. State for which rows
 * are selected lives in the parent so the table can toggle checkboxes; the
 * bulk-action bar slides in when at least one row is selected.
 */
export function ContentListToolbar({
  savedFilters,
  currentSearchString,
  canBulk,
  canDelete,
  selection,
  onSelectionChange,
  totalMatching,
}: ContentListToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [bulkAction, setBulkAction] = useState('')
  const [matchAllFilter, setMatchAllFilter] = useState(false)
  const [pending, startTransition] = useTransition()
  const [savingFilter, setSavingFilter] = useState(false)

  const filterIsActive = !!currentSearchString.replace(/^\?/, '').trim()

  return (
    <div className="content-toolbar">
      {savedFilters.length > 0 && (
        <div className="content-saved-filters">
          <span className="content-saved-label">Saved</span>
          {savedFilters.map((f) => (
            <span key={f.id} className="content-saved-chip-wrap">
              <Link
                href={`${pathname}${f.search.startsWith('?') ? f.search : `?${f.search}`}`}
                className="content-saved-chip"
              >
                {f.name}
              </Link>
              <button
                type="button"
                aria-label={`Remove saved filter ${f.name}`}
                className="content-saved-remove"
                onClick={() => {
                  startTransition(async () => {
                    await deleteSavedFilter(f.id)
                  })
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {savingFilter ? (
        <form
          action={(fd) => {
            fd.set('filterQuery', currentSearchString)
            startTransition(async () => {
              await createSavedFilter(fd)
              setSavingFilter(false)
              captureClientEvent('admin_saved_filter_created', {
                filterKeys: Array.from(new URLSearchParams(currentSearchString.replace(/^\?/, '')).keys()),
              })
            })
          }}
          className="content-save-filter-form"
        >
          <input
            type="text"
            name="name"
            placeholder="Filter name"
            required
            autoFocus
            className="content-save-input"
          />
          <button type="submit" className="content-save-submit" disabled={pending}>
            Save
          </button>
          <button
            type="button"
            className="content-save-cancel"
            onClick={() => setSavingFilter(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        filterIsActive && (
          <button
            type="button"
            className="content-save-filter-cta"
            onClick={() => setSavingFilter(true)}
          >
            + Save current filter
          </button>
        )
      )}

      {canBulk && selection.selectedIds.length > 0 && (
        <div className="content-bulk-bar" role="region" aria-label="Bulk actions">
          <span className="content-bulk-count">
            {matchAllFilter
              ? `All ${totalMatching} matching`
              : `${selection.selectedIds.length} selected`}
          </span>

          {filterIsActive && (
            <label className="content-bulk-matching">
              <input
                type="checkbox"
                checked={matchAllFilter}
                onChange={(e) => setMatchAllFilter(e.target.checked)}
              />
              Apply to all {totalMatching} matching the filter
            </label>
          )}

          <form
            action={(fd) => {
              if (!bulkAction) return
              fd.set('action', bulkAction)
              if (matchAllFilter) {
                fd.set('mode', 'filter')
                fd.set('filterQuery', currentSearchString)
              } else {
                fd.set('mode', 'ids')
                fd.set('ids', selection.selectedIds.join(','))
              }
              startTransition(async () => {
                await bulkTutorialAction(fd)
                captureClientEvent('admin_bulk_action', {
                  action: bulkAction,
                  rowCount: matchAllFilter
                    ? totalMatching
                    : selection.selectedIds.length,
                  byFilterCriteria: matchAllFilter,
                })
                onSelectionChange([])
                router.refresh()
              })
            }}
            className="content-bulk-form"
          >
            <select
              name="action-picker"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="content-bulk-select"
            >
              <option value="">Choose action…</option>
              <option value="publish">Publish</option>
              <option value="unpublish">Unpublish</option>
              <option value="archive">Archive</option>
              {canDelete && <option value="delete">Delete</option>}
            </select>
            <button
              type="submit"
              className="content-bulk-apply"
              disabled={!bulkAction || pending}
            >
              {pending ? 'Working…' : 'Apply'}
            </button>
            <button
              type="button"
              className="content-bulk-clear"
              onClick={() => {
                onSelectionChange([])
                setBulkAction('')
                setMatchAllFilter(false)
              }}
            >
              Clear
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
