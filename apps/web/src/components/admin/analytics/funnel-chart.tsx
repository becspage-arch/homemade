'use client'

import { CHART_COLORS, CHART_FONTS, sageShade } from './chart-theme'

interface FunnelStep {
  label: string
  count: number
}

/**
 * Vertical funnel. Bar width scales with count relative to the top stage.
 * Conversion percentages render next to each subsequent stage.
 */
export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  if (steps.length === 0) {
    return (
      <p
        style={{
          fontFamily: CHART_FONTS.label,
          color: CHART_COLORS.muted,
          fontSize: 13,
        }}
      >
        No funnel data yet.
      </p>
    )
  }
  const top = Math.max(1, steps[0]!.count)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
      {steps.map((step, i) => {
        const width = (step.count / top) * 100
        const prev = steps[i - 1]
        const conversionFromPrev =
          i === 0 || !prev || prev.count === 0
            ? null
            : (step.count / prev.count) * 100
        const conversionFromTop = i === 0 ? 100 : (step.count / top) * 100
        const fill = sageShade(conversionFromTop / 100)
        return (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 220,
                fontFamily: CHART_FONTS.label,
                fontSize: 13,
                color: CHART_COLORS.text,
                lineHeight: 1.3,
              }}
            >
              {step.label}
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <div
                style={{
                  width: `${width}%`,
                  minWidth: 2,
                  height: 36,
                  background: fill,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 12,
                  color:
                    conversionFromTop > 45
                      ? CHART_COLORS.surface
                      : CHART_COLORS.text,
                  fontFamily: CHART_FONTS.number,
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: 14,
                }}
              >
                {step.count.toLocaleString('en-GB')}
              </div>
            </div>
            <div
              style={{
                width: 110,
                textAlign: 'right',
                fontFamily: CHART_FONTS.label,
                fontSize: 11,
                color: CHART_COLORS.muted,
                letterSpacing: '0.06em',
              }}
            >
              {conversionFromPrev === null ? (
                <span>— top of funnel —</span>
              ) : (
                <span>
                  {conversionFromPrev.toFixed(1)}% from prev
                  <br />
                  <span style={{ color: CHART_COLORS.text }}>
                    {conversionFromTop.toFixed(1)}% overall
                  </span>
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
