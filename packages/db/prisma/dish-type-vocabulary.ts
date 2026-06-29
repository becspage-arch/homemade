/**
 * Canonical DISH-TYPE vocabulary for the food categories (phase_dish_type_001).
 *
 * The single controlled source of truth for WHAT A RECIPE IS — pasta, curry,
 * cake, cookie — for cooking and baking. This is the food-category sibling of
 * `item-type-vocabulary.ts` (which does the same job for craft patterns:
 * cardigan, blanket, doily). It drives the SubCategory "home shelves" a
 * recipe browses under, the SAME way item types drive a craft's home shelves.
 *
 * Why a SubCategory home shelf rather than a tag axis (same reasoning as item
 * type): a dish type is a STRUCTURAL home — exactly one per recipe, surfaced as
 * a SubCategory and already ridden on every search doc as `subCategorySlug`
 * (a cross-craft facet). Recipes still appear in MANY cross-cutting collections
 * (comfort food, quick weeknight, one-pot...) and one world-cuisine shelf, but
 * those reuse the EXISTING `Tutorial.mood[]` and `Tutorial.cuisine` fields —
 * we do not invent a parallel taxonomy. So one recipe = one dish-type shelf +
 * 0..n mood collections + one cuisine + the cross-craft collection tags.
 *
 *   spaghetti bolognese → shelf `pasta` · moods [comfort-food, family, weeknight]
 *                         · cuisine `italian` · familiarCanon = true
 *
 * NOTHING outside this file mints a dish type. Adding one is a deliberate,
 * deduped edit here + a re-seed of that food category's shelves. Same rule as
 * collection-vocabulary.ts and item-type-vocabulary.ts.
 *
 * `description` is the PUBLIC, voice-clean shelf intro (a plain list of what's
 * inside — see feedback_category_description_voice). `guidance` is the INTERNAL
 * rule the classifier follows so the same dish always lands on the same shelf.
 */

/** Which food category a dish type belongs to. */
export type DishCategory = 'cooking' | 'baking'

/** Display grouping — drives the group headers a category page can render. */
export type DishTypeGroup =
  // cooking
  | 'mains'
  | 'lighter'
  | 'breakfast'
  | 'sweet'
  | 'basics'
  // baking (single group — baking already ships flat, populated shelves)
  | 'bakes'

export interface DishType {
  category: DishCategory
  group: DishTypeGroup
  /** globally unique within its category; kebab-case; the SubCategory slug. */
  slug: string
  /** display label — reads as a shelf/facet ("Pasta", "Cakes"). */
  name: string
  /** classifier synonyms + dish keywords that map to this shelf. */
  aliases?: string[]
  /** public shelf intro: a plain list of what's inside, voice-clean. */
  description: string
  /** internal rule: how the classifier decides this is the dish type. */
  guidance: string
  order: number
}

/** Group display metadata — header + order a category page groups under. */
export const DISH_TYPE_GROUPS: Record<
  DishTypeGroup,
  { name: string; category: DishCategory; order: number }
> = {
  // cooking
  mains: { name: 'Mains & dinners', category: 'cooking', order: 10 },
  lighter: { name: 'Lighter dishes & sides', category: 'cooking', order: 20 },
  breakfast: { name: 'Breakfast & brunch', category: 'cooking', order: 30 },
  sweet: { name: 'Puddings & desserts', category: 'cooking', order: 35 },
  basics: { name: 'Sauces & basics', category: 'cooking', order: 40 },
  // baking
  bakes: { name: 'Bakes', category: 'baking', order: 10 },
}

