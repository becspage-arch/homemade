/**
 * The SUBJECT POOL — the "what to make" for the bulk catalogue routine, condensed
 * from the master lists (docs/cross-stitch-subject-master-list.md +
 * docs/needlework-subject-master-list.md). The master lists stay the human-facing
 * planning docs; this is the machine-readable seed the server planner samples so a
 * batch spans the breadth customers expect. Generic-generation lanes only — the
 * specialist tracks (word-art, maps, outline-fill, samplers, painting replicas)
 * are deferred to dedicated sessions and are NOT here.
 *
 * Each theme carries the shelf it files into (so gems land on a real, existing
 * sub-category — never a fragmented sibling), the style lanes that suit it, and
 * brief-craft notes (the hard-won rules a cold planner must hold).
 */

import type { StyleKey } from './cross-stitch-style'

export interface CrossStitchTheme {
  id: string
  title: string
  /** Sub-category slug + display name the gem is filed under. */
  shelf: string
  shelfName: string
  /** Style lanes that suit this theme (planner picks within these). */
  styles: StyleKey[]
  /** A few example subjects to seed variety — the planner invents around these. */
  examples: string[]
  /** Brief-craft rules the planner must respect for this lane. */
  notes?: string
}

/**
 * Shelves are the coarse browse buckets; fine discovery is the search facets
 * (theme/occasion/item-type). Coarse-but-correct beats fragmented. This list is
 * the ALLOWED set the planner + publisher may use.
 */
