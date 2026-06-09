import { writeFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

const black = { key: 'black', name: 'Black', hex: '#1a1a1a', dmcCode: '310', anchorCode: '403', symbol: 'x' }

function makeBorder(num, slug, title, subtitle, excerpt, difficulty, aliases, chartDef, bodyIntro, sizeNote) {
  const padded = String(num).padStart(3, '0')
  const entry = {
    slug, title, subtitle, excerpt,
    type: "PATTERN",
    categorySlug: "needlework",
    subCategorySlug: "blackwork",
    difficulty,
    sourceType: "PUBLIC_DOMAIN",
    sourceNotes: "Therese de Dillmont, Encyclopaedia of Needlework (1886), Project Gutenberg #20776. Weldon's Practical Needlework (1880s to 1900s), border designs.",
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
      { slug: "evenweave", term: "Evenweave", definition: "Fabric woven with the same number of threads per centimetre in both directions." }
    ],
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: bodyIntro + " Two strands of black stranded cotton on 28-count " },
            { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "evenweave" } }], text: "evenweave" },
            { type: "text", text: ". " + sizeNote }
          ]
        },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "What you need" }] },
        { type: "suppliesCard", attrs: { heading: "Materials", items: [
          { name: "28-count evenweave or linen", qty: "30 by 15 cm" },
          { name: "DMC 310 black stranded cotton", qty: "1 skein" },
          { name: "Tapestry needle size 26", qty: "1" },
          { name: "Embroidery hoop 10 cm", qty: "1" },
          { name: "Embroidery scissors", qty: "1" }
        ]}},
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Chart" }] },
        { type: "crossStitchChart", attrs: { definition: chartDef } },
        { type: "paragraph", content: [
          { type: "text", text: "The chart shows one repeat unit of the border. Repeat along the length of the border, working from the centre outward. Use " },
          { type: "text", marks: [{ type: "techniqueLink", attrs: { techniqueSlug: "holbein-stitch", label: "Holbein stitch" } }], text: "Holbein stitch" },
          { type: "text", text: " throughout. " },
          { type: "text", marks: [{ type: "techniqueLink", attrs: { techniqueSlug: "reading-a-counted-chart", label: "Reading a counted chart" } }], text: "Reading a counted chart" },
          { type: "text", text: " covers the navigation." }
        ]},
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Working the border" }] },
        { type: "orderedList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Mount the fabric in the hoop. Mark the centre of the border line on the cloth." }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Thread two strands of DMC 310. Start at the centre and work outward to one end, then return to centre and work the other half." }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work horizontal and vertical elements first using Holbein stitch, then add diagonal elements." }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "For corners, plan the corner unit before starting so the horizontal and vertical arms meet cleanly." }] }] }
        ]},
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Finishing" }] },
        { type: "paragraph", content: [{ type: "text", text: "Wash in cool water, press face-down on a thick towel, and frame or use as a border on a larger sampler or garment edge." }] }
      ]
    }
  }
  writeFileSync(join(dir, `${padded}-${slug}.json`), JSON.stringify(entry, null, 2))
  console.log(`Written: ${padded}-${slug}.json`)
}

// Border 1: simple line border (#24)
makeBorder(24, 'blackwork-simple-line-border', 'Simple line border',
  'A single running line with a stepped edge',
  'The simple line border runs a stepped-edge line across the cloth. Two parallel rows of running stitches, offset to create a raised visual weight. The most basic blackwork border, used as a divider between bands.',
  'BEGINNER', ['line border blackwork', 'running line blackwork'],
  { title: 'Simple line border', caption: '10 by 4 stitch section.', width: 10, height: 4, fabricCount: 28, finishedSizeText: 'Approx 9mm wide on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:1,y:3,paletteKey:'black'},{x:2,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'},{x:6,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},{x:8,y:3,paletteKey:'black'},{x:9,y:3,paletteKey:'black'}
  ]},
  'The simple line border runs two parallel stitched lines across the cloth, with a plain gap between them.',
  'The border is 4 stitches (approximately 4 mm) tall on 28-count evenweave.')

