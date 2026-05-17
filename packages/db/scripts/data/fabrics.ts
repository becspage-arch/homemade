/**
 * Master fabric list — single source of truth for `Fabric`.
 *
 * Seeded via `packages/db/scripts/seed-fabrics.ts` (idempotent upsert).
 * Starter set of ~30 entries covering the fabrics referenced across the
 * PATTERN + TECHNIQUE backlog. UK terminology where the UK + US terms
 * differ (calico in the UK = muslin in the US; muslin in the UK = the
 * light open-weave cheesecloth used for steaming and herbal infusion).
 *
 * Notes:
 * - `gsm` is set only where the manufacturer-standard is well-known.
 *   Calico, denim, drill, terry, batting, blackout all have stable
 *   weight expectations; bias-binding-grade cotton, lining, and the
 *   speciality items don't.
 * - `category` is the high-level browse bucket. The Sewing browse view
 *   filters on the combination of `weightCategory` + `category` +
 *   `fibreContent`.
 * - `suitableFor` is the lever for the "what could I make from this
 *   fabric?" surface and the "what fabric should I buy for this
 *   project?" sidebar on PATTERN pages. Authors widen the tags from
 *   the documented vocabulary; the seed script validates at load time.
 */

import type { FabricSeed } from './types.js'

export const FABRICS: FabricSeed[] = [
  // ───────────────────────────────────────────────────────────────────────
  // Light wovens — cotton + linen + silk + specialty. The workhorse set
  // for shirting, light dresses, scarves, napkins, and most apron bibs.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'cotton-lawn',
    name: 'Cotton lawn',
    weightCategory: 'light',
    fibreContent: ['cotton'],
    drape: 'flowing',
    gsm: 75,
    suitableFor: ['clothing-light', 'baby-light', 'tea-towel', 'napkin'],
    category: 'woven-natural',
    notes:
      'Fine, closely woven cotton — the British dressmaking lawn (Liberty lawn is the canonical example). Light enough to gather, crisp enough to hold a turned hem.',
  },
  {
    slug: 'cotton-poplin',
    name: 'Cotton poplin',
    weightCategory: 'light',
    fibreContent: ['cotton'],
    drape: 'crisp',
    gsm: 110,
    suitableFor: [
      'clothing-light',
      'apron',
      'tea-towel',
      'napkin',
      'pillowcase',
    ],
    category: 'woven-natural',
    notes:
      'Plain weave with a slight crosswise rib. Iron-and-go finish. The standard cotton for shirting and the bib of a half apron.',
  },
  {
    slug: 'quilting-cotton',
    name: 'Quilting cotton',
    weightCategory: 'light',
    fibreContent: ['cotton'],
    drape: 'crisp',
    gsm: 115,
    suitableFor: [
      'quilt-top',
      'quilt-back',
      'bag',
      'cushion',
      'soft-toy',
      'apron',
      'pot-holder',
      'reusable-kitchen',
    ],
    category: 'woven-natural',
    notes:
      'Tightly woven 110–115 gsm cotton, dyed and printed for patchwork. The default fabric for beginners — handles, washes, presses, and forgives. Not the same hand as cotton lawn (which drapes much more).',
  },
  {
    slug: 'calico',
    name: 'Calico (UK)',
    weightCategory: 'medium',
    fibreContent: ['cotton'],
    drape: 'structured',
    gsm: 160,
    suitableFor: [
      'bag',
      'apron',
      'oven-mitt',
      'pot-holder',
      'soft-toy',
      'mending-patch',
    ],
    category: 'woven-natural',
    notes:
      'Unbleached plain cotton, the cheap-and-cheerful UK utility cloth. Stiffens until first wash; wash and iron before cutting to prevent later shrinkage. Distinct from US "muslin" (also calico in the UK).',
  },
  {
    slug: 'cotton-muslin-uk',
    name: 'Cotton muslin (UK)',
    weightCategory: 'light',
    fibreContent: ['cotton'],
    drape: 'flowing',
    gsm: 55,
    suitableFor: ['baby-light', 'reusable-kitchen'],
    category: 'woven-natural',
    notes:
      'Open-weave loose cotton — the cloth used for cheese-making, herbal infusion, and baby swaddles. Distinct from US "muslin" (which is the UK calico).',
  },
  {
    slug: 'linen-light',
    name: 'Light linen',
    weightCategory: 'light',
    fibreContent: ['linen'],
    drape: 'flowing',
    gsm: 130,
    suitableFor: ['clothing-light', 'tea-towel', 'napkin', 'apron'],
    category: 'woven-natural',
    notes:
      'Loose-weave handkerchief-weight linen. Creases freely; that is the look. Pre-wash hot to release the maximum shrinkage before cutting.',
  },
  {
    slug: 'linen-medium',
    name: 'Medium linen',
    weightCategory: 'medium',
    fibreContent: ['linen'],
    drape: 'structured',
    gsm: 200,
    suitableFor: [
      'apron',
      'tea-towel',
      'curtain-light',
      'cushion',
      'clothing-medium',
      'tablecloth',
    ],
    category: 'woven-natural',
    notes:
      'The dressmaking + soft-furnishing workhorse linen. Holds a hem, presses with steam, gets softer with every wash.',
  },
  {
    slug: 'linen-heavy',
    name: 'Heavy linen',
    weightCategory: 'heavy',
    fibreContent: ['linen'],
    drape: 'structured',
    gsm: 320,
    suitableFor: ['curtain-lined', 'cushion', 'upholstery', 'bag'],
    category: 'woven-natural',
    notes:
      'Furnishing-weight linen. Holds shape for unlined curtains, tote bags, and heavy cushion covers.',
  },
  {
    slug: 'silk-habotai',
    name: 'Silk habotai',
    weightCategory: 'light',
    fibreContent: ['silk'],
    drape: 'flowing',
    suitableFor: ['clothing-light', 'eye-mask', 'lining'],
    category: 'woven-natural',
    notes:
      'Light plain-weave silk — the lining + scarf silk. Pre-wash with mild soap and lay flat to dry; do not tumble.',
  },
  {
    slug: 'silk-satin',
    name: 'Silk satin',
    weightCategory: 'light',
    fibreContent: ['silk'],
    drape: 'flowing',
    suitableFor: ['clothing-light', 'eye-mask'],
    category: 'woven-natural',
    notes:
      'Satin-weave silk with a glossy face. Slippery — pin densely, hand-tack seams before machining.',
  },

  // ───────────────────────────────────────────────────────────────────────
  // Medium wovens — cotton drill, twill, denim, canvas. The bag + apron +
  // homewares cloth.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'cotton-drill',
    name: 'Cotton drill',
    weightCategory: 'medium',
    fibreContent: ['cotton'],
    drape: 'structured',
    gsm: 270,
    suitableFor: ['apron', 'bag', 'curtain-light', 'pot-holder'],
    category: 'woven-natural',
    notes:
      'Tight twill weave; the chef apron cloth. Heavier than poplin, much softer than canvas. Works on a domestic machine with a size-90 needle.',
  },
  {
    slug: 'cotton-twill',
    name: 'Cotton twill',
    weightCategory: 'medium',
    fibreContent: ['cotton'],
    drape: 'structured',
    gsm: 230,
    suitableFor: ['clothing-medium', 'bag', 'apron'],
    category: 'woven-natural',
    notes:
      'Diagonal-weave cotton, lighter than drill. Trouser-weight without the bulk of denim.',
  },
  {
    slug: 'cotton-canvas',
    name: 'Cotton canvas',
    weightCategory: 'heavy',
    fibreContent: ['cotton'],
    drape: 'structured',
    gsm: 330,
    suitableFor: ['bag', 'upholstery', 'curtain-lined', 'apron'],
    category: 'woven-natural',
    notes:
      'Heavy plain-weave cotton. The market-bag / tote-bag base fabric. Use a size-100 jeans needle on a domestic machine; size-110 if doubled.',
  },
  {
    slug: 'denim',
    name: 'Denim',
    weightCategory: 'heavy',
    fibreContent: ['cotton'],
    drape: 'structured',
    gsm: 370,
    suitableFor: ['clothing-medium', 'clothing-heavy', 'bag', 'apron'],
    category: 'woven-natural',
    notes:
      'Indigo-warp twill. Sturdy bag + apron + trouser cloth. Use a jeans needle (size 100 or 110); thread should be all-purpose polyester or topstitch weight, never silk.',
  },
  {
    slug: 'polycotton',
    name: 'Polycotton',
    weightCategory: 'medium',
    fibreContent: ['cotton', 'polyester'],
    drape: 'crisp',
    gsm: 130,
    suitableFor: ['apron', 'curtain-light', 'pillowcase'],
    category: 'woven-synthetic',
    notes:
      'Typically 65% polyester / 35% cotton. Iron-and-go finish but does not press as sharply as pure cotton; use steam, not high heat.',
  },
  {
    slug: 'hessian',
    name: 'Hessian',
    weightCategory: 'heavy',
    fibreContent: ['jute'],
    drape: 'structured',
    gsm: 280,
    suitableFor: ['bag', 'upholstery'],
    category: 'woven-natural',
    notes:
      'Open-weave jute. Sheds fibres heavily — overlock or zigzag-finish every cut edge before construction. Coarse texture; use a size-90 universal needle.',
  },
  {
    slug: 'ripstop-nylon',
    name: 'Ripstop nylon',
    weightCategory: 'light',
    fibreContent: ['nylon'],
    drape: 'flowing',
    gsm: 70,
    suitableFor: ['bag', 'rainwear'],
    category: 'woven-synthetic',
    notes:
      'Crosshatch-reinforced nylon, water-resistant by weave alone. The packable-tote and lightweight-bag fabric. Use a size-70 microtex needle and polyester thread.',
  },
  {
    slug: 'oilcloth',
    name: 'Oilcloth (PVC-coated cotton)',
    weightCategory: 'medium',
    fibreContent: ['cotton', 'polyester'],
    drape: 'structured',
    suitableFor: ['apron', 'reusable-kitchen', 'oven-mitt'],
    category: 'specialty',
    notes:
      'PVC-coated cotton, wipe-clean. Does NOT press with an iron (the coating melts). Tape-seam, do not pin (pins leave permanent holes); use clips and a roller foot.',
  },

  // ───────────────────────────────────────────────────────────────────────
  // Knits — jersey + fleece + terry. The casual-clothing + dressing-gown +
  // baby cloth.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'cotton-jersey',
    name: 'Cotton jersey',
    weightCategory: 'medium',
    fibreContent: ['cotton'],
    drape: 'flowing',
    gsm: 200,
    suitableFor: ['clothing-medium', 'baby-medium'],
    category: 'knit',
    notes:
      'Single-knit cotton. Stretches across the grain. Cut with a rotary cutter rather than scissors (lifting distorts the knit); use a ballpoint or stretch needle, a slight zigzag stitch, and walk the foot.',
  },
  {
    slug: 'fleece',
    name: 'Polyester fleece',
    weightCategory: 'medium',
    fibreContent: ['polyester'],
    drape: 'structured',
    gsm: 230,
    suitableFor: ['clothing-medium', 'soft-toy'],
    category: 'knit',
    notes:
      'Anti-pill polyester fleece. Does not fray; finishing edges is optional. Use a ballpoint needle; do not iron directly (melts).',
  },
  {
    slug: 'terry-cloth',
    name: 'Terry cloth',
    weightCategory: 'medium',
    fibreContent: ['cotton'],
    drape: 'structured',
    gsm: 280,
    suitableFor: ['baby-medium', 'reusable-kitchen'],
    category: 'knit',
    notes:
      'Looped-pile cotton, the bath-towel cloth. Sheds heavily on cut edges — bind or French-seam every edge. Works for baby bibs, face cloths, and reusable kitchen rolls.',
  },

  // ───────────────────────────────────────────────────────────────────────
  // Interfacing + linings + battings — the structural layer.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'interfacing-fusible-light',
    name: 'Fusible interfacing (light)',
    weightCategory: 'light',
    fibreContent: ['polyester'],
    suitableFor: ['interfacing-fusible'],
    category: 'interfacing',
    notes:
      'Iron-on stabiliser. Adhesive side has a slight shine; bond face up under a damp pressing cloth for 10 seconds at wool setting. Pre-test on a scrap — some lightweight fabrics show the bonding pattern through.',
  },
  {
    slug: 'interfacing-fusible-medium',
    name: 'Fusible interfacing (medium)',
    weightCategory: 'medium',
    fibreContent: ['polyester'],
    suitableFor: ['interfacing-fusible'],
    category: 'interfacing',
    notes:
      'Iron-on stabiliser for waistbands, collars, cuffs, bag bodies. Same pressing cycle as the light weight; the bond is stronger and longer-lasting.',
  },
  {
    slug: 'interfacing-sew-in',
    name: 'Sew-in interfacing',
    weightCategory: 'light',
    fibreContent: ['cotton'],
    suitableFor: ['interfacing-sew-in'],
    category: 'interfacing',
    notes:
      'Non-fusible cotton stabiliser. Used on silks and other fabrics that cannot take a fusible. Cut, baste in place, then sew through both layers.',
  },
  {
    slug: 'curtain-lining',
    name: 'Curtain lining',
    weightCategory: 'medium',
    fibreContent: ['cotton', 'polyester'],
    drape: 'flowing',
    gsm: 130,
    suitableFor: ['curtain-lined', 'lining'],
    category: 'lining',
    notes:
      'Sateen-weave cotton or polycotton, neutral cream or ivory. Hides the back of the printed curtain face and adds body to a thin face fabric.',
  },
  {
    slug: 'curtain-blackout-lining',
    name: 'Blackout curtain lining',
    weightCategory: 'heavy',
    fibreContent: ['polyester'],
    drape: 'structured',
    gsm: 280,
    suitableFor: ['curtain-blackout'],
    category: 'lining',
    notes:
      'Triple-pass coating that blocks ~100% of light. Heavier and stiffer than standard lining; a blackout curtain hangs noticeably with more weight. Use a size-90 needle; the coating dulls fine needles quickly.',
  },
  {
    slug: 'batting-cotton',
    name: 'Cotton batting',
    weightCategory: 'medium',
    fibreContent: ['cotton'],
    suitableFor: ['quilt-batting', 'oven-mitt', 'pot-holder'],
    category: 'batting',
    notes:
      'Low-loft 100% cotton wadding for quilting, oven mitts, and pot holders. The natural-fibre choice — breathable, washable, scorches at iron heat but is heat-resistant for the cooking-mitt application.',
  },
  {
    slug: 'batting-polyester',
    name: 'Polyester batting',
    weightCategory: 'medium',
    fibreContent: ['polyester'],
    suitableFor: ['quilt-batting', 'soft-toy'],
    category: 'batting',
    notes:
      'Higher-loft polyester wadding. Lighter than cotton batting and holds its loft through repeat washing. Not heat-resistant — do not use inside oven mitts or pot holders.',
  },
  {
    slug: 'batting-wool',
    name: 'Wool batting',
    weightCategory: 'medium',
    fibreContent: ['wool'],
    suitableFor: ['quilt-batting'],
    category: 'batting',
    notes:
      'Premium quilting batting; very warm, drapes softly, expensive. The wool retains a small amount of natural lanolin so the finished quilt resists creasing.',
  },
]