export const CROSS_STITCH_THEMES: CrossStitchTheme[] = [
  {
    id: 'cute-animals', title: 'Cute animals & pets', shelf: 'animals', shelfName: 'Animals',
    styles: ['cute', 'bright', 'fun'],
    examples: ['a fox in a tiny raincoat with a paper boat', 'a corgi napping in a teacup of daisies', 'an owl librarian with a stack of tiny books', 'a hedgehog under a mushroom umbrella in the rain', 'a cat curled asleep on a pile of vintage books with a candle'],
    notes: 'No readable text. Avoid red/orange-furred animals in the high-sat lanes (they cook to orange) — keep foxes/gingers at a lower saturation.',
  },
  {
    id: 'dog-portraits', title: 'Dog breed portraits (realistic)', shelf: 'animals', shelfName: 'Animals',
    styles: ['dogportrait'],
    examples: ['a golden retriever head-and-shoulders portrait', 'a dachshund portrait', 'a French bulldog portrait', 'a border collie portrait'],
    notes: 'Accurate breed features + markings; flat-shaded illustration, not photographic. High demand — worth several.',
  },
  {
    id: 'cat-portraits', title: 'Cat breed portraits (realistic)', shelf: 'animals', shelfName: 'Animals',
    styles: ['dogportrait'],
    examples: ['a tabby cat portrait', 'a Siamese cat portrait', 'a calico cat portrait', 'a black cat portrait'],
    notes: 'Accurate markings; flat-shaded, not photographic.',
  },
  {
    id: 'woodland', title: 'Woodland & wildlife', shelf: 'animals', shelfName: 'Animals',
    styles: ['cute', 'bright', 'scene'],
    examples: ['a red squirrel among autumn leaves and toadstools', 'a deer in a misty forest', 'a badger at dusk', 'a hare under a full moon'],
  },
  {
    id: 'farm', title: 'Farm & smallholding', shelf: 'animals', shelfName: 'Animals',
    styles: ['cute', 'bright'],
    examples: ['a fluffy spring lamb with a flower crown', 'a proud rooster', 'a highland cow', 'a row of hens and chicks'],
  },
  {
    id: 'birds-bugs', title: 'Birds, bees, butterflies & moths', shelf: 'animals', shelfName: 'Animals',
    styles: ['bright', 'botanical', 'wreath'],
    examples: ['a robin on a snowy holly branch', 'a hummingbird at trumpet flowers', 'a luna moth', 'a ring of butterflies'],
  },
  {
    id: 'sea-life', title: 'Sea life & coastal', shelf: 'animals', shelfName: 'Animals',
    styles: ['bright', 'scene', 'fantasy'],
    examples: ['a jewel-toned octopus wearing a tiny pearl crown', 'a whale carrying a whole starlit galaxy on its back', 'an art-nouveau seahorse among swirling kelp and bubbles', 'a mermaid\'s treasure grotto glowing with bioluminescence'],
  },
  {
    id: 'fantasy-creatures', title: 'Cute fantasy creatures', shelf: 'fantasy', shelfName: 'Fantasy & Fairytale',
    styles: ['fantasy', 'cute'],
    examples: ['a friendly baby dragon', 'a unicorn in a flower meadow', 'a mermaid on a rock', 'a phoenix', 'a fairy toadstool cottage'],
  },
  {
    id: 'florals', title: 'Florals & bouquets', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['bright', 'botanical', 'fantasy'],
    examples: ['an art-nouveau spray of irises with gold-line stems', 'moody dark-academia florals — deep plum peonies and trailing ivy on near-black', 'a moon-phase arch wreathed in wildflowers and moths', 'a stained-glass window of poppies and cornflowers'],
  },
  {
    id: 'botanical-stems', title: 'Single botanical stems (tall)', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['botanical'],
    examples: ['a tall foxglove spire with bees', 'a blue delphinium stem with butterflies', 'a hollyhock stem against a wall'],
    notes: 'Tall aspect — height clearly greater than width.',
  },
  {
    id: 'wreaths', title: 'Wreaths & circular', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['wreath', 'fantasy'],
    examples: ['a crescent-moon wreath of wildflowers, stars and a sleeping fox', 'a wreath of luminous toadstools, ferns and fireflies', 'an art-nouveau ring of trailing wisteria and hummingbirds', 'a celestial wreath of sun, moon and botanicals'],
    notes: 'Circular composition with a clear open centre; square aspect. Give the ring a hook (a moon, an animal, a season, a mood) — not a plain flower ring.',
  },
  {
    id: 'houseplants', title: 'Houseplants & terrariums', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['bright', 'botanical'],
    examples: ['a monstera in a woven pot', 'a shelf of potted succulents', 'a hanging string-of-hearts', 'a glass terrarium'],
  },
  {
    id: 'mushrooms', title: 'Mushrooms & cottagecore', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['botanical', 'cute', 'fantasy'],
    examples: ['a cluster of red toadstools with ferns', 'a fairy-ring of mushrooms', 'a snail on a toadstool'],
  },
  {
    id: 'food-drink', title: 'Food, drink & baking', shelf: 'food', shelfName: 'Food & Drink',
    styles: ['bright', 'scene', 'cute'],
    examples: ['a stack of pancakes with berries', 'a cheerful cupcake with sprinkles', 'a cottage-loaf and rolling pin', 'a bowl of ramen'],
  },
  {
    id: 'cocktails', title: 'Cocktails & drinks', shelf: 'cocktails', shelfName: 'Cocktails',
    styles: ['bright', 'scene'],
    examples: ['a negroni with an orange twist', 'a margarita with lime', 'a row of tiki cocktails', 'a steaming mug of cocoa with marshmallows'],
  },
  {
    id: 'halloween', title: 'Seasonal — Halloween', shelf: 'halloween', shelfName: 'Halloween',
    styles: ['bright', 'scene', 'fun'],
    examples: ['a tiny mouse in a witch hat on a pumpkin', 'a black cat with a jack-o-lantern', 'a haunted hill house'],
  },
  {
    id: 'christmas', title: 'Seasonal — Christmas & winter', shelf: 'seasonal', shelfName: 'Seasonal',
    styles: ['bright', 'showpiece', 'cute'],
    examples: ['a plump robin on snowy holly', 'a red fox in falling snow', 'a cosy cocoa and knitted jumper', 'a gingerbread house'],
  },
  {
    id: 'easter-spring', title: 'Seasonal — Easter & spring', shelf: 'seasonal', shelfName: 'Seasonal',
    styles: ['cute', 'bright'],
    examples: ['an Easter bunny with a basket of painted eggs', 'three fluffy chicks in a blossom nest', 'a spring lamb'],
  },
  {
    id: 'autumn-harvest', title: 'Seasonal — Autumn / harvest', shelf: 'seasonal', shelfName: 'Seasonal',
    styles: ['bright', 'wreath', 'scene'],
    examples: ['an autumn harvest basket of pumpkins and apples', 'an autumn leaf-and-rosehip wreath', 'a squirrel gathering acorns'],
  },
  {
    id: 'valentines', title: "Seasonal — Valentine's", shelf: 'seasonal', shelfName: 'Seasonal',
    styles: ['cute', 'bright'],
    examples: ['two lovebirds on a heart branch', 'a bunny holding a heart', 'a posy of red roses tied with ribbon'],
  },
  {
    id: 'celestial', title: 'Celestial & constellations', shelf: 'celestial', shelfName: 'Celestial',
    styles: ['scene', 'fantasy'],
    examples: ['a crescent moon cradling stars over mountains', 'the sun and moon face to face', 'a starry night with a fox silhouette'],
    notes: 'Zodiac NAMES are the deferred word-art track — do NOT put readable text in these. Symbols/scenes only.',
  },
  {
    id: 'witchy-gothic', title: 'Witchy & gothic', shelf: 'witchy-gothic', shelfName: 'Witchy & gothic',
    styles: ['scene', 'fantasy', 'fun'],
    examples: ['a witch\'s apothecary shelf of potion bottles', 'a black cat with crystals and candles', 'a crescent moon with moths and herbs'],
    notes: 'No readable labels/text on the bottles — wordless drawings only.',
  },
  {
    id: 'cosy-scenes', title: 'Cottages, shops & cosy scenes', shelf: 'scenes', shelfName: 'Scenes',
    styles: ['showpiece', 'pastel'],
    examples: ['a thatched cottage with climbing roses and a packed garden', 'a corner flower shop with buckets of blooms', 'a cosy reading nook with a sleeping cat', 'a victorian greenhouse'],
    notes: 'These are the BIG showpieces — large canvas + high colour so the little details survive; shopfront signage stays wordless.',
  },
  {
    id: 'landscapes', title: 'Landmarks & landscapes', shelf: 'landscapes', shelfName: 'Landscapes',
    styles: ['scene'],
    examples: ['a candy-striped lighthouse on a headland', 'a lavender field receding to a hill', 'a mountain lake at sunset', 'a row of pastel seaside cottages'],
    notes: 'Often wide aspect.',
  },
  {
    id: 'transport', title: 'Transport & vehicles', shelf: 'transport', shelfName: 'Transport',
    styles: ['bright', 'scene', 'fun'],
    examples: ['a vintage camper van packed for a trip', 'a hot-air balloon over patchwork fields', 'a little red tractor', 'a steam train'],
  },
  {
    id: 'hobbies', title: 'Hobbies & makers', shelf: 'hobbies', shelfName: 'Hobbies & makers',
    styles: ['bright', 'scene', 'cute'],
    examples: ['a basket of yarn and knitting needles', 'a potter at a wheel', 'a painter\'s palette and brushes', 'a sewing machine with fabric'],
  },
  {
    id: 'quirky', title: 'Fun / quirky / funny', shelf: 'whimsical', shelfName: 'Whimsical',
    styles: ['fun'],
    examples: ['a frog knight in acorn armour with a thorn sword', 'a raccoon burglar tiptoeing off with a jam jar', 'a pug astronaut floating among doughnut planets', 'a hedgehog barista pulling a tiny espresso', 'a dinosaur in a party hat eating a giant cupcake'],
    notes: 'The visual joke + character carries it — a wordless gag with personality, not a plain animal.',
  },
  {
    id: 'nursery', title: 'Nursery & baby', shelf: 'nursery', shelfName: 'Nursery & baby',
    styles: ['cute', 'pastel'],
    examples: ['a sleepy elephant with a balloon', 'a moon-and-stars mobile', 'a little sailboat on gentle waves', 'a bunny asleep under a quilt'],
  },
  {
    id: 'heritage', title: 'Heritage Delft / blackwork / redwork', shelf: 'monochrome', shelfName: 'Monochrome',
    styles: ['scene'],
    examples: ['a Delft blue-and-white windmill and tulips', 'a redwork farmhouse scene', 'a blue-and-white botanical tile'],
    notes: 'Two-tone by design: Delft = blue-on-white; redwork = red-on-white. Low colour count.',
  },
  {
    id: 'portraits', title: 'Artistic & pop-art faces', shelf: 'portraits', shelfName: 'Pop Art & Portraits',
    styles: ['artface', 'popart', 'icon'],
    examples: ['a fine-art woman\'s face wreathed in flowers', 'a bold pop-art portrait', 'a stylised portrait of a historical figure'],
    notes: 'artface: FAIR/PALE skin only at low saturation (the compound boost cooks tan skin orange), whole head + forehead visible, both eyes. Deep-skin pop-art: keep saturation ~1.1 and prompt "rich dark chocolate-brown skin, not orange". Whole head visible, correct features.',
  },
]