// ── COOKING ───────────────────────────────────────────────────────────────────
const COOKING: DishType[] = [
  // Mains & dinners
  { category: 'cooking', group: 'mains', slug: 'pasta', name: 'Pasta', order: 10,
    aliases: ['spaghetti', 'bolognese', 'lasagne', 'lasagna', 'macaroni', 'mac and cheese', 'mac & cheese', 'carbonara', 'ravioli', 'gnocchi', 'penne', 'tagliatelle', 'noodles pasta', 'cannelloni', 'risotto'],
    description: 'Pasta dishes: spaghetti, lasagne, macaroni cheese, carbonara, baked pasta and more.',
    guidance: 'The dish is built on pasta (or gnocchi/risotto as a close cousin). Spaghetti bolognese, lasagne, mac & cheese, carbonara all live here.' },
  { category: 'cooking', group: 'mains', slug: 'curries', name: 'Curries', order: 20,
    aliases: ['curry', 'tikka masala', 'korma', 'madras', 'rogan josh', 'dhal', 'dal', 'balti', 'bhuna', 'jalfrezi', 'biryani', 'thai curry', 'massaman'],
    description: 'Curries from around the world: tikka masala, korma, Thai curries, dhal and more.',
    guidance: 'A spiced, sauce-based curry of any tradition (Indian, Thai, Caribbean, etc.). Biryani sits here too.' },
  { category: 'cooking', group: 'mains', slug: 'stir-fries', name: 'Stir-fries & noodles', order: 30,
    aliases: ['stir fry', 'stir-fry', 'noodle', 'chow mein', 'pad thai', 'lo mein', 'ramen', 'udon', 'fried rice', 'wok'],
    description: 'Fast wok cooking: stir-fries, noodle bowls, fried rice and quick pan dishes.',
    guidance: 'Wok / quick-fry dishes and Asian noodle bowls. Fried rice and pad thai live here, not under rice or pasta.' },
  { category: 'cooking', group: 'mains', slug: 'roasts', name: 'Roasts & Sunday lunch', order: 40,
    aliases: ['roast', 'sunday roast', 'sunday lunch', 'roast chicken', 'roast beef', 'roast dinner', 'gravy dinner'],
    description: 'Roast dinners and the Sunday table: roast meats, all the trimmings, gravy.',
    guidance: 'A roasted joint or bird as the centrepiece, or a full roast dinner. Roast chicken, roast beef, Sunday lunch.' },
  { category: 'cooking', group: 'mains', slug: 'pies-bakes', name: 'Savoury pies & bakes', order: 50,
    aliases: ['pie', 'cottage pie', 'shepherds pie', "shepherd's pie", 'fish pie', 'casserole bake', 'gratin', 'bake', 'pasty', 'quiche', 'toad in the hole', 'lasagne bake'],
    description: 'Savoury pies and oven bakes: cottage pie, shepherd’s pie, fish pie, gratins and pasties.',
    guidance: 'Oven-baked savoury dishes with a topping or crust: cottage/shepherd’s/fish pie, gratins, quiche, pasties, toad in the hole.' },
  { category: 'cooking', group: 'mains', slug: 'stews-casseroles', name: 'Stews & casseroles', order: 60,
    aliases: ['stew', 'casserole', 'hotpot', 'hot pot', 'chilli', 'chili', 'goulash', 'tagine', 'braise', 'ragu', 'cassoulet', 'pot roast'],
    description: 'Slow, hearty one-pot stews and casseroles: chilli, hotpot, tagine, braises.',
    guidance: 'Slow-cooked, liquid-based main in a pot: stew, casserole, chilli, hotpot, tagine, braise. Soups go to Soups.' },
  { category: 'cooking', group: 'mains', slug: 'grills-bbq', name: 'Grills & BBQ', order: 70,
    aliases: ['bbq', 'barbecue', 'grill', 'grilled', 'kebab', 'skewer', 'burger grill', 'steak', 'griddle'],
    description: 'Grilled and barbecued food: steaks, kebabs, skewers and smoky favourites.',
    guidance: 'Cooked over/under direct heat: BBQ, grill, griddle, skewers, kebabs, grilled steaks.' },
  { category: 'cooking', group: 'mains', slug: 'fish-seafood', name: 'Fish & seafood', order: 80,
    aliases: ['fish', 'seafood', 'salmon', 'prawn', 'shrimp', 'cod', 'haddock', 'fish and chips', 'fishcake', 'mussels', 'tuna'],
    description: 'Fish and seafood mains: salmon, white fish, prawns, fishcakes, fish and chips.',
    guidance: 'A fish or seafood dish as the main, when it is not better placed (a fish curry is Curries, a fish pie is Savoury pies).' },
  { category: 'cooking', group: 'mains', slug: 'rice-grains', name: 'Rice & grain dishes', order: 90,
    aliases: ['rice', 'risotto', 'pilaf', 'paella', 'jambalaya', 'grain bowl', 'couscous', 'quinoa', 'bulgur'],
    description: 'Dishes built on rice and grains: paella, pilaf, grain bowls and more.',
    guidance: 'Rice or grain is the body of the dish (paella, pilaf, grain bowls). Fried rice goes to Stir-fries; risotto may sit here or Pasta.' },
  { category: 'cooking', group: 'mains', slug: 'everyday-dinners', name: 'Everyday dinners', order: 100,
    aliases: ['dinner', 'meatloaf', 'bangers and mash', 'sausage and mash', 'meatballs', 'schnitzel', 'fajitas', 'tacos', 'enchiladas', 'traybake dinner'],
    description: 'Everyday meat-and-veg dinners and family plates that don’t fit a single dish shape.',
    guidance: 'Catch-all for a savoury main course that isn’t clearly one of the other shelves: bangers and mash, meatballs, tacos, fajitas, meatloaf.' },
  // Lighter dishes & sides
  { category: 'cooking', group: 'lighter', slug: 'soups', name: 'Soups', order: 110,
    aliases: ['soup', 'broth', 'chowder', 'bisque', 'minestrone', 'ramen soup'],
    description: 'Soups of every kind: smooth, chunky, brothy, creamy.',
    guidance: 'A soup served in a bowl as a starter or light meal. Hearty stews go to Stews & casseroles.' },
  { category: 'cooking', group: 'lighter', slug: 'salads', name: 'Salads', order: 120,
    aliases: ['salad', 'slaw', 'coleslaw', 'grain salad', 'caesar', 'nicoise'],
    description: 'Salads from light sides to full meals: leafy, grain, pasta and bean salads.',
    guidance: 'A salad as the dish, whether a side or a main. Dressings alone go to Sauces, dips & dressings.' },
  { category: 'cooking', group: 'lighter', slug: 'sandwiches-burgers', name: 'Sandwiches & burgers', order: 130,
    aliases: ['sandwich', 'burger', 'wrap', 'toastie', 'panini', 'sub', 'bagel', 'roll filling', 'hot dog'],
    description: 'Things between bread: sandwiches, burgers, wraps and toasties.',
    guidance: 'A handheld bread-based dish: sandwich, burger, wrap, toastie, hot dog.' },
  { category: 'cooking', group: 'lighter', slug: 'sides-veg', name: 'Sides & vegetables', order: 140,
    aliases: ['side', 'side dish', 'vegetables', 'veg', 'roast potatoes', 'mash', 'greens', 'cauliflower cheese'],
    description: 'Side dishes and vegetables: potatoes, greens, roasted veg and sharing sides.',
    guidance: 'A side dish or vegetable preparation that accompanies a main: roast potatoes, mash, dressed greens, cauliflower cheese.' },
  { category: 'cooking', group: 'lighter', slug: 'snacks-dips', name: 'Snacks & dips', order: 150,
    aliases: ['snack', 'dip', 'nibbles', 'hummus', 'guacamole', 'nachos', 'party food', 'canape'],
    description: 'Snacks, dips and nibbles for sharing and grazing.',
    guidance: 'Small bites, dips and grazing food: hummus, guacamole, nachos, party nibbles.' },
  // Breakfast & brunch
  { category: 'cooking', group: 'breakfast', slug: 'breakfast-brunch', name: 'Breakfast & brunch', order: 160,
    aliases: ['breakfast', 'brunch', 'eggs', 'omelette', 'shakshuka', 'porridge', 'granola', 'fry up', 'hash'],
    description: 'Breakfast and brunch: eggs, fry-ups, shakshuka, porridge and morning plates.',
    guidance: 'A savoury breakfast or brunch dish. Pancakes and sweet bakes belong to baking.' },
  // Puddings & desserts (sweet dishes authored under cooking rather than baking)
  { category: 'cooking', group: 'sweet', slug: 'puddings-desserts', name: 'Puddings & desserts', order: 165,
    aliases: ['pudding', 'dessert', 'cheesecake', 'sponge', 'drizzle', 'trifle', 'mousse', 'custard', 'panna cotta', 'ice cream', 'sorbet', 'crumble', 'meringue', 'pavlova', 'tiramisu', 'brownie', 'fudge', 'compote sweet', 'sundae'],
    description: 'Sweet things made on the stove or set in the fridge: puddings, mousses, ice creams, crumbles and more.',
    guidance: 'A dessert or sweet course cooked under cooking (not an oven bake — those live in baking). Mousse, ice cream, panna cotta, trifle, crumble, custard.' },
  // Sauces & basics
  { category: 'cooking', group: 'basics', slug: 'sauces', name: 'Sauces, dips & dressings', order: 170,
    aliases: ['sauce', 'dressing', 'gravy', 'marinade', 'pesto', 'salsa', 'condiment', 'stock'],
    description: 'Sauces, dressings, gravies and marinades to build other dishes on.',
    guidance: 'A standalone sauce, dressing, gravy, marinade or stock. (Existing shelf — keep its slug.)' },
  { category: 'cooking', group: 'basics', slug: 'preserves', name: 'Preserves & pickles', order: 180,
    aliases: ['jam', 'marmalade', 'chutney', 'pickle', 'preserve', 'compote', 'ferment', 'curd'],
    description: 'Preserves and pickles: jams, marmalades, chutneys, pickles and ferments.',
    guidance: 'A preserved larder item: jam, marmalade, chutney, pickle, curd, ferment. (Existing shelf — keep its slug.)' },
]

