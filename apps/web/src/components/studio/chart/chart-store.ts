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
  FractionalStitch,
} from '@homemade/db/pattern'
import { cellKey } from '@homemade/db/pattern'
import {
  centreCellViewport,
  DEFAULT_VIEWPORT,
  initialViewport,
  type Viewport,
  zoomAtPoint,
  fitToScreen,
} from './render-helpers'
import {
  applyMark,
  buildParkingIndex,
  DEFAULT_PARKING_DIRECTION,
  nextLineWithWork,
  previousLineWithWork,
  refreshParked,
  resetProgress,
  type ParkedCell,
  type ParkingDirection,
  type ParkingIndex,
} from '@/lib/studio/parking'

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
  fractional: boolean
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
  | { kind: 'addFractional'; stitch: FractionalStitch }
  | { kind: 'removeFractional'; index: number; stitch: FractionalStitch }
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
  /** True once the user has manually panned / zoomed. Until then the
   *  viewport auto-fits whenever the container is (re)measured, so a
   *  stale or zero-size first measurement can't leave the pattern
   *  cropped on a corner (it refits when the real size arrives). */
  viewportUserAdjusted: boolean
  containerWidth: number
  containerHeight: number
  stitchedCells: Set<string>
  history: ChartCommand[]
  future: ChartCommand[]
  dirty: boolean
  progressDirty: boolean

  // ───── parking
  /** Parking mode on / off. Remembered per project alongside progress. */
  parkingEnabled: boolean
  /** Which way the stitcher is working through the chart. */
  parkingDirection: ParkingDirection
  /** Index of the row / column / block being worked right now. */
  parkingLine: number
  /**
   * Per-colour ordered cell lists for the current working order. Built the
   * first time parking is switched on and rebuilt when the direction
   * changes, never on plain pattern load, so a stitcher who never parks
   * pays nothing for it. Mutated in place; `parkedCells` is the value
   * components render from.
   */
  parkingIndex: ParkingIndex | null
  /** Palette symbol -> the square that colour is parked in. */
  parkedCells: ReadonlyMap<string, ParkedCell>
  /** Parking preferences have moved and want saving. */
  parkingDirty: boolean
  /**
   * A pattern edit landed while parking was on, so the ordered cell lists
   * no longer describe the chart. Park markers are withheld until the
   * index is rebuilt rather than pointing at squares that have changed
   * colour. Rebuilt on the next mark-stitched, on any parking control, and
   * on the short settle after an edit burst (see `syncParkingIndex`).
   */
  parkingStale: boolean

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
  /** Pan the viewport so one cell sits in the middle of the canvas. Used by
   *  the floss key's "jump to the parked square" action, and by the first
   *  view on a phone. Pass a scale to zoom at the same time. */
  centreOnCell: (x: number, y: number, scale?: number) => void
  /** Zoom about the middle of the canvas. Powers the on-screen +/- buttons,
   *  which are the only zoom a touchscreen has besides the pinch. */
  zoomAtCentre: (delta: number) => void

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
  addFractional: (stitch: FractionalStitch) => void
  removeFractionalAt: (index: number) => void
  recolour: (fromSymbol: string, toSymbol: string) => void

  // ───── stitched markers (direct, not in undo stack)
  toggleStitched: (x: number, y: number) => void
  markStitchedBatch: (cells: Array<{ x: number; y: number }>, value: boolean) => void
  clearAllStitched: () => void

  // ───── parking
  setParkingEnabled: (enabled: boolean) => void
  setParkingDirection: (direction: ParkingDirection) => void
  setParkingLine: (line: number) => void
  stepParkingLine: (delta: 1 | -1) => void
  /** Rebuild the ordered cell lists after a pattern edit. No-op when
   *  nothing has gone stale. */
  syncParkingIndex: () => void
  /** Restore stored parking preferences without marking them dirty. */
  hydrateParking: (prefs: {
    enabled: boolean
    direction: ParkingDirection
    line: number
  }) => void

  // ───── undo/redo
  undo: () => void
  redo: () => void

  // ───── house keeping
  clearDirty: () => void
  clearProgressDirty: () => void
  clearParkingDirty: () => void
}

