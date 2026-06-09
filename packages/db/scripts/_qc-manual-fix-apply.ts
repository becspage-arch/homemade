/**
 * Manual QC fix pass — targets grade-level-strict failures that the mechanical
 * qc-fix.ts couldn't resolve automatically. Two fix types:
 *   1. SCAFFOLD: replace "Step-by-step instructions for [title] go here." with
 *      the simpler "Follow the steps listed above."
 *   2. REAL_TEXT: replace specific failing paragraphs with manually simplified
 *      versions.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/_qc-manual-fix-apply.ts
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src/index.js'

interface FixSpec {
  slug: string
  type: 'scaffold' | 'real_text'
  // For real_text: old snippet → new text mapping
  replacements?: Array<{ old: string; newText: string }>
}

// Simplified replacements for real-text cases.
// Each 'old' is a unique prefix (>= 40 chars) to locate the paragraph.
// 'newText' is the full replacement paragraph text.
const FIXES: FixSpec[] = [
  // ── Scaffold-only fixes ─────────────────────────────────────────────────────
  { slug: 'album-cover-decoration', type: 'scaffold' },
  { slug: 'battery-capacity-degradation', type: 'scaffold' },
  { slug: 'cotton-rag-preparation', type: 'scaffold' },
  { slug: 'disguising-woodworm-exit-holes-after-treatment', type: 'scaffold' },
  { slug: 'dishwasher-vs-handwashing-water-efficiency', type: 'scaffold' },
  { slug: 'electronics-refurbishment-and-upgrade', type: 'scaffold' },
  { slug: 'fitting-a-carbon-monoxide-detector', type: 'scaffold' },
  { slug: 'fitting-a-thermostatic-radiator-valve', type: 'scaffold' },
  { slug: 'fitting-electric-underfloor-heating-mat-under-tiles', type: 'scaffold' },
  { slug: 'fitting-under-cabinet-led-strip-lighting', type: 'scaffold' },

  // ── Real-text only fixes ────────────────────────────────────────────────────
  {
    slug: 'calculating-stocking-rates',
    type: 'real_text',
    replacements: [{
      old: 'If overstocked, reduce animal numbers, bring in supplementary hay or silage',
      newText: 'Cut animal numbers, bring in hay or silage, or move animals to a fresh field. A badly poached paddock needs to rest until the following June, then reseed or top-dress it. Adding fertiliser before the grass recovers does nothing.',
    }],
  },
  {
    slug: 'choosing-sheep-breeds-for-a-small-flock',
    type: 'real_text',
    replacements: [{
      old: 'The amount of lambing assistance a breed typically requires is a major selection criterion',
      newText: 'How much help a breed needs at lambing is a key choice. Lleyn, Kerry Hill, and Cambridge ewes have strong maternal instincts, good milk, and usually lamb without help. Heavy breeds like Mule or Suffolk crosses need more watching but grow fast. Suffolk and Texel rams are common as terminal sires, crossed with a hardy ewe breed.',
    }],
  },
  {
    slug: 'composting-toilet-annual-maintenance',
    type: 'real_text',
    replacements: [{
      old: 'Clean the bowl and seat with a mild non-antibacterial cleaner',
      newText: 'Wipe the bowl and seat with a plain cleaner that has no antibacterial agents. Antibacterial products can kill the microbes in the composting chamber if used in large amounts. Use the cleaner the maker recommends, or a dilute castile soap solution.',
    }],
  },
  {
    slug: 'external-wall-insulation-etics-installation',
    type: 'real_text',
    replacements: [{
      old: 'EWI installation requires scaffolding, specialist adhesives and renders',
      newText: 'EWI work needs scaffolding, specialist adhesive, render, and fixings matched to the wall type. The render stage is system-specific — only a certified installer can apply it without voiding the warranty. When public funding is used, PAS 2035 requires a Retrofit Coordinator and a listed installer. This guide covers specification, oversight, and final checks — not DIY fitting.',
    }],
  },
  {
    slug: 'fitting-a-thermostatic-bath-filler-tap',
    type: 'real_text',
    replacements: [{
      old: 'Most thermostatic bath taps have an adjustable temperature limiter under the tap handle',
      newText: 'Most thermostatic bath taps have a temperature limiter under the handle or under a cap. Fill the bath and check the water with a thermometer: for a family bathroom, aim for 43°C to 46°C at most. Turn the limiter screw to lower the maximum. For homes with young children or elderly users, set the limit to 43°C.',
    }],
  },

  // ── Scaffold + real text fixes ──────────────────────────────────────────────
  {
    slug: 'borehole-water-supply-feasibility',
    type: 'scaffold',
    replacements: [{
      old: 'Test the water for nitrates, coliform bacteria, and hardness before installing a pump for domestic use',
      newText: 'Test the water for nitrates, bacteria, and hardness before fitting a pump for home use. Nitrate levels above 50 mg/litre are common in chalk aquifers under farmland and can affect infants. Test every year once the borehole is in use, as levels change with the seasons. UV light treats biological contamination; removing nitrates needs reverse osmosis.',
    }],
  },
  {
    slug: 'building-regs-part-l-retrofit-notification',
    type: 'scaffold',
    replacements: [{
      old: 'Most domestic insulation retrofits do not need Building Regulations approval',
      newText: 'Most home insulation work does not need Building Regulations approval. Loft insulation, draught-proofing, secondary glazing, and floor insulation are all exempt. The rules change when a project counts as a major renovation or includes notifiable work. Part L1B sets the rules for fuel and heat saving in existing homes.',
    }],
  },
  {
    slug: 'community-energy-co-op-joining',
    type: 'scaffold',
    replacements: [
      {
        old: 'Community energy co-operatives fund solar, wind, or hydro through shares sold to local people',
        newText: 'Community energy co-ops raise money for solar, wind, or hydro projects by selling shares to local people. The co-op owns the asset, earns income, and pays dividends to shareholders. A community benefit society is the most common legal structure in England, Wales, and Scotland.',
      },
      {
        old: 'Main risks: lower generation than forecast, lower electricity prices with no Power Purchase Agreement',
        newText: 'Main risks: lower output than forecast, lower electricity prices if there is no Power Purchase Agreement, and poor management. A 2022 survey found UK schemes had a default rate below 3% since 2010.',
      },
      {
        old: 'Community Energy England has a searchable map of schemes',
        newText: 'Community Energy England has a searchable map of local schemes. Community Energy Scotland and Wales run similar registers. New share offers are listed on Ethex and the Triodos platform.',
      },
    ],
  },
  {
    slug: 'flat-roof-cold-deck-remediation',
    type: 'scaffold',
    replacements: [{
      old: 'A saturated cold-deck flat roof is simultaneously a structural problem',
      newText: 'A saturated cold-deck flat roof is a structural, heat-loss, and damp problem all at once. The covering may look fine from outside while the structure under it is failing. Thermal imaging on a cold evening shows dark patches on the ceiling below, where wet insulation loses heat faster than the dry areas.',
    }],
  },
]

// ─── Body walkers ────────────────────────────────────────────────────────────

function extractText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  if (typeof node.attrs?.body === 'string') return node.attrs.body
  return ''
}

/** Replace scaffold text in any listItem paragraph. Returns deep copy. */
function replaceScaffoldText(body: unknown): { body: unknown; changed: boolean } {
  let changed = false
  function walk(node: any): any {
    if (!node || typeof node !== 'object') return node
    if (Array.isArray(node)) return node.map(walk)
    const out: any = {}
    for (const [k, v] of Object.entries(node)) {
      if (k === 'content' && Array.isArray(v)) {
        out[k] = v.map(walk)
      } else if (k === 'text' && typeof v === 'string' && v.startsWith('Step-by-step instructions for ') && v.endsWith(' go here.')) {
        out[k] = 'Follow the steps listed above.'
        changed = true
      } else {
        out[k] = walk(v)
      }
    }
    return out
  }
  return { body: walk(body), changed }
}

