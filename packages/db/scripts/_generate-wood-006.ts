/**
 * Generator script for wood-natural-craft bulk-006 briefs.
 * Run: tsx scripts/_generate-wood-006.ts
 */
import * as fs from 'fs'
import * as path from 'path'

const BASE = path.join(__dirname, '../../../docs/wood-natural-craft-bulk-006-briefs')
fs.mkdirSync(BASE, { recursive: true })

type TextNode = { type: 'text'; text: string; marks?: Array<{ type: string; attrs?: Record<string, unknown> }> }
type Node = Record<string, unknown>

const t = (text: string): TextNode => ({ type: 'text', text })
const tip = (termSlug: string, text: string): TextNode => ({
  type: 'text', text,
  marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }]
})
const p = (text: string): Node => ({ type: 'paragraph', content: [{ type: 'text', text }] })
const pn = (...nodes: TextNode[]): Node => ({ type: 'paragraph', content: nodes })
const h2 = (text: string): Node => ({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] })
const li = (text: string): Node => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })
const lin = (...nodes: TextNode[]): Node => ({ type: 'listItem', content: [{ type: 'paragraph', content: nodes }] })
const ol = (...items: Node[]): Node => ({ type: 'orderedList', content: items })
const ul = (...items: Node[]): Node => ({ type: 'bulletList', content: items })
const ts = (items: { symptom: string; cause: string; fix: string }[]): Node => ({
  type: 'troubleshooter',
  attrs: { heading: 'What can go wrong', intro: 'Common problems and their fixes.', items }
})

const SAFETY: Node = {
  type: 'infoPanel',
  attrs: { tone: 'default', title: 'Before you start cutting' },
  content: [{
    type: 'bulletList',
    content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Grip: four-finger grip on the work; thumb-push grip on the knife. Never make a cut whose blade-path can reach a body part.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Cut direction: push cuts and thumb-pivot cuts are the default. Pull cuts only with the work braced against the chest and the blade-arc unable to reach anything vital.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sharpening: a dull tool slips. Strop every fifteen minutes of carving, hone weekly, oilstone monthly.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First aid: keep a styptic pencil, gauze, and a clean dressing within reach. A cut that shows fat or will not close with pressure goes to A&E, not a plaster.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Workspace: stable seat, good light, no children or pets within arm-and-blade reach.' }] }] }
    ]
  }]
}

const PYRO_SAFETY: Node = {
  type: 'infoPanel',
  attrs: { tone: 'default', title: 'Before you start burning' },
  content: [{
    type: 'bulletList',
    content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ventilation: open a window minimum, run an extractor fan if possible. Wood smoke is a respiratory irritant; some woods release toxic fumes (yew, oleander, treated lumber). Stick to the allowed-woods list.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Heat: the burner unit stays hot for fifteen minutes after switch-off. Park it on a dedicated metal stand, not a bench surface.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Eye protection: safety glasses when grinding or shaping tips.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Fume sensitivity: stop and ventilate the room if your throat feels scratchy.' }] }] }
    ]
  }]
}

const GREEN_TERMS = [
  { slug: 'green-wood', term: 'Green wood', definition: 'Freshly felled or recently riven timber, still high in moisture. Carves more easily than seasoned wood under hand tools.' },
  { slug: 'billet', term: 'Billet', definition: 'A short length of round or split timber, ready to be worked into a blank for carving.' },
  { slug: 'blank', term: 'Blank', definition: 'The rough-shaped piece of wood from which the finished item is carved.' },
  { slug: 'push-cut', term: 'Push cut', definition: 'The safe default cut: blade travelling away from the body, driven by the forearm, off the end of the workpiece into open air.' },
  { slug: 'thumb-pivot-cut', term: 'Thumb-pivot cut', definition: 'A short controlled cut pivoted by the off-hand thumb on the back of the blade. Used for fine shaping where blade-travel is small.' },
  { slug: 'sloyd-knife', term: 'Sloyd knife', definition: 'A short straight-bladed knife with a stout handle; the Swedish school-craft standard for whittling and spoon-carving.' }
]

function write(filename: string, entry: Record<string, unknown>) {
  fs.writeFileSync(path.join(BASE, filename), JSON.stringify(entry, null, 2), 'utf-8')
  console.log(`Written: ${filename}`)
}

