/**
 * Server-safe extractor for recipe-scale ingredients.
 *
 * Lives in its own module (no 'use client') so server components can call
 * it before passing the result into the client `ScaleProvider`. Keeping it
 * inside `scale-context.tsx` would mark the function as a client export,
 * and Next 16 throws if a server component tries to invoke it.
 */

export interface ScaleIngredient {
  slug: string
  amount: number | null
  unit: string | null
}

/**
 * Walks a TipTap doc and pulls every `ingredientsList` row's
 * `{ slug, amount, unit }` for the ScaleProvider. Pure data — safe to run
 * in a server component. Skips rows without a slug.
 */
export function extractScaleIngredients(doc: unknown): ScaleIngredient[] {
  const out: ScaleIngredient[] = []
  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return
    const n = node as { type?: string; attrs?: Record<string, unknown>; content?: unknown[] }
    if (n.type === 'ingredientsList' && n.attrs && typeof n.attrs === 'object') {
      const attrs = n.attrs as Record<string, unknown>
      const items = Array.isArray(attrs.items) ? (attrs.items as unknown[]) : []
      for (const raw of items) {
        if (!raw || typeof raw !== 'object') continue
        const row = raw as Record<string, unknown>
        const slug = typeof row.ingredientSlug === 'string' ? row.ingredientSlug.trim() : ''
        if (!slug) continue
        const amount = typeof row.amount === 'number' ? row.amount : null
        const unit = typeof row.unit === 'string' && row.unit.trim() ? row.unit.trim() : null
        out.push({ slug, amount, unit })
      }
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child)
    }
  }
  walk(doc)
  return out
}