const DEFAULT_LAYERS: LayerToggles = {
  symbols: true,
  colours: true,
  backstitch: true,
  frenchKnots: true,
  fractional: true,
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
  viewportUserAdjusted: false,
  containerWidth: 0,
  containerHeight: 0,
  stitchedCells: new Set<string>(),
  history: [],
  future: [],
  dirty: false,
  progressDirty: false,
  parkingEnabled: false,
  parkingDirection: DEFAULT_PARKING_DIRECTION,
  parkingLine: 0,
  parkingIndex: null,
  parkedCells: new Map<string, ParkedCell>(),
  parkingDirty: false,
  parkingStale: false,

  setPattern: (pattern) =>
    set((state) => {
      // Re-fit the viewport whenever the pattern changes. Without this,
      // the photo-to-chart live preview kept the previous pattern's
      // pan/zoom which left the new chart cropped on one corner with no
      // way to recover. If the container hasn't measured yet, reset to
      // the default sentinel so the next setContainerSize call will fit.
      const next: Partial<ChartStoreState> = {
        pattern,
        history: [],
        future: [],
        dirty: false,
        currentSymbol: pattern.palette[0]?.symbol ?? null,
        // A fresh pattern hasn't been panned / zoomed yet, so it should
        // keep auto-fitting until the user takes the wheel.
        viewportUserAdjusted: false,
        // The old grid's ordered cell lists mean nothing to a new pattern.
        // Rebuilt lazily the next time parking asks for them.
        parkingIndex: null,
        parkedCells: new Map<string, ParkedCell>(),
        parkingStale: false,
      }
      if (state.containerWidth > 0 && state.containerHeight > 0) {
        next.viewport = initialViewport(pattern, state.containerWidth, state.containerHeight)
      } else {
        next.viewport = DEFAULT_VIEWPORT
      }
      return next as ChartStoreState
    }),
  setStitchedCells: (cells) =>
    set((state) => {
      // A whole progress set arriving — first load, or a cross-device sync.
      // Rebuild every cursor and line counter from it rather than trying to
      // reconcile against what was there before.
      const index = freshParkingIndex(state, cells)
      if (!index) return { stitchedCells: cells, progressDirty: false }
      return {
        stitchedCells: cells,
        progressDirty: false,
        parkingIndex: index,
        parkedCells: refreshParked(index, cells),
        parkingLine: nextLineWithWork(index, state.parkingLine),
        parkingStale: false,
      }
    }),
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
      // Refit on (re)measure until the user has manually moved the
      // viewport. This corrects a bad first measurement (0 / stale
      // container size) that would otherwise leave the pattern stuck
      // cropped on one corner.
      if (state.pattern && containerWidth > 0 && containerHeight > 0 && !state.viewportUserAdjusted) {
        next.viewport = initialViewport(state.pattern, containerWidth, containerHeight)
      }
      return next as ChartStoreState
    }),
  setViewport: (viewport) => set({ viewport, viewportUserAdjusted: true }),
  applyPan: (dx, dy) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        panX: state.viewport.panX + dx,
        panY: state.viewport.panY + dy,
      },
      viewportUserAdjusted: true,
    })),
  applyZoom: (delta, anchorX, anchorY) =>
    set((state) => ({
      viewport: zoomAtPoint(state.viewport, delta, anchorX, anchorY),
      viewportUserAdjusted: true,
    })),
  fitViewportToScreen: () => {
    const { pattern, containerWidth, containerHeight } = get()
    if (!pattern || containerWidth === 0) return
    set({ viewport: fitToScreen(pattern, containerWidth, containerHeight) })
  },

  centreOnCell: (x, y, scale) =>
    set((state) => {
      const { containerWidth: w, containerHeight: h } = state
      if (w <= 0 || h <= 0) return {}
      // Zoom in far enough that a single square is readable if the stitcher
      // was zoomed right out, otherwise keep whatever zoom they chose.
      const next = scale ?? Math.max(state.viewport.scale, 0.5)
      return {
        viewport: centreCellViewport(x, y, next, w, h),
        viewportUserAdjusted: true,
      }
    }),
  zoomAtCentre: (delta) =>
    set((state) => {
      const { containerWidth: w, containerHeight: h } = state
      if (w <= 0 || h <= 0) return {}
      return {
        viewport: zoomAtPoint(state.viewport, delta, w / 2, h / 2),
        viewportUserAdjusted: true,
      }
    }),

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
  addFractional: (stitch) => set(applyCommandReducer(get(), { kind: 'addFractional', stitch })),
  removeFractionalAt: (index) => {
    const state = get()
    const f = state.pattern?.grid.fractional[index]
    if (!f) return
    set(applyCommandReducer(state, { kind: 'removeFractional', index, stitch: f }))
  },
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
      const value = !next.has(k)
      if (value) next.add(k)
      else next.delete(k)
      return { stitchedCells: next, progressDirty: true, ...parkingAfterMarks(state, next, [{ x, y, value }]) }
    }),
  markStitchedBatch: (cells, value) =>
    set((state) => {
      const next = new Set(state.stitchedCells)
      const changed: Array<{ x: number; y: number; value: boolean }> = []
      for (const { x, y } of cells) {
        const k = cellKey(x, y)
        if (value ? next.has(k) : !next.has(k)) continue
        if (value) next.add(k)
        else next.delete(k)
        changed.push({ x, y, value })
      }
      if (changed.length === 0) return {}
      return { stitchedCells: next, progressDirty: true, ...parkingAfterMarks(state, next, changed) }
    }),
  clearAllStitched: () =>
    set((state) => {
      const next = new Set<string>()
      const index = freshParkingIndex(state, next)
      if (!index) return { stitchedCells: next, progressDirty: true }
      return {
        stitchedCells: next,
        progressDirty: true,
        parkingIndex: index,
        parkedCells: refreshParked(index, next),
        parkingLine: nextLineWithWork(index, 0),
        parkingStale: false,
      }
    }),

  setParkingEnabled: (enabled) =>
    set((state) => {
      if (!enabled) return { parkingEnabled: false, parkingDirty: true }
      const index = state.parkingIndex ?? ensureParkingIndex(state)
      if (!index) return { parkingEnabled: true, parkingDirty: true }
      return {
        parkingEnabled: true,
        parkingDirty: true,
        parkingIndex: index,
        parkedCells: refreshParked(index, state.stitchedCells),
        parkingLine: nextLineWithWork(index, state.parkingLine),
        parkingStale: false,
      }
    }),
  setParkingDirection: (direction) =>
    set((state) => {
      if (direction === state.parkingDirection && state.parkingIndex) return {}
      const index = state.pattern ? buildParkingIndex(state.pattern, direction) : null
      if (!index) return { parkingDirection: direction, parkingDirty: true }
      resetProgress(index, state.stitchedCells)
      return {
        parkingDirection: direction,
        parkingDirty: true,
        parkingIndex: index,
        parkedCells: refreshParked(index, state.stitchedCells),
        // The old line number means a different place in the new order, so
        // start again at the first line that still has work.
        parkingLine: nextLineWithWork(index, 0),
        parkingStale: false,
      }
    }),
  setParkingLine: (line) =>
    set((state) => {
      const max = state.parkingIndex ? state.parkingIndex.lineCount - 1 : 0
      const next = Math.max(0, Math.min(max, Math.round(line)))
      if (next === state.parkingLine) return {}
      return { parkingLine: next, parkingDirty: true }
    }),
  stepParkingLine: (delta) =>
    set((state) => {
      const index = state.parkingIndex
      if (!index) return {}
      const next =
        delta === 1
          ? nextLineWithWork(index, state.parkingLine + 1)
          : previousLineWithWork(index, state.parkingLine)
      if (next === state.parkingLine) return {}
      return { parkingLine: next, parkingDirty: true }
    }),
  hydrateParking: (prefs) =>
    set((state) => {
      if (!prefs.enabled) {
        return {
          parkingEnabled: false,
          parkingDirection: prefs.direction,
          parkingLine: Math.max(0, prefs.line),
          parkingDirty: false,
        }
      }
      const index = state.pattern ? buildParkingIndex(state.pattern, prefs.direction) : null
      if (!index) {
        return {
          parkingEnabled: true,
          parkingDirection: prefs.direction,
          parkingLine: Math.max(0, prefs.line),
          parkingDirty: false,
        }
      }
      resetProgress(index, state.stitchedCells)
      return {
        parkingEnabled: true,
        parkingDirection: prefs.direction,
        parkingLine: Math.max(0, Math.min(index.lineCount - 1, prefs.line)),
        parkingIndex: index,
        parkedCells: refreshParked(index, state.stitchedCells),
        parkingDirty: false,
        parkingStale: false,
      }
    }),

  syncParkingIndex: () =>
    set((state) => {
      if (!state.parkingStale || !state.parkingEnabled || !state.pattern) return {}
      const index = buildParkingIndex(state.pattern, state.parkingDirection)
      resetProgress(index, state.stitchedCells)
      return {
        parkingIndex: index,
        parkedCells: refreshParked(index, state.stitchedCells),
        parkingLine: nextLineWithWork(index, state.parkingLine),
        parkingStale: false,
      }
    }),

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
  clearParkingDirty: () => set({ parkingDirty: false }),
}))

