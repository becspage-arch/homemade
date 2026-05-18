/**
 * One-off seed for the Home & repair taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   home-repair                "Home & repair"        (assumed pre-seeded)
 *   SubCat     woodwork                   "Woodwork"
 *   SubCat     plumbing                   "Plumbing"
 *   SubCat     electrical                 "Electrical"
 *   SubCat     walls-and-floors           "Walls & floors"
 *   SubCat     upholstery-and-leather     "Upholstery & leather"
 *   SubCat     furniture-restoration      "Furniture restoration"
 *
 *   GlossaryTerm rows for the home-repair starter glossary (~60 terms
 *   scoped to the home-repair category — joinery + plumbing +
 *   electrical + walls + upholstery + furniture restoration).
 *   Idempotent on slug; the script never overwrites an existing
 *   term's definition.
 *
 * Six sub-categories per the locked Home & repair breakdown. Bushcraft
 * was split out to its own top-level Category in the 2026-05-18
 * pipeline-setup session per Rebecca's call — its taxonomy + author
 * prompt land in a separate bushcraft pipeline-setup later.
 *
 * The upload-tutorial script requires both the Category and any
 * referenced SubCategory to exist before home-repair rows can be
 * inserted.
 *
 * Category itself was seeded earlier by `seed-categories.ts`. This
 * script only owns the sub-category list and the starter glossary;
 * it never re-creates the Category row and never touches
 * `pipelineStatus`. The READY flip lives in
 * `flip-home-repair-ready.ts` and is run as a separate auditable step
 * after the rest of the pipeline scaffolding is committed, deployed
 * green, and Rebecca has signed off the two DRAFT test tutorials.
 *
 * Master Tool entries for home-repair (filling knives, taping knives,
 * plasterer's hawk + trowel, pipe cutter + bender, basin wrench,
 * blowtorch, voltage tester, multimeter, staple gun, regulator,
 * webbing stretcher, hide glue, shellac flakes, bushcraft knife, ferro
 * rod, paracord, tarp etc.) live in
 * `packages/db/scripts/data/tools.ts` and are seeded by
 * `packages/db/scripts/seed-tools.ts`. Run that script too after
 * deploying this one — the order does not matter.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-home-repair-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-home-repair-taxonomy.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const candidate of [
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../../..', '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  {
    slug: 'woodwork',
    name: 'Woodwork',
    description:
      'Joinery, carpentry, hanging doors, fitting skirting and architrave, building shelving and simple cabinetry, putting up a stud wall.',
    order: 10,
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    description:
      'Copper pipework, push-fit plastic, replacing taps and washers and ballcocks, unblocking drains and traps, basic radiator work.',
    order: 20,
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    description:
      'Replacing sockets and switches, fitting light fittings and fused spurs, testing circuits with a multimeter or socket tester, understanding the consumer unit.',
    order: 30,
  },
  {
    slug: 'walls-and-floors',
    name: 'Walls & floors',
    description:
      'Patching plaster and plasterboard, skimming, hanging wallpaper, painting, fitting laminate and engineered-board flooring, lifting and replacing floorboards.',
    order: 40,
  },
  {
    slug: 'upholstery-and-leather',
    name: 'Upholstery & leather',
    description:
      'Reupholstering drop-in and full seats, stretching webbing, replacing foam, fabric and leather repair, leatherwork basics — saddle stitch, edge bevel, dye and finish.',
    order: 50,
  },
  {
    slug: 'furniture-restoration',
    name: 'Furniture restoration',
    description:
      'Re-gluing loose joints, replacing broken rails or stretchers, stripping and re-finishing, French polish, polishing, woodworm treatment.',
    order: 60,
  },
]

interface GlossaryTermSpec {
  slug: string
  term: string
  definition: string
}

const GLOSSARY_TERMS: GlossaryTermSpec[] = [
  // Joinery and carpentry
  {
    slug: 'mortise',
    term: 'Mortise',
    definition:
      'A rectangular hole cut into one timber to receive the tenon of another. The female half of a mortise-and-tenon joint.',
  },
  {
    slug: 'tenon',
    term: 'Tenon',
    definition:
      'A rectangular projection cut at the end of one timber that fits into a mortise on another. The male half of a mortise-and-tenon joint.',
  },
  {
    slug: 'dovetail-joint',
    term: 'Dovetail joint',
    definition:
      'A joinery joint with interlocking trapezoidal pins and tails cut on the ends of two timbers. Mechanically locked against pulling apart. The drawer-corner standard.',
  },
  {
    slug: 'rabbet',
    term: 'Rabbet (rebate)',
    definition:
      'A step-shaped recess cut along the edge or end of a board, into which another board fits flush. Called a rebate in UK joinery.',
  },
  {
    slug: 'scarf-joint',
    term: 'Scarf joint',
    definition:
      'A joint formed by tapering or stepping two pieces of timber and overlapping the tapers, used to join two short pieces into one long one along the grain.',
  },
  {
    slug: 'butt-joint',
    term: 'Butt joint',
    definition:
      'The simplest carpentry joint: two timbers meet end-to-end or end-to-side with no interlocking shape. Held by glue, nails, screws, or pocket-hole fasteners.',
  },
  {
    slug: 'halving-joint',
    term: 'Halving joint',
    definition:
      'A joint where half the thickness of each timber is removed at the meeting point so the two timbers cross flush. Used in frames and grids.',
  },
  {
    slug: 'mdf',
    term: 'MDF (medium-density fibreboard)',
    definition:
      'A panel product made of compressed wood fibres and resin. Smooth, uniform, paints well. Vulnerable to moisture; the cut edge swells if it gets wet.',
  },
  {
    slug: 'mr-mdf',
    term: 'MR-MDF (moisture-resistant)',
    definition:
      'MDF with a moisture-resistant resin, typically dyed green for identification. Suitable for kitchen and bathroom carcassing where standard MDF would swell.',
  },
  {
    slug: 'osb',
    term: 'OSB (oriented strand board)',
    definition:
      'A panel product made of large wood strands compressed in cross-grain layers with resin. Stronger than chipboard, cheaper than ply. Loft-floor and stud-wall sheathing standard.',
  },
  {
    slug: 'end-grain',
    term: 'End grain',
    definition:
      'The cut face of timber across the grain — the cell ends. Absorbs glue and finish much faster than face grain, and takes a fastener poorly.',
  },
  {
    slug: 'kerf',
    term: 'Kerf',
    definition:
      'The slot a saw cut leaves in the timber. The width of the kerf is the thickness of the cut material lost to the saw teeth.',
  },
  {
    slug: 'joist',
    term: 'Joist',
    definition:
      'A horizontal structural timber spanning between walls or beams, supporting a floor or ceiling. Typically 50 × 200 mm or 50 × 225 mm at 400 mm centres.',
  },
  {
    slug: 'stud',
    term: 'Stud',
    definition:
      'A vertical structural timber in a partition wall, between the top plate and the sole plate. Typically 50 × 75 mm or 50 × 100 mm at 400-600 mm centres.',
  },
  {
    slug: 'noggin',
    term: 'Noggin (dwang)',
    definition:
      'A short horizontal timber fixed between studs in a partition wall, used to stiffen the wall and provide a fixing point for plasterboard edges or fittings. Called a dwang in Scotland.',
  },
  {
    slug: 'sole-plate',
    term: 'Sole plate',
    definition:
      'The bottom horizontal timber of a stud wall, fixed to the floor. Carries the studs.',
  },
  {
    slug: 'top-plate',
    term: 'Top plate',
    definition:
      'The top horizontal timber of a stud wall, fixed to the ceiling joists. Carries the upper end of the studs.',
  },

  // Plumbing
  {
    slug: 'copper-end-feed',
    term: 'End-feed (copper joint)',
    definition:
      'A copper plumbing joint where the solder is fed into the cleaned, fluxed, and heated joint as a separate wire. The traditional plumber\'s joint; cheap, strong, but requires skill.',
  },
  {
    slug: 'solder-ring-fitting',
    term: 'Solder-ring fitting',
    definition:
      'A copper plumbing fitting with solder pre-loaded inside the socket as a ring. The fitter cleans and fluxes the pipe, fits, heats — the solder melts and fills the joint. More forgiving than end-feed, slightly more expensive.',
  },
  {
    slug: 'compression-fitting',
    term: 'Compression fitting',
    definition:
      'A plumbing joint sealed by tightening a nut that compresses a brass olive ring onto the pipe. No heat required; serviceable. The default for radiator valves and isolating valves.',
  },
  {
    slug: 'push-fit-fitting',
    term: 'Push-fit fitting',
    definition:
      'A plumbing joint where a sprung collet inside the fitting grips the pipe as it is pushed in. JG Speedfit, Hep2O, Tectite. Quick to fit; removable by pressing the collet inwards while pulling the pipe out.',
  },
  {
    slug: 'flux-plumbing',
    term: 'Flux (plumbing)',
    definition:
      'A paste applied to the cleaned copper pipe and the inside of a fitting before soldering. Chemically cleans the metal at the soldering temperature so the molten solder bonds. Water-soluble flux washes off with a damp cloth.',
  },
  {
    slug: 'bsp-thread',
    term: 'BSP (British Standard Pipe)',
    definition:
      'A pipe-thread standard used on brass plumbing fittings. Sizes refer to a nominal bore, not the thread diameter — 1/2 inch BSP is about 21 mm across the threads. Two variants: BSP-parallel and BSP-tapered.',
  },
  {
    slug: 'ptfe-tape',
    term: 'PTFE tape',
    definition:
      'A white plumber\'s tape wrapped around male threaded fittings before assembly to seal the thread. Five wraps clockwise (as viewed from the open end) is the standard.',
  },
  {
    slug: 'isolating-valve',
    term: 'Isolating valve',
    definition:
      'A small in-line valve fitted to a pipe run that allows the supply to be shut off at the appliance without shutting off the whole house. Slot-screw or lever-operated.',
  },
  {
    slug: 'stopcock',
    term: 'Stopcock',
    definition:
      'The main household water shut-off valve, usually under the kitchen sink. Closes the cold water supply to the whole house.',
  },
  {
    slug: 'trap-plumbing',
    term: 'Trap (waste)',
    definition:
      'A U-shaped or S-shaped section of waste pipe under a sink, basin, or bath, designed to hold a water seal that prevents drain odours rising. Unscrews for cleaning out blockages.',
  },
  {
    slug: 'ballcock',
    term: 'Ballcock (float valve)',
    definition:
      'A float-operated water inlet valve in a cistern, that closes when the float rises to the working level. Old-pattern brass and rubber-diaphragm types; modern Torbeck and Fluidmaster variants.',
  },
  {
    slug: 'airlock-plumbing',
    term: 'Airlock',
    definition:
      'A pocket of air trapped in a pipe run that prevents water flowing through. Common in gravity-fed hot supply after a system drain-down. Cleared by purging the lowest tap with a hose connected to a mains-pressure tap.',
  },

  // Electrical
  {
    slug: 'rcd',
    term: 'RCD (Residual Current Device)',
    definition:
      'A circuit protective device that compares the current in the line and neutral conductors and trips if there is a difference, indicating a fault to earth. Protects against electric shock. 30 mA RCDs are standard on socket circuits.',
  },
  {
    slug: 'mcb',
    term: 'MCB (Miniature Circuit Breaker)',
    definition:
      'A circuit-protective device that trips on over-current (overload or short circuit). The modern equivalent of a fuse. Rated by current (6A, 16A, 32A) and curve type (B, C, D).',
  },
  {
    slug: 'rcbo',
    term: 'RCBO',
    definition:
      'A combined RCD and MCB in a single module. Protects against both over-current and earth-leakage. Standard in modern consumer units, where each circuit has its own RCBO.',
  },
  {
    slug: 'consumer-unit',
    term: 'Consumer unit',
    definition:
      'The main household electrical distribution panel — the modern fuse box. Houses the main switch, RCDs, and individual circuit breakers (MCBs or RCBOs).',
  },
  {
    slug: 'twin-and-earth',
    term: 'Twin-and-earth cable',
    definition:
      'A flat sheathed cable with two insulated conductors (line and neutral) and one bare earth conductor. The standard UK domestic wiring cable. 1.0 / 1.5 / 2.5 / 4.0 mm² conductor sizes.',
  },
  {
    slug: 'three-core-and-earth',
    term: 'Three-core-and-earth',
    definition:
      'A sheathed cable with three insulated conductors and one bare earth conductor. Used for two-way switching (a light controlled from two switches) and for retained-light fittings.',
  },
  {
    slug: 'cpc-earth',
    term: 'CPC (Circuit Protective Conductor)',
    definition:
      'The earth conductor in a domestic circuit. In twin-and-earth cable, the bare conductor — sleeved in green-and-yellow at every termination, even though it has no insulation along the run.',
  },
  {
    slug: 'backstab',
    term: 'Backstab terminal',
    definition:
      'A wiring terminal in a socket or switch that takes a push-in conductor rather than a screw clamp. Faster to wire but less reliable; the screw clamp is the trade standard for any termination that must not work loose.',
  },
  {
    slug: 'fused-spur',
    term: 'Fused spur',
    definition:
      'A switched or unswitched outlet wired from a ring final circuit, fused at the spur to a lower rating (usually 3A or 5A) for a fixed appliance — a boiler control, an extractor fan, a fixed light.',
  },
  {
    slug: 'ring-final-circuit',
    term: 'Ring final circuit',
    definition:
      'A domestic socket circuit wired as a ring, returning to the consumer unit. The two cable ends share a common 32A breaker. Lets the cable carry twice the current of a radial of the same size.',
  },
  {
    slug: 'part-p',
    term: 'Part P (notifiable work)',
    definition:
      'The Building Regulations section governing domestic electrical work in England and Wales. Notifiable work (anything in a bathroom, anything outdoors, anything inside the consumer unit, any new circuit) must be self-certified by a registered electrician or notified to the local authority.',
  },
  {
    slug: 'live-dead-live',
    term: 'Live-dead-live test',
    definition:
      'The safe isolation procedure: test your voltage tester on a known-live source, then on the conductor you intend to work on (must read dead), then back on the known-live source. Confirms the tester did not fail between tests.',
  },

  // Walls and floors
  {
    slug: 'plasterboard',
    term: 'Plasterboard (drywall)',
    definition:
      'A panel of gypsum-plaster between two paper liners, fixed to studs or battens to form an internal wall surface. 9.5 mm and 12.5 mm thicknesses standard; 15 mm for acoustic or fire-rated applications.',
  },
  {
    slug: 'scrim-tape-glossary',
    term: 'Scrim tape',
    definition:
      'A self-adhesive fibreglass mesh tape applied across plasterboard joints and patch edges. Bedded under jointing compound or one-coat filler, it bridges the joint and prevents cracking.',
  },
  {
    slug: 'jointing-compound-glossary',
    term: 'Jointing compound',
    definition:
      'A pre-mixed plaster compound for bedding scrim tape and skim-coating plasterboard joints. Three-coat application — set, fill, finish — with sanding between the last two.',
  },
  {
    slug: 'one-coat-filler',
    term: 'One-coat filler',
    definition:
      'A lightweight ready-mixed or powder-mix filler designed to fill small holes in a single application without shrinking. Polyfilla One-Time and Tetrion Decorators Filler are the UK references.',
  },
  {
    slug: 'skim-coat',
    term: 'Skim coat',
    definition:
      'A thin (~2 mm) finish coat of fine plaster applied over plasterboard or browning plaster, leaving a smooth surface ready for painting or papering. Multi-finish and Thistle Board Finish are the UK references.',
  },
  {
    slug: 'bonding-plaster',
    term: 'Bonding plaster',
    definition:
      'An undercoat plaster designed to grip dense or non-absorbent backgrounds (engineering brick, concrete, dense block). Applied up to 11 mm thick; followed by a skim coat of finishing plaster.',
  },
  {
    slug: 'browning-plaster',
    term: 'Browning plaster',
    definition:
      'An undercoat plaster for absorbent backgrounds (common brick, soft block). Applied up to 11 mm thick; followed by a skim coat of finishing plaster.',
  },
  {
    slug: 'cutting-in',
    term: 'Cutting in (painting)',
    definition:
      'The technique of painting a clean edge along skirting, architrave, ceiling, or window-bar with a brush, before rolling the bulk of the wall. The skill that separates a good paint job from a rolled one.',
  },
  {
    slug: 'feathering-filler',
    term: 'Feathering (filler)',
    definition:
      'The technique of drawing a filling or taping knife outward from a filled hole, leaving the filler thicker in the middle and tapering to zero at the edges. The feather hides the patch under the paint coat.',
  },

  // Upholstery and leather
  {
    slug: 'webbing-upholstery',
    term: 'Webbing (upholstery)',
    definition:
      'A 50 mm woven or rubber strip stretched across a chair frame as the seat-base support layer. Jute (black-and-white) for traditional sprung seats; Pirelli rubber for modern unsprung seats.',
  },
  {
    slug: 'hessian-upholstery',
    term: 'Hessian (burlap)',
    definition:
      'A coarse plain-woven jute fabric used in upholstery as a cover over webbing and springs, before the stuffing layer.',
  },
  {
    slug: 'calico-upholstery',
    term: 'Calico (muslin)',
    definition:
      'A plain-woven undyed cotton fabric used as an under-cover in upholstery, between the stuffing layer and the top cover. Holds the stuffing shape and lets the top cover be replaced without re-stuffing.',
  },
  {
    slug: 'cmhr-foam',
    term: 'CMHR foam',
    definition:
      'Combustion-modified high-resilience polyurethane foam. UK regulations require CMHR foam in any upholstered furniture sold or repaired since 1988. Density and firmness graded; medium firmness for seats, firmer for arms.',
  },
  {
    slug: 'dacron-wrap-glossary',
    term: 'Dacron wrap',
    definition:
      'A polyester-fibre wadding wrapped around upholstery foam before the top cover. Softens the edge of the foam and gives the finished cushion a slightly upholstered roundness.',
  },
  {
    slug: 'regulator-upholstery',
    term: 'Regulator (upholstery)',
    definition:
      'A long single-prong upholsterer\'s needle for moving filling around under the cover fabric, eliminating lumps without re-opening the work.',
  },
  {
    slug: 'gimp-pin',
    term: 'Gimp pin',
    definition:
      'A small headless decorative nail for fixing gimp braid or fabric to the edge of a chair frame. The visible alternative to a hidden staple line.',
  },
  {
    slug: 'gimp-braid',
    term: 'Gimp braid',
    definition:
      'A decorative woven trim used along the visible cover edge of a chair frame to hide the staple or tack line. Glued or pinned in place.',
  },
  {
    slug: 'saddle-stitch-leather',
    term: 'Saddle stitch',
    definition:
      'A two-needle hand-stitching technique used in leatherwork: each stitch is made with two needles on the same length of thread, one on each side of the work. Stronger than a sewing-machine lock stitch and does not unravel if a single thread breaks.',
  },
  {
    slug: 'edge-bevel-leather',
    term: 'Edge bevel (leather)',
    definition:
      'A small chamfer cut along the cut edge of a piece of leather with an edge beveller, before burnishing. Removes the squared corner and lets the burnishing tool polish the edge into a hard rounded finish.',
  },

  // Furniture restoration
  {
    slug: 'hide-glue',
    term: 'Hide glue',
    definition:
      'A traditional wood glue made from animal hides, soaked in water and warmed. Reversible with heat or steam — the only glue compatible with the existing animal-glue joints on antique furniture.',
  },
  {
    slug: 'french-polish',
    term: 'French polish',
    definition:
      'A hand-applied shellac finish built up in many thin coats applied with a polishing rubber. The traditional fine-furniture surface; gives a deep glassy shine that no spray finish reproduces.',
  },
  {
    slug: 'sanding-sealer',
    term: 'Sanding sealer',
    definition:
      'A thin shellac or lacquer applied as the first finish coat, which seals the timber and stiffens the surface fibres so they sand back to a clean smooth surface. Built up under a topcoat.',
  },
  {
    slug: 'woodworm',
    term: 'Woodworm',
    definition:
      'The larval stage of furniture beetle (Anobium punctatum) and related species, which bore through dry timber leaving the characteristic small round exit holes. Active woodworm shows fresh frass below the hole.',
  },
  {
    slug: 'frass',
    term: 'Frass',
    definition:
      'The fine powdery wood dust pushed out of a woodworm exit hole by emerging larvae. Pale yellow when fresh; darker when old.',
  },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const homeRepair = await prisma.category.findUnique({
    where: { slug: 'home-repair' },
  })
  if (!homeRepair) {
    console.error(
      '[seed] home-repair category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] home-repair → ${homeRepair.id}`)

  // ── Sub-categories ────────────────────────────────────────────────────────
  let subCreated = 0
  let subUnchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: homeRepair.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create sub] home-repair/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: homeRepair.id,
          },
        })
        console.log(`[seed] home-repair/${spec.slug} → ${sub.id}`)
      }
      subCreated += 1
      continue
    }

    subUnchanged += 1
  }

  // ── Glossary terms ────────────────────────────────────────────────────────
  let glossaryCreated = 0
  let glossaryUnchanged = 0

  for (const spec of GLOSSARY_TERMS) {
    const existing = await prisma.glossaryTerm.findUnique({
      where: { slug: spec.slug },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create glossary] ${spec.slug}`)
      } else {
        await prisma.glossaryTerm.create({
          data: {
            slug: spec.slug,
            term: spec.term,
            definition: spec.definition,
            categoryId: homeRepair.id,
          },
        })
      }
      glossaryCreated += 1
      continue
    }

    // Existing definition wins. The script never overwrites a term that
    // already exists — another category may have introduced it first.
    glossaryUnchanged += 1
  }

  console.log(
    `\n[seed] home-repair-taxonomy:` +
      ` sub-categories created=${subCreated} unchanged=${subUnchanged} total=${SUB_CATEGORIES.length};` +
      ` glossary created=${glossaryCreated} unchanged=${glossaryUnchanged} total=${GLOSSARY_TERMS.length}` +
      `${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  console.log(
    `[seed] pipelineStatus left untouched — run` +
      ` flip-home-repair-ready.ts as a separate step after the two` +
      ` DRAFT test tutorials are reviewed.`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
