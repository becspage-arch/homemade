/**
 * Chart state store (Zustand).
 *
 * Holds the live pattern + viewport + per-user UI state for a single
 * Studio session. Edits flow through a command-pattern undo/redo stack;
 * mark-stitched / isolate / display-mode flips are direct state writes
 * because the user can re-flip them as quickly as they wish (and
 * including them in the undo stack would make Cmd+Z reach back through
 * UI toggles before reaching a paint).
 *
 * The store has no side effects — persistence (save to server / save to
 * IndexedDB) is wired by the Studio shell via subscriptions. Keeps the
 * store testable and the persistence pluggable.
 */

import { create } from 'zustand'
import type {
  BackstitchSegment,
  FrenchKnot,
  PatternData,
  PaletteEntry,
} from '@homemade/db/pattern'
import { cellKey } from '@homemade/db/pattern'
import { DEFAULT_VIEWPORT, type Viewport, zoomAtPoint, fitToScreen } from './render-helpers'

export type ChartMode = 'view' | 'edit'

export type ChartTool =
  | 'brush'
  | 'erase'
  | 'select'
  | 'mark-stitched'
  | 'backstitch'
  | 'frenchknot'
  | 'colour-picker'

export type DisplayMode = 'all' | 'stitched' | 'remaining'

/**
 * How each cell renders inside the editor canvas.
 *
 *   colour-block  — filled rect of the floss colour + symbol overlay.
 *                   The default. Most-readable for stitching from. This
 *                   is what Pattern Maker, PCStitch, KG-Chart all
 *                   default to.
 *   x-stitch      — the X-shape rendering with strand-coloured strokes.
 *                   Reads as the finished work; harder to scan while
 *                   stitching. Equivalent to thumbnail / hero look.
 *   symbol-only   — white cell with the symbol overlay only. Classic
 *                   monochrome chart style, same as printing the PDF
 *                   in B&W mode.
 */
export type RenderStyle = 'colour-block' | 'x-stitch' | 'symbol-only'

export interface LayerToggles {
  symbols: boolean
  colours: boolean
  backstitch: boolean
  frenchKnots: boolean
  beads: boolean
  grid: boolean
  centreCrosshairs: boolean
}

export interface SelectionRect {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * Undo/redo command shapes. Every command carries the data needed to
 * both apply itself and reverse itself; the store doesn't snapshot the
 * full pattern between commands so memory stays flat regardless of
 * history depth.
 */
export type ChartCommand =
  | { kind: 'paintCell'; x: number; y: number; prev: string | null; next: string }
  | { kind: 'eraseCell'; x: number; y: number; prev: string }
  | { kind: 'addBackstitch'; segment: BackstitchSegment }
  | { kind: 'removeBackstitch'; index: number; segment: BackstitchSegment }
  | { kind: 'addFrenchKnot'; knot: FrenchKnot }
  | { kind: 'removeFrenchKnot'; index: number; knot: FrenchKnot }
  | {
      kind: 'recolour'
      from: string
      to: string
      cellIndices: number[]
    }
  | {
      kind: 'paintBatch'
      cells: Array<{ x: number; y: number; prev: string | null; next: string }>
    }

export interface ChartStoreState {
  pattern: PatternData | null
  mode: ChartMode
  tool: ChartTool
  currentSymbol: string | null
  isolateSymbol: string | null
  displayMode: DisplayMode
  renderStyle: RenderStyle
  layers: LayerToggles
  selection: SelectionRect | null
  viewport: Viewport
  containerWidth: number
  containerHeight: number
  stitchedCells: Set<string>
  history: ChartCommand[]
  future: ChartCommand[]
  dirty: boolean
  progressDirty: boolean

  // ───── pattern + mode
  setPattern: (pattern: PatternData) => void
  setStitchedCells: (cells: Set<string>) => void
  setMode: (mode: ChartMode) => void
  setTool: (tool: ChartTool) => void
  setCurrentSymbol: (symbol: string | null) => void
  setIsolate: (symbol: string | null) => void
  setDisplayMode: (mode: DisplayMode) => void
  setRenderStyle: (style: RenderStyle) => void
  toggleLayer: (key: keyof LayerToggles) => void

  // ───── viewport
  setContainerSize: (w: number, h: number) => void
  setViewport: (viewport: Viewport) => void
  applyPan: (dx: number, dy: number) => void
  applyZoom: (delta: number, anchorX: number, anchorY: number) => void
  fitViewportToScreen: () => void

  // ───── selection
  setSelection: (rect: SelectionRect | null) => void