// Border 2: geometric border with corners (#25)
makeBorder(25, 'blackwork-geometric-border-corners', 'Geometric border with corners',
  'A mitered corner where the border arms meet cleanly',
  'A geometric border repeat with a mitred corner unit. The corner turns the horizontal and vertical arms of the border at 45 degrees so the two arms meet without gaps or overlaps. The corner unit must be stitched before the arms to position correctly.',
  'INTERMEDIATE', ['corner border blackwork', 'mitred corner blackwork'],
  { title: 'Geometric border with corners', caption: '12 by 12 stitch corner.', width: 12, height: 12, fabricCount: 28, finishedSizeText: 'Approx 11mm corner on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},{x:11,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:11,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:11,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:11,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:11,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},{x:11,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:5,y:6,paletteKey:'black'},{x:6,y:6,paletteKey:'black'},{x:7,y:6,paletteKey:'black'},{x:8,y:6,paletteKey:'black'},{x:9,y:6,paletteKey:'black'},{x:10,y:6,paletteKey:'black'},{x:11,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:11,y:7,paletteKey:'black'},
    {x:0,y:8,paletteKey:'black'},{x:11,y:8,paletteKey:'black'},
    {x:0,y:9,paletteKey:'black'},{x:11,y:9,paletteKey:'black'},
    {x:0,y:10,paletteKey:'black'},{x:11,y:10,paletteKey:'black'},
    {x:0,y:11,paletteKey:'black'},{x:1,y:11,paletteKey:'black'},{x:2,y:11,paletteKey:'black'},{x:3,y:11,paletteKey:'black'},{x:4,y:11,paletteKey:'black'},{x:5,y:11,paletteKey:'black'},{x:6,y:11,paletteKey:'black'},{x:7,y:11,paletteKey:'black'},{x:8,y:11,paletteKey:'black'},{x:9,y:11,paletteKey:'black'},{x:10,y:11,paletteKey:'black'},{x:11,y:11,paletteKey:'black'}
  ]},
  'The geometric border with corners charts both the straight-run repeat and the corner turn unit.',
  'Corner unit is 12 by 12 stitches (approximately 11 mm) on 28-count evenweave.')

