/**
 * Planner PDF — a clean, printable roll-up of a maker's plan: their project
 * queue, the combined materials, and the shopping list (what to buy after the
 * stash). Craft-agnostic: it renders normalised planner data, so every craft's
 * planner exports through here.
 *
 * Text + tables only, so unlike the chart PDF this needs no rasterisation —
 * just pdf-lib with a Unicode-capable embedded font for accented colour names.
 */

import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PlannerProjectView } from './service'
import type { RolledUpMaterial } from './types'
import type { MaterialsTotals } from './rollup'

const FONT_DIR_CANDIDATES = ['apps/web/public/fonts', 'public/fonts']

function loadBundledFont(file: string): Buffer | null {
  for (const dir of FONT_DIR_CANDIDATES) {
    try {
      return readFileSync(join(process.cwd(), dir, file))
    } catch {
      // try next candidate
    }
  }
  return null
}

const A4 = { width: 595.28, height: 841.89 }
const MARGIN = 48
const INK = rgb(0.13, 0.12, 0.1)
const MUTED = rgb(0.42, 0.4, 0.36)
const RULE = rgb(0.83, 0.8, 0.74)

export interface PlannerPdfInput {
  makerName: string | null
  craftLabel: string
  projects: PlannerProjectView[]
  materials: RolledUpMaterial[]
  totals: MaterialsTotals
  notes: string[]
}

function fmt(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}

export async function buildPlannerPdf(input: PlannerPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)

  const regularBytes = loadBundledFont('DejaVuSans.ttf')
  const boldBytes = loadBundledFont('DejaVuSans-Bold.ttf')
  const regular = regularBytes
    ? await doc.embedFont(regularBytes, { subset: true })
    : await doc.embedFont(StandardFonts.Helvetica)
  const bold = boldBytes
    ? await doc.embedFont(boldBytes, { subset: true })
    : await doc.embedFont(StandardFonts.HelveticaBold)

  let page = doc.addPage([A4.width, A4.height])
  let y = A4.height - MARGIN

  const newPage = () => {
    page = doc.addPage([A4.width, A4.height])
    y = A4.height - MARGIN
  }
  const ensure = (space: number) => {
    if (y - space < MARGIN) newPage()
  }
  const text = (
    s: string,
    opts: { font?: PDFFont; size?: number; colour?: typeof INK; x?: number } = {},
  ) => {
    const font = opts.font ?? regular
    const size = opts.size ?? 10
    page.drawText(s, { x: opts.x ?? MARGIN, y, size, font, color: opts.colour ?? INK })
  }
  const rule = (p: PDFPage = page) => {
    p.drawLine({
      start: { x: MARGIN, y: y + 4 },
      end: { x: A4.width - MARGIN, y: y + 4 },
      thickness: 0.75,
      color: RULE,
    })
  }

  // Header
  text('Homemade', { font: bold, size: 11, colour: MUTED })
  y -= 26
  text(`${input.craftLabel} plan`, { font: bold, size: 22 })
  y -= 18
  if (input.makerName) {
    text(`Prepared for ${input.makerName}`, { size: 10, colour: MUTED })
    y -= 24
  } else {
    y -= 6
  }

  // Projects in the plan
  ensure(40)
  text('In your plan', { font: bold, size: 13 })
  y -= 8
  rule()
  y -= 18
  if (input.projects.length === 0) {
    text('No projects in your plan yet.', { size: 10, colour: MUTED })
    y -= 16
  }
  for (const project of input.projects) {
    ensure(20)
    const name = project.meta?.name ?? 'Pattern no longer available'
    const status = STATUS_LABEL[project.status] ?? project.status
    text(name, { size: 10.5 })
    text(status, { size: 9, colour: MUTED, x: A4.width - MARGIN - 90 })
    y -= 15
    if (project.meta?.spec) {
      text(project.meta.spec, { size: 8.5, colour: MUTED })
      y -= 14
    }
  }
  y -= 14

  // Materials + shopping list
  ensure(60)
  text('Materials and shopping list', { font: bold, size: 13 })
  y -= 16
  for (const note of input.notes) {
    ensure(16)
    text(note, { size: 9, colour: MUTED })
    y -= 14
  }
  y -= 2

  // Column layout
  const COLS = {
    colour: MARGIN,
    code: MARGIN + 210,
    needed: MARGIN + 300,
    owned: MARGIN + 375,
    buy: MARGIN + 450,
  }
  const headerRow = () => {
    ensure(24)
    text('Colour', { font: bold, size: 9, x: COLS.colour })
    text('Code', { font: bold, size: 9, x: COLS.code })
    text('Need', { font: bold, size: 9, x: COLS.needed })
    text('Have', { font: bold, size: 9, x: COLS.owned })
    text('Buy', { font: bold, size: 9, x: COLS.buy })
    y -= 6
    rule()
    y -= 16
  }
  headerRow()

  for (const row of input.materials) {
    ensure(18)
    // Swatch
    if (row.colourRgb && /^#[0-9a-f]{6}$/i.test(row.colourRgb)) {
      const r = parseInt(row.colourRgb.slice(1, 3), 16) / 255
      const g = parseInt(row.colourRgb.slice(3, 5), 16) / 255
      const b = parseInt(row.colourRgb.slice(5, 7), 16) / 255
      page.drawRectangle({
        x: COLS.colour,
        y: y - 1,
        width: 9,
        height: 9,
        color: rgb(r, g, b),
        borderColor: RULE,
        borderWidth: 0.5,
      })
    }
    text(row.name.slice(0, 30), { size: 9.5, x: COLS.colour + 15 })
    text(`${row.brand ?? ''} ${row.code ?? ''}`.trim(), { size: 9, colour: MUTED, x: COLS.code })
    text(fmt(row.quantityNeeded), { size: 9, x: COLS.needed })
    text(fmt(row.quantityOwned), { size: 9, colour: MUTED, x: COLS.owned })
    text(fmt(row.quantityToBuy), { size: 9, font: bold, x: COLS.buy })
    y -= 16
  }

  // Totals
  ensure(40)
  y -= 4
  rule()
  y -= 18
  text(
    `${input.totals.colours} colours · ${fmt(input.totals.skeinsNeeded)} skeins needed · ` +
      `${fmt(input.totals.skeinsOwned)} in your stash · ${fmt(input.totals.skeinsToBuy)} to buy`,
    { font: bold, size: 10 },
  )
  y -= 24
  text('Generated by homemade.education', { size: 8, colour: MUTED })

  return doc.save()
}

const STATUS_LABEL: Record<string, string> = {
  QUEUED: 'In the queue',
  IN_PROGRESS: 'Stitching now',
  FINISHED: 'Finished',
}
