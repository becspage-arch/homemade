import { writeFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

const black = { key: 'black', name: 'Black', hex: '#1a1a1a', dmcCode: '310', anchorCode: '403', symbol: 'x' }

function makeSampler(num, slug, title, subtitle, excerpt, difficulty, aliases, chartDef, bodyContent) {
  const padded = String(num).padStart(3, '0')
  const entry = {
    slug, title, subtitle, excerpt,
    type: "PATTERN",
    categorySlug: "needlework",
    subCategorySlug: "blackwork",
    difficulty,
    sourceType: "PUBLIC_DOMAIN",
    sourceNotes: "Therese de Dillmont, Encyclopaedia of Needlework (1886), Project Gutenberg #20776. Weldon's Practical Needlework (1880s to 1900s), sampler chapters. Mrs Beeton, Book of Needlework (1870), Project Gutenberg #16746.",
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
      { slug: "sampler", term: "Sampler", definition: "A piece of embroidery worked to record and practice multiple patterns or stitches, traditionally used to preserve design knowledge." }
    ],
    body: bodyContent
  }
  writeFileSync(join(dir, `${padded}-${slug}.json`), JSON.stringify(entry, null, 2))
  console.log(`Written: ${padded}-${slug}.json`)
}

// Sampler 1: Small starter sampler (#46)
makeSampler(46, 'blackwork-small-starter-sampler', 'Small starter sampler',
  'Six fills in six panels on a 10 by 10 cm piece',
  'The small starter sampler places six different fill patterns in six equal panels, separated by narrow border lines. All six fills use Holbein stitch on 28-count evenweave. Finished size: approximately 10 by 10 cm. A good first sampler project.',
  'BEGINNER', ['starter sampler blackwork', 'beginner sampler blackwork', 'six fill sampler'],
  { title: 'Small starter sampler', caption: '60 by 60 stitch design on 28-count evenweave.', width: 20, height: 20, fabricCount: 28, finishedSizeText: 'Full sampler approx 10 by 10 cm on 28-count', palette: [black], cells: [
    // Outer border top
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},{x:11,y:0,paletteKey:'black'},{x:12,y:0,paletteKey:'black'},{x:13,y:0,paletteKey:'black'},{x:14,y:0,paletteKey:'black'},{x:15,y:0,paletteKey:'black'},{x:16,y:0,paletteKey:'black'},{x:17,y:0,paletteKey:'black'},{x:18,y:0,paletteKey:'black'},{x:19,y:0,paletteKey:'black'},
    // Side borders
    {x:0,y:1,paletteKey:'black'},{x:19,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:19,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:19,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:19,y:4,paletteKey:'black'},
    // Divider row 5
    {x:0,y:5,paletteKey:'black'},{x:1,y:5,paletteKey:'black'},{x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},{x:6,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},{x:8,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'},{x:10,y:5,paletteKey:'black'},{x:11,y:5,paletteKey:'black'},{x:12,y:5,paletteKey:'black'},{x:13,y:5,paletteKey:'black'},{x:14,y:5,paletteKey:'black'},{x:15,y:5,paletteKey:'black'},{x:16,y:5,paletteKey:'black'},{x:17,y:5,paletteKey:'black'},{x:18,y:5,paletteKey:'black'},{x:19,y:5,paletteKey:'black'},
    {x:0,y:6,paletteKey:'black'},{x:19,y:6,paletteKey:'black'},
    {x:0,y:7,paletteKey:'black'},{x:19,y:7,paletteKey:'black'},
    {x:0,y:8,paletteKey:'black'},{x:19,y:8,paletteKey:'black'},
    {x:0,y:9,paletteKey:'black'},{x:19,y:9,paletteKey:'black'},
    // Divider row 10
    {x:0,y:10,paletteKey:'black'},{x:1,y:10,paletteKey:'black'},{x:2,y:10,paletteKey:'black'},{x:3,y:10,paletteKey:'black'},{x:4,y:10,paletteKey:'black'},{x:5,y:10,paletteKey:'black'},{x:6,y:10,paletteKey:'black'},{x:7,y:10,paletteKey:'black'},{x:8,y:10,paletteKey:'black'},{x:9,y:10,paletteKey:'black'},{x:10,y:10,paletteKey:'black'},{x:11,y:10,paletteKey:'black'},{x:12,y:10,paletteKey:'black'},{x:13,y:10,paletteKey:'black'},{x:14,y:10,paletteKey:'black'},{x:15,y:10,paletteKey:'black'},{x:16,y:10,paletteKey:'black'},{x:17,y:10,paletteKey:'black'},{x:18,y:10,paletteKey:'black'},{x:19,y:10,paletteKey:'black'},
    {x:0,y:11,paletteKey:'black'},{x:19,y:11,paletteKey:'black'},
    {x:0,y:12,paletteKey:'black'},{x:19,y:12,paletteKey:'black'},
    {x:0,y:13,paletteKey:'black'},{x:19,y:13,paletteKey:'black'},
    {x:0,y:14,paletteKey:'black'},{x:19,y:14,paletteKey:'black'},
    // Bottom border
    {x:0,y:15,paletteKey:'black'},{x:1,y:15,paletteKey:'black'},{x:2,y:15,paletteKey:'black'},{x:3,y:15,paletteKey:'black'},{x:4,y:15,paletteKey:'black'},{x:5,y:15,paletteKey:'black'},{x:6,y:15,paletteKey:'black'},{x:7,y:15,paletteKey:'black'},{x:8,y:15,paletteKey:'black'},{x:9,y:15,paletteKey:'black'},{x:10,y:15,paletteKey:'black'},{x:11,y:15,paletteKey:'black'},{x:12,y:15,paletteKey:'black'},{x:13,y:15,paletteKey:'black'},{x:14,y:15,paletteKey:'black'},{x:15,y:15,paletteKey:'black'},{x:16,y:15,paletteKey:'black'},{x:17,y:15,paletteKey:'black'},{x:18,y:15,paletteKey:'black'},{x:19,y:15,paletteKey:'black'}
  ]},
  {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "The small starter " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "sampler" } }], text: "sampler" },
          { type: "text", text: " arranges six fill panels in two rows of three, separated by narrow border lines. On 28-count " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "evenweave" } }], text: "evenweave" },
          { type: "text", text: " the finished piece measures approximately 10 by 10 cm. Work the outer border and divider lines first, then fill each panel." }
        ]
      },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "What you need" }] },
      { type: "suppliesCard", attrs: { heading: "Materials", items: [
        { name: "28-count evenweave or linen", qty: "20 by 20 cm" },
        { name: "DMC 310 black stranded cotton", qty: "2 skeins" },
        { name: "Tapestry needle size 26", qty: "1" },
        { name: "Embroidery hoop 15 cm", qty: "1" },
        { name: "Embroidery scissors", qty: "1" }
      ]}},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Chart (structure overview)" }] },
      { type: "crossStitchChart", attrs: { definition: { title: 'Sampler structure', caption: 'Outer border and divider rows. Fill each panel with a chosen fill from the Blackwork fill catalogue.', width: 20, height: 16, fabricCount: 28, finishedSizeText: 'Overview tile; full sampler 60 by 60 stitches on 28-count', palette: [black], cells: [
        {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},{x:11,y:0,paletteKey:'black'},{x:12,y:0,paletteKey:'black'},{x:13,y:0,paletteKey:'black'},{x:14,y:0,paletteKey:'black'},{x:15,y:0,paletteKey:'black'},{x:16,y:0,paletteKey:'black'},{x:17,y:0,paletteKey:'black'},{x:18,y:0,paletteKey:'black'},{x:19,y:0,paletteKey:'black'},
        {x:0,y:1,paletteKey:'black'},{x:19,y:1,paletteKey:'black'},{x:0,y:2,paletteKey:'black'},{x:19,y:2,paletteKey:'black'},{x:0,y:3,paletteKey:'black'},{x:19,y:3,paletteKey:'black'},{x:0,y:4,paletteKey:'black'},{x:19,y:4,paletteKey:'black'},
        {x:0,y:5,paletteKey:'black'},{x:1,y:5,paletteKey:'black'},{x:2,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},{x:4,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},{x:6,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},{x:8,y:5,paletteKey:'black'},{x:9,y:5,paletteKey:'black'},{x:10,y:5,paletteKey:'black'},{x:11,y:5,paletteKey:'black'},{x:12,y:5,paletteKey:'black'},{x:13,y:5,paletteKey:'black'},{x:14,y:5,paletteKey:'black'},{x:15,y:5,paletteKey:'black'},{x:16,y:5,paletteKey:'black'},{x:17,y:5,paletteKey:'black'},{x:18,y:5,paletteKey:'black'},{x:19,y:5,paletteKey:'black'},
        {x:0,y:6,paletteKey:'black'},{x:19,y:6,paletteKey:'black'},{x:0,y:7,paletteKey:'black'},{x:19,y:7,paletteKey:'black'},{x:0,y:8,paletteKey:'black'},{x:19,y:8,paletteKey:'black'},{x:0,y:9,paletteKey:'black'},{x:19,y:9,paletteKey:'black'},
        {x:0,y:10,paletteKey:'black'},{x:1,y:10,paletteKey:'black'},{x:2,y:10,paletteKey:'black'},{x:3,y:10,paletteKey:'black'},{x:4,y:10,paletteKey:'black'},{x:5,y:10,paletteKey:'black'},{x:6,y:10,paletteKey:'black'},{x:7,y:10,paletteKey:'black'},{x:8,y:10,paletteKey:'black'},{x:9,y:10,paletteKey:'black'},{x:10,y:10,paletteKey:'black'},{x:11,y:10,paletteKey:'black'},{x:12,y:10,paletteKey:'black'},{x:13,y:10,paletteKey:'black'},{x:14,y:10,paletteKey:'black'},{x:15,y:10,paletteKey:'black'},{x:16,y:10,paletteKey:'black'},{x:17,y:10,paletteKey:'black'},{x:18,y:10,paletteKey:'black'},{x:19,y:10,paletteKey:'black'},
        {x:0,y:11,paletteKey:'black'},{x:19,y:11,paletteKey:'black'},{x:0,y:12,paletteKey:'black'},{x:19,y:12,paletteKey:'black'},{x:0,y:13,paletteKey:'black'},{x:19,y:13,paletteKey:'black'},{x:0,y:14,paletteKey:'black'},{x:19,y:14,paletteKey:'black'},
        {x:0,y:15,paletteKey:'black'},{x:1,y:15,paletteKey:'black'},{x:2,y:15,paletteKey:'black'},{x:3,y:15,paletteKey:'black'},{x:4,y:15,paletteKey:'black'},{x:5,y:15,paletteKey:'black'},{x:6,y:15,paletteKey:'black'},{x:7,y:15,paletteKey:'black'},{x:8,y:15,paletteKey:'black'},{x:9,y:15,paletteKey:'black'},{x:10,y:15,paletteKey:'black'},{x:11,y:15,paletteKey:'black'},{x:12,y:15,paletteKey:'black'},{x:13,y:15,paletteKey:'black'},{x:14,y:15,paletteKey:'black'},{x:15,y:15,paletteKey:'black'},{x:16,y:15,paletteKey:'black'},{x:17,y:15,paletteKey:'black'},{x:18,y:15,paletteKey:'black'},{x:19,y:15,paletteKey:'black'}
      ]}}},
      {
        type: "paragraph",
        content: [
          { type: "text", text: "The chart shows the sampler structure: outer border and divider lines. Each of the six panels is 18 by 18 stitches on the full 60 by 60 stitch design. Fill each panel with a different fill pattern from the Blackwork fill catalogue. Suggested fills: dotted grid (lightest), lattice, diamond, zigzag, herringbone, woven (darkest)." }
        ]
      },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Working order" }] },
      { type: "orderedList", content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Mount the fabric in the hoop. Mark the centre of the full 60 by 60 design." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work the outer border first using Holbein stitch." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work the horizontal and vertical divider lines that separate the six panels." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Fill each panel in turn, working from top-left to bottom-right. Complete each panel before moving to the next." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Check the stitch count in each panel against its fill chart before and after completing the panel." }] }] }
      ]},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Finishing" }] },
      { type: "paragraph", content: [{ type: "text", text: "Wash in cool water, press face-down on a thick towel, and frame in a 12 cm square or larger frame." }] }
    ]
  }
)

