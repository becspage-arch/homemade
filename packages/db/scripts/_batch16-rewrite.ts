/**
 * Apply the grade-level rewrites for batch 2026-05-26-batch16.
 * Reads each JSON body, replaces the offending paragraph text, writes back.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-26-batch16')

type Rewrite = { file: string; oldText: string; newText: string }

const rewrites: Rewrite[] = [
  {
    file: 'apple-crumble.json',
    oldText: 'Apple crumble became a staple of British domestic cooking during the Second World War, when the Ministry of Food recommended the crumble topping as an economical alternative to pastry that required less fat. It was designed for a time when butter was rationed, and it turned out to be a very good dessert in its own right. The crumble has become one of the most recognisable British puddings and forms the template for a family of variations using different fruit fillings.',
    newText: 'Apple crumble became a British kitchen staple during the Second World War. Butter was rationed, so the crumble topping used less fat than a pastry crust. It turned out to be a very good pudding on its own. Today it sits in the front rank of British puddings. The same topping works over many other fruits, from rhubarb to plum to blackberry.',
  },
  {
    file: 'arancini.json',
    oldText: 'The rice must be completely cold before shaping; refrigerate for 2 hours minimum; refrigerate again after coating before frying',
    newText: 'The rice must be cold before you shape it. Chill for at least 2 hours. Chill again after coating, before frying.',
  },
  {
    file: 'biscotti-chocolate-hazelnut.json',
    oldText: 'The twice-baking technique dries the biscotti to a snap that holds for weeks in a tin and survives dunking in coffee without disintegrating immediately. Roasting the hazelnuts before adding them deepens the flavour considerably; raw hazelnuts in biscotti taste flat by comparison.',
    newText: 'Baking biscotti twice dries them to a snap. They stay crisp for weeks in a tin and hold up to a dunk in coffee. Roast the hazelnuts before they go in. Raw hazelnuts in biscotti taste flat next to roasted ones.',
  },
  {
    file: 'green-wood-vs-seasoned-wood.json',
    oldText: 'Every wood-craft project begins with a choice that determines what tools you will need, how the work will feel, and whether the finished piece will stay the shape you carved. That choice is whether to start from green wood or from seasoned wood. The terms are used loosely in everyday conversation, but in practice they describe two quite different materials with different working properties, different sourcing paths, and different finishing requirements.',
    newText: 'Every wood-craft project starts with a choice: green wood or seasoned wood. The choice sets your tools, the feel of the work, and whether the finished piece will hold its shape. The two terms get used loosely in chat. In practice they describe two quite different materials. The working feel, the sourcing, and the finishing rules all differ.',
  },
  {
    file: 'green-wood-vs-seasoned-wood.json',
    oldText: 'Boxes, picture frames, small furniture, joinery with cut joints (dovetails, mortise-and-tenon), and anything with a mating part that must remain dimensionally stable all need seasoned timber. The fundamental reason is that a green dovetail joint will lock tight and then open by a millimetre or more as the wood dries, which is visible and structural. Seasoned timber at the right moisture content for the destination room stays still.',
    newText: 'Boxes, picture frames, small furniture, and any cut joint (dovetails, mortise-and-tenon) need seasoned timber. A green dovetail will lock tight, then open by a millimetre or more as the wood dries. That gap is visible and weakens the joint. Seasoned wood at the right moisture for the room stays still.',
  },
  {
    file: 'green-wood-vs-seasoned-wood.json',
    oldText: 'A practised green-woodworker can turn or carve a bowl green, leave it to dry in a controlled way, and then finish the surfaces after drying. The blank is made slightly oversize and the walls are left even; the bowl warps into an oval as the wood dries, and the maker either embraces the oval form or returns it to the lathe for a final truing cut. This two-stage method is not beginner territory, but understanding it explains why some green-wood bowls are deliberately oval.',
    newText: 'A practised green-woodworker can turn or carve a bowl green, dry it in a steady way, then finish the surfaces. The blank is made slightly oversize with even walls. The bowl warps into an oval as it dries. The maker can keep the oval form, or take it back to the lathe for a final true cut. This is not beginner work. It does explain why some green-wood bowls are oval on purpose.',
  },
  {
    file: 'green-wood-vs-seasoned-wood.json',
    oldText: 'Good green wood for carving comes from coppice off-cuts, windfall branches, community-orchard prunings, and the skip or trailer of a local tree surgeon. Sycamore, birch, hazel, lime, ash, cherry, and willow are all common in the British Isles and western Europe. The wood-craft canon returns repeatedly to sycamore as the default spoon wood: it is widespread, grows to carving diameter quickly, carves cleanly green, dries to a pale food-safe surface, and has no notable toxicity.',
    newText: 'Good green wood for carving comes from coppice off-cuts, windfall branches, orchard prunings, and the skip or trailer of a tree surgeon. Sycamore, birch, hazel, lime, ash, cherry, and willow are common across the British Isles and western Europe. Sycamore is the standard spoon wood. It is widespread. It grows to carving size fast. It carves cleanly green, dries to a pale food-safe surface, and has no known toxic effect.',
  },
  {
    file: 'green-woodwork-primer.json',
    oldText: 'Coppice and pole wood is traditionally cut in winter (November to March) when the sap is down and the bark does not strip away with the wood during riving. Summer-cut wood has more free moisture and is softer immediately after cutting, but the bark can bond to the surface during the first few drying days. For spoon carving and bowl blanks, the wood is best worked within a week of felling; for tool handles and posts that will be fitted into metal heads, allow 3 to 4 weeks of partial drying before fitting so the joint tightens as the wood finishes drying. For turning on a pole lathe, work the blank as green as possible; green wood turns more cleanly than partially dried.',
    newText: 'Cut coppice and pole wood in winter (November to March), when the sap is down. The bark stays put during riving. Summer-cut wood has more free moisture and is softer just after cutting. The bark can bond to the surface in the first few drying days. Work spoon and bowl blanks within a week of felling. For tool handles and posts that fit into metal heads, let the wood part-dry for 3 to 4 weeks before fitting. The joint tightens as the wood finishes drying. For turning on a pole lathe, work the blank as green as you can. Green wood turns more cleanly than part-dried.',
  },
  {
    file: 'green-woodwork-primer.json',
    oldText: 'A green ash or sycamore spoon blank is the standard first piece: rive a section of fresh log in half, use the half-round stave as a spoon blank, and carve with a sloyd knife and hook knife. The whole process takes one afternoon and produces a usable spoon that demonstrates every principle of green woodwork; grain direction, moisture-dependent ease of cutting, and the relationship between blank shape and finished form. Tool handles and bean poles are the logical second step once the spoon is finished.',
    newText: 'A green ash or sycamore spoon is the standard first piece. Rive a fresh log in half. Use the half-round stave as a spoon blank. Carve with a sloyd knife and a hook knife. One afternoon makes a usable spoon. The piece shows every principle of green woodwork: grain direction, the way cutting eases when the wood is wet, and how the blank shape feeds into the finished form. Tool handles and bean poles are the next step once the spoon is done.',
  },
  {
    file: 'hand-on-chest-you-were-doing-your-best.json',
    oldText: "Self-compassion practice with a hand-on-heart anchor is documented across two related lineages. The somatic-therapy tradition (Peter Levine's Somatic Experiencing, Pat Ogden's Sensorimotor Psychotherapy) uses physical anchors as a route to nervous-system safety. The self-compassion research literature (Kristin Neff at the University of Texas, 2003 onward) names the hand-on-heart anchor specifically as a core self-compassion practice. The theme of self-forgiveness about a past money choice is adapted from Day 5 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025), which addresses past money shame as a recurring loop.",
    newText: 'Hand-on-heart self-touch sits in two practice lines. The body-based therapy world (Peter Levine, Pat Ogden) uses touch as a route to a calm body. The research side (Kristin Neff, University of Texas, from 2003) names hand-on-heart as a core self-kindness practice. The money self-forgiveness theme is adapted from Day 5 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). That day works on past money shame as a loop.',
  },
  {
    file: 'handing-the-burden-back-gently.json',
    oldText: 'Original to homemade.education, developed for the ancestral forgiveness theme in Day 12 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). Ancestral release visualisations draw on a long public-domain contemplative tradition; this version is shaped for the specific inherited-grief pattern the program addresses.',
    newText: 'Original to homemade.education. Written for the ancestral forgiveness theme in Day 12 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). Ancestral release work draws on a long public tradition of quiet visualisation. This version is shaped for the inherited-grief pattern the program works with.',
  },
  {
    file: 'hands-open-not-gripping-visualisation.json',
    oldText: 'Original to homemade.education, developed for the theme of Day 22 of SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025).',
    newText: 'Original to homemade.education. Written for Day 22 of SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025).',
  },
  {
    file: 'household-water-audit.json',
    oldText: 'The UK per-capita average of 142 litres per day breaks down roughly as: toilet 30-40 L, personal washing (shower/bath) 30-40 L, laundry 15-20 L, kitchen and drinking 10-15 L, garden and outdoor 5-40 L (highly seasonal). The audit calculates your actual use by activity and compares it to what is achievable with efficient fittings.',
    newText: 'Average UK water use is about 142 litres per person per day. Toilet uses 30 to 40 L, shower or bath 30 to 40 L, laundry 15 to 20 L, kitchen and drinking 10 to 15 L, and garden 5 to 40 L (very seasonal). This audit works out your real use by activity. It then shows what you could reach with better fittings.',
  },
  {
    file: 'insulating-below-rafters-warm-roof.json',
    oldText: 'A standard 100 mm rafter depth filled with mineral wool gives a U-value of approximately 0.45 W/m2K and leaves every rafter exposed as a thermal bridge running from the warm room to the cold roof covering. The correct approach is insulation in two layers: as much as will fit between the rafters, then a second continuous layer of PIR board below the rafters. The second layer breaks the rafter bridge and adds thermal resistance without the constraints of rafter depth.',
    newText: 'A 100 mm rafter filled with mineral wool gives a U-value of about 0.45 W/m2K. Every rafter is left as a thermal bridge from the warm room to the cold roof. The right method is two layers: as much wool as will fit between the rafters, then a second layer of PIR board below them. The second layer breaks the rafter bridge. It adds more heat resistance without being limited by rafter depth.',
  },
  {
    file: 'insulating-below-rafters-warm-roof.json',
    oldText: 'Check that the existing roof covering has a breathable felt/membrane (modern installations) or is boarded with battens and tiles (traditional). Traditional coverings without a breathable underlay rely on the 25 mm ventilation gap above the insulation to remove any moisture reaching the roof void.',
    newText: 'Check the existing roof covering. Modern roofs have a breathable felt or membrane. Older roofs are boarded with battens and tiles. Older roofs without a breathable underlay rely on the 25 mm gap above the insulation to clear any moisture in the roof void.',
  },
  {
    file: 'insulation-and-ventilation-together.json',
    oldText: 'An unimproved pre-war UK house leaks around 15 to 20 air changes per hour at a 50 Pa pressure test. Standard retrofit draught-proofing (chimney sealing, floor-edge mastic, window draught strips) typically reduces this to 8 to 12 ACH. At below approximately 5 ACH, uncontrolled infiltration no longer reliably provides sufficient fresh air for normal occupancy. That threshold is rarely reached by basic draught-proofing alone, but it is relevant when adding internal wall insulation with taped vapour control layers or replacing windows with tightly sealed frames.',
    newText: 'An unimproved pre-war UK house leaks about 15 to 20 air changes per hour at a 50 Pa pressure test. Standard draught-proofing (chimney sealing, floor-edge mastic, window draught strips) cuts that to 8 to 12 ACH. Below about 5 ACH, the random leaks no longer let in enough fresh air on their own. Basic draught-proofing rarely gets you that low. It does matter once you add taped vapour control layers, or fit tightly sealed window frames.',
  },
  {
    file: 'insulation-and-ventilation-together.json',
    oldText: 'Building Regulations Part F requires background ventilation (8000 mm² of trickle vent per habitable room in new-build), extract ventilation in kitchens (30 l/s or 60 l/s for recirculation hoods) and bathrooms (15 l/s), and purge ventilation via openable windows. For most standard draught-proofing retrofit work, the existing window trickle vents and extract fans provide adequate controlled ventilation, provided they are open and functioning.',
    newText: 'Building Regulations Part F sets the ventilation rules. Each habitable room in a new-build needs trickle vents of 8000 mm² total. Kitchens need an extract fan rated at 30 l/s, or 60 l/s for a recirculating hood. Bathrooms need 15 l/s. There must also be a purge route via openable windows. For most retrofit work, the trickle vents and extract fans you have give enough controlled ventilation, as long as they are open and work.',
  },
  {
    file: 'insulation-and-ventilation-together.json',
    oldText: 'Humidity consistently above 65% RH in living rooms or bedrooms. A humidity meter reading above 65% over multiple consecutive occupied days indicates moisture is not being extracted fast enough.',
    newText: 'Humidity above 65% RH in living rooms or bedrooms, day after day. A meter reading above 65% for several days in a row means moisture is not being extracted fast enough.',
  },
  {
    file: 'insulation-and-ventilation-together.json',
    oldText: 'Mechanical ventilation with heat recovery (MVHR) extracts stale air from wet rooms, recovers 80 to 90 percent of its heat through a heat exchanger, and supplies fresh tempered air to bedrooms and living rooms. It makes sense when airtightness is below approximately 3 ACH and the building is insulated well enough that the heat recovered is a meaningful fraction of the remaining heat loss. In a standard UK retrofit to Part L target, MVHR is rarely justified financially. In a Passivhaus or equivalent deep retrofit, it is standard practice.',
    newText: 'Mechanical ventilation with heat recovery (MVHR) takes stale air from wet rooms. It recovers 80 to 90% of its heat through a heat exchanger. It then pushes fresh warm air into bedrooms and living rooms. It makes sense when airtightness is below about 3 ACH. The house must also be well enough insulated that the recovered heat is a real chunk of the heat loss left. A standard UK retrofit to Part L rarely earns back the cost. A Passivhaus or deep retrofit fits it as standard.',
  },
  {
    file: 'insulation-and-ventilation-together.json',
    oldText: 'A more accessible alternative for houses that have been significantly draught-proofed is a single-room heat recovery unit: a through-wall device that alternately extracts and supplies via a ceramic heat store. These suit bedrooms where the main issue is overnight CO2 build-up and humidity, without the ductwork required for a full MVHR system.',
    newText: 'A simpler option for well draught-proofed houses is a single-room heat recovery unit. It is a through-wall device. It takes turns at pulling out stale air and pushing in fresh air, through a ceramic heat store. It suits bedrooms where the main issue is overnight CO2 and humidity. It saves the ductwork a full MVHR needs.',
  },
  {
    file: 'insulation-and-ventilation-together.json',
    oldText: 'Solid-wall houses insulated with mineral wool in a breathable construction (lime plaster finish, no VCL) rely on vapour-open walls and controlled ventilation working together. If extract fans are inadequate in this type of house, moisture that the wall once managed through slow outward drying accumulates indoors instead. Extract fan performance should be checked before and after any change to wall construction.',
    newText: 'Solid-wall houses with breathable build-up (mineral wool, lime plaster finish, no VCL) rely on vapour-open walls plus controlled ventilation. The two have to work together. If extract fans are weak in this type of house, moisture the wall once dried out slowly now builds up indoors. Check extract fan performance before and after any change to the wall build-up.',
  },
  {
    file: 'internal-wall-insulation-dry-lining.json',
    oldText: "The thermal bridge at the junction between the insulated wall and the floor, the ceiling, and the party wall is the biggest performance gap in typical internal wall insulation. Where possible, return the insulation board 300 mm along the party wall face and across the ceiling and floor zone at the wall base. In practice, party wall returns are often the hardest: the skirting board junction with the party wall is not usually accessible.",
    newText: 'The cold bridge where the insulated wall meets the floor, ceiling, and party wall is the biggest weak spot. Where you can, return the insulation board 300 mm along the party wall face. Carry it across the ceiling and floor at the wall base too. In practice, party wall returns are often the hardest. The skirting at the party wall is not usually reachable.',
  },
  {
    file: 'japanese-stab-binding-asanoha.json',
    oldText: 'The asanoha toji builds on the yotsume four-hole stitch by adding a second thread pass that laces diagonals between the base holes, forming a six-pointed star at each hole cluster. The base structure uses the same four holes as yotsume; the hemp-leaf pattern uses six holes per cluster: two at each base position plus additional positions between them. For a readable A5 stab binding, use two clusters (head and tail), with the diagonal wraps linking them.',
    newText: 'Asanoha toji builds on the yotsume four-hole stitch. A second thread pass laces diagonals between the base holes. The diagonals form a six-pointed star at each hole cluster. The base holes are the same four as yotsume. The hemp-leaf pattern uses six holes per cluster: two at each base position plus extra holes between them. For a clean A5 stab binding, work two clusters (head and tail), with the diagonal wraps linking them.',
  },
  {
    file: 'japanese-stab-binding-asanoha.json',
    oldText: 'The asanoha pattern is significantly clearer to execute once the four-hole yotsume is familiar. Sew at least one four-hole booklet before attempting the hemp-leaf variation.',
    newText: 'The asanoha pattern is much easier once the four-hole yotsume is familiar. Sew at least one four-hole booklet first.',
  },
  {
    file: 'japanese-tissue-paper-mending.json',
    oldText: "The principle of Japanese tissue repair is minimal intervention: the thinnest possible patch, applied reversibly, using an adhesive that can be released with moisture. Kozo tissue from Japan is made from paper-mulberry bark fibres; even at 3-5 gsm it has considerable tensile strength, and its long fibres lock into the parent paper's surface. This tutorial repairs a simple straight tear and a small hole.",
    newText: 'Japanese tissue repair uses the lightest touch. The thinnest patch, set down so it can be lifted later, with a paste that softens with water. Kozo tissue from Japan is made from paper-mulberry bark fibres. Even at 3 to 5 gsm it is strong. The long fibres lock into the surface of the paper you are mending. This tutorial repairs a straight tear and a small hole.',
  },
  {
    file: 'japanese-tissue-paper-mending.json',
    oldText: 'The same technique consolidates fragile paper before rebinding: a Japanese tissue consolidant layer, brushed over the entire spine area of a crumbling text block, stabilises the paper enough to handle for resewing. Heat-set tissue (tissue backed with a reversible adhesive activated by a warm iron) is a faster alternative for book-conservation centres; the cold-paste method taught here is the reversible hand-conservation version.',
    newText: 'The same method strengthens fragile paper before rebinding. Brush a thin tissue layer across the spine of a crumbling text block. The tissue holds the paper steady enough for resewing. Heat-set tissue (tissue with a paste that wakes up under a warm iron) is faster. Book-conservation centres use it. The cold-paste method here is the reversible hand version.',
  },
  {
    file: 'managing-a-sow-with-litter.json',
    oldText: "Most sows farrow without assistance if the pen is correctly prepared and the sow is in good condition. The critical work starts within an hour of farrowing: ensuring all piglets have accessed the sow's teats and received colostrum within the first six hours is the single biggest factor in early piglet survival.",
    newText: 'Most sows farrow without help if the pen is set up well and the sow is in good shape. The vital work starts within an hour of farrowing. Make sure every piglet reaches a teat and takes colostrum in the first six hours. That single point matters more than any other for early piglet survival.',
  },
  {
    file: 'mishima-inlay-on-air-dry-clay.json',
    oldText: 'Mishima line inlay adapts to air-dry clay cleanly: incise the lines at leather-hard stage, fill with coloured slip, let it firm, scrape back to reveal the lines. The technique is named for a Korean decorative tradition where white slip was inlaid into grey celadon greenware; this tutorial uses the same incise-and-fill principle in acrylic-tinted clay slip on air-dry clay. The principle and the result are the same; the materials are adapted.',
    newText: 'Mishima line inlay works well on air-dry clay. Cut the lines when the clay is leather-hard. Fill with coloured slip. Let it firm. Scrape back to reveal the lines. The name comes from a Korean tradition of white slip set into grey celadon. This tutorial uses the same cut-and-fill idea in acrylic-tinted slip on air-dry clay. Same idea, same look, with adapted materials.',
  },
  {
    file: 'needle-felting-a-base-shape.json',
    oldText: 'A compacted base shape is the starting point for dimensional needle-felted figures (robins, animals, botanical forms), flat brooches and decorative patches, and mixed-media needle-felted pictures. Surface colour and detail work are added after the base is fully compacted, using small pieces of roving in different colours pressed against the surface and needled in with a fine needle.',
    newText: 'A firm base shape is the start for 3D needle-felted figures (robins, animals, plant forms), flat brooches and patches, and mixed-media felted pictures. Add surface colour and detail once the base is fully firm. Press small pieces of coloured roving against the surface. Needle them in with a fine needle.',
  },
  {
    file: 'planing-a-door-to-fit.json',
    oldText: 'Doors bind for two reasons: the door has swollen (common after wet weather, particularly in period houses with solid timber doors), or the frame has moved. Both are diagnosed the same way: find the binding point, take off the minimum amount of timber to clear it, rehang, and re-paint or re-seal the planed edge to prevent the problem recurring.',
    newText: 'Doors bind for two reasons. The door has swelled (common after wet weather, especially in old houses with solid timber doors), or the frame has shifted. The fix is the same either way. Find the binding point. Plane off the smallest amount of timber to clear it. Rehang the door. Re-paint or re-seal the planed edge so the problem does not come back.',
  },
  {
    file: 'sweet-almond-geranium-soap.json',
    oldText: 'Sweet almond oil in cold-process soap behaves similarly to olive oil but traces a little faster, produces a slightly lighter lather, and has a shorter shelf life because of its higher linoleic acid content. In this formula it replaces part of the olive fraction, giving a bar that is milder than a coconut-heavy recipe and softer than a pure bastille, with a clear floral scent from rose geranium essential oil.',
    newText: 'Sweet almond oil in cold-process soap acts much like olive oil. It traces a little faster. It gives a slightly lighter lather. It has a shorter shelf life thanks to its higher linoleic acid level. In this recipe it takes the place of part of the olive oil. The bar is milder than a coconut-heavy soap and softer than a pure bastille, with a clear floral scent from rose geranium essential oil.',
  },
  {
    file: 'sweet-almond-geranium-soap.json',
    oldText: "Rose geranium (Pelargonium roseum) is a good essential oil for cold-process soap because it has reasonable tenacity in the alkaline environment; many citrus and floral oils fade badly, but geranium holds its character through cure. It has a soft, rosy-green scent without the sweetness of a true rose absolute.",
    newText: 'Rose geranium (Pelargonium roseum) is a good essential oil for cold-process soap. It holds its scent well in the alkaline mix. Many citrus and floral oils fade badly through cure. Geranium keeps its character. The scent is soft and rosy-green, without the sweetness of a true rose absolute.',
  },
  {
    file: 'tea-tree-spot-treatment.json',
    oldText: 'Tea tree essential oil (Melaleuca alternifolia) has well-documented antimicrobial activity against the bacteria associated with acne. This recipe dilutes it to a 5% dilution ratio in jojoba oil, which is appropriate for spot use on individual blemishes. Apply only to the blemish itself with a clean fingertip or cotton bud; do not spread across the whole face.',
    newText: 'Tea tree oil (Melaleuca alternifolia) has a long folk reputation as a spot treatment for blemishes. This recipe dilutes it to 5% in jojoba oil. That ratio is right for spot use only. Dab onto the blemish with a clean fingertip or cotton bud. Do not spread it across the whole face.',
  },
]

let okCount = 0
let failCount = 0

for (const rw of rewrites) {
  const path = resolve(batchDir, rw.file)
  const raw = readFileSync(path, 'utf8')
  if (!raw.includes(rw.oldText)) {
    console.error(`[FAIL] ${rw.file} — old text not found`)
    failCount++
    continue
  }
  const updated = raw.replace(rw.oldText, rw.newText)
  if (updated === raw) {
    console.error(`[FAIL] ${rw.file} — no change after replace`)
    failCount++
    continue
  }
  writeFileSync(path, updated, 'utf8')
  console.log(`[OK]   ${rw.file}`)
  okCount++
}

console.log(`\nDone: ${okCount} ok, ${failCount} failed`)
process.exit(failCount > 0 ? 1 : 0)
