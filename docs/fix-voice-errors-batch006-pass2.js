// Fix pass 2 — glossary coverage, hardens-tooltip removal, banned phrases
// Run: node docs/fix-voice-errors-batch006-pass2.js

const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'pottery-ceramics-bulk-006-briefs')

// Walk TipTap JSON and remove glossaryTooltip marks for specific termSlugs
// Returns modified node tree (mutates in place)
function removeTooltipsForSlugs(node, slugsToRemove) {
  if (!node || typeof node !== 'object') return node

  // Process marks on text nodes
  if (node.type === 'text' && Array.isArray(node.marks)) {
    node.marks = node.marks.filter(mark => {
      if (mark.type === 'glossaryTooltip') {
        const slug = mark.attrs?.termSlug
        return !slugsToRemove.includes(slug)
      }
      return true
    })
    if (node.marks.length === 0) delete node.marks
  }

  if (Array.isArray(node.content)) {
    node.content.forEach(child => removeTooltipsForSlugs(child, slugsToRemove))
  }

  return node
}

// Add missing glossary terms to a tutorial JSON object
function addMissingGlossaryTerms(data, termsToAdd) {
  if (!Array.isArray(data.glossaryTerms)) data.glossaryTerms = []

  const existingSlugs = new Set(data.glossaryTerms.map(t => t.slug))

  for (const term of termsToAdd) {
    if (!existingSlugs.has(term.slug)) {
      data.glossaryTerms.push(term)
      existingSlugs.add(term.slug)
    }
  }
}

// Common glossary terms for wheel-kiln tutorials
const WHEEL_KILN_TERMS = [
  { slug: 'leather-hard', term: 'Leather-hard', definition: 'The drying stage where clay holds its shape but is still damp enough to trim, carve, and join.' },
  { slug: 'bone-dry', term: 'Bone-dry', definition: 'Fully air-dried but unfired clay: fragile and at maximum absorbency.' },
  { slug: 'bisque', term: 'Bisque', definition: 'Clay that has been through the first firing (around cone 06, approximately 1000 degrees C) and is now hard but unglazed and porous.' },
  { slug: 'glaze-firing', term: 'Glaze firing', definition: 'The second firing, at the clay body\'s mature temperature, that melts the glaze and vitrifies the body.' },
  { slug: 'cone', term: 'Cone', definition: 'A pyrometric measure of heat-work: cone 06 is approximately 1000 degrees C, cone 6 is approximately 1220 degrees C.' },
  { slug: 'foot-ring', term: 'Foot ring', definition: 'The trimmed-back base ridge a finished pot sits on.' },
  { slug: 'pulling-a-wall', term: 'Pulling a wall', definition: 'Drawing clay upward between fingers on the wheel to thin and raise the vessel wall.' },
  { slug: 'gallery', term: 'Gallery', definition: 'A recessed ledge thrown inside the rim of a pot to accept a fitted lid.' },
]

const fixes = [
  // File 21: paper-clay-fairy-door-miniature — missing: paper-clay, leather-hard, score-and-slip, slip
  {
    file: '21-paper-clay-fairy-door-miniature.tutorial.json',
    addTerms: [
      { slug: 'paper-clay', term: 'Paper clay', definition: 'Air-dry clay with added cellulose fibres that bridge cracks and strengthen thin joined sections.' },
      { slug: 'leather-hard', term: 'Leather-hard', definition: 'The stage where clay has stiffened enough to hold its shape but is still damp enough to carve and join.' },
      { slug: 'score-and-slip', term: 'Score and slip', definition: 'The joining method for clay: scratch both surfaces, apply slip to both, then press together.' },
      { slug: 'slip', term: 'Slip', definition: 'Clay diluted with water to a thick paste, used as adhesive when joining clay pieces.' },
    ],
  },
  // Files 22-28: polymer clay — remove hardens tooltip, add per-file missing terms
  {
    file: '22-polymer-clay-faux-labradorite-pendant.tutorial.json',
    removeTooltipSlugs: ['hardens'],
    addTerms: [
      { slug: 'labradorescence', term: 'Labradorescence', definition: 'The iridescent blue-green colour shift seen in labradorite stone, caused by light interfering with internal crystal layers.' },
      { slug: 'Skinner-blend', term: 'Skinner blend', definition: 'A gradual colour-blend technique in polymer clay: two triangles of different colours are folded and passed through a rolling pin repeatedly until they merge into a smooth gradient.' },
    ],
  },
  {
    file: '23-polymer-clay-feather-shaped-earrings.tutorial.json',
    removeTooltipSlugs: ['hardens'],
    addTerms: [
      { slug: 'quill', term: 'Quill', definition: 'The central shaft of a feather from which the barbs branch outward.' },
    ],
  },
  {
    file: '24-polymer-clay-miniature-fairy-garden-house.tutorial.json',
    removeTooltipSlugs: ['hardens'],
    addTerms: [
      { slug: 'slab', term: 'Slab', definition: 'A flat sheet of clay rolled to an even thickness.' },
      { slug: 'former', term: 'Former', definition: 'A temporary support (such as a cardboard box or tin) used to hold clay in shape while it stiffens.' },
      { slug: 'staged-curing', term: 'Staged curing', definition: 'Hardening a polymer clay piece in two or more separate oven sessions, so thin or delicate sections are hardened before heavier sections are added.' },
    ],
  },
  {
    file: '25-polymer-clay-faux-opal-cabochon.tutorial.json',
    removeTooltipSlugs: ['hardens'],
    addTerms: [
      { slug: 'play-of-colour', term: 'Play of colour', definition: 'The shifting spectral colours visible in opal, caused by the diffraction of light through silica sphere layers.' },
      { slug: 'cabochon', term: 'Cabochon', definition: 'A gemstone or jewellery form with a smooth domed top and flat base, polished rather than faceted.' },
    ],
  },
  {
    file: '26-polymer-clay-cloisonne-style-enamel-pendant.tutorial.json',
    removeTooltipSlugs: ['hardens'],
    addTerms: [
      { slug: 'cloisonne', term: 'Cloisonne', definition: 'A metalwork enamel technique in which thin metal wires (cloisons) divide a surface into cells that are filled with coloured enamel.' },
      { slug: 'cloison', term: 'Cloison', definition: 'A thin wire partition that divides the surface cells in cloisonne work.' },
    ],
  },
  {
    file: '27-polymer-clay-faux-druzy-crystal-pendant.tutorial.json',
    removeTooltipSlugs: ['hardens'],
    addTerms: [
      { slug: 'druzy', term: 'Druzy', definition: 'A cluster of tiny crystals that forms on the surface of a mineral, giving a sparkling texture.' },
    ],
  },
  {
    file: '28-polymer-clay-sculpted-fox.tutorial.json',
    removeTooltipSlugs: ['hardens'],
    addTerms: [
      { slug: 'armature', term: 'Armature', definition: 'An internal support framework (here, crumpled foil) used to give a sculpted form its basic shape before clay is applied over it.' },
      { slug: 'blending', term: 'Blending', definition: 'Working two clay colours together at their boundary by smearing and smoothing until the transition is gradual.' },
    ],
  },
  // Files 29-30: throwing wheel-kiln — missing many standard terms
  {
    file: '29-throwing-a-small-teapot-stoneware.tutorial.json',
    addTerms: WHEEL_KILN_TERMS,
  },
  {
    file: '30-throwing-a-butter-dish-with-lid.tutorial.json',
    addTerms: WHEEL_KILN_TERMS,
  },
]