  // ───── editing (pushes commands)
  paintCell: (x: number, y: number, symbol: string) => void
  paintCells: (cells: Array<{ x: number; y: number }>, symbol: string) => void
  eraseCell: (x: number, y: number) => void
  eraseCells: (cells: Array<{ x: number; y: number }>) => void
  addBackstitch: (segment: BackstitchSegment) => void
  removeBackstitchAt: (index: number) => void
  addFrenchKnot: (knot: FrenchKnot) => void
  removeFrenchKnotAt: (index: number) => void
  recolour: (fromSymbol: string, toSymbol: string) => void

  // ───── stitched markers (direct, not in undo stack)
  toggleStitched: (x: number, y: number) => void
  markStitchedBatch: (cells: Array<{ x: number; y: number }>, value: boolean) => void
  clearAllStitched: () => void

  // ───── undo/redo
  undo: () => void
  redo: () => void

  // ───── house keeping
  clearDirty: () => void
  clearProgressDirty: () => void
}

const DEFAULT_LAYERS: LayerToggles = {
  symbols: true,
  colours: true,
  backstitch: true,
  frenchKnots: true,
  beads: true,
  grid: true,
  centreCrosshairs: true,
}

export const useChartStore = create<ChartStoreState>((set, get) => ({
  pattern: null,
  mode: 'view',
  tool: 'brush',
  currentSymbol: null,
  isolateSymbol: null,
  displayMode: 'all',
  renderStyle: 'colour-block',
  layers: DEFAULT_LAYERS,
  selection: null,
  viewport: DEFAULT_VIEWPORT,
  containerWidth: 0,
  containerHeight: 0,
  stitchedCells: new Set<string>(),
  history: [],
  future: [],
  dirty: false,
  progressDirty: false,

  setPattern: (pattern) =>
    set({
      pattern,
      history: [],
      future: [],
      dirty: false,
      currentSymbol: pattern.palette[0]?.symbol ?? null,
    }),
  setStitchedCells: (cells) => set({ stitchedCells: cells, progressDirty: false }),
  setMode: (mode) => set({ mode }),
  setTool: (tool) => set({ tool }),
  setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),
  setIsolate: (symbol) => set({ isolateSymbol: symbol }),
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setRenderStyle: (renderStyle) => set({ renderStyle }),
  toggleLayer: (key) =>
    set((state) => ({ layers: { ...state.layers, [key]: !state.layers[key] } })),

  setContainerSize: (containerWidth, containerHeight) =>
    set((state) => {
      const next: Partial<ChartStoreState> = { containerWidth, containerHeight }
      if (state.viewport === DEFAULT_VIEWPORT && state.pattern && containerWidth > 0) {
        next.viewport = fitToScreen(state.pattern, containerWidth, containerHeight)
      }
      return next as ChartStoreState
    }),
  setViewport: (viewport) => set({ viewport }),
  applyPan: (dx, dy) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        panX: state.viewport.panX + dx,
        panY: state.viewport.panY + dy,
      },
    })),
  applyZoom: (delta, anchorX, anchorY) =>
    set((state) => ({
      viewport: zoomAtPoint(state.viewport, delta, anchorX, anchorY),
    })),
  fitViewportToScreen: () => {
    const { pattern, containerWidth, containerHeight } = get()
    if (!pattern || containerWidth === 0) return
    set({ viewport: fitToScreen(pattern, containerWidth, containerHeight) })
  },

  setSelection: (rect) => set({ selection: rect }),

  paintCell: (x, y, symbol) => {
    const state = get()
    if (!state.pattern) return
    const existing = state.pattern.grid.cells.find((c) => c.x === x && c.y === y)
    if (existing && existing.s === symbol) return
    const cmd: ChartCommand = {
      kind: 'paintCell',
      x,
      y,
      prev: existing ? existing.s : null,
      next: symbol,
    }
    set(applyCommandReducer(state, cmd))
  },
  paintCells: (cells, symbol) => {
    const state = get()
    if (!state.pattern) return
    const cmds: Array<{ x: number; y: number; prev: string | null; next: string }> = []
    const cellMap = new Map<string, number>()
    state.pattern.grid.cells.forEach((c, i) => cellMap.set(cellKey(c.x, c.y), i))
    for (const { x, y } of cells) {
      const existing = state.pattern.grid.cells[cellMap.get(cellKey(x, y)) ?? -1]
      if (existing && existing.s === symbol) continue
      cmds.push({ x, y, prev: existing ? existing.s : null, next: symbol })
    }
    if (cmds.length === 0) return
    set(applyCommandReducer(state, { kind: 'paintBatch', cells: cmds }))
  },
  eraseCell: (x, y) => {
    const state = get()
    if (!state.pattern) return
    const existing = state.pattern.grid.cells.find((c) => c.x === x && c.y === y)
    if (!existing) return
    set(applyCommandReducer(state, { kind: 'eraseCell', x, y, prev: existing.s }))
  },
  eraseCells: (cells) => {
    const state = get()
    if (!state.pattern) return
    const cellMap = new Map<string, number>()
    state.pattern.grid.cells.forEach((c, i) => cellMap.set(cellKey(c.x, c.y), i))
    const cmds: Array<{ x: number; y: number; prev: string | null; next: string }> = []
    for (const { x, y } of cells) {
      const idx = cellMap.get(cellKey(x, y))
      if (idx === undefined || idx < 0) continue
      const existing = state.pattern.grid.cells[idx]
      if (!existing) continue
      cmds.push({ x, y, prev: existing.s, next: '' })
    }
    if (cmds.length === 0) return
    let s = state
    for (const c of cmds) {
      s = applyCommandReducer(s, { kind: 'eraseCell', x: c.x, y: c.y, prev: c.prev! }) as ChartStoreState
    }
    set(s)
  },
  addBackstitch: (segment) => set(applyCommandReducer(get(), { kind: 'addBackstitch', segment })),
  removeBackstitchAt: (index) => {
    const state = get()
    const seg = state.pattern?.grid.backstitch[index]
    if (!seg) return
    set(applyCommandReducer(state, { kind: 'removeBackstitch', index, segment: seg }))
  },
  addFrenchKnot: (knot) => set(applyCommandReducer(get(), { kind: 'addFrenchKnot', knot })),
  removeFrenchKnotAt: (index) => {
    const state = get()
    const k = state.pattern?.grid.frenchKnots[index]
    if (!k) return
    set(applyCommandReducer(state, { kind: 'removeFrenchKnot', index, knot: k }))
  },
  recolour: (fromSymbol, toSymbol) => {
    const state = get()
    if (!state.pattern || fromSymbol === toSymbol) return
    const cellIndices: number[] = []
    state.pattern.grid.cells.forEach((c, i) => {
      if (c.s === fromSymbol) cellIndices.push(i)
    })
    if (cellIndices.length === 0) return
    set(
      applyCommandReducer(state, {
        kind: 'recolour',
        from: fromSymbol,
        to: toSymbol,
        cellIndices,
      }),
    )
  },

  toggleStitched: (x, y) =>
    set((state) => {
      const next = new Set(state.stitchedCells)
      const k = cellKey(x, y)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return { stitchedCells: next, progressDirty: true }
    }),
  markStitchedBatch: (cells, value) =>
    set((state) => {
      const next = new Set(state.stitchedCells)
      for (const { x, y } of cells) {
        const k = cellKey(x, y)
        if (value) next.add(k)
        else next.delete(k)
      }
      return { stitchedCells: next, progressDirty: true }
    }),
  clearAllStitched: () => set({ stitchedCells: new Set(), progressDirty: true }),

  undo: () => {
    const state = get()
    if (state.history.length === 0) return
    const cmd = state.history[state.history.length - 1]!
    const reduced = undoCommandReducer(state, cmd)
    set({
      ...reduced,
      history: state.history.slice(0, -1),
      future: [...state.future, cmd],
      dirty: true,
    })
  },
  redo: () => {
    const state = get()
    if (state.future.length === 0) return
    const cmd = state.future[state.future.length - 1]!
    const reduced = applyCommandReducer(state, cmd)
    set({
      ...reduced,
      history: [...state.history, cmd],
      future: state.future.slice(0, -1),
    })
  },

  clearDirty: () => set({ dirty: false }),
  clearProgressDirty: () => set({ progressDirty: false }),
}))

