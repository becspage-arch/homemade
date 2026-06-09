import { writeFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

const black = { key: 'black', name: 'Black', hex: '#1a1a1a', dmcCode: '310', anchorCode: '403', symbol: 'x' }

function makeAllOver(num, slug, title, subtitle, excerpt, difficulty, aliases, chartDef, bodyIntro, sizeNote) {
  const padded = String(num).padStart(3, '0')
  const entry = {
    slug, title, subtitle, excerpt,
    type: "PATTERN",
    categorySlug: "needlework",
    subCategorySlug: "blackwork",
    difficulty,
    sourceType: "PUBLIC_DOMAIN",
    sourceNotes: "Therese de Dillmont, Encyclopaedia of Needlework (1886), Project Gutenberg #20776. Weldon's Practical Needlework (1880s to 1900s). Caulfeild and Saward, Dictionary of Needlework (1882).",
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
      { slug: "all-over-pattern", term: "All-over pattern", definition: "A blackwork fill design that covers the entire surface of a piece, rather than being confined to a panel or band." }
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
          { name: "28-count evenweave or linen", qty: "25 by 25 cm minimum" },
          { name: "DMC 310 black stranded cotton", qty: "2 skeins" },
          { name: "Tapestry needle size 26", qty: "1" },
          { name: "Embroidery hoop 15 cm", qty: "1" },
          { name: "Embroidery scissors", qty: "1" }
        ]}},
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Chart" }] },
        { type: "crossStitchChart", attrs: { definition: chartDef } },
        { type: "paragraph", content: [
          { type: "text", text: "The chart shows one " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "all-over-pattern" } }], text: "all-over pattern" },
          { type: "text", text: " repeat tile. Work from the centre of the fabric outward, extending the repeat to fill the desired area. Use " },
          { type: "text", marks: [{ type: "techniqueLink", attrs: { techniqueSlug: "holbein-stitch", label: "Holbein stitch" } }], text: "Holbein stitch" },
          { type: "text", text: " throughout. Check the count against the chart after every third repeat." }
        ]},
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Working method" }] },
        { type: "orderedList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Mount the fabric in the hoop. Mark the centre with a loose thread." }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Start at the centre and work horizontal runs of the first tile using Holbein stitch." }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Complete the Holbein return pass before moving to the next row of tiles." }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work diagonal and vertical elements after the horizontal runs are complete." }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Move the hoop as needed to keep the working area centred. Always re-centre the fabric in the hoop after moving." }] }] }
        ]},
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Finishing" }] },
        { type: "paragraph", content: [{ type: "text", text: "Wash in cool water, press face-down on a thick towel, and frame or mount. Finished size depends on how many repeats you work; the chart tile gives the unit size." }] }
      ]
    }
  }
  writeFileSync(join(dir, `${padded}-${slug}.json`), JSON.stringify(entry, null, 2))
  console.log(`Written: ${padded}-${slug}.json`)
}

