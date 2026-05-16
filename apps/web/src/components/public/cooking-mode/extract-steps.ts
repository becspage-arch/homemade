import type { TipTapNode } from '../tutorial-content/types'

export interface CookingStep {
  /** Display heading for this step. Falls back to "Step N" if no heading. */
  title: string
  /** Top-level body nodes for this step (paragraphs, lists, custom blocks). */
  nodes: TipTapNode[]
}

function plainText(node: TipTapNode | undefined): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (!node.content) return ''
  return node.content.map(plainText).join('')
}

const INGREDIENTS_HEADING_RE =
  /^(ingredients|you'?ll need|what you need|what you'?ll need|equipment)$/i

const METHOD_HEADING_RE =
  /^(method|instructions|how to|how to make( it)?|how to bake( it)?|how to do( it)?|steps|directions|to make)/i

/**
 * Split a tutorial body into step "pages" for cooking mode. The heuristic:
 *
 *   - h2 headings split the body. Each h2 + its following content (until the
 *     next h2) becomes a single step page.
 *   - If a step's heading text matches /^ingredients/i, it's surfaced as the
 *     ingredients block instead of a regular step (the cooking reader pins it
 *     to the top of every step page).
 *   - If the body has no h2s, the whole body becomes a single "Step 1" page.
 *   - Top-level content before the first h2 becomes an "Overview" page if
 *     non-trivial; trivial leading content is folded into the first real step.
 */
export function extractCookingSteps(body: TipTapNode | null): {
  intro: TipTapNode[]
  ingredients: TipTapNode[] | null
  steps: CookingStep[]
} {
  if (!body || !body.content || body.content.length === 0) {
    return { intro: [], ingredients: null, steps: [] }
  }

  const top = body.content

  const intro: TipTapNode[] = []
  let ingredients: TipTapNode[] | null = null
  const steps: CookingStep[] = []
  let currentTitle: string | null = null
  let currentNodes: TipTapNode[] = []
  let methodSeen = false

  const flush = () => {
    if (currentTitle === null && currentNodes.length === 0) return
    const heading = currentTitle ?? `Step ${steps.length + 1}`
    if (currentTitle && INGREDIENTS_HEADING_RE.test(currentTitle.trim())) {
      ingredients = currentNodes
    } else if (currentTitle === null) {
      intro.push(...currentNodes)
    } else {
      steps.push({ title: heading, nodes: currentNodes })
    }
    currentTitle = null
    currentNodes = []
  }

  for (const node of top) {
    const isH2 =
      node.type === 'heading' &&
      node.attrs &&
      typeof node.attrs.level === 'number' &&
      node.attrs.level === 2
    if (isH2) {
      flush()
      currentTitle = plainText(node).trim() || `Step ${steps.length + 1}`
      if (METHOD_HEADING_RE.test(currentTitle)) {
        methodSeen = true
      }
      continue
    }
    currentNodes.push(node)
  }
  flush()

  // If a single h2 was named "Method"/etc and its body is an ordered list,
  // explode each list item into its own step page — that's the shape the
  // bulk cooking content uses.
  if (methodSeen && steps.length >= 1) {
    const methodStepIdx = steps.findIndex((s) =>
      METHOD_HEADING_RE.test(s.title.trim()),
    )
    if (methodStepIdx >= 0) {
      const methodStep = steps[methodStepIdx]
      if (!methodStep) {
        return { intro, ingredients, steps }
      }
      const orderedList = methodStep.nodes.find(
        (n) => n.type === 'orderedList',
      )
      if (orderedList && orderedList.content && orderedList.content.length > 1) {
        const others = methodStep.nodes.filter((n) => n !== orderedList)
        const expanded: CookingStep[] = []
        orderedList.content.forEach((listItem, i) => {
          expanded.push({
            title: `Step ${i + 1}`,
            nodes: [
              // Include any introductory non-list nodes only on the first step
              ...(i === 0 ? others : []),
              ...(listItem.content ?? []),
            ],
          })
        })
        steps.splice(methodStepIdx, 1, ...expanded)
      }
    }
  }

  return { intro, ingredients, steps }
}