// Border 3: diamond chain border (#26)
makeBorder(26, 'blackwork-diamond-chain-border', 'Diamond chain border',
  'Diamonds linked by short horizontal bars',
  'The diamond chain border connects a row of small diamonds with horizontal joining bars. Each diamond is four stitches across; the bar between diamonds is two stitches. A medium-density band that reads clearly at a viewing distance.',
  'BEGINNER', ['diamond chain blackwork', 'linked diamond border'],
  { title: 'Diamond chain border', caption: '12 by 6 stitch section.', width: 12, height: 6, fabricCount: 28, finishedSizeText: 'Approx 11mm wide, 5mm tall on 28-count', palette: [black], cells: [
    {x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},
    {x:1,y:1,paletteKey:'black'},{x:4,y:1,paletteKey:'black'},{x:7,y:1,paletteKey:'black'},{x:10,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:5,y:2,paletteKey:'black'},{x:6,y:2,paletteKey:'black'},{x:11,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'},{x:6,y:3,paletteKey:'black'},{x:11,y:3,paletteKey:'black'},
    {x:1,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},{x:10,y:4,paletteKey:'black'},
    {x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:8,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'}
  ]},
  'The diamond chain border links a row of diamonds with short horizontal bars at each vertex.',
  'Border is 6 stitches tall (approximately 5 mm) on 28-count evenweave.')

// Border 4: cross-and-square border (#27)
makeBorder(27, 'blackwork-cross-and-square-border', 'Cross-and-square border',
  'Crosses alternating with small squares along a band',
  'The cross-and-square border alternates a small cross motif with a small square motif in a regular band. The two shapes share the same height so the border runs in a clean, even strip.',
  'BEGINNER', ['cross square border blackwork', 'alternating border blackwork'],
  { title: 'Cross and square border', caption: '14 by 6 stitch section.', width: 14, height: 6, fabricCount: 28, finishedSizeText: 'Approx 13mm wide, 5mm tall on 28-count', palette: [black], cells: [
    {x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:3,y:1,paletteKey:'black'},{x:4,y:1,paletteKey:'black'},{x:7,y:1,paletteKey:'black'},{x:8,y:1,paletteKey:'black'},{x:11,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:1,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:3,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},{x:8,y:2,paletteKey:'black'},{x:9,y:2,paletteKey:'black'},{x:10,y:2,paletteKey:'black'},{x:11,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:1,y:3,paletteKey:'black'},{x:2,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},{x:8,y:3,paletteKey:'black'},{x:9,y:3,paletteKey:'black'},{x:10,y:3,paletteKey:'black'},{x:11,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},{x:8,y:4,paletteKey:'black'},{x:11,y:4,paletteKey:'black'},
    {x:1,y:5,paletteKey:'black'},{x:2,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},{x:6,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'},{x:10,y:5,paletteKey:'black'}
  ]},
  'The cross-and-square border alternates two small geometric motifs in a regular band.',
  'Border is 6 stitches tall (approximately 5 mm) on 28-count evenweave.')

// Border 5: zigzag border (#28)
makeBorder(28, 'blackwork-zigzag-border', 'Zigzag border',
  'A continuous diagonal zigzag line',
  'The zigzag border runs a single continuous line diagonally left and right across the cloth. No filling between the lines; the single thread creates the border. Extremely fast to work and reads clearly from a distance.',
  'BEGINNER', ['zigzag border blackwork', 'chevron border blackwork'],
  { title: 'Zigzag border', caption: '8 by 6 stitch section.', width: 8, height: 6, fabricCount: 28, finishedSizeText: 'Approx 7mm wide, 5mm tall on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},
    {x:1,y:1,paletteKey:'black'},
    {x:2,y:2,paletteKey:'black'},
    {x:3,y:3,paletteKey:'black'},
    {x:4,y:4,paletteKey:'black'},
    {x:5,y:5,paletteKey:'black'},
    {x:6,y:4,paletteKey:'black'},
    {x:7,y:3,paletteKey:'black'}
  ]},
  'The zigzag border uses a single continuous diagonal line turning at each peak.',
  'Border height is 6 stitches (approximately 5 mm) on 28-count evenweave.')

// Border 6: scalloped border (#29)
makeBorder(29, 'blackwork-scalloped-border', 'Scalloped border',
  'Curved arc outlines forming a repeating scallop edge',
  'The scalloped border uses stepped arc shapes to create a repeating curved edge. Each arc is nine stitches across and four stitches tall. The arcs share their base stitches, so the border is worked in one continuous path.',
  'INTERMEDIATE', ['scallop border blackwork', 'arch border blackwork'],
  { title: 'Scalloped border', caption: '10 by 5 stitch section.', width: 10, height: 5, fabricCount: 28, finishedSizeText: 'Approx 9mm wide, 4mm tall on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},
    {x:1,y:1,paletteKey:'black'},{x:8,y:1,paletteKey:'black'},
    {x:2,y:2,paletteKey:'black'},{x:3,y:2,paletteKey:'black'},{x:6,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},
    {x:4,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:1,y:4,paletteKey:'black'},{x:2,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:5,y:4,paletteKey:'black'},{x:6,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},{x:8,y:4,paletteKey:'black'},{x:9,y:4,paletteKey:'black'}
  ]},
  'The scalloped border uses stepped arcs to approximate curves on the counted grid.',
  'Each arc unit is 10 stitches wide (approximately 9 mm) on 28-count evenweave.')

// Border 7: knotted line border (#30)
makeBorder(30, 'blackwork-knotted-line-border', 'Knotted line border',
  'A single line with regular knot motifs',
  'The knotted line border runs a horizontal line with a small square knot motif placed at regular intervals. The knot motif breaks the line with a four-stitch square, giving a regular punctuation to an otherwise simple border.',
  'BEGINNER', ['knotted border blackwork', 'interrupted line border'],
  { title: 'Knotted line border', caption: '12 by 4 stitch section.', width: 12, height: 4, fabricCount: 28, finishedSizeText: 'Approx 11mm wide, 4mm tall on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},{x:11,y:0,paletteKey:'black'},
    {x:4,y:1,paletteKey:'black'},{x:7,y:1,paletteKey:'black'},
    {x:4,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:1,y:3,paletteKey:'black'},{x:2,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},{x:8,y:3,paletteKey:'black'},{x:9,y:3,paletteKey:'black'},{x:10,y:3,paletteKey:'black'},{x:11,y:3,paletteKey:'black'}
  ]},
  'The knotted line border places a small square motif at regular intervals along a double horizontal line.',
  'Border is 4 stitches tall (approximately 4 mm) on 28-count evenweave.')

