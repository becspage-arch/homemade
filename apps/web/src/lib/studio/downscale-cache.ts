/**
 * Tiny in-memory LRU cache for the photo-to-chart downscale buffer.
 *
 * Dragging the colour-count slider fires a fresh POST per debounced
 * tick — at 300ms debounce that's two requests per second of slider
 * movement. Sharp's resize over a 12MP photo is the slow step (~120ms
 * on warm builds). Cache the downscaled RGBA buffer keyed by the
 * (image hash, target width, target height, background-removal flag)
 * so subsequent ticks that change only the colour count skip the
 * sharp pass and go straight to quantisation.
 *
 * Bounded by entry count, not bytes — every buffer is small (W×H×4 ≤
 * 400 × 400 × 4 ≈ 640KB worst case). Cap at 32 entries (≈20MB worst
 * case across the process; trivially recovered if the GC needs it).
 *
 * Per-ECS-task; sticky-session routing isn't guaranteed so a slider
 * burst that hits a different task pays the cache miss — acceptable.
 */

interface Entry {
  rgba: Buffer
  width: number
  height: number
  insertedAt: number
}

const MAX_ENTRIES = 32
const TTL_MS = 5 * 60 * 1000

const cache = new Map<string, Entry>()

export function downscaleCacheKey(parts: {
  imageHash: string
  width: number
  height: number
  backgroundRemoval: boolean
}): string {
  return `${parts.imageHash}|${parts.width}x${parts.height}|bg=${parts.backgroundRemoval ? 1 : 0}`
}

export function getDownscale(key: string): Entry | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.insertedAt > TTL_MS) {
    cache.delete(key)
    return null
  }
  // LRU touch — move to end.
  cache.delete(key)
  cache.set(key, entry)
  return entry
}

export function putDownscale(
  key: string,
  rgba: Buffer,
  width: number,
  height: number,
): void {
  if (cache.has(key)) cache.delete(key)
  cache.set(key, { rgba, width, height, insertedAt: Date.now() })
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}
