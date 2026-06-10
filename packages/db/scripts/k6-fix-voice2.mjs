/**
 * Fix voice-check errors in newly authored k6 scarf-cowl and hat files.
 * Run: node packages/db/scripts/k6-fix-voice2.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function load(rel) {
  const path = join(__dirname, rel)
  return { path, data: JSON.parse(readFileSync(path, 'utf8')) }
}
function save(path, data) { writeFileSync(path, JSON.stringify(data, null, 2)) }
function t(text) { return [{ type: 'text', text }] }

/** Replace all en/em dashes in every string value recursively. */
function fixDashes(obj) {
  if (typeof obj === 'string') return obj.replace(/[–—]/g, '-')
  if (Array.isArray(obj)) return obj.map(fixDashes)
  if (obj && typeof obj === 'object') {
    const r = {}
    for (const [k, v] of Object.entries(obj)) r[k] = fixDashes(v)
    return r
  }
  return obj
}

let fixed = 0
function fix(rel, fn) {
  const { path, data } = load(rel)
  fn(data)
  save(path, data)
  fixed++
  console.log('FIXED:', rel)
}

// ── HATS ─────────────────────────────────────────────────────────────────────

fix('k6-hat/bohus-mini-hat.json', d => {
  d.body.content[0].content = t(
    'This Bohus-inspired mini hat is worked bottom-up in the round. It has a three-colour purl-stitch colourwork band in angora-blend DK yarn. Fits adult heads of 54 (56, 58) cm.'
  )
})

fix('k6-hat/child-striped-hat.json', d => {
  d.body.content[0].content = t(
    'This child\'s striped beanie is worked bottom-up in the round in two colours of aran yarn. Stripes alternate every two rounds. Three sizes: Toddler (46 cm), Child S (50 cm), Child M (54 cm).'
  )
})

fix('k6-hat/contrast-brim-hat.json', d => {
  d.body.content[0].content = t(
    'This contrast brim hat is worked bottom-up in the round. The brim is ribbed in a contrast colour; the body is plain stocking stitch in the main colour. Fits adult heads of 54 (56, 58) cm.'
  )
})

fix('k6-hat/double-cable-hat.json', d => {
  d.body.content[0].content = t(
    'This double cable hat is worked bottom-up in the round. Two symmetrical C6F cables flank a seed-stitch centre on a reverse stocking stitch background. Fits adult heads of 54 (56, 58) cm.'
  )
})

fix('k6-hat/fair-isle-beanie.json', d => {
  d.body.content[28].content = t(
    'Long floats catching when wearing: any float spanning more than 5 stitches needs to be caught. Trap it under one stitch on the following round without knitting it.'
  )
})

fix('k6-hat/gradient-hat.json', d => {
  d.body.content[0].content = t(
    'This gradient hat is worked bottom-up in the round in DK yarn. It fades from a dark colour at the brim to a light colour at the crown using the held-together blend method. Fits adult heads of 54 (56, 58) cm.'
  )
})

fix('k6-hat/honeycomb-cable-hat.json', d => {
  d.body.content[30].content = t(
    'Try the honeycomb panel on a sweater yoke for an all-over aran look using the same cables.'
  )
})

fix('k6-hat/intarsia-heart-hat.json', d => {
  d.body.content[0].content = t(
    'This intarsia heart hat is worked bottom-up in the round. A 12-stitch by 10-round heart motif sits at centre front using the intarsia technique. Fits adult heads of 54 (56, 58) cm.'
  )
})

fix('k6-hat/lace-beret.json', d => {
  d.body.content[0].content = t(
    'This lace beret is worked bottom-up in the round. It starts from a fitted brim band, increases to a wide disc carrying an all-over feather-and-fan lace pattern, then decreases to a gathered centre. Fits adult heads of 54 (56, 58) cm.'
  )
})

fix('k6-hat/latvian-hat.json', d => {
  d.body.content[0].content = t(
    'This Latvian-inspired stranded hat is worked bottom-up in the round. Two 10-round geometric border bands sit in stranded colourwork above a rib brim. Fits adult heads of 54 (56, 58) cm.'
  )
  d.body.content[34].content = t(
    'The Bohus-inspired mini hat uses angora-blend yarn and purl-stitch colourwork for a distinctive look.'
  )
})

fix('k6-hat/mesh-hat.json', d => {
  d.body.content[30].content = t(
    'The Fair Isle beanie uses a colourwork stranded technique in a similar beanie shape, for winter wear instead of summer.'
  )
})

fix('k6-hat/mosaic-colourwork-beanie.json', d => {
  d.body.content[0].content = t(
    'This mosaic colourwork beanie is worked bottom-up in the round. A slip-stitch technique creates two-colour geometric patterns. Fits adult heads of 54 (56, 58) cm.'
  )
})

fix('k6-hat/norwegian-rose-hat.json', d => {
  d.body.content[0].content = t(
    'This Norwegian rose pattern hat is worked bottom-up in the round. An 8-round Selbu rose motif repeats from brim to crown. Fits adult heads of 54 (56, 58) cm.'
  )
})

fix('k6-hat/single-cable-hat.json', d => {
  d.body.content[0].content = t(
    'This single-panel cable hat is worked bottom-up in the round. The body is plain stocking stitch with one prominent C6F cable at the centre front. Fits adult heads of 54 (56, 58) cm.'
  )
})

// ── SCARF-COWL ───────────────────────────────────────────────────────────────

