/**
 * The UK + US household food canon (phase_dish_type_001).
 *
 * The everyday dishes a UK/US home cook expects to find — the "front door"
 * familiar staples, distinct from world-cuisine discovery content. ONE
 * controlled list, used for two jobs:
 *   1. Classification: a published recipe whose title/excerpt matches a canon
 *      entry gets `Tutorial.familiarCanon = true`, so region-aware featuring
 *      can lead with it.
 *   2. Gap report: canon entries with NO matching published recipe are the
 *      genuine content gaps a follow-on fill worker authors (this session does
 *      NOT author them).
 *
 * `region` is where the dish is a household staple (uk / us / both) — it tunes
 * the gap report and lets featuring weight a visitor's home canon first. It is
 * NOT an exclusion: a US visitor can still see shepherd's pie.
 *
 * `dishType` is the shelf the dish belongs on (a slug from
 * dish-type-vocabulary.ts) — used to sanity-check classification and to tell a
 * fill worker where a missing dish should land.
 *
 * `match` are lowercase substrings; a recipe matches if its title (or, weakly,
 * excerpt) contains one. Keep them specific enough not to false-positive
 * (e.g. "shepherd" not "pie").
 */

export type CanonRegion = 'uk' | 'us' | 'both'
export type CanonCategory = 'cooking' | 'baking'

export interface CanonDish {
  name: string
  category: CanonCategory
  region: CanonRegion
  /** dish-type shelf slug this belongs on. */
  dishType: string
  /** lowercase title/excerpt substrings that identify this dish. */
  match: string[]
}