// All-over 1: renaissance style (#36)
makeAllOver(36, 'blackwork-renaissance-style-all-over', 'Renaissance-style all-over',
  'A flowing ogival grid inspired by sixteenth-century embroidery',
  'The Renaissance-style all-over uses a large ogival (pointed oval) grid to contain a small flower or leaf fill at each intersection. The grid repeats on a 16 by 16 tile. Dense, elaborate, and traditionally worked across silk garments in Tudor England.',
  'ADVANCED', ['renaissance blackwork', 'ogival grid blackwork', 'Tudor all-over blackwork'],
  { title: 'Renaissance-style all-over', caption: '16 by 16 stitch tile.', width: 16, height: 16, fabricCount: 28, finishedSizeText: 'Each 16-stitch tile approx 14mm on 28-count', palette: [black], cells: [
    {x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},
    {x:5,y:1,paletteKey:'black'},{x:10,y:1,paletteKey:'black'},
    {x:3,y:2,paletteKey:'black'},{x:12,y:2,paletteKey:'black'},
    {x:1,y:3,paletteKey:'black'},{x:14,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:15,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},{x:8,y:5,paletteKey:'black'},{x:15,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:6,y:6,paletteKey:'black'},{x:9,y:6,paletteKey:'black'},{x:15,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:6,y:7,paletteKey:'black'},{x:9,y:7,paletteKey:'black'},{x:15,y:7,paletteKey:'black'},
    {x:0,y:8,paletteKey:'black'},{x:6,y:8,paletteKey:'black'},{x:9,y:8,paletteKey:'black'},{x:15,y:8,paletteKey:'black'},
    {x:0,y:9,paletteKey:'black'},{x:7,y:9,paletteKey:'black'},{x:8,y:9,paletteKey:'black'},{x:15,y:9,paletteKey:'black'},
    {x:0,y:10,paletteKey:'black'},{x:15,y:10,paletteKey:'black'},
    {x:1,y:11,paletteKey:'black'},{x:14,y:11,paletteKey:'black'},
    {x:3,y:12,paletteKey:'black'},{x:12,y:12,paletteKey:'black'},
    {x:5,y:13,paletteKey:'black'},{x:10,y:13,paletteKey:'black'},
    {x:7,y:14,paletteKey:'black'},{x:8,y:14,paletteKey:'black'},
    {x:7,y:15,paletteKey:'black'},{x:8,y:15,paletteKey:'black'}
  ]},
  'The Renaissance-style all-over uses a large ogival grid containing a flower motif at each intersection.',
  'Each 16-stitch tile measures approximately 14 mm on 28-count evenweave.')

// All-over 2: Tudor diamond (#37)
makeAllOver(37, 'blackwork-tudor-diamond-pattern', 'Tudor diamond pattern',
  'Large diamonds containing a fill motif',
  'The Tudor diamond pattern uses a large diamond outline containing a small geometric fill. The diamond repeat is 14 by 14 stitches. A medium-density all-over with a formal, structured appearance associated with sixteenth-century English embroidery.',
  'INTERMEDIATE', ['Tudor diamond blackwork', 'diamond all-over blackwork'],
  { title: 'Tudor diamond', caption: '14 by 14 stitch tile.', width: 14, height: 14, fabricCount: 28, finishedSizeText: 'Each tile approx 13mm on 28-count', palette: [black], cells: [
    {x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},
    {x:5,y:1,paletteKey:'black'},{x:8,y:1,paletteKey:'black'},
    {x:4,y:2,paletteKey:'black'},{x:9,y:2,paletteKey:'black'},
    {x:3,y:3,paletteKey:'black'},{x:10,y:3,paletteKey:'black'},
    {x:2,y:4,paletteKey:'black'},{x:11,y:4,paletteKey:'black'},
    {x:1,y:5,paletteKey:'black'},{x:12,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:5,y:6,paletteKey:'black'},{x:6,y:6,paletteKey:'black'},{x:7,y:6,paletteKey:'black'},{x:8,y:6,paletteKey:'black'},{x:13,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:13,y:7,paletteKey:'black'},
    {x:1,y:8,paletteKey:'black'},{x:12,y:8,paletteKey:'black'},
    {x:2,y:9,paletteKey:'black'},{x:11,y:9,paletteKey:'black'},
    {x:3,y:10,paletteKey:'black'},{x:10,y:10,paletteKey:'black'},
    {x:4,y:11,paletteKey:'black'},{x:9,y:11,paletteKey:'black'},
    {x:5,y:12,paletteKey:'black'},{x:8,y:12,paletteKey:'black'},
    {x:6,y:13,paletteKey:'black'},{x:7,y:13,paletteKey:'black'}
  ]},
  'The Tudor diamond pattern outlines large diamonds that tile across the cloth, each containing a simple fill motif.',
  'Each 14-stitch tile measures approximately 13 mm on 28-count evenweave.')

