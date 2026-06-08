/**
 * PatternInset — the in-tutorial block that points at a Pattern row.
 *
 * Renders the server-rendered SVG-to-PNG thumbnail with a calm caption
 * and two CTAs. Primary: "Stitch this pattern" → opens the Studio with
 * the pattern loaded. Secondary: "Save a copy" → opens the Studio with
 * the same id; the autosave hook silently forks on first edit.
 *
 * Both buttons resolve to the same route; the Studio reads the user
 * state and decides whether to render view-mode or edit-mode. Anonymous
 * users opening the Studio land on the "sign in to save" toolbar but
 * can still view the chart and mark stitches locally.
 */

import Link from 'next/link'
import type { PatternInsetRef } from '../types'
import './pattern-inset.css'

interface PatternInsetProps {
  pattern: PatternInsetRef
  isSignedIn: boolean
}

export function PatternInset({ pattern, isSignedIn }: PatternInsetProps) {
  const studioHref = `/studio/cross-stitch?patternId=${pattern.id}`
  const finishedW = (pattern.widthCells / pattern.fabricCountSuggested) * 2.54
  const finishedH = (pattern.heightCells / pattern.fabricCountSuggested) * 2.54

  return (
    <aside className="pattern-inset" aria-label={`Pattern: ${pattern.name}`}>
      <Link href={studioHref} className="pattern-inset-thumb" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pattern.thumbnailUrl} alt="" loading="lazy" />
      </Link>
      <div className="pattern-inset-body">
        <p className="pattern-inset-overline">Cross-stitch pattern</p>
        <h3 className="pattern-inset-name">{pattern.name}</h3>
        {pattern.description && <p className="pattern-inset-description">{pattern.description}</p>}
        <ul className="pattern-inset-meta">
          <li>{pattern.widthCells} × {pattern.heightCells} cells</li>
          <li>{pattern.colourCount} colours</li>
          <li>{pattern.totalStitches.toLocaleString()} stitches</li>
          <li>{pattern.fabricCountSuggested}-count fabric</li>
          <li>{finishedW.toFixed(1)} × {finishedH.toFixed(1)} cm finished</li>
          {pattern.designerName && <li>by {pattern.designerName}</li>}
        </ul>
        <div className="pattern-inset-actions">
          <Link href={studioHref} className="pattern-inset-cta primary">
            Stitch this pattern
          </Link>
          {isSignedIn && (
            <Link href={studioHref} className="pattern-inset-cta ghost">
              Save a copy
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