// ── COOKING CANON ─────────────────────────────────────────────────────────────
const COOKING_CANON: CanonDish[] = [
  // Pasta
  { name: 'Spaghetti bolognese', category: 'cooking', region: 'both', dishType: 'pasta', match: ['spaghetti bolognese', 'spaghetti bolognaise', 'spag bol', 'bolognese'] },
  { name: 'Lasagne', category: 'cooking', region: 'both', dishType: 'pasta', match: ['lasagne', 'lasagna'] },
  { name: 'Macaroni cheese', category: 'cooking', region: 'both', dishType: 'pasta', match: ['macaroni cheese', 'mac and cheese', 'mac & cheese', 'mac n cheese'] },
  { name: 'Spaghetti carbonara', category: 'cooking', region: 'both', dishType: 'pasta', match: ['carbonara'] },
  { name: 'Tuna pasta bake', category: 'cooking', region: 'both', dishType: 'pasta', match: ['tuna pasta', 'pasta bake'] },
  { name: 'Pesto pasta', category: 'cooking', region: 'both', dishType: 'pasta', match: ['pesto pasta', 'pasta pesto'] },
  { name: 'Tomato pasta sauce', category: 'cooking', region: 'both', dishType: 'pasta', match: ['tomato pasta', 'marinara'] },
  { name: 'Spaghetti and meatballs', category: 'cooking', region: 'us', dishType: 'pasta', match: ['spaghetti and meatballs', 'spaghetti meatballs'] },
  // Curries
  { name: 'Chicken tikka masala', category: 'cooking', region: 'both', dishType: 'curries', match: ['tikka masala'] },
  { name: 'Chicken korma', category: 'cooking', region: 'both', dishType: 'curries', match: ['korma'] },
  { name: 'Chicken curry (everyday)', category: 'cooking', region: 'both', dishType: 'curries', match: ['chicken curry'] },
  { name: 'Beef madras', category: 'cooking', region: 'uk', dishType: 'curries', match: ['madras'] },
  { name: 'Rogan josh', category: 'cooking', region: 'uk', dishType: 'curries', match: ['rogan josh'] },
  { name: 'Tarka dhal', category: 'cooking', region: 'both', dishType: 'curries', match: ['dhal', 'dal ', 'tarka'] },
  { name: 'Thai green curry', category: 'cooking', region: 'both', dishType: 'curries', match: ['thai green curry', 'green curry'] },
  { name: 'Thai red curry', category: 'cooking', region: 'both', dishType: 'curries', match: ['thai red curry', 'red curry'] },
  { name: 'Katsu curry', category: 'cooking', region: 'uk', dishType: 'curries', match: ['katsu'] },
  { name: 'Chickpea / vegetable curry', category: 'cooking', region: 'both', dishType: 'curries', match: ['chickpea curry', 'chana', 'vegetable curry', 'veg curry'] },
  { name: 'Chicken biryani', category: 'cooking', region: 'both', dishType: 'curries', match: ['biryani'] },
  // Stir-fries & noodles
  { name: 'Chicken stir-fry', category: 'cooking', region: 'both', dishType: 'stir-fries', match: ['stir fry', 'stir-fry'] },
  { name: 'Chow mein', category: 'cooking', region: 'both', dishType: 'stir-fries', match: ['chow mein'] },
  { name: 'Pad thai', category: 'cooking', region: 'both', dishType: 'stir-fries', match: ['pad thai'] },
  { name: 'Egg fried rice', category: 'cooking', region: 'both', dishType: 'stir-fries', match: ['fried rice'] },
  { name: 'Sweet and sour chicken', category: 'cooking', region: 'both', dishType: 'stir-fries', match: ['sweet and sour', 'sweet & sour'] },
  // Roasts & Sunday lunch
  { name: 'Roast chicken', category: 'cooking', region: 'both', dishType: 'roasts', match: ['roast chicken'] },
  { name: 'Roast beef', category: 'cooking', region: 'both', dishType: 'roasts', match: ['roast beef'] },
  { name: 'Roast lamb', category: 'cooking', region: 'uk', dishType: 'roasts', match: ['roast lamb'] },
  { name: 'Roast pork', category: 'cooking', region: 'both', dishType: 'roasts', match: ['roast pork'] },
  { name: 'Roast turkey', category: 'cooking', region: 'both', dishType: 'roasts', match: ['roast turkey'] },
  { name: 'Sunday roast / roast dinner', category: 'cooking', region: 'uk', dishType: 'roasts', match: ['sunday roast', 'roast dinner', 'sunday lunch'] },
  { name: 'Yorkshire puddings', category: 'cooking', region: 'uk', dishType: 'sides-veg', match: ['yorkshire pudding'] },
  { name: 'Roast potatoes', category: 'cooking', region: 'uk', dishType: 'sides-veg', match: ['roast potato'] },
  { name: 'Gravy', category: 'cooking', region: 'both', dishType: 'sauces', match: ['gravy'] },
  // Savoury pies & bakes
  { name: "Shepherd's pie", category: 'cooking', region: 'uk', dishType: 'pies-bakes', match: ['shepherd', "shepherd's pie"] },
  { name: 'Cottage pie', category: 'cooking', region: 'uk', dishType: 'pies-bakes', match: ['cottage pie'] },
  { name: 'Fish pie', category: 'cooking', region: 'uk', dishType: 'pies-bakes', match: ['fish pie'] },
  { name: 'Chicken pot pie', category: 'cooking', region: 'both', dishType: 'pies-bakes', match: ['pot pie', 'chicken pie'] },
  { name: 'Steak and ale pie', category: 'cooking', region: 'uk', dishType: 'pies-bakes', match: ['steak and ale', 'steak and kidney', 'steak pie'] },
  { name: 'Toad in the hole', category: 'cooking', region: 'uk', dishType: 'pies-bakes', match: ['toad in the hole'] },
  { name: 'Quiche', category: 'cooking', region: 'both', dishType: 'pies-bakes', match: ['quiche'] },
  { name: 'Cornish pasty', category: 'cooking', region: 'uk', dishType: 'pies-bakes', match: ['pasty', 'pasties'] },
  { name: 'Cauliflower cheese', category: 'cooking', region: 'uk', dishType: 'sides-veg', match: ['cauliflower cheese'] },
  { name: 'Lasagne (see pasta)', category: 'cooking', region: 'both', dishType: 'pasta', match: [] },
  // Stews & casseroles
  { name: 'Beef stew', category: 'cooking', region: 'both', dishType: 'stews-casseroles', match: ['beef stew'] },
  { name: 'Chilli con carne', category: 'cooking', region: 'both', dishType: 'stews-casseroles', match: ['chilli con carne', 'chili con carne', 'chilli', 'chili'] },
  { name: 'Beef bourguignon', category: 'cooking', region: 'both', dishType: 'stews-casseroles', match: ['bourguignon', 'bourgignon'] },
  { name: 'Lancashire hotpot', category: 'cooking', region: 'uk', dishType: 'stews-casseroles', match: ['hotpot', 'hot pot'] },
  { name: 'Sausage casserole', category: 'cooking', region: 'uk', dishType: 'stews-casseroles', match: ['sausage casserole'] },
  { name: 'Chicken casserole', category: 'cooking', region: 'both', dishType: 'stews-casseroles', match: ['chicken casserole'] },
  { name: 'Pot roast', category: 'cooking', region: 'us', dishType: 'stews-casseroles', match: ['pot roast'] },
  { name: 'Goulash', category: 'cooking', region: 'both', dishType: 'stews-casseroles', match: ['goulash'] },
  // Grills & BBQ
  { name: 'Beef burger', category: 'cooking', region: 'both', dishType: 'sandwiches-burgers', match: ['burger'] },
  { name: 'BBQ ribs', category: 'cooking', region: 'us', dishType: 'grills-bbq', match: ['ribs', 'bbq rib'] },
  { name: 'Pulled pork', category: 'cooking', region: 'us', dishType: 'grills-bbq', match: ['pulled pork'] },
  { name: 'Grilled / pan steak', category: 'cooking', region: 'both', dishType: 'grills-bbq', match: ['steak'] },
  { name: 'Kebabs / skewers', category: 'cooking', region: 'both', dishType: 'grills-bbq', match: ['kebab', 'skewer'] },
  // Fish & seafood
  { name: 'Fish and chips', category: 'cooking', region: 'uk', dishType: 'fish-seafood', match: ['fish and chips', 'fish & chips', 'battered'] },
  { name: 'Salmon fillet', category: 'cooking', region: 'both', dishType: 'fish-seafood', match: ['salmon'] },
  { name: 'Fishcakes', category: 'cooking', region: 'uk', dishType: 'fish-seafood', match: ['fishcake', 'fish cake'] },
  { name: 'Prawn / shrimp dishes', category: 'cooking', region: 'both', dishType: 'fish-seafood', match: ['prawn', 'shrimp'] },
  // Rice & grains
  { name: 'Risotto', category: 'cooking', region: 'both', dishType: 'rice-grains', match: ['risotto'] },
  { name: 'Paella', category: 'cooking', region: 'both', dishType: 'rice-grains', match: ['paella'] },
  { name: 'Jambalaya', category: 'cooking', region: 'us', dishType: 'rice-grains', match: ['jambalaya'] },
  // Everyday dinners
  { name: 'Bangers and mash', category: 'cooking', region: 'uk', dishType: 'everyday-dinners', match: ['bangers and mash', 'sausage and mash', 'sausage & mash'] },
  { name: 'Meatballs', category: 'cooking', region: 'both', dishType: 'everyday-dinners', match: ['meatball'] },
  { name: 'Meatloaf', category: 'cooking', region: 'us', dishType: 'everyday-dinners', match: ['meatloaf'] },
  { name: 'Tacos', category: 'cooking', region: 'both', dishType: 'everyday-dinners', match: ['taco'] },
  { name: 'Fajitas', category: 'cooking', region: 'both', dishType: 'everyday-dinners', match: ['fajita'] },
  { name: 'Enchiladas', category: 'cooking', region: 'us', dishType: 'everyday-dinners', match: ['enchilada'] },
  { name: 'Chicken nuggets / goujons', category: 'cooking', region: 'both', dishType: 'everyday-dinners', match: ['nugget', 'goujon'] },
  { name: 'Pizza (homemade)', category: 'cooking', region: 'both', dishType: 'everyday-dinners', match: ['pizza'] },
  { name: 'Fried chicken', category: 'cooking', region: 'us', dishType: 'everyday-dinners', match: ['fried chicken'] },
  { name: 'Mac and cheese (see pasta)', category: 'cooking', region: 'both', dishType: 'pasta', match: [] },
  // Soups
  { name: 'Tomato soup', category: 'cooking', region: 'both', dishType: 'soups', match: ['tomato soup'] },
  { name: 'Chicken soup / noodle soup', category: 'cooking', region: 'both', dishType: 'soups', match: ['chicken soup', 'chicken noodle'] },
  { name: 'Leek and potato soup', category: 'cooking', region: 'uk', dishType: 'soups', match: ['leek and potato', 'potato and leek'] },
  { name: 'Butternut squash soup', category: 'cooking', region: 'both', dishType: 'soups', match: ['butternut', 'squash soup'] },
  { name: 'Minestrone', category: 'cooking', region: 'both', dishType: 'soups', match: ['minestrone'] },
  { name: 'Broccoli and stilton soup', category: 'cooking', region: 'uk', dishType: 'soups', match: ['broccoli and stilton', 'broccoli soup'] },
  // Salads
  { name: 'Caesar salad', category: 'cooking', region: 'both', dishType: 'salads', match: ['caesar'] },
  { name: 'Coleslaw', category: 'cooking', region: 'both', dishType: 'salads', match: ['coleslaw', 'slaw'] },
  { name: 'Potato salad', category: 'cooking', region: 'both', dishType: 'salads', match: ['potato salad'] },
  { name: 'Greek salad', category: 'cooking', region: 'both', dishType: 'salads', match: ['greek salad'] },
  { name: 'Pasta salad', category: 'cooking', region: 'both', dishType: 'salads', match: ['pasta salad'] },
  // Sandwiches & burgers
  { name: 'Club / chicken sandwich', category: 'cooking', region: 'both', dishType: 'sandwiches-burgers', match: ['sandwich', 'club sandwich'] },
  { name: 'Cheese toastie / grilled cheese', category: 'cooking', region: 'both', dishType: 'sandwiches-burgers', match: ['toastie', 'grilled cheese'] },
  { name: 'Wrap', category: 'cooking', region: 'both', dishType: 'sandwiches-burgers', match: ['wrap'] },
  // Sides & veg
  { name: 'Mashed potato', category: 'cooking', region: 'both', dishType: 'sides-veg', match: ['mashed potato', 'mash'] },
  { name: 'Chips / fries', category: 'cooking', region: 'both', dishType: 'sides-veg', match: ['chips', 'fries'] },
  { name: 'Garlic bread', category: 'cooking', region: 'both', dishType: 'sides-veg', match: ['garlic bread'] },
  // Snacks & dips
  { name: 'Hummus', category: 'cooking', region: 'both', dishType: 'snacks-dips', match: ['hummus', 'houmous'] },
  { name: 'Guacamole', category: 'cooking', region: 'both', dishType: 'snacks-dips', match: ['guacamole'] },
  { name: 'Nachos', category: 'cooking', region: 'both', dishType: 'snacks-dips', match: ['nachos'] },
  // Breakfast & brunch
  { name: 'Full English / fry-up', category: 'cooking', region: 'uk', dishType: 'breakfast-brunch', match: ['full english', 'fry up', 'fry-up'] },
  { name: 'Scrambled eggs', category: 'cooking', region: 'both', dishType: 'breakfast-brunch', match: ['scrambled egg'] },
  { name: 'Pancakes (American)', category: 'cooking', region: 'us', dishType: 'breakfast-brunch', match: ['pancake'] },
  { name: 'Omelette', category: 'cooking', region: 'both', dishType: 'breakfast-brunch', match: ['omelette', 'omelet'] },
  { name: 'Porridge / oatmeal', category: 'cooking', region: 'both', dishType: 'breakfast-brunch', match: ['porridge', 'oatmeal'] },
  { name: 'Eggs Benedict', category: 'cooking', region: 'both', dishType: 'breakfast-brunch', match: ['benedict'] },
  { name: 'French toast', category: 'cooking', region: 'us', dishType: 'breakfast-brunch', match: ['french toast'] },
  { name: 'Beans on toast', category: 'cooking', region: 'uk', dishType: 'breakfast-brunch', match: ['beans on toast'] },
  // Sauces & preserves
  { name: 'White / cheese sauce', category: 'cooking', region: 'both', dishType: 'sauces', match: ['white sauce', 'bechamel', 'cheese sauce'] },
  { name: 'Tomato ketchup / BBQ sauce', category: 'cooking', region: 'both', dishType: 'sauces', match: ['ketchup', 'bbq sauce'] },
  { name: 'Strawberry jam', category: 'cooking', region: 'both', dishType: 'preserves', match: ['strawberry jam'] },
  { name: 'Marmalade', category: 'cooking', region: 'uk', dishType: 'preserves', match: ['marmalade'] },
  { name: 'Chutney', category: 'cooking', region: 'uk', dishType: 'preserves', match: ['chutney'] },
]

