import Link from 'next/link'

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

interface FilterChipsProps {
  categorySlug: string
  /** Show equipment chips (pottery + future kiln/wheel crafts). */
  showEquipment?: boolean
  activeDifficulty: Difficulty | null
  activeEquipment: 'none' | 'no-kiln' | 'no-wheel' | null
  /** Preserve other active filters (e.g. ?sub=) when toggling. */
  preserveQuery?: Record<string, string>
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
]

const EQUIPMENT_OPTIONS: { value: 'none' | 'no-kiln' | 'no-wheel'; label: string }[] = [
  { value: 'none', label: 'No kiln, no wheel' },
  { value: 'no-kiln', label: 'No kiln' },
  { value: 'no-wheel', label: 'No wheel' },
]

/**
 * Quiet filter row below the sub-category chip strip. Sage-outline
 * chips for difficulty (always) and equipment (kiln/wheel crafts
 * only). Clicking an active chip toggles it off.
 */
export function CategoryFilterChips({
  categorySlug,
  showEquipment = false,
  activeDifficulty,
  activeEquipment,
  preserveQuery = {},
}: FilterChipsProps) {
  function hrefFor(diff: Difficulty | null, eq: 'none' | 'no-kiln' | 'no-wheel' | null): string {
    const params = new URLSearchParams(preserveQuery)
    params.delete('difficulty')
    params.delete('equipment')
    if (diff) params.set('difficulty', diff.toLowerCase())
    if (eq) params.set('equipment', eq)
    const q = params.toString()
    return q ? `/${categorySlug}?${q}` : `/${categorySlug}`
  }

  return (
    <div className="category-filter-row" aria-label="Filters">
      {DIFFICULTIES.map((d) => {
        const isActive = activeDifficulty === d.value
        const nextDiff = isActive ? null : d.value
        return (
          <Link
            key={d.value}
            href={hrefFor(nextDiff, activeEquipment)}
            className={`category-filter-chip${isActive ? ' is-active' : ''}`}
          >
            {d.label}
          </Link>
        )
      })}
      {showEquipment &&
        EQUIPMENT_OPTIONS.map((e) => {
          const isActive = activeEquipment === e.value
          const nextEq = isActive ? null : e.value
          return (
            <Link
              key={e.value}
              href={hrefFor(activeDifficulty, nextEq)}
              className={`category-filter-chip${isActive ? ' is-active' : ''}`}
            >
              {e.label}
            </Link>
          )
        })}
    </div>
  )
}