// ───────────────────────────────────────────────────────────────────────────
// Command reducers — pure, no side effects on the store, return the
// next pattern + history/future shape. Memory stays flat: commands store
// only the delta needed to reverse themselves.
// ───────────────────────────────────────────────────────────────────────────

function applyCommandReducer(
  state: ChartStoreState,
  cmd: ChartCommand,
): Partial<ChartStoreState> {
  if (!state.pattern) return {}
  const pattern = state.pattern
  let nextGrid = pattern.grid
  switch (cmd.kind) {
    case 'paintCell':
      nextGrid = setCell(pattern, cmd.x, cmd.y, cmd.next)
      break
    case 'paintBatch':
      nextGrid = setCells(pattern, cmd.cells)
      break
    case 'eraseCell':
      nextGrid = removeCell(pattern, cmd.x, cmd.y)
      break
    case 'addBackstitch':
      nextGrid = { ...pattern.grid, backstitch: [...pattern.grid.backstitch, cmd.segment] }
      break
    case 'removeBackstitch':
      nextGrid = {
        ...pattern.grid,
        backstitch: pattern.grid.backstitch.filter((_, i) => i !== cmd.index),
      }
      break
    case 'addFrenchKnot':
      nextGrid = { ...pattern.grid, frenchKnots: [...pattern.grid.frenchKnots, cmd.knot] }
      break
    case 'removeFrenchKnot':
      nextGrid = {
        ...pattern.grid,
        frenchKnots: pattern.grid.frenchKnots.filter((_, i) => i !== cmd.index),
      }
      break
    case 'recolour': {
      const cells = pattern.grid.cells.map((c) => (c.s === cmd.from ? { ...c, s: cmd.to } : c))
      nextGrid = { ...pattern.grid, cells }
      break
    }
  }
  return {
    pattern: { ...pattern, grid: nextGrid },
    history: [...state.history, cmd],
    future: [],
    dirty: true,
  }
}

