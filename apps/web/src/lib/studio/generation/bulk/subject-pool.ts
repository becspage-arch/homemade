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
 * sub-category — never a fragmented sibling), the style lanes that suit it, the
 * SIZE lanes its subjects survive, and brief-craft notes (the hard-won rules a
 * cold planner must hold).
 *
 * ── THE POOL IS NOW A CEILING (September 2026) ─────────────────────────────
 * Under the CONSTRAINED planner the model no longer invents subjects: it chooses
 * one from these lists and dresses it, and a brief whose head noun matches no
 * example is rejected. That makes this file the hard limit on what the catalogue
 * can ever contain. Every batch spends about ten subjects permanently — once a
 * subject is published, the catalogue avoid list blocks it — so at ten a batch
 * the current 275 subjects are roughly 27 batches of runway.
 *
 * THE POOL MUST GROW WITH THE CATALOGUE. When a shelf starts returning
 * "duplicates" or the sampler starts exhausting themes, the fix is more subjects
 * here, not a looser guard. Add them to the standard of the existing ones: ONE
 * dominant subject that fills the frame, a hook in its pose or setting, colour
 * named concretely, nothing small hung off the side.
 */

import type { StyleKey } from './cross-stitch-style'

/** The size lanes, smallest first — the order `smallestLane` relies on. */
export const LANE_ORDER = ['mini', 'small', 'medium', 'large', 'dense'] as const
export type LaneName = (typeof LANE_ORDER)[number]

/** Every lane. */
export const LANES_ALL: readonly LaneName[] = LANE_ORDER
/** Small and up — glassware, cocktails, anything with a shape to hold. */
export const LANES_SMALL_UP: readonly LaneName[] = ['small', 'medium', 'large', 'dense']
/** Medium and up — portraits, faces, anything with features to resolve. */
export const LANES_MEDIUM_UP: readonly LaneName[] = ['medium', 'large', 'dense']
/** Large and up — scenes and shopfronts, which are mush at anything smaller. */
export const LANES_LARGE_UP: readonly LaneName[] = ['large', 'dense']

export interface CrossStitchTheme {
  id: string
  title: string
  /** Sub-category slug + display name the gem is filed under. */
  shelf: string
  shelfName: string
  /** Style lanes that suit this theme (planner picks within these). */
  styles: StyleKey[]
  /**
   * The subjects this theme may produce.
   *
   * In CONSTRAINED mode (September 2026 onward) this is not a seed list the
   * planner riffs on — it is the allowed set. The planner picks one and dresses
   * it (setting, palette, season, time of day, pose, expression) and a brief
   * whose head noun matches none of these is rejected. So the pool's breadth IS
   * the catalogue's breadth: widen it here, not in the prompt.
   */
  examples: string[]
  /**
   * The size lanes this theme's subjects survive. Defaults to every lane.
   *
   * Batch 7 put "a corner flower shop with buckets of blooms" in the MINI lane at
   * nine colours and it died as "shapes read as mush not shop"; a margarita went
   * to mini and died as "glass shape malformed". Neither was a bad subject or a
   * bad brief — each was a subject in a canvas that cannot hold it, which is a
   * mechanical fault and so gets a mechanical rule.
   */
  lanes?: readonly LaneName[]
  /**
   * Per-subject exceptions to `lanes`, keyed by the example verbatim. Only for
   * the handful of subjects that genuinely differ from their theme — a scene
   * hiding among single motifs, or a charm among scenes.
   */
  laneOverrides?: Record<string, readonly LaneName[]>
  /** Brief-craft rules the planner must respect for this lane. */
  notes?: string
}

