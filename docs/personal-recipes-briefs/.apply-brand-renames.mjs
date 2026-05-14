// Apply the brand-rename + personal-name pass on top of the redo briefs.
// One-shot follow-up; can be deleted after the session ships.
//
// Changes:
// 1. Delete jennifer-aniston-salad (brief + extracted .md).
// 2. Rename + adjust three personal-name recipes so they're no longer
//    direct copies of someone else's attributed recipe:
//      - andy-the-gasman-s-stew → smoky-lamb-and-chickpea-stew
//      - carols-soft-and-chewy-chocolate-chippies → soft-chewy-chocolate-chip-cookies
//      - winnie-s-chocolate-chip-cookies → family-chocolate-chip-cookies
// 3. Rename five brand-titled recipes (titles + slugs + body brand mentions):
//      - wagamamas-chicken-katsu-curry → chicken-katsu-curry
//      - nutella-stuffed-cookies → chocolate-hazelnut-stuffed-cookies
//      - oreo-truffles → cookies-and-cream-truffles
//      - biscoff-truffles → caramelised-biscuit-truffles
//      - boozy-bailey-s-cheesecake → boozy-irish-cream-cheesecake

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')
const BRIEFS = __dirname
const EXTRACTED = join(REPO_ROOT, 'docs', 'personal-recipes-extracted')

function loadBrief(slug) {
  const p = join(BRIEFS, `${slug}.json`)
  if (!existsSync(p)) throw new Error(`Brief not found: ${slug}`)
  return JSON.parse(readFileSync(p, 'utf8'))
}

function writeBrief(slug, brief) {
  brief.slug = slug
  writeFileSync(join(BRIEFS, `${slug}.json`), JSON.stringify(brief, null, 2))
}

function deleteIfExists(p) {
  if (existsSync(p)) unlinkSync(p)
}

function deleteBrief(slug) {
  deleteIfExists(join(BRIEFS, `${slug}.json`))
}

function deleteExtracted(slug) {
  deleteIfExists(join(EXTRACTED, `${slug}.md`))
}

// Helper: replace text everywhere in the body
function replaceInBody(body, mapping) {
  function visit(node) {
    if (!node) return
    if (typeof node.text === 'string') {
      for (const [from, to] of mapping) {
        node.text = node.text.replaceAll(from, to)
      }
    }
    if (node.attrs && typeof node.attrs === 'object') {
      for (const k of ['title', 'body', 'intro', 'heading']) {
        if (typeof node.attrs[k] === 'string') {
          for (const [from, to] of mapping) {
            node.attrs[k] = node.attrs[k].replaceAll(from, to)
          }
        }
      }
      if (Array.isArray(node.attrs.items)) {
        for (const it of node.attrs.items) {
          for (const k of ['symptom', 'cause', 'fix', 'prepNote']) {
            if (typeof it?.[k] === 'string') {
              for (const [from, to] of mapping) {
                it[k] = it[k].replaceAll(from, to)
              }
            }
          }
        }
      }
    }
    if (Array.isArray(node.content)) for (const c of node.content) visit(c)
  }
  visit(body)
}

// =============================================================================
// 1. Delete jennifer-aniston-salad
// =============================================================================
deleteBrief('jennifer-aniston-salad')
deleteExtracted('jennifer-aniston-salad')
console.log('Deleted jennifer-aniston-salad (brief + extracted).')

