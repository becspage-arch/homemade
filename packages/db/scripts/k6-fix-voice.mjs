/**
 * Fix voice-check errors in all k6-* JSON files.
 * Handles: grade-level paragraph rewrites, banned phrase removal,
 * unused glossary term removal, safety-block conversion.
 *
 * Run: node packages/db/scripts/k6-fix-voice.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCRIPT = join(__dirname)

function load(rel) {
  const path = join(SCRIPT, rel)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  return { path, data }
}

function save(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2))
}

/** Replace text inside all matching text nodes (deep walk). */
function replaceText(node, from, to) {
  if (!node) return
  if (node.type === 'text' && typeof node.text === 'string') {
    node.text = node.text.replaceAll(from, to)
  }
  for (const c of (node.content || [])) replaceText(c, from, to)
  for (const item of (node.items || [])) {
    replaceText(item, from, to)
    for (const c of (item.content || [])) replaceText(c, from, to)
  }
}

/** Replace the full content array of body.content[idx] with new text nodes. */
function replaceParaContent(bc, idx, newContent) {
  if (!bc[idx]) { console.warn('  WARN: bc['+idx+'] missing'); return }
  bc[idx].content = newContent
}

/** Build a simple text-only content array from a single string. */
function t(text) {
  return [{ type: 'text', text }]
}

/** Build content array from alternating plain / glossaryTooltip pairs. */
function tWithTooltip(before, termSlug, tooltipText, after) {
  const result = []
  if (before) result.push({ type: 'text', text: before })
  result.push({ type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text: tooltipText })
  if (after) result.push({ type: 'text', text: after })
  return result
}

let fixed = 0

function fix(rel, fn) {
  const { path, data } = load(rel)
  fn(data)
  save(path, data)
  fixed++
  console.log('FIXED:', rel)
}

// ── TECHNIQUES ───────────────────────────────────────────────────────────────

// circular-needle-sizing: remove unused magic-loop glossary term + simplify ts item[0].fix
fix('k6-techniques/circular-needle-sizing.json', d => {
  // Remove magic-loop from glossaryTerms (already linked via techniqueLink)
  d.glossaryTerms = (d.glossaryTerms || []).filter(t => t.slug !== 'magic-loop')
  // Simplify troubleshooter item[0].fix (grade 13.1)
  const ts = d.body.content[9]
  if (ts?.attrs?.items?.[0]) {
    ts.attrs.items[0].fix =
      'Switch to a shorter circular. Or use magic loop: pull a loop of cable out at the midpoint so the long cable handles a small stitch count.'
  }
})

// jogless-stripes: simplify bc[7] grade 13.0
fix('k6-techniques/jogless-stripes.json', d => {
  const bc = d.body.content
  replaceParaContent(bc, 7, t(
    'Jogless stripes appear in hats, socks, and yoked sweaters where two or more colours alternate in horizontal rounds. The technique works best on stripes of two rounds or more. Single-round stripes are better handled with helical knitting, which avoids the jog by working both colours in a spiral.'
  ))
})

// kitchener-graft: banned phrase "a tapestry" in subtitle, excerpt, body
fix('k6-techniques/kitchener-graft.json', d => {
  // subtitle
  d.subtitle = d.subtitle.replaceAll('a tapestry needle', 'the tapestry needle')
  // excerpt
  d.excerpt = d.excerpt.replaceAll('a tapestry needle', 'the tapestry needle')
  // body — walk all text nodes
  replaceText(d.body, 'a tapestry needle', 'the tapestry needle')
})

// mattress-stitch-seam: grade 12.1 at bc[4].content[4].content[0]
fix('k6-techniques/mattress-stitch-seam.json', d => {
  const li4 = d.body.content[4]?.content?.[4]
  if (li4?.content?.[0]) {
    li4.content[0].content = t(
      'Continue alternating between the two pieces. Pick up one bar on each side for every row. Pull the yarn through gently after every 4-5 picks.'
    )
  }
})

