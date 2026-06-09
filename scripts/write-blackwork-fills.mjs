import { writeFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

function makePattern(num, slug, title, subtitle, excerpt, difficulty, aliases, chartDef, bodyIntroText, finishedSizeNote) {
  const padded = String(num).padStart(3, '0')
  const entry = {
    slug,
    title,
    subtitle,
    excerpt,
    type: "PATTERN",
    categorySlug: "needlework",
    subCategorySlug: "blackwork",
    difficulty,
    sourceType: "PUBLIC_DOMAIN",
    sourceNotes: "Therese de Dillmont, Encyclopaedia of Needlework (1886), Project Gutenberg #20776. Weldon's Practical Needlework (1880s to 1900s).",
    recipeTools: [
      { slug: "tapestry-needle-26", isOptional: false },
      { slug: "embroidery-hoop-8", isOptional: false },
      { slug: "embroidery-scissors", isOptional: false }
    ],
    techniqueSlugs: ["reading-a-counted-chart", "holbein-stitch", "back-stitch", "mounting-fabric-in-hoop", "tying-off-cleanly"],
    criticalTechniques: ["reading-a-counted-chart", "holbein-stitch"],
    aliases,
    glossaryTerms: [
      { slug: "holbein-stitch", term: "Holbein stitch", definition: "Double-running stitch worked along a counted path so the thread looks identical on both sides of the fabric." },
      { slug: "evenweave", term: "Evenweave", definition: "Fabric woven with the same number of threads per centimetre in both directions." },
      { slug: "fill-pattern", term: "Fill pattern", definition: "A small repeating geometric unit worked inside an outline shape in blackwork." }
    ],
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: bodyIntroText + " Two strands of black stranded cotton on 28-count " },
            { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "evenweave" } }], text: "evenweave" },
            { type: "text", text: ". " + finishedSizeNote }
          ]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "What you need" }]
        },
        {
          type: "suppliesCard",
          attrs: {
            heading: "Materials",
            items: [
              { name: "28-count evenweave or linen", qty: "20 by 20 cm" },
              { name: "DMC 310 black stranded cotton", qty: "1 skein" },
              { name: "Tapestry needle size 26", qty: "1" },
              { name: "Embroidery hoop 10 cm", qty: "1" },
              { name: "Embroidery scissors", qty: "1" }
            ]
          }
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Chart" }]
        },
        {
          type: "crossStitchChart",
          attrs: { definition: chartDef }
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Each marked cell is one stitch. Repeat the tile in both directions. Use " },
            { type: "text", marks: [{ type: "techniqueLink", attrs: { techniqueSlug: "holbein-stitch", label: "Holbein stitch" } }], text: "Holbein stitch" },
            { type: "text", text: " for a reversible result. " },
            { type: "text", marks: [{ type: "techniqueLink", attrs: { techniqueSlug: "reading-a-counted-chart", label: "Reading a counted chart" } }], text: "Reading a counted chart" },
            { type: "text", text: " covers the navigation technique." }
          ]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Working method" }]
        },
        {
          type: "orderedList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Mount the fabric in the hoop and mark the centre." }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Thread two strands of DMC 310. Work all horizontal and vertical runs first using Holbein stitch." }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Complete diagonal elements last, again with the Holbein double-running two-pass method." }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Count-check at the end of each full repeat against the chart." }] }] }
          ]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Finishing" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Wash in cool water, press face-down on a thick towel, and frame or mount." }]
        }
      ]
    }
  }
  writeFileSync(join(dir, `${padded}-${slug}.json`), JSON.stringify(entry, null, 2))
  console.log(`Written: ${padded}-${slug}.json`)
}

const black = { key: 'black', name: 'Black', hex: '#1a1a1a', dmcCode: '310', anchorCode: '403', symbol: 'x' }