// ── BAKING CANON ──────────────────────────────────────────────────────────────
const BAKING_CANON: CanonDish[] = [
  // Cakes
  { name: 'Victoria sponge', category: 'baking', region: 'uk', dishType: 'cakes', match: ['victoria sponge', 'victoria sandwich'] },
  { name: 'Chocolate cake', category: 'baking', region: 'both', dishType: 'cakes', match: ['chocolate cake'] },
  { name: 'Carrot cake', category: 'baking', region: 'both', dishType: 'cakes', match: ['carrot cake'] },
  { name: 'Lemon drizzle cake', category: 'baking', region: 'uk', dishType: 'cakes', match: ['lemon drizzle'] },
  { name: 'Banana bread', category: 'baking', region: 'both', dishType: 'cakes', match: ['banana bread', 'banana loaf'] },
  { name: 'Coffee and walnut cake', category: 'baking', region: 'uk', dishType: 'cakes', match: ['coffee and walnut', 'coffee walnut'] },
  { name: 'Red velvet cake', category: 'baking', region: 'us', dishType: 'cakes', match: ['red velvet'] },
  { name: 'Battenberg', category: 'baking', region: 'uk', dishType: 'cakes', match: ['battenberg'] },
  { name: 'Cupcakes', category: 'baking', region: 'both', dishType: 'cakes', match: ['cupcake', 'fairy cake'] },
  { name: 'Muffins (blueberry)', category: 'baking', region: 'both', dishType: 'cakes', match: ['muffin'] },
  { name: 'Birthday cake', category: 'baking', region: 'both', dishType: 'cakes', match: ['birthday cake'] },
  { name: 'Madeira cake', category: 'baking', region: 'uk', dishType: 'cakes', match: ['madeira cake'] },
  { name: 'Swiss roll', category: 'baking', region: 'uk', dishType: 'cakes', match: ['swiss roll'] },
  // Brownies / bars / traybakes (live on cakes shelf)
  { name: 'Chocolate brownies', category: 'baking', region: 'both', dishType: 'cakes', match: ['brownie'] },
  { name: 'Flapjacks', category: 'baking', region: 'uk', dishType: 'cakes', match: ['flapjack'] },
  { name: "Millionaire's shortbread", category: 'baking', region: 'uk', dishType: 'cakes', match: ['millionaire'] },
  { name: 'Rocky road', category: 'baking', region: 'uk', dishType: 'sweets-confectionery', match: ['rocky road'] },
  { name: 'Lemon bars', category: 'baking', region: 'us', dishType: 'cakes', match: ['lemon bar'] },
  // Biscuits & cookies
  { name: 'Chocolate chip cookies', category: 'baking', region: 'both', dishType: 'biscuits', match: ['chocolate chip cookie', 'choc chip cookie'] },
  { name: 'Shortbread', category: 'baking', region: 'uk', dishType: 'biscuits', match: ['shortbread'] },
  { name: 'Gingerbread', category: 'baking', region: 'both', dishType: 'biscuits', match: ['gingerbread'] },
  { name: 'Oat / oatmeal cookies', category: 'baking', region: 'both', dishType: 'biscuits', match: ['oat cookie', 'oatmeal cookie', 'oaty biscuit'] },
  { name: 'Peanut butter cookies', category: 'baking', region: 'us', dishType: 'biscuits', match: ['peanut butter cookie'] },
  { name: 'Digestive / oat biscuits', category: 'baking', region: 'uk', dishType: 'biscuits', match: ['digestive'] },
  // Bread
  { name: 'White / basic loaf', category: 'baking', region: 'both', dishType: 'bread', match: ['white loaf', 'basic bread', 'white bread', 'sandwich loaf'] },
  { name: 'Sourdough', category: 'baking', region: 'both', dishType: 'bread', match: ['sourdough'] },
  { name: 'Soda bread', category: 'baking', region: 'uk', dishType: 'bread', match: ['soda bread'] },
  { name: 'Dinner rolls / bread rolls', category: 'baking', region: 'both', dishType: 'bread', match: ['dinner roll', 'bread roll', 'bread bun'] },
  { name: 'Focaccia', category: 'baking', region: 'both', dishType: 'bread', match: ['focaccia'] },
  { name: 'Cinnamon rolls', category: 'baking', region: 'both', dishType: 'bread', match: ['cinnamon roll', 'cinnamon bun'] },
  { name: 'Hot cross buns', category: 'baking', region: 'uk', dishType: 'bread', match: ['hot cross bun'] },
  { name: 'Bagels', category: 'baking', region: 'us', dishType: 'bread', match: ['bagel'] },
  { name: 'Naan bread', category: 'baking', region: 'uk', dishType: 'bread', match: ['naan'] },
  // Pastries
  { name: 'Sausage rolls', category: 'baking', region: 'uk', dishType: 'pastries', match: ['sausage roll'] },
  { name: 'Croissants', category: 'baking', region: 'both', dishType: 'pastries', match: ['croissant'] },
  { name: 'Eclairs / profiteroles', category: 'baking', region: 'both', dishType: 'pastries', match: ['eclair', 'profiterole'] },
  { name: 'Doughnuts', category: 'baking', region: 'both', dishType: 'pastries', match: ['doughnut', 'donut'] },
  { name: 'Cinnamon / danish pastry', category: 'baking', region: 'both', dishType: 'pastries', match: ['danish'] },
  // Pies & tarts
  { name: 'Apple pie', category: 'baking', region: 'both', dishType: 'pies', match: ['apple pie'] },
  { name: 'Bakewell tart', category: 'baking', region: 'uk', dishType: 'pies', match: ['bakewell'] },
  { name: 'Treacle tart', category: 'baking', region: 'uk', dishType: 'pies', match: ['treacle tart'] },
  { name: 'Lemon meringue pie', category: 'baking', region: 'both', dishType: 'pies', match: ['lemon meringue'] },
  { name: 'Pecan pie', category: 'baking', region: 'us', dishType: 'pies', match: ['pecan pie'] },
  { name: 'Pumpkin pie', category: 'baking', region: 'us', dishType: 'pies', match: ['pumpkin pie'] },
  { name: 'Cheesecake (baked)', category: 'baking', region: 'both', dishType: 'pies', match: ['cheesecake'] },
  { name: 'Mince pies', category: 'baking', region: 'uk', dishType: 'pies', match: ['mince pie'] },
  { name: 'Quiche (see cooking)', category: 'baking', region: 'both', dishType: 'pies', match: [] },
  // Scones & quick bakes
  { name: 'Scones (plain / fruit)', category: 'baking', region: 'uk', dishType: 'scones', match: ['scone'] },
  { name: 'Welsh cakes', category: 'baking', region: 'uk', dishType: 'scones', match: ['welsh cake'] },
  { name: 'Pancakes (crepes)', category: 'baking', region: 'uk', dishType: 'scones', match: ['pancake', 'crepe'] },
  // Puddings & desserts (sit on pies / sweets shelves in baking)
  { name: 'Apple crumble', category: 'baking', region: 'uk', dishType: 'pies', match: ['crumble'] },
  { name: 'Sticky toffee pudding', category: 'baking', region: 'uk', dishType: 'pies', match: ['sticky toffee'] },
  { name: 'Bread and butter pudding', category: 'baking', region: 'uk', dishType: 'pies', match: ['bread and butter pudding'] },
  { name: 'Trifle', category: 'baking', region: 'uk', dishType: 'sweets-confectionery', match: ['trifle'] },
  { name: 'Eton mess / pavlova', category: 'baking', region: 'uk', dishType: 'sweets-confectionery', match: ['eton mess', 'pavlova', 'meringue'] },
  // Sweets & confectionery
  { name: 'Fudge', category: 'baking', region: 'both', dishType: 'sweets-confectionery', match: ['fudge'] },
  { name: 'Chocolate truffles', category: 'baking', region: 'both', dishType: 'sweets-confectionery', match: ['truffle'] },
]

export const FOOD_CANON: CanonDish[] = [...COOKING_CANON, ...BAKING_CANON]
  // entries with empty match[] are cross-references for the gap report only.
  .filter((d) => d.match.length > 0)

/** Lowercased match index for fast classification. */
export function canonMatch(title: string, excerpt: string | null, category: CanonCategory): CanonDish | null {
  const hayTitle = title.toLowerCase()
  const hayExcerpt = (excerpt ?? '').toLowerCase()
  for (const d of FOOD_CANON) {
    if (d.category !== category) continue
    for (const m of d.match) {
      // title match is strong; excerpt match only for multi-word phrases to
      // avoid false positives on single common words.
      if (hayTitle.includes(m)) return d
      if (m.includes(' ') && hayExcerpt.includes(m)) return d
    }
  }
  return null
}
