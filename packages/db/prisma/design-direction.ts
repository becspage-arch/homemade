/**
 * Cross-craft ORIGINAL-DESIGN DIRECTION — single controlled source of truth.
 *
 * The creative companion to `collection-vocabulary.ts`. Where that file is the
 * controlled vocabulary content is TAGGED with, this file is the controlled
 * palette content is DESIGNED from. Every Homemade-original pattern (crochet,
 * needlework, cross-stitch, knitting, sewing) is generated from a brief built
 * out of three axes, each of which maps onto a vocabulary we already control:
 *
 *   TERRITORY (what it's about)  → SUBJECT + OCCASION tags
 *   LOOK      (how it's styled)  → STYLE tags
 *   ITEM-TYPE (what it is)       → the item-type taxonomy
 *
 * So a finished design is born-tagged by construction. A brief reads:
 *   "a {look} {territory} {item-type} in {palette}, {size}/{difficulty}".
 *   crochet:    "storybook-whimsical woodland-fox amigurumi, 'foxglove-autumn', beginner, ~18cm"
 *   needlework: "cottagecore mushroom hoop, 'mushroom-woodland', 6-inch, intermediate"
 *
 * HOW TO USE (per category sign-off / fill worker):
 *  1. Pick this craft's profile (CRAFT_PROFILES) → its applicable looks,
 *     territories and item-type groups.
 *  2. Build briefs across them, EVERGREEN-core territories first
 *     (BUILD_ORDER); spread variety across difficulty + size.
 *  3. Design Homemade-ORIGINAL only — obey IP_GUARDRAIL.
 *  4. Hold every design to all four QUALITY_BAR checks.
 *  5. Generate → structured stitch data → loom render → craft output.
 *     LOOK at every render (vision gate); iterate to spectacular before
 *     it ships or before Rebecca sees a sample.
 *
 * All slugs in `styleTags` / `subjectTags` / `occasionTags` MUST exist in
 * `collection-vocabulary.ts`. A genuinely missing term is a controlled change
 * to THAT file first, never invented here. New looks / territories / palettes
 * are a controlled change to THIS file, routed through the orchestrator.
 */

export type Craft = 'crochet' | 'knitting' | 'cross-stitch' | 'needlework' | 'sewing'

// ── LOOKS (style) — map to STYLE tags ────────────────────────────────────────

export interface DesignLook {
  slug: string
  name: string
  /** STYLE-axis vocabulary slugs this look is born-tagged with. */
  styleTags: string[]
  vibe: string
  crafts: Craft[]
}

const ALL: Craft[] = ['crochet', 'knitting', 'cross-stitch', 'needlework', 'sewing']

export const LOOKS: DesignLook[] = [
  { slug: 'storybook-whimsical', name: 'Storybook whimsical', styleTags: ['whimsical', 'cute'],
    vibe: 'Characterful and charming — expressive faces, narrative props, a soft base with pop accents. The fairy-house, the woodland fox, the little doll.', crafts: ALL },
  { slug: 'cottagecore-botanical', name: 'Cottagecore botanical', styleTags: ['cottagecore', 'pastel'],
    vibe: 'Soft heritage refreshed — meadow florals, mushrooms, gentle naturalism in a faded-garden palette. Homely, not twee.', crafts: ALL },
  { slug: 'bright-playful', name: 'Bright & playful modern', styleTags: ['bright-bold', 'geometric'],
    vibe: 'Bold saturated colour and clean geometry. Joyful, current, confident. Colour-blocked, graphic, fun.', crafts: ALL },
  { slug: 'soft-modern', name: 'Soft & cosy modern', styleTags: ['modern', 'scandi'],
    vibe: 'Calm neutrals, texture-led, minimalist. Restraint and quality of stitch over decoration.', crafts: ALL },
  { slug: 'elegant-fine', name: 'Elegant & fine', styleTags: ['elegant'],
    vibe: 'Light, refined, delicate — fine lace, airy openwork, a quiet luxury. The teal shawl.', crafts: ALL },
  { slug: 'boho-folk', name: 'Boho folk', styleTags: ['boho'],
    vibe: 'Earthy, eclectic, handmade-rich — tassels, layered texture, warm folk palettes.', crafts: ALL },
  { slug: 'heritage-vintage', name: 'Heritage vintage', styleTags: ['vintage'],
    vibe: 'The heritage seam, in our voice — Victorian/retro motifs redrawn fresh, faded antique palette. Never a republished scan.', crafts: ALL },
  { slug: 'dark-moody', name: 'Dark & moody', styleTags: ['gothic'],
    vibe: 'Inky, dramatic, a little gothic — deep grounds, jewel and bone accents. The niche-but-sticky dark seam.', crafts: ALL },
]

