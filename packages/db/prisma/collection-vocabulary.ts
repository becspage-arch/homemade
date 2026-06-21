/**
 * Canonical cross-craft collection vocabulary (phase_collection_taxonomy_001).
 *
 * The single controlled source of truth for the Occasion / Season / Style /
 * Subject axes. Seeded into CollectionTag. NOTHING outside this file mints a
 * term — fill-workers and taggers pick from here. Adding a term is a deliberate,
 * deduped edit to this file + a re-seed; it is never done inline.
 *
 * `description` is the PUBLIC, voice-clean theme-page intro (a plain list of
 * what's inside, no editorial flourish). `taggerGuidance` is the INTERNAL rule
 * the AI tagger follows so the vocabulary stays consistent. `themePage: true`
 * means the term earns a standalone, indexable /themes/<slug> page.
 */

export type CollectionAxis = 'OCCASION' | 'SEASON' | 'STYLE' | 'SUBJECT'

export interface VocabTerm {
  axis: CollectionAxis
  slug: string
  name: string
  /** parent term slug, for hierarchy (e.g. nativity → christmas). */
  parent?: string
  aliases?: string[]
  /** public theme-page intro: a list of what's inside, voice-clean. */
  description: string
  /** internal definition the tagger must follow. */
  taggerGuidance: string
  /** earns a standalone indexable /themes/<slug> page. */
  themePage?: boolean
  order: number
}

// ── SEASON ──────────────────────────────────────────────────────────────────
const SEASON: VocabTerm[] = [
  { axis: 'SEASON', slug: 'spring', name: 'Spring', aliases: ['springtime'], order: 10, themePage: true,
    description: 'Spring projects, recipes and makes: blossom, new growth, pastel colour, Easter-adjacent themes.',
    taggerGuidance: 'Use for content whose subject or palette reads as spring (blossom, fresh greens, lambs, daffodils) or that is made/used in spring.' },
  { axis: 'SEASON', slug: 'summer', name: 'Summer', aliases: ['summertime'], order: 20, themePage: true,
    description: 'Summer projects, recipes and makes: bright colour, gardens in full bloom, the seaside, long days.',
    taggerGuidance: 'Use for summer subjects or palettes (sunflowers, fruit, beaches) or content made/used in summer.' },
  { axis: 'SEASON', slug: 'autumn', name: 'Autumn', aliases: ['fall', 'harvest'], order: 30, themePage: true,
    description: 'Autumn projects, recipes and makes: harvest, falling leaves, mushrooms, warm rust and amber tones.',
    taggerGuidance: 'Use for autumn subjects or palettes (leaves, pumpkins, harvest, woodland) or content made/used in autumn. "Fall" is an alias, never a separate term.' },
  { axis: 'SEASON', slug: 'winter', name: 'Winter', aliases: ['wintertime'], order: 40, themePage: true,
    description: 'Winter projects, recipes and makes: frost, snow, evergreens, cosy interiors, cool palettes.',
    taggerGuidance: 'Use for winter subjects or palettes (snow, frost, evergreens, robins). Christmas is a separate OCCASION; a piece can be both.' },
  { axis: 'SEASON', slug: 'year-round', name: 'Year-round', aliases: ['all-year', 'evergreen', 'any-season'], order: 50,
    description: 'Projects, recipes and makes with no seasonal tie, good at any time of year.',
    taggerGuidance: 'Use only when no single season fits. Do not combine with a specific season.' },
]

