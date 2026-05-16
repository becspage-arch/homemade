'use client'

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  AXIS_TICK_STYLE,
  CHART_COLORS,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE,
} from './chart-theme'

interface Point {
  date: string
  value: number
}

/**
 * Single-stroke line chart for daily metric trends. Flat sage stroke,
 * faded sage grid, parchment background. Used by the overview KPIs +
 * activation / acquisition mini-trends.
 */
export function LineTrend({
  data,
  height = 200,
  color,
  yLabel,
}: {
  data: Point[]
  height?: number
  color?: string
  yLabel?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={AXIS_TICK_STYLE}
          tickFormatter={(d) => d.slice(5)}
          stroke={CHART_COLORS.grid}
        />
        <YAxis
          tick={AXIS_TICK_STYLE}
          stroke={CHART_COLORS.grid}
          allowDecimals={false}
          width={36}
          label={
            yLabel
              ? { value: yLabel, angle: -90, position: 'insideLeft', style: AXIS_TICK_STYLE }
              : undefined
          }
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color ?? CHART_COLORS.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: CHART_COLORS.primaryDeep, strokeWidth: 1 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/**
 * Tiny inline sparkline for the KPI row at the top of the overview. No
 * axes, no grid — just the line.
 */
export function Sparkline({ data, color }: { data: Point[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color ?? CHART_COLORS.primarySoft}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