/**
 * ── TEXT-RISK SUBJECTS ─────────────────────────────────────────────────────
 *
 * Some subjects invite Flux to write. A shop has a fascia, a jar has a label, a
 * book has a spine, alphabet blocks ARE letters — and Flux answers with garbled
 * pseudo-lettering that the vision gate then correctly kills. It is not a bad
 * roll either: `killIsUnrerollable` treats a text kill as terminal precisely
 * because the same subject produces the same garbling every time, so a text-risk
 * subject in a small canvas burns its whole attempt budget for nothing.
 *
 * The 6 September 2026 08:00 cron lost two of ten ideas exactly this way ("a
 * train of alphabet blocks" — *contains garbled text letters on blocks*; "a
 * haberdashery window of ribbon reels" — *readable-attempt lettering sign above
 * door is garbled text*), and the same class shows up in all four of the
 * preceding firings.
 *
 * What HAS worked is the dense lane: the candy shop and the haunted house both
 * shipped from Flux 1.1 Pro at 110–150 colours, where there are enough cells for
 * a signboard to read as a painted shape rather than a smear of failed letters.
 *
 * So the rule is mechanical and binary, like every other control here: a
 * text-risk subject runs in the `dense` lane or it does not run.
 *
 * WHAT IS DELIBERATELY *NOT* HERE: an ice-cream kiosk and a witch's apothecary
 * shelf both shipped as gems from the `large` lane on 5–6 September, so the
 * signage-adjacent nouns with live counter-evidence stay out. The list is
 * evidence, not a theory about what Flux might write.
 */
export const TEXT_RISK_NOUNS: readonly string[] = [
  // things that carry writing on the thing itself
  'sign', 'signage', 'signboard', 'label', 'banner', 'chalkboard', 'blackboard',
  'menu', 'poster', 'ticket', 'map', 'newspaper', 'letter', 'card', 'postcard',
  'calendar', 'book', 'block', 'jar', 'clock',
  // premises with a fascia over the door: the September haberdashery window died
  // on "lettering sign above door", and a bakery window is the same shape.
  'shop', 'shopfront', 'storefront', 'bookshop', 'bakery', 'haberdashery',
]

/**
 * The only lane a text-risk subject may be built in. One lane, not a floor: this
 * is the canvas where a signboard has the cells to read as a painted shape.
 */
export const TEXT_RISK_LANES: readonly LaneName[] = ['dense']

const TEXT_RISK_RE = new RegExp(String.raw`\b(?:${TEXT_RISK_NOUNS.join('|')})(?:e?s)?\b`, 'i')

/**
 * Does this subject name something that invites lettering?
 *
 * Word-boundary matching on the noun itself, so "maple" is not a map, "ajar" is
 * not a jar and "cardigan" is not a card — the false positives that a substring
 * test would hand the planner.
 */
export function isTextRiskSubject(subject: string): boolean {
  return TEXT_RISK_RE.test(subject ?? '')
}

/** Every curated example that carries the text risk — the pool's own tagging. */
export function textRiskExamples(themes: readonly CrossStitchTheme[] = CROSS_STITCH_THEMES): string[] {
  return themes.flatMap((t) => t.examples).filter(isTextRiskSubject)
}

