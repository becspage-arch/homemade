/**
 * Stitch-reference data builder.
 *
 * Reads the craft-keyed master `Stitch` table and shapes it into a
 * grouped, render-ready reference: one section per stitch category, each
 * stitch carrying its UK/US names + abbreviations, the one-line how-it-
 * works note, its chart symbol key (when one exists in the symbol
 * library), and a link to the published STITCH tutorial that teaches it
 * (when there is one).
 *
 * Shared by the public stitch-reference page (`/stitches/[craft]`) and
 * the crochet Studio "Stitches in this pattern" panel, so both surfaces
 * speak from one source of truth. Server-only (touches Prisma).
 */

import { prisma, TutorialStatus } from '@homemade/db'
import { getChartSymbol } from '@/lib/craft-charts/chart-symbols'
import type { Craft } from '@/lib/craft-charts/types'
import { STITCH_WORKING_STEPS } from '@/lib/stitch-working-steps'

export interface StitchReferenceEntry {
  slug: string
  canonicalName: string
  ukName: string | null
  usName: string | null
  ukAbbreviation: string | null
  usAbbreviation: string | null
  category: string
  /** Symbol key, present only when the library actually draws a glyph
   *  for it. Null for specialty stitches that are worked per-pattern and
   *  have no single-cell chart symbol (Tunisian, hairpin, broomstick…). */
  chartSymbol: string | null
  difficulty: string | null
  notes: string | null
  /** Concise imperative "how to work it" steps for the cheat sheet, when
   *  this stitch is one of the quick-reference stitches. Null for
   *  specialty stitches that lean on their full lesson instead. */
  workingSteps: string[] | null
  /** The published STITCH tutorial that teaches this stitch, if any. */
  tutorial: { slug: string; categorySlug: string } | null
}

export interface StitchReferenceGroup {
  category: string
  label: string
  blurb: string | null
  stitches: StitchReferenceEntry[]
}

/**
 * Display order + human labels for the stitch categories. Categories not
 * listed here are appended in alphabetical order with a title-cased
 * label, so a new category added to the seed never disappears.
 */
const CATEGORY_ORDER: Array<{ key: string; label: string; blurb: string | null }> = [
  { key: 'foundation', label: 'Getting started', blurb: 'The first moves — where every piece begins.' },
  { key: 'basic', label: 'Basic stitches', blurb: 'The everyday stitches almost every pattern is built from.' },
  {
    key: 'outline',
    label: 'Outlines and lines',
    blurb: 'Worked over the top of finished stitches to draw an edge.',
  },
  {
    key: 'surface',
    label: 'Surface stitches',
    blurb: 'Knots, loops and filled shapes for detail the grid cannot hold.',
  },
  {
    key: 'method',
    label: 'Working methods',
    blurb: 'Ways of working through a chart, rather than stitches in their own right.',
  },
  { key: 'increase', label: 'Increases', blurb: 'Adding stitches to shape a piece wider.' },
  { key: 'decrease', label: 'Decreases', blurb: 'Working stitches together to shape a piece narrower.' },
  { key: 'textured', label: 'Textured stitches', blurb: 'Bobbles, posts and clusters that stand off the fabric.' },
  { key: 'lace', label: 'Lace & openwork', blurb: 'Open, airy stitches for shawls, doilies and edgings.' },
  { key: 'colourwork', label: 'Colourwork', blurb: 'Carrying and changing colour as you go.' },
  { key: 'edging', label: 'Edgings & borders', blurb: 'Finishing stitches worked along an edge.' },
  { key: 'joining', label: 'Joining', blurb: 'Seaming and joining pieces together.' },
  { key: 'special', label: 'Special techniques', blurb: 'Tunisian, hairpin, broomstick and other specialities, each with its own method.' },
]

const CATEGORY_INDEX = new Map(CATEGORY_ORDER.map((c, i) => [c.key, { ...c, order: i }]))

function labelForCategory(key: string): { label: string; blurb: string | null; order: number } {
  const known = CATEGORY_INDEX.get(key)
  if (known) return { label: known.label, blurb: known.blurb, order: known.order }
  // Unknown category: title-case the key, sort after all known ones.
  const label = key.replace(/(^|[-\s])([a-z])/g, (_, sep, ch) => (sep ? ' ' : '') + ch.toUpperCase())
  return { label, blurb: null, order: CATEGORY_ORDER.length }
}

