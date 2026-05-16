'use client'

import { useMemo, useState } from 'react'
import { CHART_COLORS, CHART_FONTS, sageShade, readableOn } from './chart-theme'

interface Cell {
  cohortWeek: string
  weeksAfterSignup: number
  cohortSize: number
  retainedCount: number
  retentionRate: number
}

interface Props {
  cells: Cell[]
  /** Largest weeksAfterSignup any cohort has data for. */
  maxWeek: number
}

/**
 * Cohort retention heatmap — the flagship product-health chart.
 *
 * Vertical axis = signup week, most recent at the top.
 * Horizontal axis = weeks after signup (0 = signup week itself).
 * Each cell = retention percentage of that cohort N weeks in, rendered as
 * a sage-shade with the percent label on top.
 *
 * Below the heatmap: D1 / D7 / D30 / D90 toggle. Switching to D1 / D7 etc.
 * filters the cells to the matching weeksAfterSignup and renders as a
 * cohort-vs-rate bar list (cleaner read for single-week views).
 */
export function CohortHeatmap({ cells, maxWeek }: Props) {
  type Mode = 'heatmap' | 'd1' | 'd7' | 'd30' | 'd90'
  const [mode, setMode] = useState<Mode>('heatmap')

  const cohorts = useMemo(() => {
    const set = new Set(cells.map((c) => c.cohortWeek))
    return Array.from(set).sort().reverse()
  }, [cells])

  const cellIndex = useMemo(() => {
    const map = new Map<string, Cell>()
    for (const c of cells) {
      map.set(`${c.cohortWeek}|${c.weeksAfterSignup}`, c)
    }
    return map
  }, [cells])

  if (cohorts.length === 0) {
    return (
      <p
        style={{
          fontFamily: CHART_FONTS.label,
          fontSize: 13,
          color: CHART_COLORS.muted,
          padding: 16,
        }}
      >
        No cohort rollup data yet. The nightly cron writes the first rows once any
        cohort has elapsed weeks on the books.
      </p>
    )
  }

  const milestoneMap: Record<Mode, number | null> = {
    heatmap: null,
    d1: 0,
    d7: 1,
    d30: 4,
    d90: 12,
  }

  if (mode !== 'heatmap') {
    const week = milestoneMap[mode] ?? 1
    const rows = cohorts
      .map((label) => {
        const cell = cellIndex.get(`${label}|${week}`)
        return cell ? { label, rate: cell.retentionRate, size: cell.cohortSize } : null
      })
      .filter((r): r is { label: string; rate: number; size: number } => r !== null)

    return (
      <div>
        <MilestoneToggle mode={mode} setMode={setMode} />
        <div style={{ marginTop: 16 }}>
          {rows.length === 0 ? (
            <p
              style={{
                fontFamily: CHART_FONTS.label,
                fontSize: 13,
                color: CHART_COLORS.muted,
              }}
            >
              No cohorts have reached week {week} yet.
            </p>
          ) : (
            rows.map((r) => (
              <div
                key={r.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 80px 70px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '6px 0',
                  borderTop: `0.5px solid ${CHART_COLORS.grid}`,
                  fontFamily: CHART_FONTS.label,
                  fontSize: 12,
                  color: CHART_COLORS.text,
                }}
              >
                <span>{r.label}</span>
                <div
                  style={{
                    background: CHART_COLORS.grid,
                    height: 14,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      background: CHART_COLORS.primary,
                      width: `${Math.max(2, r.rate * 100)}%`,
                      height: '100%',
                    }}
                  />
                </div>
                <span style={{ fontFamily: CHART_FONTS.number, fontVariantNumeric: 'tabular-nums' }}>
                  {(r.rate * 100).toFixed(1)}%
                </span>
                <span
                  style={{
                    fontFamily: CHART_FONTS.number,
                    fontVariantNumeric: 'tabular-nums',
                    color: CHART_COLORS.muted,
                    fontSize: 11,
                  }}
                >
                  n={r.size}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const columns: number[] = []
  for (let w = 0; w <= maxWeek; w++) columns.push(w)

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <table
          style={{
            borderCollapse: 'separate',
            borderSpacing: 2,
            fontFamily: CHART_FONTS.label,
            fontSize: 11,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  fontWeight: 400,
                  color: CHART_COLORS.muted,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Cohort
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '6px 8px',
                  fontWeight: 400,
                  color: CHART_COLORS.muted,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                n
              </th>
              {columns.map((w) => (
                <th
                  key={w}
                  style={{
                    fontWeight: 400,
                    fontSize: 10,
                    color: CHART_COLORS.muted,
                    minWidth: 44,
                    padding: '6px 0',
                  }}
                >
                  W{w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((label) => {
              const w0 = cellIndex.get(`${label}|0`)
              const size = w0?.cohortSize ?? 0
              return (
                <tr key={label}>
                  <td
                    style={{
                      padding: '4px 8px',
                      color: CHART_COLORS.text,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: '4px 8px',
                      textAlign: 'right',
                      fontFamily: CHART_FONTS.number,
                      fontVariantNumeric: 'tabular-nums',
                      color: CHART_COLORS.muted,
                    }}
                  >
                    {size}
                  </td>
                  {columns.map((w) => {
                    const cell = cellIndex.get(`${label}|${w}`)
                    if (!cell) {
                      return (
                        <td
                          key={w}
                          style={{ background: 'transparent', minWidth: 44 }}
                        />
                      )
                    }
                    const bg = sageShade(cell.retentionRate)
                    const fg = readableOn(cell.retentionRate)
                    return (
                      <td
                        key={w}
                        title={`${label} W${w}: ${(cell.retentionRate * 100).toFixed(1)}% (${cell.retainedCount}/${cell.cohortSize})`}
                        style={{
                          background: bg,
                          color: fg,
                          fontFamily: CHART_FONTS.number,
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: 11,
                          textAlign: 'center',
                          padding: '6px 0',
                          minWidth: 44,
                          borderRadius: 2,
                        }}
                      >
                        {Math.round(cell.retentionRate * 100)}%
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <MilestoneToggle mode={mode} setMode={setMode} />
    </div>
  )
}

function MilestoneToggle({
  mode,
  setMode,
}: {
  mode: 'heatmap' | 'd1' | 'd7' | 'd30' | 'd90'
  setMode: (m: 'heatmap' | 'd1' | 'd7' | 'd30' | 'd90') => void
}) {
  const opts: { value: typeof mode; label: string }[] = [
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'd1', label: 'W0 — signup week' },
    { value: 'd7', label: 'W1 — first week' },
    { value: 'd30', label: 'W4 — first month' },
    { value: 'd90', label: 'W12 — three months' },
  ]
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        marginTop: 18,
        flexWrap: 'wrap',
      }}
    >
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => setMode(o.value)}
          style={{
            padding: '6px 12px',
            fontFamily: CHART_FONTS.label,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            background:
              mode === o.value ? CHART_COLORS.primary : 'transparent',
            color:
              mode === o.value ? CHART_COLORS.surface : CHART_COLORS.muted,
            border: `0.5px solid ${mode === o.value ? CHART_COLORS.primary : CHART_COLORS.grid}`,
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