// ── BAKING ────────────────────────────────────────────────────────────────────
// Baking ALREADY ships eight populated SubCategory shelves (every published
// bake is on one — 0 unshelved). We adopt those slugs verbatim rather than
// churn 1,100 classified rows. This block documents them as the controlled
// vocab + carries the classifier aliases + the public/internal copy. Aliases
// only refine where a bake is ambiguous; existing subCategoryId stays put.
const BAKING: DishType[] = [
  { category: 'baking', group: 'bakes', slug: 'cakes', name: 'Cakes', order: 10,
    aliases: ['cake', 'sponge', 'victoria sponge', 'loaf cake', 'pound cake', 'bundt', 'carrot cake', 'lemon drizzle', 'cupcake', 'muffin', 'fairy cake', 'birthday cake', 'celebration cake', 'gateau', 'swiss roll', 'brownie', 'blondie', 'traybake', 'flapjack'],
    description: 'Cakes of every kind: sponges, loaf cakes, cupcakes, celebration cakes, brownies and traybakes.',
    guidance: 'Any cake-family bake: sponges, loaf and drizzle cakes, cupcakes/muffins, celebration and layer cakes, brownies, blondies, traybakes and flapjacks.' },
  { category: 'baking', group: 'bakes', slug: 'biscuits', name: 'Biscuits', order: 20,
    aliases: ['biscuit', 'cookie', 'shortbread', 'gingerbread biscuit', 'macaron', 'biscotti', 'wafer'],
    description: 'Biscuits and cookies: chewy, crisp, shortbread, gingerbread and more.',
    guidance: 'Individual biscuits or cookies. (Existing shelf "biscuits" — keep its slug.)' },
  { category: 'baking', group: 'bakes', slug: 'bread', name: 'Bread', order: 30,
    aliases: ['bread', 'loaf', 'sourdough', 'soda bread', 'focaccia', 'baguette', 'ciabatta', 'flatbread', 'naan', 'roll', 'bagel', 'bun', 'cinnamon roll', 'hot cross bun', 'brioche', 'pretzel'],
    description: 'Bread and dough: sourdough, soda bread, flatbreads, rolls and enriched sweet buns.',
    guidance: 'Bread loaves, flatbreads, rolls and enriched/sweet yeast dough (cinnamon rolls, hot cross buns, brioche). (Existing shelf "bread".)' },
  { category: 'baking', group: 'bakes', slug: 'pastries', name: 'Pastries', order: 40,
    aliases: ['pastry', 'puff pastry', 'shortcrust', 'choux', 'eclair', 'profiterole', 'palmier', 'turnover', 'danish', 'croissant', 'doughnut', 'donut', 'churro'],
    description: 'Pastry bakes: croissants, danishes, choux, eclairs, turnovers and doughnuts.',
    guidance: 'A bake whose star is the pastry: croissants, danishes, choux, eclairs, palmiers, turnovers, doughnuts. (Existing shelf "pastries".)' },
  { category: 'baking', group: 'bakes', slug: 'pies', name: 'Pies & tarts', order: 50,
    aliases: ['pie', 'tart', 'tarte', 'galette', 'fruit pie', 'apple pie', 'bakewell', 'treacle tart', 'pecan pie', 'quiche', 'cheesecake'],
    description: 'Sweet pies and tarts: fruit pies, bakewell, treacle tart, cheesecakes and more.',
    guidance: 'A sweet pie or tart with a pastry base; baked cheesecakes sit here too. (Existing shelf "pies".)' },
  { category: 'baking', group: 'bakes', slug: 'scones', name: 'Scones', order: 60,
    aliases: ['scone', 'biscuit american', 'rock cake', 'pancake', 'waffle', 'crumpet', 'drop scone'],
    description: 'Scones and quick griddle bakes for the tea table.',
    guidance: 'British scones (and American biscuits), rock cakes, and quick griddle bakes like pancakes and crumpets. (Existing shelf "scones".)' },
  { category: 'baking', group: 'bakes', slug: 'sweets-confectionery', name: 'Sweets & confectionery', order: 70,
    aliases: ['sweets', 'confectionery', 'fudge', 'truffle', 'fridge cake', 'caramel', 'toffee', 'marshmallow', 'no-bake', 'no bake', 'meringue'],
    description: 'Sweets and confectionery: fudge, truffles, fridge cakes, caramels and no-bake treats.',
    guidance: 'Confectionery and no-oven sweet treats: fudge, truffles, fridge cake, caramels, meringues. (Existing shelf "sweets-confectionery".)' },
  { category: 'baking', group: 'bakes', slug: 'cake-decorating', name: 'Cake decorating', order: 80,
    aliases: ['icing', 'frosting', 'fondant', 'buttercream', 'piping', 'decoration', 'sugarcraft'],
    description: 'Cake decorating: icings, fillings, fondant work and finishing techniques.',
    guidance: 'Decorating and finishing skills (icing, fondant, piping) rather than a bake itself. (Existing shelf "cake-decorating".)' },
]

