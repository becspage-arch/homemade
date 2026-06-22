/**
 * Canonical cross-craft ITEM-TYPE vocabulary (phase_cross_craft_item_type_001).
 *
 * The single controlled source of truth for WHAT AN OBJECT IS — cardigan,
 * blanket, amigurumi — independent of which craft made it. This is the fifth
 * structural dimension alongside the four collection-tag axes (Occasion /
 * Season / Style / Subject) in collection-vocabulary.ts. It is DISTINCT from
 * the Subject axis: Subject = what's depicted (florals, animals); item type =
 * the kind of thing the pattern produces (cardigan, scarf, doily).
 *
 * Why a separate file rather than a tag axis: item type is a STRUCTURAL home —
 * exactly one per pattern — surfaced as a SubCategory "home shelf". Every
 * craft's home shelves draw their slugs FROM here, so the SAME "cardigan" slug
 * is used by crochet, knitting and sewing and one search returns the item
 * across all three. The slug already rides on every search doc as
 * `subCategorySlug`; wiring it into CROSS_CRAFT_FACETS makes it a real filter.
 *
 * NOTHING outside this file mints an item type. Adding a type is a deliberate,
 * deduped edit here + a re-seed of the affected craft's shelves. It is never
 * done inline. New craft applicability is the same: edit `crafts`, re-seed.
 *
 * `description` is the PUBLIC, voice-clean shelf/landing intro (a plain list of
 * what's inside — see [[feedback_category_description_voice]]). `guidance` is
 * the INTERNAL rule an authoring/born-shelf pass follows so the same object
 * always lands on the same slug across crafts.
 */

/** The crafts that can produce a pattern of a given item type. */
export type ItemTypeCraft =
  | 'crochet'
  | 'knitting'
  | 'sewing'
  | 'cross-stitch'
  | 'needlework'

/** Display grouping — drives the group headers a category page renders. */
export type ItemTypeGroup =
  | 'garments'
  | 'accessories'
  | 'bags'
  | 'home-living'
  | 'kitchen-bath'
  | 'toys'
  | 'decorative'

export interface ItemType {
  group: ItemTypeGroup
  /** globally unique, kebab-case; the shared SubCategory slug across crafts. */
  slug: string
  /** display label — plural, reads as a shelf/facet ("Cardigans"). */
  name: string
  /** search synonyms + cross-craft term variants ("jumper" → jumper-pullover). */
  aliases?: string[]
  /** which crafts produce this item type (a craft's shelf set = its subset). */
  crafts: ItemTypeCraft[]
  /** public shelf/landing intro: a list of what's inside, voice-clean. */
  description: string
  /** internal rule: how an authoring pass decides this is the item type. */
  guidance: string
  order: number
}

/** Group display metadata — the header + order a category page groups under. */
export const ITEM_TYPE_GROUPS: Record<
  ItemTypeGroup,
  { name: string; order: number }
> = {
  garments: { name: 'Garments', order: 10 },
  accessories: { name: 'Accessories', order: 20 },
  bags: { name: 'Bags & Extras', order: 30 },
  'home-living': { name: 'Home & Living', order: 40 },
  'kitchen-bath': { name: 'Kitchen & Bath', order: 50 },
  toys: { name: 'Toys', order: 60 },
  decorative: { name: 'Decorative & Components', order: 70 },
}

const C: ItemTypeCraft = 'crochet'
const K: ItemTypeCraft = 'knitting'
const S: ItemTypeCraft = 'sewing'
const X: ItemTypeCraft = 'cross-stitch'
const N: ItemTypeCraft = 'needlework'

