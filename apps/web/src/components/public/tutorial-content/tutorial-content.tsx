import type { ReactNode } from 'react'

import { InfoPanel } from './blocks/info-panel'
import { SuppliesCard } from './blocks/supplies-card'
import { PullQuote } from './blocks/pull-quote'
import { SubTutorialCard } from './blocks/sub-tutorial-card'
import { GlossaryTooltip } from './blocks/glossary-tooltip'
import { TechniqueLink } from './blocks/technique-link'
import { ProductCard } from './blocks/product-card'
import { VarietiesPanel } from './blocks/varieties-panel'
import { Troubleshooter } from './blocks/troubleshooter'
import { IngredientsList } from './blocks/ingredients-list'
import type { IngredientsListItem } from './blocks/ingredients-list'
import { CraftChart } from '@/lib/craft-charts/svg-chart'
import type { ChartDefinition } from '@/lib/craft-charts/types'
import { CalligraphyExemplar } from '@/lib/chart-renderers/calligraphy-exemplar'
import { OrigamiFoldBasic } from '@/lib/chart-renderers/origami-fold-basic'
import { WeavingDraft } from '@/lib/chart-renderers/weaving-draft'
import { MacrameKnot } from '@/lib/chart-renderers/macrame-knot'
import {
  renderCrossStitchChart,
  type CrossStitchChart as CrossStitchChartDefinition,
} from '@/lib/chart-renderers/cross-stitch'
import type {
  CalligraphyExemplarDefinition,
  MacrameKnotDefinition,
  OrigamiFoldDefinition,
  WeavingDraftDefinition,
} from '@/lib/chart-renderers/types'
import { CrossStitchChartView } from '../chart-viewer/cross-stitch-chart-view'
import { ReferenceChartView } from '../chart-viewer/reference-chart-view'
import { ChartSignInGate } from '../chart-viewer/chart-sign-in-gate'
import { OrigamiFoldView } from '../chart-viewer/origami-fold-view'
import { CraftChartView } from '../chart-viewer/craft-chart-view'
import { WeavingDraftView } from '../chart-viewer/weaving-draft-view'
import '../chart-viewer/chart-viewer.css'
import { ScaleToken } from './scale-context'
import type {
  GlossaryRef,
  SubTutorialRef,
  TechniqueRef,
  TipTapMark,
  TipTapNode,
} from './types'

import './tutorial-content.css'

interface TutorialContentProps {
  content: TipTapNode | null | undefined
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  /**
   * Technique tutorials referenced inline via the `techniqueLink` mark.
   * Resolved once at page-render time by `loadContentRefs` from the slugs
   * collected out of the body. The renderer falls back to plain text when
   * a slug isn't in this list — the matching technique hasn't been
   * authored yet, but the link will go live the moment it is.
   */
  techniques?: TechniqueRef[]
  /** When true, glossary terms inline-expand and info panels get extra weight. */
  beginnerMode?: boolean
  /**
   * Recipe-specific context — only relevant when the tutorial is a RECIPE.
   * Passed through to the structured-ingredients block for the scaler.
   * Null on technique pages.
   */
  recipeContext?: RecipeRenderContext | null
  /**
   * Tutorial id — required when the body contains a chart node so the
   * chart viewer can persist progress per (user, tutorial, chartIndex).
   * Pass null on preview surfaces that should not write progress.
   */
  tutorialId?: string | null
  /**
   * Whether the current viewer is signed in. Charts are auth-gated —
   * anonymous users see a sign-in CTA in place of every chart node.
   * Defaults to false; callers that know better must opt in.
   */
  isSignedIn?: boolean
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
  techniques = [],
  beginnerMode = false,
  recipeContext = null,
  tutorialId = null,
  isSignedIn = false,
}: TutorialContentProps): ReactNode {
  if (!content || content.type !== 'doc' || !Array.isArray(content.content)) {
    return (
      <div className={`tutorial-content${beginnerMode ? ' beginner' : ''}`}>
        <p className="lead">This tutorial has no content yet.</p>
      </div>
    )
  }

  // Chart nodes get a stable 0-based ordinal so the chart viewer can
  // persist progress per chart. Walk the doc once to assign indices.
  const chartIndexByNode = assignChartIndices(content.content)

  return (
    <div className={`tutorial-content${beginnerMode ? ' beginner' : ''}`}>
      {content.content.map((node, i) => (
        <RenderNode
          key={i}
          node={node}
          glossary={glossary}
          subTutorials={subTutorials}
          techniques={techniques}
          beginnerMode={beginnerMode}
          recipeContext={recipeContext}
          tutorialId={tutorialId}
          isSignedIn={isSignedIn}
          chartIndex={chartIndexByNode.get(node) ?? null}
        />
      ))}
    </div>
  )
}

/**
 * Walk the top-level body once and assign every chart-bearing node a
 * 0-based ordinal. Chart kinds are the six interactive renderers. Empty
 * map when no charts are present.
 */
