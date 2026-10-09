'use client'

/**
 * WORD ART — type something, choose a letter, put it on the chart.
 *
 * The lettering is set from glyph outlines on the server and comes back as a
 * list of squares, so the letters are exact and the same everywhere. No model
 * draws a letter, here or anywhere else in this feature: a name is the one
 * thing on a sampler that cannot be nearly right.
 *
 * Colours come from the chart's own palette, so the words are worked in a
 * thread the maker already has in the piece. Nothing is added to the chart
 * until "Add to the chart", and that lands as a single step, so one undo takes
 * it back off.
 *
 * PREMIUM: putting your own words on a chart is making a pattern of your own,
 * which is the create-your-own line in the free-versus-premium spec. Working an
 * existing chart in the Studio stays free with an account.
 */

import { useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Loader2, X } from 'lucide-react'
import type { PatternData } from '@homemade/db/pattern'
import {
  LETTERING_FACES,
  LETTERING_FACE_IDS,
  minCapFor,
  type LetteringFace,
} from '@/lib/studio/generation/samplers/faces'
import { PremiumBadge } from '@/components/premium/PremiumBadge'
import { captureClientEvent } from '@/lib/client-analytics'
import { useChartStore } from '../chart/chart-store'
import { useWordArtStore, type WordArtMask } from './word-art-store'
import './word-art.css'

