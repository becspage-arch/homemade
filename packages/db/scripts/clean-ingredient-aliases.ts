/**
 * Alias hygiene: remove misplaced aliases — strings that are really a DIFFERENT
 * row's identity — from the non-owner row, so each name resolves deterministically
 * to the right ingredient. No rows are merged or deleted (only alias arrays edited).
 * The #2 judgment-call pairs (almond flour/ground almonds, rolled/porridge oats,
 * dried/fast-action yeast, black pepper/ground black pepper, coriander, rum) are
 * deliberately left untouched.
 *
 * Dry-run by default; pass --apply to write.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let d = __dirname; for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p } }
import { prisma } from '../src'
import { norm } from '../src/recipe-consistency.js'

const APPLY = process.argv.includes('--apply')

// slug → aliases to remove (matched case-insensitively). Each removed alias is
// the identity of a different, more-canonical row.
const REMOVE: Record<string, string[]> = {
  'miso-paste': ['white miso', 'red miso'],            // specific White/Red miso rows own these
  fusilli: ['trofie'],                                 // Trofie is its own row now
  'full-fat-yoghurt': ['natural yoghurt'],             // → Plain yoghurt
  parsley: ['flat-leaf parsley', 'italian parsley'],   // → Flat-leaf parsley
  nutmeg: ['ground nutmeg', 'whole nutmeg'],           // → Ground/Whole nutmeg rows
  'mace-ground': ['mace'],                             // → Mace row
  'mustard-powder': ['english mustard powder'],        // → English mustard powder row
  'olives-kalamata': ['black olives'],                 // → Black olives row
  'rolled-fondant': ['fondant icing'],                 // → Fondant icing row
  'japanese-short-grain-rice': ['short-grain rice'],   // → generic Short-grain rice
  'beef-dripping': ['tallow'],                         // → Beef tallow row
  stout: ['guinness'],                                 // Guinness is its own row
  guinness: ['stout'],                                 // generic Stout is its own row
  'tea-black': ['tea bags'],                           // → Tea bag row
  sausagemeat: ['pork mince'],                         // sausagemeat is NOT mince → Pork mince row
  'vodka-unflavoured': ['plain vodka'],                // → Vodka (40% ABV)
  apple: ['eating apple', 'dessert apple'],            // → Eating apple row
  'breadcrumbs-coarse': ['fresh breadcrumbs'],         // → Fresh breadcrumbs row
  fettuccine: ['tagliatelle'],                         // → Tagliatelle row
  'pecorino-romano': ['pecorino'],                     // → generic Pecorino
  'apple-bramley': ['cooking apples'],                 // → Cooking apple (generic)
  'cooking-apple': ['bramley apple'],                  // → Bramley apple (specific)
  'suet-shredded': ['vegetable suet'],                 // → Vegetable suet row
  suet: ['vegetable suet', 'shredded suet'],           // → Vegetable / Shredded suet rows
  'vegetable-suet': ['suet'],                          // → generic Suet
  crisps: ['chips'],                                   // UK: "chips" → Oven chips
  'emulsifying-wax-nf': ['emulsifying wax', 'e-wax'],  // → Emulsifying wax row
  'orange-zest-dried': ['dried orange peel', 'dehydrated orange peel'], // → Dried orange peel
  'louisiana-hot-sauce': ['hot sauce'],                // → generic Hot sauce
  'black-truffle': ['fresh black truffle'],            // → Fresh black truffle row
  'smoked-pork-sausage': ['frankfurter'],              // → Frankfurter row
  'noodles-ramen': ['chinese wheat noodles'],          // → Chinese wheat noodles row
  'palm-sugar': ['jaggery'],                           // → Jaggery row
  'glass-noodles': ['dangmyeon'],                      // → Sweet potato glass noodles row
}

async function main() {
  let edited = 0, removedTotal = 0
  for (const [slug, drop] of Object.entries(REMOVE)) {
    const ing = await prisma.ingredient.findUnique({ where: { slug }, select: { id: true, name: true, aliases: true } })
    if (!ing) { console.log(`! ${slug} not found`); continue }
    const dropNorm = new Set(drop.map(norm))
    const kept = ing.aliases.filter((a) => !dropNorm.has(norm(a)))
    const removed = ing.aliases.filter((a) => dropNorm.has(norm(a)))
    if (removed.length === 0) { console.log(`= ${slug}: nothing to remove (${JSON.stringify(ing.aliases)})`); continue }
    console.log(`• ${ing.name} [${slug}]: remove ${JSON.stringify(removed)} → keep ${JSON.stringify(kept)}`)
    removedTotal += removed.length; edited++
    if (APPLY) await prisma.ingredient.update({ where: { id: ing.id }, data: { aliases: kept } })
  }
  console.log(`\n${APPLY ? 'APPLIED' : 'DRY-RUN'}: ${removedTotal} aliases removed from ${edited} rows`)
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