// Border 8: double-line border (#31)
makeBorder(31, 'blackwork-double-line-border', 'Double-line border',
  'Two parallel lines running the length of the border',
  'The double-line border is the simplest of borders: two parallel lines of running stitch or Holbein stitch separated by a fixed gap. Used as a frame around a design, a division between sampler bands, or a starting point before adding a more complex interior band.',
  'BEGINNER', ['double line border blackwork', 'parallel line border'],
  { title: 'Double-line border', caption: '10 by 6 stitch section.', width: 10, height: 6, fabricCount: 28, finishedSizeText: 'Approx 9mm wide on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:1,y:5,paletteKey:'black'},{x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},{x:6,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},{x:8,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'}
  ]},
  'The double-line border runs two Holbein-stitch lines parallel to each other with a gap between.',
  'Border is 6 stitches tall (approximately 5 mm) on 28-count evenweave.')

// Border 9: blackwork edging (#32)
makeBorder(32, 'blackwork-edging', 'Blackwork edging',
  'A dense repeating pattern for cloth edges',
  'The blackwork edging is a six-stitch tall band worked along the edge of a cloth. It combines a stepped outer line with a fill pattern inside, giving a finished appearance to hem and collar edges. Traditional on garment edges where the embroidery terminates the cloth.',
  'INTERMEDIATE', ['blackwork edging', 'hem edging blackwork', 'border edging blackwork'],
  { title: 'Blackwork edging', caption: '8 by 6 stitch section.', width: 8, height: 6, fabricCount: 28, finishedSizeText: 'Approx 7mm wide, 5mm tall on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:7,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:5,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:2,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:1,y:5,paletteKey:'black'},{x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},{x:6,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'}
  ]},
  'The blackwork edging forms a dense rectangular band suitable for cloth and garment edges.',
  'Edging is 6 stitches tall (approximately 5 mm) on 28-count evenweave.')

// Border 10: narrow border (#33)
makeBorder(33, 'blackwork-narrow-border', 'Narrow border',
  'A three-stitch tall minimal border',
  'The narrow border is a single row of small square motifs spaced at even intervals. Only three stitches tall, it works well between areas of a sampler that need a light visual break without a full-height divider band.',
  'BEGINNER', ['narrow border blackwork', 'small border blackwork', 'minimal border blackwork'],
  { title: 'Narrow border', caption: '8 by 3 stitch section.', width: 8, height: 3, fabricCount: 28, finishedSizeText: 'Approx 7mm wide, 3mm tall on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:1,y:1,paletteKey:'black'},{x:4,y:1,paletteKey:'black'},{x:5,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:1,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},{x:5,y:2,paletteKey:'black'}
  ]},
  'The narrow border places a row of small square motifs at even intervals across the cloth.',
  'Border is only 3 stitches tall (approximately 3 mm) on 28-count evenweave.')