function assignChartIndices(nodes: TipTapNode[]): Map<TipTapNode, number> {
  const CHART_TYPES = new Set([
    'crossStitchChart',
    'craftChart',
    'weavingDraft',
    'calligraphyExemplar',
    'origamiFoldDiagram',
    'macrameKnot',
  ])
  const map = new Map<TipTapNode, number>()
  let i = 0
  for (const node of nodes) {
    if (node.type && CHART_TYPES.has(node.type)) {
      map.set(node, i)
      i++
    }
  }
  return map
}

interface RenderContext {
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  techniques: TechniqueRef[]
  beginnerMode: boolean
  recipeContext: RecipeRenderContext | null
  tutorialId: string | null
  isSignedIn: boolean
}

interface RenderNodeProps {
  node: TipTapNode
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  techniques: TechniqueRef[]
  beginnerMode: boolean
  recipeContext: RecipeRenderContext | null
  tutorialId?: string | null
  isSignedIn?: boolean
  chartIndex?: number | null
}

function RenderNode({
  node,
  glossary,
  subTutorials,
  techniques,
  beginnerMode,
  recipeContext,
  tutorialId = null,
  isSignedIn = false,
  chartIndex = null,
}: RenderNodeProps): ReactNode {
  const ctx: RenderContext = {
    glossary,
    subTutorials,
    techniques,
    beginnerMode,
    recipeContext,
    tutorialId,
    isSignedIn,
  }
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

    case 'craftChart': {
      // Crochet / knitting / needlework chart. The block carries either an
      // inline `definition` object or a `useTutorialChart: true` flag — in
      // which case the renderer page is expected to pass the Tutorial's
      // `chartDefinition` JSON into the body before render. The inline
      // pathway is used by anchor briefs that don't need cross-block reuse;
      // the tutorial-column pathway covers the bulk pipeline.
      const def = attrs.definition as ChartDefinition | undefined
      if (!def || typeof def !== 'object') {
        return <div className="craft-chart-missing">Chart not yet attached.</div>
      }
      if (!isSignedIn) return <ChartSignInGate subtitle="Crochet / knitting chart" />
      if (!tutorialId || chartIndex === null) {
        return (
          <ReferenceChartView ariaLabel="Craft chart">
            <CraftChart definition={def} />
          </ReferenceChartView>
        )
      }
      return (
        <CraftChartView
          definition={def}
          tutorialId={tutorialId}
          chartIndex={chartIndex}
        />
      )
    }

    case 'crossStitchChart': {
      // Needlework — cross-stitch colour-symbol grid. Interactive client
      // viewer wraps the chart with mark-stitch, view-mode toggles,
      // legend highlight, palette swap, and progress persistence via
      // `/api/me/chart-progress/[tutorialId]/[chartIndex]`. Anonymous
      // users hit the sign-in gate.
      const def = attrs.definition as CrossStitchChartDefinition | undefined
      if (!def || typeof def !== 'object') {
        return <div className="craft-chart-missing">Chart not yet attached.</div>
      }
      if (!isSignedIn) return <ChartSignInGate subtitle="Cross-stitch chart" />
      if (!tutorialId || chartIndex === null) {
        // Preview / non-persisted surface — render as reference-mode only.
        return (
          <ReferenceChartView ariaLabel={def.title ?? 'Cross-stitch chart'}>
            <CrossStitchPreviewSvgFallback definition={def} />
          </ReferenceChartView>
        )
      }
      return (
        <CrossStitchChartView
          definition={def}
          tutorialId={tutorialId}
          chartIndex={chartIndex}
        />
      )
    }

    case 'calligraphyExemplar': {
      // Paper & word — per-glyph calligraphy exemplar. Reference-mode only
      // (no mark-progress); zoom + pan + fullscreen via the shell.
      const def = attrs.definition as CalligraphyExemplarDefinition | undefined
      if (!def || typeof def !== 'object') {
        return <div className="craft-chart-missing">Exemplar not yet attached.</div>
      }
      if (!isSignedIn) return <ChartSignInGate subtitle="Calligraphy exemplar" />
      return (
        <ReferenceChartView
          ariaLabel="Calligraphy exemplar"
          tutorialId={tutorialId}
          chartIndex={chartIndex}
        >
          <CalligraphyExemplar definition={def} />
        </ReferenceChartView>
      )
    }

    case 'origamiFoldDiagram': {
      // Paper & word — origami fold sequence (v1 basic-folds renderer).
      // Interactive per-step marking; current-step highlight; persisted
      // via the chart-progress API. Preview surfaces (no tutorialId)
      // fall back to the static SVG inside a reference shell.
      const def = attrs.definition as OrigamiFoldDefinition | undefined
      if (!def || typeof def !== 'object') {
        return <div className="craft-chart-missing">Fold diagram not yet attached.</div>
      }
      if (!isSignedIn) return <ChartSignInGate subtitle="Origami fold diagram" />
      if (!tutorialId || chartIndex === null) {
        return (
          <ReferenceChartView ariaLabel={def.title ?? 'Origami fold diagram'}>
            <OrigamiFoldBasic definition={def} />
          </ReferenceChartView>
        )
      }
      return (
        <OrigamiFoldView
          definition={def}
          tutorialId={tutorialId}
          chartIndex={chartIndex}
        />
      )
    }

    case 'weavingDraft': {
      // Fibre arts — weaving draft (threading × shafts, tie-up,
      // treadling, computed drawdown). Interactive per-pick marking;
      // preview surfaces (no tutorialId) fall back to reference mode.
      const def = attrs.definition as WeavingDraftDefinition | undefined
      if (!def || typeof def !== 'object') {
        return <div className="craft-chart-missing">Draft not yet attached.</div>
      }
      if (!isSignedIn) return <ChartSignInGate subtitle="Weaving draft" />
      if (!tutorialId || chartIndex === null) {
        return (
          <ReferenceChartView ariaLabel="Weaving draft">
            <WeavingDraft definition={def} />
          </ReferenceChartView>
        )
      }
      return (
        <WeavingDraftView
          definition={def}
          tutorialId={tutorialId}
          chartIndex={chartIndex}
        />
      )
    }

    case 'macrameKnot': {
      // Fibre arts — macramé knot diagram. Single-knot reference;
      // zoom + fullscreen only.
      const def = attrs.definition as MacrameKnotDefinition | undefined
      if (!def || typeof def !== 'object') {
        return <div className="craft-chart-missing">Knot diagram not yet attached.</div>
      }
      if (!isSignedIn) return <ChartSignInGate subtitle="Macramé knot diagram" />
      return (
        <ReferenceChartView
          ariaLabel="Macramé knot diagram"
          tutorialId={tutorialId}
          chartIndex={chartIndex}
        >
          <MacrameKnot definition={def} />
        </ReferenceChartView>
      )
    }

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

function CrossStitchPreviewSvgFallback({
  definition,
}: {
  definition: CrossStitchChartDefinition
}): ReactNode {
  // Static SVG fallback for preview surfaces that don't have a tutorialId
  // to persist progress against (e.g. /admin/dev/cross-stitch-preview).
  return (
    <div
      className="craft-chart craft-chart-cross-stitch"
      dangerouslySetInnerHTML={{ __html: renderCrossStitchChart(definition) }}
    />
  )
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
      techniques={ctx.techniques}
      beginnerMode={ctx.beginnerMode}
      recipeContext={ctx.recipeContext}
    />
  ))
}