// ─────────────────────────────────────────────
// 01 Spoon-carving: carved-ash-butter-spreader
// ─────────────────────────────────────────────
write('01-carved-ash-butter-spreader.json', {
  slug: 'carved-ash-butter-spreader',
  title: 'Carved ash butter spreader',
  subtitle: 'Green-ash flat spreader for butter and soft cheese',
  excerpt: 'A flat-bladed spreader in green ash. Straight handle, gentle taper to a rounded tip. A first project for new carvers who find a full spoon bowl too steep; the flat blade builds knife-control with push and thumb-pivot cuts alone.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'spoon-carving',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III for the axe-and-knife treen progression. Beeton's Book of Household Management on household treen.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'carving-axe', isOptional: true },
    { slug: 'leather-strop', isOptional: false }, { slug: 'wood-finish-raw-linseed-oil', isOptional: false }
  ],
  glossaryTerms: GREEN_TERMS.filter(t => ['green-wood','billet','push-cut','thumb-pivot-cut','sloyd-knife'].includes(t.slug)),
  techniqueSlugs: ['push-cut-technique', 'thumb-pivot-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A butter spreader is the flattest piece of treen a carver can make. There is no bowl to hollow; the blade is a thin flat lozenge tapering from handle to tip. Ash carves cleanly in '), tip('green-wood', 'green'), t(' condition, dries pale and food-safe, and the straight grain follows cuts with little tendency to tear. A half-evening project for a beginner.')),
    SAFETY,
    h2('The wood'),
    pn(t('A green ash '), tip('billet', 'billet'), t(': 22 cm long, 4 cm across, 2 cm deep. Ash is straight-grained and dries food-safe. Windfall ash is common in the UK; tree-surgeon offcuts are reliable. Sycamore is a direct substitute with a finer, paler grain.')),
    h2('Tools'),
    pn(t('A '), tip('sloyd-knife', 'sloyd knife'), t(' for all the shaping; a carving axe for rough-shaping the blank (optional); a leather strop; raw linseed oil. No hook knife needed.')),
    h2('Method'),
    ol(
      li('Mark the spreader outline on the flat face of the billet: 14 cm of handle narrowing from 2.5 cm at the shoulder to 1.5 cm at the end, then a blade section 8 cm long widening to 3 cm at its widest point, tapering to a rounded tip. Mark the same outline on both flat faces.'),
      li('If using an axe, rough off the waste from the blade taper and the handle profile, working from the shoulder outward toward each end. Leave 5 mm proud of the pencil line.'),
      lin(t('Work the handle to a smooth oval cross-section with '), tip('push-cut', 'push cuts'), t(': blade angled at 30 degrees to the long axis, lifting thin curls. Aim for 12 mm thick and 16 mm wide.')),
      lin(t('Taper the blade section on both faces equally, from 5 mm thick at the shoulder to 2 mm at the tip. Use '), tip('thumb-pivot-cut', 'thumb-pivot cuts'), t(' for the curved shoulder transition.')),
      li('Round the tip with small thumb-pivot cuts on both faces, working toward the end. Check the outline by placing the spreader flat on the bench and sighting from above.'),
      li('Leave to dry on a shelf for 10 days, out of direct sun and away from a heat source.')
    ),
    h2('Finishing'),
    p('Sand through 120 and 180 grit along the grain. Apply raw linseed oil liberally, let it soak in for one hour, wipe off the surplus. The cure time before food contact is 2 weeks.'),
    h2('Variations'),
    ul(
      li('Sycamore or cherry instead of ash: same method. Cherry develops a warmer pink tone with age.'),
      li('Wider blade for soft cheese or pate: widen the blade section to 4 cm, keeping the same taper profile.'),
      li('Left-handed version: the profile is symmetrical, so no adjustment is needed.')
    ),
    h2('Care'),
    p('Rinse under warm water after use, towel-dry immediately. Never dishwasher or long soak. Re-oil when the wood looks dry.'),
    ts([
      { symptom: 'Blade surface tears across the face', cause: 'Cutting against the grain on the wide flat face', fix: 'Read the end-grain before cutting the face. Cut in the direction where the grain lines run down into the surface, not up out of it.' },
      { symptom: 'Blade is thicker at one edge than the other', cause: 'Unequal cut depth across the width', fix: 'Place the blade on the bench and sight along the edge from the handle end. Take a light push cut from the high side.' },
      { symptom: 'Tip breaks off', cause: 'The tip was thinned too much before the blank dried', fix: 'Leave at least 3 mm at the tip during the green-carving stage. Final thinning to 2 mm after drying.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 02 Spoon-carving: carved-cherry-tea-spoon
// ─────────────────────────────────────────────
write('02-carved-cherry-tea-spoon.json', {
  slug: 'carved-cherry-tea-spoon',
  title: 'Carved cherry tea spoon',
  subtitle: 'Small bowl spoon in green cherry for tea and condiments',
  excerpt: 'A short tea spoon carved in green cherry. Shallow oval bowl, straight handle, raw-linseed finish. An entry-level spoon-carving project that introduces the hook knife without the depth demands of a larger eating spoon.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'spoon-carving',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III on treen forms. Beeton's Book of Household Management on household spoon use.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'hook-knife-small', isOptional: false },
    { slug: 'carving-axe', isOptional: true }, { slug: 'leather-strop', isOptional: false },
    { slug: 'wood-finish-raw-linseed-oil', isOptional: false }
  ],
  glossaryTerms: GREEN_TERMS.filter(t => ['green-wood','billet','blank','push-cut','thumb-pivot-cut','sloyd-knife'].includes(t.slug))
    .concat([{ slug: 'hook-knife', term: 'Hook knife', definition: 'A curved-bladed knife for hollowing the bowl of a spoon. Available in small, medium, and large radius variants.' }]),
  techniqueSlugs: ['push-cut-technique', 'thumb-pivot-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A tea spoon is the smallest hollow-bowl spoon worth making: a short shallow oval bowl on a straight handle, 15 cm in all. Cherry is an excellent first spoon wood; it carves cleanly '), tip('green-wood', 'green'), t(', the grain is fine, and the finished surface takes a linseed finish with a warm glow. The hook knife work here is shallow, which makes this a better entry point than a deep eating-spoon bowl.')),
    SAFETY,
    h2('The wood'),
    pn(tip('billet', 'Billet'), t(': 16 cm long, 5 cm wide, 3 cm deep. Cherry from community-orchard prunings or a tree-surgeon offcut. Sycamore or birch are close substitutes. Cherry has a slight tendency to check at the end-grain: seal the end-grain with PVA glue before setting the billet aside if you are not carving the same day.')),
    h2('Tools'),
    pn(t('A '), tip('sloyd-knife', 'sloyd knife'), t(' for the outside shaping; a small '), tip('hook-knife', 'hook knife'), t(' for hollowing the bowl; a carving axe for the rough blank (optional); a leather strop; raw linseed oil.')),
    h2('Method'),
    ol(
      li("Draw the spoon outline on the flat face of the billet: 10 cm handle, 6 cm oval bowl. Mark the bowl on the top face, then mark the side profile showing the drop from the handle level down to the bowl floor (about 8 mm below the handle line). The blank's shape, with waste removed, is a rough spoon in two dimensions."),
      li('Axe or knife the side profile to shape. Work from the bowl shoulder toward the bowl end, then from the bowl shoulder toward the handle end. Leave the handle section square at first; refine it after the bowl is roughed out.'),
      lin(t('Rough out the outside of the bowl with '), tip('push-cut', 'push cuts'), t(', cutting from the rim of the bowl down toward the bottom of the blank. Establish the bowl perimeter first, then remove the waste from the center.')),
      lin(t('Shape the handle to its final oval cross-section, using '), tip('thumb-pivot-cut', 'thumb-pivot cuts'), t(' at the shoulder transition. Aim for 10 mm wide and 7 mm thick at the shoulder, narrowing to 8 mm wide and 5 mm thick at the end.')),
      lin(t('Hollow the bowl with the small hook knife. The hook knife cuts on a pull; brace the spoon '), tip('blank', 'blank'), t(' firmly in the four-finger grip and draw the knife toward you in short arcs. Remove material in thin layers. The finished bowl should be 4 mm deep at the center and 4 mm wall-thickness all round.')),
      li('Smooth the bowl interior with the hook knife tip, working around the perimeter. The goal is an even concave curve with no flat spots. A flat spot catches the tongue when the spoon is in use.'),
      li('Leave to dry for 2 weeks on a shelf before finishing.')
    ),
    h2('Finishing'),
    p('Sand the handle and outside of the bowl through 120 and 180 grit. Leave the inside of the bowl as cut if the surface is clean; a hook-knife-polished bowl reads better than a sanded one. Apply raw linseed oil, cure 2 weeks before food contact.'),
    h2('Variations'),
    ul(
      li('Longer handle for a honey spoon: extend the handle to 14 cm and taper it more toward the end.'),
      li('Left-handed bowl: most tea spoon bowls are symmetrical, but if the bowl curves toward one side, mirror the curve for a left-handed version.')
    ),
    h2('Care'),
    p('Wash under warm running water with a small amount of washing-up liquid. Towel-dry. Never soak and never dishwasher. Re-oil every ten to fifteen washes.'),
    ts([
      { symptom: 'Bowl interior has ridges from the hook knife', cause: 'Cuts taken at different depths in adjacent passes', fix: 'Take overlapping passes in one direction, then cross-cut at 90 degrees. Finish with the hook knife tip working in a tight spiral from the center outward.' },
      { symptom: 'Bowl wall splits as it dries', cause: 'Uneven wall thickness; one section thinner than the others', fix: 'Check wall thickness by pressing lightly on the bowl edge before drying. Thin spots flex noticeably. Correct with the hook knife before setting aside.' },
      { symptom: 'Grain tears on the outside of the bowl', cause: 'Cutting across the grain on the convex surface', fix: 'On a spoon bowl, the grain always runs from the handle toward the bowl tip. Cut from the shoulder of the bowl toward the bowl tip, not from tip toward shoulder.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 03 Spoon-carving: carved-sycamore-soup-spoon
// ─────────────────────────────────────────────
write('03-carved-sycamore-soup-spoon.json', {
  slug: 'carved-sycamore-soup-spoon',
  title: 'Carved sycamore soup spoon',
  subtitle: 'Deep-bowl sycamore soup spoon in green wood',
  excerpt: 'A deep-bowl sycamore soup spoon carved from a riven billet. Rounded bowl, cranked handle, hook-knife hollowing with a medium-radius blade. An intermediate step beyond a tea spoon, introducing the deeper bowl geometry.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'spoon-carving',
  woodState: 'green', difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III on spoon forms and treen. Early-twentieth-century English cookery references on spoon dimensions.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'hook-knife-medium', isOptional: false },
    { slug: 'carving-axe', isOptional: false }, { slug: 'leather-strop', isOptional: false },
    { slug: 'wood-finish-raw-linseed-oil', isOptional: false }
  ],
  glossaryTerms: GREEN_TERMS.filter(t => ['green-wood','billet','blank','push-cut','thumb-pivot-cut','sloyd-knife'].includes(t.slug))
    .concat([
      { slug: 'hook-knife', term: 'Hook knife', definition: 'A curved-bladed knife for hollowing the bowl of a spoon. The medium variant handles everyday eating spoons and soup spoons.' },
      { slug: 'riven', term: 'Riven', definition: 'Split along the grain with a froe and maul, rather than sawn across the grain. Riven blanks follow the grain perfectly.' }
    ]),
  techniqueSlugs: ['push-cut-technique', 'thumb-pivot-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A soup spoon has a deeper bowl than an eating spoon and a longer crank in the handle that lifts the bowl above the table when the spoon rests. The crank is the defining challenge: carving a smooth curve where the handle meets the bowl without breaking through the neck. Sycamore is the standard treen wood for this project: carves cleanly '), tip('green-wood', 'green'), t(', dries food-safe pale, and the fine grain makes the bowl interior easy to smooth with the hook knife.')),
    SAFETY,
    h2('The wood'),
    pn(tip('riven', 'Riven'), t(' sycamore '), tip('billet', 'billet'), t(': 28 cm long, 7 cm wide, 5 cm deep. The billet needs to be deeper than an eating-spoon billet to allow for the crank. Riven follows the grain; sawn billets can crack along the neck of the crank as the wood dries. Birch is a substitute with a slightly softer grain.')),
    h2('Tools'),
    pn(t('A carving axe for the rough blank; a '), tip('sloyd-knife', 'sloyd knife'), t(' for the outside shaping; a medium '), tip('hook-knife', 'hook knife'), t(' for hollowing; a leather strop; raw linseed oil.')),
    h2('Method'),
    ol(
      li("Draw the soup-spoon outline on the flat face of the billet. Handle: 18 cm long, 15 mm wide at the shoulder, 12 mm wide at the end. Bowl: 9 cm long, 7 cm wide at the widest point. The crank: a gentle 15-degree drop from the handle plane to the bowl floor, with the transition at the shoulder of the bowl. Mark the side profile too."),
      li('Axe the rough blank to within 5 mm of the profile lines on all faces. Work the side profile first to establish the crank, then the top-face outline.'),
      lin(t('Refine the handle with '), tip('push-cut', 'push cuts'), t(': blade along the handle at 30 degrees, lifting thin curls. Work the crank transition with '), tip('thumb-pivot-cut', 'thumb-pivot cuts'), t(', working from the crank upward toward the handle and from the crank downward toward the bowl shoulder.')),
      lin(t('Shape the outside of the bowl. The bowl exterior is a convex curve in both planes; push cuts from the bowl shoulder toward the bowl tip keep the cuts running with the grain. Check the neck thickness at the crank: no less than 8 mm of solid wood between the bowl back and the crank top of the handle. Thin necks break at the '), tip('blank', 'blank'), t(' stage or during drying.')),
      li('Hollow the bowl with the medium hook knife. Begin at the center and work outward in overlapping arcs. The bowl depth is 10 mm at the deepest point; the wall thickness is 5 mm all round. The deeper bowl requires more passes than a tea spoon; work slowly and check the wall thickness by pressing the bowl edge gently between thumb and finger.'),
      li("Smooth the bowl interior with the hook knife tip. Work in a tight spiral from the center outward, then along the bowl's long axis from tip to shoulder. The surface should be an even concave curve with no ridges."),
      li('Leave to dry on a shelf for 3 weeks before finishing. The deeper blank holds more moisture than a tea spoon.')
    ),
    h2('Finishing'),
    p('Sand the handle and bowl exterior through 120 and 180 grit. Leave the bowl interior as cut if the finish is clean. Apply raw linseed oil, cure 2 weeks before food contact.'),
    h2('Variations'),
    ul(
      li('Birch instead of sycamore: slightly softer, very pale. Birch end-grain seals more readily.'),
      li('Left-handed version: mirror the crank angle and the bowl tilt for a left-handed user. The bowl shape itself is symmetrical.'),
      li('Shallower bowl for broth: reduce the bowl depth to 7 mm for a flat soup plate serving shape.')
    ),
    h2('Care'),
    p('Rinse under warm water after use, towel-dry. Never dishwasher. Re-oil every ten to fifteen uses. The neck of the crank is the vulnerable point; check for surface cracks every few months and re-oil promptly if the wood looks dry at the crank.'),
    ts([
      { symptom: 'Crank neck cracks during drying', cause: 'Neck left too thin during rough shaping, or drying too fast', fix: 'Keep the crank neck at least 8 mm thick. Dry in a cool shaded place, not near a radiator. Sealing the end-grain helps.' },
      { symptom: 'Hook knife skates off the bowl surface', cause: 'Edge not sharp enough, or cutting toward the bowl rim instead of away', fix: 'Strop the hook knife. Cut from the bowl center outward toward the rim, not from rim inward.' },
      { symptom: 'Bowl wall is uneven in thickness', cause: 'Passes taken at different depths in adjacent sections', fix: 'Work methodically in overlapping arcs. After each complete circuit, check the wall by pressing the rim between finger and thumb. The wall should flex equally all round.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 04 Spoon-carving: carved-beech-porridge-spurtle
// ─────────────────────────────────────────────
write('04-carved-beech-porridge-spurtle.json', {
  slug: 'carved-beech-porridge-spurtle',
  title: 'Carved beech porridge spurtle',
  subtitle: 'Scottish porridge stirrer in green beech, straight and tapered',
  excerpt: 'A traditional Scottish porridge spurtle in green beech. Straight tapered rod, blunt tip, simple handle. A beginner project that introduces the push cut on round cross-sections without the complexity of a bowl.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'spoon-carving',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Beeton's Book of Household Management on Scottish kitchen treen. Cassell's Cyclopaedia of Mechanics vol. III on round treen forms.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'leather-strop', isOptional: false },
    { slug: 'wood-finish-raw-linseed-oil', isOptional: false }
  ],
  glossaryTerms: GREEN_TERMS.filter(t => ['green-wood','billet','push-cut','thumb-pivot-cut','sloyd-knife'].includes(t.slug)),
  techniqueSlugs: ['push-cut-technique', 'thumb-pivot-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A spurtle is the Scottish porridge stirrer: a straight tapered rod, 30 to 35 cm long, used to keep porridge moving as it cooks so that it does not catch on the pan base. The traditional shape is a thistle head at the top and a blunt taper at the working end. This project uses a simpler form: a straight taper with a small shoulder at the handle end, entirely cut with '), tip('push-cut', 'push cuts'), t(' on the round cross-section. Beech carves cleanly in '), tip('green-wood', 'green'), t(' condition and dries food-safe.')),
    SAFETY,
    h2('The wood'),
    pn(tip('billet', 'Billet'), t(': 35 cm long, 4 cm diameter round or 4 by 4 cm square section. Green beech from windfall or coppice off-cut. Ash is a good substitute; sycamore is softer and slightly easier for a first attempt.')),
    h2('Tools'),
    pn(t('A '), tip('sloyd-knife', 'sloyd-knife'), t(' only; a leather strop; raw linseed oil. No axe needed for a round billet.')),
    h2('Method'),
    ol(
      li('If starting from a square billet, take push cuts off the corners along the full length to create a rough octagon in cross-section. Strop after every 10 minutes.'),
      lin(t('Work the octagon to a circle with '), tip('push-cut', 'push cuts'), t(' along the length. Blade at 30 degrees to the long axis, lifting thin shavings off each flat. After a complete circuit, the cross-section should be 16-sided. Another circuit brings it toward round. Check by rolling the spurtle on a flat surface; a round rod rolls smoothly.')),
      li('Set the taper: work the working end (the bottom 20 cm) from 3 cm diameter at the mid-shaft down to 1.5 cm at the blunt tip, using push cuts along the taper. The handle end stays full diameter.'),
      lin(t('Form the shoulder at the handle end with a '), tip('thumb-pivot-cut', 'stop cut'), t(' followed by push cuts from the handle end down to the shoulder. The shoulder is a gentle 5 mm step that gives the hand something to register against during stirring.')),
      li('Check the round cross-section by rolling on a flat surface and by sighting along the length for any bow. Correct with light push cuts on the high side.'),
      li('Leave to dry for 10 days on a shelf before finishing.')
    ),
    h2('Finishing'),
    p('Sand through 120 and 180 grit along the grain. Apply raw linseed oil, let it soak in for one hour, wipe off the surplus. Cure time before food contact is 2 weeks.'),
    h2('Variations'),
    ul(
      li('Thistle-head spurtle: carve a small carved thistle or ball at the handle end in place of the simple shoulder. Intermediate level; adds an hour of thumb-pivot carving.'),
      li('Ash instead of beech: slightly coarser grain but very strong. Good if the billet is from a larger branch.'),
      li('Shorter stirrer for a small saucepan: reduce the length to 25 cm. Keep the same taper ratio.')
    ),
    h2('Care'),
    p('Rinse under warm running water after use, towel-dry immediately. The working end goes into hot porridge; the linseed finish holds up well to this. Re-oil monthly when in daily use.'),
    ts([
      { symptom: 'Spurtle bows to one side as it dries', cause: 'Uneven wall thickness on one side of the round cross-section', fix: 'Check the round cross-section before setting aside. Roll the spurtle on the bench; a bow shows as a wobble. Correct with light push cuts on the thick side.' },
      { symptom: 'Surface feels rough after sanding', cause: 'Sanding across the grain lifted the fibres on the round cross-section', fix: 'Sand along the grain only. Hold the sandpaper flat to one facet at a time, angled along the long axis.' },
      { symptom: 'Cuts tear near the shoulder', cause: 'Cutting into rising grain at the shoulder transition', fix: 'Cut from the shoulder downward toward the working end, not from the working end up toward the shoulder.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 05 Spoon-carving: carved-birch-serving-fork-long
// ─────────────────────────────────────────────
write('05-carved-birch-serving-fork-long.json', {
  slug: 'carved-birch-serving-fork-long',
  title: 'Carved birch serving fork',
  subtitle: 'Long two-tine serving fork in green birch',
  excerpt: 'A long two-tine serving fork in green birch. Two carved tines and a straight handle, 28 cm in all. An intermediate project introducing the stop cut for tine separation and the slicing cut for the tine tips.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'spoon-carving',
  woodState: 'green', difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III on two-tine fork forms. Beaton's Book of Household Management on kitchen fork use.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'carving-axe', isOptional: true },
    { slug: 'leather-strop', isOptional: false }, { slug: 'wood-finish-raw-linseed-oil', isOptional: false }
  ],
  glossaryTerms: GREEN_TERMS.filter(t => ['green-wood','billet','blank','push-cut','thumb-pivot-cut','sloyd-knife'].includes(t.slug))
    .concat([
      { slug: 'stop-cut', term: 'Stop cut', definition: 'A short vertical cut into the wood that stops the next push or pull cut, preventing the grain from tearing past the intended end-point.' },
      { slug: 'slicing-cut', term: 'Slicing cut', definition: 'Knife edge drawn through the wood at an angle rather than pushed straight in. Used on tough end-grain to reduce resistance.' }
    ]),
  techniqueSlugs: ['push-cut-technique', 'thumb-pivot-cut-technique', 'stop-cut-technique'],
  criticalTechniques: ['push-cut-technique', 'stop-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A serving fork is used at the table for lifting roasted meat, presenting a fish fillet, or holding a joint while carving. The two tines must be even in thickness and length or the fork tips the piece it lifts. Birch carves cleanly '), tip('green-wood', 'green'), t(' and has fine, even grain that makes the narrow tine sections predictable to work. This is an intermediate project because the tine separation requires precise '), tip('stop-cut', 'stop cuts'), t(' to prevent the grain tearing into the tine base.')),
    SAFETY,
    h2('The wood'),
    pn(tip('billet', 'Billet'), t(': 29 cm long, 5 cm wide, 3 cm deep. Birch from windfall or coppice. Cherry is a good substitute. The billet must have straight grain along its length; twisted grain makes matched tines impossible.')),
    h2('Tools'),
    pn(t('A '), tip('sloyd-knife', 'sloyd knife'), t('; a carving axe for rough-shaping the handle (optional); a leather strop; raw linseed oil.')),
    h2('Method'),
    ol(
      li('Mark the fork outline on the flat face: 18 cm of handle tapering from 2 cm wide to 1.5 cm wide; then 11 cm of tine section. Mark the tine split: a 7 mm gap between the two tines, centered on the long axis of the billet. Each tine is 11 mm wide. Draw the outline on both flat faces and on the side face.'),
      lin(t('If using an axe, rough the '), tip('blank', 'blank'), t(' handle profile only. Work from the tine-shoulder toward the handle end. Never axe near the tine section.')),
      lin(t('Work the handle to its final oval cross-section with '), tip('thumb-pivot-cut', 'thumb-pivot cuts'), t(' at the shoulder and push cuts along the shaft. Then move to the tine section. First establish the outer edges of both tines with '), tip('push-cut', 'push cuts'), t(' running along each tine from shoulder to tip.')),
      lin(t('Cut the gap between the tines. Place a '), tip('stop-cut', 'stop cut'), t(' across the grain at the top of the gap (the tine shoulder line). Then make a push cut along the grain from the tip of the gap toward the stop cut, removing the waste in the gap. Work from both sides in alternating passes, deepening the gap 2 mm at a time until the full depth is reached.')),
      lin(t('Taper each tine from 8 mm square at the shoulder down to 4 mm square at the tip, then finish the tip to a rounded point with '), tip('slicing-cut', 'slicing cuts'), t(' at end-grain.')),
      li('Check that both tines are the same length and the same diameter at each measurement point. A slight asymmetry is hard to see at the bench but obvious when using the fork.'),
      li('Leave to dry on a shelf for 3 weeks before finishing. The tines are the thinnest part and most prone to checking.')
    ),
    h2('Finishing'),
    p('Sand the handle through 120 and 180 grit along the grain. Sand each tine along its length to 180 grit. Apply raw linseed oil; cure 2 weeks before food contact.'),
    h2('Variations'),
    ul(
      li('Three-tine version: add a third tine in the center. The gap calculation changes: two 5 mm gaps, three 9 mm tines.'),
      li('Left-handed version: the fork is symmetrical; no adjustment needed.'),
      li('Sycamore instead of birch: slightly coarser grain but more common as windfall.')
    ),
    h2('Care'),
    p('Wash under warm water after use, towel-dry. Never dishwasher. Re-oil after every ten uses. Inspect the tine bases for cracks at each re-oil.'),
    ts([
      { symptom: 'Tine breaks at the base during carving', cause: 'Stop cut not deep enough before cutting the gap; grain tore past the stop line', fix: 'Cut the stop cut across the full width before any gap removal. The stop cut must be at least 5 mm deep before gap removal begins.' },
      { symptom: 'Tines are unequal in length', cause: 'Tip shaping done freehand without measuring', fix: 'Mark the final tine length with a pencil line before tip-shaping. Work to the line.' },
      { symptom: 'Tines check (split) during drying', cause: 'Drying too fast for the wall thickness of the tines', fix: 'Seal the end-grain of the tines with PVA glue before setting aside. Dry in a cool shaded place.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 06 Spoon-carving: carved-walnut-condiment-spoon
// ─────────────────────────────────────────────
write('06-carved-walnut-condiment-spoon.json', {
  slug: 'carved-walnut-condiment-spoon',
  title: 'Carved walnut condiment spoon',
  subtitle: 'Small seasoned-walnut spoon for salt, spice, and loose-leaf tea',
  excerpt: 'A small condiment spoon in seasoned walnut. Oval bowl, short handle, boarded-butter finish. Walnut carves well from seasoned stock for small treen; the iron-stain note and allergen declaration are part of the project.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'spoon-carving',
  woodState: 'seasoned', difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III on seasoned treen. Beeton's Book of Household Management on condiment-spoon forms.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'hook-knife-small', isOptional: false },
    { slug: 'leather-strop', isOptional: false }, { slug: 'wood-finish-board-butter', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Air-dried or kiln-dried timber at a stable moisture content (8 to 12 percent for indoor pieces). Harder to carve than green wood but dimensionally stable.' },
    { slug: 'blank', term: 'Blank', definition: 'The rough-shaped piece of wood from which the finished item is carved.' },
    { slug: 'push-cut', term: 'Push cut', definition: 'The safe default cut: blade travelling away from the body, driven by the forearm, off the end of the workpiece into open air.' },
    { slug: 'thumb-pivot-cut', term: 'Thumb-pivot cut', definition: 'A short controlled cut pivoted by the off-hand thumb on the back of the blade. Used for fine shaping where blade-travel is small.' },
    { slug: 'sloyd-knife', term: 'Sloyd knife', definition: 'A short straight-bladed knife with a stout handle; the Swedish school-craft standard for whittling and spoon-carving.' },
    { slug: 'hook-knife', term: 'Hook knife', definition: 'A curved-bladed knife for hollowing the bowl of a spoon. The small variant suits tea and condiment spoon bowls.' }
  ],
  techniqueSlugs: ['push-cut-technique', 'thumb-pivot-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A condiment spoon is 12 to 14 cm long with a small oval bowl. It serves loose-leaf tea, flaky salt, or ground spices. Walnut is a good choice for small '), tip('seasoned-wood', 'seasoned'), t(' treen: the grain is fine, the chocolate-brown tone suits a kitchen display, and the finished surface is very smooth under the hook knife. Two notes before starting: walnut reacts with iron tools, producing a black stain at the cut surface. Wipe the tool with citric acid solution or vinegar if the surface discolours. And walnut is a tree-nut allergen; declare this clearly if the spoon is a gift.')),
    SAFETY,
    h2('The wood'),
    pn(tip('blank', 'Blank'), t(': 14 cm long, 4 cm wide, 2.5 cm deep in seasoned walnut. A short off-cut from a furniture board is enough. The moisture content should be below 12 percent. Moisture meter check: probe the end-grain after an hour in the workshop; a reading above 14 percent means the piece needs more drying before carving.')),
    h2('Tools'),
    pn(t('A '), tip('sloyd-knife', 'sloyd knife'), t('; a small '), tip('hook-knife', 'hook knife'), t('; a leather strop; board butter. No axe for a small seasoned blank.')),
    h2('Method'),
    ol(
      li("Draw the spoon outline: 8 cm handle tapering from 18 mm to 12 mm; 6 cm oval bowl 30 mm wide at the widest point. Mark both faces."),
      lin(t('Shape the handle with '), tip('push-cut', 'push cuts'), t('. Seasoned walnut is harder than green sycamore; the cuts require more forearm pressure. Keep the edge sharp and strop after every 8 to 10 minutes of work.')),
      lin(t('Shape the outside of the bowl. The bowl exterior is a convex curve; push cuts from the bowl shoulder toward the bowl tip. Use '), tip('thumb-pivot-cut', 'thumb-pivot cuts'), t(' at the shoulder transition where the handle meets the bowl.')),
      lin(t('Hollow the bowl with the small hook knife. Work from the center outward in overlapping arcs. Target: 5 mm deep, 3 mm wall thickness. Seasoned walnut resists the hook knife more than green wood; take thinner passes and strop the '), tip('hook-knife', 'hook knife'), t(' more frequently.')),
      li('Leave the bowl interior as cut if the surface is clean. Smooth the handle and outside of the bowl through 120 and 180 grit sandpaper along the grain.')
    ),
    h2('Finishing'),
    p('Board butter is the correct finish for this spoon: a beeswax-and-mineral-oil paste that conditions the surface without curing. Apply with a soft cloth, let stand for twenty minutes, buff off. Re-apply monthly when the spoon is in daily use.'),
    h2('Allergen note'),
    p('Walnut is a tree nut. A walnut-carved condiment spoon will deposit trace walnut allergens into any food it touches. Label clearly if making for someone with a nut allergy; for that use case, substitute sycamore or birch.'),
    h2('Variations'),
    ul(
      li('Sycamore instead of walnut: food-safe, pale, no allergen issue. The grain is finer and easier to smooth with the hook knife.'),
      li('Longer handle for a tea caddy: extend the handle to 12 cm. Proportionally heavier.'),
      li('Left-handed bowl: the bowl taper is symmetrical; no change needed.')
    ),
    h2('Care'),
    p('Rinse under warm water after use, towel-dry immediately. Never dishwasher. The board-butter finish re-conditions on contact with water then oil; re-buff with fresh board butter monthly.'),
    ts([
      { symptom: 'Black stain on the cut surface', cause: 'Walnut reacting with iron in the tool steel', fix: 'Wipe the blade and the cut surface with citric acid solution (half a teaspoon in a cup of water) or white vinegar. The stain lifts from the surface; deeper staining from old dull tools goes deeper into the grain.' },
      { symptom: 'Hook knife skates on the seasoned walnut surface', cause: 'Edge not sharp enough for hard seasoned wood', fix: 'Strop the hook knife before each session with seasoned hardwood. A strop that maintains a green-wood hook knife needs two extra passes per side for hard seasoned stock.' },
      { symptom: 'Bowl interior has a rough texture', cause: 'The grain direction in the bowl reversed mid-bowl', fix: 'Work the bowl in two halves: from the bowl center toward the shoulder (against the taper) and from the center toward the tip (with the taper). The grain direction reverses at the center of the bowl floor.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 07 Spoon-carving: reading grain when hollowing
// ─────────────────────────────────────────────
write('07-reading-grain-in-a-spoon-bowl.json', {
  slug: 'reading-grain-in-a-spoon-bowl',
  title: 'Reading grain in a spoon bowl',
  subtitle: 'How to understand and follow grain direction when hollowing',
  excerpt: 'A short reading on the single most common cause of tearing and catches in spoon-bowl hollowing: cutting against the grain. Covers how to read the grain from the end-grain and the side profile, and how to adjust the cut direction.',
  type: 'READING', categorySlug: 'wood-natural-craft', subCategorySlug: 'spoon-carving',
  difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III on grain reading in hand-tool woodwork. Newey and Drage Practical Carpentry on grain direction.",
  glossaryTerms: [
    { slug: 'grain', term: 'Grain', definition: 'The direction of the wood fibres along the length of the tree. Cutting with the grain produces a smooth surface; cutting against it lifts and tears.' },
    { slug: 'end-grain', term: 'End-grain', definition: 'The cross-section of the wood exposed when a piece is cut across the grain. The rings and rays are visible from the end-grain.' },
    { slug: 'interlocked-grain', term: 'Interlocked grain', definition: 'Grain that spirals in alternating directions along the tree trunk. The grain direction reverses every few centimetres of height; a cause of unexpected tearing.' },
    { slug: 'hook-knife', term: 'Hook knife', definition: 'A curved-bladed knife for hollowing the bowl of a spoon. The cut direction must follow the grain to avoid tearing.' }
  ],
  body: { type: 'doc', content: [
    pn(t('More spoon-bowl tearing comes from wrong '), tip('grain', 'grain'), t(' direction than from a dull edge. A new carver who has stropped the '), tip('hook-knife', 'hook knife'), t(', slowed down, and still gets a rough torn surface is almost always cutting against the grain. This reading covers how to read it before cutting.')),
    h2('What grain is'),
    p('Wood fibres grow along the length of the tree. In straight-grained species (ash, sycamore, birch) the fibres run nearly parallel to the trunk. In some species (elm, cherry in some harvests) the fibres spiral or alternate direction. Cutting with the grain produces a smooth surface. Cutting against it lifts the fibres ahead of the edge, leaving a torn surface and a catching sensation at the blade.'),
    h2('Reading grain from the end-grain'),
    pn(t('Look at the '), tip('end-grain', 'end-grain'), t(' of the billet before carving begins. The annual rings are a guide to the fibre orientation. In a straight-grained billet, the rings curve gently from one face to the other. The fibres run parallel to the face where the rings are flattest. In a riven billet, the fibres should run perfectly along the length; a riven blank has no cross-grain at all.')),
    h2('Reading grain from the side profile'),
    p('Hold the billet at eye level with the handle end pointing away from you. Look at the long face. The grain lines (the darker stripes in the wood) should run parallel to the billet length for most of the surface. If they run at an angle, they will exit the surface on one face. The rule is: cut in the direction where the grain lines run down into the surface, not up out of it. If the grain exits the surface toward the bowl tip, cut from the bowl shoulder toward the bowl tip. If the grain exits toward the shoulder, cut from the tip toward the shoulder.'),
    h2('The reversal point'),
    pn(t('In a curved spoon bowl, the grain often reverses at the center of the bowl floor. One end of the bowl is cut with the grain in one direction; the other end requires the opposite direction. This is not '), tip('interlocked-grain', 'interlocked grain'), t('; it is a geometric consequence of the bowl curvature. Work each half of the bowl from the center outward, reversing direction at the midpoint. If a cut begins to tear, reverse.')),
    h2('Worked example'),
    p('A sycamore eating spoon with the grain running straight along the handle. At the bowl, the grain lines on the top face angle very slightly toward the bowl tip. This means the grain exits the surface at the bowl shoulder end. The correct cut direction is from the bowl shoulder toward the bowl tip. The grain runs downhill toward the tip; the hook knife follows it.'),
    h2('When to stop and strop'),
    p('A dull hook knife produces a torn surface even when cutting perfectly with the grain. If the cut feels like scraping rather than slicing, strop before reading the grain again. The two problems compound: a dull edge torn-cutting slightly against the grain looks identical to a sharp edge cutting hard against it.')
  ]}
})

// ─────────────────────────────────────────────
// 08 Spoon-carving: caring for carved spoons
// ─────────────────────────────────────────────
write('08-caring-for-carved-wooden-spoons.json', {
  slug: 'caring-for-carved-wooden-spoons',
  title: 'Caring for carved wooden spoons',
  subtitle: 'How to wash, re-oil, and repair spoons in daily use',
  excerpt: 'A short reading on the daily and seasonal care of carved and oiled wooden spoons. Covers washing practice, re-oiling cadence, small repairs, and the signs that a spoon has reached the end of its useful life.',
  type: 'READING', categorySlug: 'wood-natural-craft', subCategorySlug: 'spoon-carving',
  difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Beeton's Book of Household Management on the care of kitchen woodware. Cassell's Cyclopaedia of Mechanics on wood-finish maintenance.",
  glossaryTerms: [
    { slug: 'raw-linseed-oil', term: 'Raw linseed oil', definition: 'Food-safe drying oil that polymerises in the wood and forms a protective layer. The traditional treen finish.' },
    { slug: 'board-butter', term: 'Board butter', definition: 'A beeswax-and-mineral-oil paste that conditions wood surfaces. Not a curing finish; re-applied regularly.' },
    { slug: 'checking', term: 'Checking', definition: 'Fine cracks that open in wood as it dries unevenly or absorbs moisture unevenly. Surface checking in the bowl of a spoon is repairable.' }
  ],
  body: { type: 'doc', content: [
    p("Carved wooden spoons last for decades if they are washed, dried, and re-oiled correctly. Most damage to kitchen treen is from three sources: soaking in water, going through a dishwasher, and being stored wet. None of these is hard to avoid."),
    h2('Washing'),
    p('Rinse the spoon under warm running water after each use. A small amount of washing-up liquid is fine; the concern about soap is overstated so long as the spoon is rinsed and dried promptly. Towel-dry immediately after rinsing. Never leave a wooden spoon submerged in washing-up water or in a drying rack with the handle end sitting in water. Never put a wooden spoon in a dishwasher.'),
    h2('Re-oiling cadence'),
    pn(t('A raw-linseed-oiled spoon used daily needs re-oiling every two to four weeks. A spoon in occasional use needs re-oiling every two months. The test: rub a finger along the bowl interior. If the wood feels rough or looks dry and pale, it needs '), tip('raw-linseed-oil', 'raw linseed oil'), t('. If it feels smooth and slightly tacky, the oil is still active. Re-oil with a small cloth, let stand for twenty minutes, wipe off the surplus. One coat is enough in maintenance; the wood absorbs only what it needs.')),
    h2('Board-butter maintenance'),
    pn(t('For spoons finished in '), tip('board-butter', 'board butter'), t(', re-apply monthly. Board butter does not cure; it is a barrier conditioner. More frequent re-application is not harmful. Apply a thin coat, let stand twenty minutes, buff off with a clean cloth.')),
    h2('Surface checking'),
    pn(t(''), tip('checking', 'Checking'), t(' in the bowl of a spoon: fine cracks usually 2 to 5 mm long, running along the grain in the bowl interior. These form when the bowl dries faster than the rest of the spoon, usually after soaking. Small checks are cosmetic; they do not weaken the spoon. Treat with a generous application of raw linseed oil, let it soak in for 2 hours, wipe off. The oil swells the fibres and partially closes the check. Deep checks that penetrate the bowl wall are grounds for retiring the spoon from food contact.')),
    h2('Grain raise after wetting'),
    p('A spoon that has been soaked or washed with too much water will develop a rough grain-raised surface. Sand through 180 grit along the grain, then 240 grit, then re-oil. The surface returns to smooth.'),
    h2('End of life'),
    p('A well-made carved spoon does not have a planned-obsolescence end date. Signs that a spoon has truly reached the end of its food-contact use: a crack through the bowl wall that does not close with oiling; a handle break at the neck of a cranked spoon that has been glued and re-glued; a bowl that has worn so thin the bowl wall flexes visibly when pressed. Worn-thin spoons become wall decorations. Cracked-bowl spoons go to the compost.')
  ]}
})

// ─────────────────────────────────────────────
// 09 Whittling: whittled-lime-toggle
// ─────────────────────────────────────────────
write('09-whittled-lime-toggle.json', {
  slug: 'whittled-lime-toggle',
  title: 'Whittled lime toggle',
  subtitle: 'Small oval wooden toggle or button for bags and cord closures',
  excerpt: 'A small oval wooden toggle in seasoned lime, 4 cm long with two through-holes for cord attachment. A very short beginner project that uses only the push cut and thumb-pivot cut on a small symmetrical form.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'whittling',
  woodState: 'seasoned', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III on small treen fittings. Newey and Drage Practical Carpentry on small turned and carved wooden fittings.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'leather-strop', isOptional: false },
    { slug: 'brace-and-bit', isOptional: false }, { slug: 'wood-finish-raw-linseed-oil', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Air-dried or kiln-dried timber at a stable moisture content. Dimensionally stable once at equilibrium with the room.' },
    { slug: 'push-cut', term: 'Push cut', definition: 'The safe default cut: blade travelling away from the body, driven by the forearm, off the end of the workpiece into open air.' },
    { slug: 'thumb-pivot-cut', term: 'Thumb-pivot cut', definition: 'A short controlled cut pivoted by the off-hand thumb on the back of the blade. Used for fine shaping where blade-travel is small.' },
    { slug: 'sloyd-knife', term: 'Sloyd knife', definition: 'A short straight-bladed knife with a stout handle; the Swedish school-craft standard.' }
  ],
  techniqueSlugs: ['push-cut-technique', 'thumb-pivot-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A toggle is a short tapered cylinder or oval with two holes bored through it for cord attachment. It closes a bag, secures a duvet cover, or replaces a lost button. Making one from a short off-cut of '), tip('seasoned-wood', 'seasoned'), t(' lime takes twenty minutes and uses the push cut only. Lime is the softest hardwood in the UK native canon; it is the preferred relief-carving wood for exactly this reason. The grain is fine and even, and the surface takes a knife smoothly from any direction.')),
    SAFETY,
    h2('The wood'),
    p('A seasoned lime off-cut: 5 cm long, 2.5 cm wide, 1.5 cm deep. The finished toggle is 4 cm long and 2 cm wide; the extra length and width provides grip during shaping. Beech is a good substitute, slightly harder. Sycamore works well.'),
    h2('Tools'),
    pn(t('A '), tip('sloyd-knife', 'sloyd knife'), t('; a brace and bit for the cord holes (use a 6 mm bit); a leather strop; a small amount of raw linseed oil.')),
    h2('Method'),
    ol(
      li('Mark the oval outline on the flat face of the blank: 4 cm long, 2 cm wide, with an even rounded taper at each end.'),
      lin(t('Carve the profile to the outline with '), tip('push-cut', 'push cuts'), t('. Work the taper at each end with '), tip('thumb-pivot-cut', 'thumb-pivot cuts'), t('. The cross-section is a rounded oblong: 15 mm wide, 10 mm thick at the center, tapering to 8 mm at each end.')),
      li('Smooth the surface by working around the perimeter with light push cuts, each overlapping the last by half. The surface should be even enough that no facets catch light.'),
      li('Mark the two cord holes 1 cm from each end, centered on the width. Bore with the brace and bit. Hold the blank in a vise or clamp it between bench dogs before boring; the blank is too small to hold in the hand while boring through.'),
      li('Clean the hole edges with a light push cut around each hole opening.')
    ),
    h2('Finishing'),
    p('Sand through 180 and 240 grit. Apply raw linseed oil; wipe off the surplus after fifteen minutes. The toggle is not food-contact; cure time is not critical, but let it dry for 2 days before attaching to cord.'),
    h2('Variations'),
    ul(
      li('Longer toggle for a heavier bag: 5 cm long, 2.5 cm wide. Use a 8 mm cord hole.'),
      li('Chip-carved decorative panel: add a small chip-carved triangle or diamond on the flat face before boring the holes.'),
      li('Left-handed version: the toggle is symmetrical; no adjustment needed.')
    ),
    h2('Care'),
    p('A toggle on daily outdoor use benefits from re-oiling every 6 months. Wipe with a little raw linseed, let dry for a day.'),
    ts([
      { symptom: 'Cord hole splits the wood at the end', cause: 'Hole bored too close to the end-grain', fix: 'The hole center must be at least 8 mm from the end. Move the hole inward by 2 mm if the blank shows any sign of splitting toward the end.' },
      { symptom: 'Surface is uneven after carving', cause: 'Push cuts taken at different depths across adjacent facets', fix: 'Work around the full perimeter before checking the surface. A single pass around makes a 16-sided polygon; two passes makes near-round.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 10 Whittling: whittled-hazel-spatula
// ─────────────────────────────────────────────
write('10-whittled-hazel-spatula.json', {
  slug: 'whittled-hazel-spatula',
  title: 'Whittled hazel spatula',
  subtitle: 'Long flat spatula in green hazel for cooking and baking',
  excerpt: 'A long flat cooking spatula in green hazel. Flat blade, straight handle, rounded tip. A beginner project that builds push-cut control on the thin flat blade section without the complexity of a bowl.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'whittling',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Beeton's Book of Household Management on kitchen spatula forms. Cassell's Cyclopaedia of Mechanics vol. III on kitchen treen.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'leather-strop', isOptional: false },
    { slug: 'wood-finish-raw-linseed-oil', isOptional: false }
  ],
  glossaryTerms: GREEN_TERMS.filter(t => ['green-wood','billet','push-cut','thumb-pivot-cut','sloyd-knife'].includes(t.slug)),
  techniqueSlugs: ['push-cut-technique', 'thumb-pivot-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A cooking spatula is a flat-bladed scraping and flipping tool. The hazel version is 28 cm long with a 10 cm blade and an 18 cm handle. Hazel carves cleanly '), tip('green-wood', 'green'), t(' and has a smooth fine grain on the flat face; the push cut follows the grain well and produces a clean surface with minimal tearing. Hazel is a coppice species; the billets come from poles cut at 3 to 5 years in the coppice cycle, with even straight grain along the full length.')),
    SAFETY,
    h2('The wood'),
    pn(tip('billet', 'Billet'), t(': 29 cm long, 4 cm wide, 2 cm deep. A straight hazel pole, the bark stripped. Windfall hazel from hedgerows or coppice off-cuts are the usual source. Sycamore or ash are direct substitutes.')),
    h2('Tools'),
    pn(t('A '), tip('sloyd-knife', 'sloyd knife'), t('; a leather strop; raw linseed oil. No axe needed for a flat spatula from a straight pole.')),
    h2('Method'),
    ol(
      li('Mark the spatula outline on the flat face: 18 cm handle narrowing from 2 cm at the shoulder to 1.5 cm at the end; 10 cm blade widening from 2 cm at the shoulder to 3 cm at the widest point, then rounding to a smooth broad tip. Mark the side profile too: handle and blade are on the same plane (this is a flat spatula, not a cranked one).'),
      lin(t('Work the handle with '), tip('push-cut', 'push cuts'), t(' to its final rectangular cross-section: 15 mm wide, 8 mm thick. Then move to the blade section.')),
      li('Thin the blade on both faces to 3 mm at the center and 1.5 mm at the tip. Work symmetrically: one push cut on the top face at the shoulder, then a matching push cut on the bottom face at the shoulder. Alternating faces keeps the blade centered and prevents one face becoming thinner than the other.'),
      lin(t('Round the blade tip with '), tip('thumb-pivot-cut', 'thumb-pivot cuts'), t(' on both faces. The tip is wide enough (30 mm) to need several passes.')),
      li('Taper the handle-to-blade transition at the shoulder. The blade widens from the handle; a gentle concave taper at the shoulder looks clean and reduces the abrupt step.'),
      li('Leave to dry for 2 weeks before finishing.')
    ),
    h2('Finishing'),
    p('Sand through 120 and 180 grit along the grain on all faces. Apply raw linseed oil; cure 2 weeks before food contact.'),
    h2('Variations'),
    ul(
      li('Sycamore instead of hazel: slightly finer grain, paler finished surface.'),
      li('Narrower blade for turning eggs: reduce the blade width to 2 cm, keeping the same length. The narrower blade slides under fried eggs without breaking the yolk.'),
      li('Left-handed version: the flat spatula is symmetrical; no adjustment needed.')
    ),
    h2('Care'),
    p('Rinse under warm water, towel-dry. Never soak. Re-oil every 10 to 15 uses.'),
    ts([
      { symptom: 'Blade cracks along the grain as it dries', cause: 'Blade thinned too much before drying', fix: 'Leave the blade at 4 mm minimum during the green-carving stage. Final thinning to 2 mm after drying.' },
      { symptom: 'Blade bows to one face during drying', cause: 'One face thinner than the other', fix: 'Check the blade thickness at the shoulder, the center, and 2 cm from the tip before setting aside. Adjust with light push cuts on the thick side.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// Basketry safety constant
// ─────────────────────────────────────────────
const BASKETRY_SAFETY: Node = {
  type: 'infoPanel',
  attrs: { tone: 'default', title: 'Before you start weaving' },
  content: [{
    type: 'bulletList',
    content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Secateurs are sharp. Close them when setting down; keep fingers clear of the cutting path.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Dry willow ends are stiff and springy when trimmed. Guard your face when snipping tall stakes.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Soaking water: do not leave willow soaking for more than 7 days. Stagnant water grows mould on the rods.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Workspace: low stable seating, knees together as a lap-board for the work-in-progress.' }] }] }
    ]
  }]
}

// ─────────────────────────────────────────────
// 11 Whittling: whittled-sycamore-needle-case
// ─────────────────────────────────────────────
write('11-whittled-sycamore-needle-case.json', {
  slug: 'whittled-sycamore-needle-case',
  title: 'Whittled sycamore needle case',
  subtitle: 'Small two-piece cylindrical needle case in green sycamore',
  excerpt: 'A two-piece needle case in green sycamore: a 7 cm body and a push-fit cap. The fit of the cap to the body is the main challenge. Sycamore carves cleanly to a round cross-section from any direction.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'whittling',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III on small carved treen fittings. Newey and Drage Practical Carpentry on shaped small wooden objects.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'brace-and-bit', isOptional: false },
    { slug: 'leather-strop', isOptional: false }, { slug: 'wood-finish-raw-linseed-oil', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'green-wood', term: 'Green wood', definition: 'Freshly felled or recently riven timber, still high in moisture. Carves more easily than seasoned wood under hand tools.' },
    { slug: 'billet', term: 'Billet', definition: 'A short length of round or split timber, ready to be worked into a blank for carving.' },
    { slug: 'push-cut', term: 'Push cut', definition: 'The safe default cut: blade travelling away from the body, driven by the forearm, off the end of the workpiece into open air.' },
    { slug: 'sloyd-knife', term: 'Sloyd knife', definition: 'A short straight-bladed knife with a stout handle; the standard for whittling and small treen work.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A needle case is two short cylinders: a body that holds the needles and a push-fit cap. The body is 7 cm long; the cap is 2 cm long. Both start as short '), tip('billet', 'billets'), t(' of '), tip('green-wood', 'green'), t(' sycamore. Sycamore carves cleanly on the round cross-section from any direction. The fit of the cap is the defining challenge: too loose and the needles fall out; too tight and the cap cannot be removed without tools.')),
    SAFETY,
    h2('The wood'),
    p('Two pieces of straight-grained green sycamore: one 8 cm long and 2.5 cm in diameter for the body; one 3 cm long and 2.5 cm in diameter for the cap. The grain must run along the length of each piece or the walls will be cross-grained and prone to splitting.'),
    h2('Tools'),
    pn(t('A '), tip('sloyd-knife', 'sloyd knife'), t(' for shaping; a brace and bit (10 mm bit for the body bore, 12 mm for the cap bore); a leather strop; raw linseed oil.')),
    h2('Method'),
    ol(
      lin(t('Shape each billet to a round cross-section with '), tip('push-cut', 'push cuts'), t('. Work around the perimeter in overlapping passes. Check by rolling on the bench. Target diameter: 18 mm.')),
      li('Bore the body: clamp it end-grain-up in a vise. Use the 10 mm bit, bore 5.5 cm deep into one end. The bore does not go through; it leaves a 1 cm floor at the closed end.'),
      li('Shape the cap piece to 20 mm external diameter. The cap will push-fit over the top 1.5 cm of the body.'),
      li('Bore the cap with the 12 mm bit, 1.8 cm deep. Test the fit frequently during boring: the cap should push on with light thumb pressure and stay on without rattling.'),
      li('If the cap is too tight, thin the body top with light push cuts around the circumference. If the cap is too loose, glue a thin strip of sycamore veneer inside the cap bore to reduce its diameter.'),
      li('Leave both pieces on a shelf for 2 weeks before oiling. Sycamore shrinks slightly as it dries and the fit may tighten.')
    ),
    h2('Finishing'),
    p('Sand the exterior of both pieces through 180 and 240 grit. Apply raw linseed oil to the exterior only. Do not oil the bore or the cap interior.'),
    h2('Variations'),
    ul(
      li('Longer body for embroidery needles: 10 cm body, same cap dimensions. Bore to 6 mm for long tapestry needles.'),
      li('Chip-carved ring around the body: a simple V-groove ring at mid-height adds decoration without complicating the fit.'),
      li('Ash instead of sycamore: similar grain, slightly coarser, equally food-safe.')
    ),
    h2('Care'),
    p('Wipe down if the case gets wet. Re-oil once a year if in daily use.'),
    ts([
      { symptom: 'Cap splits at the wall during boring', cause: 'Cap wall too thin before boring began', fix: 'Keep the cap external diameter at 22 mm minimum when boring a 12 mm hole. The wall must be at least 3 mm thick after boring.' },
      { symptom: 'Cap fits on the bench but becomes loose after drying', cause: 'Body shrank more than the cap as the sycamore dried', fix: 'Glue a thin shim of sycamore veneer inside the cap. One layer of veneer reduces the bore by about 0.8 mm.' },
      { symptom: 'Body bore is off-centre', cause: 'Brace and bit angled during boring', fix: 'Sight along the brace from two directions before starting. A try-square held beside the brace shows any lean.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 12 Whittling: chip-carved-oak-coaster
// ─────────────────────────────────────────────
write('12-chip-carved-oak-coaster.json', {
  slug: 'chip-carved-oak-coaster',
  title: 'Chip-carved oak coaster',
  subtitle: 'Flat seasoned-oak coaster with a chip-carved geometric border',
  excerpt: 'A square oak coaster with a chip-carved diamond-and-triangle border. The chip cut removes small triangular wedges from the surface. Seasoned oak holds a crisp chip-cut edge better than softer woods.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'whittling',
  woodState: 'seasoned', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III on chip carving. The Artistic Crafts Series: Wood Carving (1898) on geometric surface decoration.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'marking-knife', isOptional: true },
    { slug: 'leather-strop', isOptional: false }, { slug: 'wood-finish-danish-oil', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Air-dried or kiln-dried timber at a stable moisture content. Dimensionally stable and holds a sharp chip-cut edge cleanly.' },
    { slug: 'chip-cut', term: 'Chip cut', definition: 'A two-stroke cut that removes a triangular wedge: a stop cut driven at 45 degrees, followed by a slicing stroke from the other side meeting it under the chip.' },
    { slug: 'stop-cut', term: 'Stop cut', definition: 'A short cut across the grain that prevents the next pass running beyond the intended boundary.' },
    { slug: 'sloyd-knife', term: 'Sloyd knife', definition: 'A short straight-bladed knife; the standard chip-carving tool for triangular and geometric patterns.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('Chip carving removes small triangular wedges from a flat wooden surface to build up a geometric pattern. Each triangle is cut with two strokes: a '), tip('stop-cut', 'stop cut'), t(' along one edge and a '), tip('chip-cut', 'chip cut'), t(' from the other side meeting under the chip to release it clean. '), tip('seasoned-wood', 'Seasoned'), t(' oak holds a crisp cut corner better than softer wood; pine and lime crumble at the chip corners.')),
    SAFETY,
    h2('The wood'),
    p('A square of seasoned oak: 10 cm by 10 cm, 8 mm thick. The face must be flat and smooth before marking out. A warped blank makes consistent chip depth impossible. Sand to 120 grit on a flat surface if the face is not already true.'),
    h2('Tools'),
    pn(t('A '), tip('sloyd-knife', 'sloyd knife'), t(' for all cuts; an optional marking knife for the initial stop cuts; a leather strop; Danish oil.')),
    h2('Method'),
    ol(
      li('Mark a 2 mm border around the edge as a no-cut margin. Inside it, mark a 10 mm wide chip-carved border. Leave the central 6 cm square smooth. Within the border, mark equilateral triangles: each 10 mm per side.'),
      li('Drive the stop cut along one edge of the first triangle with the knife tip or marking knife. Hold the blade at 45 degrees to the face, angled toward the center of the triangle. Depth: 3 mm at the triangle center, tapering to zero at the corners.'),
      lin(t('Make the second stroke with the '), tip('sloyd-knife', 'sloyd knife'), t(': blade at 45 degrees from the opposite side of the triangle, aimed to meet the first cut 3 mm below the surface. The chip releases cleanly when the two cuts meet precisely. If it does not release, do not lever it; make a third stroke from the third edge.')),
      li('Work around the full border, completing all triangles on one edge before rotating the coaster 90 degrees.'),
      li('Clean rough triangle floors with the knife tip in a light slicing stroke.'),
      li('Sand the flat central face through 180 and 240 grit. Leave the chip-carved border un-sanded: sanding blurs the cut edges.')
    ),
    h2('Finishing'),
    p('Apply Danish oil to the full surface. Three thin coats with a light 320-grit rub between coats two and three. Danish oil is not food-safe; this coaster is for mugs and glasses, not direct food contact.'),
    h2('Variations'),
    ul(
      li('Six-pointed star in the central square: mark a hexagonal grid and chip-carve the alternating triangles.'),
      li('Round coaster: cut the blank to a circle and lay out the chip pattern on a circular border.'),
      li('Ash instead of oak: similar hardness and grain behaviour at the chip corners.')
    ),
    ts([
      { symptom: 'Chips tear instead of releasing cleanly', cause: 'The two cuts did not meet at the same depth', fix: 'Drive each stop cut to a consistent measured depth (3 mm) rather than by feel. The depth governs where the second cut must meet it.' },
      { symptom: 'Oak splits along the grain during the chip cut', cause: 'Cutting with the grain rather than across it on the short triangle edges', fix: 'Chip cuts should run across the grain. Rotate the coaster so each chip cut crosses the grain direction rather than following it.' },
      { symptom: 'Triangle floors are ridged', cause: 'Both cuts not meeting at the same angle below the surface', fix: 'Both strokes must be at 45 degrees to the face. A shallower second stroke leaves a ridge. Re-cut it more steeply.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 13 Whittling: kolrosing-on-a-spoon (TECHNIQUE)
// ─────────────────────────────────────────────
write('13-kolrosing-on-a-spoon.json', {
  slug: 'kolrosing-on-a-spoon',
  title: 'Kolrosing on a spoon',
  subtitle: 'Incised-line decoration on finished spoon surfaces',
  excerpt: 'Kolrosing is a Scandinavian surface-decoration technique: fine incised lines cut into the finished wood and filled with dark powder. Covers transferring a design, cutting the lines, and rubbing in the filler.',
  type: 'TECHNIQUE', categorySlug: 'wood-natural-craft', subCategorySlug: 'whittling',
  difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Swedish sloyd tradition, late nineteenth and early twentieth century. The Artistic Crafts Series: Wood Carving (1898) on incised-line surface decoration.",
  recipeTools: [
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'leather-strop', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'kolrosing', term: 'Kolrosing', definition: 'A Scandinavian surface-decoration technique using fine incised knife lines filled with dark powder (coffee grounds or charcoal) to produce a drawn design.' },
    { slug: 'sloyd-knife', term: 'Sloyd knife', definition: 'The standard tool for kolrosing; the very tip of the blade cuts the V-groove.' },
    { slug: 'incised-line', term: 'Incised line', definition: 'A narrow V-groove cut into the wood surface with the knife tip. The groove holds the filler powder.' },
    { slug: 'grain', term: 'Grain', definition: 'The direction of the wood fibres. Cutting incised lines with the grain produces a cleaner groove than cutting across it.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(tip('kolrosing', 'Kolrosing'), t(' is a surface-decoration technique from the Scandinavian sloyd tradition. Fine '), tip('incised-line', 'V-grooves'), t(' are cut into the finished wood with the '), tip('sloyd-knife', 'sloyd knife'), t(' tip. Dark powder (coffee grounds, charcoal, or walnut-shell dust) is then rubbed into the grooves and the surface wiped clean. The '), tip('grain', 'grain'), t(' direction affects groove quality: cuts with the grain are smoother than cuts across it.')),
    SAFETY,
    h2('Choosing the surface'),
    p('Kolrosing works on any smooth dry wood surface. The most common application is the handle of a carved spoon. The wood must be dry, sanded to at least 180 grit, and not yet oiled. Oil in the grain prevents the filler powder from bonding in the grooves.'),
    h2('Transferring the design'),
    p('Sketch the design on paper and trace it onto the spoon surface with a soft pencil. Keep the design simple: the technique rewards geometric patterns, flowing curves, and repeating motifs. Realistic portrait work is possible but requires very confident knife control.'),
    h2('Cutting the lines'),
    ol(
      li('Use the very tip of the sloyd knife blade. Press the tip into the wood at the start of a design line at about 30 degrees to the surface. Draw the blade along the pencil line with even pressure, cutting one side of the V-groove.'),
      li('Make a second stroke on the other side of the same line, meeting the first cut at the groove floor. The narrow chip between the two cuts lifts out cleanly.'),
      li('Work with the grain where the design allows. Cross-grain sections require slower strokes and the knife tip tilted more steeply. The groove does not need to be wide: 0.8 mm is enough to hold the filler.'),
      li('When all lines are cut, blow out the dust. Inspect each groove with a raking light from one side. Sections without a groove shadow need a second pass.')
    ),
    h2('Filling'),
    p('Rub fine dry coffee grounds or wood charcoal into the grooves with a fingertip, working in circles. Press firmly into each groove. Wipe off the surface powder with a dry cloth, wiping across the grain to avoid dragging filler out of the grooves. One wipe is usually enough.'),
    h2('Fixing'),
    p('Apply raw linseed oil after filling. The oil darkens the filler and fixes it in the groove. Apply a thin coat only; let it soak for 20 minutes and wipe off the surplus. Multiple heavy coats lift the filler.'),
    ts([
      { symptom: 'Groove floors are rough and ragged', cause: 'Cutting across the grain on a section of the design', fix: 'Re-cut the rough section in the grain direction where possible. Cross-grain cuts need the knife tip tilted more steeply and strokes taken more slowly.' },
      { symptom: 'Filler wipes out of the grooves', cause: 'Grooves too shallow', fix: 'The V-groove must be at least 0.5 mm deep to hold the powder. Re-cut the groove deeper with a second pass on each side of the V.' },
      { symptom: 'Filler spreads outside the grooves after oiling', cause: 'Surface powder not wiped off before oiling', fix: 'Wipe the surface powder off immediately after rubbing in, before any oil is applied. Once oiled, surface filler is fixed permanently.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 14 Green-woodwork: riven-ash-fork-handle
// ─────────────────────────────────────────────
write('14-riven-ash-fork-handle.json', {
  slug: 'riven-ash-fork-handle',
  title: 'Riven ash fork handle',
  subtitle: 'Replacement digging-fork handle in riven green ash',
  excerpt: 'A replacement digging-fork handle in riven green ash. Riven ash follows the grain and is far stronger than a sawn handle. Shaped with a drawknife at the shaving horse, then fitted to the fork socket.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'green-woodwork',
  woodState: 'green', difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on tool-handle making. Cassell's Cyclopaedia of Mechanics vol. III on drawknife work and green-wood tool handles.",
  recipeTools: [
    { slug: 'drawknife-straight', isOptional: false }, { slug: 'shaving-horse', isOptional: false },
    { slug: 'spokeshave-flat', isOptional: true }, { slug: 'leather-strop', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'green-wood', term: 'Green wood', definition: 'Freshly felled or recently riven timber, still high in moisture. Shapes easily with a drawknife.' },
    { slug: 'riven', term: 'Riven', definition: 'Split along the grain with a froe rather than sawn. Riven pieces follow the grain exactly and resist the bending stress of a tool handle better than sawn equivalents.' },
    { slug: 'billet', term: 'Billet', definition: 'A short length of riven timber, ready to be shaped into a handle blank.' },
    { slug: 'drawknife', term: 'Drawknife', definition: 'A two-handled blade pulled toward the body along the workpiece, used at the shaving horse for rapid material removal.' },
    { slug: 'shaving-horse', term: 'Shaving horse', definition: 'A foot-pedalled bench that clamps the workpiece with a jaw operated by the feet, freeing both hands for the drawknife.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A garden fork handle takes considerable bending stress in use. '), tip('riven', 'Riven'), t(' ash is the correct material: the fibres follow the full length of the handle without interruption, unlike a sawn handle where the saw crosses the grain and creates a weak point. This project shapes a '), tip('billet', 'billet'), t(' of '), tip('green-wood', 'green'), t(' ash on the '), tip('shaving-horse', 'shaving horse'), t(' with a '), tip('drawknife', 'drawknife'), t('. The work proceeds in two stages: rough to an octagonal cross-section, then refine to round with a spokeshave or knife.')),
    SAFETY,
    h2('The wood'),
    p('A riven ash billet: 115 cm long (to allow 10 cm of waste at each end during shaping), 5 cm across the rift face. The billet must be straight-grained along its full length. A slight bow is acceptable; a twist is not. Ash from a coppice stool cut at 8 to 12 years gives the ideal bole diameter.'),
    h2('Tools'),
    p('A straight drawknife (200 to 250 mm blade); a shaving horse; an optional flat-bottomed spokeshave for finishing; a leather strop.'),
    h2('Method'),
    ol(
      li('Measure and mark the handle taper. The shoulder is 35 mm diameter at the top end. It tapers to 30 mm at the grip in the middle, then back to 35 mm at the ferrule end. Mark the ferrule taper separately: 30 mm over the last 10 cm. It terminates at the diameter the fork socket requires; measure the old handle stub to get this number.'),
      li('Clamp the billet in the shaving horse with the butt end in the jaw. Work the drawknife in long strokes from the shoulder toward the butt, taking off the corners of the square billet to create a rough octagon. Keep the drawknife bevel-side down; a convex bevel on the drawknife limits depth of cut automatically.'),
      li('Rotate the billet and repeat on all faces until the cross-section is a 16-sided polygon. Check the diameter with calipers every few passes.'),
      li('Re-clamp with the tip end in the jaw. Work the taper at the ferrule end: the last 10 cm narrows from 30 mm to the socket diameter. The taper must be straight, not stepped; run a straight-edge along it.'),
      li('Finish to round with the spokeshave if available, or with the drawknife taking very light passes. A round handle is more comfortable than an octagonal one.'),
      li('Leave to dry for 4 to 6 weeks before fitting. The ash will shrink slightly, which tightens the ferrule fit.')
    ),
    h2('Finishing'),
    p('No finish is needed for a tool handle in regular outdoor use. Sand through 120 and 180 grit along the grain, then rub in raw linseed oil. Boiled linseed oil is the traditional choice for tool handles but is not food-safe; for this outdoor tool that distinction does not matter.'),
    h2('Fitting the handle'),
    p('Drive the handle into the socket with the beetle. The friction fit is enough for most garden forks; if the socket has a rivet hole, drill through the handle and fit a new bolt.'),
    h2('Variations'),
    ul(
      li('Spade handle: same profile, 90 cm length, no ferrule taper.'),
      li('Hammer handle: 32 cm long, tapered octagonal section, fitted to the eye with a wooden wedge.'),
      li('Birch instead of ash: slightly softer but works well for light garden tools.')
    ),
    ts([
      { symptom: 'Handle twists along its length', cause: 'The billet had spiral grain; the drawknife followed the spiral rather than the axis', fix: 'Check the billet end-grain for spiral rings before starting. A straight-grained billet has concentric oval rings. Reject spiral-grained billets.' },
      { symptom: 'Handle breaks at the ferrule end after fitting', cause: 'Ferrule taper cut too short; socket diameter too small for the wood wall thickness', fix: 'The ferrule taper needs 15 mm of handle wall inside the socket. If the socket is short, extend the taper so more handle material enters it.' },
      { symptom: 'Drawknife tears the surface', cause: 'Cutting against the grain on a reversed grain section of the ash', fix: 'Check the grain direction by making a light test pass. If it tears, reverse the billet and take the cut from the other end.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 15 Green-woodwork: riven-birch-dibber-long
// ─────────────────────────────────────────────
write('15-riven-birch-dibber-long.json', {
  slug: 'riven-birch-dibber-long',
  title: 'Riven birch dibber',
  subtitle: 'Long pointed garden dibber in riven green birch',
  excerpt: 'A long-handled garden dibber in riven green birch: a 45 cm handle with a pointed working tip for making planting holes. The first drawknife project for a new shaving-horse maker.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'green-woodwork',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on tool handles and green-woodwork. Cassell's Cyclopaedia of Mechanics vol. III on small green-wood treen.",
  recipeTools: [
    { slug: 'drawknife-straight', isOptional: false }, { slug: 'shaving-horse', isOptional: false },
    { slug: 'sloyd-knife', isOptional: true }, { slug: 'leather-strop', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'green-wood', term: 'Green wood', definition: 'Freshly felled or recently riven timber. Shapes readily under a drawknife when still in a moist state.' },
    { slug: 'riven', term: 'Riven', definition: 'Split along the grain with a froe rather than sawn. Riven pieces follow the grain and are stronger than sawn equivalents.' },
    { slug: 'billet', term: 'Billet', definition: 'A short length of riven timber ready to be shaped.' },
    { slug: 'drawknife', term: 'Drawknife', definition: 'A two-handled blade pulled toward the body along the workpiece. Removes material quickly and follows the grain.' },
    { slug: 'push-cut', term: 'Push cut', definition: 'A knife cut driven away from the body, used to shape the pointed tip of the dibber.' },
    { slug: 'shaving-horse', term: 'Shaving horse', definition: 'A foot-pedalled bench that clamps the workpiece, freeing both hands for the drawknife.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A dibber makes planting holes in prepared soil: push the pointed tip in, lever sideways to open the hole to the right size, lower the plant, close the soil. The '), tip('riven', 'riven'), t(' '), tip('billet', 'billet'), t(' of '), tip('green-wood', 'green'), t(' birch is shaped on the '), tip('shaving-horse', 'shaving horse'), t(' with a '), tip('drawknife', 'drawknife'), t('. Birch is one of the most common UK coppice and windfall species; a straight birch pole from a hedgerow provides ideal dibber blanks. This is the first shaving-horse project: a single piece, no joints, one taper from handle to tip.')),
    SAFETY,
    h2('The wood'),
    p('A straight riven birch billet: 50 cm long, 4 cm across. The billet should be taken from close-grained young birch, no more than 6 cm in diameter at the source. Hazel is a good substitute; ash works but is denser and harder on the drawknife edge.'),
    h2('Tools'),
    pn(t('A straight '), tip('drawknife', 'drawknife'), t('; a '), tip('shaving-horse', 'shaving horse'), t('; an optional sloyd knife for the pointed tip; a leather strop.')),
    h2('Method'),
    ol(
      li('Clamp the billet in the shaving horse with the butt end in the jaw. Work the drawknife from the shoulder toward the butt, taking the corners off the square or polygonal billet to form a rough octagon in cross-section. Check the diameter with calipers: target 28 mm.'),
      li('Continue to round the cross-section, working around the perimeter in overlapping passes. The finished handle section (top 35 cm) should be 26 mm in diameter.'),
      li('Re-clamp with the tip end in the jaw. Work the taper on the bottom 15 cm from 26 mm at the shoulder down to a 10 mm diameter point. Use shorter strokes as the taper narrows; long strokes on a thin taper will flex the work.'),
      lin(t('Finish the very tip to a rounded point with '), tip('push-cut', 'push cuts'), t(' on the sloyd knife if available, or the drawknife corner for the final 5 cm. The tip does not need to be sharp; a blunt point of 8 mm diameter opens a planting hole without breaking roots.')),
      li('Leave to dry for 3 weeks before use. The birch will harden and stiffen as it seasons.')
    ),
    h2('Finishing'),
    p('Sand through 120 grit along the grain. Apply raw linseed oil; let soak for 30 minutes, wipe off the surplus. A garden tool has no food-contact requirement; the oil is a weathering barrier only.'),
    h2('Variations'),
    ul(
      li('Shorter dibber for pots: 25 cm long, 20 mm diameter, 6 mm pointed tip for individual seed cells.'),
      li('Graduated markings: cut shallow V-grooves at 5 cm intervals along the lower half to gauge planting depth.'),
      li('Hazel instead of birch: slightly softer, more common as a managed hedgerow species.')
    ),
    ts([
      { symptom: 'Dibber bends to one side when pushed into soil', cause: 'Handle not round in cross-section; one side thicker', fix: 'Check the handle cross-section with calipers at several points before drying. A consistent 26 mm diameter all round prevents bending.' },
      { symptom: 'Drawknife tears on the tip section', cause: 'Taper section too thin to resist the downward pressure of the drawknife', fix: 'Switch to the sloyd knife for the final 10 cm of the taper. The knife gives more control on narrow cross-sections.' },
      { symptom: 'Tip splits during drying', cause: 'Tip thinned too much while still green', fix: 'Leave the tip at 10 mm diameter in the green state. Final thinning can be done after drying.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 16 Green-woodwork: green-oak-peg-rack-wall
// ─────────────────────────────────────────────
write('16-green-oak-peg-rack-wall.json', {
  slug: 'green-oak-peg-rack-wall',
  title: 'Green oak peg rack',
  subtitle: 'Wall-mounted peg rack with riven-oak rail and carved pegs',
  excerpt: 'A wall-mounted peg rack: a riven green-oak back rail with four round pegs bored into it. The pegs are shaped with a drawknife and knife; they are fitted green and shrink tight as they dry. No glue needed.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'green-woodwork',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on green-wood peg and treen fitting. Cassell's Cyclopaedia of Mechanics vol. III on riven-wood construction.",
  recipeTools: [
    { slug: 'froe', isOptional: false }, { slug: 'beetle-mallet', isOptional: false },
    { slug: 'drawknife-straight', isOptional: false }, { slug: 'shaving-horse', isOptional: false },
    { slug: 'brace-and-bit', isOptional: false }, { slug: 'sloyd-knife', isOptional: false },
    { slug: 'leather-strop', isOptional: false }, { slug: 'wood-finish-raw-linseed-oil', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'green-wood', term: 'Green wood', definition: 'Freshly felled timber, still high in moisture. Pegs fitted green shrink tight into their bored holes as they dry.' },
    { slug: 'riven', term: 'Riven', definition: 'Split along the grain with a froe. Riven oak is far stronger than sawn oak for a structural rail.' },
    { slug: 'froe', term: 'Froe', definition: 'A wedge-shaped blade with a vertical handle, driven into the end-grain of a log to split it along the grain.' },
    { slug: 'billet', term: 'Billet', definition: 'A short length of riven timber ready to be shaped.' },
    { slug: 'drawknife', term: 'Drawknife', definition: 'A two-handled blade pulled toward the body along the workpiece, used at the shaving horse to shape the peg blanks.' },
    { slug: 'shaving-horse', term: 'Shaving horse', definition: 'A foot-pedalled bench that clamps the workpiece for drawknife work.' },
    { slug: 'push-cut', term: 'Push cut', definition: 'A knife cut driven away from the body, used for the final shaping of the peg tips.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A '), tip('green-wood', 'green-wood'), t(' peg rack uses shrinkage to its advantage: the '), tip('riven', 'riven'), t(' oak pegs are fitted green, and as they dry, the fibres shrink around the bored hole and lock tight without glue. The back rail is also riven oak; '), tip('riven', 'riven'), t(' oak splits along the medullary rays and produces a very strong flat face. The '), tip('froe', 'froe'), t(' and beetle make the initial split; the '), tip('drawknife', 'drawknife'), t(' refines the rail and peg shapes on the '), tip('shaving-horse', 'shaving horse'), t('.')),
    SAFETY,
    h2('The wood'),
    pn(t('One green oak '), tip('billet', 'billet'), t(' for the rail: 50 cm long, 8 cm wide, 3 cm thick after riving and dressing. Four green oak peg blanks: each 15 cm long, 3.5 cm diameter round section. Oak from a freshly felled or recently coppiced tree; air-dried oak is too hard for the drawknife.')),
    h2('Tools'),
    p('A froe and beetle for the initial rive. A drawknife and shaving horse for dressing the rail face and shaping the peg blanks. A brace and bit (25 mm bit) for the peg holes. A sloyd knife for the peg tips. A leather strop and raw linseed oil.'),
    h2('Method'),
    ol(
      li('Rive the rail blank from the green oak log. Drive the froe into the end-grain with the beetle; lever the handle to open the split. Work the froe down the length to separate the rail section.'),
      li('Dress the rail face flat on the shaving horse with the drawknife. Work in long strokes from one end to the other. Check the face with a straight-edge; a 2 mm hollow along the length is acceptable.'),
      lin(t('Shape the four peg blanks on the shaving horse. Each peg has a 12 cm working section (30 mm diameter, round) and a 3 cm shoulder section (32 mm diameter) where it enters the rail. '), tip('push-cut', 'Push cuts'), t(' on the sloyd knife round the peg tip to a gentle dome.')),
      li('Mark the four peg-hole positions on the rail face: 10 cm from each end, then two equally spaced between them. Bore the holes with the brace and 25 mm bit. Bore perpendicular to the face; use a try-square beside the brace to check the angle.'),
      li('Drive each green peg into its hole with the beetle. The peg should enter with moderate resistance and sit with the shoulder flush to the rail face. If the fit is too loose, wrap the peg shoulder with a strip of birch bark before driving.'),
      li('Leave the assembled rack for 4 weeks before hanging. The pegs will tighten as they dry.')
    ),
    h2('Finishing'),
    p('Apply raw linseed oil to the rail face and all peg surfaces. One coat is enough for interior use. Re-oil once a year.'),
    h2('Variations'),
    ul(
      li('Ash instead of oak: lighter and slightly more open grain. The shrinkage joint works with any strong hardwood.'),
      li('Longer rail with six pegs for a hall rack: extend to 80 cm, six holes equally spaced.'),
      li('Decorative peg tips: carve a small carved bead or taper on each peg tip with the sloyd knife before fitting.')
    ),
    ts([
      { symptom: 'Peg is loose after drying', cause: 'The bored hole diameter was too large for the peg shoulder diameter', fix: 'The peg shoulder should be 1 to 2 mm larger than the bit diameter before driving. The compression of the green wood during driving provides the initial grip; shrinkage adds the final grip.' },
      { symptom: 'Rail splits during the rive', cause: 'The grain deviated from the long axis of the log', fix: 'Sight along the log end-grain before starting. Rings that are off-centre or wavy indicate a deviated grain. Choose a straight-grained section.' },
      { symptom: 'Peg tip breaks during use', cause: 'Peg tip thinned too much during shaping', fix: 'The peg tip dome should be no thinner than 15 mm across the flat face. Do not taper the peg below 20 mm diameter outside the shoulder section.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 17 Green-woodwork: drawknife-shaping-a-stile (TECHNIQUE)
// ─────────────────────────────────────────────
write('17-drawknife-shaping-a-stile.json', {
  slug: 'drawknife-shaping-a-stile',
  title: 'Drawknife shaping a stile',
  subtitle: 'How to shape a chair stile or rail from a riven billet at the shaving horse',
  excerpt: 'A step-by-step technique for dressing a riven billet into a chair stile or door rail using a drawknife at the shaving horse. Covers grain reading, cut angle, the bevel-down grip, and finishing with a spokeshave.',
  type: 'TECHNIQUE', categorySlug: 'wood-natural-craft', subCategorySlug: 'green-woodwork',
  difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on drawknife work. Cassell's Cyclopaedia of Mechanics vol. III on shaving-horse technique.",
  recipeTools: [
    { slug: 'drawknife-straight', isOptional: false }, { slug: 'shaving-horse', isOptional: false },
    { slug: 'spokeshave-flat', isOptional: false }, { slug: 'leather-strop', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'drawknife', term: 'Drawknife', definition: 'A two-handled blade pulled toward the body along the workpiece, driven by body weight and forearm pull.' },
    { slug: 'shaving-horse', term: 'Shaving horse', definition: 'A foot-pedalled bench that clamps the workpiece; pressing the footrest closes the jaw on the work.' },
    { slug: 'stile', term: 'Stile', definition: 'A vertical member of a framed structure, such as the upright of a chair back, a door frame, or a gate.' },
    { slug: 'green-wood', term: 'Green wood', definition: 'Freshly felled or recently riven timber. The elevated moisture content makes it easier to cut with a drawknife than seasoned wood.' },
    { slug: 'riven', term: 'Riven', definition: 'Split along the grain with a froe, so the fibres run continuously along the piece without cross-grain interruption.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A '), tip('stile', 'stile'), t(' is the vertical member in a chair back, door frame, or cabinet face. '), tip('riven', 'Riven'), t(' '), tip('green-wood', 'green'), t(' ash or oak gives a stile that follows the grain exactly, which is what carries the bending stress. The '), tip('drawknife', 'drawknife'), t(' at the '), tip('shaving-horse', 'shaving horse'), t(' is the right tool for this work: it removes material faster than a hand plane, follows the grain, and the foot-jaw on the horse keeps the work stable without any bench vise.')),
    SAFETY,
    h2('Setting up the shaving horse'),
    p('Sit on the bench with both feet on the footrest. Press the footrest to close the jaw on a scrap piece. The jaw should grip firmly at the point where your feet are comfortably bent. If the jaw grips at full foot extension, the horse is too long for your leg length; add a block under the footrest to bring it forward.'),
    h2('Bevel orientation'),
    p('The drawknife bevel can face up (convex side toward the work) or down (convex side away). Bevel-down limits the depth of cut automatically and is the default for green-wood stile work. Bevel-up takes more material per stroke and is used for quick roughing on very large billets only.'),
    h2('Reading the grain'),
    p('Before cutting, look at the side face of the billet. The grain lines run slightly off the long axis. If they run uphill toward the cutting end, cut from the low end to the high end (with the grain). If they run downhill toward the cutting end, reverse and cut from the other end. The grain always shows the right direction.'),
    h2('Cutting technique'),
    ol(
      li('Clamp the billet in the shaving horse with the thicker end in the jaw. Press the footrest to close; test the grip by pulling the billet sideways.'),
      li('Hold the drawknife handles with a full-hand grip, thumbs pointing toward each other on top of the handles. Draw the blade toward your body in a long stroke, the bevel face down, blade at about 15 degrees to the long axis of the billet.'),
      li('Each stroke should produce a long thin shaving. If the shaving is thick and the blade buries, reduce the blade angle. If the blade skims and barely cuts, increase it.'),
      li('Work systematically from the far end to the jaw end of the exposed billet, taking overlapping parallel strokes. Rotate the billet in the jaw and repeat on all faces until the cross-section approaches the target shape.'),
      li('Finish with the spokeshave for the final 1 to 2 mm. The spokeshave produces a smoother surface than the drawknife and removes less material per pass, making it the right tool for the final sizing.')
    ),
    h2('Checking the work'),
    p('Check the cross-section with calipers at three points along the length: near the jaw, at the center of the exposed section, and at the far end. Consistent diameter means consistent cuts. A tapered result means one end of the billet is higher in the jaw than the other; re-clamp level.'),
    ts([
      { symptom: 'Drawknife digs in and stops', cause: 'Bevel-up orientation on hard grain; blade is burying', fix: 'Switch to bevel-down orientation. Reduce the blade angle to the work surface.' },
      { symptom: 'Surface tears in one section', cause: 'Cutting against the grain on a reversed-grain section', fix: 'Reverse the billet in the horse so the cut runs in the other direction along that section.' },
      { symptom: 'Billet shifts in the jaw during the cut', cause: 'Footrest pressure released mid-stroke', fix: 'Hold foot pressure constant throughout the stroke. Release the footrest only when re-clamping for a new section.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 18 Green-woodwork: wedged-tenon-joint-green-wood (TECHNIQUE)
// ─────────────────────────────────────────────
write('18-wedged-tenon-joint-green-wood.json', {
  slug: 'wedged-tenon-joint-green-wood',
  title: 'Wedged tenon in green wood',
  subtitle: 'How the green-wood shrinkage joint works and how to cut it',
  excerpt: 'The green-wood wedged tenon relies on the tenon shrinking tight around the wedge as it dries. Covers the two-part joint: the foxtail wedge variant for blind mortises and the through-wedged variant for visible joints.',
  type: 'TECHNIQUE', categorySlug: 'wood-natural-craft', subCategorySlug: 'green-woodwork',
  difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Cyclopaedia of Mechanics vol. III on mortise-and-tenon joints. Newey and Drage Practical Carpentry and Joinery on green-wood shrinkage joinery.",
  recipeTools: [
    { slug: 'tenon-saw', isOptional: false }, { slug: 'mortise-chisel-9mm', isOptional: false },
    { slug: 'mallet-carpenters', isOptional: false }, { slug: 'marking-gauge', isOptional: false },
    { slug: 'try-square-200mm', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'tenon', term: 'Tenon', definition: 'The male part of a mortise-and-tenon joint: a tongue of wood cut on the end of one piece to fit inside the mortise in the other.' },
    { slug: 'mortise', term: 'Mortise', definition: 'The female part of a mortise-and-tenon joint: a rectangular cavity cut to receive the tenon.' },
    { slug: 'kerf', term: 'Kerf', definition: 'The narrow slot cut by a saw blade. In a wedged tenon, the kerf is cut into the end of the tenon to receive the wedge.' },
    { slug: 'green-wood', term: 'Green wood', definition: 'Freshly felled timber with elevated moisture content. A green tenon shrinks as it dries; fitted inside a dry mortise and wedged, the shrinkage locks it permanently.' },
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Air-dried or kiln-dried timber at stable moisture content. The mortise member of this joint is always in seasoned wood.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('The green-wood wedged '), tip('tenon', 'tenon'), t(' is the standard joint in green-woodwork chairs and benches. The '), tip('mortise', 'mortise'), t(' is cut in '), tip('seasoned-wood', 'seasoned'), t(' wood. The tenon is cut in '), tip('green-wood', 'green'), t(' wood and fitted slightly oversize. As the green tenon dries, its cross-section shrinks. Because the tenon is locked inside the seasoned mortise, it cannot shrink freely; the fibres compress around the '), tip('kerf', 'wedge kerf'), t(' and the joint tightens irreversibly. No glue is used or needed.')),
    SAFETY,
    h2('Why this works'),
    p('Wood shrinks as it dries, primarily across the grain (radial and tangential shrinkage). A green ash tenon 25 mm in diameter will shrink to approximately 23.5 mm at 8 percent moisture content. If it is fitted into a 24 mm mortise and wedged, the shrinkage presses the tenon walls against the mortise walls from inside. The more the tenon shrinks, the tighter the joint.'),
    h2('Cutting the tenon'),
    ol(
      li('Cut the green tenon 0.5 to 1 mm larger in each dimension than the mortise. For a 25 mm square mortise, cut the tenon 26 mm square. The oversize allows for the initial compression during fitting and for the subsequent shrinkage.'),
      li('Saw the wedge kerf: a single saw cut down the centre of the tenon end, running in the same direction as the grain across the mortise. For a blind mortise (foxtail wedge), the kerf is 75 percent of the tenon length. For a through mortise, the kerf runs the full tenon length.'),
      li('Cut the wedge from a piece of dry hardwood: a thin taper, 3 mm at the thin end and 6 mm at the thick end, 30 mm long. The wedge grain runs parallel to its length.')
    ),
    h2('Fitting the foxtail wedge (blind mortise)'),
    ol(
      li('Drop the wedge into the kerf at the tenon end, thin end first. Tap it down until it is about 5 mm proud of the tenon end face.'),
      li('Drive the tenon into the mortise with the mallet. As the tenon end hits the mortise floor, the wedge is driven in by the resistance, spreading the tenon end and locking it against the mortise walls.'),
      li('Leave the assembly for 4 weeks before loading the joint.')
    ),
    h2('Fitting the through wedge'),
    p('With a through mortise, the tenon protrudes through the mortise member. Drive the tenon through until it protrudes 5 mm. Drive the wedge into the kerf from the protruding end. The tenon spreads inside the mortise and cannot be withdrawn.'),
    h2('Checking the joint'),
    p('A correctly fitted wedged tenon shows no gap at the mortise shoulder line and no split running along the tenon above the kerf. A split means the kerf was too long or the wedge was driven too hard.'),
    ts([
      { symptom: 'Joint feels loose after 4 weeks', cause: 'Tenon was not oversize enough before fitting', fix: 'For a new joint, cut the tenon 1 mm oversize minimum. If the existing joint is loose, drill through the mortise member and tenon and fit a drawbore peg.' },
      { symptom: 'Tenon splits along the kerf during driving', cause: 'Kerf too long or wedge angle too steep', fix: 'The foxtail kerf must not exceed 75 percent of the tenon length. The wedge angle should be no more than 10 degrees.' },
      { symptom: 'Mortise shoulder has a visible gap at the joint line', cause: 'Tenon shoulder was not cut square to the tenon axis', fix: 'Re-cut the tenon shoulder with the tenon saw guided by a try-square. A gap at the shoulder means the shoulder is angled.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 19 Green-woodwork: coppice-species-and-uses (READING)
// ─────────────────────────────────────────────
write('19-coppice-species-and-uses.json', {
  slug: 'coppice-species-and-uses',
  title: 'Coppice species and their uses',
  subtitle: 'What grows in UK coppice and what each species is suited for',
  excerpt: 'A short reading on the main UK coppice species and what green-woodwork each is suited for: hazel, ash, sweet chestnut, lime, willow, and alder. Covers which species to seek out for tool handles, baskets, carving, and turned work.',
  type: 'READING', categorySlug: 'wood-natural-craft', subCategorySlug: 'green-woodwork',
  difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on UK coppice species. Loudon, J.C., Arboretum et Fruticetum Britannicum (1838) on species characteristics.",
  glossaryTerms: [
    { slug: 'coppice', term: 'Coppice', definition: 'A woodland management system where trees are cut to ground level on a regular cycle to encourage multi-stem regrowth from the base stool.' },
    { slug: 'stool', term: 'Stool', definition: 'The rooted base of a coppiced tree from which new stems grow after cutting. A well-managed stool produces straight, even poles on each rotation.' },
    { slug: 'riven', term: 'Riven', definition: 'Split along the grain with a froe. Most coppice poles are worked riven rather than sawn.' },
    { slug: 'green-wood', term: 'Green wood', definition: 'Freshly cut coppice timber, still high in moisture. Worked immediately after cutting for best results.' }
  ],
  body: { type: 'doc', content: [
    pn(tip('coppice', 'Coppice'), t(' woodland is cut on a rotation of 5 to 25 years, depending on the species and the intended product. Each '), tip('stool', 'stool'), t(' produces multiple straight poles per rotation. The poles are cut in winter when the sap is down, and worked '), tip('green-wood', 'green'), t(' immediately or stored under cover for a short period. Most coppice products are made from '), tip('riven', 'riven'), t(' poles.')),
    h2('Hazel'),
    p('Hazel (Corylus avellana) coppices on a 7 to 12 year rotation. The poles are straight, light, and flexible. Uses: hurdle stakes and binders, pea sticks, thatching spars, wattle panels, basketry framework rods (not weavers), and tent pegs. Hazel does not split cleanly with a froe into flat planks; the fibres run in a slight spiral. For tool handles, ash is preferred.'),
    h2('Ash'),
    p('Ash (Fraxinus excelsior) coppices on a 20 to 30 year rotation and produces the longest, straightest poles of any UK native species. The wood is ring-porous, meaning its annual rings are very distinct, and it splits cleanly along the grain. Uses: tool handles (the best UK species for this), chair components, rake tines, ladder rungs, green-woodwork framework. Ash has the highest bending strength of UK coppice species.'),
    h2('Sweet chestnut'),
    p('Sweet chestnut (Castanea sativa) is the main chestnut-coppice species in the south of England, coppiced on a 15 to 20 year rotation. It is very resistant to decay in contact with the soil, which makes it the preferred species for cleft fencing, hop poles, and rustic furniture. The wood splits cleanly with a froe. Uses: cleft-oak-style fencing, gateposts, rustic chairs, charcoal.'),
    h2('Small-leaved lime'),
    p('Small-leaved lime (Tilia cordata) is rare in natural woodland but is increasingly available from managed coppice and nurseries. The wood is very fine-grained and soft, with almost no interlocked grain. Uses: relief carving (the finest UK carving wood), thin turned work, hat blocks, musical instrument components. Lime does not make good tool handles; it is too soft to absorb mallet blows. It is the premier carving wood.'),
    h2('Willow'),
    p('Willows (Salix spp.) are coppiced or pollarded on a 1 to 3 year rotation for basketry rods (osiers). Specific varieties are grown for rod length and flexibility. The main UK osier species are Salix triandra (brown willow), Salix purpurea (purple osier), and Salix viminalis (common osier). General willow wood from large stems is light, soft, and shock-resistant. Uses: basketry, living structures, cricket bats (Salix alba caerulea), and charcoal for artists.'),
    h2('Alder'),
    p('Alder (Alnus glutinosa) grows on wet ground. It produces a fine-grained wood that resists water well when permanently submerged. Uses: sluice gates, piles, water-mill parts, turned ware (historically clogs and broom heads), and charcoal for gunpowder. Alder is not commonly coppiced for green-woodwork today. It is available from riverside clearances.')
  ]}
})

// ─────────────────────────────────────────────
// 20 Green-woodwork: making-a-green-wood-beetle
// ─────────────────────────────────────────────
write('20-making-a-green-wood-beetle.json', {
  slug: 'making-a-green-wood-beetle',
  title: 'Making a green-wood beetle',
  subtitle: 'Heavy wooden mallet for froe and stake work, shaped from green wood',
  excerpt: 'A wooden beetle is the first tool a green-woodworker makes. The head is a section of dense green hornbeam or beech; the handle is riven ash. No lathe needed: the head is shaped with a drawknife and the handle with a knife.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'green-woodwork',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on beetle making and green-woodwork tools. Cassell's Cyclopaedia of Mechanics vol. III on wooden mallet construction.",
  recipeTools: [
    { slug: 'drawknife-straight', isOptional: false }, { slug: 'shaving-horse', isOptional: false },
    { slug: 'brace-and-bit', isOptional: false }, { slug: 'sloyd-knife', isOptional: false },
    { slug: 'leather-strop', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'green-wood', term: 'Green wood', definition: 'Freshly felled timber. A green head seasons on the handle and tightens as the wood shrinks; no wedge is needed if the handle is also green.' },
    { slug: 'riven', term: 'Riven', definition: 'Split along the grain with a froe. A riven ash handle is far stronger than a sawn one under repeated mallet impact.' },
    { slug: 'billet', term: 'Billet', definition: 'A short section of log or riven timber, ready to be shaped into the beetle head.' },
    { slug: 'drawknife', term: 'Drawknife', definition: 'A two-handled blade pulled toward the body along the workpiece. Used to dress the beetle head from a rough section.' },
    { slug: 'shaving-horse', term: 'Shaving horse', definition: 'A foot-pedalled bench that clamps the workpiece for drawknife work.' },
    { slug: 'push-cut', term: 'Push cut', definition: 'A knife cut driven away from the body, used to shape the handle tip and taper.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A beetle is a heavy wooden club used to drive the froe when splitting logs, drive stakes for willow work, and set joints. A well-made beetle is more controllable than a metal hammer for froe work because the large head distributes the blow across the froe collar. Hornbeam and beech are the best '), tip('green-wood', 'green'), t(' head species: both are very dense, close-grained, and resist splitting under repeated impact. The '), tip('drawknife', 'drawknife'), t(' on the '), tip('shaving-horse', 'shaving horse'), t(' shapes both head and handle. The handle must be '), tip('riven', 'riven'), t(' ash for strength.')),
    SAFETY,
    h2('The wood'),
    pn(t('Head: a green '), tip('billet', 'billet'), t(' of hornbeam or beech, 20 cm long and 14 cm in diameter (a section cut from a freshly felled tree). Handle: a '), tip('riven', 'riven'), t(' ash or hazel pole, 55 cm long and 3 cm in diameter. The handle must be straight-grained along its full length.')),
    h2('Tools'),
    p('A drawknife and shaving horse; a brace and bit (28 mm bit for the handle hole); a sloyd knife for the handle taper; a leather strop.'),
    h2('Method: the head'),
    ol(
      lin(t('Clamp the head billet in the '), tip('shaving-horse', 'shaving horse'), t('. Use the '), tip('drawknife', 'drawknife'), t(' to dress the side face flat, working in long strokes along the grain. The goal is to remove the curved bark surface and create a consistent diameter along the length. Target: 120 mm diameter.')),
      li('Work around the circumference of the head, taking overlapping drawknife strokes, until the head is roughly cylindrical. It does not need to be perfectly round; a slightly octagonal cross-section works fine.'),
      li('Bore the handle hole: mark the centre of each end face with a pencil. Bore from each end to meet in the middle, using the 28 mm bit. Check that the bore runs perpendicular to the striking face with a try-square.')
    ),
    h2('Method: the handle'),
    ol(
      lin(t('Shape the riven ash handle with '), tip('push-cut', 'push cuts'), t(' on the sloyd knife: the upper 5 cm (the end that enters the head) is tapered from 30 mm to 28 mm. The main grip section (35 cm) stays at 28 mm round. The butt end (lower 15 cm) tapers to a slightly narrower grip at 25 mm.')),
      li('Drive the handle into the head with a rubber mallet or by tapping it on a firm surface, handle-first. The taper should seat firmly about 3 cm into the head, leaving the entry point flush with the top face.'),
      li('Leave the assembled beetle for 4 weeks before use. The green head shrinks around the handle and tightens the joint.')
    ),
    h2('Finishing'),
    p('No finish is needed for a working beetle. Linseed oil on the handle is optional. The head will develop a patina from use.'),
    h2('Variations'),
    ul(
      li('Smaller striking head for spoon axe work: 10 cm long, 90 mm diameter. Lighter and more controllable.'),
      li('Dogwood head: dogwood is even harder than hornbeam and more resistant to splitting. Rare; a windfall dogwood section is a prize find.'),
      li('Oak instead of hornbeam: not ideal. Oak splits more readily under impact. It works for a temporary beetle until hornbeam is available.')
    ),
    ts([
      { symptom: 'Head splits along the grain after a few uses', cause: 'The species used has an open grain structure; or the head dried too fast', fix: 'Hornbeam and beech are the correct species. Oak and ash are not suitable for the head; they split under repeated mallet impact. If you used a softer species, wrap the striking face with a few layers of hide glue and leather.' },
      { symptom: 'Handle loosens after first use', cause: 'Handle was seasoned before fitting; it did not shrink and lock into the head', fix: 'For the shrinkage joint to work, both pieces must be green at fitting. Alternatively, fit the handle with a small hardwood wedge driven across the grain at the handle end inside the head bore.' },
      { symptom: 'Bore is off-centre; head flies off the handle on one side', cause: 'Brace and bit angled during boring', fix: 'Mark the centre accurately on both end faces. Bore from each end to meet in the middle; two shorter bores are more accurate than one long one.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 21 Basketry: willow-square-tray-base
// ─────────────────────────────────────────────
write('21-willow-square-tray-base.json', {
  slug: 'willow-square-tray-base',
  title: 'Willow square tray base',
  subtitle: 'Flat woven willow base in pairing weave, used as a display tray',
  excerpt: 'A flat square willow base in pairing weave, finished with a simple trac border to form a low-sided display tray. The base-weaving technique is the foundation of all stake-and-strand basketry.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'basketry-willow',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on willow basketry. Caulfield and Saward, Dictionary of Needlework (1882) on plaited work.",
  recipeTools: [
    { slug: 'bodkin', isOptional: false }, { slug: 'rapping-iron', isOptional: false },
    { slug: 'secateurs', isOptional: false }, { slug: 'soaking-trough', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'slath', term: 'Slath', definition: 'The central crossed-stick structure of a basket base, through which the first weavers are worked to lock the base stakes in position.' },
    { slug: 'stake-and-strand', term: 'Stake-and-strand', definition: 'The basic willow-basket weave structure: vertical stakes form the rigid skeleton; horizontal weavers (strands) weave between them.' },
    { slug: 'pairing', term: 'Pairing', definition: 'A two-weaver technique where two weavers alternate, each crossing in front of one stake and behind the next, alternating with the other weaver.' },
    { slug: 'buff-willow', term: 'Buff willow', definition: 'Willow that has been boiled to set a golden-brown colour and then stripped of bark. The standard basketry rod sold by UK suppliers.' },
    { slug: 'trac-border', term: 'Trac border', definition: 'A simple one-rod border: each stake passes in front of one upright and behind the next, then tucks inside the basket. The standard beginner border.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('A flat tray base is the best introduction to '), tip('stake-and-strand', 'stake-and-strand'), t(' weaving: there is no curved side to manage, and the '), tip('slath', 'slath'), t(' construction is visible throughout. '), tip('buff-willow', 'Buff willow'), t(' from a UK supplier soaks up reliably and is the recommended starting material. The base is woven in '), tip('pairing', 'pairing'), t(' weave, then finished with a '), tip('trac-border', 'trac border'), t(' to form a low rim.')),
    BASKETRY_SAFETY,
    h2('Materials'),
    p('Buff willow rods: 20 base stakes at 3 foot length (90 cm), 2.5 to 3 mm diameter. Eight to ten pairing weavers at 4 foot length (120 cm), 2 to 2.5 mm diameter. Soak all rods in a soaking trough for 1 hour before use.'),
    h2('Tools'),
    p('A bodkin for opening paths in the weave; a rapping iron for packing down rows; secateurs for trimming ends; a soaking trough.'),
    h2('Method'),
    ol(
      li('Lay 10 base stakes in a bundle with their butt ends pointing left. Thread the remaining 10 stakes through the centre of the bundle at right angles to form the slath: 5 stakes on each side of the centre crossing.'),
      lin(t('Open the '), tip('slath', 'slath'), t(' by working two pairers around the four groups of base stakes, one pair at a time. Two rods make the pairing weavers: hold both rods together, then pass one in front of one group and behind the next group; twist the other rod over it and pass it behind the next group. Continue for two full circuits until the base stakes are spread evenly.')),
      li('Open the base stakes out individually: work two more circuits of pairing, this time weaving around each stake individually. All 20 stakes should now be evenly spaced like a sun-ray pattern.'),
      pn(t('Continue '), tip('pairing', 'pairing'), t(' until the tray base reaches 22 cm square. Add new weavers by laying a new rod alongside the old one at a base stake and continuing with the new rod as the old one runs out.')),
      li('Pack down each row with the rapping iron after every three circuits. The rapping iron drives the weavers toward the center, keeping the weave dense.'),
      li('Finish with a trac border when the base is the target size: bend each base stake down in front of one upright and behind the next, then tuck it inside the last row of weaving. Work all stakes in sequence around the perimeter.')
    ),
    h2('Finishing'),
    p('Trim all weaver ends flush with secateurs. Let the tray dry flat on a board for 2 days. The buff willow will lighten as it dries.'),
    h2('Variations'),
    ul(
      li('Round base: start with 6 stakes pierced through 6 stakes (12 stakes total), fan them out in a circle, and pair around them.'),
      li('Randing instead of pairing: single-weaver plain weave. Produces a flatter, lighter base but requires an odd number of stakes.'),
      li('Natural brown willow instead of buff: slightly stiffer; soak for 3 hours rather than 1.')
    ),
    ts([
      { symptom: 'Base stakes are unevenly spaced after opening the slath', cause: 'The first two circuits of pairing did not spread the stake groups evenly', fix: 'After the first two circuits, count the spaces between stakes. If one section has twice the gap, pause and re-space that section by hand before continuing.' },
      { symptom: 'Weave is loose and the weavers shift when rapped', cause: 'Rods not packed down frequently enough', fix: 'Rap down after every two circuits, not every three. On beginner work, more frequent rapping produces a denser result.' },
      { symptom: 'Trac border stakes crack when bent down', cause: 'Willow too dry at the border stage', fix: 'Dampen the stakes with a wet cloth before bending. If the rods have dried out during weaving, re-soak for 15 minutes before attempting the border.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 22 Basketry: rush-mat-round-plait
// ─────────────────────────────────────────────
write('22-rush-mat-round-plait.json', {
  slug: 'rush-mat-round-plait',
  title: 'Rush mat, round plait',
  subtitle: 'Small round mat or coaster from plaited soft rush',
  excerpt: 'A small round mat or coaster in plaited soft rush, built up from the centre as a flat spiral. Rush is a different material to willow: softer, more pliable, and worked flat. A first project for rush craft.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'basketry-willow',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on rush work. Caulfield and Saward, Dictionary of Needlework (1882) on plaited rush mats.",
  recipeTools: [
    { slug: 'secateurs', isOptional: false }, { slug: 'bodkin', isOptional: false },
    { slug: 'soaking-trough', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'soft-rush', term: 'Soft rush', definition: 'Juncus effusus, the common UK rush. Harvested in midsummer when the stem is firm, dried to a buff-olive colour for plaiting.' },
    { slug: 'coiling', term: 'Coiling', definition: 'A basketry construction method where a continuous element is coiled in a flat spiral, each row lashed or plaited to the previous one.' },
    { slug: 'pairing', term: 'Pairing', definition: 'A two-element weave where two strands alternate, one crossing over the other between each upright.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(tip('soft-rush', 'Soft rush'), t(' produces flat mats and coasters by '), tip('coiling', 'coiling'), t(': a bundle of rushes is coiled from the centre outward while a binding rush holds each row to the last. The '), tip('pairing', 'pairing'), t(' technique locks each new coil to the previous one. Rush is much softer than willow and can be worked on the lap without a shaving horse or bodkin for most of the construction.')),
    BASKETRY_SAFETY,
    h2('Materials'),
    p('Dried soft rush: a bundle 8 cm in circumference and 90 cm long (about 30 to 40 individual rush stems). Soak in cold water for 5 minutes before use; soft rush needs only a short soak, not the long soaks needed for willow rods. Wrap in a damp cloth and leave for 20 minutes to mellow before starting.'),
    h2('Tools'),
    p('Secateurs for trimming ends; a bodkin for opening paths in the weave at the centre; no rapping iron needed.'),
    h2('Method'),
    ol(
      li('Take four rush stems and fold them at their centre. You now have eight stem ends forming the starting bundle. Wrap a binding rush around this bundle twice at the centre fold, then fold the whole bundle in half again: the result is a small 16-stem core.'),
      li('Hold the core in the left hand and begin coiling: bring the binding rush around the outside of the core, then back through the centre, working in a clockwise direction. With each pass, the core extends outward as new rush stems are added to it. Keep the coil flat on the knee or a board.'),
      pn(t('Use '), tip('pairing', 'pairing'), t(' to lock each new coil row to the previous: pass the binding rush in front of one section of the last row and behind the next, then cross it with a second binding rush doing the same in the opposite direction. This keeps each row from pulling away from the last.')),
      li('Continue adding rush to the working bundle and coiling outward until the mat reaches 18 cm in diameter.'),
      li('To finish the outer edge: tuck each rush stem end back through the last two rows of the mat with the bodkin. Pull the tuck tight and trim the surplus with secateurs.')
    ),
    h2('Finishing'),
    p('Leave the mat flat to dry for 24 hours under a book or flat weight to prevent warping. Rush shrinks and the mat will firm up as it dries.'),
    h2('Variations'),
    ul(
      li('Square mat: coil in straight sections rather than curves, turning 90-degree corners on each row. More difficult to keep flat.'),
      li('Two-colour mat: alternate bleached rush with natural brown for a striped pattern.'),
      li('Larger placemat: extend to 28 cm diameter. The centre coiling technique is identical; the outer rows simply increase the circuit count.')
    ),
    ts([
      { symptom: 'Mat curves upward at the edges as it dries', cause: 'Centre section too tight; outer rows too loose', fix: 'Keep consistent tension throughout. Press the mat flat under a weighted board within the first hour of drying, before it sets.' },
      { symptom: 'Binding rush breaks mid-coil', cause: 'Rush stem too dry or a weak section at a node', fix: 'Join in a new binding rush at a rush stem end. Overlap the old and new rush by 4 cm; the overlapping section holds by friction.' },
      { symptom: 'Rush ends work loose at the outer edge', cause: 'Tuck too short or not pulled tight enough', fix: 'Each tuck must pass through at least two rows of the mat. Use the bodkin to open a path that crosses two rows, then pull the tuck firm before trimming.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 23 Basketry: willow-window-box-liner
// ─────────────────────────────────────────────
write('23-willow-window-box-liner.json', {
  slug: 'willow-window-box-liner',
  title: 'Willow window box liner',
  subtitle: 'Woven willow surround for a standard window box planter',
  excerpt: 'A woven willow liner for a standard window box: four staked sides in pairing weave, no base. The willow stakes are inserted into the soil at the box edges and the weavers wrap around the planter exterior.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'basketry-willow',
  woodState: 'green', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on willow craft and outdoor basketwork. Caulfield and Saward, Dictionary of Needlework (1882) on woven panels.",
  recipeTools: [
    { slug: 'bodkin', isOptional: false }, { slug: 'secateurs', isOptional: false },
    { slug: 'soaking-trough', isOptional: false }, { slug: 'rapping-iron', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'stake-and-strand', term: 'Stake-and-strand', definition: 'The willow-basket weave structure where vertical stakes form the skeleton and horizontal weavers pass between them.' },
    { slug: 'pairing', term: 'Pairing', definition: 'A two-weaver technique: two weavers alternate, each crossing in front of one stake and behind the next.' },
    { slug: 'upset', term: 'Upset', definition: 'The first few rows of weaving above the base that lock the stakes upright and set the angle of the sides.' },
    { slug: 'buff-willow', term: 'Buff willow', definition: 'Boiled and bark-stripped willow; the standard UK basketry material. Weathers to silver-grey outdoors.' },
    { slug: 'trac-border', term: 'Trac border', definition: 'A simple one-rod border: each stake passes in front of one upright and behind the next, then tucks inside.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('A willow window-box liner wraps the outside of an existing planter in woven '), tip('buff-willow', 'buff willow'), t('. There is no base: the stakes are inserted into the soil at the planter edges and the '), tip('stake-and-strand', 'stake-and-strand'), t(' weave builds up around the exterior. A '), tip('trac-border', 'trac border'), t(' finishes the top. This is a beginner woven panel project: the only '), tip('pairing', 'pairing'), t(' technique is worked on a rectangular form with fixed corners.')),
    BASKETRY_SAFETY,
    h2('Materials'),
    p('Measure the window box: standard UK size is 60 cm long, 20 cm wide, 20 cm tall. For a liner of this size: 24 stakes at 3 foot (90 cm) length, 3 to 3.5 mm diameter; two bundles of pairers at 4 foot (120 cm) length, 2 to 2.5 mm diameter. Soak all rods for 1 hour before use.'),
    h2('Tools'),
    p('A bodkin; secateurs; a rapping iron; a soaking trough.'),
    h2('Method'),
    ol(
      li('Insert the stakes into the soil around the planter perimeter: one stake per 5 cm, pushed 10 cm into the soil at the planter wall edge. The stakes stand upright against the outside of the planter.'),
      lin(t('Work the '), tip('upset', 'upset'), t(': two circuits of '), tip('pairing', 'pairing'), t(' close to the soil surface. Use two weavers simultaneously, alternating them around each stake. The upset locks the stakes upright and sets the angle for the main weave.')),
      li('Continue pairing up the sides in circuits, adding new weavers as old ones run out. Pack each row down with the rapping iron after two circuits.'),
      li('At the corners, the stakes are closer together. Work the corner stake last in each circuit; the weaver passes in front of it and behind the first stake on the next face.'),
      li('Continue weaving to within 5 cm of the stake tips. At this point the stakes have 5 cm of length remaining above the last row of weaving.'),
      li('Work the trac border: bend the first stake in front of the next stake and behind the one after, then tuck the tip inside the last row. Repeat for each stake in sequence around all four sides.')
    ),
    h2('Finishing'),
    p('Trim any protruding weaver ends flush with secateurs. The buff willow will weather to silver-grey outdoors over the first summer. No treatment is needed or recommended; preservatives prevent the natural weathering colour.'),
    h2('Variations'),
    ul(
      li('Randing weave instead of pairing: use a single weaver for a simpler pattern. Requires an odd number of stakes.'),
      li('Dark willow for contrast: mix buff willow stakes with brown willow weavers for a two-tone panel.'),
      li('Wider planter: add additional stakes at the same 5 cm spacing. The pairing technique is identical regardless of planter length.')
    ),
    ts([
      { symptom: 'Stakes lean outward as weaving progresses', cause: 'Upset rows not packed tightly enough at the base', fix: 'Re-work the upset rows, rapping each row very firmly with the rapping iron. Two tight upset rows prevent all subsequent leaning.' },
      { symptom: 'Corner gaps widen as weaving progresses', cause: 'Corner stake not treated consistently in each circuit', fix: 'On each circuit, always pass the weaver in front of the corner stake, then immediately behind the first stake on the new face. Consistent treatment at each corner keeps the gap closed.' },
      { symptom: 'Trac border snaps when bending down the stakes', cause: 'Stakes dried out before the border was worked', fix: 'Dampen the top 10 cm of each stake with a wet cloth before beginning the trac border.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 24 Basketry: willow-staking-and-upsetting (TECHNIQUE)
// ─────────────────────────────────────────────
write('24-willow-staking-and-upsetting.json', {
  slug: 'willow-staking-and-upsetting',
  title: 'Willow staking and upsetting',
  subtitle: 'The two foundational moves that start every stake-and-strand basket',
  excerpt: 'Staking and upsetting are the foundation of all stake-and-strand basketry. Covers inserting stakes into a completed base, pricking the stakes upright, and working the first upset rows to set the basket angle.',
  type: 'TECHNIQUE', categorySlug: 'wood-natural-craft', subCategorySlug: 'basketry-willow',
  difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on stake-and-strand willow basketry. Caulfield and Saward, Dictionary of Needlework (1882) on willow work.",
  recipeTools: [
    { slug: 'bodkin', isOptional: false }, { slug: 'secateurs', isOptional: false },
    { slug: 'soaking-trough', isOptional: false }, { slug: 'rapping-iron', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'stake-and-strand', term: 'Stake-and-strand', definition: 'Willow-basket weave structure: vertical stakes form the rigid skeleton; horizontal weavers pass between them.' },
    { slug: 'upset', term: 'Upset', definition: 'The first rows of weaving above the base that lock the stakes upright and set the basket-side angle.' },
    { slug: 'pairing', term: 'Pairing', definition: 'A two-weaver technique: two weavers alternate around each stake, crossing one over the other between each upright.' },
    { slug: 'bye-stake', term: 'Bye-stake', definition: 'A short stake added beside each main stake after the upset, doubling the upright density for the main weave.' },
    { slug: 'buff-willow', term: 'Buff willow', definition: 'Boiled and bark-stripped willow; the standard basketry rod. Soak for 1 hour before use.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('Every '), tip('stake-and-strand', 'stake-and-strand'), t(' basket starts the same way: the stakes are inserted into the completed base, bent upright, and locked with the '), tip('upset', 'upset'), t(' rows. The upset sets the angle at which the sides will grow. A tight steep upset produces near-vertical sides; a loose open upset produces a wide-bellied basket. '), tip('buff-willow', 'Buff willow'), t(' is the standard material.')),
    BASKETRY_SAFETY,
    h2('Preparing the stakes'),
    p('Stakes should be 2.5 to 3 times the height of the finished basket, plus the depth that enters the base. Cut them on a slant at the butt end with secateurs so they enter the base weave more easily. Soak for 1 hour and mellow for 20 minutes under a damp cloth.'),
    h2('Inserting the stakes'),
    p('Use the bodkin to open a path alongside each base stake at the outer edge of the base. Twist the bodkin in the direction of the weave to ease the path open. Insert the new side stake butt-end-first until it reaches the slath. Each side stake should sit firmly against its corresponding base stake.'),
    h2('Pricking up'),
    p('Fold each side stake toward the centre of the base at the point where it exits the last weave row. The fold creates a sharp kink. Work all the way round. Then bend all the stakes upright together. The kink prevents the stakes from cracking at the base and holds them upright during the upset.'),
    h2('Working the upset'),
    ol(
      lin(t('Insert two '), tip('pairing', 'pairing'), t(' weavers at the same stake, butt ends pointing in the same direction. Work the first circuit of pairing: first weaver in front of one stake, behind the next; second weaver in front of the stake behind which the first passed. The two weavers alternate around the basket.')),
      li('Work two full circuits of pairing, packing each row down firmly with the rapping iron after each complete circuit. These two circuits are the upset.'),
      li('The angle of the stakes above the upset is the angle of the basket sides. If the stakes lean inward, the sides will curve inward. Correct the angle now, before adding more weave: adjust by packing the upset rows tighter on the lean side.')
    ),
    h2('Adding bye-stakes'),
    pn(t('After the upset, insert '), tip('bye-stake', 'bye-stakes'), t(' beside each main stake using the bodkin. Bye-stakes are shorter than the main stakes; their butt ends enter the base weave and their tips extend to the final basket height. The doubled upright density provides a finer weave surface for the main body.')),
    ts([
      { symptom: 'Stakes pop out of the base during pricking up', cause: 'Stake entered the base at too shallow an angle; not enough grip in the weave', fix: 'The stake must enter beside its base stake and reach the slath. If the stake is short of the slath, it will not grip. Re-insert with a longer stake.' },
      { symptom: 'Sides lean in one direction after the upset', cause: 'One side of the upset was packed tighter than the other', fix: 'Correct the angle by inserting an extra row of pairing on the leaning side only. This adds height on that side and pushes the stakes to the correct angle.' },
      { symptom: 'Bye-stakes buckle when inserted', cause: 'Bodkin path too narrow for the bye-stake diameter', fix: 'Use the bodkin to open a larger path. Twist the bodkin against the weave direction to widen the path before inserting the bye-stake.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 25 Basketry: willow-border-finishing (TECHNIQUE)
// ─────────────────────────────────────────────
write('25-willow-border-finishing.json', {
  slug: 'willow-border-finishing',
  title: 'Willow border finishing',
  subtitle: 'Trac border and three-rod border for the top of a willow basket',
  excerpt: 'Two standard basket-finishing borders: the trac border (simple, one rod) and the three-rod border (plaited, structural). Covers the sequence of moves, how to close the border, and how to tuck ends.',
  type: 'TECHNIQUE', categorySlug: 'wood-natural-craft', subCategorySlug: 'basketry-willow',
  difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on willow basket borders. Caulfield and Saward, Dictionary of Needlework (1882) on finishing borders.",
  recipeTools: [
    { slug: 'bodkin', isOptional: false }, { slug: 'secateurs', isOptional: false },
    { slug: 'soaking-trough', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'border', term: 'Border', definition: 'The finishing technique that bends the stake tips down to form the basket rim, securing the top of the weave.' },
    { slug: 'trac-border', term: 'Trac border', definition: 'A simple one-rod border: each stake passes in front of one upright and behind the next, then tucks inside the weave. The standard beginner finishing move.' },
    { slug: 'three-rod-border', term: 'Three-rod border', definition: 'A border in which three adjacent stakes are woven together around the remaining uprights to form a plaited rim. Stronger and more decorative than a trac border.' },
    { slug: 'stake-and-strand', term: 'Stake-and-strand', definition: 'The willow-basket weave structure. The border closes the stake tops and locks the weave permanently.' },
    { slug: 'pairing', term: 'Pairing', definition: 'Two-weaver alternating weave, used for the last two waling rows before the border to ensure the stakes are evenly spaced.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('The '), tip('border', 'border'), t(' locks the top of the basket permanently. Without a border, the stakes would straighten under the weave tension and the basket would lose its shape. The '), tip('trac-border', 'trac border'), t(' is the first border to learn; the '), tip('three-rod-border', 'three-rod border'), t(' follows when the trac is confident. Both require the stakes to be damp and flexible at the time of working; a dry stake snaps rather than bends.')),
    BASKETRY_SAFETY,
    h2('Preparing for the border'),
    pn(t('Work two final rows of '), tip('pairing', 'pairing'), t(' before the border to ensure even stake spacing. Cut away any weaver ends that protrude above the last row. The '), tip('stake-and-strand', 'stake tips'), t(' should stand 12 to 15 cm above the last weave row. If shorter, the border tucks will not reach inside the weave.')),
    h2('Trac border'),
    ol(
      li('Kink the first stake at the top of the last weave row by folding it forward toward the basket interior at the point it exits the weave. This kink prevents cracking during the bend.'),
      li('Pass the kinked stake in front of the next upright stake and behind the one after that. The tip should protrude inside the basket by at least 4 cm.'),
      li('Work each stake in sequence around the basket, always in front of one, behind one, then tucked inside. When you reach the last three stakes, the previously tucked ends will be in the way; thread the final stakes under them in sequence.'),
      li('Tighten the border by pulling each tuck from inside the basket with the bodkin. The border should sit level all the way around. Trim the tucked ends flush with the last weave row inside.')
    ),
    h2('Three-rod border'),
    ol(
      li('Kink three adjacent stakes at the last weave row. Lay them down to the right, in front of the next three standing stakes.'),
      li('Take the first of the three lying stakes and weave it: in front of the first standing stake, behind the second, then lay it down to the right again. The standing stake it passed in front of can now also be kinked down.'),
      li('Repeat the same move with the second and then third lying stake. Each move adds one more kinked stake to the set that is being woven down. After three moves, the working group always has three lying stakes.'),
      li('Continue until all stakes have been woven down. Close the border by threading the last three moving ends through the loops formed by the first three stakes at the start, tucking them inside. Use the bodkin to open space for the tucked ends.')
    ),
    ts([
      { symptom: 'Border stakes snap when kinked', cause: 'Stakes too dry at the time of working', fix: 'Soak the top 15 cm of each stake in water for 30 minutes before beginning the border. A damp stake bends without snapping.' },
      { symptom: 'Trac border is uneven; some sides lower than others', cause: 'Inconsistent kink height on each stake', fix: 'Mark the kink point on each stake with a pencil line at the same height above the last weave row before beginning. Work to this line.' },
      { symptom: 'Three-rod border has a gap at the closing join', cause: 'The last three ends were not threaded through the correct loops at the start', fix: 'At the three-rod border closing, each final end must thread under two elements. Thread under the pair of ends laid down in the very first move at the start of the border.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 26 Basketry: rush-preparation (READING)
// ─────────────────────────────────────────────
write('26-rush-preparation.json', {
  slug: 'rush-preparation',
  title: 'Rush preparation',
  subtitle: 'How to harvest, dry, sort, and condition soft rush for basketry',
  excerpt: 'A short reading on the full preparation cycle for soft rush: when to harvest, how to dry and sort, and how to condition it before use. Rush prepared incorrectly becomes brittle and snaps during plaiting.',
  type: 'READING', categorySlug: 'wood-natural-craft', subCategorySlug: 'basketry-willow',
  difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on rush harvest and preparation. Morton, J.P., Rural Industries of England and Wales: Basket-Making (1926) on rush work.",
  glossaryTerms: [
    { slug: 'soft-rush', term: 'Soft rush', definition: 'Juncus effusus, the common UK rush. A hollow-stemmed plant of wet ground, harvested for its straight stems for basketry and plaiting.' }
  ],
  body: { type: 'doc', content: [
    pn(tip('soft-rush', 'Soft rush'), t(' (Juncus effusus) grows in damp meadows, beside ponds, and on wet clay soil. It is the standard UK rush for basketry, seat-weaving, and rush mats. The stem is round, hollow, and smooth, growing to 60 to 90 cm in height. It is not the same species as the yellow flag iris (which is not suitable for basketry) or the hard rush (Juncus inflexus, which is stiffer and darker green).')),
    h2('When to harvest'),
    p("Harvest between mid-July and mid-August in the UK. At this time the stem is fully grown, still green and flexible, and the internal air-pocket structure is intact. Harvesting too early (June) produces stems that shrink excessively when dried. Harvesting too late (September onward) produces brittle stems with a damaged internal structure. Cut with secateurs or a sharp knife at the base of the stem; leave the root in place so the stand regrows the following year."),
    h2('Drying'),
    p('Shake the cut stems to remove any surface water. Arrange in loose bundles of 20 to 30 stems and hang or stand them in a dry, airy location out of direct sun. Direct sun bleaches the stems unevenly and can make them brittle. Air-dry for 4 to 6 weeks. The stems go from green to a buff-olive brown as they dry. They are ready when they feel light and make a slight rustle when a bundle is moved.'),
    h2('Sorting'),
    p('Sort dried rush by length and diameter before storing. Full-length stems (70 cm or more) go in one bundle for seat-weaving and large mats. Medium stems (40 to 70 cm) go in another bundle for rush coiling and small mats. Short and broken stems are useful for core material in coiled work. Discard any stems that show mould, black patches, or that are already brittle. Store bundles loosely tied in a dry place; rush stored in plastic becomes mouldy.'),
    h2('Conditioning before use'),
    p("Rush must be re-moistened before use. Dry rush snaps during plaiting. Lay the bundle of stems on a damp cloth or on a table that has been wiped with a wet cloth. Sprinkle water over the stems. Roll them up in the damp cloth and leave for 20 to 30 minutes. The stems should be pliable but not wet through: if water runs out of the bundle when you squeeze it, the stems are over-wetted. Over-wetted rush stretches during plaiting and shrinks excessively when it dries, leaving gaps in the finished work."),
    h2('Long-term storage'),
    p('Properly dried rush stored in a dry location keeps for 2 to 3 years without significant deterioration. The stems become progressively more brittle with age, requiring longer conditioning times before use. Rush more than 3 years old may need a 40-minute conditioning period and should be tested on a small sample before committing to a large project.')
  ]}
})

// ─────────────────────────────────────────────
// 27 Basketry: willow-shopping-basket
// ─────────────────────────────────────────────
write('27-willow-shopping-basket.json', {
  slug: 'willow-shopping-basket',
  title: 'Willow shopping basket',
  subtitle: 'Classic oval buff-willow shopping basket with rope handle',
  excerpt: 'A full oval shopping basket in buff willow: oval slath base, staked and upset sides in pairing weave, three-rod border, and a twisted rope handle. An intermediate project that brings together all the basic basketry techniques.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'basketry-willow',
  woodState: 'green', difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on willow shopping baskets. Caulfield and Saward, Dictionary of Needlework (1882) on oval-base basket construction.",
  recipeTools: [
    { slug: 'bodkin', isOptional: false }, { slug: 'rapping-iron', isOptional: false },
    { slug: 'secateurs', isOptional: false }, { slug: 'soaking-trough', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'slath', term: 'Slath', definition: 'The central crossed-stake structure of the basket base, through which the first weavers lock the base stakes in position.' },
    { slug: 'stake-and-strand', term: 'Stake-and-strand', definition: 'Willow-basket weave structure: vertical stakes form the skeleton; weavers pass between them.' },
    { slug: 'pairing', term: 'Pairing', definition: 'Two-weaver alternating weave; the standard willow-basket body weave.' },
    { slug: 'upset', term: 'Upset', definition: 'The first rows of weaving above the base that set the basket-side angle.' },
    { slug: 'buff-willow', term: 'Buff willow', definition: 'Boiled and stripped willow; the standard basketry rod. Golden-brown in colour, consistent in diameter.' },
    { slug: 'bye-stake', term: 'Bye-stake', definition: 'A short stake inserted beside each main side stake after upsetting, doubling the upright density.' },
    { slug: 'border', term: 'Border', definition: 'The finishing technique that bends down the stake tips to form the basket rim.' },
    { slug: 'three-rod-border', term: 'Three-rod border', definition: 'A plaited border where three stakes are woven around the remaining uprights to form a strong, decorative rim.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('A shopping basket needs a flat oval base, near-vertical sides, and a handle strong enough to carry 5 to 6 kg. '), tip('buff-willow', 'Buff willow'), t(' in a 3 to 4 mm diameter is the correct weight for this size. The '), tip('slath', 'slath'), t(' base method here produces an oval base 30 cm by 20 cm. The sides are in '), tip('stake-and-strand', 'stake-and-strand'), t(' construction, woven in '), tip('pairing', 'pairing'), t(' weave with '), tip('bye-stake', 'bye-stakes'), t(' added after the '), tip('upset', 'upset'), t('. A '), tip('border', 'border'), t(' closes the top: the '), tip('three-rod-border', 'three-rod border'), t(' is used here for a strong rim.')),
    BASKETRY_SAFETY,
    h2('Materials'),
    p('Buff willow: 12 base stakes at 4 foot (120 cm), 3.5 to 4 mm; 20 side stakes at 30 inches (75 cm), 3 to 3.5 mm; 20 bye-stakes at 24 inches (60 cm), 2.5 to 3 mm; pairing weavers (a full bundle of 4 foot rods, 2 to 2.5 mm diameter); two stout rods for the handle (5 to 6 mm diameter, 30 inches/75 cm). Soak all rods for 1 to 2 hours. The heavier base stakes may need 2 hours.'),
    h2('Base'),
    ol(
      li('Lay 6 base stakes horizontally. Pierce 6 more through the centre of the first 6 to form the slath cross. Open the slath with two pairers, working two circuits around each group of 3 stakes, then opening to weave around each stake individually.'),
      lin(t('Work '), tip('pairing', 'pairing'), t(' outward from the centre, stretching the oval gently with your hands as you weave to elongate the base toward 30 cm by 20 cm. Add new pairers as old ones run out. Rap down each row after 3 circuits.')),
      li('Continue until the base measures 30 cm by 20 cm. Trim the base-stake ends flush with the outer edge of the last weave row.')
    ),
    h2('Staking and upsetting'),
    ol(
      lin(t('Insert side stakes beside each base stake using the bodkin. Prick up all stakes. Work two rows of '), tip('upset', 'upset'), t(' pairing close to the base, packing down firmly. Adjust stake angles to near-vertical.')),
      lin(t('Insert '), tip('bye-stake', 'bye-stakes'), t(' beside each side stake. Continue pairing around all uprights (main stakes and bye-stakes) until the sides reach 18 cm height.'))
    ),
    h2('Border and handle'),
    ol(
      lin(t('Work the '), tip('three-rod-border', 'three-rod border'), t(' to close the basket top. See the Willow border finishing entry for the full sequence.')),
      li('Thread two stout handle rods alongside two stakes on opposite sides of the basket, passing them deep into the weave alongside the stake. Twist the two handle rods together into a rope and arc them over the basket top. Bring both rod ends down on the opposite side and thread them alongside two stakes there. Tuck the ends deep into the weave and trim.')
    ),
    h2('Finishing'),
    p('Trim all weaver ends inside the basket with secateurs. Leave to dry for 48 hours before loading. The basket firms up significantly as the buff willow dries.'),
    h2('Variations'),
    ul(
      li('Side handles instead of overhead: two short loops of stout rod through the side weave, 5 cm above the base.'),
      li('Smaller basket for bread: 20 cm by 15 cm base, 12 cm sides. Use 2.5 mm diameter rods throughout.'),
      li('Natural brown willow: slightly stiffer weave; soak heavy rods for 3 hours.')
    ),
    ts([
      { symptom: 'Base oval loses its shape and becomes round', cause: 'Not stretching the base during pairing', fix: 'After every 5 circuits of base pairing, hold the base with both hands and pull gently on the long axis to maintain the oval. The weave is pliable while wet.' },
      { symptom: 'Sides belly outward above the upset', cause: 'Upset rows not packed tightly enough', fix: 'Re-work the upset: rap each row very firmly with the rapping iron before moving to the next row. The tight upset rows anchor the stake angle.' },
      { symptom: 'Handle pulls free on one side under load', cause: 'Handle rod not threaded deep enough into the weave', fix: 'The handle rod must pass beside a stake for at least 5 cm into the weave, ideally 8 cm. Re-insert with a bodkin to open a deeper path.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 28 Seasoned-wood: pine-display-shelf-through-tenon
// ─────────────────────────────────────────────
write('28-pine-display-shelf-through-tenon.json', {
  slug: 'pine-display-shelf-through-tenon',
  title: 'Pine display shelf with through tenons',
  subtitle: 'Wall-mounted shelf in pine with decorative through-tenon bracket joints',
  excerpt: 'A wall-mounted shelf in pine: a shelf board held between two vertical bracket uprights joined with through tenons. The tenons protrude through the uprights and are wedged for a decorative visible joint.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'seasoned-wood',
  woodState: 'seasoned', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Newey and Drage, Practical Carpentry and Joinery (c.1910) on through-tenon furniture construction. Cassell's Household Guide on shelf and bracket construction.",
  recipeTools: [
    { slug: 'tenon-saw', isOptional: false }, { slug: 'mortise-chisel-9mm', isOptional: false },
    { slug: 'mallet-carpenters', isOptional: false }, { slug: 'marking-gauge', isOptional: false },
    { slug: 'try-square-200mm', isOptional: false }, { slug: 'marking-knife', isOptional: false },
    { slug: 'wood-finish-danish-oil', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Air-dried or kiln-dried timber at stable moisture content. Essential for joinery: green or unseasoned wood will move and rack the joint.' },
    { slug: 'tenon', term: 'Tenon', definition: 'The male part of a mortise-and-tenon joint: a tongue of wood cut at the end of the shelf board to fit inside the upright mortise.' },
    { slug: 'mortise', term: 'Mortise', definition: 'A rectangular cavity cut into the upright bracket to receive the shelf tenon.' },
    { slug: 'kerf', term: 'Kerf', definition: 'The width of material removed by a saw blade. Layout lines are placed on the waste side of the kerf when cutting the tenon cheeks.' }
  ],
  techniqueSlugs: ['mortise-and-tenon-technique'],
  criticalTechniques: ['mortise-and-tenon-technique'],
  body: { type: 'doc', content: [
    pn(t('A through '), tip('tenon', 'tenon'), t(' is one of the most useful joints in small furniture: the shelf board extends through the upright bracket as a '), tip('tenon', 'tenon'), t(' and the protruding end is wedged to lock it permanently. The joint is structural (it carries the shelf load) and decorative (the wedged end is visible on the bracket face). The uprights are the '), tip('mortise', 'mortise'), t(' members; the shelf board is the tenon member. Both are in '), tip('seasoned-wood', 'seasoned'), t(' pine.')),
    SAFETY,
    h2('The wood'),
    p('Two upright brackets: 50 cm tall, 8 cm wide, 2.5 cm thick in seasoned pine. One shelf board: 60 cm long, 20 cm wide, 2.5 cm thick in seasoned pine. Both from finished planed timber.'),
    h2('Tools'),
    pn(t('A tenon saw; a 9 mm mortise chisel; a carpenter\'s mallet; a marking gauge for the tenon layout lines; a try-square; a marking knife; Danish oil.')),
    h2('Method: mortises'),
    ol(
      li('Mark the mortise positions on each upright: centred on the width, 30 cm from the bottom. The mortise is 20 mm wide and 200 mm tall (the full shelf-board thickness plus 5 mm clearance each side).'),
      lin(t('Set the marking gauge to centre the '), tip('mortise', 'mortise'), t(' on the upright thickness. Score both shoulder lines with the marking knife and the gauge lines down each face.')),
      li('Chop the mortise with the 9 mm chisel: start at the centre and chop toward each end in sequence, clearing chips as you go. Work to half depth from one face, then flip the upright and meet from the other face. Clean the mortise walls with paring cuts.')
    ),
    h2('Method: tenons'),
    ol(
      lin(t('Mark the '), tip('tenon', 'tenon'), t(' on the shelf board ends with the marking gauge and try-square. The tenon is 20 mm wide, 200 mm tall, and 25 mm long (equal to the upright thickness). Mark the '), tip('kerf', 'kerf'), t(' waste side with a pencil X.')),
      li('Cut the tenon cheeks with the tenon saw: hold the board in a vise and saw along the cheek lines, keeping the saw to the waste side of the kerf. Saw the shoulder lines last.'),
      li('Test the fit in the mortise. The tenon should enter with light mallet pressure. If it is too tight, pare the cheeks with a chisel. Never force: a tight fit causes the mortise walls to split.')
    ),
    h2('Assembly and wedging'),
    ol(
      li('Saw a kerf down the centre of each tenon end, 15 mm deep, running parallel to the shelf face.'),
      li('Cut two small hardwood wedges: 20 mm long, 3 mm thick at the wide end tapering to 1 mm.'),
      li('Assemble the shelf dry (no glue). Drive the tenons through the mortises with the mallet. Drive one wedge into each tenon kerf from the protruding face. The wedge spreads the tenon end inside the mortise and locks the joint permanently.')
    ),
    h2('Finishing'),
    p('Sand all surfaces through 120, 180, and 240 grit. Apply Danish oil, three coats with a light rub between coats two and three. Danish oil is not food-safe but is suitable for a display shelf.'),
    h2('Variations'),
    ul(
      li('Oak instead of pine: harder and more decorative, especially if the shelf is to hold books or plants.'),
      li('Multiple shelves on the same uprights: add additional mortises at 25 cm intervals up the upright length.'),
      li('Carved bracket ends: cut the bottom of each upright into a simple arc profile with a coping saw before assembly.')
    ),
    ts([
      { symptom: 'Mortise wall splits when chopping', cause: 'Chisel driven past the layout line at the mortise end', fix: 'Always chop toward the centre, not toward the end wall. The end wall is the last thing to be cut, not the first.' },
      { symptom: 'Tenon is too loose in the mortise after wedging', cause: 'Tenon was cut under size', fix: 'Wrap the tenon cheeks in a thin strip of veneer glued in place. Let the glue dry before assembling.' },
      { symptom: 'Shelf tilts after assembly', cause: 'Mortise positions on the two uprights are not at the same height', fix: 'Mark both uprights simultaneously by clamping them face-to-face and marking across both with a square.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 29 Seasoned-wood: oak-serving-board-handled
// ─────────────────────────────────────────────
write('29-oak-serving-board-handled.json', {
  slug: 'oak-serving-board-handled',
  title: 'Oak serving board with handle',
  subtitle: 'Paddle-shaped serving board in seasoned oak with a through handle',
  excerpt: 'A paddle-shaped serving board in seasoned oak: a wide cutting surface and a shaped handle bored through for hanging. Plane flat, shape the handle, apply board butter. A clean first seasoned-wood project.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'seasoned-wood',
  woodState: 'seasoned', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Household Guide on kitchen board construction. Beeton's Book of Household Management on household boards and cutting surfaces.",
  recipeTools: [
    { slug: 'smoothing-plane-no-4', isOptional: false }, { slug: 'block-plane', isOptional: false },
    { slug: 'marking-gauge', isOptional: false }, { slug: 'try-square-200mm', isOptional: false },
    { slug: 'sloyd-knife', isOptional: true }, { slug: 'brace-and-bit', isOptional: false },
    { slug: 'leather-strop', isOptional: false }, { slug: 'wood-finish-board-butter', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Air-dried or kiln-dried timber at stable moisture content. Essential for kitchen boards: green wood warps and checks as it dries.' },
    { slug: 'grain', term: 'Grain', definition: 'The direction of the wood fibres. A serving board is planed along the grain for a clean surface.' },
    { slug: 'chamfer', term: 'Chamfer', definition: 'A flat 45-degree bevel cut along an edge or corner to remove the sharp arris.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A serving board is used at the table for bread, cheese, and charcuterie. This paddle shape is 35 cm long: 25 cm of wide cutting surface narrowing to a 10 cm shaped handle. The board is made from '), tip('seasoned-wood', 'seasoned'), t(' oak; the '), tip('grain', 'grain'), t(' should run along the board length. Oak is the best serving-board species for food safety: it has natural antimicrobial properties from the tannins, planes to a smooth surface, and takes a board-butter finish well.')),
    SAFETY,
    h2('The wood'),
    p('One board of seasoned oak: 35 cm long, 20 cm wide, 20 mm thick. The board face must be flat; a slight bow can be planed flat. Avoid boards with knots in the cutting surface. The handle section can include a small knot if it is sound and tight.'),
    h2('Tools'),
    pn(t('A smoothing plane (No. 4) for truing the face; a block plane for the '), tip('chamfer', 'chamfers'), t(' and the handle shaping; a marking gauge and try-square for layout; a brace and bit (12 mm) for the hanging hole; a sloyd knife for the handle profile (optional); board butter.')),
    h2('Method'),
    ol(
      li('Flatten the board face with the No. 4 plane. Work at 45 degrees to the grain for the first passes to knock down any high spots, then finish along the grain. Check with a straight-edge: the face must be flat to within 0.5 mm.'),
      li('Mark the board outline with a pencil: 25 cm wide cutting surface (the full board width), transitioning to a 5 cm wide handle over 5 cm, then the handle running the remaining 10 cm at 5 cm width. Draw both faces identically.'),
      li('Cut the handle profile on the band saw, coping saw, or by scoring with the marking knife and chiseling to the line. A straight-sided handle is simplest; a slightly narrowed waist is more comfortable.'),
      lin(t('Chamfer the edges of the cutting surface with the block plane: '), tip('chamfer', 'chamfer'), t(' at 45 degrees, 3 mm wide. Work with the '), tip('grain', 'grain'), t(' direction. Chamfering removes the sharp arris and reduces the chance of the edge chipping in use.')),
      li('Bore the hanging hole: 12 mm bore, centred 1.5 cm from the handle end. Bore from one face to halfway, then complete from the other face to prevent tearout.')
    ),
    h2('Finishing'),
    p('Sand the cutting surface through 120, 180, and 240 grit along the grain. Apply board butter: a beeswax-and-mineral-oil paste. Apply with a soft cloth, let stand 20 minutes, buff off. Re-apply monthly when in regular use.'),
    h2('Care'),
    p('Rinse under warm water, towel-dry immediately. Never soak or dishwasher. Re-apply board butter when the surface feels rough or looks dry.'),
    h2('Variations'),
    ul(
      li('Ash instead of oak: pale, slightly softer, food-safe. Does not have oak\'s antimicrobial tannins.'),
      li('Round board: cut the board face as a circle and drill the hanging hole in the centre.'),
      li('Carved grip instead of shaped handle: whittle the handle section to an oval cross-section with the sloyd knife.')
    ),
    ts([
      { symptom: 'Board surface is rough after planing', cause: 'Planing against the grain; the plane is tearing the fibres', fix: 'Check the grain direction at the board edge. The grain lines should run downhill in the direction of plane travel. If tearing occurs, plane from the other end.' },
      { symptom: 'Chamfer is uneven in width along the edge', cause: 'Block plane not held at a consistent angle', fix: 'Use the block plane fence or tape the edge as a guide. Rest the plane body at 45 degrees against the edge and keep it constant throughout the stroke.' },
      { symptom: 'Board warps after the first few uses', cause: 'Board was not fully seasoned when purchased', fix: 'Apply board butter to all faces (top, bottom, and edges) equally. One-sided finishing causes unequal moisture exchange and warping.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 30 Seasoned-wood: beech-breadboard-with-feet
// ─────────────────────────────────────────────
write('30-beech-breadboard-with-feet.json', {
  slug: 'beech-breadboard-with-feet',
  title: 'Beech breadboard with carved feet',
  subtitle: 'Flat beech breadboard with chamfered edges and four small carved bun feet',
  excerpt: 'A flat beech breadboard with chamfered edges and four small carved bun feet to lift it off the counter. The feet are carved with the sloyd knife from off-cuts of the same beech stock.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'seasoned-wood',
  woodState: 'seasoned', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Beeton's Book of Household Management on household bread boards. Cassell's Household Guide on kitchen woodware construction.",
  recipeTools: [
    { slug: 'smoothing-plane-no-4', isOptional: false }, { slug: 'block-plane', isOptional: false },
    { slug: 'sloyd-knife', isOptional: false }, { slug: 'leather-strop', isOptional: false },
    { slug: 'brace-and-bit', isOptional: false }, { slug: 'wood-finish-board-butter', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Air-dried or kiln-dried timber at stable moisture content. A breadboard in unseasoned wood will warp and crack.' },
    { slug: 'chamfer', term: 'Chamfer', definition: 'A flat 45-degree bevel along an edge. Chamfered edges on a breadboard reduce chipping and are comfortable to grip.' },
    { slug: 'grain', term: 'Grain', definition: 'The direction of the wood fibres. Planing along the grain produces a smooth surface; across the grain produces a rough one.' },
    { slug: 'push-cut', term: 'Push cut', definition: 'A knife cut driven away from the body, used to shape the bun feet from small off-cut blocks.' }
  ],
  techniqueSlugs: ['push-cut-technique'],
  criticalTechniques: ['push-cut-technique'],
  body: { type: 'doc', content: [
    pn(t('A breadboard is a flat board used for slicing bread at the table. This version is 35 cm by 25 cm in '), tip('seasoned-wood', 'seasoned'), t(' beech, with '), tip('chamfer', 'chamfered'), t(' edges and four small carved bun feet underneath. The feet are turned-style round pads carved from off-cuts with the sloyd knife using '), tip('push-cut', 'push cuts'), t(' on the round cross-section. Beech is the standard breadboard species: it planes to a very smooth surface along the '), tip('grain', 'grain'), t(', takes a board-butter finish well, and is stable in the warm, slightly damp conditions near a bread bin.')),
    SAFETY,
    h2('The wood'),
    p('One board of seasoned beech: 35 cm long, 25 cm wide, 20 mm thick. Four off-cut blocks for the feet: 5 cm by 5 cm by 3 cm each. All pieces should be kiln-dried or thoroughly air-dried beech; beech is the most prone of the common UK hardwoods to movement in damp conditions and must be fully seasoned before use.'),
    h2('Tools'),
    p('A No. 4 smoothing plane for truing the board face; a block plane for the chamfers; a sloyd knife and leather strop for the feet; a brace and bit for the foot attachment holes; board butter.'),
    h2('Method: the board'),
    ol(
      li('Flatten the board face with the No. 4 plane along the grain. Sand through 120, 180, and 240 grit along the grain. The cutting face should be flat and smooth.'),
      lin(t('Chamfer the top face edges with the block plane: '), tip('chamfer', 'chamfer'), t(' at 45 degrees, 4 mm wide. Work in one direction only on each edge; lifting the plane at the end of each stroke prevents tearout at the corners.')),
      li('Do not chamfer the underside edges; the square underside edges sit flat when the board is used without feet.')
    ),
    h2('Method: the feet'),
    ol(
      lin(t('Shape each foot block to a round cross-section with '), tip('push-cut', 'push cuts'), t(' on the sloyd knife. Target: 35 mm diameter, 20 mm tall. Round the top face to a gentle dome (the bun shape).')),
      li('Bore a 6 mm hole 10 mm deep in the centre of each foot top face. Bore a matching 6 mm hole 10 mm deep in the board underside at each corner, 4 cm from each edge.'),
      li('Fit a 6 mm wooden dowel (12 mm long) between each foot and the board: glue the dowel in the foot hole with PVA, let dry, then glue the protruding end into the board hole. Clamp overnight.')
    ),
    h2('Finishing'),
    p('Apply board butter to all board surfaces: top, underside, edges, and the feet. The full-surface treatment prevents unequal moisture exchange that causes warping.'),
    h2('Care'),
    p('Rinse under warm water, towel-dry immediately. Never soak or dishwasher. Apply board butter monthly when in daily use. The feet are glued on; protect them from prolonged soaking.'),
    h2('Variations'),
    ul(
      li('Larger board for a whole loaf: 45 cm by 30 cm, same construction.'),
      li('Juice groove: cut a shallow 5 mm groove around the top face perimeter 15 mm from the edge to catch bread crumbs.'),
      li('No feet version: a flat board without feet is simpler and works equally well on a flat counter.')
    ),
    ts([
      { symptom: 'Board surface is rough in one direction', cause: 'Planing across or against the grain', fix: 'Check the grain direction at the board edge. Plane only in the direction where the plane produces a clean shaving. Across-grain planing requires a cabinet scraper or sanding only.' },
      { symptom: 'Foot detaches after first use', cause: 'Dowel hole too shallow for the dowel length; or PVA applied when the wood surface was oily', fix: 'Re-glue with fresh PVA after roughing the dowel hole surfaces with coarse sandpaper. Ensure the board surface is clean and dry.' },
      { symptom: 'Board warps after a few weeks in the kitchen', cause: 'Top face finished but underside not; unequal moisture exchange', fix: 'Apply board butter to all surfaces equally. Re-flatten the board face if the warp is minor; severe warps need the board to be resawn thinner and re-planed flat.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 31 Seasoned-wood: walnut-knife-block
// ─────────────────────────────────────────────
write('31-walnut-knife-block.json', {
  slug: 'walnut-knife-block',
  title: 'Walnut knife block',
  subtitle: 'Angled-slot kitchen knife block in seasoned walnut',
  excerpt: 'A kitchen knife block in seasoned walnut with angled slots for six knives. The slots are bored at 15 degrees to the vertical so the knives lean back safely. Walnut is a tree-nut allergen; the block is for storage, not food contact.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'seasoned-wood',
  woodState: 'seasoned', difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Cassell's Household Guide on kitchen storage furniture. Newey and Drage, Practical Carpentry and Joinery (c.1910) on small cabinet and block construction.",
  recipeTools: [
    { slug: 'tenon-saw', isOptional: false }, { slug: 'marking-gauge', isOptional: false },
    { slug: 'try-square-200mm', isOptional: false }, { slug: 'smoothing-plane-no-4', isOptional: false },
    { slug: 'brace-and-bit', isOptional: false }, { slug: 'wood-finish-danish-oil', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Air-dried or kiln-dried timber at stable moisture content. A knife block in unseasoned wood will crack as it dries.' },
    { slug: 'grain', term: 'Grain', definition: 'The direction of the wood fibres. Knife slots should run parallel to the grain direction so the slot walls do not cross the grain and split.' },
    { slug: 'kerf', term: 'Kerf', definition: 'The width of material removed by a saw blade. The knife slots are sawn kerfs, widened with a chisel to the knife blade thickness.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('A knife block is a weighted rectangular block with angled blade slots. This version is 22 cm tall, 12 cm wide, and 10 cm deep in '), tip('seasoned-wood', 'seasoned'), t(' walnut. The six blade slots run at 15 degrees to the vertical so the knives lean back at rest. The slots run parallel to the '), tip('grain', 'grain'), t(' to keep the slot walls strong. Walnut is a tree-nut allergen; the block holds knives but does not contact food. Declare this clearly if making as a gift.')),
    SAFETY,
    h2('The wood'),
    p('One piece of seasoned walnut: 22 cm tall, 12 cm wide, 10 cm deep. The block is solid; no lamination is needed at this size. The face to which the slots are bored should be the most attractive face of the board. The back face and underside do not need to be perfect.'),
    h2('Tools'),
    p('A tenon saw; a marking gauge; a try-square; a No. 4 smoothing plane; a brace and bit (18 mm for the slot-bottom rounds); Danish oil.'),
    h2('Method'),
    ol(
      li('Plane all six faces flat and square. The base must be perfectly flat so the block stands without rocking. The front face is the slot-bearing face; sand it to 180 grit before layout.'),
      lin(t('Mark the slot positions on the front face. Six slots, spaced 15 mm apart, running parallel to the '), tip('grain', 'grain'), t(' direction. Each slot is 30 cm long (to accept a 25 cm chef\'s knife blade with 5 cm of handle clearance). Tilt the layout lines 15 degrees from the vertical.')),
      li('Bore a round pilot hole at the bottom of each slot line with the 18 mm bit. The round bottom prevents the slot from splitting when knives are inserted.'),
      lin(t('Cut the slot sides with the tenon saw. Each slot '), tip('kerf', 'kerf'), t(' is 2 mm wide (one saw pass each side of the slot centre line). Work carefully: the two parallel kerfs define the slot walls. Cut to the depth of the pilot hole.')),
      li('Clean the slot walls with a chisel if needed. The slot should accept a standard chef\'s knife blade with 1 mm of clearance per side.'),
      li('Shape a 5 mm chamfer on the top edges with the block plane. Round the bottom corners with a rasp or sandpaper.')
    ),
    h2('Finishing'),
    p('Sand all surfaces through 120, 180, and 240 grit. Apply Danish oil, three coats. Danish oil is not food-safe but is correct for a storage item that does not contact food.'),
    h2('Allergen note'),
    p('Walnut is a tree nut. Airborne walnut dust from sanding can trigger reactions in sensitive individuals. Sand in a ventilated space or wear an appropriate dust mask. The finished block is a storage item; it does not deposit walnut allergens into food during normal use.'),
    h2('Variations'),
    ul(
      li('Oak instead of walnut: no allergen concern, slightly lighter in colour. The grain is coarser and the slot walls are slightly rougher.'),
      li('Wider slots for Japanese knives: widen the slot to 3 mm per side. Japanese knives have thinner blades than Western knives.'),
      li('Magnetic strip alternative: if the slot approach is too complex, a magnetic knife strip is simpler. Plane a board flat and let concealed magnets into the back face.')
    ),
    ts([
      { symptom: 'Slot walls split when the first knife is inserted', cause: 'The grain crosses the slot; the grain direction runs at an angle to the slot length', fix: 'Knife slots must run parallel to the grain, not across it. Re-orient the layout to follow the grain direction on this board.' },
      { symptom: 'Block rocks on the counter', cause: 'Base not planed flat', fix: 'Plane the base until a straight-edge rocked across it shows no gap. The smoothing plane works base-to-face; check with the straight-edge after every few passes.' },
      { symptom: 'Saw cuts wander from the layout lines', cause: 'Tenon saw not registered in the pilot bore', fix: 'Start the saw cut from the pilot bore end; the round bore provides a registration point that guides the first few strokes.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 32 Seasoned-wood: hand-cut-mortise-and-tenon (TECHNIQUE)
// ─────────────────────────────────────────────
write('32-hand-cut-mortise-and-tenon.json', {
  slug: 'hand-cut-mortise-and-tenon',
  title: 'Hand-cut mortise and tenon',
  subtitle: 'How to lay out, chop, and fit a through mortise-and-tenon joint',
  excerpt: 'A step-by-step technique for the through mortise-and-tenon joint: layout with marking gauge and knife, chopping the mortise with a chisel, sawing the tenon cheeks, and fitting to a snug sliding fit.',
  type: 'TECHNIQUE', categorySlug: 'wood-natural-craft', subCategorySlug: 'seasoned-wood',
  difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Newey and Drage, Practical Carpentry and Joinery (c.1910) on mortise-and-tenon layout and cutting. Cassell's Cyclopaedia of Mechanics vol. III on hand-cut joinery.",
  recipeTools: [
    { slug: 'tenon-saw', isOptional: false }, { slug: 'mortise-chisel-9mm', isOptional: false },
    { slug: 'mallet-carpenters', isOptional: false }, { slug: 'marking-gauge', isOptional: false },
    { slug: 'try-square-200mm', isOptional: false }, { slug: 'marking-knife', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'tenon', term: 'Tenon', definition: 'The male part of the joint: a tongue of wood cut at the end of one piece that fits inside the mortise in the other.' },
    { slug: 'mortise', term: 'Mortise', definition: 'The female part: a rectangular cavity cut to receive the tenon.' },
    { slug: 'kerf', term: 'Kerf', definition: 'The width of material removed by the saw blade. All tenon layout lines are placed on the waste side of the kerf.' },
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Fully dried timber. Mortise-and-tenon joinery requires seasoned wood; green wood moves after the joint is cut and the fit changes.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('The mortise-and-tenon is the foundation joint of furniture making. The '), tip('tenon', 'tenon'), t(' is cut on the rail; the '), tip('mortise', 'mortise'), t(' is cut in the stile or leg. All layout must be done in '), tip('seasoned-wood', 'seasoned'), t(' timber: the joint must not move after cutting. The '), tip('kerf', 'kerf'), t(' of the saw removes material; every saw cut must be on the waste side of the layout line or the joint will be loose.')),
    SAFETY,
    h2('Proportions'),
    p('The tenon thickness is one-third of the rail thickness. The tenon width is one-half of the rail width for a stub tenon, or the full rail width minus the haunch for a haunched tenon. The mortise is the same dimensions as the tenon. A mortise chisel should match the tenon thickness exactly.'),
    h2('Layout: mortise'),
    ol(
      li('Set the marking gauge to one-third of the rail thickness. Score the mortise side faces on the mortise member. Both gauge lines must be set from the same face reference (the face mark). Run the gauge on the face mark only.'),
      li('Mark the mortise length with the marking knife and square. The knife line is on the waste side of the mortise end wall. A knife line cuts the grain fibres cleanly; a pencil line does not.')
    ),
    h2('Chopping the mortise'),
    ol(
      li('Chop at the centre of the mortise first, not at the end walls. Drive the mortise chisel with the mallet, bevel facing the mortise center, about 3 mm from the center. Lever out the chip. Work toward each end in 3 mm steps.'),
      li('Clear chips frequently. Do not lever toward the end walls until the mortise is nearly at full depth.'),
      li('Work to half depth from one face, then flip the piece and meet from the other face. This prevents the chisel from wandering and breaking out the far face.'),
      li('Pare the end walls to the knife lines with the chisel held vertically, bevel inward, with hand pressure only (no mallet). The knife line guides the chisel edge.')
    ),
    h2('Layout: tenon'),
    ol(
      li('Mark the tenon length with the marking knife and square around all four faces of the rail end.'),
      li('Set the marking gauge to the same setting used for the mortise. Score the tenon cheek lines from the face mark on both the end-grain and the long faces. Both cheek lines are on the waste side of the tenon.')
    ),
    h2('Sawing the tenon'),
    ol(
      li('Hold the rail at 45 degrees in the vise. Saw along the cheek line (into the waste) until the saw reaches the shoulder line. Re-clamp vertical and complete the cheek cut down to the shoulder on the remaining two faces.'),
      li('Saw the shoulder cuts with the rail horizontal in the vise, guided by the marking knife line. The saw registers in the knife line naturally. Cut both shoulders.'),
      li('Test the tenon in the mortise. It should enter with firm thumb pressure. If it is tight, pare the cheeks with a chisel; pare in thin layers and test after each layer.')
    ),
    ts([
      { symptom: 'Mortise walls are not parallel', cause: 'Marking gauge set inconsistently between the two gauge lines', fix: 'Both gauge lines must be set from the same face-mark reference. Re-set the gauge and re-check the lines before chopping.' },
      { symptom: 'Tenon shoulder is not perpendicular to the long axis', cause: 'Shoulder saw cut followed the grain rather than the knife line', fix: 'Score the knife line deeply before sawing. The knife line must sever the grain fibres so the saw follows the line rather than a grain deviation.' },
      { symptom: 'Mortise wall chips out at the far face when chopping', cause: 'Chopping all the way from one face to the other without meeting from both sides', fix: 'Always chop to half depth from each face. The two halves meet in the middle without chipping the far face.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 33 Seasoned-wood: choosing-hardwood-for-small-furniture (READING)
// ─────────────────────────────────────────────
write('33-choosing-hardwood-for-small-furniture.json', {
  slug: 'choosing-hardwood-for-small-furniture',
  title: 'Choosing hardwood for small furniture',
  subtitle: 'UK hardwoods available as small-furniture stock: properties and uses',
  excerpt: 'A short reading on the UK hardwoods available at most timber merchants for small furniture and treen: oak, ash, walnut, cherry, beech, and sycamore. What each species is suited for and what to look for when buying.',
  type: 'READING', categorySlug: 'wood-natural-craft', subCategorySlug: 'seasoned-wood',
  difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Newey and Drage, Practical Carpentry and Joinery (c.1910) on wood species for furniture. Cassell's Cyclopaedia of Mechanics vol. III on UK hardwood properties.",
  glossaryTerms: [
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Air-dried or kiln-dried timber at stable moisture content. Furniture grade stock should be below 10 percent moisture content.' },
    { slug: 'grain', term: 'Grain', definition: 'The direction of the wood fibres and the pattern they create on the face. Straight grain is easier to work than wild or interlocked grain.' }
  ],
  body: { type: 'doc', content: [
    pn(tip('seasoned-wood', 'Seasoned'), t(' UK hardwoods are available from most specialist timber merchants as short lengths (0.5 to 2 m) and as off-cuts suitable for small furniture. The '), tip('grain', 'grain'), t(' pattern and hardness of each species determines what it is suited for.')),
    h2('Oak (Quercus robur / Q. petraea)'),
    p('The most widely available UK hardwood. Ring-porous: strong, stiff, and very durable. Splits cleanly with a froe. Works well with hand tools if the edge is sharp; blunts tools faster than beech or sycamore. Tannins react with iron and produce black stains: use stainless or brass fittings. Uses: furniture frames, shelving, floor boards, kitchen boards. Available as waney-edged planks and square-edged timber at most merchants.'),
    h2('Ash (Fraxinus excelsior)'),
    p('Pale, ring-porous, very tough, and flexible. The best UK species for shock-absorbing tool handles. Bends well when steam-bent. Not as decay-resistant as oak for outdoor use. Works well with hand planes and chisels. Uses: tool handles, chair components, bentwood furniture, sports equipment. Widely available. Note: ash dieback (Hymenoscyphus fraxineus) is reducing UK ash supply; expect prices to rise over the next decade.'),
    h2('Walnut (Juglans regia)'),
    p('Dark chocolate-brown heartwood with a fine, straight grain. Machines and hand-works very well. The surface takes a high polish. Iron tools produce black staining on the cut surface; wipe tools with citric acid solution to remove it. Tree-nut allergen: declare on any sold or gifted work. Uses: small furniture, decorative boxes, turning, carving. Available from specialist merchants; more expensive than oak or ash.'),
    h2('Cherry (Prunus avium)'),
    p('Pale pinkish-brown that deepens to a warm red-brown with light exposure over 2 to 5 years. Fine, straight grain; planes to a very smooth surface. Slightly harder than beech. Well-suited to hand carving and joinery. Not common at general timber merchants; available from specialist suppliers and as community-orchard pruning offcuts. Uses: small furniture, spoon-carving, turning, boxes.'),
    h2('Beech (Fagus sylvatica)'),
    p('Pale cream-pink, diffuse-porous, with a fine even grain. The workshop standard: widely available, consistent in quality, and easy to work with hand planes and chisels. The standard species for workbench tops, chopping boards, and turned tool handles. More prone to movement in varying humidity than oak or ash; use fully kiln-dried stock for stable furniture pieces. Uses: kitchen boards, workbenches, small furniture, chair components.'),
    h2('Sycamore (Acer pseudoplatanus)'),
    p('Very pale cream-white, fine and even grain with a mild figure. The food-safe wood of choice for spoons, boards, and kitchen treen: no allergen concerns, smooth surface, no objectionable taste. Slightly softer than beech. Not as common in merchants as beech, but available from specialist suppliers and as windfall. Uses: kitchen treen, carving, turning, small furniture where a pale colour is desired.')
  ]}
})

// ─────────────────────────────────────────────
// 34 Seasoned-wood: pine-keepsake-box-dovetail
// ─────────────────────────────────────────────
write('34-pine-keepsake-box-dovetail.json', {
  slug: 'pine-keepsake-box-dovetail',
  title: 'Pine keepsake box with dovetails',
  subtitle: 'Small pine keepsake box with hand-cut through-dovetail corners',
  excerpt: 'A small pine box with hand-cut through-dovetail corners and a fitted shellac-finished lid. The four corner joints are a beginner-level dovetail: two tails and one pin per corner, wide spacing, pine stock.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'seasoned-wood',
  woodState: 'seasoned', difficulty: 'BEGINNER', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Newey and Drage, Practical Carpentry and Joinery (c.1910) on dovetail box construction. Cassell's Cyclopaedia of Mechanics vol. III on small box joinery.",
  recipeTools: [
    { slug: 'tenon-saw', isOptional: false }, { slug: 'marking-knife', isOptional: false },
    { slug: 'bevel-edge-chisel-12mm', isOptional: false }, { slug: 'bevel-edge-chisel-6mm', isOptional: false },
    { slug: 'mallet-carpenters', isOptional: false }, { slug: 'marking-gauge', isOptional: false },
    { slug: 'combination-square', isOptional: false }, { slug: 'wood-finish-shellac', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'seasoned-wood', term: 'Seasoned wood', definition: 'Fully dried timber. Dovetails in green wood will move as the wood dries and the joint will loosen or rack.' },
    { slug: 'dovetail', term: 'Dovetail', definition: 'A joint where trapezoidal tails on one board interlock with matching pins on the other. The geometry resists pulling forces; the joint cannot be pulled apart once assembled and glued.' },
    { slug: 'kerf', term: 'Kerf', definition: 'The width of material removed by the saw blade. Dovetail layout lines are placed on the waste side of the kerf; the saw must not remove any material from the joint line itself.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('The through '), tip('dovetail', 'dovetail'), t(' is the traditional box corner joint. The tails are on the long sides; the pins are on the short sides. For this beginner box, each corner has two tails and one pin: a wide spacing that tolerates small layout errors more than a fine-pitch dovetail. The box is pine: slightly soft for dovetails (the shoulders can bruise) but widely available and consistent in thickness. Work carefully in '), tip('seasoned-wood', 'seasoned'), t(' stock and keep the '), tip('kerf', 'kerf'), t(' consistently on the waste side throughout.')),
    SAFETY,
    h2('The wood'),
    p('Four pine boards, planed to 12 mm thickness: two long sides at 28 cm by 10 cm; two short sides at 16 cm by 10 cm. One base panel of 3 mm plywood: 26.5 cm by 14.5 cm (to sit in a 3 mm groove in the assembled box). One lid panel: 29 cm by 17 cm, 6 mm thick.'),
    h2('Tools'),
    p('A tenon saw and marking knife. Two bevel-edge chisels (12 mm and 6 mm) and a carpenter\'s mallet. A marking gauge and a combination square. A dovetail marker or a fixed 1:6 slope marked on card.'),
    h2('Method: tails (long sides)'),
    ol(
      lin(t('Set the marking gauge to 12 mm (the board thickness) and score the baseline around both ends of each long side. The baseline is the shoulder of the '), tip('dovetail', 'dovetail'), t('.')),
      li('Mark two tails on each board end. Set a slope of 1:6 from the gauge line using a sliding bevel. Mark both sides of each tail. Mark the waste sections with a pencil X. There are two tails and one gap (the future pin socket) per corner.'),
      li('Saw the tail sides with the tenon saw, keeping the saw on the waste side of the layout line. Saw to the baseline but not past it.'),
      li('Chop out the pin socket waste between the tails: chisel from the face side to half depth, then flip and meet from the other side. Pare the socket floor and walls to the baseline.')
    ),
    h2('Method: pins (short sides)'),
    ol(
      li('Hold the completed tail board against the end of the pin board, aligned flush with the baseline. Scribe around the tails with the marking knife to transfer the pin layout to the pin board. The scribed lines are the exact width of the pins.'),
      lin(t('Mark the waste sections on the pin board. Saw the pin cheeks with the tenon saw, keeping the saw to the waste side of the scribed line.')),
      li('Chop out the pin waste between the pin cheeks. Pare the socket walls and floor cleanly. Test the fit: the joint should slide together with firm hand pressure.')
    ),
    h2('Assembly'),
    p('Cut a 3 mm groove in the inside face of each long and short side, 8 mm from the bottom edge, using a router plane or combination plane. The groove accepts the base panel. Glue and assemble the four sides. Insert the base panel dry in the groove (no glue; it floats to allow movement). Clamp square.'),
    h2('Finishing'),
    p('Sand all surfaces through 120, 180, and 240 grit. Apply shellac: two coats with a cotton-wool pad, sanding lightly between coats with 320 grit. Shellac builds a traditional warm film finish suitable for a decorative box.'),
    h2('Variations'),
    ul(
      li('Walnut instead of pine: harder wood, sharper-looking joints. No bruising on the shoulders from clamping.'),
      li('Sliding lid instead of a separate lid panel: widen the top groove to accept a sliding lid cut from 6 mm stock.'),
      li('Decorative inlay: let a thin strip of contrasting wood into the lid face with a shoulder plane for a panel effect.')
    ),
    ts([
      { symptom: 'Pin socket is too wide and the joint is loose', cause: 'Saw cut placed on the wrong side of the line', fix: 'All dovetail saw cuts go on the waste side of the layout line. The width of one saw kerf (approximately 0.5 mm) on the wrong side produces a visible gap in the assembled joint.' },
      { symptom: 'Tails and pins do not seat to the baseline', cause: 'Waste not fully removed from the socket floor', fix: 'Pare the socket floor with the chisel bevel-up. Press the chisel against the baseline knife line and take a light horizontal paring stroke.' },
      { symptom: 'Box is out of square after gluing', cause: 'One pair of opposite sides is longer than the other', fix: 'Before applying glue, assemble dry and check the diagonal measurements. Both diagonals must be equal. Correct any discrepancy by trimming the long side.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 35 Pyrography: pyrography-flower-and-leaf
// ─────────────────────────────────────────────
write('35-pyrography-flower-and-leaf.json', {
  slug: 'pyrography-flower-and-leaf',
  title: 'Pyrography flower and leaf',
  subtitle: 'Botanical flower-and-leaf design burned on a birch ply panel',
  excerpt: 'A botanical flower-and-leaf pyrography design on a smooth birch ply panel. The writing tip outlines the design; the shading tip builds the tonal layers. A first project for a new pyrography setup.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'pyrography',
  woodState: 'seasoned', difficulty: 'BEGINNER', season: null,
  sourceType: 'SYNTHESISED',
  sourceNotes: 'General pyrography method synthesised from standard craft practice. No single public-domain source covers modern variable-temperature pyrography in this form.',
  recipeTools: [
    { slug: 'pyrography-solid-tip-burner', isOptional: false }, { slug: 'pyrography-tip-writing', isOptional: false },
    { slug: 'pyrography-tip-shading', isOptional: false }, { slug: 'pyrography-cooling-stand', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'pyrography', term: 'Pyrography', definition: 'The art of decorating wood with a heated metal tip, burning designs into the surface to create drawn or shaded images.' },
    { slug: 'tonal-shading', term: 'Tonal shading', definition: 'Building areas of dark tone by overlapping burn strokes from light to dark, without hard boundaries between tones.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(tip('pyrography', 'Pyrography'), t(' burns a design into the wood surface using heat. This project uses a solid-tip burner and a botanical flower-and-leaf motif: an outline-and-shade approach where the writing tip draws the outline and the shading tip fills the tonal areas. '), tip('tonal-shading', 'Tonal shading'), t(' is built in layers, working from the lightest areas to the darkest. Birch ply is the recommended panel for a first project: the surface is smooth and consistent, the grain is faint, and the pale colour shows tonal contrast clearly.')),
    PYRO_SAFETY,
    h2('The panel'),
    p('A piece of smooth birch ply: 20 cm by 15 cm, 4 to 6 mm thick. Sand the surface to 240 grit before drawing the design. A fine-sanded surface produces finer lines and more even shading than a rough one. Do not use MDF or composite boards; burning them releases formaldehyde.'),
    h2('Transferring the design'),
    p('Sketch the flower-and-leaf design on paper. Transfer it to the panel with tracing paper and a soft pencil, or with graphite paper. Keep the pencil lines light; heavy pencil lines burn into the wood along with the design and are visible in the finished work.'),
    h2('Burning the outline'),
    ol(
      li('Heat the solid-tip burner to medium-high with the writing tip fitted. Test the temperature on a scrap piece of the same ply: the tip should produce a mid-brown line with moderate pressure at a slow walking pace. If the line is very pale, increase the temperature. If the surface smokes heavily, reduce it.'),
      li('Burn the outline of the flower and leaves with the writing tip. Hold the pen like a pencil. Pull the tip along the pencil lines in a single continuous stroke where possible. Restarting mid-line leaves a darker spot. Work all outlines before moving to shading.')
    ),
    h2('Shading'),
    ol(
      li('Switch to the shading tip. Reduce the temperature to medium-low.'),
      li('Work the lightest areas first: the centers of the petals and the upper-leaf surfaces where the light falls. Hold the shading tip flat to the surface and draw it in short strokes along the shape. The tone should be barely perceptible at first.'),
      pn(t('Build '), tip('tonal-shading', 'tonal shading'), t(' by overlapping passes. Each additional pass darkens the area slightly. Work from the lightest area outward toward the shadows; shadows are at petal bases, leaf undersides, and where petals overlap.')),
      li('The darkest areas (where petals overlap) receive the most passes. Bring the tip to near-vertical for the darkest darks; the concentrated heat of the tip point burns a denser mark.')
    ),
    h2('Finishing'),
    p('Leave the panel to cool for 30 minutes after burning. Brush off any surface ash with a soft brush. Apply no oil or finish to the burned surface; oil darkens the unburned wood and reduces the contrast between the burned design and the background. The panel can be framed as-is.'),
    h2('Variations'),
    ul(
      li('Single flower without leaves: a simpler composition for a first burn. Focus on one large flower head with a clear centre and petals.'),
      li('Linden (lime) wood panel instead of birch ply: a solid wood surface is more consistent in grain and burns slightly warmer in tone.'),
      li('Wire-tip burner for fine details: the nichrome wire tip heats and cools faster and allows finer line control for small petal veins.')
    ),
    ts([
      { symptom: 'Lines are dark and blobby at start and end', cause: 'Tip held in place too long at the start and end of each stroke', fix: 'Start and end each stroke in motion. Lower the tip while already moving and lift it while still moving.' },
      { symptom: 'Shaded areas have a striped texture', cause: 'Shading strokes all running in the same direction', fix: 'Work the shading tip in multiple directions. Use horizontal, vertical, and diagonal passes in the same area. Overlapping passes blend into a smooth tone.' },
      { symptom: 'Background wood is darkened all over', cause: 'Temperature too high; the residual heat of the tip is burning the surface as it moves', fix: 'Reduce the temperature. Test on scrap: at the correct temperature, the tip only burns when it pauses or moves very slowly.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 36 Pyrography: pyrography-geometric-tile-panel
// ─────────────────────────────────────────────
write('36-pyrography-geometric-tile-panel.json', {
  slug: 'pyrography-geometric-tile-panel',
  title: 'Pyrography geometric tile panel',
  subtitle: 'Repeating geometric triangle-and-square pattern burned on a pine panel',
  excerpt: 'A repeating geometric tile pattern burned on a pine panel. Triangles, squares, and diagonal fills. The pattern is drawn with a ruler and burned with the writing tip at a consistent temperature. No shading required.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'pyrography',
  woodState: 'seasoned', difficulty: 'BEGINNER', season: null,
  sourceType: 'SYNTHESISED',
  sourceNotes: 'General pyrography method synthesised from standard craft practice.',
  recipeTools: [
    { slug: 'pyrography-solid-tip-burner', isOptional: false }, { slug: 'pyrography-tip-writing', isOptional: false },
    { slug: 'pyrography-cooling-stand', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'pyrography', term: 'Pyrography', definition: 'The art of decorating wood with a heated metal tip, burning designs into the surface.' },
    { slug: 'grain', term: 'Grain', definition: 'The direction of the wood fibres. Burning along the grain produces a cleaner line than burning across it on heavily grained woods such as pine.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(tip('pyrography', 'Pyrography'), t(' with a ruler produces precise geometric patterns. This project uses a 20 cm by 20 cm pine panel with a repeating tile of alternating filled and empty triangles. The lines are burned with the writing tip at a single consistent temperature; no shading or tonal work is needed. Pine has a visible '), tip('grain', 'grain'), t('; lines burned with the grain are crisp, lines burned across the grain are slightly rougher. The geometric design works with the grain by running most lines in the grain direction.')),
    PYRO_SAFETY,
    h2('The panel'),
    p('A piece of smooth knot-free pine: 20 cm by 20 cm, 10 mm thick. Sand to 180 grit. Knots produce uneven burning temperatures; avoid them in the design area.'),
    h2('Laying out the design'),
    p('Mark a grid of 2.5 cm squares across the panel face in pencil. Divide each square into two triangles with a diagonal. Mark alternate triangles for filling (checker-board pattern). The filled triangles will be burned solid; the empty triangles remain as natural wood.'),
    h2('Burning'),
    ol(
      li('Heat the burner to a consistent medium temperature with the writing tip. Test on scrap pine: the line should be a warm brown at a slow-walking pace.'),
      li('Burn all the outline lines first, following the pencil grid with a ruler as a guide. Hold the ruler firmly; the tip should brush against the ruler edge. A straight-edge speeds up all lines that cross the grain direction.'),
      pn(t('Fill the marked triangles with parallel lines along the '), tip('grain', 'grain'), t(' direction. Work from the baseline of the triangle to the tip, spacing the fill lines 1 to 1.5 mm apart. The filled triangle should appear dark but not black.')),
      li('Allow the panel to cool between burning sessions. The solid-tip burner requires 5 to 10 minutes to cool before changing tips if needed.')
    ),
    h2('Finishing'),
    p('Brush off surface ash. Apply no oil finish to the burned surface. The panel can be framed or mounted as a wall tile.'),
    h2('Variations'),
    ul(
      li('Hexagonal grid instead of square: mark a hex grid and divide each hexagon into six equilateral triangles. Alternate fill patterns produce a three-dimensional cube illusion.'),
      li('Wider fill lines for bolder contrast: increase the fill line spacing to 2 mm for a more open pattern with less dark area.'),
      li('Carved and burned: chip-carve the outline grid lines before burning, so the filled triangles are recessed and burned.')
    ),
    ts([
      { symptom: 'Lines wander away from the ruler edge', cause: 'Ruler not held firmly enough against the panel', fix: 'Clamp the ruler to the panel with a small spring clamp at each end. Work the tip against the clamped ruler edge.' },
      { symptom: 'Filled triangles are uneven in darkness', cause: 'Variable hand speed during fill-line burning', fix: 'Move the tip at a constant pace. Pausing produces a dark spot; speeding up produces a pale section. Count a rhythm to keep the pace consistent.' },
      { symptom: 'Grid lines are not square to the panel edge', cause: 'First grid line not set parallel to the panel edge', fix: 'Set the first grid line with a try-square from the panel edge before drawing the rest. All subsequent lines parallel to this first line.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 37 Pyrography: pyrography-portrait-sketch
// ─────────────────────────────────────────────
write('37-pyrography-portrait-sketch.json', {
  slug: 'pyrography-portrait-sketch',
  title: 'Pyrography portrait sketch',
  subtitle: 'Portrait silhouette or face sketch burned on a linden panel',
  excerpt: 'A portrait burned on a linden panel: either a clean silhouette for a first attempt or a full tonal face sketch for intermediate work. The nichrome wire burner is used for the controlled tonal range a portrait requires.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'pyrography',
  woodState: 'seasoned', difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'SYNTHESISED',
  sourceNotes: 'General pyrography method synthesised from standard craft practice.',
  recipeTools: [
    { slug: 'pyrography-nichrome-wire-burner', isOptional: false }, { slug: 'pyrography-tip-writing', isOptional: false },
    { slug: 'pyrography-tip-shading', isOptional: false }, { slug: 'pyrography-tip-ball-stylus', isOptional: false },
    { slug: 'pyrography-cooling-stand', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'pyrography', term: 'Pyrography', definition: 'Decorating wood with a heated metal tip. A nichrome-wire burner allows precise temperature control needed for portrait tonal work.' },
    { slug: 'tonal-shading', term: 'Tonal shading', definition: 'Building up areas of light, mid, and dark tone by overlapping burn passes at different temperatures and speeds.' },
    { slug: 'grain', term: 'Grain', definition: 'The direction of the wood fibres. A fine-grain wood such as linden is essential for portrait work; coarse grain interferes with the tonal gradients.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(tip('pyrography', 'Pyrography'), t(' portraits require a wider tonal range than simple outline or geometric work. The nichrome-wire burner adjusts temperature quickly between burns, which is what tonal '), tip('tonal-shading', 'shading'), t(' demands. Linden (lime) wood is the correct substrate. It has the finest, most even '), tip('grain', 'grain'), t(' of any UK hardwood. Its pale cream colour gives maximum contrast between shadows and highlights.')),
    PYRO_SAFETY,
    h2('The panel'),
    p('A linden (lime) panel: 20 cm by 25 cm, 10 to 12 mm thick. Sand to 320 grit: portrait work rewards the finest possible surface preparation. Alternatively, birch ply sanded to 320 grit works well.'),
    h2('Choosing the source image'),
    p('For a first portrait: use a high-contrast black-and-white reference photo with clear distinction between light and shadow areas. Avoid images with many mid-tone areas; they require the most control. A strong side-lit face with one bright side and one dark side in shadow is the most forgiving starting point.'),
    h2('Transferring the design'),
    p('Print the reference photo to the same size as the panel. Transfer the main tonal boundaries (not individual features) onto the panel with graphite paper: where are the dark areas? Where are the highlights? These boundaries are the only pencil lines needed.'),
    h2('Burning: three-value approach'),
    ol(
      li('Set the burner to the lowest setting that produces a faint warm mark on the panel. This is the "light shadow" temperature. Work all the light shadow areas first: use the shading tip in short overlapping strokes.'),
      li('Increase the temperature one setting. Work the mid-shadow areas with the same technique. Build these areas up with 3 to 4 passes before checking.'),
      li('Set the burner to the highest useful setting (just before the surface smokes). Work the deepest shadow areas: under the chin, inside the eye sockets, at the hair edges. Use the writing tip for fine-detail dark areas.'),
      pn(t('Use the ball stylus tip for '), tip('tonal-shading', 'pointillist shading'), t(' in areas where the line-shading technique is too coarse: eyebrows, nostril shadows, lip corners. Short stippled dots at medium temperature blend into a smooth mid-tone from viewing distance.'))
    ),
    h2('Finishing'),
    p('Allow the completed panel to cool for one hour. Brush off surface ash with a soft brush. Do not sand the burned surface; sanding removes the fine tonal work. Frame behind glass without mounting tape directly on the burned surface.'),
    h2('Variations'),
    ul(
      li('Silhouette portrait: burn only the solid outline of the profile, filled solid. No tonal work; suitable for any burner type.'),
      li('Pet portrait: the same three-value approach on an animal subject. Fur texture is rendered with the ball stylus in short strokes following the fur direction.'),
      li('Birch ply instead of linden: slightly more visible grain, which adds a texture to the portrait background.')
    ),
    ts([
      { symptom: 'Dark areas are streaky rather than smooth', cause: 'Shading strokes all running in the same direction', fix: 'Work shading in at least two directions: horizontal and diagonal. Cross-hatched strokes blend into a smooth tone at viewing distance.' },
      { symptom: 'Features are out of proportion after burning', cause: 'Tonal boundaries transferred incorrectly from the reference', fix: 'Check proportions at the transfer stage, not after burning. Measure the main landmarks (eye to chin, eye to eye) in the reference and transfer those distances first.' },
      { symptom: 'Panel surface is patchy in the unburned highlights', cause: 'Accidental contact of the hot tip with the highlight areas', fix: 'Work the shading tip away from the highlight areas. Use a small piece of card to mask the highlight while shading an adjacent area.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 38 Pyrography: pyrography-ball-tip-shading (TECHNIQUE)
// ─────────────────────────────────────────────
write('38-pyrography-ball-tip-shading.json', {
  slug: 'pyrography-ball-tip-shading',
  title: 'Pyrography ball tip shading',
  subtitle: 'Using the ball stylus tip for pointillist texture and tonal shading',
  excerpt: 'A technique entry covering how to use the pyrography ball stylus tip for dotwork, fur and feather texture, and smooth tonal gradients. The ball tip is a complement to the writing and shading tips.',
  type: 'TECHNIQUE', categorySlug: 'wood-natural-craft', subCategorySlug: 'pyrography',
  difficulty: 'BEGINNER', season: null,
  sourceType: 'SYNTHESISED',
  sourceNotes: 'General pyrography method synthesised from standard craft practice.',
  recipeTools: [
    { slug: 'pyrography-solid-tip-burner', isOptional: true }, { slug: 'pyrography-nichrome-wire-burner', isOptional: true },
    { slug: 'pyrography-tip-ball-stylus', isOptional: false }, { slug: 'pyrography-cooling-stand', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'pyrography', term: 'Pyrography', definition: 'Decorating wood with a heated metal tip. The ball stylus is one of the standard tips in the pyrography toolkit.' },
    { slug: 'tonal-shading', term: 'Tonal shading', definition: 'Building areas of light, mid, and dark tone. The ball tip achieves this through dot density: closely spaced dots produce a darker tone than widely spaced ones.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('The '), tip('pyrography', 'pyrography'), t(' ball stylus tip is a spherical steel ball welded to the wire or mounted on the solid-tip unit. It produces a round dot rather than a line. The dot size and darkness depends on the temperature and contact time. '), tip('tonal-shading', 'Tonal shading'), t(' with the ball tip is achieved by varying the dot density: closely packed dots at the same temperature produce a darker area than widely spaced dots. The ball tip is the correct tool for animal fur and feather texture, for stippled backgrounds, and for smooth gradients where the linear shading tip leaves a striped texture.')),
    PYRO_SAFETY,
    h2('Temperature and contact time'),
    p('The ball tip holds more heat per contact than the writing tip because of its mass. Start at a lower temperature than you would use for outline work. Contact time is the other variable: the longer the ball rests on the surface, the darker the dot. For a consistent dot size, keep the contact time constant and adjust the temperature only.'),
    h2('Dotwork (pointillism)'),
    ol(
      li('Set the burner to a low-medium temperature. Test on scrap: a single contact of about half a second should produce a pale brown dot 1.5 to 2 mm in diameter.'),
      li('Work dots in rows for a background fill. Space the dots evenly, with gaps equal to the dot diameter for a medium tone. Close the gaps for a darker tone; widen them for a lighter tone.'),
      li('For a gradient from dark to light, start with closely spaced dots at the dark end and increase the spacing gradually as you work toward the light end.')
    ),
    h2('Fur and feather texture'),
    ol(
      li('Place the ball tip on the surface and drag it in a very short stroke (2 to 3 mm) in the direction the fur or feathers lie. This produces a short comma-shaped mark rather than a round dot.'),
      li('Work in rows following the fur or feather direction. Overlap rows slightly. The comma shapes read as individual fur strands at viewing distance.'),
      li('Build darker areas by increasing the temperature for one or two additional passes in the shadow areas.')
    ),
    h2('Combining with other tips'),
    p('The ball tip works best after the writing tip has established the outline and main tonal areas. Use the writing tip for outlines and the darkest details; then the shading tip for large smooth tone areas; then the ball tip for texture and fine tonal gradients. The three tips complement each other.'),
    ts([
      { symptom: 'Dots are different sizes within the same area', cause: 'Variable contact time; the hand is not consistent', fix: 'Count a rhythm for each dot: one-two for a light dot, one-two-three for a medium dot. Consistent counting produces consistent dots.' },
      { symptom: 'Fur strokes produce blobs instead of commas', cause: 'Temperature too high; the ball is burning too dark before being dragged', fix: 'Reduce the temperature. The drag stroke must happen while the surface is still dark from the initial contact, not after the initial contact has already burned a full dark dot.' },
      { symptom: 'Ball tip sticks to the wood surface', cause: 'Temperature too high; the tip is partially fusing with the charred wood fibres', fix: 'Reduce the temperature significantly. A sticking tip means the surface is over-burned. Allow the area to cool before continuing.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 39 Pyrography: pyrography-nameplate
// ─────────────────────────────────────────────
write('39-pyrography-nameplate.json', {
  slug: 'pyrography-nameplate',
  title: 'Pyrography nameplate',
  subtitle: 'Wooden name sign or door plate with lettered pyrography inscription',
  excerpt: 'A wooden nameplate or door sign with a name or short phrase lettered in pyrography. The calligraphy tip produces thick-and-thin letterforms; the writing tip handles fine detail and serifs. Pine or linden stock.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'pyrography',
  woodState: 'seasoned', difficulty: 'BEGINNER', season: null,
  sourceType: 'SYNTHESISED',
  sourceNotes: 'General pyrography method synthesised from standard craft practice.',
  recipeTools: [
    { slug: 'pyrography-solid-tip-burner', isOptional: false }, { slug: 'pyrography-tip-writing', isOptional: false },
    { slug: 'pyrography-tip-calligraphy', isOptional: true }, { slug: 'pyrography-cooling-stand', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'pyrography', term: 'Pyrography', definition: 'Decorating wood with a heated metal tip. Lettering is one of the most common pyrography applications.' },
    { slug: 'grain', term: 'Grain', definition: 'The direction of the wood fibres. On heavily grained woods, letter strokes that cross the grain are slightly rougher than strokes that follow it.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(tip('pyrography', 'Pyrography'), t(' lettering uses the writing tip for fine strokes and outlines, and the calligraphy nib (flat-edged tip) for the thick-and-thin strokes of decorative letterforms. This project makes a name sign on a shaped pine or linden panel: sand the face smooth, draw the lettering guide lines, burn the letters, and finish with a drill hole for a cord hanger. The '), tip('grain', 'grain'), t(' direction of the panel should run horizontally so most letter strokes follow the grain direction rather than crossing it.')),
    PYRO_SAFETY,
    h2('The panel'),
    p('A piece of smooth pine or linden: 25 cm long, 10 cm tall, 10 mm thick. Round the short ends with a coping saw or rasp if a shaped panel is preferred. Sand to 240 grit on the face. Bore a 6 mm hanging hole 2 cm from each end before burning.'),
    h2('Lettering layout'),
    p('Draw two pencil guide lines: one at the letter cap height (7 cm from the bottom edge) and one at the baseline (2 cm from the bottom edge). Centre the name between the left and right panel edges: count the letters, multiply by the letter width (approximately 8 mm per letter for a 5 cm cap height), and centre the total on the panel width. Mark the letter positions with a light pencil tick.'),
    h2('Burning: writing tip'),
    ol(
      li('Heat the burner to medium with the writing tip. Test on scrap: at the correct temperature, the tip produces a warm brown line with light pressure at a slow pace.'),
      li('Burn the first letter in a single continuous stroke per element: the vertical stroke first, then the horizontal strokes, then any curves. Work each letter from top to bottom and left to right.'),
      li('Burn all letters at the same temperature before any retouching. Consistent temperature across all letters is more important than perfection in each one.')
    ),
    h2('Burning: calligraphy nib (optional)'),
    pn(t('The flat calligraphy nib produces thick strokes when held flat to the surface and thin strokes when held on its edge. Use it for the thick downstrokes of traditional letterforms. The calligraphy nib suits a slow '), tip('pyrography', 'pyrography'), t(' pace; it holds more heat than the writing tip and burns faster.')),
    h2('Finishing'),
    p('Brush off surface ash. Apply a thin coat of Danish oil or shellac to the panel if it is for outdoor use, or leave natural for an interior sign. Thread a cord through the hanging holes.'),
    h2('Variations'),
    ul(
      li('House number instead of a name: bold numerals are simpler than letterforms and read well from a distance.'),
      li('Decorative border: burn a simple geometric border around the panel perimeter with the writing tip before lettering.'),
      li('Two-line inscription: reduce the letter height to 3.5 cm and add a second guide line for a subtitle or subtitle below the main name.')
    ),
    ts([
      { symptom: 'Letters vary in darkness from one to the next', cause: 'Burner temperature fluctuated between letters or the solid-tip unit cycled on and off', fix: 'A solid-tip burner cycles on and off as the element switches. Pause between letters until the tip temperature stabilises. A consistent pause of 3 seconds between letters normalises the output.' },
      { symptom: 'Letters are not centred on the panel', cause: 'Centring was calculated but the first letter was placed off the calculated start point', fix: 'Mark the first and last letter positions with pencil ticks before burning. Check the placement against the panel edge before applying the tip.' },
      { symptom: 'Grain roughens the letter strokes that cross it', cause: 'Heavily grained pine; cross-grain strokes burn unevenly', fix: 'Switch to linden for lettering on fine-detail projects. On pine, increase the temperature slightly for cross-grain strokes to compensate for the higher resistance.' }
    ])
  ]}
})

// ─────────────────────────────────────────────
// 40 Basketry: willow-cat-basket
// ─────────────────────────────────────────────
write('40-willow-cat-basket.json', {
  slug: 'willow-cat-basket',
  title: 'Willow cat basket',
  subtitle: 'Oval woven buff-willow cat basket with a turned-down rim',
  excerpt: 'An oval woven cat basket in buff willow: oval slath base, staked sides in pairing and waling weave, three-rod border. Sized to fit a standard cat. The oval shape and the dome rim are the intermediate challenges.',
  type: 'PATTERN', categorySlug: 'wood-natural-craft', subCategorySlug: 'basketry-willow',
  woodState: 'green', difficulty: 'INTERMEDIATE', season: null,
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: "Edlin, H.L., Woodland Crafts in Britain (1949) on willow basket construction. Caulfield and Saward, Dictionary of Needlework (1882) on oval basket construction.",
  recipeTools: [
    { slug: 'bodkin', isOptional: false }, { slug: 'rapping-iron', isOptional: false },
    { slug: 'secateurs', isOptional: false }, { slug: 'soaking-trough', isOptional: false }
  ],
  glossaryTerms: [
    { slug: 'slath', term: 'Slath', definition: 'The central crossed-stake structure of the basket base; in an oval basket, more stakes run along the long axis than the short axis.' },
    { slug: 'stake-and-strand', term: 'Stake-and-strand', definition: 'Willow-basket weave structure: vertical stakes form the skeleton; weavers pass between them.' },
    { slug: 'pairing', term: 'Pairing', definition: 'Two-weaver alternating weave; the standard body weave for the cat basket sides.' },
    { slug: 'upset', term: 'Upset', definition: 'The first rows of weaving above the base that lock the stakes upright and set the basket-side angle.' },
    { slug: 'buff-willow', term: 'Buff willow', definition: 'Boiled and stripped willow; golden-brown, strong, and consistent. The standard basketry material.' },
    { slug: 'bye-stake', term: 'Bye-stake', definition: 'A short stake added beside each main side stake after upsetting, doubling the upright density for the main weave.' },
    { slug: 'border', term: 'Border', definition: 'The finishing technique that bends down the stake tips to form the basket rim.' },
    { slug: 'three-rod-border', term: 'Three-rod border', definition: 'A plaited border where groups of three stakes are woven around the remaining uprights to form a strong decorative rim.' }
  ],
  techniqueSlugs: [],
  criticalTechniques: [],
  body: { type: 'doc', content: [
    pn(t('A cat basket is 45 cm long, 35 cm wide, and 20 cm tall at the sides, with a slight inward lean at the rim. The '), tip('slath', 'slath'), t(' base is oval: more stakes along the long axis than the short. The sides are woven in '), tip('pairing', 'pairing'), t(' in '), tip('buff-willow', 'buff willow'), t(' with '), tip('bye-stake', 'bye-stakes'), t(' added after the '), tip('upset', 'upset'), t('. The '), tip('three-rod-border', 'three-rod border'), t(' forms the rim. The intermediate challenge is maintaining the oval shape as the '), tip('stake-and-strand', 'stake-and-strand'), t(' sides grow: oval baskets need consistent stake spacing at the ends and a deliberate inward press at the rim.')),
    BASKETRY_SAFETY,
    h2('Materials'),
    p('Buff willow: 14 base stakes at 4 foot (120 cm), 4 mm diameter; 30 side stakes at 32 inches (80 cm), 3 to 3.5 mm; 30 bye-stakes at 24 inches (60 cm), 2.5 to 3 mm; pairing weavers (two full bundles of 4 foot rods, 2 to 2.5 mm). Soak heavy base stakes for 2 hours; all other material for 1 hour.'),
    h2('Base'),
    ol(
      lin(t('Build the oval '), tip('slath', 'slath'), t(': 8 base stakes along the long axis, 6 base stakes across the short axis, crossed through the centre. Open the slath with two pairers, working around groups of stakes then opening to individual stakes.')),
      lin(t('Work '), tip('pairing', 'pairing'), t(' outward, stretching the oval to 45 cm by 35 cm. Rap down every 3 circuits. Continue until the base reaches the target dimensions. Trim base-stake ends flush with the outer weave row.'))
    ),
    h2('Staking and upsetting'),
    ol(
      lin(t('Insert side stakes beside each base stake. Prick up all stakes. Work two rows of '), tip('upset', 'upset'), t(' pairing tight to the base. Adjust the stakes to stand with a slight outward lean at this stage; they will be brought inward at the rim.')),
      lin(t('Insert '), tip('bye-stake', 'bye-stakes'), t(' beside each side stake. Continue pairing around all uprights until the sides reach 18 cm height.')),
      li('At 18 cm, begin pressing the top of the stakes inward slightly with each rapping-iron pass. This creates the inward lean that forms the basket rim profile. A cat basket rim should be about 5 cm smaller in diameter than the basket body at its widest point.')
    ),
    h2('Border'),
    pn(t('When the sides reach 20 cm, work the '), tip('three-rod-border', 'three-rod border'), t(' to close the basket. The '), tip('border', 'border'), t(' seals the stake tips and forms the firm rim that a cat will push against when entering the basket. Damp the stake tips before working the border if they have dried during weaving.')),
    h2('Finishing'),
    p('Trim all weaver ends inside the basket with secateurs. Fit a removable cushion inside the basket for the cat. Leave the basket to dry for 48 hours before first use. The buff willow stiffens as it dries and the rim holds its shape.'),
    h2('Variations'),
    ul(
      li('Smaller dog or rabbit basket: reduce the base to 35 cm by 25 cm and the sides to 15 cm.'),
      li('Low-sided tray version: reduce the sides to 8 cm for a shallow resting tray without enclosing sides.'),
      li('Foot rail: add a ring of thicker rods (5 mm) around the base perimeter before staking up, to protect the base weave from floor abrasion.')
    ),
    ts([
      { symptom: 'Basket narrows too much at the top before the border', cause: 'Stakes pushed inward too early and too aggressively', fix: 'Begin the inward lean only in the last 5 cm of side height. The lean should be gradual, not a sharp step.' },
      { symptom: 'Oval base becomes round as weaving progresses', cause: 'The oval shape not maintained during base pairing', fix: 'Pull the long axis of the base gently during pairing to maintain the oval. Check the dimensions every 5 circuits against the target 45 cm by 35 cm.' },
      { symptom: 'Border stakes crack at the kink point', cause: 'Stakes too dry when the border was worked', fix: 'Soak the top 10 cm of each stake in water for 30 minutes before the border. Do not attempt the border on dry stakes.' }
    ])
  ]}
})

console.log('All 40 entries generated.')