// ── GARMENTS ──────────────────────────────────────────────────────────────────
const GARMENTS: ItemType[] = [
  { group: 'garments', slug: 'cardigan', name: 'Cardigans', aliases: ['cardi'], crafts: [C, K, S], order: 10,
    description: 'Open-front cardigans: button-ups, wrap-fronts, longline and cropped.',
    guidance: 'A front-opening garment for the upper body (buttons, zip or open). A closed pullover is jumper-pullover.' },
  { group: 'garments', slug: 'jumper-pullover', name: 'Jumpers & Pullovers', aliases: ['jumper', 'sweater', 'pullover'], crafts: [C, K, S], order: 20,
    description: 'Closed-front jumpers and pullovers: crew, roll-neck, raglan and yoke.',
    guidance: 'A closed, pull-over-the-head upper-body garment with sleeves. Front-opening is cardigan; sleeveless is vest.' },
  { group: 'garments', slug: 'vest', name: 'Vests & Tank Tops', aliases: ['tank-top', 'tank', 'slipover', 'gilet', 'sleeveless'], crafts: [C, K, S], order: 30,
    description: 'Sleeveless upper-body pieces: slipovers, tanks and gilets.',
    guidance: 'A sleeveless upper-body garment. With sleeves it is jumper-pullover or cardigan. Folds in tank-top.' },
  { group: 'garments', slug: 'tunic', name: 'Tunics', crafts: [C, K, S], order: 40,
    description: 'Longline tunics worn over the hips.',
    guidance: 'A long top that falls below the hip. Shorter is tee/top; full-length is dress.' },
  { group: 'garments', slug: 'tee-top', name: 'Tees & Tops', aliases: ['tee', 'top', 't-shirt', 'blouse'], crafts: [C, K, S], order: 50,
    description: 'Everyday tops: tees, blouses and lightweight short tops.',
    guidance: 'A short, sleeved or short-sleeved everyday top. Sleeveless is vest; long is tunic.' },
  { group: 'garments', slug: 'dress', name: 'Dresses', aliases: ['frock', 'pinafore'], crafts: [C, K, S], order: 60,
    description: 'One-piece dresses: day dresses, pinafores and party styles.',
    guidance: 'A one-piece full-length garment covering top and skirt. Two-piece sets tag their parts separately.' },
  { group: 'garments', slug: 'skirt', name: 'Skirts', crafts: [C, K, S], order: 70,
    description: 'Skirts of every length: A-line, gathered, tiered and pleated.',
    guidance: 'A lower-body garment that is not divided into legs. Divided is trousers/shorts.' },
  { group: 'garments', slug: 'trousers', name: 'Trousers & Leggings', aliases: ['pants', 'leggings', 'joggers'], crafts: [C, K, S], order: 80,
    description: 'Full-length lower-body wear: trousers, leggings and joggers.',
    guidance: 'A full-length divided lower-body garment. Above the knee is shorts.' },
  { group: 'garments', slug: 'shorts', name: 'Shorts', aliases: ['bloomers'], crafts: [C, K, S], order: 90,
    description: 'Shorts and bloomers above the knee.',
    guidance: 'A divided lower-body garment ending above the knee. Full-length is trousers.' },
  { group: 'garments', slug: 'jacket-coat', name: 'Jackets & Coats', aliases: ['jacket', 'coat', 'outerwear'], crafts: [C, K, S], order: 100,
    description: 'Outerwear: jackets, coats and structured layers.',
    guidance: 'A structured outer layer worn over other clothes. A soft front-opening knit is cardigan.' },
  { group: 'garments', slug: 'jumpsuit-romper', name: 'Jumpsuits & Rompers', aliases: ['romper', 'playsuit', 'onesie', 'dungarees'], crafts: [C, K, S], order: 110,
    description: 'One-piece jumpsuits, rompers and dungarees.',
    guidance: 'A one-piece garment joining top and trousers/shorts. Baby all-in-ones belong here.' },
]