// =============================================================================
// 2a. andy-the-gasman-s-stew → smoky-lamb-and-chickpea-stew
//     Adjustments: lemon zest/juice instead of orange; add red wine; tweak
//     herb mix; drop the "free to go out" line in method; new intro + subtitle.
// =============================================================================
{
  const slug = 'smoky-lamb-and-chickpea-stew'
  const brief = loadBrief('andy-the-gasman-s-stew')
  brief.title = 'Smoky lamb and chickpea stew'
  brief.subtitle = 'A long-braised stew that does most of its work in the oven.'
  brief.excerpt =
    'Smoky lamb and chickpea stew. Lamb shoulder cubed and braised low with chickpeas, smoked paprika, and a finish of fresh herbs.'
  brief.recipe.cuisine = 'mediterranean'
  brief.recipe.cookMinutes = 180

  // New ingredients
  brief.body.content = brief.body.content.map((n) => {
    if (n.type === 'ingredientsList') {
      n.attrs.items = [
        { ingredientSlug: 'lamb-shoulder', amount: 800, unit: 'g', prepNote: 'cubed', isOptional: false, groupLabel: null },
        { ingredientSlug: 'potato', amount: 700, unit: 'g', prepNote: 'cut into 2.5 cm chunks', isOptional: false, groupLabel: null },
        { ingredientSlug: 'red-onion', amount: 2, unit: 'each', prepNote: 'roughly chopped', isOptional: false, groupLabel: null },
        { ingredientSlug: 'carrot', amount: 2, unit: 'each', prepNote: 'roughly chopped', isOptional: false, groupLabel: null },
        { ingredientSlug: 'celery', amount: 2, unit: 'each', prepNote: 'sticks, roughly chopped', isOptional: false, groupLabel: null },
        { ingredientSlug: 'garlic', amount: 4, unit: 'clove', prepNote: 'crushed', isOptional: false, groupLabel: null },
        { ingredientSlug: 'rosemary', amount: 2, unit: 'sprig', prepNote: 'leaves picked, finely chopped', isOptional: false, groupLabel: null },
        { ingredientSlug: 'thyme', amount: 4, unit: 'sprig', prepNote: 'leaves picked', isOptional: false, groupLabel: null },
        { ingredientSlug: 'olive-oil', amount: null, unit: 'ml', prepNote: 'a good glug', isOptional: false, groupLabel: null },
        { ingredientSlug: 'cumin-ground', amount: 1, unit: 'tsp', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'paprika-smoked', amount: 1, unit: 'tbsp', prepNote: 'heaped', isOptional: false, groupLabel: null },
        { ingredientSlug: 'lemon', amount: 1, unit: 'each', prepNote: 'zest and juice', isOptional: false, groupLabel: null },
        { ingredientSlug: 'red-wine', amount: 150, unit: 'ml', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'chickpeas-tinned', amount: 400, unit: 'g', prepNote: 'drained', isOptional: false, groupLabel: null },
        { ingredientSlug: 'tinned-tomatoes', amount: 800, unit: 'g', prepNote: 'plum, broken up with a spoon', isOptional: false, groupLabel: null },
        { ingredientSlug: 'stock-chicken', amount: 250, unit: 'ml', prepNote: 'or vegetable', isOptional: false, groupLabel: null },
        { ingredientSlug: 'parsley-flat', amount: null, unit: 'g', prepNote: 'to finish', isOptional: false, groupLabel: null },
        { ingredientSlug: 'sea-salt-fine', amount: null, unit: 'g', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'black-pepper', amount: null, unit: 'tsp', prepNote: null, isOptional: false, groupLabel: null },
      ]
    }
    if (n.type === 'orderedList') {
      n.content = [
        'Heat the oven to 160°C (140°C fan). Put a large casserole pan over a medium-high heat with a good glug of olive oil.',
        'Pat the lamb dry, season with salt and pepper, and brown in the pan in two batches — five minutes a batch until the outside has colour. Lift out to a plate.',
        'Drop the heat to medium. Add the onions, carrots, celery, and a pinch of salt. Sweat with the lid on for ten minutes, stirring occasionally, until soft and starting to go translucent.',
        'Stir in the garlic, rosemary, thyme, cumin, and smoked paprika. Cook for one minute — the spices should bloom into the oil.',
        'Pour in the red wine and let it bubble down for two minutes, scraping the base of the pan.',
        'Return the lamb. Add the lemon zest and juice, the chickpeas, the tomatoes, and the stock. Bring to a simmer.',
        'Lid on, into the oven for two and a half to three hours. The meat is ready when it pulls apart easily under a fork.',
        'Stir in the potatoes thirty-five minutes before serving so they cook through in the sauce.',
        'Taste and adjust the seasoning. Lift the lid for the last fifteen minutes if you want the sauce a bit thicker.',
        'Scatter with the chopped parsley and serve with bread to mop up the sauce.',
      ].map((text) => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
      }))
    }
    if (n.type === 'paragraph' && n.content?.[0]?.text?.startsWith('Andy The Gasman')) {
      // (defensive — intros shouldn't have the name here, but just in case)
      n.content[0].text = brief.excerpt
    }
    return n
  })

  // Update intro paragraphs (replaces the title-referencing ones)
  const introIdx = brief.body.content.findIndex((n) => n.type === 'paragraph')
  if (introIdx >= 0) {
    brief.body.content[introIdx].content[0].text =
      'Smoky lamb and chickpea stew. A long, low braise in the Mediterranean register — cumin and smoked paprika in the spice corner, lemon at the finish, chickpeas for body. Serves four with bread for the sauce.'
    brief.body.content[introIdx + 1].content[0].text =
      'The work is at the start: a careful brown, a slow sweat of the aromatics, the spices bloomed in the oil. After that the oven does it. Two and a half hours minimum; three hours is better.'
  }
  brief.sourceNotes =
    "From Rebecca's personal cookbook. A long-braised stew in the Mediterranean home-cookery tradition — sits among the lamb-and-chickpea stews of southern Spain and North Africa."
  writeBrief(slug, brief)
  deleteBrief('andy-the-gasman-s-stew')
  console.log('Rebuilt as smoky-lamb-and-chickpea-stew.')
}