// ── OCCASION (holidays + life events) ─────────────────────────────────────────
const OCCASION: VocabTerm[] = [
  { axis: 'OCCASION', slug: 'christmas', name: 'Christmas', aliases: ['xmas', 'yule', 'noel', 'festive'], order: 10, themePage: true,
    description: 'Everything for Christmas across the site: recipes, bakes, and makes for trees, ornaments, stockings, gifts and the table.',
    taggerGuidance: 'Use for explicitly Christmas content. Prefer a child term (santa, nativity, etc.) where one fits, in addition to christmas.' },
  { axis: 'OCCASION', slug: 'christmas-ornaments', name: 'Christmas Ornaments', parent: 'christmas', aliases: ['baubles', 'tree decorations'], order: 11,
    description: 'Hanging decorations and baubles for the Christmas tree.',
    taggerGuidance: 'Tree-hung decorations specifically. Always also tag christmas.' },
  { axis: 'OCCASION', slug: 'christmas-stockings', name: 'Christmas Stockings', parent: 'christmas', order: 12,
    description: 'Stockings to make, stitch or bake for.',
    taggerGuidance: 'Stocking-shaped or stocking-themed. Always also tag christmas.' },
  { axis: 'OCCASION', slug: 'santa', name: 'Santa', parent: 'christmas', aliases: ['father christmas', 'saint nick', 'st nick'], order: 13,
    description: 'Father Christmas designs and themes.',
    taggerGuidance: 'Depicts or themes around Santa / Father Christmas. Always also tag christmas.' },
  { axis: 'OCCASION', slug: 'nativity', name: 'Nativity', parent: 'christmas', order: 14,
    description: 'The nativity scene and its figures.',
    taggerGuidance: 'Nativity / manger scenes. Always also tag christmas.' },
  { axis: 'OCCASION', slug: 'snowmen', name: 'Snowmen', parent: 'christmas', aliases: ['snowman'], order: 15,
    description: 'Snowmen designs and themes.',
    taggerGuidance: 'Snowman subjects. Tag winter; tag christmas only when clearly festive.' },
  { axis: 'OCCASION', slug: 'reindeer', name: 'Reindeer', parent: 'christmas', order: 16,
    description: 'Reindeer designs and themes.',
    taggerGuidance: 'Reindeer subjects in a festive context. Always also tag christmas.' },
  { axis: 'OCCASION', slug: 'gingerbread', name: 'Gingerbread', parent: 'christmas', order: 17,
    description: 'Gingerbread houses, figures and bakes.',
    taggerGuidance: 'Gingerbread subjects or bakes. Tag christmas when festive.' },
  { axis: 'OCCASION', slug: 'halloween', name: 'Halloween', aliases: ['spooky', 'spooky season', 'samhain'], order: 20, themePage: true,
    description: 'Everything for Halloween: pumpkins, witches, ghosts, bats and the wider spooky season.',
    taggerGuidance: 'Explicitly Halloween or spooky-season content. Witches/ghosts/skeletons are SUBJECT terms; combine with halloween.' },
  { axis: 'OCCASION', slug: 'day-of-the-dead', name: 'Day of the Dead', aliases: ['dia de los muertos', 'dia de muertos', 'sugar skull'], order: 25, themePage: true,
    description: 'Day of the Dead designs: marigolds, sugar skulls, papel picado.',
    taggerGuidance: 'Día de los Muertos specifically. Not interchangeable with Halloween.' },
  { axis: 'OCCASION', slug: 'easter', name: 'Easter', aliases: ['eastertide'], order: 30, themePage: true,
    description: 'Easter projects, bakes and makes: eggs, bunnies, spring chicks, baskets.',
    taggerGuidance: 'Explicitly Easter content. Tag spring alongside where it fits.' },
  { axis: 'OCCASION', slug: 'valentines', name: "Valentine's Day", aliases: ['valentine', 'valentines day', 'love day'], order: 40, themePage: true,
    description: "Valentine's projects, bakes and makes: hearts, love themes, romantic gifts.",
    taggerGuidance: "Explicitly Valentine's / romantic-gift content. Generic hearts without a Valentine framing belong to SUBJECT, not here." },
  { axis: 'OCCASION', slug: 'thanksgiving', name: 'Thanksgiving', order: 50, themePage: true,
    description: 'Thanksgiving recipes and makes: the table, harvest, gratitude themes.',
    taggerGuidance: 'US/Canadian Thanksgiving. Tag autumn alongside.' },
  { axis: 'OCCASION', slug: 'new-year', name: 'New Year', aliases: ["new year's", 'hogmanay', 'nye'], order: 60, themePage: true,
    description: 'New Year projects and bakes: celebrations, resolutions, fresh starts.',
    taggerGuidance: 'Gregorian New Year. Lunar New Year is a separate term.' },
  { axis: 'OCCASION', slug: 'lunar-new-year', name: 'Lunar New Year', aliases: ['chinese new year', 'spring festival', 'tet'], order: 65, themePage: true,
    description: 'Lunar New Year designs: zodiac animals, red and gold, lanterns, blossom.',
    taggerGuidance: 'Lunar New Year specifically; pair with the relevant zodiac-animal SUBJECT term where shown.' },
  { axis: 'OCCASION', slug: 'st-patricks-day', name: "St Patrick's Day", aliases: ['st patricks', 'st paddys', 'paddys day'], order: 70, themePage: true,
    description: "St Patrick's Day designs: shamrocks, green, Irish themes.",
    taggerGuidance: "St Patrick's Day specifically." },
  { axis: 'OCCASION', slug: 'independence-day', name: 'Independence Day', aliases: ['4th of july', 'fourth of july', 'july 4th', 'patriotic'], order: 75, themePage: true,
    description: 'US Independence Day designs: stars and stripes, summer celebration.',
    taggerGuidance: 'US 4th of July / patriotic American themes.' },
  { axis: 'OCCASION', slug: 'mothers-day', name: "Mother's Day", aliases: ['mothering sunday', 'mothers day'], order: 80, themePage: true,
    description: "Mother's Day projects, bakes and gifts.",
    taggerGuidance: "Mother's Day gifting and themes." },
  { axis: 'OCCASION', slug: 'fathers-day', name: "Father's Day", aliases: ['fathers day'], order: 85, themePage: true,
    description: "Father's Day projects, bakes and gifts.",
    taggerGuidance: "Father's Day gifting and themes." },
  { axis: 'OCCASION', slug: 'diwali', name: 'Diwali', aliases: ['deepavali', 'festival of lights'], order: 90, themePage: true,
    description: 'Diwali designs: diyas, rangoli, lanterns, gold and jewel colour.',
    taggerGuidance: 'Diwali specifically.' },
  { axis: 'OCCASION', slug: 'hanukkah', name: 'Hanukkah', aliases: ['chanukah', 'festival of lights jewish'], order: 95, themePage: true,
    description: 'Hanukkah designs: menorah, dreidel, blue and silver, Jewish themes.',
    taggerGuidance: 'Hanukkah specifically.' },
  { axis: 'OCCASION', slug: 'eid', name: 'Eid', aliases: ['eid al-fitr', 'eid al-adha', 'ramadan'], order: 100, themePage: true,
    description: 'Eid and Ramadan designs: crescent moon, lanterns, geometric motifs.',
    taggerGuidance: 'Eid / Ramadan themes.' },
  { axis: 'OCCASION', slug: 'pride', name: 'Pride', aliases: ['lgbtq', 'lgbt', 'rainbow pride'], order: 105, themePage: true,
    description: 'Pride designs: rainbow colour, inclusive and celebratory themes.',
    taggerGuidance: 'LGBTQ+ Pride themes.' },
  { axis: 'OCCASION', slug: 'weddings', name: 'Weddings', aliases: ['wedding', 'bridal', 'marriage'], order: 120, themePage: true,
    description: 'Wedding projects and gifts: keepsakes, decor, favours, the day itself.',
    taggerGuidance: 'Wedding / marriage celebration and gifting.' },
  { axis: 'OCCASION', slug: 'anniversary', name: 'Anniversary', order: 125,
    description: 'Anniversary keepsakes and gifts.',
    taggerGuidance: 'Anniversary gifting and keepsakes.' },
  { axis: 'OCCASION', slug: 'new-baby', name: 'New Baby', aliases: ['baby', 'newborn', 'nursery', 'baby shower', 'christening'], order: 130, themePage: true,
    description: 'New-baby projects and gifts: nursery makes, keepsakes, baby showers, christenings.',
    taggerGuidance: 'New-baby, nursery, shower and christening content.' },
  { axis: 'OCCASION', slug: 'birthday', name: 'Birthday', order: 135, themePage: true,
    description: 'Birthday projects, bakes and gifts.',
    taggerGuidance: 'Birthday celebration and gifting.' },
  { axis: 'OCCASION', slug: 'graduation', name: 'Graduation', order: 140,
    description: 'Graduation keepsakes and gifts.',
    taggerGuidance: 'Graduation milestone content.' },
  { axis: 'OCCASION', slug: 'housewarming', name: 'Housewarming', aliases: ['new home'], order: 145,
    description: 'Housewarming and new-home gifts and makes.',
    taggerGuidance: 'New-home / housewarming gifting.' },
  { axis: 'OCCASION', slug: 'sympathy', name: 'Sympathy & Memorial', aliases: ['memorial', 'in memoriam', 'condolence'], order: 150,
    description: 'Sympathy and memorial keepsakes.',
    taggerGuidance: 'Memorial / condolence keepsakes. Keep tone restrained.' },
  { axis: 'OCCASION', slug: 'get-well', name: 'Get Well', order: 155,
    description: 'Get-well and thinking-of-you makes and gifts.',
    taggerGuidance: 'Get-well / recovery gifting.' },
  { axis: 'OCCASION', slug: 'retirement', name: 'Retirement', order: 160,
    description: 'Retirement keepsakes and gifts.',
    taggerGuidance: 'Retirement milestone content.' },
]