// ── ACCESSORIES ─────────────────────────────────────────────────────────────
const ACCESSORIES: ItemType[] = [
  { group: 'accessories', slug: 'scarf', name: 'Scarves', crafts: [C, K, S], order: 10,
    description: 'Scarves: skinny, chunky, lacy and reversible.',
    guidance: 'A long, open-ended neck wrap. A closed loop is cowl; a triangle is shawl.' },
  { group: 'accessories', slug: 'cowl', name: 'Cowls & Snoods', aliases: ['snood', 'infinity-scarf'], crafts: [C, K], order: 20,
    description: 'Closed-loop cowls and snoods.',
    guidance: 'A scarf worked or seamed into a closed loop. Open-ended is scarf.' },
  { group: 'accessories', slug: 'shawl', name: 'Shawls', aliases: ['shawlette'], crafts: [C, K, S], order: 30,
    description: 'Shawls and shawlettes: triangle, crescent and shaped.',
    guidance: 'A shaped (usually triangular/crescent) shoulder wrap. A rectangle is wrap.' },
  { group: 'accessories', slug: 'wrap', name: 'Wraps & Stoles', aliases: ['stole'], crafts: [C, K, S], order: 40,
    description: 'Rectangular wraps and stoles for the shoulders.',
    guidance: 'A wide rectangular shoulder cover. Shaped is shawl; narrow is scarf.' },
  { group: 'accessories', slug: 'poncho', name: 'Ponchos & Capes', aliases: ['cape', 'capelet'], crafts: [C, K, S], order: 50,
    description: 'Ponchos, capes and capelets worn over the shoulders.',
    guidance: 'A garment-like layer with a neck opening, worn over the shoulders without set sleeves.' },
  { group: 'accessories', slug: 'hat', name: 'Hats & Beanies', aliases: ['beanie', 'bobble-hat', 'cap', 'bonnet'], crafts: [C, K, S], order: 60,
    description: 'Hats and beanies: bobble, slouch, fitted and brimmed.',
    guidance: 'A fitted head covering. A flat-topped beret is beret; a forehead band is headband.' },
  { group: 'accessories', slug: 'beret', name: 'Berets & Tams', aliases: ['tam'], crafts: [C, K], order: 70,
    description: 'Flat-topped berets and tams.',
    guidance: 'A flat, wide, round hat gathered to a band. A fitted dome is hat.' },
  { group: 'accessories', slug: 'headband', name: 'Headbands & Ear Warmers', aliases: ['ear-warmer', 'hairband'], crafts: [C, K, S], order: 80,
    description: 'Headbands and ear warmers.',
    guidance: 'A band worn across the forehead/over the ears, open at the crown. A full covering is hat.' },
  { group: 'accessories', slug: 'gloves', name: 'Gloves', crafts: [C, K, S], order: 90,
    description: 'Full-fingered gloves.',
    guidance: 'Hand wear with separate full-length fingers. Open-fingered is fingerless-mitts; no fingers is mittens.' },
  { group: 'accessories', slug: 'mittens', name: 'Mittens', crafts: [C, K], order: 100,
    description: 'Mittens with a single compartment for the fingers.',
    guidance: 'Hand wear with no separate fingers (thumb only). Separate fingers is gloves.' },
  { group: 'accessories', slug: 'fingerless-mitts', name: 'Fingerless Mitts & Wrist Warmers', aliases: ['wrist-warmers', 'arm-warmers', 'mitts'], crafts: [C, K], order: 110,
    description: 'Fingerless mitts, wrist and arm warmers.',
    guidance: 'Hand/wrist wear leaving the fingers open. Full fingers is gloves.' },
  { group: 'accessories', slug: 'legwarmers', name: 'Leg Warmers', crafts: [C, K], order: 120,
    description: 'Leg and boot warmers.',
    guidance: 'A footless tube for the lower leg. With a foot it is socks.' },
  { group: 'accessories', slug: 'socks', name: 'Socks', crafts: [C, K], order: 130,
    description: 'Socks: ankle, crew and knee-high.',
    guidance: 'Footwear covering the foot and ankle. Footless is legwarmers; soft house wear is slippers.' },
  { group: 'accessories', slug: 'slippers', name: 'Slippers', aliases: ['house-shoes'], crafts: [C, K], order: 140,
    description: 'Slippers and house shoes.',
    guidance: 'Soft indoor footwear with a sole/structure. Baby footwear is booties.' },
  { group: 'accessories', slug: 'booties', name: 'Baby Booties', aliases: ['baby-shoes'], crafts: [C, K], order: 150,
    description: 'Baby booties and soft baby shoes.',
    guidance: 'Soft footwear sized for babies. Adult/child indoor footwear is slippers.' },
]