// =============================================================================
// 2b. carols-soft-and-chewy-chocolate-chippies → soft-chewy-chocolate-chip-cookies
//     Adjustments: drop the branded instant-pudding-mix shortcut; replace with
//     cornflour (the chewiness trick); convert American cup measures to grams;
//     add chill step; use °C; dark chocolate chunks instead of generic chips.
// =============================================================================
{
  const slug = 'soft-chewy-chocolate-chip-cookies'
  const brief = loadBrief('carols-soft-and-chewy-chocolate-chippies')
  brief.title = 'Soft chewy chocolate chip cookies'
  brief.subtitle = 'The chewy kind — soft middle, crisp edge, dark chocolate chunks.'
  brief.excerpt =
    'Soft chewy chocolate chip cookies. Brown sugar for chew, cornflour for the soft middle, dark chocolate chunks, chilled before baking.'
  brief.recipe.servings = 24
  brief.recipe.prepMinutes = 20
  brief.recipe.cookMinutes = 12
  brief.recipe.chillingMinutes = 30
  brief.recipe.totalMinutes = 62
  brief.recipe.temperatureCelsius = 180
  brief.recipe.temperatureNote = 'fan oven'

  brief.body.content = brief.body.content.map((n) => {
    if (n.type === 'ingredientsList') {
      n.attrs.items = [
        { ingredientSlug: 'unsalted-butter', amount: 225, unit: 'g', prepNote: 'softened', isOptional: false, groupLabel: null },
        { ingredientSlug: 'light-brown-sugar', amount: 200, unit: 'g', prepNote: 'packed', isOptional: false, groupLabel: null },
        { ingredientSlug: 'caster-sugar', amount: 80, unit: 'g', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'eggs', amount: 2, unit: 'each', prepNote: 'large, at room temperature', isOptional: false, groupLabel: null },
        { ingredientSlug: 'vanilla-extract', amount: 1, unit: 'tsp', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'plain-flour', amount: 280, unit: 'g', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'cornflour', amount: 1, unit: 'tbsp', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'bicarbonate-of-soda', amount: 1, unit: 'tsp', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'sea-salt-fine', amount: 0.5, unit: 'tsp', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'dark-chocolate', amount: 300, unit: 'g', prepNote: 'chopped into chunks', isOptional: false, groupLabel: null },
        { ingredientSlug: 'walnuts', amount: 100, unit: 'g', prepNote: 'roughly chopped', isOptional: true, groupLabel: null },
      ]
    }
    if (n.type === 'orderedList') {
      n.content = [
        'Cream the butter, brown sugar, and caster sugar together until pale and fluffy — three or four minutes by stand mixer or vigorous hand whisk.',
        'Beat in the eggs one at a time, then the vanilla. The mixture should look glossy.',
        'In a separate bowl, whisk the flour, cornflour, bicarb, and salt together. Tip into the wet mix and fold until just combined — stop the moment the flour disappears.',
        'Fold in the chocolate chunks (and walnuts if using). The cornflour is doing the work for the chewy texture, so don\'t over-mix.',
        'Cover the bowl and chill in the fridge for at least 30 minutes — overnight if you have the time. Cold dough holds its shape and spreads less.',
        'Heat the oven to 180°C (fan). Line two baking trays with baking paper.',
        'Scoop heaped tablespoons of dough onto the trays, leaving a good four centimetres between each — they spread.',
        'Bake for 11 to 13 minutes. Pull them out when the edges look set but the middles still look slightly underdone — they finish on the hot tray.',
        'Leave to cool on the tray for five minutes before transferring to a wire rack.',
      ].map((text) => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
      }))
    }
    return n
  })

  const introIdx = brief.body.content.findIndex((n) => n.type === 'paragraph')
  if (introIdx >= 0) {
    brief.body.content[introIdx].content[0].text =
      'Soft chewy chocolate chip cookies. Makes around twenty-four. The chew comes from the brown-sugar-heavy ratio and a tablespoon of cornflour folded in with the flour; the soft middle from pulling them out underdone.'
    brief.body.content[introIdx + 1].content[0].text =
      'Cookies reward a chilled dough. Half an hour minimum, overnight better. Cold dough holds its shape and gives a thicker biscuit with a softer middle.'
  }
  brief.sourceNotes =
    "From Rebecca's personal cookbook. A chewy-cookie technique that draws on the standard American chocolate-chip canon — Nestlé Toll House (1930s, Ruth Wakefield) is the reference recipe, adapted for British ingredients and metric weights."
  writeBrief(slug, brief)
  deleteBrief('carols-soft-and-chewy-chocolate-chippies')
  console.log('Rebuilt as soft-chewy-chocolate-chip-cookies.')
}

