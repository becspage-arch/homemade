'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Search, X } from 'lucide-react'
import {
  TAG_AXES,
  TAG_AXIS_LABEL,
  TAG_AXIS_PARAM,
  DESIGNER_FILTER_MIN,
  type TagFacets,
  type DesignerFacet,
} from '@/lib/pattern-tag-axes'

interface NeedleworkPatternCardData {
  id: string
  slug: string | null
  name: string
  /** Pre-resolved card image URL (hero → thumbnail fallback), or null. */
  thumbnailUrl: string | null
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null
  /** Human discipline label, e.g. "Surface embroidery". */
  disciplineLabel: string | null
  /** Finished size, e.g. "150 × 150 mm". Null when not derivable. */
  finishedSizeText: string | null
  colourCount: number
  premium: boolean
  designerName: string | null
  designerSlug: string | null
  subCategoryName: string | null
  subCategorySlug: string | null
}

interface SubCategoryRef {
  slug: string
  name: string
}

interface Props {
  patterns: NeedleworkPatternCardData[]
  subCategories: SubCategoryRef[]
  tagFacets: TagFacets
  /** Designers with published patterns here; gates the Designer dropdown. */
  designerFacets: DesignerFacet[]
  searchPlaceholder: string
  currentFilters: {
    sub: string | null
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null
    sort: string
    q: string | null
    occasion: string | null
    season: string | null
    style: string | null
    subject: string | null
    audience: string | null
    designer: string | null
  }
  basePath: string
}

const TAG_FILTER_KEYS = ['occasion', 'season', 'style', 'subject', 'audience'] as const

/**
 * Needlework pattern library grid. Shares the cross-stitch / crochet library
 * shell + styles (sidebar filters + inline search + sort) so the pattern
 * categories read the same, with needlework-specific card content (discipline /
 * finished size / colours). Cards open the public pattern detail page (the
 * free-with-login Studio + transfer template live there).
 */
export function NeedleworkPatternGrid({
  patterns,
  subCategories,
  tagFacets,
  designerFacets,
  searchPlaceholder,
  currentFilters,
  basePath,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}#patterns` : `${basePath}#patterns`, { scroll: false })
  }

  const activeAxes = TAG_AXES.filter((axis) => tagFacets[axis]?.length)
  const currentTag = (axis: (typeof TAG_AXES)[number]): string | null =>
    currentFilters[TAG_AXIS_PARAM[axis] as keyof typeof currentFilters] as string | null

  const showDesignerFilter = designerFacets.length >= DESIGNER_FILTER_MIN

  const anyFilterActive =
    Boolean(currentFilters.sub) ||
    Boolean(currentFilters.difficulty) ||
    Boolean(currentFilters.q) ||
    Boolean(currentFilters.designer) ||
    TAG_FILTER_KEYS.some((k) => currentFilters[k])

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    for (const k of ['sub', 'difficulty', 'q', 'designer', ...TAG_FILTER_KEYS]) params.delete(k)
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

        <FilterGroup title="Section">
          <FilterButton label="All sections" active={!currentFilters.sub} onClick={() => updateFilter('sub', null)} />
          {subCategories.map((s) => (
            <FilterButton
              key={s.slug}
              label={s.name}
              active={currentFilters.sub === s.slug}
              onClick={() => updateFilter('sub', s.slug)}
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
            <select value={currentFilters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
              <option value="newest">Newest</option>
              <option value="name">By name</option>
              <option value="colours">Most colours</option>
            </select>
          </label>
        </div>

        {patterns.length === 0 ? (
          <div className="cross-stitch-library-empty">
            <p>No patterns match these filters yet.</p>
            <p className="muted">Try lifting a filter, or browse all sections.</p>
          </div>
        ) : (
          <ul className="cross-stitch-library-grid">
            {patterns.map((p) => (
              <NeedleworkCard key={p.id} pattern={p} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

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
      {typeof count === 'number' && <span className="cross-stitch-library-filter-count">{count}</span>}
    </button>
  )
}

function NeedleworkCard({ pattern: p }: { pattern: NeedleworkPatternCardData }) {
  const href = p.slug ? `/needlework/patterns/${p.slug}` : '/needlework'
  const meta = [
    p.subCategoryName ?? p.disciplineLabel,
    p.difficulty ? pretty(p.difficulty) : null,
    p.finishedSizeText,
    p.colourCount > 0 ? `${p.colourCount} colour${p.colourCount === 1 ? '' : 's'}` : null,
  ].filter(Boolean)
  return (
    <li className="cross-stitch-library-card">
      <Link href={href} className="cross-stitch-library-card-thumb">
        {p.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.thumbnailUrl} alt="" loading="lazy" />
        ) : (
          <span aria-hidden />
        )}
        {p.premium && <span className="cross-stitch-library-card-badge">Premium</span>}
      </Link>
      <div className="cross-stitch-library-card-body">
        <h4 className="cross-stitch-library-card-name">
          <Link href={href}>{p.name}</Link>
        </h4>
        {p.designerName && <p className="cross-stitch-library-card-designer">by {p.designerName}</p>}
        {meta.length > 0 && (
          <ul className="cross-stitch-library-card-meta">
            {meta.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        )}
        <div className="cross-stitch-library-card-actions">
          <Link href={href} className="cross-stitch-library-card-cta primary">
            View pattern
          </Link>
        </div>
      </div>
    </li>
  )
}

function pretty(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
}