/**
 * Size/complexity lanes — the planner MUST spread a batch across these, extremes
 * included. The catalogue needs range in BOTH directions: tiny pocket-size charms
 * AND enormous heirloom showpieces, not a wall of medium pieces.
 */
export const CROSS_STITCH_SIZE_LANES = [
  { lane: 'mini', cells: '55–80', colours: '6–12', note: 'a TINY pocket-size motif — one sweet character / charm / tiny scene, a single-evening make; flat cute styles only (never a detailed portrait)' },
  { lane: 'small', cells: '110–130', colours: '14–20', note: 'quick single motif / character; square or slightly tall' },
  { lane: 'medium', cells: '150–165', colours: '24–32', note: 'floral, wreath, mid scene' },
  { lane: 'large', cells: '200–220', colours: '42–52', note: 'showpiece scene, full coverage' },
  { lane: 'dense', cells: '200–230', colours: '110–150', note: 'HUGE detailed showpiece — Flux 1.1 Pro + full DMC; rare, a few per batch at most. This is the big end: 300+ cell heirloom pieces need more container memory (a follow-up).' },
] as const

// ─────────────────────────── NEEDLEWORK ───────────────────────────

export interface NeedleworkTheme {
  id: string
  title: string
  examples: string[]
  /** round → wooden hoop; none → frameless bleed scene; rect → framed aspect. */
  frame: 'round' | 'none' | 'rect'
  /** Bleed = stitch the whole image (a full scene with no plain ground). */
  fullScene: boolean
  /** Warm-red subjects blow out to orange in AgX grading — pull them back. */
  tameWarm?: boolean
  notes?: string
}