// =============================================================================
// 2c. winnie-s-chocolate-chip-cookies → family-chocolate-chip-cookies
//     Adjustments: rebalance sugar ratio (more brown than white), add salt
//     (essential, was missing), reduce baking powder, add chill step, °C,
//     specify dark chocolate.
// =============================================================================
{
  const slug = 'family-chocolate-chip-cookies'
  const brief = loadBrief('winnie-s-chocolate-chip-cookies')
  brief.title = 'Family chocolate chip cookies'
  brief.subtitle = 'A simple cookie recipe scaled for a small batch.'
  brief.excerpt =
    'Family chocolate chip cookies. Brown sugar for chew, a pinch of salt to balance, dark chocolate chunks.'
  brief.recipe.servings = 18
  brief.recipe.prepMinutes = 15
  brief.recipe.cookMinutes = 12
  brief.recipe.chillingMinutes = 30
  brief.recipe.totalMinutes = 57
  brief.recipe.temperatureCelsius = 180
  brief.recipe.temperatureNote = 'fan oven'

  brief.body.content = brief.body.content.map((n) => {
    if (n.type === 'ingredientsList') {
      n.attrs.items = [
        { ingredientSlug: 'unsalted-butter', amount: 250, unit: 'g', prepNote: 'softened', isOptional: false, groupLabel: null },
        { ingredientSlug: 'light-brown-sugar', amount: 200, unit: 'g', prepNote: 'packed', isOptional: false, groupLabel: null },
        { ingredientSlug: 'caster-sugar', amount: 100, unit: 'g', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'eggs', amount: 2, unit: 'each', prepNote: 'large', isOptional: false, groupLabel: null },
        { ingredientSlug: 'vanilla-extract', amount: 1, unit: 'tsp', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'plain-flour', amount: 300, unit: 'g', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'baking-powder', amount: 1, unit: 'tsp', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'sea-salt-fine', amount: 0.5, unit: 'tsp', prepNote: null, isOptional: false, groupLabel: null },
        { ingredientSlug: 'dark-chocolate', amount: 200, unit: 'g', prepNote: 'chopped into chunks', isOptional: false, groupLabel: null },
      ]
    }
    if (n.type === 'orderedList') {
      n.content = [
        'Cream the butter and sugars together until pale — three minutes by stand mixer, longer by hand.',
        'Add the eggs one at a time, then the vanilla. The mixture should look glossy and smooth.',
        'Sift in the flour, baking powder, and salt. Fold to combine — stop as soon as the flour disappears.',
        'Fold in the chocolate chunks.',
        'Cover the bowl and chill for at least thirty minutes. Cold dough spreads less and bakes thicker.',
        'Heat the oven to 180°C (fan). Line two baking trays with baking paper.',
        'Drop heaped spoonfuls of dough onto the trays — leave four centimetres between each.',
        'Bake for 10 to 12 minutes until golden at the edges and just-set in the middle.',
        'Cool on the tray for five minutes, then transfer to a wire rack.',
      ].map((text) => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
      }))
    }
    return n
  })

  const introIdx = brief.body.content.findIndex((n) => n.type === 'paragraph')
  if (introIdx >= 0) {
    brief.body.content[introIdx].content[0].text =
      'Family chocolate chip cookies. A short ingredient list and a small batch — eighteen cookies, gone the same afternoon.'
    brief.body.content[introIdx + 1].content[0].text =
      'The brown sugar carries most of the flavour and the chew. A pinch of salt holds the sweetness together. Chill the dough before baking and the cookies hold their shape rather than spreading flat.'
  }
  brief.sourceNotes =
    "From Rebecca's personal cookbook. A simple chocolate-chip biscuit; recipes of this shape sit in the family-rotation register in most British kitchens."
  writeBrief(slug, brief)
  deleteBrief('winnie-s-chocolate-chip-cookies')
  console.log('Rebuilt as family-chocolate-chip-cookies.')
}

