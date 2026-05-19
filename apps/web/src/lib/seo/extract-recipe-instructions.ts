import type { TipTapNode } from '@/components/public/tutorial-content/types'

/**
 * Walk a TipTap document and pull out an ordered list of recipe / how-to
 * step text. We treat each ordered-list item, each numbered heading, and
 * each "method" paragraph as a step when it looks like one. Schema.org
 * `HowToStep` only needs `text`; we omit numbered headings without prose.
 */
export function extractRecipeInstructions(
  body: TipTapNode | null | undefined,
): string[] {
  if (!body) return []
  const steps: string[] = []

  function plainText(node: TipTapNode): string {
    if (typeof node.text === 'string') return node.text
    if (!node.content) return ''
    return node.content.map(plainText).join('')
  }

  function walk(node: TipTapNode): void {
    if (node.type === 'orderedList' && node.content) {
      for (const li of node.content) {
        const text = plainText(li).trim()
        if (text) steps.push(text)
      }
      return
    }
    if (node.content) for (const child of node.content) walk(child)
  }

  walk(body)
  return steps.filter((s) => s.length > 0)
}

export function extractPlainText(
  body: TipTapNode | null | undefined,
  maxLength = 300,
): string {
  if (!body) return ''
  function plainText(node: TipTapNode): string {
    if (typeof node.text === 'string') return node.text
    if (!node.content) return ''
    return node.content.map(plainText).join(' ')
  }
  const raw = plainText(body).replace(/\s+/g, ' ').trim()
  if (raw.length <= maxLength) return raw
  return raw.slice(0, maxLength - 1).trimEnd() + '…'
}
