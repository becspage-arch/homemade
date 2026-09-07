'use client'

/**
 * Word-art tool state.
 *
 * Its own small store rather than a prop chain, because two components on
 * opposite sides of the Studio need the same piece of state: the panel that
 * sets the words, and the ghost that floats over the chart while the maker
 * drags it into place. The chart store is left alone — nothing here is an edit
 * until the maker says so, and an unplaced piece of lettering has no business
 * in the undo stack.
 */

import { create } from 'zustand'
import type { LetteringFace } from '@/lib/studio/generation/samplers/faces'

export interface WordArtMask {
  width: number
  height: number
  cells: Array<[number, number]>
}

export interface WordArtState {
  open: boolean
  text: string
  face: LetteringFace
  /** Cap height in cells. */
  size: number
  tracking: number
  upper: boolean
  /** How many lines the words are set over. */
  lines: number
  /** Palette symbol the lettering will be worked in. */
  symbol: string | null
  mask: WordArtMask | null
  /** Top-left of the lettering, in chart cells. */
  x: number
  y: number
  loading: boolean
  error: string | null

  setOpen: (open: boolean) => void
  patch: (next: Partial<Omit<WordArtState, 'patch' | 'setOpen'>>) => void
  moveTo: (x: number, y: number) => void
  nudge: (dx: number, dy: number) => void
  reset: () => void
}

const INITIAL = {
  open: false,
  text: '',
  face: 'sampler' as LetteringFace,
  size: 10,
  tracking: 0,
  upper: false,
  lines: 1,
  symbol: null,
  mask: null,
  x: 0,
  y: 0,
  loading: false,
  error: null,
}

export const useWordArtStore = create<WordArtState>((set) => ({
  ...INITIAL,
  setOpen: (open) => set({ open }),
  patch: (next) => set(next as Partial<WordArtState>),
  moveTo: (x, y) => set({ x, y }),
  nudge: (dx, dy) => set((s) => ({ x: s.x + dx, y: s.y + dy })),
  reset: () => set({ ...INITIAL, open: false }),
}))