// =============================================================================
// 3a. wagamamas-chicken-katsu-curry → chicken-katsu-curry
// =============================================================================
{
  const oldSlug = 'wagamamas-chicken-katsu-curry'
  const slug = 'chicken-katsu-curry'
  const brief = loadBrief(oldSlug)
  brief.title = 'Chicken katsu curry'
  replaceInBody(brief.body, [
    ['Wagamamas Chicken Katsu Curry', 'Chicken katsu curry'],
    ['Wagamamas chicken katsu curry', 'Chicken katsu curry'],
    ['Wagamamas', 'Japanese-style'],
    ['Wagamama', 'Japanese-style'],
  ])
  brief.excerpt = brief.excerpt
    .replaceAll('Wagamamas Chicken Katsu Curry', 'Chicken katsu curry')
    .replaceAll('Wagamamas', 'Japanese-style')
  brief.sourceNotes =
    "From Rebecca's personal cookbook. A Japanese-style mild curry — same shape as the British high-street version: panko-crumbed chicken on rice, a thick mild curry sauce, a side of salad."
  writeBrief(slug, brief)
  deleteBrief(oldSlug)
  console.log('Renamed wagamamas-chicken-katsu-curry → chicken-katsu-curry.')
}

// =============================================================================
// 3b. nutella-stuffed-cookies → chocolate-hazelnut-stuffed-cookies
// =============================================================================
{
  const oldSlug = 'nutella-stuffed-cookies'
  const slug = 'chocolate-hazelnut-stuffed-cookies'
  const brief = loadBrief(oldSlug)
  brief.title = 'Chocolate hazelnut stuffed cookies'
  brief.subtitle = 'A spoon of chocolate hazelnut spread frozen into the centre of each cookie.'
  brief.excerpt = brief.excerpt
    .replaceAll('Nutella Stuffed Cookies', 'Chocolate hazelnut stuffed cookies')
    .replaceAll('Nutella', 'chocolate hazelnut spread')
  replaceInBody(brief.body, [
    ['Nutella Stuffed Cookies', 'Chocolate hazelnut stuffed cookies'],
    ['Nutella', 'chocolate hazelnut spread'],
  ])
  writeBrief(slug, brief)
  deleteBrief(oldSlug)
  console.log('Renamed nutella-stuffed-cookies → chocolate-hazelnut-stuffed-cookies.')
}

