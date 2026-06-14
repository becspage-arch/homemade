/**
 * Grade-level simplification patch for pottery-ceramics bulk-009.
 * Rewrites specific paragraphs to grade 6-8 reading level.
 * Handles single-text-node paragraphs only; skips multi-node (complex) cases.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const briefDir = join(__dirname, 'pottery-ceramics-bulk-009-briefs')

// Each entry: [file, path, newText]
// Path notation: "paragraph[N]" = Nth paragraph in body.content
//   "orderedList[N].listItem[M].paragraph[0]" = orderedList N -> listItem M -> first paragraph
//   "bulletList[N].listItem[M].paragraph[0]" = same for bullet lists
//   "troubleshooter[N].item[M].fix|cause" = troubleshooter item field (handled separately)
const PATCHES = [
  ['02-pinch-pot-textured-salt-cellar.json', 'paragraph[1]',
    'Press a texture into the outside of the pot while the clay is still soft. This is optional. A piece of woven cloth leaves a grid of tiny squares. A cut cork leaves a ring of dots. A sea shell pressed flat leaves radiating ridges.'],

  ['02-pinch-pot-textured-salt-cellar.json', 'bulletList[14].listItem[0].paragraph[0]',
    'A pinch pot is a ball of clay pressed open with the thumb, then widened by turning between finger and thumb. It is the oldest ceramic form. A salt cellar is a good first pinch pot project. The walls need to be 3 to 4 mm thick at the base and 4 to 5 mm at the rim. The opening needs to be wide enough for a fingertip. This tutorial uses air-dry clay. No kiln is needed. Seal the finished piece well, as it will sit near salt and moisture.'],

  ['02-pinch-pot-textured-salt-cellar.json', 'bulletList[14].listItem[2].paragraph[0]',
    'A pinch pot is a ball of clay pressed open with the thumb, then widened by turning between finger and thumb. It is the oldest ceramic form. A salt cellar is a good first pinch pot project. The walls need to be 3 to 4 mm thick at the base and 4 to 5 mm at the rim. The opening needs to be wide enough for a fingertip. This tutorial uses air-dry clay. No kiln is needed. Seal the finished piece well, as it will sit near salt and moisture.'],

  ['02-slab-built-rectangular-serving-board.json', 'orderedList[7].listItem[5].paragraph[0]',
    'A rectangular slab board is a flat clay base with low walls around the edge. It forms a shallow tray about 25 cm x 15 cm. Roll the base as a slab. Cut strips for the walls and join them with score-and-slip. No kiln is needed. The clay sets at room temperature in two to three days. Seal it well. Then use it as a display tray for cheese, bread, or charcuterie.'],

  ['03-coil-built-sculptural-abstract-vase.json', 'bulletList[14].listItem[2].paragraph[0]',
    'Coil building uses stacked rings of clay, each joined to the one below. It is one of the oldest methods for making large vessels. Standard teaching says to smooth the outside so the coils disappear. This tutorial does the opposite. The coils stay visible on the outside as a spiral ridge. Only the inside wall is smoothed, to keep the form strong. The finished piece shows how it was made.'],

  ['05-paper-clay-angel-wing-wall-hanging.json', 'bulletList[12].listItem[0].paragraph[0]',
    'Paper clay is stronger than standard air-dry clay. Cellulose fibres in the clay hold it together as it dries. This matters for a flat slab piece. A plain air-dry slab this size would bow as it dried. Paper clay holds the panel flatter. Cut the wing shapes from rolled slabs using a card template. Press a real feather into the clay while it is still fresh to add texture. The finished pieces are not waterproof. Mount them indoors as decoration.'],

  ['06-slab-built-rectangular-soap-dish.json', 'bulletList[13].listItem[0].paragraph[0]',
    'A soap dish is a good first slab project. The shape is flat and rectangular. There are no curves to form and no tricky joins. The drainage ribs are strips of clay pressed across the base. They lift the soap so air can move underneath and the soap does not sit in water. This dish is made from air-dry clay. It cannot be fired. Seal it well and it will handle the daily moisture from a bar of soap.'],

  ['07-slab-built-geometric-picture-frame.json', 'orderedList[5].listItem[2].paragraph[0]',
    'This picture frame holds a standard 10 x 15 cm print. A 3 cm border on all sides gives a frame 16 x 21 cm overall. Cut the frame from a single rolled slab. Remove the centre window. Score geometric lines across the border for decoration. Add a clay kickstand at the back so it stands on a shelf. No kiln is needed. The frame dries at room temperature.'],

  ['07-slab-built-geometric-picture-frame.json', 'orderedList[7].listItem[1].paragraph[0]',
    'This picture frame holds a standard 10 x 15 cm print. A 3 cm border on all sides gives a frame 16 x 21 cm overall. Cut the frame from a single rolled slab. Remove the centre window. Score geometric lines across the border for decoration. Add a clay kickstand at the back so it stands on a shelf. No kiln is needed. The frame dries at room temperature.'],

  ['08-pinch-pot-cactus-planter.json', 'paragraph[0]',
    'Air-dry clay suits a cactus planter well. Cacti dry out between waterings, so the pot is not under constant wet stress. This is different from a herb pot, which stays damp. The clay needs three things: a drainage hole in the base, walls thick enough to dry without cracking, and three coats of sealant on the inside before you plant anything.'],

  ['09-polymer-clay-galaxy-swirl-pendant.json', 'orderedList[7].listItem[0].paragraph[0]',
    'This pendant is a round polymer clay disc, 35 mm across and 4 mm thick. The face shows swirled deep-blue, purple, and black with scattered pearl highlights. The effect comes from a partial mix: the colours are twisted together but not fully blended. Press a small bail into the top edge before baking. This lets the pendant hang on a cord or chain. Bake the disc in a domestic oven at 130°C for 30 minutes.'],

  ['10-air-dry-clay-mosaic-picture-frame.json', 'orderedList[5].listItem[3].paragraph[0]',
    'This mosaic frame works differently from ceramic tile mosaic. You do not grout gaps between cut tiles. Instead, press small clay pieces onto a fresh clay base before it dries. The base clay grips the pieces as it dries. The result is a unified clay surface with a tile-pattern look. This frame is decorative. Seal it well before putting it in a humid room.'],

  ['10-pinch-pot-whale-sea-life-figurine.json', 'orderedList[11].listItem[0].paragraph[0]',
    'This whale figurine is about 16 cm from nose to tail and 8 cm wide. It sits on a shelf or windowsill as a display piece. Make the body from two pinch pot halves. Join them at the belly seam and shape the front into an elongated point. Taper the rear into a tail. Cut the tail fluke, two side fins, and a dorsal fin from a thin slab. Press them on. No kiln is needed. The figurine dries at room temperature in two days.'],

  ['11-mishima-inlay-on-leather-hard-clay.json', 'paragraph[1]',
    'This technique works on thrown and hand-built forms. The carving must happen at the right leather-hard stage. If the clay is too soft, it smears. If it is too dry, it crumbles instead of cutting clean. A piece left at leather-hard for four to six hours at room temperature is usually ready.'],

  ['12-engobe-layer-brushwork-on-air-dry.json', 'paragraph[0]',
    'An engobe is a slip with more flux and filler than plain liquid clay. In a kiln it fires to a matte surface. On air-dry clay it dries and bonds to the surface. The result is a clay-rich matte finish that looks different from acrylic paint. The surface is slightly chalky and gritty. This is the look of unglazed ceramics.'],

  ['12-engobe-layer-brushwork-on-air-dry.json', 'paragraph[1]',
    'Use commercial pottery slip for this technique. Choose coloured-slip-red, coloured-slip-black, or coloured-slip-white from the master table. Thin the slip until it is easy to brush. Apply it to an air-dry clay surface. No kiln is needed.'],

  ['12-slab-built-hanging-crescent-planter.json', 'orderedList[5].listItem[1].paragraph[0]',
    'A crescent wall planter is a slab-built trough bent into a curved arc. A flat back panel holds it against the wall for hanging. This version uses air-dry clay. No kiln or wheel is needed. The finished planter is 18 cm across at its widest. It holds one small succulent or a 5 cm pot in the trough.'],

  ['13-marbling-two-underglazes-on-bisqueware.json', 'orderedList[5].listItem[2].paragraph[0]',
    'Marbling with underglazes is different from slip-marbling on green clay. On bisque-fired ware, brush both colours onto the surface and swirl them before they dry. The bisque is porous enough to grip the underglaze. It is not so absorbent that the liquid disappears at once. You have 30 to 60 seconds to move the colours before they set.'],

  ['14-crackle-paste-texture-on-air-dry-clay.json', 'paragraph[0]',
    'Crackle medium shrinks at a different rate from the base coat below it. As the crackle layer dries, it pulls. The top colour cracks into patches and the base colour shows in the gaps. A thin coat of crackle medium gives fine hairline cracks. A thick coat gives larger, more dramatic fractures. On air-dry clay, the result looks like a deliberately aged ceramic surface.'],

  ['15-feather-impressing-into-clay.json', 'orderedList[4].listItem[5].paragraph[0]',
    'A feather captures more detail than most found objects. The barbs of a primary feather are fine and evenly spaced. On fresh clay, the quill shows as a raised ridge. The barbs leave fine grooves on both sides. On large feathers, the tiny barbule hooklets leave a secondary grid across the barb marks. Use clean, dry feathers. Press them into clay that is fresh but not sticky.'],

  ['15-polymer-clay-sculpted-cat-brooch.json', 'orderedList[7].listItem[2].paragraph[0]',
    'This brooch is a flat-backed polymer clay figure. Build it from a teardrop body, a round head, two pointed ears, a curled tail, and four short legs. Scratch the face details with a needle tool. Paint them with acrylics after baking. The finished brooch is 4 cm tall. Glue a pin bar to the back and wear it on clothing.'],

  ['16-stencil-acrylic-paint-on-air-dry-clay.json', 'paragraph[0]',
    'Before you stencil on air-dry clay, seal the surface first. Without a seal coat, acrylic paint soaks into the clay and the edges blur. This is different from stencilling on paper or fabric. The sealer makes the surface non-absorbent so the paint sits sharp-edged on top.'],

  ['17-wood-stamp-decoration-on-clay.json', 'paragraph[0]',
    'A pottery stamp gives a clean, repeatable impression in fresh clay. Use stamps for borders, allover patterns, maker\'s marks, or single motifs. Commercial stamps are available in bisque-fired clay or carved hardwood. The most satisfying ones are cut from softwood such as balsa, basswood, or pine, using a lino-cutting tool or craft knife.'],

  ['17-wood-stamp-decoration-on-clay.json', 'orderedList[6].listItem[4].paragraph[0]',
    'A pottery stamp gives a clean, repeatable impression in fresh clay. Use stamps for borders, allover patterns, maker\'s marks, or single motifs. Commercial stamps are available in bisque-fired clay or carved hardwood. The most satisfying ones are cut from softwood such as balsa, basswood, or pine, using a lino-cutting tool or craft knife.'],

  ['18-trailing-coloured-slip-on-wet-clay.json', 'paragraph[0]',
    'Traditional slipware was made in Staffordshire, Devon, and Sussex from the seventeenth to nineteenth centuries. Potters trailed liquid slip through a goose quill onto fresh clay. The lines stood up from the surface and survived firing. The same technique works on air-dry clay. The slip bonds to the fresh clay as both dry together. The raised lines are sealed over in the final stage.'],

  ['20-air-dry-clay-succulent-pot-with-drainage.json', 'orderedList[11].listItem[0].paragraph[0]',
    'A succulent pot is a small pinch pot with a drainage hole in the base. The hole is pressed through before the clay dries. Air-dry clay needs no kiln. The finished pot is 8 cm across and 6 cm tall. Seal it before use. Plant succulents in their own growing medium inside the pot, rather than bare-root.'],

  ['20-air-dry-clay-succulent-pot-with-drainage.json', 'orderedList[11].listItem[1].paragraph[0]',
    'A succulent pot is a small pinch pot with a drainage hole in the base. The hole is pressed through before the clay dries. Air-dry clay needs no kiln. The finished pot is 8 cm across and 6 cm tall. Seal it before use. Plant succulents in their own growing medium inside the pot, rather than bare-root.'],

  ['20-clay-reclaim-from-trimmings.json', 'orderedList[2].listItem[4].paragraph[0]',
    'Air-dry clay that has dried but not fully hardened can be returned to workable clay by slaking. The clay should still be white to cream in colour, not yellowed or brittle. Clay that has fully set cannot be reclaimed. At that point, it crumbles to white powder. Water will not bring it back. Only reclaim greenware and leather-hard scraps.'],

  ['21-choosing-clay-body-for-project-type.json', 'bulletList[8].listItem[4].paragraph[0]',
    'The clay body you choose affects how the finished piece performs. It determines whether the piece is waterproof, food-safe, and strong enough for its use. It also affects which decoration techniques will work. No single clay body suits every project. This tutorial matches common clay bodies to the project types they fit best.'],

  ['24-making-and-using-texture-rollers.json', 'paragraph[0]',
    'A texture roller has a relief pattern on its surface. As the roller turns, the pattern presses into the clay. The pattern wraps all the way around the roller, so it repeats without gaps. One rolling pass covers an entire slab. Commercial texture rollers in bisque-fired clay or carved wood are sold by pottery suppliers. This tutorial also shows how to make one from polymer clay. No specialist tools are needed.'],

  ['25-understanding-grog-and-its-uses.json', 'paragraph[0]',
    'Grog particles are pre-fired clay. They do not shrink when added to a wet clay body, because they are already fired. They act as anchors in the clay matrix. As the raw clay around them dries and shrinks, the grog holds it steady. This reduces overall shrinkage. It also creates a rough, open texture that lets moisture escape more evenly from thick sections. Uneven drying is the main cause of cracking in large forms.'],

  ['25-understanding-grog-and-its-uses.json', 'orderedList[5].listItem[1].paragraph[0]',
    'Grog particles are pre-fired clay. They do not shrink when added to a wet clay body, because they are already fired. They act as anchors in the clay matrix. As the raw clay around them dries and shrinks, the grog holds it steady. This reduces overall shrinkage. It also creates a rough, open texture that lets moisture escape more evenly from thick sections. Uneven drying is the main cause of cracking in large forms.'],

  ['25-understanding-grog-and-its-uses.json', 'bulletList[7].listItem[2].paragraph[0]',
    'Grog particles are pre-fired clay. They do not shrink when added to a wet clay body, because they are already fired. They act as anchors in the clay matrix. As the raw clay around them dries and shrinks, the grog holds it steady. This reduces overall shrinkage. It also creates a rough, open texture that lets moisture escape more evenly from thick sections. Uneven drying is the main cause of cracking in large forms.'],

  ['27-pinch-pot-trio-ring-dish-set.json', 'orderedList[6].listItem[8].paragraph[0]',
    'A ring dish set is three small open bowls in air-dry clay. Shape them using the pinch pot method. Make them graduated in size, from about 6 cm to 10 cm across. They hold rings, earrings, and small jewellery on a dressing table or bedside. No kiln is needed. Making three in one session gives enough practice to improve from the first dish to the third.'],

  ['28-centring-and-opening-porcelain-clay.json', 'paragraph[1]',
    'Use porcelain straight from storage. Do not let it warm at room temperature for hours. Keep spare clay balls in a cool place. Use cold water for lubrication. Keep your hands cool if you can. Friction warms porcelain faster than stoneware and reduces the time you have for throwing.'],

  ['28-centring-and-opening-porcelain-clay.json', 'orderedList[7].listItem[0].paragraph[0]',
    'Porcelain is less plastic than stoneware. It resists deformation more and cracks with less warning. Centring needs lighter pressure and more passes. When opening, compress the floor carefully to prevent S-cracks. Keep throwing sessions short. Porcelain warms from hand friction and becomes harder to work as the session goes on.'],

  ['29-texture-stamping-systematic-approach.json', 'paragraph[0]',
    'Texture stamping means pressing a firm object into soft clay to make an impressed pattern. It works on any clay body: air-dry clay, paper clay, or polymer clay, while the clay is still soft. No specialist tools are needed. Commercial pottery stamps, everyday objects, and handmade bisque stamps all work. Consistent results come from having a small, tested set of stamps and knowing how each one behaves on each clay body.'],

  ['29-texture-stamping-systematic-approach.json', 'paragraph[4]',
    'A good impression has even depth across the whole stamped area. The edges are clean with no smearing or dragging. There is a sharp boundary between the impressed area and the surrounding surface. The clay outside the impression is undisturbed. Hold the tile at a low angle to the light. The impression should cast a shadow you can read from several metres away.'],

  ['29-texture-stamping-systematic-approach.json', 'orderedList[7].listItem[6].paragraph[0]',
    'Texture stamping means pressing a firm object into soft clay to make an impressed pattern. It works on any clay body: air-dry clay, paper clay, or polymer clay, while the clay is still soft. No specialist tools are needed. Commercial pottery stamps, everyday objects, and handmade bisque stamps all work. Consistent results come from having a small, tested set of stamps and knowing how each one behaves on each clay body.'],

  ['31-throwing-a-wide-pouring-lip-jug.json', 'paragraph[1]',
    'When the jug is leather-hard, pull a handle from a ball of stoneware clay. Attach it opposite the lip. Score and slip both the upper and lower attachment points. The upper attachment sits 2 cm below the rim. The lower attachment sits 5 to 6 cm above the base. Let the handle dry on the jug before bisque firing.'],

  ['34-layering-two-commercial-glazes-for-effect.json', 'orderedList[8].listItem[0].paragraph[0]',
    'In glaze layering, the top glaze melts at the same time as the base glaze. The fluxes in both glazes mix at the boundary and create a blended zone. Where the top glaze runs thin, the base colour shows through. The richness of layered glazes comes from this variation. Thick areas of top glaze look different from thin areas where the base reads through.'],

  ['34-throwing-a-soap-dish-with-drainage-ribs.json', 'paragraph[1]',
    'Shallow throwing is its own skill. The clay opens wide quickly and the walls are short. Any off-centre throwing shows at once. Take extra care with centring. Open slowly. Stop working the clay once the dish shape is in place.'],

  ['35-glaze-pen-decoration-on-bisqueware.json', 'paragraph[0]',
    'Glaze pens come in two types. Underglaze pens are applied before the clear glaze coat and fired under it. Overglaze pens are applied after the glaze firing and re-fired at a lower temperature. This tutorial uses the underglaze approach. Decorate the bisque first, then apply a clear glaze coat on top. The fired line sits sealed under the glaze. This gives it depth and clarity that surface overglaze cannot match.'],

  ['35-glaze-pen-decoration-on-bisqueware.json', 'paragraph[2]',
    'Underglaze pen lines look light before firing and deepen in the kiln. Blues become a deep cobalt. Greens shift slightly toward teal. Reds shift orange at cone 6 but are truer at cone 04. Always test a sample line on a spare bisque tile first. This confirms the colour under your specific clear glaze before you decorate a finished piece.'],

  ['35-throwing-a-porcelain-wall-pocket-vase.json', 'orderedList[8].listItem[3].paragraph[0]',
    'A wall pocket vase is a small vase that hangs flat against a wall. It holds a few stems or a trailing plant. Throw it in porcelain as a nearly closed form. At the leather-hard stage, press the back wall gently flat from the inside using a paddle or flat rib. Pierce two small holes near the shoulder for a hanging cord. The front keeps its rounded thrown shape. The flat back lets it sit flush against the wall.'],

  ['36-applying-coloured-slips-to-greenware.json', 'paragraph[4]',
    'A good slip coat is even in thickness. It has no pinholes or bare patches. At the leather-hard stage it should hold firmly to the surface. Run a fingernail lightly over it: the slip should not lift or flake. After bisque firing, the surface is matte and slightly chalky. After a clear glaze firing, the colour deepens and the glaze brings out the full saturation of the oxide stain.'],

  ['37-reactive-shino-glaze-application.json', 'paragraph[1]',
    'Classic American Shino base for cone 9 to 10 reduction firing. Mix: Nepheline syenite 500 g (or potash feldspar as a substitute). Soda feldspar 200 g. Kaolin 200 g. Silica 100 g. The fired surface is white to warm cream, matte, and slightly pitted.'],

  ['37-sodium-silicate-crackle-technique.json', 'paragraph[1]',
    'This is an advanced technique. The timing is strict and there is no way to undo it once started. Results vary between pieces, even within the same session. Commit to the process and be willing to experiment.'],

  ['37-sodium-silicate-crackle-technique.json', 'orderedList[8].listItem[2].paragraph[0]',
    'Sodium silicate is a simple industrial compound. Brush it onto the outside of a freshly thrown, still-wet form right after it comes off the wheel. As the clay dries, the silicate skin and the clay shrink at different rates. The skin fractures and wrinkles. Thick silicate and fast drying give large folded ridges. Thin silicate and slow drying give fine crazing.'],

  ['37-sodium-silicate-crackle-technique.json', 'paragraph[10]',
    'Do not skip the slow moisture ramp when firing. The piece may look dry, but sodium silicate can hold residual moisture inside. Start the bisque schedule at 60°C per hour up to 150°C. This drives out all moisture before the temperature climbs higher.'],

  ['38-throwing-a-stoneware-baking-dish.json', 'paragraph[1]',
    'This is an advanced project for two reasons. First, the weight of clay (1.4 kg) needs strong centring and pulling. Second, the oval altering step must happen at exactly the right leather-hard stage. Press the form too wet and it will relax back toward round as it dries. Press it too dry and it will crack at the altered points.'],

  ['39-saggar-firing-technique.json', 'paragraph[1]',
    'A saggar can be thrown on the wheel from a grogged clay body. Make it a wide, low cylinder with thick walls (10 to 12 mm). The flat lid sits on the rim but does not seal completely. The small gap lets gas escape. A fully sealed saggar would burst from gas pressure. Commercial saggars in high-fire refractory clay are available from ceramic suppliers. The saggar must fit inside the kiln with at least 30 mm clearance on all sides.'],

  ['40-anagama-kiln-introduction.json', 'orderedList[5].listItem[2].paragraph[0]',
    'The anagama is a single-chamber kiln. The firebox, the chamber where work sits, and the flue are all one continuous space. Flames travel from the firebox, over the stacked work, and out through the flue. The direct flame contact and the ash from the wood fire deposit silica-calcium ash onto the ceramic surfaces. Where ash builds up and melts, it forms a natural glaze. No applied glaze is needed.'],

  ['40-anagama-kiln-introduction.json', 'orderedList[7].listItem[1].paragraph[0]',
    'The anagama is a single-chamber kiln. The firebox, the chamber where work sits, and the flue are all one continuous space. Flames travel from the firebox, over the stacked work, and out through the flue. The direct flame contact and the ash from the wood fire deposit silica-calcium ash onto the ceramic surfaces. Where ash builds up and melts, it forms a natural glaze. No applied glaze is needed.'],

  ['40-anagama-kiln-introduction.json', 'bulletList[11].listItem[3].paragraph[0]',
    'The anagama is a single-chamber kiln. The firebox, the chamber where work sits, and the flue are all one continuous space. Flames travel from the firebox, over the stacked work, and out through the flue. The direct flame contact and the ash from the wood fire deposit silica-calcium ash onto the ceramic surfaces. Where ash builds up and melts, it forms a natural glaze. No applied glaze is needed.'],

  ['40-mixing-a-cone-6-clear-liner-glaze.json', 'paragraph[0]',
    'A cone 6 clear liner glaze uses four or five raw materials. Weigh them by dry batch weight. Mix with water to form a slop. Sieve to remove clumps before use. The recipe is simple. The discipline is in accurate weighing and careful sieving. These two steps determine whether the final glaze is smooth or gritty.'],

  ['40-mixing-a-cone-6-clear-liner-glaze.json', 'paragraph[1]',
    'This is an advanced project. Raw glaze chemicals need careful handling. Weigh them accurately in grams. Check the specific gravity of the mixed glaze before firing. This confirms it is at the right consistency. A liner glaze mixed incorrectly can crawl, pinhole, or fail to mature. This ruins the work it was applied to.'],

  ['40-mixing-a-cone-6-clear-liner-glaze.json', 'paragraph[4]',
    'A correctly mixed liner glaze coats a bisque tile with an even, opaque white layer when dipped. After a cone 6 firing at 1220°C, the glaze should be smooth, clear, and glossy. There should be no pinholes, crawling, or bare patches. On buff stoneware, the clay colour shows through the glaze. On white stoneware or porcelain, the result is a near-clear finish.'],
]

// Navigate body.content using absolute index paths.
// Voice-check path notation: type[N] means content[N] where type is the node type.
// The index is absolute position within the immediate parent's content array.
function navigatePath(body, pathStr) {
  const parts = pathStr.split('.')
  let current = body.content  // start: body.content array

  for (let i = 0; i < parts.length; i++) {
    const m = parts[i].match(/^(\w+)\[(\d+)\]$/)
    if (!m) throw new Error(`Bad segment: ${parts[i]}`)
    const type = m[1], idx = parseInt(m[2])

    const arr = Array.isArray(current) ? current : (current.content || [])

    if (idx >= arr.length) throw new Error(`${type}[${idx}] not found (arr len ${arr.length})`)
    const node = arr[idx]
    if (node.type !== type) throw new Error(`Expected ${type} at [${idx}] but got ${node.type}`)
    current = node
  }
  return current
}

let totalFixed = 0
const skipped = []

for (const [file, path, newText] of PATCHES) {
  const filePath = join(briefDir, file)
  try {
    const json = JSON.parse(readFileSync(filePath, 'utf8'))
    const node = navigatePath(json.body, path)

    // Check if this is a simple single-text-node paragraph
    if (node.type === 'paragraph' && Array.isArray(node.content)) {
      const textOnlyNodes = node.content.filter(n => n.type === 'text' && !n.marks?.length)
      const markedNodes = node.content.filter(n => n.marks?.length > 0)

      if (markedNodes.length === 0) {
        // Simple: all nodes are plain text — replace entire content with one text node
        node.content = [{ type: 'text', text: newText }]
        writeFileSync(filePath, JSON.stringify(json, null, 2))
        totalFixed++
        process.stdout.write('.')
      } else {
        // Complex: has glossaryTooltip marks — skip, handle with agent
        skipped.push({ file, path, note: `has ${markedNodes.length} marked node(s)` })
      }
    } else if (node.type === 'listItem') {
      // The path ended at a listItem (shouldn't happen but handle gracefully)
      skipped.push({ file, path, note: 'landed on listItem not paragraph' })
    } else {
      skipped.push({ file, path, note: `unexpected node type: ${node.type}` })
    }
  } catch (e) {
    console.error(`\nERROR ${file} ${path}: ${e.message}`)
  }
}

console.log(`\n\nFixed: ${totalFixed} paragraphs`)
if (skipped.length > 0) {
  console.log(`\nSkipped (complex — need agent):`)
  skipped.forEach(s => console.log(`  ${s.file} | ${s.path} | ${s.note}`))
}