// Border 11: wide ceremonial border (#34)
makeBorder(34, 'blackwork-wide-ceremonial-border', 'Wide ceremonial border',
  'A twelve-stitch band combining outline, fill, and accent motifs',
  'The wide ceremonial border combines three elements: a double outer line, a fill-pattern interior, and accent diamond motifs placed at the mid-height. At twelve stitches tall it reads as a strong band that anchors the edge of a sampler or collar.',
  'ADVANCED', ['ceremonial border blackwork', 'wide band blackwork', 'complex border blackwork'],
  { title: 'Wide ceremonial border', caption: '16 by 12 stitch section.', width: 16, height: 12, fabricCount: 28, finishedSizeText: 'Approx 14mm wide, 11mm tall on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},{x:11,y:0,paletteKey:'black'},{x:12,y:0,paletteKey:'black'},{x:13,y:0,paletteKey:'black'},{x:14,y:0,paletteKey:'black'},{x:15,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:15,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},{x:6,y:2,paletteKey:'black'},{x:8,y:2,paletteKey:'black'},{x:10,y:2,paletteKey:'black'},{x:12,y:2,paletteKey:'black'},{x:15,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:15,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},{x:8,y:4,paletteKey:'black'},{x:15,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:6,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'},{x:15,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:6,y:6,paletteKey:'black'},{x:9,y:6,paletteKey:'black'},{x:15,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:7,y:7,paletteKey:'black'},{x:8,y:7,paletteKey:'black'},{x:15,y:7,paletteKey:'black'},
    {x:0,y:8,paletteKey:'black'},{x:15,y:8,paletteKey:'black'},
    {x:0,y:9,paletteKey:'black'},{x:2,y:9,paletteKey:'black'},{x:4,y:9,paletteKey:'black'},{x:6,y:9,paletteKey:'black'},{x:8,y:9,paletteKey:'black'},{x:10,y:9,paletteKey:'black'},{x:12,y:9,paletteKey:'black'},{x:15,y:9,paletteKey:'black'},
    {x:0,y:10,paletteKey:'black'},{x:15,y:10,paletteKey:'black'},
    {x:0,y:11,paletteKey:'black'},{x:1,y:11,paletteKey:'black'},{x:2,y:11,paletteKey:'black'},{x:3,y:11,paletteKey:'black'},{x:4,y:11,paletteKey:'black'},{x:5,y:11,paletteKey:'black'},{x:6,y:11,paletteKey:'black'},{x:7,y:11,paletteKey:'black'},{x:8,y:11,paletteKey:'black'},{x:9,y:11,paletteKey:'black'},{x:10,y:11,paletteKey:'black'},{x:11,y:11,paletteKey:'black'},{x:12,y:11,paletteKey:'black'},{x:13,y:11,paletteKey:'black'},{x:14,y:11,paletteKey:'black'},{x:15,y:11,paletteKey:'black'}
  ]},
  'The wide ceremonial border combines a double outer line, an interior fill, and accent diamond motifs in a twelve-stitch band.',
  'Border is 12 stitches tall (approximately 11 mm) on 28-count evenweave.')

// Border 12: alphabet-letter border (#35)
makeBorder(35, 'blackwork-alphabet-letter-border', 'Alphabet-letter border',
  'Individual block letters spaced across a border band',
  'The alphabet-letter border spaces individual block capital letters on a regular grid so they can be combined to spell a name, date, or word across the border. Letters are six stitches tall and four stitches wide, with a two-stitch gap between each one.',
  'INTERMEDIATE', ['alphabet blackwork border', 'lettering border blackwork', 'monogram blackwork'],
  { title: 'Alphabet border', caption: 'Letters A and B, 14 by 6 stitch section.', width: 14, height: 6, fabricCount: 28, finishedSizeText: 'Each letter 4 stitches wide (approx 4mm) on 28-count', palette: [black], cells: [
    {x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:3,y:1,paletteKey:'black'},{x:7,y:1,paletteKey:'black'},{x:11,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:1,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:3,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},{x:8,y:2,paletteKey:'black'},{x:9,y:2,paletteKey:'black'},{x:10,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},{x:11,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},{x:11,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},{x:8,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'},{x:10,y:5,paletteKey:'black'}
  ]},
  'The alphabet-letter border spaces block capital letters across a border band. Chart shows letters A and B; full alphabet follows the same six-stitch height.',
  'Each letter is 4 stitches wide (approximately 4 mm) on 28-count evenweave.')

console.log('All borders written.')
