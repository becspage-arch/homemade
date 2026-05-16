import type { ReactNode } from 'react'
import { CHART_FONTS, CHART_COLORS } from './chart-theme'

/**
 * Shared wrapper for every chart on /admin/analytics. Holds the title in
 * Fraunces, an optional headline KPI + delta above the chart, and the
 * chart body itself. Padding + max width are consistent across cards so
 * the dashboards feel like one product, not eight.
 */
export function ChartCard({
  title,
  kpi,
  delta,
  description,
  children,
  fullBleed,
}: {
  title: string
  kpi?: string | number
  delta?: { value: string; tone?: 'positive' | 'negative' | 'neutral' }
  description?: string
  children: ReactNode
  fullBleed?: boolean
}) {
  const deltaColor =
    delta?.tone === 'positive'
      ? CHART_COLORS.primary
      : delta?.tone === 'negative'
        ? CHART_COLORS.accent
        : CHART_COLORS.muted

  return (
    <section
      style={{
        background: CHART_COLORS.surface,
        border: `0.5px solid ${CHART_COLORS.grid}`,
        borderRadius: 6,
        padding: fullBleed ? '20px 6px 8px' : 20,
        marginBottom: 32,
      }}
    >
      <header style={{ padding: fullBleed ? '0 16px' : 0, marginBottom: kpi ? 6 : 16 }}>
        <h2
          style={{
            fontFamily: CHART_FONTS.title,
            fontWeight: 400,
            fontSize: 17,
            color: CHART_COLORS.text,
            margin: 0,
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </h2>
        {description ? (
          <p
            style={{
              fontFamily: CHART_FONTS.label,
              fontSize: 12,
              color: CHART_COLORS.muted,
              margin: '4px 0 0',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        ) : null}
      </header>

      {kpi !== undefined ? (
        <div style={{ padding: fullBleed ? '0 16px' : 0, marginBottom: 16 }}>
          <div
            style={{
              fontFamily: CHART_FONTS.title,
              fontWeight: 400,
              fontSize: 36,
              color: CHART_COLORS.text,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {kpi}
          </div>
          {delta ? (
            <div
              style={{
                fontFamily: CHART_FONTS.number,
                fontVariantNumeric: 'tabular-nums',
                fontSize: 12,
                color: deltaColor,
                marginTop: 4,
                letterSpacing: '0.02em',
              }}
            >
              {delta.value}
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ width: '100%' }}>{children}</div>
    </section>
  )
}

/**
 * Single KPI card for the row at the top of /admin/analytics. Compact —
 * fits four-across on desktop, two-across on mobile.
 */
export function KpiCard({
  label,
  value,
  delta,
  href,
  highlight,
}: {
  label: string
  value: string | number
  delta?: { value: string; tone?: 'positive' | 'negative' | 'neutral' }
  href?: string
  highlight?: 'warn'
}) {
  const valueColor =
    highlight === 'warn' ? CHART_COLORS.accent : CHART_COLORS.text
  const deltaColor =
    delta?.tone === 'positive'
      ? CHART_COLORS.primary
      : delta?.tone === 'negative'
        ? CHART_COLORS.accent
        : CHART_COLORS.muted

  const inner = (
    <div
      style={{
        background: CHART_COLORS.surface,
        border: `0.5px solid ${CHART_COLORS.grid}`,
        borderRadius: 6,
        padding: 18,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 6,
        transition: 'border-color 0.15s ease',
      }}
    >
      <div
        style={{
          fontFamily: CHART_FONTS.label,
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: CHART_COLORS.muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: CHART_FONTS.title,
          fontWeight: 400,
          fontSize: 32,
          color: valueColor,
          lineHeight: 1.05,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {delta ? (
        <div
          style={{
            fontFamily: CHART_FONTS.number,
            fontVariantNumeric: 'tabular-nums',
            fontSize: 11,
            color: deltaColor,
            letterSpacing: '0.02em',
          }}
        >
          {delta.value}
        </div>
      ) : null}
    </div>
  )

  if (!href) return inner
  return (
    <a href={href} style={{ display: 'block', textDecoration: 'none' }}>
      {inner}
    </a>
  )
}
