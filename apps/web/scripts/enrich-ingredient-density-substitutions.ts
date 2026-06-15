/**
 * One-shot ingredient enrichment: density (g/ml) and substitutions.
 *
 * The recipe render layer bridges grams to cups using `Ingredient.densityGPerMl`
 * and offers swaps from `IngredientSubstitution`. Both were sparse (101 of 1048
 * ingredients had a density at authoring). This pass, authored by a Claude Code
 * worker session (the AI is the moderation, no API spend), fills the common
 * cooking + baking ingredients with well-established values and adds a curated
 * substitution graph.
 *
 * High-confidence only: every value below is a settled kitchen reference, so
 * it auto-applies. Idempotent: only fills a null density, only creates a
 * substitution row that does not already exist.
 *
 * Run: pnpm --filter web exec tsx scripts/enrich-ingredient-density-substitutions.ts
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let envDir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(envDir, '.env.credentials')
  if (existsSync(candidate)) {
    for (const raw of readFileSync(candidate, 'utf8').split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
      if (!(key in process.env)) process.env[key] = val
    }
    break
  }
  const parent = dirname(envDir)
  if (parent === envDir) break
  envDir = parent
}

// Ordered most-specific first: the first rule whose any match substring appears
// in the ingredient name wins. g/ml.
const DENSITY_RULES: Array<{ match: string[]; density: number }> = [
  { match: ['icing sugar', 'powdered sugar', 'confectioner'], density: 0.56 },
  { match: ['brown sugar', 'muscovado', 'demerara'], density: 0.9 },
  { match: ['caster sugar', 'granulated sugar', 'white sugar'], density: 0.85 },
  { match: ['cornflour', 'cornstarch', 'corn starch'], density: 0.54 },
  { match: ['ground almond', 'almond flour'], density: 0.48 },
  { match: ['wholemeal flour', 'wholewheat flour', 'whole wheat flour', 'wholemeal'], density: 0.55 },
  { match: ['bread flour', 'strong white flour', 'strong flour'], density: 0.55 },
  { match: ['self-raising flour', 'self raising flour'], density: 0.53 },
  { match: ['plain flour', 'all-purpose flour', 'all purpose flour', 'rye flour'], density: 0.53 },
  { match: ['cocoa powder', 'cacao powder'], density: 0.52 },
  { match: ['rolled oat', 'porridge oat'], density: 0.41 },
  { match: ['desiccated coconut', 'shredded coconut'], density: 0.35 },
  { match: ['breadcrumb'], density: 0.45 },
  { match: ['baking powder'], density: 0.9 },
  { match: ['bicarbonate of soda', 'baking soda'], density: 0.95 },
  { match: ['table salt', 'fine salt', 'sea salt', 'salt'], density: 1.2 },
  { match: ['caster', 'granulated'], density: 0.85 },
  // Liquids and pastes
  { match: ['golden syrup'], density: 1.43 },
  { match: ['honey'], density: 1.42 },
  { match: ['treacle', 'molasses'], density: 1.4 },
  { match: ['maple syrup'], density: 1.33 },
  { match: ['jam', 'marmalade', 'conserve'], density: 1.33 },
  { match: ['ketchup', 'tomato sauce'], density: 1.14 },
  { match: ['soy sauce', 'tamari'], density: 1.15 },
  { match: ['peanut butter', 'nut butter', 'tahini'], density: 1.1 },
  { match: ['mustard'], density: 1.05 },
  { match: ['passata'], density: 1.05 },
  { match: ['yog'], density: 1.03 },
  { match: ['lemon juice', 'lime juice'], density: 1.03 },
  { match: ['whole milk', 'semi-skimmed milk', 'skimmed milk', 'milk'], density: 1.03 },
  { match: ['vinegar'], density: 1.01 },
  { match: ['single cream', 'soured cream', 'sour cream'], density: 1.01 },
  { match: ['coconut milk', 'coconut cream'], density: 0.99 },
  { match: ['wine'], density: 0.99 },
  { match: ['stock', 'broth'], density: 1.0 },
  { match: ['water'], density: 1.0 },
  { match: ['double cream', 'heavy cream', 'whipping cream', 'creme fraiche', 'crème fraîche'], density: 1.0 },
  { match: ['mayonnaise', 'mayo'], density: 0.91 },
  { match: ['vanilla extract', 'almond extract'], density: 0.88 },
  { match: ['olive oil'], density: 0.91 },
  { match: ['butter'], density: 0.911 },
  { match: ['oil'], density: 0.92 },
  // Dry / granular
  { match: ['basmati rice', 'long grain rice', 'white rice', 'rice'], density: 0.85 },
  { match: ['caster', 'sugar'], density: 0.85 },
  { match: ['raisin', 'sultana', 'currant'], density: 0.8 },
  { match: ['chopped nut', 'flaked almond', 'walnut', 'pecan'], density: 0.5 },
]

interface SubGroup {
  main: string
  alts: Array<{ alt: string; ratio: number | null; appropriateFor: string; flavourDelta: string }>
}

const SUBSTITUTIONS: SubGroup[] = [
  { main: 'butter', alts: [
    { alt: 'olive oil', ratio: 0.75, appropriateFor: 'frying', flavourDelta: 'savoury note, softer crumb in bakes' },
    { alt: 'coconut oil', ratio: 1, appropriateFor: 'baking', flavourDelta: 'faint coconut, firm when cool' },
  ] },
  { main: 'self-raising flour', alts: [
    { alt: 'plain flour', ratio: 1, appropriateFor: 'baking', flavourDelta: 'add 2 tsp baking powder per 150 g' },
  ] },
  { main: 'caster sugar', alts: [
    { alt: 'granulated sugar', ratio: 1, appropriateFor: 'baking', flavourDelta: 'coarser, blitz fine for sponges' },
    { alt: 'honey', ratio: 0.8, appropriateFor: 'any', flavourDelta: 'adds moisture, reduce other liquid' },
  ] },
  { main: 'double cream', alts: [
    { alt: 'creme fraiche', ratio: 1, appropriateFor: 'any', flavourDelta: 'slight tang, do not boil hard' },
    { alt: 'coconut cream', ratio: 1, appropriateFor: 'any', flavourDelta: 'faint coconut, dairy-free' },
  ] },
  { main: 'whole milk', alts: [
    { alt: 'oat milk', ratio: 1, appropriateFor: 'any', flavourDelta: 'a touch sweeter, dairy-free' },
    { alt: 'almond milk', ratio: 1, appropriateFor: 'any', flavourDelta: 'nutty, thinner, dairy-free' },
  ] },
  { main: 'soured cream', alts: [
    { alt: 'natural yogurt', ratio: 1, appropriateFor: 'any', flavourDelta: 'lighter, similar tang' },
  ] },
  { main: 'lemon juice', alts: [
    { alt: 'lime juice', ratio: 1, appropriateFor: 'any', flavourDelta: 'sharper, more floral' },
    { alt: 'white wine vinegar', ratio: 0.5, appropriateFor: 'cooking', flavourDelta: 'sharper, less citrus' },
  ] },
  { main: 'honey', alts: [
    { alt: 'maple syrup', ratio: 1, appropriateFor: 'any', flavourDelta: 'caramel note, vegan' },
    { alt: 'golden syrup', ratio: 1, appropriateFor: 'baking', flavourDelta: 'milder, no floral note' },
  ] },
  { main: 'creme fraiche', alts: [
    { alt: 'natural yogurt', ratio: 1, appropriateFor: 'any', flavourDelta: 'lighter, more tang' },
  ] },
  { main: 'plain flour', alts: [
    { alt: 'wholemeal flour', ratio: 1, appropriateFor: 'baking', flavourDelta: 'nuttier, denser, more water needed' },
  ] },
]

function norm(s: string): string {
  return s.toLowerCase().trim()
}

async function main(): Promise<void> {
  const { prisma } = await import('@homemade/db')

  const all = await prisma.ingredient.findMany({
    select: { id: true, name: true, densityGPerMl: true },
  })
  const byName = new Map<string, string>() // lower name -> id
  for (const ing of all) byName.set(norm(ing.name), ing.id)

  // ── Density ────────────────────────────────────────────────────────────
  let densityApplied = 0
  for (const ing of all) {
    if (ing.densityGPerMl != null) continue
    const name = norm(ing.name)
    const rule = DENSITY_RULES.find((r) => r.match.some((m) => name.includes(m)))
    if (!rule) continue
    await prisma.ingredient.update({
      where: { id: ing.id },
      data: { densityGPerMl: rule.density },
    })
    densityApplied += 1
  }

  // ── Substitutions ───────────────────────────────────────────────────────
  function resolve(nameFragment: string): string | null {
    const frag = norm(nameFragment)
    if (byName.has(frag)) return byName.get(frag)!
    for (const ing of all) {
      if (norm(ing.name).includes(frag)) return ing.id
    }
    return null
  }

  let subsCreated = 0
  let subsSkippedMissing = 0
  for (const group of SUBSTITUTIONS) {
    const mainId = resolve(group.main)
    if (!mainId) {
      subsSkippedMissing += 1
      continue
    }
    for (const alt of group.alts) {
      const altId = resolve(alt.alt)
      if (!altId || altId === mainId) {
        subsSkippedMissing += 1
        continue
      }
      const existing = await prisma.ingredientSubstitution.findUnique({
        where: { mainIngredientId_altIngredientId: { mainIngredientId: mainId, altIngredientId: altId } },
      })
      if (existing) continue
      await prisma.ingredientSubstitution.create({
        data: {
          mainIngredientId: mainId,
          altIngredientId: altId,
          ratio: alt.ratio,
          appropriateFor: alt.appropriateFor,
          flavourDelta: alt.flavourDelta,
        },
      })
      subsCreated += 1
    }
  }

  const withDensity = await prisma.ingredient.count({ where: { densityGPerMl: { not: null } } })
  const subRows = await prisma.ingredientSubstitution.count()
  console.log(
    `Density: applied ${densityApplied} (now ${withDensity} of ${all.length} have a density).`,
  )
  console.log(
    `Substitutions: created ${subsCreated} new rows (now ${subRows} total). ${subsSkippedMissing} pairs skipped (ingredient not in table).`,
  )

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
