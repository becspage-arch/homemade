/**
 * Calibration script — wraps the first text node containing
 * a month or month-range pattern in the tomato tutorial body with a
 * `monthToken` mark carrying both hemispheres' values.
 *
 * Phase location_climate_paper_001 — body-prose silent month rewrite.
 *
 * After running, a reader with `User.hemisphere = 'S'` sees the
 * southern-hemisphere months in place of the original. N-hemisphere
 * readers see no change. Confirms the renderer wiring end-to-end.
 *
 * Idempotent: if the chosen text node already carries a monthToken
 * mark we skip it.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/calibrate-month-token-on-tomatoes.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/calibrate-month-token-on-tomatoes.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

const TUTORIAL_SLUG = 'growing-tomatoes-from-seed'
const DRY_RUN = process.argv.includes('--dry-run')

interface TipTapMark { type?: string; attrs?: Record<string, unknown> }
interface TipTapNode {
  type?: string
  text?: string
  marks?: TipTapMark[]
  content?: TipTapNode[]
  attrs?: Record<string, unknown>
}

// Look for an English month-range pattern in any text leaf:
//   "February to March", "Feb to March", "Feb-Mar", "March or April"
// Captures the whole matched span; the script wraps the matched
// substring with a monthToken mark.
const MONTH_RANGE_PATTERN =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)(\s*(?:to|or|-|–|–|—)\s*)(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/

const N_TO_S: Record<string, string> = {
  january: 'July', february: 'August', march: 'September', april: 'October',
  may: 'November', june: 'December', july: 'January', august: 'February',
  september: 'March', october: 'April', november: 'May', december: 'June',
  jan: 'Jul', feb: 'Aug', mar: 'Sep', apr: 'Oct', jun: 'Dec',
  jul: 'Jan', aug: 'Feb', sep: 'Mar', sept: 'Mar', oct: 'Apr', nov: 'May', dec: 'Jun',
}

function flipMonth(m: string): string {
  const k = m.toLowerCase()
  return N_TO_S[k] ?? m
}

function flipRange(m1: string, sep: string, m2: string): { n: string; s: string } {
  const n = `${m1}${sep}${m2}`
  const s = `${flipMonth(m1)}${sep}${flipMonth(m2)}`
  return { n, s }
}

interface WrapResult { found: boolean; alreadyMarked: boolean; nodeText?: string; rangeN?: string; rangeS?: string }

/**
 * Walk the body depth-first; the first text node whose text matches
 * MONTH_RANGE_PATTERN gets its text split into [before, range, after]
 * and inserted alongside the original node, with a monthToken mark on
 * the middle piece. Returns once a single text node has been wrapped.
 */
function wrapFirstMonthRange(body: TipTapNode): WrapResult {
  function walk(parent: TipTapNode | null, node: TipTapNode, indexInParent: number): WrapResult | null {
    if (node.type === 'text' && node.text) {
      const match = MONTH_RANGE_PATTERN.exec(node.text)
      if (match && parent && Array.isArray(parent.content)) {
        const alreadyMarked = (node.marks ?? []).some((m) => m.type === 'monthToken')
        if (alreadyMarked) {
          return { found: true, alreadyMarked: true, nodeText: node.text }
        }
        const before = node.text.slice(0, match.index)
        const middle = match[0]
        const after = node.text.slice(match.index + match[0].length)
        const { n, s } = flipRange(match[1]!, match[2]!, match[3]!)
        const baseMarks = node.marks ?? []
        const newNodes: TipTapNode[] = []
        if (before) newNodes.push({ type: 'text', text: before, marks: baseMarks.length ? [...baseMarks] : undefined })
        newNodes.push({
          type: 'text',
          text: middle,
          marks: [
            ...baseMarks,
            { type: 'monthToken', attrs: { monthsN: n, monthsS: s } },
          ],
        })
        if (after) newNodes.push({ type: 'text', text: after, marks: baseMarks.length ? [...baseMarks] : undefined })
        parent.content.splice(indexInParent, 1, ...newNodes)
        return { found: true, alreadyMarked: false, nodeText: middle, rangeN: n, rangeS: s }
      }
    }
    if (Array.isArray(node.content)) {
      for (let i = 0; i < node.content.length; i++) {
        const r = walk(node, node.content[i]!, i)
        if (r) return r
      }
    }
    return null
  }
  const r = walk(null, body, 0)
  return r ?? { found: false, alreadyMarked: false }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const tutorial = await prisma.tutorial.findUnique({
    where: { slug: TUTORIAL_SLUG },
    select: { id: true, slug: true, body: true },
  })
  if (!tutorial) {
    console.error(`[calibrate-month-token] tutorial '${TUTORIAL_SLUG}' not found`)
    process.exit(1)
  }
  const body = tutorial.body as TipTapNode | null
  if (!body) {
    console.error(`[calibrate-month-token] '${TUTORIAL_SLUG}' has no body`)
    process.exit(1)
  }

  const result = wrapFirstMonthRange(body)
  if (!result.found) {
    console.log('[calibrate-month-token] no month-range pattern found in body — nothing to do')
    await prisma.$disconnect()
    return
  }
  if (result.alreadyMarked) {
    console.log(`[calibrate-month-token] already marked — no change (text='${result.nodeText}')`)
    await prisma.$disconnect()
    return
  }

  console.log(
    `[calibrate-month-token] wrapping '${result.nodeText}' → N='${result.rangeN}' S='${result.rangeS}'${DRY_RUN ? ' (dry-run)' : ''}`,
  )

  if (DRY_RUN) {
    await prisma.$disconnect()
    return
  }

  await prisma.tutorial.update({
    where: { id: tutorial.id },
    data: { body: body as unknown as object },
  })
  console.log('[calibrate-month-token] saved')
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
