'use client'

import { useCallback, useEffect, useRef } from 'react'

const DEFAULT_DEBOUNCE_MS = 700

/**
 * Shared debounced-autosave hook for Studio surfaces.
 *
 * Pattern proven across crochet + knitting Studios: coalesce fast state
 * mutations into at-most-one PATCH per DEBOUNCE_MS window. Flushes
 * immediately on unmount so in-flight changes aren't lost.
 *
 * Usage:
 *   const { pendingState, scheduleSave } = useAutosave({
 *     url: `/api/studio/knitting/progress/${pattern.id}`,
 *   })
 *   // On each state mutation:
 *   pendingState.current = nextState
 *   scheduleSave()
 *
 * If your surface also tracks pref changes (view mode, terminology) as a
 * separate object, pass `pendingPrefs` and the hook will merge both into
 * the PATCH body.
 */
export function useAutosave<TState, TPrefs extends Record<string, unknown> = Record<string, never>>({
  url,
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: {
  url: string
  /** Set to false to skip the server PATCH (e.g. signed-out user). */
  enabled?: boolean
  debounceMs?: number
}) {
  const pendingState = useRef<TState | null>(null)
  const pendingPrefs = useRef<Partial<TPrefs>>({} as Partial<TPrefs>)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(async () => {
    const hasState = pendingState.current !== null
    const hasPrefs = Object.keys(pendingPrefs.current).length > 0
    if (!hasState && !hasPrefs) return
    const body = {
      ...(pendingState.current ?? {}),
      ...pendingPrefs.current,
    }
    pendingState.current = null
    pendingPrefs.current = {} as Partial<TPrefs>
    if (!enabled) return
    try {
      await fetch(url, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {
      // silent — next change retries
    }
  }, [url, enabled])

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void flush()
    }, debounceMs)
  }, [flush, debounceMs])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      void flush()
    }
  }, [flush])

  return { pendingState, pendingPrefs, scheduleSave, flush }
}