// ── BAGS & EXTRAS ───────────────────────────────────────────────────────────
const BAGS: ItemType[] = [
  { group: 'bags', slug: 'bag', name: 'Bags & Totes', aliases: ['tote', 'market-bag', 'shopper'], crafts: [C, K, S], order: 10,
    description: 'Bags and totes: market, beach, project and everyday.',
    guidance: 'A carried open or zip-top bag with handles/straps. A small clasp/coin bag is purse.' },
  { group: 'bags', slug: 'purse', name: 'Purses & Pouches', aliases: ['coin-purse', 'pouch', 'clutch', 'wallet'], crafts: [C, K, S], order: 20,
    description: 'Small purses, pouches and clutches.',
    guidance: 'A small pouch/clutch for coins or small items. A larger carried bag is bag.' },
  { group: 'bags', slug: 'backpack', name: 'Backpacks', aliases: ['rucksack'], crafts: [C, K, S], order: 30,
    description: 'Backpacks and rucksacks.',
    guidance: 'A bag carried on the back with two shoulder straps.' },
  { group: 'bags', slug: 'belt', name: 'Belts', crafts: [C, K, S], order: 40,
    description: 'Belts and sashes for the waist.',
    guidance: 'A waist band/sash. A head band is headband.' },
  { group: 'bags', slug: 'jewellery', name: 'Jewellery', aliases: ['necklace', 'bracelet', 'earrings', 'brooch'], crafts: [C, K, S], order: 50,
    description: 'Made jewellery: necklaces, bracelets, earrings and brooches.',
    guidance: 'Worn body adornment — necklaces, bracelets, earrings, brooches.' },
  { group: 'bags', slug: 'hair-accessory', name: 'Hair Accessories', aliases: ['scrunchie', 'hair-tie', 'bow', 'headscarf'], crafts: [C, K, S], order: 60,
    description: 'Hair accessories: scrunchies, bows and ties.',
    guidance: 'Worn in the hair (scrunchie, bow, tie). A forehead band is headband.' },
]

// ── HOME & LIVING ─────────────────────────────────────────────────────────────
const HOME_LIVING: ItemType[] = [
  { group: 'home-living', slug: 'blanket', name: 'Blankets & Afghans', aliases: ['afghan', 'throw', 'baby-blanket'], crafts: [C, K], order: 10,
    description: 'Blankets, afghans and throws — full size and baby.',
    guidance: 'A large flat cover for warmth/display. A square assembled from motifs can also tag motif-granny-square.' },
  { group: 'home-living', slug: 'cushion', name: 'Cushions & Pillows', aliases: ['pillow', 'cushion-cover', 'pouf-cushion'], crafts: [C, K, S, X, N], order: 20,
    description: 'Cushions and pillow covers.',
    guidance: 'A stuffed or covered cushion/pillow. A firm floor seat is pouffe.' },
  { group: 'home-living', slug: 'rug', name: 'Rugs & Mats', aliases: ['mat', 'floor-mat'], crafts: [C, K, S], order: 30,
    description: 'Rugs and floor mats.',
    guidance: 'A floor covering. A table/drink mat is coaster; a bath mat counts here.' },
  { group: 'home-living', slug: 'basket', name: 'Baskets & Storage', aliases: ['storage-basket', 'bin'], crafts: [C, K], order: 40,
    description: 'Baskets and storage bins.',
    guidance: 'A free-standing structured container for the home. A carried bag is bag.' },
  { group: 'home-living', slug: 'pouffe', name: 'Pouffes & Floor Cushions', aliases: ['pouf', 'footstool', 'bean-bag'], crafts: [C, K], order: 50,
    description: 'Pouffes, poufs and floor cushions.',
    guidance: 'A firm stuffed floor seat/footstool. A soft chair cushion is cushion.' },
  { group: 'home-living', slug: 'pet-bed', name: 'Pet Beds & Accessories', aliases: ['cat-bed', 'dog-bed', 'pet-blanket'], crafts: [C, K, S], order: 60,
    description: 'Pet beds, blankets and accessories.',
    guidance: 'Home items made for a pet to use (bed, mat, blanket). A pet toy is animal-toy.' },
  { group: 'home-living', slug: 'plant-hanger', name: 'Plant Hangers & Pot Covers', aliases: ['plant-holder', 'pot-cover', 'macrame-hanger'], crafts: [C, K], order: 70,
    description: 'Plant hangers and pot covers.',
    guidance: 'A hanger or cover for a plant pot. A flat wall piece is wall-hanging.' },
  { group: 'home-living', slug: 'bunting', name: 'Bunting & Garlands', aliases: ['garland', 'pennant'], crafts: [C, K, S, X, N], order: 80,
    description: 'Bunting and garlands for hanging.',
    guidance: 'A strung line of flags/shapes for hanging. A single flat hung piece is wall-hanging.' },
  { group: 'home-living', slug: 'wall-hanging', name: 'Wall Hangings & Art', aliases: ['wall-art', 'tapestry', 'macrame'], crafts: [C, K, S, X, N], order: 90,
    description: 'Wall hangings and made wall art.',
    guidance: 'A flat piece made to hang on a wall. Mounted in a hoop is hoop-art; strung flags are bunting.' },
  { group: 'home-living', slug: 'ornament', name: 'Ornaments & Decorations', aliases: ['decoration', 'bauble', 'hanging-decoration'], crafts: [C, K, S, X, N], order: 100,
    description: 'Hanging ornaments and seasonal decorations.',
    guidance: 'A small made decoration, often hung (bauble, charm). A flat wall piece is wall-hanging.' },
]

