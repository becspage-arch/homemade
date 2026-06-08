'use client'

/**
 * ToolDock — floating tool selector for edit-mode. Sits centred at the
 * bottom of the canvas, doesn't intrude on the chart. Each tool is one
 * single-character keyboard shortcut (matching ChartViewport's listener)
 * which surfaces in the title-tooltip for muscle-memory builders.
 */

import { Brush, Eraser, MousePointerSquareDashed, Pipette, Check, Minus, Dot } from 'lucide-react'
import { useChartStore, type ChartTool } from '../chart/chart-store'

const TOOLS: Array<{ tool: ChartTool; label: string; shortcut: string; icon: typeof Brush }> = [
  { tool: 'brush', label: 'Brush', shortcut: 'B', icon: Brush },
  { tool: 'erase', label: 'Erase', shortcut: 'E', icon: Eraser },
  { tool: 'select', label: 'Select', shortcut: 'V', icon: MousePointerSquareDashed },
  { tool: 'colour-picker', label: 'Pick colour', shortcut: 'C', icon: Pipette },
  { tool: 'mark-stitched', label: 'Mark stitched', shortcut: 'M', icon: Check },
  { tool: 'backstitch', label: 'Back-stitch', shortcut: '', icon: Minus },
  { tool: 'frenchknot', label: 'French knot', shortcut: '', icon: Dot },
]

export function ToolDock() {
  const current = useChartStore((s) => s.tool)
  const setTool = useChartStore((s) => s.setTool)
  const displayMode = useChartStore((s) => s.displayMode)
  const setDisplayMode = useChartStore((s) => s.setDisplayMode)

  return (
    <div className="studio-tool-dock">
      <div className="studio-tool-dock-tools" role="toolbar" aria-label="Studio tools">
        {TOOLS.map(({ tool, label, shortcut, icon: Icon }) => (
          <button
            key={tool}
            type="button"
            className={['studio-tool-button', current === tool ? 'is-active' : ''].join(' ')}
            onClick={() => setTool(tool)}
            aria-pressed={current === tool}
            title={shortcut ? `${label} (${shortcut})` : label}
          >
            <Icon size={17} strokeWidth={1.6} />
          </button>
        ))}
      </div>
      <div className="studio-tool-dock-divider" />
      <div className="studio-tool-dock-display">
        <button
          type="button"
          className={['studio-tool-pill', displayMode === 'all' ? 'is-active' : ''].join(' ')}
          onClick={() => setDisplayMode('all')}
          title="Show all stitches"
        >
          All
        </button>
        <button
          type="button"
          className={['studio-tool-pill', displayMode === 'remaining' ? 'is-active' : ''].join(' ')}
          onClick={() => setDisplayMode('remaining')}
          title="Show remaining"
        >
          To do
        </button>
        <button
          type="button"
          className={['studio-tool-pill', displayMode === 'stitched' ? 'is-active' : ''].join(' ')}
          onClick={() => setDisplayMode('stitched')}
          title="Show stitched"
        >
          Done
        </button>
      </div>
    </div>
  )
}