// All-over 3: Elizabethan band sampler (#38)
makeAllOver(38, 'blackwork-elizabethan-band', 'Elizabethan band sampler',
  'Horizontal bands of different fill patterns stacked vertically',
  'The Elizabethan band sampler stacks several horizontal fill bands of different widths and patterns. Each band is a complete design unit; the sampler records the patterns worked. Traditional Elizabethan samplers preserved patterns this way. This version uses three bands: dense, medium, and open.',
  'INTERMEDIATE', ['Elizabethan sampler blackwork', 'band sampler blackwork', 'horizontal band blackwork'],
  { title: 'Elizabethan band sampler', caption: '20 by 20 stitch three-band section.', width: 20, height: 20, fabricCount: 28, finishedSizeText: 'Each 20-stitch section approx 18mm on 28-count', palette: [black], cells: [
    // Band 1 top row (dense) rows 0-5
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},{x:11,y:0,paletteKey:'black'},{x:12,y:0,paletteKey:'black'},{x:13,y:0,paletteKey:'black'},{x:14,y:0,paletteKey:'black'},{x:15,y:0,paletteKey:'black'},{x:16,y:0,paletteKey:'black'},{x:17,y:0,paletteKey:'black'},{x:18,y:0,paletteKey:'black'},{x:19,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:2,y:1,paletteKey:'black'},{x:4,y:1,paletteKey:'black'},{x:6,y:1,paletteKey:'black'},{x:8,y:1,paletteKey:'black'},{x:10,y:1,paletteKey:'black'},{x:12,y:1,paletteKey:'black'},{x:14,y:1,paletteKey:'black'},{x:16,y:1,paletteKey:'black'},{x:18,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:19,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:2,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},{x:6,y:3,paletteKey:'black'},{x:8,y:3,paletteKey:'black'},{x:10,y:3,paletteKey:'black'},{x:12,y:3,paletteKey:'black'},{x:14,y:3,paletteKey:'black'},{x:16,y:3,paletteKey:'black'},{x:18,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:1,y:4,paletteKey:'black'},{x:2,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:5,y:4,paletteKey:'black'},{x:6,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},{x:8,y:4,paletteKey:'black'},{x:9,y:4,paletteKey:'black'},{x:10,y:4,paletteKey:'black'},{x:11,y:4,paletteKey:'black'},{x:12,y:4,paletteKey:'black'},{x:13,y:4,paletteKey:'black'},{x:14,y:4,paletteKey:'black'},{x:15,y:4,paletteKey:'black'},{x:16,y:4,paletteKey:'black'},{x:17,y:4,paletteKey:'black'},{x:18,y:4,paletteKey:'black'},{x:19,y:4,paletteKey:'black'},
    // Divider row 5
    {x:0,y:5,paletteKey:'black'},{x:19,y:5,paletteKey:'black'},
    // Band 2 middle (open) rows 6-13
    {x:0,y:6,paletteKey:'black'},{x:9,y:6,paletteKey:'black'},{x:10,y:6,paletteKey:'black'},{x:19,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:8,y:7,paletteKey:'black'},{x:11,y:7,paletteKey:'black'},{x:19,y:7,paletteKey:'black'},
    {x:0,y:8,paletteKey:'black'},{x:19,y:8,paletteKey:'black'},
    {x:0,y:9,paletteKey:'black'},{x:19,y:9,paletteKey:'black'},
    {x:0,y:10,paletteKey:'black'},{x:19,y:10,paletteKey:'black'},
    {x:0,y:11,paletteKey:'black'},{x:8,y:11,paletteKey:'black'},{x:11,y:11,paletteKey:'black'},{x:19,y:11,paletteKey:'black'},
    {x:0,y:12,paletteKey:'black'},{x:9,y:12,paletteKey:'black'},{x:10,y:12,paletteKey:'black'},{x:19,y:12,paletteKey:'black'},
    {x:0,y:13,paletteKey:'black'},{x:19,y:13,paletteKey:'black'},
    // Divider row 14
    {x:0,y:14,paletteKey:'black'},{x:19,y:14,paletteKey:'black'},
    // Band 3 bottom (zigzag) rows 15-19
    {x:0,y:15,paletteKey:'black'},{x:1,y:16,paletteKey:'black'},{x:2,y:17,paletteKey:'black'},{x:3,y:18,paletteKey:'black'},{x:4,y:19,paletteKey:'black'},
    {x:5,y:18,paletteKey:'black'},{x:6,y:17,paletteKey:'black'},{x:7,y:16,paletteKey:'black'},{x:8,y:15,paletteKey:'black'},
    {x:9,y:16,paletteKey:'black'},{x:10,y:17,paletteKey:'black'},{x:11,y:18,paletteKey:'black'},{x:12,y:19,paletteKey:'black'},
    {x:13,y:18,paletteKey:'black'},{x:14,y:17,paletteKey:'black'},{x:15,y:16,paletteKey:'black'},{x:16,y:15,paletteKey:'black'},
    {x:17,y:16,paletteKey:'black'},{x:18,y:17,paletteKey:'black'},{x:19,y:18,paletteKey:'black'}
  ]},
  'The Elizabethan band sampler stacks three horizontal fill bands: dense, open, and zigzag.',
  'Each 20-stitch section measures approximately 18 mm on 28-count evenweave.')

