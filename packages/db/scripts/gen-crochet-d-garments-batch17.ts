/**
 * Generator: D-Garments Batch 17 -- Children and tweens G161-G170
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch17.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gradeAllSizes } from '../../../apps/web/src/lib/crochet/grading/grader'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-garments')
mkdirSync(OUT, { recursive: true })

function p(...nodes: object[]) { return { type: 'paragraph', content: nodes } }
function t(text: string) { return { type: 'text', text } }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] } }
function gt(termSlug: string, text: string) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text } }
function supplies(heading: string, items: { name: string; qty: string }[]) {
  return { type: 'suppliesCard', attrs: { heading, items } }
}

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

const K = ['K-2', 'K-4', 'K-6', 'K-8', 'K-10', 'K-12', 'K-14'] as const

// G161: kids-hoodie-crochet -- DROP_SHOULDER PULLOVER, dk, 4mm
const g161 = gradeAllSizes([...K], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g161k6 = g161.find(g => g.size === 'K-6')!

// G162: kids-cardigan-crochet -- DROP_SHOULDER CARDIGAN, dk, 4mm
const g162 = gradeAllSizes([...K], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g162k6 = g162.find(g => g.size === 'K-6')!

// G163: kids-dress-crochet -- DROP_SHOULDER DRESS, dk, 4mm
const g163 = gradeAllSizes([...K], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g163k6 = g163.find(g => g.size === 'K-6')!

// G164: kids-dungarees-crochet -- aran, 5mm
const g164 = gradeAllSizes([...K], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g164k6 = g164.find(g => g.size === 'K-6')!

// G165: kids-vest-crochet -- DROP_SHOULDER VEST, dk, 4mm
const g165 = gradeAllSizes([...K], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g165k6 = g165.find(g => g.size === 'K-6')!

// G166: kids-leggings-crochet -- DROP_SHOULDER TUNIC for grading, dk, 4mm
const g166 = gradeAllSizes([...K], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'TUNIC' })
const g166k6 = g166.find(g => g.size === 'K-6')!

// G167: kids-shorts-crochet -- aran, 5mm
const g167 = gradeAllSizes([...K], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g167k6 = g167.find(g => g.size === 'K-6')!

// G168: kids-tunic-crochet -- DROP_SHOULDER TUNIC, dk, 4mm
const g168 = gradeAllSizes([...K], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g168k6 = g168.find(g => g.size === 'K-6')!

// G169: kids-poncho-crochet -- DROP_SHOULDER TUNIC for grading, aran, 5mm
const g169 = gradeAllSizes([...K], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_6', garmentType: 'TUNIC' })
const g169k6 = g169.find(g => g.size === 'K-6')!

const PATTERNS = [
// ---------------------------------------------------------------------------
// G161: kids-hoodie-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-hoodie-crochet',
  title: "Children's crochet hoodie",
  excerpt: "A cosy drop-shoulder hooded pullover in DK yarn for children. Worked flat in two body panels with a separate hood. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g161k6.finishedMeasurements.bust} cm bust. Body length ${g161k6.finishedMeasurements.bodyLength} cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['kids hoodie crochet', 'childrens hooded pullover crochet', 'crochet hoodie for children'],
  glossaryTerms: [
    { slug: 'hood-seam-g161', term: 'Hood seam', definition: 'The back seam that joins the two halves of a flat-worked hood. The hood is worked as a rectangle, folded, and seamed along the top edge to form a rounded shape.' },
    { slug: 'kangaroo-pocket-g161', term: 'Kangaroo pocket', definition: 'A single front pocket worked as a flat dc rectangle and seamed to the lower front panel at both side edges. The open top allows both hands to fit inside.' },
    { slug: 'dc2tog-g161', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to decrease the stitch count when shaping the neckline on the front panel.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Hooded pullovers are a popular childrens crochet garment.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front panels in dc rows. Shape the neckline on the front panel with '), gt('dc2tog-g161', 'dc2tog'), t(' decreases at each side of the neck opening. Work the hood as a flat rectangle, fold and close the '), gt('hood-seam-g161', 'hood seam'), t(', then pick up stitches along the neckline to attach. Add a '), gt('kangaroo-pocket-g161', 'kangaroo pocket'), t(' to the front lower panel.')),
      p(t(`Size K-6: back panel ${g161k6.hemStitches} sts wide, body length ${g161k6.finishedMeasurements.bodyLength} cm. Sleeve ${g161k6.finishedMeasurements.sleeveLength ?? 36} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'DK yarn', qty: `${g161k6.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g161k6.hemStitches + 2}. Work dc for ${g161k6.finishedMeasurements.bodyLength} cm. Shape neck. Fasten off.`)),
      h2('Front panel'),
      p(t(`Chain ${g161k6.hemStitches + 2}. Work dc for ${g161k6.finishedMeasurements.bodyLength} cm. Shape neck with `), gt('dc2tog-g161', 'dc2tog'), t('. Attach '), gt('kangaroo-pocket-g161', 'kangaroo pocket'), t('.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g161k6.sleeveBicepStitches + 2}. Work dc for ${g161k6.finishedMeasurements.sleeveLength ?? 36} cm. Taper by 1 st each side every 6 rows. Fasten off.`)),
      h2('Hood'),
      p(t(`Chain 40 (K-6). Work dc for 28 cm. Fold and close `), gt('hood-seam-g161', 'hood seam'), t('. Pick up sts along neckline and attach.')),
      h2('What to try next'),
      p(t("The children's crochet cardigan uses the same drop-shoulder construction with a front opening.")),
    ],
  },
},
// ---------------------------------------------------------------------------
// G162: kids-cardigan-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-cardigan-crochet',
  title: "Children's crochet cardigan",
  excerpt: "A drop-shoulder button cardigan in DK yarn for children. Two front panels open over a full back panel. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g162k6.finishedMeasurements.bust} cm bust. Body length ${g162k6.finishedMeasurements.bodyLength} cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['kids cardigan crochet', 'childrens button cardigan crochet', 'crochet cardigan for children'],
  glossaryTerms: [
    { slug: 'button-band-g162', term: 'Button band', definition: 'A narrow strip of dc rows worked along each front edge after the main cardigan panels are complete. One band carries the buttons; the other has evenly spaced chain-space buttonholes.' },
    { slug: 'buttonhole-g162', term: 'Buttonhole', definition: 'A small gap in the button band created by replacing one dc with a chain-2 and skipping one stitch. The chain space is the right width for a standard 15 mm button.' },
    { slug: 'dc2tog-g162', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to decrease the stitch count when shaping the neckline on the front panels.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Button cardigans are a perennial children's crochet project.",
  body: {
    type: 'doc', content: [
      p(t('Work a full-width back panel and two half-width front panels in dc rows. Add a '), gt('button-band-g162', 'button band'), t(' along each front edge. Space '), gt('buttonhole-g162', 'buttonholes'), t(' evenly on one band. Join panels at shoulders and side seams. Attach sleeves.')),
      p(t(`Size K-6: back panel ${g162k6.hemStitches} sts wide. Body length ${g162k6.finishedMeasurements.bodyLength} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'DK yarn', qty: `${g162k6.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '15 mm buttons', qty: '5' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g162k6.hemStitches + 2}. Work dc for ${g162k6.finishedMeasurements.bodyLength} cm. Shape neck. Fasten off.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g162k6.hemStitches / 2) + 4}. Work dc for ${g162k6.finishedMeasurements.bodyLength} cm. Shape neck with `), gt('dc2tog-g162', 'dc2tog'), t('. Fasten off.')),
      h2('Button bands'),
      p(t('Work '), gt('button-band-g162', 'button band'), t(' rows along each front edge. Add '), gt('buttonhole-g162', 'buttonholes'), t(' on the right front band.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g162k6.sleeveBicepStitches + 2}. Work dc for ${g162k6.finishedMeasurements.sleeveLength ?? 36} cm. Taper by 1 st each side every 6 rows. Fasten off.`)),
      h2('What to try next'),
      p(t("The children's crochet hoodie uses the same drop-shoulder panels with a hood instead of an open front.")),
    ],
  },
},
// ---------------------------------------------------------------------------
// G163: kids-dress-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-dress-crochet',
  title: "Children's crochet A-line dress",
  excerpt: "A flared A-line dress in DK yarn for children. Worked flat from the hem up with a gentle flare at the skirt. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g163k6.finishedMeasurements.bust} cm chest. Dress length ${g163k6.finishedMeasurements.bodyLength + 16} cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['kids dress crochet', 'childrens a-line dress crochet', 'crochet dress for children'],
  glossaryTerms: [
    { slug: 'a-line-flare-g163', term: 'A-line flare', definition: 'A gradual widening from the waist to the hem giving the skirt an A shape. Achieved by working dc2tog decreases on the way up from hem to waist rather than increases.' },
    { slug: 'bodice-join-g163', term: 'Bodice join', definition: 'The row where the skirt and bodice sections meet. The stitch count is reduced here to match the bodice width. Work dc2tog across to achieve the correct bodice stitch count.' },
    { slug: 'dc2tog-g163', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to taper the skirt flare and to shape the neckline on both back and front panels.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "A-line dresses are a classic children's garment adapted to crochet.",
  body: {
    type: 'doc', content: [
      p(t('Work the skirt section from the hem upward, tapering the '), gt('a-line-flare-g163', 'A-line flare'), t(' with '), gt('dc2tog-g163', 'dc2tog'), t(' decreases every 4 rows. At the '), gt('bodice-join-g163', 'bodice join'), t(' row, reduce the stitch count to match the chest. Work the bodice straight to the shoulder.')),
      p(t(`Size K-6: hem ${g163k6.hemStitches + 24} sts. Bodice ${g163k6.hemStitches} sts. Dress length ${g163k6.finishedMeasurements.bodyLength + 16} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'DK yarn', qty: `${g163k6.yarnRequiredYards + 80} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Skirt panel (back and front)'),
      p(t(`Chain ${g163k6.hemStitches + 26}. Work dc for 16 cm, tapering `), gt('a-line-flare-g163', 'flare'), t('. Work '), gt('bodice-join-g163', 'bodice join'), t('. Continue dc for bodice.')),
      h2('Shoulders and neck'),
      p(t('Shape shoulders with '), gt('dc2tog-g163', 'dc2tog'), t('. Seam back and front at shoulders and sides. Add a dc neck edge.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g163k6.sleeveBicepStitches}. Work dc for 8 cm short sleeve. Fasten off.`)),
      h2('What to try next'),
      p(t("The children's crochet tunic uses the same bodice construction at a longer hem length.")),
    ],
  },
},
// ---------------------------------------------------------------------------
// G164: kids-dungarees-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-dungarees-crochet',
  title: "Children's crochet dungarees",
  excerpt: "Practical dungarees in aran yarn for children with a bib front and adjustable shoulder straps. Worked flat and assembled. Graded K-2 to K-14.",
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g164k6.finishedMeasurements.bust} cm hip. Inseam approx. 30 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['kids dungarees crochet', 'childrens crochet overalls', 'crochet dungarees for children'],
  glossaryTerms: [
    { slug: 'bib-front-g164', term: 'Bib front', definition: 'A rectangular dc panel worked separately and seamed to the front waistband. It reaches from the waistband to the chest and has a border of dc edging all around.' },
    { slug: 'adjustable-strap-g164', term: 'Adjustable strap', definition: 'A long dc strip with a row of buttonholes at one end. The strap threads through a ring on the back waistband and buttons to the bib front at the desired length.' },
    { slug: 'dc2tog-g164', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the crotch join to shape the curve where the two leg tubes meet the body.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Children's dungarees are a practical garment well suited to aran yarn construction.",
  body: {
    type: 'doc', content: [
      p(t('Work two leg tubes in dc from the ankle up to the crotch. Join at the crotch with '), gt('dc2tog-g164', 'dc2tog'), t(' shaping. Continue as a body panel to the waistband. Work the '), gt('bib-front-g164', 'bib front'), t(' separately and seam to the front waistband. Make '), gt('adjustable-strap-g164', 'adjustable straps'), t(' from long dc strips with buttonhole ends.')),
      p(t(`Size K-6: each leg ${g164k6.hemStitches / 2} sts around, 30 cm inseam. Hip ${g164k6.finishedMeasurements.bust} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'Aran yarn', qty: `${g164k6.yarnRequiredYards + 100} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '20 mm buttons', qty: '4' },
      ]),
      h2('Legs (make 2)'),
      p(t('Work each leg as a dc tube from ankle up. Shape inner thigh with increases near the top. Work 30 cm inseam.')),
      h2('Body'),
      p(t('Join legs at crotch using '), gt('dc2tog-g164', 'dc2tog'), t('. Work combined body for 18 cm to waistband.')),
      h2('Bib and straps'),
      p(t('Work the '), gt('bib-front-g164', 'bib front'), t(' rectangle and seam to front waist. Make '), gt('adjustable-strap-g164', 'adjustable straps'), t(' and attach.')),
      h2('What to try next'),
      p(t("The children's crochet shorts use a simpler waistband-down construction.")),
    ],
  },
},
// ---------------------------------------------------------------------------
// G165: kids-vest-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-vest-crochet',
  title: "Children's crochet ribbed vest",
  excerpt: "A sleeveless ribbed vest in DK yarn for children. Worked in columns of fpdc and bpdc for a stretchy texture. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 sts x 20 rows = 10 x 10 cm in rib on a 4 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g165k6.finishedMeasurements.bust} cm chest. Body length ${g165k6.finishedMeasurements.bodyLength} cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['kids vest crochet', 'childrens ribbed vest crochet', 'crochet vest for children'],
  glossaryTerms: [
    { slug: 'rib-texture-g165', term: 'Rib texture', definition: 'Alternating fpdc and bpdc columns that create raised vertical ridges. The rib stretches sideways to fit a range of chest sizes and snaps back to shape after washing.' },
    { slug: 'armhole-edge-g165', term: 'Armhole edge', definition: 'A single round of dc worked around each armhole opening after the shoulder seams are joined. The edging keeps the armhole tidy and prevents it stretching out of shape.' },
    { slug: 'dc2tog-g165', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at each side of the armhole to reduce the stitch count from the body width to the shoulder width.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Ribbed vests are a quick children's garment project in DK yarn.",
  body: {
    type: 'doc', content: [
      p(t('Work back and front panels using '), gt('rib-texture-g165', 'rib texture'), t(' (alternating fpdc and bpdc). Shape armholes with '), gt('dc2tog-g165', 'dc2tog'), t(' at each side. After seaming, add the '), gt('armhole-edge-g165', 'armhole edge'), t(' around each opening.')),
      p(t(`Size K-6: ${g165k6.hemStitches} sts per panel. Body length ${g165k6.finishedMeasurements.bodyLength} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'DK yarn', qty: `${g165k6.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front panels'),
      p(t(`Chain ${g165k6.hemStitches + 2}. Work in `), gt('rib-texture-g165', 'fpdc/bpdc rib'), t(` for ${g165k6.finishedMeasurements.bodyLength} cm. Shape armholes with `), gt('dc2tog-g165', 'dc2tog'), t(' each side. Shape neck. Fasten off.')),
      h2('Finishing'),
      p(t('Seam at shoulders and sides. Work '), gt('armhole-edge-g165', 'armhole edge'), t(' around each armhole. Add dc neck edging.')),
      h2('What to try next'),
      p(t("The children's crochet hoodie builds on the same body construction with sleeves and a hood.")),
    ],
  },
},
// ---------------------------------------------------------------------------
// G166: kids-leggings-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-leggings-crochet',
  title: "Children's crochet leggings",
  excerpt: "Stretchy crochet leggings in DK yarn for children. Worked in rounds from the waist down in fpdc and bpdc rib. Graded K-2 to K-14.",
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 sts x 20 rows = 10 x 10 cm in rib on a 4 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g166k6.finishedMeasurements.bust} cm waist (unstretched). Inseam approx. 35 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['kids leggings crochet', 'childrens crochet leggings', 'crochet leggings for children'],
  glossaryTerms: [
    { slug: 'rib-round-g166', term: 'Rib in the round', definition: 'Working fpdc and bpdc alternately around a joined circle of stitches. Each stitch worked on the right side becomes the paired stitch on the next round, keeping the rib columns continuous.' },
    { slug: 'crotch-split-g166', term: 'Crotch split', definition: 'The point where the single body tube is divided into two leg tubes. Chain a small bridge across the gap at the back crotch, then work each leg in rounds from there down to the ankle.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Crochet leggings in rib are a popular children's garment project.",
  body: {
    type: 'doc', content: [
      p(t('Work the waistband and body as a single tube in '), gt('rib-round-g166', 'rib in the round'), t(' from the waist down to the crotch. At the '), gt('crotch-split-g166', 'crotch split'), t(', divide into two separate leg tubes and continue in rib to the ankle. Thread elastic through the waistband casing.')),
      p(t(`Size K-6: waist tube ${g166k6.hemStitches} sts around. Each leg approx. 35 cm inseam.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'DK yarn', qty: `${g166k6.yarnRequiredYards + 100} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2 cm wide', qty: 'waist + 5 cm' },
      ]),
      h2('Waistband and body tube'),
      p(t(`Chain ${g166k6.hemStitches + 2}. Join into ring. Work `), gt('rib-round-g166', 'rib in the round'), t(' for 22 cm to crotch.')),
      h2('Legs (make 2)'),
      p(t('At the '), gt('crotch-split-g166', 'crotch split'), t(', work each leg tube in rib for 35 cm to ankle. Fasten off.')),
      h2('What to try next'),
      p(t("The children's crochet shorts use a shorter leg and a flat-panel waistband.")),
    ],
  },
},
// ---------------------------------------------------------------------------
// G167: kids-shorts-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-shorts-crochet',
  title: "Children's crochet shorts",
  excerpt: "Easy crochet shorts in aran yarn for children with an elasticated waist. Worked as two flat panels and assembled. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g167k6.finishedMeasurements.bust} cm hip. Inseam 12 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['kids shorts crochet', 'childrens crochet shorts', 'crochet shorts for children'],
  glossaryTerms: [
    { slug: 'elastic-casing-g167', term: 'Elastic casing', definition: 'A folded-over waistband sewn down along the lower edge to form a tube. Elastic is cut to the childs waist measurement and fed through the tube before the ends are joined.' },
    { slug: 'inner-seam-g167', term: 'Inner leg seam', definition: 'The seam running up the inside of each leg panel from the hem to the crotch. Sewn with a tapestry needle and matching yarn using mattress stitch.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Children's crochet shorts are a quick and practical warm-weather project.",
  body: {
    type: 'doc', content: [
      p(t('Work two leg panels as flat dc rectangles. Sew each '), gt('inner-seam-g167', 'inner leg seam'), t(' to form tubes. Join at the crotch. Fold the top edge and sew to create an '), gt('elastic-casing-g167', 'elastic casing'), t('. Thread elastic to the correct waist size.')),
      p(t(`Size K-6: each leg panel ${g167k6.hemStitches / 2} sts wide, 28 cm tall (rise + inseam). Hip ${g167k6.finishedMeasurements.bust} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'Aran yarn', qty: `${g167k6.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2 cm wide', qty: 'waist + 5 cm' },
      ]),
      h2('Leg panels (make 2)'),
      p(t(`Chain ${g167k6.hemStitches / 2 + 2}. Work dc for 28 cm. Sew `), gt('inner-seam-g167', 'inner leg seam'), t('. Join at crotch.')),
      h2('Waistband'),
      p(t('Fold top 3 cm over. Sew '), gt('elastic-casing-g167', 'elastic casing'), t('. Thread elastic to waist measurement and join ends.')),
      h2('What to try next'),
      p(t("The children's crochet leggings use the same waistband construction at full ankle length in rib.")),
    ],
  },
},
// ---------------------------------------------------------------------------
// G168: kids-tunic-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-tunic-crochet',
  title: "Children's crochet tunic",
  excerpt: "A long hip-length tunic in DK yarn for children. Drop-shoulder construction worked flat with a round neck. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g168k6.finishedMeasurements.bust} cm chest. Length ${g168k6.finishedMeasurements.bodyLength + 8} cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['kids tunic crochet', 'childrens crochet tunic top', 'crochet long top for children'],
  glossaryTerms: [
    { slug: 'hip-length-g168', term: 'Hip length', definition: 'A garment that ends at or just below the hip bone. For children, this is approximately 8 cm longer than a standard body-length measurement and gives coverage over leggings.' },
    { slug: 'neck-edging-g168', term: 'Neck edging', definition: 'A single round of dc worked around the neck opening after the shoulder seams are joined. The edging firms up the neck shape and finishes the raw stitch edge neatly.' },
    { slug: 'dc2tog-g168', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the round neckline on both back and front panels.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Long tunic tops are a versatile children's garment worn over leggings.",
  body: {
    type: 'doc', content: [
      p(t('Work back and front panels in dc rows to '), gt('hip-length-g168', 'hip length'), t('. Shape the neckline on both panels with '), gt('dc2tog-g168', 'dc2tog'), t(' decreases at each neck edge. After seaming, work '), gt('neck-edging-g168', 'neck edging'), t(' around the opening. Attach drop-shoulder sleeves.')),
      p(t(`Size K-6: each panel ${g168k6.hemStitches} sts wide. Length ${g168k6.finishedMeasurements.bodyLength + 8} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'DK yarn', qty: `${g168k6.yarnRequiredYards + 60} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front panels'),
      p(t(`Chain ${g168k6.hemStitches + 2}. Work dc for ${g168k6.finishedMeasurements.bodyLength + 8} cm. Shape neck with `), gt('dc2tog-g168', 'dc2tog'), t('. Fasten off.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g168k6.sleeveBicepStitches + 2}. Work dc for ${g168k6.finishedMeasurements.sleeveLength ?? 36} cm. Taper by 1 st each side every 6 rows. Fasten off.`)),
      h2('Finishing'),
      p(t('Seam at shoulders, set in sleeves, sew side seams. Work '), gt('neck-edging-g168', 'neck edging'), t(' and a single dc hem edging. Weave in ends.')),
      h2('What to try next'),
      p(t("The children's crochet hoodie builds on the same drop-shoulder construction with a hood.")),
    ],
  },
},
// ---------------------------------------------------------------------------
// G169: kids-poncho-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-poncho-crochet',
  title: "Children's crochet poncho",
  excerpt: "A simple two-panel poncho in aran yarn for children. Two rectangles joined at the shoulder seam and one side seam. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: each panel ${g169k6.finishedMeasurements.bust} cm wide. Length 38 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['kids poncho crochet', 'childrens crochet poncho', 'crochet poncho for children'],
  glossaryTerms: [
    { slug: 'two-panel-poncho-g169', term: 'Two-panel poncho', definition: 'A poncho made from exactly two rectangular dc panels. One panel lies front-to-back over the left shoulder; the other lies front-to-back over the right shoulder. Joining them at the shoulders and one side creates the neck opening.' },
    { slug: 'fringe-g169', term: 'Fringe', definition: 'Short lengths of yarn folded in half and looped through the hem edge using a crochet hook. Each fringe is trimmed to the same length after all loops are attached.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Two-panel ponchos are one of the simplest wearable crochet projects for children.",
  body: {
    type: 'doc', content: [
      p(t('Work two identical dc rectangles. Place them together to form a '), gt('two-panel-poncho-g169', 'two-panel poncho'), t(': seam at the right shoulder and one side. Leave the left shoulder and opposite side open as armholes. Trim the hem with '), gt('fringe-g169', 'fringe'), t(' if desired.')),
      p(t(`Size K-6: each panel ${g169k6.hemStitches} sts wide x 38 cm long.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'Aran yarn', qty: `${g169k6.yarnRequiredYards + 40} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Panels (make 2)'),
      p(t(`Chain ${g169k6.hemStitches + 2}. Work dc for 38 cm. Fasten off.`)),
      h2('Assembly'),
      p(t('Lay panels as a '), gt('two-panel-poncho-g169', 'two-panel poncho'), t('. Seam right shoulder and one side. Neck opening is approx. 24 cm across.')),
      h2('Fringe (optional)'),
      p(t('Add '), gt('fringe-g169', 'fringe'), t(' along the hem edge using 20 cm lengths of yarn.')),
      h2('What to try next'),
      p(t("The children's crochet hoodie is the next step for a shaped garment in aran yarn.")),
    ],
  },
},
// ---------------------------------------------------------------------------
// G170: kids-beanie-hat-crochet
// ---------------------------------------------------------------------------
{
  slug: 'kids-beanie-hat-crochet',
  title: "Children's crochet beanie hat",
  excerpt: "A warm beanie worked top-down in rounds in chunky yarn for children. Simple decreases at the crown. Available in three age ranges: 1-3y, 3-6y, and 6-12y.",
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '10 dc x 12 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: 'Three sizes: 1-3y (44 cm), 3-6y (48 cm), 6-12y (52 cm) head circumference.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['kids beanie crochet', 'childrens crochet hat', 'crochet beanie for children'],
  glossaryTerms: [
    { slug: 'magic-ring-g170', term: 'Magic ring', definition: 'An adjustable starting loop used to begin top-down rounds. Work the first round of stitches into the ring, then pull the tail to close the centre before joining.' },
    { slug: 'crown-decrease-g170', term: 'Crown decrease', definition: 'A series of dc2tog rounds worked at the start of the hat, reducing the stitch count from the initial magic-ring round outward until the hat diameter matches the head circumference.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Top-down beanies are one of the most beginner-friendly crochet projects in chunky yarn.",
  body: {
    type: 'doc', content: [
      p(t('Start with a '), gt('magic-ring-g170', 'magic ring'), t('. Work '), gt('crown-decrease-g170', 'crown decrease'), t(' rounds, increasing by 6 dc each round until the flat disc matches the hat diameter. Continue straight in dc rounds for the body depth. Fasten off and weave in ends.')),
      p(t('Sizes: 1-3y, 3-6y, 6-12y. Starting rounds: 6 dc in magic ring for all sizes. Crown rounds: 6 (1-3y), 7 (3-6y), 8 (6-12y). Body depth: 12 cm, 14 cm, 15 cm.')),
      h2('What you need'),
      supplies('Materials (size 3-6y)', [
        { name: 'Chunky yarn', qty: '60 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Crown'),
      p(t('Start with '), gt('magic-ring-g170', 'magic ring'), t('. Round 1: 6 dc into ring. Each subsequent crown round adds 6 dc. Work until disc measures the flat crown diameter for your size (14 / 15 / 17 cm).')),
      h2('Body'),
      p(t('Work dc in round without increasing until hat depth from crown matches: 1-3y = 12 cm, 3-6y = 14 cm, 6-12y = 15 cm. Fasten off.')),
      h2('What to try next'),
      p(t("The children's crochet hoodie uses the same chunky gauge yarn in a full pullover construction.")),
    ],
  },
},
]

for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: '',
    excerpt: pat.excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    difficulty: pat.difficulty,
    sourceType: pat.sourceType,
    sourceNotes: pat.sourceNotes,
    techniqueSlugs: pat.techniqueSlugs,
    criticalTechniques: pat.criticalTechniques,
    aliases: pat.aliases,
    glossaryTerms: pat.glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: pat.yarnWeight,
      primaryHookSlug: pat.hook,
      gaugeText: pat.gauge,
      finishedSizeText: pat.finishedSize,
      terminologyConvention: 'uk',
      craftStitchSlugs: pat.stitchSlugs,
      craftTechniqueTags: pat.techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: pat.body,
  }
  writeFileSync(join(OUT, `${pat.slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${pat.slug}`)
}
console.log(`\nDone: ${PATTERNS.length} patterns`)
