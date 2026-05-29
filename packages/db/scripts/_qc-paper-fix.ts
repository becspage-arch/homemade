/**
 * Bulk fixes for paper-word BLOCK tutorials.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

const SLUG_FIXES: [string, string, string][] = [
  ['abaca-fibre-sheet-forming',
    'Optional: a small amount of methyl cellulose added to the vat slows drainage slightly and improves formation in very thin sheets.',
    'Optional: a small amount of methyl cellulose in the vat slows drainage and helps sheet formation for very thin pulls.'],

  ['abaca-fibre-sheet-forming',
    'Stir the vat immediately before pulling each sheet; abaca fibres settle faster than cotton linter.',
    'Stir the vat just before each sheet pull; abaca fibres settle faster than cotton linter.'],

  ['batarde-gothic-script',
    'Bâtarde is the immediate ancestor of the printed blackletter types used in the earliest German and Dutch printed books. Studying it alongside ',
    'Bâtarde is the direct ancestor of the blackletter types used in the earliest German and Dutch printed books. Studying it alongside '],

  ['blending-coloured-pulps',
    ' with a visible colour boundary, pull the sheet immediately without stirring.',
    ' with a visible colour boundary, pull the sheet at once without stirring.'],

  ['book-spine-reback',
    'Adhesive: acid-free PVA, medium consistency. A watered-down methylated spirit solution is used to soften old adhesive before removal.',
    'Adhesive: acid-free PVA at medium consistency. Diluted methylated spirit softens old adhesive before removal.'],

  ['carolingian-minuscule-alphabet',
    'Carolingian minuscule was developed in Frankish scriptoria during Charlemagne\'s court reforms in the late eighth and ninth centuries. It replaced the regional scripts of the early medieval period with a single clear letterform. Italian humanists chose Carolingian manuscripts as their model, thinking they were classical Roman scripts. That is why Carolingian looks familiar. It is the direct ancestor of the lowercase letters in every Roman typeface.',
    'Carolingian minuscule came from Charlemagne\'s court reforms in the late 8th and 9th centuries. It replaced the regional scripts of the early medieval period with one clear letterform. Italian humanists later used Carolingian manuscripts as their model, thinking they were Roman scripts. That is why Carolingian looks familiar. It is the direct ancestor of the lowercase letters in every Roman typeface.'],

  ['fraktur-blackletter-alphabet',
    'The letter n illustrates the technique for the full minuscule alphabet.',
    'The letter n shows the method for the full lower-case alphabet.'],

  ['kozo-paper-for-bookbinding',
    'Outside conservation work, kozo tissue is still useful to the craft bookbinder. A strip of 25 gsm kozo applied around the first and last signatures of a text block before sewing acts as a hinge reinforcement that distributes the tension of the sewing thread. A spine lining of 12 gsm kozo applied before the standard mull lining produces a very flexible spine that opens well for heavily used journals.',
    'Outside conservation work, kozo tissue is still useful to the craft bookbinder. A strip of 25 gsm kozo around the first and last signatures before sewing acts as a hinge reinforcement that spreads the tension of the sewing thread. A spine lining of 12 gsm kozo before the standard mull lining gives a very flexible spine that opens well for heavy use.'],

  ['project-planner-journal-spread',
    'Organise the brain dump into three or four phases or categories. Typical project phases: planning, preparation/materials, execution, finishing. Every project has a different shape; the phase labels should reflect the actual work.',
    'Sort the brain dump into three or four phases or groups. Typical phases: planning, preparation/materials, execution, finishing. Every project has its own shape; the phase labels should fit the actual work.'],

  ['scherenschnitte-repeating-border',
    ' border designs work on a single principle: any shape you cut through the folded paper will appear in mirror image when the paper is unfolded. An ',
    ' border designs work on one principle: any shape you cut through the folded paper appears in mirror image when unfolded. An '],

  ['silhouette-portrait-cutting',
    'Transfer the traced outline to the back of the black paper by rubbing the reverse of the tracing with a soft pencil and redrawing over the lines.',
    'Copy the traced outline to the back of the black paper: rub the reverse of the tracing with a soft pencil, then redraw over the lines.'],

  ['spencerian-business-hand',
    'Finish strokes: letters that end with a curved exit shorten the exit to just reach the baseline rather than continuing in a full oval loop.',
    'Finish strokes: letters that end with a curved exit stop just at the baseline rather than going into a full oval loop.'],

  ['torn-paper-collage-background',
    'Once dry, the background surface is ready for stamping, writing, and adhering photographs or embellishments over the top.',
    'Once dry, the surface is ready for stamping, writing, and gluing photographs or other pieces over the top.'],
]

function applyStringReplace(body: unknown, fromText: string, toText: string): { body: unknown; count: number } {
  let count = 0
  function walk(v: unknown): unknown {
    if (typeof v === 'string') {
      if (v.includes(fromText)) { count++; return (v as string).replaceAll(fromText, toText) }
      return v
    }
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) { out[k] = walk(val) }
      return out
    }
    return v
  }
  return { body: walk(body), count }
}

async function main() {
  let totalFixed = 0
  const grouped = new Map<string, [string, string][]>()
  for (const [slug, from, to] of SLUG_FIXES) {
    if (!grouped.has(slug)) grouped.set(slug, [])
    grouped.get(slug)!.push([from, to])
  }

  for (const [slug, pairs] of grouped) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true, revisedFrom: true } })
    if (!t) { console.log('NOT FOUND: ' + slug); continue }

    let body = t.body
    let changed = false
    const applied: string[] = []
    const missed: string[] = []

    for (const [from, to] of pairs) {
      const { body: newBody, count } = applyStringReplace(body, from, to)
      if (count > 0) { body = newBody; changed = true; applied.push(from.slice(0, 35) + '...') }
      else { missed.push(from.slice(0, 50)) }
    }

    if (changed) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: body as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? t.body },
      })
      totalFixed++
      console.log('Fixed: ' + slug + ' (' + applied.length + ' replacements)')
    } else {
      console.log('MISS:  ' + slug)
    }
    if (missed.length) {
      for (const m of missed) console.log('  MISS: ' + m)
    }
  }

  console.log('\nTotal fixed: ' + totalFixed)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
