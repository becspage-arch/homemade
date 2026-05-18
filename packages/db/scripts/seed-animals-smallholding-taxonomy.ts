/**
 * One-off seed for the Animals & smallholding taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category    animals-smallholding   (already in seed-categories.ts)
 *   SubCat      bees                   "Bees"
 *   SubCat      poultry                "Poultry"
 *   SubCat      sheep-and-goats        "Sheep & goats"
 *   SubCat      rabbits                "Rabbits"
 *   SubCat      pigs                   "Pigs"
 *   SubCat      smallholding-skills    "Smallholding skills"
 *
 *   GlossaryTerm rows scoped to the animals-smallholding Category for
 *   ~55 domain terms — brood / comb / fleece / kid / doe / kit /
 *   broody / varroa / supersedure / bumble / pasture / scratch /
 *   grit / colostrum / dam / sire / weaning / shearing / dust-bath /
 *   etc. The author prompt requires every term registered on a
 *   tutorial to appear inline at least once wrapped in a
 *   glossaryTooltip mark.
 *
 * Six sub-categories per the locked pipeline-setup brief
 * (bees / poultry / sheep-and-goats / rabbits / pigs / smallholding-
 * skills). Sub-category descriptions are factual list-only per
 * feedback_category_description_voice — no identity / provenance /
 * disclaimer copy.
 *
 * Category itself is seeded earlier by `seed-categories.ts`. This
 * script only owns the sub-category list + the domain glossary; it
 * never re-creates the Category row and never touches
 * `pipelineStatus`. The READY flip lives in
 * `flip-animals-smallholding-ready.ts` and is run as a separate
 * auditable step after Rebecca has reviewed the test DRAFT tutorials.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-animals-smallholding-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-animals-smallholding-taxonomy.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  {
    slug: 'bees',
    name: 'Bees',
    description:
      'Hive inspections, swarm management, honey harvesting, varroa monitoring, queen rearing, winter prep, hive types (National, WBC, Langstroth, top-bar).',
    order: 10,
  },
  {
    slug: 'poultry',
    name: 'Poultry',
    description:
      'Chickens, ducks, geese, quail, turkeys. Coop setup, daily care, broody management, hatching, raising chicks to point of lay, parasite treatment, predator-proofing.',
    order: 20,
  },
  {
    slug: 'sheep-and-goats',
    name: 'Sheep & goats',
    description:
      'Hair sheep, wool sheep, dairy goats, fibre goats. Lambing, kidding, hoof trimming, shearing, drenching, weaning, fleece skirting, fence training.',
    order: 30,
  },
  {
    slug: 'rabbits',
    name: 'Rabbits',
    description:
      'Meat breeds, fibre breeds (Angora), pet stock. Housing, feed, breeding, kindling, weaning, fibre harvest, basic health checks.',
    order: 40,
  },
  {
    slug: 'pigs',
    name: 'Pigs',
    description:
      'Smallholder pig breeds, weaner-to-bacon arc, housing, fencing, feed, mucking out, wallowing, castration timing, abattoir prep.',
    order: 50,
  },
  {
    slug: 'smallholding-skills',
    name: 'Smallholding skills',
    description:
      'Water systems for stock, fencing (electric, post-and-rail, stock wire), field shelters, pasture rotation, hay and straw, manure handling, CPH and DEFRA paperwork.',
    order: 60,
  },
]

interface GlossarySpec {
  slug: string
  term: string
  definition: string
}

const GLOSSARY_TERMS: GlossarySpec[] = [
  // Bees
  { slug: 'brood', term: 'Brood', definition: 'The developing bees in a hive — eggs, larvae, and capped pupae together. Sealed brood is capped wax; open brood is uncapped larvae.' },
  { slug: 'comb', term: 'Comb', definition: 'The sheet of hexagonal wax cells bees build to store honey, pollen, and brood. Drawn comb has been built out; foundation is the wax starter sheet authors give the colony.' },
  { slug: 'frame', term: 'Frame', definition: 'A rectangular wooden hanger inside a hive that holds one sheet of comb. A National brood frame measures roughly 35 × 21 cm and a colony works through 10–11 of them.' },
  { slug: 'super', term: 'Super', definition: 'The shallower box stacked above the brood chamber where bees store surplus honey for harvest. A queen excluder usually sits between brood and super.' },
  { slug: 'queen-excluder', term: 'Queen excluder', definition: 'A perforated metal or plastic grid between brood box and super, sized to let workers through but not the larger queen. Stops the queen laying in the honey super.' },
  { slug: 'supersedure', term: 'Supersedure', definition: 'Bees raising a new queen to replace a failing one without swarming. Identified by one or two queen cells along the face of a comb (not the bottom edge).' },
  { slug: 'swarm-cell', term: 'Swarm cell', definition: 'A queen cell built along the bottom edge of a comb — the signal a colony is preparing to swarm. Distinct from a supersedure cell on the face.' },
  { slug: 'varroa', term: 'Varroa', definition: 'Varroa destructor, a parasitic mite of honey bees. The single most-watched pest in UK beekeeping. Monitored by mite-board count or alcohol wash.' },
  { slug: 'bumble', term: 'Bumble', definition: 'A bumblebee (Bombus). Not a honeybee — different colony size, different lifecycle, doesn’t produce harvestable honey.' },
  { slug: 'hive-tool', term: 'Hive tool', definition: 'A flat steel pry-bar used to separate boxes and lift frames sealed with propolis. The single most-used piece of beekeeping kit.' },
  { slug: 'smoker', term: 'Smoker', definition: 'A canister with a bellows that burns smouldering fuel (hessian, wood chips, pine needles) to calm bees during an inspection.' },
  { slug: 'propolis', term: 'Propolis', definition: 'The sticky brown resin bees collect from tree buds and use to seal hive joints. Strong-smelling, antimicrobial; the reason a hive tool is needed.' },
  { slug: 'royal-jelly', term: 'Royal jelly', definition: 'The protein-rich secretion worker bees feed to queen larvae throughout development and to worker larvae for their first three days.' },
  { slug: 'queen-cell', term: 'Queen cell', definition: 'An elongated, peanut-shaped wax cell hanging vertically off the comb. Indicates the colony is raising a new queen — for swarming, supersedure, or emergency.' },
  { slug: 'nuc', term: 'Nuc', definition: 'A nucleus colony — typically 4–6 frames of bees, brood, food, and a laying queen. The standard unit for starting or splitting a hive.' },

  // Poultry
  { slug: 'pullet', term: 'Pullet', definition: 'A female chicken before her first laying year. Typically point-of-lay (POL) at 18–22 weeks for a hybrid layer; 24–28 weeks for a heritage breed.' },
  { slug: 'point-of-lay', term: 'Point of lay', definition: 'The stage at which a pullet is about to begin laying — combs reddened, pelvic bones widening, squatting behaviour. Usually 18–22 weeks for hybrids.' },
  { slug: 'broody', term: 'Broody', definition: 'A hen in the hormonal state that drives her to sit on eggs continuously and refuse to leave the nest. Some breeds (Silkie, Buff Orpington) go broody readily; hybrid layers rarely do.' },
  { slug: 'scratch', term: 'Scratch', definition: 'Mixed whole grains (often wheat, maize, oats) thrown on the ground for chickens to forage. A scratch ration is treat-level, not a replacement for layer feed.' },
  { slug: 'grit', term: 'Grit', definition: 'Hard insoluble particles (flint or granite) chickens swallow to grind food in the gizzard. Separate from soluble oyster-shell grit, which supplies calcium for shell formation.' },
  { slug: 'layer-pellets', term: 'Layer pellets', definition: 'A 16–17% protein compounded ration formulated for laying hens, calcium-fortified. The standard daily feed for chickens in lay.' },
  { slug: 'dust-bath', term: 'Dust bath', definition: 'A shallow scrape of dry earth, sand, or wood ash that chickens roll in to smother parasites and condition feathers. A coop without one is incomplete.' },
  { slug: 'nesting-box', term: 'Nesting box', definition: 'An enclosed, darkened cubicle inside the coop where hens lay eggs. One box per 3–4 hens; lined with clean straw or wood shavings.' },
  { slug: 'perch', term: 'Perch', definition: 'A horizontal bar inside the coop where chickens roost overnight. Chickens prefer to sleep above the floor; a perch keeps them off droppings.' },
  { slug: 'pop-hole', term: 'Pop-hole', definition: 'The small opening, usually 30 × 30 cm, between the coop and the run that birds use to come and go. Closed at dusk against foxes.' },
  { slug: 'crop', term: 'Crop', definition: 'The expandable pouch at the base of a chicken’s neck where freshly-eaten food is stored before passing into the gizzard. An impacted crop is a common health issue.' },
  { slug: 'vent', term: 'Vent', definition: 'The single external opening through which a chicken passes eggs and droppings. A clean, pale-pink vent is a quick health check.' },
  { slug: 'wattles', term: 'Wattles', definition: 'The two fleshy lobes hanging below a chicken’s beak. Bright red in a healthy hen in lay; pale and shrunken in a moulting or unwell bird.' },
  { slug: 'moult', term: 'Moult', definition: 'The annual feather replacement, usually in autumn. Egg production typically pauses for 4–8 weeks while feathers regrow.' },
  { slug: 'bumblefoot', term: 'Bumblefoot', definition: 'A staphylococcal infection of the chicken footpad, usually entering through a small wound. Presents as a black scab over a swollen pad.' },

  // Sheep & goats
  { slug: 'ewe', term: 'Ewe', definition: 'A female sheep, usually one that has lambed or is at breeding age.' },
  { slug: 'ram', term: 'Ram', definition: 'An entire (uncastrated) male sheep used for breeding.' },
  { slug: 'lamb', term: 'Lamb', definition: 'A sheep under one year old. Spring lambs are born February–April for a UK April–May grass flush.' },
  { slug: 'tup', term: 'Tup', definition: 'A breeding ram (UK term, used as both noun and verb — "to tup" is to mate).' },
  { slug: 'fleece', term: 'Fleece', definition: 'The wool coat of a sheep, removed in one piece at shearing. Skirting separates the cleaner body wool from belly, britch, and stained edges.' },
  { slug: 'shearing', term: 'Shearing', definition: 'The annual removal of a sheep’s fleece, usually in May–July when the rise (new growth) lifts the old fleece clear of the skin.' },
  { slug: 'doe', term: 'Doe', definition: 'A female goat (or rabbit). A doe in milk is a milking goat; a doe in kid is a pregnant goat.' },
  { slug: 'buck', term: 'Buck', definition: 'An entire male goat (or rabbit) used for breeding. Bucks of dairy breeds carry a strong musky scent in rut.' },
  { slug: 'kid', term: 'Kid', definition: 'A goat under a year old, or the act of giving birth — "to kid" is for a doe to deliver.' },
  { slug: 'wether', term: 'Wether', definition: 'A castrated male sheep or goat. Wethers grow well for meat without the behaviour of an entire male.' },
  { slug: 'colostrum', term: 'Colostrum', definition: 'The first milk a ewe, doe, or sow produces after birth — rich in antibodies and essential within the first 6 hours of life.' },
  { slug: 'drenching', term: 'Drenching', definition: 'Administering an oral liquid wormer or supplement, usually with a dosing gun over the back of the tongue.' },
  { slug: 'hoof-trim', term: 'Hoof trim', definition: 'Paring the overgrown wall and sole of a sheep or goat hoof back to level. Done every 6–10 weeks in goats; less often in hill sheep.' },
  { slug: 'foot-rot', term: 'Foot rot', definition: 'A bacterial infection of the hoof in sheep and goats, presenting as lameness and a strong rotten smell when the hoof is lifted.' },
  { slug: 'crook', term: 'Crook', definition: 'A long staff with a curved head used to catch a sheep by the neck or hind leg. The shepherd’s tool, still in working use.' },

  // Rabbits
  { slug: 'kit', term: 'Kit', definition: 'A baby rabbit. Born blind and furless; eyes open at around 10 days.' },
  { slug: 'kindle', term: 'Kindle', definition: 'For a doe rabbit to give birth. Gestation is 28–31 days; the doe pulls fur from her dewlap to line the nest in the last 24 hours.' },
  { slug: 'dewlap', term: 'Dewlap', definition: 'The fold of skin under the chin of a mature doe rabbit, used as a source of fur for nest-lining before kindling.' },

  // Pigs
  { slug: 'weaner', term: 'Weaner', definition: 'A young pig recently separated from its mother, typically 6–8 weeks old and 15–20 kg. The standard buying age for a smallholding fattening pair.' },
  { slug: 'porker', term: 'Porker', definition: 'A pig grown to around 60–75 kg liveweight, slaughtered for fresh pork rather than bacon.' },
  { slug: 'baconer', term: 'Baconer', definition: 'A pig grown to around 90–100 kg liveweight over a longer arc, with a deeper back fat layer suitable for curing as bacon.' },
  { slug: 'wallow', term: 'Wallow', definition: 'A patch of churned wet mud pigs roll in to cool themselves and coat against sunburn — they don’t sweat. Essential in summer.' },

  // Pasture / smallholding skills
  { slug: 'pasture', term: 'Pasture', definition: 'Land covered in grass and other forage plants, managed for grazing. Smallholders rotate pasture to break parasite cycles and let swards recover.' },
  { slug: 'mob-grazing', term: 'Mob grazing', definition: 'Moving stock as a tight group through small paddocks on short intervals, letting each area rest for 30–60 days. Builds sward density and soil organic matter.' },
  { slug: 'standstill', term: 'Standstill', definition: 'The 6-day movement restriction on cattle, sheep, goats, and pigs after new stock arrives on a holding (20 days for pigs). Disease-control rule enforced by DEFRA.' },
  { slug: 'cph-number', term: 'CPH number', definition: 'County Parish Holding number — the unique identifier the Rural Payments Agency issues for any land where livestock are kept. Required before stock can be moved on or off.' },
  { slug: 'rotational-grazing', term: 'Rotational grazing', definition: 'Splitting pasture into paddocks and moving stock between them on a planned cycle. Breaks parasite cycles, lets grass recover, raises stocking rate.' },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const category = await prisma.category.findUnique({
    where: { slug: 'animals-smallholding' },
  })
  if (!category) {
    console.error(
      '[seed] animals-smallholding category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] animals-smallholding → ${category.id}`)

  // ── Sub-categories ────────────────────────────────────────────────────────
  let subCreated = 0
  let subUnchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] animals-smallholding/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: category.id,
          },
        })
        console.log(`[seed] animals-smallholding/${spec.slug} → ${sub.id}`)
      }
      subCreated += 1
      continue
    }

    subUnchanged += 1
  }

  // ── Glossary terms ────────────────────────────────────────────────────────
  let glossCreated = 0
  let glossUnchanged = 0

  for (const spec of GLOSSARY_TERMS) {
    const existing = await prisma.glossaryTerm.findUnique({
      where: { slug: spec.slug },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create glossary] ${spec.slug}`)
      } else {
        const g = await prisma.glossaryTerm.create({
          data: {
            slug: spec.slug,
            term: spec.term,
            definition: spec.definition,
            categoryId: category.id,
          },
        })
        console.log(`[seed] glossary/${spec.slug} → ${g.id}`)
      }
      glossCreated += 1
      continue
    }

    glossUnchanged += 1
  }

  console.log(
    `\n[seed] animals-smallholding-taxonomy: ` +
      `sub-cats created=${subCreated} unchanged=${subUnchanged} total=${SUB_CATEGORIES.length}; ` +
      `glossary created=${glossCreated} unchanged=${glossUnchanged} total=${GLOSSARY_TERMS.length}` +
      `${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