// All-over 4: Geometric Persian-inspired (#39)
makeAllOver(39, 'blackwork-geometric-persian-inspired', 'Geometric Persian-inspired all-over',
  'Interlocking star and hexagon shapes on an even grid',
  'The geometric Persian-inspired all-over draws on the counted geometric tradition shared between Iberian and Moorish embroidery that reached England. Interlocking six-pointed stars and hexagons tile without gaps. Dense; requires accurate counting at every row.',
  'ADVANCED', ['Persian inspired blackwork', 'star hexagon blackwork', 'geometric all-over blackwork'],
  { title: 'Persian-inspired all-over', caption: '12 by 12 stitch tile.', width: 12, height: 12, fabricCount: 28, finishedSizeText: 'Each tile approx 11mm on 28-count', palette: [black], cells: [
    {x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},
    {x:3,y:1,paletteKey:'black'},{x:8,y:1,paletteKey:'black'},
    {x:2,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},{x:9,y:2,paletteKey:'black'},
    {x:1,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:8,y:3,paletteKey:'black'},{x:10,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:2,y:4,paletteKey:'black'},{x:9,y:4,paletteKey:'black'},{x:11,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:1,y:5,paletteKey:'black'},{x:10,y:5,paletteKey:'black'},{x:11,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:1,y:6,paletteKey:'black'},{x:10,y:6,paletteKey:'black'},{x:11,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:2,y:7,paletteKey:'black'},{x:9,y:7,paletteKey:'black'},{x:11,y:7,paletteKey:'black'},
    {x:1,y:8,paletteKey:'black'},{x:3,y:8,paletteKey:'black'},{x:8,y:8,paletteKey:'black'},{x:10,y:8,paletteKey:'black'},
    {x:2,y:9,paletteKey:'black'},{x:4,y:9,paletteKey:'black'},{x:7,y:9,paletteKey:'black'},{x:9,y:9,paletteKey:'black'},
    {x:3,y:10,paletteKey:'black'},{x:8,y:10,paletteKey:'black'},
    {x:4,y:11,paletteKey:'black'},{x:5,y:11,paletteKey:'black'},{x:6,y:11,paletteKey:'black'},{x:7,y:11,paletteKey:'black'}
  ]},
  'The Persian-inspired all-over tiles interlocking stars and hexagons on a counted grid.',
  'Each 12-stitch tile measures approximately 11 mm on 28-count evenweave.')

