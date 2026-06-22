/**
 * Crochet starter creative-brief set (phase_crochet_signoff_001).
 *
 * Concrete briefs that consume the shared design system in
 * `packages/db/prisma/design-direction.ts`. Each is a real, specific design
 * (with a hook — QUALITY_BAR #1), not a generic prompt. These seed the first
 * generation waves once the loom render lands, and they demonstrate the
 * variety the bulk must keep: across the evergreen-core territories, all eight
 * looks, every item-type group, and a spread of size + difficulty.
 *
 * Item-type slugs follow the crochet subset of the (centrally-owned) item-type
 * taxonomy; they settle once that file lands. Territory / look / palette slugs
 * are live against design-direction.ts. The amigurumi doll is the showpiece
 * the loom proves first.
 *
 * Bulk generation EXTENDS this set to target; it does not stop here.
 */

import type { CreativeBrief } from '../../prisma/design-direction'

export const CROCHET_STARTER_BRIEFS: CreativeBrief[] = [
  // ── Showpiece (loom proves this first) ──
  { craft: 'crochet', territory: 'modern-botanicals', look: 'storybook-whimsical', itemType: 'doll', palette: 'candy-kawaii', size: 'showpiece', difficulty: 'showpiece',
    concept: 'Wren the wildflower-fairy doll: long curly hair, removable petal skirt, a daisy crown, tiny laced boots, freckles and a shy smile.' },

  // ── Amigurumi & toys ──
  { craft: 'crochet', territory: 'kawaii-animals-pets', look: 'storybook-whimsical', itemType: 'amigurumi', palette: 'foxglove-autumn', size: 'small', difficulty: 'beginner',
    concept: 'A pocket woodland fox with a little acorn-button scarf and an oversized fluffy tail.' },
  { craft: 'crochet', territory: 'kawaii-animals-pets', look: 'storybook-whimsical', itemType: 'animal-toy', palette: 'candy-kawaii', size: 'medium', difficulty: 'intermediate',
    concept: 'A round sleepy sausage-dog with stubby legs and a stitched-on snooze expression.' },
  { craft: 'crochet', territory: 'fantasy-creatures', look: 'dark-moody', itemType: 'amigurumi', palette: 'celestial-night', size: 'medium', difficulty: 'intermediate',
    concept: 'A star-bellied night dragon: midnight body, gold spinal ridges, perched on a little cloud.' },
  { craft: 'crochet', territory: 'kawaii-animals-pets', look: 'soft-modern', itemType: 'baby-toy-lovey', palette: 'nursery-pastel', size: 'small', difficulty: 'beginner',
    concept: 'A cloud-bunny comforter: square cloud body, sleepy bunny head, knotted corners.' },
  { craft: 'crochet', territory: 'coastal-seaside', look: 'bright-playful', itemType: 'animal-toy', palette: 'coastal-breeze', size: 'small', difficulty: 'beginner',
    concept: 'A roly-poly crab with springy bead eyes and pastel-tipped claws.' },

  // ── Home & living ──
  { craft: 'crochet', territory: 'cottagecore-mushroom', look: 'cottagecore-botanical', itemType: 'blanket', palette: 'mushroom-woodland', size: 'large', difficulty: 'intermediate',
    concept: 'A toadstool-meadow baby blanket: rows of little red-cap mushrooms among textured bobble grass.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'cottagecore-botanical', itemType: 'blanket', palette: 'wildflower-meadow', size: 'large', difficulty: 'intermediate',
    concept: 'A pressed-wildflower throw: scattered granny-square blooms joined across a cream meadow ground.' },
  { craft: 'crochet', territory: 'painterly-landscapes', look: 'soft-modern', itemType: 'blanket', palette: 'scandi-calm', size: 'large', difficulty: 'beginner',
    concept: 'A colour-block ripple in oatmeal and dusty blue with one terracotta stripe.' },
  { craft: 'crochet', territory: 'celestial-mystical', look: 'dark-moody', itemType: 'blanket', palette: 'celestial-night', size: 'large', difficulty: 'advanced',
    concept: 'A moon-phase blanket: eight cratered moons waxing to full across a deep indigo ground.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'boho-folk', itemType: 'cushion', palette: 'boho-earth', size: 'medium', difficulty: 'intermediate',
    concept: 'A tasselled sunburst cushion in rust and teal with a raised centre boss.' },
  { craft: 'crochet', territory: 'cottagecore-mushroom', look: 'cottagecore-botanical', itemType: 'basket', palette: 'mushroom-woodland', size: 'medium', difficulty: 'intermediate',
    concept: 'A toadstool storage basket: cream stalk body, domed red-spotted lid with a handle.' },
  { craft: 'crochet', territory: 'houseplants', look: 'soft-modern', itemType: 'plant-hanger', palette: 'scandi-calm', size: 'small', difficulty: 'beginner',
    concept: 'A minimalist plant cradle with wooden-bead accents and a single tassel.' },
  { craft: 'crochet', territory: 'affirmation-selfcare', look: 'cottagecore-botanical', itemType: 'wall-hanging', palette: 'wildflower-meadow', size: 'medium', difficulty: 'intermediate',
    concept: 'A "rest is productive too" banner in soft script over a sprig of forget-me-nots.' },
  { craft: 'crochet', territory: 'modern-seasonal', look: 'storybook-whimsical', itemType: 'bunting', palette: 'candy-kawaii', size: 'small', difficulty: 'beginner',
    concept: 'Spooky-cute Halloween bunting: alternating smiley pumpkins and friendly ghosts.' },
  { craft: 'crochet', territory: 'modern-seasonal', look: 'soft-modern', itemType: 'ornament', palette: 'winter-frost', size: 'small', difficulty: 'beginner',
    concept: 'Modern Christmas baubles: minimalist snow-dot motifs on frost-blue spheres.' },

  // ── Hats & headwear ──
  { craft: 'crochet', territory: 'kawaii-animals-pets', look: 'storybook-whimsical', itemType: 'hat', palette: 'candy-kawaii', size: 'small', difficulty: 'beginner',
    concept: 'A baby bear-ear beanie with a soft stitched muzzle patch.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'elegant-fine', itemType: 'beret', palette: 'elegant-mono', size: 'small', difficulty: 'intermediate',
    concept: 'A fine ivory beret with a subtle openwork spiral and a self-covered button.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'bright-playful', itemType: 'headband', palette: 'wildflower-meadow', size: 'small', difficulty: 'beginner',
    concept: 'A twist headband with three appliqué meadow flowers off to one side.' },

  // ── Accessories ──
  { craft: 'crochet', territory: 'painterly-landscapes', look: 'soft-modern', itemType: 'scarf', palette: 'scandi-calm', size: 'medium', difficulty: 'beginner',
    concept: 'A squishy ribbed-and-bobble scarf in oatmeal with one dusty-blue tipped end.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'boho-folk', itemType: 'cowl', palette: 'boho-earth', size: 'small', difficulty: 'intermediate',
    concept: 'A short folk cowl in earthy stripes with a fringed lower edge.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'elegant-fine', itemType: 'shawl', palette: 'elegant-mono', size: 'large', difficulty: 'advanced',
    concept: 'A fine crescent lace shawl, feather-and-fan edge, blocked to soft points.' },
  { craft: 'crochet', territory: 'modern-seasonal', look: 'soft-modern', itemType: 'mittens', palette: 'winter-frost', size: 'small', difficulty: 'intermediate',
    concept: 'Frost-blue mittens with a tiny snowflake on each back.' },
  { craft: 'crochet', territory: 'celestial-mystical', look: 'dark-moody', itemType: 'fingerless-mitts', palette: 'gothic-dusk', size: 'small', difficulty: 'beginner',
    concept: 'Charcoal fingerless mitts with a deep-plum cabled cuff.' },

  // ── Bags ──
  { craft: 'crochet', territory: 'modern-botanicals', look: 'bright-playful', itemType: 'bag', palette: 'bright-pop', size: 'medium', difficulty: 'intermediate',
    concept: 'A colour-blocked market tote in poppy, turquoise and sunshine with a sturdy base.' },
  { craft: 'crochet', territory: 'coastal-seaside', look: 'cottagecore-botanical', itemType: 'purse', palette: 'coastal-breeze', size: 'small', difficulty: 'beginner',
    concept: 'A scalloped shell clutch in sand and navy with a rope drawstring.' },

  // ── Garments ──
  { craft: 'crochet', territory: 'painterly-landscapes', look: 'soft-modern', itemType: 'cardigan', palette: 'scandi-calm', size: 'large', difficulty: 'advanced',
    concept: 'An oversized cocoon cardigan in oatmeal with deep ribbed cuffs and patch pockets.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'bright-playful', itemType: 'tee', palette: 'bright-pop', size: 'medium', difficulty: 'intermediate',
    concept: 'A cropped granny-square tee: six coordinated blooms across the front.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'cottagecore-botanical', itemType: 'tank-top', palette: 'wildflower-meadow', size: 'medium', difficulty: 'intermediate',
    concept: 'A fitted vest top with a single climbing-vine motif up one side.' },
  { craft: 'crochet', territory: 'kawaii-animals-pets', look: 'storybook-whimsical', itemType: 'dress', palette: 'candy-kawaii', size: 'medium', difficulty: 'advanced',
    concept: 'A toddler pinafore dress with a strawberry-patch hem and shoulder buttons.' },

  // ── Kitchen & bath ──
  { craft: 'crochet', territory: 'modern-botanicals', look: 'cottagecore-botanical', itemType: 'dishcloth', palette: 'wildflower-meadow', size: 'small', difficulty: 'beginner',
    concept: 'A textured leaf-stitch cloth in fresh sage with a scalloped edge.' },
  { craft: 'crochet', territory: 'cottagecore-mushroom', look: 'cottagecore-botanical', itemType: 'tea-cosy', palette: 'mushroom-woodland', size: 'small', difficulty: 'intermediate',
    concept: 'A toadstool tea-cosy: domed red-spotted cap over a cream brioche-look stalk.' },

  // ── Decorative & components (incl. the heritage seam) ──
  { craft: 'crochet', territory: 'modern-botanicals', look: 'heritage-vintage', itemType: 'doily', palette: 'vintage-tea', size: 'small', difficulty: 'advanced',
    concept: 'A redrawn Victorian pineapple doily in faded tea-rose thread (heritage seam: Dillmont reference, our own redraw).' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'cottagecore-botanical', itemType: 'motif-granny-square', palette: 'wildflower-meadow', size: 'small', difficulty: 'beginner',
    concept: 'A modern flower granny square: raised popcorn centre and a two-round petal ring.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'heritage-vintage', itemType: 'edging', palette: 'vintage-tea', size: 'small', difficulty: 'beginner',
    concept: 'A scalloped picot edging redrawn from a vintage Weldon\'s trim, in soft sage.' },
  { craft: 'crochet', territory: 'modern-botanicals', look: 'bright-playful', itemType: 'applique-flower', palette: 'bright-pop', size: 'small', difficulty: 'beginner',
    concept: 'A set of three layered statement daisies for pinning onto bags or hats.' },
]