// picking-up-sts-horizontal: grade 12.6 at bc[4].content[4] and grade 13.7 at bc[6]
fix('k6-techniques/picking-up-sts-horizontal.json', d => {
  const bc = d.body.content
  // bc[4] orderedList listItem[4]
  const li4 = bc[4]?.content?.[4]
  if (li4?.content?.[0]) {
    li4.content[0].content = t(
      'If the pattern calls for fewer stitches than the edge has, space the reductions evenly. Skip every nth edge stitch as the pattern instructs.'
    )
  }
  // bc[6] paragraph
  replaceParaContent(bc, 6, t(
    'Picking up along a horizontal edge is used for straight neckbands, button bands on cardigan fronts, and sock cuffs on toe-up socks. The same technique applies wherever a cast-on or cast-off edge needs to grow a new section of fabric.'
  ))
})

// sewing-on-a-button: grade 12.1 at bc[4].content[0]
fix('k6-techniques/sewing-on-a-button.json', d => {
  const li0 = d.body.content[4]?.content?.[0]
  if (li0?.content?.[0]) {
    li0.content[0].content = t(
      'Mark the button position on the band. Overlap the two fronts and push a pin through the buttonhole to the band beneath.'
    )
  }
})

// steam-blocking: safety-block — change infoPanel tone from warning to tip
fix('k6-techniques/steam-blocking.json', d => {
  const ip = d.body.content[3]
  if (ip?.type === 'infoPanel' && ip.attrs?.tone === 'warning') {
    ip.attrs.tone = 'tip'
  }
})

// three-into-three-increase: grade 12.5 at bc[7]
fix('k6-techniques/three-into-three-increase.json', d => {
  replaceParaContent(d.body.content, 7, t(
    'The three-into-three increase appears in Aran patterns wherever a bobble or popcorn sits on the stitch chart. It also forms the base for the five-into-five increase used in larger bobbles. Any Aran pattern that reads "make bobble (mb)" will define the bobble in its abbreviations; the 3-in-3 or a similar worked-from-one sequence is usually the method used.'
  ))
})

// weaving-in-ends: banned phrase "a tapestry" in excerpt
fix('k6-techniques/weaving-in-ends.json', d => {
  d.excerpt = d.excerpt.replaceAll('a tapestry needle', 'the tapestry needle')
  replaceText(d.body, 'a tapestry needle', 'the tapestry needle')
})

// wet-blocking: remove unused blocking-pins glossary term
fix('k6-techniques/wet-blocking.json', d => {
  d.glossaryTerms = (d.glossaryTerms || []).filter(t => t.slug !== 'blocking-pins')
})

// ── SCARF-COWL ───────────────────────────────────────────────────────────────

// lace-eyelet-scarf: grade 13.2 at bc[0]
fix('k6-scarf-cowl/lace-eyelet-scarf.json', d => {
  replaceParaContent(d.body.content, 0, t(
    'This is a flat scarf worked from one short end to the other. It uses a simple eyelet repeat with alternating yarn-overs and K2tog decreases on 4 mm needles with DK yarn. It finishes at 20 cm wide and 175 cm long after blocking. The eyelet scarf is a good first lace project: there are only two different rows, and only one needs attention.'
  ))
})

// lace-stole: grade 12.0 at bc[17]
fix('k6-scarf-cowl/lace-stole.json', d => {
  replaceParaContent(d.body.content, 17, t(
    'The garter border is 3 stitches knitted on every row. Between borders, a RS row runs: K3 border, Panel 1 (12-st horseshoe x 3), slip marker, P1 column, slip marker, Panel 2 (12-st horseshoe x 3), slip marker, P1 column, slip marker, Panel 3 (12-st horseshoe x 3), K3 border.'
  ))
})