fix('k6-scarf-cowl/bohus-mini-scarf.json', d => {
  const bc = d.body.content
  bc[0].content = t(
    'This is a short mini scarf knitted flat in two-colour stranded colourwork on 3.75 mm needles with fingering-weight yarn. It finishes at 16 cm wide and 55 cm long when blocked. The colourwork panel fills the centre 30 rows. Contrast stitches are occasionally purled on the right side to create raised bead nubs, following the Bohus purl-bead technique.'
  )
  bc[17].content = t(
    'Stitch count check-in: at the halfway mark (around row 94, mid-way through the colourwork panel), you should have 42 stitches on the needle.'
  )
})

fix('k6-scarf-cowl/fair-isle-scarf.json', d => {
  d.body.content[1].content = t(
    'Flat construction was chosen over in-the-round because the wrong side is occasionally visible on a worn scarf. A flat fabric has neater floats on the wrong side when worked carefully. Managing a float on a purl row (wrong side) is the main skill challenge of this pattern.'
  )
})

fix('k6-scarf-cowl/gradient-scarf.json', d => {
  // Fix em-dashes in excerpt
  d.excerpt = fixDashes(d.excerpt)
  // Fix en-dashes in bc[11] and bc[12] row notation
  const bc = d.body.content
  bc[11] = fixDashes(bc[11])
  bc[12] = fixDashes(bc[12])
})

fix('k6-scarf-cowl/helix-stripe-cowl.json', d => {
  const bc = d.body.content
  bc[11].content = t(
    'From this point, the two yarns alternate every 50 stitches. Work to the colour B marker in colour A (knit all stitches), slip marker, pick up colour B, knit to the round-start marker, slip marker, pick up colour A. The two join points are staggered by 50 stitches, so the stripes spiral without meeting at the same spot.'
  )
  bc[25].content = t(
    'The two-colour ribbed cowl works two colours in the round using full rounds of each colour rather than a helix, making clean horizontal stripes. The gradient scarf adds three or more colours across a single flat piece using the same alternating-yarn technique worked flat.'
  )
})

fix('k6-scarf-cowl/hooded-cowl.json', d => {
  d.body.content[0].content = t(
    'This is a cowl with an attached hood knitted in two sections on 5 mm needles with aran-weight yarn. The cowl tube finishes at 60 cm circumference and 25 cm tall. The hood is 30 cm, worked flat from the back top edge. The cowl is worked in the round first; stitches are then picked up along the back half of the top edge and worked flat to the crown, where a three-needle bind-off closes the seam.'
  )
})

fix('k6-scarf-cowl/intarsia-stripe-scarf.json', d => {
  // Two em-dashes in bc[20]: "Keep bobbins small — no more than 2 m at a time — to reduce..."
  const bc = d.body.content
  bc[20] = fixDashes(bc[20])
  // Also simplify the sentence by replacing the dashes with commas
  if (bc[20].content?.[0]?.text) {
    bc[20].content[0].text = bc[20].content[0].text.replace(
      'Keep bobbins small - no more than 2 m at a time - to reduce',
      'Keep bobbins small, no more than 2 m at a time, to reduce'
    )
  }
})

fix('k6-scarf-cowl/mosaic-colourwork-scarf.json', d => {
  const bc = d.body.content
  bc[12] = fixDashes(bc[12])
  bc[13] = fixDashes(bc[13])
  bc[14] = fixDashes(bc[14])
})

fix('k6-scarf-cowl/ribbed-cowl.json', d => {
  d.body.content[18].content = t(
    'Stretchy bind-off in rib pattern: work each stitch in pattern and use the K2tog-tbl method, slipping the result back to the left needle before the next repeat. A standard bind-off leaves a narrower top opening than the body. The stretchy bind-off matches the rib elasticity.'
  )
})

fix('k6-scarf-cowl/slip-stitch-checkers-scarf.json', d => {
  // bc[10] is a heading with em-dash: "Body — 4-row repeat"
  const heading = d.body.content[10]
  if (heading?.type === 'heading' && heading.content?.[0]?.text) {
    heading.content[0].text = heading.content[0].text.replace('—', ':').replace('–', ':')
  }
})

fix('k6-scarf-cowl/two-colour-brioche-scarf.json', d => {
  const bc = d.body.content
  bc[1].content = t(
    'Flat construction was chosen because two-colour brioche flat requires joining and dropping each yarn at the end of its row. This is straightforward on straight needles where both yarn ends hang at the same edge. The finished scarf needs about 350 m of each colour (around 120 g each for DK) and wraps around the neck with extra warmth from the two-yarn structure.'
  )
  bc[34].content = t(
    'The brioche cowl applies the same two-colour technique in the round. The yarn management differs but the BrK and BrP operations are the same. The two-colour ribbed cowl is simpler if you want a reversible two-colour fabric without the brioche complexity.'
  )
  // Remove unused 'brioche' glossary term
  d.glossaryTerms = (d.glossaryTerms || []).filter(t => t.slug !== 'brioche')
})

fix('k6-scarf-cowl/two-colour-ribbed-cowl.json', d => {
  const bc = d.body.content
  bc[11] = fixDashes(bc[11])
  bc[12] = fixDashes(bc[12])
  bc[13] = fixDashes(bc[13])
})

fix('k6-scarf-cowl/cable-rib-scarf.json', d => {
  d.body.content[0].content = t(
    'This is a straight scarf knitted flat on 5 mm needles with aran-weight yarn. It finishes at 22 cm wide and 175 cm long. Alternating four-stitch C4F cable panels and 2x2 rib panels repeat across the full width. Three cable panels alternate with three rib panels, so neither face is plain when the scarf is folded.'
  )
})

fix('k6-scarf-cowl/four-stitch-cable-scarf.json', d => {
  d.body.content[31].content = t(
    'The six-stitch cable scarf uses the same construction with a wider rope cross. The cable-and-rib scarf combines a cable panel with flanking rib for a different texture.'
  )
})

console.log('\nDone:', fixed, 'files fixed.')
