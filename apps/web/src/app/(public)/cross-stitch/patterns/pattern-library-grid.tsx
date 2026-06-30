'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Search, X } from 'lucide-react'
import { PatternSaveHeart } from '@/components/public/pattern-save-heart'
import {
  TAG_AXES,
  TAG_AXIS_LABEL,
  TAG_AXIS_PARAM,
  DESIGNER_FILTER_MIN,
  type TagFacets,
  type DesignerFacet,
} from '@/lib/pattern-tag-axes'

interface PatternCard {
  id: string
  slug: string | null
  name: string
  widthCells: number
  heightCells: number
  colourCount: number
  totalStitches: number
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null
  estimatedHours: number | null
  hasBackstitch: boolean
  hasFrenchKnots: boolean
  premium: boolean
  fabricCountSuggested: number
  designerName: string | null
  designerSlug: string | null
  subCategorySlug: string | null
  subCategoryName: string | null
  thumbnailUrl: string
  /** Whether the signed-in reader has this pattern on their Make it list. */
  saved: boolean
}

interface PatternLibraryGridProps {
  patterns: PatternCard[]
  subCategories: { slug: string; name: string }[]
  /** Cross-craft tag axes (occasion / season / style / subject / audience). */
  tagFacets: TagFacets
  /**
   * Designers with published patterns in this category, with counts. The
   * Designer dropdown only renders once there are DESIGNER_FILTER_MIN of them —
   * a one- or two-designer category keeps it hidden.
   */
  designerFacets: DesignerFacet[]
  searchPlaceholder: string
  currentFilters: {
    sub: string | null
    difficulty: string | null
    size: string | null
    sort: string
    hasBackstitch: boolean
    hasFrenchKnots: boolean
    q: string | null
    occasion: string | null
    season: string | null
    style: string | null
    subject: string | null
    audience: string | null
    designer: string | null
  }
  /** Where the filter-link router pushes to. Defaults to /cross-stitch/patterns. */
  basePath?: string
}

const TAG_FILTER_KEYS = ['occasion', 'season', 'style', 'subject', 'audience'] as const