// ── TERRITORIES (subject) — map to SUBJECT / OCCASION tags ────────────────────

export type TerritoryStatus = 'core' | 'held'

export interface DesignTerritory {
  slug: string
  name: string
  /** 'core' = evergreen, build first; 'held' = niche-but-sticky, after core flows. */
  status: TerritoryStatus
  /** SUBJECT-axis vocabulary slugs. */
  subjectTags: string[]
  /** OCCASION-axis slugs where the territory is occasion-bound. */
  occasionTags?: string[]
  /** Crafts the territory suits. Text/sampler/name territories are hoop-native
   *  (needlework/cross-stitch); in crochet/knitting they become a wall-hanging,
   *  banner or colourwork panel; in sewing an appliqué or print. */
  crafts: Craft[]
  note: string
}

export const TERRITORIES: DesignTerritory[] = [
  // ── Evergreen core (build first) ──
  { slug: 'modern-botanicals', name: 'Modern botanicals & wildflower meadows', status: 'core',
    subjectTags: ['florals'], crafts: ALL, note: 'Highest volume. Fresh meadow florals, pressed-flower arrangements, single botanical studies.' },
  { slug: 'kawaii-animals-pets', name: 'Cute & kawaii animals + pets', status: 'core',
    subjectTags: ['animals'], crafts: ALL, note: 'Rounded, big-eyed, characterful. Cats, dogs, foxes, bunnies, farm + woodland.' },
  { slug: 'cottagecore-mushroom', name: 'Cottagecore & mushroom', status: 'core',
    subjectTags: ['florals', 'home-cosy'], crafts: ALL, note: 'Toadstools, foraging, cosy woodland, gingham-and-jam homeliness.' },
  { slug: 'affirmation-selfcare', name: 'Affirmation / self-care / mental-health', status: 'core',
    subjectTags: ['lettering'], crafts: ALL, note: 'Short kind phrases, gentle encouragement. Hoop-native; a banner/wall-hanging in yarn crafts. Homemade-original wording.' },
  { slug: 'celestial-mystical', name: 'Celestial & mystical', status: 'core',
    subjectTags: ['celestial'], crafts: ALL, note: 'Moon phases, stars, sun, zodiac, tarot-flavour. Mystical not branded.' },
  { slug: 'houseplants', name: 'Houseplants', status: 'core',
    subjectTags: ['florals', 'home-cosy'], crafts: ALL, note: 'Monstera, succulents, terrariums, potted greenery. Modern plant-parent.' },
  { slug: 'birds-bees-butterflies', name: 'Birds, bees, butterflies & moths', status: 'core',
    subjectTags: ['birds', 'animals'], crafts: ALL, note: 'Garden birds, pollinators, luna/atlas moths, dragonflies.' },
  { slug: 'modern-seasonal', name: 'Modern seasonal & holidays', status: 'core',
    subjectTags: ['home-cosy'], occasionTags: ['halloween', 'christmas', 'easter', 'valentines', 'thanksgiving'], crafts: ALL,
    note: 'Spooky-cute Halloween, modern Christmas, Easter, Valentine\'s. The brief picks the specific occasion; tag it.' },
  { slug: 'modern-samplers', name: 'Beginner & modern samplers', status: 'core',
    subjectTags: ['samplers'], crafts: ALL, note: 'Stitch-sampler showcases, modern reference pieces. Hoop/flat-native; a stitch-library panel in yarn crafts.' },
  { slug: 'painterly-landscapes', name: 'Painterly landscapes & sunsets', status: 'core',
    subjectTags: ['landscapes', 'coastal'], crafts: ALL, note: 'Rolling hills, sunsets, coast, big skies. Painterly colour blending.' },
  { slug: 'fantasy-creatures', name: 'Fantasy & cute fantasy', status: 'core',
    subjectTags: ['fantasy-creatures'], crafts: ALL, note: 'Dragons, unicorns, mermaids, axolotls — cute-fantasy, generic (never a named franchise character).' },
  { slug: 'coastal-seaside', name: 'Coastal & seaside', status: 'core',
    subjectTags: ['coastal'], crafts: ALL, note: 'Shells, waves, lighthouses, nautical, rockpool life.' },

  // ── Niche-but-sticky (HELD until the core is flowing) ──
  { slug: 'feminist-activist', name: 'Feminist / activist text', status: 'held',
    subjectTags: ['lettering', 'people'], crafts: ['needlework', 'cross-stitch', 'crochet'], note: 'Empowering original wording. Held.' },
  { slug: 'food-cocktail-puns', name: 'Food & cocktail puns', status: 'held',
    subjectTags: ['food-drink', 'lettering'], crafts: ALL, note: 'Punny food/drink. Original wording only. Held.' },
  { slug: 'retro-kitsch-flash', name: 'Retro / 70s / kitsch / tattoo-flash', status: 'held',
    subjectTags: ['florals', 'lettering'], crafts: ALL, note: 'Vintage flash, 70s palettes, kitsch. Pairs with heritage-vintage look. Held.' },
  { slug: 'dark-moody-subjects', name: 'Dark & moody', status: 'held',
    subjectTags: ['celestial', 'fantasy-creatures'], crafts: ALL, note: 'Moths, skulls-tasteful, night gardens. Pairs with the dark-moody look. Held.' },
  { slug: 'steampunk-cyberpunk', name: 'Steampunk / cyberpunk', status: 'held',
    subjectTags: ['fantasy-creatures'], crafts: ALL, note: 'Cogs, neon-noir, retro-future. Held.' },
  { slug: 'visible-mending', name: 'Visible-mending motifs', status: 'held',
    subjectTags: ['florals'], crafts: ['needlework', 'sewing'], note: 'Decorative darning/patch motifs (florals + geometric treatment). Held.' },
  { slug: 'nursery-name', name: 'Nursery & name pieces', status: 'held',
    subjectTags: ['lettering', 'animals'], occasionTags: ['new-baby'], crafts: ALL, note: 'Personalisable nursery pieces; audience baby. Held.' },
]