// Sampler 2: Medium sampler (#47)
makeSampler(47, 'blackwork-medium-sampler', 'Medium sampler',
  'Twelve fills in a grid with border frames, approximately 18 by 24 cm',
  'The medium sampler expands the starter sampler to twelve fill panels in a four-by-three grid. Each panel is larger, allowing fills with a bigger repeat to read clearly. On 28-count evenweave the finished piece measures approximately 18 by 24 cm.',
  'INTERMEDIATE', ['medium sampler blackwork', 'twelve fill sampler', 'blackwork practice sampler'],
  { title: 'Medium sampler overview', caption: 'Structure grid for 12-panel sampler.', width: 20, height: 16, fabricCount: 28, finishedSizeText: 'Full sampler approx 18 by 24 cm on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},{x:15,y:0,paletteKey:'black'},{x:19,y:0,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:5,y:5,paletteKey:'black'},{x:10,y:5,paletteKey:'black'},{x:15,y:5,paletteKey:'black'},{x:19,y:5,paletteKey:'black'},
    {x:0,y:10,paletteKey:'black'},{x:5,y:10,paletteKey:'black'},{x:10,y:10,paletteKey:'black'},{x:15,y:10,paletteKey:'black'},{x:19,y:10,paletteKey:'black'},
    {x:0,y:15,paletteKey:'black'},{x:5,y:15,paletteKey:'black'},{x:10,y:15,paletteKey:'black'},{x:15,y:15,paletteKey:'black'},{x:19,y:15,paletteKey:'black'}
  ]},
  {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "The medium " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "sampler" } }], text: "sampler" },
          { type: "text", text: " arranges twelve fill panels in four columns and three rows on 28-count " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "evenweave" } }], text: "evenweave" },
          { type: "text", text: ". Each panel is 24 by 24 stitches; the outer border is two stitches wide; divider lines are one stitch. Finished size approximately 18 by 24 cm. Work from the top-left panel downward, completing the border framework before filling panels." }
        ]
      },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "What you need" }] },
      { type: "suppliesCard", attrs: { heading: "Materials", items: [
        { name: "28-count evenweave or linen", qty: "30 by 36 cm" },
        { name: "DMC 310 black stranded cotton", qty: "4 skeins" },
        { name: "Tapestry needle size 26", qty: "1" },
        { name: "Embroidery hoop 15 cm", qty: "1" },
        { name: "Embroidery scissors", qty: "1" }
      ]}},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Suggested fills" }] },
      { type: "paragraph", content: [
        { type: "text", text: "Arrange fills from lightest to darkest across the rows. Row 1 (lightest three): dotted grid, simple repeat, star fill. Row 2 (medium three): lattice, diamond, zigzag. Row 3 (medium-dark three): cross fill, brick, scallop. Row 4 (darkest three): herringbone, woven, geometric square." }
      ]},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Working order" }] },
      { type: "orderedList", content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Tack the outer border and all divider lines before filling any panel." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Use " },
          { type: "text", marks: [{ type: "techniqueLink", attrs: { techniqueSlug: "holbein-stitch", label: "Holbein stitch" } }], text: "Holbein stitch" },
          { type: "text", text: " throughout." }] }]
        },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Fill each panel starting from the centre of that panel, not the centre of the whole cloth." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Label each fill pattern in pencil on a paper grid next to the hoop as you work, so you have a record of what you stitched." }] }] }
      ]},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Finishing" }] },
      { type: "paragraph", content: [{ type: "text", text: "Wash in cool water, press face-down on a thick towel, and frame. A 20 by 28 cm frame with a narrow mount works well for this size." }] }
    ]
  }
)