// All-over 5: Moorish tile (#40)
makeAllOver(40, 'blackwork-moorish-tile-inspired', 'Moorish-tile inspired all-over',
  'Eight-pointed stars set in a square grid with geometric fills',
  'The Moorish-tile inspired all-over uses eight-pointed stars set in square frames, tiling continuously across the cloth. The star points connect to the frame at eight positions. Medium to high density.',
  'ADVANCED', ['Moorish tile blackwork', 'eight point star all-over', 'Islamic geometry blackwork'],
  { title: 'Moorish-tile inspired', caption: '10 by 10 stitch tile.', width: 10, height: 10, fabricCount: 28, finishedSizeText: 'Each tile approx 9mm on 28-count', palette: [black], cells: [
    {x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},
    {x:2,y:1,paletteKey:'black'},{x:7,y:1,paletteKey:'black'},
    {x:1,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},{x:5,y:2,paletteKey:'black'},{x:8,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:6,y:3,paletteKey:'black'},{x:9,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:2,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},{x:9,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:2,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:3,y:6,paletteKey:'black'},{x:6,y:6,paletteKey:'black'},{x:9,y:6,paletteKey:'black'},
    {x:1,y:7,paletteKey:'black'},{x:4,y:7,paletteKey:'black'},{x:5,y:7,paletteKey:'black'},{x:8,y:7,paletteKey:'black'},
    {x:2,y:8,paletteKey:'black'},{x:7,y:8,paletteKey:'black'},
    {x:3,y:9,paletteKey:'black'},{x:4,y:9,paletteKey:'black'},{x:5,y:9,paletteKey:'black'},{x:6,y:9,paletteKey:'black'}
  ]},
  'The Moorish-tile inspired all-over places eight-pointed stars in square frames tiling continuously.',
  'Each 10-stitch tile measures approximately 9 mm on 28-count evenweave.')

// All-over 6: Celtic knot variant (#41)
makeAllOver(41, 'blackwork-celtic-knot-variant', 'Celtic knot variant',
  'Interlaced strap lines on a counted grid',
  'The Celtic knot variant traces two interlaced strap lines across the cloth. The over-under alternation is suggested by a two-stitch gap at each crossing point. The pattern tiles on a 10 by 10 repeat and works best at 25-count or coarser so the crossing gaps are visible.',
  'ADVANCED', ['Celtic knot blackwork', 'interlaced strap blackwork', 'knotwork blackwork'],
  { title: 'Celtic knot variant', caption: '10 by 10 stitch tile.', width: 10, height: 10, fabricCount: 28, finishedSizeText: 'Each tile approx 9mm on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},
    {x:2,y:1,paletteKey:'black'},{x:7,y:1,paletteKey:'black'},
    {x:3,y:2,paletteKey:'black'},{x:6,y:2,paletteKey:'black'},
    {x:4,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:9,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'},
    {x:4,y:6,paletteKey:'black'},{x:5,y:6,paletteKey:'black'},
    {x:3,y:7,paletteKey:'black'},{x:6,y:7,paletteKey:'black'},
    {x:2,y:8,paletteKey:'black'},{x:7,y:8,paletteKey:'black'},
    {x:0,y:9,paletteKey:'black'},{x:1,y:9,paletteKey:'black'},{x:8,y:9,paletteKey:'black'},{x:9,y:9,paletteKey:'black'}
  ]},
  'The Celtic knot variant traces two interlaced strap lines with two-stitch gaps at each crossing.',
  'Each 10-stitch tile measures approximately 9 mm on 28-count evenweave.')

// All-over 7: Art Deco grid (#42)
makeAllOver(42, 'blackwork-art-deco-grid', 'Art Deco grid',
  'A strong geometric grid with bold square accents',
  'The Art Deco grid uses a clean square grid with bold filled corner squares, giving a strong geometric result. The grid lines are two stitches apart; the corner squares are two by two stitches. Crisp and modern-looking despite using traditional counted techniques.',
  'INTERMEDIATE', ['Art Deco blackwork', 'bold grid blackwork', 'geometric grid blackwork'],
  { title: 'Art Deco grid', caption: '8 by 8 stitch tile.', width: 8, height: 8, fabricCount: 28, finishedSizeText: 'Each tile approx 7mm on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:7,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:7,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:1,y:7,paletteKey:'black'},{x:7,y:7,paletteKey:'black'}
  ]},
  'The Art Deco grid uses clean square outlines with filled corner squares on a regular grid.',
  'Each 8-stitch tile measures approximately 7 mm on 28-count evenweave.')