// ───────────────────────────────────────────────────────────────────────────
// Parking helpers — kept beside the store because they read and mutate the
// index that lives in it. The heavy lifting is in `@/lib/studio/parking`.
// ───────────────────────────────────────────────────────────────────────────

/** Build the index for the current pattern + direction, or null with none. */
function ensureParkingIndex(state: ChartStoreState): ParkingIndex | null {
  if (!state.pattern) return null
  const index = buildParkingIndex(state.pattern, state.parkingDirection)
  resetProgress(index, state.stitchedCells)
  return index
}

/**
 * An index that certainly matches the current chart, reset against the
 * given progress. Reuses the existing one when it is still good and
 * rebuilds it when a pattern edit has left it stale. Null when there is no
 * index to keep current (parking has never been switched on).
 */
function freshParkingIndex(
  state: ChartStoreState,
  stitched: ReadonlySet<string>,
): ParkingIndex | null {
  if (!state.parkingIndex) return null
  if (state.parkingStale && state.pattern) {
    const rebuilt = buildParkingIndex(state.pattern, state.parkingDirection)
    resetProgress(rebuilt, stitched)
    return rebuilt
  }
  resetProgress(state.parkingIndex, stitched)
  return state.parkingIndex
}

/**
 * Fold a set of mark / unmark changes into the parking index and hand back
 * the state slice that changed. Constant work per changed square plus one
 * pass over the palette to rebuild the parked map, so the cost does not grow
 * with the chart.
 *
 * When the current line runs out of work the line advances by itself, which
 * is what a parker expects: finish the row, move to the next one.
 */