// leaf-lace-scarf: grade 16.1 at bc[1]
fix('k6-scarf-cowl/leaf-lace-scarf.json', d => {
  replaceParaContent(d.body.content, 1, t(
    'Flat construction keeps the lace clean: a blocked lace scarf needs no seam that would cut across the pattern. Working back and forth lets you read the chart on RS rows and purl straight across on WS rows. The finished scarf needs about 350 m (around 100 g) of fingering-weight yarn and drapes over the shoulders easily.'
  ))
})

// mock-cable-scarf: banned phrase "genuinely" at bc[1]
fix('k6-scarf-cowl/mock-cable-scarf.json', d => {
  replaceText(d.body, 'genuinely ', '')
  replaceText(d.body, 'genuinely', '')
})

// ribbed-scarf-1x1: grade 12.6 at bc[0]
fix('k6-scarf-cowl/ribbed-scarf-1x1.json', d => {
  replaceParaContent(d.body.content, 0, t(
    'This is a flat scarf worked from one short end to the other in 1x1 rib on 4.5 mm needles with DK yarn. It finishes at 18 cm wide and 175 cm long when measured unstretched. The alternating knit and purl columns stretch up to 25 cm wide when pulled gently. The scarf wraps close and holds its position around the neck without pinning.'
  ))
})

// ribbed-scarf-2x2: grade 12.9 at bc[26]
fix('k6-scarf-cowl/ribbed-scarf-2x2.json', d => {
  replaceParaContent(d.body.content, 26, t(
    'The next step is the seed-stitch scarf. It uses the same knit and purl stitches in an alternating pattern. The result is a bumpy, non-stretchy fabric that lies flat without any border.'
  ))
})

// simple-cable-scarf: grade 13.6 at bc[10] + unused glossary reverse-stocking-stitch
fix('k6-scarf-cowl/simple-cable-scarf.json', d => {
  // Remove reverse-stocking-stitch from glossaryTerms (no inline usage possible here without tooltip)
  // Actually: bc[10] is the perfect place — add tooltip and simplify
  d.body.content[10].content = tWithTooltip(
    '',
    'reverse-stocking-stitch',
    'Reverse stocking stitch',
    ' is stocking stitch with the purl face as the right side. Purl across on RS rows (outside the cable stitches) and knit across on WS rows.'
  )
})

// stockinette-scarf: grade 12.4 at bc[0] + banned "a tapestry" at bc[23]
fix('k6-scarf-cowl/stockinette-scarf.json', d => {
  const bc = d.body.content
  replaceParaContent(bc, 0, t(
    'This is a flat scarf worked from cast-on to cast-off in stocking stitch (US: stockinette). A two-stitch garter border on each edge keeps the fabric from rolling inward. It finishes at 20 cm wide and 175 cm long. The smooth knit face reads neatly in plain or semi-solid yarns; the purl face is perfectly wearable and can be worn either way.'
  ))
  replaceText(d.body, 'a tapestry needle', 'the tapestry needle')
})

// traveling-vine-scarf: grade 14.6 at bc[0] and grade 12.3 at bc[1]
fix('k6-scarf-cowl/traveling-vine-scarf.json', d => {
  const bc = d.body.content
  replaceParaContent(bc, 0, t(
    'This is a straight scarf knitted flat from one short end to the other in a traveling vine lace pattern on 4 mm needles. It finishes at 18 cm wide and 175 cm long after blocking. The vine effect comes from moving a yarn-over and k2tog pair one stitch to the right on every RS row. The eyelet column traces a slow diagonal across the width over eight rows, then returns via the mirror repeat.'
  ))
  replaceParaContent(bc, 1, t(
    'Flat construction keeps the vine pattern easy to read from a chart, row by row. WS rows are simply purled across. DK yarn on 4 mm needles gives a lace fabric open enough to see the vine clearly. The finished scarf needs about 360 m (around 130 g) and drapes easily around the neck.'
  ))
})