function renderText(node: TipTapNode, ctx: RenderContext): ReactNode {
  const text = node.text ?? ''
  if (!text) return null
  // Split out any `{{ingredient-slug}}` scaling tokens before applying marks.
  // The token segments render as <ScaleToken> so they react to the recipe
  // scale selector; the literal text segments fall through as plain strings.
  // On technique pages (no recipe context) ScaleToken falls back to the
  // literal `{{slug}}` text so nothing surprising appears.
  const segments = splitTokenSegments(text)
  const rendered: ReactNode =
    segments.length === 1 && typeof segments[0] === 'string'
      ? segments[0]
      : segments.map((seg, i) =>
          typeof seg === 'string'
            ? <span key={i}>{seg}</span>
            : <ScaleToken key={i} slug={seg.slug} />,
        )
  const marks = sortMarks(node.marks ?? [])
  return marks.reduce<ReactNode>((children, mark) => wrapMark(mark, children, ctx), rendered)
}

const TOKEN_PATTERN = /\{\{([a-z0-9]+(?:-[a-z0-9]+)*)\}\}/g

type TextSegment = string | { token: true; slug: string }

function splitTokenSegments(text: string): TextSegment[] {
  if (!text.includes('{{')) return [text]
  const out: TextSegment[] = []
  let lastIndex = 0
  TOKEN_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) out.push(text.slice(lastIndex, match.index))
    out.push({ token: true, slug: match[1]! })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex))
  return out.length > 0 ? out : [text]
}

// Sort marks to a deterministic outer-to-inner order so nesting is stable.
// `techniqueLink` and `glossaryTooltip` both render anchor-like wrappers and
// can't legally nest inside each other in HTML; the author UI only allows
// one or the other on a given selection, but the sort order pins the rule.
const MARK_ORDER: Record<string, number> = {
  link: 0,
  techniqueLink: 1,
  glossaryTooltip: 2,
  bold: 3,
  italic: 4,
  underline: 5,
  strike: 6,
  code: 7,
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
    case 'techniqueLink': {
      const techniqueSlug = stringOrUndef(attrs.techniqueSlug)
      if (!techniqueSlug) return <>{children}</>
      return (
        <TechniqueLink
          techniqueSlug={techniqueSlug}
          label={stringOrUndef(attrs.label) ?? ''}
          techniques={ctx.techniques}
        >
          {children}
        </TechniqueLink>
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