// Sampler 3: Border sampler (#48)
makeSampler(48, 'blackwork-border-sampler', 'Border sampler',
  'Five border designs stacked in horizontal bands',
  'The border sampler stacks five border designs vertically, separated by a double-line divider. Each border demonstrates a different character: simple line, zigzag, diamond chain, knotted line, and wide ceremonial. Finished size on 28-count evenweave: approximately 8 by 20 cm.',
  'INTERMEDIATE', ['border sampler blackwork', 'five border sampler', 'band sampler blackwork'],
  { title: 'Border sampler overview', caption: 'Five stacked border bands.', width: 20, height: 20, fabricCount: 28, finishedSizeText: 'Full sampler approx 8 by 20cm on 28-count', palette: [black], cells: [
    {x:0,y:0,paletteKey:'black'},{x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},{x:3,y:0,paletteKey:'black'},{x:4,y:0,paletteKey:'black'},{x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},{x:8,y:0,paletteKey:'black'},{x:9,y:0,paletteKey:'black'},{x:10,y:0,paletteKey:'black'},{x:11,y:0,paletteKey:'black'},{x:12,y:0,paletteKey:'black'},{x:13,y:0,paletteKey:'black'},{x:14,y:0,paletteKey:'black'},{x:15,y:0,paletteKey:'black'},{x:16,y:0,paletteKey:'black'},{x:17,y:0,paletteKey:'black'},{x:18,y:0,paletteKey:'black'},{x:19,y:0,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:1,y:4,paletteKey:'black'},{x:2,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},{x:4,y:4,paletteKey:'black'},{x:5,y:4,paletteKey:'black'},{x:6,y:4,paletteKey:'black'},{x:7,y:4,paletteKey:'black'},{x:8,y:4,paletteKey:'black'},{x:9,y:4,paletteKey:'black'},{x:10,y:4,paletteKey:'black'},{x:11,y:4,paletteKey:'black'},{x:12,y:4,paletteKey:'black'},{x:13,y:4,paletteKey:'black'},{x:14,y:4,paletteKey:'black'},{x:15,y:4,paletteKey:'black'},{x:16,y:4,paletteKey:'black'},{x:17,y:4,paletteKey:'black'},{x:18,y:4,paletteKey:'black'},{x:19,y:4,paletteKey:'black'},
    {x:0,y:8,paletteKey:'black'},{x:19,y:8,paletteKey:'black'},{x:0,y:8,paletteKey:'black'},{x:1,y:8,paletteKey:'black'},{x:2,y:8,paletteKey:'black'},{x:3,y:8,paletteKey:'black'},{x:4,y:8,paletteKey:'black'},{x:5,y:8,paletteKey:'black'},{x:6,y:8,paletteKey:'black'},{x:7,y:8,paletteKey:'black'},{x:8,y:8,paletteKey:'black'},{x:9,y:8,paletteKey:'black'},{x:10,y:8,paletteKey:'black'},{x:11,y:8,paletteKey:'black'},{x:12,y:8,paletteKey:'black'},{x:13,y:8,paletteKey:'black'},{x:14,y:8,paletteKey:'black'},{x:15,y:8,paletteKey:'black'},{x:16,y:8,paletteKey:'black'},{x:17,y:8,paletteKey:'black'},{x:18,y:8,paletteKey:'black'},{x:19,y:8,paletteKey:'black'},
    {x:0,y:12,paletteKey:'black'},{x:1,y:12,paletteKey:'black'},{x:2,y:12,paletteKey:'black'},{x:3,y:12,paletteKey:'black'},{x:4,y:12,paletteKey:'black'},{x:5,y:12,paletteKey:'black'},{x:6,y:12,paletteKey:'black'},{x:7,y:12,paletteKey:'black'},{x:8,y:12,paletteKey:'black'},{x:9,y:12,paletteKey:'black'},{x:10,y:12,paletteKey:'black'},{x:11,y:12,paletteKey:'black'},{x:12,y:12,paletteKey:'black'},{x:13,y:12,paletteKey:'black'},{x:14,y:12,paletteKey:'black'},{x:15,y:12,paletteKey:'black'},{x:16,y:12,paletteKey:'black'},{x:17,y:12,paletteKey:'black'},{x:18,y:12,paletteKey:'black'},{x:19,y:12,paletteKey:'black'},
    {x:0,y:16,paletteKey:'black'},{x:1,y:16,paletteKey:'black'},{x:2,y:16,paletteKey:'black'},{x:3,y:16,paletteKey:'black'},{x:4,y:16,paletteKey:'black'},{x:5,y:16,paletteKey:'black'},{x:6,y:16,paletteKey:'black'},{x:7,y:16,paletteKey:'black'},{x:8,y:16,paletteKey:'black'},{x:9,y:16,paletteKey:'black'},{x:10,y:16,paletteKey:'black'},{x:11,y:16,paletteKey:'black'},{x:12,y:16,paletteKey:'black'},{x:13,y:16,paletteKey:'black'},{x:14,y:16,paletteKey:'black'},{x:15,y:16,paletteKey:'black'},{x:16,y:16,paletteKey:'black'},{x:17,y:16,paletteKey:'black'},{x:18,y:16,paletteKey:'black'},{x:19,y:16,paletteKey:'black'},
    {x:0,y:19,paletteKey:'black'},{x:1,y:19,paletteKey:'black'},{x:2,y:19,paletteKey:'black'},{x:3,y:19,paletteKey:'black'},{x:4,y:19,paletteKey:'black'},{x:5,y:19,paletteKey:'black'},{x:6,y:19,paletteKey:'black'},{x:7,y:19,paletteKey:'black'},{x:8,y:19,paletteKey:'black'},{x:9,y:19,paletteKey:'black'},{x:10,y:19,paletteKey:'black'},{x:11,y:19,paletteKey:'black'},{x:12,y:19,paletteKey:'black'},{x:13,y:19,paletteKey:'black'},{x:14,y:19,paletteKey:'black'},{x:15,y:19,paletteKey:'black'},{x:16,y:19,paletteKey:'black'},{x:17,y:19,paletteKey:'black'},{x:18,y:19,paletteKey:'black'},{x:19,y:19,paletteKey:'black'}
  ]},
  {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "The border " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "sampler" } }], text: "sampler" },
          { type: "text", text: " records five border designs in a vertical stack. Each band is separated by a double-line divider. The full design on 28-count " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "evenweave" } }], text: "evenweave" },
          { type: "text", text: " measures approximately 8 cm wide and 20 cm tall." }
        ]
      },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "What you need" }] },
      { type: "suppliesCard", attrs: { heading: "Materials", items: [
        { name: "28-count evenweave or linen", qty: "18 by 30 cm" },
        { name: "DMC 310 black stranded cotton", qty: "2 skeins" },
        { name: "Tapestry needle size 26", qty: "1" },
        { name: "Embroidery hoop 15 cm", qty: "1" },
        { name: "Embroidery scissors", qty: "1" }
      ]}},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Working order" }] },
      { type: "orderedList", content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work all five divider lines first, top to bottom, using Holbein stitch." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work the outer border." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work each border band in order from top to bottom, using the chart for that border design." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Where borders have corners, work the corner unit before the long run." }] }] }
      ]},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Finishing" }] },
      { type: "paragraph", content: [{ type: "text", text: "Wash, press, and frame in a 10 by 22 cm narrow portrait frame." }] }
    ]
  }
)

