import 'server-only'
import type { TipTapNode } from '@/components/public/tutorial-content/types'

/**
 * Server-side body preprocessor. Walks a TipTap body tree and inlines
 * tutorial-level data into nodes that declare a "use tutorial data"
 * flag.
 *
 * Currently handles:
 *
 *   craftChart with attrs.useTutorialChart: true
 *     -> injects tutorial.chartDefinition into attrs.definition
 *
 * Returns a cloned tree, never mutates the input.
 *
 * The reason this lives server-side rather than as a client-side
 * fallback prop: tutorial.chartDefinition is a large JSON blob and
 * passing it as a separate prop bloats the client tree without
 * benefit. The renderer reads `attrs.definition` and that's all it
 * needs to know.
 */

interface BodyPrepInput {
  chartDefinition?: unknown
}

export function prepareTutorialBody(
  body: TipTapNode | null,
  input: BodyPrepInput,
): TipTapNode | null {
  if (!body) return body
  return walk(body, input)
}

function walk(node: TipTapNode, input: BodyPrepInput): TipTapNode {
  // craftChart fallback: when the node carries useTutorialChart: true
  // and no inline definition, inject the tutorial-level chart data.
  if (
    node.type === 'craftChart' &&
    node.attrs &&
    typeof node.attrs === 'object' &&
    (node.attrs as Record<string, unknown>).useTutorialChart === true &&
    !(node.attrs as Record<string, unknown>).definition &&
    input.chartDefinition
  ) {
    return {
      ...node,
      attrs: {
        ...node.attrs,
        definition: input.chartDefinition,
      },
    }
  }

  // Recurse into children
  if (Array.isArray(node.content) && node.content.length > 0) {
    return {
      ...node,
      content: node.content.map((child) => walk(child, input)),
    }
  }

  return node
}