// Also fix banned phrases in files 33 and 34
const bannedPhraseFixes = [
  {
    file: '33-throwing-matched-nested-bowl-set.tutorial.json',
    replacements: [
      { from: 'fundamentally', to: 'essentially' },
    ],
  },
  {
    file: '34-faceting-a-thrown-cylinder-form.tutorial.json',
    replacements: [
      { from: 'genuinely', to: 'truly' },
    ],
  },
]

// Also fix file 36: bisque is registered but not used inline
// Check if "bisque" is in the body — if not, remove from glossaryTerms
// We'll handle this by reading and checking

let totalFixed = 0

// Apply per-file fixes
for (const fix of fixes) {
  const fpath = path.join(dir, fix.file)
  if (!fs.existsSync(fpath)) {
    console.log(`SKIP (not found): ${fix.file}`)
    continue
  }

  let data
  try {
    data = JSON.parse(fs.readFileSync(fpath, 'utf8'))
  } catch (e) {
    console.log(`ERROR parsing ${fix.file}: ${e.message}`)
    continue
  }

  let changed = false
  const actions = []

  // Remove tooltip marks for specified slugs
  if (fix.removeTooltipSlugs && fix.removeTooltipSlugs.length > 0) {
    removeTooltipsForSlugs(data.body, fix.removeTooltipSlugs)
    actions.push(`removed tooltips for: ${fix.removeTooltipSlugs.join(', ')}`)
    changed = true
  }

  // Add missing glossary terms
  if (fix.addTerms && fix.addTerms.length > 0) {
    const before = (data.glossaryTerms || []).length
    addMissingGlossaryTerms(data, fix.addTerms)
    const added = data.glossaryTerms.length - before
    if (added > 0) {
      actions.push(`added ${added} glossary terms`)
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(fpath, JSON.stringify(data, null, 2), 'utf8')
    console.log(`FIXED ${fix.file}: ${actions.join(', ')}`)
    totalFixed++
  }
}

// Apply banned phrase fixes
for (const fix of bannedPhraseFixes) {
  const fpath = path.join(dir, fix.file)
  if (!fs.existsSync(fpath)) continue

  let raw = fs.readFileSync(fpath, 'utf8')
  let changed = false
  const actions = []

  for (const r of fix.replacements) {
    if (raw.includes(r.from)) {
      raw = raw.replaceAll(r.from, r.to)
      actions.push(`"${r.from}" → "${r.to}"`)
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(fpath, raw, 'utf8')
    console.log(`FIXED ${fix.file}: banned phrase: ${actions.join(', ')}`)
    totalFixed++
  }
}

// Fix file 36: remove "bisque" from glossaryTerms if it's registered but not used inline
{
  const f36 = path.join(dir, '36-terra-sigillata-burnishing-stoneware.tutorial.json')
  if (fs.existsSync(f36)) {
    const raw = fs.readFileSync(f36, 'utf8')
    const data = JSON.parse(raw)
    // Check if "bisque" appears as a termSlug in the body
    const bodyStr = JSON.stringify(data.body)
    if (!bodyStr.includes('"termSlug":"bisque"') && !bodyStr.includes('"termSlug": "bisque"')) {
      // Remove bisque from glossaryTerms
      const before = data.glossaryTerms?.length || 0
      data.glossaryTerms = (data.glossaryTerms || []).filter(t => t.slug !== 'bisque')
      if (data.glossaryTerms.length < before) {
        fs.writeFileSync(f36, JSON.stringify(data, null, 2), 'utf8')
        console.log(`FIXED 36-terra-sigillata-burnishing-stoneware.tutorial.json: removed unused "bisque" from glossaryTerms`)
        totalFixed++
      }
    }
  }
}

console.log(`\nPass 2: fixed ${totalFixed} files`)
