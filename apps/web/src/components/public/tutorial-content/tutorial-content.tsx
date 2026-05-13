import type { ReactNode } from 'react'

import { InfoPanel } from './blocks/info-panel'
import { SuppliesCard } from './blocks/supplies-card'
import { PullQuote } from './blocks/pull-quote'
import { SubTutorialCard } from './blocks/sub-tutorial-card'
import { GlossaryTooltip } from './blocks/glossary-tooltip'
import { ProductCard } from './blocks/product-card'
import { VarietiesPanel } from './blocks/varieties-panel'
import { Troubleshooter } from './blocks/troubleshooter'
import { IngredientsList } from './blocks/ingredients-list'
import type { IngredientsListItem } from './blocks/ingredients-list'
import type {
  GlossaryRef,
  SubTutorialRef,
  TipTapMark,
  TipTapNode,
} from './types'

import './tutorial-content.css'

interface TutorialContentProps {
  content: TipTapNode | null | undefined
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  /** When true, glossary terms inline-expand and info panels get extra weight. */
  beginnerMode?: boolean
  /**
   * Recipe-specific context — only relevant when the tutorial is a RECIPE.
   * Passed through to the structured-ingredients block for the scaler.
   * Null on technique pages.
   */
  recipeContext?: RecipeRenderContext | null
}

export interface RecipeRenderContext {
  tutorialId: string
  tutorialSlug: string
  scalable: boolean
}

/**
 * Renders TipTap JSON to React, without importing any TipTap runtime. Keeps
 * the public bundle free of editor weight.
 *
 * Supports the StarterKit node set (doc, paragraph, headings, lists, blockquote,
 * codeBlock, hardBreak, horizontalRule, image) plus the five custom blocks
 * defined in the admin editor.
 */
export function TutorialContent({
  content,
  glossary,
  subTutorials,
  beginnerMode = false,
  recipeContext = null,
}: TutorialContentProps): ReactNode {
  if (!content || content.type !== 'doc' || !Array.isArray(content.content)) {
    return (
      <div className={`tutorial-content${beginnerMode ? ' beginner' : ''}`}>
        <p className="lead">This tutorial has no content yet.</p>
      </div>
    )
  }

  return (
    <div className={`tutorial-content${beginnerMode ? ' beginner' : ''}`}>
      {content.content.map((node, i) => (
        <RenderNode
          key={i}
          node={node}
          glossary={glossary}
          subTutorials={subTutorials}
          beginnerMode={beginnerMode}
          recipeContext={recipeContext}
        />
      ))}
    </div>
  )
}

interface RenderContext {
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  beginnerMode: boolean
  recipeContext: RecipeRenderContext | null
}

interface RenderNodeProps {
  node: TipTapNode
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  beginnerMode: boolean
  recipeContext: RecipeRenderContext | null
}