// All-over 8: Modern geometric (#43)
makeAllOver(43, 'blackwork-modern-geometric', 'Modern geometric all-over',
  'Bold angular shapes on a strict grid',
  'The modern geometric all-over uses right-angle shapes — L-shapes and T-shapes — arranged in a regular pattern. The negative space forms the counterpart to the stitched forms, giving a strong positive-negative contrast. Medium density.',
  'INTERMEDIATE', ['modern geometric blackwork', 'angular blackwork', 'contemporary blackwork'],
  { title: 'Modern geometric', caption: '8 by 8 stitch tile.', width: 8, height: 8, fabricCount: 28, finishedSizeText: 'Each tile approx 7mm on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:1,y:3,paletteKey:'black'},{x:2,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},{x:5,y:3,paletteKey:'black'},{x:6,y:3,paletteKey:'black'},{x:7,y:3,paletteKey:'black'},
    {x:7,y:4,paletteKey:'black'},
    {x:7,y:5,paletteKey:'black'},
    {x:4,y:6,paletteKey:'black'},{x:5,y:6,paletteKey:'black'},{x:6,y:6,paletteKey:'black'},{x:7,y:6,paletteKey:'black'},
    {x:4,y:7,paletteKey:'black'}
  ]},
  'The modern geometric all-over uses right-angle L and T shapes on a regular grid.',
  'Each 8-stitch tile measures approximately 7 mm on 28-count evenweave.')

// All-over 9: simple repeat for beginner sampler (#44)
makeAllOver(44, 'blackwork-simple-repeat-beginner', 'Simple repeat for a beginner sampler',
  'A four-stitch repeat suitable for a first all-over piece',
  'The simple repeat is a four-stitch square outline, the smallest all-over unit. It tiles directly without a gap. The result is a regular grid of empty squares outlined in black. A good first all-over piece: the repeat is small enough to lose your place, but easy enough to re-find it.',
  'BEGINNER', ['simple repeat blackwork', 'square outline repeat blackwork', 'beginner all-over blackwork'],
  { title: 'Simple repeat', caption: '8 by 8 stitch section.', width: 8, height: 8, fabricCount: 28, finishedSizeText: 'Each 4-stitch tile approx 4mm on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:4,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:1,y:4,paletteKey:'black'},{x:2,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:5,y:4,paletteKey:'black'},{x:6,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:4,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:4,y:7,paletteKey:'black'}
  ]},
  'The simple repeat is a four-stitch square outline tiling directly to cover the cloth.',
  'Each 4-stitch tile measures approximately 4 mm on 28-count evenweave.')

// All-over 10: Carolingian repeats (#45)
makeAllOver(45, 'blackwork-carolingian-repeats', 'Carolingian repeats',
  'Interlocking angular knot shapes derived from manuscript borders',
  'The Carolingian repeat uses angular interlaced shapes drawn from the tradition of manuscript border decoration. The pattern tiles on a 10 by 10 unit with a diagonal offset between rows, giving a subtle half-drop effect across the cloth.',
  'ADVANCED', ['Carolingian blackwork', 'manuscript border blackwork', 'interlaced angular blackwork'],
  { title: 'Carolingian repeats', caption: '10 by 10 stitch tile.', width: 10, height: 10, fabricCount: 28, finishedSizeText: 'Each tile approx 9mm on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:3,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:4,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:4,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:5,y:4,paletteKey:'black'},{x:6,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},{x:8,y:4,paletteKey:'black'},{x:9,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:9,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:9,y:7,paletteKey:'black'},
    {x:0,y:8,paletteKey:'black'},{x:6,y:8,paletteKey:'black'},{x:9,y:8,paletteKey:'black'},
    {x:7,y:9,paletteKey:'black'},{x:8,y:9,paletteKey:'black'},{x:9,y:9,paletteKey:'black'}
  ]},
  'The Carolingian repeat tiles interlaced angular shapes derived from manuscript border decoration.',
  'Each 10-stitch tile measures approximately 9 mm on 28-count evenweave.')

console.log('All all-over patterns and sampler starters written.')