// ── KITCHEN & BATH ────────────────────────────────────────────────────────────
const KITCHEN_BATH: ItemType[] = [
  { group: 'kitchen-bath', slug: 'dishcloth', name: 'Dishcloths & Washcloths', aliases: ['washcloth', 'face-cloth', 'flannel'], crafts: [C, K], order: 10,
    description: 'Dishcloths, washcloths and face flannels.',
    guidance: 'A small flat cloth for washing up or washing. A drying cloth is towel.' },
  { group: 'kitchen-bath', slug: 'potholder', name: 'Potholders & Trivets', aliases: ['trivet', 'oven-mitt', 'hot-pad'], crafts: [C, K, S], order: 20,
    description: 'Potholders, trivets and oven mitts.',
    guidance: 'A heat-protective pad or mitt for the kitchen. A teapot cover is tea-cosy.' },
  { group: 'kitchen-bath', slug: 'tea-cosy', name: 'Tea & Egg Cosies', aliases: ['tea-cozy', 'egg-cosy', 'cosy'], crafts: [C, K, S], order: 30,
    description: 'Tea cosies and egg cosies.',
    guidance: 'An insulating cover for a teapot/egg. A flat heat pad is potholder.' },
  { group: 'kitchen-bath', slug: 'towel', name: 'Towels & Toppers', aliases: ['hand-towel', 'tea-towel', 'towel-topper'], crafts: [C, K, S, X, N], order: 40,
    description: 'Towels, tea towels and towel toppers.',
    guidance: 'A drying cloth or a made/edged topper for one. A small wash cloth is dishcloth.' },
]

// ── TOYS ───────────────────────────────────────────────────────────────────
const TOYS: ItemType[] = [
  { group: 'toys', slug: 'amigurumi', name: 'Amigurumi', aliases: ['plush', 'stuffie'], crafts: [C], order: 10,
    description: 'Amigurumi: crocheted stuffed characters, animals and figures.',
    guidance: 'A crocheted-in-the-round stuffed toy. The crochet term for a stuffed figure; sewn/knitted equivalents are doll or animal-toy.' },
  { group: 'toys', slug: 'doll', name: 'Dolls', aliases: ['rag-doll', 'figure'], crafts: [C, K, S], order: 20,
    description: 'Dolls and made figures.',
    guidance: 'A human-figure stuffed toy. An animal figure is animal-toy; a crocheted figure can also be amigurumi.' },
  { group: 'toys', slug: 'animal-toy', name: 'Animal Toys', aliases: ['stuffed-animal', 'soft-toy', 'pet-toy'], crafts: [C, K, S], order: 30,
    description: 'Stuffed animals and soft toys, including pet toys.',
    guidance: 'An animal-figure stuffed/soft toy. A human figure is doll; a crocheted one can also be amigurumi.' },
  { group: 'toys', slug: 'baby-toy-lovey', name: 'Baby Toys & Loveys', aliases: ['lovey', 'comforter', 'rattle', 'teether'], crafts: [C, K, S], order: 40,
    description: 'Baby toys, loveys, comforters and rattles.',
    guidance: 'A soft baby comfort toy/rattle. A full animal/figure is animal-toy/doll.' },
]