makePattern(10, 'blackwork-cross-fill', 'Blackwork cross fill', 'A simple cross shape repeated on a grid',
  'The cross fill places four stitches in a small plus sign, repeated on a regular grid. It gives medium density and reads as a neat dotted pattern from a distance.',
  'BEGINNER', ['cross fill blackwork', 'plus fill blackwork'],
  { title: 'Cross fill', caption: 'One cross tile.', width: 6, height: 6, fabricCount: 28, finishedSizeText: 'Approx 5mm per tile on 28-count', palette: [black], cells: [
    {x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:1,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:3,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},{x:5,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:1,y:3,paletteKey:'black'},{x:2,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'},
    {x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'}]},
  'The cross fill is a simple repeating unit of four arms radiating from a central point.',
  'Each 6-stitch tile measures approximately 5 mm on 28-count evenweave.')

makePattern(11, 'blackwork-square-knot-fill', 'Blackwork square knot fill', 'Interlocking squares on a counted grid',
  'The square knot fill creates the appearance of a knotted surface. Two overlapping square outlines repeat across the cloth.',
  'BEGINNER', ['square knot blackwork', 'interlocked square fill'],
  { title: 'Square knot fill', caption: 'One square knot tile.', width: 8, height: 8, fabricCount: 28, finishedSizeText: 'Approx 7mm per tile on 28-count', palette: [black], cells: [
    {x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:5,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:3,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},{x:5,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},
    {x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},
    {x:2,y:6,paletteKey:'black'},{x:7,y:6,paletteKey:'black'},
    {x:3,y:7,paletteKey:'black'},{x:4,y:7,paletteKey:'black'},{x:5,y:7,paletteKey:'black'},{x:6,y:7,paletteKey:'black'}]},
  'The square knot fill appears complex but repeats on a regular eight-stitch grid.',
  'Each 8-stitch tile measures approximately 7 mm on 28-count evenweave.')

makePattern(12, 'blackwork-geometric-square-fill', 'Geometric square fill', 'A nested square pattern with open centre',
  'The geometric square fill uses two concentric square outlines. The negative space inside reads as the main feature. A medium-density fill with a clean appearance.',
  'BEGINNER', ['nested square blackwork', 'concentric square fill'],
  { title: 'Geometric square fill', caption: 'One nested square tile.', width: 8, height: 8, fabricCount: 28, finishedSizeText: 'Approx 7mm per tile on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:7,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:3,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},{x:5,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:2,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:2,y:4,paletteKey:'black'},{x:5,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:7,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:1,y:7,paletteKey:'black'},{x:2,y:7,paletteKey:'black'},{x:3,y:7,paletteKey:'black'},{x:4,y:7,paletteKey:'black'},{x:5,y:7,paletteKey:'black'},{x:6,y:7,paletteKey:'black'},{x:7,y:7,paletteKey:'black'}]},
  'The geometric square fill places a large square around a smaller inner square.',
  'Each 8-stitch tile measures approximately 7 mm on 28-count evenweave.')

makePattern(13, 'blackwork-star-fill', 'Blackwork star fill', 'An eight-point star repeated across the cloth',
  'The star fill uses stitches radiating from a central point to make a small star. Stars tile at regular intervals with open ground between them. Low to medium density.',
  'BEGINNER', ['star fill blackwork', 'eight point star blackwork'],
  { title: 'Star fill', caption: 'One star tile.', width: 8, height: 8, fabricCount: 28, finishedSizeText: 'Approx 7mm per tile on 28-count', palette: [black], cells: [
    {x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},
    {x:1,y:1,paletteKey:'black'},{x:6,y:1,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},
    {x:1,y:6,paletteKey:'black'},{x:6,y:6,paletteKey:'black'},
    {x:3,y:7,paletteKey:'black'},{x:4,y:7,paletteKey:'black'}]},
  'The star fill is a low-density pattern with clear open ground between each repeat.',
  'Each 8-stitch tile measures approximately 7 mm on 28-count evenweave.')

makePattern(14, 'blackwork-lattice-fill', 'Blackwork lattice fill', 'Diagonal lines crossing to form a diamond grid',
  'The lattice fill crosses two diagonal lines at regular intervals to create a diamond grid. Medium density; suits large design areas needing a consistent background texture.',
  'BEGINNER', ['lattice blackwork', 'diagonal grid blackwork', 'trellis fill blackwork'],
  { title: 'Lattice fill', caption: 'One lattice tile.', width: 6, height: 6, fabricCount: 28, finishedSizeText: 'Approx 5mm per tile on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},
    {x:1,y:1,paletteKey:'black'},{x:4,y:1,paletteKey:'black'},
    {x:2,y:2,paletteKey:'black'},{x:3,y:2,paletteKey:'black'},
    {x:2,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},
    {x:1,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'}]},
  'The lattice fill uses two diagonal directions to create an open diamond grid.',
  'Each 6-stitch tile measures approximately 5 mm on 28-count evenweave.')

makePattern(15, 'blackwork-brick-fill', 'Blackwork brick fill', 'Offset horizontal rows like a brick wall',
  'The brick fill places horizontal stitches in rows offset by half a unit. Quick to work with a regular mid-density result.',
  'BEGINNER', ['brick fill blackwork', 'offset row blackwork'],
  { title: 'Brick fill', caption: 'One brick tile.', width: 6, height: 4, fabricCount: 28, finishedSizeText: 'Approx 5 by 4mm per tile on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},
    {x:3,y:1,paletteKey:'black'},{x:4,y:1,paletteKey:'black'},{x:5,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:1,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},
    {x:3,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'}]},
  'The brick fill is one of the fastest blackwork fills, using simple horizontal runs in offset rows.',
  'Each 6 by 4 tile measures approximately 5 by 4 mm on 28-count evenweave.')

makePattern(16, 'blackwork-herringbone-fill', 'Blackwork herringbone fill', 'Diagonal stitches alternating direction in each row',
  'The herringbone fill uses diagonal stitches that switch direction every row. Medium density, producing a classic V-shaped pattern.',
  'INTERMEDIATE', ['herringbone blackwork', 'chevron fill embroidery'],
  { title: 'Herringbone fill', caption: 'One herringbone tile.', width: 6, height: 4, fabricCount: 28, finishedSizeText: 'Approx 5 by 4mm per tile on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},
    {x:1,y:1,paletteKey:'black'},{x:3,y:1,paletteKey:'black'},{x:5,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},
    {x:1,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'}]},
  'The herringbone fill shifts direction at each row, creating the zigzag chevron typical of woven herringbone.',
  'Each tile measures approximately 5 by 4 mm on 28-count evenweave.')

makePattern(17, 'blackwork-scallop-fill', 'Blackwork scallop fill', 'Repeating arc outlines stitched on a counted grid',
  'The scallop fill creates a fan-and-arc pattern using stepped stitches. Arcs tile continuously. A light to medium density fill with an organic quality.',
  'INTERMEDIATE', ['scallop fill blackwork', 'arc fill embroidery'],
  { title: 'Scallop fill', caption: 'One scallop tile.', width: 8, height: 6, fabricCount: 28, finishedSizeText: 'Approx 7 by 5mm per tile on 28-count', palette: [black], cells: [
    {x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},
    {x:1,y:1,paletteKey:'black'},{x:2,y:1,paletteKey:'black'},{x:5,y:1,paletteKey:'black'},{x:6,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},
    {x:1,y:5,paletteKey:'black'},{x:2,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},{x:6,y:5,paletteKey:'black'}]},
  'The scallop fill uses stepped arcs to approximate curves on the straight grid.',
  'Each tile measures approximately 7 by 5 mm on 28-count evenweave.')

makePattern(18, 'blackwork-zigzag-fill', 'Blackwork zigzag fill', 'Diagonal stitches in a continuous zigzag line',
  'The zigzag fill runs diagonal stitches left and right in a continuous broken line. Rows tile vertically without a gap. Fast to work with a lively result.',
  'BEGINNER', ['zigzag blackwork', 'chevron fill blackwork'],
  { title: 'Zigzag fill', caption: 'One zigzag tile.', width: 4, height: 4, fabricCount: 28, finishedSizeText: 'Approx 4mm per tile on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:1,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},
    {x:3,y:0,paletteKey:'black'},{x:2,y:1,paletteKey:'black'},{x:1,y:2,paletteKey:'black'},{x:0,y:3,paletteKey:'black'}]},
  'The zigzag fill crosses two diagonal directions to create a repeating X-like pattern.',
  'Each 4-stitch tile measures approximately 4 mm on 28-count evenweave.')

makePattern(19, 'blackwork-woven-fill', 'Blackwork woven fill', 'Horizontal and vertical lines crossing at intervals',
  'The woven fill crosses horizontal and vertical stitches at regular intervals to suggest a woven surface. The grid reads as interlaced cloth rather than a plain grid.',
  'INTERMEDIATE', ['woven fill blackwork', 'interlaced blackwork'],
  { title: 'Woven fill', caption: 'One woven tile.', width: 6, height: 6, fabricCount: 28, finishedSizeText: 'Approx 5mm per tile on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:5,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:5,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:5,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:1,y:5,paletteKey:'black'},{x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'}]},
  'The woven fill creates a square frame that tiles to suggest a continuous weave.',
  'Each 6-stitch tile measures approximately 5 mm on 28-count evenweave.')

makePattern(20, 'blackwork-geometric-flower-fill', 'Geometric flower fill', 'A four-petal flower shape repeated on a grid',
  'The geometric flower fill places a simple four-petal flower at regular intervals. Low density; the clean ground around each repeat makes it light and airy.',
  'BEGINNER', ['flower fill blackwork', 'petal repeat blackwork'],
  { title: 'Geometric flower fill', caption: 'One flower tile.', width: 8, height: 8, fabricCount: 28, finishedSizeText: 'Approx 7mm per tile on 28-count', palette: [black], cells: [
    {x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},
    {x:2,y:1,paletteKey:'black'},{x:5,y:1,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:1,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},{x:6,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:1,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:6,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},
    {x:2,y:6,paletteKey:'black'},{x:5,y:6,paletteKey:'black'},
    {x:3,y:7,paletteKey:'black'},{x:4,y:7,paletteKey:'black'}]},
  'The geometric flower fill uses four petal clusters radiating from a central open space.',
  'Each 8-stitch tile measures approximately 7 mm on 28-count evenweave.')

makePattern(21, 'blackwork-hexagonal-fill', 'Blackwork hexagonal fill', 'Stepped hexagons tiling across the cloth',
  'The hexagonal fill traces stepped-edge hexagon outlines that fit together without gaps, like a honeycomb. Medium density.',
  'INTERMEDIATE', ['hexagon fill blackwork', 'honeycomb fill embroidery'],
  { title: 'Hexagonal fill', caption: 'One hexagon tile.', width: 8, height: 6, fabricCount: 28, finishedSizeText: 'Approx 7 by 5mm per tile on 28-count', palette: [black], cells: [
    {x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},
    {x:1,y:1,paletteKey:'black'},{x:6,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},
    {x:1,y:4,paletteKey:'black'},{x:6,y:4,paletteKey:'black'},
    {x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'}]},
  'The hexagonal fill uses a stepped-edge hexagon outline tiling continuously.',
  'Each tile measures approximately 7 by 5 mm on 28-count evenweave.')

makePattern(22, 'blackwork-twisted-lattice', 'Twisted lattice fill', 'A diagonal lattice with a twist at each crossing',
  'The twisted lattice fill crosses diagonal lines and adds an offset at each crossing to give the appearance of threads going over and under each other. Denser than a plain lattice.',
  'INTERMEDIATE', ['twisted lattice blackwork', 'interlaced lattice embroidery'],
  { title: 'Twisted lattice', caption: 'One twisted lattice tile.', width: 8, height: 8, fabricCount: 28, finishedSizeText: 'Approx 7mm per tile on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},
    {x:1,y:1,paletteKey:'black'},{x:6,y:1,paletteKey:'black'},
    {x:2,y:2,paletteKey:'black'},{x:3,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},{x:5,y:2,paletteKey:'black'},
    {x:3,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},
    {x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},
    {x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},
    {x:1,y:6,paletteKey:'black'},{x:6,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:7,y:7,paletteKey:'black'}]},
  'The twisted lattice adds a three-dimensional quality by thickening the crossing points of a diagonal grid.',
  'Each 8-stitch tile measures approximately 7 mm on 28-count evenweave.')

makePattern(23, 'blackwork-dotted-grid', 'Dotted grid fill', 'Single stitches at regular intervals on a plain grid',
  'The dotted grid places one stitch at every fourth thread intersection. Extremely low density; use it for areas that should barely read as filled.',
  'BEGINNER', ['dotted grid blackwork', 'sparse fill blackwork', 'open ground blackwork'],
  { title: 'Dotted grid', caption: 'One dotted grid tile.', width: 4, height: 4, fabricCount: 28, finishedSizeText: 'Approx 4mm per tile on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},
    {x:2,y:2,paletteKey:'black'}]},
  'The dotted grid is the simplest and lightest blackwork fill, for nearly-unworked areas in a shaded design.',
  'Each 4-stitch tile measures approximately 4 mm on 28-count evenweave.')

console.log('Done.')