// ── STYLE (aesthetic register only — NOT what it depicts) ─────────────────────
const STYLE: VocabTerm[] = [
  { axis: 'STYLE', slug: 'whimsical', name: 'Whimsical', aliases: ['playful', 'magical', 'fairytale'], order: 10, themePage: true,
    description: 'Whimsical, storybook makes: fairies, toadstools, dreamy magical scenes, fine detail and charm.',
    taggerGuidance: 'Dreamy, playful, storybook register (fairies, magical woodland, fanciful detail). About FEEL, not subject — a realistic fox is not whimsical, a fairy-tale fox is.' },
  { axis: 'STYLE', slug: 'cute', name: 'Cute & Kawaii', aliases: ['kawaii', 'sweet', 'adorable'], order: 20, themePage: true,
    description: 'Cute, rounded, kawaii-style makes: simple sweet characters and soft charm.',
    taggerGuidance: 'Rounded, simplified, kawaii cuteness. Distinct from whimsical (which is intricate/storybook).' },
  { axis: 'STYLE', slug: 'bright-bold', name: 'Bright & Bold', aliases: ['bold', 'bright', 'vibrant', 'colourful'], order: 30, themePage: true,
    description: 'Bright, saturated, high-contrast makes with confident colour.',
    taggerGuidance: 'Saturated, vivid, high-contrast palettes. Palette judgement, not subject.' },
  { axis: 'STYLE', slug: 'pastel', name: 'Pastel & Soft', aliases: ['soft', 'muted', 'gentle'], order: 40, themePage: true,
    description: 'Soft, pale, low-contrast makes in gentle pastel colour.',
    taggerGuidance: 'Pale, desaturated, gentle palettes. Palette judgement, not subject.' },
  { axis: 'STYLE', slug: 'vintage', name: 'Vintage & Antique', aliases: ['antique', 'retro', 'heritage', 'nostalgic'], order: 50, themePage: true,
    description: 'Vintage and antique-inspired makes: heritage motifs, faded palettes, old-world charm.',
    taggerGuidance: 'Period / nostalgic / antique-reproduction register. Folds in retro; do not also coin a separate retro term.' },
  { axis: 'STYLE', slug: 'cottagecore', name: 'Cottagecore', aliases: ['cottage', 'folk', 'rustic', 'farmhouse', 'country'], order: 60, themePage: true,
    description: 'Cottagecore and folk-country makes: wildflowers, cottage gardens, rustic homely charm.',
    taggerGuidance: 'Rural, homely, folk-country register. Folds in folk/rustic/farmhouse — use this single term for all of them.' },
  { axis: 'STYLE', slug: 'modern', name: 'Modern & Minimalist', aliases: ['minimalist', 'contemporary', 'line-art', 'simple'], order: 70, themePage: true,
    description: 'Modern, clean, minimalist makes: simple line-work, restraint, contemporary styling.',
    taggerGuidance: 'Clean, simple, contemporary, line-led register. Folds minimalist + line-art.' },
  { axis: 'STYLE', slug: 'boho', name: 'Boho', aliases: ['bohemian', 'macrame style', 'eclectic'], order: 80, themePage: true,
    description: 'Boho makes: earthy palettes, eclectic layered pattern, relaxed natural styling.',
    taggerGuidance: 'Bohemian / eclectic / earthy register.' },
  { axis: 'STYLE', slug: 'scandi', name: 'Scandi & Nordic', aliases: ['scandinavian', 'nordic', 'hygge'], order: 90, themePage: true,
    description: 'Scandi and Nordic makes: pared-back palettes, simple folk motifs, clean cosy styling.',
    taggerGuidance: 'Nordic / Scandinavian folk-minimal register.' },
  { axis: 'STYLE', slug: 'gothic', name: 'Gothic & Dark', aliases: ['dark', 'moody', 'witchy', 'dark academia'], order: 100, themePage: true,
    description: 'Gothic and dark makes: moody palettes, mystical and witchy motifs, dramatic contrast.',
    taggerGuidance: 'Dark, moody, gothic register. About tone — a Halloween piece can be cute OR gothic.' },
  { axis: 'STYLE', slug: 'elegant', name: 'Elegant & Heirloom', aliases: ['heirloom', 'refined', 'classic'], order: 110, themePage: true,
    description: 'Elegant, refined, heirloom-quality makes: classic motifs, careful detail, timeless styling.',
    taggerGuidance: 'Refined, classic, heirloom register. Often the showpiece / advanced tier.' },
  { axis: 'STYLE', slug: 'geometric', name: 'Geometric & Abstract', aliases: ['abstract', 'modern geometric'], order: 120, themePage: true,
    description: 'Geometric and abstract makes: repeating shapes, pattern, non-representational design.',
    taggerGuidance: 'Shape/pattern-led, non-representational register.' },
]

