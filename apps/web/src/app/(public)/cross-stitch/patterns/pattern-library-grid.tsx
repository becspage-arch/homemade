'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'

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
}

interface PatternLibraryGridProps {
  patterns: PatternCard[]
  subCategories: { slug: string; name: string }[]
  currentFilters: {
    sub: string | null
    difficulty: string | null
    size: string | null
    sort: string
    hasBackstitch: boolean
    hasFrenchKnots: boolean
  }
}

export function PatternLibraryGrid({
  patterns,
  subCategories,
  currentFilters,
}: PatternLibraryGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    router.push(qs ? `/cross-stitch/patterns?${qs}` : '/cross-stitch/patterns', { scroll: false })
  }

  return (
    <div className="cross-stitch-library-content">
      <aside className="cross-stitch-library-sidebar" aria-label="Filters">
        <h2><Filter size={14} strokeWidth={1.6} /> Filter</h2>

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
      </aside>

      <section className="cross-stitch-library-main">
        <div className="cross-stitch-library-sortbar">
          <span className="cross-stitch-library-result-count">
            {patterns.length} pattern{patterns.length === 1 ? '' : 's'}
          </span>
          <label className="cross-stitch-library-sort">
            <span>Sort</span>
            <select
              value={currentFilters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
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

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="cross-stitch-library-filter-group">
      <h3>{title}</h3>
      <div className="cross-stitch-library-filter-stack">{children}</div>
    </div>
  )
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={['cross-stitch-library-filter-button', active ? 'is-active' : ''].join(' ')}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function PatternCardItem({ pattern }: { pattern: PatternCard }) {
  const finishedW = (pattern.widthCells / pattern.fabricCountSuggested) * 2.54
  const finishedH = (pattern.heightCells / pattern.fabricCountSuggested) * 2.54
  const detailHref = pattern.slug ? `/cross-stitch/patterns/${pattern.slug}` : `/studio/cross-stitch?patternId=${pattern.id}`
  return (
    <li className="cross-stitch-library-card">
      <Link href={detailHref} className="cross-stitch-library-card-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pattern.thumbnailUrl} alt="" loading="lazy" />
        {pattern.premium && <span className="cross-stitch-library-card-badge">Premium</span>}
      </Link>
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