// ── PALETTES — named colour stories (craft-agnostic) ─────────────────────────
//
// Each craft maps these to its medium (yarn / thread / floss / fabric). Hexes
// are the design intent, not a fixed shade card. Pick by look + territory.

export interface Palette {
  slug: string
  name: string
  hexes: string[]
  mood: string
  /** Looks this palette suits best (LOOK slugs). */
  suitsLooks: string[]
}

export const PALETTES: Palette[] = [
  { slug: 'wildflower-meadow', name: 'Wildflower meadow', hexes: ['#8aa06a', '#e8a0a8', '#c8b6dc', '#f3d98b', '#fbf6ea', '#9fc1d6'],
    mood: 'Fresh spring florals, soft and sunlit.', suitsLooks: ['cottagecore-botanical', 'bright-playful'] },
  { slug: 'foxglove-autumn', name: 'Foxglove autumn', hexes: ['#b5532a', '#d99a3a', '#7c8a5a', '#efe2c8', '#7a4a55'],
    mood: 'Warm woodland autumn — rust, mustard, sage, plum.', suitsLooks: ['storybook-whimsical', 'cottagecore-botanical', 'boho-folk'] },
  { slug: 'mushroom-woodland', name: 'Mushroom woodland', hexes: ['#7c5a3a', '#a8442f', '#6f7d54', '#efe4d2', '#c98a8a'],
    mood: 'Toadstool reds, moss, cocoa, cream — cottagecore forest floor.', suitsLooks: ['cottagecore-botanical', 'storybook-whimsical'] },
  { slug: 'nursery-pastel', name: 'Nursery pastel', hexes: ['#bcd6e8', '#f4cdd6', '#f6ebb6', '#c5e1c5', '#fbf7f0'],
    mood: 'Soft baby pastels, calm and tender.', suitsLooks: ['storybook-whimsical', 'soft-modern'] },
  { slug: 'celestial-night', name: 'Celestial night', hexes: ['#1f2452', '#3a3f7a', '#d9b65a', '#b9c0e0', '#cda8d8'],
    mood: 'Midnight indigo with gold and lilac — moon-and-stars.', suitsLooks: ['dark-moody', 'elegant-fine'] },
  { slug: 'bright-pop', name: 'Bright pop', hexes: ['#e84a4a', '#f6c543', '#2fb6c4', '#d6519a', '#5bbf63'],
    mood: 'Saturated, joyful, graphic.', suitsLooks: ['bright-playful'] },
  { slug: 'candy-kawaii', name: 'Candy kawaii', hexes: ['#f4a6c2', '#bfe6d6', '#f7e08a', '#c9b6e6', '#ffffff'],
    mood: 'Sweet bubblegum brights for cute creatures.', suitsLooks: ['storybook-whimsical', 'bright-playful'] },
  { slug: 'scandi-calm', name: 'Scandi calm', hexes: ['#e9e2d4', '#9aa6ab', '#a8c0c8', '#c6764f', '#f6f2ea'],
    mood: 'Oatmeal, soft grey-blue, one terracotta accent.', suitsLooks: ['soft-modern'] },
  { slug: 'elegant-mono', name: 'Elegant mono', hexes: ['#f4efe6', '#d8c9a8', '#e7b9b0', '#9a8f80', '#3a352f'],
    mood: 'Ivory, soft gold, blush, charcoal — quiet luxury.', suitsLooks: ['elegant-fine'] },
  { slug: 'boho-earth', name: 'Boho earth', hexes: ['#a8542f', '#cf9a4a', '#3f8a86', '#efe2c8', '#4a423a', '#7c8a4a'],
    mood: 'Rust, ochre, teal, olive — eclectic and warm.', suitsLooks: ['boho-folk'] },
  { slug: 'vintage-tea', name: 'Vintage tea', hexes: ['#c89aa0', '#9aa884', '#efe2bf', '#bfc4c8', '#8aa6a4'],
    mood: 'Faded rose, sage, butter, dove grey — antique softness.', suitsLooks: ['heritage-vintage', 'cottagecore-botanical'] },
  { slug: 'gothic-dusk', name: 'Gothic dusk', hexes: ['#2b2730', '#5a2740', '#8a2f3a', '#5a6470', '#e8e2d6'],
    mood: 'Charcoal, deep plum, blood red, bone.', suitsLooks: ['dark-moody'] },
  { slug: 'coastal-breeze', name: 'Coastal breeze', hexes: ['#23476b', '#ffffff', '#e3d6b8', '#8fb8cf', '#c08a5a'],
    mood: 'Navy, white, sand, sky — clean seaside.', suitsLooks: ['bright-playful', 'soft-modern'] },
  { slug: 'winter-frost', name: 'Winter frost', hexes: ['#aecbd8', '#c9d6db', '#ffffff', '#2f5a44', '#9a2f44'],
    mood: 'Icy blue, silver, evergreen, berry.', suitsLooks: ['soft-modern', 'heritage-vintage'] },
]