// ── SUBJECT (what it depicts — seeded across crafts, grown over time) ──────────
const SUBJECT: VocabTerm[] = [
  { axis: 'SUBJECT', slug: 'florals', name: 'Florals & Botanical', aliases: ['flowers', 'floral', 'botanical', 'wildflowers', 'blooms'], order: 10, themePage: true,
    description: 'Flowers and botanical designs: wildflowers, bouquets, single blooms, foliage and gardens.',
    taggerGuidance: 'Flowers, foliage, botanical subjects of any kind.' },
  { axis: 'SUBJECT', slug: 'animals', name: 'Animals & Wildlife', aliases: ['animal', 'wildlife', 'creatures', 'pets', 'woodland'], order: 20, themePage: true,
    description: 'Animals and wildlife: pets, woodland and farm animals, sea life and more.',
    taggerGuidance: 'Real animals of any kind. Mythical creatures go to fantasy-creatures.' },
  { axis: 'SUBJECT', slug: 'birds', name: 'Birds, Bees & Butterflies', aliases: ['bird', 'bee', 'butterfly', 'moth', 'insects'], order: 30, themePage: true,
    description: 'Birds, bees, butterflies, moths and other winged things.',
    taggerGuidance: 'Birds and flying insects. A sub-set of animal life kept separate for how often it is searched.' },
  { axis: 'SUBJECT', slug: 'fantasy-creatures', name: 'Fantasy & Myth', aliases: ['fantasy', 'fairy', 'fairies', 'dragon', 'mermaid', 'unicorn', 'witch', 'mythical'], order: 40, themePage: true,
    description: 'Fantasy and mythical subjects: fairies, dragons, mermaids, unicorns, witches and folklore.',
    taggerGuidance: 'Mythical / imaginary beings. The whimsical STYLE often pairs with these but is separate.' },
  { axis: 'SUBJECT', slug: 'celestial', name: 'Celestial & Mystical', aliases: ['moon', 'stars', 'sun', 'zodiac', 'astrology', 'constellation'], order: 50, themePage: true,
    description: 'Celestial subjects: moon, stars, sun, zodiac and astrology.',
    taggerGuidance: 'Sky / cosmos / astrology subjects.' },
  { axis: 'SUBJECT', slug: 'landscapes', name: 'Landscapes & Nature', aliases: ['landscape', 'scenery', 'mountains', 'forest', 'nature scene'], order: 60, themePage: true,
    description: 'Landscapes and natural scenery: mountains, forests, fields, skies.',
    taggerGuidance: 'Scenic landscapes and broad nature scenes.' },
  { axis: 'SUBJECT', slug: 'coastal', name: 'Coastal & Nautical', aliases: ['nautical', 'sea', 'beach', 'ocean', 'maritime'], order: 70, themePage: true,
    description: 'Coastal and nautical subjects: the sea, shells, boats, beaches, lighthouses.',
    taggerGuidance: 'Seaside / maritime subjects.' },
  { axis: 'SUBJECT', slug: 'food-drink', name: 'Food & Drink', aliases: ['food', 'drink', 'coffee', 'tea', 'fruit', 'baking subject'], order: 80, themePage: true,
    description: 'Food and drink as a design subject: coffee, tea, fruit, sweet things.',
    taggerGuidance: 'Food/drink depicted as the design subject (not actual recipes).' },
  { axis: 'SUBJECT', slug: 'lettering', name: 'Lettering, Quotes & Monograms', aliases: ['quote', 'quotes', 'typography', 'monogram', 'alphabet', 'words'], order: 90, themePage: true,
    description: 'Words and letters: quotes, sayings, monograms and alphabets.',
    taggerGuidance: 'Text-led designs: quotes, monograms, alphabets, sayings.' },
  { axis: 'SUBJECT', slug: 'people', name: 'People & Folk', aliases: ['portrait', 'figures', 'folk figures'], order: 100, themePage: true,
    description: 'People and figures: portraits, folk figures, fashion.',
    taggerGuidance: 'Human figures and portraits.' },
  { axis: 'SUBJECT', slug: 'home-cosy', name: 'Home & Cosy', aliases: ['home', 'house', 'cosy', 'domestic', 'still life'], order: 110, themePage: true,
    description: 'Home and cosy subjects: houses, interiors, still life, homely scenes.',
    taggerGuidance: 'Houses, interiors, homely still-life subjects.' },
  { axis: 'SUBJECT', slug: 'samplers', name: 'Samplers & Traditional', aliases: ['sampler', 'traditional', 'heritage motif'], order: 120, themePage: true,
    description: 'Traditional samplers and heritage motif designs.',
    taggerGuidance: 'Sampler-format and traditional-motif designs. Common in counted needlework + cross-stitch.' },
]

export const COLLECTION_VOCABULARY: VocabTerm[] = [
  ...SEASON,
  ...OCCASION,
  ...STYLE,
  ...SUBJECT,
]

/** Quick validation: unique slugs, valid parent refs, parent shares axis. */
export function validateVocabulary(terms: VocabTerm[] = COLLECTION_VOCABULARY): string[] {
  const errors: string[] = []
  const bySlug = new Map<string, VocabTerm>()
  for (const t of terms) {
    if (bySlug.has(t.slug)) errors.push(`duplicate slug: ${t.slug}`)
    bySlug.set(t.slug, t)
  }
  for (const t of terms) {
    if (t.parent) {
      const p = bySlug.get(t.parent)
      if (!p) errors.push(`${t.slug}: parent '${t.parent}' not found`)
      else if (p.axis !== t.axis) errors.push(`${t.slug}: parent '${t.parent}' is a different axis`)
    }
  }
  // alias collisions across terms would defeat dedup
  const seenAlias = new Map<string, string>()
  for (const t of terms) {
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