export function WordArtPanel({ pattern, isPremium }: { pattern: PatternData; isPremium: boolean }) {
  const open = useWordArtStore((s) => s.open)
  const setOpen = useWordArtStore((s) => s.setOpen)
  const patch = useWordArtStore((s) => s.patch)
  const reset = useWordArtStore((s) => s.reset)
  const text = useWordArtStore((s) => s.text)
  const face = useWordArtStore((s) => s.face)
  const size = useWordArtStore((s) => s.size)
  const tracking = useWordArtStore((s) => s.tracking)
  const upper = useWordArtStore((s) => s.upper)
  const lines = useWordArtStore((s) => s.lines)
  const symbol = useWordArtStore((s) => s.symbol)
  const mask = useWordArtStore((s) => s.mask)
  const x = useWordArtStore((s) => s.x)
  const y = useWordArtStore((s) => s.y)
  const loading = useWordArtStore((s) => s.loading)
  const error = useWordArtStore((s) => s.error)
  const nudge = useWordArtStore((s) => s.nudge)

  const paintCells = useChartStore((s) => s.paintCells)
  // A ref, not state: dropping the words in the middle the first time is a
  // one-off side effect, and putting it in state would re-render for nothing.
  const placed = useRef(false)

  // Start on the chart's first colour, so the tool is usable the moment it opens.
  useEffect(() => {
    if (!symbol && pattern.palette[0]) patch({ symbol: pattern.palette[0].symbol })
  }, [symbol, pattern.palette, patch])

  const floor = minCapFor(face)

  const fetchMask = useCallback(async () => {
    const words = text.trim()
    if (!words) {
      patch({ mask: null, error: null })
      return
    }
    patch({ loading: true })
    try {
      const res = await fetch('/api/studio/word-art', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: words, face, size, tracking, upper, lines }),
      })
      const json = (await res.json()) as (WordArtMask & { error?: string }) | { error: string }
      if (!res.ok) {
        patch({ error: (json as { error: string }).error, mask: null })
        return
      }
      const next = json as WordArtMask
      patch({ mask: next, error: null })
    } catch {
      patch({ error: 'That did not work. Try again in a moment.', mask: null })
    } finally {
      patch({ loading: false })
    }
  }, [text, face, size, tracking, upper, lines, patch])

  useEffect(() => {
    if (!open || !isPremium) return
    const t = setTimeout(() => void fetchMask(), 350)
    return () => clearTimeout(t)
  }, [open, isPremium, fetchMask])

  // Drop it in the middle the first time there is something to place.
  useEffect(() => {
    if (!mask || placed.current) return
    placed.current = true
    patch({
      x: Math.max(0, Math.round((pattern.grid.width - mask.width) / 2)),
      y: Math.max(0, Math.round((pattern.grid.height - mask.height) / 2)),
    })
  }, [mask, pattern.grid.width, pattern.grid.height, patch])

  if (!open) return null

  if (!isPremium) {
    return (
      <aside className="word-art-panel" aria-label="Word art">
        <header className="word-art-head">
          <PremiumBadge />
          <button type="button" className="word-art-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={16} strokeWidth={1.8} />
          </button>
        </header>
        <p className="word-art-lede">
          Word art puts your own name, date or line of writing on a chart, in a letter you choose.
          It is part of Homemade Premium, along with the rest of making your own patterns.
        </p>
        <Link href="/premium" className="word-art-cta">
          See what premium includes
        </Link>
      </aside>
    )
  }

  const add = () => {
    if (!mask || !symbol) return
    const cells = mask.cells
      .map(([cx, cy]) => ({ x: cx + x, y: cy + y }))
      .filter((c) => c.x >= 0 && c.y >= 0 && c.x < pattern.grid.width && c.y < pattern.grid.height)
    if (cells.length === 0) return
    paintCells(cells, symbol)
    captureClientEvent('feature_used', { feature: 'word_art', productArea: 'cross_stitch' })
    placed.current = false
    reset()
  }

  const fits = mask
    ? x >= 0 && y >= 0 && x + mask.width <= pattern.grid.width && y + mask.height <= pattern.grid.height
    : true

  return (
    <aside className="word-art-panel" aria-label="Word art">
      <header className="word-art-head">
        <h2>Word art</h2>
        <button
          type="button"
          className="word-art-close"
          onClick={() => {
            placed.current = false
            reset()
          }}
          aria-label="Close"
        >
          <X size={16} strokeWidth={1.8} />
        </button>
      </header>

      <label className="word-art-field">
        <span>Your words</span>
        <input
          type="text"
          value={text}
          maxLength={120}
          placeholder="Amelia Rose"
          onChange={(e) => patch({ text: e.target.value })}
          autoFocus
        />
      </label>

      <label className="word-art-field">
        <span>Letter</span>
        <select value={face} onChange={(e) => patch({ face: e.target.value as LetteringFace })}>
          {LETTERING_FACE_IDS.map((id) => (
            <option key={id} value={id}>
              {LETTERING_FACES[id].label}
            </option>
          ))}
        </select>
      </label>
      <p className="word-art-note">{LETTERING_FACES[face].note}</p>

      <label className="word-art-field">
        <span>
          Height <em>{Math.max(floor, size)} squares</em>
        </span>
        <input
          type="range"
          min={floor}
          max={48}
          step={1}
          value={Math.max(floor, size)}
          onChange={(e) => patch({ size: Number(e.target.value) })}
        />
      </label>

      <div className="word-art-row">
        <label className="word-art-field">
          <span>Lines</span>
          <select value={lines} onChange={(e) => patch({ lines: Number(e.target.value) })}>
            <option value={1}>One</option>
            <option value={2}>Two</option>
            <option value={3}>Three</option>
          </select>
        </label>
        <label className="word-art-field">
          <span>Spacing</span>
          <input
            type="range"
            min={-1}
            max={4}
            step={0.5}
            value={tracking}
            onChange={(e) => patch({ tracking: Number(e.target.value) })}
          />
        </label>
      </div>

      <label className="word-art-check">
        <input type="checkbox" checked={upper} onChange={(e) => patch({ upper: e.target.checked })} />
        <span>Capitals</span>
      </label>

      <div className="word-art-field">
        <span>Thread</span>
        <div className="word-art-swatches" role="radiogroup" aria-label="Thread">
          {pattern.palette.map((p) => (
            <button
              key={p.symbol}
              type="button"
              role="radio"
              aria-checked={symbol === p.symbol}
              className={['word-art-swatch', symbol === p.symbol ? 'is-active' : ''].join(' ')}
              style={{ background: p.rgb }}
              title={`${p.brand} ${p.code} ${p.name}`}
              onClick={() => patch({ symbol: p.symbol })}
            />
          ))}
        </div>
      </div>

      <div className="word-art-place">
        <span>Move it</span>
        <div className="word-art-arrows">
          <button type="button" onClick={() => nudge(0, -1)} aria-label="Up">↑</button>
          <button type="button" onClick={() => nudge(-1, 0)} aria-label="Left">←</button>
          <button type="button" onClick={() => nudge(1, 0)} aria-label="Right">→</button>
          <button type="button" onClick={() => nudge(0, 1)} aria-label="Down">↓</button>
        </div>
        <span className="word-art-coords">
          {mask ? `${mask.width} × ${mask.height} at ${x}, ${y}` : 'Nothing set yet'}
        </span>
      </div>
      <p className="word-art-note">Or drag the words on the chart.</p>

      {error && <p className="word-art-error">{error}</p>}
      {!fits && mask && <p className="word-art-error">Part of it is off the chart.</p>}

      <button
        type="button"
        className="word-art-cta"
        onClick={add}
        disabled={!mask || !symbol || loading || !fits}
      >
        {loading ? (
          <>
            <Loader2 size={14} className="word-art-spin" aria-hidden="true" /> Setting the letters
          </>
        ) : (
          'Add to the chart'
        )}
      </button>
    </aside>
  )
}
