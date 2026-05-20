'use client'

import { useCallback, useEffect, useState } from 'react'

export interface ChartViewerPrefs {
  gridColor?: string
  gridWeightScale?: number
  showCentreLines?: boolean
}

export const DEFAULT_PREFS: Required<ChartViewerPrefs> = {
  gridColor: '#302a24',
  gridWeightScale: 1,
  showCentreLines: true,
}

/**
 * Loads the signed-in user's chart-viewer preferences and exposes a
 * setter that patches the server. Optimistic local state so the UI
 * reacts instantly; the PATCH runs in the background.
 *
 * Resolves to the built-in defaults until the GET completes, so the
 * initial render is stable.
 */
export function useViewerPrefs() {
  const [prefs, setPrefs] = useState<ChartViewerPrefs>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/me/preferences/chart-viewer')
        if (!res.ok) return
        const data = (await res.json()) as ChartViewerPrefs
        if (cancelled) return
        setPrefs(data ?? {})
      } catch {
        // Silent — defaults remain in effect.
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const updatePrefs = useCallback((patch: ChartViewerPrefs) => {
    setPrefs((p) => ({ ...p, ...patch }))
    void fetch('/api/me/preferences/chart-viewer', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {
      // Network failure — local state still reflects the user's intent.
    })
  }, [])

  const resolved: Required<ChartViewerPrefs> = {
    gridColor: prefs.gridColor ?? DEFAULT_PREFS.gridColor,
    gridWeightScale: prefs.gridWeightScale ?? DEFAULT_PREFS.gridWeightScale,
    showCentreLines:
      typeof prefs.showCentreLines === 'boolean'
        ? prefs.showCentreLines
        : DEFAULT_PREFS.showCentreLines,
  }

  return { prefs: resolved, updatePrefs, loaded }
}
