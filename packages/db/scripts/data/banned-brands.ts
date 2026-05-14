/**
 * Banned brand-trademark list — single source of truth.
 *
 * Used by `voice-check-lib.ts` to block uploads that mention a registered
 * trademark by name. Each entry maps a brand to the generic equivalent the
 * draft should use instead.
 *
 * To add a brand: append an entry to BANNED_BRANDS below. To genericise
 * something currently blocking, move it into `WARN_BRANDS` (passes upload
 * with a logged warning).
 *
 * The scanner does whole-word case-insensitive matching, so trailing
 * possessives ("McDonald's", "Bailey's") still match the base entry.
 *
 * Edit this file. Then re-run `voice-check:all` to find any existing
 * drafts that newly trip the rule.
 */

export type BrandCategory =
  | 'chain' // restaurant chains
  | 'food' // packaged food + drink brands
  | 'kit' // kitchen equipment brands
  | 'retailer' // supermarkets + kitchen retailers
  | 'generic' // genericised brand names (Hoover, Sellotape, etc.)

export interface BannedBrand {
  /** The trademark string. Matched whole-word case-insensitive. */
  brand: string
  /** What to use instead. */
  generic: string
  category: BrandCategory
}

/**
 * BLOCKS upload (voice-check errors). For brands with a clear generic
 * equivalent — i.e. the brand isn't the only name people would recognise.
 */