// Sampler 4: Alphabet sampler (#49)
makeSampler(49, 'blackwork-alphabet-sampler', 'Blackwork alphabet sampler',
  'A to Z in block letters on blackwork grid',
  'The blackwork alphabet sampler charts all 26 capital letters in a six-stitch-tall block alphabet. Letters are spaced four stitches apart. The full alphabet spans approximately 18 cm on 28-count evenweave. Work a name, a date, or all 26 letters.',
  'INTERMEDIATE', ['alphabet blackwork', 'letter sampler blackwork', 'monogram blackwork sampler'],
  { title: 'Alphabet sampler — letters A to F', caption: 'First six letters of the block alphabet. Each letter is 4 stitches wide and 6 stitches tall.', width: 30, height: 6, fabricCount: 28, finishedSizeText: 'Full 26-letter alphabet approx 18cm wide on 28-count', palette: [black], cells: [
    // A
    {x:1,y:0,paletteKey:'black'},{x:2,y:0,paletteKey:'black'},
    {x:0,y:1,paletteKey:'black'},{x:3,y:1,paletteKey:'black'},
    {x:0,y:2,paletteKey:'black'},{x:1,y:2,paletteKey:'black'},{x:2,y:2,paletteKey:'black'},{x:3,y:2,paletteKey:'black'},
    {x:0,y:3,paletteKey:'black'},{x:3,y:3,paletteKey:'black'},
    {x:0,y:4,paletteKey:'black'},{x:3,y:4,paletteKey:'black'},
    {x:0,y:5,paletteKey:'black'},{x:3,y:5,paletteKey:'black'},
    // B (x+5)
    {x:5,y:0,paletteKey:'black'},{x:6,y:0,paletteKey:'black'},{x:7,y:0,paletteKey:'black'},
    {x:5,y:1,paletteKey:'black'},{x:8,y:1,paletteKey:'black'},
    {x:5,y:2,paletteKey:'black'},{x:6,y:2,paletteKey:'black'},{x:7,y:2,paletteKey:'black'},
    {x:5,y:3,paletteKey:'black'},{x:8,y:3,paletteKey:'black'},
    {x:5,y:4,paletteKey:'black'},{x:8,y:4,paletteKey:'black'},
    {x:5,y:5,paletteKey:'black'},{x:6,y:5,paletteKey:'black'},{x:7,y:5,paletteKey:'black'},
    // C (x+10)
    {x:11,y:0,paletteKey:'black'},{x:12,y:0,paletteKey:'black'},{x:13,y:0,paletteKey:'black'},
    {x:10,y:1,paletteKey:'black'},
    {x:10,y:2,paletteKey:'black'},
    {x:10,y:3,paletteKey:'black'},
    {x:10,y:4,paletteKey:'black'},
    {x:11,y:5,paletteKey:'black'},{x:12,y:5,paletteKey:'black'},{x:13,y:5,paletteKey:'black'},
    // D (x+15)
    {x:15,y:0,paletteKey:'black'},{x:16,y:0,paletteKey:'black'},{x:17,y:0,paletteKey:'black'},
    {x:15,y:1,paletteKey:'black'},{x:18,y:1,paletteKey:'black'},
    {x:15,y:2,paletteKey:'black'},{x:18,y:2,paletteKey:'black'},
    {x:15,y:3,paletteKey:'black'},{x:18,y:3,paletteKey:'black'},
    {x:15,y:4,paletteKey:'black'},{x:18,y:4,paletteKey:'black'},
    {x:15,y:5,paletteKey:'black'},{x:16,y:5,paletteKey:'black'},{x:17,y:5,paletteKey:'black'},
    // E (x+20)
    {x:20,y:0,paletteKey:'black'},{x:21,y:0,paletteKey:'black'},{x:22,y:0,paletteKey:'black'},{x:23,y:0,paletteKey:'black'},
    {x:20,y:1,paletteKey:'black'},
    {x:20,y:2,paletteKey:'black'},{x:21,y:2,paletteKey:'black'},{x:22,y:2,paletteKey:'black'},
    {x:20,y:3,paletteKey:'black'},
    {x:20,y:4,paletteKey:'black'},
    {x:20,y:5,paletteKey:'black'},{x:21,y:5,paletteKey:'black'},{x:22,y:5,paletteKey:'black'},{x:23,y:5,paletteKey:'black'},
    // F (x+25)
    {x:25,y:0,paletteKey:'black'},{x:26,y:0,paletteKey:'black'},{x:27,y:0,paletteKey:'black'},{x:28,y:0,paletteKey:'black'},
    {x:25,y:1,paletteKey:'black'},
    {x:25,y:2,paletteKey:'black'},{x:26,y:2,paletteKey:'black'},{x:27,y:2,paletteKey:'black'},
    {x:25,y:3,paletteKey:'black'},
    {x:25,y:4,paletteKey:'black'},
    {x:25,y:5,paletteKey:'black'}
  ]},
  {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "The blackwork alphabet " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "sampler" } }], text: "sampler" },
          { type: "text", text: " charts all 26 capital letters in a block alphabet six stitches tall. On 28-count " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "evenweave" } }], text: "evenweave" },
          { type: "text", text: ", each letter is approximately 4 mm wide; the full alphabet is approximately 18 cm wide. Work a name, a date, or the full set." }
        ]
      },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "What you need" }] },
      { type: "suppliesCard", attrs: { heading: "Materials", items: [
        { name: "28-count evenweave or linen", qty: "30 by 15 cm for a name; 30 by 20 cm for the full alphabet" },
        { name: "DMC 310 black stranded cotton", qty: "1 skein" },
        { name: "Tapestry needle size 26", qty: "1" },
        { name: "Embroidery hoop 10 cm", qty: "1" },
        { name: "Embroidery scissors", qty: "1" }
      ]}},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Working method" }] },
      { type: "orderedList", content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Plan the letters to work on graph paper first. Count the total stitch width (each letter 4 stitches wide, 2 stitches gap between letters) and centre the text on the fabric." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work each letter using back stitch or Holbein stitch. Back stitch is faster; Holbein stitch gives a reversible result." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work letters left to right. Complete each letter before moving to the next." }] }] }
      ]},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Finishing" }] },
      { type: "paragraph", content: [{ type: "text", text: "Wash, press, and frame. A long narrow frame suits a name or date; a wider frame suits the full alphabet." }] }
    ]
  }
)