export function PatternLibraryGrid({
  patterns,
  subCategories,
  tagFacets,
  designerFacets,
  searchPlaceholder,
  currentFilters,
  basePath = '/cross-stitch/patterns',
}: PatternLibraryGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}#patterns` : `${basePath}#patterns`, { scroll: false })
  }

  // Which tag axes have terms to show — an empty axis (e.g. Audience on
  // cross-stitch) renders nothing.
  const activeAxes = TAG_AXES.filter((axis) => tagFacets[axis]?.length)

  const currentTag = (axis: (typeof TAG_AXES)[number]): string | null =>
    currentFilters[TAG_AXIS_PARAM[axis] as keyof typeof currentFilters] as string | null

  // The Designer dropdown only appears once the category has a real roster
  // (DESIGNER_FILTER_MIN+). A selected designer still counts as active even if
  // the threshold isn't met, so a shared/deep link keeps Clear-all working.
  const showDesignerFilter = designerFacets.length >= DESIGNER_FILTER_MIN

  const tagFiltersActive = TAG_FILTER_KEYS.some((k) => currentFilters[k])
  const anyFilterActive =
    Boolean(currentFilters.sub) ||
    Boolean(currentFilters.difficulty) ||
    Boolean(currentFilters.size) ||
    currentFilters.hasBackstitch ||
    currentFilters.hasFrenchKnots ||
    Boolean(currentFilters.q) ||
    Boolean(currentFilters.designer) ||
    tagFiltersActive

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    for (const k of [
      'sub',
      'difficulty',
      'size',
      'hasBackstitch',
      'hasFrenchKnots',
      'q',
      'minColour',
      'maxColour',
      'maxHours',
      'designer',
      ...TAG_FILTER_KEYS,
    ]) {
      params.delete(k)
    }
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}#patterns` : `${basePath}#patterns`, { scroll: false })
  }

  return (
    <div className="cross-stitch-library-content">
      <aside className="cross-stitch-library-sidebar" aria-label="Filters">
        <div className="cross-stitch-library-sidebar-head">
          <h2><Filter size={14} strokeWidth={1.6} /> Filter</h2>
          {anyFilterActive && (
            <button type="button" className="cross-stitch-library-clear" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>

        <FilterGroup title="Theme">
          <FilterButton
            label="All themes"
            active={!currentFilters.sub}
            onClick={() => updateFilter('sub', null)}
          />
          {subCategories.map((sc) => (
            <FilterButton
              key={sc.slug}
              label={sc.name}
              active={currentFilters.sub === sc.slug}
              onClick={() => updateFilter('sub', sc.slug)}
            />
          ))}
        </FilterGroup>

        {activeAxes.map((axis) => {
          const param = TAG_AXIS_PARAM[axis]
          const selected = currentTag(axis)
          return (
            <FilterGroup key={axis} title={TAG_AXIS_LABEL[axis]}>
              {tagFacets[axis].map((term) => (
                <FilterButton
                  key={term.slug}
                  label={term.name}
                  count={term.count}
                  active={selected === term.slug}
                  onClick={() => updateFilter(param, selected === term.slug ? null : term.slug)}
                />
              ))}
            </FilterGroup>
          )
        })}

        <FilterGroup title="Difficulty">
          {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((d) => (
            <FilterButton
              key={d}
              label={pretty(d)}
              active={currentFilters.difficulty === d}
              onClick={() => updateFilter('difficulty', currentFilters.difficulty === d ? null : d)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Size">
          {[
            { v: 's', l: 'Small' },
            { v: 'm', l: 'Medium' },
            { v: 'l', l: 'Large' },
          ].map((s) => (
            <FilterButton
              key={s.v}
              label={s.l}
              active={currentFilters.size === s.v}
              onClick={() => updateFilter('size', currentFilters.size === s.v ? null : s.v)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Includes">
          <FilterButton
            label="Back-stitch"
            active={currentFilters.hasBackstitch}
            onClick={() => updateFilter('hasBackstitch', currentFilters.hasBackstitch ? null : '1')}
          />
          <FilterButton
            label="French knots"
            active={currentFilters.hasFrenchKnots}
            onClick={() => updateFilter('hasFrenchKnots', currentFilters.hasFrenchKnots ? null : '1')}
          />
        </FilterGroup>

        {showDesignerFilter && (
          <FilterGroup title="Designer">
            <select
              className="cross-stitch-library-designer-select"
              aria-label="Filter by designer"
              value={currentFilters.designer ?? ''}
              onChange={(e) => updateFilter('designer', e.target.value || null)}
            >
              <option value="">All designers</option>
              {designerFacets.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({d.count})
                </option>
              ))}
            </select>
          </FilterGroup>
        )}
      </aside>

      <section className="cross-stitch-library-main">
        <div className="cross-stitch-library-sortbar">
          <InlineSearch
            value={currentFilters.q ?? ''}
            placeholder={searchPlaceholder}
            onCommit={(v) => updateFilter('q', v || null)}
          />
          <span className="cross-stitch-library-result-count">
            {patterns.length} pattern{patterns.length === 1 ? '' : 's'}
          </span>
          <label className="cross-stitch-library-sort">
            <span>Sort</span>
            <select
              value={currentFilters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="popular">Most popular</option>
              <option value="newest">Newest</option>
              <option value="featured">Featured</option>
              <option value="size">By size</option>
            </select>
          </label>
        </div>

        {patterns.length === 0 ? (
          <div className="cross-stitch-library-empty">
            <p>No patterns match these filters yet.</p>
            <p className="muted">Try lifting a filter, or browse all themes.</p>
          </div>
        ) : (
          <ul className="cross-stitch-library-grid">
            {patterns.map((p) => (
              <PatternCardItem key={p.id} pattern={p} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

/**
 * Inline search box for the grid header. Uncontrolled native form (so it needs
 * no client state and stays simple): it commits the typed query to the `q` URL
 * param on submit — Enter or the search icon — and the X clears it. `key={value}`
 * resets the field whenever the committed query changes from elsewhere (Clear
 * all, the back button).
 */
function InlineSearch({
  value,
  placeholder,
  onCommit,
}: {
  value: string
  placeholder: string
  onCommit: (value: string) => void
}) {
  return (
    <form
      key={value}
      role="search"
      className="cross-stitch-library-search"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        onCommit(String(fd.get('q') ?? '').trim())
      }}
    >
      <button type="submit" aria-label="Search patterns" className="cross-stitch-library-search-go">
        <Search size={15} strokeWidth={1.7} aria-hidden="true" />
      </button>
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder={placeholder}
        aria-label="Search patterns"
        autoComplete="off"
      />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onCommit('')}>
          <X size={14} strokeWidth={1.8} />
        </button>
      )}
    </form>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="cross-stitch-library-filter-group">
      <h3>{title}</h3>
      <div className="cross-stitch-library-filter-stack">{children}</div>
    </div>
  )
}

function FilterButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string
  active: boolean
  onClick: () => void
  count?: number
}) {
  return (
    <button
      type="button"
      className={['cross-stitch-library-filter-button', active ? 'is-active' : ''].join(' ')}
      onClick={onClick}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className="cross-stitch-library-filter-count">{count}</span>
      )}
    </button>
  )
}

function PatternCardItem({ pattern }: { pattern: PatternCard }) {
  const finishedW = (pattern.widthCells / pattern.fabricCountSuggested) * 2.54
  const finishedH = (pattern.heightCells / pattern.fabricCountSuggested) * 2.54
  const detailHref = pattern.slug ? `/cross-stitch/patterns/${pattern.slug}` : `/studio/cross-stitch?patternId=${pattern.id}`
  return (
    <li className="cross-stitch-library-card" style={{ position: 'relative' }}>
      <Link href={detailHref} className="cross-stitch-library-card-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pattern.thumbnailUrl} alt="" loading="lazy" />
        {pattern.premium && <span className="cross-stitch-library-card-badge">Premium</span>}
      </Link>
      <PatternSaveHeart patternId={pattern.id} initialSaved={pattern.saved} />
      <div className="cross-stitch-library-card-body">
        <h4 className="cross-stitch-library-card-name">
          <Link href={detailHref}>{pattern.name}</Link>
        </h4>
        {pattern.designerName && (
          <p className="cross-stitch-library-card-designer">by {pattern.designerName}</p>
        )}
        <ul className="cross-stitch-library-card-meta">
          <li>{pattern.widthCells} × {pattern.heightCells}</li>
          <li>{pattern.colourCount} colours</li>
          <li>{finishedW.toFixed(1)} × {finishedH.toFixed(1)} cm</li>
        </ul>
        <div className="cross-stitch-library-card-actions">
          <Link
            href={`/studio/cross-stitch?patternId=${pattern.id}`}
            className="cross-stitch-library-card-cta primary"
          >
            Stitch this
          </Link>
          <Link href={detailHref} className="cross-stitch-library-card-cta ghost">
            Preview
          </Link>
        </div>
      </div>
    </li>
  )
}

function pretty(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
}
