/**
 * Bulk fixes for wood-natural-craft BLOCK tutorials.
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
  ['braided-rush-log-basket',
    'Use dyed rush strips for the sewing element in a contrasting colour to make the stitch pattern a decorative feature of the finished basket.',
    'Use dyed rush strips in a different colour for the sewing; the stitch pattern becomes a design feature of the finished basket.'],

  ['carved-beech-mustard-spoon',
    'Left-handed version: invert the neck angle slightly so the bowl sits naturally in the non-dominant hand for scooping.',
    'Left-handed version: invert the neck angle slightly so the bowl sits naturally for scooping in the left hand.'],

  ['carved-cherry-serving-spoon',
    'Add a kolrosing border line around the bowl rim after carving and before oiling for a decorative finish.',
    'Add a kolrosing line around the bowl rim after carving and before oiling for a traditional finish.'],

  ['carved-hazel-preserve-spoon',
    'Sharpening: strop every fifteen minutes of carving, hone weekly, oilstone monthly.',
    'Keep the edge sharp: strop every 15 minutes of work, hone each week, oilstone each month.'],

  ['carved-oak-mixing-spoon',
    'Sharpening: strop every fifteen minutes of carving, hone weekly, oilstone monthly.',
    'Keep the edge sharp: strop every 15 minutes of work, hone each week, oilstone each month.'],

  ['carved-sycamore-eating-spoon',
    'Add a kolrosing border around the neck taper: fine incised lines rubbed with ground coffee give the neck a decorative ring before the oil coat.',
    'Add a kolrosing border at the neck taper: fine cut lines rubbed with ground coffee give a dark ring before oiling.'],

  ['carved-sycamore-salad-servers',
    'Use beech instead of sycamore: beech is slightly harder and produces a tighter-grained surface that shows the knife finish very clearly.',
    'Use beech instead of sycamore: beech is slightly harder with a tighter grain that shows the knife finish very clearly.'],

  ['green-wood-vs-seasoned-wood',
    'It is noticeably lighter than an equivalent green piece of the same species: a great deal of the original weight was water.',
    'Seasoned wood is much lighter than the same piece in green: most of that weight was water.'],

  ['pyrography-geometric-tile-panel',
    'Hexagonal grid instead of square: mark a hex grid and divide each hexagon into six equilateral triangles. Alternate fill patterns produce a three-dimensional cube illusion.',
    'Hex grid instead of square: mark a hex grid and split each hexagon into six equal triangles. Alternate fill patterns create a 3D cube effect.'],

  ['riven-oak-shingles',
    'Make a decorative edge profile on the butt of each shingle by cutting a simple arc or chamfer with the sloyd knife before installation. A decorative butt edge was common on traditional Scandinavian shingled buildings.',
    'Cut a simple arc or chamfer on the butt of each shingle with the sloyd knife before fitting. A shaped butt edge was common on old Scandinavian shingled buildings.'],

  ['round-willow-basket-small',
    'Add twisted willow handles after the border is complete: twist two rods together and loop them through the top waling band on opposite sides of the basket.',
    'Add twisted willow handles once the border is done: twist two rods and loop each through the top waling band on each side of the basket.'],

  ['rush-mat-oblong',
    'Finish the border: fold the protruding end of each warp strand back over the final weft strand and tuck it under the nearest parallel strand using the bodkin to open the passage. Repeat for each warp strand end, alternating the tuck direction on each one to lock the border firmly.',
    'Finish the border: fold the end of each warp strand back over the final weft strand and tuck it under the nearest parallel strand with the bodkin. Repeat for each warp end, switching tuck direction each time to lock the border.'],

  ['rush-plait-table-runner',
    'Join new stem groups when the working ends become too short to continue: taper the old ends and overlap the new stems by 6 to 8 cm before starting the next plait row.',
    'Join new stems when the working ends get too short: taper the old ends and overlap the new stems by 6 to 8 cm before the next plait row.'],

  ['whittled-ash-butter-knife',
    'If ash is unavailable, sycamore is the easier substitute. Hazel is another option from hedgerow coppice.',
    'If ash is not available, sycamore works well. Hazel from hedgerow coppice is another option.'],

  ['whittled-birch-hair-comb',
    'Chip-carved spine: simple chip-carving patterns on the spine face are consistent with the scale and add decorative detail to a gift piece.',
    'Chip-carved spine: simple chip-carving on the spine face suits the scale and adds a decorative detail to a gift piece.'],

  ['whittled-sycamore-needle-case',
    'Chip-carved ring around the body: a simple V-groove ring at mid-height adds decoration without complicating the fit.',
    'Chip-carved ring around the body: a V-groove ring at mid-height adds a carved detail without affecting the fit.'],

  ['whittled-sycamore-needle-case',
    'Ash instead of sycamore: similar grain, slightly coarser, equally food-safe.',
    'Ash instead of sycamore: similar grain, slightly coarser, and safe for food contact.'],

  ['willow-garden-trug',
    'Make the sides taller for a general-purpose shopping basket; the technique is identical, just more rounds of randing.',
    'Build the sides taller for a shopping basket; the method is the same, just more rounds of randing.'],

  ['wood-spirit-relief-carving',
    'Symmetry pursuit to the detriment of character: wood spirit faces are not anatomically exact. A slight asymmetry in the brow or nose gives the face animation. Pursue evenness of technique, not mathematical symmetry.',
    'Do not chase perfect symmetry at the cost of character: wood spirit faces are not meant to be exact. A slight asymmetry in the brow or nose gives the face life. Aim for even technique, not perfect balance.'],
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