/** The smallest lane in a set, or null when the set is empty. */
export function smallestLane(lanes: readonly LaneName[]): LaneName | null {
  for (const l of LANE_ORDER) if (lanes.includes(l)) return l
  return null
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
    examples: ['a fox in a tiny raincoat with a paper boat', 'a corgi napping in a teacup of daisies', 'an owl librarian with a stack of tiny books', 'a hedgehog under a mushroom umbrella in the rain', 'a cat curled asleep on a pile of vintage books with a candle', 'a pomeranian sitting in a scarlet pumpkin', 'a chinchilla in a marigold bobble hat', 'two otters holding paws on turquoise water', 'a bengal kitten batting a brass bell', 'a capybara half-sunk in a steaming spring'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a cat curled asleep on a pile of vintage books with a candle': LANES_MEDIUM_UP,
      'an owl librarian with a stack of tiny books': LANES_MEDIUM_UP,
      'a hedgehog under a mushroom umbrella in the rain': LANES_SMALL_UP,
    },
    notes: 'No readable text. Avoid red/orange-furred animals in the high-sat lanes (they cook to orange) — keep foxes/gingers at a lower saturation.',
  },
  {
    id: 'dog-portraits', title: 'Dog breed portraits (realistic)', shelf: 'animals', shelfName: 'Animals',
    styles: ['dogportrait'],
    examples: ['a golden retriever head-and-shoulders portrait', 'a dachshund portrait', 'a French bulldog portrait', 'a border collie portrait', 'a springer spaniel portrait', 'a samoyed portrait', 'a beagle portrait', 'a great dane portrait', 'a shiba inu portrait'],
    lanes: LANES_MEDIUM_UP,
    notes: 'Accurate breed features + markings; flat-shaded illustration, not photographic. High demand — worth several.',
  },
  {
    id: 'cat-portraits', title: 'Cat breed portraits (realistic)', shelf: 'animals', shelfName: 'Animals',
    styles: ['dogportrait'],
    examples: ['a tabby cat portrait', 'a Siamese cat portrait', 'a calico cat portrait', 'a black cat portrait', 'a ragdoll cat portrait', 'a maine coon portrait', 'a ginger tom portrait', 'a bengal cat portrait', 'a russian blue portrait'],
    lanes: LANES_MEDIUM_UP,
    notes: 'Accurate markings; flat-shaded, not photographic.',
  },
  {
    id: 'woodland', title: 'Woodland & wildlife', shelf: 'animals', shelfName: 'Animals',
    styles: ['cute', 'bright', 'scene'],
    examples: ['a red squirrel among autumn leaves and toadstools', 'a deer in a misty forest', 'a badger at dusk', 'a hare under a full moon', 'a pine marten on a moss-green log', 'a woodpecker on a silver birch', 'a stoat in summer coat on warm sandstone', 'wild boar piglets in copper bracken', 'a barn owl quartering a gold meadow'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a barn owl quartering a gold meadow': LANES_MEDIUM_UP,
      'wild boar piglets in copper bracken': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'farm', title: 'Farm & smallholding', shelf: 'animals', shelfName: 'Animals',
    styles: ['cute', 'bright'],
    examples: ['a fluffy spring lamb with a flower crown', 'a proud rooster', 'a highland cow', 'a row of hens and chicks', 'a jersey calf in a field of buttercups', 'a shire horse in polished harness brasses', 'two geese on a village green', 'a border collie mid-crouch on a hillside', 'a beehive in long orchard grass'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a row of hens and chicks': LANES_SMALL_UP,
      'a beehive in long orchard grass': LANES_SMALL_UP,
    },
  },
  {
    id: 'birds-bugs', title: 'Birds, bees, butterflies & moths', shelf: 'animals', shelfName: 'Animals',
    styles: ['bright', 'botanical', 'wreath'],
    examples: ['a robin on a snowy holly branch', 'a hummingbird at trumpet flowers', 'a luna moth', 'a ring of butterflies', 'a goldfinch on a teasel head', 'a swallowtail butterfly over lavender', 'a kingfisher diving at a jade river', 'a bumblebee on an allium globe', 'a barn swallow on a washing line'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a ring of butterflies': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'sea-life', title: 'Sea life & coastal', shelf: 'animals', shelfName: 'Animals',
    styles: ['bright', 'scene', 'fantasy'],
    examples: ['a jewel-toned octopus wearing a tiny pearl crown', 'a whale carrying a whole starlit galaxy on its back', 'an art-nouveau seahorse among swirling kelp and bubbles', 'a mermaid\'s treasure grotto glowing with bioluminescence', 'a shoal of clownfish over a coral garden', 'a leafy sea dragon in emerald water', 'a puffin on a sunlit cliff ledge', 'a manta ray gliding over turquoise sand', 'a rockpool of anemones and limpets'],
    lanes: LANES_SMALL_UP,
    laneOverrides: {
      'a mermaid\'s treasure grotto glowing with bioluminescence': LANES_LARGE_UP,
      'a shoal of clownfish over a coral garden': LANES_MEDIUM_UP,
      'a rockpool of anemones and limpets': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'fantasy-creatures', title: 'Cute fantasy creatures', shelf: 'fantasy', shelfName: 'Fantasy & Fairytale',
    styles: ['fantasy', 'cute'],
    examples: ['a friendly baby dragon', 'a unicorn in a flower meadow', 'a mermaid on a rock', 'a phoenix', 'a fairy toadstool cottage', 'a griffin on a sunlit crag', 'a kitsune among scarlet maple', 'a moss golem in a sunlit glade', 'a sea serpent coiled in a harbour', 'a wyvern on a citadel spire'],
    lanes: LANES_SMALL_UP,
    laneOverrides: {
      'a fairy toadstool cottage': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'florals', title: 'Florals & bouquets', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['bright', 'botanical', 'fantasy'],
    examples: ['an art-nouveau spray of irises with gold-line stems', 'moody dark-academia florals — deep plum peonies and trailing ivy on near-black', 'a moon-phase arch wreathed in wildflowers and moths', 'a stained-glass window of poppies and cornflowers', 'a cottage-garden jug of dahlias', 'sweet peas tumbling over a trellis', 'a sunflower field under a wide blue sky', 'a japanese anemone spray in white and gold', 'a bowl of ranunculus in coral and cream'],
    lanes: LANES_MEDIUM_UP,
    laneOverrides: {
      'a sunflower field under a wide blue sky': LANES_LARGE_UP,
      'moody dark-academia florals — deep plum peonies and trailing ivy on near-black': LANES_LARGE_UP,
    },
  },
  {
    id: 'botanical-stems', title: 'Single botanical stems (tall)', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['botanical'],
    examples: ['a tall foxglove spire with bees', 'a blue delphinium stem with butterflies', 'a hollyhock stem against a wall', 'a lupin spire in candy pink', 'an allium globe on a tall stem', 'a snapdragon stem in sunset orange', 'a sunflower stem against a blue sky', 'a lily stem in flame and gold'],
    lanes: LANES_MEDIUM_UP,
    notes: 'Tall aspect — height clearly greater than width.',
  },
  {
    id: 'wreaths', title: 'Wreaths & circular', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['wreath', 'fantasy'],
    examples: ['a crescent-moon wreath of wildflowers, stars and a sleeping fox', 'a wreath of luminous toadstools, ferns and fireflies', 'an art-nouveau ring of trailing wisteria and hummingbirds', 'a celestial wreath of sun, moon and botanicals', 'a citrus ring of oranges and lemons', 'a summer ring of sweet peas and bees', 'a harvest ring of wheat and poppies', 'a rockpool ring of shells and coral', 'a spring ring of daffodils and blossom'],
    lanes: LANES_MEDIUM_UP,
    notes: 'Circular composition with a clear open centre; square aspect. Give the ring a hook (a moon, an animal, a season, a mood) — not a plain flower ring.',
  },
  {
    id: 'houseplants', title: 'Houseplants & terrariums', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['bright', 'botanical'],
    examples: ['a monstera in a woven pot', 'a shelf of potted succulents', 'a hanging string-of-hearts', 'a glass terrarium', 'a windowsill row of herb pots', 'a cheeseplant in a cobalt ceramic pot', 'a trailing pothos on a pine shelf', 'a bowl of cacti in flower', 'an enamel watering can and a fern'],
    lanes: LANES_SMALL_UP,
    laneOverrides: {
      'a shelf of potted succulents': LANES_MEDIUM_UP,
      'a windowsill row of herb pots': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'mushrooms', title: 'Mushrooms & cottagecore', shelf: 'floral', shelfName: 'Floral & Botanical',
    styles: ['botanical', 'cute', 'fantasy'],
    examples: ['a cluster of red toadstools with ferns', 'a fairy-ring of mushrooms', 'a snail on a toadstool', 'a chanterelle cluster in bright moss', 'a bracket fungus on a fallen birch', 'a hedgehog among autumn toadstools', 'an amanita under copper bracken', 'a puffball ring in dewy grass'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a fairy-ring of mushrooms': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'food-drink', title: 'Food, drink & baking', shelf: 'food', shelfName: 'Food & Drink',
    styles: ['bright', 'scene', 'cute'],
    examples: ['a stack of pancakes with berries', 'a cheerful cupcake with sprinkles', 'a cottage-loaf and rolling pin', 'a bowl of ramen', 'a fruit tart glossy with berries', 'a bowl of pho with fresh herbs', 'a stack of macarons in sorbet colours', 'a slice of watermelon on a cobalt plate', 'a jar of raspberry jam on gingham', 'a wheel of cheese and a russet pear'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a bowl of ramen': LANES_SMALL_UP,
      'a bowl of pho with fresh herbs': LANES_SMALL_UP,
      'a fruit tart glossy with berries': LANES_SMALL_UP,
    },
  },
  {
    id: 'cocktails', title: 'Cocktails & drinks', shelf: 'cocktails', shelfName: 'Cocktails',
    styles: ['bright', 'scene'],
    examples: ['a negroni with an orange twist', 'a margarita with lime', 'a row of tiki cocktails', 'a steaming mug of cocoa with marshmallows', 'an aperol spritz in low sun', 'a mojito in a tall glass', 'a bloody mary with a celery stick', 'a strawberry daiquiri in a coupe glass', 'an espresso martini under a bar light', 'a pitcher of sangria with orange slices'],
    lanes: LANES_SMALL_UP,
  },
  {
    id: 'halloween', title: 'Seasonal — Halloween', shelf: 'halloween', shelfName: 'Halloween',
    styles: ['bright', 'scene', 'fun'],
    examples: ['a tiny mouse in a witch hat on a pumpkin', 'a black cat with a jack-o-lantern', 'a haunted hill house', 'a pumpkin patch at golden hour', 'a candy-corn cat on marigold orange', 'a friendly ghost over a picket fence', 'a raven against a harvest-orange moon', 'a witch\'s broom on a scarlet door', 'a spider web strung with dew on marigolds'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a haunted hill house': LANES_LARGE_UP,
      'a pumpkin patch at golden hour': LANES_MEDIUM_UP,
      'a spider web strung with dew on marigolds': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'christmas', title: 'Seasonal — Christmas & winter', shelf: 'seasonal', shelfName: 'Seasonal',
    styles: ['bright', 'showpiece', 'cute'],
    examples: ['a plump robin on snowy holly', 'a red fox in falling snow', 'a cosy cocoa and knitted jumper', 'a gingerbread house', 'a nutcracker soldier in scarlet and gold', 'a stocking hung on a mantel', 'a bullfinch on snowy rowan', 'a sledge piled with wrapped parcels', 'ice skates on a red ribbon', 'a christmas pudding with holly'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a gingerbread house': LANES_MEDIUM_UP,
      'a sledge piled with wrapped parcels': LANES_SMALL_UP,
    },
  },
  {
    id: 'easter-spring', title: 'Seasonal — Easter & spring', shelf: 'seasonal', shelfName: 'Seasonal',
    styles: ['cute', 'bright'],
    examples: ['an Easter bunny with a basket of painted eggs', 'three fluffy chicks in a blossom nest', 'a spring lamb', 'a basket of tulips and daffodils', 'a duckling on a green bank', 'a spring hare in cowslips', 'a blossom branch with a blue tit', 'a jar of primroses on a windowsill'],
    lanes: LANES_ALL,
    laneOverrides: {
      'three fluffy chicks in a blossom nest': LANES_SMALL_UP,
      'a basket of tulips and daffodils': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'autumn-harvest', title: 'Seasonal — Autumn / harvest', shelf: 'seasonal', shelfName: 'Seasonal',
    styles: ['bright', 'wreath', 'scene'],
    examples: ['an autumn harvest basket of pumpkins and apples', 'an autumn leaf-and-rosehip wreath', 'a squirrel gathering acorns', 'a pumpkin barrow at a garden gate', 'a hedgehog among conkers and beech mast', 'a bushel of red apples in low sun', 'a field of corn stooks', 'a jay with an acorn in gold oak'],
    lanes: LANES_SMALL_UP,
    laneOverrides: {
      'an autumn harvest basket of pumpkins and apples': LANES_MEDIUM_UP,
      'a field of corn stooks': LANES_LARGE_UP,
    },
  },
  {
    id: 'valentines', title: "Seasonal — Valentine's", shelf: 'seasonal', shelfName: 'Seasonal',
    styles: ['cute', 'bright'],
    examples: ['two lovebirds on a heart branch', 'a bunny holding a heart', 'a posy of red roses tied with ribbon', 'a heart-shaped biscuit tin', 'two doves on a scarlet ribbon', 'a jar of paper hearts on a windowsill', 'a strawberry dipped in chocolate', 'two swans on sunlit water'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a posy of red roses tied with ribbon': LANES_SMALL_UP,
    },
  },
  {
    id: 'celestial', title: 'Celestial & constellations', shelf: 'celestial', shelfName: 'Celestial',
    styles: ['scene', 'fantasy'],
    examples: ['a crescent moon cradling stars over mountains', 'the sun and moon face to face', 'a starry night with a fox silhouette', 'a sun with a lion\'s mane of rays', 'a comet over a desert mesa', 'an orrery of painted planets', 'a lighthouse beam under a full starfield', 'a hot-air balloon under a gibbous moon', 'an aurora over a snowy pine ridge'],
    lanes: LANES_SMALL_UP,
    laneOverrides: {
      'a crescent moon cradling stars over mountains': LANES_MEDIUM_UP,
      'an orrery of painted planets': LANES_MEDIUM_UP,
      'a lighthouse beam under a full starfield': LANES_MEDIUM_UP,
      'an aurora over a snowy pine ridge': LANES_MEDIUM_UP,
      'a comet over a desert mesa': LANES_MEDIUM_UP,
    },
    notes: 'Zodiac NAMES are the deferred word-art track — do NOT put readable text in these. Symbols/scenes only.',
  },
  {
    id: 'witchy-gothic', title: 'Witchy & gothic', shelf: 'witchy-gothic', shelfName: 'Witchy & gothic',
    styles: ['scene', 'fantasy', 'fun'],
    examples: ['a witch\'s apothecary shelf of potion bottles', 'a black cat with crystals and candles', 'a crescent moon with moths and herbs', 'a tarot sun card motif', 'a raven on a lit candelabra', 'a spellbook open on a hearth', 'a crystal ball on a velvet cloth', 'a familiar toad on a scarlet toadstool', 'a besom and lantern by a cottage door'],
    lanes: LANES_SMALL_UP,
    laneOverrides: {
      'a witch\'s apothecary shelf of potion bottles': LANES_LARGE_UP,
      'a spellbook open on a hearth': LANES_MEDIUM_UP,
      'a besom and lantern by a cottage door': LANES_MEDIUM_UP,
    },
    notes: 'No readable labels/text on the bottles — wordless drawings only.',
  },
  {
    id: 'cosy-scenes', title: 'Cottages, shops & cosy scenes', shelf: 'scenes', shelfName: 'Scenes',
    styles: ['showpiece', 'pastel'],
    examples: ['a thatched cottage with climbing roses and a packed garden', 'a corner flower shop with buckets of blooms', 'a cosy reading nook with a sleeping cat', 'a victorian greenhouse', 'a village bakery window at first light', 'a narrowboat in canal-art paint', 'a seaside ice-cream kiosk in high sun', 'a potting shed in high summer', 'a haberdashery window of ribbon reels', 'a cottage porch under wisteria'],
    lanes: LANES_LARGE_UP,
    notes: 'These are the BIG showpieces — large canvas + high colour so the little details survive; shopfront signage stays wordless.',
  },
  {
    id: 'landscapes', title: 'Landmarks & landscapes', shelf: 'landscapes', shelfName: 'Landscapes',
    styles: ['scene'],
    examples: ['a candy-striped lighthouse on a headland', 'a lavender field receding to a hill', 'a mountain lake at sunset', 'a row of pastel seaside cottages', 'a stack of gulls off a chalk headland', 'terraced rice fields in new green', 'a salt marsh at high tide', 'a fell path along a drystone wall', 'an olive grove on a hillside'],
    lanes: LANES_LARGE_UP,
    notes: 'Often wide aspect.',
  },
  {
    id: 'transport', title: 'Transport & vehicles', shelf: 'transport', shelfName: 'Transport',
    styles: ['bright', 'scene', 'fun'],
    examples: ['a vintage camper van packed for a trip', 'a hot-air balloon over patchwork fields', 'a little red tractor', 'a steam train', 'a red double-decker bus', 'a fishing boat in harbour paint', 'a yellow taxi in the rain', 'a cable car over a green valley', 'a penny-farthing bicycle', 'a milk float on a village lane'],
    lanes: LANES_SMALL_UP,
    laneOverrides: {
      'a hot-air balloon over patchwork fields': LANES_MEDIUM_UP,
      'a cable car over a green valley': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'hobbies', title: 'Hobbies & makers', shelf: 'hobbies', shelfName: 'Hobbies & makers',
    styles: ['bright', 'scene', 'cute'],
    examples: ['a basket of yarn and knitting needles', 'a potter at a wheel', 'a painter\'s palette and brushes', 'a sewing machine with fabric', 'a bicycle with a basket of blooms', 'a chess board mid-game', 'a darkroom of hanging prints', 'a garden trug of seed packets', 'a telescope on a balcony', 'a stack of vinyl records'],
    lanes: LANES_SMALL_UP,
    laneOverrides: {
      'a potter at a wheel': LANES_MEDIUM_UP,
      'a darkroom of hanging prints': LANES_MEDIUM_UP,
      'a chess board mid-game': LANES_MEDIUM_UP,
    },
  },
  {
    id: 'quirky', title: 'Fun / quirky / funny', shelf: 'whimsical', shelfName: 'Whimsical',
    styles: ['fun'],
    examples: ['a frog knight in acorn armour with a thorn sword', 'a raccoon burglar tiptoeing off with a jam jar', 'a pug astronaut floating among doughnut planets', 'a hedgehog barista pulling a tiny espresso', 'a dinosaur in a party hat eating a giant cupcake', 'a walrus in a striped deckchair', 'a llama in mirrored sunglasses', 'a goose making off with an ice cream', 'an octopus juggling teacups', 'a capybara in a steaming hot spring', 'a highland cow with a fringe clip'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a capybara in a steaming hot spring': LANES_SMALL_UP,
    },
    notes: 'The visual joke + character carries it — a wordless gag with personality, not a plain animal.',
  },
  {
    id: 'nursery', title: 'Nursery & baby', shelf: 'nursery', shelfName: 'Nursery & baby',
    styles: ['cute', 'pastel'],
    examples: ['a sleepy elephant with a balloon', 'a moon-and-stars mobile', 'a little sailboat on gentle waves', 'a bunny asleep under a quilt', 'a rainbow arching over a cloud', 'a duckling in a soapy bath', 'a train of alphabet blocks', 'a koala hugging a eucalyptus branch', 'a mobile of paper stars', 'a whale spouting a rainbow'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a train of alphabet blocks': LANES_SMALL_UP,
    },
  },
  {
    id: 'heritage', title: 'Heritage Delft / blackwork / redwork', shelf: 'monochrome', shelfName: 'Monochrome',
    styles: ['scene'],
    examples: ['a Delft blue-and-white windmill and tulips', 'a redwork farmhouse scene', 'a blue-and-white botanical tile', 'a delft canal-house row', 'a redwork rooster and hen', 'a delft sailing barge', 'a redwork basket of flowers', 'a delft heron among reeds', 'a redwork row of garden tools'],
    lanes: LANES_ALL,
    laneOverrides: {
      'a redwork farmhouse scene': LANES_MEDIUM_UP,
      'a delft canal-house row': LANES_MEDIUM_UP,
    },
    notes: 'Two-tone by design: Delft = blue-on-white; redwork = red-on-white. Low colour count.',
  },
  {
    id: 'portraits', title: 'Artistic & pop-art faces', shelf: 'portraits', shelfName: 'Pop Art & Portraits',
    styles: ['artface', 'popart', 'icon'],
    examples: ['a fine-art woman\'s face wreathed in flowers', 'a bold pop-art portrait', 'a stylised portrait of a historical figure', 'a bold pop-art tiger head', 'a woman in a patterned headscarf', 'a pop-art parrot in primary colours', 'a profile against a gold halo', 'a dancer mid-turn'],
    lanes: LANES_MEDIUM_UP,
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