/**
 * Build the grouped stitch reference for a craft. Returns an empty array
 * when the craft has no seeded stitches. Stitches within a group sort by
 * difficulty (beginner first) then canonical name.
 */
export async function getStitchReference(craft: Craft): Promise<StitchReferenceGroup[]> {
  const stitches = await prisma.stitch.findMany({
    where: { craft },
    select: {
      slug: true,
      canonicalName: true,
      ukName: true,
      usName: true,
      ukAbbreviation: true,
      usAbbreviation: true,
      category: true,
      chartSymbol: true,
      difficulty: true,
      notes: true,
    },
  })

  if (stitches.length === 0) return []

  // Resolve the STITCH tutorial that teaches each stitch. One query,
  // first-match-wins per slug (same shape as the stitch-help API route).
  const slugs = stitches.map((s) => s.slug)
  //
  // A dedicated STITCH lesson wins where one exists. Cross-stitch teaches its
  // stitches as TECHNIQUE rows ("How to work a full cross-stitch"), so a
  // TECHNIQUE row is accepted as the fallback rather than leaving the stitch
  // with no lesson to open. Crafts that have both keep their STITCH lesson.
  const tutorials = await prisma.tutorial.findMany({
    where: {
      type: { in: ['STITCH', 'TECHNIQUE'] },
      status: TutorialStatus.PUBLISHED,
      craftStitchSlugs: { hasSome: slugs },
    },
    select: { slug: true, type: true, craftStitchSlugs: true, category: { select: { slug: true } } },
  })
  const tutorialForSlug = (slug: string) => {
    const matches = tutorials.filter((tut) => tut.craftStitchSlugs.includes(slug))
    const t = matches.find((tut) => tut.type === 'STITCH') ?? matches[0]
    return t ? { slug: t.slug, categorySlug: t.category.slug } : null
  }

  const difficultyRank = (d: string | null): number =>
    d === 'BEGINNER' ? 0 : d === 'INTERMEDIATE' ? 1 : d === 'ADVANCED' ? 2 : 3

  const byCategory = new Map<string, StitchReferenceEntry[]>()
  for (const s of stitches) {
    const entry: StitchReferenceEntry = {
      slug: s.slug,
      canonicalName: s.canonicalName,
      ukName: s.ukName,
      usName: s.usName,
      ukAbbreviation: s.ukAbbreviation,
      usAbbreviation: s.usAbbreviation,
      category: s.category,
      // Only keep a symbol key the library can actually draw — otherwise
      // the surfaces know to show a "worked per pattern" fallback rather
      // than a blank cell.
      chartSymbol: s.chartSymbol && getChartSymbol(craft, s.chartSymbol) ? s.chartSymbol : null,
      difficulty: s.difficulty,
      notes: s.notes,
      workingSteps: STITCH_WORKING_STEPS[s.slug] ?? null,
      tutorial: tutorialForSlug(s.slug),
    }
    const list = byCategory.get(s.category) ?? []
    list.push(entry)
    byCategory.set(s.category, list)
  }

  const groups: Array<StitchReferenceGroup & { order: number }> = []
  for (const [category, list] of byCategory) {
    const { label, blurb, order } = labelForCategory(category)
    list.sort(
      (a, b) =>
        difficultyRank(a.difficulty) - difficultyRank(b.difficulty) ||
        a.canonicalName.localeCompare(b.canonicalName),
    )
    groups.push({ category, label, blurb, stitches: list, order })
  }

  groups.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
  return groups.map(({ order: _order, ...g }) => g)
}

/** Craft slugs the reference page is allowed to render. */
export const REFERENCE_CRAFTS: Record<string, { craft: Craft; title: string }> = {
  crochet: { craft: 'crochet', title: 'Crochet' },
  knitting: { craft: 'knitting', title: 'Knitting' },
  'cross-stitch': { craft: 'cross-stitch', title: 'Cross-stitch' },
}