function RenderNode({
  node,
  glossary,
  subTutorials,
  beginnerMode,
  recipeContext,
}: RenderNodeProps): ReactNode {
  const ctx: RenderContext = { glossary, subTutorials, beginnerMode, recipeContext }
  const attrs = (node.attrs ?? {}) as Record<string, unknown>

  switch (node.type) {
    case 'paragraph':
      return <p>{renderChildren(node.content, ctx)}</p>

    case 'heading': {
      const level = Math.min(Math.max(Number(attrs.level) || 2, 1), 6)
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const id = stringOrUndef(attrs.id) ?? slugifyText(extractText(node))
      return <Tag id={id || undefined}>{renderChildren(node.content, ctx)}</Tag>
    }

    case 'bulletList':
      return <ul>{renderChildren(node.content, ctx)}</ul>

    case 'orderedList':
      return <ol>{renderChildren(node.content, ctx)}</ol>

    case 'listItem': {
      // TipTap wraps li content in paragraphs; unwrap a single-paragraph li
      // for cleaner rendering.
      const items = node.content ?? []
      if (items.length === 1 && items[0]?.type === 'paragraph') {
        return <li>{renderChildren(items[0].content, ctx)}</li>
      }
      return <li>{renderChildren(items, ctx)}</li>
    }

    case 'blockquote':
      return <blockquote>{renderChildren(node.content, ctx)}</blockquote>

    case 'codeBlock':
      return (
        <pre>
          <code>{renderChildren(node.content, ctx)}</code>
        </pre>
      )

    case 'horizontalRule':
      return <hr />

    case 'hardBreak':
      return <br />

    case 'image': {
      const src = stringOrUndef(attrs.src)
      if (!src) return null
      return (
        // CMS-authored images may point at arbitrary hosts that aren't on
        // next/image's allowlist — keep a plain <img> tag for inline editor
        // images. Hero / lead photography uses next/image elsewhere.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={stringOrUndef(attrs.alt) ?? ''}
          title={stringOrUndef(attrs.title)}
        />
      )
    }

    case 'text':
      return renderText(node, ctx)

    case 'infoPanel':
      return (
        <InfoPanel
          tone={stringOrUndef(attrs.tone) ?? 'tip'}
          title={stringOrUndef(attrs.title) ?? ''}
          body={stringOrUndef(attrs.body) ?? ''}
          beginnerMode={beginnerMode}
        />
      )

    case 'suppliesCard':
      return (
        <SuppliesCard
          heading={stringOrUndef(attrs.heading) ?? ''}
          items={Array.isArray(attrs.items) ? (attrs.items as never[]) : []}
          beginnerMode={beginnerMode}
        />
      )

    case 'pullQuote':
      return (
        <PullQuote
          quote={stringOrUndef(attrs.quote) ?? ''}
          attribution={stringOrUndef(attrs.attribution) ?? ''}
        />
      )

    case 'subTutorialCard': {
      const id = stringOrUndef(attrs.tutorialId)
      if (!id) {
        return (
          <div className="sub-tutorial-card-missing">
            Linked tutorial not yet chosen.
          </div>
        )
      }
      return <SubTutorialCard tutorialId={id} refs={subTutorials} />
    }

    case 'productCard':
      return (
        <ProductCard
          imageUrl={stringOrUndef(attrs.imageUrl) ?? ''}
          title={stringOrUndef(attrs.title) ?? ''}
          description={stringOrUndef(attrs.description) ?? ''}
          label={stringOrUndef(attrs.label) ?? ''}
          price={stringOrUndef(attrs.price) ?? ''}
          currency={stringOrUndef(attrs.currency) ?? ''}
          retailerName={stringOrUndef(attrs.retailerName) ?? ''}
          productUrl={stringOrUndef(attrs.productUrl) ?? ''}
        />
      )

    case 'varietiesPanel':
      return (
        <VarietiesPanel
          label={stringOrUndef(attrs.label) ?? ''}
          heading={stringOrUndef(attrs.heading) ?? ''}
          intro={stringOrUndef(attrs.intro) ?? ''}
          items={Array.isArray(attrs.items) ? (attrs.items as never[]) : []}
        />
      )

    case 'troubleshooter':
      return (
        <Troubleshooter
          heading={stringOrUndef(attrs.heading) ?? ''}
          intro={stringOrUndef(attrs.intro) ?? ''}
          items={Array.isArray(attrs.items) ? (attrs.items as never[]) : []}
        />
      )

    case 'ingredientsList': {
      // Renders nothing on a technique page (no recipe context). Bodies that
      // accidentally carry the block on a technique fall through silently.
      if (!recipeContext) return null
      const items = Array.isArray(attrs.items)
        ? (attrs.items as Array<Record<string, unknown>>)
        : []
      const defaultServings =
        typeof attrs.defaultServings === 'number' ? attrs.defaultServings : null
      const cleanItems: IngredientsListItem[] = items.map((raw) => ({
        ingredientId: stringOrUndef(raw.ingredientId) ?? '',
        ingredientSlug: stringOrUndef(raw.ingredientSlug) ?? '',
        name: stringOrUndef(raw.name) ?? '',
        amount: typeof raw.amount === 'number' ? raw.amount : null,
        unit: stringOrUndef(raw.unit) ?? null,
        prepNote: stringOrUndef(raw.prepNote) ?? null,
        isOptional: raw.isOptional === true,
        groupLabel: stringOrUndef(raw.groupLabel) ?? null,
      }))
      return (
        <IngredientsList
          tutorialId={recipeContext.tutorialId}
          tutorialSlug={recipeContext.tutorialSlug}
          items={cleanItems}
          defaultServings={defaultServings}
          scalable={recipeContext.scalable}
        />
      )
    }

    case 'doc':
      // Defensive: doc inside doc shouldn't happen but render its children.
      return <>{renderChildren(node.content, ctx)}</>

    default:
      // Unknown node — render any children so we don't lose nested text.
      return <>{renderChildren(node.content, ctx)}</>
  }
}

function renderChildren(
  nodes: TipTapNode[] | undefined,
  ctx: RenderContext,
): ReactNode[] {
  if (!nodes) return []
  return nodes.map((n, i) => (
    <RenderNode
      key={i}
      node={n}
      glossary={ctx.glossary}
      subTutorials={ctx.subTutorials}
      beginnerMode={ctx.beginnerMode}
      recipeContext={ctx.recipeContext}
    />
  ))
}

function renderText(node: TipTapNode, ctx: RenderContext): ReactNode {
  const text = node.text ?? ''
  if (!text) return null
  const marks = sortMarks(node.marks ?? [])
  return marks.reduce<ReactNode>((children, mark) => wrapMark(mark, children, ctx), text)
}

// Sort marks to a deterministic outer-to-inner order so nesting is stable.
const MARK_ORDER: Record<string, number> = {
  link: 0,
  glossaryTooltip: 1,
  bold: 2,
  italic: 3,
  underline: 4,
  strike: 5,
  code: 6,
}

function sortMarks(marks: TipTapMark[]): TipTapMark[] {
  return [...marks].sort(
    (a, b) => (MARK_ORDER[a.type] ?? 99) - (MARK_ORDER[b.type] ?? 99),
  )
}

function wrapMark(mark: TipTapMark, children: ReactNode, ctx: RenderContext): ReactNode {
  const attrs = (mark.attrs ?? {}) as Record<string, unknown>
  switch (mark.type) {
    case 'bold':
      return <strong>{children}</strong>
    case 'italic':
      return <em>{children}</em>
    case 'underline':
      return <u>{children}</u>
    case 'strike':
      return <s>{children}</s>
    case 'code':
      return <code>{children}</code>
    case 'link': {
      const href = stringOrUndef(attrs.href)
      if (!href || !isSafeHref(href)) return <>{children}</>
      const isExternal = /^https?:\/\//i.test(href)
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer nofollow' : undefined}
        >
          {children}
        </a>
      )
    }
    case 'glossaryTooltip': {
      const termId = stringOrUndef(attrs.termId)
      if (!termId) return <>{children}</>
      return (
        <GlossaryTooltip
          termId={termId}
          glossary={ctx.glossary}
          beginnerMode={ctx.beginnerMode}
        >
          {children}
        </GlossaryTooltip>
      )
    }
    default:
      return <>{children}</>
  }
}

function isSafeHref(href: string): boolean {
  const trimmed = href.trim().toLowerCase()
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return false
  }
  return true
}

function stringOrUndef(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function extractText(node: TipTapNode): string {
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map(extractText).join('')
}

function slugifyText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