// ── QUALITY BAR — all four or it doesn't ship ─────────────────────────────────

export const QUALITY_BAR: { name: string; check: string }[] = [
  { name: 'A hook', check: 'One specific delightful idea (a fox with a tiny scarf), never "generic animal".' },
  { name: 'A considered palette', check: 'Drawn from the PALETTES library, harmonious and fresh; never default yarn/thread colours.' },
  { name: 'Character or texture', check: 'A face/pose/prop for figures; real stitch texture (bobbles, shells, satin, long-and-short) for flat work.' },
  { name: 'Fresh proportions', check: 'Modern and current; deliberately heritage only when the piece is meant to read vintage.' },
]

// ── IP + ORIGINALITY GUARDRAIL ────────────────────────────────────────────────

export const IP_GUARDRAIL =
  'Homemade-original only. Work in evergreen themes (everyone does mushrooms and wildflowers) ' +
  'but NEVER copy a specific shop\'s design, and NEVER infringe celebrity, brand, or franchise IP ' +
  '— no "[celebrity]-inspired", no Disney, no named characters. Generic book-lover / gamer / ' +
  'fandom-FLAVOUR is fine; specific properties are out. The heritage seam is reference + redraw ' +
  'in our voice, attributed in sourceNotes, never a republished scan. Attribute originals to the ' +
  'Homemade house designer.'

// ── BUILD ORDER ───────────────────────────────────────────────────────────────