export const BANNED_BRANDS: BannedBrand[] = [
  // ───── Restaurant chains ─────────────────────────────────────────────────
  { brand: 'Wagamama', generic: 'Japanese-style', category: 'chain' },
  { brand: 'Wagamamas', generic: 'Japanese-style', category: 'chain' },
  { brand: "Nando's", generic: 'peri-peri-style', category: 'chain' },
  { brand: 'Nandos', generic: 'peri-peri-style', category: 'chain' },
  { brand: 'KFC', generic: 'southern fried', category: 'chain' },
  { brand: "McDonald's", generic: 'fast-food-style', category: 'chain' },
  { brand: 'McDonalds', generic: 'fast-food-style', category: 'chain' },
  { brand: 'Burger King', generic: 'flame-grilled-style', category: 'chain' },
  { brand: 'Five Guys', generic: 'American diner-style', category: 'chain' },
  { brand: 'Pizza Hut', generic: 'American pizza chain-style', category: 'chain' },
  { brand: "Domino's", generic: 'pizza chain-style', category: 'chain' },
  { brand: 'Dominos', generic: 'pizza chain-style', category: 'chain' },
  { brand: 'Subway', generic: 'submarine-sandwich-style', category: 'chain' },
  // Chipotle moved to WARN — "chipotle" is also the dried-jalapeño chilli, used
  // genuinely in cookery far more often than the restaurant chain. Warn rather
  // than block; reviewer can rephrase to "Chipotle restaurant-style" or
  // "chipotle chillies" depending on intent.
  { brand: 'Olive Garden', generic: 'Italian-American chain-style', category: 'chain' },
  { brand: 'Cheesecake Factory', generic: 'American chain-style', category: 'chain' },
  { brand: 'Starbucks', generic: 'coffee-shop-style', category: 'chain' },
  { brand: 'Costa', generic: 'coffee-shop-style', category: 'chain' },
  { brand: 'Costa Coffee', generic: 'coffee-shop-style', category: 'chain' },
  { brand: 'Pret', generic: 'sandwich-chain-style', category: 'chain' },
  { brand: 'Pret a Manger', generic: 'sandwich-chain-style', category: 'chain' },
  { brand: 'Caffè Nero', generic: 'coffee-shop-style', category: 'chain' },
  { brand: 'Caffe Nero', generic: 'coffee-shop-style', category: 'chain' },
  { brand: 'Greggs', generic: 'British bakery-chain-style', category: 'chain' },

  // ───── Branded food + drink ──────────────────────────────────────────────
  { brand: 'Biscoff', generic: 'caramelised biscuit', category: 'food' },
  { brand: 'Lotus Biscoff', generic: 'caramelised biscuit', category: 'food' },
  { brand: 'Lotus biscuit', generic: 'caramelised biscuit', category: 'food' },
  { brand: 'Oreo', generic: 'chocolate sandwich biscuit', category: 'food' },
  { brand: 'Oreos', generic: 'chocolate sandwich biscuits', category: 'food' },
  { brand: 'Nutella', generic: 'chocolate hazelnut spread', category: 'food' },
  { brand: 'Ferrero Rocher', generic: 'chocolate hazelnut praline', category: 'food' },
  { brand: 'Baileys', generic: 'Irish cream liqueur', category: 'food' },
  { brand: "Bailey's", generic: 'Irish cream liqueur', category: 'food' },
  { brand: 'Tabasco', generic: 'Louisiana-style hot sauce', category: 'food' },
  { brand: 'Marmite', generic: 'yeast extract', category: 'food' },
  { brand: 'Bovril', generic: 'beef extract', category: 'food' },
  { brand: 'Vegemite', generic: 'yeast extract', category: 'food' },
  { brand: 'Bisto', generic: 'gravy granules', category: 'food' },
  { brand: 'OXO', generic: 'stock cube', category: 'food' },
  { brand: 'Knorr', generic: 'stock cube', category: 'food' },
  { brand: 'Maggi', generic: 'stock cube', category: 'food' },
  { brand: 'Lurpak', generic: 'salted butter', category: 'food' },
  { brand: 'Anchor', generic: 'salted butter', category: 'food' },
  { brand: 'Cathedral City', generic: 'mature cheddar', category: 'food' },
  { brand: 'Philadelphia', generic: 'cream cheese', category: 'food' },
  { brand: "Hellmann's", generic: 'mayonnaise', category: 'food' },
  { brand: 'Hellmanns', generic: 'mayonnaise', category: 'food' },
  { brand: 'Heinz', generic: '(generic brand-free name)', category: 'food' },
  { brand: "Branston", generic: 'pickle (sweet)', category: 'food' },
  { brand: 'Cadbury', generic: 'milk chocolate', category: 'food' },
  { brand: "Cadbury's", generic: 'milk chocolate', category: 'food' },
  { brand: "Hershey's", generic: 'milk chocolate', category: 'food' },
  { brand: 'Hersheys', generic: 'milk chocolate', category: 'food' },
  { brand: 'Lindt', generic: 'dark chocolate', category: 'food' },
  { brand: 'Toblerone', generic: 'Swiss-style milk chocolate', category: 'food' },
  { brand: 'Kinder', generic: 'milk chocolate', category: 'food' },
  { brand: 'Galaxy', generic: 'milk chocolate', category: 'food' },
  { brand: 'Aero', generic: 'aerated milk chocolate', category: 'food' },
  { brand: "M&M's", generic: 'milk chocolate buttons', category: 'food' },
  { brand: 'M&Ms', generic: 'milk chocolate buttons', category: 'food' },
  { brand: 'Smarties', generic: 'sugar-coated chocolate buttons', category: 'food' },
  { brand: 'Maltesers', generic: 'malt-centred chocolate balls', category: 'food' },
  { brand: 'Kit Kat', generic: 'chocolate wafer biscuit', category: 'food' },
  { brand: 'KitKat', generic: 'chocolate wafer biscuit', category: 'food' },
  { brand: 'Mars Bar', generic: 'chocolate caramel-nougat bar', category: 'food' },
  { brand: 'Snickers', generic: 'chocolate peanut-caramel bar', category: 'food' },
  { brand: 'Twix', generic: 'shortbread caramel chocolate bar', category: 'food' },
  { brand: 'Bounty', generic: 'coconut chocolate bar', category: 'food' },
  // Flake moved to WARN — "flake" / "flaked chocolate" is a generic descriptor
  // for crumbled chocolate pieces in many recipes; the Cadbury Flake bar is one
  // specific product. Warn rather than block.
  { brand: 'Crunchie', generic: 'honeycomb chocolate bar', category: 'food' },
  { brand: 'Wispa', generic: 'aerated milk chocolate bar', category: 'food' },
  { brand: 'Skittles', generic: 'fruit-flavoured chewy sweets', category: 'food' },
  { brand: 'Haribo', generic: 'gummy sweets', category: 'food' },
  { brand: 'Coca-Cola', generic: 'cola', category: 'food' },
  { brand: 'Coca Cola', generic: 'cola', category: 'food' },
  { brand: 'Coke', generic: 'cola', category: 'food' },
  { brand: 'Pepsi', generic: 'cola', category: 'food' },
  { brand: 'Sprite', generic: 'lemon-lime soda', category: 'food' },
  { brand: 'Fanta', generic: 'orange soda', category: 'food' },
  { brand: '7-Up', generic: 'lemon-lime soda', category: 'food' },
  { brand: 'Frylight', generic: 'cooking spray', category: 'food' },
  { brand: 'Pam', generic: 'cooking spray', category: 'food' },
  { brand: "Aunt Bessie's", generic: 'frozen Yorkshire puddings', category: 'food' },
  { brand: 'Aunt Bessies', generic: 'frozen Yorkshire puddings', category: 'food' },
  { brand: "Bird's", generic: 'custard powder', category: 'food' },
  { brand: 'Birds custard', generic: 'custard powder', category: 'food' },
  { brand: 'McVitie', generic: 'biscuit', category: 'food' },
  { brand: "McVitie's", generic: 'biscuit', category: 'food' },
  { brand: 'Carr', generic: 'water biscuit', category: 'food' },
  { brand: "Carr's", generic: 'water biscuit', category: 'food' },
  { brand: 'Jacob', generic: 'cream cracker', category: 'food' },
  { brand: "Jacob's", generic: 'cream cracker', category: 'food' },
  { brand: 'Walkers', generic: 'crisps', category: 'food' },
  { brand: "Walker's", generic: 'crisps', category: 'food' },
  { brand: 'Doritos', generic: 'tortilla chips', category: 'food' },
  { brand: 'Pringles', generic: 'stacked crisps', category: 'food' },
  { brand: 'Cheerios', generic: 'oat-ring cereal', category: 'food' },
  { brand: 'Weetabix', generic: 'wheat biscuit cereal', category: 'food' },
  { brand: 'Shreddies', generic: 'shredded-wheat cereal', category: 'food' },
  { brand: "Kellogg's", generic: 'breakfast cereal', category: 'food' },
  { brand: 'Kelloggs', generic: 'breakfast cereal', category: 'food' },
  { brand: 'Quaker', generic: 'rolled oats', category: 'food' },
  { brand: 'Hovis', generic: 'sliced bread', category: 'food' },
  { brand: 'Warburtons', generic: 'sliced bread', category: 'food' },
  { brand: 'Kingsmill', generic: 'sliced bread', category: 'food' },
  { brand: 'Twinings', generic: 'tea', category: 'food' },
  { brand: 'PG Tips', generic: 'tea', category: 'food' },
  { brand: 'Yorkshire Tea', generic: 'tea', category: 'food' },
  { brand: 'Tetley', generic: 'tea', category: 'food' },
  { brand: 'Nescafé', generic: 'instant coffee', category: 'food' },
  { brand: 'Nescafe', generic: 'instant coffee', category: 'food' },
  { brand: 'Nespresso', generic: 'espresso (pod-machine)', category: 'food' },

  // ───── Kitchen equipment brands ──────────────────────────────────────────
  { brand: 'KitchenAid', generic: 'stand mixer', category: 'kit' },
  { brand: 'Kenwood Chef', generic: 'stand mixer', category: 'kit' },
  { brand: 'Le Creuset', generic: 'cast-iron casserole', category: 'kit' },
  { brand: 'Staub', generic: 'cast-iron casserole', category: 'kit' },
  { brand: 'Lodge', generic: 'cast-iron skillet', category: 'kit' },
  { brand: 'Vitamix', generic: 'high-powered blender', category: 'kit' },
  { brand: 'NutriBullet', generic: 'high-powered blender', category: 'kit' },
  { brand: 'Magimix', generic: 'food processor', category: 'kit' },
  { brand: 'Cuisinart', generic: 'food processor', category: 'kit' },
  { brand: 'Tefal', generic: 'non-stick pan', category: 'kit' },
  { brand: 'T-fal', generic: 'non-stick pan', category: 'kit' },
  { brand: 'Pyrex', generic: 'heatproof glass dish', category: 'kit' },
  { brand: 'Crock-Pot', generic: 'slow cooker', category: 'kit' },
  { brand: 'Crockpot', generic: 'slow cooker', category: 'kit' },
  { brand: 'Instant Pot', generic: 'multi-cooker', category: 'kit' },
  { brand: 'Anova', generic: 'sous-vide circulator', category: 'kit' },
  { brand: 'Mason Cash', generic: 'mixing bowl', category: 'kit' },
  { brand: 'Thermapen', generic: 'instant-read thermometer', category: 'kit' },
  { brand: 'Ooni', generic: 'pizza oven', category: 'kit' },
  { brand: 'Roccbox', generic: 'pizza oven', category: 'kit' },
  { brand: 'Ninja', generic: 'multi-cooker / air fryer', category: 'kit' },
  { brand: 'Tefal ActiFry', generic: 'air fryer', category: 'kit' },
  { brand: 'Silpat', generic: 'silicone baking mat', category: 'kit' },
  { brand: 'KitchenWare', generic: 'kitchen equipment', category: 'kit' }, // demo placeholder; keep or trim

  // ───── Retailer brands ───────────────────────────────────────────────────
  { brand: 'Tesco', generic: '(any supermarket)', category: 'retailer' },
  { brand: "Sainsbury's", generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Sainsburys', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Waitrose', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Marks & Spencer', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'M&S', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Marks and Spencer', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Asda', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Morrisons', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Aldi', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Lidl', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Iceland', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Co-op', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Lakeland', generic: '(any kitchen shop)', category: 'retailer' },
  { brand: 'Williams-Sonoma', generic: '(any kitchen shop)', category: 'retailer' },
  { brand: 'Williams Sonoma', generic: '(any kitchen shop)', category: 'retailer' },
  { brand: 'Sur la Table', generic: '(any kitchen shop)', category: 'retailer' },
  { brand: 'Whole Foods', generic: '(any health-food shop)', category: 'retailer' },
  { brand: "Trader Joe's", generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Trader Joes', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Walmart', generic: '(any supermarket)', category: 'retailer' },
  { brand: 'Target', generic: '(any general-purpose shop)', category: 'retailer' },
  { brand: 'Costco', generic: '(any wholesale shop)', category: 'retailer' },
]

/**
 * WARNS upload (logged, doesn't block). For brand names that have become the
 * de facto generic noun in cookery — using the brand reads naturally to most
 * readers and rephrasing is awkward.
 */
export const WARN_BRANDS: BannedBrand[] = [
  // Genericised brands that read naturally as nouns
  { brand: 'Sriracha', generic: 'fermented-chilli hot sauce', category: 'generic' },
  { brand: 'Hoover', generic: 'vacuum cleaner', category: 'generic' },
  { brand: 'Sellotape', generic: 'sticky tape', category: 'generic' },
  { brand: 'Velcro', generic: 'hook-and-loop fastener', category: 'generic' },
  { brand: 'Kleenex', generic: 'tissues', category: 'generic' },
  { brand: 'Tupperware', generic: 'food storage container', category: 'generic' },
  { brand: 'Jiffy bag', generic: 'padded envelope', category: 'generic' },
  { brand: 'Post-it', generic: 'sticky note', category: 'generic' },
  { brand: 'Plimsoll', generic: 'canvas shoe', category: 'generic' },
  // Ambiguous brand-vs-generic — warn so the reviewer can rephrase by context.
  { brand: 'Chipotle', generic: 'chipotle chillies (the ingredient) or Mexican fast-casual-style (the restaurant)', category: 'generic' },
  { brand: 'Flake', generic: 'flaked chocolate (the ingredient) or Cadbury Flake (the bar)', category: 'generic' },
]