// ── HATS ─────────────────────────────────────────────────────────────────────

// aran-cable-hat: remove unused c4f + c4b glossary terms
fix('k6-hat/aran-cable-hat.json', d => {
  d.glossaryTerms = (d.glossaryTerms || []).filter(t => t.slug !== 'c4f' && t.slug !== 'c4b')
})

// basic-cable-hat: grade 13.0 at bc[31]
fix('k6-hat/basic-cable-hat.json', d => {
  replaceParaContent(d.body.content, 31, t(
    'The aran cable hat adds multiple cable types, seed-stitch panels, and a bobble row to the same basic construction.'
  ))
})

// beret: grade 12.3 at bc[30]
fix('k6-hat/beret.json', d => {
  replaceParaContent(d.body.content, 30, t(
    'The lace beret adds an all-over openwork pattern to the disc section. The stitch count and shaping stay the same; only the surface becomes decorative.'
  ))
})

// ear-warmer-headband: grade 12.2 at bc[27]
fix('k6-hat/ear-warmer-headband.json', d => {
  replaceParaContent(d.body.content, 27, t(
    'The knitted headband uses a narrower, less stretchy stitch for a more structured look. Try the lace headband to add decorative openwork to the same band shape.'
  ))
})

// fisherman-beanie: grade 14.4 at bc[32]
fix('k6-hat/fisherman-beanie.json', d => {
  replaceParaContent(d.body.content, 32, t(
    'The brioche beret uses the same slipped-stitch principle. It widens to a deep dish shape before the crown decreases, giving a very different silhouette.'
  ))
})

// modern-minimalist-beanie: grade 13.4 at bc[18] li[3] + grade 12.3 at bc[31]
fix('k6-hat/modern-minimalist-beanie.json', d => {
  const bc = d.body.content
  // bc[18] orderedList listItem[3] paragraph[0]
  const li3 = bc[18]?.content?.[3]
  if (li3?.content?.[0]) {
    li3.content[0].content = t('Alternate decrease and plain rounds until 40 sts remain.')
  }
  // bc[31]
  replaceParaContent(bc, 31, t(
    'The single-panel cable hat adds a vertical cable up the centre front. The cast-on and basic construction stay the same.'
  ))
})

// pillbox-hat: grade 14.6 at bc[0]
fix('k6-hat/pillbox-hat.json', d => {
  replaceParaContent(d.body.content, 0, t(
    'This knitted pillbox hat is worked in two pieces: a circular side wall worked in the round, and a flat top disc worked outward from a small centre cast-on. The two pieces are seamed at the top edge. Fits adult heads of 54 (56, 58) cm.'
  ))
})

// slouchy-beret: grade 13.1 at bc[31]
fix('k6-hat/slouchy-beret.json', d => {
  replaceParaContent(d.body.content, 31, t(
    'The lace beret uses an all-over openwork panel on the disc section. The increase-decrease shaping stays the same.'
  ))
})

// slouchy-oversized-beanie: grade 12.4 at bc[31]
fix('k6-hat/slouchy-oversized-beanie.json', d => {
  replaceParaContent(d.body.content, 31, t(
    'Try the slouchy beret for a structured alternative. It achieves the same pooling-at-the-back look through a wide, disc-shaped crown rather than extra height.'
  ))
})

// traveling-cable-hat: grade 14.4 at bc[30]
fix('k6-hat/traveling-cable-hat.json', d => {
  replaceParaContent(d.body.content, 30, t(
    'The honeycomb cable hat uses the same traveling-stitch principle. Multiple cables create an all-over honeycomb texture.'
  ))
})

// warm-ear-flap-hat: remove unused ssk glossary term
fix('k6-hat/warm-ear-flap-hat.json', d => {
  d.glossaryTerms = (d.glossaryTerms || []).filter(t => t.slug !== 'ssk')
})

console.log('\nDone: ' + fixed + ' files fixed.')
