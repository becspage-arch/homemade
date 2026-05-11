import type { TipTapNode } from '@/components/public/tutorial-content/types'

export interface HarvestedSupply {
  /** Stable key used in `UserProject.suppliesChecked` to identify the item. */
  key: string
  qty: string | null
  name: string
  /** Optional substitution hints (visible in beginner mode). */
  substitutions: string | null
}

/**
 * Walk a TipTap document and flatten every `suppliesCard` block's items into a
 * single de-duplicated list. The stable key is built from the lowercased name
 * so ticks survive small edits to the supplies card heading.
 */
export function harvestSupplies(
  body: TipTapNode | null | undefined,
): HarvestedSupply[] {
  if (!body) return []

  const out: HarvestedSupply[] = []
  const seen = new Set<string>()

  function walk(node: TipTapNode): void {
    if (node.type === 'suppliesCard') {
      const attrs = (node.attrs ?? {}) as Record<string, unknown>
      const items = Array.isArray(attrs.items) ? (attrs.items as unknown[]) : []
      for (const raw of items) {
        if (!raw || typeof raw !== 'object') continue
        const item = raw as Record<string, unknown>
        const name = typeof item.name === 'string' ? item.name.trim() : ''
        if (!name) continue
        const key = name.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        const qty = typeof item.qty === 'string' && item.qty.trim() ? item.qty.trim() : null
        const substitutions =
          typeof item.substitutions === 'string' && item.substitutions.trim()
            ? item.substitutions.trim()
            : null
        out.push({ key, qty, name, substitutions })
      }
    }
    if (node.content) for (const c of node.content) walk(c)
  }

  walk(body)
  return out
}