export const DISH_TYPE_VOCABULARY: DishType[] = [...COOKING, ...BAKING]

/** Dish types for one food category, sorted by group then order. */
export function dishTypesForCategory(category: DishCategory): DishType[] {
  return DISH_TYPE_VOCABULARY.filter((d) => d.category === category).sort(
    (a, b) =>
      DISH_TYPE_GROUPS[a.group].order - DISH_TYPE_GROUPS[b.group].order ||
      a.order - b.order,
  )
}

/** Resolve a free-text slug or alias (any case) to a canonical dish-type slug. */
export function resolveDishTypeSlug(
  category: DishCategory,
  input: string,
): string | null {
  const norm = input.trim().toLowerCase()
  for (const d of DISH_TYPE_VOCABULARY) {
    if (d.category !== category) continue
    if (d.slug === norm) return d.slug
    if (d.name.toLowerCase() === norm) return d.slug
    if ((d.aliases ?? []).some((a) => a.toLowerCase() === norm)) return d.slug
  }
  return null
}

// ── CROSS-CUTTING COLLECTIONS (reuse Tutorial.mood[]) ─────────────────────────
// These are NOT shelves (a recipe has many). They map 1:1 onto canonical
// `Tutorial.mood[]` values. The classifier sets these in addition to the one
// dish-type shelf. New mood values are minted here and nowhere else.
export interface DishCollection {
  /** the canonical Tutorial.mood[] value. */
  mood: string
  /** display label for a collection rail / chip. */
  name: string
  /** applies to which food categories. */
  categories: DishCategory[]
  description: string
  guidance: string
  order: number
}