// ── DECORATIVE & COMPONENTS ───────────────────────────────────────────────────
const DECORATIVE: ItemType[] = [
  { group: 'decorative', slug: 'doily', name: 'Doilies & Lace', aliases: ['lace', 'mandala'], crafts: [C, N], order: 10,
    description: 'Doilies, lace rounds and decorative mats.',
    guidance: 'A flat decorative lace round/shape. A drink mat is coaster; a wall round is wall-hanging.' },
  { group: 'decorative', slug: 'motif-granny-square', name: 'Motifs & Granny Squares', aliases: ['granny-square', 'motif', 'square', 'hexagon', 'block'], crafts: [C, K], order: 20,
    description: 'Single motifs and squares: granny squares, hexagons and blocks.',
    guidance: 'A single repeatable motif/square meant to be joined. The finished joined blanket is blanket.' },
  { group: 'decorative', slug: 'edging', name: 'Edgings & Trims', aliases: ['trim', 'border', 'lace-edging'], crafts: [C, K, N], order: 30,
    description: 'Edgings, trims and borders to add to other pieces.',
    guidance: 'A length of decorative edging/trim applied to another item.' },
  { group: 'decorative', slug: 'applique-flower', name: 'Appliqués & Flowers', aliases: ['applique', 'flower', 'patch', 'embellishment'], crafts: [C, K, S, N], order: 40,
    description: 'Appliqués, flowers and embellishments to apply to other makes.',
    guidance: 'A small made motif (flower, patch) applied to another item. A length of trim is edging.' },
  { group: 'decorative', slug: 'sampler', name: 'Samplers', crafts: [X, N], order: 50,
    description: 'Stitched samplers: alphabets, motifs and traditional formats.',
    guidance: 'A flat stitched sampler (alphabet/motif). Often also tags the samplers Subject term.' },
  { group: 'decorative', slug: 'hoop-art', name: 'Hoop Art', aliases: ['embroidery-hoop'], crafts: [X, N], order: 60,
    description: 'Stitched pieces finished and displayed in a hoop.',
    guidance: 'A piece mounted/finished in an embroidery hoop for display. Unmounted wall pieces are wall-hanging.' },
  { group: 'decorative', slug: 'bookmark', name: 'Bookmarks', crafts: [C, K, X, N], order: 70,
    description: 'Bookmarks.',
    guidance: 'A made bookmark.' },
  { group: 'decorative', slug: 'pincushion', name: 'Pincushions', crafts: [C, S, X, N], order: 80,
    description: 'Pincushions and needle keeps.',
    guidance: 'A small stuffed cushion for pins/needles. A seat cushion is cushion.' },
  { group: 'decorative', slug: 'coaster', name: 'Coasters & Placemats', aliases: ['placemat', 'mug-rug', 'drink-mat'], crafts: [C, K, X, N], order: 90,
    description: 'Coasters, mug rugs and placemats.',
    guidance: 'A flat mat for a drink/place setting. A floor mat is rug; a decorative lace round is doily.' },
]

export const ITEM_TYPE_VOCABULARY: ItemType[] = [
  ...GARMENTS,
  ...ACCESSORIES,
  ...BAGS,
  ...HOME_LIVING,
  ...KITCHEN_BATH,
  ...TOYS,
  ...DECORATIVE,
]

/** Every item type the given craft can produce, in group then item order. */
export function itemTypesForCraft(craft: ItemTypeCraft): ItemType[] {
  return ITEM_TYPE_VOCABULARY.filter((t) => t.crafts.includes(craft)).sort(
    (a, b) =>
      ITEM_TYPE_GROUPS[a.group].order - ITEM_TYPE_GROUPS[b.group].order ||
      a.order - b.order,
  )
}

/**
 * Validation: unique slugs, valid group, non-empty crafts, no alias collisions
 * with a slug or across types (an alias must resolve to exactly one type).
 */
export function validateItemTypes(
  types: ItemType[] = ITEM_TYPE_VOCABULARY,
): string[] {
  const errors: string[] = []
  const bySlug = new Map<string, ItemType>()
  for (const t of types) {
    if (bySlug.has(t.slug)) errors.push(`duplicate slug: ${t.slug}`)
    bySlug.set(t.slug, t)
    if (!ITEM_TYPE_GROUPS[t.group]) errors.push(`${t.slug}: unknown group '${t.group}'`)
    if (!t.crafts.length) errors.push(`${t.slug}: no crafts listed`)
  }
  const seenAlias = new Map<string, string>()
  for (const t of types) {
    for (const a of t.aliases ?? []) {
      const key = a.toLowerCase()
      if (bySlug.has(key)) errors.push(`${t.slug}: alias '${a}' collides with a slug`)
      const prev = seenAlias.get(key)
      if (prev && prev !== t.slug) errors.push(`alias '${a}' used by both ${prev} and ${t.slug}`)
      seenAlias.set(key, t.slug)
    }
  }
  return errors
}