export const BUILD_ORDER =
  'Originals-dominant; PD/heritage is the minority seam. Build the EVERGREEN-core territories ' +
  'first (status: "core"); hold the niche-but-sticky ones (status: "held") until the core is ' +
  'flowing. Enforce variety across difficulty (beginner → showpiece) and size (small → large) ' +
  'within every batch — never cluster at one end.'

// ── PER-CRAFT PROFILES — what each category draws from this system ────────────

export interface CraftProfile {
  craft: Craft
  /** 'all' or specific LOOK slugs. */
  looks: 'all' | string[]
  /** 'all' or specific TERRITORY slugs. */
  territories: 'all' | string[]
  /** Item-type GROUPS this craft designs across (from the item-type taxonomy). */
  itemTypeGroups: string[]
  /** What a finished design produces for this craft. */
  output: string
  /** How the look/territory is realised in this medium. */
  engineering: string
}

export const CRAFT_PROFILES: Record<Craft, CraftProfile> = {
  crochet: {
    craft: 'crochet', looks: 'all', territories: 'all',
    itemTypeGroups: ['Garments', 'Accessories', 'Bags', 'Home & Living', 'Kitchen & Bath', 'Toys', 'Decorative & components'],
    output: 'Written rows + symbol chart + line drawing + loom hero + planner yarn estimate.',
    engineering: 'Concept → structured stitch program (rowsStructured + chartData; per-piece for amigurumi/garments) → loom render. Text territories become a banner/wall-hanging or colourwork panel.' },
  knitting: {
    craft: 'knitting', looks: 'all', territories: 'all',
    itemTypeGroups: ['Garments', 'Accessories', 'Bags', 'Home & Living', 'Toys'],
    output: 'Written rows + chart + schematic + loom hero.',
    engineering: 'Concept → structured stitch chart + written → loom render. Pictorial territories via colourwork/intarsia; text via duplicate-stitch/intarsia panel.' },
  'cross-stitch': {
    craft: 'cross-stitch', looks: 'all', territories: 'all',
    itemTypeGroups: ['Decorative & components', 'Home & Living', 'Kitchen & Bath'],
    output: 'Counted chart + floss key + finished render.',
    engineering: 'Concept → counted grid (the chart IS the design) → render. Strongest for pictorial/text/sampler territories.' },
  needlework: {
    craft: 'needlework', looks: 'all', territories: 'all',
    itemTypeGroups: ['Decorative & components', 'Home & Living'],
    output: 'Multi-hoop PDF (3–8") + DMC map + stitch legend + loom hero. Stick-and-stitch transfers a later format.',
    engineering: 'Concept → line-art + region/stitch/thread-direction map → loom render. All territories incl. text/affirmation/sampler/name are hoop-native here.' },
  sewing: {
    craft: 'sewing', looks: ['soft-modern', 'bright-playful', 'cottagecore-botanical', 'boho-folk', 'heritage-vintage', 'elegant-fine'],
    territories: 'all',
    itemTypeGroups: ['Garments', 'Bags', 'Home & Living', 'Toys'],
    output: 'Pattern pieces + instructions + render.',
    engineering: 'Territory/look carried by fabric print, appliqué and trim rather than stitch texture; silhouette carries the style.' },
}

// ── A creative brief — the unit of generation ────────────────────────────────

export interface CreativeBrief {
  craft: Craft
  /** TERRITORY slug. */ territory: string
  /** LOOK slug. */ look: string
  /** Item-type slug (from the item-type taxonomy). */ itemType: string
  /** PALETTE slug. */ palette: string
  size: 'small' | 'medium' | 'large' | 'showpiece'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'showpiece'
  /** The specific delightful concept — the hook (QUALITY_BAR #1). */ concept: string
}

/** Resolve the looks / territories a craft may use (expands 'all'). */
export function looksFor(craft: Craft): DesignLook[] {
  const p = CRAFT_PROFILES[craft]
  return p.looks === 'all' ? LOOKS : LOOKS.filter((l) => (p.looks as string[]).includes(l.slug))
}
export function territoriesFor(craft: Craft, status?: TerritoryStatus): DesignTerritory[] {
  const p = CRAFT_PROFILES[craft]
  return TERRITORIES.filter(
    (t) =>
      t.crafts.includes(craft) &&
      (p.territories === 'all' || (p.territories as string[]).includes(t.slug)) &&
      (status ? t.status === status : true),
  )
}