export const DISH_COLLECTIONS: DishCollection[] = [
  { mood: 'comfortFood', name: 'Comfort food', categories: ['cooking', 'baking'], order: 10,
    description: 'Warm, hearty, familiar food for a cosy night in.',
    guidance: 'Rich, soothing, nostalgic dishes: pies, stews, mac & cheese, crumble, anything you reach for when you want comfort.' },
  { mood: 'weeknight', name: 'Quick weeknight', categories: ['cooking', 'baking'], order: 20,
    description: 'Fast dishes for a busy evening, on the table without fuss.',
    guidance: 'Quick, low-effort dishes suited to a weeknight, typically under ~40 minutes hands-on.' },
  { mood: 'family', name: 'Family favourites', categories: ['cooking', 'baking'], order: 30,
    description: 'Crowd-pleasers the whole family will eat.',
    guidance: 'Kid-friendly, broadly liked family dinners and bakes. (Canonical mood "family"; folds the old "kidFriendly".)' },
  { mood: 'onePot', name: 'One-pot & one-tray', categories: ['cooking'], order: 40,
    description: 'Everything in one pot, pan or tray for minimal washing-up.',
    guidance: 'Cooked in a single vessel: one-pot, one-pan, traybake dinners.' },
  { mood: 'fakeaway', name: 'Takeaway favourites', categories: ['cooking'], order: 50,
    description: 'Takeaway classics to cook at home: curry-house, chip-shop and more.',
    guidance: 'Home versions of takeaway dishes: curry-house favourites, chip-shop, Chinese takeaway, pizza.' },
  { mood: 'freezerFriendly', name: 'Batch & freezer', categories: ['cooking', 'baking'], order: 60,
    description: 'Make ahead, batch up and freeze for later.',
    guidance: 'Freezes well or is made in batches for the freezer.' },
  { mood: 'party', name: 'Party & sharing', categories: ['cooking', 'baking'], order: 70,
    description: 'Food for a crowd: sharing plates, buffets and celebrations.',
    guidance: 'Made to share at a gathering: buffet food, sharing platters, party bakes.' },
  { mood: 'healthy', name: 'Lighter & healthy', categories: ['cooking', 'baking'], order: 80,
    description: 'Lighter dishes for when you want something fresh.',
    guidance: 'Lighter, fresher, vegetable-forward dishes. Do not over-apply.' },
]