/** Needlework has one live shelf; every gem files here. */
export const NEEDLEWORK_SHELF = 'surface-embroidery'
export const NEEDLEWORK_SHELF_NAME = 'Surface embroidery'

export const NEEDLEWORK_THEMES: NeedleworkTheme[] = [
  { id: 'cute-animals', title: 'Cute animals & pets', frame: 'round', fullScene: false, tameWarm: true, examples: ['a red fox curled asleep', 'a sweet corgi', 'a fluffy owl', 'a hedgehog among leaves'] },
  { id: 'dog-portraits', title: 'Dog breed portraits', frame: 'round', fullScene: false, examples: ['a golden retriever portrait', 'a dachshund portrait', 'a spaniel portrait'] },
  { id: 'cat-portraits', title: 'Cat breed portraits', frame: 'round', fullScene: false, examples: ['a tabby cat portrait', 'a Siamese cat portrait', 'a black cat portrait'] },
  { id: 'woodland', title: 'Woodland & wildlife', frame: 'round', fullScene: false, tameWarm: true, examples: ['a red squirrel with acorns', 'a deer among ferns', 'a hare in long grass'] },
  { id: 'farm', title: 'Farm animals & smallholding', frame: 'round', fullScene: false, examples: ['a highland cow', 'a spring lamb', 'a proud rooster'] },
  { id: 'garden-birds', title: 'Garden & exotic birds', frame: 'round', fullScene: false, tameWarm: true, examples: ['a robin on a branch', 'a kingfisher', 'a pair of goldfinches', 'a peacock feather'] },
  { id: 'bees-butterflies', title: 'Bees, butterflies & moths', frame: 'round', fullScene: false, examples: ['a luna moth', 'a monarch butterfly', 'a bumblebee on lavender'] },
  { id: 'sea-life', title: 'Sea life & coastal', frame: 'none', fullScene: true, examples: ['an octopus among coral', 'a sea turtle', 'a jellyfish drift'] },
  { id: 'fantasy-creatures', title: 'Cute fantasy creatures', frame: 'round', fullScene: false, examples: ['a baby dragon', 'a unicorn', 'a friendly sea serpent'] },
  { id: 'florals', title: 'Florals & bouquets', frame: 'round', fullScene: false, tameWarm: true, examples: ['a peony bloom', 'a wild-rose spray', 'a posy of anemones'] },
  { id: 'botanical-stems', title: 'Single botanical stems (line)', frame: 'round', fullScene: false, notes: 'Delicate line mode — a single elegant stem.', examples: ['a foxglove stem', 'a fern frond', 'a lavender sprig'] },
  { id: 'line-motifs', title: 'Delicate line motifs', frame: 'round', fullScene: false, notes: 'Fine line work — jars, sprigs, sprays.', examples: ['a jar of wildflowers', 'a sprig of eucalyptus', 'a spray of berries'] },
  { id: 'wreaths', title: 'Wreaths & circular', frame: 'round', fullScene: false, examples: ['a spring flower wreath', 'a herb wreath', 'a winter berry wreath'] },
  { id: 'houseplants', title: 'Houseplants & terrariums', frame: 'round', fullScene: false, examples: ['a monstera leaf', 'a potted succulent trio', 'a hanging fern'] },
  { id: 'mushrooms', title: 'Mushrooms & cottagecore', frame: 'round', fullScene: false, tameWarm: true, examples: ['a cluster of red toadstools', 'a mossy mushroom log'] },
  { id: 'food-drink', title: 'Food, drink & baking', frame: 'round', fullScene: false, examples: ['a slice of citrus cake', 'a cup of tea and a biscuit', 'a bowl of cherries'] },
  { id: 'halloween', title: 'Seasonal — Halloween', frame: 'round', fullScene: false, examples: ['a black cat and pumpkin', 'a friendly ghost among cobwebs'] },
  { id: 'christmas', title: 'Seasonal — Christmas & winter', frame: 'round', fullScene: false, tameWarm: true, examples: ['a robin on holly', 'a cardinal in snow', 'a sprig of mistletoe'] },
  { id: 'easter-spring', title: 'Seasonal — Easter & spring', frame: 'round', fullScene: false, examples: ['a nest of spring chicks', 'a bunny with tulips'] },
  { id: 'autumn-harvest', title: 'Seasonal — Autumn / harvest', frame: 'none', fullScene: true, tameWarm: true, examples: ['an autumn leaf scatter', 'a pumpkin and wheat still life'] },
  { id: 'valentines', title: "Seasonal — Valentine's", frame: 'round', fullScene: false, tameWarm: true, examples: ['a pair of lovebirds', 'a posy of red roses'] },
  { id: 'celestial', title: 'Celestial & constellations', frame: 'round', fullScene: false, examples: ['a crescent moon and stars', 'a sun-and-moon face'], notes: 'No readable text.' },
  { id: 'witchy-gothic', title: 'Witchy & gothic', frame: 'round', fullScene: false, examples: ['a moth and crescent moon', 'a black cat with crystals'], notes: 'Wordless — no labels.' },
  { id: 'fairies-fantasy', title: 'Fairies & fantasy', frame: 'round', fullScene: false, examples: ['a fairy on a toadstool', 'a woodland sprite'] },
  { id: 'cosy-scenes', title: 'Cottages, shops & cosy scenes', frame: 'none', fullScene: true, examples: ['a thatched cottage and garden', 'a cosy bookshop front'], notes: 'Frameless bleed scene; signage wordless.' },
  { id: 'landscapes', title: 'Landscapes & seascapes', frame: 'none', fullScene: true, examples: ['a lighthouse on a headland', 'rolling hills at sunset', 'a lavender field'] },
  { id: 'animals-human', title: 'Animals doing human things', frame: 'none', fullScene: true, examples: ['a bear reading in an armchair', 'a fox baking bread', 'a rabbit tending a garden'] },
  { id: 'artistic-faces', title: 'Fabulous / artistic faces', frame: 'round', fullScene: false, examples: ['a woman\'s face wreathed in flowers', 'a stylised portrait with botanicals'], notes: 'Fair/pale skin only; whole head + forehead, both eyes.' },
  { id: 'popart-fashion', title: 'Pop-art & fashion portraits', frame: 'none', fullScene: true, examples: ['a bold fashion portrait', 'a pop-art profile'], notes: 'Deep skin: keep true, not orange. Whole head visible.' },
  { id: 'nursery', title: 'Nursery & baby', frame: 'round', fullScene: false, examples: ['a sleepy elephant', 'a little sailboat', 'a moon and stars'] },
  { id: 'heritage', title: 'Heritage reinterpretations', frame: 'round', fullScene: false, examples: ['a folk-art bird', 'a William-Morris-style sprig'], notes: 'Original reinterpretation, never a copy.' },
]

/**
 * Needlework size lanes (finished width in mm). Kept conservative: stitch-stroke
 * count scales with area × detail, and the loom (Blender on Fargate) chokes on an
 * over-dense scene (a 240mm full-bleed piece produced ~28k strokes / a 60MB scene
 * that hung the render). These bounds mirror the customer create-your-own default
 * (200mm) and keep every piece renderable.
 */
export const NEEDLEWORK_SIZE_LANES = [
  { lane: 'small', widthMm: 140, detail: true, note: 'a single motif in a small hoop' },
  { lane: 'medium', widthMm: 170, detail: true, note: 'the default — a filled hoop' },
  { lane: 'large', widthMm: 200, detail: false, note: 'a larger hoop; detail eased so it stays renderable' },
] as const