// =============================================================================
// 3c. oreo-truffles → cookies-and-cream-truffles
// =============================================================================
{
  const oldSlug = 'oreo-truffles'
  const slug = 'cookies-and-cream-truffles'
  const brief = loadBrief(oldSlug)
  brief.title = 'Cookies and cream truffles'
  brief.subtitle = 'Chocolate sandwich biscuits blitzed with cream cheese, rolled, dipped in white chocolate.'
  brief.excerpt = brief.excerpt
    .replaceAll('Oreo Truffles', 'Cookies and cream truffles')
    .replaceAll('Oreos', 'chocolate sandwich biscuits')
    .replaceAll('Oreo', 'chocolate sandwich biscuit')
  replaceInBody(brief.body, [
    ['Oreo Truffles', 'Cookies and cream truffles'],
    ['Oreos', 'chocolate sandwich biscuits'],
    ['Oreo', 'chocolate sandwich biscuit'],
  ])
  writeBrief(slug, brief)
  deleteBrief(oldSlug)
  console.log('Renamed oreo-truffles → cookies-and-cream-truffles.')
}

// =============================================================================
// 3d. biscoff-truffles → caramelised-biscuit-truffles
// =============================================================================
{
  const oldSlug = 'biscoff-truffles'
  const slug = 'caramelised-biscuit-truffles'
  const brief = loadBrief(oldSlug)
  brief.title = 'Caramelised biscuit truffles'
  brief.subtitle = 'Caramelised biscuits blitzed with cream cheese, rolled, dipped in white chocolate.'
  brief.excerpt = brief.excerpt
    .replaceAll('Biscoff Truffles', 'Caramelised biscuit truffles')
    .replaceAll('Biscoff biscuits', 'caramelised biscuits')
    .replaceAll('Biscoff biscuit', 'caramelised biscuit')
    .replaceAll('Biscoff spread', 'caramelised biscuit spread')
    .replaceAll('Biscoff', 'caramelised biscuit')
  replaceInBody(brief.body, [
    ['Biscoff Truffles', 'Caramelised biscuit truffles'],
    ['Biscoff biscuits', 'caramelised biscuits'],
    ['Biscoff biscuit', 'caramelised biscuit'],
    ['Biscoff spread', 'caramelised biscuit spread'],
    ['Biscoff', 'caramelised biscuit'],
  ])
  writeBrief(slug, brief)
  deleteBrief(oldSlug)
  console.log('Renamed biscoff-truffles → caramelised-biscuit-truffles.')
}

// =============================================================================
// 3e. boozy-bailey-s-cheesecake → boozy-irish-cream-cheesecake
// =============================================================================
{
  const oldSlug = 'boozy-bailey-s-cheesecake'
  const slug = 'boozy-irish-cream-cheesecake'
  const brief = loadBrief(oldSlug)
  brief.title = "Boozy Irish cream cheesecake"
  brief.subtitle = 'No-bake cheesecake on a chocolate biscuit base, spiked with Irish cream liqueur.'
  brief.excerpt = brief.excerpt
    .replaceAll("Boozy Bailey's Cheesecake", 'Boozy Irish cream cheesecake')
    .replaceAll('Baileys Irish Cream', 'Irish cream liqueur')
    .replaceAll("Bailey's", 'Irish cream liqueur')
    .replaceAll('Baileys', 'Irish cream liqueur')
    .replaceAll('Oreos', 'chocolate sandwich biscuits')
    .replaceAll('Oreo', 'chocolate sandwich biscuit')
  replaceInBody(brief.body, [
    ["Boozy Bailey's Cheesecake", 'Boozy Irish cream cheesecake'],
    ['Baileys Irish Cream', 'Irish cream liqueur'],
    ["Bailey's", 'Irish cream liqueur'],
    ['Baileys', 'Irish cream liqueur'],
    ['Oreos', 'chocolate sandwich biscuits'],
    ['Oreo', 'chocolate sandwich biscuit'],
  ])
  writeBrief(slug, brief)
  deleteBrief(oldSlug)
  console.log('Renamed boozy-bailey-s-cheesecake → boozy-irish-cream-cheesecake.')
}

console.log('\nAll brand + personal-name renames applied.')
