/**
 * Bulk fixes for natural-home and herbal-medicine BLOCK tutorials.
 * Targets: clinical-vocab voice-violations + grade-level-strict sentences.
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

// [slug, fromText, toText]
const SLUG_FIXES: [string, string, string][] = [
  // ── anhydrous → water-free (natural-home) ───────────────────────────────
  ['dry-oil-body-serum', 'This blend is anhydrous and requires no preservative.', 'This blend is water-free and needs no preservative.'],
  ['lavender-beeswax-balm', 'The balm is anhydrous, no water phase, no preservative needed.', 'The balm has no water and needs no preservative.'],
  ['rose-body-butter', 'This recipe is anhydrous and needs no preservative.', 'This recipe is water-free and needs no preservative.'],
  ['rose-geranium-face-balm', 'A face balm in the anhydrous tradition.', 'A face balm with no water in the base.'],
  ['whipped-cocoa-body-butter', 'The anhydrous base means no preservative is needed;', 'The water-free base means no preservative is needed;'],

  // ── arnica-balm grade 12.9 ───────────────────────────────────────────────
  ['arnica-balm',
    'Place the beeswax pellets and the arnica-infused olive oil in a heatproof bowl over a saucepan of barely simmering water.',
    'Put the beeswax pellets and infused oil in a heatproof bowl over a pan of simmering water.'],

  // ── lavender-reed-diffuser grade 11.7 ───────────────────────────────────
  ['lavender-reed-diffuser',
    'Lavender essential oil at 20% gives a clear, sustained scent without being overpowering. Weaker blends produce an underwhelming result; stronger blends accelerate evaporation and shorten the active life. Position the diffuser away from direct sunlight and away from air vents, which accelerate evaporation. DPG is rated non-irritant to skin; avoid direct eye contact when handling the liquid.',
    'Lavender oil at 20% gives a clear, lasting scent. Weaker blends feel thin; stronger blends fade faster and cost more. Keep the diffuser away from sunlight and air vents, both of which speed evaporation. DPG is non-irritant to skin. Avoid eye contact when handling the liquid.'],

  // ── soy-wax-jar-candle-citrus-spice grade 11.5 ──────────────────────────
  ['soy-wax-jar-candle-citrus-spice',
    'A soy wax container candle with a two-part scent: sweet orange essential oil for the bright top note and a spiced-fruit fragrance oil for the warm base. Together they give the kind of scent profile associated with autumn and winter kitchens, without being obviously festive. Blending an essential oil with a fragrance oil is a practical way to keep the top note fresh while extending the staying power of the overall fragrance.',
    'A soy wax candle with two scents: sweet orange oil for the fresh top note and spiced-fruit fragrance oil for the warm base. Together they give an autumn-kitchen scent without being obviously festive. Mixing an essential oil with a fragrance oil keeps the top note bright while the base holds the scent longer.'],

  // ── calendula vulnerary → wound-healing ─────────────────────────────────
  ['calendula-compress-for-minor-wounds',
    'Calendula is the herbal tradition\'s foremost vulnerary herb.',
    'Calendula is the herbal tradition\'s foremost wound-healing herb.'],

  // ── chamomile-profile grade 11.9 ─────────────────────────────────────────
  ['chamomile-profile',
    ', taken in the evening to ease a wound-up day. The constituent apigenin is the one most often associated with this action in the modern open-access literature. Phrasing matters here: chamomile is not a sleeping pill and the publication does not present it as one.',
    ', taken in the evening to calm a wound-up day. The compound apigenin is linked to this action in recent research. Chamomile is not a sleeping pill and is not presented as one here.'],

  // ── elderberry-profile grade 11.1 ────────────────────────────────────────
  ['elderberry-profile',
    'The principal constituents of the ripe berry are the anthocyanins, the deep-purple pigments. Flavonoids follow. Then small amounts of phenolic acids, and Vitamin C. Modern open-access research most often links the immune-shifting action to the anthocyanins. Major herbal-medicine reviews cite this constituent set as the basis for the syrup\'s traditional use.',
    'The key compounds in ripe elderberry are anthocyanins: the dark pigments. Then flavonoids, some plant acids, and vitamin C. Research links the immune action mainly to the anthocyanins. Herbal reviews cite these as the basis for the syrup\'s long use.'],

  // ── fennel antispasmodic → cramp-easing ──────────────────────────────────
  ['fennel-infusion-for-menstrual-cramps',
    'The same antispasmodic action that fennel has on the gut also works on the womb muscle.',
    'Fennel eases muscle spasms in the gut and also in the womb muscle.'],

  // ── peppermint paediatric grade 11.0 ─────────────────────────────────────
  ['peppermint-tea-for-indigestion',
    'Paediatric use is not adult-divided-by-half. Consult a herbalist who specialises in children\'s herbal medicine. Or a paediatric doctor, before using peppermint preparations in children under twelve. For school-aged children at half-strength, one cup after a meal is the traditional limit.',
    'Children\'s doses are not simply half the adult amount. Consult a herbalist or doctor who works with children before giving peppermint to anyone under twelve. For school-aged children: half-strength, one cup after a meal at most.'],

  // ── off-grid-water-treatment-basics grade 14.1 ───────────────────────────
  ['off-grid-water-treatment-basics',
    'Ceramic filtration: ceramic filters remove bacteria and protozoa by size exclusion. No electricity required; suitable for lower-flow applications. Does not remove viruses.',
    'Ceramic filters block bacteria and protozoa by pore size. No power needed. Best for lower-flow use. Viruses pass through.'],
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

    for (const [from, to] of pairs) {
      const { body: newBody, count } = applyStringReplace(body, from, to)
      if (count > 0) { body = newBody; changed = true; applied.push(from.slice(0, 40) + '...') }
      else { console.log('  MISS [' + slug + ']: ' + from.slice(0, 60)) }
    }

    if (changed) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: body as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? t.body },
      })
      totalFixed++
      console.log('Fixed: ' + slug + ' (' + applied.length + ' replacements)')
    }
  }

  console.log('\nTotal fixed: ' + totalFixed)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