// Sampler 5: Historical-style band sampler (#50)
makeSampler(50, 'blackwork-historical-band-sampler', 'Historical-style band sampler',
  'Multiple fill bands, borders, and a central motif on one cloth',
  'The historical-style band sampler combines all the elements of a traditional blackwork sampler: a decorative outer border, multiple fill-pattern bands of different widths, and a central motif. On 28-count evenweave the finished piece measures approximately 20 by 30 cm.',
  'ADVANCED', ['historical band sampler blackwork', 'traditional blackwork sampler', 'full blackwork sampler'],
  { title: 'Historical band sampler overview', caption: 'Overall structure showing outer border, bands, and central panel.', width: 20, height: 24, fabricCount: 28, finishedSizeText: 'Full sampler approx 20 by 30cm on 28-count', palette: [black], cells: [
    // Outer border top and bottom
    ...[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(x=>({x,y:0,paletteKey:'black'})),
    ...[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(x=>({x,y:23,paletteKey:'black'})),
    // Side borders
    ...[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(y=>({x:0,y,paletteKey:'black'})),
    ...[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(y=>({x:19,y,paletteKey:'black'})),
    // Band dividers
    ...[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(x=>({x,y:4,paletteKey:'black'})),
    ...[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(x=>({x,y:8,paletteKey:'black'})),
    ...[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(x=>({x,y:16,paletteKey:'black'})),
    ...[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(x=>({x,y:20,paletteKey:'black'})),
    // Central panel border
    {x:3,y:9,paletteKey:'black'},{x:4,y:9,paletteKey:'black'},{x:5,y:9,paletteKey:'black'},{x:6,y:9,paletteKey:'black'},{x:7,y:9,paletteKey:'black'},{x:8,y:9,paletteKey:'black'},{x:9,y:9,paletteKey:'black'},{x:10,y:9,paletteKey:'black'},{x:11,y:9,paletteKey:'black'},{x:12,y:9,paletteKey:'black'},{x:13,y:9,paletteKey:'black'},{x:14,y:9,paletteKey:'black'},{x:15,y:9,paletteKey:'black'},{x:16,y:9,paletteKey:'black'},
    {x:3,y:15,paletteKey:'black'},{x:4,y:15,paletteKey:'black'},{x:5,y:15,paletteKey:'black'},{x:6,y:15,paletteKey:'black'},{x:7,y:15,paletteKey:'black'},{x:8,y:15,paletteKey:'black'},{x:9,y:15,paletteKey:'black'},{x:10,y:15,paletteKey:'black'},{x:11,y:15,paletteKey:'black'},{x:12,y:15,paletteKey:'black'},{x:13,y:15,paletteKey:'black'},{x:14,y:15,paletteKey:'black'},{x:15,y:15,paletteKey:'black'},{x:16,y:15,paletteKey:'black'},
    {x:3,y:10,paletteKey:'black'},{x:16,y:10,paletteKey:'black'},{x:3,y:11,paletteKey:'black'},{x:16,y:11,paletteKey:'black'},{x:3,y:12,paletteKey:'black'},{x:16,y:12,paletteKey:'black'},{x:3,y:13,paletteKey:'black'},{x:16,y:13,paletteKey:'black'},{x:3,y:14,paletteKey:'black'},{x:16,y:14,paletteKey:'black'}
  ]},
  {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "The historical-style band " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "sampler" } }], text: "sampler" },
          { type: "text", text: " brings together all the elements covered in the blackwork catalogue: an outer decorative border, three fill-pattern bands, and a central motif panel. On 28-count " },
          { type: "text", marks: [{ type: "glossaryTooltip", attrs: { termSlug: "evenweave" } }], text: "evenweave" },
          { type: "text", text: " the finished piece measures approximately 20 by 30 cm." }
        ]
      },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "What you need" }] },
      { type: "suppliesCard", attrs: { heading: "Materials", items: [
        { name: "28-count evenweave or linen", qty: "30 by 40 cm" },
        { name: "DMC 310 black stranded cotton", qty: "6 skeins" },
        { name: "Tapestry needle size 26", qty: "1" },
        { name: "Embroidery hoop 20 cm", qty: "1" },
        { name: "Embroidery scissors", qty: "1" }
      ]}},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Design elements" }] },
      { type: "paragraph", content: [{ type: "text", text: "Outer border: wide ceremonial border on all four sides with mitred corners. Top band: dense fill (woven or geometric square). Second band: medium fill (diamond or lattice). Central panel: Tudor diamond all-over or a large geometric motif of your choice. Third band: open fill (dotted grid or star). Bottom band: matching the top band for symmetry." }] },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Working order" }] },
      { type: "orderedList", content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work the outer border first, corners before long runs." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Work all divider lines." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Fill the central panel motif." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Fill the three side bands, working from the most complex fill to the least complex." }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Check the stitch count in each band at the start and end of each repeat row." }] }] }
      ]},
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Finishing" }] },
      { type: "paragraph", content: [{ type: "text", text: "Wash in cool water, press face-down on a thick towel, and lace over an acid-free board to mount. Frame in a 24 by 34 cm frame." }] }
    ]
  }
)

console.log('All sampler patterns written.')