function parkingAfterMarks(
  state: ChartStoreState,
  stitched: ReadonlySet<string>,
  changes: Array<{ x: number; y: number; value: boolean }>,
): Partial<ChartStoreState> {
  if (!state.parkingEnabled) return {}
  // A pattern edit landed since the lists were built, so rebuild before
  // trusting them. One rebuild per edit burst, not one per marked square.
  let index = state.parkingIndex
  let rebuilt = false
  if (!index || state.parkingStale) {
    if (!state.pattern) return {}
    index = buildParkingIndex(state.pattern, state.parkingDirection)
    resetProgress(index, stitched)
    rebuilt = true
  } else {
    for (const { x, y, value } of changes) applyMark(index, x, y, value)
  }
  const parkedCells = refreshParked(index, stitched)
  const line = nextLineWithWork(index, state.parkingLine)
  const base: Partial<ChartStoreState> = rebuilt
    ? { parkingIndex: index, parkedCells, parkingStale: false }
    : { parkedCells }
  return line === state.parkingLine ? base : { ...base, parkingLine: line }
}

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
    case 'addFractional':
      nextGrid = { ...pattern.grid, fractional: [...pattern.grid.fractional, cmd.stitch] }
      break
    case 'removeFractional':
      nextGrid = {
        ...pattern.grid,
        fractional: pattern.grid.fractional.filter((_, i) => i !== cmd.index),
      }
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
    // Editing the chart moves squares between colours, so the ordered
    // cell lists no longer describe it. Markers step aside until the
    // rebuild rather than pointing at a square that has changed colour.
    ...(state.parkingEnabled
      ? { parkingStale: true, parkedCells: new Map<string, ParkedCell>() }
      : {}),
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
    case 'addFractional':
      nextGrid = { ...pattern.grid, fractional: pattern.grid.fractional.slice(0, -1) }
      break
    case 'removeFractional':
      nextGrid = {
        ...pattern.grid,
        fractional: [
          ...pattern.grid.fractional.slice(0, cmd.index),
          cmd.stitch,
          ...pattern.grid.fractional.slice(cmd.index),
        ],
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
  return {
    pattern: { ...pattern, grid: nextGrid },
    ...(state.parkingEnabled
      ? { parkingStale: true, parkedCells: new Map<string, ParkedCell>() }
      : {}),
  }
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
