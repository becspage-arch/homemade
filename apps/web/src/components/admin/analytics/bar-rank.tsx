'use client'

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import {
  AXIS_TICK_STYLE,
  CHART_COLORS,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE,
} from './chart-theme'

interface Row {
  key: string
  value: number
}

/**
 * Horizontal bar chart used for ranked breakdowns: top categories,
 * acquisition channel splits, country splits. Sage primary fill, sage
 * grid, one bar per row.
 */
export function BarRank({
  data,
  height,
  color,
  formatValue,
}: {
  data: Row[]
  height?: number
  color?: string
  formatValue?: (v: number) => string
}) {
  const calcHeight = height ?? Math.max(180, data.length * 32 + 32)
  return (
    <ResponsiveContainer width="100%" height={calcHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
      >
        <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS_TICK_STYLE}
          stroke={CHART_COLORS.grid}
          allowDecimals={false}
          tickFormatter={formatValue}
        />
        <YAxis
          type="category"
          dataKey="key"
          tick={AXIS_TICK_STYLE}
          stroke={CHART_COLORS.grid}
          width={140}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
          formatter={((v: unknown) => {
            const n = typeof v === 'number' ? v : Number(v ?? 0)
            return [formatValue ? formatValue(n) : n, '']
          }) as never}
        />
        <Bar dataKey="value" radius={[2, 2, 2, 2]} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={color ?? CHART_COLORS.primary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