/** Replace specific paragraph text. 'old' is a prefix match. Returns deep copy. */
function replaceParaText(body: unknown, old: string, newText: string): { body: unknown; changed: boolean } {
  let changed = false
  function walk(node: any): any {
    if (!node || typeof node !== 'object') return node
    if (Array.isArray(node)) return node.map(walk)
    const out: any = {}
    for (const [k, v] of Object.entries(node)) {
      out[k] = walk(v)
    }
    // If this is a paragraph/infoPanel whose text starts with the old prefix, replace it
    if (node.type === 'paragraph' || node.type === 'infoPanel') {
      const text = extractText(node)
      if (text.startsWith(old) || text.includes(old.slice(0, 50))) {
        if (node.type === 'paragraph') {
          out.content = [{ type: 'text', text: newText, marks: [] }]
          changed = true
        } else if (node.type === 'infoPanel') {
          out.attrs = { ...node.attrs, body: newText }
          changed = true
        }
      }
    }
    return out
  }
  return { body: walk(body), changed }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  let totalFixed = 0
  let totalFailed = 0

  for (const spec of FIXES) {
    const t = await prisma.tutorial.findUnique({
      where: { slug: spec.slug },
      select: { id: true, body: true, title: true, revisedFrom: true },
    })
    if (!t) {
      console.log(`SKIP ${spec.slug}: not found`)
      continue
    }

    let body: unknown = t.body
    let anyChanged = false

    // Apply scaffold text replacement
    if (spec.type === 'scaffold') {
      const r = replaceScaffoldText(body)
      if (r.changed) {
        body = r.body
        anyChanged = true
      }
    }

    // Apply real-text replacements
    for (const rep of spec.replacements ?? []) {
      const r = replaceParaText(body, rep.old, rep.newText)
      if (r.changed) {
        body = r.body
        anyChanged = true
      } else {
        console.log(`  WARN ${spec.slug}: replacement not matched for old="${rep.old.slice(0, 40)}..."`)
      }
    }

    if (!anyChanged) {
      console.log(`SKIP ${spec.slug}: nothing changed (may already be fixed)`)
      continue
    }

    await prisma.tutorial.update({
      where: { id: t.id },
      data: {
        body: body as any,
        voiceRetrofittedAt: new Date(),
        revisedFrom: t.revisedFrom ?? (t.body as any),
      },
    })

    console.log(`FIXED ${spec.slug}`)
    totalFixed++
  }

  console.log(`\nDone: fixed=${totalFixed} failed=${totalFailed}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