function undoCommandReducer(
  state: ChartStoreState,
  cmd: ChartCommand,
): Partial<ChartStoreState> {
  if (!state.pattern) return {}
  const pattern = state.pattern
  let nextGrid = pattern.grid
  switch (cmd.kind) {
    case 'paintCell':
      nextGrid = cmd.prev === null ? removeCell(pattern, cmd.x, cmd.y) : setCell(pattern, cmd.x, cmd.y, cmd.prev)
      break
    case 'paintBatch':
      nextGrid = pattern.grid
      for (const c of cmd.cells) {
        const tmp = { ...pattern, grid: nextGrid }
        nextGrid = c.prev === null ? removeCell(tmp, c.x, c.y) : setCell(tmp, c.x, c.y, c.prev)
      }
      break
    case 'eraseCell':
      nextGrid = setCell(pattern, cmd.x, cmd.y, cmd.prev)
      break
    case 'addBackstitch':
      nextGrid = {
        ...pattern.grid,
        backstitch: pattern.grid.backstitch.slice(0, -1),
      }
      break
    case 'removeBackstitch':
      nextGrid = {
        ...pattern.grid,
        backstitch: [
          ...pattern.grid.backstitch.slice(0, cmd.index),
          cmd.segment,
          ...pattern.grid.backstitch.slice(cmd.index),
        ],
      }
      break
    case 'addFrenchKnot':
      nextGrid = {
        ...pattern.grid,
        frenchKnots: pattern.grid.frenchKnots.slice(0, -1),
      }
      break
    case 'removeFrenchKnot':
      nextGrid = {
        ...pattern.grid,
        frenchKnots: [
          ...pattern.grid.frenchKnots.slice(0, cmd.index),
          cmd.knot,
          ...pattern.grid.frenchKnots.slice(cmd.index),
        ],
      }
      break
    case 'recolour': {
      const cells = pattern.grid.cells.map((c) => (c.s === cmd.to ? { ...c, s: cmd.from } : c))
      nextGrid = { ...pattern.grid, cells }
      break
    }
  }
  return { pattern: { ...pattern, grid: nextGrid } }
}

function setCell(pattern: PatternData, x: number, y: number, symbol: string) {
  const cells = pattern.grid.cells.slice()
  const idx = cells.findIndex((c) => c.x === x && c.y === y)
  if (idx >= 0) cells[idx] = { x, y, s: symbol }
  else cells.push({ x, y, s: symbol })
  return { ...pattern.grid, cells }
}

function setCells(
  pattern: PatternData,
  edits: Array<{ x: number; y: number; next: string }>,
) {
  const cells = pattern.grid.cells.slice()
  const indexMap = new Map<string, number>()
  cells.forEach((c, i) => indexMap.set(cellKey(c.x, c.y), i))
  for (const { x, y, next } of edits) {
    const k = cellKey(x, y)
    const idx = indexMap.get(k)
    if (idx === undefined) {
      indexMap.set(k, cells.length)
      cells.push({ x, y, s: next })
    } else {
      cells[idx] = { x, y, s: next }
    }
  }
  return { ...pattern.grid, cells }
}

function removeCell(pattern: PatternData, x: number, y: number) {
  return {
    ...pattern.grid,
    cells: pattern.grid.cells.filter((c) => !(c.x === x && c.y === y)),
  }
}

/** Convenience — the currently-active palette entry, or null. */
export function selectCurrentPaletteEntry(
  state: ChartStoreState,
): PaletteEntry | null {
  if (!state.pattern || !state.currentSymbol) return null
  return state.pattern.palette.find((p) => p.symbol === state.currentSymbol) ?? null
}
